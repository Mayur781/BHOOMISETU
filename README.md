# BhoomiSetu (भूमिसेतु) – National Land Acquisition & Management System

> **A full-stack web application designed to digitize, streamline, and monitor the complete land acquisition lifecycle across India under the statutory mandate of the RFCTLARR Act, 2013 and PM GatiShakti National Master Plan.**

---

## 📌 Executive Summary

**BhoomiSetu (भूमिसेतु)** provides a unified national Digital Public Infrastructure (DPI) connecting Central Ministries, State Revenue Authorities, District Magistrates, Competent Authorities for Land Acquisition (CALA/SLAO), and Project Implementing Agencies (NHAI, DFCCIL, SECI).

It guarantees strict compliance with statutory timeframes, eliminates project delays, provides complete transparency for citizens and landowners, and automates mathematical calculations for Section 26–30 compensation, mandatory 100% Solatium, and Direct Benefit Transfer (DBT) disbursals.

---

## 🏛️ Statutory Alignment: RFCTLARR Act 2013

BhoomiSetu digitizes each statutory phase prescribed under the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013**:

| Statutory Stage | Section | Purpose & Automation |
| :--- | :--- | :--- |
| **Project Proposal** | Sec 3A | Infrastructure alignment intake, alignment length, budget, hectarage |
| **Social Impact Assessment** | Sec 4 | SIA study records, public hearings, Expert Group clearance |
| **Preliminary Notification** | Sec 11 | Official Gazette publication, newspaper alerts, transaction freeze |
| **Hearing of Objections** | Sec 15 | 60-day citizen objection desk, inquiry proceedings, joint boundary resurveys |
| **Declaration of Acquisition** | Sec 19 | Conclusive declaration of public purpose, starts 12-month award clock |
| **Statutory Valuation & Award**| Sec 23 & 26–30 | Circle rate, rural multiplier (1.0x–2.0x), 100% Solatium, 12% additional interest |
| **R&R Scheme** | Sec 31 & 2nd Sched | Project Affected Families (PAFs), SC/ST protections, housing grants, annuities |
| **Physical Possession** | Sec 38 | Form 11 certificate generator; zero possession before 100% compensation |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite 8, React Router v7, Tailwind CSS, Leaflet 1.9, Recharts 3.10, Lucide React
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), BCrypt, Morgan, CORS
- **Database Architecture**: Mongoose / MongoDB with **Zero-Config Resilient In-Memory Mode** primed with authentic Indian infrastructure corridor datasets (NHAI Delhi-Mumbai Expressway, Dedicated Freight Corridor, Gujarat Solar Park).
- **Design System**: National Informatics Centre (NIC) / PM GatiShakti Executive Theme (Ashoka Deep Navy `#0f2942`, India Saffron `#f58220`, Emerald Green `#138808`).

---

## 📁 System Architecture & Directory Structure

```text
SIH 2026/
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection, role definitions, in-memory store
│   │   ├── controllers/        # Business controllers (auth, projects, parcels, compensation, etc.)
│   │   ├── middleware/         # JWT authentication, RBAC authorization, audit logger
│   │   ├── models/             # Mongoose schemas (User, Project, LandParcel, Award, PAF, Audit)
│   │   ├── routes/             # Versioned REST API endpoints (/api/v1/...)
│   │   └── seeders/            # Authentic Indian land acquisition seed dataset
│   ├── .env                    # Environment configuration
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express application bootstrap
│
├── frontend/
│   ├── src/
│   │   ├── assets/             # Logos and emblems
│   │   ├── components/
│   │   │   ├── common/         # Button, Input, Select, Modal, Table, Card, Badge, Alert, Pagination, LoadingSpinner, EmptyState, ErrorState, Breadcrumb
│   │   │   └── layout/         # Navbar, Sidebar, AppLayout
│   │   ├── context/            # AuthContext (JWT + 1-Click Role Switcher), ProjectContext
│   │   ├── pages/              # 18 Modular Pages matching every requested route
│   │   ├── services/           # Centralized API service with auto-token injection
│   │   ├── App.jsx             # React Router configuration & ProtectedRoute guards
│   │   ├── index.css           # Tailwind base, Leaflet styles, tricolor band
│   │   └── main.jsx            # Application entry with ErrorBoundary
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── BHOOMISETU_ARCHITECTURE.md  # Comprehensive technical architecture dossier
└── README.md                   # This setup & orientation guide
```

