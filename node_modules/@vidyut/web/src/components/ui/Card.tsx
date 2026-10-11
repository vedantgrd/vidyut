import{motion}from'framer-motion'

interface CardProps{
  children:React.ReactNode;
  className?:string;
  hover?:boolean;
  onClick?:()=>void;
  style?:React.CSSProperties;
}

export function Card({children,className='',hover,onClick,style}:CardProps){
  return(
    <motion.div className={className} onClick={onClick}
      style={{
        background:'#ffffff',
        border:'1px solid #e2e8f0',
        borderRadius:'var(--radius-lg)',
        padding:24,
        position:'relative',
        boxShadow:'0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        cursor:onClick?'pointer':undefined,
        ...style
      }}
      whileHover={hover?{y:-2,boxShadow:'0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)'}:undefined}
      transition={{duration:0.15}}>
      {children}
    </motion.div>
  )
}
