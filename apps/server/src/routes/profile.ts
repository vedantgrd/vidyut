import{Hono}from'hono'
import{zValidator}from'@hono/zod-validator'
import{prisma}from'../lib/prisma.js'
import{authMiddleware}from'../middleware/auth.js'
import{updatePersonalSchema,updateFamilySchema,academicRecordSchema}from'../validators/schemas.js'
import{calculateProfileScore}from'../services/onboardingProgress.js'
import type{DbStudentProfile,DbFamilyInfo,DbAcademicRecord,DbDocument}from'../types/index.js'
const profile=new Hono<{Variables:{userId:string;role:string}}>()
profile.use('*',authMiddleware)
profile.get('/',async(c)=>{
  const userId=c.get('userId')
  const[user,sp,fi,ar,docs]=await Promise.all([prisma.user.findUnique({where:{id:userId},select:{fullName:true,email:true,avatarUrl:true,onboardingComplete:true,onboardingStep:true}}),prisma.studentProfile.findUnique({where:{userId}}),prisma.familyInfo.findUnique({where:{userId}}),prisma.academicRecord.findMany({where:{userId},orderBy:{level:'asc'}}),prisma.document.findMany({where:{userId},orderBy:{createdAt:'desc'}})])
  if(!user)return c.json({error:'Not found'},404)
  return c.json({user,studentProfile:sp,familyInfo:fi,academicRecords:ar,documents:(docs as unknown as DbDocument[]).map(d=>({id:d.id,type:d.type,label:d.label,fileName:d.fileName,fileSize:d.fileSize,status:d.status,createdAt:d.createdAt})),profileScore:calculateProfileScore(sp as unknown as DbStudentProfile|null,fi as unknown as DbFamilyInfo|null,ar as unknown as DbAcademicRecord[],docs as unknown as DbDocument[])})
})
profile.patch('/personal',zValidator('json',updatePersonalSchema),async(c)=>{
  const userId=c.get('userId');const b=c.req.valid('json');const data:Record<string,unknown>={}
  if(b.fullName!==undefined && b.fullName.trim()){
    await prisma.user.update({where:{id:userId},data:{fullName:b.fullName.trim()}})
  }
  if(b.dateOfBirth!==undefined && b.dateOfBirth)data.dateOfBirth=new Date(b.dateOfBirth)
  const fields=['gender','phone','religion','category','isMinority','hasDisability','disabilityDetails','domicileState','nationality','addressLine1','addressLine2','city','state','pincode'] as const
  for(const k of fields)if(b[k]!==undefined)data[k]=b[k]
  const sp=Object.keys(data).length?await prisma.studentProfile.update({where:{userId},data}):await prisma.studentProfile.findUnique({where:{userId}})
  const user=await prisma.user.findUnique({where:{id:userId},select:{fullName:true,email:true}})
  return c.json({success:true,studentProfile:sp,user})
})
profile.patch('/family',zValidator('json',updateFamilySchema),async(c)=>{
  const userId=c.get('userId');const b=c.req.valid('json');const data:Record<string,unknown>={}
  const fields=['fatherName','fatherOccupation','fatherIncome','motherName','motherOccupation','motherIncome','guardianName','annualFamilyIncome','isBPL','numberOfDependents'] as const
  for(const k of fields)if(b[k]!==undefined)data[k]=b[k]
  return c.json({familyInfo:await prisma.familyInfo.update({where:{userId},data})})
})
profile.put('/academic/:level',zValidator('json',academicRecordSchema),async(c)=>{
  const userId=c.get('userId')
  const level=c.req.param('level') as 'CLASS_10'|'CLASS_12'|'DIPLOMA'|'UNDERGRADUATE'|'POSTGRADUATE'|'DOCTORATE'|'OTHER'
  if(!['CLASS_10','CLASS_12','DIPLOMA','UNDERGRADUATE','POSTGRADUATE','DOCTORATE','OTHER'].includes(level))return c.json({error:'Invalid level'},400)
  const b=c.req.valid('json')
  const shared={institutionName:b.institutionName,boardOrUniversity:b.boardOrUniversity??null,courseName:b.courseName??null,branch:b.branch??null,marksObtained:b.marksObtained??null,totalMarks:b.totalMarks??null,percentage:b.percentage??null,cgpa:b.cgpa??null,maxCgpa:b.maxCgpa??10,passingYear:b.passingYear??null,admissionYear:b.admissionYear??null,currentSemester:b.currentSemester??null,isCurrentlyPursuing:b.isCurrentlyPursuing??false}
  return c.json({academicRecord:await prisma.academicRecord.upsert({where:{userId_level:{userId,level}},update:shared,create:{userId,level,...shared}})})
})
profile.delete('/academic/:level',async(c)=>{
  await prisma.academicRecord.deleteMany({where:{userId:c.get('userId'),level:c.req.param('level') as any}})
  return c.json({message:'Removed'})
})
profile.patch('/enrichment',async(c)=>{
  const userId=c.get('userId');const body=await c.req.json() as Record<string,unknown>
  const allowed=['skills','achievements','extracurriculars','languages','careerGoals','bio']
  const data:Record<string,unknown>={}
  for(const k of allowed)if(body[k]!==undefined)data[k]=body[k]
  if(!Object.keys(data).length)return c.json({error:'No valid fields'},400)
  return c.json({studentProfile:await prisma.studentProfile.update({where:{userId},data})})
})
export default profile
