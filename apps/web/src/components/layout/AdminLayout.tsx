import{Outlet,NavLink,useNavigate}from'react-router-dom'
import{GraduationCap,LayoutDashboard,BookOpen,FileText,FolderCheck,Users,LogOut,ChevronRight}from'lucide-react'
import{useAuthStore}from'@/store/authStore'

const NAV=[
  {to:'/admin',icon:LayoutDashboard,label:'Dashboard',exact:true},
  {to:'/admin/scholarships',icon:BookOpen,label:'Scholarships'},
  {to:'/admin/applications',icon:FileText,label:'Applications'},
  {to:'/admin/documents',icon:FolderCheck,label:'Documents'},
  {to:'/admin/users',icon:Users,label:'Users'}
]

export function AdminLayout(){
  const{user,logout}=useAuthStore();const navigate=useNavigate()

  return<div style={{display:'flex',minHeight:'100vh',background:'var(--bg-base)'}}>
    <aside style={{
      width:240,
      background:'#ffffff',
      borderRight:'1px solid #e2e8f0',
      display:'flex',
      flexDirection:'column',
      position:'fixed',
      top:0,
      bottom:0,
      left:0,
      boxShadow:'1px 0 3px 0 rgba(0,0,0,0.03)'
    }}>
      <div style={{padding:'20px 16px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:36,height:36,background:'#b45309',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>
          <GraduationCap size={20}/>
        </div>
        <div>
          <p style={{fontSize:16,fontWeight:800,color:'#0f172a'}}>Vidyut</p>
          <p style={{fontSize:10,color:'#b45309',fontWeight:700,letterSpacing:'0.05em',textTransform:'uppercase'}}>Admin Operations</p>
        </div>
      </div>

      <nav style={{flex:1,padding:'12px 10px',display:'flex',flexDirection:'column',gap:3}}>
        {NAV.map(({to,icon:Icon,label,exact})=>(
          <NavLink key={to} to={to} end={exact} style={{textDecoration:'none'}}>
            {({isActive})=>(
              <div style={{
                display:'flex',
                alignItems:'center',
                justifyContent:'space-between',
                padding:'10px 12px',
                borderRadius:'var(--radius-md)',
                background:isActive?'#fef3c7':'transparent',
                color:isActive?'#92400e':'#475569',
                fontWeight:isActive?600:500,
                transition:'all var(--transition)',
                cursor:'pointer'
              }}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <Icon size={17} color={isActive?'#b45309':'#64748b'}/>
                  <span style={{fontSize:13}}>{label}</span>
                </div>
                {isActive&&<ChevronRight size={14} color="#b45309"/>}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{padding:'12px 10px',borderTop:'1px solid #e2e8f0',background:'#f8fafc'}}>
        <div style={{padding:'8px 12px',display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
          <div style={{width:30,height:30,borderRadius:'50%',background:'#b45309',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff'}}>
            {user?.fullName?.[0]??'A'}
          </div>
          <div>
            <p style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{user?.fullName}</p>
            <p style={{fontSize:11,color:'#b45309',textTransform:'capitalize',fontWeight:500}}>{user?.role?.toLowerCase()}</p>
          </div>
        </div>
        <button onClick={async()=>{await logout();navigate('/login')}} style={{
          display:'flex',
          alignItems:'center',
          gap:10,
          padding:'9px 12px',
          borderRadius:'var(--radius-md)',
          background:'none',
          border:'none',
          cursor:'pointer',
          color:'#64748b',
          width:'100%',
          fontSize:13,
          fontWeight:500
        }}>
          <LogOut size={16}/>Sign out
        </button>
      </div>
    </aside>

    <main style={{marginLeft:240,flex:1,padding:'32px 40px',maxWidth:'calc(100vw - 240px)',background:'#f8fafc'}}>
      <Outlet/>
    </main>
  </div>
}
