# BhoomiSetu (भूमिसेतु)
## National Land Acquisition & Management System (NLAMS)
### Comprehensive Technical Architecture, Data Schema, Role Matrix & Development Roadmap

---

## 1. Executive Summary & Statutory Alignment

**BhoomiSetu** is an enterprise-grade digital public infrastructure (DPI) platform tailored for the Indian governance ecosystem to digitize, orchestrate, and audit the end-to-end lifecycle of land acquisition, compensation calculation, rehabilitation & resettlement (R&R), and possession handover.

The platform is strictly architected around the statutory mandate of the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR Act 2013)**, replacing fragmented paper files, delayed gazette notifications, dispute-prone physical measurements, and opaque compensation disbursals with an auditable, GIS-enabled digital twin.

### Core Value Drivers
1. **Statutory Timeline Enforcer**: Tracks statutory time limits under Section 14 (12-month limit from SIA report to Sec 11 notification) and Section 25 (12-month limit between Sec 19 declaration and Sec 23 award) with automated SLA escalations.
2. **Deterministic Formula Engine**: Standardized computation of Market Value (Sec 26), Rural Multiplier Factor 1.0x–2.0x, 100% Solatium (Sec 30(1)), and 12% p.a. Additional Compensation from Sec 4 to Award date (Sec 30(3)).
3. **GIS Cadastral Spatial Integration**: Spatial representation of Survey Khasra/Gat numbers overlaid on OpenStreetMap/satellite layers with visual acquisition boundary buffers and encroachment detection.
4. **Direct Benefit Transfer (DBT) Audit Trail**: End-to-end digital paper trail from award determination to PFMS-ready compensation ledger and verified possession certificate issuance under Section 38.

---

## 2. High-Level System Architecture

```mermaid
graph TB
    subgraph Client Tier ["Frontend (React 18 + Vite + Tailwind CSS)"]
        UI_AUTH["Auth & Role Guards"]
        UI_DASH["Executive & Officer Dashboards (Recharts)"]
        UI_PROJ["Project & Proposal Manager"]
        UI_GIS["GIS Parcel Viewer (Leaflet + OSM + Cadastral Overlay)"]
        UI_STAT["RFCTLARR Statutory Pipeline (Sec 4 to Sec 38)"]
        UI_AWD["Compensation & Award Calculator"]
        UI_RR["R&R & Affected Families Registry"]
        UI_DOCS["Digital Vault & Gazette Repository"]
        UI_AUDIT["Immutable Audit Log Explorer"]
    end

    subgraph Gateway Tier ["API Gateway / Reverse Proxy (Express.js)"]
        RT_LIMIT["Rate Limiter & Helmet Security"]
        AUTH_MDL["JWT Authentication Middleware"]
        RBAC_MDL["Role-Based Access Control (RBAC Matrix)"]
        AUDIT_MDL["Audit Logging Interceptor"]
        VAL_MDL["Request Validator (Joi / Zod schema)"]
    end

    subgraph Service Tier ["Node.js Micro-Modular Core Services"]
        SVC_AUTH["Identity & Profile Service"]
        SVC_PROJ["Project Proposal & Workflow Service"]
        SVC_GIS["GIS GeoJSON & Parcel Geometry Service"]
        SVC_COMP["Statutory Compensation Engine (RFCTLARR)"]
        SVC_RR["Rehabilitation & Resettlement Engine"]
        SVC_DOC["Document & Digital Signature Service"]
        SVC_MOCK["Govt Integration Adapter (Mock Bhulekh/PFMS/DigiLocker)"]
        SVC_AUDIT["Audit & SLA Escalation Service"]
    end

    subgraph Data Tier ["Data & Persistence Layer"]
        DB_PRIMARY[("MongoDB (Mongoose ODM)")]
        DB_MEM[("Embedded Memory Mongo (Zero-Config Fallback)")]
        FILE_STORE["Secure Local / S3-Compatible Asset Storage"]
    end

    subgraph External Mock Layer ["National e-Gov Simulation Adapters"]
        MOCK_BHULEKH["Mock State Land Records (Bhulekh / RoR API)"]
        MOCK_PFMS["Mock Public Financial Management System (DBT API)"]
        MOCK_DIGILOCKER["Mock DigiLocker / Gazette Issuance API"]
    end

    Client Tier --> Gateway Tier
    Gateway Tier --> Service Tier
    Service Tier --> Data Tier
    SVC_MOCK --> External Mock Layer
```

---

## 3. Frontend Architecture & Folder Structure

Built using **React 18**, **Vite**, **Tailwind CSS**, **Lucide React**, **Leaflet + React-Leaflet**, and **Recharts**.

