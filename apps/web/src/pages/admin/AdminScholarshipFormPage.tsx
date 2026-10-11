import{useNavigate,useParams}from'react-router-dom'
import{useForm}from'react-hook-form'
import{useEffect}from'react'
import{useApi}from'@/hooks/useApi'
import{api}from'@/api/client'
import{Button}from'@/components/ui/Button'
import{Input}from'@/components/ui/Input'
import{Select}from'@/components/ui/Select'
import{PageSpinner}from'@/components/ui/Spinner'
import{toast}from'@/components/ui/Toast'
import{ArrowLeft}from'lucide-react'
const CATS=[{value:'GOVERNMENT',label:'Government'},{value:'PRIVATE',label:'Private'},{value:'NGO',label:'NGO'},{value:'INTERNATIONAL',label:'International'},{value:'MINORITY',label:'Minority'},{value:'MERIT',label:'Merit'},{value:'NEED_BASED',label:'Need Based'},{value:'SPORTS',label:'Sports'},{value:'RESEARCH',label:'Research'},{value:'STARTUP',label:'Startup'},{value:'STUDY_ABROAD',label:'Study Abroad'}]
const STATUSES=[{value:'ACTIVE',label:'Active'},{value:'UPCOMING',label:'Upcoming'},{value:'PAUSED',label:'Paused'},{value:'CLOSED',label:'Closed'}]
interface F{name:string;provider:string;description:string;shortDescription:string;amount:string;amountDescription:string;scholarshipCategory:string;deadline:string;officialWebsite:string;applicationUrl:string;status:string;isFeatured:boolean;isNational:boolean}
export function AdminScholarshipFormPage(){
  const{id}=useParams(),isEdit=!!id&&id!=='new',navigate=useNavigate()
  const{register,handleSubmit,reset,formState:{errors,isSubmitting}}=useForm<F>()
  const{data,isLoading}=useApi(()=>isEdit?api.get<{scholarship:any}>(`/admin/scholarships/${id}`):Promise.resolve(null),[id],{immediate:isEdit})
  useEffect(()=>{if(data?.scholarship){const s=data.scholarship;reset({name:s.name,provider:s.provider,description:s.description,shortDescription:s.shortDescription??'',amount:String(s.amount),amountDescription:s.amountDescription??'',scholarshipCategory:s.scholarshipCategory,deadline:s.deadline?.slice(0,10),officialWebsite:s.officialWebsite??'',applicationUrl:s.applicationUrl??'',status:s.status,isFeatured:s.isFeatured,isNational:s.isNational})}},[data,reset])
  const onSubmit=async(d:F)=>{
    const body={...d,amount:parseInt(d.amount),isFeatured:Boolean(d.isFeatured),isNational:Boolean(d.isNational),officialWebsite:d.officialWebsite||null,applicationUrl:d.applicationUrl||null,shortDescription:d.shortDescription||null,amountDescription:d.amountDescription||null}
    try{if(isEdit)await api.patch(`/admin/scholarships/${id}`,body);else await api.post('/admin/scholarships',body);toast(isEdit?'Updated':'Created','success');navigate('/admin/scholarships')}catch(e:unknown){toast(e instanceof Error?e.message:'Failed','error')}
  }
  if(isEdit&&isLoading)return<PageSpinner/>
  return<div style={{maxWidth:680,margin:'0 auto'}}>
    <button onClick={()=>navigate('/admin/scholarships')} style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)',fontSize:13,marginBottom:22,padding:0}}><ArrowLeft size={15}/>Back</button>
    <h1 style={{fontSize:22,fontWeight:700,marginBottom:22}}>{isEdit?'Edit Scholarship':'Add Scholarship'}</h1>
    <form onSubmit={handleSubmit(onSubmit)} style={{display:'flex',flexDirection:'column',gap:16}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div style={{gridColumn:'1/-1'}}><Input label="Scholarship Name *" {...register('name',{required:'Required'})} error={errors.name?.message} placeholder="PM YASASVI Scholarship"/></div>
        <Input label="Provider *" {...register('provider',{required:'Required'})} error={errors.provider?.message} placeholder="Ministry of Social Justice"/>
        <Input label="Amount (Rs.) *" type="number" {...register('amount',{required:'Required'})} error={errors.amount?.message} placeholder="75000"/>
        <Input label="Amount Description" {...register('amountDescription')} placeholder="Up to Rs.75,000 per year"/>
        <Select label="Category *" options={CATS} placeholder="Select category" {...register('scholarshipCategory',{required:'Required'})} error={errors.scholarshipCategory?.message}/>
        <Select label="Status" options={STATUSES} {...register('status')}/>
        <Input label="Application Deadline *" type="date" {...register('deadline',{required:'Required'})} error={errors.deadline?.message}/>
        <Input label="Short Description" {...register('shortDescription')} placeholder="Brief summary"/>
        <Input label="Official Website" type="url" {...register('officialWebsite')} placeholder="https://scholarships.gov.in"/>
        <Input label="Application URL" type="url" {...register('applicationUrl')} placeholder="https://scholarships.gov.in/apply"/>
        <div style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" id="featured" {...register('isFeatured')} style={{width:15,height:15}}/><label htmlFor="featured" style={{fontSize:12,color:'var(--text-secondary)',cursor:'pointer'}}>Featured scholarship</label></div>
        <div style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" id="national" {...register('isNational')} defaultChecked style={{width:15,height:15}}/><label htmlFor="national" style={{fontSize:12,color:'var(--text-secondary)',cursor:'pointer'}}>National (all states)</label></div>
        <div style={{gridColumn:'1/-1'}}>
          <label style={{fontSize:12,fontWeight:500,color:'var(--text-secondary)',display:'block',marginBottom:5}}>Full Description *</label>
          <textarea {...register('description',{required:'Required'})} rows={5} placeholder="Detailed description..." style={{width:'100%',background:'var(--surface-1)',border:`1px solid ${errors.description?'var(--error)':'var(--border-default)'}`,borderRadius:'var(--radius-md)',padding:'9px 12px',color:'var(--text-primary)',fontSize:13,resize:'vertical',outline:'none',fontFamily:'inherit'}}/>
          {errors.description&&<p style={{fontSize:11,color:'var(--error)',marginTop:4}}>{errors.description.message}</p>}
        </div>
      </div>
      <div style={{display:'flex',gap:10,marginTop:6}}>
        <Button type="submit" isLoading={isSubmitting}>{isEdit?'Update Scholarship':'Create Scholarship'}</Button>
        <Button type="button" variant="secondary" onClick={()=>navigate('/admin/scholarships')}>Cancel</Button>
      </div>
    </form>
  </div>
}
