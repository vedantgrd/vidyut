import{useState,useRef,useEffect}from'react'
import{useNavigate}from'react-router-dom'
import{Upload,CheckCircle,ArrowLeft,FileText,ShieldCheck}from'lucide-react'
import{api}from'@/api/client'
import{Button}from'@/components/ui/Button'
import{toast}from'@/components/ui/Toast'
import{useAuthStore}from'@/store/authStore'
import{PageSpinner}from'@/components/ui/Spinner'

const DOCS=[
  {type:'AADHAAR',label:'Aadhaar Card',desc:'Upload clear copy of your Aadhaar card (identity proof)',required:true},
  {type:'TENTH_MARKSHEET',label:'Class 10 Marksheet',desc:'Marksheet / Passing certificate for age and academic verification',required:true},
  {type:'INCOME_CERTIFICATE',label:'Income Certificate',desc:'Competent authority certificate (Tahsildar/SDM/Revenue Officer)',required:false},
  {type:'PHOTOGRAPH',label:'Passport Size Photo',desc:'Recent colored photograph with light background',required:false}
]

export function DocumentsPage(){
  const[uploaded,setUploaded]=useState<Record<string,boolean>>({})
  const[uploading,setUploading]=useState<Record<string,boolean>>({})
  const[completing,setCompleting]=useState(false)
  const[loadingExisting,setLoadingExisting]=useState(true)

  const refs=useRef<Record<string,HTMLInputElement|null>>({})
  const navigate=useNavigate()
  const{updateUser}=useAuthStore()

  useEffect(()=>{
    async function checkExistingDocs(){
      try{
        const docs=await api.get<Array<{type:string}>>('/documents')
        if(Array.isArray(docs)){
          const map:Record<string,boolean>={}
          docs.forEach(d=>{map[d.type]=true})
          setUploaded(map)
        }
      }catch{
        // ignore
      }finally{
        setLoadingExisting(false)
      }
    }
    checkExistingDocs()
  },[])

  const handleUpload=async(type:string,label:string,file:File)=>{
    setUploading(p=>({...p,[type]:true}))
    try{
      const fd=new FormData()
      fd.append('file',file)
      fd.append('type',type)
      fd.append('label',label)
      // replace=true allows easy re-upload during onboarding
      await api.upload('/documents/upload?replace=true',fd)
      setUploaded(p=>({...p,[type]:true}))
      toast(`${label} uploaded and securely stored in your Vault!`,'success')
    }catch(e:unknown){
      toast(e,'error')
    }finally{
      setUploading(p=>({...p,[type]:false}))
    }
  }

  const handleComplete=async()=>{
    if(!uploaded['AADHAAR']||!uploaded['TENTH_MARKSHEET']){
      toast('Please upload both Aadhaar and Class 10 marksheet to complete onboarding','error')
      return
    }
    setCompleting(true)
    try{
      await api.post('/onboarding/complete')
      updateUser({onboardingComplete:true,onboardingStep:5})
      toast('Profile fully setup! Discovering matched scholarships...','success')
      navigate('/dashboard/scholarships')
    }catch(e:unknown){
      toast(e,'error')
    }finally{
      setCompleting(false)
    }
  }

  if(loadingExisting) return <PageSpinner/>

  return<div>
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
      <div style={{width:32,height:32,borderRadius:8,background:'#eff6ff',color:'#1e40af',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <ShieldCheck size={18}/>
      </div>
      <h2 style={{fontSize:24,fontWeight:800,color:'#0f172a'}}>Student Document Vault</h2>
    </div>
    <p style={{color:'#64748b',marginBottom:24,fontSize:13}}>
      Upload documents once. Vidyut securely links them to your applications so you never have to re-upload them again.
    </p>

    <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:24}}>
      {DOCS.map(doc=>(
        <div 
          key={doc.type} 
          style={{
            display:'flex',
            alignItems:'center',
            gap:16,
            padding:16,
            background:'#ffffff',
            border:uploaded[doc.type]?'1px solid #bbf7d0':'1px solid #e2e8f0',
            borderRadius:12,
            boxShadow:'0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <div 
            style={{
              width:44,
              height:44,
              borderRadius:10,
              background:uploaded[doc.type]?'#ecfdf5':'#f8fafc',
              border:uploaded[doc.type]?'1px solid #a7f3d0':'1px solid #e2e8f0',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              flexShrink:0
            }}
          >
            {uploaded[doc.type]?(
              <CheckCircle size={22} color="#059669"/>
            ):(
              <FileText size={22} color="#64748b"/>
            )}
          </div>

          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <p style={{fontWeight:600,fontSize:14,color:'#0f172a'}}>{doc.label}</p>
              {doc.required&&(
                <span style={{fontSize:11,color:'#dc2626',background:'#fee2e2',fontWeight:600,padding:'1px 8px',borderRadius:6}}>
                  Required
                </span>
              )}
              {uploaded[doc.type]&&(
                <span style={{fontSize:11,color:'#059669',background:'#d1fae5',fontWeight:600,padding:'1px 8px',borderRadius:6}}>
                  ✓ Stored in Vault
                </span>
              )}
            </div>
            <p style={{fontSize:12,color:'#64748b',marginTop:3}}>{doc.desc}</p>
          </div>

          <input 
            ref={el=>{refs.current[doc.type]=el}} 
            type="file" 
            accept=".jpg,.jpeg,.png,.webp,.pdf" 
            style={{display:'none'}} 
            onChange={e=>{
              const f=e.target.files?.[0]
              if(f) handleUpload(doc.type,doc.label,f)
            }}
          />
          <Button 
            variant={uploaded[doc.type]?'secondary':'outline'} 
            size="sm" 
            isLoading={uploading[doc.type]} 
            onClick={()=>refs.current[doc.type]?.click()} 
            leftIcon={uploaded[doc.type]?<CheckCircle size={14}/>:<Upload size={14}/>}
          >
            {uploaded[doc.type]?'Replace':'Upload'}
          </Button>
        </div>
      ))}
    </div>

    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <Button variant="ghost" onClick={()=>navigate('/onboarding/family')} leftIcon={<ArrowLeft size={15}/>}>
        Back
      </Button>
      <Button 
        isLoading={completing} 
        disabled={!uploaded['AADHAAR']||!uploaded['TENTH_MARKSHEET']} 
        onClick={handleComplete}
      >
        Complete Profile & Discover Scholarships
      </Button>
    </div>
  </div>
}