```
bhoomisetu-frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   ├── favicon.ico
│   ├── assets/
│   │   ├── emblems/
│   │   │   └── emblem-india.svg
│   │   └── logo-bhoomisetu.svg
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── routes/
    │   ├── AppRoutes.jsx              # Protected route definitions with Role Guards
    │   └── navigation.js              # Sidebar menu definitions per user role
    ├── context/
    │   ├── AuthContext.jsx            # User state, JWT storage, role verification
    │   ├── ProjectContext.jsx         # Selected active project and proposal context
    │   ├── NotificationContext.jsx   # Toast alerts, statutory SLA warnings
    │   └── ThemeContext.jsx          # High-contrast accessibility & Gov theme
    ├── services/
    │   ├── api.js                     # Axios instance with JWT interceptors & error handlers
    │   ├── authService.js             # Login, logout, profile, session refresh
    │   ├── projectService.js          # CRUD proposals, timeline updates
    │   ├── parcelService.js           # Land parcels, geoJSON coordinates, surveys
    │   ├── compensationService.js     # Award calculation, solatium, PFMS disbursements
    │   ├── rrService.js               # Affected families, entitlements, R&R centers
    │   ├── documentService.js         # Uploads, gazette attachments, possession orders
    │   └── auditService.js            # Audit log fetching and compliance reports
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.jsx             # Official Govt header with Tricolor accent & Profile menu
    │   │   ├── Sidebar.jsx            # Role-aware collapsible sidebar navigation
    │   │   ├── Breadcrumb.jsx         # Breadcrumb navigation with RFCTLARR stage tracker
    │   │   ├── StatCard.jsx           # Metric cards with trends, icons, and status indicators
    │   │   ├── DataTable.jsx          # Sortable, filterable, paginated enterprise data table
    │   │   ├── Modal.jsx              # Accessible dialog modal
    │   │   ├── Badge.jsx              # Status badges (Under Review, Gazette Issued, Award Passed, etc.)
    │   │   ├── EmptyState.jsx         # Uniform empty state visual with action CTA
    │   │   ├── LoadingSpinner.jsx     # Tricolor/Enterprise loading animation
    │   │   ├── ErrorBanner.jsx        # Validation and API alert banner
    │   │   └── StepProgressBar.jsx    # RFCTLARR Section 4 to Section 38 visual milestones
    │   ├── gis/
    │   │   ├── LeafletMap.jsx         # Base Leaflet map with Satellite / Street toggle
    │   │   ├── ParcelPolygonLayer.jsx # GeoJSON Khasra polygon overlays with color status
    │   │   ├── ParcelDetailPopup.jsx  # Khasra owner, area in Hectares, award status
    │   │   ├── MapLegend.jsx          # Legend: Acquired, Under Dispute, SIA Surveyed, Awarded
    │   │   └── MapMeasureTool.jsx     # Spatial distance & area estimation widget
    │   ├── analytics/
    │   │   ├── AcquisitionPieChart.jsx # Land type breakdown (Agricultural, Forest, Private)
    │   │   ├── MilestoneBarChart.jsx  # Stage-wise duration vs statutory SLA deadlines
    │   │   ├── DisbursementLineChart.jsx # Target vs actual compensation disbursed (₹ Crores)
    │   │   └── DistrictComparison.jsx # Inter-district performance comparisons
    │   ├── workflow/
    │   │   ├── ApprovalActionsBar.jsx # Accept, Reject, Query, Escalate with digital remarks
    │   │   ├── TimelineTracker.jsx    # Chronological history of statutory gazettes & meetings
    │   │   └── CompensationCalculatorModal.jsx # Live RFCTLARR award simulator
    │   └── documents/
    │       ├── DocumentUploader.jsx   # Drag & drop upload with file-type/size validation
    │       ├── DocumentListTable.jsx  # Gazette PDF viewer, DSC verification status
    │       └── PossessionLetterPreview.jsx # Printable Form 11 Possession Handover certificate
    ├── pages/
    │   ├── auth/
    │   │   ├── LoginPage.jsx          # Secure login with role switcher for rapid prototyping
    │   │   └── UnauthorizedPage.jsx   # 403 Forbidden role guard fallback
    │   ├── dashboard/
    │   │   ├── ExecutiveDashboard.jsx # High-level MoRTH/State secretary portfolio view
    │   │   ├── OfficerDashboard.jsx   # Action-oriented inbox for SLA deadlines and tasks
    │   │   └── FieldDashboard.jsx     # Mobile-friendly survey task and GPS coordinate logger
    │   ├── projects/
    │   │   ├── ProjectListPage.jsx    # Filterable project repository
    │   │   ├── ProjectDetailPage.jsx  # Master dossier for a national infrastructure project
    │   │   └── NewProposalPage.jsx    # Multi-step wizard for project proposal submission
    │   ├── parcels/
    │   │   ├── ParcelManagementPage.jsx # Master Khasra/Plot register
    │   │   └── GISMapExplorerPage.jsx # Full-screen interactive GIS Cadastral map
    │   ├── statutory/
    │   │   ├── SIAPage.jsx            # Section 4 Social Impact Assessment module
    │   │   ├── NotificationSection11Page.jsx # Sec 11 Preliminary Notification & Gazette
    │   │   ├── ObjectionsSection15Page.jsx   # Sec 15 Public Hearing & Objections tracker
    │   │   ├── DeclarationSection19Page.jsx  # Sec 19 Final Declaration
    │   │   └── AwardSection23Page.jsx        # Sec 23 & 30 Award, Solatium & Market Value
    │   ├── compensation/
    │   │   ├── CompensationDeskPage.jsx # Landowner bank ledger, Aadhaar DBT status
    │   │   └── DisbursementHistoryPage.jsx # Real-time transaction reconciliation
    │   ├── rr/
    │   │   ├── AffectedFamiliesPage.jsx # Census of PAFs (Project Affected Families)
    │   │   └── RRSchemePage.jsx       # Section 31 R&R Entitlement allocation & infrastructure
    │   ├── possession/
    │   │   └── PossessionHandoverPage.jsx # Section 38 Physical possession certificate & joint signoff
    │   ├── documents/
    │   │   └── DocumentVaultPage.jsx  # Gazette copies, Joint Measurement Surveys (JMS)
    │   ├── audit/
    │   │   └── AuditTrailPage.jsx     # Immutable activity logs, IP, timestamp, role actions
    │   └── admin/
    │       ├── UserManagementPage.jsx # Officer role allocation, district jurisdictional binding
    │       └── SystemSettingsPage.jsx # Solatium rates, SLA thresholds, District Master
    ├── utils/
    │   ├── formatters.js              # Currency (₹ Lakhs / Crores), Hectares/Bighas, Dates
    │   ├── rfctlarrCalculator.js      # Solatium (100%), Rural factor (1.0x-2.0x), 12% interest
    │   └── validators.js              # Form validation rules
    └── mock/
        └── seedData.js                # Rich realistic Indian infrastructure projects & parcels
```

