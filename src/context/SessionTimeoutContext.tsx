import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import {
  DEFAULT_SESSION_TIMEOUT_MS,
  DEFAULT_WARNING_BEFORE_TIMEOUT_MS,
  ACTIVITY_THROTTLE_MS,
  SESSION_CHECK_INTERVAL_MS,
  SESSION_STORAGE_KEYS,
  SESSION_BROADCAST_CHANNEL_NAME,
  getConfiguredSessionTimeout,
} from '../config/sessionConfig';

export interface SessionTimeoutContextType {
  isWarningOpen: boolean;
  remainingMs: number;
  totalWarningMs: number;
  timeoutDurationMs: number;
  lastActivityTimestamp: number;
  stayLoggedIn: () => void;
  logoutDueToInactivity: () => Promise<void>;
  updateTimeoutDuration: (newTimeoutMs: number, newWarningBeforeMs?: number) => void;
  resetTimeoutToDefault: () => void;
  simulateWarning: () => void;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

export const SessionTimeoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { info } = useToast();

  // Active configuration
  const [timeoutDurationMs, setTimeoutDurationMsState] = useState<number>(getConfiguredSessionTimeout);
  const [warningBeforeMs, setWarningBeforeMs] = useState<number>(() => {
    const currentTimeout = getConfiguredSessionTimeout();
    if (currentTimeout <= 60 * 1000) {
      return Math.floor(currentTimeout * 0.5); // 50% for quick dev tests
    }
    return DEFAULT_WARNING_BEFORE_TIMEOUT_MS;
  });

