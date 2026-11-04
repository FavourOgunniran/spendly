import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { CurrencyCode, CurrencyInfo } from '../types';
import {
  SUPPORTED_CURRENCIES,
  CURRENCY_MAP,
  FALLBACK_RATES,
  fetchExchangeRates,
  convertCurrency,
  getExchangeRate,
} from '../services/currencyService';
import { formatCurrency as formatCurrencyUtil } from '../utils/currencyFormatter';
import { useAuth } from './AuthContext';
import {
  saveUserPreferredCurrency,
  subscribeToUserProfile,
} from '../services/firebaseService';

interface CurrencyContextType {
  preferredCurrency: CurrencyCode;
  setPreferredCurrency: (currency: CurrencyCode) => Promise<void>;
  rates: Record<string, number>;
  isLoadingRates: boolean;
  error: string | null;
  supportedCurrencies: CurrencyInfo[];
  currentCurrencyInfo: CurrencyInfo;
  convert: (amount: number, fromCurrency?: string, toCurrency?: string) => number;
  getRate: (fromCurrency?: string, toCurrency?: string) => number;
  formatCurrency: (amount: number, currency?: CurrencyCode) => string;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const DEFAULT_CURRENCY: CurrencyCode = 'NGN';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [preferredCurrency, setPreferredCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getStorageKey = useCallback(
    (uid?: string) => (uid ? `spendly_${uid}_preferred_currency` : 'spendly_guest_preferred_currency'),
    []
  );

  // 1. Fetch live exchange rates from Frankfurter API on mount and periodically
  const loadRates = useCallback(async () => {
    setIsLoadingRates(true);
    setError(null);
    try {
      const fetchedRates = await fetchExchangeRates('USD');
      setRates(fetchedRates);
    } catch (err) {
      console.warn('[CurrencyContext] Could not fetch live Frankfurter rates:', err);
      setError('Live exchange rates temporarily unavailable, using cached rates.');
    } finally {
      setIsLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    loadRates();
    // Refresh exchange rates every 30 minutes
    const interval = setInterval(loadRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadRates]);

  // 2. Synchronize preferred currency with user authentication & Firestore
  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      // Guest / logged out: use cached guest currency or default to NGN
      try {
        const cachedGuest = window.localStorage.getItem(getStorageKey());
        setPreferredCurrencyState(cachedGuest || DEFAULT_CURRENCY);
      } catch (e) {
        setPreferredCurrencyState(DEFAULT_CURRENCY);
      }
      return;
    }

    const userId = currentUser.uid;
    const storageKey = getStorageKey(userId);

    // Immediate local cache lookup
    try {
      const cached = window.localStorage.getItem(storageKey);
      if (cached) {
        setPreferredCurrencyState(cached);
      } else {
        setPreferredCurrencyState(DEFAULT_CURRENCY);
      }
    } catch (e) {
      setPreferredCurrencyState(DEFAULT_CURRENCY);
    }

    // Subscribe to Firestore user profile for cloud-persisted preference
    const unsubscribe = subscribeToUserProfile(userId, (profile) => {
      if (profile?.preferredCurrency) {
        setPreferredCurrencyState(profile.preferredCurrency);
        try {
          window.localStorage.setItem(storageKey, profile.preferredCurrency);
        } catch (e) {
          // ignore
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser, authLoading, getStorageKey]);

  // 3. User action: Set preferred display currency
  const setPreferredCurrency = useCallback(
    async (newCurrency: CurrencyCode) => {
      const sanitized = (newCurrency || DEFAULT_CURRENCY).toUpperCase();
      setPreferredCurrencyState(sanitized);

      const storageKey = getStorageKey(currentUser?.uid);
      try {
        window.localStorage.setItem(storageKey, sanitized);
      } catch (e) {
        console.warn('[CurrencyContext] Cache save error:', e);
      }

      if (currentUser) {
        await saveUserPreferredCurrency(currentUser.uid, sanitized);
      }
    },
    [currentUser, getStorageKey]
  );

  // 4. Conversion helper function
  const convert = useCallback(
    (amount: number, fromCurrency: string = 'NGN', toCurrency?: string) => {
      const target = toCurrency || preferredCurrency;
      return convertCurrency(amount, fromCurrency, target, rates);
    },
    [preferredCurrency, rates]
  );

  // 5. Rate multiplier helper
  const getRate = useCallback(
    (fromCurrency: string = 'USD', toCurrency?: string) => {
      const target = toCurrency || preferredCurrency;
      return getExchangeRate(fromCurrency, target, rates);
    },
    [preferredCurrency, rates]
  );

  // 6. Formatting helper using user's preferred currency by default
  const formatCurrency = useCallback(
    (amount: number, currency?: CurrencyCode) => {
      const target = currency || preferredCurrency;
      return formatCurrencyUtil(amount, target);
    },
    [preferredCurrency]
  );

  const currentCurrencyInfo = useMemo(() => {
    return CURRENCY_MAP[preferredCurrency] || CURRENCY_MAP[DEFAULT_CURRENCY];
  }, [preferredCurrency]);

  return (
    <CurrencyContext.Provider
      value={{
        preferredCurrency,
        setPreferredCurrency,
        rates,
        isLoadingRates,
        error,
        supportedCurrencies: SUPPORTED_CURRENCIES,
        currentCurrencyInfo,
        convert,
        getRate,
        formatCurrency,
        refreshRates: loadRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