---

## 4. Backend Architecture & Folder Structure

Built using **Node.js (v20+)**, **Express.js**, **Mongoose (v8+)**, **JSON Web Tokens (JWT)**, **Bcryptjs**, and **Joi/Zod** validation.

```
bhoomisetu-backend/
├── package.json
├── server.js                  # Express bootstrap, database connection & graceful shutdown
├── .env.example               # Environment template (PORT, MONGO_URI, JWT_SECRET, SEED_DATA)
├── src/
│   ├── config/
│   │   ├── db.js              # Hybrid connection: MongoDB instance with memory-server fallback
│   │   ├── roles.js           # Enumerated RBAC roles and hierarchical access levels
│   │   └── constants.js       # Statutory SLA limits, RFCTLARR factors, State codes
│   ├── models/
│   │   ├── User.js            # Admin, Officers, Surveyors, Viewers
│   │   ├── Project.js         # Master infrastructure projects (NHAI, Rail, DFC, Energy)
│   │   ├── LandParcel.js      # Individual Khasra/Gat records with GeoJSON coordinates
│   │   ├── StatutoryStage.js  # Stage states (SIA, Sec 11, Sec 15, Sec 19, Sec 23, Sec 38)
│   │   ├── AwardCompensation.js # Compensation breakdown, Solatium, Market Value, DBT
│   │   ├── AffectedFamily.js  # PAFs, Vulnerability status, R&R package entitlement
│   │   ├── RRScheme.js        # Resettlement housing, employment, annuity, civic amenities
│   │   ├── DocumentRecord.js  # Metadata for Gazette notifications, JMS, Possession order
│   │   ├── Notification.js    # In-app alerts, statutory SLA warnings, action requests
│   │   └── AuditLog.js        # User actions, modified entities, IP address, timestamp
│   ├── middleware/
│   │   ├── auth.js            # Verify JWT header, attach user profile to req
│   │   ├── rbac.js            # Enforce role-based permission rules per route
│   │   ├── auditLogger.js     # Intercept mutating requests (POST/PUT/DELETE) to log actions
│   │   ├── validator.js       # Payload schema validation
│   │   └── errorHandler.js    # Standardized JSON error response handler
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── parcelController.js
│   │   ├── statutoryController.js # Handles RFCTLARR Sections 4, 11, 15, 19, 23, 38
│   │   ├── compensationController.js
│   │   ├── rrController.js
│   │   ├── documentController.js
│   │   ├── auditController.js
│   │   ├── analyticsController.js # Aggregations for Executive & District dashboards
│   │   └── mockGovController.js   # Simulates Bhulekh RoR, PFMS DBT, DigiLocker APIs
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── parcelRoutes.js
│   │   ├── statutoryRoutes.js
│   │   ├── compensationRoutes.js
│   │   ├── rrRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── auditRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── mockGovRoutes.js
│   │   └── index.js           # Unified v1 API routing hub
│   ├── services/
│   │   ├── compensationEngine.js # Deterministic RFCTLARR Section 26-30 arithmetic
│   │   ├── statutoryWorkflow.js  # State-machine handling valid transitions & dependencies
│   │   ├── gisProcessor.js       # GeoJSON boundary validations & area computation
│   │   └── mockIntegrations.js   # Standardized adapter interfaces for external gov systems
│   └── seeders/
│       ├── seedDatabase.js    # Comprehensive initial database seeder
│       └── sampleDatasets/
│           ├── projects.json  # Realistic NHAI Highway, Dedicated Freight Corridor, Solar Park
│           ├── parcels.json   # Actual Khasra numbers, village polygons, owner demographics
│           └── users.json     # Ready-to-test credential matrix for all 8 roles
```

