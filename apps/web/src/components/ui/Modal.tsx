import{useEffect}from'react'
import{motion,AnimatePresence}from'framer-motion'
import{X}from'lucide-react'
export function Modal({isOpen,onClose,title,children,width=520}:{isOpen:boolean;onClose:()=>void;title?:string;children:React.ReactNode;width?:number}){
  useEffect(()=>{const h=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};if(isOpen)document.addEventListener('keydown',h);return()=>document.removeEventListener('keydown',h)},[isOpen,onClose])
  return<AnimatePresence>{isOpen&&(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:24,backdropFilter:'blur(4px)'}}>
      <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95}} onClick={e=>e.stopPropagation()}
        style={{background:'#111113',border:'1px solid var(--border-default)',borderRadius:'var(--radius-2xl)',width:'100%',maxWidth:width,maxHeight:'90vh',overflow:'auto'}}>
        {title&&<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',borderBottom:'1px solid var(--border-subtle)'}}>
          <h2 style={{fontSize:16,fontWeight:600}}>{title}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-tertiary)',display:'flex'}}><X size={18}/></button>
        </div>}
        <div style={{padding:24}}>{children}</div>
      </motion.div>
    </motion.div>
  )}</AnimatePresence>
}
