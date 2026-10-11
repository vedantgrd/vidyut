import{Hono}from'hono'
import{zValidator}from'@hono/zod-validator'
import{prisma}from'../lib/prisma.js'
import{authMiddleware}from'../middleware/auth.js'
import{personalInfoSchema,academicStepSchema,familyInfoSchema}from'../validators/schemas.js'
import{computeOnboardingProgress}from'../services/onboardingProgress.js'
import type{DbStudentProfile,DbFamilyInfo,DbAcademicRecord,DbDocument}from'../types/index.js'
const onboarding=new Hono<{Variables:{userId:string;role:string}}>()
onboarding.use('*',authMiddleware)
async function load(userId:string){
  const[p,fi,ar,d]=await Promise.all([prisma.studentProfile.findUnique({where:{userId}}),prisma.familyInfo.findUnique({where:{userId}}),prisma.academicRecord.findMany({where:{userId}}),prisma.document.findMany({where:{userId}})])
  return{profile:p as unknown as DbStudentProfile|null,familyInfo:fi as unknown as DbFamilyInfo|null,academicRecords:ar as unknown as DbAcademicRecord[],documents:d as unknown as DbDocument[]}
}
async function sync(userId:string){
  const{profile,familyInfo,academicRecords,documents}=await load(userId)
  const p=computeOnboardingProgress(profile,familyInfo,academicRecords,documents)
  await prisma.user.update({where:{id:userId},data:{onboardingStep:p.currentStep,onboardingComplete:p.isComplete}})
  return p
}
onboarding.get('/status',async(c)=>{
  const userId=c.get('userId')
  const{profile,familyInfo,academicRecords,documents}=await load(userId)
  const progress=computeOnboardingProgress(profile,familyInfo,academicRecords,documents)
  return c.json({progress,data:{personal:profile,family:familyInfo,academicRecords,documents:documents.map(d=>({id:d.id,type:d.type,label:d.label,status:d.status}))}})
})
onboarding.put('/personal',zValidator('json',personalInfoSchema),async(c)=>{
  const userId=c.get('userId');const b=c.req.valid('json')
  if(b.fullName && b.fullName.trim()){
    await prisma.user.update({where:{id:userId},data:{fullName:b.fullName.trim()}})
  }
  const updated=await prisma.studentProfile.update({where:{userId},data:{dateOfBirth:new Date(b.dateOfBirth),gender:b.gender,phone:b.phone,religion:b.religion??null,category:b.category,isMinority:b.isMinority??null,hasDisability:b.hasDisability??null,disabilityDetails:b.disabilityDetails??null,domicileState:b.domicileState,nationality:b.nationality??'Indian',addressLine1:b.addressLine1,addressLine2:b.addressLine2??null,city:b.city,state:b.state,pincode:b.pincode,isStepComplete:true}})
  return c.json({profile:updated,progress:await sync(userId)})
})
onboarding.put('/academic',zValidator('json',academicStepSchema),async(c)=>{
  const userId=c.get('userId');const{records}=c.req.valid('json')
  await prisma.$transaction([prisma.academicRecord.deleteMany({where:{userId}}),prisma.academicRecord.createMany({data:records.map(r=>({userId,level:r.level,institutionName:r.institutionName,boardOrUniversity:r.boardOrUniversity??null,courseName:r.courseName??null,branch:r.branch??null,marksObtained:r.marksObtained??null,totalMarks:r.totalMarks??null,percentage:r.percentage??null,cgpa:r.cgpa??null,maxCgpa:r.maxCgpa??10,passingYear:r.passingYear??null,admissionYear:r.admissionYear??null,currentSemester:r.currentSemester??null,isCurrentlyPursuing:r.isCurrentlyPursuing??false}))})])
  return c.json({academicRecords:await prisma.academicRecord.findMany({where:{userId}}),progress:await sync(userId)})
})
onboarding.put('/family',zValidator('json',familyInfoSchema),async(c)=>{
  const userId=c.get('userId');const b=c.req.valid('json')
  const updated=await prisma.familyInfo.update({where:{userId},data:{fatherName:b.fatherName??null,fatherOccupation:b.fatherOccupation??null,fatherIncome:b.fatherIncome??null,motherName:b.motherName??null,motherOccupation:b.motherOccupation??null,motherIncome:b.motherIncome??null,guardianName:b.guardianName??null,annualFamilyIncome:b.annualFamilyIncome,isBPL:b.isBPL??false,numberOfDependents:b.numberOfDependents??null,isStepComplete:true}})
  return c.json({familyInfo:updated,progress:await sync(userId)})
})
onboarding.post('/complete',async(c)=>{
  const userId=c.get('userId')
  const{profile,familyInfo,academicRecords,documents}=await load(userId)
  const progress=computeOnboardingProgress(profile,familyInfo,academicRecords,documents)
  if(!progress.isComplete)return c.json({error:'Onboarding incomplete',code:'ONBOARDING_INCOMPLETE',progress},400)
  await prisma.user.update({where:{id:userId},data:{onboardingComplete:true,onboardingStep:5}})
  await prisma.notification.create({data:{userId,type:'SYSTEM',title:'Profile complete!',message:'You can now see eligible scholarships.',link:'/dashboard'}})
  return c.json({message:'Onboarding complete',onboardingComplete:true})
})
export default onboarding
