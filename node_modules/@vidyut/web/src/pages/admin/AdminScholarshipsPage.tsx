import{useState}from'react'
import{Link}from'react-router-dom'
import{Plus,Edit,Trash2,BookOpen}from'lucide-react'
import{useApi}from'@/hooks/useApi'
import{api}from'@/api/client'
import{PageSpinner}from'@/components/ui/Spinner'
import{Card}from'@/components/ui/Card'
import{Button}from'@/components/ui/Button'
import{Badge}from'@/components/ui/Badge'
import{StatusBadge}from'@/components/ui/StatusBadge'
import{Empty}from'@/components/ui/Empty'
import{toast}from'@/components/ui/Toast'
function fmtAmt(a:number){return a>=100000?`Rs.${(a/100000).toFixed(1)}L`:`Rs.${a.toLocaleString('en-IN')}`}
export function AdminScholarshipsPage(){
  const{data,isLoading,refetch}=useApi(()=>api.get<{scholarships:any[]}>('/admin/scholarships'))
  const[deleting,setDeleting]=useState<string|null>(null)
  const del=async(id:string,name:string)=>{if(!confirm(`Delete "${name}"?`))return;setDeleting(id);try{await api.delete(`/admin/scholarships/${id}`);await refetch();toast('Deleted','info')}catch(e:unknown){toast(e instanceof Error?e.message:'Failed','error')}finally{setDeleting(null)}}
  return<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
      <div><h1 style={{fontSize:26,fontWeight:700,marginBottom:4}}>Scholarships</h1><p style={{color:'var(--text-secondary)',fontSize:14}}>Manage scholarship listings.</p></div>
      <Link to="/admin/scholarships/new" style={{textDecoration:'none'}}><Button leftIcon={<Plus size={15}/>}>Add Scholarship</Button></Link>
    </div>
    {isLoading?<PageSpinner/>:!data?.scholarships.length?(
      <Empty icon={<BookOpen size={24}/>} title="No scholarships yet" action={<Link to="/admin/scholarships/new"><Button leftIcon={<Plus size={13}/>}>Add Scholarship</Button></Link>}/>
    ):(
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {data.scholarships.map((s:any)=>(
          <Card key={s.id} style={{padding:'14px 18px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:14}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}><h3 style={{fontSize:13,fontWeight:600}}>{s.name}</h3><StatusBadge status={s.status}/>{s.isFeatured&&<Badge variant="accent" size="sm">Featured</Badge>}</div>
                <p style={{fontSize:11,color:'var(--text-tertiary)',marginBottom:5}}>{s.provider}</p>
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                  <span style={{fontSize:11,color:'var(--text-secondary)'}}>{fmtAmt(s.amount)}</span>
                  <span style={{fontSize:11,color:'var(--text-tertiary)'}}>{s._count?.eligibilityRules??0} rules</span>
                  <span style={{fontSize:11,color:'var(--text-tertiary)'}}>{s._count?.applications??0} applications</span>
                </div>
              </div>
              <div style={{display:'flex',gap:7,flexShrink:0}}>
                <Link to={`/admin/scholarships/${s.id}/edit`} style={{textDecoration:'none'}}><Button variant="secondary" size="sm" leftIcon={<Edit size={12}/>}>Edit</Button></Link>
                <Button variant="danger" size="sm" leftIcon={<Trash2 size={12}/>} isLoading={deleting===s.id} onClick={()=>del(s.id,s.name)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )}
  </div>
}
