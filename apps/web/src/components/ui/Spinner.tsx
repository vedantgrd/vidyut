export function Spinner({size=20,color='var(--accent)'}:{size?:number;color?:string}){
  return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{animation:'spin 0.7s linear infinite'}}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.25" strokeWidth="3"/>
    <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round"/>
  </svg>
}
export function PageSpinner(){
  return<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}><Spinner size={32}/></div>
}
