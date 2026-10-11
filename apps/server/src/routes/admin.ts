import{Hono}from'hono'
import{zValidator}from'@hono/zod-validator'
import slugify from'slugify'
import{prisma}from'../lib/prisma.js'
import{authMiddleware,adminMiddleware,adminOnlyMiddleware}from'../middleware/auth.js'
import{createScholarshipSchema,updateScholarshipSchema,reviewApplicationSchema,disburseApplicationSchema}from'../validators/schemas.js'
import type{ApplicationStatus}from'../types/index.js'
const admin=new Hono<{Variables:{userId:string;role:string}}>()
admin.use('*',authMiddleware,adminMiddleware)
admin.get('/dashboard',async(c)=>{
  const[ts,tsc,as2,ta,pr,pd]=await Promise.all([prisma.user.count({where:{role:'STUDENT'}}),prisma.scholarship.count(),prisma.scholarship.count({where:{status:'ACTIVE'}}),prisma.application.count(),prisma.application.count({where:{status:{in:['SUBMITTED','UNDER_REVIEW']}}}),prisma.document.count({where:{status:'PENDING'}})])
  const abs=await prisma.application.groupBy({by:['status'],_count:true})
  const recent=await prisma.application.findMany({take:10,orderBy:{lastActivityAt:'desc'},include:{user:{select:{fullName:true,email:true}},scholarship:{select:{name:true}}}})
  return c.json({stats:{totalStudents:ts,totalScholarships:tsc,activeScholarships:as2,totalApplications:ta,pendingReview:pr,pendingDocuments:pd},applicationsByStatus:abs,recentApplications:recent})
})
admin.get('/scholarships',async(c)=>c.json({scholarships:await prisma.scholarship.findMany({include:{_count:{select:{applications:true,eligibilityRules:true,requiredDocuments:true}}},orderBy:{createdAt:'desc'}})}))
admin.get('/scholarships/:id',async(c)=>{
  const s=await prisma.scholarship.findUnique({where:{id:c.req.param('id')},include:{eligibilityRules:true,requiredDocuments:true}})
  if(!s)return c.json({error:'Not found'},404);return c.json({scholarship:s})
})
admin.post('/scholarships',zValidator('json',createScholarshipSchema),async(c)=>{
  const adminId=c.get('userId'),b=c.req.valid('json')
  const base=slugify(b.name,{lower:true,strict:true});let slug=base,i=1
  while(await prisma.scholarship.findUnique({where:{slug}}))slug=`${base}-${i++}`
  const s=await prisma.scholarship.create({data:{slug,name:b.name,provider:b.provider,description:b.description,shortDescription:b.shortDescription??null,amount:b.amount,amountDescription:b.amountDescription??null,scholarshipCategory:b.scholarshipCategory,tags:b.tags,isFeatured:b.isFeatured,isNational:b.isNational,states:b.states,deadline:new Date(b.deadline),openDate:b.openDate?new Date(b.openDate):null,officialWebsite:b.officialWebsite??null,applicationUrl:b.applicationUrl??null,status:b.status,createdByAdminId:adminId,eligibilityRules:{create:b.eligibilityRules.map(r=>({ruleType:r.ruleType,operator:r.operator,value:r.value,isRequired:r.isRequired,description:r.description??null}))},requiredDocuments:{create:b.requiredDocuments.map(d=>({documentType:d.documentType,label:d.label,description:d.description??null,isOptional:d.isOptional}))}},include:{eligibilityRules:true,requiredDocuments:true}})
  return c.json({scholarship:s},201)
})
admin.patch('/scholarships/:id',zValidator('json',updateScholarshipSchema),async(c)=>{
  const id=c.req.param('id'),b=c.req.valid('json')
  if(!await prisma.scholarship.findUnique({where:{id}}))return c.json({error:'Not found'},404)
  const data:Record<string,unknown>={}
  const sf=['name','provider','description','shortDescription','amount','amountDescription','scholarshipCategory','tags','isFeatured','isNational','states','officialWebsite','applicationUrl','status'] as const
  for(const f of sf)if(b[f]!==undefined)data[f]=b[f]
  if(b.deadline)data.deadline=new Date(b.deadline);if(b.openDate)data.openDate=new Date(b.openDate)
  await prisma.scholarship.update({where:{id},data})
  if(b.eligibilityRules){await prisma.eligibilityRule.deleteMany({where:{scholarshipId:id}});await prisma.eligibilityRule.createMany({data:b.eligibilityRules.map(r=>({scholarshipId:id,ruleType:r.ruleType,operator:r.operator,value:r.value,isRequired:r.isRequired,description:r.description??null}))})}
  if(b.requiredDocuments){await prisma.requiredDocument.deleteMany({where:{scholarshipId:id}});await prisma.requiredDocument.createMany({data:b.requiredDocuments.map(d=>({scholarshipId:id,documentType:d.documentType,label:d.label,description:d.description??null,isOptional:d.isOptional}))})}
  return c.json({scholarship:await prisma.scholarship.findUnique({where:{id},include:{eligibilityRules:true,requiredDocuments:true}})})
})
admin.delete('/scholarships/:id',adminOnlyMiddleware,async(c)=>{
  const id=c.req.param('id')
  if(!await prisma.scholarship.findUnique({where:{id}}))return c.json({error:'Not found'},404)
  await prisma.scholarship.delete({where:{id}});return c.json({message:'Deleted'})
})
admin.get('/applications',async(c)=>{
  const status=c.req.query('status'),where:Record<string,unknown>={};if(status)where.status=status
  return c.json({applications:await prisma.application.findMany({where,orderBy:{lastActivityAt:'desc'},include:{user:{select:{fullName:true,email:true}},scholarship:{select:{name:true,amount:true,deadline:true}}}})})
})
admin.get('/applications/:id',async(c)=>{
  const app=await prisma.application.findUnique({
    where:{id:c.req.param('id')},
    include:{
      user:{select:{fullName:true,email:true}},
      scholarship:{include:{requiredDocuments:true,eligibilityRules:true,installments:{orderBy:{installmentNo:'asc'}}}},
      formData:true,
      documents:{include:{document:true}},
      disbursements:{orderBy:{createdAt:'asc'},include:{installment:true}},
      statusHistory:{orderBy:{changedAt:'asc'},include:{changedByUser:{select:{fullName:true,role:true}}}}
    }
  })
  if(!app)return c.json({error:'Not found'},404)
  const[p,fi,ar]=await Promise.all([prisma.studentProfile.findUnique({where:{userId:app.userId}}),prisma.familyInfo.findUnique({where:{userId:app.userId}}),prisma.academicRecord.findMany({where:{userId:app.userId}})])
  return c.json({application:app,studentProfile:p,familyInfo:fi,academicRecords:ar})
})

