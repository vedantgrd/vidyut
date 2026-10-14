import{Hono}from'hono'
import{zValidator}from'@hono/zod-validator'
import{prisma}from'../lib/prisma.js'
import{authMiddleware}from'../middleware/auth.js'
import{createApplicationSchema,saveFormDataSchema,attachDocumentSchema,submitApplicationSchema}from'../validators/schemas.js'
import type{ApplicationStatus}from'../types/index.js'
import{ReadinessService}from'../services/readinessService.js'

const applications=new Hono<{Variables:{userId:string;role:string}}>()
applications.use('*',authMiddleware)

applications.get('/',async(c)=>{
  const userId=c.get('userId'),status=c.req.query('status')
  const where:Record<string,unknown>={userId};if(status)where.status=status
  return c.json({
    applications:await prisma.application.findMany({
      where,
      include:{
        scholarship:{
          select:{
            id:true,
            name:true,
            provider:true,
            amount:true,
            amountDescription:true,
            deadline:true,
            scholarshipCategory:true
          }
        }
      },
      orderBy:{lastActivityAt:'desc'}
    })
  })
})

applications.post('/',zValidator('json',createApplicationSchema),async(c)=>{
  const userId=c.get('userId'),{scholarshipId}=c.req.valid('json')
  const s=await prisma.scholarship.findUnique({where:{id:scholarshipId},include:{requiredDocuments:true}})
  if(!s)return c.json({error:'Scholarship not found'},404)

  const ex=await prisma.application.findUnique({where:{userId_scholarshipId:{userId,scholarshipId}}})
  if(ex)return c.json({application:ex})

  // Create Application in transaction with DRAFT history and auto-attach existing documents
  const result=await prisma.$transaction(async(tx)=>{
    const app=await tx.application.create({
      data:{userId,scholarshipId,status:'DRAFT',lastActivityAt:new Date()}
    })
    await tx.applicationStatusHistory.create({
      data:{applicationId:app.id,fromStatus:null,toStatus:'DRAFT',changedByUserId:userId,note:'Application started'}
    })

    // Attach all available user documents (both PENDING and VERIFIED count as uploaded!)
    const userDocs=await tx.document.findMany({where:{userId}})
    for(const rd of s.requiredDocuments){
      const match=userDocs.find(d=>d.type===rd.documentType)
      if(match){
        await tx.applicationDocument.create({
          data:{applicationId:app.id,documentId:match.id,requiredDocumentId:rd.id}
        }).catch(()=>{})
      }
    }
    return app
  })

  return c.json({application:result},201)
})

applications.get('/:id',async(c)=>{
  const userId=c.get('userId'),id=c.req.param('id')
  const app=await prisma.application.findUnique({
    where:{id},
    include:{
      scholarship:{include:{requiredDocuments:true,installments:{orderBy:{installmentNo:'asc'}}}},
      formData:true,
      documents:{include:{document:true}},
      disbursements:{orderBy:{createdAt:'asc'},include:{installment:true}},
      statusHistory:{
        orderBy:{changedAt:'asc'},
        include:{changedByUser:{select:{fullName:true,role:true}}}
      }
    }
  })
  if(!app)return c.json({error:'Not found'},404)
  if(app.userId!==userId)return c.json({error:'Forbidden'},403)

  const[p,fi,ar,user,allUserDocs]=await Promise.all([
    prisma.studentProfile.findUnique({where:{userId}}),
    prisma.familyInfo.findUnique({where:{userId}}),
    prisma.academicRecord.findMany({where:{userId},orderBy:{level:'asc'}}),
    prisma.user.findUnique({where:{id:userId},select:{fullName:true,email:true}}),
    prisma.document.findMany({where:{userId},orderBy:{createdAt:'desc'}})
  ])

  const prefill={
    fullName:user?.fullName,
    email:user?.email,
    phone:p?.phone,
    dateOfBirth:p?.dateOfBirth,
    gender:p?.gender,
    category:p?.category,
    religion:p?.religion,
    domicileState:p?.domicileState,
    address:[p?.addressLine1,p?.addressLine2,p?.city,p?.state,p?.pincode].filter(Boolean).join(', '),
    familyInfo:fi,
    academicRecords:ar
  }

  // Calculate readiness via authoritative ReadinessService
  const readiness = await ReadinessService.evaluateReadiness(userId, app.scholarshipId, id)

  return c.json({
    application:{...app,completionPercent:app.status==='DRAFT'?readiness.readinessPercentage:app.completionPercent},
    prefill,
    userDocuments:allUserDocs,
    readiness
  })
})

// Application Preflight validation check
applications.get('/:id/preflight',async(c)=>{
  const userId=c.get('userId'),id=c.req.param('id')
  const app=await prisma.application.findUnique({where:{id}})
  if(!app)return c.json({error:'Not found'},404)
  if(app.userId!==userId)return c.json({error:'Forbidden'},403)

  const preflight=await ReadinessService.evaluateReadiness(userId,app.scholarshipId,id)
  return c.json({preflight})
})

