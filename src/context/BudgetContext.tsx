import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { useCurrency } from './CurrencyContext';
import { useTransactions } from './TransactionContext';
import { BudgetMetrics, CategoryBudget, MonthBudgetConfig } from '../types';
import { calculateBudgetMetrics } from '../utils/budgetCalculations';
import {
  saveBudgetPeriodToFirestore,
  subscribeToFirestoreBudgets,
} from '../services/firebaseService';

export interface BudgetContextType {
  monthlyBudget: number;
  setMonthlyBudget: (amount: number, targetMonth?: string) => Promise<void>;
  resetBudget: (targetMonth?: string) => Promise<void>;
  selectedMonth: string;
  setSelectedMonth: (month: string) => Promise<void>;
  categoryBudgets: CategoryBudget[];
  addCategoryBudget: (category: string, limit: number, targetMonth?: string) => Promise<void>;
  updateCategoryBudget: (
    id: string,
    categoryOrLimit: string | number,
    limit?: number,
    targetMonth?: string
  ) => Promise<void>;
  deleteCategoryBudget: (id: string, targetMonth?: string) => Promise<void>;
  metrics: BudgetMetrics;
  isLoading: boolean;
  getBudgetForMonth: (monthStr: string) => { monthlyBudget: number; categoryBudgets: CategoryBudget[] };
  getMetricsForMonth: (monthStr: string) => BudgetMetrics;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { preferredCurrency, rates } = useCurrency();
  const { transactions } = useTransactions();

  // Current year-month string default (e.g. "2026-08")
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [periodBudgets, setPeriodBudgets] = useState<Record<string, MonthBudgetConfig>>({});
  const [selectedMonth, setSelectedMonthState] = useState<string>(currentMonthStr);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Storage key helpers for user-isolated persistence
  const getStorageKey = useCallback(
    (uid?: string | null) => (uid ? `spendly_${uid}_period_budgets` : 'spendly_guest_period_budgets'),
    []
  );

  const getMonthStorageKey = useCallback(
    (uid?: string | null) =>
      uid ? `spendly_${uid}_budget_selected_month` : 'spendly_guest_budget_selected_month',
    []
  );

  // Helper to persist period map to localStorage
  const persistPeriodBudgetsLocally = useCallback(
    (uid: string | undefined | null, data: Record<string, MonthBudgetConfig>) => {
      try {
        const key = getStorageKey(uid);
        window.localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.warn('[BudgetContext] LocalStorage write error:', err);
      }
    },
    [getStorageKey]
  );

