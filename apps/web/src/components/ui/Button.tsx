import{forwardRef}from'react'
import{motion}from'framer-motion'
import{Loader2}from'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{
  variant?:'primary'|'secondary'|'ghost'|'danger'|'outline'|'success'|'magic';
  size?:'sm'|'md'|'lg';
  isLoading?:boolean;
  leftIcon?:React.ReactNode;
  rightIcon?:React.ReactNode;
  fullWidth?:boolean;
}

const V={
  primary:'background:#1e40af;color:#ffffff;border:1px solid #1e40af;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05)',
  secondary:'background:#f1f5f9;color:#0f172a;border:1px solid #e2e8f0',
  ghost:'background:transparent;color:#475569;border:1px solid transparent',
  danger:'background:#fee2e2;color:#b91c1c;border:1px solid #fecaca',
  outline:'border:1px solid #cbd5e1;color:#1e40af;background:#ffffff',
  success:'background:#059669;color:#ffffff;border:1px solid #059669',
  magic:'background:linear-gradient(135deg, #1e40af 0%, #059669 100%);color:#ffffff;border:1px solid transparent;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05)'
}

const Z={
  sm:'padding:5px 12px;font-size:12px;height:30px',
  md:'padding:8px 16px;font-size:13px;height:38px',
  lg:'padding:10px 24px;font-size:15px;height:46px'
}

export const Button=forwardRef<HTMLButtonElement,ButtonProps>(({
  variant='primary',
  size='md',
  isLoading,
  leftIcon,
  rightIcon,
  fullWidth,
  children,
  className='',
  disabled,
  style,
  ...props
},ref)=>(
  <motion.button ref={ref} whileTap={{scale:0.98}}
    disabled={disabled||isLoading}
    style={{
      display:fullWidth?'flex':'inline-flex',
      width:fullWidth?'100%':undefined,
      alignItems:'center',
      justifyContent:'center',
      gap:8,
      fontWeight:500,
      borderRadius:8,
      cursor:'pointer',
      outline:'none',
      fontFamily:'inherit',
      transition:'all 0.15s',
      whiteSpace:'nowrap',
      flexShrink:0,
      opacity:(disabled||isLoading)?0.5:1,
      ...Object.fromEntries(V[variant].split(';').filter(Boolean).map(s=>{const[k,...v]=s.trim().split(':');return[k.trim().replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v.join(':').trim()]})),
      ...Object.fromEntries(Z[size].split(';').filter(Boolean).map(s=>{const[k,...v]=s.trim().split(':');return[k.trim().replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v.join(':').trim()]})),
      ...style
    }}
    className={className}
    {...(props as React.ComponentProps<typeof motion.button>)}>
    {isLoading?<Loader2 size={13} className="animate-spin"/>:leftIcon}
    {children}
    {!isLoading&&rightIcon}
  </motion.button>
))
Button.displayName='Button'
