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
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()

  try {
    // 1. Landing Page
    console.log('Capturing Landing Page...')
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
    await new Promise(r => setTimeout(r, 1000))
    await page.screenshot({ path: path.join(OUT_DIR, '01-landing-page.png') })

    // 2. Login Page
    console.log('Capturing Login Page...')
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' })
    await new Promise(r => setTimeout(r, 500))
    await page.screenshot({ path: path.join(OUT_DIR, '02-login-page.png') })

    // 3. Login as Student
    console.log('Logging in as Student...')
    const buttons = await page.$$('button')
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn)
      if (text && text.includes('Student:')) {
        await btn.click()
        break
      }
    }
    await new Promise(r => setTimeout(r, 500))
    // Click submit
    const submitBtn = await page.$('button[type="submit"]')
    if (submitBtn) await submitBtn.click()
    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {})
    await new Promise(r => setTimeout(r, 2000))

    // 4. Student Dashboard
    console.log('Capturing Student Dashboard...')
    await page.screenshot({ path: path.join(OUT_DIR, '03-student-dashboard.png') })

    // 5. Student Profile
    console.log('Capturing Student Profile...')
    const profileLink = await page.$('a[href="/profile"]')
    if (profileLink) await profileLink.click()
    await new Promise(r => setTimeout(r, 1500))
    await page.screenshot({ path: path.join(OUT_DIR, '04-student-profile.png') })

    // 6. Document Vault
    console.log('Capturing Document Vault...')
    const docsLink = await page.$('a[href="/documents"]')
    if (docsLink) await docsLink.click()
    await new Promise(r => setTimeout(r, 1500))
    await page.screenshot({ path: path.join(OUT_DIR, '05-document-vault.png') })

    // 7. Scholarships Discovery
    console.log('Capturing Scholarships Discovery...')
    const scholLink = await page.$('a[href="/scholarships"]')
    if (scholLink) await scholLink.click()
    await new Promise(r => setTimeout(r, 1500))
    await page.screenshot({ path: path.join(OUT_DIR, '06-scholarship-discovery.png') })

    // 8. Applications List
    console.log('Capturing Student Applications...')
    const appLink = await page.$('a[href="/applications"]')
    if (appLink) await appLink.click()
    await new Promise(r => setTimeout(r, 1500))
    await page.screenshot({ path: path.join(OUT_DIR, '07-student-applications.png') })

    // 9. Admin Login
    console.log('Logging in as Admin...')
    // Sign out first
    const signOutBtn = await page.$$('button, a')
    for (const b of signOutBtn) {
      const text = await page.evaluate(el => el.textContent, b)
      if (text && text.includes('Sign out')) {
        await b.click()
        break
      }
    }
    await new Promise(r => setTimeout(r, 1000))
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' })
    await new Promise(r => setTimeout(r, 500))

    const adminButtons = await page.$$('button')
    for (const btn of adminButtons) {
      const text = await page.evaluate(el => el.textContent, btn)
      if (text && text.includes('Admin:')) {
        await btn.click()
        break
      }
    }
    await new Promise(r => setTimeout(r, 500))
    const adminSubmit = await page.$('button[type="submit"]')
    if (adminSubmit) await adminSubmit.click()
    await new Promise(r => setTimeout(r, 2000))

    // 10. Admin Dashboard
    console.log('Capturing Admin Dashboard...')
    await page.screenshot({ path: path.join(OUT_DIR, '08-admin-dashboard.png') })

    // 11. Admin Applications Review Queue
    console.log('Capturing Admin Applications...')
    const adminAppsLink = await page.$('a[href="/admin/applications"]')
    if (adminAppsLink) await adminAppsLink.click()
    await new Promise(r => setTimeout(r, 1500))
    await page.screenshot({ path: path.join(OUT_DIR, '09-admin-applications.png') })

    // Review application dossier
    const reviewLinks = await page.$$('a[href*="/admin/applications/"]')
    if (reviewLinks.length > 0) {
      await reviewLinks[0].click()
      await new Promise(r => setTimeout(r, 2000))
      console.log('Capturing Admin Application Review Dossier...')
      await page.screenshot({ path: path.join(OUT_DIR, '10-admin-application-review.png') })
    }

    // 12. Admin Documents Queue
    console.log('Capturing Admin Documents Queue...')
    const adminDocsLink = await page.$('a[href="/admin/documents"]')
    if (adminDocsLink) await adminDocsLink.click()
    await new Promise(r => setTimeout(r, 1500))
    await page.screenshot({ path: path.join(OUT_DIR, '11-admin-documents-verification.png') })

    console.log('All screenshots captured successfully!')
  } catch (err) {
    console.error('Error during capture:', err)
  } finally {
    await browser.close()
  }
}

run()
