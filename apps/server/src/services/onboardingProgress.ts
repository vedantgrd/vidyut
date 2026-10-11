import type{DbStudentProfile,DbFamilyInfo,DbAcademicRecord,DbDocument}from'../types/index.js'
export function isPersonalStepComplete(p:DbStudentProfile|null):boolean{return!!(p?.dateOfBirth&&p.gender&&p.phone&&p.category&&p.domicileState&&p.state&&p.city&&p.pincode)}
export function isAcademicStepComplete(r:DbAcademicRecord[]):boolean{return r.length>0&&r.some(rec=>rec.level&&(rec.percentage!==null||rec.cgpa!==null)&&rec.institutionName)}
export function isFamilyStepComplete(f:DbFamilyInfo|null):boolean{return f!==null&&f.annualFamilyIncome!==null&&f.annualFamilyIncome!==undefined}
export function isDocumentsStepComplete(d:DbDocument[]):boolean{return d.some(x=>x.type==='AADHAAR')&&d.some(x=>['TENTH_MARKSHEET','TWELFTH_MARKSHEET','DEGREE_CERTIFICATE'].includes(x.type))}
export interface OnboardingProgress{step1Personal:boolean;step2Academic:boolean;step3Family:boolean;step4Documents:boolean;isComplete:boolean;currentStep:number}
export function computeOnboardingProgress(p:DbStudentProfile|null,f:DbFamilyInfo|null,a:DbAcademicRecord[],d:DbDocument[]):OnboardingProgress{
  const s1=isPersonalStepComplete(p),s2=isAcademicStepComplete(a),s3=isFamilyStepComplete(f),s4=isDocumentsStepComplete(d)
  const isComplete=s1&&s2&&s3&&s4;let cur=5
  if(!s1)cur=1;else if(!s2)cur=2;else if(!s3)cur=3;else if(!s4)cur=4
  return{step1Personal:s1,step2Academic:s2,step3Family:s3,step4Documents:s4,isComplete,currentStep:cur}
}
export function calculateProfileScore(p:DbStudentProfile|null,f:DbFamilyInfo|null,a:DbAcademicRecord[],d:DbDocument[]):number{
  let s=0
  if(p?.dateOfBirth&&p.gender&&p.phone&&p.category)s+=15
  if(p?.city&&p.state&&p.pincode)s+=10
  if(a.length>0)s+=20
  if(f?.annualFamilyIncome!==null&&f?.annualFamilyIncome!==undefined)s+=15
  if(isDocumentsStepComplete(d))s+=20
  if(p?.achievements&&p.achievements.length>0)s+=10
  if(p?.bio)s+=5
  if(d.some(x=>x.status==='VERIFIED'))s+=5
  return Math.min(100,s)
}
