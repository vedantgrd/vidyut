import{PrismaClient}from'@prisma/client'
import bcrypt from'bcryptjs'
const prisma=new PrismaClient()

type RT='INCOME_MAX'|'INCOME_MIN'|'CATEGORY'|'EDUCATION_LEVEL'|'MIN_PERCENTAGE'|'MIN_CGPA'|'STATE'|'GENDER'|'AGE_MIN'|'AGE_MAX'|'DISABILITY'|'MINORITY'|'RELIGION'
type RO='EQUALS'|'NOT_EQUALS'|'LESS_THAN_OR_EQUAL'|'GREATER_THAN_OR_EQUAL'|'IN'|'NOT_IN'
type DT='AADHAAR'|'PAN'|'INCOME_CERTIFICATE'|'CASTE_CERTIFICATE'|'DOMICILE_CERTIFICATE'|'TENTH_MARKSHEET'|'TWELFTH_MARKSHEET'|'DIPLOMA_MARKSHEET'|'DEGREE_CERTIFICATE'|'TRANSCRIPT'|'DISABILITY_CERTIFICATE'|'BANK_PASSBOOK'|'PHOTOGRAPH'|'COLLEGE_ID'|'BONAFIDE_CERTIFICATE'|'ADMISSION_PROOF'|'FEE_RECEIPT'|'OTHER'
type SC='GOVERNMENT'|'PRIVATE'|'NGO'|'INTERNATIONAL'|'MINORITY'|'MERIT'|'NEED_BASED'|'SPORTS'|'RESEARCH'|'STARTUP'|'STUDY_ABROAD'

interface Inst{installmentNo:number;name:string;amount:number;description?:string}
interface SD{slug:string;name:string;provider:string;description:string;shortDescription:string;amount:number;amountDescription:string;scholarshipCategory:SC;tags:string[];isFeatured:boolean;isNational:boolean;states:string[];daysUntilDeadline:number;officialWebsite?:string;paymentType?:'ONE_TIME'|'INSTALLMENTS'|'VARIABLE';installments?:Inst[];eligibilityRules:Rule[];requiredDocuments:Doc[]}

const r={
  incomeMax:(v:number,d:string):Rule=>({ruleType:'INCOME_MAX',operator:'LESS_THAN_OR_EQUAL',value:{value:v},isRequired:true,description:d}),
  cat:(v:string[],d:string):Rule=>({ruleType:'CATEGORY',operator:'IN',value:{values:v},isRequired:true,description:d}),
  edu:(v:string[],d:string,req=true):Rule=>({ruleType:'EDUCATION_LEVEL',operator:'IN',value:{values:v},isRequired:req,description:d}),
  pct:(v:number,d:string,req=true):Rule=>({ruleType:'MIN_PERCENTAGE',operator:'GREATER_THAN_OR_EQUAL',value:{value:v},isRequired:req,description:d}),
  cgpa:(v:number,d:string):Rule=>({ruleType:'MIN_CGPA',operator:'GREATER_THAN_OR_EQUAL',value:{value:v},isRequired:true,description:d}),
  state:(v:string[],d:string):Rule=>({ruleType:'STATE',operator:'IN',value:{values:v},isRequired:true,description:d}),
  gender:(v:string,d:string):Rule=>({ruleType:'GENDER',operator:'EQUALS',value:{value:v},isRequired:true,description:d}),
  ageMax:(v:number,d:string):Rule=>({ruleType:'AGE_MAX',operator:'LESS_THAN_OR_EQUAL',value:{value:v},isRequired:true,description:d}),
  dis:(v:boolean,d:string):Rule=>({ruleType:'DISABILITY',operator:'EQUALS',value:{value:v},isRequired:true,description:d}),
  rel:(v:string[],d:string):Rule=>({ruleType:'RELIGION',operator:'IN',value:{values:v},isRequired:true,description:d}),
}
const d={
  aa:():Doc=>({documentType:'AADHAAR',label:'Aadhaar Card',isOptional:false,description:null}),
  inc:():Doc=>({documentType:'INCOME_CERTIFICATE',label:'Income Certificate',isOptional:false,description:null}),
  ph:():Doc=>({documentType:'PHOTOGRAPH',label:'Passport Photo',isOptional:false,description:null}),
  caste:():Doc=>({documentType:'CASTE_CERTIFICATE',label:'Caste Certificate',isOptional:false,description:null}),
  dom:():Doc=>({documentType:'DOMICILE_CERTIFICATE',label:'Domicile Certificate',isOptional:false,description:null}),
  ten:():Doc=>({documentType:'TENTH_MARKSHEET',label:'Class 10 Marksheet',isOptional:false,description:null}),
  twl:():Doc=>({documentType:'TWELFTH_MARKSHEET',label:'Class 12 Marksheet',isOptional:false,description:null}),
  deg:():Doc=>({documentType:'DEGREE_CERTIFICATE',label:'Degree Certificate',isOptional:false,description:null}),
  tra:():Doc=>({documentType:'TRANSCRIPT',label:'Academic Transcript',isOptional:false,description:null}),
  bnk:():Doc=>({documentType:'BANK_PASSBOOK',label:'Bank Passbook',isOptional:false,description:null}),
  col:():Doc=>({documentType:'COLLEGE_ID',label:'College ID / Bonafide',isOptional:false,description:null}),
  dsc:():Doc=>({documentType:'DISABILITY_CERTIFICATE',label:'Disability Certificate',isOptional:false,description:null}),
}
const B=():Doc[]=>[d.aa(),d.inc(),d.ph()]

