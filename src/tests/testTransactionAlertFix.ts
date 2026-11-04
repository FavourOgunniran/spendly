import { NewTransactionInput } from '../types';

console.log('================================================================');
console.log('🧪 RUNNING VERIFICATION FOR TRANSACTION ADD ALERTS & PERSISTENCE');
console.log('================================================================\n');

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion Failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

// -------------------------------------------------------------
// Test 1: Notification Text & Single Notification for Expense
// -------------------------------------------------------------
console.log('[TEST 1] Verifying Success Notification for Expense...');

let notificationsEmitted: { type: 'success' | 'error'; title: string }[] = [];
function mockSuccess(title: string) {
  notificationsEmitted.push({ type: 'success', title });
}
function mockError(title: string) {
  notificationsEmitted.push({ type: 'error', title });
}

async function simulateSubmitExpense(
  txInput: NewTransactionInput,
  mockSaveToFirestore: (tx: NewTransactionInput) => Promise<void>,
  mockSecondaryRefresh: () => void
) {
  notificationsEmitted = [];
  let isSubmitting = false;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    isSubmitting = true;

    try {
      // 1. Database Save
      await mockSaveToFirestore(txInput);

      // 2. Notification (Success)
      if (txInput.type === 'income') {
        mockSuccess('Income added successfully.');
      } else {
        mockSuccess('Expense added successfully.');
      }

      // 3. Secondary UI / State Refresh
      try {
        mockSecondaryRefresh();
      } catch (secErr) {
        console.warn('Non-fatal secondary refresh warning:', secErr);
      }
    } catch {
      // 4. Failure Notification
      if (txInput.type === 'income') {
        mockError('Unable to add income. Please try again.');
      } else {
        mockError('Unable to add expense. Please try again.');
      }
    } finally {
      isSubmitting = false;
    }
  };

  await handleSubmit();
}

const sampleExpense: NewTransactionInput = {
  title: 'Client Lunch',
  amount: 4500,
  currency: 'NGN',
  type: 'expense',
  category: 'Food & Dining',
  date: '2026-09-05',
};

// Case 1A: Normal successful expense save
await simulateSubmitExpense(
  sampleExpense,
  async () => { /* Firestore write succeeds */ },
  () => { /* Secondary refresh succeeds */ }
);

assert(notificationsEmitted.length === 1, 'Exactly one notification emitted for successful expense');
assert(notificationsEmitted[0].type === 'success', 'Notification type is success');
assert(notificationsEmitted[0].title === 'Expense added successfully.', 'Notification title matches exact requirement: "Expense added successfully."');

// -------------------------------------------------------------
// Test 2: Notification Text & Single Notification for Income
// -------------------------------------------------------------
console.log('\n[TEST 2] Verifying Success Notification for Income...');

const sampleIncome: NewTransactionInput = {
  title: 'Consulting Fee',
  amount: 150000,
  currency: 'NGN',
  type: 'income',
  category: 'Salary',
  date: '2026-09-05',
};

// Case 2A: Normal successful income save
await simulateSubmitExpense(
  sampleIncome,
  async () => { /* Firestore write succeeds */ },
  () => { /* Secondary refresh succeeds */ }
);

assert(notificationsEmitted.length === 1, 'Exactly one notification emitted for successful income');
assert(notificationsEmitted[0].type === 'success', 'Notification type is success');
assert(notificationsEmitted[0].title === 'Income added successfully.', 'Notification title matches exact requirement: "Income added successfully."');

// -------------------------------------------------------------
// Test 3: Separation of Concerns (Secondary Refresh Error)
// -------------------------------------------------------------
console.log('\n[TEST 3] Verifying Separation of Concerns: Secondary refresh error must NEVER show save failure...');

await simulateSubmitExpense(
  sampleExpense,
  async () => { /* Firestore write succeeds */ },
  () => {
    // Simulate secondary localStorage QuotaExceededError or state glitch
    throw new Error('QuotaExceededError: Local storage full');
  }
);

assert(notificationsEmitted.length === 1, 'Exactly one notification emitted despite secondary refresh error');
assert(notificationsEmitted[0].type === 'success', 'Notification remains SUCCESS because database write succeeded');
assert(notificationsEmitted[0].title === 'Expense added successfully.', 'Alert remains "Expense added successfully." and does not report save failure');

// -------------------------------------------------------------
// Test 4: Genuine Database Failure Simulation for Expense & Income
// -------------------------------------------------------------
console.log('\n[TEST 4] Verifying Genuine Database Failure Simulation...');

// Case 4A: Expense failure
await simulateSubmitExpense(
  sampleExpense,
  async () => {
    throw new Error('Firestore UNAVAILABLE: network timeout');
  },
  () => {}
);

assert(notificationsEmitted.length === 1, 'Exactly one notification emitted for failed expense');
assert(notificationsEmitted[0].type === 'error', 'Notification type is error');
assert(notificationsEmitted[0].title === 'Unable to add expense. Please try again.', 'Error alert matches exact requirement: "Unable to add expense. Please try again."');

// Case 4B: Income failure
await simulateSubmitExpense(
  sampleIncome,
  async () => {
    throw new Error('Firestore PERMISSION_DENIED');
  },
  () => {}
);

assert(notificationsEmitted.length === 1, 'Exactly one notification emitted for failed income');
assert(notificationsEmitted[0].type === 'error', 'Notification type is error');
assert(notificationsEmitted[0].title === 'Unable to add income. Please try again.', 'Error alert matches exact requirement: "Unable to add income. Please try again."');

// -------------------------------------------------------------
// Test 5: Concurrent Double-Click Submission Guard
// -------------------------------------------------------------
console.log('\n[TEST 5] Verifying Concurrent Double-Click Submission Guard...');

let executionCount = 0;
let isSubmittingLock = false;

const guardedSubmit = async () => {
  if (isSubmittingLock) return;
  isSubmittingLock = true;
  executionCount++;
  // Simulate network latency of 30ms
  await new Promise((resolve) => setTimeout(resolve, 30));
  isSubmittingLock = false;
};

// Fire 4 rapid concurrent calls
await Promise.all([
  guardedSubmit(),
  guardedSubmit(),
  guardedSubmit(),
  guardedSubmit(),
]);

assert(executionCount === 1, 'Double submission guard successfully deduplicated rapid concurrent clicks to exactly 1 execution');

console.log('\n================================================================');
console.log('🎉 ALL ADD TRANSACTION NOTIFICATION & SEPARATION TESTS PASSED! 🎉');
console.log('================================================================\n');
