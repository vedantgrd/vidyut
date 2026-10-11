import{Hono}from'hono'
import{getCookie,setCookie,deleteCookie}from'hono/cookie'
import{zValidator}from'@hono/zod-validator'
import crypto from'node:crypto'
import{prisma}from'../lib/prisma.js'
import{hashPassword,comparePassword}from'../lib/bcrypt.js'
import{signAccessToken,signRefreshToken,verifyRefreshToken}from'../lib/jwt.js'
import{sendVerificationEmail,sendPasswordResetEmail}from'../lib/email.js'
import{authMiddleware}from'../middleware/auth.js'
import{signupSchema,loginSchema,forgotPasswordSchema,resetPasswordSchema,verifyEmailSchema}from'../validators/schemas.js'
const auth=new Hono<{Variables:{userId:string;role:string}}>()
const CK='refresh_token'
const CO={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'Strict' as const,path:'/',maxAge:604800}
const H=(t:string)=>crypto.createHash('sha256').update(t).digest('hex')
function safe(u:{id:string;email:string;fullName:string;role:string;isEmailVerified:boolean;onboardingComplete:boolean;onboardingStep:number;avatarUrl:string|null;createdAt:Date}){return{id:u.id,email:u.email,fullName:u.fullName,role:u.role,isEmailVerified:u.isEmailVerified,onboardingComplete:u.onboardingComplete,onboardingStep:u.onboardingStep,avatarUrl:u.avatarUrl,createdAt:u.createdAt}}
auth.post('/signup',zValidator('json',signupSchema),async(c)=>{
  const{fullName,email,password}=c.req.valid('json')
  if(await prisma.user.findUnique({where:{email}}))return c.json({error:'Email already in use',code:'EMAIL_EXISTS'},409)
  const passwordHash=await hashPassword(password)
  const vt=crypto.randomBytes(32).toString('hex')
  const user=await prisma.user.create({data:{email,fullName,passwordHash,emailVerifyToken:vt,emailVerifyExpiry:new Date(Date.now()+86400000),studentProfile:{create:{}},familyInfo:{create:{}},settings:{create:{}}}})
  await sendVerificationEmail(email,vt)
  const accessToken=await signAccessToken({userId:user.id,role:user.role})
  const rt=await signRefreshToken(user.id)
  await prisma.session.create({data:{userId:user.id,refreshTokenHash:H(rt),userAgent:c.req.header('user-agent'),ipAddress:c.req.header('x-forwarded-for')??"unknown",expiresAt:new Date(Date.now()+604800000)}})
  await prisma.notification.create({data:{userId:user.id,type:'SYSTEM',title:'Welcome to Vidyut!',message:'Complete your profile to discover scholarships.',link:'/onboarding'}})
  setCookie(c,CK,rt,CO)
  return c.json({user:safe(user),accessToken},201)
})
auth.post('/login',zValidator('json',loginSchema),async(c)=>{
  const{email,password}=c.req.valid('json')
  const user=await prisma.user.findUnique({where:{email}})
  if(!user||!await comparePassword(password,user.passwordHash))return c.json({error:'Invalid email or password',code:'INVALID_CREDENTIALS'},401)
  const accessToken=await signAccessToken({userId:user.id,role:user.role})
  const rt=await signRefreshToken(user.id)
  await prisma.session.create({data:{userId:user.id,refreshTokenHash:H(rt),userAgent:c.req.header('user-agent'),ipAddress:c.req.header('x-forwarded-for')??"unknown",expiresAt:new Date(Date.now()+604800000)}})
  await prisma.user.update({where:{id:user.id},data:{lastLoginAt:new Date()}})
  setCookie(c,CK,rt,CO)
  return c.json({user:safe(user),accessToken})
})
auth.post('/logout',async(c)=>{
  const rt=getCookie(c,CK)
  if(rt)await prisma.session.deleteMany({where:{refreshTokenHash:H(rt)}})
  deleteCookie(c,CK,{path:'/'})
  return c.json({message:'Logged out'})
})
auth.post('/refresh',async(c)=>{
  const rt=getCookie(c,CK)
  if(!rt)return c.json({error:'No refresh token',code:'NO_REFRESH_TOKEN'},401)
  let userId:string
  try{userId=(await verifyRefreshToken(rt)).userId}catch{deleteCookie(c,CK,{path:'/'});return c.json({error:'Invalid token',code:'INVALID_REFRESH_TOKEN'},401)}
  const hash=H(rt)
  const session=await prisma.session.findUnique({where:{refreshTokenHash:hash}})
  if(!session||session.expiresAt<new Date()){deleteCookie(c,CK,{path:'/'});return c.json({error:'Session expired',code:'SESSION_EXPIRED'},401)}
  await prisma.session.delete({where:{refreshTokenHash:hash}})
  const user=await prisma.user.findUnique({where:{id:userId}})
  if(!user)return c.json({error:'User not found'},401)
  const newAccess=await signAccessToken({userId:user.id,role:user.role})
  const newRt=await signRefreshToken(user.id)
  await prisma.session.create({data:{userId:user.id,refreshTokenHash:H(newRt),userAgent:session.userAgent,ipAddress:session.ipAddress,expiresAt:new Date(Date.now()+604800000)}})
  setCookie(c,CK,newRt,CO)
  return c.json({user:safe(user),accessToken:newAccess})
})
auth.get('/me',authMiddleware,async(c)=>{
  const user=await prisma.user.findUnique({where:{id:c.get('userId')}})
  if(!user)return c.json({error:'Not found'},404)
  return c.json({user:safe(user)})
})
auth.post('/verify-email',zValidator('json',verifyEmailSchema),async(c)=>{
  const{token}=c.req.valid('json')
  const user=await prisma.user.findFirst({where:{emailVerifyToken:token}})
  if(!user||!user.emailVerifyExpiry||user.emailVerifyExpiry<new Date())return c.json({error:'Invalid or expired token',code:'INVALID_TOKEN'},400)
  await prisma.user.update({where:{id:user.id},data:{isEmailVerified:true,emailVerifyToken:null,emailVerifyExpiry:null}})
  return c.json({message:'Email verified'})
})
auth.post('/forgot-password',zValidator('json',forgotPasswordSchema),async(c)=>{
  const{email}=c.req.valid('json')
  const user=await prisma.user.findUnique({where:{email}})
  if(user){const t=crypto.randomBytes(32).toString('hex');await prisma.user.update({where:{id:user.id},data:{resetToken:t,resetTokenExpiry:new Date(Date.now()+3600000)}});await sendPasswordResetEmail(email,t)}
  return c.json({message:'If that email exists, a reset link has been sent.'})
})
auth.post('/reset-password',zValidator('json',resetPasswordSchema),async(c)=>{
  const{token,password}=c.req.valid('json')
  const user=await prisma.user.findFirst({where:{resetToken:token}})
  if(!user||!user.resetTokenExpiry||user.resetTokenExpiry<new Date())return c.json({error:'Invalid or expired token',code:'INVALID_TOKEN'},400)
  await prisma.user.update({where:{id:user.id},data:{passwordHash:await hashPassword(password),resetToken:null,resetTokenExpiry:null}})
  await prisma.session.deleteMany({where:{userId:user.id}})
  return c.json({message:'Password reset. Please log in again.'})
})
export default auth
