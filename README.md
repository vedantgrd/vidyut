<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1e40af,100:059669&height=280&section=header&text=Vidyut&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlign=50&fontAlignY=33&desc=%E0%A4%B5%E0%A4%BF%E0%A4%A6%E0%A5%8D%E0%A4%AF%E0%A5%81%E0%A4%A4%20%7C%20Scholarships%2C%20minus%20the%20paperwork&descAlign=50&descAlignY=58&descSize=20" alt="Vidyut banner" width="100%"/>

### ⚡ *Filling government forms manually is a personality test no one asked for.*

**Tell Vidyut about yourself once. Vidyut handles the repetitive scholarship work.**

<br/>

[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-v4-e36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2d3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

<br/>

[**🎯 Why**](#-why-vidyut-exists) &nbsp;•&nbsp;
[**✨ Features**](#-features) &nbsp;•&nbsp;
[**📸 Tour**](#-visual-tour) &nbsp;•&nbsp;
[**🏗️ Architecture**](#️-architecture) &nbsp;•&nbsp;
[**🚀 Quick Start**](#-quick-start) &nbsp;•&nbsp;
[**🔑 Demo**](#-demo-credentials) &nbsp;•&nbsp;
[**🧪 Testing**](#-validation--type-safety)

</div>

<br/>

## 📖 What is Vidyut?

**Vidyut** is a high-trust scholarship **discovery, vaulting, and application platform** for Indian students.

Students enter their details once, store verified documents in an encrypted vault, get matched against real eligibility rules, and apply to dozens of government and private scholarships in a single click. Administrators get a full review pipeline, from document verification to Direct Benefit Transfer (DBT) fund disbursement.

<div align="center">

| 🧑‍🎓 **One profile** | 🗄️ **One vault** | 🎯 **Real match scores** | 🖱️ **One-click apply** | 💸 **Transparent payouts** |
|:---:|:---:|:---:|:---:|:---:|
| Enter your details once | Upload each document once | 0–100% rule-based eligibility | Prefilled application wizard | Track every DBT tranche |

</div>

---

## 🎯 Why Vidyut Exists

Every year, millions of Indian students miss life-changing scholarships. Not because they're unqualified, but because the system is exhausting.

| 😵 The Problem | 😌 The Vidyut Fix |
|---|---|
| **Fragmented portals.** Hundreds of clunky state, central, and private websites. | One discovery engine with live eligibility matching. |
| **Repetitive uploads.** Aadhaar, income certificate, and marksheets re-uploaded 10 times. | Upload once to the vault; auto-link to every eligible application. |
| **Broken bureaucracy.** Applications rejected months later over technicalities. | Eligibility rules checked *before* you apply. |
| **Zero payout visibility.** No idea when, or whether, DBT money is coming. | A complete audit trail of tranches, bank reference codes, and dates. |

> [!TIP]
> **The Vidyut Promise:** *"Tell Vidyut about yourself once. Vidyut handles the repetitive scholarship work."*

---

## ✨ Features

### 👨‍🎓 For Students

| | Feature | What it does |
|:-:|---|---|
| 🚀 | **Command Center** | A unified workspace with profile match scores, active application pipelines, vault health, and live fund disbursements. |
| 🎯 | **Eligibility Matcher** | Evaluates family income, caste category, domicile state, gender, disability, minority status, and academic cutoffs (percentage/CGPA) into a real **0–100%** score. |
| 🔐 | **Encrypted Document Vault** | Upload once with instant in-browser preview, graceful replacement-conflict handling, and automatic linking to eligible applications. |
| 🧭 | **4-Step Application Wizard** | Prefilled dossier → 1-click vault linking → honesty declaration → instant tracking ID. |
| 🤖 | **Context-Aware AI Assistant** | Reads your real profile, family income, and uploaded credentials to explain match requirements without hallucinating. |
| 💸 | **DBT Tracking** | Real-time audit trail of scholarship tranches, bank reference codes, and installment dates. |

### 🏛️ For Administrators & Reviewers

| | Feature | What it does |
|:-:|---|---|
| 📊 | **Operations Center** | Platform metrics: registered students, active schemes, review backlog, pending verifications. |
| 🗂️ | **Candidate Dossier** | Profile, family finances, and multi-tier academic history in one unified view. |
| ✅ | **Verification Queue** | Authenticated document streaming with one-click verify, and mandatory rationale on rejection. |
| 🕓 | **Status Audit & Notes** | A complete chronological history of every status change, with reviewer notes. |
| 🏦 | **DBT Disbursement Controls** | Record installments, transaction reference codes, and treasury advice slips directly on the candidate record. |

### 🔄 Application Lifecycle

```mermaid
stateDiagram-v2
    direction LR
    [*] --> DRAFT
    DRAFT --> SUBMITTED: Student submits
    SUBMITTED --> DOCUMENTS_VERIFIED: Officer verifies docs
    DOCUMENTS_VERIFIED --> UNDER_REVIEW: Review begins
    UNDER_REVIEW --> APPROVED: Approved
    UNDER_REVIEW --> REJECTED: Rejected
    APPROVED --> [*]: DBT tranches disbursed
    REJECTED --> [*]
```

---

## 📸 Visual Tour

> Click any section to expand. Screenshots live in [`docs/screenshots/`](docs/screenshots).

<details open>
<summary><b>🧑‍🎓 Student Experience</b></summary>

<br/>

**1 · High-trust landing page** — the 4-step workflow, live active scholarships, and instant demo access.

![Vidyut Landing Page](docs/screenshots/01-landing-page.png)

**2 · Student Command Center** — matched grants, active applications, DBT totals, and approaching deadlines.

![Student Command Center](docs/screenshots/03-student-dashboard.png)

**3 · Persistent profile dossier** — a database-backed single source of truth with in-place edit drawers for personal, family, and academic details.

![Student Profile Dossier](docs/screenshots/04-student-profile.png)

**4 · Encrypted document vault** — verification statuses, metadata, and live document preview modals. No re-uploading, ever.

![Document Vault](docs/screenshots/05-document-vault.png)

**5 · Discovery & matching engine** — dynamic filtering by category, level, and eligibility score.

![Scholarship Discovery](docs/screenshots/06-scholarship-discovery.png)

</details>

<details open>
<summary><b>🏛️ Admin Experience</b></summary>

<br/>

**6 · Admin control center** — active schemes, pending review backlog, and recent submissions at a glance.

![Admin Dashboard](docs/screenshots/08-admin-dashboard.png)

**7 · Application review & DBT disbursement** — full candidate dossier, document inspection, reviewer notes, status transitions, and payment tranches.

![Admin Application Review](docs/screenshots/10-admin-application-review.png)

**8 · Document verification queue** — preview certificates, then verify or reject with feedback.

![Document Verification Queue](docs/screenshots/11-admin-documents-verification.png)

</details>

---

## 🏗️ Architecture

Vidyut is a monorepo managed with **npm workspaces**: a React SPA talking to a Hono REST API backed by PostgreSQL via Prisma.

```mermaid
flowchart LR
    subgraph Client["🖥️ apps/web · React 19 + Vite"]
        UI[Pages & Components]
        ST[Zustand Stores]
        API[Type-safe API Client]
        UI --> ST --> API
    end

    subgraph Server["⚙️ apps/server · Hono + Node"]
        MW[JWT Auth & Role Guards]
        RT[REST Routes]
        SV[Eligibility Rule Engine]
        MW --> RT --> SV
    end

    subgraph Data["🗄️ Data"]
        PG[(PostgreSQL 16)]
        FS[[Document Storage]]
    end

    API -- HTTPS / JSON --> MW
    SV --> PG
    RT --> PG
    RT --> FS
```

### 🔐 Role-Based Access

| Role | Can do |
|---|---|
| **Student** | Manage profile, vault documents, discover & apply, track DBT payouts, chat with the assistant |
| **Reviewer** | Verify/reject documents, review applications, add notes |
| **Admin** | Everything a reviewer can, plus platform metrics and DBT fund disbursement |

### 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript 5.6, Vite 5.4, Framer Motion, Lucide Icons, React Hook Form, Zod |
| **Backend** | Hono v4, Node.js, `@hono/zod-validator`, Jose (JWT), Bcrypt.js, Slugify |
| **Database** | PostgreSQL 16, Prisma ORM 5.22 (19 relational models, cascading relations) |
| **Styling** | Vanilla CSS design tokens: Slate `#0f172a`, Trust Navy `#1e40af`, Emerald `#059669` |
| **DevOps** | Docker Compose, isolated Postgres port `5433` to avoid local conflicts |

<details>
<summary><b>📁 Project structure</b></summary>

```text
vidyut/
├── apps/
│   ├── web/                     # Frontend (React 19 + Vite)
│   │   └── src/
│   │       ├── api/             # Type-safe API client & error normalizer
│   │       ├── components/      # Layouts, vault modals, cards
│   │       ├── hooks/           # useApi, useDebounce
│   │       ├── pages/           # Public, onboarding, student, admin
│   │       ├── store/           # Zustand stores (auth, notifications)
│   │       └── styles/          # Government-grade light design tokens
│   │
│   └── server/                  # Backend (Hono + Prisma + Node)
│       ├── prisma/
│       │   ├── schema.prisma    # Relational schema (19 models)
│       │   └── seed.ts          # 23 scholarships & demo accounts
│       └── src/
│           ├── lib/             # Prisma client, JWT, Bcrypt, email
│           ├── middleware/      # JWT auth & role guards
│           ├── routes/          # Auth, profile, docs, AI, and more
│           ├── services/        # Eligibility engine & progress calculators
│           └── validators/      # Zod schemas
│
├── docs/screenshots/            # Platform captures
├── docker-compose.yml           # PostgreSQL 16 container
└── package.json                 # Monorepo root scripts & workspaces
```

</details>

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| [Node.js](https://nodejs.org/) | v20+ |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Any recent version (for PostgreSQL) |

### 1️⃣ Clone

```bash
git clone https://github.com/vedantgrd/vidyut.git
cd vidyut
```

### 2️⃣ Start PostgreSQL

```bash
docker compose up -d
```

> Runs Postgres 16 on port **5433**, so it won't collide with a local Postgres install.

### 3️⃣ Install dependencies

```bash
npm install
```

### 4️⃣ Configure environment

Create `apps/server/.env`:

```env
DATABASE_URL="postgresql://vidyut:vidyut_password@localhost:5433/vidyut_db"

# Generate your own secrets (see below). Never commit real values.
JWT_ACCESS_SECRET="<paste-a-random-secret>"
JWT_REFRESH_SECRET="<paste-a-different-random-secret>"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
STORAGE_PATH="./uploads"
```

Generate two strong, distinct secrets:

```bash
openssl rand -base64 48
```

> [!WARNING]
> Use a **different** secret for access and refresh tokens, and never reuse development secrets in production.

### 5️⃣ Initialize & seed the database

```bash
cd apps/server
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
cd ../..
```

### 6️⃣ Run everything

```bash
npm run dev
```

| Service | URL |
|---|---|
| 🖥️ **Frontend** | http://localhost:5173 |
| ⚙️ **Backend API** | http://localhost:3001 |

---

## 🔑 Demo Credentials

Pre-seeded accounts are available via the **Quick Demo Access** card on the login page.

| Role | Email | Password | Pre-seeded context |
|---|---|---|---|
| 🧑‍🎓 **Student** | `demo@vidyut.in` | `Demo@1234` | Arjun Sharma · Class 12 · OBC · 82.5% · Income ₹2.5L · Maharashtra · 1 approved grant |
| 🏛️ **Admin** | `admin@vidyut.in` | `Admin@1234` | Vidyut Directorate Administrator · review queue, DBT disbursement, verification rights |

> [!CAUTION]
> These are **demo-only** credentials. Remove or change them before any real deployment.

---

## 🧪 Validation & Type Safety

```bash
# TypeScript compilation checks across all packages
npm run typecheck

# Full automated end-to-end journey test suite (60 assertions across auth, onboarding, vault, eligibility, submit, admin review, and DBT payouts)
npm run test:e2e

# Production build validation across workspaces
npm run build

# Capture fresh high-resolution browser walkthrough screenshots in headless Chrome
node scripts/capture-screenshots.js
```

---

## 🌐 Production Deployment Guide

### Architecture at a Glance
- **Frontend (`apps/web`)**: Static SPA built with Vite. Can be deployed to any static host (Vercel, Netlify, Cloudflare Pages, AWS S3 + CloudFront, or Nginx).
- **Backend (`apps/server`)**: Node.js HTTP service running Hono v4. Can be hosted on Docker, AWS ECS/EC2, Render, Railway, or VPS.
- **Database (`PostgreSQL 16`)**: Managed PostgreSQL instance (AWS RDS, Neon, Supabase, Railway) or Dockerized container.

### Step-by-Step Deployment

#### 1. Database Provisioning & Migrations
Set `DATABASE_URL` in your production environment and deploy schema migrations:
```bash
cd apps/server
npx prisma migrate deploy
# Optional: Seed initial national and state scholarship catalog
npm run db:seed
```

#### 2. Backend Server Deployment
1. Set the production environment variables:
   - `DATABASE_URL`: Connection string to your production PostgreSQL database.
   - `JWT_ACCESS_SECRET`: 64-character cryptographically random string (`openssl rand -base64 48`).
   - `JWT_REFRESH_SECRET`: Separate 64-character cryptographically random string.
   - `FRONTEND_URL`: URL of your deployed frontend (e.g., `https://vidyut.yourdomain.in`).
   - `PORT`: `3001` (or provider's default port).
   - `NODE_ENV`: `production`.
   - `STORAGE_PATH`: Path to persistent disk volume mount (e.g., `/mnt/data/uploads`).
2. Build and run:
   ```bash
   npm run build --workspace=apps/server
   npm run start --workspace=apps/server
   ```
3. Health check verification: `GET https://api.yourdomain.in/health` returns `{"status":"ok"}`.

#### 3. Frontend Deployment
1. Set `VITE_API_URL` to point to your backend API base:
   ```env
   VITE_API_URL="https://api.yourdomain.in/api/v1"
   ```
2. Build production bundle:
   ```bash
   npm run build --workspace=apps/web
   ```
3. Deploy the resulting `apps/web/dist/` directory to your static hosting provider with SPA fallback routing to `index.html`.

---

## ⚠️ Known Limitations & Integrations

| Area | Production Status | Implementation Detail |
|---|---|---|
| **Email Delivery** | Pluggable / Simulated in Dev | Built-in support for Resend via `RESEND_API_KEY`. When no key is set (development mode), verification links and reset tokens are logged cleanly without failing transactions. |
| **Direct Benefit Transfer (DBT)** | Treasury Audit Ledger | Payouts record administrative transaction reference numbers (`referenceCode`), dates, and installment records. It does not execute live banking NEFT/RTGS wire transfers without a banking portal partnership. |
| **Document Storage** | Local Disk / Volume Mount | Documents are saved to `STORAGE_PATH` (`./uploads`). For ephemeral containers (e.g. standard Render or Heroku without persistent disks), configure a mounted volume or S3 object store adapter. |
| **Browser Compatibility** | Modern Evergreen | Verified on Chrome, Firefox, Edge, and Safari with CSS token variables and React 19. |

---

## 🩺 Troubleshooting

<details>
<summary><b>Port 5433 is already in use</b></summary>

Change the host port mapping in `docker-compose.yml`, then update the port in `DATABASE_URL` to match.

</details>

<details>
<summary><b>Prisma can't connect to the database</b></summary>

Confirm the container is healthy with `docker compose ps`, and that `DATABASE_URL` in `apps/server/.env` uses port `5433` (for the bundled Docker container) or `5432` (for native PostgreSQL).

</details>

<details>
<summary><b>Seed data looks wrong or stale</b></summary>

Reset and reseed from `apps/server`:

```bash
npx prisma migrate reset
npm run db:seed
```

</details>

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-idea`
3. Run `npm run typecheck --workspaces` before committing
4. Open a pull request describing what and why

---

<div align="center">

<sub>Built with ❤️ for every student navigating higher education funding.</sub>

<br/>

⭐ **If Vidyut saved you a form or two, consider starring the repo.** ⭐

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:059669,100:1e40af&height=100&section=footer" alt="footer" width="100%"/>

</div>
