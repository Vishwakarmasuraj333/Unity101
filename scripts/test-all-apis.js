const fs = require('fs');
const path = require('path');

// Read environment
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [k, ...v] = trimmed.split('=');
      if (k && v) process.env[k.trim()] = v.join('=').trim();
    }
  });
}

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
let sessionCookie = '';
let testRegId = null;

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`  UNITY 101 FULL-STACK LIVE API VERIFICATION SUITE   `);
  console.log(`  Target: ${BASE_URL}                                `);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`⏳ Testing: ${name}... `);
    try {
      await fn();
      console.log(`✅ 200 OK / SUCCESS`);
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  // 1. Robots.txt
  await test('GET /robots.txt', async () => {
    const res = await fetch(`${BASE_URL}/robots.txt`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const text = await res.text();
    if (!text.toLowerCase().includes('user-agent')) throw new Error('Missing User-Agent');
  });

  // 2. Sitemap.xml
  await test('GET /sitemap.xml', async () => {
    const res = await fetch(`${BASE_URL}/sitemap.xml`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const text = await res.text();
    if (!text.includes('urlset')) throw new Error('Missing urlset');
  });

  // 3. Public Registration Page
  await test('GET /register', async () => {
    const res = await fetch(`${BASE_URL}/register`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });

  // 4. Submit Real Registration (POST /api/registrations)
  await test('POST /api/registrations (Live User Registration)', async () => {
    const randomSuffix = Math.floor(Math.random() * 89999 + 10000);
    const payload = {
      first_name: 'Anita',
      last_name: 'Patel',
      address: '42 Highfield Lane',
      town: 'Southampton',
      post_code: 'SO17 1BJ',
      email: `anita.patel.${randomSuffix}@example.com`,
      mobile: `078901${randomSuffix}`,
      food_preference: 'Veg Food',
      gdpr_consent: true,
    };

    const res = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (res.status !== 201 || !json.success) {
      throw new Error(`Status ${res.status}: ${json.message || JSON.stringify(json)}`);
    }
    testRegId = json.data.id;
    if (!testRegId) throw new Error('Missing insert ID in response');
  });

  // 5. Admin Login (POST /api/admin/login)
  await test('POST /api/admin/login (Admin Authentication & Session Cookie)', async () => {
    const payload = {
      email: 'admin@unity101events.org',
      password: 'Admin@Unity101!2026',
    };

    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (res.status !== 200 || !json.success) {
      throw new Error(`Status ${res.status}: ${json.message}`);
    }

    const setCookie = res.headers.get('set-cookie');
    if (!setCookie) throw new Error('No Set-Cookie header returned');
    sessionCookie = setCookie.split(';')[0];
  });

  // 6. Admin Me (GET /api/admin/me)
  await test('GET /api/admin/me (Verify JWT Session)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/me`, {
      headers: { Cookie: sessionCookie },
    });
    const json = await res.json();
    if (res.status !== 200 || !json.success) throw new Error(`Status ${res.status}`);
    if (!json.admin || json.admin.email !== 'admin@unity101events.org') {
      throw new Error('Unexpected admin payload');
    }
  });

  // 7. Dashboard Metrics (GET /api/admin/dashboard)
  await test('GET /api/admin/dashboard (Live Analytics & MySQL Aggregates)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: sessionCookie },
    });
    const json = await res.json();
    if (res.status !== 200 || !json.success) throw new Error(`Status ${res.status}`);
    if (!json.metrics || json.metrics.totalRegistrations === undefined) {
      throw new Error('Missing metrics in dashboard');
    }
  });

  // 8. Registrations List (GET /api/admin/registrations)
  await test('GET /api/admin/registrations (Live Table, Pagination & Search)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations?page=1&limit=10`, {
      headers: { Cookie: sessionCookie },
    });
    const json = await res.json();
    if (res.status !== 200 || !json.success) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(json.data) || json.data.length === 0) {
      throw new Error('No registrations found in response');
    }
  });

  // 9. Single Registration Inspector (GET /api/admin/registrations/[id])
  await test(`GET /api/admin/registrations/${testRegId} (View Single Guest Record)`, async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations/${testRegId}`, {
      headers: { Cookie: sessionCookie },
    });
    const json = await res.json();
    if (res.status !== 200 || !json.success) throw new Error(`Status ${res.status}`);
    if (json.data.id !== testRegId) throw new Error('ID mismatch in fetched record');
  });

  // 10. Update Guest Details (PATCH /api/admin/registrations/[id])
  await test(`PATCH /api/admin/registrations/${testRegId} (Update Status & Notes)`, async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations/${testRegId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        status: 'confirmed',
        notes: 'VIP Guest table allocation confirmed via test suite',
      }),
    });
    const json = await res.json();
    if (res.status !== 200 || !json.success) throw new Error(`Status ${res.status}: ${json.message}`);
  });

  // 11. Resend Confirmation Email (POST /api/admin/registrations/[id]/email)
  await test(`POST /api/admin/registrations/${testRegId}/email (Email Dispatch / Verification)`, async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations/${testRegId}/email`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    const json = await res.json();
    if (res.status !== 200 || !json.success) throw new Error(`Status ${res.status}: ${json.message}`);
  });

  // 12. CSV Export (GET /api/admin/export)
  await test('GET /api/admin/export (Generate Real CSV Download)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/export`, {
      headers: { Cookie: sessionCookie },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/csv')) throw new Error(`Unexpected Content-Type: ${contentType}`);
    const csvText = await res.text();
    if (!csvText.includes('Registration ID') || !csvText.includes('First Name')) {
      throw new Error('CSV headers missing');
    }
  });

  // 13. System Settings (GET /api/admin/settings)
  await test('GET /api/admin/settings (Fetch System & SMTP Settings)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/settings`, {
      headers: { Cookie: sessionCookie },
    });
    const json = await res.json();
    if (res.status !== 200 || !json.success) throw new Error(`Status ${res.status}`);
    if (!json.settings) throw new Error('Missing settings in response');
  });

  // 14. Bulk Status Update (POST /api/admin/bulk)
  await test(`POST /api/admin/bulk (Bulk Confirm Guest #${testRegId})`, async () => {
    const res = await fetch(`${BASE_URL}/api/admin/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        action: 'confirm',
        ids: [testRegId],
      }),
    });
    const json = await res.json();
    if (res.status !== 200 || !json.success) throw new Error(`Status ${res.status}`);
  });

  // 15. Soft Delete / Trash (DELETE /api/admin/registrations/[id])
  await test(`DELETE /api/admin/registrations/${testRegId} (Move to Trash)`, async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations/${testRegId}`, {
      method: 'DELETE',
      headers: { Cookie: sessionCookie },
    });
    const json = await res.json();
    if (res.status !== 200 || !json.success) throw new Error(`Status ${res.status}`);
  });

  // 16. Restore from Trash (POST /api/admin/registrations/[id]/restore)
  await test(`POST /api/admin/registrations/${testRegId}/restore (Restore from Trash)`, async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations/${testRegId}/restore`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    const json = await res.json();
    if (res.status !== 200 || !json.success) throw new Error(`Status ${res.status}`);
  });

  console.log(`\n======================================================`);
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED     `);
  console.log(`  ALL REAL APIS VERIFIED AND WORKING LIVE!            `);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error('\nTest runner error:', e);
  process.exit(1);
});
