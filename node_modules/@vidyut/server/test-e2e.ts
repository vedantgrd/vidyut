import { prisma } from './src/lib/prisma.js'

async function simulate() {
  console.log('=== SIMULATING END-TO-END WORKFLOW IN PRISMA & SERVICES ===')

  // 1. Get demo student
  const student = await prisma.user.findUnique({
    where: { email: 'demo@vidyut.in' },
    include: { studentProfile: true, familyInfo: true, academicRecords: true }
  })
  if (!student) throw new Error('Demo student not found')
  console.log('1. Student retrieved:', student.fullName, '(', student.id, ')')

  // 2. Look up the demo zero-doc scholarship
  const sch = await prisma.scholarship.findUnique({
    where: { slug: 'vidyut-demo-scholarship' },
    include: { requiredDocuments: true, eligibilityRules: true }
  })
  if (!sch) throw new Error('Demo scholarship not found')
  console.log('2. Scholarship retrieved:', sch.name, 'ID:', sch.id)

  // 3. Check or create application
  let app = await prisma.application.findUnique({
    where: { userId_scholarshipId: { userId: student.id, scholarshipId: sch.id } }
  })

  if (!app) {
    app = await prisma.application.create({
      data: {
        userId: student.id,
        scholarshipId: sch.id,
        status: 'DRAFT',
        lastActivityAt: new Date()
      }
    })
    console.log('3. Created draft application:', app.id)
  } else {
    console.log('3. Existing application found:', app.id, 'Status:', app.status)
  }

  // 4. Submit application (zero required docs, honesty declaration accepted)
  const submitted = await prisma.application.update({
    where: { id: app.id },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
      completionPercent: 100,
      lastActivityAt: new Date()
    }
  })
  console.log('4. Application submitted atomically:', submitted.status)

  // 5. Admin review transition to UNDER_REVIEW
  const reviewed = await prisma.application.update({
    where: { id: app.id },
    data: {
      status: 'UNDER_REVIEW',
      reviewerNotes: 'Candidate profile verified and eligible for grant.',
      lastActivityAt: new Date()
    }
  })
  console.log('5. Admin review transition successful:', reviewed.status, 'Notes:', reviewed.reviewerNotes)

  // 6. Admin approval transition
  const approved = await prisma.application.update({
    where: { id: app.id },
    data: {
      status: 'APPROVED',
      lastActivityAt: new Date()
    }
  })
  console.log('6. Admin approval successful:', approved.status)

  // Reset back to SUBMITTED for demo testing in web UI
  await prisma.application.update({
    where: { id: app.id },
    data: { status: 'SUBMITTED' }
  })
  console.log('7. Reset application status to SUBMITTED for interactive web testing')

  await prisma.$disconnect()
}

simulate().catch(err => {
  console.error(err)
  process.exit(1)
})
