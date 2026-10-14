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
| 🛡️ | **Deadline Rescue Mode** | Personalized, prioritized action agenda ranking approaching deadlines, missing documents, and tasks with explainable urgency multipliers and 1-click corrective actions. |
| 📅 | **Smart Scholarship Calendar** | Personal interactive calendar with monthly grid, agenda timeline, date-only deadline safety without timezone drift, personal task tracking, requirement-synced suggested tasks, and 1-click RFC-5545 `.ics` export. |
| 📊 | **Scholarship Readiness Engine** | Transparent application-completeness scoring (85% mandatory requirements + 15% optional polish), preflight checklist validation, and authoritative server-side submit enforcement. |
| 🔐 | **Intelligent Document Vault** | Secure, reusable student documents with vault health analytics, zero-cost rule-based metadata auto-detection (issue date, expiry, certificate number), and cross-application usage safety before deletion. |
| 🎯 | **Eligibility Matcher** | Evaluates family income, caste category, domicile state, gender, disability, minority status, and academic cutoffs (percentage/CGPA) into a real **0–100%** score. |
| 🧭 | **4-Step Application Wizard** | Prefilled dossier → 1-click vault linking → honesty declaration → instant tracking ID. |
| 🤖 | **Context-Aware AI Assistant** | Reads your real profile, family income, and uploaded credentials to explain match requirements without hallucinating. |
| 💸 | **Multi-Tranche DBT Milestone Tracker** | Real-time payout timeline with individual installment amounts, due dates, tranche status (`SCHEDULED`, `DISBURSED`, `CANCELLED`), bank UTR reference tracking, and settlement progress bars. |

### 🏛️ For Administrators & Reviewers

| | Feature | What it does |
|:-:|---|---|
| 📊 | **Operations Center** | Platform metrics: registered students, active schemes, review backlog, pending verifications, and DBT treasury payout reconciliation. |
| 🗂️ | **Candidate Dossier** | Profile, family finances, and multi-tier academic history in one unified view. |
| ✅ | **Verification Queue** | Authenticated document streaming with one-click verify, and mandatory rationale on rejection. |
| 🕓 | **Status Audit & Notes** | A complete chronological history of every status change, with reviewer notes. |
| 🏦 | **Multi-Installment DBT Disbursement Engine** | Split approved awards into multiple staged tranches (Single Lumpsum, 50/50 Bi-Annual Split, or Custom Schedules). Features strict balance reconciliation (Disbursed + Pending = Approved Award), tranche state machine (`SCHEDULED` → `DISBURSED`), and individual bank UTR audit logging. |

### 🔄 Application Lifecycle

```mermaid
stateDiagram-v2
    direction LR
    [*] --> DRAFT
    DRAFT --> SUBMITTED: Student submits
    SUBMITTED --> DOCUMENTS_VERIFIED: Officer verifies docs
    DOCUMENTS_VERIFIED --> UNDER_REVIEW: Review begins
    UNDER_REVIEW --> APPROVED: Committee approval
    UNDER_REVIEW --> REJECTED: Rejected
    APPROVED --> TRANCHE_SCHEDULED: Configure installments
    TRANCHE_SCHEDULED --> TRANCHE_DISBURSED: Release tranche (UTR)
    TRANCHE_DISBURSED --> SETTLED: 100% award disbursed
    SETTLED --> [*]
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

**6 · Smart Scholarship Calendar & Agenda** — synchronized deadline calendar, date-only deadline math, urgent task checklist, and 1-click `.ics` calendar sync.

![Smart Scholarship Calendar](docs/screenshots/12-scholarship-calendar.png)

</details>

<details open>
<summary><b>🏛️ Admin Experience</b></summary>

<br/>

**7 · Admin control center** — active schemes, pending review backlog, and DBT treasury reconciliation metrics.

![Admin Dashboard](docs/screenshots/08-admin-dashboard.png)

**8 · Multi-Installment Disbursement & DBT Treasury** — approved award balance reconciliation, configurable tranches (1-time or 50/50 split), and individual tranche disbursement with UTR tracking.

![Admin Application Review & Multi-Installment](docs/screenshots/10-admin-application-review.png)

**9 · Document verification queue** — preview certificates, then verify or reject with feedback.

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
| 🌐 **Live Public Demo** | [https://vidyut-three.vercel.app](https://vidyut-three.vercel.app) |
| ⚙️ **Live REST API** | [https://vidyut-api.onrender.com/api/v1](https://vidyut-api.onrender.com/api/v1) |
| 🖥️ **Local Frontend** | http://localhost:5173 |
| ⚙️ **Local Backend API** | http://localhost:3001 |

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

# Full automated end-to-end journey test suite (90 assertions across auth, onboarding, vault metadata, eligibility, submit, admin review, DBT payouts, smart calendar, readiness preflight, and rescue mode)
npm run test:e2e

# Production build validation across workspaces
npm run build

# Capture fresh high-resolution browser walkthrough screenshots in headless Chrome
node scripts/capture-screenshots.js
```