---

## 5. Database Schema & Mongoose Data Models

### 5.1 User Model (`User.js`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Bcrypt hash
  role: { 
    type: String, 
    enum: [
      'SUPER_ADMIN',
      'CENTRAL_MINISTRY_OFFICER',
      'STATE_GOV_OFFICER',
      'DISTRICT_AUTHORITY_OFFICER',
      'LAND_ACQUISITION_OFFICER',
      'PROJECT_AGENCY_OFFICER',
      'FIELD_SURVEY_OFFICER',
      'VIEWER_EXECUTIVE'
    ],
    required: true 
  },
  designation: { type: String }, // e.g., "Competent Authority for Land Acquisition (CALA) / Addl DM"
  department: { type: String }, // e.g., "Revenue & Disaster Management", "MoRTH", "NHAI"
  jurisdiction: {
    state: { type: String },
    district: { type: String },
    tehsil: { type: String }
  },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}
```

### 5.2 Project Proposal Model (`Project.js`)
```javascript
{
  projectCode: { type: String, required: true, unique: true }, // e.g., "NHAI-DEL-MUM-PKG04"
  title: { type: String, required: true },
  description: { type: String },
  ministry: { type: String, required: true }, // e.g., "Ministry of Road Transport & Highways"
  implementingAgency: { type: String, required: true }, // e.g., "NHAI", "DFCCIL", "SECI"
  sector: { 
    type: String, 
    enum: ['Highways & Roads', 'Railways & Freight', 'Renewable Energy', 'Port & Inland Waterways', 'Urban Infrastructure'], 
    required: true 
  },
  estimatedCostInCrores: { type: Number, required: true },
  targetAcquisitionAreaHectares: { type: Number, required: true },
  statesCovered: [{ type: String }],
  districtsCovered: [{ type: String }],
  tehsilsCovered: [{ type: String }],
  currentStage: { 
    type: String, 
    enum: [
      'PROPOSAL_SUBMITTED', 
      'SIA_INITIATED', 
      'SIA_APPROVED', 
      'SECTION_11_NOTIFIED', 
      'SECTION_15_OBJECTIONS_REVIEWED', 
      'SECTION_19_DECLARED', 
      'SECTION_23_AWARD_PASSED', 
      'COMPENSATION_DISBURSED', 
      'RR_SETTLED', 
      'POSSESSION_TAKEN'
    ],
    default: 'PROPOSAL_SUBMITTED' 
  },
  status: { type: String, enum: ['Active', 'On Hold', 'Completed', 'Litigation Flagged'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  statutoryMilestones: [{
    stage: { type: String },
    targetDate: { type: Date },
    actualDate: { type: Date },
    isCompleted: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
    gazetteRefNumber: { type: String }
  }],
  timestamps: true
}
```

### 5.3 Land Parcel Model (`LandParcel.js`)
```javascript
{
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  khasraNumber: { type: String, required: true }, // Survey Number e.g. "142/1A"
  state: { type: String, required: true },
  district: { type: String, required: true },
  tehsil: { type: String, required: true },
  village: { type: String, required: true },
  landCategory: { 
    type: String, 
    enum: ['Private Agricultural (Irrigated)', 'Private Agricultural (Unirrigated)', 'Private Non-Agricultural / Commercial', 'Government / Gaon Sabha', 'Forest Land'],
    required: true 
  },
  totalAreaHectares: { type: Number, required: true },
  acquiredAreaHectares: { type: Number, required: true },
  circleRatePerHectare: { type: Number, required: true }, // Base Circle Rate in ₹
  marketValuePerHectare: { type: Number, required: true }, // Assessed under Sec 26
  acquisitionStatus: {
    type: String,
    enum: ['Proposed', 'SIA Survey Complete', 'Sec 11 Notified', 'Disputed / In Court', 'Award Determined', 'Disbursed', 'Possession Transferred'],
    default: 'Proposed'
  },
  owners: [{
    name: { type: String, required: true },
    sharePercentage: { type: Number, default: 100 },
    aadhaarMasked: { type: String }, // e.g. "XXXX-XXXX-4589"
    panNumber: { type: String },
    bankDetails: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String }
    },
    contactPhone: { type: String }
  }],
  coordinates: {
    type: { type: String, enum: ['Polygon', 'Point'], default: 'Polygon' },
    coordinates: { type: Array, required: true } // GeoJSON Polygon lat/lng array
  },
  gisAttributes: {
    centroid: { lat: Number, lng: Number },
    encroachmentRisk: { type: String, enum: ['None', 'Low', 'High'], default: 'None' },
    treesCount: { type: Number, default: 0 },
    structuresCount: { type: Number, default: 0 }
  }
}
```

### 5.4 Statutory Stage & SIA Assessment Model (`StatutoryStage.js`)
```javascript
{
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  stageCode: { type: String, enum: ['SEC_4_SIA', 'SEC_11_PRELIM', 'SEC_15_HEARING', 'SEC_19_DECLARATION', 'SEC_23_AWARD', 'SEC_38_POSSESSION'], required: true },
  initiatedDate: { type: Date, default: Date.now },
  completedDate: { type: Date },
  statutoryDeadlineDate: { type: Date }, // Automatically calculated as per RFCTLARR time-limits
  status: { type: String, enum: ['Pending', 'In Progress', 'Published', 'Approved', 'Overdue'], default: 'Pending' },
  gazetteNotificationDetails: {
    notificationNumber: { type: String },
    publicationDate: { type: Date },
    stateOfficialGazetteUrl: { type: String },
    newspaperHindi: { type: String },
    newspaperEnglish: { type: String }
  },
  siaFindings: {
    agencyName: { type: String },
    affectedFamiliesCount: { type: Number },
    publicHearingsConducted: { type: Number },
    socialImpactMitigationCost: { type: Number }
  },
  objectionsRecord: [{
    petitionerName: { type: String },
    khasraNumber: { type: String },
    objectionType: { type: String, enum: ['Measurement Error', 'Ownership Dispute', 'Compensation Rate', 'Environmental Concern'] },
    hearingDate: { type: Date },
    resolutionStatus: { type: String, enum: ['Upheld', 'Dismissed with Explanation', 'Sub-Judice'] },
    calaOrderSummary: { type: String }
  }],
  actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}
