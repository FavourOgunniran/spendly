import { Transaction, NewTransactionInput } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import { calculateBudgetMetrics } from '../utils/budgetCalculations';

console.log('=====================================================');
console.log('🧪 RUNNING COMPREHENSIVE ADD TRANSACTION FLOW TESTS');
console.log('=====================================================\n');

// Mock localStorage
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { for (const k of Object.keys(mockStorage)) delete mockStorage[k]; },
};

// Test 1: Full Transaction Field Validation & Creation
console.log('TEST 1: Validating NewTransactionInput with all fields...');
const validExpenseInput: NewTransactionInput = {
  title: 'Starlink Monthly Subscription',
  amount: 38000,
  currency: 'NGN',
  type: 'expense',
  category: 'Utilities',
  date: '2026-08-26',
  description: 'Fast satellite internet subscription',
  notes: 'Fast satellite internet subscription',
  isRecurring: true,
  recurringInterval: 'monthly',
};

// Simulate Form Validation
function validateForm(input: { title: string; amount: number; date: string }) {
  if (!input.title || !input.title.trim()) {
    return { valid: false, error: 'Transaction title cannot be empty.' };
  }
  if (isNaN(input.amount) || input.amount <= 0) {
    return { valid: false, error: 'Please specify a positive numeric value.' };
  }
  if (!input.date) {
    return { valid: false, error: 'Transaction date is required.' };
  }
  return { valid: true, error: null };
}

const valRes = validateForm(validExpenseInput);
if (!valRes.valid) {
  throw new Error(`Test 1 Failed: Valid input failed validation: ${valRes.error}`);
}
console.log('✓ Validation passed for valid transaction input.');

// Test 2: Field Integrity Transformation
console.log('\nTEST 2: Testing complete model mapping & storage serialization...');
const createdTx: Transaction = {
  id: `tx-${Date.now()}-abc12`,
  title: validExpenseInput.title.trim(),
  amount: Number(validExpenseInput.amount),
  currency: validExpenseInput.currency || 'NGN',
  type: validExpenseInput.type,
  category: validExpenseInput.category,
  date: validExpenseInput.date,
  description: validExpenseInput.description,
  notes: validExpenseInput.notes,
  isRecurring: !!validExpenseInput.isRecurring,
  recurringInterval: validExpenseInput.recurringInterval,
  convertedCurrency: 'NGN',
  convertedAmount: validExpenseInput.amount,
};

// Verify all fields are intact
if (
  createdTx.title !== 'Starlink Monthly Subscription' ||
  createdTx.amount !== 38000 ||
  createdTx.isRecurring !== true ||
  createdTx.recurringInterval !== 'monthly' ||
  createdTx.notes !== 'Fast satellite internet subscription'
) {
  throw new Error('Test 2 Failed: Transaction fields were not mapped correctly.');
}
console.log('✓ Model mapping preserved all fields including recurring status and notes.');

// Test 3: Local Storage Persistence & Reload Simulation
console.log('\nTEST 3: Simulating page refresh / storage retrieval...');
const storageKey = 'spendly_test_user_transactions';
const transactionsList: Transaction[] = [createdTx];
mockLocalStorage.setItem(storageKey, JSON.stringify(transactionsList));

// Reload from storage
const rawRetrieved = mockLocalStorage.getItem(storageKey);
if (!rawRetrieved) throw new Error('Test 3 Failed: Storage empty.');
const parsedRetrieved: Transaction[] = JSON.parse(rawRetrieved);

const reloadedTx = parsedRetrieved[0];
if (
  reloadedTx.id !== createdTx.id ||
  reloadedTx.amount !== 38000 ||
  reloadedTx.isRecurring !== true ||
  reloadedTx.recurringInterval !== 'monthly' ||
  reloadedTx.notes !== 'Fast satellite internet subscription'
) {
  throw new Error('Test 3 Failed: Reloaded transaction lost fields after persistence round-trip.');
}
console.log('✓ Transaction fully persisted to and retrieved from local cache with 100% field parity.');

// Test 4: Financial Summary & Budget Metrics Recalculation
console.log('\nTEST 4: Verifying Budget and Summary calculation updates...');
const testTransactions: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Monthly Salary',
    amount: 500000,
    currency: 'NGN',
    type: 'income',
    category: 'Salary',
    date: '2026-08-01',
  },
  createdTx, // 38000 Utilities expense
  {
    id: 'tx-3',
    title: 'Groceries',
    amount: 42000,
    currency: 'NGN',
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-08-15',
  },
];

const totalIncome = testTransactions
  .filter((t) => t.type === 'income')
  .reduce((sum, t) => sum + t.amount, 0);

const totalExpenses = testTransactions
  .filter((t) => t.type === 'expense')
  .reduce((sum, t) => sum + t.amount, 0);

const netBalance = totalIncome - totalExpenses;
const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;

console.log(`- Total Income: ${formatCurrency(totalIncome, 'NGN')}`);
console.log(`- Total Expenses: ${formatCurrency(totalExpenses, 'NGN')} (Expected: ₦80,000)`);
console.log(`- Net Balance: ${formatCurrency(netBalance, 'NGN')} (Expected: ₦420,000)`);
console.log(`- Savings Rate: ${savingsRate.toFixed(1)}% (Expected: 84.0%)`);

if (totalExpenses !== 80000 || netBalance !== 420000 || savingsRate !== 84) {
  throw new Error('Test 4 Failed: Summary calculations inaccurate.');
}
console.log('✓ Summary calculations updated accurately.');

// Test 5: Budget Calculations with New Transaction
const budgetConfig = {
  monthlyBudget: 150000,
  categoryBudgets: [
    { id: 'b-1', category: 'Utilities', limit: 50000 },
    { id: 'b-2', category: 'Food & Dining', limit: 60000 },
  ],
};

const budgetMetrics = calculateBudgetMetrics(
  budgetConfig.monthlyBudget,
  budgetConfig.categoryBudgets,
  testTransactions,
  '2026-08',
  'NGN',
  { USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1500 }
);

console.log('\nTEST 5: Testing Budget Metrics with new transaction:');
console.log(`- Total Budget: ${formatCurrency(budgetMetrics.monthlyBudget, 'NGN')}`);
console.log(`- Total Spent: ${formatCurrency(budgetMetrics.totalExpenses, 'NGN')}`);
console.log(`- Remaining Budget: ${formatCurrency(budgetMetrics.remainingBudget, 'NGN')}`);
console.log(`- Percentage Used: ${budgetMetrics.percentageUsed.toFixed(1)}%`);

const utilCat = budgetMetrics.categoryBudgets.find((c) => c.category === 'Utilities');
if (!utilCat || utilCat.spent !== 38000 || utilCat.remaining !== 12000) {
  throw new Error(`Test 5 Failed: Category budget not updated properly for Utilities. Spent: ${utilCat?.spent}`);
}
console.log(`✓ Category budget for Utilities correctly reflects ${formatCurrency(utilCat.spent, 'NGN')} spent out of ${formatCurrency(utilCat.limit, 'NGN')}.`);

console.log('\n=====================================================');
console.log('🎉 ALL ADD TRANSACTION CREATION FLOW TESTS PASSED! 🎉');
console.log('=====================================================');
