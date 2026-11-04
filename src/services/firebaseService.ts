import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Transaction, CategoryBudget, CurrencyCode, MonthBudgetConfig, CategoryItem } from '../types';

/**
 * Strips all undefined fields from an object so Firestore setDoc / updateDoc never rejects.
 */
export const sanitizePayload = (obj: Record<string, any>): Record<string, any> => {
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
};

/**
 * Creates or updates a base user profile document in Firestore.
 * Default preferredCurrency is set to 'NGN' for new users.
 */
export const createUserProfileDocument = async (
  userId: string,
  email: string,
  displayName?: string,
  preferredCurrency: CurrencyCode = 'NGN'
): Promise<void> => {
  if (!userId) return;
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      const payload = sanitizePayload({
        uid: userId,
        email: email || '',
        displayName: displayName || '',
        preferredCurrency: preferredCurrency || 'NGN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await setDoc(userDocRef, payload);
    } else {
      const existing = docSnap.data();
      const payload = sanitizePayload({
        email: email || existing?.email || '',
        displayName: displayName || existing?.displayName || '',
        updatedAt: new Date().toISOString(),
      });
      await setDoc(userDocRef, payload, { merge: true });
    }
  } catch (error) {
    console.warn('[Firebase Firestore] Could not create or verify user profile document:', error);
    throw error;
  }
};

/**
 * Save user's preferred display currency to Firestore profile: users/{userId}
 */
export const saveUserPreferredCurrency = async (
  userId: string,
  preferredCurrency: CurrencyCode
): Promise<void> => {
  if (!userId || !preferredCurrency) return;
  try {
    const userDocRef = doc(db, 'users', userId);
    const payload = sanitizePayload({
      preferredCurrency,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(userDocRef, payload, { merge: true });
  } catch (error) {
    console.warn('[Firebase Firestore] Could not save preferred currency:', error);
    throw error;
  }
};

/**
 * Subscribe to user profile updates (e.g. preferredCurrency)
 */
export const subscribeToUserProfile = (
  userId: string,
  onSuccess: (profile: { preferredCurrency?: CurrencyCode; displayName?: string }) => void,
  onError?: (error: Error) => void
) => {
  if (!userId) {
    onSuccess({ preferredCurrency: 'NGN' });
    return () => {};
  }
  try {
    const userDocRef = doc(db, 'users', userId);
    return onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          onSuccess({
            preferredCurrency: data.preferredCurrency || 'NGN',
            displayName: data.displayName,
          });
        } else {
          onSuccess({ preferredCurrency: 'NGN' });
        }
      },
      (err) => {
        console.warn('[Firebase Firestore] User profile subscription notice:', err.message);
        if (onError) onError(err);
      }
    );
  } catch (error) {
    console.warn('[Firebase Firestore] Setup user profile subscription failed:', error);
    return () => {};
  }
};

/**
 * Save or update a single transaction in user-scoped Firestore subcollection:
 * users/{userId}/transactions/{transactionId}
 */
