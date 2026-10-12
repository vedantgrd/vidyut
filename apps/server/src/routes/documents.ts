import{Hono}from'hono'
import{zValidator}from'@hono/zod-validator'
import{prisma}from'../lib/prisma.js'
import{authMiddleware,adminMiddleware}from'../middleware/auth.js'
import{documentTypeEnum,verifyDocumentSchema}from'../validators/schemas.js'
import{extname}from'node:path'
import crypto from'node:crypto'
import{storageService}from'../services/storageService.js'

const documents=new Hono<{Variables:{userId:string;role:string}}>()
documents.use('*',authMiddleware)

const ALLOWED=['image/jpeg','image/png','application/pdf','image/webp']
const MAX=5*1024*1024

// List all documents belonging to current user
documents.get('/',async(c)=>c.json({documents:await prisma.document.findMany({where:{userId:c.get('userId')},orderBy:{createdAt:'desc'}})}))

// Get single document metadata for receipt and audit details
documents.get('/:id',async(c)=>{
  const id=c.req.param('id'),userId=c.get('userId'),role=c.get('role')
  const doc=await prisma.document.findUnique({
    where:{id},
    include:{
      user:{
        select:{
          id:true,
          fullName:true,
          email:true,
          role:true,
          studentProfile:{
            select:{
              phone:true,
              category:true,
              domicileState:true
            }
          }
        }
      },
      verifiedByAdmin:{
        select:{
          id:true,
          fullName:true,
          email:true
        }
      },
      applicationLinks:{
        include:{
          application:{
            select:{
              id:true,
              status:true,
              scholarship:{
                select:{
                  name:true
                }
              }
            }
          }
        }
      }
    }
  })
  if(!doc)return c.json({error:'Document not found'},404)
  if(doc.userId!==userId && role!=='ADMIN' && role!=='REVIEWER')return c.json({error:'Forbidden'},403)
  return c.json({document:doc})
})

import{generateVaultFallbackDocument}from'../services/vaultFallback.js'

function detectMimeType(buf: Buffer, fallback: string): string {
  if (buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
    return 'application/pdf'
  }
  if (buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
    return 'image/jpeg'
  }
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    return 'image/png'
  }
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp'
  }
  return fallback || 'application/octet-stream'
}

// Stream/Preview/Download document file securely
documents.get('/:id/file',async(c)=>{
  const id=c.req.param('id'),userId=c.get('userId'),role=c.get('role')
  const doc=await prisma.document.findUnique({where:{id}})
  if(!doc)return c.json({error:'Document not found'},404)
  if(doc.userId!==userId && role!=='ADMIN' && role!=='REVIEWER')return c.json({error:'Forbidden'},403)

  try{
    const fileBuffer=await storageService.getFile(doc.filePath)
    const effectiveMime=detectMimeType(fileBuffer,doc.mimeType)
    c.header('Content-Type',effectiveMime)
    c.header('Content-Disposition',`inline; filename="${encodeURIComponent(doc.fileName)}"`)
    return c.body(fileBuffer as any)
  }catch(e: any){
    if(e?.message==='FILE_NOT_FOUND'){
      const fallback=generateVaultFallbackDocument(doc)
      c.header('Content-Type',fallback.mimeType)
      c.header('Content-Disposition',`inline; filename="${encodeURIComponent(fallback.fileName)}"`)
      c.header('X-Vidyut-Fallback','true')
      return c.body(fallback.buffer as any)
    }
    if(e?.message?.includes('INVALID_PATH'))return c.json({error:'Invalid file path'},400)
    console.error('File read error:',e)
    return c.json({error:'Could not read file'},500)
  }
})

// Directly replace an existing document file by ID
documents.post('/:id/replace',async(c)=>{
  const id=c.req.param('id'),userId=c.get('userId'),role=c.get('role')
  const doc=await prisma.document.findUnique({where:{id}})
  if(!doc)return c.json({error:'Document not found'},404)
  if(doc.userId!==userId && role!=='ADMIN' && role!=='REVIEWER')return c.json({error:'Forbidden'},403)

  let fd:FormData
  try{fd=await c.req.formData()}catch{return c.json({error:'Invalid form data'},400)}
  const file=fd.get('file') as File|null
  if(!file)return c.json({error:'file is required'},400)
  if(file.size>MAX)return c.json({error:'File must be under 5MB'},400)

  const ext=(extname(file.name)||'').toLowerCase()
  const validExts=['.jpg','.jpeg','.png','.webp','.pdf']
  let mime=file.type?.toLowerCase()||''
  if(!mime||mime==='image/jpg'||mime==='image/pjpeg'){
    if(ext==='.jpg'||ext==='.jpeg')mime='image/jpeg'
    else if(ext==='.png')mime='image/png'
    else if(ext==='.webp')mime='image/webp'
    else if(ext==='.pdf')mime='application/pdf'
  }
  if(mime==='application/x-pdf')mime='application/pdf'
  if(!ALLOWED.includes(mime)&&!validExts.includes(ext)){
    return c.json({error:'Only JPEG, PNG, WebP, PDF allowed'},400)
  }
  if(!mime)mime=ext==='.pdf'?'application/pdf':'image/jpeg'

  const filename=`${doc.userId}-${crypto.randomBytes(8).toString('hex')}${ext||'.pdf'}`
  let filePath: string
  try{
    const buffer=Buffer.from(await file.arrayBuffer())
    filePath=await storageService.saveFile(doc.userId,filename,buffer,mime)
  }catch(err){
    console.error('File write:',err)
    return c.json({error:'Failed to save file'},500)
  }

  await storageService.deleteFile(doc.filePath).catch(()=>{})

  const updated=await prisma.document.update({
    where:{id:doc.id},
    data:{
      fileName:file.name,
      filePath,
      fileSize:file.size,
      mimeType:mime,
      status:'PENDING',
      rejectionReason:null,
      updatedAt:new Date()
    }
  })
  return c.json({document:updated,message:'Document file replaced successfully'})
})


