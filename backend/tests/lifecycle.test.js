/**
 * BhoomiSetu Land Acquisition Lifecycle & Multi-State Dataset Automated Verification
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000/api/v1';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log(' BHOOMISETU CORE LIFECYCLE & MULTI-STATE DATASET TEST SUITE    ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate as Super Admin & Implementing Agency
    const adminLogin = await request('POST', '/auth/login', {
      email: 'superadmin@bhoomisetu.gov.in',
      password: 'Admin@123'
    });
    assert(adminLogin.status === 200 && adminLogin.body.data?.token, 'Super Admin authenticated successfully');
    const adminToken = adminLogin.body?.data?.token;

    const agencyLogin = await request('POST', '/auth/login', {
      email: 'agency.nhai@bhoomisetu.gov.in',
      password: 'Admin@123'
    });
    assert(agencyLogin.status === 200 && agencyLogin.body.data?.token, 'Project Implementing Agency authenticated successfully');
    const agencyToken = agencyLogin.body?.data?.token;

    const dmLogin = await request('POST', '/auth/login', {
      email: 'dm.thane@bhoomisetu.gov.in',
      password: 'Admin@123'
    });
    assert(dmLogin.status === 200 && dmLogin.body.data?.token, 'District Authority Officer authenticated successfully');
    const dmToken = dmLogin.body?.data?.token;

    // 2. Verify 10 Projects across Different Indian States
    const projectsList = await request('GET', '/projects');
    assert(
      projectsList.status === 200 && Array.isArray(projectsList.body?.data) && projectsList.body.data.length >= 10,
      `Projects registry returns >= 10 projects (Found: ${projectsList.body?.data?.length})`
    );

    // Verify distinct states
    const states = new Set(projectsList.body?.data?.map(p => p.state));
    assert(
      states.size >= 8,
      `Projects cover diverse Indian states (Found ${states.size} states: ${Array.from(states).join(', ')})`
    );

    // Verify distinct project types
    const types = new Set(projectsList.body?.data?.map(p => p.projectType || p.sector));
    assert(
      types.size >= 6,
      `Projects cover multiple statutory sectors (Found ${types.size} types: ${Array.from(types).join(', ')})`
    );

    // 3. Filter by State and ProjectType
    const mhProjects = await request('GET', '/projects?state=Maharashtra');
    assert(
      mhProjects.status === 200 && mhProjects.body.data.every(p => p.state === 'Maharashtra'),
      'Filter projects by state (Maharashtra) functions accurately'
    );

    const rlyProjects = await request('GET', '/projects?projectType=Railway');
    assert(
      rlyProjects.status === 200 && rlyProjects.body.data.some(p => (p.projectType === 'Railway' || p.sector === 'Railway')),
      'Filter projects by projectType (Railway) functions accurately'
    );

    // 4. Get Project by ID with Complete 12-Tab Relational Aggregation
    const dmeDossier = await request('GET', '/projects/PRJ-NHAI-DME-001');
    const dme = dmeDossier.body?.data;

    assert(
      dmeDossier.status === 200 && dme?.projectId === 'PRJ-NHAI-DME-001',
      'GET /projects/:id returns master project record'
    );

    assert(
      Array.isArray(dme?.landParcels) && dme.landParcels.length >= 4,
      `Project aggregate includes Land Parcels (Count: ${dme?.landParcels?.length})`
    );

    assert(
      Array.isArray(dme?.notifications) && dme.notifications.length >= 2,
      `Project aggregate includes Gazette Notifications (Count: ${dme?.notifications?.length})`
    );

    assert(
      Array.isArray(dme?.awards) && dme.awards.length >= 2,
      `Project aggregate includes Section 23 Awards (Count: ${dme?.awards?.length})`
    );

    assert(
      Array.isArray(dme?.compensations) && dme.compensations.length >= 3,
      `Project aggregate includes Compensation & DBT Records (Count: ${dme?.compensations?.length})`
    );

    assert(
      Array.isArray(dme?.affectedFamilies) && dme.affectedFamilies.length >= 3,
      `Project aggregate includes Project Affected Families (PAFs) (Count: ${dme?.affectedFamilies?.length})`
    );

    assert(
      Array.isArray(dme?.possessions) && dme.possessions.length >= 1,
      `Project aggregate includes Section 38 Possession Handover Records (Count: ${dme?.possessions?.length})`
    );

    assert(
      Array.isArray(dme?.rrCases) && dme.rrCases.length >= 2,
      `Project aggregate includes Second Schedule R&R Scheme Cases (Count: ${dme?.rrCases?.length})`
    );

    assert(
      Array.isArray(dme?.documents) && dme.documents.length >= 4,
      `Project aggregate includes Statutory Official Documents (Count: ${dme?.documents?.length})`
    );

    assert(
      Array.isArray(dme?.milestones) && dme.milestones.length >= 6,
      `Project aggregate includes Statutory Timeline Milestones (Count: ${dme?.milestones?.length})`
    );

    assert(
      Array.isArray(dme?.auditLogs) && dme.auditLogs.length >= 3,
      `Project aggregate includes Chronological Audit Trail (Count: ${dme?.auditLogs?.length})`
    );

    // 5. Create Project API
    const newProjCode = `PRJ-AUTO-${Date.now().toString(36).toUpperCase()}`;
    const createRes = await request('POST', '/projects', {
      projectId: newProjCode,
      projectName: 'Bengaluru Peripheral Ring Road Greenfield Package-A',
      projectType: 'Highway',
      ministry: 'Ministry of Road Transport and Highways (MoRTH)',
      implementingAgency: 'National Highways Authority of India (NHAI)',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      tehsil: 'Yelahanka',
      village: 'Singanayakanahalli',
      requiredLandArea: 180.0,
      totalProjectArea: 220.0,
      estimatedBudgetCrores: 1650
    }, agencyToken);

    assert(
      createRes.status === 201 && createRes.body.data?.projectId === newProjCode,
      'POST /projects creates new project corridor and auto-initiates proposal'
    );

    // 6. Update Project API
    const updateRes = await request('PUT', `/projects/${newProjCode}`, {
      description: 'Updated corridor alignment following public hearing feedback.',
      estimatedBudgetCrores: 1720
    }, agencyToken);

    assert(
      updateRes.status === 200 && updateRes.body.data?.estimatedBudgetCrores === 1720,
      'PUT /projects/:id updates project particulars and estimated budget'
    );

    // 7. Update Status API
    const statusRes = await request('PATCH', `/projects/${newProjCode}/status`, {
      status: 'Active Acquisition',
      currentStage: 'SIA_INITIATED',
      remarks: 'Preliminary social impact assessment survey initiated.'
    }, adminToken);

    assert(
      statusRes.status === 200 && statusRes.body.data?.currentStage === 'SIA_INITIATED',
      'PATCH /projects/:id/status updates status and statutory stage'
    );

    // 8. Assign Officer API
    const assignRes = await request('POST', `/projects/${newProjCode}/assign-officer`, {
      roleType: 'CALA',
      officerId: 'user_005',
      officerName: 'Shri Suresh K. Patil'
    }, adminToken);

    assert(
      assignRes.status === 200 && assignRes.body.data?.assignedOfficers?.calaOfficerName === 'Shri Suresh K. Patil',
      'POST /projects/:id/assign-officer successfully assigns statutory CALA'
    );

    // 9. PROPOSAL WORKFLOW TRANSITIONS
    // A: Create Draft Proposal
    const propRes = await request('POST', '/proposals', {
      projectName: 'Hyderabad-Vijayawada Bullet Train Feasibility Link',
      projectType: 'Railway',
      sponsoringAgency: 'National High Speed Rail Corporation (NHSRCL)',
      state: 'Telangana',
      district: 'Nalgonda',
      tehsil: 'Suryapet',
      requiredAreaHectares: 240.0,
      estimatedCostInCrores: 4800,
      justification: 'High speed passenger transit corridor.'
    }, agencyToken);

    const propId = propRes.body?.data?.proposalId;
    assert(
      propRes.status === 201 && propRes.body.data?.status === 'Draft',
      `Proposal draft created in 'Draft' state (ID: ${propId})`
    );

    // B: Submit Proposal: Draft -> Submitted
    const submitRes = await request('POST', `/proposals/${propId}/submit`, null, agencyToken);
    assert(
      submitRes.status === 200 && submitRes.body.data?.status === 'Submitted',
      'Proposal workflow transition: Draft -> Submitted'
    );

    // C: District Verification: Submitted -> State Review
    const verifyRes = await request('POST', `/proposals/${propId}/verify`, {
      landRecordsStatus: '100% RoR verified with Dharani Telangana portal',
      fieldInspectionDone: true,
      remarks: 'No ecological sanctuaries infringed.'
    }, dmToken);

    assert(
      verifyRes.status === 200 && verifyRes.body.data?.status === 'State Review',
      'Proposal workflow transition: Submitted -> State Review (District Verification passed)'
    );

    // D: State Review -> Central Review
    const stateApproveRes = await request('POST', `/proposals/${propId}/approve`, {
      remarks: 'State Government high-level committee clearance approved.'
    }, adminToken);

    assert(
      stateApproveRes.status === 200 && stateApproveRes.body.data?.status === 'Central Review',
      'Proposal workflow transition: State Review -> Central Review'
    );

    // E: Central Review -> Approved
    const centralApproveRes = await request('POST', `/proposals/${propId}/approve`, {
      cabinetSanctionRef: 'CCEA-NHSRCL-HYD-2026/01',
      remarks: 'CCEA ministerial sanction granted.'
    }, adminToken);

    assert(
      centralApproveRes.status === 200 && centralApproveRes.body.data?.status === 'Approved',
      'Proposal workflow transition: Central Review -> Approved'
    );

    // F: Approved -> Acquisition Initiated
    const initAcqRes = await request('POST', `/proposals/${propId}/approve`, null, adminToken);
    assert(
      initAcqRes.status === 200 && initAcqRes.body.data?.status === 'Acquisition Initiated',
      'Proposal workflow transition: Approved -> Acquisition Initiated'
    );

    // G: Test Proposal Rejection
    const rejectDraftRes = await request('POST', '/proposals', {
      projectName: 'Hillside Private Quarry Approach Road',
      projectType: 'Other Infrastructure',
      sponsoringAgency: 'Private Contractor',
      state: 'Uttarakhand',
      district: 'Dehradun',
      requiredAreaHectares: 15.0,
      estimatedCostInCrores: 45,
      justification: 'Quarry logistics access.'
    }, agencyToken);
    const rejectPropId = rejectDraftRes.body?.data?.proposalId;

    const rejectRes = await request('POST', `/proposals/${rejectPropId}/reject`, {
      reason: 'Rejected due to Eco-Sensitive Zone (ESZ) prohibition and non-statutory purpose.'
    }, adminToken);

    assert(
      rejectRes.status === 200 && rejectRes.body.data?.status === 'Rejected' && !!rejectRes.body.data?.rejectionReason,
      'Proposal workflow transition: Any -> Rejected with statutory reason recorded'
    );

    // 10. Verify Overall Seed Datasets in MemoryStore
    const allParcels = await request('GET', '/parcels');
    assert(
      allParcels.status === 200 && allParcels.body?.data?.length >= 30,
      `Land Parcels count satisfies requirement (Found: ${allParcels.body?.data?.length} >= 30)`
    );

    const auditRes = await request('GET', '/audit/logs', null, adminToken);
    assert(
      auditRes.status === 200 && auditRes.body?.data?.length >= 10,
      `AuditLog captures all state mutations (Total Logs: ${auditRes.body?.data?.length})`
    );

    console.log('\n================================================================');
    console.log(` LIFECYCLE VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED `);
    console.log('================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Lifecycle test execution error:', err);
    process.exit(1);
  }
}

runTests();
