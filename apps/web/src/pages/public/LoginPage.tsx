import{useState}from'react'
import{Link,useNavigate}from'react-router-dom'
import{Mail,Lock,Eye,EyeOff,ShieldCheck}from'lucide-react'
import{useAuthStore}from'@/store/authStore'
import{Button}from'@/components/ui/Button'
import{Input}from'@/components/ui/Input'
import{toast}from'@/components/ui/Toast'
import{Card}from'@/components/ui/Card'

export function LoginPage(){
  const[email,setEmail]=useState('')
  const[pw,setPw]=useState('')
  const[showPw,setShowPw]=useState(false)
  const[errors,setErrors]=useState<Record<string,string>>({})
  const{login,isLoading}=useAuthStore()
  const navigate=useNavigate()

  const validate=()=>{
    const e:Record<string,string>={}
    if(!email)e.email='Email is required'
    if(!pw)e.pw='Password is required'
    setErrors(e)
    return!Object.keys(e).length
  }

  const handleSubmit=async(ev:React.FormEvent)=>{
    ev.preventDefault()
    if(!validate())return
    try{
      await login(email,pw)
      const user=useAuthStore.getState().user
      if(user?.role==='ADMIN'||user?.role==='REVIEWER')navigate('/admin')
      else if(user?.onboardingComplete)navigate('/dashboard')
      else{
        const steps=['personal','academic','family','documents']
        navigate('/onboarding/'+(steps[(user?.onboardingStep??1)-1]??'personal'))
      }
    }catch(e:unknown){
      toast(e,'error')
    }
  }

  const setDemo=(e:string,p:string)=>{
    setEmail(e)
    setPw(p)
  }

  return<Card style={{padding:'32px 36px',border:'1px solid #e2e8f0',background:'#ffffff'}}>
    <div style={{marginBottom:28,textAlign:'center'}}>
      <h1 style={{fontSize:24,fontWeight:800,color:'#0f172a',marginBottom:6}}>Sign in to Vidyut</h1>
      <p style={{color:'#64748b',fontSize:13}}>Manage your scholarships, vault, and applications</p>
    </div>

    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
      <Input label="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@example.com" error={errors.email} leftIcon={<Mail size={15}/>} autoComplete="email"/>
      <Input label="Password" type={showPw?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} placeholder="Enter your password" error={errors.pw} leftIcon={<Lock size={15}/>} autoComplete="current-password"
        rightElement={<button type="button" onClick={()=>setShowPw(!showPw)} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex'}}>{showPw?<EyeOff size={15}/>:<Eye size={15}/>}</button>}/>
      <div style={{display:'flex',justifyContent:'flex-end'}}>
        <Link to="/forgot-password" style={{fontSize:12,color:'#1e40af',fontWeight:500}}>Forgot password?</Link>
      </div>
      <Button type="submit" isLoading={isLoading} size="md" style={{marginTop:4,width:'100%'}}>Sign In</Button>
    </form>

    <p style={{textAlign:'center',marginTop:20,fontSize:13,color:'#64748b'}}>
      New student? <Link to="/signup" style={{color:'#1e40af',fontWeight:600}}>Create account</Link>
    </p>

    <div style={{marginTop:24,padding:14,background:'#f8fafc',borderRadius:8,border:'1px solid #e2e8f0'}}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
        <ShieldCheck size={14} color="#1e40af"/>
        <p style={{fontSize:11,fontWeight:700,color:'#0f172a',textTransform:'uppercase',letterSpacing:'0.04em'}}>Quick Demo Access</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        <button type="button" onClick={()=>setDemo('demo@vidyut.in','Demo@1234')} style={{
          background:'#ffffff',border:'1px solid #cbd5e1',borderRadius:6,padding:'6px 10px',textAlign:'left',cursor:'pointer',fontSize:12,display:'flex',justifyContent:'space-between'
        }}>
          <span>Student: <strong style={{color:'#1e40af'}}>demo@vidyut.in</strong></span>
          <span style={{color:'#64748b'}}>Use Login →</span>
        </button>
        <button type="button" onClick={()=>setDemo('admin@vidyut.in','Admin@1234')} style={{
          background:'#ffffff',border:'1px solid #cbd5e1',borderRadius:6,padding:'6px 10px',textAlign:'left',cursor:'pointer',fontSize:12,display:'flex',justifyContent:'space-between'
        }}>
          <span>Admin: <strong style={{color:'#b45309'}}>admin@vidyut.in</strong></span>
          <span style={{color:'#64748b'}}>Use Login →</span>
        </button>
      </div>
    </div>
  </Card>
}
