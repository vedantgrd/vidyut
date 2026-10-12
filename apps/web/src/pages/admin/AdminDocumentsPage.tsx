import{useState}from'react'
import{useApi}from'@/hooks/useApi'
import{api}from'@/api/client'
import{PageSpinner}from'@/components/ui/Spinner'
import{Card}from'@/components/ui/Card'
import{Button}from'@/components/ui/Button'
import{StatusBadge}from'@/components/ui/StatusBadge'
import{Empty}from'@/components/ui/Empty'
import{FolderCheck,CheckCircle,XCircle,ExternalLink,ShieldCheck}from'lucide-react'
import{toast}from'@/components/ui/Toast'
import{DocumentViewerModal}from'@/components/ui/DocumentViewerModal'

export function AdminDocumentsPage(){
  const{data,isLoading,refetch}=useApi(()=>api.get<{documents:any[]}>('/documents/admin/pending'))
  const[rejecting,setRejecting]=useState<string|null>(null)
  const[reason,setReason]=useState('')
  const[viewingDoc,setViewingDoc]=useState<{id:string;title:string}|null>(null)

  const verify=async(id:string,status:'VERIFIED'|'REJECTED',rejectionReason?:string)=>{
    if(status==='REJECTED'&&!rejectionReason?.trim()){
      toast('Please enter a rejection reason','error')
      return
    }
    try{
      await api.patch(`/documents/admin/${id}/verify`,{status,rejectionReason})
      await refetch()
      toast(status==='VERIFIED'?'Document marked VERIFIED!':'Document marked REJECTED','success')
      setRejecting(null)
      setReason('')
    }catch(e:unknown){
      toast(e,'error')
    }
  }

  return<div style={{maxWidth:920,margin:'0 auto'}}>
    <div style={{marginBottom:24,display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
          <div style={{width:32,height:32,borderRadius:8,background:'#eff6ff',color:'#1e40af',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <FolderCheck size={18}/>
          </div>
          <h1 style={{fontSize:24,fontWeight:800,color:'#0f172a'}}>Pending Document Verification Queue</h1>
        </div>
        <p style={{color:'#64748b',fontSize:14}}>
          Review student uploads across Aadhaar, 10th marksheet, income certificates, and bonafide records.
        </p>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6,background:'#f0fdf4',border:'1px solid #bbf7d0',padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,color:'#166534'}}>
        <ShieldCheck size={16}/> Admin Trust Authority
      </div>
    </div>

    {isLoading?<PageSpinner/>:!data?.documents.length?(
      <Empty icon={<FolderCheck size={28}/>} title="No documents pending verification" description="All uploaded candidate credentials have been audited."/>
    ):(
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {data.documents.map((doc:any)=>(
          <Card key={doc.id} style={{padding:'16px 20px',border:'1px solid #e2e8f0'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                  <p style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>{doc.label}</p>
                  <StatusBadge status={doc.status}/>
                </div>
                <p style={{fontSize:13,color:'#334155',fontWeight:500}}>
                  Candidate: <strong>{doc.user?.fullName}</strong> ({doc.user?.email})
                </p>
                <p style={{fontSize:12,color:'#64748b',marginTop:2}}>
                  File: {doc.fileName} · {(doc.fileSize/1024).toFixed(0)} KB · Uploaded {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<ExternalLink size={13}/>}
                  onClick={()=>setViewingDoc({id:doc.id,title:`${doc.label} - ${doc.user?.fullName||'Student'}`})}
                >
                  Inspect File
                </Button>
                <Button size="sm" onClick={()=>verify(doc.id,'VERIFIED')} leftIcon={<CheckCircle size={13}/>} style={{background:'#059669',color:'#ffffff'}}>
                  Verify & Approve
                </Button>
                <Button size="sm" variant="danger" onClick={()=>setRejecting(doc.id)} leftIcon={<XCircle size={13}/>}>
                  Reject
                </Button>
              </div>
            </div>

            {rejecting===doc.id&&(
              <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid #f1f5f9',display:'flex',gap:10,alignItems:'flex-end'}}>
                <div style={{flex:1}}>
                  <label style={{fontSize:12,fontWeight:600,color:'#991b1b',display:'block',marginBottom:4}}>
                    Rejection reason (visible to student)
                  </label>
                  <input 
                    value={reason} 
                    onChange={e=>setReason(e.target.value)} 
                    placeholder="e.g. Document image is blurred or expired" 
                    style={{width:'100%',height:38,padding:'0 12px',background:'#ffffff',border:'1px solid #fca5a5',borderRadius:8,color:'#0f172a',fontSize:13,outline:'none',fontFamily:'inherit'}}
                  />
                </div>
                <Button size="sm" variant="danger" onClick={()=>verify(doc.id,'REJECTED',reason)}>
                  Confirm Rejection
                </Button>
                <Button size="sm" variant="ghost" onClick={()=>setRejecting(null)}>
                  Cancel
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    )}

    {viewingDoc&&(
      <DocumentViewerModal
        documentId={viewingDoc.id}
        documentTitle={viewingDoc.title}
        onClose={()=>setViewingDoc(null)}
        onDocumentUpdated={refetch}
      />
    )}
  </div>
}