```

### 5.5 Award & Compensation Calculation Model (`AwardCompensation.js`)
```javascript
{
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  parcelId: { type: mongoose.Schema.Types.ObjectId, ref: 'LandParcel', required: true },
  awardNumber: { type: String, required: true, unique: true }, // e.g., "CALA/KAS/2026/AWD-098"
  dateOfAward: { type: Date, default: Date.now },
  calculationDetails: {
    baseLandMarketValue: { type: Number, required: true }, // Section 26 base value in ₹
    ruralUrbanMultiplierFactor: { type: Number, required: true, default: 1.0 }, // 1.0x to 2.0x
    multipliedLandValue: { type: Number, required: true },
    assetsValueStructures: { type: Number, default: 0 }, // Section 29
    assetsValueTreesCrops: { type: Number, default: 0 }, // Section 29
    solatiumAmount: { type: Number, required: true }, // 100% of (multipliedLandValue + assets) as per Sec 30(1)
    additionalInterestAmount: { type: Number, required: true }, // 12% p.a. from Sec 4 to Award date (Sec 30(3))
    totalCompensationPayable: { type: Number, required: true }
  },
  disbursementSchedule: [{
    ownerName: { type: String },
    bankAccount: { type: String },
    ifscCode: { type: String },
    amountShare: { type: Number },
    paymentStatus: { type: String, enum: ['Generated', 'PFMS Sent', 'Disbursed', 'Failed', 'Held in Escrow'], default: 'Generated' },
    utrTransactionNumber: { type: String },
    disbursedDate: { type: Date }
  }],
  calaSignoff: {
    officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    digitalSignatureHash: { type: String },
    signedAt: { type: Date }
  }
}
```

### 5.6 Affected Families & R&R Model (`AffectedFamily.js` & `RRScheme.js`)
```javascript
// AffectedFamily.js
{
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  familyHeadName: { type: String, required: true },
  vulnerabilityCategory: { 
    type: String, 
    enum: ['Scheduled Caste (SC)', 'Scheduled Tribe (ST)', 'Below Poverty Line (BPL)', 'Marginal Farmer', 'Tenant / Agricultural Labourer', 'General'],
    required: true 
  },
  membersCount: { type: Number, default: 1 },
  village: { type: String, required: true },
  residenceDisplaced: { type: Boolean, default: false },
  livelihoodLoss: { type: Boolean, default: false },
  assignedResettlementCenter: { type: String },
  rrEntitlements: {
    constructedHouseProvided: { type: Boolean, default: false },
    subsistenceGrantAmount: { type: Number, default: 0 }, // e.g. ₹36,000 as per Second Schedule
    transportationCostGrant: { type: Number, default: 0 }, // e.g. ₹50,000
    resettlementAllowanceGiven: { type: Boolean, default: false },
    employmentOrAnnuityStatus: { type: String, enum: ['Government / Project Job', 'One-time Cash Grant', 'Annuity Policy', 'Not Applicable'], default: 'One-time Cash Grant' }
  },
  status: { type: String, enum: ['Identified', 'R&R Scheme Approved', 'Resettled', 'Payment Settled'], default: 'Identified' }
}
```

### 5.7 Audit Log Model (`AuditLog.js`)
```javascript
{
  timestamp: { type: Date, default: Date.now, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  userRole: { type: String },
  ipAddress: { type: String },
  actionType: { 
    type: String, 
    enum: ['LOGIN', 'PROPOSAL_CREATE', 'STAGE_ADVANCE', 'PARCEL_UPDATE', 'AWARD_CALCULATE', 'COMPENSATION_DISBURSE', 'RR_ALLOCATE', 'POSSESSION_SIGN'],
    required: true 
  },
  resourceType: { type: String, required: true }, // e.g., "Project", "AwardCompensation", "LandParcel"
  resourceId: { type: String },
  previousState: { type: Object },
  newState: { type: Object },
  description: { type: String, required: true }
}
```

---

## 6. Role-Permission Matrix (RBAC)

| User Role | Dashboard View | Proposals & Projects | Land Parcels & GIS | Statutory Workflow (Sec 4-19) | Award & Compensation (Sec 23-30) | R&R Management (Sec 31) | Possession Handover (Sec 38) | User Admin & Audit Logs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Full Admin Master | Full Access (CRUD) | Full Access | Full Access | Full Access | Full Access | Full Access | Manage Users & Full Audit Logs |
| **Central Ministry Officer** | National Multi-Project Portfolio | Create & Submit Proposals; View All | View National Overlays | Review & Grant MoRTH/In-Principle Clearances | View Disbursal Analytics | View Macro Progress | View Possession Summaries | View High-Level Logs |
| **State Government Officer** | State Portfolio & District Comparison | Review State Alignment; Grant State Concurrence | View State GIS layers | Review Sec 11/19 Gazette Approvals | Monitor State Exchequers | Approve State R&R Schemes | Monitor Transfer to Agency | Read State Logs |
| **District Authority Officer (DM / DC)** | District Operational Desk | Validate District Proposals | Update Revenue Khasras | Approve Sec 11, Conduct Sec 15 Objections, Issue Sec 19 | Supervise CALA Award Approval | Approve District PAF Schemes | Countersign Sec 38 Possession Order | Read District Logs |
| **Land Acquisition Officer (CALA / SLAO)** | CALA Statutory Processing Desk | View Assigned Project | Validate Surveys & Ownership Data | Draft Gazette Notifications, Log Objections | Compute Awards, Solatium, Authorize PFMS DBT | Verify PAF Entitlements | Issue Form 11 Physical Possession Notice | Read Operational Logs |
| **Project Implementing Agency (NHAI/Railways)** | Agency Project Tracker | Initiate Proposals, Track Acquisition | Upload Proposed Alignment Coordinates | Track Statutory Milestones & Gazette status | Fund Deposit into CALA Escrow Account | Track R&R Center Construction | Receive Handover & Sign Joint Memo | Read Project Logs |
| **Field Survey Officer** | Field Mobile Survey App | View Assigned Village/Zone | Collect GPS Points, Geo-tag Assets, Trees, Structures | Log Joint Measurement Survey (JMS) | View Verification Status | Conduct Socio-Economic Survey of PAFs | Validate Boundary Pillars | Create Survey Records |
| **Viewer / Executive (MoRTH / PM GatiShakti)** | Read-Only KPI Analytics | Read-Only View | Read-Only GIS Spatial Map | Read-Only Timeline Progress | Read-Only Expenditure Summaries | Read-Only R&R Status | Read-Only Land Bank View | Read-Only Summary Reports |

---

## 7. RESTful API Endpoint Specifications

All endpoints are versioned under `/api/v1` and return standardized JSON envelopes:
`{ success: true, data: { ... }, message: "..." }` or `{ success: false, error: { code: "...", details: "..." } }`.

### 7.1 Authentication & Profile
- `POST /api/v1/auth/login` - Authenticate with email & password, returns JWT token & user profile.
- `POST /api/v1/auth/logout` - Invalidate session & record logout audit log.
- `GET /api/v1/auth/me` - Fetch authenticated user context, permissions, and jurisdiction.
- `GET /api/v1/auth/demo-users` - Fetch prototype demo user accounts for 1-click role testing.

### 7.2 Projects & Proposals
- `GET /api/v1/projects` - List projects (supports query filters: `sector`, `state`, `currentStage`, `search`).
- `POST /api/v1/projects` - Create new land acquisition proposal (Implementing Agency / Ministry).
- `GET /api/v1/projects/:id` - Full project dossier with stats, milestones, and stage breakdown.
- `PUT /api/v1/projects/:id` - Update project details or parameters.
- `POST /api/v1/projects/:id/advance-stage` - Move project to next statutory stage upon clearance.

### 7.3 Land Parcels & GIS
- `GET /api/v1/parcels` - Search and list Khasra parcels (filters: `projectId`, `district`, `status`).
- `GET /api/v1/parcels/geojson/:projectId` - Return FeatureCollection GeoJSON for Leaflet cadastral overlays.
- `POST /api/v1/parcels` - Add individual Khasra survey record.
- `POST /api/v1/parcels/bulk-upload` - Upload survey dataset (GeoJSON / CSV format).
- `PUT /api/v1/parcels/:id` - Update survey measurements, owner details, or circle rate.

### 7.4 RFCTLARR Statutory Workflow
- `GET /api/v1/statutory/:projectId` - Fetch complete statutory timeline history and upcoming statutory deadlines.
- `POST /api/v1/statutory/sia/submit` - Record Social Impact Assessment findings & public hearing summaries.
- `POST /api/v1/statutory/section-11/publish` - Generate and publish Section 11 Gazette notification.
- `POST /api/v1/statutory/section-15/objections` - Register citizen/landowner objection and record CALA hearing order.
- `POST /api/v1/statutory/section-19/declare` - Issue Section 19 Final Declaration and publication details.

### 7.5 Compensation & Awards
- `POST /api/v1/compensation/calculate-preview` - Pure calculation engine for RFCTLARR Sec 26-30 preview.
- `POST /api/v1/compensation/award` - Formalize and pass Section 23 Award with CALA digital signoff.
- `GET /api/v1/compensation/project/:projectId` - List all passed awards and disbursement ledgers.
- `POST /api/v1/compensation/disburse` - Trigger mock PFMS DBT transfer to landowner bank accounts.

### 7.6 Rehabilitation & Resettlement (R&R)
- `GET /api/v1/rr/families/:projectId` - List Project Affected Families (PAFs) and vulnerability breakdown.
- `POST /api/v1/rr/families` - Enroll surveyed affected family and asset loss record.
- `POST /api/v1/rr/scheme/approve` - Approve R&R package as per Second Schedule entitlements.
- `PUT /api/v1/rr/families/:id/status` - Mark housing handover, subsistence grant, or annuity payment.

### 7.7 Physical Possession Handover
- `POST /api/v1/possession/generate-certificate` - Issue Section 38 Possession Handover certificate.
- `GET /api/v1/possession/status/:projectId` - Real-time possession acreage percentage against target.

### 7.8 Analytics & Executive Reports
- `GET /api/v1/analytics/executive-summary` - Macro KPIs: Total Acquired Hectares, Capital Disbursed, Pending Objections.
- `GET /api/v1/analytics/milestones-sla` - SLA compliance report showing days saved or overdue per stage.
- `GET /api/v1/analytics/sector-breakdown` - Breakdown of acquisitions across Highways, Railways, Green Energy.

### 7.9 Mock e-Governance Integrations
- `GET /api/v1/mock-gov/bhulekh/khasra/:khasraNumber` - Simulates State Land Records API lookup.
- `POST /api/v1/mock-gov/pfms/validate-account` - Simulates Public Financial Management System DBT bank validation.
- `GET /api/v1/mock-gov/digilocker/gazette/:gazetteId` - Simulates official e-Gazette verification.

### 7.10 Audit Logs & System Admin
- `GET /api/v1/audit/logs` - Paginated immutable audit trail with actor, action, timestamp, and entity diff.
- `GET /api/v1/admin/users` - User directory with role and jurisdiction assignments.
- `POST /api/v1/admin/users` - Create officer account with RBAC credentials.

---

## 8. Main Application Workflow (Statutory Lifecycle)

```
[Implementing Agency Proposal]
         │ (NHAI / Railways submits project alignment & target area)
         ▼
[Stage 1: Proposal Vetting & In-Principle Approval]
         │ (Central Ministry / State Revenue confirms alignment)
         ▼
[Stage 2: Section 4 - Social Impact Assessment (SIA)]
         │ (Field survey, public hearings, SIA Expert Committee review)
         ▼
[Stage 3: Section 11 - Preliminary Gazette Notification]
         │ (Published in State Gazette & 2 local newspapers; freezes land transactions)
         ▼
[Stage 4: Section 15 - Hearing of Objections]
         │ (60-day window: Landowners submit claims; CALA hears & passes orders)
         ▼
[Stage 5: Section 19 - Declaration of Acquisition & R&R Scheme]
         │ (Final declaration that land is required for public purpose; R&R area declared)
         ▼
[Stage 6: Joint Measurement Survey (JMS) & Section 23 Award]
         │ (Khasra verification; Sec 26 market value + 100% solatium + 12% interest calculated)
         ▼
[Stage 7: Direct Benefit Transfer (DBT) Compensation]
         │ (Disbursement directly to verified bank accounts via PFMS integration)
         ▼
[Stage 8: Section 31 - Rehabilitation & Resettlement (R&R) Execution]
         │ (Housing grants, subsistence allowances, and resettlement plots handed over)
         ▼
[Stage 9: Section 38 - Physical Possession & Land Transfer]
         │ (CALA executes possession memo; revenue mutation to Implementing Agency)
```

---

## 9. Page / Screen List & Design Architecture

1. **Authentication Portal (`/login`)**:
   - Official Government of India / Digital India styled login screen.
   - 1-Click Role Switcher modal/bar allowing evaluators to instantly test any of the 8 roles without re-typing passwords.
2. **Executive Portfolio Dashboard (`/dashboard`)**:
   - KPI metrics: Total Projects, Land Area Acquired (Ha), Compensation Disbursed (₹ Cr), Statutory Compliance Index.
   - Interactive India/State map with project corridor overlays.
   - Stage distribution funnel (SIA -> Sec 11 -> Award -> Possession).
3. **Projects Master Registry (`/projects`)**:
   - Advanced multi-filter table (Sector, State, Implementing Agency, RFCTLARR Stage).
   - Project cards with visual progress meters, statutory SLA countdown, and budget utilization.
4. **Project Proposal Wizard (`/projects/new`)**:
   - Step 1: Project Metadata & Sector Classification.
   - Step 2: Jurisdiction & Revenue Villages (State, District, Tehsil, Village).
   - Step 3: Land Requirement Breakdown (Private, Forest, Govt).
   - Step 4: Budgetary Allocation & Milestone Targets.
5. **Interactive GIS Cadastral Map Explorer (`/gis-explorer`)**:
   - OpenStreetMap base layer with Satellite imagery toggle.
   - Color-coded Khasra plot boundaries (Green = Possession Taken, Amber = SIA Survey, Red = Dispute).
   - Click-to-inspect parcel drawer: Owner names, area, circle rate, tree/structure count, award status.
   - Measure distance and polygon area tools.
6. **Statutory RFCTLARR Pipeline Desk (`/projects/:id/statutory`)**:
   - Interactive milestone timeline highlighting statutory clocks:
     - Section 4 to Section 11 deadline tracker.
     - Section 19 to Section 23 award statutory clock (12 months limit).
   - Dedicated action drawers for publishing gazette notices, entering newspaper circulation dates, and logging objections.
7. **Compensation & Solatium Desk (`/compensation`)**:
   - Live interactive RFCTLARR Section 26-30 Calculator:
     - Input: Base Market Value, Rural Multiplier (1.0x to 2.0x), Assets, Tree valuation.
     - Auto-calculated: 100% Solatium (Sec 30(1)), 12% Interest (Sec 30(3)), Total Award.
   - Bulk PFMS DBT Disbursal Simulator with transaction hash generation.
8. **R&R & Affected Families Registry (`/rr-management`)**:
   - Demographic census of Project Affected Families (PAFs).
   - Entitlement status: Resettlement housing plots, one-time subsistence grants, transport grants.
   - Vulnerability filters: SC/ST priority, Below Poverty Line (BPL), female-headed households.
9. **Possession & Land Bank Handover (`/possession`)**:
   - Section 38 statutory checklist verification (100% compensation + R&R clearance).
   - Digital Possession Certificate (Form 11) generator with QR code and CALA signature badge.
10. **Immutable Audit Trail & Compliance Hub (`/audit-trail`)**:
    - Real-time event stream of every stage clearance, compensation approval, and user login.
    - JSON before/after state diff inspector for compliance investigations.

---

## 10. Design Aesthetics & UI Design System

- **Design Philosophy**: High-credibility Indian Government Digital Public Infrastructure (reminiscent of PM GatiShakti, Parivesh, and Bhoomi portals, modernized with sleek Enterprise SaaS ergonomics).
- **Color Palette**:
  - `Govt Navy / Primary`: `#0f2942` (Deep Ashoka Navy)
  - `Tricolor Accent`: `#f58220` (India Saffron / Warm Amber)
  - `Secondary Accent`: `#138808` (India Emerald Green / Land Growth)
  - `Surface / Background`: `#f8fafc` (Clean Slate Light) and `#ffffff` (Pure White)
  - `Border / Dividers`: `#e2e8f0` (Subtle Slate Border)
  - `Text Hierarchy`: `#0f172a` (Slate 900 Primary), `#475569` (Slate 600 Secondary)
  - `Status Tokens`: Green (`#059669`), Amber (`#d97706`), Red (`#dc2626`), Blue (`#2563eb`)
- **Typography**: Inter / Roboto via Google Fonts; crisp numerical tables with tabular numbers.
- **Responsiveness**: Fully fluid grid accommodating desktop command centers, 10" field tablets, and mobile smartphones.

---

## 11. Development Roadmap

### Phase 1: Foundations & Architecture Verification (Current Turn)
- [x] Comprehensive Architecture Document (`BHOOMISETU_ARCHITECTURE.md`)
- [ ] Initialize frontend workspace with React + Vite + Tailwind CSS + Lucide + Leaflet + Recharts
- [ ] Initialize backend workspace with Express + Mongoose + JWT + Cors + Seeders
- [ ] Implement zero-config fallback database architecture so the prototype operates smoothly even if a standalone MongoDB daemon is absent.

### Phase 2: Core Data Models, Authentication & Role Switching
- [ ] Mongoose models for Users, Projects, LandParcels, StatutoryStages, Awards, PAFs, and AuditLogs
- [ ] Pre-seeded realistic Indian infrastructure datasets (NHAI Delhi-Mumbai Expressway Corridor, DFC East-West Freight Corridor, Gujarat Solar Park)
- [ ] JWT authentication with instantaneous 1-Click Role Switcher banner for evaluators

### Phase 3: Statutory Workflows, Compensation Engine & GIS
- [ ] Interactive RFCTLARR Statutory Pipeline (Sec 4 SIA, Sec 11 Gazette, Sec 15 Objections, Sec 19 Declaration, Sec 23 Award, Sec 38 Possession)
- [ ] Section 26-30 Compensation Calculator with Rural Factor & 100% Solatium
- [ ] Leaflet Cadastral Map with GeoJSON polygon overlays, status badges, and parcel drawer

### Phase 4: R&R Modules, PFMS DBT Simulation, Audit Trail & Polish
- [ ] Affected Families (PAFs) entitlement tracking and R&R centers
- [ ] Mock e-Governance adapters (Bhulekh RoR lookup, PFMS DBT disbursal, DigiLocker gazettes)
- [ ] Real-time immutable audit log viewer
- [ ] End-to-end browser walkthrough and testing verification
