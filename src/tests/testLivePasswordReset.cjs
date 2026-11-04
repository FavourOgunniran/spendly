const assert = require('assert');

// Firebase config for Spendly
const API_KEY = process.env.VITE_FIREBASE_API_KEY || '';
const ENDPOINT = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`;

async function testLiveFirebaseAuth() {
  console.log('================================================================');
  console.log('🌐 TESTING LIVE FIREBASE AUTH PASSWORD RESET API ENDPOINT');
  console.log('================================================================\n');

  // TEST 1: Malformed email rejection
  console.log('[TEST 1] Verifying malformed email rejection...');
  const malformedRes = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestType: 'PASSWORD_RESET',
      email: 'invalid-email-format',
    }),
  });
  const malformedData = await malformedRes.json();
  assert.strictEqual(malformedRes.status, 400, 'Firebase rejects malformed email with 400');
  assert.strictEqual(malformedData.error.message, 'INVALID_EMAIL', 'Error code is INVALID_EMAIL');
  console.log('  ✓ Firebase rejected malformed email with 400 INVALID_EMAIL');

  // TEST 2: Valid email dispatch (Generic anti-enumeration or dispatch)
  console.log('\n[TEST 2] Verifying valid email format dispatch with continueUrl...');
  const validRes = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestType: 'PASSWORD_RESET',
      email: 'testuser@spendly.app',
      continueUrl: 'http://localhost:5173/login',
    }),
  });
  const validData = await validRes.json();
  console.log('  Firebase Response Status:', validRes.status);
  console.log('  Firebase Response Body:', validData);

  // If email enumeration protection is on, Firebase returns 200 with email
  // If email enumeration protection is off and user does not exist, Firebase returns EMAIL_NOT_FOUND
  // In both cases, we verify that the Firebase endpoint is responsive and accepts our API key!
  assert(validRes.status === 200 || (validRes.status === 400 && validData.error.message === 'EMAIL_NOT_FOUND'),
    'Firebase Auth endpoint correctly responded to reset request'
  );
  console.log('  ✓ Live Firebase Auth project successfully accepted and processed the request!');

  // TEST 3: Verification of existing login with bad credentials returning INVALID_LOGIN_CREDENTIALS
  console.log('\n[TEST 3] Verifying existing auth sign-in endpoint integrity...');
  const loginEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
  const badLoginRes = await fetch(loginEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'nonexistent_test_user@spendly.app',
      password: 'wrongpassword123',
      returnSecureToken: true,
    }),
  });
  const badLoginData = await badLoginRes.json();
  assert.strictEqual(badLoginRes.status, 400);
  assert(badLoginData.error.message.includes('INVALID_LOGIN_CREDENTIALS') || badLoginData.error.message.includes('EMAIL_NOT_FOUND'),
    'Sign-in endpoint responds correctly with standard credential failure'
  );
  console.log('  ✓ Live Firebase Auth login endpoint verified operational and intact');

  console.log('\n================================================================');
  console.log('🎉 ALL LIVE FIREBASE AUTH ENDPOINT TESTS PASSED!');
  console.log('================================================================\n');
}

testLiveFirebaseAuth().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
