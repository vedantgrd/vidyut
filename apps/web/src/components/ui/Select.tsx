import{forwardRef}from'react'
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>{label?:string;error?:string;options?:{value:string;label:string}[];placeholder?:string}
export const Select=forwardRef<HTMLSelectElement,SelectProps>(({label,error,options,placeholder,children,...props},ref)=>(
  <div style={{display:'flex',flexDirection:'column',gap:5}}>
    {label&&<label style={{fontSize:12,fontWeight:500,color:'var(--text-secondary)'}}>{label}</label>}
    <select ref={ref} {...props} style={{width:'100%',height:38,padding:'0 10px',background:'var(--surface-1)',border:`1px solid ${error?'var(--error)':'var(--border-default)'}`,borderRadius:'var(--radius-md)',color:props.value?'var(--text-primary)':'var(--text-tertiary)',fontSize:13,outline:'none',cursor:'pointer',fontFamily:'inherit'}}>
      {placeholder&&<option value="">{placeholder}</option>}
      {options?options.map(o=><option key={o.value} value={o.value}>{o.label}</option>):children}
    </select>
    {error&&<p style={{fontSize:11,color:'var(--error)'}}>{error}</p>}
  </div>
))
Select.displayName='Select'
