import{serve}from'@hono/node-server'
import{Hono}from'hono'
import{cors}from'hono/cors'
import{logger}from'hono/logger'
import{secureHeaders}from'hono/secure-headers'
import authRoutes from'./routes/auth.js'
import onboardingRoutes from'./routes/onboarding.js'
import profileRoutes from'./routes/profile.js'
import documentRoutes from'./routes/documents.js'
import scholarshipRoutes from'./routes/scholarships.js'
import applicationRoutes from'./routes/applications.js'
import dashboardRoutes from'./routes/dashboard.js'
import notificationRoutes from'./routes/notifications.js'
import settingsRoutes from'./routes/settings.js'
import aiRoutes from'./routes/ai.js'
import adminRoutes from'./routes/admin.js'
for(const k of['DATABASE_URL','JWT_ACCESS_SECRET','JWT_REFRESH_SECRET']){if(!process.env[k]){console.error(`Missing env: ${k}`);process.exit(1)}}
const app=new Hono()
app.use('*',logger())
app.use('*',secureHeaders())
const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
  .split(',')
  .map(o => o.trim().replace(/\/+$/, ''))
  .filter(Boolean)

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return allowedOrigins[0] ?? 'http://localhost:5173'
    const normalized = origin.replace(/\/+$/, '')
    if (allowedOrigins.includes(normalized) || normalized.endsWith('.vercel.app')) return origin
    // Check if localhost in development
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(normalized)) {
      return origin
    }
    return null
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.get('/health',c=>c.json({status:'ok',timestamp:new Date().toISOString()}))
app.get('/',c=>c.json({name:'Vidyut API',status:'online',version:'1.0.0',health:'/health',api:'/api/v1'}))
const api=new Hono()
api.get('/',c=>c.json({name:'Vidyut API v1',status:'online',endpoints:['/auth','/scholarships','/applications','/documents','/profile','/dashboard','/admin']}))
api.route('/auth',authRoutes);api.route('/onboarding',onboardingRoutes);api.route('/profile',profileRoutes)
api.route('/documents',documentRoutes);api.route('/scholarships',scholarshipRoutes);api.route('/applications',applicationRoutes)
api.route('/dashboard',dashboardRoutes);api.route('/notifications',notificationRoutes);api.route('/settings',settingsRoutes)
api.route('/ai',aiRoutes);api.route('/admin',adminRoutes)
app.route('/api/v1',api)
app.notFound(c=>c.json({error:`Not found: ${c.req.method} ${c.req.path}`},404))
app.onError((err,c)=>{console.error('[Error]',err);return c.json({error:'Internal server error',message:process.env.NODE_ENV==='development'?err.message:undefined},500)})
serve({fetch:app.fetch,port:parseInt(process.env.PORT??'3001')},info=>console.log(`Vidyut API running on http://localhost:${info.port}`))
export default app
