import{useState}from'react'
import{Link}from'react-router-dom'
import{Mail,ArrowLeft}from'lucide-react'
import{api}from'@/api/client'
import{Button}from'@/components/ui/Button'
import{Input}from'@/components/ui/Input'
export function ForgotPasswordPage(){
  const[email,setEmail]=useState(''),[sent,setSent]=useState(false),[loading,setLoading]=useState(false)
  const handleSubmit=async(ev:React.FormEvent)=>{ev.preventDefault();setLoading(true);try{await api.post('/auth/forgot-password',{email});setSent(true)}finally{setLoading(false)}}
  if(sent)return<div style={{textAlign:'center'}}>
    <div style={{width:64,height:64,borderRadius:'50%',background:'var(--success-subtle)',border:'1px solid rgba(34,197,94,0.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}><Mail size={28} color="var(--success)"/></div>
    <h2 style={{fontSize:22,fontWeight:700,marginBottom:8}}>Check your email</h2>
    <p style={{color:'var(--text-secondary)',fontSize:13,marginBottom:24}}>If <strong>{email}</strong> exists, a reset link has been sent.</p>
    <Link to="/login" style={{color:'var(--accent-hover)',fontSize:13,display:'inline-flex',alignItems:'center',gap:6}}><ArrowLeft size={13}/>Back to sign in</Link>
  </div>
  return<div>
    <h1 style={{fontSize:28,fontWeight:700,marginBottom:8}}>Reset your password</h1>
    <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:24}}>We'll send a reset link to your email address.</p>
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
      <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" leftIcon={<Mail size={15}/>} required/>
      <Button type="submit" isLoading={loading} size="lg">Send reset link</Button>
    </form>
    <p style={{textAlign:'center',marginTop:20,fontSize:13}}><Link to="/login" style={{color:'var(--accent-hover)',display:'inline-flex',alignItems:'center',gap:6}}><ArrowLeft size={13}/>Back to sign in</Link></p>
  </div>
}
