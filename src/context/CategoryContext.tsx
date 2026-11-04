import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { CategoryItem, TransactionType } from '../types';
import { useAuth } from './AuthContext';
import {
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  subscribeToFirestoreCategories,
} from '../services/firebaseService';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  // Expense Categories
  {
    id: 'cat-food',
    name: 'Food & Dining',
    type: 'expense',
    icon: 'UtensilsCrossed',
    color: '#f87171',
    group: 'Food & Dining',
    description: 'Groceries, restaurants, snacks, and cafes',
  },
  {
    id: 'cat-housing',
    name: 'Housing & Rent',
    type: 'expense',
    icon: 'Home',
    color: '#6366f1',
    group: 'Living & Housing',
    description: 'Rent, mortgage, property taxes, and maintenance',
  },
  {
    id: 'cat-transport',
    name: 'Transportation',
    type: 'expense',
    icon: 'Car',
    color: '#38bdf8',
    group: 'Transportation',
    description: 'Fuel, public transit, uber, cab, and auto repairs',
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment',
    type: 'expense',
    icon: 'Film',
    color: '#ec4899',
    group: 'Lifestyle & Fun',
    description: 'Movies, concerts, streaming services, and outings',
  },
  {
    id: 'cat-shopping',
    name: 'Shopping',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#fb923c',
    group: 'Lifestyle & Fun',
    description: 'Clothing, gadgets, accessories, and home goods',
  },
  {
    id: 'cat-utilities',
    name: 'Utilities',
    type: 'expense',
    icon: 'Zap',
    color: '#facc15',
    group: 'Living & Housing',
    description: 'Electricity, water, gas, internet, and phone bills',
  },
  {
    id: 'cat-healthcare',
    name: 'Healthcare',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#22c55e',
    group: 'Wellness & Health',
    description: 'Medical appointments, pharmacy, prescriptions, fitness',
  },
  {
    id: 'cat-education',
    name: 'Education',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#a855f7',
    group: 'Growth & Education',
    description: 'Tuition, courses, books, certifications, workshops',
  },
  {
    id: 'cat-other-exp',
    name: 'Other',
    type: 'expense',
    icon: 'Package',
    color: '#94a3b8',
    group: 'General & Other',
    description: 'Miscellaneous unforeseen expenses',
  },

  // Income Categories
  {
    id: 'cat-salary',
    name: 'Salary',
    type: 'income',
    icon: 'Banknote',
    color: '#22c55e',
    group: 'Financial & Work',
    description: 'Monthly payroll, primary job wages, and stipends',
  },
  {
    id: 'cat-freelance',
    name: 'Freelance',
    type: 'income',
    icon: 'Briefcase',
    color: '#38bdf8',
    group: 'Financial & Work',
    description: 'Client projects, consulting, side gigs, and contracts',
  },
  {
    id: 'cat-investment',
    name: 'Investment',
    type: 'income',
    icon: 'TrendingUp',
    color: '#8e8bf5',
    group: 'Financial & Work',
    description: 'Dividends, capital gains, interest, crypto, rental income',
  },
  {
    id: 'cat-other-inc',
    name: 'Other Income',
    type: 'income',
    icon: 'Coins',
    color: '#10b981',
    group: 'General & Other',
    description: 'Gifts, refunds, cashbacks, grants, and miscellaneous',
  },
];

export const CATEGORY_GROUPS = [
  'Living & Housing',
  'Food & Dining',
  'Transportation',
  'Lifestyle & Fun',
  'Wellness & Health',
  'Growth & Education',
  'Financial & Work',
  'General & Other',
  'Custom',
];