  const [isWarningOpen, setIsWarningOpen] = useState<boolean>(false);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [lastActivityTimestamp, setLastActivityTimestamp] = useState<number>(() => {
    try {
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEYS.LAST_ACTIVITY);
      if (stored) {
        const val = parseInt(stored, 10);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch {
      // Ignore
    }
    return Date.now();
  });

  // Mutable refs to prevent stale closure traps in listeners and timers
  const timeoutDurationRef = useRef<number>(timeoutDurationMs);
  timeoutDurationRef.current = timeoutDurationMs;

  const warningBeforeRef = useRef<number>(warningBeforeMs);
  warningBeforeRef.current = warningBeforeMs;

  const lastActivityRef = useRef<number>(lastActivityTimestamp);
  lastActivityRef.current = lastActivityTimestamp;

  const isLoggingOutRef = useRef<boolean>(false);
  const lastEventThrottleRef = useRef<number>(0);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Helper: Warning threshold is the elapsed inactivity duration at which the warning appears
  const getWarningThreshold = useCallback(() => {
    return Math.max(1000, timeoutDurationRef.current - warningBeforeRef.current);
  }, []);

  // Set up BroadcastChannel for instant multi-tab communication
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel(SESSION_BROADCAST_CHANNEL_NAME);
        broadcastChannelRef.current = channel;

        channel.onmessage = (event) => {
          const { type, timestamp } = event.data || {};
          if (type === 'USER_ACTIVITY' && typeof timestamp === 'number') {
            handleExternalActivity(timestamp);
          } else if (type === 'SESSION_LOGOUT') {
            handleExternalLogout();
          }
        };

        return () => {
          channel.close();
          broadcastChannelRef.current = null;
        };
      } catch (err) {
        console.warn('[SessionTimeout] BroadcastChannel unavailable, using storage events:', err);
      }
    }
  }, []);

  // Update last activity both in-memory and in localStorage (throttled)
  const recordActivity = useCallback((forced = false) => {
    if (!currentUser || isLoggingOutRef.current) return;

    const now = Date.now();
    if (!forced && now - lastEventThrottleRef.current < ACTIVITY_THROTTLE_MS) {
      return;
    }

    lastEventThrottleRef.current = now;
    lastActivityRef.current = now;
    setLastActivityTimestamp(now);

    try {
      window.localStorage.setItem(SESSION_STORAGE_KEYS.LAST_ACTIVITY, String(now));
    } catch {
      // Storage might be restricted
    }

    // Dismiss warning if user performed active interaction
    setIsWarningOpen((prev) => {
      if (prev) {
        return false;
      }
      return prev;
    });

    // Notify other tabs via BroadcastChannel
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'USER_ACTIVITY',
          timestamp: now,
        });
      } catch {
        // Ignore broadcast failure
      }
    }
  }, [currentUser]);

  // Handle external activity detected from another open tab
  const handleExternalActivity = useCallback((remoteTimestamp: number) => {
    if (remoteTimestamp > lastActivityRef.current) {
      lastActivityRef.current = remoteTimestamp;
      setLastActivityTimestamp(remoteTimestamp);
      setIsWarningOpen(false);
    }
  }, []);

  // Perform safe automatic sign-out
  const logoutDueToInactivity = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    setIsWarningOpen(false);

    try {
      // Set notice in sessionStorage and localStorage for the login page banner
      window.sessionStorage.setItem(SESSION_STORAGE_KEYS.INACTIVITY_NOTICE, 'true');
      window.localStorage.setItem(SESSION_STORAGE_KEYS.INACTIVITY_NOTICE, 'true');

      // Clear session activity markers
      window.localStorage.removeItem(SESSION_STORAGE_KEYS.LAST_ACTIVITY);

      // Broadcast logout event to other tabs
      const logoutPayload = { type: 'SESSION_LOGOUT', timestamp: Date.now() };
      try {
        window.localStorage.setItem(SESSION_STORAGE_KEYS.LOGOUT_EVENT, JSON.stringify(logoutPayload));
      } catch {
        // Ignore
      }

      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage(logoutPayload);
        } catch {
          // Ignore
        }
      }

      // Safe Firebase sign-out (preserves all Firestore data)
      await logout();

      // Clear the volatile cross-tab trigger
      window.localStorage.removeItem(SESSION_STORAGE_KEYS.LOGOUT_EVENT);
    } catch (error) {
      console.error('[SessionTimeout] Error during automatic inactivity logout:', error);
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [logout]);

  // Handle external logout triggered from another tab
  const handleExternalLogout = useCallback(async () => {
    if (isLoggingOutRef.current || !currentUser) return;
    isLoggingOutRef.current = true;
    setIsWarningOpen(false);

    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEYS.INACTIVITY_NOTICE, 'true');
      await logout();
    } catch (err) {
      console.warn('[SessionTimeout] Error syncing external logout:', err);
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [currentUser, logout]);

  // Manual reset from "Stay Logged In" button
  const stayLoggedIn = useCallback(() => {
    recordActivity(true);
    info('Session Extended', 'Your session has been renewed.', { priority: 'low' });
  }, [recordActivity, info]);

  // Cross-tab storage listener (supports browsers without BroadcastChannel and secondary tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_STORAGE_KEYS.LAST_ACTIVITY && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10);
        if (!isNaN(remoteTime)) {
          handleExternalActivity(remoteTime);
        }
      } else if (e.key === SESSION_STORAGE_KEYS.LOGOUT_EVENT && e.newValue) {
        handleExternalLogout();
      } else if (e.key === SESSION_STORAGE_KEYS.CUSTOM_TIMEOUT && e.newValue) {
        const newTimeout = parseInt(e.newValue, 10);
        if (!isNaN(newTimeout) && newTimeout >= 10000) {
          setTimeoutDurationMsState(newTimeout);
          setWarningBeforeMs(newTimeout <= 60000 ? Math.floor(newTimeout * 0.5) : DEFAULT_WARNING_BEFORE_TIMEOUT_MS);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [handleExternalActivity, handleExternalLogout]);

  // Core inactivity evaluation check
  const evaluateInactivity = useCallback(() => {
    if (!currentUser || isLoggingOutRef.current) return;

    // Check localStorage first to catch up with any other tab's latest activity
    let latestActivity = lastActivityRef.current;
    try {
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEYS.LAST_ACTIVITY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > latestActivity) {
          latestActivity = parsed;
          lastActivityRef.current = parsed;
          setLastActivityTimestamp(parsed);
        }
      }
    } catch {
      // Ignore
    }

    const now = Date.now();
    const elapsed = now - latestActivity;
    const timeout = timeoutDurationRef.current;
    const warningThreshold = getWarningThreshold();

    if (elapsed >= timeout) {
      // Timeout has expired! Auto-logout
      logoutDueToInactivity();
    } else if (elapsed >= warningThreshold) {
      // In warning threshold: show modal and calculate countdown
      const remaining = Math.max(0, timeout - elapsed);
      setRemainingMs(remaining);
      setIsWarningOpen(true);
    } else {
      // Within safe active window
      setIsWarningOpen(false);
    }
  }, [currentUser, getWarningThreshold, logoutDueToInactivity]);

  // Heartbeat check interval
  useEffect(() => {
    if (!currentUser) {
      setIsWarningOpen(false);
      return;
    }

    // Initialize or record initial activity if not present
    recordActivity(true);

    const interval = setInterval(() => {
      evaluateInactivity();
    }, SESSION_CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [currentUser, evaluateInactivity, recordActivity]);

  // Document visibility and Window focus handling (handles tab switching & sleep/restore)
  useEffect(() => {
    if (!currentUser) return;

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        // Tab brought back into view: immediately re-evaluate elapsed inactivity
        evaluateInactivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [currentUser, evaluateInactivity]);

  // User input activity listeners (mouse, keyboard, touch, scroll)
  useEffect(() => {
    if (!currentUser) return;

    const onUserAction = () => {
      recordActivity(false);
    };

    const eventNames: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'wheel',
    ];

    eventNames.forEach((name) => {
      window.addEventListener(name, onUserAction, { passive: true });
    });

    // Window scroll
    window.addEventListener('scroll', onUserAction, { passive: true });

    return () => {
      eventNames.forEach((name) => {
        window.removeEventListener(name, onUserAction);
      });
      window.removeEventListener('scroll', onUserAction);
    };
  }, [currentUser, recordActivity]);

  // Update timeout configuration
  const updateTimeoutDuration = useCallback((newTimeoutMs: number, customWarningBeforeMs?: number) => {
    const validTimeout = Math.max(10000, newTimeoutMs); // Minimum 10 seconds
    const validWarning = customWarningBeforeMs
      ? Math.min(validTimeout - 1000, customWarningBeforeMs)
      : validTimeout <= 60000
      ? Math.floor(validTimeout * 0.5)
      : DEFAULT_WARNING_BEFORE_TIMEOUT_MS;

    setTimeoutDurationMsState(validTimeout);
    setWarningBeforeMs(validWarning);

    try {
      window.localStorage.setItem(SESSION_STORAGE_KEYS.CUSTOM_TIMEOUT, String(validTimeout));
    } catch {
      // Ignore
    }

    recordActivity(true);
  }, [recordActivity]);

  // Reset to default production config (30 minutes)
  const resetTimeoutToDefault = useCallback(() => {
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEYS.CUSTOM_TIMEOUT);
    } catch {
      // Ignore
    }
    setTimeoutDurationMsState(DEFAULT_SESSION_TIMEOUT_MS);
    setWarningBeforeMs(DEFAULT_WARNING_BEFORE_TIMEOUT_MS);
    recordActivity(true);
  }, [recordActivity]);

  // Dev simulation helper: triggers the warning modal with remaining seconds
  const simulateWarning = useCallback(() => {
    if (!currentUser) return;
    const mockRemaining = warningBeforeRef.current || 30000;
    setRemainingMs(mockRemaining);
    setIsWarningOpen(true);
  }, [currentUser]);

  return (
    <SessionTimeoutContext.Provider
      value={{
        isWarningOpen,
        remainingMs,
        totalWarningMs: warningBeforeMs,
        timeoutDurationMs,
        lastActivityTimestamp,
        stayLoggedIn,
        logoutDueToInactivity,
        updateTimeoutDuration,
        resetTimeoutToDefault,
        simulateWarning,
      }}
    >
      {children}
    </SessionTimeoutContext.Provider>
  );
};

export const useSessionTimeout = (): SessionTimeoutContextType => {
  const context = useContext(SessionTimeoutContext);
  if (!context) {
    throw new Error('useSessionTimeout must be used within a SessionTimeoutProvider');
  }
  return context;
};
