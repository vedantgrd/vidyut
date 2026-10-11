import{useState,useEffect}from'react'
import{useNavigate}from'react-router-dom'
import{Plus,Trash2,ArrowRight,ArrowLeft,GraduationCap}from'lucide-react'
import{api}from'@/api/client'
import{Button}from'@/components/ui/Button'
import{Input}from'@/components/ui/Input'
import{Select}from'@/components/ui/Select'
import{toast}from'@/components/ui/Toast'
import{useAuthStore}from'@/store/authStore'
import{PageSpinner}from'@/components/ui/Spinner'

const LEVELS=[
  {value:'CLASS_10',label:'Class 10'},
  {value:'CLASS_12',label:'Class 12'},
  {value:'DIPLOMA',label:'Diploma'},
  {value:'UNDERGRADUATE',label:'Undergraduate Degree'},
  {value:'POSTGRADUATE',label:'Postgraduate Degree'},
  {value:'DOCTORATE',label:'Doctorate (Ph.D)'},
  {value:'OTHER',label:'Other Certification'}
]

interface AR{
  level:string;
  institutionName:string;
  boardOrUniversity:string;
  courseName:string;
  branch:string;
  percentage:string;
  cgpa:string;
  passingYear:string;
  admissionYear:string;
  currentSemester:string;
  isCurrentlyPursuing:boolean;
}

const empty=():AR=>({
  level:'',
  institutionName:'',
  boardOrUniversity:'',
  courseName:'',
  branch:'',
  percentage:'',
  cgpa:'',
  passingYear:'',
  admissionYear:'',
  currentSemester:'',
  isCurrentlyPursuing:false
})