interface CategoryContextType {
  categories: CategoryItem[];
  expenseCategories: CategoryItem[];
  incomeCategories: CategoryItem[];
  addCategory: (category: Omit<CategoryItem, 'id'>) => Promise<CategoryItem>;
  updateCategory: (id: string, updatedCategory: Partial<CategoryItem>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryByName: (name: string, type?: TransactionType) => CategoryItem | undefined;
  getCategoryColor: (name: string) => string;
  getCategoryIconName: (name: string) => string;
  resetToDefaults: () => Promise<void>;
  isLoading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getStorageKey = useCallback(
    (uid?: string) => (uid ? `spendly_${uid}_categories` : 'spendly_guest_categories'),
    []
  );

  // Load from local cache and subscribe to Firestore
  useEffect(() => {
    if (authLoading) return;

    const storageKey = getStorageKey(currentUser?.uid);

    // Initial cache load
    try {
      const cached = window.localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch {
      setCategories(DEFAULT_CATEGORIES);
    }

    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Subscribe to user Firestore categories
    const unsubscribe = subscribeToFirestoreCategories(
      currentUser.uid,
      (customCategories) => {
        const customNames = new Set(customCategories.map((c) => c.name.toLowerCase()));
        const merged = [
          ...customCategories,
          ...DEFAULT_CATEGORIES.filter((def) => !customNames.has(def.name.toLowerCase())),
        ];

        setCategories(merged);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(merged));
        } catch (e) {
          console.warn('[CategoryContext] Cache save error:', e);
        }
        setIsLoading(false);
      },
      (err) => {
        console.warn('[CategoryContext] Firestore subscription error:', err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, authLoading, getStorageKey]);

  // Action: Add new custom category
  const addCategory = useCallback(
    async (catInput: Omit<CategoryItem, 'id'>): Promise<CategoryItem> => {
      const newCategory: CategoryItem = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: catInput.name.trim(),
        type: catInput.type,
        icon: catInput.icon || 'Package',
        color: catInput.color || '#8e8bf5',
        group: catInput.group || 'Custom',
        isCustom: true,
        description: catInput.description?.trim() || '',
        createdAt: new Date().toISOString(),
      };

      if (currentUser) {
        try {
          await saveCategoryToFirestore(currentUser.uid, newCategory);
        } catch (err) {
          console.error('[CategoryContext] Cloud save error:', err);
          throw err;
        }
      }

      setCategories((prev) => {
        const next = [newCategory, ...prev];
        const storageKey = getStorageKey(currentUser?.uid);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (e) {
          console.warn('[CategoryContext] Cache write error:', e);
        }
        return next;
      });

      return newCategory;
    },
    [currentUser, getStorageKey]
  );

  // Action: Update category
  const updateCategory = useCallback(
    async (id: string, updatedCategory: Partial<CategoryItem>): Promise<void> => {
      const target = categories.find((c) => c.id === id);
      const merged: CategoryItem = {
        id,
        name: updatedCategory.name !== undefined ? updatedCategory.name.trim() : (target?.name || ''),
        type: updatedCategory.type || target?.type || 'expense',
        icon: updatedCategory.icon || target?.icon || 'Package',
        color: updatedCategory.color || target?.color || '#8e8bf5',
        group: updatedCategory.group || target?.group || 'Custom',
        isCustom: updatedCategory.isCustom !== undefined ? updatedCategory.isCustom : (target?.isCustom ?? true),
        description: updatedCategory.description !== undefined ? updatedCategory.description.trim() : (target?.description || ''),
        createdAt: target?.createdAt || new Date().toISOString(),
      };

      if (currentUser) {
        try {
          await saveCategoryToFirestore(currentUser.uid, merged);
        } catch (err) {
          console.error('[CategoryContext] Cloud update error:', err);
          throw err;
        }
      }

      setCategories((prev) => {
        const next = prev.map((cat) => (cat.id === id ? { ...cat, ...updatedCategory } : cat));
        const storageKey = getStorageKey(currentUser?.uid);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (e) {
          console.warn('[CategoryContext] Cache write error:', e);
        }
        return next;
      });
    },
    [currentUser, categories, getStorageKey]
  );

  // Action: Delete category
  const deleteCategory = useCallback(
    async (id: string): Promise<void> => {
      if (currentUser) {
        try {
          await deleteCategoryFromFirestore(currentUser.uid, id);
        } catch (err) {
          console.error('[CategoryContext] Cloud delete error:', err);
          throw err;
        }
      }

      setCategories((prev) => {
        const next = prev.filter((cat) => cat.id !== id);
        const storageKey = getStorageKey(currentUser?.uid);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (e) {
          console.warn('[CategoryContext] Cache write error:', e);
        }
        return next;
      });
    },
    [currentUser, getStorageKey]
  );

  // Action: Reset to defaults
  const resetToDefaults = useCallback(async (): Promise<void> => {
    setCategories(DEFAULT_CATEGORIES);
    const storageKey = getStorageKey(currentUser?.uid);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(DEFAULT_CATEGORIES));
    } catch (e) {
      console.warn('[CategoryContext] Cache write error:', e);
    }
  }, [currentUser, getStorageKey]);

  // Helpers
  const getCategoryByName = useCallback(
    (name: string, type?: TransactionType) => {
      const cleanName = (name || '').trim().toLowerCase();
      return categories.find((c) => {
        const matchName = c.name.toLowerCase() === cleanName;
        return type ? matchName && c.type === type : matchName;
      });
    },
    [categories]
  );

  const getCategoryColor = useCallback(
    (name: string) => {
      const match = getCategoryByName(name);
      return match?.color || '#94a3b8';
    },
    [getCategoryByName]
  );

  const getCategoryIconName = useCallback(
    (name: string) => {
      const match = getCategoryByName(name);
      return match?.icon || 'Package';
    },
    [getCategoryByName]
  );

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories]
  );

  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === 'income'),
    [categories]
  );

  return (
    <CategoryContext.Provider
      value={{
        categories,
        expenseCategories,
        incomeCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryByName,
        getCategoryColor,
        getCategoryIconName,
        resetToDefaults,
        isLoading,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
