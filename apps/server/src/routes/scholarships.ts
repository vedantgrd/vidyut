import{Hono}from'hono'
import{zValidator}from'@hono/zod-validator'
import{prisma}from'../lib/prisma.js'
import{optionalAuthMiddleware}from'../middleware/auth.js'
import{scholarshipQuerySchema}from'../validators/schemas.js'
import{evaluateEligibility}from'../services/eligibilityEngine.js'
import type{DbScholarship,DbEligibilityRule,StudentEligibilityProfile,DbAcademicRecord}from'../types/index.js'

const scholarships=new Hono<{Variables:{userId:string;role:string}}>()

async function loadProfile(userId?:string):Promise<StudentEligibilityProfile|null>{
  if(!userId)return null
  const[p,fi,ar]=await Promise.all([
    prisma.studentProfile.findUnique({where:{userId}}),
    prisma.familyInfo.findUnique({where:{userId}}),
    prisma.academicRecord.findMany({where:{userId}})
  ])
  if(!p)return null
  return{
    dateOfBirth:p.dateOfBirth,
    gender:p.gender,
    category:p.category,
    domicileState:p.domicileState,
    hasDisability:p.hasDisability,
    isMinority:p.isMinority,
    religion:p.religion,
    annualFamilyIncome:fi?.annualFamilyIncome??null,
    academicRecords:ar as unknown as DbAcademicRecord[]
  }
}

type SWR=DbScholarship&{eligibilityRules:DbEligibilityRule[]}

function fmt(s:SWR&{paymentType?:string;installments?:any[]},sp:StudentEligibilityProfile|null){
  const e=sp?evaluateEligibility(s.eligibilityRules,sp):{isEligible:true,matchScore:100,passedRules:[],failedRules:[]}
  return{
    id:s.id,
    slug:s.slug,
    name:s.name,
    provider:s.provider,
    description:s.description,
    shortDescription:s.shortDescription,
    amount:s.amount,
    amountDescription:s.amountDescription,
    paymentType:s.paymentType??'ONE_TIME',
    installments:s.installments??[],
    scholarshipCategory:s.scholarshipCategory,
    tags:s.tags,
    isFeatured:s.isFeatured,
    isNational:s.isNational,
    states:s.states,
    deadline:s.deadline,
    officialWebsite:s.officialWebsite,
    applicationUrl:s.applicationUrl,
    status:s.status,
    isEligible:sp?e.isEligible:true,
    matchScore:sp?e.matchScore:100,
    hasCheckedEligibility:!!sp,
    failedRequiredRules:e.failedRules.filter(r=>r.isRequired)
  }
}

// GET /scholarships (Public browsing supported; personalized if authenticated)
scholarships.get('/',optionalAuthMiddleware,zValidator('query',scholarshipQuerySchema),async(c)=>{
  const{page,limit,search,category,onlyEligible,sortBy}=c.req.valid('query')
  const userId=c.get('userId') as string|undefined
  const sp=await loadProfile(userId)
  const where:Record<string,unknown>={status:'ACTIVE'}
  if(search)where.OR=[{name:{contains:search,mode:'insensitive'}},{provider:{contains:search,mode:'insensitive'}}]
  if(category)where.scholarshipCategory=category
  const ob:Record<string,string>=sortBy==='amount'?{amount:'desc'}:sortBy==='newest'?{createdAt:'desc'}:{deadline:'asc'}
  const all=await prisma.scholarship.findMany({where,orderBy:ob,include:{eligibilityRules:true}})
  let list=(all as unknown as SWR[]).map(s=>fmt(s,sp))
  if(onlyEligible && sp)list=list.filter(s=>s.isEligible)
  if(sortBy==='matchScore' && sp)list.sort((a,b)=>b.matchScore-a.matchScore)
  const total=list.length
  return c.json({scholarships:list.slice((page-1)*limit,page*limit),pagination:{page,limit,total,totalPages:Math.ceil(total/limit)}})
})

// GET /scholarships/featured
scholarships.get('/featured',optionalAuthMiddleware,async(c)=>{
  const userId=c.get('userId') as string|undefined
  const sp=await loadProfile(userId)
  const results=await prisma.scholarship.findMany({where:{isFeatured:true,status:'ACTIVE'},orderBy:{deadline:'asc'},take:6,include:{eligibilityRules:true}})
  return c.json({scholarships:(results as unknown as SWR[]).map(s=>fmt(s,sp))})
})

// GET /scholarships/:id
scholarships.get('/:id',optionalAuthMiddleware,async(c)=>{
  const id=c.req.param('id'),userId=c.get('userId') as string|undefined
  const s=await prisma.scholarship.findFirst({
    where:{OR:[{id},{slug:id}]},
    include:{
      eligibilityRules:true,
      requiredDocuments:true,
      installments:{orderBy:{installmentNo:'asc'}}
    }
  })
  if(!s)return c.json({error:'Scholarship not found'},404)
  const sp=await loadProfile(userId)
  const e=sp?evaluateEligibility(s.eligibilityRules as unknown as DbEligibilityRule[],sp):{isEligible:true,matchScore:100,passedRules:[],failedRules:[]}
  const userDocs=userId?await prisma.document.findMany({where:{userId}}):[]
  
  type RD={id:string;documentType:string;label:string;isOptional:boolean}
  type UD={type:string;id:string;status:string}
  const docStatus=(s.requiredDocuments as unknown as RD[]).map((rd:RD)=>{
    const u=(userDocs as unknown as UD[]).find((d:UD)=>d.type===rd.documentType)
    return{requiredDocumentId:rd.id,documentType:rd.documentType,label:rd.label,isOptional:rd.isOptional,uploadedDocumentId:u?.id??null,status:u?.status??'MISSING'}
  })
  const app=userId?await prisma.application.findUnique({where:{userId_scholarshipId:{userId,scholarshipId:s.id}}}):null
  return c.json({
    scholarship:{
      ...fmt(s as any,sp),
      eligibilityDetail:e,
      requiredDocuments:s.requiredDocuments,
      documentStatus:docStatus,
      installments:s.installments||[],
      applicationStatus:app?.status??null
    }
  })
})

export default scholarships