  // Synchronize budget state on user login / logout and subscribe to Firestore
  useEffect(() => {
    if (authLoading) return;

    const storageKey = getStorageKey(currentUser?.uid);
    const monthKey = getMonthStorageKey(currentUser?.uid);

    // 1. Read cached period budgets from localStorage
    try {
      const cachedData = window.localStorage.getItem(storageKey);
      const cachedMonth = window.localStorage.getItem(monthKey);

      if (cachedMonth) {
        try {
          const parsedMonth = JSON.parse(cachedMonth);
          if (typeof parsedMonth === 'string' && parsedMonth) {
            setSelectedMonthState(parsedMonth);
          }
        } catch {
          setSelectedMonthState(cachedMonth);
        }
      }

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed && typeof parsed === 'object') {
          setPeriodBudgets(parsed);
        }
      } else {
        // Safe migration for legacy localStorage keys if present
        const legacyUid = currentUser?.uid;
        const legacyBudgetKey = legacyUid
          ? `spendly_${legacyUid}_monthly_budget`
          : 'spendly_guest_monthly_budget';
        const legacyCatKey = legacyUid
          ? `spendly_${legacyUid}_category_budgets`
          : 'spendly_guest_category_budgets';
        const legacyMonthKey = legacyUid
          ? `spendly_${legacyUid}_budget_selected_month`
          : 'spendly_guest_budget_selected_month';

        const legacyBudgetRaw = window.localStorage.getItem(legacyBudgetKey);
        const legacyCatRaw = window.localStorage.getItem(legacyCatKey);
        const legacyMonthRaw = window.localStorage.getItem(legacyMonthKey);

        if (legacyBudgetRaw || legacyCatRaw) {
          const parsedBudget = legacyBudgetRaw ? Math.max(0, Number(JSON.parse(legacyBudgetRaw)) || 0) : 0;
          const parsedCats = legacyCatRaw ? JSON.parse(legacyCatRaw) : [];
          let targetMonth = currentMonthStr;
          if (legacyMonthRaw) {
            try {
              const pm = JSON.parse(legacyMonthRaw);
              if (typeof pm === 'string' && pm) targetMonth = pm;
            } catch {
              targetMonth = legacyMonthRaw;
            }
          }

          const [yStr, mStr] = targetMonth.split('-');
          const year = Number(yStr) || new Date().getFullYear();
          const month = Number(mStr) || new Date().getMonth() + 1;

          const migrated: MonthBudgetConfig = {
            periodMonth: targetMonth,
            month,
            year,
            monthlyBudget: parsedBudget,
            categoryBudgets: Array.isArray(parsedCats)
              ? parsedCats.map((c: any) => ({
                  ...c,
                  periodMonth: targetMonth,
                  month,
                  year,
                }))
              : [],
            updatedAt: new Date().toISOString(),
          };

          const initialMap = { [targetMonth]: migrated };
          setPeriodBudgets(initialMap);
          persistPeriodBudgetsLocally(currentUser?.uid, initialMap);
        } else {
          setPeriodBudgets({});
        }
      }
    } catch (err) {
      console.warn('[BudgetContext] Error initializing cached budgets:', err);
      setPeriodBudgets({});
    }

    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // 2. Subscribe to Firestore budgets subcollection: users/{userId}/budgets
    const unsubscribe = subscribeToFirestoreBudgets(
      currentUser.uid,
      (budgetsByPeriod) => {
        setPeriodBudgets((prev) => {
          const updated = { ...prev, ...budgetsByPeriod };
          persistPeriodBudgetsLocally(currentUser.uid, updated);
          return updated;
        });
        setIsLoading(false);
      },
      (err) => {
        console.warn('[BudgetContext] Firestore budgets subscription error:', err);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [
    currentUser,
    authLoading,
    currentMonthStr,
    getStorageKey,
    getMonthStorageKey,
    persistPeriodBudgetsLocally,
  ]);

  // Derived budget values for the currently selected month
  const activeMonthConfig = periodBudgets[selectedMonth];
  const monthlyBudget = activeMonthConfig?.monthlyBudget ?? 0;
  const categoryBudgets = useMemo(() => {
    return Array.isArray(activeMonthConfig?.categoryBudgets)
      ? activeMonthConfig.categoryBudgets
      : [];
  }, [activeMonthConfig]);

  // Action: Set selected month
  const setSelectedMonth = useCallback(
    async (month: string): Promise<void> => {
      if (!month) return;
      setSelectedMonthState(month);
      try {
        const monthKey = getMonthStorageKey(currentUser?.uid);
        window.localStorage.setItem(monthKey, JSON.stringify(month));
      } catch (err) {
        console.warn('[BudgetContext] Could not store selected month:', err);
      }
    },
    [currentUser, getMonthStorageKey]
  );

  // Action: Set monthly budget for a specific month (defaults to selectedMonth)
  const setMonthlyBudget = useCallback(
    async (amount: number, targetMonth?: string): Promise<void> => {
      const target = targetMonth || selectedMonth;
      const sanitized = Math.max(0, Number(amount) || 0);
      const [yStr, mStr] = target.split('-');
      const year = Number(yStr) || new Date().getFullYear();
      const month = Number(mStr) || new Date().getMonth() + 1;

      setPeriodBudgets((prev) => {
        const existing = prev[target];
        const existingCats = existing?.categoryBudgets || [];
        const updatedConfig: MonthBudgetConfig = {
          periodMonth: target,
          month,
          year,
          monthlyBudget: sanitized,
          categoryBudgets: existingCats,
          updatedAt: new Date().toISOString(),
        };
        const next = { ...prev, [target]: updatedConfig };
        persistPeriodBudgetsLocally(currentUser?.uid, next);
        return next;
      });

      if (currentUser) {
        try {
          const currentCats = periodBudgets[target]?.categoryBudgets || [];
          await saveBudgetPeriodToFirestore(currentUser.uid, target, sanitized, currentCats);
        } catch (cloudErr) {
          console.error(`[BudgetContext] Cloud budget sync for ${target} failed:`, cloudErr);
          throw cloudErr;
        }
      }
    },
    [selectedMonth, currentUser, periodBudgets, persistPeriodBudgetsLocally]
  );

  // Action: Reset budget target for a specific month (defaults to selectedMonth)
  const resetBudget = useCallback(
    async (targetMonth?: string): Promise<void> => {
      const target = targetMonth || selectedMonth;
      const [yStr, mStr] = target.split('-');
      const year = Number(yStr) || new Date().getFullYear();
      const month = Number(mStr) || new Date().getMonth() + 1;

      setPeriodBudgets((prev) => {
        const existing = prev[target];
        const existingCats = existing?.categoryBudgets || [];
        const updatedConfig: MonthBudgetConfig = {
          periodMonth: target,
          month,
          year,
          monthlyBudget: 0,
          categoryBudgets: existingCats,
          updatedAt: new Date().toISOString(),
        };
        const next = { ...prev, [target]: updatedConfig };
        persistPeriodBudgetsLocally(currentUser?.uid, next);
        return next;
      });

      if (currentUser) {
        try {
          const currentCats = periodBudgets[target]?.categoryBudgets || [];
          await saveBudgetPeriodToFirestore(currentUser.uid, target, 0, currentCats);
        } catch (cloudErr) {
          console.error(`[BudgetContext] Cloud budget reset for ${target} failed:`, cloudErr);
          throw cloudErr;
        }
      }
    },
    [selectedMonth, currentUser, periodBudgets, persistPeriodBudgetsLocally]
  );

  // Action: Add category budget limit to a specific month (defaults to selectedMonth)
  const addCategoryBudget = useCallback(
    async (category: string, limit: number, targetMonth?: string): Promise<void> => {
      const cleanCategory = category.trim();
      const cleanLimit = Math.max(0, Number(limit) || 0);
      if (!cleanCategory || cleanLimit <= 0) return;

      const target = targetMonth || selectedMonth;
      const [yStr, mStr] = target.split('-');
      const year = Number(yStr) || new Date().getFullYear();
      const month = Number(mStr) || new Date().getMonth() + 1;

      let updatedCategoriesForSync: CategoryBudget[] = [];
      let updatedBudgetForSync: number = 0;

      setPeriodBudgets((prev) => {
        const existingConfig = prev[target];
        const currentList = Array.isArray(existingConfig?.categoryBudgets)
          ? existingConfig.categoryBudgets
          : [];
        const currentMonthlyBudget = existingConfig?.monthlyBudget ?? 0;

        let updatedList: CategoryBudget[];
        // Prevent duplicate category in the same month (case-insensitive)
        const existingIndex = currentList.findIndex(
          (c) => c.category.toLowerCase() === cleanCategory.toLowerCase()
        );

        if (existingIndex >= 0) {
          updatedList = [...currentList];
          updatedList[existingIndex] = {
            ...updatedList[existingIndex],
            limit: cleanLimit,
            currency: preferredCurrency,
            periodMonth: target,
            month,
            year,
          };
        } else {
          updatedList = [
            ...currentList,
            {
              id: `cb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              category: cleanCategory,
              limit: cleanLimit,
              currency: preferredCurrency,
              periodMonth: target,
              month,
              year,
            },
          ];
        }

        updatedCategoriesForSync = updatedList;
        updatedBudgetForSync = currentMonthlyBudget;

        const nextConfig: MonthBudgetConfig = {
          periodMonth: target,
          month,
          year,
          monthlyBudget: currentMonthlyBudget,
          categoryBudgets: updatedList,
          updatedAt: new Date().toISOString(),
        };

        const next = { ...prev, [target]: nextConfig };
        persistPeriodBudgetsLocally(currentUser?.uid, next);
        return next;
      });

      if (currentUser) {
        try {
          await saveBudgetPeriodToFirestore(
            currentUser.uid,
            target,
            updatedBudgetForSync,
            updatedCategoriesForSync
          );
        } catch (cloudErr) {
          console.error(`[BudgetContext] Cloud category budget sync for ${target} failed:`, cloudErr);
          throw cloudErr;
        }
      }
    },
    [selectedMonth, preferredCurrency, currentUser, persistPeriodBudgetsLocally]
  );

  // Action: Update category budget limit or category name for a specific month
  const updateCategoryBudget = useCallback(
    async (
      id: string,
      categoryOrLimit: string | number,
      maybeLimit?: number,
      targetMonth?: string
    ): Promise<void> => {
      const target = targetMonth || selectedMonth;
      const [yStr, mStr] = target.split('-');
      const year = Number(yStr) || new Date().getFullYear();
      const month = Number(mStr) || new Date().getMonth() + 1;

      let cleanCategory: string | undefined;
      let cleanLimit: number;

      if (typeof categoryOrLimit === 'string') {
        cleanCategory = categoryOrLimit.trim();
        cleanLimit = Math.max(0, Number(maybeLimit) || 0);
      } else {
        cleanLimit = Math.max(0, Number(categoryOrLimit) || 0);
      }

      let updatedCategoriesForSync: CategoryBudget[] = [];
      let updatedBudgetForSync: number = 0;

      setPeriodBudgets((prev) => {
        const existingConfig = prev[target];
        const currentList = Array.isArray(existingConfig?.categoryBudgets)
          ? existingConfig.categoryBudgets
          : [];
        const currentMonthlyBudget = existingConfig?.monthlyBudget ?? 0;

        const updatedList = currentList.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              category: cleanCategory || c.category,
              limit: cleanLimit,
              currency: c.currency || preferredCurrency,
              periodMonth: target,
              month,
              year,
            };
          }
          return c;
        });

        updatedCategoriesForSync = updatedList;
        updatedBudgetForSync = currentMonthlyBudget;

        const nextConfig: MonthBudgetConfig = {
          periodMonth: target,
          month,
          year,
          monthlyBudget: currentMonthlyBudget,
          categoryBudgets: updatedList,
          updatedAt: new Date().toISOString(),
        };

        const next = { ...prev, [target]: nextConfig };
        persistPeriodBudgetsLocally(currentUser?.uid, next);
        return next;
      });

      if (currentUser) {
        try {
          await saveBudgetPeriodToFirestore(
            currentUser.uid,
            target,
            updatedBudgetForSync,
            updatedCategoriesForSync
          );
        } catch (cloudErr) {
          console.error(`[BudgetContext] Cloud category budget update for ${target} failed:`, cloudErr);
          throw cloudErr;
        }
      }
    },
    [selectedMonth, preferredCurrency, currentUser, persistPeriodBudgetsLocally]
  );

  // Action: Delete category budget limit from a specific month
  const deleteCategoryBudget = useCallback(
    async (id: string, targetMonth?: string): Promise<void> => {
      const target = targetMonth || selectedMonth;
      let updatedCategoriesForSync: CategoryBudget[] = [];
      let updatedBudgetForSync: number = 0;

      setPeriodBudgets((prev) => {
        const existingConfig = prev[target];
        const currentList = Array.isArray(existingConfig?.categoryBudgets)
          ? existingConfig.categoryBudgets
          : [];
        const currentMonthlyBudget = existingConfig?.monthlyBudget ?? 0;
        const [yStr, mStr] = target.split('-');
        const year = Number(yStr) || new Date().getFullYear();
        const month = Number(mStr) || new Date().getMonth() + 1;

        const updatedList = currentList.filter((c) => c.id !== id);
        updatedCategoriesForSync = updatedList;
        updatedBudgetForSync = currentMonthlyBudget;

        const nextConfig: MonthBudgetConfig = {
          periodMonth: target,
          month,
          year,
          monthlyBudget: currentMonthlyBudget,
          categoryBudgets: updatedList,
          updatedAt: new Date().toISOString(),
        };

        const next = { ...prev, [target]: nextConfig };
        persistPeriodBudgetsLocally(currentUser?.uid, next);
        return next;
      });

      if (currentUser) {
        try {
          await saveBudgetPeriodToFirestore(
            currentUser.uid,
            target,
            updatedBudgetForSync,
            updatedCategoriesForSync
          );
        } catch (cloudErr) {
          console.error(`[BudgetContext] Cloud delete category budget failed:`, cloudErr);
          throw cloudErr;
        }
      }
    },
    [selectedMonth, currentUser, persistPeriodBudgetsLocally]
  );

  // Helper to query budget data for any month
  const getBudgetForMonth = useCallback(
    (monthStr: string) => {
      const config = periodBudgets[monthStr];
      return {
        monthlyBudget: config?.monthlyBudget ?? 0,
        categoryBudgets: config?.categoryBudgets ?? [],
      };
    },
    [periodBudgets]
  );

  // Helper to compute budget metrics for any month
  const getMetricsForMonth = useCallback(
    (monthStr: string): BudgetMetrics => {
      const { monthlyBudget: mBudget, categoryBudgets: cBudgets } = getBudgetForMonth(monthStr);
      return calculateBudgetMetrics(
        mBudget,
        cBudgets,
        transactions,
        monthStr,
        preferredCurrency,
        rates
      );
    },
    [getBudgetForMonth, transactions, preferredCurrency, rates]
  );

  // Calculate real-time budget metrics strictly for the active selectedMonth
  const metrics = useMemo<BudgetMetrics>(() => {
    return calculateBudgetMetrics(
      monthlyBudget,
      categoryBudgets,
      transactions,
      selectedMonth,
      preferredCurrency,
      rates
    );
  }, [monthlyBudget, categoryBudgets, transactions, selectedMonth, preferredCurrency, rates]);

  return (
    <BudgetContext.Provider
      value={{
        monthlyBudget,
        setMonthlyBudget,
        resetBudget,
        selectedMonth,
        setSelectedMonth,
        categoryBudgets,
        addCategoryBudget,
        updateCategoryBudget,
        deleteCategoryBudget,
        metrics,
        isLoading,
        getBudgetForMonth,
        getMetricsForMonth,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
