import{Hono}from'hono'
import{prisma}from'../lib/prisma.js'
import{authMiddleware}from'../middleware/auth.js'
const n=new Hono<{Variables:{userId:string;role:string}}>()
n.use('*',authMiddleware)
n.get('/',async(c)=>{
  const userId=c.get('userId'),page=Math.max(1,parseInt(c.req.query('page')?? '1')),limit=Math.min(50,parseInt(c.req.query('limit')?? '20'))
  const[total,items]=await Promise.all([prisma.notification.count({where:{userId}}),prisma.notification.findMany({where:{userId},orderBy:{createdAt:'desc'},skip:(page-1)*limit,take:limit})])
  return c.json({notifications:items,pagination:{page,limit,total,totalPages:Math.ceil(total/limit)}})
})
n.get('/unread-count',async(c)=>c.json({count:await prisma.notification.count({where:{userId:c.get('userId'),isRead:false}})}))
n.post('/:id/read',async(c)=>{
  const userId=c.get('userId'),id=c.req.param('id')
  const item=await prisma.notification.findUnique({where:{id}})
  if(!item)return c.json({error:'Not found'},404);if(item.userId!==userId)return c.json({error:'Forbidden'},403)
  await prisma.notification.update({where:{id},data:{isRead:true}})
  return c.json({success:true})
})
n.post('/read-all',async(c)=>{await prisma.notification.updateMany({where:{userId:c.get('userId'),isRead:false},data:{isRead:true}});return c.json({success:true})})
export default n