admin.post('/applications/:id/disburse',zValidator('json',disburseApplicationSchema),async(c)=>{
  const adminId=c.get('userId'),id=c.req.param('id')
  const{installmentNo,installmentId,amount,referenceCode,notes}=c.req.valid('json')
  
  const app=await prisma.application.findUnique({
    where:{id},
    include:{scholarship:{include:{installments:true}},disbursements:true}
  })
  if(!app)return c.json({error:'Application not found'},404)
  if(app.status!=='APPROVED')return c.json({error:'Funds can only be disbursed for APPROVED applications'},400)

  // Validate amount does not exceed total scholarship or cause over-disbursement
  const alreadyDisbursed=app.disbursements.filter(d=>d.status==='DISBURSED').reduce((sum,d)=>sum+d.amount,0)
  if(alreadyDisbursed+amount>app.scholarship.amount){
    return c.json({error:`Disbursement amount exceeds scholarship remaining balance. Already disbursed: ₹${alreadyDisbursed.toLocaleString('en-IN')}, Scholarship total: ₹${app.scholarship.amount.toLocaleString('en-IN')}`},400)
  }

  const generatedRef=referenceCode?.trim()||`DBT-${new Date().getFullYear()}-${Math.floor(100000+Math.random()*900000)}`

  // Create disbursement in transaction and update application totals
  const result=await prisma.$transaction(async(tx)=>{
    const dis=await tx.applicationDisbursement.create({
      data:{
        applicationId:id,
        installmentId:installmentId??null,
        installmentNo:installmentNo??null,
        amount,
        status:'DISBURSED',
        referenceCode:generatedRef,
        notes:notes??null,
        disbursedAt:new Date()
      }
    })

    const newTotal=alreadyDisbursed+amount
    const isFullyPaid=newTotal>=app.scholarship.amount

    await tx.application.update({
      where:{id},
      data:{
        disbursementStatus:'DISBURSED',
        disbursedAmount:newTotal,
        disbursementDate:new Date(),
        lastActivityAt:new Date()
      }
    })

    await tx.applicationStatusHistory.create({
      data:{
        applicationId:id,
        fromStatus:app.status as ApplicationStatus,
        toStatus:app.status as ApplicationStatus,
        changedByUserId:adminId,
        note:`Disbursed ₹${amount.toLocaleString('en-IN')}${installmentNo?` (Installment ${installmentNo})`:''}${isFullyPaid?' [Fully Settled]':''} with reference: ${generatedRef}`
      }
    })

    await tx.notification.create({
      data:{
        userId:app.userId,
        type:'APPLICATION_STATUS_CHANGED',
        title:'Scholarship payment received',
        message:`₹${amount.toLocaleString('en-IN')} from "${app.scholarship.name}" has been marked as disbursed. Reference: ${generatedRef}`,
        link:`/applications/${id}`
      }
    })

    return dis
  })

  return c.json({disbursement:result},201)
})

