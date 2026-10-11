import type{DbEligibilityRule,StudentEligibilityProfile,EligibilityResult,RuleType}from'../types/index.js'
function getAge(d:Date|null){if(!d)return null;return Math.floor((Date.now()-d.getTime())/(365.25*24*60*60*1000))}
function bestPct(p:StudentEligibilityProfile){const r=p.academicRecords.filter(r=>r.percentage!==null).sort((a,b)=>(b.passingYear??0)-(a.passingYear??0));return r[0]?.percentage??null}
function bestCgpa(p:StudentEligibilityProfile){const r=p.academicRecords.filter(r=>r.cgpa!==null).sort((a,b)=>(b.passingYear??0)-(a.passingYear??0));return r[0]?.cgpa??null}
function evalRule(rule:DbEligibilityRule,p:StudentEligibilityProfile):boolean{
  const v=rule.value as Record<string,unknown>
  switch(rule.ruleType as RuleType){
    case 'INCOME_MAX':return p.annualFamilyIncome!==null&&p.annualFamilyIncome<=(v.value as number)
    case 'INCOME_MIN':return p.annualFamilyIncome!==null&&p.annualFamilyIncome>=(v.value as number)
    case 'CATEGORY':return!!p.category&&(v.values as string[]).includes(p.category)
    case 'EDUCATION_LEVEL':return p.academicRecords.some(r=>(v.values as string[]).includes(r.level))
    case 'MIN_PERCENTAGE':{const pct=bestPct(p);return pct!==null&&pct>=(v.value as number)}
    case 'MIN_CGPA':{const c=bestCgpa(p);return c!==null&&c>=(v.value as number)}
    case 'STATE':return!!p.domicileState&&(v.values as string[]).includes(p.domicileState)
    case 'GENDER':return!!p.gender&&p.gender===(v.value as string)
    case 'AGE_MIN':{const a=getAge(p.dateOfBirth);return a!==null&&a>=(v.value as number)}
    case 'AGE_MAX':{const a=getAge(p.dateOfBirth);return a!==null&&a<=(v.value as number)}
    case 'DISABILITY':return(p.hasDisability??false)===(v.value as boolean)
    case 'MINORITY':return(p.isMinority??false)===(v.value as boolean)
    case 'RELIGION':return!!p.religion&&(v.values as string[]).includes(p.religion)
    default:return false
  }
}
export function evaluateEligibility(rules:DbEligibilityRule[],profile:StudentEligibilityProfile):EligibilityResult{
  const passed:EligibilityResult['passedRules']=[]
  const failed:EligibilityResult['failedRules']=[]
  for(const rule of rules){
    if(evalRule(rule,profile))passed.push({ruleId:rule.id,description:rule.description})
    else failed.push({ruleId:rule.id,description:rule.description,isRequired:rule.isRequired})
  }
  return{isEligible:failed.every(r=>!r.isRequired),matchScore:rules.length===0?100:Math.round(passed.length/rules.length*100),passedRules:passed,failedRules:failed}
}
