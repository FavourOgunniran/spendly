/**
 * Session Inactivity Timeout Configuration
 * Default: 30 minutes of inactivity before automatic logout.
 * Warning displayed: 2 minutes before timeout (i.e. at 28 minutes of inactivity).
 */

// 30 minutes in milliseconds
export const DEFAULT_SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Warning starts 2 minutes before the full timeout expires
export const DEFAULT_WARNING_BEFORE_TIMEOUT_MS = 2 * 60 * 1000;

// Warning threshold: time of inactivity at which warning modal triggers (28 minutes)
export const DEFAULT_WARNING_THRESHOLD_MS = DEFAULT_SESSION_TIMEOUT_MS - DEFAULT_WARNING_BEFORE_TIMEOUT_MS;

// Minimum interval between activity event recordings to prevent high-frequency churn
export const ACTIVITY_THROTTLE_MS = 1000;

// Heartbeat check interval to reconcile time and update countdown
export const SESSION_CHECK_INTERVAL_MS = 1000;

// LocalStorage & SessionStorage keys
export const SESSION_STORAGE_KEYS = {
  LAST_ACTIVITY: 'spendly_last_activity_timestamp',
  LOGOUT_EVENT: 'spendly_session_logged_out_event',
  INACTIVITY_NOTICE: 'spendly_inactivity_logout_notice',
  CUSTOM_TIMEOUT: 'spendly_custom_session_timeout_ms',
} as const;

// BroadcastChannel name for multi-tab synchronization
export const SESSION_BROADCAST_CHANNEL_NAME = 'spendly_session_sync_channel';

// Presets for testing / demoing in settings or dev test bench
export const SESSION_TIMEOUT_PRESETS = [
  { label: '30 seconds (Dev Quick Test)', valueMs: 30 * 1000, warningBeforeMs: 15 * 1000 },
  { label: '1 minute (Dev Test)', valueMs: 60 * 1000, warningBeforeMs: 20 * 1000 },
  { label: '5 minutes (Short Session)', valueMs: 5 * 60 * 1000, warningBeforeMs: 60 * 1000 },
  { label: '15 minutes (Standard)', valueMs: 15 * 60 * 1000, warningBeforeMs: 2 * 60 * 1000 },
  { label: '30 minutes (Production Default)', valueMs: 30 * 60 * 1000, warningBeforeMs: 2 * 60 * 1000 },
  { label: '60 minutes (Extended)', valueMs: 60 * 60 * 1000, warningBeforeMs: 5 * 60 * 1000 },
] as const;

/**
 * Reads the configured timeout from storage or falls back to default 30 minutes.
 */
export const getConfiguredSessionTimeout = (): number => {
  try {
    const custom = window.localStorage.getItem(SESSION_STORAGE_KEYS.CUSTOM_TIMEOUT);
    if (custom) {
      const parsed = parseInt(custom, 10);
      if (!isNaN(parsed) && parsed >= 10000) {
        return parsed;
      }
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_SESSION_TIMEOUT_MS;
};

/**
 * Formats milliseconds into mm:ss format for the countdown modal
 */
export const formatRemainingTime = (ms: number): string => {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
