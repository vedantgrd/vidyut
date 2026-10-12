import{forwardRef}from'react'
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>{label?:string;error?:string;hint?:string;leftIcon?:React.ReactNode;rightElement?:React.ReactNode;rightIcon?:React.ReactNode}
export const Input=forwardRef<HTMLInputElement,InputProps>(({label,error,hint,leftIcon,rightElement,rightIcon,className='',style,...props},ref)=>{
  const trailingElem = rightElement ?? rightIcon
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      {label&&<label style={{fontSize:12,fontWeight:500,color:'var(--text-secondary)'}}>{label}</label>}
      <div style={{position:'relative',display:'flex',alignItems:'center'}}>
        {leftIcon&&<span style={{position:'absolute',left:10,color:'var(--text-tertiary)',display:'flex',pointerEvents:'none'}}>{leftIcon}</span>}
        <input ref={ref} {...props} className={className} style={{width:'100%',height:38,padding:leftIcon?'0 10px 0 34px':'0 10px',paddingRight:trailingElem?36:10,background:'var(--surface-1)',border:`1px solid ${error?'var(--error)':'var(--border-default)'}`,borderRadius:'var(--radius-md)',color:'var(--text-primary)',fontSize:13,outline:'none',fontFamily:'inherit',...style}}
          onFocus={e=>{e.currentTarget.style.borderColor=error?'var(--error)':'var(--accent)';props.onFocus?.(e)}}
          onBlur={e=>{e.currentTarget.style.borderColor=error?'var(--error)':'var(--border-default)';props.onBlur?.(e)}}/>
        {trailingElem&&<span style={{position:'absolute',right:10,color:'var(--text-tertiary)',display:'flex'}}>{trailingElem}</span>}
      </div>
      {error&&<p style={{fontSize:11,color:'var(--error)'}}>{error}</p>}
      {hint&&!error&&<p style={{fontSize:11,color:'var(--text-tertiary)'}}>{hint}</p>}
    </div>
  )
})
Input.displayName='Input'
