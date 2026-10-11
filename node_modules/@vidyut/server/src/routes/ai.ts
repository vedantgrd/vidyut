import{Hono}from'hono'
import{zValidator}from'@hono/zod-validator'
import{prisma}from'../lib/prisma.js'
import{authMiddleware}from'../middleware/auth.js'
import{aiAssistSchema}from'../validators/schemas.js'
import{evaluateEligibility}from'../services/eligibilityEngine.js'
import type{DbEligibilityRule,StudentEligibilityProfile,DbAcademicRecord}from'../types/index.js'

const ai=new Hono<{Variables:{userId:string;role:string}}>()
ai.use('*',authMiddleware)

async function getStudentContext(userId:string){
  const[user,p,fi,ar,docs,apps]=await Promise.all([
    prisma.user.findUnique({where:{id:userId},select:{fullName:true,email:true}}),
    prisma.studentProfile.findUnique({where:{userId}}),
    prisma.familyInfo.findUnique({where:{userId}}),
    prisma.academicRecord.findMany({where:{userId},orderBy:{level:'asc'}}),
    prisma.document.findMany({where:{userId}}),
    prisma.application.findMany({
      where:{userId},
      include:{
        scholarship:{
          select:{
            id:true,
            name:true,
            amount:true,
            paymentType:true,
            installments:{orderBy:{installmentNo:'asc'}}
          }
        },
        disbursements:{orderBy:{createdAt:'asc'},include:{installment:true}}
      }
    })
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
  return{user,p,fi,ar,docs,apps,sp}
}

ai.post('/assist',zValidator('json',aiAssistSchema),async(c)=>{
  const userId=c.get('userId'),{message,context,scholarshipId}=c.req.valid('json')
  const ctx=await getStudentContext(userId)
  const q=message.toLowerCase()

  // 1. Contextual Q&A when a specific scholarship is selected
  if(scholarshipId){
    const s=await prisma.scholarship.findUnique({
      where:{id:scholarshipId},
      include:{
        eligibilityRules:true,
        requiredDocuments:true,
        installments:{orderBy:{installmentNo:'asc'}}
      }
    })
    if(s){
      // Installments / Disbursements questions for specific scholarship
      if(q.includes('disburs')||q.includes('install')||q.includes('payment')||q.includes('money')||q.includes('payout')||q.includes('dbt')||q.includes('stage')||q.includes('how much')){
        if(s.paymentType==='INSTALLMENTS'&&s.installments.length>0){
          const instList=s.installments.map(i=>`• Installment ${i.installmentNo}: ₹${i.amount.toLocaleString('en-IN')}${i.name?` (${i.name})`:''}${i.description?` — ${i.description}`:''}`).join('\n')
          return c.json({
            response:`"${s.name}" provides total funding of ₹${s.amount.toLocaleString('en-IN')} paid in ${s.installments.length} installments via Direct Benefit Transfer (DBT):\n\n${instList}\n\nFunds are disbursed directly to your Aadhaar-linked bank account upon completing the corresponding verification milestones.`,
            context
          })
        }else{
          return c.json({
            response:`"${s.name}" provides a one-time grant of ₹${s.amount.toLocaleString('en-IN')}. Upon final committee approval, the full amount is released via Direct Benefit Transfer (DBT) directly into your bank account.`,
            context
          })
        }
      }

      // Document requirements for specific scholarship
      if(q.includes('document')||context==='document_explain'){
        const req=s.requiredDocuments.filter(d=>!d.isOptional)
        const ownedTypes=new Set(ctx.docs.map(d=>d.type))
        const have=req.filter(d=>ownedTypes.has(d.documentType))
        const missing=req.filter(d=>!ownedTypes.has(d.documentType))
        let reply=`For "${s.name}", required documents are: ${req.map(d=>d.label).join(', ')}.`
        if(have.length>0){
          reply+=`\n\n✓ You already have ${have.map(d=>d.label).join(', ')} in your Vidyut Document Vault — these will be attached automatically with 1 click!`
        }
        if(missing.length>0){
          reply+=`\n\n○ You still need to upload: ${missing.map(d=>d.label).join(', ')} in your Vault before applying.`
        }
        return c.json({response:reply,context})
      }

      // Eligibility diagnosis for specific scholarship
      if(q.includes('eligib')||context==='eligibility'||q.includes('qualif')||q.includes('why')){
        if(!ctx.sp)return c.json({response:'Please complete your profile first so I can check your eligibility.',context})
        const res=evaluateEligibility(s.eligibilityRules as unknown as DbEligibilityRule[],ctx.sp)
        if(res.isEligible){
          return c.json({response:`Great news, ${ctx.user?.fullName?.split(' ')[0]}! You are eligible for "${s.name}" with a ${res.matchScore}% match score. All criteria (academic marks, category, and income limits) are satisfied.`,context})
        }else{
          const reasons=res.failedRules.filter(r=>r.isRequired).map(r=>r.description).filter(Boolean)
          const reasonText=reasons.length>0?reasons.join('\n• '):'One or more criteria do not match your current profile.'
          return c.json({response:`You currently do not meet all criteria for "${s.name}":\n\n• ${reasonText}\n\nCheck your Profile page if you believe any academic records or income figures need to be updated.`,context})
        }
      }

      // Deadline question
      if(q.includes('deadline')||q.includes('last date')||q.includes('when to apply')){
        const deadlineDate=new Date(s.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
        const daysLeft=Math.ceil((new Date(s.deadline).getTime()-Date.now())/(1000*60*60*24))
        return c.json({
          response:`The application deadline for "${s.name}" is ${deadlineDate} (${daysLeft>0?`${daysLeft} days remaining`:'deadline passed'}). Be sure to submit your application before this date!`,
          context
        })
      }
    }
  }

  // 2. Fund Disbursement / Installments / DBT Tracking Questions
  if(q.includes('disburs')||q.includes('installment')||q.includes('dbt')||q.includes('bank')||q.includes('payout')||q.includes('money')||q.includes('payment')||q.includes('receive fund')||q.includes('stipend')){
    const approvedApps=ctx.apps.filter(a=>a.status==='APPROVED')
    const totalApproved=approvedApps.reduce((sum,a)=>sum+a.scholarship.amount,0)
    let totalDisbursed=0
    const disbursementItems:string[]=[]

    for(const a of approvedApps){
      const disb=a.disbursements.filter(d=>d.status==='DISBURSED')
      for(const d of disb){
        totalDisbursed+=d.amount
        const dateStr=d.disbursedAt?new Date(d.disbursedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'Recently'
        disbursementItems.push(`• ₹${d.amount.toLocaleString('en-IN')} (Ref: ${d.referenceCode||'DBT-PROCESSED'}) for ${a.scholarship.name} on ${dateStr}`)
      }
    }

    const pendingDisbursed=Math.max(0,totalApproved-totalDisbursed)

    if(approvedApps.length>0){
      let reply=`Here is your Direct Benefit Transfer (DBT) disbursement summary:\n\n`
      reply+=`• Total Approved Scholarship Funds: ₹${totalApproved.toLocaleString('en-IN')}\n`
      reply+=`• Disbursed to Bank Account: ₹${totalDisbursed.toLocaleString('en-IN')}\n`
      reply+=`• Pending Future Disbursements: ₹${pendingDisbursed.toLocaleString('en-IN')}\n\n`

      if(disbursementItems.length>0){
        reply+=`Processed Disbursements:\n${disbursementItems.join('\n')}\n\n`
      }

      // Check upcoming installments
      const upcoming:string[]=[]
      for(const a of approvedApps){
        if(a.scholarship.paymentType==='INSTALLMENTS'&&a.scholarship.installments){
          const disbursedNos=new Set(a.disbursements.filter(d=>d.status==='DISBURSED').map(d=>d.installmentNo).filter(Boolean))
          for(const inst of a.scholarship.installments){
            if(!disbursedNos.has(inst.installmentNo)){
              upcoming.push(`• ${a.scholarship.name} — Installment ${inst.installmentNo}: ₹${inst.amount.toLocaleString('en-IN')}${inst.name?` (${inst.name})`:''}`)
            }
          }
        }
      }

      if(upcoming.length>0){
        reply+=`Upcoming Installments scheduled:\n${upcoming.join('\n')}\n\n`
      }

      reply+=`💡 DBT Note: All disbursements are credited directly to your verified Aadhaar-linked bank account without intermediaries.`
      return c.json({response:reply,context})
    }else{
      return c.json({
        response:`You do not have any approved scholarship disbursements yet. Once your submitted application is reviewed and approved by the scholarship committee, your grant will be released via Direct Benefit Transfer (DBT) into your bank account. For multi-installment scholarships (such as MahaDBT or Vidyut Support), installments are disbursed across semesters upon progress verification.`,
        context
      })
    }
  }

  // 3. Scholarship Matching & Eligibility Diagnosis (checks specific scholarships mentioned in query)
  if(q.includes('eligible')||q.includes('match')||q.includes('which scholarship')||q.includes('recommend')||q.includes('can i apply')||q.includes('why')){
    if(!ctx.sp){
      return c.json({response:'Please complete your profile first so I can calculate your scholarship matches.',context})
    }

    const allScholarships=await prisma.scholarship.findMany({
      where:{status:'ACTIVE'},
      include:{eligibilityRules:true,installments:true}
    })

    // Check if the user is asking about a specific named scholarship (e.g. "maha", "vidyut", "reliance", "tata", "pragati")
    const specificMatch=allScholarships.find(s=>q.includes(s.name.toLowerCase())||q.includes(s.slug.toLowerCase()))
    if(specificMatch){
      const res=evaluateEligibility(specificMatch.eligibilityRules as unknown as DbEligibilityRule[],ctx.sp)
      if(res.isEligible){
        return c.json({
          response:`Yes! You are eligible for "${specificMatch.name}" with a ${res.matchScore}% match score. Total scholarship grant: ₹${specificMatch.amount.toLocaleString('en-IN')}${specificMatch.paymentType==='INSTALLMENTS'?` (in ${specificMatch.installments.length} DBT installments)`:''}. You can apply directly from the Scholarships tab!`,
          context
        })
      }else{
        const failed=res.failedRules.filter(r=>r.isRequired).map(r=>r.description).filter(Boolean)
        const reasons=failed.length>0?failed.join('\n• '):'Some requirements do not match your profile.'
        return c.json({
          response:`You are currently not eligible for "${specificMatch.name}". Here is why:\n\n• ${reasons}\n\nReview your Profile details if any info (such as family income or marks) was recorded differently.`,
          context
        })
      }
    }

    // General matching across all scholarships
    const matches:string[]=[]
    for(const sch of allScholarships){
      const res=evaluateEligibility(sch.eligibilityRules as unknown as DbEligibilityRule[],ctx.sp)
      if(res.isEligible){
        const instText=sch.paymentType==='INSTALLMENTS'?` (${sch.installments.length} installments)`:''
        matches.push(`• ${sch.name} (${sch.provider}) — ₹${sch.amount.toLocaleString('en-IN')}${instText}`)
      }
    }
    if(matches.length>0){
      return c.json({
        response:`Based on your profile (${ctx.p?.category??'General'}, ${ctx.p?.domicileState??'All-India'}, Family income ₹${ctx.fi?.annualFamilyIncome?.toLocaleString('en-IN')??'N/A'}), you are eligible for ${matches.length} scholarships:\n\n${matches.slice(0,5).join('\n')}\n\nHead over to the Scholarships section to apply with 1 click using your saved Vidyut Vault documents!`,
        context
      })
    }else{
      return c.json({
        response:'Currently none of the active scholarships match all your criteria, or some profile details (like family income, state, or academic marks) are incomplete. Update your profile in the Profile tab to recalculate matches.',
        context
      })
    }
  }

  // 4. Application Status Tracking
  if(q.includes('status')||q.includes('my application')||q.includes('track')){
    if(ctx.apps.length===0){
      return c.json({response:'You have not submitted any scholarship applications yet. Head over to the Scholarships page to apply!',context})
    }
    const list=ctx.apps.map(a=>{
      const disbText=a.status==='APPROVED'?` | DBT: ₹${a.disbursements.filter(d=>d.status==='DISBURSED').reduce((s,d)=>s+d.amount,0).toLocaleString('en-IN')} disbursed`:''
      return `• ${a.scholarship.name}: ${a.status.replace(/_/g,' ')}${disbText}`
    }).join('\n')
    return c.json({response:`Here is the status of your applications:\n\n${list}\n\nClick on any application in your Applications tab to view verification logs and timeline.`,context})
  }

  // 5. Document Vault Guidance
  if(q.includes('document')||q.includes('income certificate')||q.includes('aadhaar')||q.includes('vault')||q.includes('marksheet')){
    const docNames=ctx.docs.map(d=>`${d.label} (${d.status.toLowerCase()})`)
    if(docNames.length===0){
      return c.json({response:'You haven\'t uploaded any documents to your Vidyut vault yet. Upload your Aadhaar Card, Income Certificate, and Marksheet ONCE in the Documents section, and Vidyut will auto-attach them to all future applications!',context})
    }
    return c.json({
      response:`You have ${ctx.docs.length} document(s) in your Vidyut Vault:\n• ${docNames.join('\n• ')}\n\nWith Vidyut\'s AI Vault, you never need to re-upload documents for each application—they are verified once and reused seamlessly!`,
      context
    })
  }

  // 6. Application Stages Explanation
  if(q.includes('under review')||q.includes('documents verified')||q.includes('stage')||q.includes('process')||q.includes('how it works')){
    return c.json({
      response:'Here is what each stage in the Vidyut application pipeline means:\n\n1. SUBMITTED: Your application has been logged and queued for document audit.\n2. DOCUMENTS VERIFIED: The scholarship authority verified your uploaded certificates.\n3. UNDER REVIEW: The scholarship committee is assessing your academic merit and socio-economic criteria.\n4. APPROVED: Your scholarship is approved!\n5. DBT DISBURSEMENT: Funds are transferred directly to your bank account via Direct Benefit Transfer in 1 or more scheduled installments.',
      context
    })
  }

  // 7. Academic Category guidance
  if(q.includes('engineering')||q.includes('b.tech')||q.includes('degree')||q.includes('polytechnic')||q.includes('college')){
    return c.json({
      response:'For higher education and engineering degree students, top scholarships include Vidyut Higher Education Support (₹20,000 in 2 installments), AICTE Pragati, Tata Capital Pankh, Reliance Foundation Undergraduate, and Google India CS. Check the Scholarships tab for deadlines and eligibility rules!',
      context
    })
  }

  // Default intelligent greeting
  const appCount=ctx.apps.length
  const docCount=ctx.docs.length
  return c.json({
    response:`Hi ${ctx.user?.fullName?.split(' ')[0]??'there'}! I'm your Vidyut Scholarship Assistant. You currently have ${docCount} document(s) in your vault and ${appCount} application(s) in progress. I can help you check your eligibility, explain required documents, track application status, or check your DBT fund disbursement schedules. What would you like to know?`,
    context
  })
})

export default ai
