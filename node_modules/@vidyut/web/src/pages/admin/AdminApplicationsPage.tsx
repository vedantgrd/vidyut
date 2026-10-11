import{useState}from'react'
import{Link}from'react-router-dom'
import{ChevronRight,FileText}from'lucide-react'
import{useApi}from'@/hooks/useApi'
import{api}from'@/api/client'
import{PageSpinner}from'@/components/ui/Spinner'
import{Card}from'@/components/ui/Card'
import{StatusBadge}from'@/components/ui/StatusBadge'
import{Empty}from'@/components/ui/Empty'
const FILTERS=['All','SUBMITTED','DOCUMENTS_VERIFIED','UNDER_REVIEW','ADDITIONAL_INFO_REQUESTED','APPROVED','REJECTED']
export function AdminApplicationsPage(){
  const[filter,setFilter]=useState('All')
  const qs=filter!=='All'?`?status=${filter}`:''
  const{data,isLoading}=useApi(()=>api.get<{applications:any[]}>(`/admin/applications${qs}`),[qs])
  function fmtDate(d:string){return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
  return<div>
    <div style={{marginBottom:22}}><h1 style={{fontSize:26,fontWeight:700,marginBottom:4}}>Application Review Queue</h1><p style={{color:'var(--text-secondary)',fontSize:14}}>Review and process student applications.</p></div>
    <div style={{display:'flex',gap:7,marginBottom:18,flexWrap:'wrap'}}>
      {FILTERS.map(s=><button key={s} onClick={()=>setFilter(s)} style={{padding:'5px 12px',borderRadius:'var(--radius-full)',border:'1px solid',cursor:'pointer',fontSize:11,fontWeight:filter===s?600:400,background:filter===s?'rgba(245,158,11,0.1)':'transparent',borderColor:filter===s?'rgba(245,158,11,0.3)':'var(--border-default)',color:filter===s?'#f59e0b':'var(--text-secondary)'}}>{s==='All'?'All':s.replace(/_/g,' ').toLowerCase().replace(/\w/g,c=>c.toUpperCase())}</button>)}
    </div>
    {isLoading?<PageSpinner/>:!data?.applications.length?(
      <Empty icon={<FileText size={24}/>} title="No applications" description="No applications match the selected filter."/>
    ):(
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {data.applications.map((app:any)=>(
          <Link key={app.id} to={`/admin/applications/${app.id}`} style={{textDecoration:'none'}}>
            <Card hover style={{padding:'14px 18px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{flex:1}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}><p style={{fontSize:13,fontWeight:600}}>{app.user?.fullName}</p><StatusBadge status={app.status}/></div><p style={{fontSize:12,color:'var(--text-secondary)',marginBottom:3}}>{app.scholarship?.name}</p><p style={{fontSize:11,color:'var(--text-tertiary)'}}>Updated: {fmtDate(app.lastActivityAt)}</p></div>
                <ChevronRight size={17} color="var(--text-tertiary)"/>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    )}
  </div>
}