export const saveTransactionToFirestore = async (
  userId: string,
  transaction: Transaction
): Promise<{ success: boolean; id: string }> => {
  if (!userId || !transaction?.id) {
    throw new Error('Missing userId or transaction id for Firestore persistence');
  }
  try {
    console.log('[FirebaseService] saveTransactionToFirestore writing doc for:', userId, transaction.id);
    const docRef = doc(db, 'users', userId, 'transactions', transaction.id);
    
    // Explicit clean payload without any undefined values
    const payload: Record<string, any> = {
      id: transaction.id,
      title: transaction.title ? transaction.title.trim() : '',
      amount: Number(transaction.amount) || 0,
      currency: transaction.currency || 'NGN',
      type: transaction.type === 'income' ? 'income' : 'expense',
      category: transaction.category || (transaction.type === 'income' ? 'Salary' : 'Other'),
      date: transaction.date || new Date().toISOString().split('T')[0],
      createdAt: transaction.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (transaction.description && transaction.description.trim()) {
      payload.description = transaction.description.trim();
    }
    if (transaction.notes && transaction.notes.trim()) {
      payload.notes = transaction.notes.trim();
    }
    if (typeof transaction.isRecurring === 'boolean') {
      payload.isRecurring = transaction.isRecurring;
    }
    if (transaction.recurringInterval) {
      payload.recurringInterval = transaction.recurringInterval;
    }
    if (typeof transaction.exchangeRate === 'number' && !isNaN(transaction.exchangeRate)) {
      payload.exchangeRate = transaction.exchangeRate;
    }
    if (transaction.convertedCurrency) {
      payload.convertedCurrency = transaction.convertedCurrency;
    }
    if (typeof transaction.convertedAmount === 'number' && !isNaN(transaction.convertedAmount)) {
      payload.convertedAmount = transaction.convertedAmount;
    }

    const clean = sanitizePayload(payload);
    await setDoc(docRef, clean, { merge: true });
    console.log('[FirebaseService] Firestore setDoc completed successfully for tx:', transaction.id);
    return { success: true, id: transaction.id };
  } catch (error) {
    console.error('[Firebase Firestore] Could not sync transaction to cloud:', error);
    throw error;
  }
};

/**
 * Delete a transaction from user-scoped Firestore subcollection:
 * users/{userId}/transactions/{transactionId}
 */
export const deleteTransactionFromFirestore = async (
  userId: string,
  id: string
): Promise<void> => {
  if (!userId || !id) return;
  try {
    console.log('[FirebaseService] deleteTransactionFromFirestore for:', userId, id);
    const docRef = doc(db, 'users', userId, 'transactions', id);
    await deleteDoc(docRef);
    console.log('[FirebaseService] deleteDoc completed successfully for tx:', id);
  } catch (error) {
    console.error('[Firebase Firestore] Could not delete transaction from cloud:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time transaction updates for the authenticated user:
 * users/{userId}/transactions
 */
export const subscribeToFirestoreTransactions = (
  userId: string,
  onSuccess: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
) => {
  if (!userId) {
    onSuccess([]);
    return () => {};
  }
  try {
    const colRef = collection(db, 'users', userId, 'transactions');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Transaction;
          list.push({
            id: docSnap.id,
            title: data.title || '',
            amount: Number(data.amount) || 0,
            currency: data.currency || 'NGN',
            type: data.type === 'income' ? 'income' : 'expense',
            category: data.category || (data.type === 'income' ? 'Salary' : 'Other'),
            date: data.date || new Date().toISOString().split('T')[0],
            description: data.description || undefined,
            notes: data.notes || undefined,
            isRecurring: !!data.isRecurring,
            recurringInterval: data.recurringInterval || undefined,
            exchangeRate: typeof data.exchangeRate === 'number' ? data.exchangeRate : undefined,
            convertedCurrency: data.convertedCurrency || undefined,
            convertedAmount: typeof data.convertedAmount === 'number' ? data.convertedAmount : undefined,
            createdAt: data.createdAt || undefined,
            updatedAt: data.updatedAt || undefined,
          });
        });
        // Sort descending by date, with createdAt as secondary tie-breaker
        list.sort((a, b) => {
          const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateDiff !== 0) return dateDiff;
          const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (createdB !== createdA) return createdB - createdA;
          return b.id.localeCompare(a.id);
        });
        onSuccess(list);
      },
      (err) => {
        console.warn('[Firebase Firestore] Transaction subscription notice:', err.message);
        if (onError) onError(err);
      }
    );
  } catch (error) {
    console.warn('[Firebase Firestore] Setup transaction subscription failed:', error);
    return () => {};
  }
};

/**
 * Save budget settings for a specific month and year:
 * users/{userId}/budgets/{periodMonth} (e.g. users/{userId}/budgets/2026-08)
 */
