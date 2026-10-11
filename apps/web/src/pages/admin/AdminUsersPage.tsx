import{useApi}from'@/hooks/useApi'
import{api}from'@/api/client'
import{PageSpinner}from'@/components/ui/Spinner'
import{Card}from'@/components/ui/Card'
import{Badge}from'@/components/ui/Badge'
import{Users}from'lucide-react'
import{Empty}from'@/components/ui/Empty'
export function AdminUsersPage(){
  const{data,isLoading}=useApi(()=>api.get<{users:any[]}>('/admin/users'))
  function fmtDate(d:string){return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
  const roleVariant=(role:string)=>role==='ADMIN'?'warning':role==='REVIEWER'?'info':'default'
  return<div>
    <div style={{marginBottom:22}}><h1 style={{fontSize:26,fontWeight:700,marginBottom:4}}>User Management</h1><p style={{color:'var(--text-secondary)',fontSize:14}}>View and manage platform users.</p></div>
    {isLoading?<PageSpinner/>:!data?.users.length?(
      <Empty icon={<Users size={24}/>} title="No users found"/>
    ):(
      <Card style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'1px solid var(--border-subtle)'}}>
              {['Name','Email','Role','Apps','Joined','Status'].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:600,color:'var(--text-tertiary)',whiteSpace:'nowrap'}}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.users.map((u:any,i:number)=>(
              <tr key={u.id} style={{borderBottom:i<data.users.length-1?'1px solid var(--border-subtle)':'none'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--surface-1)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'10px 14px',fontSize:13,fontWeight:500}}>{u.fullName}</td>
                <td style={{padding:'10px 14px',fontSize:12,color:'var(--text-secondary)'}}>{u.email}</td>
                <td style={{padding:'10px 14px'}}><Badge variant={roleVariant(u.role) as any} size="sm">{u.role}</Badge></td>
                <td style={{padding:'10px 14px',fontSize:12,color:'var(--text-secondary)',textAlign:'center'}}>{u._count?.applications??0}</td>
                <td style={{padding:'10px 14px',fontSize:11,color:'var(--text-tertiary)',whiteSpace:'nowrap'}}>{fmtDate(u.createdAt)}</td>
                <td style={{padding:'10px 14px'}}><Badge variant={u.isEmailVerified?'success':'warning'} size="sm">{u.isEmailVerified?'Verified':'Unverified'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    )}
  </div>
}
