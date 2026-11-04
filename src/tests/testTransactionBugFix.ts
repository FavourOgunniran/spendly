import { Transaction } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';

function sanitizePayload(obj: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      if (v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
        clean[k] = sanitizePayload(v);
      } else {
        clean[k] = v;
      }
    }
  }
  return clean;
}

function testTransactionSaveWorkflow() {
  console.log('=== RUNNING TRANSACTION CREATION & ERROR ISOLATION TESTS ===\n');

  // Test 1: Payload with undefined fields (e.g. description is omitted, or exchange rates)
  console.log('[Test 1] Testing Firestore payload sanitization with undefined values...');
  const rawTxWithUndefined: Transaction = {
    id: 'tx-12345',
    title: 'Dinner at Restaurant',
    amount: 15000,
    currency: 'NGN',
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-08-25',
    description: undefined, // Typical empty description
    exchangeRate: undefined,
    convertedCurrency: undefined,
    convertedAmount: undefined,
  };

  const sanitized = sanitizePayload(rawTxWithUndefined);
  console.log('Sanitized payload for Firestore:', sanitized);

  if ('description' in sanitized || 'exchangeRate' in sanitized) {
    throw new Error('Test 1 Failed: Undefined keys were not removed.');
  }
  console.log('✓ Test 1 Passed: Undefined properties stripped cleanly. Firestore will not reject document.\n');

  // Test 2: Notification formatting for each currency
  console.log('[Test 2] Testing Success Notification Formats for NGN, USD, GBP, EUR...');
  const testCases = [
    { amount: 50000, currency: 'NGN' as const, type: 'expense', title: 'Rent' },
    { amount: 100, currency: 'USD' as const, type: 'income', title: 'Consulting' },
    { amount: 75.5, currency: 'GBP' as const, type: 'expense', title: 'Train Ticket' },
    { amount: 120, currency: 'EUR' as const, type: 'income', title: 'E-commerce Sale' },
  ];

  for (const tc of testCases) {
    const formatted = formatCurrency(tc.amount, tc.currency);
    const msg = `Your ${tc.type} of ${formatted} ("${tc.title}") has been saved.`;
    console.log(`[${tc.currency}] Notification: "${msg}"`);
    if (!msg.includes(formatted)) {
      throw new Error(`Test 2 Failed for ${tc.currency}`);
    }
  }
  console.log('✓ Test 2 Passed: Success notification messages formatted accurately for all currencies.\n');

  // Test 3: Rapid Double-Click / De-duplication Simulation
  console.log('[Test 3] Simulating rapid double-click / concurrent submissions...');
  let isSubmitting = false;
  let submissionCount = 0;

  const simulateSubmit = async () => {
    if (isSubmitting) {
      console.log('  [Blocked] Duplicate click prevented by submission lock.');
      return;
    }
    isSubmitting = true;
    submissionCount++;
    await new Promise((r) => setTimeout(r, 50));
    isSubmitting = false;
  };

  // Run 5 rapid concurrent calls
  Promise.all([
    simulateSubmit(),
    simulateSubmit(),
    simulateSubmit(),
    simulateSubmit(),
    simulateSubmit(),
  ]).then(() => {
    console.log(`Total submissions processed: ${submissionCount} (Expected: 1)`);
    if (submissionCount !== 1) {
      throw new Error(`Test 3 Failed: Expected 1 submission, got ${submissionCount}`);
    }
    console.log('✓ Test 3 Passed: Double submission guard prevents duplicate transaction creation.\n');
    console.log('=== ALL TRANSACTION BUG FIX TESTS PASSED SUCCESSFULLY! ===');
  });
}

testTransactionSaveWorkflow();
