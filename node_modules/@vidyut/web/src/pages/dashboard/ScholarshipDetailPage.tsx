import{useParams,useNavigate}from'react-router-dom'
import{motion}from'framer-motion'
import{ArrowLeft,CheckCircle,XCircle,FileText,ExternalLink,AlertCircle,Building,Calendar,Award,ChevronRight}from'lucide-react'
import{useApi}from'@/hooks/useApi'
import{useMutation}from'@/hooks/useMutation'
import{api}from'@/api/client'
import type{ScholarshipDetail}from'@/types'
import{PageSpinner}from'@/components/ui/Spinner'
import{Card}from'@/components/ui/Card'
import{Button}from'@/components/ui/Button'
import{Badge}from'@/components/ui/Badge'
import{StatusBadge}from'@/components/ui/StatusBadge'
import{toast}from'@/components/ui/Toast'

function fmtAmt(a:number){
  return a>=100000?`₹${(a/100000).toFixed(1)} Lakh`:`₹${a.toLocaleString('en-IN')}`
}

export function ScholarshipDetailPage(){
  const{id}=useParams()
  const navigate=useNavigate()
  const{data,isLoading}=useApi(()=>api.get<{scholarship:ScholarshipDetail}>(`/scholarships/${id}`),[id])
  
  const{mutate:startApp,isLoading:applying}=useMutation(async()=>{
    try{
      const res=await api.post<{application:{id:string}}>('/applications',{scholarshipId:data!.scholarship.id})
      toast('Application started! Your profile info and documents have been linked.','success')
      navigate(`/applications/${res.application.id}`)
    }catch(err:unknown){
      toast(err,'error')
    }
  })

  if(isLoading) return <PageSpinner/>
  if(!data?.scholarship) return <div style={{padding:40,textAlign:'center',color:'#64748b'}}>Scholarship not found.</div>

  const s=data.scholarship
  const days=Math.ceil((new Date(s.deadline).getTime()-Date.now())/86400000)
  const missingRequired=s.documentStatus.filter(d=>!d.isOptional&&d.status==='MISSING').length

  return<motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} style={{maxWidth:860,margin:'0 auto'}}>
    {/* Back Navigation */}
    <button 
      onClick={()=>navigate(-1)} 
      style={{
        display:'inline-flex',
        alignItems:'center',
        gap:6,
        background:'none',
        border:'none',
        cursor:'pointer',
        color:'#64748b',
        fontSize:13,
        fontWeight:500,
        marginBottom:18,
        padding:0
      }}
    >
      <ArrowLeft size={15}/> Back to Scholarships
    </button>

    {/* Hero Header Card */}
    <Card style={{marginBottom:20,border:'1px solid #e2e8f0',padding:24}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:20,flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:280}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>
            <Badge variant={s.isEligible?'success':'error'} dot>
              {s.isEligible?`${s.matchScore}% Profile Match`:'Ineligible for your profile'}
            </Badge>
            <Badge variant={days<=7?'error':days<=30?'warning':'default'}>
              {days>0?`${days} days remaining`:'Application closed'}
            </Badge>
            {s.applicationStatus&&<StatusBadge status={s.applicationStatus}/>}
          </div>
          <h1 style={{fontSize:24,fontWeight:800,color:'#0f172a',lineHeight:1.3,marginBottom:6}}>
            {s.name}
          </h1>
          <p style={{color:'#64748b',fontSize:14,display:'flex',alignItems:'center',gap:6}}>
            <Building size={14}/> {s.provider}
          </p>
        </div>

        <div style={{textAlign:'right',background:'#f0fdf4',border:'1px solid #bbf7d0',padding:'12px 18px',borderRadius:12}}>
          <p style={{fontSize:11,fontWeight:700,color:'#166534',textTransform:'uppercase',letterSpacing:0.5}}>Scholarship Grant</p>
          <p style={{fontSize:28,fontWeight:800,color:'#15803d',lineHeight:1.1,marginTop:2}}>{fmtAmt(s.amount)}</p>
          {s.amountDescription&&<p style={{fontSize:12,color:'#166534',marginTop:4}}>{s.amountDescription}</p>}
        </div>
      </div>

      <div style={{borderTop:'1px solid #f1f5f9',marginTop:20,paddingTop:16,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',gap:18,fontSize:13,color:'#64748b'}}>
          <span style={{display:'flex',alignItems:'center',gap:6}}>
            <Calendar size={14} color="#64748b"/> Deadline: <strong>{new Date(s.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</strong>
          </span>
          <span style={{display:'flex',alignItems:'center',gap:6}}>
            <Award size={14} color="#64748b"/> Category: <strong>{s.scholarshipCategory||'General'}</strong>
          </span>
        </div>

        <div style={{display:'flex',gap:10}}>
          {s.applicationStatus?(
            <Button onClick={()=>navigate('/applications')} variant="secondary" rightIcon={<ChevronRight size={14}/>}>
              View Existing Application
            </Button>
          ):(
            <Button 
              isLoading={applying} 
              onClick={()=>startApp()} 
              disabled={days<=0}
              rightIcon={<ChevronRight size={14}/>}
            >
              {days<=0?'Deadline Closed':'Apply with Vidyut Profile'}
            </Button>
          )}
          {s.officialWebsite&&(
            <a href={s.officialWebsite} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
              <Button variant="outline" rightIcon={<ExternalLink size={13}/>}>Official Portal</Button>
            </a>
          )}
        </div>
      </div>
    </Card>

    {/* Eligibility & Documents Grid */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(360px, 1fr))',gap:18,marginBottom:20}}>
      {/* Eligibility Breakdown */}
      <Card style={{border:'1px solid #e2e8f0'}}>
        <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
          <CheckCircle size={18} color={s.isEligible?'#059669':'#dc2626'}/>
          Eligibility Match Breakdown
        </h3>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {s.eligibilityDetail.passedRules.map(r=>r.description&&(
            <div key={r.ruleId} style={{display:'flex',alignItems:'flex-start',gap:8,fontSize:13,background:'#f0fdf4',padding:'8px 12px',borderRadius:8,border:'1px solid #dcfce7'}}>
              <CheckCircle size={15} color="#059669" style={{flexShrink:0,marginTop:2}}/>
              <span style={{color:'#166534',fontWeight:500}}>{r.description}</span>
            </div>
          ))}
          {s.eligibilityDetail.failedRules.map(r=>r.description&&(
            <div key={r.ruleId} style={{display:'flex',alignItems:'flex-start',gap:8,fontSize:13,background:r.isRequired?'#fef2f2':'#fffbeb',padding:'8px 12px',borderRadius:8,border:r.isRequired?'1px solid #fee2e2':'1px solid #fef3c7'}}>
              {r.isRequired?(
                <XCircle size={15} color="#dc2626" style={{flexShrink:0,marginTop:2}}/>
              ):(
                <AlertCircle size={15} color="#d97706" style={{flexShrink:0,marginTop:2}}/>
              )}
              <span style={{color:r.isRequired?'#991b1b':'#92400e',fontWeight:500}}>{r.description}</span>
            </div>
          ))}
          {!s.eligibilityDetail.passedRules.length&&!s.eligibilityDetail.failedRules.length&&(
            <p style={{fontSize:13,color:'#64748b'}}>Open to all qualifying applicants.</p>
          )}
        </div>
      </Card>

      {/* Required Documents Status */}
      <Card style={{border:'1px solid #e2e8f0'}}>
        <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
          <FileText size={18} color="#1e40af"/>
          Required Credentials & Vault Check
        </h3>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {s.documentStatus.map(d=>(
            <div key={d.requiredDocumentId} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',background:'#f8fafc',borderRadius:8,border:'1px solid #e2e8f0',fontSize:13}}>
              <span style={{color:'#334155',fontWeight:500}}>
                {d.label}{d.isOptional?' (Optional)':''}
              </span>
              <StatusBadge status={d.status}/>
            </div>
          ))}
          {s.documentStatus.length===0&&(
            <div style={{background:'#f0fdf4',padding:12,borderRadius:8,border:'1px solid #bbf7d0',color:'#166534',fontSize:13,fontWeight:500}}>
              ✓ No special documents required. Your basic student profile is sufficient!
            </div>
          )}
        </div>
        {missingRequired>0&&(
          <div style={{marginTop:12,background:'#fffbeb',border:'1px solid #fde68a',padding:'8px 12px',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:12,color:'#b45309',display:'flex',alignItems:'center',gap:6}}>
              <AlertCircle size={14}/> {missingRequired} required document{missingRequired>1?'s':''} not in vault
            </span>
            <Button size="sm" variant="ghost" onClick={()=>navigate('/documents')} style={{color:'#b45309',fontWeight:600}}>
              Add to Vault
            </Button>
          </div>
        )}
      </Card>
    </div>

    {/* Payment Structure Card */}
    <Card style={{marginBottom:20,border:'1px solid #e2e8f0'}}>
      <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
        <Award size={18} color="#059669"/>
        Payment & Disbursement Structure
      </h3>
      {s.paymentType==='INSTALLMENTS'&&s.installments&&s.installments.length>0?(
        <div>
          <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,padding:'10px 14px',marginBottom:14}}>
            <p style={{fontSize:13,color:'#166534',fontWeight:600}}>
              ✓ Total Grant: ₹{s.amount.toLocaleString('en-IN')} paid across {s.installments.length} installments
            </p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {s.installments.map((inst)=>(
              <div key={inst.id||inst.installmentNo} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#f8fafc',borderRadius:8,border:'1px solid #e2e8f0'}}>
                <div>
                  <p style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>
                    Installment {inst.installmentNo}: {inst.name||`Tranche ${inst.installmentNo}`}
                  </p>
                  {inst.description&&<p style={{fontSize:12,color:'#64748b',marginTop:2}}>{inst.description}</p>}
                </div>
                <span style={{fontSize:14,fontWeight:700,color:'#059669'}}>
                  ₹{inst.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      ):(
        <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <p style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>One-Time Scholarship Grant</p>
            <p style={{fontSize:12,color:'#64748b',marginTop:2}}>Full amount disbursed in a single transfer upon approval.</p>
          </div>
          <span style={{fontSize:16,fontWeight:800,color:'#059669'}}>
            ₹{s.amount.toLocaleString('en-IN')}
          </span>
        </div>
      )}
    </Card>

    {/* Description Card */}
    <Card style={{marginBottom:24,border:'1px solid #e2e8f0'}}>
      <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:10}}>
        Scholarship Description & Guidelines
      </h3>
      <p style={{fontSize:14,color:'#475569',lineHeight:1.7}}>
        {s.description}
      </p>
      {s.tags?.length>0&&(
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:16}}>
          {s.tags.map(t=>(
            <span key={t} style={{fontSize:11,fontWeight:600,color:'#3b82f6',background:'#eff6ff',padding:'3px 10px',borderRadius:20,border:'1px solid #dbeafe'}}>
              #{t}
            </span>
          ))}
        </div>
      )}
    </Card>
  </motion.div>
}