admin.patch('/applications/:id/review',zValidator('json',reviewApplicationSchema),async(c)=>{
  const adminId=c.get('userId'),id=c.req.param('id'),{status,note,rejectionReason}=c.req.valid('json')
  const app=await prisma.application.findUnique({where:{id},include:{scholarship:true}})
  if(!app)return c.json({error:'Not found'},404)
  const data:Record<string,unknown>={status,reviewedByAdminId:adminId,lastActivityAt:new Date()}
  if(!app.reviewedAt)data.reviewedAt=new Date()
  if(status==='APPROVED'||status==='REJECTED')data.decidedAt=new Date()
  if(note)data.reviewerNotes=note;if(status==='REJECTED'&&rejectionReason)data.rejectionReason=rejectionReason
  if(status==='APPROVED')data.disbursementStatus='PENDING'
  const updated=await prisma.application.update({where:{id},data})
  await prisma.applicationStatusHistory.create({data:{applicationId:id,fromStatus:app.status as ApplicationStatus,toStatus:status,changedByUserId:adminId,note:note??null}})
  const msgs:Record<string,string>={DOCUMENTS_VERIFIED:`Documents for ${app.scholarship.name} verified.`,UNDER_REVIEW:`Application for ${app.scholarship.name} is under review.`,ADDITIONAL_INFO_REQUESTED:`Additional info needed for ${app.scholarship.name}.`,APPROVED:`Your application for ${app.scholarship.name} was approved!`,REJECTED:`Your application for ${app.scholarship.name} was not approved.`}
  await prisma.notification.create({data:{userId:app.userId,type:'APPLICATION_STATUS_CHANGED',title:'Application status updated',message:msgs[status]??`Status: ${status}`,link:`/applications/${id}`}})
  return c.json({application:updated})
})
admin.get('/users',async(c)=>{
  const role=c.req.query('role'),where:Record<string,unknown>={};if(role)where.role=role
  return c.json({users:await prisma.user.findMany({where,select:{id:true,email:true,fullName:true,role:true,isEmailVerified:true,onboardingComplete:true,createdAt:true,lastLoginAt:true,_count:{select:{applications:true}}},orderBy:{createdAt:'desc'}})})
})
admin.patch('/users/:id/role',adminOnlyMiddleware,async(c)=>{
  const body=await c.req.json() as{role:string}
  if(!['STUDENT','ADMIN','REVIEWER'].includes(body.role))return c.json({error:'Invalid role'},400)
  const u=await prisma.user.update({where:{id:c.req.param('id')},data:{role:body.role as any}})
  return c.json({user:{id:u.id,email:u.email,role:u.role}})
})
admin.post('/announcements',async(c)=>{
  const body=await c.req.json() as{title:string;message:string;audience?:string}
  if(!body.title||!body.message)return c.json({error:'title and message required'},400)
  const where=body.audience==='INCOMPLETE_ONBOARDING'?{role:'STUDENT' as const,onboardingComplete:false}:{role:'STUDENT' as const}
  const students=await prisma.user.findMany({where,select:{id:true}})
  await prisma.notification.createMany({data:(students as{id:string}[]).map(s=>({userId:s.id,type:'ANNOUNCEMENT' as const,title:body.title,message:body.message}))})
  return c.json({message:`Sent to ${students.length} students`},201)
})
export default admin
