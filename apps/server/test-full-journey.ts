import { prisma } from './src/lib/prisma.js'

const API_BASE = (process.env.API_BASE_URL || process.env.LIVE_API_URL || 'http://localhost:3001/api/v1').replace(/\/+$/, '')

interface TestResult {
  step: string
  success: boolean
  details?: string
}

const results: TestResult[] = []

function assert(condition: boolean, step: string, details?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${step}${details ? ` (${details})` : ''}`)
    results.push({ step, success: true, details })
  } else {
    console.error(`  ❌ [FAIL] ${step}${details ? ` (${details})` : ''}`)
    results.push({ step, success: false, details })
    throw new Error(`Assertion failed: ${step} - ${details}`)
  }
}

async function run() {
  console.log('\n======================================================')
  console.log('⚡ VIDYUT END-TO-END QA & JOURNEY VALIDATION SUITE')
  console.log('======================================================\n')

  const testEmail = `qa.student.${Date.now()}@vidyut-test.in`
  const testPassword = 'Password@1234'
  const secondStudentEmail = `qa.intruder.${Date.now()}@vidyut-test.in`

  let studentToken = ''
  let studentUserId = ''
  let secondStudentToken = ''
  let secondStudentUserId = ''
  let adminToken = ''
  let adminUserId = ''

  let uploadedDocId = ''
  let testAppId = ''
  let testScholarshipId = ''

  try {
    // ========================================================
    // 1. AUTHENTICATION & ACCESS CONTROL
    // ========================================================
    console.log('--- 1. Testing Authentication & Authorization ---')

    // 1.1 Register Student
    const regRes = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'QA Test Student',
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword
      })
    })
    const regData = await regRes.json()
    assert(regRes.status === 201, 'Student registration HTTP 201', `ID: ${regData.user?.id}`)
    assert(Boolean(regData.accessToken), 'Access token received upon registration')
    studentToken = regData.accessToken
    studentUserId = regData.user.id

    // 1.2 Prevent duplicate registration
    const dupRes = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'QA Duplicate',
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword
      })
    })
    assert(dupRes.status === 409, 'Duplicate email registration rejected with 409 Conflict')

    // 1.3 Register a second student for IDOR and boundary tests
    const secondReg = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'QA Intruder Student',
        email: secondStudentEmail,
        password: testPassword,
        confirmPassword: testPassword
      })
    })
    const secondData = await secondReg.json()
    assert(secondReg.status === 201, 'Second student registered for boundary isolation')
    secondStudentToken = secondData.accessToken
    secondStudentUserId = secondData.user.id

    // 1.4 Invalid credentials login
    const badLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword' })
    })
    assert(badLogin.status === 401, 'Invalid password rejected with 401 Unauthorized')

    // 1.5 Valid login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    })
    const loginData = await loginRes.json()
    assert(loginRes.status === 200, 'Valid student login HTTP 200')
    assert(Boolean(loginData.accessToken), 'Valid student token acquired on login')

    // 1.6 Admin Login
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@vidyut.in', password: 'Admin@1234' })
    })
    const adminData = await adminLoginRes.json()
    assert(adminLoginRes.status === 200, 'Admin login HTTP 200')
    assert(adminData.user?.role === 'ADMIN', 'Admin user verified with ADMIN role')
    adminToken = adminData.accessToken
    adminUserId = adminData.user.id

    // 1.7 Security Barrier: Student cannot access Admin route
    const forbiddenRes = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    assert(forbiddenRes.status === 403, 'Student blocked from admin route with 403 Forbidden')

    // 1.8 Unauthenticated request to protected route
    const unauthRes = await fetch(`${API_BASE}/profile`, {
      headers: { Authorization: 'Bearer invalid.token.signature' }
    })
    assert(unauthRes.status === 401, 'Invalid token blocked with 401 Unauthorized')

    // ========================================================
    // 2. ONBOARDING & PROFILE MANAGEMENT
    // ========================================================
    console.log('\n--- 2. Testing Onboarding & Profile Persistence ---')

    // 2.1 Update Personal Profile
    const personalRes = await fetch(`${API_BASE}/onboarding/personal`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        dateOfBirth: '2004-05-15',
        gender: 'MALE',
        phone: '9876543210',
        category: 'OBC',
        domicileState: 'Maharashtra',
        nationality: 'Indian',
        addressLine1: '42 MG Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001'
      })
    })
    assert(personalRes.status === 200, 'Personal details saved via onboarding /personal')

    // 2.2 Update Family Finances
    const familyRes = await fetch(`${API_BASE}/onboarding/family`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        fatherName: 'Ram Sharma',
        fatherOccupation: 'Clerk',
        annualFamilyIncome: 200000,
        isBPL: false,
        numberOfDependents: 4
      })
    })
    assert(familyRes.status === 200, 'Family finances saved via onboarding /family')

    // 2.3 Update Academic Records
    const academicRes = await fetch(`${API_BASE}/onboarding/academic`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        records: [
          {
            level: 'CLASS_10',
            institutionName: 'Pune High School',
            boardOrUniversity: 'Maharashtra State Board',
            percentage: 85.5,
            passingYear: 2019
          },
          {
            level: 'CLASS_12',
            institutionName: 'Pune Junior College',
            boardOrUniversity: 'Maharashtra State Board',
            percentage: 82.0,
            passingYear: 2021
          },
          {
            level: 'UNDERGRADUATE',
            institutionName: 'COEP Technological University',
            courseName: 'B.Tech Computer Engineering',
            branch: 'Computer Science',
            cgpa: 8.4,
            currentSemester: 5,
            isCurrentlyPursuing: true
          }
        ]
      })
    })
    assert(academicRes.status === 200, 'Academic records saved via onboarding /academic')

    // 2.4 Verify Profile Persistence via GET /profile
    const profileRes = await fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    const profileData = await profileRes.json()
    assert(profileRes.status === 200, 'Profile loaded from database')
    assert(profileData.studentProfile?.phone === '9876543210', 'Phone persisted correctly')
    assert(profileData.familyInfo?.annualFamilyIncome === 200000, 'Annual income persisted correctly')
    assert(profileData.academicRecords?.length === 3, 'All 3 academic records persisted')
    assert(profileData.profileScore > 50, 'Profile score calculated dynamically', `${profileData.profileScore}%`)

    // ========================================================
    // 3. DOCUMENT VAULT & IDOR AUDITING
    // ========================================================
    console.log('\n--- 3. Testing Document Vault & File Security ---')

    // 3.1 Upload Aadhaar card (mock PDF)
    const mockPdfBuffer = Buffer.from('%PDF-1.4 Mock Aadhaar Document Body EOF')
    const formAadhaar = new FormData()
    formAadhaar.append('file', new Blob([mockPdfBuffer], { type: 'application/pdf' }), 'aadhaar.pdf')
    formAadhaar.append('type', 'AADHAAR')
    formAadhaar.append('label', 'Aadhaar Card')

    const uploadRes = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: formAadhaar
    })
    const uploadData = await uploadRes.json()
    assert(uploadRes.status === 201, 'Document uploaded successfully to vault HTTP 201')
    assert(uploadData.document?.type === 'AADHAAR', 'Document record type matches AADHAAR')
    uploadedDocId = uploadData.document.id

    // 3.2 Duplicate Document Detection
    const formDup = new FormData()
    formDup.append('file', new Blob([mockPdfBuffer], { type: 'application/pdf' }), 'aadhaar_dup.pdf')
    formDup.append('type', 'AADHAAR')
    formDup.append('label', 'Aadhaar Card Copy')

    const dupUpload = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: formDup
    })
    assert(dupUpload.status === 409, 'Duplicate document type detected and blocked with 409 Conflict')

    // 3.3 Replace Existing Document with replace=true
    formDup.append('replace', 'true')
    const replaceUpload = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: formDup
    })
    const replaceData = await replaceUpload.json()
    assert(replaceUpload.status === 200 && replaceData.replaced === true, 'Document replacement succeeds gracefully HTTP 200')

    // 3.4 Upload Income Certificate
    const formInc = new FormData()
    formInc.append('file', new Blob([mockPdfBuffer], { type: 'application/pdf' }), 'income.pdf')
    formInc.append('type', 'INCOME_CERTIFICATE')
    formInc.append('label', 'Tahsildar Income Certificate')
    const incUpload = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: formInc
    })
    assert(incUpload.status === 201, 'Income certificate uploaded to vault')

    // 3.5 Upload Passport Photo
    const formPhoto = new FormData()
    formPhoto.append('file', new Blob([mockPdfBuffer], { type: 'image/png' }), 'photo.png')
    formPhoto.append('type', 'PHOTOGRAPH')
    formPhoto.append('label', 'Passport Photo')
    const photoUpload = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: formPhoto
    })
    assert(photoUpload.status === 201, 'Photograph uploaded to vault')

    // 3.6 Stream Document Preview as Owner
    const streamOwner = await fetch(`${API_BASE}/documents/${uploadedDocId}/file`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    assert(streamOwner.status === 200, 'Owner can stream and preview vault document HTTP 200')

    // 3.7 IDOR Test: Other student CANNOT access this private document
    const streamIntruder = await fetch(`${API_BASE}/documents/${uploadedDocId}/file`, {
      headers: { Authorization: `Bearer ${secondStudentToken}` }
    })
    assert(streamIntruder.status === 403, 'Intruder student cannot access another student document (IDOR protected: 403 Forbidden)')

    // 3.8 Administrator CAN preview student's document for verification
    const streamAdmin = await fetch(`${API_BASE}/documents/${uploadedDocId}/file`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    assert(streamAdmin.status === 200, 'Administrator can preview student document for verification HTTP 200')

    // ========================================================
    // 4. SCHOLARSHIP DISCOVERY & ELIGIBILITY MATCHING
    // ========================================================
    console.log('\n--- 4. Testing Scholarship Discovery & Eligibility Matching ---')

    // 4.1 Discover Scholarships
    const scholRes = await fetch(`${API_BASE}/scholarships?limit=25`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    const scholData = await scholRes.json()
    assert(scholRes.status === 200, 'Scholarships retrieved from database')
    assert(scholData.scholarships?.length > 0, `Total scholarships available: ${scholData.scholarships.length}`)

    // 4.2 Verify Multi-Installment Scholarship is present
    const installmentSch = scholData.scholarships.find((s: any) => s.slug === 'vidyut-education-support')
    assert(Boolean(installmentSch), 'Multi-installment scholarship "vidyut-education-support" found')
    testScholarshipId = installmentSch.id

    // 4.3 Inspect Eligibility Score Calculation
    assert(typeof installmentSch.matchScore === 'number', 'Dynamic match score computed', `${installmentSch.matchScore}%`)
    assert(installmentSch.isEligible === true, 'Student eligible based on income <= 8L and Higher Ed level')

    // ========================================================
    // 5. APPLICATION SUBMISSION & TRACKING
    // ========================================================
    console.log('\n--- 5. Testing Application Creation, Linking & Submission ---')

    // 5.1 Create Application
    const createAppRes = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ scholarshipId: testScholarshipId })
    })
    const appData = await createAppRes.json()
    assert(createAppRes.status === 201 || createAppRes.status === 200, 'Application record created/retrieved in DB')
    testAppId = appData.application.id
    assert(appData.application.status === 'DRAFT', 'New application initial status is DRAFT')

    // 5.2 Fetch Application with prefill and auto-linked documents
    const getAppRes = await fetch(`${API_BASE}/applications/${testAppId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    const appDetails = await getAppRes.json()
    assert(getAppRes.status === 200, 'Application details retrieved with prefill dossier')
    assert(Boolean(appDetails.prefill?.fullName), 'Prefill dossier contains student name')
    assert(appDetails.application.documents?.length > 0, 'Vault documents automatically linked to required slots', `${appDetails.application.documents.length} docs linked`)

    // 5.3 Submit Application
    const submitRes = await fetch(`${API_BASE}/applications/${testAppId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ confirmDeclaration: true })
    })
    const submitData = await submitRes.json()
    assert(submitRes.status === 200, 'Application submitted atomically HTTP 200')
    assert(submitData.application?.status === 'SUBMITTED', 'Application status transitioned to SUBMITTED')

    // 5.4 Prevent Duplicate Submission
    const reSubmit = await fetch(`${API_BASE}/applications/${testAppId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ confirmDeclaration: true })
    })
    assert(reSubmit.status === 400, 'Duplicate submission blocked with 400 ALREADY_SUBMITTED')

    // 5.5 Check Notifications for Student
    const notifRes = await fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    const notifData = await notifRes.json()
    assert(notifRes.status === 200, 'Student notifications retrieved')
    const submitNotif = notifData.notifications?.find((n: any) => n.type === 'APPLICATION_SUBMITTED')
    assert(Boolean(submitNotif), 'Application submitted notification generated in database')

    // ========================================================
    // 6. ADMINISTRATOR REVIEW & APPROVAL WORKFLOW
    // ========================================================
    console.log('\n--- 6. Testing Administrator Review Pipeline ---')

    // 6.1 Admin Dashboard Metrics
    const adminDashRes = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    const adminDashData = await adminDashRes.json()
    assert(adminDashRes.status === 200, 'Admin dashboard metrics retrieved HTTP 200')
    assert(adminDashData.stats?.totalApplications > 0, 'Total applications metric reflects database state')

    // 6.2 Admin Inspects Application Dossier
    const adminAppRes = await fetch(`${API_BASE}/admin/applications/${testAppId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    const adminAppDossier = await adminAppRes.json()
    assert(adminAppRes.status === 200, 'Admin successfully inspected full candidate dossier HTTP 200')
    assert(adminAppDossier.application?.user?.fullName === 'QA Test Student', 'Candidate identity matches in dossier')

    // 6.3 Document Verification Queue
    const verifyDocRes = await fetch(`${API_BASE}/documents/admin/${uploadedDocId}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'VERIFIED' })
    })
    assert(verifyDocRes.status === 200, 'Administrator marked student document as VERIFIED')

    // 6.4 Transition Application: SUBMITTED -> DOCUMENTS_VERIFIED
    const step1Review = await fetch(`${API_BASE}/admin/applications/${testAppId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'DOCUMENTS_VERIFIED',
        note: 'All uploaded certificates cross-verified against originals.'
      })
    })
    assert(step1Review.status === 200, 'Application status updated to DOCUMENTS_VERIFIED')

    // 6.5 Transition Application: DOCUMENTS_VERIFIED -> UNDER_REVIEW
    const step2Review = await fetch(`${API_BASE}/admin/applications/${testAppId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'UNDER_REVIEW',
        note: 'Review committee evaluating merit criteria.'
      })
    })
    assert(step2Review.status === 200, 'Application status updated to UNDER_REVIEW')

    // 6.6 Transition Application: UNDER_REVIEW -> APPROVED
    const step3Review = await fetch(`${API_BASE}/admin/applications/${testAppId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'APPROVED',
        note: 'Candidate approved for scholarship grant.'
      })
    })
    const approvedData = await step3Review.json()
    assert(step3Review.status === 200, 'Application status updated to APPROVED')
    assert(approvedData.application?.disbursementStatus === 'PENDING', 'Disbursement status initialized to PENDING')

    // ========================================================
    // 7. DBT DISBURSEMENT & INSTALLMENTS
    // ========================================================
    console.log('\n--- 7. Testing DBT Disbursement & Financial Audit Trail ---')

    // 7.1 Disburse Installment 1 (₹10,000)
    const disburse1 = await fetch(`${API_BASE}/admin/applications/${testAppId}/disburse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        installmentNo: 1,
        amount: 10000,
        referenceCode: 'DBT-PUNE-2026-TR1',
        notes: 'First tranche disbursed for tuition fee reimbursement'
      })
    })
    const disburse1Data = await disburse1.json()
    assert(disburse1.status === 201, 'Installment 1 disbursed atomically HTTP 201')
    assert(disburse1Data.disbursement?.referenceCode === 'DBT-PUNE-2026-TR1', 'Bank reference code recorded correctly')

    // 7.2 Prevent Over-Disbursement: Attempting to disburse ₹15,000 when remaining is ₹10,000
    const overDisburse = await fetch(`${API_BASE}/admin/applications/${testAppId}/disburse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        installmentNo: 2,
        amount: 15000
      })
    })
    assert(overDisburse.status === 400, 'Over-disbursement attempt blocked with 400 Bad Request')

    // 7.3 Disburse Installment 2 (₹10,000 - full settlement)
    const disburse2 = await fetch(`${API_BASE}/admin/applications/${testAppId}/disburse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        installmentNo: 2,
        amount: 10000,
        referenceCode: 'DBT-PUNE-2026-TR2',
        notes: 'Second tranche disbursed for books and study materials'
      })
    })
    assert(disburse2.status === 201, 'Installment 2 disbursed atomically HTTP 201')

    // 7.4 Verify Student Views Updated Totals & Audit Trail
    const studentFinalApp = await fetch(`${API_BASE}/applications/${testAppId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    const finalAppData = await studentFinalApp.json()
    assert(studentFinalApp.status === 200, 'Student can view final application status')
    assert(finalAppData.application?.disbursedAmount === 20000, 'Total disbursed amount equals ₹20,000 (100% grant settled)')
    assert(finalAppData.application?.disbursements?.length === 2, 'All 2 installment tranches visible in audit trail')
    assert(finalAppData.application?.statusHistory?.length >= 4, 'Complete chronological status audit trail preserved')

    // ========================================================
    // 8. TESTING SMART SCHOLARSHIP CALENDAR & STUDENT TASKS
    // ========================================================
    console.log('\n--- 8. Testing Smart Scholarship Calendar & Student Tasks ---')

    // 8.1 Fetch Calendar Events
    const calRes = await fetch(`${API_BASE}/calendar/events`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    const calData = await calRes.json()
    assert(calRes.status === 200, 'Calendar events retrieved HTTP 200')
    assert(Array.isArray(calData.events), 'Events returned as an array')
    assert(calData.events.length > 0, `Events retrieved: ${calData.events.length}`)
    // Verify date-only format without timezone drift
    const allDatesValid = calData.events.every((e: any) => /^\d{4}-\d{2}-\d{2}$/.test(e.date))
    assert(allDatesValid, 'All calendar event dates formatted as date-only YYYY-MM-DD')

    // 8.2 iCalendar Export (.ics)
    const icsRes = await fetch(`${API_BASE}/calendar/export.ics`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    assert(icsRes.status === 200, 'Calendar .ics export generated HTTP 200')
    const icsText = await icsRes.text()
    assert(icsText.includes('BEGIN:VCALENDAR') && icsText.includes('END:VCALENDAR'), 'RFC-5545 standard VCALENDAR structure verified')

    // 8.3 Create Student Task
    const createTaskRes = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Verify College Fee Receipt',
        description: 'Ensure college stamp and registrar seal are visible',
        dueDate: '2026-11-15',
        priority: 'HIGH',
        scholarshipId: testScholarshipId
      })
    })
    const taskData = await createTaskRes.json()
    assert(createTaskRes.status === 201, 'Student task created HTTP 201')
    const createdTaskId = taskData.task.id
    assert(taskData.task.isCompleted === false, 'Initial task isCompleted is false')

    // 8.4 Toggle Task Completion
    const toggleTaskRes = await fetch(`${API_BASE}/tasks/${createdTaskId}/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    const toggleData = await toggleTaskRes.json()
    assert(toggleTaskRes.status === 200 && toggleData.task.isCompleted === true, 'Task toggled to isCompleted === true')

    // 8.5 Boundary Isolation on Tasks: Intruder cannot modify task
    const intruderToggle = await fetch(`${API_BASE}/tasks/${createdTaskId}/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secondStudentToken}` }
    })
    assert(intruderToggle.status === 403, 'Intruder blocked from toggling another student task HTTP 403 Forbidden')

    // 8.6 Sync Suggested Tasks from Application Requirements
    const suggestedTasksRes = await fetch(`${API_BASE}/tasks/sync-suggested`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    const suggestedData = await suggestedTasksRes.json()
    assert(suggestedTasksRes.status === 200, 'Suggested requirement tasks synced HTTP 200')
    assert(typeof suggestedData.generatedCount === 'number', `Suggested sync returns generatedCount (${suggestedData.generatedCount} tasks)`)

    // 8.7 Delete Personal Task
    const deleteTaskRes = await fetch(`${API_BASE}/tasks/${createdTaskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    assert(deleteTaskRes.status === 200, 'Student task deleted HTTP 200')

    // ========================================================
    // 9. TESTING INTELLIGENT DOCUMENT VAULT & METADATA
    // ========================================================
    console.log('\n--- 9. Testing Intelligent Document Vault & Metadata ---')

    // 9.1 Vault Health Summary
    const vaultSummaryRes = await fetch(`${API_BASE}/documents/vault-summary`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    const vaultSummary = await vaultSummaryRes.json()
    assert(vaultSummaryRes.status === 200, 'Vault health summary retrieved HTTP 200')
    assert(typeof vaultSummary.total === 'number', `Summary contains total documents (${vaultSummary.total} uploaded)`)
    assert(typeof vaultSummary.verified === 'number', `Summary contains verified documents count (${vaultSummary.verified} verified)`)

    // 9.2 Safe Rule-Based Metadata Extraction Assist
    const extractRes = await fetch(`${API_BASE}/documents/${uploadedDocId}/extract-metadata`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    const extractData = await extractRes.json()
    assert(extractRes.status === 200, 'Rule-based metadata suggestion generated HTTP 200')
    assert(Boolean(extractData.extraction?.formatGuide), 'Extraction response includes scheme format guideline without paid OCR')

    // 9.3 Update Document Metadata (Issue Date, Expiry, Certificate Number)
    const updateMetaRes = await fetch(`${API_BASE}/documents/${uploadedDocId}/metadata`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        issueDate: '2025-06-01',
        expiryDate: '2028-06-01',
        documentNumber: 'UIDAI-XXXX-1234',
        isMetadataConfirmed: true
      })
    })
    const metaData = await updateMetaRes.json()
    assert(updateMetaRes.status === 200, 'Document metadata persisted HTTP 200')
    assert(metaData.document?.documentNumber === 'UIDAI-XXXX-1234', 'Document certificate number saved')
    assert(metaData.document?.isMetadataConfirmed === true, 'Metadata confirmed flag set')

    // 9.4 Document Cross-Application Usage Tracking
    const usageRes = await fetch(`${API_BASE}/documents/${uploadedDocId}/usage`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    const usageData = await usageRes.json()
    assert(usageRes.status === 200, 'Document application usage retrieved HTTP 200')
    assert(Array.isArray(usageData.applications), 'Application usage returned as array')

    // ========================================================
    // 10. TESTING READINESS ENGINE & PREFLIGHT VALIDATION
    // ========================================================
    console.log('\n--- 10. Testing Scholarship Readiness Engine & Preflight ---')

    // 10.1 Preflight on Submitted Application
    const preflightRes = await fetch(`${API_BASE}/applications/${testAppId}/preflight`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    const preflightData = await preflightRes.json()
    assert(preflightRes.status === 200, 'Application preflight check returned HTTP 200')
    assert(typeof preflightData.preflight?.readinessPercentage === 'number', 'Deterministic readiness percentage computed', `${preflightData.preflight.readinessPercentage}%`)
    assert(Array.isArray(preflightData.preflight?.completedRequirements), 'Completed requirements list provided')
    assert(preflightData.preflight?.completedRequirements.length > 0, 'Mandatory documents and profile items marked satisfied')

    // ========================================================
    // 11. TESTING DEADLINE RESCUE MODE
    // ========================================================
    console.log('\n--- 11. Testing Deadline Rescue Mode ---')

    // 11.1 Fetch Prioritized Rescue Actions
    const rescueRes = await fetch(`${API_BASE}/rescue/actions`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    const rescueData = await rescueRes.json()
    assert(rescueRes.status === 200, 'Deadline rescue actions retrieved HTTP 200')
    assert(Array.isArray(rescueData.actions), 'Rescue action cards returned as array')
    assert(Boolean(rescueData.status), `Rescue status determined: ${rescueData.status}`)
    if (rescueData.actions.length > 0) {
      const firstAction = rescueData.actions[0]
      assert(Boolean(firstAction.title), 'Action card has a clear title')
      assert(Boolean(firstAction.whyItMatters), 'Action card explains why it matters')
      assert(Boolean(firstAction.actionUrl), 'Action card has a working target URL')
      assert(Boolean(firstAction.priority), `Action prioritized: ${firstAction.priority}`)
    }

    console.log('\n======================================================')
    console.log(`🎉 ALL ${results.length} TESTS PASSED WITH 100% SUCCESS!`)
    console.log('======================================================\n')
  } finally {
    // Teardown test accounts cleanly
    try {
      if (studentUserId) {
        await prisma.studentTask.deleteMany({ where: { userId: studentUserId } }).catch(() => {})
        await prisma.applicationDisbursement.deleteMany({ where: { application: { userId: studentUserId } } })
        await prisma.applicationDocument.deleteMany({ where: { application: { userId: studentUserId } } })
        await prisma.applicationFormData.deleteMany({ where: { application: { userId: studentUserId } } })
        await prisma.applicationStatusHistory.deleteMany({ where: { application: { userId: studentUserId } } })
        await prisma.application.deleteMany({ where: { userId: studentUserId } })
        await prisma.document.deleteMany({ where: { userId: studentUserId } })
        await prisma.academicRecord.deleteMany({ where: { userId: studentUserId } })
        await prisma.familyInfo.deleteMany({ where: { userId: studentUserId } })
        await prisma.studentProfile.deleteMany({ where: { userId: studentUserId } })
        await prisma.notification.deleteMany({ where: { userId: studentUserId } })
        await prisma.session.deleteMany({ where: { userId: studentUserId } })
        await prisma.user.delete({ where: { id: studentUserId } }).catch(() => {})
      }
      if (secondStudentUserId) {
        await prisma.session.deleteMany({ where: { userId: secondStudentUserId } })
        await prisma.notification.deleteMany({ where: { userId: secondStudentUserId } })
        await prisma.user.delete({ where: { id: secondStudentUserId } }).catch(() => {})
      }
      await prisma.$disconnect()
      console.log('Teardown complete.')
    } catch {
      console.log('Remote testing mode: database direct teardown skipped.')
    }
  }
}

run().catch((err) => {
  console.error('\n❌ QA SUITE FAILED:', err)
  process.exit(1)
})
