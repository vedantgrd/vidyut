import { prisma } from './src/lib/prisma.js'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('=== VERIFYING DATABASE STATE ===')
  const userCount = await prisma.user.count()
  const schCount = await prisma.scholarship.count()
  const demoStudent = await prisma.user.findUnique({
    where: { email: 'demo@vidyut.in' },
    include: { studentProfile: true, familyInfo: true, academicRecords: true }
  })
  const demoScholarship = await prisma.scholarship.findUnique({
    where: { slug: 'vidyut-demo-scholarship' }
  })

  console.log('Total registered users:', userCount)
  console.log('Total scholarships in DB:', schCount)
  console.log('Demo Student Found:', Boolean(demoStudent))
  console.log('Demo Student Name:', demoStudent?.fullName)
  console.log('Demo Student Profile Phone:', demoStudent?.studentProfile?.phone)
  console.log('Demo Student Academic Records:', demoStudent?.academicRecords.length)
  console.log('Demo Zero-Doc Scholarship Found (by slug):', Boolean(demoScholarship))
  console.log('Demo Zero-Doc ID:', demoScholarship?.id)
  console.log('Demo Zero-Doc Deadline:', demoScholarship?.deadline.toISOString())

  if (demoStudent) {
    const valid = await bcrypt.compare('Demo@1234', demoStudent.passwordHash)
    console.log('Demo Student Password Matches "Demo@1234":', valid)
  }

  const admin = await prisma.user.findUnique({ where: { email: 'admin@vidyut.in' } })
  if (admin) {
    const validAdmin = await bcrypt.compare('Admin@1234', admin.passwordHash)
    console.log('Admin Password Matches "Admin@1234":', validAdmin)
  }
  
  await prisma.$disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
