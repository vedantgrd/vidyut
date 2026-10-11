import{motion}from'framer-motion'
export function Empty({icon,title,description,action}:{icon?:React.ReactNode;title:string;description?:string;action?:React.ReactNode}){
  return<motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,padding:'64px 24px',textAlign:'center'}}>
    {icon&&<div style={{width:56,height:56,borderRadius:'var(--radius-xl)',background:'var(--surface-2)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-tertiary)'}}>{icon}</div>}
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <p style={{fontSize:16,fontWeight:600}}>{title}</p>
      {description&&<p style={{fontSize:13,color:'var(--text-tertiary)',maxWidth:360}}>{description}</p>}
    </div>
    {action}
  </motion.div>
}