---

## 🚦 Routing Map

| Route | View | Description |
| :--- | :--- | :--- |
| `/login` | [LoginPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/LoginPage.jsx) | Single Sign-On Portal with 1-Click Evaluator Personas |
| `/dashboard` | [DashboardPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/DashboardPage.jsx) | Portfolio KPIs, Recharts Stage Funnel & Sectoral Distribution |
| `/projects` | [ProjectsPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/ProjectsPage.jsx) | Corridor Master Registry, Filters, Stage Promulgations |
| `/projects/:id` | [ProjectDetailPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/ProjectDetailPage.jsx) | Comprehensive corridor acquisition dossier |
| `/proposals` | [ProposalsPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/ProposalsPage.jsx) | Section 3A feasibility intake & clearance pipeline |
| `/land-parcels` | [LandParcelsPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/LandParcelsPage.jsx) | Survey Khasra land registry with RoR titleholders |
| `/gis-map` | [GISMapPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/GISMapPage.jsx) | Leaflet Cadastral Map with GeoJSON polygons & Satellite toggle |
| `/notifications` | [NotificationsPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/NotificationsPage.jsx) | Official Gazette Preliminary & Final Declarations |
| `/awards` | [AwardsPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/AwardsPage.jsx) | Section 23 Final Awards ledger with digital signatures |
| `/compensation` | [CompensationPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/CompensationPage.jsx) | Interactive 100% Solatium calculator & PFMS DBT disbursal |
| `/possession` | [PossessionPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/PossessionPage.jsx) | Section 38 Physical Possession & Form 11 certificate generator |
| `/rr` | [RRPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/RRPage.jsx) | Second Schedule R&R Scheme & Entitlements Manager |
| `/families` | [FamiliesPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/FamiliesPage.jsx) | PAF demographic census with SC/ST/BPL vulnerability flags |
| `/documents` | [DocumentsPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/DocumentsPage.jsx) | Statutory documents, SIA DPRs, Form 11 certificate archive |
| `/reports` | [ReportsPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/ReportsPage.jsx) | Standardized MIS returns & Parliamentary Question briefs |
| `/analytics` | [AnalyticsPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/AnalyticsPage.jsx) | Cross-corridor national intelligence & SLA benchmarks |
| `/audit-logs` | [AuditLogsPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/AuditLogsPage.jsx) | Immutable chronological event ledger with SHA256 hashes |
| `/admin` | [AdminPage](file:///c:/Users/MAYUR%20KADAM/OneDrive/Desktop/SIH%202026/frontend/src/pages/AdminPage.jsx) | RBAC Permission Matrix & System Health Overview |

---

## ⚡ Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18, v20, or v22+)
- npm (v9+)
- *(Optional)* MongoDB running locally on `mongodb://127.0.0.1:27017` (Automatic zero-config fallback to in-memory mode if absent).

### Step 1: Start Backend Server
```bash
cd backend
npm install
node server.js
```
*The backend boots on `http://localhost:5000` with seeded projects, parcels, PAFs, and users.*

### Step 2: Start Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
*The portal becomes accessible at `http://localhost:5173`.*

---

## 👥 Evaluator Personas (1-Click Access)

On `http://localhost:5173/login`, click any persona to test the portal instantly:

1. **Competent Authority for Land Acquisition (CALA / SLAO)**: `cala.nhai@bhoomisetu.gov.in` (Password: `Admin@123`)
2. **District Collector & Magistrate (DM)**: `dm.thane@bhoomisetu.gov.in` (Password: `Admin@123`)
3. **Joint Secretary (MoRTH)**: `ministry.morth@bhoomisetu.gov.in` (Password: `Admin@123`)
4. **Secretary (Revenue Dept)**: `state.revenue@bhoomisetu.gov.in` (Password: `Admin@123`)
5. **Chief General Manager (NHAI)**: `agency.nhai@bhoomisetu.gov.in` (Password: `Admin@123`)
6. **Senior Revenue Amin / Surveyor**: `surveyor.amin@bhoomisetu.gov.in` (Password: `Admin@123`)
7. **National Director General**: `superadmin@bhoomisetu.gov.in` (Password: `Admin@123`)
8. **PM GatiShakti Executive Viewer**: `executive.viewer@bhoomisetu.gov.in` (Password: `Admin@123`)
