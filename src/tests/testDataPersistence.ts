import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import {
  createUserProfileDocument,
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  saveBudgetPeriodToFirestore,
  saveUserPreferredCurrency,
} from '../services/firebaseService';
import { Transaction, CategoryItem } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runDataPersistenceAudit() {
  console.log('===============================================================');
  console.log('TEST SUITE: Spendly Real Firebase Firestore Persistence Audit');
  console.log('===============================================================\n');

  const testEmail = `persist_test_${Date.now()}@spendly.app`;
  const testPassword = 'SecurePassword123!';
  const testDisplayName = 'Audit Test User';

  // -------------------------------------------------------------------------
  // STEP 1: User Registration & Profile Document Initialization
  // -------------------------------------------------------------------------
  console.log('--- Step 1: User Registration & Firestore Profile Creation ---');
  let userCred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
  const userId = userCred.user.uid;
  assert(!!userId, `User created with unique Firebase UID: ${userId}`);

  await createUserProfileDocument(userId, testEmail, testDisplayName, 'NGN');

  const profileSnap = await getDoc(doc(db, 'users', userId));
  assert(profileSnap.exists(), 'User profile document created in users/{userId}');
  const profileData = profileSnap.data();
  assert(profileData?.email === testEmail, `Profile email stored correctly: ${profileData?.email}`);
  assert(profileData?.displayName === testDisplayName, `Profile displayName stored: ${profileData?.displayName}`);
  assert(profileData?.preferredCurrency === 'NGN', `Default preferredCurrency stored: ${profileData?.preferredCurrency}`);
  assert(!!profileData?.createdAt, `Profile createdAt timestamp exists: ${profileData?.createdAt}`);

  // -------------------------------------------------------------------------
  // STEP 2: Transactions Persistence (Income & Expenses CRUD)
  // -------------------------------------------------------------------------
  console.log('\n--- Step 2: Transactions Firestore Persistence (CRUD) ---');
  const txIncome: Transaction = {
    id: `tx-inc-${Date.now()}`,
    title: 'Primary Job Salary',
    amount: 500000,
    currency: 'NGN',
    type: 'income',
    category: 'Salary',
    date: '2026-08-01',
    description: 'Monthly payroll deposit',
  };

  const txExpense1: Transaction = {
    id: `tx-exp-${Date.now()}-1`,
    title: 'Whole Foods Market',
    amount: 35000,
    currency: 'NGN',
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-08-10',
    description: 'Weekly grocery basket',
    notes: 'Bought organic items',
  };

  const txExpense2: Transaction = {
    id: `tx-exp-${Date.now()}-2`,
    title: 'Temporary Test Expense',
    amount: 15000,
    currency: 'NGN',
    type: 'expense',
    category: 'Entertainment',
    date: '2026-08-12',
  };

  await saveTransactionToFirestore(userId, txIncome);
  await saveTransactionToFirestore(userId, txExpense1);
  await saveTransactionToFirestore(userId, txExpense2);

  // Update txExpense1 amount from 35,000 to 40,000
  const updatedTxExpense1: Transaction = {
    ...txExpense1,
    amount: 40000,
    notes: 'Updated receipt total',
  };
  await saveTransactionToFirestore(userId, updatedTxExpense1);

  // Delete temporary txExpense2
  await deleteTransactionFromFirestore(userId, txExpense2.id);

  // Query Firestore subcollection
  const txCollectionRef = collection(db, 'users', userId, 'transactions');
  const txSnapshot = await getDocs(txCollectionRef);
  assert(txSnapshot.size === 2, `Transactions collection has exactly 2 active documents (size = ${txSnapshot.size})`);

  const fetchedTxMap = new Map<string, any>();
  txSnapshot.forEach((d) => fetchedTxMap.set(d.id, d.data()));

  const fetchedIncome = fetchedTxMap.get(txIncome.id);
  assert(fetchedIncome !== undefined, 'Income transaction exists in Firestore');
  assert(fetchedIncome?.amount === 500000 && fetchedIncome?.type === 'income', 'Income transaction amount & type verified');

  const fetchedExpense = fetchedTxMap.get(txExpense1.id);
  assert(fetchedExpense !== undefined, 'Expense transaction exists in Firestore');
  assert(fetchedExpense?.amount === 40000, `Updated expense amount verified (expected 40000, got ${fetchedExpense?.amount})`);
  assert(fetchedExpense?.notes === 'Updated receipt total', 'Expense notes verified');
  assert(!fetchedTxMap.has(txExpense2.id), 'Deleted transaction is no longer in Firestore');

  // -------------------------------------------------------------------------
  // STEP 3: Custom Categories Persistence (CRUD)
  // -------------------------------------------------------------------------
  console.log('\n--- Step 3: Custom Categories Firestore Persistence (CRUD) ---');
  const customCat1: CategoryItem = {
    id: `cat-custom-${Date.now()}-1`,
    name: 'Freelance Design',
    type: 'income',
    icon: 'Briefcase',
    color: '#38bdf8',
    group: 'Financial & Work',
    isCustom: true,
    description: 'Direct design contracts',
  };

  const customCat2: CategoryItem = {
    id: `cat-custom-${Date.now()}-2`,
    name: 'Obsolete Subscriptions',
    type: 'expense',
    icon: 'Package',
    color: '#94a3b8',
    group: 'Custom',
    isCustom: true,
  };

  await saveCategoryToFirestore(userId, customCat1);
  await saveCategoryToFirestore(userId, customCat2);

  // Delete customCat2
  await deleteCategoryFromFirestore(userId, customCat2.id);

  const catCollectionRef = collection(db, 'users', userId, 'categories');
  const catSnapshot = await getDocs(catCollectionRef);
  assert(catSnapshot.size === 1, `Categories collection has exactly 1 custom category (size = ${catSnapshot.size})`);

  const fetchedCat = catSnapshot.docs[0].data();
  assert(fetchedCat?.name === 'Freelance Design', `Custom category name verified: ${fetchedCat?.name}`);
  assert(fetchedCat?.color === '#38bdf8', `Custom category color verified: ${fetchedCat?.color}`);
  assert(fetchedCat?.isCustom === true, 'Custom category isCustom flag verified');

  // -------------------------------------------------------------------------
  // STEP 4: Multi-Month Independent Budget Persistence
  // -------------------------------------------------------------------------
  console.log('\n--- Step 4: Multi-Month Budgets Firestore Persistence ---');
  // August 2026
  await saveBudgetPeriodToFirestore(userId, '2026-08', 300000, [
    {
      id: `cb-aug-1`,
      category: 'Food & Dining',
      limit: 50000,
      currency: 'NGN',
      periodMonth: '2026-08',
      month: 8,
      year: 2026,
    },
    {
      id: `cb-aug-2`,
      category: 'Entertainment',
      limit: 20000,
      currency: 'NGN',
      periodMonth: '2026-08',
      month: 8,
      year: 2026,
    },
  ]);

  // October 2026 (Different limits)
  await saveBudgetPeriodToFirestore(userId, '2026-10', 450000, [
    {
      id: `cb-oct-1`,
      category: 'Food & Dining',
      limit: 75000,
      currency: 'NGN',
      periodMonth: '2026-10',
      month: 10,
      year: 2026,
    },
    {
      id: `cb-oct-2`,
      category: 'Entertainment',
      limit: 35000,
      currency: 'NGN',
      periodMonth: '2026-10',
      month: 10,
      year: 2026,
    },
  ]);

  const augBudgetSnap = await getDoc(doc(db, 'users', userId, 'budgets', '2026-08'));
  const octBudgetSnap = await getDoc(doc(db, 'users', userId, 'budgets', '2026-10'));

  assert(augBudgetSnap.exists(), 'August 2026 budget document exists in Firestore');
  assert(octBudgetSnap.exists(), 'October 2026 budget document exists in Firestore');

  const augBudgetData = augBudgetSnap.data();
  const octBudgetData = octBudgetSnap.data();

  assert(augBudgetData?.monthlyBudget === 300000, `August monthly budget = ₦300,000 (got ${augBudgetData?.monthlyBudget})`);
  assert(octBudgetData?.monthlyBudget === 450000, `October monthly budget = ₦450,000 (got ${octBudgetData?.monthlyBudget})`);

  const augFoodLimit = augBudgetData?.categoryBudgets?.find((c: any) => c.category === 'Food & Dining')?.limit;
  const octFoodLimit = octBudgetData?.categoryBudgets?.find((c: any) => c.category === 'Food & Dining')?.limit;
  assert(augFoodLimit === 50000, `August Food limit is ₦50,000 (got ${augFoodLimit})`);
  assert(octFoodLimit === 75000, `October Food limit is ₦75,000 (got ${octFoodLimit})`);

  // -------------------------------------------------------------------------
  // STEP 5: Currency Preferences Persistence
  // -------------------------------------------------------------------------
  console.log('\n--- Step 5: User Currency Preference Persistence ---');
  await saveUserPreferredCurrency(userId, 'USD');

  const updatedProfileSnap = await getDoc(doc(db, 'users', userId));
  assert(updatedProfileSnap.data()?.preferredCurrency === 'USD', `User currency preference persisted as USD in Firestore`);

  // -------------------------------------------------------------------------
  // STEP 6: Simulated Logout (Session Teardown) & Zero-Data-Loss Verification
  // -------------------------------------------------------------------------
  console.log('\n--- Step 6: Testing Logout Lifecycle (Zero Data Loss) ---');
  await signOut(auth);
  assert(auth.currentUser === null, 'User successfully signed out (auth.currentUser is null)');

  // Verify Firestore records are 100% intact after logout
  const postLogoutTxSnap = await getDocs(collection(db, 'users', userId, 'transactions'));
  const postLogoutBudgetsSnap = await getDocs(collection(db, 'users', userId, 'budgets'));
  const postLogoutCatsSnap = await getDocs(collection(db, 'users', userId, 'categories'));

  assert(postLogoutTxSnap.size === 2, `Transactions in Firestore remain untouched after logout (${postLogoutTxSnap.size})`);
  assert(postLogoutBudgetsSnap.size === 2, `Budgets in Firestore remain untouched after logout (${postLogoutBudgetsSnap.size})`);
  assert(postLogoutCatsSnap.size === 1, `Categories in Firestore remain untouched after logout (${postLogoutCatsSnap.size})`);

  // -------------------------------------------------------------------------
  // STEP 7: Simulated Login & Complete Data Restoration
  // -------------------------------------------------------------------------
  console.log('\n--- Step 7: Testing Login Restoration ---');
  const loginCred = await signInWithEmailAndPassword(auth, testEmail, testPassword);
  assert(loginCred.user.uid === userId, `Re-authenticated successfully with same UID: ${userId}`);

  // Fetch restored data directly as the re-logged-in user
  const restoredProfile = (await getDoc(doc(db, 'users', userId))).data();
  const restoredTx = await getDocs(collection(db, 'users', userId, 'transactions'));
  const restoredBudgets = await getDocs(collection(db, 'users', userId, 'budgets'));
  const restoredCats = await getDocs(collection(db, 'users', userId, 'categories'));

  assert(restoredProfile?.preferredCurrency === 'USD', 'Restored preferred currency = USD');
  assert(restoredTx.size === 2, `Restored 2 transactions from Firestore`);
  assert(restoredBudgets.size === 2, `Restored 2 monthly budget periods from Firestore`);
  assert(restoredCats.size === 1, `Restored 1 custom category from Firestore`);

  console.log('\n===============================================================');
  console.log('🎉 ALL PERSISTENCE, LOGOUT, & LOGIN RESTORATION TESTS PASSED!');
  console.log('===============================================================');
  process.exit(0);
}

runDataPersistenceAudit().catch((err) => {
  console.error('FATAL AUDIT ERROR:', err);
  process.exit(1);
});
