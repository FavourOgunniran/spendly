import { CurrencyCode, CurrencyInfo } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    flag: '🇳🇬',
    locale: 'en-NG',
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    locale: 'en-US',
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    locale: 'en-GB',
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    locale: 'de-DE',
  },
];

export const CURRENCY_MAP: Record<CurrencyCode, CurrencyInfo> = SUPPORTED_CURRENCIES.reduce(
  (acc, curr) => {
    acc[curr.code] = curr;
    return acc;
  },
  {} as Record<CurrencyCode, CurrencyInfo>
);

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour for live rates
const IN_FLIGHT_REQUESTS = new Map<string, Promise<Record<string, number>>>();

// Fallback baseline rates relative to USD if network is offline
export const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  NGN: 1346.48,
  EUR: 0.856,
  GBP: 0.7337,
};

interface CacheEntry {
  timestamp: number;
  rates: Record<string, number>;
}

const getCacheKey = (base: string, date?: string) =>
  `spendly_fx_rates_${base}_${date || 'latest'}`;

/**
 * Fetch latest or historical exchange rates from Frankfurter API v2.
 * Supports NGN, USD, GBP, EUR with in-flight deduplication and local storage caching.
 */
export const fetchExchangeRates = async (
  base: string = 'USD',
  date?: string
): Promise<Record<string, number>> => {
  const cacheKey = getCacheKey(base, date);

  // 1. Check local cache
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) {
        const entry: CacheEntry = JSON.parse(cached);
        const isHistorical = !!date;
        const isExpired = Date.now() - entry.timestamp > CACHE_TTL_MS;

        // Historical rates never expire; latest rates expire after CACHE_TTL_MS
        if (isHistorical || !isExpired) {
          return entry.rates;
        }
      }
    } catch (err) {
      console.warn('[CurrencyService] Error reading FX cache:', err);
    }
  }

  // 2. Prevent redundant in-flight API requests
  if (IN_FLIGHT_REQUESTS.has(cacheKey)) {
    return IN_FLIGHT_REQUESTS.get(cacheKey)!;
  }

  const quotesParam = SUPPORTED_CURRENCIES.map((c) => c.code).join(',');
  const url = date
    ? `https://api.frankfurter.dev/v2/rates?base=${encodeURIComponent(
        base
      )}&quotes=${quotesParam}&date=${encodeURIComponent(date)}`
    : `https://api.frankfurter.dev/v2/rates?base=${encodeURIComponent(
        base
      )}&quotes=${quotesParam}`;

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Frankfurter API returned status: ${response.status}`);
      }

      const data = await response.json();
      const rates: Record<string, number> = { [base]: 1.0 };

      if (Array.isArray(data)) {
        data.forEach((item: { quote: string; rate: number }) => {
          if (item.quote && typeof item.rate === 'number') {
            rates[item.quote] = item.rate;
          }
        });
      } else if (data && typeof data.rates === 'object') {
        Object.assign(rates, data.rates);
      }

      // Ensure all supported currencies have at least a rate
      SUPPORTED_CURRENCIES.forEach((c) => {
        if (typeof rates[c.code] !== 'number') {
          rates[c.code] = FALLBACK_RATES[c.code] || 1.0;
        }
      });

      // Save to cache
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const cacheEntry: CacheEntry = {
            timestamp: Date.now(),
            rates,
          };
          window.localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
        } catch (err) {
          console.warn('[CurrencyService] Error saving FX cache:', err);
        }
      }

      return rates;
    } catch (err) {
      console.warn(
        `[CurrencyService] Frankfurter API fetch failed for ${base} (${date || 'latest'}), using fallback:`,
        err
      );

      // Return existing cached rates if available even if expired
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const staleCached = window.localStorage.getItem(cacheKey);
          if (staleCached) {
            return (JSON.parse(staleCached) as CacheEntry).rates;
          }
        } catch (e) {
          // ignore
        }
      }

      return FALLBACK_RATES;
    } finally {
      IN_FLIGHT_REQUESTS.delete(cacheKey);
    }
  })();

  IN_FLIGHT_REQUESTS.set(cacheKey, fetchPromise);
  return fetchPromise;
};

/**
 * Converts an amount from one currency to another using the provided rates dictionary (USD-based).
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string = 'NGN',
  toCurrency: string = 'NGN',
  rates: Record<string, number> = FALLBACK_RATES
): number => {
  const cleanAmount = Number(amount) || 0;
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  if (from === to || cleanAmount === 0) {
    return cleanAmount;
  }

  const fromRate = rates[from] || FALLBACK_RATES[from] || 1.0;
  const toRate = rates[to] || FALLBACK_RATES[to] || 1.0;

  // Convert from currency -> USD -> to currency
  const amountInUSD = cleanAmount / fromRate;
  const converted = amountInUSD * toRate;

  return Number(converted.toFixed(2));
};

/**
 * Gets the exchange rate multiplier from one currency to another.
 */
export const getExchangeRate = (
  fromCurrency: string = 'USD',
  toCurrency: string = 'NGN',
  rates: Record<string, number> = FALLBACK_RATES
): number => {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  if (from === to) return 1.0;

  const fromRate = rates[from] || FALLBACK_RATES[from] || 1.0;
  const toRate = rates[to] || FALLBACK_RATES[to] || 1.0;

  return toRate / fromRate;
};
