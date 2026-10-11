import{Outlet,Link,useLocation}from'react-router-dom'
import{motion}from'framer-motion'
import{GraduationCap,ArrowRight}from'lucide-react'

export function PublicLayout(){
  const loc=useLocation()
  const isLanding=loc.pathname==='/'

  return(
    <div style={{minHeight:'100vh',background:'#f8fafc',display:'flex',flexDirection:'column'}}>
      <header style={{
        position:'sticky',
        top:0,
        zIndex:50,
        padding:'14px 28px',
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        background:'rgba(255, 255, 255, 0.95)',
        backdropFilter:'blur(8px)',
        borderBottom:'1px solid #e2e8f0',
        boxShadow:'0 1px 2px 0 rgba(0,0,0,0.03)'
      }}>
        <Link to="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none'}}>
          <div style={{width:36,height:36,background:'#1e40af',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',boxShadow:'0 2px 4px rgba(30,64,175,0.2)'}}>
            <GraduationCap size={20}/>
          </div>
          <div>
            <span style={{fontSize:18,fontWeight:800,color:'#0f172a',letterSpacing:'-0.02em'}}>Vidyut</span>
            <span style={{fontSize:11,color:'#64748b',display:'block',fontWeight:500}}>Scholarship Platform</span>
          </div>
        </Link>

        {isLanding&&(
          <nav style={{display:'flex',alignItems:'center',gap:24}}>
            <a href="#how-it-works" style={{fontSize:13,fontWeight:600,color:'#475569',textDecoration:'none'}}>How It Works</a>
            <a href="#features" style={{fontSize:13,fontWeight:600,color:'#475569',textDecoration:'none'}}>Features</a>
            <a href="#scholarships" style={{fontSize:13,fontWeight:600,color:'#475569',textDecoration:'none'}}>Scholarships</a>
            <a href="#dbt" style={{fontSize:13,fontWeight:600,color:'#475569',textDecoration:'none'}}>Fund Tracking</a>
          </nav>
        )}

        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link to="/login" style={{
            fontSize:13,
            color:'#334155',
            fontWeight:600,
            textDecoration:'none',
            padding:'7px 14px'
          }}>
            Log in
          </Link>
          <Link to="/signup" style={{
            fontSize:13,
            color:'#ffffff',
            fontWeight:600,
            background:'#1e40af',
            padding:'7px 16px',
            borderRadius:8,
            textDecoration:'none',
            display:'inline-flex',
            alignItems:'center',
            gap:6,
            boxShadow:'0 2px 4px rgba(30,64,175,0.2)'
          }}>
            Get Started <ArrowRight size={13}/>
          </Link>
        </div>
      </header>

      {isLanding?(
        <main style={{flex:1}}>
          <Outlet/>
        </main>
      ):(
        <main style={{flex:1,position:'relative',zIndex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.3}} style={{width:'100%',maxWidth:460}}>
            <Outlet/>
          </motion.div>
        </main>
      )}
    </div>
  )
}

