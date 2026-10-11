const V={
  default:{bg:'#f1f5f9',color:'#475569',border:'#e2e8f0'},
  success:{bg:'#ecfdf5',color:'#065f46',border:'#a7f3d0'},
  warning:{bg:'#fffbeb',color:'#92400e',border:'#fde68a'},
  error:{bg:'#fef2f2',color:'#991b1b',border:'#fecaca'},
  info:{bg:'#eff6ff',color:'#1e40af',border:'#bfdbfe'},
  accent:{bg:'#e0e7ff',color:'#3730a3',border:'#c7d2fe'}
}

export function Badge({children,variant='default',size='sm',dot}:{children:React.ReactNode;variant?:keyof typeof V;size?:'sm'|'md';dot?:boolean}){
  const v=V[variant]??V.default
  return<span style={{
    display:'inline-flex',
    alignItems:'center',
    gap:5,
    padding:size==='sm'?'2px 8px':'4px 10px',
    borderRadius:'var(--radius-full)',
    fontSize:size==='sm'?11:12,
    fontWeight:600,
    background:v.bg,
    color:v.color,
    border:`1px solid ${v.border}`,
    whiteSpace:'nowrap'
  }}>
    {dot&&<span style={{width:6,height:6,borderRadius:'50%',background:v.color,flexShrink:0}}/>}{children}
  </span>
}