applications.put('/:id/form-data',zValidator('json',saveFormDataSchema),async(c)=>{
  const userId=c.get('userId'),id=c.req.param('id'),{fields}=c.req.valid('json')
  const app=await prisma.application.findUnique({where:{id}})
  if(!app)return c.json({error:'Not found'},404)
  if(app.userId!==userId)return c.json({error:'Forbidden'},403)
  if(app.status!=='DRAFT')return c.json({error:'Cannot edit submitted application'},400)

  for(const f of fields){
    await prisma.applicationFormData.upsert({
      where:{applicationId_fieldName:{applicationId:id,fieldName:f.fieldName}},
      update:{fieldValue:f.fieldValue,fieldLabel:f.fieldLabel},
      create:{applicationId:id,fieldName:f.fieldName,fieldLabel:f.fieldLabel,fieldValue:f.fieldValue}
    })
  }
  await prisma.application.update({where:{id},data:{lastActivityAt:new Date()}})
  return c.json({formData:await prisma.applicationFormData.findMany({where:{applicationId:id}})})
})

applications.put('/:id/documents',zValidator('json',attachDocumentSchema),async(c)=>{
  const userId=c.get('userId'),id=c.req.param('id'),{requiredDocumentId,documentId}=c.req.valid('json')
  const app=await prisma.application.findUnique({where:{id}})
  if(!app)return c.json({error:'Not found'},404)
  if(app.userId!==userId)return c.json({error:'Forbidden'},403)

  const doc=await prisma.document.findUnique({where:{id:documentId}})
  if(!doc||doc.userId!==userId)return c.json({error:'Document not found'},404)

  const link=await prisma.applicationDocument.upsert({
    where:{applicationId_requiredDocumentId:{applicationId:id,requiredDocumentId}},
    update:{documentId},
    create:{applicationId:id,documentId,requiredDocumentId}
  })
  await prisma.application.update({where:{id},data:{lastActivityAt:new Date()}})
  return c.json({link})
})

applications.post('/:id/submit',zValidator('json',submitApplicationSchema),async(c)=>{
  const userId=c.get('userId'),id=c.req.param('id')
  const app=await prisma.application.findUnique({
    where:{id},
    include:{scholarship:{include:{requiredDocuments:true}},documents:true}
  })
  if(!app)return c.json({error:'Not found'},404)
  if(app.userId!==userId)return c.json({error:'Forbidden'},403)
  if(app.status!=='DRAFT')return c.json({error:'Application has already been submitted',code:'ALREADY_SUBMITTED'},400)

  const reqDocs=(app.scholarship.requiredDocuments as any[]).filter((r: any)=>!r.isOptional)
  const attIds=(app.documents as any[]).map((d: any)=>d.requiredDocumentId)
  const missing=reqDocs.filter((r: any)=>!attIds.includes(r.id))
  if(missing.length){
    return c.json({
      error:'MISSING_DOCUMENTS',
      message:`Please attach all required documents (${missing.map((m: any)=>m.label).join(', ')}) before submitting.`,
      missingCount:missing.length
    },400)
  }

  // Preflight server-side validation enforcement
  const preflight=await ReadinessService.evaluateReadiness(userId,app.scholarshipId,id)
  if(!preflight.canSubmit){
    return c.json({
      error:'PREFLIGHT_FAILED',
      message:preflight.blockingErrors[0]?.message||'Application failed preflight validation checks.',
      blockingErrors:preflight.blockingErrors
    },400)
  }

  // Atomically update application status, create status history, and create notification
  const updated=await prisma.$transaction(async(tx: any)=>{
    const res=await tx.application.update({
      where:{id},
      data:{
        status:'SUBMITTED',
        submittedAt:new Date(),
        completionPercent:100,
        lastActivityAt:new Date()
      },
      include:{
        scholarship:{select:{name:true}},
        documents:{include:{document:true}},
        statusHistory:true
      }
    })
    await tx.applicationStatusHistory.create({
      data:{
        applicationId:id,
        fromStatus:'DRAFT',
        toStatus:'SUBMITTED',
        changedByUserId:userId,
        note:'Application submitted by student'
      }
    })
    await tx.notification.create({
      data:{
        userId,
        type:'APPLICATION_SUBMITTED',
        title:'Application Submitted 🎉',
        message:`Your application for ${app.scholarship.name} has been submitted successfully. Tracking ID: ${id}`,
        link:`/applications/${id}`
      }
    })
    return res
  })

  return c.json({success:true,application:updated})
})

applications.delete('/:id',async(c)=>{
  const userId=c.get('userId'),id=c.req.param('id')
  const app=await prisma.application.findUnique({where:{id}})
  if(!app)return c.json({error:'Not found'},404)
  if(app.userId!==userId)return c.json({error:'Forbidden'},403)

  if(app.status==='DRAFT'){
    await prisma.$transaction([
      prisma.applicationDocument.deleteMany({where:{applicationId:id}}),
      prisma.applicationFormData.deleteMany({where:{applicationId:id}}),
      prisma.applicationStatusHistory.deleteMany({where:{applicationId:id}}),
      prisma.application.delete({where:{id}})
    ])
    return c.json({message:'Draft deleted'})
  }

  const updated=await prisma.application.update({
    where:{id},
    data:{status:'WITHDRAWN',lastActivityAt:new Date()}
  })
  await prisma.applicationStatusHistory.create({
    data:{
      applicationId:id,
      fromStatus:app.status as ApplicationStatus,
      toStatus:'WITHDRAWN',
      changedByUserId:userId,
      note:'Application withdrawn by student'
    }
  })
  return c.json({application:updated})
})

export default applications
