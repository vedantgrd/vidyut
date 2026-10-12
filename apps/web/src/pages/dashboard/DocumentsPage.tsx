import{useRef,useState}from'react'
import{motion}from'framer-motion'
import{Upload,FileText,Trash2,CheckCircle,Clock,XCircle,AlertCircle,ExternalLink,Shield,AlertTriangle}from'lucide-react'
import{useApi}from'@/hooks/useApi'
import{useMutation}from'@/hooks/useMutation'
import{api}from'@/api/client'
import type{Document}from'@/types'
import{PageSpinner}from'@/components/ui/Spinner'
import{Card}from'@/components/ui/Card'
import{Button}from'@/components/ui/Button'
import{StatusBadge}from'@/components/ui/StatusBadge'
import{Empty}from'@/components/ui/Empty'
import{toast}from'@/components/ui/Toast'
import{Select}from'@/components/ui/Select'
import{DocumentViewerModal}from'@/components/ui/DocumentViewerModal'

const DOC_TYPES=[
  {value:'AADHAAR',label:'Aadhaar Card'},
  {value:'PAN',label:'PAN Card'},
  {value:'INCOME_CERTIFICATE',label:'Income Certificate'},
  {value:'CASTE_CERTIFICATE',label:'Caste Certificate'},
  {value:'DOMICILE_CERTIFICATE',label:'Domicile Certificate'},
  {value:'TENTH_MARKSHEET',label:'Class 10 Marksheet'},
  {value:'TWELFTH_MARKSHEET',label:'Class 12 Marksheet'},
  {value:'DIPLOMA_MARKSHEET',label:'Diploma Marksheet'},
  {value:'DEGREE_CERTIFICATE',label:'Degree Certificate'},
  {value:'TRANSCRIPT',label:'Academic Transcript'},
  {value:'DISABILITY_CERTIFICATE',label:'Disability Certificate'},
  {value:'BANK_PASSBOOK',label:'Bank Passbook'},
  {value:'PHOTOGRAPH',label:'Passport Photo'},
  {value:'COLLEGE_ID',label:'College ID / Bonafide'},
  {value:'OTHER',label:'Other'}
]

const SI:Record<string,React.ReactNode>={
  VERIFIED:<CheckCircle size={18} color="#059669"/>,
  PENDING:<Clock size={18} color="#d97706"/>,
  REJECTED:<XCircle size={18} color="#dc2626"/>,
  EXPIRED:<AlertCircle size={18} color="#64748b"/>
}

