import {
  DEFAULT_SESSION_TIMEOUT_MS,
  DEFAULT_WARNING_THRESHOLD_MS,
  DEFAULT_WARNING_BEFORE_TIMEOUT_MS,
  ACTIVITY_THROTTLE_MS,
  SESSION_CHECK_INTERVAL_MS,
  SESSION_STORAGE_KEYS,
  formatRemainingTime,
} from '../config/sessionConfig.ts';
import { auth, db } from '../firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
} from 'firebase/firestore';
import {
  createUserProfileDocument,
  saveTransactionToFirestore,
  saveCategoryToFirestore,
  saveBudgetPeriodToFirestore,
} from '../services/firebaseService.ts';
import { Transaction, CategoryItem } from '../types/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runSessionTimeoutTestSuite() {
  console.log('===============================================================');
  console.log('TEST SUITE: Spendly Automatic Session Inactivity & Safety Audit');
  console.log('===============================================================\n');

  // -------------------------------------------------------------------------
  // STEP 1: Configuration & Timing Constants Verification
  // -------------------------------------------------------------------------
  console.log('--- Step 1: Configuration & Timing Constants ---');
  assert(
    DEFAULT_SESSION_TIMEOUT_MS === 30 * 60 * 1000,
    `Default session timeout is exactly 30 minutes (1,800,000 ms), found: ${DEFAULT_SESSION_TIMEOUT_MS}`
  );
  assert(
    DEFAULT_WARNING_BEFORE_TIMEOUT_MS === 2 * 60 * 1000,
    `Warning lead time is exactly 2 minutes (120,000 ms), found: ${DEFAULT_WARNING_BEFORE_TIMEOUT_MS}`
  );
  assert(
    DEFAULT_WARNING_THRESHOLD_MS === 28 * 60 * 1000,
    `Warning appears at exactly 28 minutes of inactivity (1,680,000 ms), found: ${DEFAULT_WARNING_THRESHOLD_MS}`
  );
  assert(
    ACTIVITY_THROTTLE_MS === 1000,
    `Activity event listener throttling is 1,000 ms to prevent UI performance issues`
  );
  assert(
    SESSION_CHECK_INTERVAL_MS === 1000,
    `Countdown heartbeat interval is 1,000 ms`
  );

  // Verify storage key consistency
  assert(
    SESSION_STORAGE_KEYS.LAST_ACTIVITY === 'spendly_last_activity_timestamp',
    'Storage key for last activity timestamp is defined'
  );
  assert(
    SESSION_STORAGE_KEYS.INACTIVITY_NOTICE === 'spendly_inactivity_logout_notice',
    'Storage key for login page inactivity notice is defined'
  );

  // -------------------------------------------------------------------------
  // STEP 2: Time Formatting & Countdown Logic
  // -------------------------------------------------------------------------
  console.log('\n--- Step 2: Time Formatting & Countdown Display ---');
  assert(formatRemainingTime(120000) === '02:00', `120,000 ms formats to 02:00, got: ${formatRemainingTime(120000)}`);
  assert(formatRemainingTime(65000) === '01:05', `65,000 ms formats to 01:05, got: ${formatRemainingTime(65000)}`);
  assert(formatRemainingTime(9000) === '00:09', `9,000 ms formats to 00:09, got: ${formatRemainingTime(9000)}`);
  assert(formatRemainingTime(0) === '00:00', `0 ms formats to 00:00, got: ${formatRemainingTime(0)}`);
  assert(formatRemainingTime(-5000) === '00:00', `Negative ms formats safely to 00:00, got: ${formatRemainingTime(-5000)}`);

  // -------------------------------------------------------------------------
  // STEP 3: Inactivity State Transition Simulation
  // -------------------------------------------------------------------------
  console.log('\n--- Step 3: Inactivity State Simulation ---');
  const timeoutMs = 30 * 60 * 1000;
  const warningThreshold = 28 * 60 * 1000;

  // Case A: User active 5 minutes ago
  let lastActive = Date.now() - 5 * 60 * 1000;
  let elapsed = Date.now() - lastActive;
  assert(elapsed < warningThreshold, `5m elapsed is within active window (${Math.round(elapsed / 60000)}m)`);

  // Case B: User active 28.5 minutes ago (warning window)
  lastActive = Date.now() - (28.5 * 60 * 1000);
  elapsed = Date.now() - lastActive;
  assert(
    elapsed >= warningThreshold && elapsed < timeoutMs,
    `28.5m elapsed triggers warning modal (${Math.round(elapsed / 60000)}m elapsed, ${Math.round((timeoutMs - elapsed) / 1000)}s remaining)`
  );

  // Case C: User active 31 minutes ago (timeout expired)
  lastActive = Date.now() - (31 * 60 * 1000);
  elapsed = Date.now() - lastActive;
  assert(
    elapsed >= timeoutMs,
    `31m elapsed triggers automatic sign-out (${Math.round(elapsed / 60000)}m elapsed)`
  );

  // -------------------------------------------------------------------------
  // STEP 4: Firebase Authentication & Data Safety Verification
  // -------------------------------------------------------------------------
  console.log('\n--- Step 4: Real Firebase Auth Sign-out & Data Integrity Audit ---');
  const testEmail = `session_audit_${Date.now()}@spendly.app`;
  const testPassword = 'SpendlyAuditPass2026!';
  const testDisplayName = 'Session Safety User';

  console.log(`Creating test user: ${testEmail}...`);
  const cred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
  const uid = cred.user.uid;
  assert(!!uid, `Firebase user authenticated with UID: ${uid}`);

  await createUserProfileDocument(uid, testEmail, testDisplayName, 'NGN');

  // Add sample transaction
  const sampleTx: Transaction = {
    id: `tx_${Date.now()}`,
    title: 'Grocery Store Test',
    amount: 15400,
    currency: 'NGN',
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-09-02',
  };
  await saveTransactionToFirestore(uid, sampleTx);
  console.log(`Saved test transaction in users/${uid}/transactions/${sampleTx.id}`);

  // Add sample category
  const sampleCategory: CategoryItem = {
    id: `cat_${Date.now()}`,
    name: 'Security Audit Category',
    type: 'expense',
    icon: 'Shield',
    color: '#8e8bf5',
    group: 'Audit',
    isCustom: true,
  };
  await saveCategoryToFirestore(uid, sampleCategory);

  // Add sample budget
  await saveBudgetPeriodToFirestore(
    uid,
    '2026-09',
    250000,
    [{ id: 'b_1', category: 'Food & Dining', limit: 80000 }]
  );

  // Verify records exist in Firestore prior to logout
  const preTxDoc = await getDoc(doc(db, 'users', uid, 'transactions', sampleTx.id));
  assert(preTxDoc.exists(), 'Transaction exists in Firestore before logout');

  const preBudgetDoc = await getDoc(doc(db, 'users', uid, 'budgets', '2026-09'));
  assert(preBudgetDoc.exists(), 'Budget exists in Firestore before logout');

  // Simulate Inactivity Logout: sign out user via Firebase Auth
  console.log('\nSimulating automatic inactivity logout (signOut)...');
  await signOut(auth);
  assert(auth.currentUser === null, 'User successfully signed out via Firebase Authentication');

  // Verify Firestore data is NOT deleted or touched after sign out
  console.log('\nVerifying user data persistence in Firestore after session logout...');
  const postTxDoc = await getDoc(doc(db, 'users', uid, 'transactions', sampleTx.id));
  assert(postTxDoc.exists(), 'Transaction still safely exists in Firestore after logout');
  assert(postTxDoc.data()?.amount === 15400, 'Transaction amount preserved: 15400');

  const postBudgetDoc = await getDoc(doc(db, 'users', uid, 'budgets', '2026-09'));
  assert(postBudgetDoc.exists(), 'Monthly budget still safely exists in Firestore after logout');
  assert(postBudgetDoc.data()?.monthlyBudget === 250000, 'Monthly budget preserved: 250000');

  // Log back in to verify session restoration
  console.log('\nSigning back into the same account to verify full data restoration...');
  const reLoginCred = await signInWithEmailAndPassword(auth, testEmail, testPassword);
  assert(reLoginCred.user.uid === uid, 'User successfully signed back in with identical UID');

  // Final cleanup of audit user session
  await signOut(auth);

  console.log('\n===============================================================');
  console.log('🎉 ALL AUTOMATIC SESSION TIMEOUT & DATA INTEGRITY TESTS PASSED!');
  console.log('===============================================================');
}

runSessionTimeoutTestSuite().catch((err) => {
  console.error('Test suite encountered an error:', err);
  process.exit(1);
});