export function AcademicPage(){
  const[records,setRecords]=useState<AR[]>([{...empty(),level:'CLASS_10'},{...empty(),level:'CLASS_12'}])
  const[loading,setLoading]=useState(false)
  const[loadingExisting,setLoadingExisting]=useState(true)
  const navigate=useNavigate()
  const{user,updateUser}=useAuthStore()

  useEffect(()=>{
    async function loadSaved(){
      try{
        const res=await api.get<{data?:{academicRecords?:any[]}}>('/onboarding/status')
        const recs=res.data?.academicRecords
        if(recs && recs.length>0){
          setRecords(recs.map((r:any)=>({
            level:r.level??'',
            institutionName:r.institutionName??'',
            boardOrUniversity:r.boardOrUniversity??'',
            courseName:r.courseName??'',
            branch:r.branch??'',
            percentage:r.percentage!==null&&r.percentage!==undefined?String(r.percentage):'',
            cgpa:r.cgpa!==null&&r.cgpa!==undefined?String(r.cgpa):'',
            passingYear:r.passingYear?String(r.passingYear):'',
            admissionYear:r.admissionYear?String(r.admissionYear):'',
            currentSemester:r.currentSemester?String(r.currentSemester):'',
            isCurrentlyPursuing:!!r.isCurrentlyPursuing
          })))
        }
      }catch{
        // keep defaults
      }finally{
        setLoadingExisting(false)
      }
    }
    loadSaved()
  },[])

  const set=(i:number,k:keyof AR,v:string|boolean)=>setRecords(p=>p.map((r,idx)=>idx===i?{...r,[k]:v}:r))

  const handleSubmit=async()=>{
    if(records.length===0){
      toast('Please add at least one academic record','error')
      return
    }
    if(records.some(r=>!r.level||!r.institutionName.trim())){
      toast('Please select an education level and enter the institution name for each record','error')
      return
    }
    setLoading(true)
    try{
      await api.put('/onboarding/academic',{
        records:records.map(r=>({
          level:r.level,
          institutionName:r.institutionName.trim(),
          boardOrUniversity:r.boardOrUniversity.trim()||null,
          courseName:r.courseName.trim()||null,
          branch:r.branch.trim()||null,
          percentage:r.percentage?parseFloat(r.percentage):null,
          cgpa:r.cgpa?parseFloat(r.cgpa):null,
          passingYear:r.passingYear?parseInt(r.passingYear):null,
          admissionYear:r.admissionYear?parseInt(r.admissionYear):null,
          currentSemester:r.currentSemester?parseInt(r.currentSemester):null,
          isCurrentlyPursuing:r.isCurrentlyPursuing
        }))
      })
      updateUser({onboardingStep:Math.max(user?.onboardingStep??1,3)})
      toast('Academic records saved!','success')
      navigate('/onboarding/family')
    }catch(e:unknown){
      toast(e,'error')
    }finally{
      setLoading(false)
    }
  }

  if(loadingExisting) return <PageSpinner/>

  return<div>
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
      <GraduationCap size={24} color="#1e40af"/>
      <h2 style={{fontSize:24,fontWeight:800,color:'#0f172a'}}>Academic Records</h2>
    </div>
    <p style={{color:'#64748b',marginBottom:24,fontSize:13}}>
      Add your qualifications. Vidyut automatically calculates your eligibility for merit, stream-specific, and degree scholarships.
    </p>

    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      {records.map((rec,i)=>(
        <div key={i} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:'var(--radius-lg)',padding:20,boxShadow:'0 1px 3px rgba(0,0,0,0.03)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,borderBottom:'1px solid #f1f5f9',paddingBottom:12}}>
            <h3 style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>Qualification #{i+1}</h3>
            {records.length>1&&<Button variant="ghost" size="sm" onClick={()=>setRecords(p=>p.filter((_,idx)=>idx!==i))} leftIcon={<Trash2 size={13}/>} style={{color:'#dc2626'}}>Remove</Button>}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Select label="Education Level *" options={LEVELS} placeholder="Select level" value={rec.level} onChange={e=>set(i,'level',e.target.value)}/>
            <Input label="Institution Name *" value={rec.institutionName} onChange={e=>set(i,'institutionName',e.target.value)} placeholder="e.g. Pune Institute of Computer Technology"/>
            <Input label="Board / University" value={rec.boardOrUniversity} onChange={e=>set(i,'boardOrUniversity',e.target.value)} placeholder="e.g. Maharashtra State Board / SPPU"/>
            <Input label="Course / Degree Name" value={rec.courseName} onChange={e=>set(i,'courseName',e.target.value)} placeholder="e.g. B.Tech Computer Engineering"/>
            <Input label="Branch / Specialization" value={rec.branch} onChange={e=>set(i,'branch',e.target.value)} placeholder="e.g. Computer Science"/>
            <Input label="Percentage (%)" type="number" step="0.01" value={rec.percentage} onChange={e=>set(i,'percentage',e.target.value)} placeholder="e.g. 84.5"/>
            <Input label="CGPA (if applicable)" type="number" step="0.01" value={rec.cgpa} onChange={e=>set(i,'cgpa',e.target.value)} placeholder="e.g. 8.6"/>
            
            {rec.isCurrentlyPursuing?(
              <Input label="Current Semester" type="number" value={rec.currentSemester} onChange={e=>set(i,'currentSemester',e.target.value)} placeholder="e.g. 5"/>
            ):(
              <Input label="Year of Passing" type="number" value={rec.passingYear} onChange={e=>set(i,'passingYear',e.target.value)} placeholder="e.g. 2024"/>
            )}

            <div style={{display:'flex',alignItems:'center',gap:8,paddingTop:12}}>
              <input type="checkbox" id={`pursuing-${i}`} checked={rec.isCurrentlyPursuing} onChange={e=>set(i,'isCurrentlyPursuing',e.target.checked)} style={{width:16,height:16,accentColor:'#1e40af',cursor:'pointer'}}/>
              <label htmlFor={`pursuing-${i}`} style={{fontSize:13,color:'#475569',cursor:'pointer',fontWeight:500}}>I am currently pursuing this course</label>
            </div>
          </div>
        </div>
      ))}

      <Button variant="secondary" onClick={()=>setRecords(p=>[...p,empty()])} leftIcon={<Plus size={15}/>} style={{alignSelf:'flex-start'}}>
        Add Another Qualification
      </Button>

      <div style={{display:'flex',justifyContent:'space-between',marginTop:12,borderTop:'1px solid #e2e8f0',paddingTop:18}}>
        <Button variant="ghost" onClick={()=>navigate('/onboarding/personal')} leftIcon={<ArrowLeft size={15}/>}>Back</Button>
        <Button isLoading={loading} onClick={handleSubmit} rightIcon={<ArrowRight size={15}/>}>Save & Continue</Button>
      </div>
    </div>
  </div>
}