const scholarships:SD[]=[
  // P0 Demo Scholarship - Zero document requirements, open to all demo students!
  {slug:'vidyut-demo-scholarship',name:'Vidyut Demo Scholarship',provider:'Vidyut Foundation',shortDescription:'Test scholarship open to all students with no document requirements.',description:'A simple demo scholarship for testing the complete end-to-end Vidyut application flow seamlessly. No documents are required, and all students are eligible.',amount:10000,amountDescription:'₹10,000 one-time grant',scholarshipCategory:'MERIT',tags:['Demo','Instant Apply','All Categories'],isFeatured:true,isNational:true,states:[],daysUntilDeadline:120,paymentType:'ONE_TIME',eligibilityRules:[],requiredDocuments:[]},
  
  // P0 Multi-Installment Demonstration Scholarship (MahaDBT-style 2-installment grant)
  {
    slug:'vidyut-education-support',
    name:'Vidyut Education Support Scholarship',
    provider:'Vidyut Foundation & Higher Education Directorate',
    shortDescription:'Comprehensive academic assistance grant disbursed across 2 bi-annual installments.',
    description:'Designed to assist undergraduate and diploma scholars throughout the academic year. The scholarship total of ₹20,000 is distributed in two tranches of ₹10,000 to cover tuition fees and study materials.',
    amount:20000,
    amountDescription:'₹20,000 paid in 2 equal installments (₹10,000 + ₹10,000)',
    scholarshipCategory:'GOVERNMENT',
    tags:['Installments','DBT','Undergraduate','Engineering'],
    isFeatured:true,
    isNational:true,
    states:[],
    daysUntilDeadline:90,
    paymentType:'INSTALLMENTS',
    installments:[
      {installmentNo:1,name:'First Semester Fee Grant',amount:10000,description:'Disbursed upon document verification and enrollment approval.'},
      {installmentNo:2,name:'Second Semester Study Grant',amount:10000,description:'Disbursed upon midterm progression review.'}
    ],
    eligibilityRules:[
      r.incomeMax(800000,'Family income must not exceed ₹8,00,000'),
      r.edu(['CLASS_12','DIPLOMA','UNDERGRADUATE','POSTGRADUATE'],'Enrolled in recognized higher education')
    ],
    requiredDocuments:[...B()]
  },
  {slug:'pm-yashasvi',name:'PM YASASVI Scholarship',provider:'Ministry of Social Justice, Govt. of India',shortDescription:'Central scholarship for OBC, EBC and DNT students.',description:'PM Young Achievers Scholarship Award Scheme for Vibrant India provides financial assistance to OBC, EBC, and DNT students for Class 12 and undergraduate education.',amount:75000,amountDescription:'Up to ₹75,000 per year',scholarshipCategory:'GOVERNMENT',tags:['OBC','Central Government'],isFeatured:true,isNational:true,states:[],daysUntilDeadline:75,officialWebsite:'https://scholarships.gov.in',eligibilityRules:[r.cat(['OBC','OTHER'],'Must belong to OBC, EBC, or DNT community'),r.incomeMax(250000,'Family income must not exceed ₹2,50,000'),r.edu(['CLASS_12','UNDERGRADUATE'],'Class 12 or undergraduate')],requiredDocuments:[...B(),d.caste(),d.ten(),d.col()]},
  {slug:'post-matric-sc',name:'Post Matric Scholarship for Scheduled Castes',provider:'Ministry of Social Justice, Govt. of India',shortDescription:'Scholarship for SC students pursuing post-matric education.',description:'Provides financial support to Scheduled Caste students studying at post-matriculation level.',amount:84000,amountDescription:'Up to ₹84,000 per year',scholarshipCategory:'GOVERNMENT',tags:['SC','Post Matric'],isFeatured:true,isNational:true,states:[],daysUntilDeadline:60,officialWebsite:'https://scholarships.gov.in',eligibilityRules:[r.cat(['SC'],'Must belong to Scheduled Caste'),r.incomeMax(250000,'Family income must not exceed ₹2,50,000'),r.edu(['CLASS_12','DIPLOMA','UNDERGRADUATE','POSTGRADUATE'],'Class 12 and above')],requiredDocuments:[...B(),d.caste(),d.ten(),d.bnk()]},
  {slug:'post-matric-st',name:'Post Matric Scholarship for Scheduled Tribes',provider:'Ministry of Tribal Affairs, Govt. of India',shortDescription:'Financial assistance for ST students pursuing post-matric courses.',description:'Provides financial assistance to Scheduled Tribe students for post-matriculation studies.',amount:84000,amountDescription:'Up to ₹84,000 per year',scholarshipCategory:'GOVERNMENT',tags:['ST','Tribal'],isFeatured:false,isNational:true,states:[],daysUntilDeadline:60,officialWebsite:'https://scholarships.gov.in',eligibilityRules:[r.cat(['ST'],'Must belong to Scheduled Tribe'),r.incomeMax(250000,'Family income must not exceed ₹2,50,000'),r.edu(['CLASS_12','DIPLOMA','UNDERGRADUATE','POSTGRADUATE'],'Class 12 and above')],requiredDocuments:[...B(),d.caste(),d.bnk()]},
  {slug:'central-sector-merit',name:'Central Sector Scheme of Scholarship',provider:'Department of Higher Education, Govt. of India',shortDescription:'Merit-based scholarship for college students from low-income families.',description:'Provides financial assistance to meritorious students from low-income families at college/university level.',amount:20000,amountDescription:'₹10,000-₹20,000 per year',scholarshipCategory:'GOVERNMENT',tags:['Merit','All Categories'],isFeatured:true,isNational:true,states:[],daysUntilDeadline:75,officialWebsite:'https://scholarships.gov.in',eligibilityRules:[r.incomeMax(800000,'Family income must not exceed ₹8,00,000'),r.edu(['UNDERGRADUATE','POSTGRADUATE'],'UG or PG level'),r.pct(80,'Top 20 percentile in Class 12',false)],requiredDocuments:[...B(),d.twl(),d.col()]},
  {slug:'aicte-pragati',name:'AICTE Pragati Scholarship for Girl Students',provider:'All India Council for Technical Education',shortDescription:'Scholarship for girl students in AICTE-approved technical institutions.',description:'Provides financial assistance to girl students pursuing technical education in AICTE-approved institutions.',amount:30000,amountDescription:'₹30,000 per year',scholarshipCategory:'GOVERNMENT',tags:['Girls','Engineering'],isFeatured:true,isNational:true,states:[],daysUntilDeadline:45,eligibilityRules:[r.gender('FEMALE','Open to girl students only'),r.incomeMax(800000,'Family income must not exceed ₹8,00,000'),r.edu(['UNDERGRADUATE','DIPLOMA'],'AICTE-approved technical programme')],requiredDocuments:[...B(),d.twl(),d.col(),d.bnk()]},
  {slug:'aicte-saksham',name:'AICTE Saksham Scholarship for Specially Abled',provider:'All India Council for Technical Education',shortDescription:'Scholarship for students with disabilities in technical education.',description:'Financial assistance for specially-abled students in AICTE-approved technical institutions.',amount:50000,amountDescription:'₹50,000 per year',scholarshipCategory:'GOVERNMENT',tags:['Disability','Technical'],isFeatured:false,isNational:true,states:[],daysUntilDeadline:45,eligibilityRules:[r.dis(true,'Must have minimum 40% disability'),r.incomeMax(800000,'Family income must not exceed ₹8,00,000'),r.edu(['UNDERGRADUATE','DIPLOMA'],'AICTE-approved technical programme')],requiredDocuments:[...B(),d.dsc(),d.col()]},
  {slug:'merit-cum-means-minority',name:'Merit-cum-Means Scholarship for Minority Communities',provider:'Ministry of Minority Affairs, Govt. of India',shortDescription:'Scholarship for minority students in professional and technical courses.',description:'Financial assistance to minority community students pursuing professional/technical courses.',amount:30000,amountDescription:'Course fee up to ₹20,000 + ₹10,000 maintenance',scholarshipCategory:'MINORITY',tags:['Minority','Professional'],isFeatured:true,isNational:true,states:[],daysUntilDeadline:45,eligibilityRules:[r.rel(['Muslim','Christian','Sikh','Buddhist','Jain','Zoroastrian'],'Must belong to a notified minority community'),r.incomeMax(250000,'Family income must not exceed ₹2,50,000'),r.edu(['UNDERGRADUATE','POSTGRADUATE'],'Professional/technical course')],requiredDocuments:[...B(),d.ten(),d.twl(),d.bnk()]},
  {slug:'inspire-she',name:'INSPIRE Scholarship for Higher Education',provider:'Department of Science and Technology, Govt. of India',shortDescription:'Scholarship for students pursuing Natural Sciences at UG level.',description:'Targets students choosing Natural Sciences at undergraduate level to attract talent to research careers.',amount:80000,amountDescription:'₹80,000 per year',scholarshipCategory:'MERIT',tags:['Science','Research'],isFeatured:false,isNational:true,states:[],daysUntilDeadline:45,eligibilityRules:[r.edu(['UNDERGRADUATE'],'B.Sc/Integrated M.Sc in Natural Sciences'),r.pct(85,'Top 1% of Class 12 board results',false)],requiredDocuments:[d.aa(),d.ph(),d.twl(),d.col()]},
  {slug:'pmrf',name:"Prime Minister's Research Fellowship",provider:'Ministry of Education, Govt. of India',shortDescription:'Prestigious fellowship for top graduates to pursue PhD at IITs/IISc.',description:'Identifies talented students to undertake doctoral research at IITs and IISc with generous fellowship.',amount:840000,amountDescription:'₹70,000/month + ₹2 lakh/year research grant',scholarshipCategory:'RESEARCH',tags:['PhD','IIT','IISc'],isFeatured:true,isNational:true,states:[],daysUntilDeadline:190,eligibilityRules:[r.edu(['DOCTORATE'],'Seeking PhD at IITs/IISc'),r.cgpa(8.0,'Minimum CGPA 8.0'),r.ageMax(27,'Must not exceed 27 years')],requiredDocuments:[d.aa(),d.tra(),d.deg()]},
  {slug:'maharashtra-obc',name:'Maharashtra State OBC Scholarship',provider:'Social Justice Department, Maharashtra',shortDescription:'State scholarship for OBC students in Maharashtra.',description:'Provides scholarships to OBC/VJNT/SBC students covering tuition fees and maintenance allowance.',amount:60000,amountDescription:'Tuition reimbursement + up to ₹60,000 maintenance',scholarshipCategory:'GOVERNMENT',tags:['OBC','Maharashtra'],isFeatured:false,isNational:false,states:['Maharashtra'],daysUntilDeadline:105,eligibilityRules:[r.state(['Maharashtra'],'Must be domicile of Maharashtra'),r.cat(['OBC'],'OBC/VJNT/SBC category'),r.incomeMax(800000,'Family income must not exceed ₹8,00,000'),r.edu(['CLASS_12','DIPLOMA','UNDERGRADUATE','POSTGRADUATE'],'Class 11 and above')],requiredDocuments:[...B(),d.caste(),d.dom()]},
  {slug:'tata-pankh',name:'Tata Capital Pankh Scholarship',provider:'Tata Capital',shortDescription:'Scholarship for meritorious students from financially weaker sections.',description:'Financial assistance to meritorious students from economically weaker backgrounds.',amount:12000,amountDescription:'Up to ₹12,000 per year',scholarshipCategory:'PRIVATE',tags:['Tata','Corporate'],isFeatured:true,isNational:true,states:[],daysUntilDeadline:30,eligibilityRules:[r.incomeMax(400000,'Family income must not exceed ₹4,00,000'),r.pct(60,'Minimum 60% in previous class',false),r.edu(['CLASS_12','DIPLOMA','UNDERGRADUATE'],'Class 11, 12, graduation, or diploma')],requiredDocuments:[...B(),d.ten(),d.bnk()]},
  {slug:'reliance-ug',name:'Reliance Foundation Undergraduate Scholarship',provider:'Reliance Foundation',shortDescription:'Undergraduate scholarship for meritorious students across disciplines.',description:'Financial assistance to meritorious UG students in Engineering, Humanities, Sciences, and Commerce.',amount:200000,amountDescription:'Up to ₹2,00,000/year Engineering; ₹50,000 others',scholarshipCategory:'PRIVATE',tags:['Reliance','Engineering'],isFeatured:true,isNational:true,states:[],daysUntilDeadline:135,eligibilityRules:[r.incomeMax(1500000,'Family income must not exceed ₹15,00,000'),r.edu(['UNDERGRADUATE'],'First year of undergraduate degree')],requiredDocuments:[...B(),d.twl(),d.col(),d.bnk()]},
  {slug:'kotak-kanya',name:'Kotak Kanya Scholarship',provider:'Kotak Education Foundation',shortDescription:'Scholarship for girl students from underprivileged families.',description:'Encourages higher education among girl students from underprivileged families.',amount:150000,amountDescription:'Up to ₹1,50,000 per year',scholarshipCategory:'PRIVATE',tags:['Kotak','Girls'],isFeatured:true,isNational:true,states:[],daysUntilDeadline:45,eligibilityRules:[r.gender('FEMALE','Open to girl students only'),r.incomeMax(350000,'Family income must not exceed ₹3,50,000'),r.pct(75,'Minimum 75% in Class 12'),r.edu(['CLASS_12','UNDERGRADUATE'],'Class 11/12 or first year UG')],requiredDocuments:[...B(),d.ten(),d.twl(),d.bnk()]},
  {slug:'google-india-cs',name:'Google Scholarship India for CS Students',provider:'Google India',shortDescription:'Scholarship for underrepresented groups pursuing Computer Science.',description:'Supports students from underrepresented groups in technology pursuing undergraduate CS.',amount:100000,amountDescription:'₹1,00,000 one-time grant',scholarshipCategory:'PRIVATE',tags:['Google','Computer Science'],isFeatured:true,isNational:true,states:[],daysUntilDeadline:105,eligibilityRules:[r.edu(['UNDERGRADUATE'],'B.Tech/B.E/B.Sc in CS or related field'),r.pct(60,'Minimum 60% in Class 12')],requiredDocuments:[d.aa(),d.twl(),d.col(),d.tra()]},
  {slug:'amazon-future-engineer',name:'Amazon Future Engineer Scholarship',provider:'Amazon India',shortDescription:'Scholarship for first-generation college students pursuing CS/IT.',description:'Supports first-generation college students from low-income backgrounds studying CS.',amount:150000,amountDescription:'₹1,50,000 per year + internship',scholarshipCategory:'PRIVATE',tags:['Amazon','Computer Science'],isFeatured:false,isNational:true,states:[],daysUntilDeadline:120,eligibilityRules:[r.incomeMax(500000,'Family income must not exceed ₹5,00,000'),r.pct(75,'Minimum 75% in Class 12'),r.edu(['UNDERGRADUATE'],'B.Tech/B.E in CSE or IT')],requiredDocuments:[...B(),d.twl(),d.col()]},
  {slug:'iit-fee-waiver',name:'IIT Scholarship and Fee Waiver (JEE Advanced)',provider:'Indian Institutes of Technology',shortDescription:'Fee waivers for SC/ST/EWS students admitted to IITs.',description:'Students from SC/ST/EWS admitted through JEE Advanced eligible for full or partial fee waivers.',amount:200000,amountDescription:'Full tuition waiver + ₹1,000/month',scholarshipCategory:'GOVERNMENT',tags:['IIT','JEE Advanced','Engineering'],isFeatured:true,isNational:true,states:[],daysUntilDeadline:105,eligibilityRules:[r.cat(['SC','ST','EWS'],'SC, ST, or EWS category'),r.incomeMax(900000,'Family income must not exceed ₹9,00,000'),r.edu(['UNDERGRADUATE'],'Admitted to an IIT through JEE Advanced')],requiredDocuments:[...B(),d.caste(),d.twl(),d.col()]},
  {slug:'commonwealth-masters',name:"Commonwealth Scholarship for Master's in UK",provider:'Commonwealth Scholarship Commission, UK',shortDescription:"Full scholarship for Indian students to pursue Master's in the UK.",description:"Funded by the UK government for Commonwealth candidates to pursue full-time Master's degrees.",amount:3000000,amountDescription:'Full tuition + 1,348 GBP/month + flights',scholarshipCategory:'STUDY_ABROAD',tags:['UK','Commonwealth'],isFeatured:true,isNational:true,states:[],daysUntilDeadline:75,eligibilityRules:[r.edu(['POSTGRADUATE'],"Applying for a Master's degree in the UK")],requiredDocuments:[d.aa(),d.deg(),d.tra()]},
  {slug:'fulbright-nehru',name:"Fulbright-Nehru Master's Fellowship",provider:'United States-India Educational Foundation',shortDescription:"Fellowship for Indian citizens to pursue Master's at US universities.",description:"Designed for Indian professionals and scholars to pursue a Master's at a US host institution.",amount:5000000,amountDescription:'Full support incl. visa, airfare, tuition, stipend',scholarshipCategory:'STUDY_ABROAD',tags:['USA','Fulbright'],isFeatured:true,isNational:true,states:[],daysUntilDeadline:180,eligibilityRules:[r.edu(['UNDERGRADUATE','POSTGRADUATE'],'Must hold a 4-year UG degree')],requiredDocuments:[d.aa(),d.deg(),d.bnk()]},
  {slug:'khelo-india',name:'Khelo India Scholarship',provider:'Ministry of Youth Affairs and Sports, Govt. of India',shortDescription:'Annual scholarship for young talented athletes.',description:'Part of Khelo India initiative providing scholarships with sports science support.',amount:60000,amountDescription:'₹5,000 per month for 8 years',scholarshipCategory:'SPORTS',tags:['Sports','Youth'],isFeatured:false,isNational:true,states:[],daysUntilDeadline:105,eligibilityRules:[r.edu(['CLASS_12','UNDERGRADUATE'],'Currently enrolled in school/college')],requiredDocuments:[d.aa(),d.col(),d.ph()]},
  {slug:'nmms',name:'National Means-cum-Merit Scholarship',provider:'Department of School Education, Ministry of Education',shortDescription:'Scholarship for meritorious students from economically weaker sections.',description:'Awards scholarships to meritorious students of economically weaker sections to reduce dropout rates.',amount:12000,amountDescription:'₹1,000 per month',scholarshipCategory:'NEED_BASED',tags:['Means-cum-Merit'],isFeatured:false,isNational:true,states:[],daysUntilDeadline:90,eligibilityRules:[r.incomeMax(350000,'Family income must not exceed ₹3,50,000'),r.edu(['CLASS_10','CLASS_12'],'Class 9-12')],requiredDocuments:[...B(),d.ten(),d.bnk()]},
]

