import{useState,useCallback}from'react'
import{motion,AnimatePresence}from'framer-motion'
import{CheckCircle,XCircle,AlertCircle,X}from'lucide-react'
import{normalizeErrorMessage}from'@/api/client'

export type ToastType='success'|'error'|'info'
export interface ToastData{id:string;type:ToastType;message:string}

let toastFn:((message:unknown,type?:ToastType)=>void)|null=null

export function toast(message:unknown,type:ToastType='info'){
  const cleanMsg = typeof message === 'string' ? message : normalizeErrorMessage(message)
  toastFn?.(cleanMsg,type)
}

export function useToast() {
  return {
    addToast: (type: ToastType, message: unknown) => toast(message, type),
    toast
  }
}

export function ToastContainer(){
  const[toasts,setToasts]=useState<ToastData[]>([])
  const addToast=useCallback((rawMessage:unknown,type:ToastType='info')=>{
    const message = typeof rawMessage === 'string' ? rawMessage : normalizeErrorMessage(rawMessage)
    const id=Math.random().toString(36).slice(2)
    setToasts(p=>[...p,{id,type,message}])
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4500)
  },[])
  toastFn=addToast

  const icons={
    success:<CheckCircle size={16} color="#059669"/>,
    error:<XCircle size={16} color="#dc2626"/>,
    info:<AlertCircle size={16} color="#2563eb"/>
  }
  const colors={
    success:'#059669',
    error:'#dc2626',
    info:'#2563eb'
  }

  return<div style={{position:'fixed',bottom:24,right:24,zIndex:9999,display:'flex',flexDirection:'column',gap:10,pointerEvents:'none'}}>
    <AnimatePresence>
      {toasts.map(t=>(
        <motion.div key={t.id} initial={{opacity:0,x:60}} animate={{opacity:1,x:0}} exit={{opacity:0,x:60}}
          style={{
            display:'flex',
            alignItems:'center',
            gap:10,
            background:'#ffffff',
            border:'1px solid #e2e8f0',
            borderRadius:'var(--radius-lg)',
            padding:'12px 16px',
            minWidth:280,
            maxWidth:420,
            boxShadow:'0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
            pointerEvents:'all',
            borderLeft:`4px solid ${colors[t.type]}`
          }}>
          {icons[t.type]}
          <span style={{fontSize:13,color:'#0f172a',fontWeight:500,flex:1,lineHeight:1.4}}>{t.message}</span>
          <button onClick={()=>setToasts(p=>p.filter(x=>x.id!==t.id))} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',padding:2,display:'flex'}}>
            <X size={14}/>
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
}
