import{useEffect,useState}from'react'
import{useNavigate}from'react-router-dom'
import{useForm}from'react-hook-form'
import{ArrowRight,ArrowLeft,Home}from'lucide-react'
import{api}from'@/api/client'
import{Button}from'@/components/ui/Button'
import{Input}from'@/components/ui/Input'
import{toast}from'@/components/ui/Toast'
import{useAuthStore}from'@/store/authStore'
import{PageSpinner}from'@/components/ui/Spinner'

interface F{
  fatherName:string;
  fatherOccupation:string;
  fatherIncome:string;
  motherName:string;
  motherOccupation:string;
  annualFamilyIncome:string;
  numberOfDependents:string;
  isBPL:boolean;
}

export function FamilyInfoPage(){
  const navigate=useNavigate()
  const{register,handleSubmit,reset,formState:{errors,isSubmitting}}=useForm<F>()
  const{user,updateUser}=useAuthStore()
  const[loadingExisting,setLoadingExisting]=useState(true)

  useEffect(()=>{
    async function loadExisting(){
      try{
        const res=await api.get<{data?:{family?:any}}>('/onboarding/status')
        const fi=res.data?.family
        if(fi){
          reset({
            fatherName:fi.fatherName??'',
            fatherOccupation:fi.fatherOccupation??'',
            fatherIncome:fi.fatherIncome!=null?String(fi.fatherIncome):'',
            motherName:fi.motherName??'',
            motherOccupation:fi.motherOccupation??'',
            annualFamilyIncome:fi.annualFamilyIncome!=null?String(fi.annualFamilyIncome):'',
            numberOfDependents:fi.numberOfDependents!=null?String(fi.numberOfDependents):'',
            isBPL:Boolean(fi.isBPL)
          })
        }
      }catch{
        // continue with clean form if none exists yet
      }finally{
        setLoadingExisting(false)
      }
    }
    loadExisting()
  },[reset])

  const onSubmit=async(data:F)=>{
    try{
      await api.put('/onboarding/family',{
        fatherName:data.fatherName?.trim()||null,
        fatherOccupation:data.fatherOccupation?.trim()||null,
        fatherIncome:data.fatherIncome?parseInt(data.fatherIncome):null,
        motherName:data.motherName?.trim()||null,
        motherOccupation:data.motherOccupation?.trim()||null,
        annualFamilyIncome:parseInt(data.annualFamilyIncome),
        numberOfDependents:data.numberOfDependents?parseInt(data.numberOfDependents):null,
        isBPL:Boolean(data.isBPL)
      })
      updateUser({onboardingStep:Math.max(user?.onboardingStep??1,4)})
      toast('Family details saved successfully!','success')
      navigate('/onboarding/documents')
    }catch(e:unknown){
      toast(e,'error')
    }
  }

  if(loadingExisting) return <PageSpinner/>

  return<div>
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
      <div style={{width:32,height:32,borderRadius:8,background:'#eff6ff',color:'#1e40af',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <Home size={18}/>
      </div>
      <h2 style={{fontSize:24,fontWeight:800,color:'#0f172a'}}>Family & Income Details</h2>
    </div>
    <p style={{color:'#64748b',marginBottom:24,fontSize:13}}>Annual family income is verified against need-based scholarship criteria. Keep this updated.</p>

    <form onSubmit={handleSubmit(onSubmit)} style={{display:'flex',flexDirection:'column',gap:18}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <Input label="Father's / Primary Guardian's Name" {...register('fatherName')} placeholder="e.g. Ramesh Sharma"/>
        <Input label="Father's Occupation" {...register('fatherOccupation')} placeholder="e.g. Government Employee / Agriculture"/>
        <Input label="Father's Annual Income (Rs.)" type="number" {...register('fatherIncome')} placeholder="150000"/>
        
        <Input label="Mother's / Secondary Guardian's Name" {...register('motherName')} placeholder="e.g. Sunita Sharma"/>
        <Input label="Mother's Occupation" {...register('motherOccupation')} placeholder="e.g. Homemaker / Teacher"/>
        
        <div style={{gridColumn:'1/-1'}}>
          <Input 
            label="Combined Annual Family Income (Rs.) *" 
            type="number" 
            {...register('annualFamilyIncome',{required:'Combined annual income is required',min:{value:0,message:'Must be >= 0'}})} 
            error={errors.annualFamilyIncome?.message} 
            placeholder="e.g. 250000"
          />
        </div>

        <Input label="Number of Family Dependents" type="number" {...register('numberOfDependents')} placeholder="e.g. 4"/>

        <div style={{display:'flex',alignItems:'center',gap:10,paddingTop:24}}>
          <input 
            type="checkbox" 
            id="isBPL" 
            {...register('isBPL')} 
            style={{width:18,height:18,accentColor:'#1e40af',cursor:'pointer'}}
          />
          <label htmlFor="isBPL" style={{fontSize:13,color:'#334155',cursor:'pointer',fontWeight:500}}>
            Family holds a Below Poverty Line (BPL) card / Ration Card
          </label>
        </div>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
        <Button variant="ghost" type="button" onClick={()=>navigate('/onboarding/academic')} leftIcon={<ArrowLeft size={15}/>}>
          Back
        </Button>
        <Button type="submit" isLoading={isSubmitting} rightIcon={<ArrowRight size={15}/>}>
          Save & Continue
        </Button>
      </div>
    </form>
  </div>
}
