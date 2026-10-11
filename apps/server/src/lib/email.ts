const FE=process.env.FRONTEND_URL??'http://localhost:5173'
const FROM=process.env.FROM_EMAIL??'noreply@vidyut.in'
const DEV=process.env.NODE_ENV!=='production'
async function send(to:string,subject:string,html:string){
  if(DEV){console.log('[DEV EMAIL] To:'+to+' Subject:'+subject);return}
  const key=process.env.RESEND_API_KEY;if(!key)return
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from:FROM,to,subject,html})})
  if(!r.ok)throw new Error('Resend:'+await r.text())
}
export const sendVerificationEmail=(email:string,token:string)=>send(email,'Verify your Vidyut account','<p>Verify: <a href="'+FE+'/verify-email?token='+token+'">Click here</a></p>')
export const sendPasswordResetEmail=(email:string,token:string)=>send(email,'Reset your Vidyut password','<p>Reset: <a href="'+FE+'/reset-password?token='+token+'">Click here</a></p>')
