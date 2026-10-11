import{useEffect,useState}from'react'
import{useNavigate}from'react-router-dom'
import{useForm}from'react-hook-form'
import{api}from'@/api/client'
import{Button}from'@/components/ui/Button'
import{Input}from'@/components/ui/Input'
import{Select}from'@/components/ui/Select'
import{toast}from'@/components/ui/Toast'
import{useAuthStore}from'@/store/authStore'
import{ArrowRight}from'lucide-react'
import{PageSpinner}from'@/components/ui/Spinner'

const CATS=['GENERAL','OBC','SC','ST','EWS','OTHER'].map(v=>({value:v,label:v}))
const GENDERS=[
  {value:'MALE',label:'Male'},
  {value:'FEMALE',label:'Female'},
  {value:'OTHER',label:'Other'},
  {value:'PREFER_NOT_TO_SAY',label:'Prefer not to say'}
]
const STATES=[
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh'
].map(s=>({value:s,label:s}))

interface FormData{
  fullName:string;
  dateOfBirth:string;
  gender:string;
  phone:string;
  category:string;
  domicileState:string;
  addressLine1:string;
  addressLine2:string;
  city:string;
  state:string;
  pincode:string;
  religion:string;
}

export function PersonalInfoPage(){
  const navigate=useNavigate()
  const{register,handleSubmit,reset,formState:{errors,isSubmitting}}=useForm<FormData>()
  const{user,updateUser}=useAuthStore()
  const[loadingExisting,setLoadingExisting]=useState(true)

  // Fetch persisted data so re-visiting never wipes out existing state
  useEffect(()=>{
    async function loadSaved(){
      try{
        const res=await api.get<{data?:{personal?:any};user?:any}>('/onboarding/status')
        const p=res.data?.personal
        if(p || user){
          reset({
            fullName:user?.fullName??'',
            dateOfBirth:p?.dateOfBirth?new Date(p.dateOfBirth).toISOString().slice(0,10):'',
            gender:p?.gender??'',
            phone:p?.phone??'',
            category:p?.category??'',
            domicileState:p?.domicileState??'',
            addressLine1:p?.addressLine1??'',
            addressLine2:p?.addressLine2??'',
            city:p?.city??'',
            state:p?.state??'',
            pincode:p?.pincode??'',
            religion:p?.religion??''
          })
        }
      }catch{
        // Fallback to auth user fullName
        if(user?.fullName) reset({fullName:user.fullName} as any)
      }finally{
        setLoadingExisting(false)
      }
    }
    loadSaved()
  },[reset,user])

  const onSubmit=async(data:FormData)=>{
    try{
      await api.put('/onboarding/personal',{
        fullName:data.fullName.trim(),
        dateOfBirth:data.dateOfBirth,
        gender:data.gender,
        phone:data.phone.trim(),
        category:data.category,
        domicileState:data.domicileState,
        addressLine1:data.addressLine1.trim(),
        addressLine2:data.addressLine2?.trim()||null,
        city:data.city.trim(),
        state:data.state,
        pincode:data.pincode.trim(),
        religion:data.religion?.trim()||null
      })
      updateUser({fullName:data.fullName.trim(),onboardingStep:Math.max(user?.onboardingStep??1,2)})
      toast('Personal details saved successfully!','success')
      navigate('/onboarding/academic')
    }catch(e:unknown){
      toast(e,'error')
    }
  }

  if(loadingExisting) return <PageSpinner/>

  return<div>
    <h2 style={{fontSize:24,fontWeight:800,color:'#0f172a',marginBottom:6}}>Personal Information</h2>
    <p style={{color:'#64748b',marginBottom:24,fontSize:13}}>Tell Vidyut once. This information is reused to verify scholarship criteria automatically.</p>

    <form onSubmit={handleSubmit(onSubmit)} style={{display:'flex',flexDirection:'column',gap:18}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div style={{gridColumn:'1/-1'}}>
          <Input label="Full Name (as per government records / Aadhaar) *" {...register('fullName',{required:'Full name is required'})} error={errors.fullName?.message} placeholder="e.g. Arjun Sharma"/>
        </div>
        <Input label="Date of Birth *" type="date" {...register('dateOfBirth',{required:'Date of birth is required'})} error={errors.dateOfBirth?.message}/>
        <Select label="Gender *" options={GENDERS} placeholder="Select gender" {...register('gender',{required:'Gender is required'})} error={errors.gender?.message}/>
        <Input label="Phone Number *" {...register('phone',{required:'Phone number is required',minLength:{value:10,message:'Must be at least 10 digits'}})} error={errors.phone?.message} placeholder="9876543210"/>
        <Input label="Religion (optional)" {...register('religion')} placeholder="e.g. Hindu, Muslim, Sikh, Christian"/>
        <Select label="Social Category *" options={CATS} placeholder="Select category" {...register('category',{required:'Category is required'})} error={errors.category?.message}/>
        <Select label="Domicile State *" options={STATES} placeholder="Select domicile state" {...register('domicileState',{required:'Domicile state is required'})} error={errors.domicileState?.message}/>
        
        <div style={{gridColumn:'1/-1'}}><hr style={{border:'none',borderTop:'1px solid #e2e8f0',margin:'6px 0'}}/></div>
        
        <div style={{gridColumn:'1/-1'}}>
          <Input label="Address Line 1 *" {...register('addressLine1',{required:'Address is required'})} error={errors.addressLine1?.message} placeholder="House / Flat / Street address"/>
        </div>
        <div style={{gridColumn:'1/-1'}}>
          <Input label="Address Line 2 (optional)" {...register('addressLine2')} placeholder="Apartment, suite, landmark"/>
        </div>
        <Input label="City / Town *" {...register('city',{required:'City is required'})} error={errors.city?.message} placeholder="e.g. Pune"/>
        <Select label="Current State *" options={STATES} placeholder="Select state" {...register('state',{required:'State is required'})} error={errors.state?.message}/>
        <Input label="Pincode *" {...register('pincode',{required:'Pincode is required',minLength:{value:6,message:'6 digits required'},maxLength:{value:6,message:'6 digits required'}})} error={errors.pincode?.message} placeholder="411001"/>
      </div>
      <Button type="submit" isLoading={isSubmitting} rightIcon={<ArrowRight size={15}/>} style={{alignSelf:'flex-end',marginTop:8}}>
        Save & Continue
      </Button>
    </form>
  </div>
}
