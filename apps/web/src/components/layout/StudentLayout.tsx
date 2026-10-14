import{useState}from'react'
import{Outlet,NavLink,useNavigate}from'react-router-dom'
import{motion,AnimatePresence}from'framer-motion'
import{GraduationCap,LayoutDashboard,CalendarDays,Search,FileText,FolderOpen,User,Bell,Settings,LogOut,ChevronLeft,ChevronRight,Sparkles,X,Send}from'lucide-react'
import{useAuthStore}from'@/store/authStore'
import{useNotificationStore}from'@/store/notificationStore'
import{api}from'@/api/client'

const NAV=[
  {to:'/dashboard',icon:LayoutDashboard,label:'Dashboard'},
  {to:'/calendar',icon:CalendarDays,label:'Calendar'},
  {to:'/scholarships',icon:Search,label:'Scholarships'},
  {to:'/applications',icon:FileText,label:'Applications'},
  {to:'/documents',icon:FolderOpen,label:'Documents'},
  {to:'/profile',icon:User,label:'Profile'},
  {to:'/notifications',icon:Bell,label:'Notifications'},
  {to:'/settings',icon:Settings,label:'Settings'}
]

export function StudentLayout(){
  const[collapsed,setCollapsed]=useState(false)
  const[aiOpen,setAiOpen]=useState(false)
  const[aiMsg,setAiMsg]=useState('')
  const[aiMessages,setAiMessages]=useState<{role:'user'|'ai';text:string}[]>([])
  const[aiLoading,setAiLoading]=useState(false)
  const{user,logout}=useAuthStore()
  const{unreadCount}=useNotificationStore()
  const navigate=useNavigate()

  const handleLogout=async()=>{await logout();navigate('/login')}

  const sendAiMessage=async()=>{
    if(!aiMsg.trim()||aiLoading)return
    const msg=aiMsg.trim();setAiMsg('');setAiMessages(p=>[...p,{role:'user',text:msg}]);setAiLoading(true)
    try{
      const data=await api.post<{response:string}>('/ai/assist',{message:msg,context:'general'})
      setAiMessages(p=>[...p,{role:'ai',text:data.response}])
    }catch{
      setAiMessages(p=>[...p,{role:'ai',text:'Sorry, I encountered an error connecting to the assistant. Please try again.'}])
    }finally{
      setAiLoading(false)
    }
  }

  const W=collapsed?68:240

  return<div style={{display:'flex',minHeight:'100vh',background:'var(--bg-base)'}}>
    {/* Clean sidebar with deep navy branding and active indicators */}
    <motion.aside animate={{width:W}} transition={{duration:0.2}} style={{
      position:'fixed',
      top:0,
      left:0,
      bottom:0,
      zIndex:100,
      background:'#ffffff',
      borderRight:'1px solid #e2e8f0',
      display:'flex',
      flexDirection:'column',
      overflow:'hidden',
      boxShadow:'1px 0 3px 0 rgba(0,0,0,0.03)'
    }}>
      <div style={{padding:'20px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid #e2e8f0'}}>
        <div style={{width:36,height:36,background:'#1e40af',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 2px 4px rgba(30,64,175,0.2)'}}>
          <GraduationCap size={20} color="white"/>
        </div>
        <AnimatePresence>
          {!collapsed&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <span style={{fontSize:18,fontWeight:800,color:'#0f172a',letterSpacing:'-0.02em'}}>Vidyut</span>
            <span style={{fontSize:10,color:'#059669',fontWeight:700,display:'block',textTransform:'uppercase',letterSpacing:'0.05em'}}>Student Hub</span>
          </motion.div>}
        </AnimatePresence>
      </div>

      <nav style={{flex:1,padding:'12px 10px',display:'flex',flexDirection:'column',gap:4,overflowY:'auto'}}>
        {NAV.map(({to,icon:Icon,label})=>(
          <NavLink key={to} to={to} style={{textDecoration:'none'}}>
            {({isActive})=>(
              <div style={{
                display:'flex',
                alignItems:'center',
                gap:12,
                padding:'10px 12px',
                borderRadius:'var(--radius-md)',
                background:isActive?'#eff6ff':'transparent',
                color:isActive?'#1e40af':'#475569',
                fontWeight:isActive?600:500,
                transition:'all var(--transition)',
                cursor:'pointer'
              }}>
                <div style={{position:'relative',flexShrink:0}}>
                  <Icon size={18} color={isActive?'#1e40af':'#64748b'}/>
                  {label==='Notifications'&&unreadCount>0&&<span style={{
                    position:'absolute',
                    top:-4,
                    right:-4,
                    width:14,
                    height:14,
                    background:'var(--error)',
                    borderRadius:'50%',
                    fontSize:9,
                    fontWeight:700,
                    color:'#fff',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center'
                  }}>{unreadCount>9?'9+':unreadCount}</span>}
                </div>
                <AnimatePresence>
                  {!collapsed&&<motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{fontSize:13,whiteSpace:'nowrap'}}>
                    {label}
                  </motion.span>}
                </AnimatePresence>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{padding:'12px 10px',borderTop:'1px solid #e2e8f0',display:'flex',flexDirection:'column',gap:4,background:'#f8fafc'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px'}}>
          <div style={{width:30,height:30,borderRadius:'50%',background:'#1e40af',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:12,fontWeight:700,color:'#fff'}}>
            {user?.fullName?.[0]?.toUpperCase()??'U'}
          </div>
          <AnimatePresence>
            {!collapsed&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{minWidth:0}}>
              <p style={{fontSize:13,fontWeight:600,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.fullName}</p>
              <p style={{fontSize:11,color:'#64748b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</p>
            </motion.div>}
          </AnimatePresence>
        </div>
        <button onClick={handleLogout} style={{
          display:'flex',
          alignItems:'center',
          gap:12,
          padding:'9px 10px',
          borderRadius:'var(--radius-md)',
          background:'none',
          border:'none',
          cursor:'pointer',
          color:'#64748b',
          width:'100%',
          fontSize:13,
          fontWeight:500
        }}>
          <LogOut size={16} style={{flexShrink:0}}/>
          <AnimatePresence>{!collapsed&&<motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{whiteSpace:'nowrap'}}>Sign out</motion.span>}</AnimatePresence>
        </button>
        <button onClick={()=>setCollapsed(!collapsed)} style={{
          display:'flex',
          alignItems:'center',
          gap:12,
          padding:'9px 10px',
          borderRadius:'var(--radius-md)',
          background:'none',
          border:'none',
          cursor:'pointer',
          color:'#94a3b8',
          width:'100%',
          fontSize:12
        }}>
          {collapsed?<ChevronRight size={16}/>:<><ChevronLeft size={16}/><span>Collapse</span></>}
        </button>
      </div>
    </motion.aside>

    {/* Main Content Area */}
    <div style={{marginLeft:W,flex:1,transition:'margin-left 0.2s ease',minHeight:'100vh',background:'#f8fafc'}}>
      <main style={{padding:'32px 40px',maxWidth:1120,margin:'0 auto'}}><Outlet/></main>
    </div>

    {/* Floating Vidyut AI Assistant Button */}
    <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={()=>setAiOpen(!aiOpen)}
      style={{
        position:'fixed',
        bottom:28,
        right:28,
        width:52,
        height:52,
        borderRadius:'50%',
        background:'#1e40af',
        border:'none',
        cursor:'pointer',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        boxShadow:'0 10px 25px -5px rgba(30, 64, 175, 0.4), 0 8px 10px -6px rgba(30, 64, 175, 0.3)',
        zIndex:200,
        color:'#fff'
      }}>
      {aiOpen?<X size={22}/>:<Sparkles size={22}/>}
    </motion.button>

    {/* Clean, light-themed AI Dialog */}
    <AnimatePresence>
      {aiOpen&&(
        <motion.div initial={{opacity:0,scale:0.9,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.9,y:20}}
          style={{
            position:'fixed',
            bottom:90,
            right:28,
            width:380,
            height:500,
            background:'#ffffff',
            border:'1px solid #e2e8f0',
            borderRadius:'var(--radius-xl)',
            display:'flex',
            flexDirection:'column',
            zIndex:200,
            boxShadow:'0 20px 30px -10px rgba(0,0,0,0.15)',
            overflow:'hidden'
          }}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#f8fafc'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:32,height:32,borderRadius:8,background:'#1e40af',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Sparkles size={16} color="white"/>
              </div>
              <div>
                <p style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>Vidyut Assistant</p>
                <p style={{fontSize:11,color:'#059669',fontWeight:500}}>Connected to your profile & vault</p>
              </div>
            </div>
            <button onClick={()=>setAiOpen(false)} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8'}}>
              <X size={16}/>
            </button>
          </div>

          <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12,background:'#ffffff'}}>
            {aiMessages.length===0&&(
              <div style={{textAlign:'center',padding:'28px 16px',color:'#64748b',fontSize:13}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
                  <Sparkles size={20} color="#1e40af"/>
                </div>
                <p style={{fontWeight:600,color:'#0f172a',marginBottom:4}}>Ask anything about scholarships</p>
                <p style={{fontSize:12,lineHeight:1.4}}>Try asking: "Which scholarships am I eligible for?", "What documents do I have in my vault?", or "What does Under Review mean?"</p>
              </div>
            )}
            {aiMessages.map((m,i)=>(
              <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                <div style={{
                  maxWidth:'85%',
                  padding:'10px 14px',
                  borderRadius:m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px',
                  background:m.role==='user'?'#1e40af':'#f1f5f9',
                  color:m.role==='user'?'#ffffff':'#0f172a',
                  fontSize:13,
                  lineHeight:1.5,
                  whiteSpace:'pre-line'
                }}>{m.text}</div>
              </div>
            ))}
            {aiLoading&&<div style={{fontSize:12,color:'#64748b',fontStyle:'italic',padding:'4px 8px'}}>Consulting Vidyut records...</div>}
          </div>

          <div style={{padding:'12px 16px',borderTop:'1px solid #e2e8f0',display:'flex',gap:8,background:'#f8fafc'}}>
            <input value={aiMsg} onChange={e=>setAiMsg(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAiMessage()}}} placeholder="Ask Vidyut Assistant..."
              style={{flex:1,height:38,padding:'0 12px',background:'#ffffff',border:'1px solid #cbd5e1',borderRadius:8,color:'#0f172a',fontSize:13,outline:'none',fontFamily:'inherit'}}/>
            <button onClick={sendAiMessage} disabled={!aiMsg.trim()||aiLoading}
              style={{width:38,height:38,borderRadius:8,background:'#1e40af',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0,opacity:(!aiMsg.trim()||aiLoading)?0.5:1}}>
              <Send size={15}/>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
}
