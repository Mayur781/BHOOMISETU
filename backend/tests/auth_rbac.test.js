/**
 * BhoomiSetu Authentication & RBAC Automated Verification Suite
 * Validates JWT generation, verification, password checking, protected routes,
 * statutory role permissions, and role-based access denial (HTTP 403).
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
  console.log(' BHOOMISETU AUTHENTICATION & RBAC AUTOMATED VERIFICATION SUITE  ');
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
    // 1. Health check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.success, 'Backend health endpoint is responsive (200 OK)');

    // 2. Valid login (CALA Officer)
    const calaLogin = await request('POST', '/auth/login', {
      email: 'cala.nhai@bhoomisetu.gov.in',
      password: 'Admin@123'
    });
    assert(
      calaLogin.status === 200 && !!calaLogin.body.data?.token,
      'Valid Officer Login (cala.nhai@bhoomisetu.gov.in) returns 200 OK and JWT',
      JSON.stringify(calaLogin.body)
    );
    const calaToken = calaLogin.body?.data?.token;
    const calaUser = calaLogin.body?.data?.user;

    assert(
      calaUser?.role === 'LAND_ACQUISITION_OFFICER' && Array.isArray(calaUser?.permissions) && calaUser.permissions.includes('PASS_SECTION_23_AWARD'),
      'CALA user payload includes LAND_ACQUISITION_OFFICER role and statutory permissions'
    );

    // 3. Invalid credentials
    const invalidLogin = await request('POST', '/auth/login', {
      email: 'cala.nhai@bhoomisetu.gov.in',
      password: 'WrongPassword@999'
    });
    assert(
      invalidLogin.status === 401 && invalidLogin.body.success === false,
      'Invalid credentials correctly rejected with 401 Unauthorized'
    );

    // 4. Protected endpoint without token
    const unauthReq = await request('GET', '/auth/me');
    assert(
      unauthReq.status === 401,
      'Accessing protected endpoint (/auth/me) without token returns 401 Unauthorized'
    );

    // 5. Protected endpoint with token
    const meReq = await request('GET', '/auth/me', null, calaToken);
    assert(
      meReq.status === 200 && meReq.body.data?.user?.email === 'cala.nhai@bhoomisetu.gov.in',
      'Accessing /auth/me with valid JWT returns 200 OK and officer identity'
    );

    // 6. Demo users list
    const demoList = await request('GET', '/auth/demo-users');
    assert(
      demoList.status === 200 && Array.isArray(demoList.body?.data?.demoUsers) && demoList.body.data.demoUsers.length === 8,
      'Demo users endpoint returns all 8 statutory personas for evaluation'
    );

    // 7. Role switch to VIEWER_EXECUTIVE
    const viewerSwitch = await request('POST', '/auth/switch-role', { role: 'VIEWER_EXECUTIVE' });
    assert(
      viewerSwitch.status === 200 && viewerSwitch.body.data?.user?.role === 'VIEWER_EXECUTIVE',
      'Role switch to VIEWER_EXECUTIVE generates valid session and JWT'
    );
    const viewerToken = viewerSwitch.body?.data?.token;

    // 8. RBAC Denial: VIEWER_EXECUTIVE attempts to publish Section 11 notice
    // Route: POST /api/v1/statutory/section-11/publish requires SUPER_ADMIN, DISTRICT_AUTHORITY, STATE_GOV, or CALA
    const unauthorizedAction = await request('POST', '/statutory/section-11/publish', {
      projectId: 'PRJ-NHAI-2026-001',
      gazetteNotificationNumber: 'S.O. 9876(E)'
    }, viewerToken);

    assert(
      unauthorizedAction.status === 403,
      'RBAC Authorization: VIEWER_EXECUTIVE blocked from publishing Section 11 (HTTP 403 Forbidden)',
      `Actual status: ${unauthorizedAction.status}`
    );

    // 9. RBAC Approval: CALA attempts Section 11 publish (Allowed by role)
    const authorizedAction = await request('POST', '/statutory/section-11/publish', {
      projectId: 'PRJ-NHAI-2026-001',
      gazetteNotificationNumber: 'S.O. 9876(E)'
    }, calaToken);

    assert(
      authorizedAction.status !== 403,
      'RBAC Authorization: CALA is permitted through RBAC gateway for Section 11 publication (Status not 403)',
      `Actual status: ${authorizedAction.status}`
    );

    // 10. Update profile
    const updateProf = await request('PUT', '/auth/profile', {
      designation: 'Chief Competent Authority (CALA)',
      department: 'National Highways Authority of India (NHAI)',
      phone: '+91-98110-12345'
    }, calaToken);

    assert(
      updateProf.status === 200 && updateProf.body.data?.user?.designation === 'Chief Competent Authority (CALA)',
      'Officer profile update persists and returns updated details (200 OK)'
    );

    // 11. Change password - failure with incorrect current password
    const badPassChange = await request('POST', '/auth/change-password', {
      currentPassword: 'IncorrectOldPassword',
      newPassword: 'NewSecurePass@456'
    }, calaToken);

    assert(
      badPassChange.status === 400 && badPassChange.body.success === false,
      'Password change with invalid current password rejected (400 Bad Request)'
    );

    // 12. Change password - success with correct current password
    const goodPassChange = await request('POST', '/auth/change-password', {
      currentPassword: 'Admin@123',
      newPassword: 'NewAdminPass@123'
    }, calaToken);

    assert(
      goodPassChange.status === 200 && goodPassChange.body.success === true,
      'Password change with verified credentials succeeded (200 OK)'
    );

    // Reset password back to Admin@123 for test reproducibility
    await request('POST', '/auth/change-password', {
      currentPassword: 'NewAdminPass@123',
      newPassword: 'Admin@123'
    }, calaToken);

    console.log('\n================================================================');
    console.log(` VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED `);
    console.log('================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
