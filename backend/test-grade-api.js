/**
 * Run this AFTER starting the backend (node connect.js).
 * It tests if the grade API is reachable on this machine.
 * Run: node test-grade-api.js
 */
const BASE = 'http://localhost:5000/api';

async function test() {
  console.log('Testing grade API at', BASE, '...\n');

  try {
    const r1 = await fetch(`${BASE}/grade`);
    const text1 = await r1.text();
    console.log('GET /api/grade');
    console.log('  Status:', r1.status);
    console.log('  Body:', text1.slice(0, 120));
    if (r1.status === 200 && text1.includes('Grade API')) {
      console.log('  OK – Grade API is running on this server.\n');
    } else {
      console.log('  FAIL – Backend may be old or not this project.\n');
    }

    const r2 = await fetch(`${BASE}/health`);
    const text2 = await r2.text();
    console.log('GET /api/health');
    console.log('  Status:', r2.status);
    console.log('  Body:', text2.slice(0, 80));
    console.log('');
  } catch (err) {
    console.log('Error:', err.message);
    console.log('\nBackend is not running on port 5000, or something is blocking it.');
    console.log('Start the backend first: node connect.js');
  }
}

test();
