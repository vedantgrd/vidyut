import type{Context,Next}from'hono'
import{verifyAccessToken}from'../lib/jwt.js'
export async function authMiddleware(c:Context,next:Next){
  const h=c.req.header('Authorization')
  if(!h?.startsWith('Bearer '))return c.json({error:'Unauthorised',code:'MISSING_TOKEN'},401)
  try{const p=await verifyAccessToken(h.slice(7));c.set('userId',p.userId);c.set('role',p.role);await next()}
  catch{return c.json({error:'Unauthorised',code:'INVALID_TOKEN'},401)}
}
export async function optionalAuthMiddleware(c:Context,next:Next){
  const h=c.req.header('Authorization')
  if(h?.startsWith('Bearer ')){try{const p=await verifyAccessToken(h.slice(7));c.set('userId',p.userId);c.set('role',p.role)}catch{}}
  await next()
}
export async function adminMiddleware(c:Context,next:Next){
  const r=c.get('role') as string|undefined
  if(r!=='ADMIN'&&r!=='REVIEWER')return c.json({error:'Forbidden',code:'FORBIDDEN'},403)
  await next()
}
export async function adminOnlyMiddleware(c:Context,next:Next){
  if(c.get('role')!=='ADMIN')return c.json({error:'Forbidden',code:'FORBIDDEN'},403)
  await next()
}
