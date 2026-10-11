import{useState}from'react'
import{Link,useNavigate}from'react-router-dom'
import{User,Mail,Lock,Eye,EyeOff,Check}from'lucide-react'
import{useAuthStore}from'@/store/authStore'
import{Button}from'@/components/ui/Button'
import{Input}from'@/components/ui/Input'
import{toast}from'@/components/ui/Toast'
import{Card}from'@/components/ui/Card'

export function SignupPage(){
  const[form,setForm]=useState({fullName:'',email:'',password:'',confirmPassword:''})
  const[showPw,setShowPw]=useState(false),{signup,isLoading}=useAuthStore(),navigate=useNavigate()
  const[errors,setErrors]=useState<Record<string,string>>({})

  const set=(k:string)=>(e:React.ChangeEvent<HTMLInputElement>)=>setForm(p=>({...p,[k]:e.target.value}))

  const validate=()=>{
    const e:Record<string,string>={}
    if(!form.fullName.trim())e.fullName='Full name is required'
    if(!form.email.trim())e.email='Email is required'
    if(form.password.length<8)e.password='At least 8 characters required'
    if(!/[A-Z]/.test(form.password)||!/[0-9]/.test(form.password)||!/[\W_]/.test(form.password)){
      e.password='Include uppercase, number and special character (e.g. Student@1234)'
    }
    if(form.password!==form.confirmPassword)e.confirmPassword="Passwords do not match"
    setErrors(e)
    return!Object.keys(e).length
  }

  const handleSubmit=async(ev:React.FormEvent)=>{
    ev.preventDefault()
    if(!validate())return
    try{
      await signup(form.fullName.trim(),form.email.trim(),form.password,form.confirmPassword)
      toast('Account created! Welcome to Vidyut.','success')
      navigate('/onboarding/personal')
    }catch(err:unknown){
      toast(err,'error')
    }
  }

  return<Card style={{padding:'32px 36px',border:'1px solid #e2e8f0',background:'#ffffff'}}>
    <div style={{marginBottom:24,textAlign:'center'}}>
      <h1 style={{fontSize:24,fontWeight:800,color:'#0f172a',marginBottom:6}}>Create Your Vidyut Profile</h1>
      <p style={{color:'#64748b',fontSize:13}}>Tell Vidyut once. Apply to scholarships everywhere.</p>
    </div>

    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
      <Input label="Full Name (as per government records)" value={form.fullName} onChange={set('fullName')} placeholder="e.g. Rahul Sharma" error={errors.fullName} leftIcon={<User size={15}/>}/>
      <Input label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="rahul@example.com" error={errors.email} leftIcon={<Mail size={15}/>}/>
      <Input label="Password" type={showPw?'text':'password'} value={form.password} onChange={set('password')} placeholder="Min 8 chars with uppercase, number & symbol" error={errors.password} leftIcon={<Lock size={15}/>}
        rightElement={<button type="button" onClick={()=>setShowPw(!showPw)} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex'}}>{showPw?<EyeOff size={15}/>:<Eye size={15}/>}</button>}/>
      <Input label="Confirm Password" type={showPw?'text':'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat your password" error={errors.confirmPassword} leftIcon={<Lock size={15}/>}/>
      
      <div style={{background:'#f8fafc',padding:'10px 12px',borderRadius:6,border:'1px solid #e2e8f0',fontSize:12,color:'#475569'}}>
        <p style={{display:'flex',alignItems:'center',gap:6,fontWeight:500,color:'#059669',marginBottom:2}}>
          <Check size={14}/> Student Data Privacy Guaranteed
        </p>
        <p style={{fontSize:11,color:'#64748b'}}>Your records & documents are encrypted and only shared with approved scholarship providers upon your submission.</p>
      </div>

      <Button type="submit" isLoading={isLoading} size="md" style={{marginTop:6,width:'100%'}}>Create Free Account</Button>
    </form>

    <p style={{textAlign:'center',marginTop:20,fontSize:13,color:'#64748b'}}>
      Already have an account? <Link to="/login" style={{color:'#1e40af',fontWeight:600}}>Sign in</Link>
    </p>
  </Card>
}
