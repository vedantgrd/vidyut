import{useState,useEffect}from'react'
import{useApi}from'@/hooks/useApi'
import{api}from'@/api/client'
import{Card}from'@/components/ui/Card'
import{Button}from'@/components/ui/Button'
import{toast}from'@/components/ui/Toast'
import{PageSpinner}from'@/components/ui/Spinner'
import{Bell,Shield}from'lucide-react'
interface Settings{emailDeadlineReminders:boolean;emailApplicationUpdates:boolean;emailNewMatches:boolean;pushNotifications:boolean}
function Toggle({label,desc,checked,onChange}:{label:string;desc:string;checked:boolean;onChange:(v:boolean)=>void}){
  return<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid var(--border-subtle)'}}>
    <div><p style={{fontSize:13,fontWeight:500}}>{label}</p><p style={{fontSize:11,color:'var(--text-tertiary)',marginTop:2}}>{desc}</p></div>
    <button onClick={()=>onChange(!checked)} style={{width:42,height:22,borderRadius:11,background:checked?'var(--accent)':'var(--surface-2)',border:'none',cursor:'pointer',position:'relative',transition:'background 0.2s',flexShrink:0}}>
      <div style={{position:'absolute',top:3,left:checked?22:3,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.3)'}}/>
    </button>
  </div>
}
export function SettingsPage(){
  const{data,isLoading}=useApi(()=>api.get<{settings:Settings}>('/settings'))
  const[settings,setSettings]=useState<Settings|null>(null),[saving,setSaving]=useState(false)
  useEffect(()=>{if(data?.settings)setSettings(data.settings)},[data])
  const set=(k:keyof Settings,v:boolean)=>setSettings(p=>p?{...p,[k]:v}:p)
  const save=async()=>{if(!settings)return;setSaving(true);try{await api.patch('/settings',settings);toast('Settings saved','success')}catch(e:unknown){toast(e instanceof Error?e.message:'Failed','error')}finally{setSaving(false)}}
  if(isLoading||!settings)return<PageSpinner/>
  return<div style={{maxWidth:580,margin:'0 auto'}}>
    <div style={{marginBottom:22}}><h1 style={{fontSize:26,fontWeight:700,marginBottom:4}}>Settings</h1><p style={{color:'var(--text-secondary)',fontSize:14}}>Manage your notification preferences.</p></div>
    <Card style={{marginBottom:18}}>
      <h3 style={{fontSize:14,fontWeight:600,marginBottom:4,display:'flex',alignItems:'center',gap:8}}><Bell size={15} color="var(--accent)"/>Notifications</h3>
      <p style={{fontSize:12,color:'var(--text-tertiary)',marginBottom:14}}>Control when and how you receive notifications.</p>
      <Toggle label="Deadline Reminders" desc="Get notified 7 days before scholarship deadlines" checked={settings.emailDeadlineReminders} onChange={v=>set('emailDeadlineReminders',v)}/>
      <Toggle label="Application Updates" desc="Updates when your application status changes" checked={settings.emailApplicationUpdates} onChange={v=>set('emailApplicationUpdates',v)}/>
      <Toggle label="New Eligible Scholarships" desc="When a new scholarship matches your profile" checked={settings.emailNewMatches} onChange={v=>set('emailNewMatches',v)}/>
      <Toggle label="Push Notifications" desc="In-app notification badges and alerts" checked={settings.pushNotifications} onChange={v=>set('pushNotifications',v)}/>
    </Card>
    <Card style={{marginBottom:22}}>
      <h3 style={{fontSize:14,fontWeight:600,marginBottom:4,display:'flex',alignItems:'center',gap:8}}><Shield size={15} color="var(--accent)"/>Account Security</h3>
      <p style={{fontSize:12,color:'var(--text-tertiary)',marginBottom:14}}>Manage your password and account security.</p>
      <Button variant="secondary" size="sm" onClick={()=>toast('Check your email for a password reset link','info')}>Change Password</Button>
    </Card>
    <Button onClick={save} isLoading={saving}>Save Settings</Button>
  </div>
}
