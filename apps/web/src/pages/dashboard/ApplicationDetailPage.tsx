import{useState,useRef}from'react'
import{useParams,useNavigate}from'react-router-dom'
import{motion}from'framer-motion'
import{ArrowLeft,CheckCircle2,Clock,Send,Trash2,Upload,AlertCircle,ShieldCheck,FileText,Check,ExternalLink,ChevronRight}from'lucide-react'
import{useApi}from'@/hooks/useApi'
import{useMutation}from'@/hooks/useMutation'
import{api}from'@/api/client'
import type{Document}from'@/types'
import{PageSpinner}from'@/components/ui/Spinner'
import{Card}from'@/components/ui/Card'
import{Button}from'@/components/ui/Button'
import{StatusBadge}from'@/components/ui/StatusBadge'
import{ProgressBar}from'@/components/ui/ProgressBar'
import{toast}from'@/components/ui/Toast'
import{DocumentViewerModal}from'@/components/ui/DocumentViewerModal'
import{ReadinessCard}from'@/components/readiness/ReadinessCard'

function fmtDate(d:string){
  return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
}

export function ApplicationDetailPage(){
  const{id}=useParams()
  const navigate=useNavigate()
  const[activeStep,setActiveStep]=useState<1|2|3>(1) // 1: Profile Prefill, 2: Documents, 3: Review & Submit
  const[declarationAccepted,setDeclarationAccepted]=useState(false)
  const[uploadingForRd,setUploadingForRd]=useState<string|null>(null)
  const[viewingDoc,setViewingDoc]=useState<{id:string;title:string}|null>(null)
  const fileInputRef=useRef<HTMLInputElement>(null)
  const currentUploadRdId=useRef<string|null>(null)

  const{data,isLoading,refetch}=useApi(()=>api.get<any>(`/applications/${id}`),[id])
  const{data:myDocs,refetch:refetchDocs}=useApi(()=>api.get<{documents:Document[]}>('/documents'))

  const{mutate:submitApp,isLoading:submitting}=useMutation(async()=>{
    if(!declarationAccepted){
      toast('Please confirm the honesty declaration before submitting','error')
      return
    }
    try{
      await api.post(`/applications/${id}/submit`,{confirmDeclaration:true})
      await refetch()
      toast('Application submitted successfully! 🎉','success')
    }catch(err:unknown){
      toast(err,'error')
    }
  })

  const{mutate:withdrawApp,isLoading:withdrawing}=useMutation(async()=>{
    if(!window.confirm('Are you sure you want to withdraw or delete this application?')) return
    try{
      await api.delete(`/applications/${id}`)
      toast('Application withdrawn','info')
      navigate('/applications')
    }catch(err:unknown){
      toast(err,'error')
    }
  })

  const attachVaultDoc=async(requiredDocumentId:string,documentId:string)=>{
    try{
      await api.put(`/applications/${id}/documents`,{requiredDocumentId,documentId})
      await refetch()
      toast('Document linked to application!','success')
    }catch(err:unknown){
      toast(err,'error')
    }
  }

  const handleInSituUpload=async(requiredDocumentId:string,docType:string,docLabel:string,file:File)=>{
    setUploadingForRd(requiredDocumentId)
    try{
      const fd=new FormData()
      fd.append('file',file)
      fd.append('type',docType)
      fd.append('label',docLabel)
      // replace=true ensures we overwrite any existing in vault if student wants
      const uploadRes=await api.upload<{document:Document}>('/documents/upload?replace=true',fd)
      await refetchDocs()
      // Now attach this document to the application
      await api.put(`/applications/${id}/documents`,{
        requiredDocumentId,
        documentId:uploadRes.document.id
      })
      await refetch()
      toast(`${docLabel} uploaded and attached to application!`,'success')
    }catch(err:unknown){
      toast(err,'error')
    }finally{
      setUploadingForRd(null)
    }
  }

  if(isLoading) return <PageSpinner/>
  if(!data?.application) return <div style={{padding:40,textAlign:'center',color:'#64748b'}}>Application not found.</div>

  const{application:app,prefill}=data
  const sch=app.scholarship
  const isDraft=app.status==='DRAFT'
  const reqDocs=(sch.requiredDocuments??[]).filter((r:any)=>!r.isOptional)
  const attMap:Record<string,any>={}
  app.documents.forEach((d:any)=>{attMap[d.requiredDocumentId]=d.document})
  
  const allRequiredAttached=reqDocs.every((r:any)=>Boolean(attMap[r.id]))
  const canSubmit=isDraft&&allRequiredAttached

  return<motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} style={{maxWidth:860,margin:'0 auto'}}>
    {/* Navigation */}
    <button 
      onClick={()=>navigate('/applications')} 
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
        marginBottom:16,
        padding:0
      }}
    >
      <ArrowLeft size={15}/> Back to My Applications
    </button>

    {/* Header Card */}
    <Card style={{marginBottom:20,border:'1px solid #e2e8f0',padding:22}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,flexWrap:'wrap'}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
            <StatusBadge status={app.status}/>
            <span style={{fontSize:12,color:'#64748b'}}>App ID: {app.id.slice(0,8)}...</span>
          </div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#0f172a',marginBottom:4}}>{sch.name}</h1>
          <p style={{fontSize:13,color:'#64748b'}}>{sch.provider}</p>
        </div>

        {isDraft&&(
          <Button 
            variant="danger" 
            size="sm" 
            isLoading={withdrawing} 
            onClick={()=>withdrawApp()} 
            leftIcon={<Trash2 size={13}/>}
          >
            Discard Draft
          </Button>
        )}
      </div>

      {isDraft&&(
        <div style={{marginTop:18,paddingTop:16,borderTop:'1px solid #f1f5f9'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>Application Readiness</span>
            <span style={{fontSize:13,fontWeight:700,color:'#1e40af'}}>{app.completionPercent}%</span>
          </div>
          <ProgressBar value={app.completionPercent} height={8} color={allRequiredAttached?'#059669':'#d97706'}/>
        </div>
      )}
    </Card>

    {/* Reviewer Feedback Banner if any */}
    {app.reviewerNotes&&(
      <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,padding:16,marginBottom:20}}>
        <h4 style={{fontSize:13,fontWeight:700,color:'#92400e',marginBottom:4,display:'flex',alignItems:'center',gap:6}}>
          <AlertCircle size={15}/> Reviewer Remarks
        </h4>
        <p style={{fontSize:13,color:'#78350f',lineHeight:1.6}}>{app.reviewerNotes}</p>
      </div>
    )}

    {/* Student Fund Disbursement Tracker (Approved Applications) */}
    {app.status==='APPROVED'&&(
      <Card style={{marginBottom:20,border:'1px solid #bbf7d0',backgroundColor:'#ffffff',padding:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12,marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:'#dcfce7',display:'flex',alignItems:'center',justifyContent:'center',color:'#166534'}}>
              <CheckCircle2 size={20}/>
            </div>
            <div>
              <h3 style={{fontSize:16,fontWeight:800,color:'#0f172a',margin:0}}>
                Scholarship Fund Disbursement Tracker
              </h3>
              <p style={{fontSize:12,color:'#64748b',margin:'2px 0 0'}}>
                Direct Benefit Transfer (DBT) & Installment Status
              </p>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <span style={{fontSize:12,fontWeight:600,color:'#64748b'}}>Total Disbursed</span>
            <p style={{fontSize:20,fontWeight:800,color:'#15803d',margin:0}}>
              ₹{(app.disbursedAmount||0).toLocaleString('en-IN')} <span style={{fontSize:13,fontWeight:500,color:'#64748b'}}>/ ₹{sch.amount.toLocaleString('en-IN')}</span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{marginBottom:18}}>
          <ProgressBar
            value={sch.amount>0?Math.min(100,Math.round(((app.disbursedAmount||0)/sch.amount)*100)):0}
            height={10}
            color="#059669"
            showLabel
          />
        </div>

        {/* Installments Breakdown */}
        {sch.installments&&sch.installments.length>0?(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <h4 style={{fontSize:13,fontWeight:700,color:'#334155',textTransform:'uppercase',letterSpacing:0.5}}>
              Installment Schedule
            </h4>
            {sch.installments.map((inst:any)=>{
              const disMatch=(app.disbursements||[]).find((d:any)=>d.installmentNo===inst.installmentNo||d.installmentId===inst.id)
              const isPaid=!!disMatch&&disMatch.status==='DISBURSED'

              return(
                <div 
                  key={inst.id||inst.installmentNo}
                  style={{
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'space-between',
                    padding:'12px 16px',
                    borderRadius:8,
                    background:isPaid?'#f0fdf4':'#f8fafc',
                    border:isPaid?'1px solid #bbf7d0':'1px solid #e2e8f0',
                    flexWrap:'wrap',
                    gap:10
                  }}
                >
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    {isPaid?(
                      <CheckCircle2 size={18} color="#059669"/>
                    ):(
                      <Clock size={18} color="#94a3b8"/>
                    )}
                    <div>
                      <p style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>
                        Installment {inst.installmentNo}: {inst.name||`Tranche ${inst.installmentNo}`}
                      </p>
                      {isPaid&&disMatch.referenceCode&&(
                        <p style={{fontSize:11,color:'#166534',fontWeight:500,marginTop:2}}>
                          ✓ Paid on {fmtDate(disMatch.disbursedAt||disMatch.createdAt)} · Ref: {disMatch.referenceCode}
                        </p>
                      )}
                      {!isPaid&&(
                        <p style={{fontSize:11,color:'#64748b',marginTop:2}}>
                          Scheduled for administrative transfer
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <span style={{fontSize:14,fontWeight:700,color:isPaid?'#15803d':'#334155'}}>
                      ₹{inst.amount.toLocaleString('en-IN')}
                    </span>
                    <p style={{fontSize:11,fontWeight:600,color:isPaid?'#059669':'#d97706',margin:'2px 0 0'}}>
                      {isPaid?'DISBURSED':'PENDING'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ):(
          <div style={{padding:'12px 16px',background:app.disbursedAmount>0?'#f0fdf4':'#f8fafc',borderRadius:8,border:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <p style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>One-Time Disbursement</p>
              <p style={{fontSize:12,color:'#64748b',marginTop:2}}>
                {app.disbursedAmount>0?`Disbursed on ${fmtDate(app.disbursementDate||app.updatedAt)}`:'Awaiting release by administrator'}
              </p>
            </div>
            <span style={{fontSize:14,fontWeight:700,color:app.disbursedAmount>0?'#15803d':'#d97706'}}>
              {app.disbursedAmount>0?'DISBURSED':'PENDING'}
            </span>
          </div>
        )}
      </Card>
    )}


    {/* Application Readiness Card */}
    {data?.readiness && isDraft && (
      <div style={{ marginBottom: 20 }}>
        <ReadinessCard readiness={data.readiness} />
      </div>
    )}

    {/* Draft Stepper Tabs */}
    {isDraft?(
      <div style={{display:'flex',gap:10,marginBottom:20}}>
        {[
          {step:1,label:'1. Review Profile Prefill'},
          {step:2,label:'2. Verify Attached Documents'},
          {step:3,label:'3. Declaration & Submit'}
        ].map(s=>(
          <button
            key={s.step}
            onClick={()=>setActiveStep(s.step as any)}
            style={{
              flex:1,
              padding:'10px 14px',
              borderRadius:8,
              border:'none',
              cursor:'pointer',
              fontWeight:600,
              fontSize:13,
              background:activeStep===s.step?'#1e40af':'#ffffff',
              color:activeStep===s.step?'#ffffff':'#64748b',
              boxShadow:activeStep===s.step?'0 2px 4px rgba(30,64,175,0.2)':'0 1px 3px rgba(0,0,0,0.05)',
              borderWidth:1,
              borderStyle:'solid',
              borderColor:activeStep===s.step?'#1e40af':'#e2e8f0'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    ):null}

    {/* Hidden file upload input */}
    <input 
      ref={fileInputRef} 
      type="file" 
      accept=".pdf,.jpg,.jpeg,.png,.webp" 
      style={{display:'none'}} 
      onChange={e=>{
        const f=e.target.files?.[0]
        if(f && currentUploadRdId.current){
          const rd=sch.requiredDocuments?.find((r:any)=>r.id===currentUploadRdId.current)
          if(rd){
            handleInSituUpload(rd.id,rd.documentType,rd.label,f)
          }
        }
        if(e.target) e.target.value=''
      }}
    />

    {/* Step 1 / Post-Submit: Profile Prefill Review */}
    {(isDraft?activeStep===1:true)&&(
      <Card style={{marginBottom:20,border:'1px solid #e2e8f0'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,borderBottom:'1px solid #f1f5f9',paddingBottom:12}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <ShieldCheck size={18} color="#059669"/>
            <h3 style={{fontSize:16,fontWeight:700,color:'#0f172a'}}>
              {isDraft?'Auto-Prefilled Candidate Data':'Submitted Candidate Dossier'}
            </h3>
          </div>
          {isDraft&&(
            <Button size="sm" variant="ghost" onClick={()=>navigate('/profile')} style={{color:'#1e40af'}}>
              Edit in Profile
            </Button>
          )}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))',gap:12}}>
          {[
            ['Applicant Name',prefill?.fullName],
            ['Email Address',prefill?.email],
            ['Phone Number',prefill?.phone],
            ['Date of Birth',prefill?.dateOfBirth?new Date(prefill.dateOfBirth).toLocaleDateString('en-IN'):null],
            ['Gender',prefill?.gender],
            ['Category',prefill?.category],
            ['Domicile State',prefill?.domicileState],
            ['Family Income',prefill?.familyInfo?.annualFamilyIncome?`₹${prefill.familyInfo.annualFamilyIncome.toLocaleString('en-IN')}`:null],
            ['Address',prefill?.address]
          ].map(([label,val])=>(
            <div key={label as string} style={{background:'#f8fafc',padding:10,borderRadius:8,border:'1px solid #e2e8f0'}}>
              <p style={{fontSize:11,fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:0.3,marginBottom:2}}>{label}</p>
              <p style={{fontSize:13,fontWeight:val?600:400,color:val?'#0f172a':'#94a3b8'}}>{val??'Not provided'}</p>
            </div>
          ))}
        </div>

        {isDraft&&(
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:18,paddingTop:14,borderTop:'1px solid #f1f5f9'}}>
            <Button onClick={()=>setActiveStep(2)} rightIcon={<ChevronRight size={14}/>}>
              Continue to Document Attachment
            </Button>
          </div>
        )}
      </Card>
    )}

    {/* Step 2 / Post-Submit: Required Documents Status */}
    {(isDraft?activeStep===2:true)&&(
      <Card style={{marginBottom:20,border:'1px solid #e2e8f0'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,borderBottom:'1px solid #f1f5f9',paddingBottom:12}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <FileText size={18} color="#1e40af"/>
            <h3 style={{fontSize:16,fontWeight:700,color:'#0f172a'}}>
              {isDraft?'Application Document Attachment':'Attached Documents'}
            </h3>
          </div>
          <span style={{fontSize:12,color:'#64748b'}}>
            {Object.keys(attMap).length} / {sch.requiredDocuments?.length??0} attached
          </span>
        </div>

        {sch.requiredDocuments?.length===0?(
          <div style={{background:'#f0fdf4',padding:16,borderRadius:8,color:'#166534',fontSize:13}}>
            ✓ This scholarship does not require document attachments. You can proceed directly to declaration!
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {(sch.requiredDocuments??[]).map((rd:any)=>{
              const linkedDoc=attMap[rd.id]
              const availableInVault=(myDocs?.documents??[]).filter((d:Document)=>d.type===rd.documentType)

              return(
                <div 
                  key={rd.id} 
                  style={{
                    padding:16,
                    background:'#f8fafc',
                    borderRadius:10,
                    border:linkedDoc?'1px solid #bbf7d0':'1px solid #e2e8f0',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'space-between',
                    flexWrap:'wrap',
                    gap:14
                  }}
                >
                  <div style={{flex:1,minWidth:220}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                      <p style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>{rd.label}</p>
                      {rd.isOptional?(
                        <span style={{fontSize:11,color:'#64748b',background:'#f1f5f9',padding:'1px 6px',borderRadius:4}}>Optional</span>
                      ):(
                        <span style={{fontSize:11,color:'#dc2626',background:'#fee2e2',fontWeight:600,padding:'1px 6px',borderRadius:4}}>Required</span>
                      )}
                    </div>
                    
                    {linkedDoc?(
                      <div style={{display:'flex',alignItems:'center',gap:8,marginTop:6}}>
                        <CheckCircle2 size={15} color="#059669"/>
                        <span style={{fontSize:12,color:'#166534',fontWeight:600}}>
                          Attached: {linkedDoc.fileName}
                        </span>
                        <StatusBadge status={linkedDoc.status}/>
                      </div>
                    ):(
                      <p style={{fontSize:12,color:'#dc2626',marginTop:4}}>
                        ⚠️ Missing. Attach an existing credential from your vault or upload now.
                      </p>
                    )}
                  </div>

                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {linkedDoc&&(
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        leftIcon={<ExternalLink size={12}/>}
                        onClick={()=>setViewingDoc({id:linkedDoc.id,title:linkedDoc.label||rd.label})}
                      >
                        View
                      </Button>
                    )}

                    {isDraft&&(
                      <>
                        {availableInVault.length>0&&!linkedDoc&&(
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={()=>attachVaultDoc(rd.id,availableInVault[0].id)}
                            leftIcon={<Check size={13}/>}
                          >
                            Use Vault File
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          isLoading={uploadingForRd===rd.id}
                          onClick={()=>{
                            currentUploadRdId.current=rd.id
                            fileInputRef.current?.click()
                          }}
                          leftIcon={<Upload size={13}/>}
                        >
                          {linkedDoc?'Re-upload File':'Upload File'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {isDraft&&(
          <div style={{display:'flex',justifyContent:'space-between',marginTop:20,paddingTop:14,borderTop:'1px solid #f1f5f9'}}>
            <Button variant="ghost" onClick={()=>setActiveStep(1)} leftIcon={<ArrowLeft size={14}/>}>
              Back to Profile Review
            </Button>
            <Button onClick={()=>setActiveStep(3)} rightIcon={<ChevronRight size={14}/>}>
              Proceed to Final Submission
            </Button>
          </div>
        )}
      </Card>
    )}

    {/* Step 3: Declaration & Final Submission (Draft) */}
    {isDraft&&activeStep===3&&(
      <Card style={{marginBottom:20,border:'1px solid #e2e8f0',padding:22}}>
        <h3 style={{fontSize:16,fontWeight:700,color:'#0f172a',marginBottom:14}}>
          Candidate Declaration & Submission Confirmation
        </h3>

        <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:10,padding:16,marginBottom:18}}>
          <p style={{fontSize:13,color:'#334155',lineHeight:1.7}}>
            I hereby certify that all the particulars furnished above and the documents attached are genuine, correct, and complete to the best of my knowledge. I understand that if any statement or document is found to be false or fabricated, my scholarship will be forfeited, and I shall be subject to legal proceedings.
          </p>
          <div style={{display:'flex',alignItems:'center',gap:10,marginTop:14}}>
            <input 
              type="checkbox" 
              id="decl" 
              checked={declarationAccepted} 
              onChange={e=>setDeclarationAccepted(e.target.checked)}
              style={{width:18,height:18,accentColor:'#1e40af',cursor:'pointer'}}
            />
            <label htmlFor="decl" style={{fontSize:13,fontWeight:600,color:'#0f172a',cursor:'pointer'}}>
              I agree to the declaration and authorize Vidyut to forward my details to the scholarship committee.
            </label>
          </div>
        </div>

        {!allRequiredAttached&&(
          <div style={{background:'#fee2e2',border:'1px solid #fecaca',color:'#991b1b',borderRadius:8,padding:12,marginBottom:16,fontSize:13,display:'flex',alignItems:'center',gap:8}}>
            <AlertCircle size={16}/>
            Please attach all required documents in Step 2 before submitting.
          </div>
        )}

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <Button variant="ghost" onClick={()=>setActiveStep(2)} leftIcon={<ArrowLeft size={14}/>}>
            Back to Documents
          </Button>
          <Button 
            size="lg" 
            isLoading={submitting} 
            disabled={!canSubmit||!declarationAccepted} 
            onClick={()=>submitApp()} 
            leftIcon={<Send size={15}/>}
          >
            Submit Application Now
          </Button>
        </div>
      </Card>
    )}

    {/* Post-Submit Status History Timeline */}
    {!isDraft&&(
      <Card style={{marginBottom:20,border:'1px solid #e2e8f0',padding:20}}>
        <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
          <Clock size={16} color="#1e40af"/> Application Audit Timeline
        </h3>
        <div style={{display:'flex',flexDirection:'column'}}>
          {app.statusHistory?.map((h:any,i:number)=>(
            <div key={h.id} style={{display:'flex',gap:14,paddingBottom:i<app.statusHistory.length-1?18:0}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:22}}>
                <div style={{width:22,height:22,borderRadius:'50%',background:'#ecfdf5',border:'2px solid #059669',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <CheckCircle2 size={12} color="#059669"/>
                </div>
                {i<app.statusHistory.length-1&&<div style={{width:2,flex:1,background:'#e2e8f0',marginTop:4}}/>}
              </div>
              <div style={{paddingBottom:8}}>
                <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:3}}>
                  <StatusBadge status={h.toStatus}/>
                  <span style={{fontSize:12,color:'#64748b'}}>{fmtDate(h.changedAt)}</span>
                  {h.changedByUser?.fullName&&<span style={{fontSize:11,color:'#94a3b8'}}>by {h.changedByUser.fullName}</span>}
                </div>
                {h.note&&<p style={{fontSize:13,color:'#334155',marginTop:4}}>{h.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    )}

    {viewingDoc&&(
      <DocumentViewerModal
        documentId={viewingDoc.id}
        documentTitle={viewingDoc.title}
        onClose={()=>setViewingDoc(null)}
        onDocumentUpdated={()=>{refetch();refetchDocs()}}
      />
    )}
  </motion.div>
}
