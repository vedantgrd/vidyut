import{useState}from'react'
import{motion}from'framer-motion'
import{FileText,ChevronRight}from'lucide-react'
import{Link}from'react-router-dom'
import{useApi}from'@/hooks/useApi'
import{api}from'@/api/client'
import type{Application}from'@/types'
import{PageSpinner}from'@/components/ui/Spinner'
import{Card}from'@/components/ui/Card'
import{Badge}from'@/components/ui/Badge'
import{StatusBadge}from'@/components/ui/StatusBadge'
import{Empty}from'@/components/ui/Empty'
import{ProgressBar}from'@/components/ui/ProgressBar'
import{Button}from'@/components/ui/Button'
const FILTERS=['All','DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED']
function daysLeft(d:string){return Math.ceil((new Date(d).getTime()-Date.now())/86400000)}
function fmtAmt(a:number){return a>=100000?`Rs.${(a/100000).toFixed(1)}L`:`Rs.${a.toLocaleString('en-IN')}`}
export function ApplicationsPage(){
  const[filter,setFilter]=useState('All')
  const qs=filter!=='All'?`?status=${filter}`:''
  const{data,isLoading}=useApi(()=>api.get<{applications:Application[]}>(`/applications${qs}`),[qs])
  const apps=data?.applications??[]
  return<div>
    <div style={{marginBottom:22}}><h1 style={{fontSize:26,fontWeight:700,marginBottom:4}}>My Applications</h1><p style={{color:'var(--text-secondary)',fontSize:14}}>Track the status of all your scholarship applications.</p></div>
    <div style={{display:'flex',gap:8,marginBottom:18,flexWrap:'wrap'}}>
      {FILTERS.map(s=><button key={s} onClick={()=>setFilter(s)} style={{padding:'5px 14px',borderRadius:'var(--radius-full)',border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:filter===s?600:400,background:filter===s?'var(--accent-subtle)':'transparent',borderColor:filter===s?'var(--accent-border)':'var(--border-default)',color:filter===s?'var(--accent-hover)':'var(--text-secondary)'}}>{s==='All'?'All':s.replace(/_/g,' ').toLowerCase().replace(/\w/g,c=>c.toUpperCase())}</button>)}
    </div>
    {isLoading?<PageSpinner/>:apps.length===0?(
      <Empty icon={<FileText size={24}/>} title="No applications yet" description="Browse eligible scholarships and start your first application." action={<Link to="/scholarships"><Button variant="secondary">Browse Scholarships</Button></Link>}/>
    ):(
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {apps.map((app,i)=>{const days=daysLeft(app.scholarship.deadline);return(
          <motion.div key={app.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
            <Link to={`/applications/${app.id}`} style={{textDecoration:'none'}}>
              <Card hover style={{padding:'16px 18px'}}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:14}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}><h3 style={{fontSize:14,fontWeight:600}}>{app.scholarship.name}</h3><StatusBadge status={app.status}/></div>
                    <p style={{fontSize:12,color:'var(--text-tertiary)',marginBottom:app.status==='DRAFT'?10:0}}>{app.scholarship.provider}</p>
                    {app.status==='DRAFT'&&<ProgressBar value={app.completionPercent} showLabel/>}
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <p style={{fontSize:14,fontWeight:700,color:'var(--success)'}}>{fmtAmt(app.scholarship.amount)}</p>
                    <Badge variant={days<=7?'error':days<=30?'warning':'default'} size="sm">{days>0?`${days}d left`:'Closed'}</Badge>
                  </div>
                  <ChevronRight size={17} color="var(--text-tertiary)" style={{flexShrink:0,marginTop:2}}/>
                </div>
              </Card>
            </Link>
          </motion.div>
        )})}
      </div>
    )}
  </div>
}
