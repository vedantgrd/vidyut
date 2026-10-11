import{useApi}from'@/hooks/useApi'
import{api}from'@/api/client'
import{PageSpinner}from'@/components/ui/Spinner'
import{Card}from'@/components/ui/Card'
import{StatusBadge}from'@/components/ui/StatusBadge'
import{Users,BookOpen,FileText,FolderCheck,TrendingUp,Award}from'lucide-react'
interface AdminStats{totalStudents:number;totalScholarships:number;activeScholarships:number;totalApplications:number;pendingReview:number;pendingDocuments:number}
export function AdminDashboardPage(){
  const{data,isLoading}=useApi(()=>api.get<{stats:AdminStats;recentApplications:any[]}>('/admin/dashboard'))
  if(isLoading||!data)return<PageSpinner/>
  const{stats}=data
  const statCards=[{label:'Total Students',value:stats.totalStudents,icon:Users,color:'var(--accent)'},{label:'Scholarships',value:stats.totalScholarships,icon:BookOpen,color:'var(--success)'},{label:'Applications',value:stats.totalApplications,icon:FileText,color:'var(--info)'},{label:'Pending Review',value:stats.pendingReview,icon:TrendingUp,color:'var(--warning)'},{label:'Active Scholarships',value:stats.activeScholarships,icon:Award,color:'var(--success)'},{label:'Docs Pending',value:stats.pendingDocuments,icon:FolderCheck,color:'var(--error)'}]
  return<div>
    <div style={{marginBottom:22}}><h1 style={{fontSize:26,fontWeight:700,marginBottom:4}}>Admin Dashboard</h1><p style={{color:'var(--text-secondary)',fontSize:14}}>Platform activity overview.</p></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:22}}>
      {statCards.map((s,i)=>{const Icon=s.icon;return<Card key={i} style={{padding:18}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}><div style={{width:34,height:34,borderRadius:10,background:`${s.color}18`,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon size={17} color={s.color}/></div><span style={{fontSize:26,fontWeight:700}}>{s.value}</span></div><p style={{fontSize:12,color:'var(--text-tertiary)'}}>{s.label}</p></Card>})}
    </div>
    <Card>
      <h3 style={{fontSize:14,fontWeight:600,marginBottom:14}}>Recent Applications</h3>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {data.recentApplications.map((app:any)=>(
          <div key={app.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',background:'var(--surface-2)',borderRadius:'var(--radius-md)'}}>
            <div><p style={{fontSize:13,fontWeight:500}}>{app.user?.fullName}</p><p style={{fontSize:11,color:'var(--text-tertiary)'}}>{app.scholarship?.name}</p></div>
            <StatusBadge status={app.status}/>
          </div>
        ))}
      </div>
    </Card>
  </div>
}
