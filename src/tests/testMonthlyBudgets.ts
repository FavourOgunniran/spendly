import { MonthBudgetConfig, Transaction } from '../types';
import { calculateBudgetMetrics } from '../utils/budgetCalculations';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('====================================================');
console.log('TEST SUITE: Spendly Month & Year Budget Separation');
console.log('====================================================\n');

// In-memory period budget store simulating localStorage / Firestore model
const periodBudgets: Record<string, MonthBudgetConfig> = {};

function setMonthlyBudget(targetMonth: string, amount: number) {
  const [yStr, mStr] = targetMonth.split('-');
  const year = Number(yStr);
  const month = Number(mStr);
  const existing = periodBudgets[targetMonth];
  periodBudgets[targetMonth] = {
    periodMonth: targetMonth,
    month,
    year,
    monthlyBudget: amount,
    categoryBudgets: existing?.categoryBudgets || [],
    updatedAt: new Date().toISOString(),
  };
}

function addCategoryBudget(targetMonth: string, category: string, limit: number) {
  const [yStr, mStr] = targetMonth.split('-');
  const year = Number(yStr);
  const month = Number(mStr);
  const cleanCategory = category.trim();

  if (!periodBudgets[targetMonth]) {
    periodBudgets[targetMonth] = {
      periodMonth: targetMonth,
      month,
      year,
      monthlyBudget: 0,
      categoryBudgets: [],
      updatedAt: new Date().toISOString(),
    };
  }

  const list = [...periodBudgets[targetMonth].categoryBudgets];
  const existingIndex = list.findIndex((c) => c.category.toLowerCase() === cleanCategory.toLowerCase());

  if (existingIndex >= 0) {
    list[existingIndex] = {
      ...list[existingIndex],
      limit,
      periodMonth: targetMonth,
      month,
      year,
    };
  } else {
    list.push({
      id: `cb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: cleanCategory,
      limit,
      currency: 'NGN',
      periodMonth: targetMonth,
      month,
      year,
    });
  }

  periodBudgets[targetMonth].categoryBudgets = list;
}

function updateCategoryBudget(targetMonth: string, id: string, limit: number) {
  if (!periodBudgets[targetMonth]) return;
  periodBudgets[targetMonth].categoryBudgets = periodBudgets[targetMonth].categoryBudgets.map((c) =>
    c.id === id ? { ...c, limit } : c
  );
}

// ----------------------------------------------------
// TEST 1: Creation for August 2026
// ----------------------------------------------------
console.log('--- Step 1: Creating August 2026 Budgets ---');
setMonthlyBudget('2026-08', 40000);
addCategoryBudget('2026-08', 'Food', 30000);
addCategoryBudget('2026-08', 'Entertainment', 10000);

const augConfig = periodBudgets['2026-08'];
assert(augConfig !== undefined, 'August 2026 configuration exists');
assert(augConfig.monthlyBudget === 40000, 'August monthly budget is 40,000');
assert(augConfig.categoryBudgets.length === 2, 'August has exactly 2 category budgets');

const augFood = augConfig.categoryBudgets.find((c) => c.category === 'Food');
const augEnt = augConfig.categoryBudgets.find((c) => c.category === 'Entertainment');
assert(augFood?.limit === 30000, 'August Food budget is ₦30,000');
assert(augEnt?.limit === 10000, 'August Entertainment budget is ₦10,000');
assert(augFood?.periodMonth === '2026-08', 'August Food has periodMonth 2026-08');
assert(augFood?.month === 8 && augFood?.year === 2026, 'August Food has month 8 and year 2026');

// ----------------------------------------------------
// TEST 2: Creation for October 2026
// ----------------------------------------------------
console.log('\n--- Step 2: Creating October 2026 Budgets ---');
setMonthlyBudget('2026-10', 70000);
addCategoryBudget('2026-10', 'Food', 50000);
addCategoryBudget('2026-10', 'Entertainment', 20000);

const octConfig = periodBudgets['2026-10'];
assert(octConfig !== undefined, 'October 2026 configuration exists');
assert(octConfig.monthlyBudget === 70000, 'October monthly budget is 70,000');
assert(octConfig.categoryBudgets.length === 2, 'October has exactly 2 category budgets');

const octFood = octConfig.categoryBudgets.find((c) => c.category === 'Food');
const octEnt = octConfig.categoryBudgets.find((c) => c.category === 'Entertainment');
assert(octFood?.limit === 50000, 'October Food budget is ₦50,000');
assert(octEnt?.limit === 20000, 'October Entertainment budget is ₦20,000');
assert(octFood?.periodMonth === '2026-10', 'October Food has periodMonth 2026-10');
assert(octFood?.month === 10 && octFood?.year === 2026, 'October Food has month 10 and year 2026');

// ----------------------------------------------------
// TEST 3: Cross-period Isolation
// ----------------------------------------------------
console.log('\n--- Step 3: Verifying Month Isolation ---');
assert(periodBudgets['2026-08'].categoryBudgets.find((c) => c.category === 'Food')?.limit === 30000,
  'August Food budget is still ₦30,000');
assert(periodBudgets['2026-10'].categoryBudgets.find((c) => c.category === 'Food')?.limit === 50000,
  'October Food budget is ₦50,000');

// ----------------------------------------------------
// TEST 4: Empty Month State (September 2026)
// ----------------------------------------------------
console.log('\n--- Step 4: Empty Month Check (September 2026) ---');
const sepConfig = periodBudgets['2026-09'];
assert(sepConfig === undefined, 'September 2026 has no budgets stored');
const sepMonthlyBudget = sepConfig?.monthlyBudget ?? 0;
const sepCategoryBudgets = sepConfig?.categoryBudgets ?? [];
assert(sepMonthlyBudget === 0, 'September 2026 defaults to 0 monthly budget');
assert(sepCategoryBudgets.length === 0, 'September 2026 defaults to empty categories');

// ----------------------------------------------------
// TEST 5: Independent Editing
// ----------------------------------------------------
console.log('\n--- Step 5: Independent Editing Verification ---');
// Edit October Food budget -> change to 60,000
updateCategoryBudget('2026-10', octFood!.id, 60000);
assert(periodBudgets['2026-10'].categoryBudgets.find((c) => c.id === octFood!.id)?.limit === 60000,
  'October Food updated to ₦60,000');
assert(periodBudgets['2026-08'].categoryBudgets.find((c) => c.id === augFood!.id)?.limit === 30000,
  'August Food REMAINS ₦30,000 (unaffected by October edit)');

// Edit August Entertainment budget -> change to 15,000
updateCategoryBudget('2026-08', augEnt!.id, 15000);
assert(periodBudgets['2026-08'].categoryBudgets.find((c) => c.id === augEnt!.id)?.limit === 15000,
  'August Entertainment updated to ₦15,000');
assert(periodBudgets['2026-10'].categoryBudgets.find((c) => c.id === octEnt!.id)?.limit === 20000,
  'October Entertainment REMAINS ₦20,000 (unaffected by August edit)');

// ----------------------------------------------------
// TEST 6: Prevent Duplicate Categories within same month
// ----------------------------------------------------
console.log('\n--- Step 6: Duplicate Prevention ---');
addCategoryBudget('2026-08', 'food', 35000); // Case-insensitive duplicate
assert(periodBudgets['2026-08'].categoryBudgets.length === 2,
  'No duplicate category added for August Food');
assert(periodBudgets['2026-08'].categoryBudgets.find((c) => c.category.toLowerCase() === 'food')?.limit === 35000,
  'August Food updated limit to ₦35,000 instead of creating duplicate');

// ----------------------------------------------------
// TEST 7: Budget Calculations with Month-Filtered Expenses
// ----------------------------------------------------
console.log('\n--- Step 7: Month-isolated Spending Calculations ---');
const sampleTransactions: Transaction[] = [
  // August expenses
  {
    id: 'tx-aug-1',
    title: 'Grocery Mart',
    amount: 12000,
    currency: 'NGN',
    type: 'expense',
    category: 'Food',
    date: '2026-08-10',
  },
  {
    id: 'tx-aug-2',
    title: 'Cinema',
    amount: 5000,
    currency: 'NGN',
    type: 'expense',
    category: 'Entertainment',
    date: '2026-08-15',
  },
  // October expenses
  {
    id: 'tx-oct-1',
    title: 'Supermarket',
    amount: 45000,
    currency: 'NGN',
    type: 'expense',
    category: 'Food',
    date: '2026-10-05',
  },
];

// August metrics calculation
const augMetrics = calculateBudgetMetrics(
  periodBudgets['2026-08'].monthlyBudget,
  periodBudgets['2026-08'].categoryBudgets,
  sampleTransactions,
  '2026-08',
  'NGN'
);

assert(augMetrics.totalExpenses === 17000, 'August total expenses = ₦17,000 (12,000 + 5,000)');
assert(augMetrics.remainingBudget === 23000, 'August remaining budget = ₦23,000 (40,000 - 17,000)');
const augFoodProgress = augMetrics.categoryBudgets.find((c) => c.category.toLowerCase() === 'food');
assert(augFoodProgress?.spent === 12000, 'August Food spent = ₦12,000');
assert(augFoodProgress?.limit === 35000, 'August Food limit = ₦35,000');
assert(augFoodProgress?.remaining === 23000, 'August Food remaining = ₦23,000');

// October metrics calculation
const octMetrics = calculateBudgetMetrics(
  periodBudgets['2026-10'].monthlyBudget,
  periodBudgets['2026-10'].categoryBudgets,
  sampleTransactions,
  '2026-10',
  'NGN'
);

assert(octMetrics.totalExpenses === 45000, 'October total expenses = ₦45,000');
assert(octMetrics.remainingBudget === 25000, 'October remaining budget = ₦25,000 (70,000 - 45,000)');
const octFoodProgress = octMetrics.categoryBudgets.find((c) => c.category === 'Food');
assert(octFoodProgress?.spent === 45000, 'October Food spent = ₦45,000');
assert(octFoodProgress?.limit === 60000, 'October Food limit = ₦60,000');
assert(octFoodProgress?.remaining === 15000, 'October Food remaining = ₦15,000');

// September metrics calculation (should have 0 budget and 0 expenses)
const sepMetrics = calculateBudgetMetrics(
  0,
  [],
  sampleTransactions,
  '2026-09',
  'NGN'
);
assert(sepMetrics.totalExpenses === 0, 'September total expenses = ₦0');
assert(sepMetrics.monthlyBudget === 0, 'September monthly budget = ₦0');
assert(sepMetrics.categoryBudgets.length === 0, 'September category budgets = 0');

// ----------------------------------------------------
// TEST 8: Serialization / Persistence Simulation
// ----------------------------------------------------
console.log('\n--- Step 8: Persistence & Reload Simulation ---');
const serialized = JSON.stringify(periodBudgets);
const reloaded: Record<string, MonthBudgetConfig> = JSON.parse(serialized);

assert(reloaded['2026-08'].categoryBudgets.length === 2, 'Reloaded August has 2 categories');
assert(reloaded['2026-10'].categoryBudgets.length === 2, 'Reloaded October has 2 categories');
assert(reloaded['2026-08'].categoryBudgets.find((c) => c.category.toLowerCase() === 'food')?.limit === 35000,
  'Reloaded August Food is ₦35,000');
assert(reloaded['2026-10'].categoryBudgets.find((c) => c.category === 'Food')?.limit === 60000,
  'Reloaded October Food is ₦60,000');

// ----------------------------------------------------
// TEST 9: Year Isolation (e.g. 2026-10 vs 2027-10)
// ----------------------------------------------------
console.log('\n--- Step 9: Year Disambiguation (2026-10 vs 2027-10) ---');
setMonthlyBudget('2027-10', 95000);
addCategoryBudget('2027-10', 'Food', 80000);

assert(periodBudgets['2026-10'].monthlyBudget === 70000, 'October 2026 budget is ₦70,000');
assert(periodBudgets['2027-10'].monthlyBudget === 95000, 'October 2027 budget is ₦95,000');
assert(periodBudgets['2026-10'].categoryBudgets.find((c) => c.category === 'Food')?.limit === 60000,
  'October 2026 Food is ₦60,000');
assert(periodBudgets['2027-10'].categoryBudgets.find((c) => c.category === 'Food')?.limit === 80000,
  'October 2027 Food is ₦80,000');

console.log('\n====================================================');
console.log('🎉 ALL 24 ASSERTIONS PASSED SUCCESSFULLY!');
console.log('====================================================');
