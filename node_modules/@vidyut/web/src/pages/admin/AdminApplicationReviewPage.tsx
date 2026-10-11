import{useState}from'react'
import{useParams,useNavigate}from'react-router-dom'
import{ArrowLeft,CheckCircle,XCircle,Clock,AlertCircle,ExternalLink,Shield,UserCheck}from'lucide-react'
import{useApi}from'@/hooks/useApi'
import{useMutation}from'@/hooks/useMutation'
import{api}from'@/api/client'
import{PageSpinner}from'@/components/ui/Spinner'
import{Card}from'@/components/ui/Card'
import{Button}from'@/components/ui/Button'
import{StatusBadge}from'@/components/ui/StatusBadge'
import{toast}from'@/components/ui/Toast'
import{DocumentViewerModal}from'@/components/ui/DocumentViewerModal'

export function AdminApplicationReviewPage(){
  const{id}=useParams()
  const navigate=useNavigate()
  const[note,setNote]=useState('')
  const[rejectionReason,setRejectionReason]=useState('')
  const[viewingDoc,setViewingDoc]=useState<{id:string;title:string}|null>(null)
  const[disburseModal,setDisburseModal]=useState<{installmentNo?:number;installmentId?:string;amount:number;name:string}|null>(null)
  const[disburseRef,setDisburseRef]=useState('')
  const[disburseNotes,setDisburseNotes]=useState('')

  const{data,isLoading,refetch}=useApi(()=>api.get<{application:any;studentProfile:any;familyInfo:any;academicRecords:any[]}>(`/admin/applications/${id}`),[id])
  
  const{mutate:review,isLoading:reviewing}=useMutation(async(status:string)=>{
    if(status==='REJECTED'&&!rejectionReason.trim()){
      toast('Please enter a rejection reason before rejecting','error')
      return
    }
    try{
      await api.patch(`/admin/applications/${id}/review`,{
        status,
        note:note.trim()||undefined,
        rejectionReason:rejectionReason.trim()||undefined
      })
      await refetch()
      toast(`Application status updated to ${status.replace(/_/g,' ').toLowerCase()}`,'success')
      setNote('')
      setRejectionReason('')
    }catch(err:unknown){
      toast(err,'error')
    }
  })

  const{mutate:recordDisbursement,isLoading:disbursing}=useMutation(async()=>{
    if(!disburseModal) return
    try{
      await api.post(`/admin/applications/${id}/disburse`,{
        installmentNo:disburseModal.installmentNo,
        installmentId:disburseModal.installmentId,
        amount:disburseModal.amount,
        referenceCode:disburseRef.trim()||undefined,
        notes:disburseNotes.trim()||undefined
      })
      await refetch()
      toast(`Disbursement of ₹${disburseModal.amount.toLocaleString('en-IN')} recorded successfully! 💸`,'success')
      setDisburseModal(null)
      setDisburseRef('')
      setDisburseNotes('')
    }catch(err:unknown){
      toast(err,'error')
    }
  })

  if(isLoading) return <PageSpinner/>
  if(!data?.application) return <div style={{padding:40,textAlign:'center',color:'#64748b'}}>Application not found.</div>

  const{application:app,studentProfile:sp,familyInfo:fi,academicRecords:ar}=data
  const isDraft=app.status==='DRAFT'

  return<div style={{maxWidth:920,margin:'0 auto'}}>
    <button 
      onClick={()=>navigate('/admin/applications')} 
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
      <ArrowLeft size={15}/> Back to Application Queue
    </button>

    {/* Header */}
    <Card style={{marginBottom:20,border:'1px solid #e2e8f0',padding:22}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,flexWrap:'wrap'}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
            <StatusBadge status={app.status}/>
            <span style={{fontSize:12,color:'#64748b'}}>Tracking ID: {app.id}</span>
          </div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#0f172a',marginBottom:4}}>{app.scholarship?.name}</h1>
          <p style={{fontSize:13,color:'#64748b'}}>Provider: {app.scholarship?.provider}</p>
        </div>

        <div style={{textAlign:'right',background:'#eff6ff',border:'1px solid #bfdbfe',padding:'10px 16px',borderRadius:10}}>
          <p style={{fontSize:11,fontWeight:700,color:'#1e40af',textTransform:'uppercase'}}>Candidate</p>
          <p style={{fontSize:15,fontWeight:700,color:'#1e3a8a'}}>{app.user?.fullName}</p>
          <p style={{fontSize:12,color:'#3b82f6'}}>{app.user?.email}</p>
        </div>
      </div>
    </Card>

    {/* Candidate Profile & Academics Grid */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(360px, 1fr))',gap:16,marginBottom:18}}>
      <Card style={{border:'1px solid #e2e8f0'}}>
        <h3 style={{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
          <UserCheck size={16} color="#1e40af"/> Student Profile & Family Info
        </h3>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {[
            ['Social Category',sp?.category],
            ['Date of Birth',sp?.dateOfBirth?new Date(sp.dateOfBirth).toLocaleDateString('en-IN'):null],
            ['Gender',sp?.gender],
            ['Domicile State',sp?.domicileState],
            ['Contact Phone',sp?.phone],
            ['Annual Family Income',fi?.annualFamilyIncome?`₹${fi.annualFamilyIncome.toLocaleString('en-IN')}`:null],
            ['Below Poverty Line (BPL)',fi?.isBPL?'Yes':'No'],
            ['Address',`${sp?.city??''}, ${sp?.state??''}`]
          ].map(([k,v])=>(
            <div key={k as string} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #f1f5f9',fontSize:12}}>
              <span style={{color:'#64748b'}}>{k}</span>
              <span style={{color:'#0f172a',fontWeight:600}}>{v??'—'}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{border:'1px solid #e2e8f0'}}>
        <h3 style={{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
          <Shield size={16} color="#1e40af"/> Academic Qualifications
        </h3>
        {ar.length===0?(
          <p style={{fontSize:13,color:'#64748b'}}>No academic qualifications registered.</p>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {ar.map((r:any)=>(
              <div key={r.id} style={{padding:10,background:'#f8fafc',borderRadius:8,border:'1px solid #e2e8f0'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
                  <p style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>{r.level.replace(/_/g,' ')}</p>
                  {r.percentage!=null&&<span style={{fontSize:12,fontWeight:700,color:'#059669'}}>{r.percentage}%</span>}
                  {r.cgpa!=null&&<span style={{fontSize:12,fontWeight:700,color:'#059669'}}>CGPA {r.cgpa}/{r.maxCgpa??10}</span>}
                </div>
                <p style={{fontSize:12,color:'#475569'}}>{r.institutionName}</p>
                {r.courseName&&<p style={{fontSize:11,color:'#64748b'}}>{r.courseName}{r.branch?` — ${r.branch}`:''}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>

    {/* Submitted Documents with File Preview Links */}
    <Card style={{marginBottom:18,border:'1px solid #e2e8f0'}}>
      <h3 style={{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:14}}>
        Submitted Application Credentials ({app.documents?.length??0})
      </h3>
      {!app.documents?.length?(
        <p style={{fontSize:13,color:'#64748b'}}>No documents attached to this application.</p>
      ):(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {app.documents.map((d:any)=>(
            <div key={d.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'#f8fafc',borderRadius:8,border:'1px solid #e2e8f0'}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <p style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>{d.document?.label}</p>
                  <StatusBadge status={d.document?.status}/>
                </div>
                <p style={{fontSize:11,color:'#64748b',marginTop:2}}>
                  {d.document?.fileName} · {(d.document?.fileSize/1024).toFixed(0)} KB
                </p>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:8}}>
                {d.document?.id&&(
                  <Button 
                    variant="outline" 
                    size="sm" 
                    leftIcon={<ExternalLink size={12}/>}
                    onClick={()=>setViewingDoc({id:d.document.id,title:`${d.document.label} - ${app.user?.fullName||'Applicant'}`})}
                  >
                    View Document
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>

    {/* Review Decision Section */}
    {!isDraft&&(
      <Card style={{border:'1px solid #e2e8f0',padding:22}}>
        <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:14}}>
          Officer Decision & Status Updates
        </h3>
        
        <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:16}}>
          <div>
            <label style={{fontSize:12,fontWeight:600,color:'#334155',display:'block',marginBottom:4}}>
              Reviewer Internal / Feedback Note
            </label>
            <textarea 
              value={note} 
              onChange={e=>setNote(e.target.value)} 
              rows={2} 
              placeholder="Provide constructive feedback or processing notes visible to candidate..."
              style={{width:'100%',background:'#ffffff',border:'1px solid #cbd5e1',borderRadius:8,padding:'10px 12px',color:'#0f172a',fontSize:13,outline:'none',fontFamily:'inherit'}}
            />
          </div>

          <div>
            <label style={{fontSize:12,fontWeight:600,color:'#991b1b',display:'block',marginBottom:4}}>
              Rejection Reason (Mandatory if marking REJECTED)
            </label>
            <textarea 
              value={rejectionReason} 
              onChange={e=>setRejectionReason(e.target.value)} 
              rows={2} 
              placeholder="State explicit grounds for rejection (e.g. Income exceeds eligibility threshold)..."
              style={{width:'100%',background:'#ffffff',border:'1px solid #cbd5e1',borderRadius:8,padding:'10px 12px',color:'#0f172a',fontSize:13,outline:'none',fontFamily:'inherit'}}
            />
          </div>
        </div>

        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          {app.status==='SUBMITTED'&&(
            <Button size="sm" variant="secondary" isLoading={reviewing} onClick={()=>review('DOCUMENTS_VERIFIED')} leftIcon={<CheckCircle size={14}/>}>
              Mark Documents Verified
            </Button>
          )}
          {['SUBMITTED','DOCUMENTS_VERIFIED'].includes(app.status)&&(
            <Button size="sm" isLoading={reviewing} onClick={()=>review('UNDER_REVIEW')} leftIcon={<Clock size={14}/>}>
              Mark Under Review
            </Button>
          )}
          {!['APPROVED','REJECTED'].includes(app.status)&&(
            <>
              <Button size="sm" variant="outline" isLoading={reviewing} onClick={()=>review('ADDITIONAL_INFO_REQUESTED')} leftIcon={<AlertCircle size={14}/>}>
                Request Additional Info
              </Button>
              <Button size="sm" isLoading={reviewing} onClick={()=>review('APPROVED')} leftIcon={<CheckCircle size={14}/>} style={{background:'#059669',color:'#ffffff'}}>
                Approve Application
              </Button>
              <Button size="sm" variant="danger" isLoading={reviewing} onClick={()=>review('REJECTED')} leftIcon={<XCircle size={14}/>}>
                Reject Application
              </Button>
            </>
          )}
        </div>
      </Card>
    )}

    {/* Fund Disbursement Management Card (Available for APPROVED applications) */}
    {app.status==='APPROVED'&&(
      <Card style={{marginBottom:20,border:'1px solid #bbf7d0',padding:22,background:'#ffffff'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12,marginBottom:16}}>
          <div>
            <h3 style={{fontSize:16,fontWeight:800,color:'#0f172a',margin:0,display:'flex',alignItems:'center',gap:8}}>
              <CheckCircle size={18} color="#059669"/>
              Scholarship Fund Disbursement (DBT)
            </h3>
            <p style={{fontSize:12,color:'#64748b',marginTop:3}}>
              Record direct benefit transfer payments or installment tranches.
            </p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:16,background:'#f8fafc',padding:'8px 16px',borderRadius:8,border:'1px solid #e2e8f0'}}>
            <div>
              <span style={{fontSize:11,color:'#64748b',fontWeight:600}}>TOTAL GRANT</span>
              <p style={{fontSize:16,fontWeight:800,color:'#0f172a',margin:0}}>₹{app.scholarship?.amount?.toLocaleString('en-IN')}</p>
            </div>
            <div style={{width:1,height:28,background:'#cbd5e1'}}/>
            <div>
              <span style={{fontSize:11,color:'#166534',fontWeight:600}}>DISBURSED</span>
              <p style={{fontSize:16,fontWeight:800,color:'#15803d',margin:0}}>₹{(app.disbursedAmount||0).toLocaleString('en-IN')}</p>
            </div>
            <div style={{width:1,height:28,background:'#cbd5e1'}}/>
            <div>
              <span style={{fontSize:11,color:'#b45309',fontWeight:600}}>REMAINING</span>
              <p style={{fontSize:16,fontWeight:800,color:'#b45309',margin:0}}>
                ₹{Math.max(0,(app.scholarship?.amount||0)-(app.disbursedAmount||0)).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Installment breakdown or single grant */}
        {app.scholarship?.installments&&app.scholarship.installments.length>0?(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {app.scholarship.installments.map((inst:any)=>{
              const match=(app.disbursements||[]).find((d:any)=>d.installmentNo===inst.installmentNo||d.installmentId===inst.id)
              const isPaid=!!match&&match.status==='DISBURSED'

              return(
                <div key={inst.id||inst.installmentNo} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:isPaid?'#f0fdf4':'#f8fafc',borderRadius:8,border:isPaid?'1px solid #bbf7d0':'1px solid #e2e8f0',flexWrap:'wrap',gap:12}}>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <p style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>
                        Installment {inst.installmentNo}: {inst.name||`Tranche ${inst.installmentNo}`}
                      </p>
                      <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:6,background:isPaid?'#dcfce7':'#fef3c7',color:isPaid?'#166534':'#92400e'}}>
                        {isPaid?'DISBURSED':'PENDING'}
                      </span>
                    </div>
                    <p style={{fontSize:12,color:'#64748b',marginTop:2}}>
                      Amount: <strong>₹{inst.amount.toLocaleString('en-IN')}</strong> {inst.description?`· ${inst.description}`:''}
                    </p>
                    {isPaid&&match.referenceCode&&(
                      <p style={{fontSize:11,color:'#166534',fontWeight:600,marginTop:4}}>
                        ✓ Paid on {new Date(match.disbursedAt||match.createdAt).toLocaleDateString('en-IN')} · Ref: {match.referenceCode} {match.notes?`· Note: ${match.notes}`:''}
                      </p>
                    )}
                  </div>

                  <div>
                    {!isPaid?(
                      <Button
                        size="sm"
                        onClick={()=>{
                          setDisburseModal({
                            installmentNo:inst.installmentNo,
                            installmentId:inst.id,
                            amount:inst.amount,
                            name:`Installment ${inst.installmentNo}: ${inst.name||'Grant'}`
                          })
                          setDisburseRef(`DBT-${new Date().getFullYear()}-${Math.floor(100000+Math.random()*900000)}`)
                        }}
                        style={{background:'#059669',color:'#ffffff'}}
                      >
                        Disburse Installment
                      </Button>
                    ):(
                      <span style={{fontSize:12,color:'#166534',fontWeight:600}}>
                        Payment Complete
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ):(
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',background:(app.disbursedAmount||0)>0?'#f0fdf4':'#f8fafc',borderRadius:8,border:'1px solid #e2e8f0',flexWrap:'wrap',gap:12}}>
            <div>
              <p style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>One-Time Grant Transfer</p>
              <p style={{fontSize:12,color:'#64748b',marginTop:2}}>
                {(app.disbursedAmount||0)>0?`Paid on ${new Date(app.disbursementDate||app.updatedAt).toLocaleDateString('en-IN')}`:'No installments defined; scholarship is disbursed in a single transfer.'}
              </p>
            </div>
            <div>
              {(app.disbursedAmount||0)===0?(
                <Button
                  size="sm"
                  onClick={()=>{
                    setDisburseModal({
                      amount:app.scholarship?.amount||0,
                      name:'Full Scholarship Grant'
                    })
                    setDisburseRef(`DBT-${new Date().getFullYear()}-${Math.floor(100000+Math.random()*900000)}`)
                  }}
                  style={{background:'#059669',color:'#ffffff'}}
                >
                  Disburse Total Amount
                </Button>
              ):(
                <span style={{fontSize:12,color:'#166534',fontWeight:700}}>
                  ✓ Fully Disbursed
                </span>
              )}
            </div>
          </div>
        )}
      </Card>
    )}

    {/* Disburse Confirmation Modal */}
    {disburseModal&&(
      <div
        style={{
          position:'fixed',
          inset:0,
          backgroundColor:'rgba(15, 23, 42, 0.65)',
          backdropFilter:'blur(4px)',
          zIndex:9999,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          padding:16
        }}
        onClick={()=>setDisburseModal(null)}
      >
        <div
          style={{
            backgroundColor:'#ffffff',
            borderRadius:16,
            boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width:'100%',
            maxWidth:480,
            padding:24,
            border:'1px solid #e2e8f0'
          }}
          onClick={e=>e.stopPropagation()}
        >
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
            <div style={{width:38,height:38,borderRadius:10,background:'#ecfdf5',display:'flex',alignItems:'center',justifyContent:'center',color:'#059669'}}>
              <CheckCircle size={22}/>
            </div>
            <div>
              <h3 style={{fontSize:16,fontWeight:800,color:'#0f172a',margin:0}}>
                Record Fund Disbursement
              </h3>
              <p style={{fontSize:12,color:'#64748b',margin:'2px 0 0'}}>
                Candidate: {app.user?.fullName}
              </p>
            </div>
          </div>

          <div style={{background:'#f8fafc',padding:14,borderRadius:8,border:'1px solid #e2e8f0',marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:13,color:'#64748b'}}>Target Grant:</span>
              <span style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>{disburseModal.name}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:13,color:'#64748b'}}>Payout Amount:</span>
              <span style={{fontSize:16,fontWeight:800,color:'#15803d'}}>₹{disburseModal.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:20}}>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#334155',display:'block',marginBottom:4}}>
                Transaction / DBT Reference Code
              </label>
              <input
                value={disburseRef}
                onChange={e=>setDisburseRef(e.target.value)}
                placeholder="e.g. DBT-2026-948102"
                style={{width:'100%',height:38,padding:'0 12px',background:'#ffffff',border:'1px solid #cbd5e1',borderRadius:8,color:'#0f172a',fontSize:13,outline:'none',fontFamily:'inherit'}}
              />
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#334155',display:'block',marginBottom:4}}>
                Audit Note / Bank Advice Details
              </label>
              <input
                value={disburseNotes}
                onChange={e=>setDisburseNotes(e.target.value)}
                placeholder="e.g. NEFT transfer processed via Treasury Account"
                style={{width:'100%',height:38,padding:'0 12px',background:'#ffffff',border:'1px solid #cbd5e1',borderRadius:8,color:'#0f172a',fontSize:13,outline:'none',fontFamily:'inherit'}}
              />
            </div>
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
            <Button variant="ghost" onClick={()=>setDisburseModal(null)}>
              Cancel
            </Button>
            <Button
              isLoading={disbursing}
              onClick={()=>recordDisbursement()}
              style={{background:'#059669',color:'#ffffff'}}
            >
              Confirm & Disburse Funds
            </Button>
          </div>
        </div>
      </div>
    )}


    {viewingDoc&&(
      <DocumentViewerModal
        documentId={viewingDoc.id}
        documentTitle={viewingDoc.title}
        onClose={()=>setViewingDoc(null)}
      />
    )}
  </div>
}
