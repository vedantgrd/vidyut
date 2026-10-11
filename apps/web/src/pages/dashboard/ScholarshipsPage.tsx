import{useState}from'react'
import{motion}from'framer-motion'
import{Search,Award,ChevronRight}from'lucide-react'
import{Link}from'react-router-dom'
import{useApi}from'@/hooks/useApi'
import{api}from'@/api/client'
import type{Scholarship}from'@/types'
import{PageSpinner}from'@/components/ui/Spinner'
import{Card}from'@/components/ui/Card'
import{Button}from'@/components/ui/Button'
import{Badge}from'@/components/ui/Badge'
import{Input}from'@/components/ui/Input'
import{Select}from'@/components/ui/Select'
import{Empty}from'@/components/ui/Empty'
const CATS=[{value:'',label:'All Categories'},{value:'GOVERNMENT',label:'Government'},{value:'PRIVATE',label:'Private'},{value:'NGO',label:'NGO'},{value:'MINORITY',label:'Minority'},{value:'MERIT',label:'Merit'},{value:'NEED_BASED',label:'Need Based'},{value:'SPORTS',label:'Sports'},{value:'RESEARCH',label:'Research'},{value:'STUDY_ABROAD',label:'Study Abroad'}]
const SORTS=[{value:'matchScore',label:'Best match'},{value:'deadline',label:'Deadline'},{value:'amount',label:'Amount'},{value:'newest',label:'Newest'}]
function daysLeft(d:string){return Math.ceil((new Date(d).getTime()-Date.now())/86400000)}
function fmtAmt(a:number){return a>=100000?`Rs.${(a/100000).toFixed(1)}L`:`Rs.${a.toLocaleString('en-IN')}`}
export function ScholarshipsPage(){
  const[search,setSearch]=useState(''),[category,setCategory]=useState(''),[sortBy,setSortBy]=useState('matchScore'),[onlyEligible,setOnlyEligible]=useState(true),[page,setPage]=useState(1)
  const qs=new URLSearchParams({page:String(page),limit:'12',sortBy,...(search&&{search}),...(category&&{category}),...(onlyEligible&&{onlyEligible:'true'})}).toString()
  const{data,isLoading}=useApi(()=>api.get<{scholarships:Scholarship[];pagination:{page:number;totalPages:number;total:number}}>(`/scholarships?${qs}`),[qs])
  return<div>
    <div style={{marginBottom:22}}><h1 style={{fontSize:26,fontWeight:700,marginBottom:4}}>Scholarships</h1><p style={{color:'var(--text-secondary)',fontSize:14}}>Matched to your profile and eligibility.</p></div>
    <Card style={{marginBottom:20,padding:14}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto auto auto',gap:10,alignItems:'end'}}>
        <Input placeholder="Search..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} leftIcon={<Search size={14}/>}/>
        <Select options={CATS} value={category} onChange={e=>{setCategory(e.target.value);setPage(1)}} style={{width:170}}/>
        <Select options={SORTS} value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{width:150}}/>
        <div style={{display:'flex',alignItems:'center',gap:7,height:38}}>
          <input type="checkbox" id="eligible" checked={onlyEligible} onChange={e=>{setOnlyEligible(e.target.checked);setPage(1)}} style={{width:15,height:15}}/>
          <label htmlFor="eligible" style={{fontSize:12,color:'var(--text-secondary)',cursor:'pointer',whiteSpace:'nowrap'}}>Eligible only</label>
        </div>
      </div>
    </Card>
    {isLoading?<PageSpinner/>:data?.scholarships.length===0?(
      <Empty icon={<Award size={24}/>} title="No scholarships found" description="Try adjusting filters or disabling 'eligible only'." action={<Button variant="secondary" onClick={()=>{setSearch('');setCategory('');setOnlyEligible(false)}}>Clear filters</Button>}/>
    ):(
      <>
        <p style={{fontSize:12,color:'var(--text-tertiary)',marginBottom:14}}>{data?.pagination.total??0} scholarships found</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
          {data?.scholarships.map((s,i)=>{const days=daysLeft(s.deadline);return(
            <motion.div key={s.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
              <Card hover style={{display:'flex',flexDirection:'column',height:'100%',padding:18}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <Badge variant={s.isEligible?'success':'default'} dot>{s.isEligible?`${s.matchScore}% match`:'Check eligibility'}</Badge>
                  {days<=30&&days>0&&<Badge variant={days<=7?'error':'warning'}>{days}d</Badge>}
                </div>
                <h3 style={{fontSize:13,fontWeight:600,marginBottom:4,lineHeight:1.4,flex:1}}>{s.name}</h3>
                <p style={{fontSize:11,color:'var(--text-tertiary)',marginBottom:8}}>{s.provider}</p>
                {s.shortDescription&&<p style={{fontSize:11,color:'var(--text-secondary)',marginBottom:10,lineHeight:1.5}}>{s.shortDescription}</p>}
                <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:12}}>{s.tags.slice(0,3).map(t=><Badge key={t} variant="default" size="sm">{t}</Badge>)}</div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'auto'}}>
                  <span style={{fontSize:14,fontWeight:700,color:'var(--success)'}}>{fmtAmt(s.amount)}</span>
                  <Link to={`/scholarships/${s.id}`} style={{textDecoration:'none'}}><Button size="sm" rightIcon={<ChevronRight size={13}/>}>Details</Button></Link>
                </div>
              </Card>
            </motion.div>
          )})}
        </div>
        {data&&data.pagination.totalPages>1&&(
          <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:24}}>
            <Button variant="secondary" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</Button>
            <span style={{display:'flex',alignItems:'center',color:'var(--text-secondary)',fontSize:13,padding:'0 12px'}}>Page {page} of {data.pagination.totalPages}</span>
            <Button variant="secondary" disabled={page>=data.pagination.totalPages} onClick={()=>setPage(p=>p+1)}>Next</Button>
          </div>
        )}
      </>
    )}
  </div>
}
