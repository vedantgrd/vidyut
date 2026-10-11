import{useEffect,useState}from'react'
import{useSearchParams,Link}from'react-router-dom'
import{CheckCircle,XCircle}from'lucide-react'
import{api}from'@/api/client'
import{PageSpinner}from'@/components/ui/Spinner'
export function VerifyEmailPage(){
  const[params]=useSearchParams(),[status,setStatus]=useState<'loading'|'success'|'error'>('loading')
  useEffect(()=>{const token=params.get('token');if(!token){setStatus('error');return}api.post('/auth/verify-email',{token}).then(()=>setStatus('success')).catch(()=>setStatus('error'))},[params])
  if(status==='loading')return<PageSpinner/>
  return<div style={{textAlign:'center',padding:40}}>
    <div style={{width:64,height:64,borderRadius:'50%',background:status==='success'?'var(--success-subtle)':'var(--error-subtle)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
      {status==='success'?<CheckCircle size={28} color="var(--success)"/>:<XCircle size={28} color="var(--error)"/>}
    </div>
    <h2 style={{fontSize:22,fontWeight:700,marginBottom:8}}>{status==='success'?'Email verified!':'Verification failed'}</h2>
    <p style={{color:'var(--text-secondary)',fontSize:13,marginBottom:24}}>{status==='success'?'Your email has been verified.':'The link may have expired.'}</p>
    <Link to="/login" style={{color:'var(--accent-hover)',fontWeight:500,fontSize:13}}>Go to sign in</Link>
  </div>
}
