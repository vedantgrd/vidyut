import{Outlet,useLocation}from'react-router-dom'
import{motion}from'framer-motion'
import{GraduationCap,Check}from'lucide-react'
const STEPS=[{path:'personal',label:'Personal Info'},{path:'academic',label:'Academic Details'},{path:'family',label:'Family & Income'},{path:'documents',label:'Documents'}]
export function OnboardingLayout(){
  const loc=useLocation(),currentPath=loc.pathname.split('/').pop()??'',currentStep=STEPS.findIndex(s=>s.path===currentPath)
  return<div style={{minHeight:'100vh',background:'var(--bg-base)',display:'flex',flexDirection:'column'}}>
    <header style={{padding:'20px 40px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border-subtle)'}}>
      <div style={{width:36,height:36,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}><GraduationCap size={20} color="white"/></div>
      <span style={{fontSize:18,fontWeight:700}}>Vidyut</span>
      <span style={{marginLeft:12,color:'var(--text-tertiary)',fontSize:13}}>Complete your profile to get started</span>
    </header>
    <div style={{padding:'24px 40px',borderBottom:'1px solid var(--border-subtle)'}}>
      <div style={{maxWidth:700,margin:'0 auto',display:'flex',alignItems:'center'}}>
        {STEPS.map((step,i)=>(
          <div key={step.path} style={{display:'flex',alignItems:'center',flex:i<STEPS.length-1?1:0}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
              <motion.div animate={{background:i<=currentStep?'#6366f1':'var(--surface-2)',borderColor:i<=currentStep?'#6366f1':'var(--border-default)'}}
                style={{width:32,height:32,borderRadius:'50%',border:'2px solid',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,color:i<=currentStep?'#fff':'var(--text-tertiary)'}}>
                {i<currentStep?<Check size={16}/>:i+1}
              </motion.div>
              <span style={{fontSize:11,color:i===currentStep?'var(--text-primary)':'var(--text-tertiary)',fontWeight:i===currentStep?600:400,whiteSpace:'nowrap'}}>{step.label}</span>
            </div>
            {i<STEPS.length-1&&<div style={{flex:1,height:2,background:i<currentStep?'#6366f1':'var(--border-subtle)',margin:'0 12px',marginTop:-18,transition:'background 0.3s'}}/>}
          </div>
        ))}
      </div>
    </div>
    <main style={{flex:1,display:'flex',justifyContent:'center',padding:'40px 24px'}}>
      <motion.div key={currentPath} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.3}} style={{width:'100%',maxWidth:640}}><Outlet/></motion.div>
    </main>
  </div>
}