---

## 🌐 Production Deployment Guide (Neon + Render + Vercel)

Vidyut's production prototype runs on a modern, decoupled cloud architecture:
1. **Database**: Serverless PostgreSQL on [Neon](https://neon.tech/)
2. **Backend API**: Node.js + Hono v4 container on [Render](https://render.com/)
3. **Frontend SPA**: React 19 + Vite static web app on [Vercel](https://vercel.com/)

---

### Step 1: Database Setup & Migrations on Neon

1. **Create a Neon Project**:
   - Sign in to the [Neon Console](https://console.neon.tech/) and create a new project (e.g. `vidyut-prod`).
   - Select the PostgreSQL 16 engine and your preferred region (e.g., `ap-southeast-1` or `us-east-2`).

2. **Retrieve Connection String**:
   - In your Neon Dashboard, copy the connection string under **Connection details**:
     ```env
     DATABASE_URL="postgresql://neondb_owner:<PASSWORD>@<EP_HOST>.neon.tech/neondb?sslmode=require"
     ```

3. **Deploy Schema Migrations & Seed Catalog**:
   Run migrations from your terminal against the Neon production database:
   ```bash
   cd apps/server

   # 1. Run all Prisma migrations against Neon (creates multi-installment DBT tranches, vault, calendar tasks, audit logs)
   DATABASE_URL="postgresql://neondb_owner:<PASSWORD>@<EP_HOST>.neon.tech/neondb?sslmode=require" npx prisma migrate deploy

   # 2. (Optional) Seed standard national/state scholarships and demo accounts:
   DATABASE_URL="postgresql://neondb_owner:<PASSWORD>@<EP_HOST>.neon.tech/neondb?sslmode=require" npm run db:seed
   ```

---

### Step 2: Backend API Deployment on Render

1. **Create a New Web Service**:
   - In the [Render Dashboard](https://dashboard.render.com/), click **New +** → **Web Service**.
   - Connect your Vidyut Git repository.

2. **Configure Service Settings**:
   - **Name**: `vidyut-api`
   - **Region**: Choose the region closest to your Neon database.
   - **Branch**: `main` (or your active release branch).
   - **Root Directory**: Leave blank (monorepo root `./`).
   - **Runtime**: `Node`.
   - **Build Command**:
     ```bash
     npm install && npx prisma generate --schema=apps/server/prisma/schema.prisma && npm run build --workspace=apps/server
     ```
   - **Start Command**:
     ```bash
     node apps/server/dist/index.js
     ```

3. **Set Environment Variables**:
   In Render's **Environment** tab, configure the following variables:
   | Key | Value | Notes |
   |---|---|---|
   | `DATABASE_URL` | `postgresql://neondb_owner:<PASSWORD>@<EP_HOST>.neon.tech/neondb?sslmode=require` | Your Neon connection string |
   | `JWT_ACCESS_SECRET` | *(64-char random hex string)* | Generate: `openssl rand -hex 32` |
   | `JWT_REFRESH_SECRET` | *(64-char random hex string)* | Distinct secret from access token |
   | `FRONTEND_URL` | `https://vidyut.vercel.app` | Your Vercel frontend domain (authorizes CORS) |
   | `PORT` | `3001` (or Render's assigned port) | Backend listen port |
   | `NODE_ENV` | `production` | Production mode |
   | `STORAGE_PATH` | `/var/data/uploads` | Path for student document uploads |

4. **Add Persistent Disk (For Document Vault)**:
   - In Render, navigate to **Disks** → **Add Disk**.
   - **Mount Path**: `/var/data/uploads`
   - **Size**: 1 GB to 10 GB
   *(This ensures uploaded Aadhaar, marksheets, and certificates persist safely across server restarts).*

5. **Deploy & Verify Health**:
   - Click **Create Web Service**. Once deployed, verify in terminal:
     ```bash
     curl https://vidyut-api.onrender.com/health
     # Expected output: {"status":"ok"}
     ```

---

### Step 3: Frontend Deployment on Vercel

1. **Import Project to Vercel**:
   - In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** → **Project**.
   - Select your Vidyut repository.

2. **Configure Build & Output Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set Environment Variables**:
   In Vercel's **Environment Variables** tab:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://vidyut-api.onrender.com/api/v1` |

4. **SPA Client Routing**:
   Vidyut includes `apps/web/vercel.json` preconfigured with single-page rewrites:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
   This ensures deep routes like `/admin/applications/:id` and `/dashboard/calendar` load without 404 errors.

5. **Deploy & Verify**:
   - Click **Deploy**.
   - Open your production URL (`https://vidyut.vercel.app`).
   - Sign in as Admin (`admin@vidyut.in`) or Student (`demo@vidyut.in`) to verify live functionality and multi-installment disbursement schedules.

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
