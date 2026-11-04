import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  Transaction,
  NewTransactionInput,
  TransactionSummary,
  CurrencyCode,
} from '../types';
import { useAuth } from './AuthContext';
import { useCurrency } from './CurrencyContext';
import { auth } from '../firebase';
import {
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  subscribeToFirestoreTransactions,
} from '../services/firebaseService';

export interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (transaction: NewTransactionInput) => Promise<Transaction>;
  updateTransaction: (id: string, transaction: NewTransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  summary: TransactionSummary;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { preferredCurrency, rates, convert, getRate } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to get user-specific localStorage key
  const getUserStorageKey = useCallback(
    (uid?: string | null) => (uid ? `spendly_${uid}_transactions` : 'spendly_guest_transactions'),
    []
  );

  // Helper to sort transactions descending by date, with createdAt / id as secondary tie-breaker
  const sortTransactions = useCallback((list: Transaction[]): Transaction[] => {
    return [...list].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (createdB !== createdA) return createdB - createdA;
      return b.id.localeCompare(a.id);
    });
  }, []);

  // Listen for user changes and synchronize user-isolated transactions
  useEffect(() => {
    if (authLoading) return;

    const storageKey = getUserStorageKey(currentUser?.uid);

    // 1. First, load immediate local cache for this specific user or guest session
    try {
      const cached = window.localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const mapped: Transaction[] = parsed.map((tx: Transaction) => ({
            id: tx.id,
            title: tx.title || '',
            amount: Number(tx.amount) || 0,
            currency: tx.currency || 'NGN',
            type: tx.type === 'income' ? 'income' : 'expense',
            category: tx.category || (tx.type === 'income' ? 'Salary' : 'Other'),
            date: tx.date || new Date().toISOString().split('T')[0],
            description: tx.description || undefined,
            notes: tx.notes || tx.description || undefined,
            isRecurring: !!tx.isRecurring,
            recurringInterval: tx.recurringInterval || undefined,
            exchangeRate: typeof tx.exchangeRate === 'number' ? tx.exchangeRate : undefined,
            convertedCurrency: tx.convertedCurrency || undefined,
            convertedAmount: typeof tx.convertedAmount === 'number' ? tx.convertedAmount : undefined,
            createdAt: tx.createdAt || undefined,
            updatedAt: tx.updatedAt || undefined,
          }));
          setTransactions(sortTransactions(mapped));
        }
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.warn('[TransactionContext] Error reading cached user transactions:', err);
      setTransactions([]);
    }

    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const userId = currentUser.uid;
    setIsLoading(true);

    // 2. Subscribe to real-time user-isolated Firestore collection: users/{userId}/transactions
    const unsubscribe = subscribeToFirestoreTransactions(
      userId,
      (firestoreTransactions) => {
        const sorted = sortTransactions(firestoreTransactions);
        setTransactions(sorted);
        setIsLoading(false);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(sorted));
        } catch (e) {
          console.warn('[TransactionContext] Error caching transactions:', e);
        }
      },
      (err) => {
        console.warn('[TransactionContext] Firestore subscription notice:', err);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser, authLoading, getUserStorageKey, sortTransactions]);

  // Action: Add new transaction with multi-currency tracking & historical exchange rate snapshot
  const addTransaction = useCallback(
    async (newTx: NewTransactionInput): Promise<Transaction> => {
      console.log('[TransactionContext] Step 1: addTransaction starting...', newTx);
      const txCurrency: CurrencyCode = newTx.currency || preferredCurrency || 'NGN';
      const rawAmount = Number(newTx.amount) || 0;

      let rateSnapshot: number | undefined;
      let convertedSnapshot: number | undefined;

      try {
        rateSnapshot = getRate(txCurrency, preferredCurrency);
        convertedSnapshot = convert(rawAmount, txCurrency, preferredCurrency);
      } catch (fxErr) {
        console.warn('[TransactionContext] FX conversion warning (non-fatal):', fxErr);
      }

      const nowIso = new Date().toISOString();
      const transaction: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: newTx.title.trim(),
        amount: rawAmount,
        currency: txCurrency,
        type: newTx.type,
        category: newTx.category || (newTx.type === 'income' ? 'Salary' : 'Other'),
        date: newTx.date || nowIso.split('T')[0],
        description: newTx.description?.trim() || undefined,
        notes: newTx.notes?.trim() || newTx.description?.trim() || undefined,
        isRecurring: !!newTx.isRecurring,
        recurringInterval: newTx.recurringInterval || undefined,
        exchangeRate: typeof rateSnapshot === 'number' && !isNaN(rateSnapshot) ? rateSnapshot : undefined,
        convertedCurrency: preferredCurrency,
        convertedAmount: typeof convertedSnapshot === 'number' && !isNaN(convertedSnapshot) ? convertedSnapshot : undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      console.log('[TransactionContext] Step 2: Formatted transaction payload ready:', transaction);

      // STEP 1: AUTHENTICATION CHECK
      const activeUser = currentUser || auth.currentUser;
      if (!activeUser || !activeUser.uid) {
        throw new Error('Authentication required: You must be signed in to create a transaction.');
      }
      const userId = activeUser.uid;

      // STEP 2: DATABASE SAVE (Determine whether the transaction was successfully written to Firebase/Firestore)
      try {
        console.log('[TransactionContext] Step 3: Saving to Firestore for user:', userId);
        await saveTransactionToFirestore(userId, transaction);
        console.log('[TransactionContext] Step 4: Firestore save confirmed for tx:', transaction.id);
      } catch (cloudErr) {
        console.error('[TransactionContext] Firestore write error:', cloudErr);
        throw cloudErr;
      }

      // STEP 3: UI & STATE REFRESH (Local state & local cache update)
      // Isolated in try/catch so secondary storage/refresh errors never cause a successful database write to be marked as failed!
      try {
        const storageKey = getUserStorageKey(userId);
        setTransactions((prev) => {
          if (prev.some((t) => t.id === transaction.id)) {
            return prev;
          }
          const updated = sortTransactions([transaction, ...prev]);
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch (e) {
            console.warn('[TransactionContext] Cache update warning:', e);
          }
          return updated;
        });
      } catch (stateErr) {
        console.warn('[TransactionContext] Non-fatal state update warning:', stateErr);
      }

      console.log('[TransactionContext] Step 5: Database save and state refresh completed successfully');
      return transaction;
    },
    [currentUser, preferredCurrency, getRate, convert, getUserStorageKey, sortTransactions]
  );

  // Action: Update existing transaction
  const updateTransaction = useCallback(
    async (id: string, updatedTx: NewTransactionInput): Promise<void> => {
      console.log('[TransactionContext] Step 1: updateTransaction starting for id:', id);
      const txCurrency: CurrencyCode = updatedTx.currency || preferredCurrency || 'NGN';
      const rawAmount = Number(updatedTx.amount) || 0;

      let rateSnapshot: number | undefined;
      let convertedSnapshot: number | undefined;

      try {
        rateSnapshot = getRate(txCurrency, preferredCurrency);
        convertedSnapshot = convert(rawAmount, txCurrency, preferredCurrency);
      } catch (fxErr) {
        console.warn('[TransactionContext] FX conversion warning (non-fatal):', fxErr);
      }

      const nowIso = new Date().toISOString();
      const updatedTransaction: Transaction = {
        ...updatedTx,
        id,
        title: updatedTx.title.trim(),
        amount: rawAmount,
        currency: txCurrency,
        type: updatedTx.type,
        category: updatedTx.category || (updatedTx.type === 'income' ? 'Salary' : 'Other'),
        date: updatedTx.date || nowIso.split('T')[0],
        description: updatedTx.description?.trim() || undefined,
        notes: updatedTx.notes?.trim() || updatedTx.description?.trim() || undefined,
        isRecurring: !!updatedTx.isRecurring,
        recurringInterval: updatedTx.recurringInterval || undefined,
        exchangeRate: typeof rateSnapshot === 'number' && !isNaN(rateSnapshot) ? rateSnapshot : undefined,
        convertedCurrency: preferredCurrency,
        convertedAmount: typeof convertedSnapshot === 'number' && !isNaN(convertedSnapshot) ? convertedSnapshot : undefined,
        updatedAt: nowIso,
      };

      // STEP 1: AUTHENTICATION CHECK
      const activeUser = currentUser || auth.currentUser;
      if (!activeUser || !activeUser.uid) {
        throw new Error('Authentication required: You must be signed in to update a transaction.');
      }
      const userId = activeUser.uid;

      // STEP 2: DATABASE SAVE (Determine whether the transaction was successfully updated in Firebase/Firestore)
      try {
        console.log('[TransactionContext] Step 2: Updating in Firestore for user:', userId);
        await saveTransactionToFirestore(userId, updatedTransaction);
        console.log('[TransactionContext] Step 3: Firestore update confirmed for tx:', id);
      } catch (cloudErr) {
        console.error('[TransactionContext] Firestore update error:', cloudErr);
        throw cloudErr;
      }

      // STEP 3: UI & STATE REFRESH (Local state & local cache update)
      // Isolated in try/catch so secondary storage/refresh errors never cause a successful database write to be marked as failed!
      try {
        const storageKey = getUserStorageKey(userId);
        setTransactions((prev) => {
          const updated = sortTransactions(prev.map((tx) => (tx.id === id ? updatedTransaction : tx)));
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch (e) {
            console.warn('[TransactionContext] Cache update warning:', e);
          }
          return updated;
        });
      } catch (stateErr) {
        console.warn('[TransactionContext] Non-fatal state update warning:', stateErr);
      }
    },
    [currentUser, preferredCurrency, getRate, convert, getUserStorageKey, sortTransactions]
  );

  // Action: Delete transaction
  const deleteTransaction = useCallback(
    async (id: string): Promise<void> => {
      const activeUser = currentUser || auth.currentUser;
      const userId = activeUser?.uid;

      // 1. Immediately update local state & local cache
      const storageKey = getUserStorageKey(userId);
      setTransactions((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.warn('[TransactionContext] Cache delete error:', e);
        }
        return updated;
      });

      // 2. Delete from Firestore if user is authenticated
      if (userId) {
        try {
          await deleteTransactionFromFirestore(userId, id);
        } catch (cloudErr) {
          console.error('[TransactionContext] Firestore delete error:', cloudErr);
          throw cloudErr;
        }
      }
    },
    [currentUser, getUserStorageKey]
  );

  // Summary Metrics dynamically normalized in preferredCurrency
  const summary: TransactionSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((tx) => {
      const txCurr = tx.currency || 'NGN';
      let normalizedAmount = tx.amount;

      if (txCurr.toUpperCase() !== preferredCurrency.toUpperCase()) {
        try {
          normalizedAmount = convert(tx.amount, txCurr, preferredCurrency);
        } catch {
          normalizedAmount = tx.amount;
        }
      }

      if (tx.type === 'income') {
        totalIncome += normalizedAmount;
      } else {
        totalExpenses += normalizedAmount;
      }
    });

    const totalBalance = totalIncome - totalExpenses;
    const savingsRate =
      totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

    return {
      totalIncome,
      totalExpenses,
      totalBalance,
      savingsRate,
    };
  }, [transactions, preferredCurrency, rates, convert]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        summary,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
