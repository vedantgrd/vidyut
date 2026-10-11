import{motion}from'framer-motion'
export function ProgressBar({value,max=100,color='var(--accent)',height=6,showLabel=false}:{value:number;max?:number;color?:string;height?:number;showLabel?:boolean}){
  const pct=Math.min(100,Math.round((value/max)*100))
  return<div style={{display:'flex',alignItems:'center',gap:10}}>
    <div style={{flex:1,height,background:'var(--surface-2)',borderRadius:999,overflow:'hidden'}}>
      <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.6,ease:[0.4,0,0.2,1]}} style={{height:'100%',borderRadius:999,background:color}}/>
    </div>
    {showLabel&&<span style={{fontSize:12,color:'var(--text-tertiary)',minWidth:32,textAlign:'right'}}>{pct}%</span>}
  </div>
}