async function main(){
  console.log('Seeding database with dynamic future deadlines...')
  const now=new Date()
  const ph=await bcrypt.hash('Demo@1234',12)
  const ah=await bcrypt.hash('Admin@1234',12)

  const adminUser=await prisma.user.upsert({
    where:{email:'admin@vidyut.in'},
    update:{},
    create:{
      email:'admin@vidyut.in',
      passwordHash:ah,
      fullName:'Vidyut Admin',
      isEmailVerified:true,
      role:'ADMIN',
      onboardingComplete:true,
      onboardingStep:5,
      settings:{create:{}}
    }
  })
  console.log('Admin created: admin@vidyut.in')

  const demoUser=await prisma.user.upsert({
    where:{email:'demo@vidyut.in'},
    update:{},
    create:{
      email:'demo@vidyut.in',
      passwordHash:ph,
      fullName:'Arjun Sharma',
      isEmailVerified:true,
      role:'STUDENT',
      onboardingComplete:true,
      onboardingStep:5,
      studentProfile:{
        create:{
          dateOfBirth:new Date('2004-06-15'),
          gender:'MALE',
          phone:'9876543210',
          category:'OBC',
          domicileState:'Maharashtra',
          nationality:'Indian',
          addressLine1:'Flat 302, Sunrise Apartments',
          city:'Pune',
          state:'Maharashtra',
          pincode:'411001',
          skills:['Python','Web Development','Machine Learning'],
          achievements:['First Prize State Science Olympiad 2019'],
          languages:['Hindi','English','Marathi'],
          isStepComplete:true
        }
      },
      familyInfo:{
        create:{
          fatherName:'Ramesh Sharma',
          fatherOccupation:'Government Clerk',
          motherName:'Sunita Sharma',
          annualFamilyIncome:250000,
          isBPL:false,
          numberOfDependents:4,
          isStepComplete:true
        }
      },
      academicRecords:{
        create:[
          {level:'CLASS_10',institutionName:'St. Xavier School',boardOrUniversity:'Maharashtra State Board',percentage:88.4,passingYear:2018},
          {level:'CLASS_12',institutionName:'St. Xavier Junior College',boardOrUniversity:'Maharashtra State Board',percentage:82.6,passingYear:2020},
          {level:'UNDERGRADUATE',institutionName:'Savitribai Phule Pune University',courseName:'B.Tech Computer Engineering',branch:'Computer Engineering',cgpa:8.2,admissionYear:2022,currentSemester:5,isCurrentlyPursuing:true},
        ]
      },
      settings:{create:{}},
    }
  })
  console.log('Demo student created: demo@vidyut.in')

  for(const s of scholarships){
    const deadlineDate=new Date(now.getTime() + s.daysUntilDeadline * 86400000)
    await prisma.scholarship.upsert({
      where:{slug:s.slug},
      update:{
        name:s.name,
        provider:s.provider,
        description:s.description,
        shortDescription:s.shortDescription,
        amount:s.amount,
        amountDescription:s.amountDescription,
        scholarshipCategory:s.scholarshipCategory,
        tags:s.tags,
        isFeatured:s.isFeatured,
        isNational:s.isNational,
        states:s.states,
        deadline:deadlineDate,
        paymentType:s.paymentType??'ONE_TIME',
        status:'ACTIVE'
      },
      create:{
        slug:s.slug,
        name:s.name,
        provider:s.provider,
        description:s.description,
        shortDescription:s.shortDescription,
        amount:s.amount,
        amountDescription:s.amountDescription,
        scholarshipCategory:s.scholarshipCategory,
        tags:s.tags,
        isFeatured:s.isFeatured,
        isNational:s.isNational,
        states:s.states,
        deadline:deadlineDate,
        officialWebsite:s.officialWebsite??null,
        paymentType:s.paymentType??'ONE_TIME',
        status:'ACTIVE',
        createdByAdminId:adminUser.id,
        eligibilityRules:{
          create:s.eligibilityRules.map(rule=>({
            ruleType:rule.ruleType,
            operator:rule.operator,
            value:rule.value as any,
            isRequired:rule.isRequired,
            description:rule.description
          }))
        },
        requiredDocuments:{
          create:s.requiredDocuments.map(doc=>({
            documentType:doc.documentType,
            label:doc.label,
            isOptional:doc.isOptional,
            description:doc.description
          }))
        },
        installments:s.installments?{
          create:s.installments.map(inst=>({
            installmentNo:inst.installmentNo,
            name:inst.name,
            amount:inst.amount,
            description:inst.description
          }))
        }:undefined
      },
    })

    if(s.installments){
      for(const inst of s.installments){
        const sc=await prisma.scholarship.findUnique({where:{slug:s.slug}})
        if(sc){
          await prisma.scholarshipInstallment.upsert({
            where:{scholarshipId_installmentNo:{scholarshipId:sc.id,installmentNo:inst.installmentNo}},
            update:{name:inst.name,amount:inst.amount,description:inst.description},
            create:{scholarshipId:sc.id,installmentNo:inst.installmentNo,name:inst.name,amount:inst.amount,description:inst.description}
          })
        }
      }
    }
  }
  console.log(`${scholarships.length} scholarships seeded with active future deadlines.`)

  await prisma.notification.createMany({
    data:[
      {userId:demoUser.id,type:'SYSTEM',title:'Welcome to Vidyut!',message:'Your profile is complete. View scholarships you are eligible for.',link:'/dashboard'},
      {userId:demoUser.id,type:'DEADLINE_REMINDER',title:'Deadline Approaching',message:'PM YASASVI Scholarship deadline is coming up soon.',link:'/scholarships/pm-yashasvi'},
    ]
  }).catch(()=>{})

  console.log('\nDatabase seeded successfully!')
  console.log('  Student: demo@vidyut.in  / Demo@1234')
  console.log('  Admin:   admin@vidyut.in / Admin@1234')
}

main().catch(e=>{console.error('Seed failed:',e);process.exit(1)}).finally(()=>prisma.$disconnect())