export function DocumentsPage(){
  const[uploadType,setUploadType]=useState('')
  const[uploading,setUploading]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)
  
  // State for handling 409 duplicate conflict
  const[duplicatePending,setDuplicatePending]=useState<{file:File;type:string;label:string}|null>(null)
  const[viewingDoc,setViewingDoc]=useState<{id:string;title:string}|null>(null)

  const{data,isLoading,refetch}=useApi(()=>api.get<{documents:Document[]}>('/documents'))
  
  const{mutate:deleteDoc}=useMutation(async(id:string)=>{
    if(!window.confirm('Are you sure you want to remove this document from your vault?')) return
    await api.delete(`/documents/${id}`)
    await refetch()
    toast('Document removed from vault','info')
  })

  const uploadFile=async(file:File,type:string,replace=false)=>{
    setUploading(true)
    try{
      const label=DOC_TYPES.find(d=>d.value===type)?.label??type
      const fd=new FormData()
      fd.append('file',file)
      fd.append('type',type)
      fd.append('label',label)
      const url=replace?'/documents/upload?replace=true':'/documents/upload'
      await api.upload(url,fd)
      await refetch()
      toast(replace?`${label} replaced successfully!`:`${label} uploaded to vault!`,'success')
      setUploadType('')
      setDuplicatePending(null)
    }catch(e:any){
      // Check if duplicate document conflict
      const errMsg=e?.message||''
      if(errMsg.includes('DUPLICATE_DOCUMENT')||errMsg.toLowerCase().includes('already uploaded')){
        const label=DOC_TYPES.find(d=>d.value===type)?.label??type
        setDuplicatePending({file,type,label})
      }else{
        toast(e,'error')
      }
    }finally{
      setUploading(false)
    }
  }

  const handleInitialUpload=(file:File)=>{
    if(!uploadType){
      toast('Please select a document type first','error')
      return
    }
    uploadFile(file,uploadType,false)
  }

  const docs=data?.documents??[]

  return<div style={{maxWidth:960,margin:'0 auto'}}>
    <div style={{marginBottom:24}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
        <div style={{width:34,height:34,borderRadius:8,background:'#eff6ff',color:'#1e40af',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Shield size={20}/>
        </div>
        <h1 style={{fontSize:26,fontWeight:800,color:'#0f172a'}}>Student Document Vault</h1>
      </div>
      <p style={{color:'#64748b',fontSize:14}}>
        Upload once, reuse across all applications. Vidyut encrypts and stores your verified credentials.
      </p>
    </div>

    {/* Duplicate Document Resolution Modal / Alert */}
    {duplicatePending&&(
      <div style={{
        background:'#fffbeb',
        border:'1px solid #fde68a',
        borderRadius:12,
        padding:18,
        marginBottom:20,
        boxShadow:'0 2px 4px rgba(0,0,0,0.04)'
      }}>
        <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
          <AlertTriangle size={22} color="#d97706" style={{flexShrink:0,marginTop:2}}/>
          <div style={{flex:1}}>
            <h4 style={{fontSize:14,fontWeight:700,color:'#92400e',marginBottom:4}}>
              {duplicatePending.label} Already Exists in Vault
            </h4>
            <p style={{fontSize:13,color:'#b45309',marginBottom:12}}>
              You already have a document registered under "{duplicatePending.label}". Would you like to replace the existing file with "{duplicatePending.file.name}", or keep your current version?
            </p>
            <div style={{display:'flex',gap:10}}>
              <Button 
                size="sm" 
                isLoading={uploading} 
                onClick={()=>uploadFile(duplicatePending.file,duplicatePending.type,true)}
              >
                Replace Existing File
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={()=>{setDuplicatePending(null);setUploadType('')}}
              >
                Keep Current File
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Upload New Document Card */}
    <Card style={{marginBottom:24,border:'1px solid #e2e8f0'}}>
      <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:14}}>
        Add Document to Vault
      </h3>
      <div style={{display:'flex',gap:12,alignItems:'flex-end'}}>
        <div style={{flex:1}}>
          <Select 
            label="Select Document Type" 
            options={DOC_TYPES} 
            placeholder="e.g. Income Certificate, Marksheet..." 
            value={uploadType} 
            onChange={e=>setUploadType(e.target.value)}
          />
        </div>
        <input 
          ref={fileRef} 
          type="file" 
          accept=".jpg,.jpeg,.png,.webp,.pdf" 
          style={{display:'none'}} 
          onChange={e=>{
            const f=e.target.files?.[0]
            if(f) handleInitialUpload(f)
            if(e.target) e.target.value=''
          }}
        />
        <Button 
          isLoading={uploading} 
          disabled={!uploadType} 
          onClick={()=>fileRef.current?.click()} 
          leftIcon={<Upload size={14}/>} 
          style={{height:40}}
        >
          Choose & Upload File
        </Button>
      </div>
      <p style={{fontSize:12,color:'#64748b',marginTop:10}}>
        Accepted formats: PDF, JPEG, PNG, WebP · Max size: 5MB
      </p>
    </Card>

    {/* Document List */}
    {isLoading?<PageSpinner/>:docs.length===0?(
      <Empty 
        icon={<FileText size={28}/>} 
        title="Your Document Vault is empty" 
        description="Upload essential documents like Aadhaar, Class 10 Marksheet, and Income Certificate so they can be instantly attached to scholarship applications."
      />
    ):(
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
          <h3 style={{fontSize:14,fontWeight:700,color:'#475569'}}>
            STORED CREDENTIALS ({docs.length})
          </h3>
        </div>

        {docs.map((doc,i)=>(
          <motion.div key={doc.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}>
            <Card style={{padding:'16px 20px',border:'1px solid #e2e8f0'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
                <div style={{display:'flex',alignItems:'center',gap:14}}>
                  <div style={{
                    width:42,
                    height:42,
                    borderRadius:10,
                    background:doc.status==='VERIFIED'?'#ecfdf5':doc.status==='REJECTED'?'#fef2f2':'#f8fafc',
                    border:doc.status==='VERIFIED'?'1px solid #a7f3d0':doc.status==='REJECTED'?'1px solid #fecaca':'1px solid #e2e8f0',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center'
                  }}>
                    {SI[doc.status]??<FileText size={18} color="#64748b"/>}
                  </div>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <p style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>{doc.label}</p>
                      <StatusBadge status={doc.status}/>
                    </div>
                    <p style={{fontSize:12,color:'#64748b',marginTop:2}}>
                      {doc.fileName} · {(doc.fileSize/1024).toFixed(0)} KB · Uploaded {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                    </p>
                    {doc.rejectionReason&&(
                      <div style={{marginTop:6,display:'inline-flex',alignItems:'center',gap:6,background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',padding:'2px 8px',borderRadius:6,fontSize:12,fontWeight:500}}>
                        <AlertCircle size={12}/> Rejection reason: {doc.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  {/* Authenticated File preview / download button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    leftIcon={<ExternalLink size={13}/>}
                    onClick={()=>setViewingDoc({id:doc.id,title:doc.label})}
                  >
                    Preview / Download
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={()=>deleteDoc(doc.id)} 
                    leftIcon={<Trash2 size={13}/>} 
                    style={{color:'#dc2626'}}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
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
