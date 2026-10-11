<div align="center">

# ⚡ Vidyut (विद्युत)
### *Building Vidyut because filling government forms manually is a personality test no one asked for.*

[![React 19](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-v4-e36002?logo=hono&logoColor=white)](https://hono.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<br/>

**Vidyut** is an intelligent, high-trust scholarship discovery, vaulting, and application platform. It eliminates the repetitive paperwork headache by allowing students to enter their credentials once, store verified documents in an encrypted vault, match against complex eligibility criteria, and apply to dozens of verified government and private scholarships with 1 click.

[Live Demo](http://localhost:5173) • [Core Philosophy](#-the-core-philosophy) • [Key Features](#-key-features) • [Visual Tour](#-visual-tour) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Demo Credentials](#-demo-credentials)

---

</div>

<br/>

## 🎯 The Core Philosophy

Every year, millions of Indian students miss out on life-changing scholarships not because they aren't qualified, but because:
1. **Fragmented Portals**: Finding scholarships requires sifting through hundreds of clunky state, central, and private websites.
2. **Repetitive Uploads**: Applying to 10 scholarships forces students to re-upload their Aadhaar, Income Certificate, and Marksheets 10 separate times.
3. **Broken Bureaucracy**: Confusing eligibility rules result in applications rejected months later for technicalities.
4. **Zero Disbursement Transparency**: Once approved, students have no visibility into Direct Benefit Transfer (DBT) payment tranches.

> **The Vidyut Promise:**  
> *"Tell Vidyut about yourself once. Vidyut handles the repetitive scholarship work."*

---

## ✨ Key Features

### 👨‍🎓 For Students

- **Vidyut Command Center**: A unified workspace surfacing profile match scores, active application pipelines, document vault health, and live treasury fund disbursements.
- **Rule-Based Eligibility Matcher**: Evaluates family income thresholds, caste category, domicile state, gender, disability, minority status, and academic score cutoffs (percentage/CGPA) to calculate real 0–100% eligibility scores.
- **Encrypted Document Vault**: Upload documents once with instant in-browser preview, graceful replacement conflict resolution, and automatic linking to eligible applications.
- **4-Step Streamlined Wizard**: Prefilled candidate dossier → 1-click vault document linking → honesty declaration → instant tracking ID generation.
- **Context-Aware AI Assistant**: A conversational assistant with access to the student's real profile, family income, and uploaded credentials that explains match requirements without hallucinations.
- **Direct Benefit Transfer (DBT) Tracking**: Real-time audit trail of scholarship tranches, bank reference codes, and installment payment dates.

### 🏛️ For Scholarship Administrators & Reviewers

- **Admin Operations Center**: Platform metrics for total registered students, active schemes, review backlogs, and pending verifications.
- **Comprehensive Candidate Dossier**: Complete overview of student profile, family finances, and multi-tier academic history in a single unified view.
- **Document Verification Queue**: Authenticated document streaming with one-click verification and mandatory rejection feedback rationale.
- **Status Audit & Notes**: Complete chronological history timeline (`DRAFT` → `SUBMITTED` → `DOCUMENTS_VERIFIED` → `UNDER_REVIEW` → `APPROVED` / `REJECTED`).
- **DBT Fund Disbursement Controls**: Record installment payments, transaction reference codes, and treasury advice slips directly into the candidate record.

---

## 📸 Visual Tour

### 1. High-Trust Landing Page
*Clean, public-facing entry point outlining the 4-step workflow, live active scholarships, and instant demo access.*

![Vidyut Landing Page](docs/screenshots/01-landing-page.png)

---

### 2. Student Command Center Dashboard
*Command-center workspace presenting matched grants, active applications, DBT grant totals, and approaching deadlines.*

![Student Command Center](docs/screenshots/03-student-dashboard.png)

---

### 3. Persistent Student Profile Dossier
*Database-backed single source of truth with modular, in-place edit drawers for personal, family, and academic qualifications.*

![Student Profile Dossier](docs/screenshots/04-student-profile.png)

---

### 4. Encrypted Document Vault
*Zero re-uploading vault displaying verification statuses, metadata, and live streaming document modals.*

![Document Vault](docs/screenshots/05-document-vault.png)

---

### 5. Scholarship Discovery & Matching Engine
*Dynamic filtering by category, level, and eligibility score with automatic rule evaluation.*

![Scholarship Discovery](docs/screenshots/06-scholarship-discovery.png)

---

### 6. Admin Control Center & Operations
*Platform activity overview showing active schemes, pending review backlogs, and recent submissions.*

![Admin Dashboard](docs/screenshots/08-admin-dashboard.png)

---

### 7. Admin Application Review & Fund Disbursement (DBT)
*Full candidate dossier, document inspection, reviewer notes, status transitions, and DBT disbursement tranches.*

![Admin Application Review](docs/screenshots/10-admin-application-review.png)

---

### 8. Document Verification Queue
*Centralized verification pipeline allowing officers to preview certificates and verify or reject with feedback.*

![Document Verification Queue](docs/screenshots/11-admin-documents-verification.png)

---

## 🏗️ Architecture & Tech Stack

Vidyut is built as a production-grade monorepo powered by **npm workspaces**:

```
vidyut/
├── apps/
│   ├── web/                     # Frontend Application (React 19 + Vite)
│   │   ├── src/
│   │   │   ├── api/             # Type-safe API client & error normalizer
│   │   │   ├── components/      # UI components (Layouts, Vault Modals, Cards)
│   │   │   ├── hooks/           # Custom React hooks (useApi, useDebounce)
│   │   │   ├── pages/           # Public, Onboarding, Student, and Admin pages
│   │   │   ├── store/           # Zustand stores (Auth, Notifications)
│   │   │   └── styles/          # Government-grade light design tokens
│   │   └── package.json
│   │
│   └── server/                  # Backend Application (Hono + Prisma + Node)
│       ├── prisma/
│       │   ├── schema.prisma    # Complete relational database schema (19 models)
│       │   └── seed.ts          # Seed script with 23 scholarships & demo accounts
│       ├── src/
│       │   ├── lib/             # Prisma client, JWT, Bcrypt, Email services
│       │   ├── middleware/      # JWT auth & role guards (Student, Admin, Reviewer)
│       │   ├── routes/          # RESTful endpoints (Auth, Profile, Docs, AI, etc.)
│       │   ├── services/        # Eligibility rule engine & progress calculators
│       │   └── validators/      # Zod validation schemas
│       └── package.json
│
├── docs/screenshots/            # High-resolution platform captures
├── docker-compose.yml           # Isolated PostgreSQL 16 container definition
└── package.json                 # Monorepo root scripts & workspaces
```

### Technology Highlights

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript 5.6, Vite 5.4, Framer Motion, Lucide Icons, React Hook Form, Zod |
| **Backend** | Hono v4, Node.js, `@hono/zod-validator`, Jose (JWT), Bcrypt.js, Slugify |
| **Database** | PostgreSQL 16, Prisma ORM 5.22 (19 relational models, cascading relations) |
| **Styling** | Vanilla CSS Design Tokens (Slate `#0f172a`, Trust Navy `#1e40af`, Emerald `#059669`) |
| **DevOps** | Docker Compose, isolated port mapping (5433 to avoid native conflicts) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/vedantgrd/vidyut.git
cd vidyut
```

### Step 2: Start PostgreSQL Database

Run PostgreSQL via Docker Compose:

```bash
docker compose up -d
```
*(Runs PostgreSQL 16 on port `5433` to prevent collisions with existing local PostgreSQL installations).*

### Step 3: Install Dependencies

Install all root, web, and server dependencies in one command:

```bash
npm install
```

### Step 4: Configure Environment Variables

Create `.env` file for the backend:

```bash
# In apps/server/.env
DATABASE_URL="postgresql://vidyut:vidyut_password@localhost:5433/vidyut_db"
JWT_ACCESS_SECRET="MumxNGhRMHHLxTd63ToVdDM9UxzOoSkZa6hyl+VI5hJNM29Nt4QDo0kBn/Vc6viO"
JWT_REFRESH_SECRET="4IfBFB1weKew//0yO7yTRDdDSJlwxOug8mGW0TdY7wWc5to6nipL5xQAdKYmU34v"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
STORAGE_PATH="./uploads"
```

### Step 5: Initialize Database & Seed

Generate the Prisma Client and populate scholarships, rules, and demo accounts:

```bash
cd apps/server
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
cd ../..
```

### Step 6: Start Development Servers

Run both the backend API and frontend Vite server concurrently:

```bash
npm run dev
```

- **Frontend Application**: [`http://localhost:5173`](http://localhost:5173)
- **Backend API**: [`http://localhost:3001`](http://localhost:3001)

---

## 🔑 Demo Credentials

For rapid evaluation and testing, Vidyut includes pre-seeded accounts accessible directly via the **Quick Demo Access** card on the login page:

| Role | Email | Password | Pre-seeded Context |
|---|---|---|---|
| **Student** | `demo@vidyut.in` | `Demo@1234` | Arjun Sharma (Class 12, OBC, 82.5%, Income ₹2.5L, Maharashtra, 1 Approved Grant) |
| **Admin** | `admin@vidyut.in` | `Admin@1234` | Vidyut Directorate Administrator (Review queue, DBT disburser, verification permissions) |

---

## 🧪 Validation & Type Safety

Vidyut enforces strict end-to-end type safety:

```bash
# Run TypeScript compilation checks across all packages
npm run typecheck --workspaces

# Verify database state & seeded records
cd apps/server && npx tsx verify-db.ts

# Run simulated end-to-end application lifecycle
cd apps/server && npx tsx test-e2e.ts
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<br/>

<div align="center">
  <sub>Built with ❤️ for every student navigating higher education funding.</sub>
</div>