export const saveBudgetPeriodToFirestore = async (
  userId: string,
  periodMonth: string,
  monthlyBudget: number,
  categoryBudgets: CategoryBudget[]
): Promise<void> => {
  if (!userId || !periodMonth) return;
  try {
    const [yearStr, monthStr] = periodMonth.split('-');
    const year = Number(yearStr) || new Date().getFullYear();
    const month = Number(monthStr) || new Date().getMonth() + 1;

    const docRef = doc(db, 'users', userId, 'budgets', periodMonth);
    const sanitizedCategories: CategoryBudget[] = Array.isArray(categoryBudgets)
      ? categoryBudgets.map((cb) => ({
          id: cb.id || `cb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          category: cb.category || '',
          limit: Number(cb.limit) || 0,
          currency: cb.currency || 'NGN',
          periodMonth,
          month,
          year,
        }))
      : [];

    const payload = sanitizePayload({
      periodMonth,
      month,
      year,
      monthlyBudget: Math.max(0, Number(monthlyBudget) || 0),
      categoryBudgets: sanitizedCategories,
      updatedAt: new Date().toISOString(),
    });

    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    console.warn(`[Firebase Firestore] Could not save budget for period ${periodMonth}:`, error);
    throw error;
  }
};

/**
 * Backward-compatible wrapper for saving budget.
 */
export const saveBudgetToFirestore = async (
  userId: string,
  monthlyBudget: number,
  categoryBudgets: CategoryBudget[],
  selectedMonth: string
): Promise<void> => {
  const periodMonth = selectedMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  return saveBudgetPeriodToFirestore(userId, periodMonth, monthlyBudget, categoryBudgets);
};

/**
 * Subscribe to real-time budget updates for all periods of an authenticated user:
 * users/{userId}/budgets
 *
 * Automatically migrates existing legacy data from users/{userId}/budget/monthly_config
 * if the budgets collection is currently empty.
 */
export const subscribeToFirestoreBudgets = (
  userId: string,
  onSuccess: (budgetsByPeriod: Record<string, MonthBudgetConfig>) => void,
  onError?: (error: Error) => void
) => {
  if (!userId) {
    onSuccess({});
    return () => {};
  }
  try {
    const colRef = collection(db, 'users', userId, 'budgets');
    return onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // Check for legacy document at users/{userId}/budget/monthly_config
          try {
            const legacyDocRef = doc(db, 'users', userId, 'budget', 'monthly_config');
            const legacySnap = await getDoc(legacyDocRef);
            if (legacySnap.exists()) {
              const legacyData = legacySnap.data();
              const legacyMonth =
                legacyData.selectedMonth ||
                `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
              const [yStr, mStr] = legacyMonth.split('-');
              const year = Number(yStr) || new Date().getFullYear();
              const month = Number(mStr) || new Date().getMonth() + 1;

              const migratedConfig: MonthBudgetConfig = {
                periodMonth: legacyMonth,
                month,
                year,
                monthlyBudget: Number(legacyData.monthlyBudget) || 0,
                categoryBudgets: (Array.isArray(legacyData.categoryBudgets)
                  ? legacyData.categoryBudgets
                  : []
                ).map((cb: any) => ({
                  id: cb.id || `cb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  category: cb.category || '',
                  limit: Number(cb.limit) || 0,
                  currency: cb.currency || 'NGN',
                  periodMonth: legacyMonth,
                  month,
                  year,
                })),
                updatedAt: new Date().toISOString(),
              };

              // Migrate forward into users/{userId}/budgets/{legacyMonth}
              await saveBudgetPeriodToFirestore(
                userId,
                legacyMonth,
                migratedConfig.monthlyBudget,
                migratedConfig.categoryBudgets
              );

              onSuccess({ [legacyMonth]: migratedConfig });
              return;
            }
          } catch (migrateErr) {
            console.warn('[Firebase Firestore] Legacy budget check notice:', migrateErr);
          }

          onSuccess({});
          return;
        }

        const map: Record<string, MonthBudgetConfig> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const periodMonth = docSnap.id;
          const [yStr, mStr] = periodMonth.split('-');
          const year = data.year || Number(yStr) || new Date().getFullYear();
          const month = data.month || Number(mStr) || new Date().getMonth() + 1;

          map[periodMonth] = {
            periodMonth,
            month,
            year,
            monthlyBudget: Number(data.monthlyBudget) || 0,
            categoryBudgets: Array.isArray(data.categoryBudgets)
              ? data.categoryBudgets.map((cb: any) => ({
                  id: cb.id || '',
                  category: cb.category || '',
                  limit: Number(cb.limit) || 0,
                  currency: cb.currency || 'NGN',
                  periodMonth,
                  month,
                  year,
                }))
              : [],
            updatedAt: data.updatedAt,
          };
        });

        onSuccess(map);
      },
      (err) => {
        console.warn('[Firebase Firestore] Budgets subscription notice:', err.message);
        if (onError) onError(err);
      }
    );
  } catch (error) {
    console.warn('[Firebase Firestore] Setup budgets subscription failed:', error);
    return () => {};
  }
};

/**
 * Legacy budget subscription kept for compatibility.
 */
export const subscribeToFirestoreBudget = (
  userId: string,
  onSuccess: (data: {
    monthlyBudget?: number;
    categoryBudgets?: CategoryBudget[];
    selectedMonth?: string;
  }) => void,
  onError?: (error: Error) => void
) => {
  return subscribeToFirestoreBudgets(
    userId,
    (budgetsByPeriod) => {
      const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      const config = budgetsByPeriod[currentMonth] || Object.values(budgetsByPeriod)[0];
      if (config) {
        onSuccess({
          monthlyBudget: config.monthlyBudget,
          categoryBudgets: config.categoryBudgets,
          selectedMonth: config.periodMonth,
        });
      } else {
        onSuccess({ monthlyBudget: 0, categoryBudgets: [], selectedMonth: currentMonth });
      }
    },
    onError
  );
};

/**
 * Save or update a custom category in user-scoped Firestore subcollection:
 * users/{userId}/categories/{categoryId}
 */
export const saveCategoryToFirestore = async (
  userId: string,
  category: CategoryItem
): Promise<void> => {
  if (!userId || !category?.id) return;
  try {
    const docRef = doc(db, 'users', userId, 'categories', category.id);
    const payload = sanitizePayload({
      id: category.id,
      name: category.name.trim(),
      type: category.type === 'income' ? 'income' : 'expense',
      icon: category.icon || 'Package',
      color: category.color || '#8e8bf5',
      group: category.group || 'Custom',
      isCustom: true,
      description: category.description?.trim() || '',
      createdAt: category.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    console.error('[Firebase Firestore] Could not save category to cloud:', error);
    throw error;
  }
};

/**
 * Delete a custom category from user-scoped Firestore subcollection:
 * users/{userId}/categories/{categoryId}
 */
export const deleteCategoryFromFirestore = async (
  userId: string,
  categoryId: string
): Promise<void> => {
  if (!userId || !categoryId) return;
  try {
    const docRef = doc(db, 'users', userId, 'categories', categoryId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('[Firebase Firestore] Could not delete category from cloud:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time custom category updates for the authenticated user:
 * users/{userId}/categories
 */
export const subscribeToFirestoreCategories = (
  userId: string,
  onSuccess: (categories: CategoryItem[]) => void,
  onError?: (error: Error) => void
) => {
  if (!userId) {
    onSuccess([]);
    return () => {};
  }
  try {
    const colRef = collection(db, 'users', userId, 'categories');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: CategoryItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            name: data.name || '',
            type: data.type === 'income' ? 'income' : 'expense',
            icon: data.icon || 'Package',
            color: data.color || '#8e8bf5',
            group: data.group || 'Custom',
            isCustom: data.isCustom ?? true,
            description: data.description || '',
            createdAt: data.createdAt,
          });
        });
        onSuccess(list);
      },
      (err) => {
        console.warn('[Firebase Firestore] Categories subscription notice:', err.message);
        if (onError) onError(err);
      }
    );
  } catch (error) {
    console.warn('[Firebase Firestore] Setup categories subscription failed:', error);
    return () => {};
  }
};

