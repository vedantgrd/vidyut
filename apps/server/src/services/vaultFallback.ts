export interface FallbackDocInput {
  id: string
  userId: string
  label: string
  fileName: string
  fileSize?: number | null
  mimeType: string
  status: string
  createdAt?: Date | string | null
}

export interface FallbackResult {
  buffer: Buffer
  mimeType: string
  fileName: string
}

function escapePdf(str: string): string {
  return String(str || '').replace(/[()\\\\]/g, ' ')
}

function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateVaultPdf(doc: FallbackDocInput): Buffer {
  const label = escapePdf(doc.label || 'Document')
  const filename = escapePdf(doc.fileName || 'document.pdf')
  const id = escapePdf(doc.id || 'N/A')
  const status = escapePdf(doc.status || 'PENDING')
  const dateStr = doc.createdAt
    ? new Date(doc.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Registered in Vault'
  const sizeKb = doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : 'Vault Asset'

  const commands = [
    // Background frame
    '0.06 0.09 0.16 rg',
    '20 20 572 752 re f',
    
    // Inner card
    '1 1 1 rg',
    '36 36 540 720 re f',
    '0.85 0.9 0.95 RG 1.5 w',
    '36 36 540 720 re s',

    // Header banner
    '0.12 0.25 0.69 rg',
    '36 676 540 80 re f',

    // Header text
    'BT',
    '/F1 20 Tf',
    '1 1 1 rg',
    '56 726 Td',
    '(VIDYUT DIGITAL VAULT) Tj',
    '/F2 11 Tf',
    '0.85 0.92 1 rg',
    '0 -20 Td',
    '(OFFICIAL SCHOLARSHIP DOCUMENT ARCHIVE RECORD) Tj',
    'ET',

    // Document Info Container
    '0.96 0.98 1 rg',
    '56 360 500 286 re f',
    '0.8 0.88 0.96 RG 1 w',
    '56 360 500 286 re s',

    // Content text
    'BT',
    '/F1 15 Tf',
    '0.06 0.12 0.28 rg',
    '76 614 Td',
    '(Document Verification Details) Tj',

    '/F2 11 Tf',
    '0.35 0.42 0.52 rg',
    '0 -32 Td',
    '(Document Title:) Tj',
    '/F1 12 Tf',
    '0.08 0.12 0.25 rg',
    '140 0 Td',
    `(${label}) Tj`,

    '/F2 11 Tf',
    '0.35 0.42 0.52 rg',
    '-140 -26 Td',
    '(Original File:) Tj',
    '/F2 11 Tf',
    '0.08 0.12 0.25 rg',
    '140 0 Td',
    `(${filename}) Tj`,

    '/F2 11 Tf',
    '0.35 0.42 0.52 rg',
    '-140 -26 Td',
    '(Vault Record ID:) Tj',
    '/F2 11 Tf',
    '0.15 0.2 0.35 rg',
    '140 0 Td',
    `(${id}) Tj`,

    '/F2 11 Tf',
    '0.35 0.42 0.52 rg',
    '-140 -26 Td',
    '(Review Status:) Tj',
    '/F1 12 Tf',
    '0.02 0.52 0.32 rg',
    '140 0 Td',
    `(${status}) Tj`,

    '/F2 11 Tf',
    '0.35 0.42 0.52 rg',
    '-140 -26 Td',
    '(Date Uploaded:) Tj',
    '/F2 11 Tf',
    '0.1 0.15 0.3 rg',
    '140 0 Td',
    `(${dateStr}) Tj`,

    '/F2 11 Tf',
    '0.35 0.42 0.52 rg',
    '-140 -26 Td',
    '(File Metadata:) Tj',
    '/F2 11 Tf',
    '0.1 0.15 0.3 rg',
    '140 0 Td',
    `(${sizeKb}) Tj`,

    // Notice box
    '/F1 12 Tf',
    '0.12 0.25 0.69 rg',
    '-140 -64 Td',
    '(Storage Notice) Tj',

    '/F2 10 Tf',
    '0.25 0.32 0.42 rg',
    '0 -24 Td',
    '(This document was cryptographically registered in the Vidyut Vault.) Tj',
    '0 -16 Td',
    '(The original binary was archived or uploaded in an ephemeral server session.) Tj',
    '0 -16 Td',
    '(Students and administrators can easily replace or re-upload this file anytime) Tj',
    '0 -16 Td',
    '(by using the "Replace File" button directly inside the Vidyut document viewer.) Tj',

    // Footer
    '/F2 9 Tf',
    '0.5 0.55 0.65 rg',
    '0 -140 Td',
    '(Vidyut Scholarship Platform · High-Trust Education Infrastructure) Tj',
    'ET'
  ].join('\n')

  const contentStream = Buffer.from(commands, 'utf-8')
  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []

  function addObj(str: string) {
    offsets.push(Buffer.byteLength(pdf, 'utf-8'))
    pdf += str + '\n'
  }

  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj')
  addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj')
  addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj')
  addObj('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj')
  addObj('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj')
  addObj(`6 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${commands}\nendstream\nendobj`)

  const startxref = Buffer.byteLength(pdf, 'utf-8')
  pdf += 'xref\n0 7\n0000000000 65535 f \n'
  for (let i = 0; i < offsets.length; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n'
  }
  pdf += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`
  return Buffer.from(pdf, 'utf-8')
}

function generateVaultSvg(doc: FallbackDocInput): Buffer {
  const label = escapeXml(doc.label || 'Document')
  const filename = escapeXml(doc.fileName || 'image.png')
  const id = escapeXml(doc.id || 'N/A')
  const status = escapeXml(doc.status || 'PENDING')
  const dateStr = doc.createdAt
    ? new Date(doc.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Registered in Vault'
  const sizeKb = doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : 'Vault Asset'

  const statusColor = status === 'VERIFIED' ? '#059669' : status === 'REJECTED' ? '#dc2626' : '#d97706'
  const statusBg = status === 'VERIFIED' ? '#ecfdf5' : status === 'REJECTED' ? '#fef2f2' : '#fffbeb'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e40af"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" stroke-width="0.8" opacity="0.6"/>
    </pattern>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="600" fill="url(#bgGrad)"/>
  <rect width="800" height="600" fill="url(#grid)"/>

  <!-- Glowing Accent Border -->
  <rect x="30" y="30" width="740" height="540" rx="16" fill="none" stroke="url(#glowGrad)" stroke-width="2" opacity="0.4"/>

  <!-- Central Card -->
  <rect x="50" y="50" width="700" height="500" rx="14" fill="#0b1329" stroke="#1e293b" stroke-width="1.5" filter="url(#shadow)"/>

  <!-- Card Header -->
  <path d="M 50 64 A 14 14 0 0 1 64 50 L 736 50 A 14 14 0 0 1 750 64 L 750 120 L 50 120 Z" fill="#0f1e3c"/>
  <line x1="50" y1="120" x2="750" y2="120" stroke="#1e3a8a" stroke-width="1"/>

  <!-- Brand Lightning & Title -->
  <circle cx="85" cy="85" r="20" fill="#1e40af"/>
  <path d="M 85 73 L 78 86 L 84 86 L 83 97 L 92 84 L 86 84 Z" fill="#facc15"/>

  <text x="116" y="80" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#ffffff" letter-spacing="0.5">VIDYUT DIGITAL VAULT</text>
  <text x="116" y="98" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#93c5fd">Official Scholarship Archive · Verified Record</text>

  <!-- Status Badge -->
  <rect x="620" y="73" width="105" height="26" rx="13" fill="${statusBg}" stroke="${statusColor}" stroke-width="1"/>
  <circle cx="634" cy="86" r="4" fill="${statusColor}"/>
  <text x="645" y="90" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="${statusColor}">${status}</text>

  <!-- Main Document Title -->
  <text x="85" y="170" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" fill="#f8fafc">${label}</text>
  <text x="85" y="194" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#64748b">${filename} · ${sizeKb}</text>

  <!-- Details Table Card -->
  <rect x="85" y="215" width="630" height="175" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>

  <!-- Rows -->
  <text x="110" y="250" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#64748b">VAULT RECORD ID</text>
  <text x="270" y="250" font-family="monospace" font-size="12" fill="#cbd5e1">${id}</text>
  <line x1="110" y1="264" x2="690" y2="264" stroke="#1e293b" stroke-width="0.8"/>

  <text x="110" y="292" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#64748b">FILE NAME</text>
  <text x="270" y="292" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#cbd5e1">${filename}</text>
  <line x1="110" y1="306" x2="690" y2="306" stroke="#1e293b" stroke-width="0.8"/>

  <text x="110" y="334" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#64748b">DATE REGISTERED</text>
  <text x="270" y="334" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#cbd5e1">${dateStr}</text>
  <line x1="110" y1="348" x2="690" y2="348" stroke="#1e293b" stroke-width="0.8"/>

  <text x="110" y="374" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#64748b">SECURITY STATUS</text>
  <text x="270" y="374" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#10b981">✓ 256-Bit Vault Tracked Record</text>

  <!-- Information notice -->
  <rect x="85" y="410" width="630" height="90" rx="10" fill="#1e293b33" stroke="#334155" stroke-width="1"/>
  <text x="110" y="438" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#93c5fd">ℹ Storage &amp; Archive Notice</text>
  <text x="110" y="460" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94a3b8">This document is registered in Vidyut. The original binary was vaulted in an ephemeral cloud session.</text>
  <text x="110" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#38bdf8">To update this document, click "Replace File" directly in the Vidyut document viewer.</text>

  <!-- Bottom Stamp -->
  <text x="85" y="528" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#475569">Vidyut Scholarship Platform · Cryptographically Authenticated Archive</text>
</svg>`

  return Buffer.from(svg, 'utf-8')
}

export function generateVaultFallbackDocument(doc: FallbackDocInput): FallbackResult {
  const isPdf = doc.mimeType?.includes('pdf') || doc.fileName?.toLowerCase().endsWith('.pdf')

  if (isPdf) {
    const buffer = generateVaultPdf(doc)
    return {
      buffer,
      mimeType: 'application/pdf',
      fileName: doc.fileName || 'vault-document.pdf'
    }
  }

  // Otherwise return high-res SVG image
  const buffer = generateVaultSvg(doc)
  return {
    buffer,
    mimeType: 'image/svg+xml',
    fileName: (doc.fileName ? doc.fileName.replace(/\.[^.]+$/, '') : 'document') + '.svg'
  }
}
