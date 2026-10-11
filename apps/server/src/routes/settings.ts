import{Hono}from'hono'
import{zValidator}from'@hono/zod-validator'
import{prisma}from'../lib/prisma.js'
import{authMiddleware}from'../middleware/auth.js'
import{updateSettingsSchema}from'../validators/schemas.js'
const settings=new Hono<{Variables:{userId:string;role:string}}>()
settings.use('*',authMiddleware)
settings.get('/',async(c)=>{
  const userId=c.get('userId')
  let d=await prisma.userSettings.findUnique({where:{userId}})
  if(!d)d=await prisma.userSettings.create({data:{userId}})
  return c.json({settings:d})
})
settings.patch('/',zValidator('json',updateSettingsSchema),async(c)=>{
  const userId=c.get('userId'),body=c.req.valid('json')
  return c.json({settings:await prisma.userSettings.upsert({where:{userId},update:body,create:{userId,...body}})})
})
export default settings
