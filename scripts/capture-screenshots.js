import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const OUT_DIR = path.resolve('docs/screenshots')

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

async function run() {
  console.log('Launching Chrome from:', CHROME_PATH)
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  })

  try {
    // ==========================================
    // CONTEXT 1: PUBLIC & STUDENT EXPERIENCE
    // ==========================================
    const studentPage = await browser.newPage()

    // 1. Landing Page
    console.log('1. Capturing Landing Page...')
    await studentPage.goto('http://localhost:5173/', { waitUntil: 'networkidle2' })
    await new Promise(r => setTimeout(r, 1800))
    await studentPage.screenshot({ path: path.join(OUT_DIR, '01-landing-page.png') })

    // 2. Login Page
    console.log('2. Capturing Login Page...')
    await studentPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' })
    await new Promise(r => setTimeout(r, 1200))
    await studentPage.screenshot({ path: path.join(OUT_DIR, '02-login-page.png') })

    // Log in as Student
    console.log('Logging in as Student (demo@vidyut.in)...')
    await studentPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Student:'))
      if (btn) btn.click()
    })
    await new Promise(r => setTimeout(r, 500))
    const submitBtn = await studentPage.$('button[type="submit"]')
    if (submitBtn) await submitBtn.click()

    await studentPage.waitForFunction(() => window.location.pathname === '/dashboard', { timeout: 10000 })
    // Wait for main dashboard to render past initial PageSpinner
    await studentPage.waitForSelector('h1')
    await new Promise(r => setTimeout(r, 1500))
    // Wait until rescue mode and calendar widgets finish loading
    await studentPage.waitForFunction(() => {
      const text = document.body.innerText
      return !text.includes('Checking deadlines') && !text.includes('Loading calendar events')
    }, { timeout: 15000 }).catch(() => {})
    await new Promise(r => setTimeout(r, 1500))

    // 3. Student Dashboard
    console.log('3. Capturing Student Dashboard...')
    await studentPage.screenshot({ path: path.join(OUT_DIR, '03-student-dashboard.png') })

    const spaNavigate = async (targetPath) => {
      await studentPage.evaluate((p) => {
        window.history.pushState(null, '', p)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }, targetPath)
      await new Promise(r => setTimeout(r, 2200))
    }

    // 4. Student Profile
    console.log('4. Capturing Student Profile...')
    await spaNavigate('/profile')
    await studentPage.screenshot({ path: path.join(OUT_DIR, '04-student-profile.png') })

    // 5. Document Vault
    console.log('5. Capturing Document Vault...')
    await spaNavigate('/documents')
    await studentPage.screenshot({ path: path.join(OUT_DIR, '05-document-vault.png') })

    // 6. Scholarship Discovery
    console.log('6. Capturing Scholarship Discovery...')
    await spaNavigate('/scholarships')
    await studentPage.screenshot({ path: path.join(OUT_DIR, '06-scholarship-discovery.png') })

    // 7. Student Applications
    console.log('7. Capturing Student Applications...')
    await spaNavigate('/applications')
    await studentPage.screenshot({ path: path.join(OUT_DIR, '07-student-applications.png') })

    // 12. Smart Scholarship Calendar
    console.log('12. Capturing Smart Scholarship Calendar...')
    await spaNavigate('/calendar')
    await studentPage.waitForFunction(() => {
      const text = (document.body.innerText || '').toLowerCase()
      return text.includes('smart calendar') && !text.includes('syncing scholarship deadlines')
    }, { timeout: 15000 }).catch(e => console.log('Wait for calendar timed out:', e.message))
    await new Promise(r => setTimeout(r, 1500))
    await studentPage.screenshot({ path: path.join(OUT_DIR, '12-scholarship-calendar.png') })

    await studentPage.close()

    // ==========================================
    // CONTEXT 2: ADMIN & REVIEWER EXPERIENCE
    // ==========================================
    const adminContext = await browser.createBrowserContext()
    const adminPage = await adminContext.newPage()

    console.log('Navigating Admin to Login Page...')
    await adminPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' })
    await new Promise(r => setTimeout(r, 1000))

    console.log('Logging in as Admin (admin@vidyut.in)...')
    await adminPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Admin:'))
      if (btn) btn.click()
    })
    await new Promise(r => setTimeout(r, 500))
    const adminSubmit = await adminPage.$('button[type="submit"]')
    if (adminSubmit) await adminSubmit.click()

    await adminPage.waitForFunction(() => window.location.pathname === '/admin', { timeout: 10000 })
    await new Promise(r => setTimeout(r, 2500))

    // 8. Admin Dashboard
    console.log('8. Capturing Admin Dashboard...')
    await adminPage.screenshot({ path: path.join(OUT_DIR, '08-admin-dashboard.png') })

    const adminSpaNavigate = async (targetPath) => {
      await adminPage.evaluate((p) => {
        window.history.pushState(null, '', p)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }, targetPath)
      await new Promise(r => setTimeout(r, 2200))
    }

    // 9. Admin Applications Queue
    console.log('9. Capturing Admin Applications Queue...')
    await adminSpaNavigate('/admin/applications')
    await adminPage.screenshot({ path: path.join(OUT_DIR, '09-admin-applications.png') })

    // 10. Admin Application Review Dossier with Multi-Installment Tranches
    console.log('10. Capturing Admin Application Review Dossier with Multi-Installments...')
    await adminSpaNavigate('/admin/applications/cmv80eqzm002oq9q2m5fptojp')
    await adminPage.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h3'))
      const h = headings.find(el => el.textContent && el.textContent.includes('Multi-Installment'))
      if (h) {
        // Scroll so the heading is neatly near top of viewport
        const y = h.getBoundingClientRect().top + window.scrollY - 30
        window.scrollTo({ top: y, behavior: 'instant' })
      }
    })
    await new Promise(r => setTimeout(r, 1200))
    await adminPage.screenshot({ path: path.join(OUT_DIR, '10-admin-application-review.png') })

    // 11. Admin Documents Verification Queue
    console.log('11. Capturing Admin Documents Verification Queue...')
    await adminSpaNavigate('/admin/documents')
    await adminPage.screenshot({ path: path.join(OUT_DIR, '11-admin-documents-verification.png') })

    await adminPage.close()
    await adminContext.close()

    console.log('✨ All 12 high-resolution Retina screenshots captured successfully!')
  } catch (err) {
    console.error('Error during capture:', err)
  } finally {
    await browser.close()
  }
}

run()
