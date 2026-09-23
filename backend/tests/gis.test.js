const assert = require('assert');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api/v1/gis';

async function runGisTests() {
  console.log('🏛️  Running BhoomiSetu National GIS Module Test Suite...\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // Test 1: GET /map-data returns markers, parcels GeoJSON, and statistics
  await test('GET /map-data returns national spatial payload', async () => {
    const res = await fetch(`${BASE_URL}/map-data`);
    assert.strictEqual(res.status, 200, 'HTTP status should be 200');
    const data = await res.json();
    assert.strictEqual(data.success, true, 'success flag should be true');
    assert.ok(data.statistics, 'statistics object should exist');
    assert.strictEqual(typeof data.statistics.totalParcels, 'number', 'totalParcels should be number');
    assert.ok(Array.isArray(data.projectMarkers), 'projectMarkers should be an array');
    assert.strictEqual(data.projectMarkers.length, 10, 'should have 10 national project markers');
    assert.ok(data.parcels, 'parcels object should exist');
    assert.strictEqual(data.parcels.type, 'FeatureCollection', 'parcels should be GeoJSON FeatureCollection');
    assert.ok(data.parcels.features.length >= 30, 'parcels features should have at least 30 parcels');
  });

  // Test 2: GET /statistics calculates all 8 statutory statuses
  await test('GET /statistics returns accurate 8-stage breakdown', async () => {
    const res = await fetch(`${BASE_URL}/statistics`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    const stats = data.data;

    const requiredKeys = [
      'totalParcels',
      'proposed',
      'underVerification',
      'notificationIssued',
      'awarded',
      'compensationPaid',
      'possessionTaken',
      'rrPending',
      'completed',
      'acquired',
      'compensationCompleted',
      'possessionCompleted',
      'totalAreaHectares'
    ];

    requiredKeys.forEach(key => {
      assert.ok(key in stats, `Statistics should contain key '${key}'`);
      assert.strictEqual(typeof stats[key], 'number', `'${key}' should be a number`);
    });

    assert.strictEqual(
      stats.totalParcels,
      stats.proposed + stats.underVerification + stats.notificationIssued + stats.awarded +
      stats.compensationPaid + stats.possessionTaken + stats.rrPending + stats.completed,
      'Sum of 8 individual statuses should equal totalParcels'
    );
  });

  // Test 3: GET /map-data with state filter
  await test('GET /map-data filters correctly by state', async () => {
    const res = await fetch(`${BASE_URL}/map-data?state=Maharashtra`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    
    // Project markers should all be in Maharashtra
    data.projectMarkers.forEach(m => {
      assert.strictEqual(m.state, 'Maharashtra', `Marker ${m.projectId} state should be Maharashtra`);
    });

    // Parcel features should all be in Maharashtra
    data.parcels.features.forEach(f => {
      assert.strictEqual(f.properties.state, 'Maharashtra', `Parcel ${f.properties.parcelId} state should be Maharashtra`);
    });
  });

  // Test 4: GET /map-data with acquisition status filter
  await test('GET /map-data filters correctly by statutory acquisition status', async () => {
    const res = await fetch(`${BASE_URL}/map-data?status=Possession%20Taken`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.parcels.features.length > 0, 'Should find parcels with Possession Taken status');
    data.parcels.features.forEach(f => {
      assert.strictEqual(f.properties.acquisitionStatus, 'Possession Taken');
    });
  });

  // Test 5: GET /parcels list endpoint with search filter
  await test('GET /parcels supports full-text search', async () => {
    const res = await fetch(`${BASE_URL}/parcels?search=Padgha`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.count > 0, 'Should find parcels in Padgha village');
    data.data.forEach(p => {
      const match = (p.village && p.village.includes('Padgha')) ||
                    (p.district && p.district.includes('Padgha')) ||
                    (p.khasraNumber && p.khasraNumber.includes('Padgha'));
      assert.ok(match, 'Parcel should match search query');
    });
  });

  // Test 6: GET /parcels/:id returns full statutory dossier
  await test('GET /parcels/:id returns full spatial & statutory parcel dossier', async () => {
    // Get all parcels first
    const listRes = await fetch(`${BASE_URL}/parcels`);
    const listData = await listRes.json();
    assert.ok(listData.data.length > 0, 'Parcels list must not be empty');
    
    const targetParcel = listData.data[0];
    const targetId = targetParcel.parcelId || targetParcel._id;

    const res = await fetch(`${BASE_URL}/parcels/${targetId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);

    const parcel = data.data;
    assert.ok(parcel.parcelId, 'parcelId should exist');
    assert.ok(parcel.surveyNumber || parcel.khasraNumber, 'surveyNumber should exist');
    assert.ok(parcel.village, 'village should exist');
    assert.ok(parcel.district, 'district should exist');
    assert.ok(parcel.state, 'state should exist');
    assert.ok(parcel.acquisitionStatus, 'acquisitionStatus should exist');
    assert.ok(parcel.geometry, 'geometry should exist');
    assert.strictEqual(parcel.geometry.type, 'Polygon', 'geometry should be Polygon');
    assert.ok(parcel.owners, 'owners should exist');
    assert.ok(parcel.compensation, 'compensation details should exist');
    assert.ok(parcel.possession, 'possession details should exist');
  });

  // Test 7: GET /geojson pure FeatureCollection for Leaflet L.geoJSON
  await test('GET /geojson returns compliant GeoJSON FeatureCollection', async () => {
    const res = await fetch(`${BASE_URL}/geojson`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.type, 'FeatureCollection');
    assert.ok(Array.isArray(data.data.features));
    assert.ok(data.data.features[0].geometry.coordinates.length > 0);
  });

  console.log(`\n========================================`);
  console.log(`GIS Test Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runGisTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