// Upload document with duplicate detection and replace semantics
documents.post('/upload',async(c)=>{
  const userId=c.get('userId')
  let fd:FormData
  try{fd=await c.req.formData()}catch{return c.json({error:'Invalid form data'},400)}
  const file=fd.get('file') as File|null,docType=fd.get('type') as string|null,label=fd.get('label') as string|null
  const replaceStr=fd.get('replace') as string|null
  const replaceExisting=replaceStr==='true'

  if(!file||!docType||!label)return c.json({error:'file, type, and label required'},400)
  if(!ALLOWED.includes(file.type))return c.json({error:'Only JPEG, PNG, WebP, PDF allowed'},400)
  if(file.size>MAX)return c.json({error:'File must be under 5MB'},400)
  const parsed=documentTypeEnum.safeParse(docType)
  if(!parsed.success)return c.json({error:'Invalid document type'},400)

  // Check if user already has this document type
  const existing=await prisma.document.findFirst({where:{userId,type:parsed.data}})
  if(existing && !replaceExisting){
    return c.json({
      error:'DUPLICATE_DOCUMENT',
      message:`You already have a ${existing.label} uploaded on ${existing.createdAt.toISOString().slice(0,10)}.`,
      existingDocument:existing
    },409)
  }

  const ext=extname(file.name)||'.pdf'
  const filename=`${userId}-${crypto.randomBytes(8).toString('hex')}${ext}`
  let filePath: string
  try{
    const buffer=Buffer.from(await file.arrayBuffer())
    filePath=await storageService.saveFile(userId,filename,buffer,file.type)
  }catch(err){
    console.error('File write:',err)
    return c.json({error:'Failed to save file'},500)
  }

  if(existing && replaceExisting){
    // Update existing document record so foreign keys in ApplicationDocument remain valid!
    const updated=await prisma.document.update({
      where:{id:existing.id},
      data:{
        label,
        fileName:file.name,
        filePath,
        fileSize:file.size,
        mimeType:file.type,
        status:'PENDING',
        rejectionReason:null,
        updatedAt:new Date()
      }
    })
    return c.json({document:updated,replaced:true},200)
  }

  const newDoc=await prisma.document.create({
    data:{
      userId,
      type:parsed.data,
      label,
      fileName:file.name,
      filePath,
      fileSize:file.size,
      mimeType:file.type,
      status:'PENDING'
    }
  })
  return c.json({document:newDoc,replaced:false},201)
})

// Safe delete document (handles application relationships cleanly)
documents.delete('/:id',async(c)=>{
  const userId=c.get('userId'),id=c.req.param('id'),role=c.get('role')
  const doc=await prisma.document.findUnique({where:{id},include:{applicationLinks:true}})
  if(!doc)return c.json({error:'Not found'},404)
  if(doc.userId!==userId && role!=='ADMIN' && role!=='REVIEWER')return c.json({error:'Forbidden'},403)
  
  if(doc.applicationLinks.length>0){
    // Remove links to applications first so delete doesn't violate foreign key constraints
    await prisma.applicationDocument.deleteMany({where:{documentId:id}})
  }
  await storageService.deleteFile(doc.filePath).catch(()=>{})
  await prisma.document.delete({where:{id}})
  return c.json({message:'Deleted',id})
})

documents.get('/admin/pending',adminMiddleware,async(c)=>c.json({documents:await prisma.document.findMany({where:{status:'PENDING'},include:{user:{select:{fullName:true,email:true}}},orderBy:{createdAt:'asc'}})}))

documents.patch('/admin/:id/verify',adminMiddleware,zValidator('json',verifyDocumentSchema),async(c)=>{
  const id=c.req.param('id'),adminId=c.get('userId'),{status,rejectionReason}=c.req.valid('json')
  const doc=await prisma.document.findUnique({where:{id}})
  if(!doc)return c.json({error:'Not found'},404)
  const updated=await prisma.document.update({where:{id},data:{status,rejectionReason:status==='REJECTED'?(rejectionReason??'Did not meet requirements'):null,verifiedByAdminId:adminId,verifiedAt:new Date()}})
  await prisma.notification.create({data:{userId:doc.userId,type:status==='VERIFIED'?'DOCUMENT_VERIFIED':'DOCUMENT_REJECTED',title:status==='VERIFIED'?'Document verified':'Document rejected',message:status==='VERIFIED'?`Your ${doc.label} has been verified.`:`Your ${doc.label} was rejected: ${rejectionReason??'did not meet requirements'}.`,link:'/documents'}})
  return c.json({document:updated})
})

documents.patch('/admin/:id/expire',adminMiddleware,async(c)=>{
  const id=c.req.param('id')
  const doc=await prisma.document.findUnique({where:{id}})
  if(!doc)return c.json({error:'Not found'},404)
  await prisma.document.update({where:{id},data:{status:'EXPIRED'}})
  await prisma.notification.create({data:{userId:doc.userId,type:'DOCUMENT_REJECTED',title:'Document expired',message:`Your ${doc.label} has expired and needs to be re-uploaded.`,link:'/documents'}})
  return c.json({message:'Expired'})
})

export default documents
