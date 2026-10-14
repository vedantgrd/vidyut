import{Hono}from'hono'
import{prisma}from'../lib/prisma.js'
import{authMiddleware}from'../middleware/auth.js'
import{evaluateEligibility}from'../services/eligibilityEngine.js'
import{calculateProfileScore}from'../services/onboardingProgress.js'
import type{DbScholarship,DbEligibilityRule,StudentEligibilityProfile,DbStudentProfile,DbFamilyInfo,DbAcademicRecord,DbDocument}from'../types/index.js'
const dashboard=new Hono<{Variables:{userId:string;role:string}}>()
dashboard.use('*',authMiddleware)
dashboard.get('/home',async(c)=>{
  const userId=c.get('userId')
  const[user,p,fi,ar,docs,apps,uc]=await Promise.all([
    prisma.user.findUnique({where:{id:userId},select:{fullName:true}}),
    prisma.studentProfile.findUnique({where:{userId}}),
    prisma.familyInfo.findUnique({where:{userId}}),
    prisma.academicRecord.findMany({where:{userId}}),
    prisma.document.findMany({where:{userId}}),
    prisma.application.findMany({
      where:{userId},
      include:{
        scholarship:{select:{id:true,name:true,deadline:true,amount:true,paymentType:true}},
        disbursements:true
      },
      orderBy:{lastActivityAt:'desc'}
    }),
    prisma.notification.count({where:{userId,isRead:false}})
  ])

  const sp:StudentEligibilityProfile|null=p?{
    dateOfBirth:p.dateOfBirth,
    gender:p.gender,
    category:p.category,
    domicileState:p.domicileState,
    hasDisability:p.hasDisability,
    isMinority:p.isMinority,
    religion:p.religion,
    annualFamilyIncome:fi?.annualFamilyIncome??null,
    academicRecords:ar as unknown as DbAcademicRecord[]
  }:null

  const all=await prisma.scholarship.findMany({where:{status:'ACTIVE'},include:{eligibilityRules:true},orderBy:{deadline:'asc'},take:50})
  interface ER{id:string;name:string;provider:string;amount:number;deadline:Date;scholarshipCategory:string;isEligible:boolean;matchScore:number}
  
  const eligible:ER[]=(all as unknown as (DbScholarship&{eligibilityRules:DbEligibilityRule[]})[]).map((s):ER=>{
    const r=sp?evaluateEligibility(s.eligibilityRules,sp):{isEligible:false,matchScore:0}
    return{id:s.id,name:s.name,provider:s.provider,amount:s.amount,deadline:s.deadline,scholarshipCategory:s.scholarshipCategory,isEligible:r.isEligible,matchScore:r.matchScore}
  }).filter((s:ER)=>s.isEligible).sort((a:ER,b:ER)=>new Date(a.deadline).getTime()-new Date(b.deadline).getTime()).slice(0,6)

  type AR={id:string;status:string;completionPercent:number;lastActivityAt:Date;disbursedAmount:number|null;disbursementStatus:string;scholarship:{id:string;name:string;deadline:Date;amount:number;paymentType:string};disbursements:any[]}
  const ta=apps as unknown as AR[]
  const active=ta.filter((a:AR)=>!['APPROVED','REJECTED','WITHDRAWN'].includes(a.status))
  const approved=ta.filter((a:AR)=>a.status==='APPROVED')

  // Calculate DBT fund disbursement totals
  const totalDisbursed=ta.reduce((acc: number,a: any)=>acc+(a.disbursedAmount||0),0)
  const totalApprovedAmount=approved.reduce((acc: number,a: any)=>acc+a.scholarship.amount,0)
  const pendingDisbursement=Math.max(0,totalApprovedAmount-totalDisbursed)

  // Document Vault stats
  const vaultVerified=docs.filter((d: any)=>d.status==='VERIFIED').length
  const vaultPending=docs.filter((d: any)=>d.status==='PENDING').length

  const hr=new Date().getHours()
  const greeting=`${hr<12?'Good morning':hr<17?'Good afternoon':'Good evening'}, ${user?.fullName?.split(' ')[0]??'there'}`

  return c.json({
    greeting,
    profileScore:calculateProfileScore(p as unknown as DbStudentProfile|null,fi as unknown as DbFamilyInfo|null,ar as unknown as DbAcademicRecord[],docs as unknown as DbDocument[]),
    stats:[
      {label:'Eligible Matches',value:eligible.length,icon:'Award'},
      {label:'Active Applications',value:active.length,icon:'FileText'},
      {label:'Vault Documents',value:docs.length,icon:'Shield'},
      {label:'Disbursed (DBT)',value:totalDisbursed>0?`₹${totalDisbursed.toLocaleString('en-IN')}`:'₹0',icon:'Banknote'}
    ],
    funds:{
      totalDisbursed,
      pendingDisbursement,
      totalApprovedAmount,
      approvedCount:approved.length
    },
    vault: {
      total: docs.length,
      verified: vaultVerified,
      pending: vaultPending,
      rejected: docs.filter((d: any) => d.status === 'REJECTED').length,
      keyDocuments: [
        {
          key: 'aadhaar',
          label: 'Aadhaar Card',
          type: 'AADHAAR',
          status: docs.find((d: any) => d.type === 'AADHAAR')?.status || 'MISSING',
          docId: docs.find((d: any) => d.type === 'AADHAAR')?.id || null
        },
        {
          key: 'income',
          label: 'Income Certificate',
          type: 'INCOME_CERTIFICATE',
          status: docs.find((d: any) => d.type === 'INCOME_CERTIFICATE')?.status || 'MISSING',
          docId: docs.find((d: any) => d.type === 'INCOME_CERTIFICATE')?.id || null
        },
        {
          key: 'marksheet',
          label: 'Academic Marksheet',
          type: 'MARKSHEET',
          status: docs.find((d: any) => ['TENTH_MARKSHEET', 'TWELFTH_MARKSHEET', 'DEGREE_CERTIFICATE', 'TRANSCRIPT'].includes(d.type))?.status || 'MISSING',
          docId: docs.find((d: any) => ['TENTH_MARKSHEET', 'TWELFTH_MARKSHEET', 'DEGREE_CERTIFICATE', 'TRANSCRIPT'].includes(d.type))?.id || null
        },
        {
          key: 'photo',
          label: 'Passport Photo',
          type: 'PHOTOGRAPH',
          status: docs.find((d: any) => d.type === 'PHOTOGRAPH')?.status || 'MISSING',
          docId: docs.find((d: any) => d.type === 'PHOTOGRAPH')?.id || null
        }
      ]
    },
    unreadNotifications:uc,
    eligibleScholarships:eligible,
    pipeline: {
      draft: ta.filter(a => a.status === 'DRAFT').length,
      submitted: ta.filter(a => a.status === 'SUBMITTED' || a.status === 'DOCUMENTS_VERIFIED').length,
      underReview: ta.filter(a => a.status === 'UNDER_REVIEW').length,
      actionRequired: ta.filter(a => a.status === 'ADDITIONAL_INFO_REQUESTED').length,
      approved: approved.length,
      rejected: ta.filter(a => a.status === 'REJECTED').length,
      total: ta.length
    },
    activeApplications:active.map((a:AR)=>({id:a.id,scholarshipName:a.scholarship.name,status:a.status,completionPercent:a.completionPercent,deadline:a.scholarship.deadline})),
    approvedApplications:approved.map((a:AR)=>({id:a.id,scholarshipName:a.scholarship.name,amount:a.scholarship.amount,disbursedAmount:a.disbursedAmount||0,disbursementStatus:a.disbursementStatus,paymentType:a.scholarship.paymentType})),
    recentActivity:ta.slice(0,5).map((a:AR)=>({id:a.id,title:`Application ${a.status.toLowerCase().replace(/_/g,' ')}`,description:a.scholarship.name,date:a.lastActivityAt,status:a.status})),
    upcomingDeadlines:ta.filter((a:AR)=>['DRAFT','SUBMITTED','UNDER_REVIEW','ADDITIONAL_INFO_REQUESTED'].includes(a.status)).map((a:AR)=>({id:a.id,scholarshipName:a.scholarship.name,deadline:a.scholarship.deadline,status:a.status})).sort((a,b)=>new Date(a.deadline).getTime()-new Date(b.deadline).getTime()).slice(0,5)
  })
})
export default dashboard

