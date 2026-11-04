import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface NotificationAction {
  label: string;
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ToastOptions {
  priority?: NotificationPriority;
  duration?: number; // 0 or undefined for persistent high-priority overlays
  action?: NotificationAction;
  secondaryAction?: NotificationAction;
}

export interface Toast {
  id: string;
  type: ToastType;
  priority: NotificationPriority;
  title: string;
  message?: string;
  duration?: number;
  action?: NotificationAction;
  secondaryAction?: NotificationAction;
}

interface ToastContextType {
  showToast: (
    type: ToastType,
    title: string,
    message?: string,
    options?: ToastOptions | number
  ) => void;
  success: (
    title: string,
    message?: string,
    options?: ToastOptions | number
  ) => void;
  error: (
    title: string,
    message?: string,
    options?: ToastOptions | number
  ) => void;
  warning: (
    title: string,
    message?: string,
    options?: ToastOptions | number
  ) => void;
  info: (
    title: string,
    message?: string,
    options?: ToastOptions | number
  ) => void;
  critical: (
    title: string,
    message: string,
    options?: Omit<ToastOptions, 'priority'>
  ) => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const MAX_FLOATING_TOASTS = 2;
const DEFAULT_LOW_DURATION = 3500;
const DEFAULT_MEDIUM_DURATION = 4500;
const DEDUPE_WINDOW_MS = 1200;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const recentToastsRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (
      type: ToastType,
      title: string,
      message?: string,
      options?: ToastOptions | number
    ) => {
      const cleanTitle = title.trim();
      const cleanMessage = message ? message.trim() : '';

      // Normalize options argument (supports numeric duration for backward compatibility)
      let priority: NotificationPriority = 'medium';
      let duration: number | undefined;
      let action: NotificationAction | undefined;
      let secondaryAction: NotificationAction | undefined;

      if (typeof options === 'number') {
        duration = options;
        priority = type === 'error' ? 'high' : 'medium';
      } else if (options && typeof options === 'object') {
        priority = options.priority || (type === 'error' ? 'high' : 'medium');
        duration = options.duration;
        action = options.action;
        secondaryAction = options.secondaryAction;
      } else {
        priority = type === 'error' ? 'high' : 'medium';
      }

      // Compute default durations if not explicitly defined
      if (duration === undefined) {
        if (priority === 'low') {
          duration = DEFAULT_LOW_DURATION;
        } else if (priority === 'medium') {
          duration = DEFAULT_MEDIUM_DURATION;
        } else {
          // High-priority defaults to persistent (requires manual acknowledgment)
          duration = 0;
        }
      }

      const dedupeKey = `${type}:${priority}:${cleanTitle}:${cleanMessage}`;
      const now = Date.now();

      // De-duplication check: prevent duplicate alerts in rapid succession
      const lastFired = recentToastsRef.current.get(dedupeKey);
      if (lastFired && now - lastFired < DEDUPE_WINDOW_MS) {
        return;
      }
      recentToastsRef.current.set(dedupeKey, now);

      // Periodic garbage collection of dedupe map
      if (recentToastsRef.current.size > 25) {
        recentToastsRef.current.forEach((time, key) => {
          if (now - time > 5000) {
            recentToastsRef.current.delete(key);
          }
        });
      }

      const id = `toast-${now}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: Toast = {
        id,
        type,
        priority,
        title: cleanTitle,
        message: cleanMessage || undefined,
        duration,
        action,
        secondaryAction,
      };

      setToasts((prev) => {
        if (priority === 'high') {
          // Replace any existing high priority overlay or prepend
          const withoutHigh = prev.filter((t) => t.priority !== 'high');
          return [newToast, ...withoutHigh];
        }
        // Limit floating queue size
        const floating = prev.filter((t) => t.priority !== 'high');
        const highOnly = prev.filter((t) => t.priority === 'high');
        const nextFloating = [newToast, ...floating].slice(0, MAX_FLOATING_TOASTS);
        return [...highOnly, ...nextFloating];
      });

      // Auto dismiss if duration is set
      if (duration && duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const success = useCallback(
    (title: string, message?: string, options?: ToastOptions | number) =>
      showToast('success', title, message, options),
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, options?: ToastOptions | number) => {
      // Default errors to high priority unless explicitly specified
      const opts = typeof options === 'number' ? { duration: options, priority: 'high' as const } : { priority: 'high' as const, ...options };
      showToast('error', title, message, opts);
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string, options?: ToastOptions | number) =>
      showToast('warning', title, message, options),
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string, options?: ToastOptions | number) =>
      showToast('info', title, message, options),
    [showToast]
  );

  const critical = useCallback(
    (title: string, message: string, options?: Omit<ToastOptions, 'priority'>) =>
      showToast('error', title, message, { ...options, priority: 'high' }),
    [showToast]
  );

  // Split active notifications by tier
  const activeHighPriorityToast = toasts.find((t) => t.priority === 'high');
  const floatingToasts = toasts.filter((t) => t.priority !== 'high');

  // Handle escape key listener for active high-priority modal overlay
  useEffect(() => {
    if (!activeHighPriorityToast) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissToast(activeHighPriorityToast.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeHighPriorityToast, dismissToast]);

  const handleActionClick = (action: NotificationAction, toastId: string) => {
    dismissToast(toastId);
    if (action.onClick) {
      action.onClick();
    }
    if (action.to) {
      window.location.href = action.to;
    }
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success,
        error,
        warning,
        info,
        critical,
        dismissToast,
        clearAll,
      }}
    >
      {children}

      {/* ========================================================================= */}
      {/* 1. HIGH-PRIORITY CENTER-SCREEN MODAL OVERLAY (Financial alerts / Critical) */}
      {/* ========================================================================= */}
      {activeHighPriorityToast && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="priority-alert-title"
          aria-describedby="priority-alert-desc"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            className={clsx(
              'w-full max-w-md bg-white dark:bg-[#16171e] border rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 transition-all duration-200 animate-in zoom-in-95 slide-in-from-bottom-3',
              activeHighPriorityToast.type === 'error'
                ? 'border-rose-500/40 dark:border-rose-500/30 shadow-rose-950/20'
                : activeHighPriorityToast.type === 'warning'
                ? 'border-amber-500/40 dark:border-amber-500/30 shadow-amber-950/20'
                : 'border-indigo-500/40 dark:border-indigo-500/30 shadow-indigo-950/20'
            )}
          >
            {/* Header: Icon + Badge + Close */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm',
                    activeHighPriorityToast.type === 'error'
                      ? 'bg-rose-50 dark:bg-[#2c151a] text-rose-600 dark:text-[#f87171] border-rose-200 dark:border-rose-500/30'
                      : activeHighPriorityToast.type === 'warning'
                      ? 'bg-amber-50 dark:bg-[#2c2214] text-amber-600 dark:text-[#fbbf24] border-amber-200 dark:border-amber-500/30'
                      : 'bg-indigo-50 dark:bg-[#1a1c33] text-indigo-600 dark:text-[#8e8bf5] border-indigo-200 dark:border-indigo-500/30'
                  )}
                >
                  {activeHighPriorityToast.type === 'error' ? (
                    <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
                  ) : activeHighPriorityToast.type === 'warning' ? (
                    <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
                  ) : (
                    <Info className="w-6 h-6 stroke-[2.2]" />
                  )}
                </div>
                <div>
                  <span
                    className={clsx(
                      'text-[10.5px] font-black uppercase tracking-wider block',
                      activeHighPriorityToast.type === 'error'
                        ? 'text-rose-600 dark:text-[#f87171]'
                        : activeHighPriorityToast.type === 'warning'
                        ? 'text-amber-600 dark:text-[#fbbf24]'
                        : 'text-indigo-600 dark:text-[#8e8bf5]'
                    )}
                  >
                    Priority Alert
                  </span>
                  <h3
                    id="priority-alert-title"
                    className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight tracking-tight mt-0.5"
                  >
                    {activeHighPriorityToast.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(activeHighPriorityToast.id)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#20222a] transition-colors cursor-pointer"
                aria-label="Close priority alert"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Body Explanation */}
            {activeHighPriorityToast.message && (
              <p
                id="priority-alert-desc"
                className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed"
              >
                {activeHighPriorityToast.message}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-[#22242e]">
              {activeHighPriorityToast.secondaryAction ? (
                <button
                  type="button"
                  onClick={() =>
                    handleActionClick(
                      activeHighPriorityToast.secondaryAction!,
                      activeHighPriorityToast.id
                    )
                  }
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#20222a] border border-slate-200/80 dark:border-[#2a2d3a] transition-all cursor-pointer text-center"
                >
                  {activeHighPriorityToast.secondaryAction.label}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => dismissToast(activeHighPriorityToast.id)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#20222a] border border-slate-200/80 dark:border-[#2a2d3a] transition-all cursor-pointer text-center"
                >
                  Dismiss
                </button>
              )}

              {activeHighPriorityToast.action && (
                <button
                  type="button"
                  onClick={() =>
                    handleActionClick(
                      activeHighPriorityToast.action!,
                      activeHighPriorityToast.id
                    )
                  }
                  className={clsx(
                    'px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5',
                    activeHighPriorityToast.action.variant === 'danger' ||
                      activeHighPriorityToast.type === 'error'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-[#8e8bf5] dark:hover:bg-[#9e9bf8] text-white dark:text-[#16171e] shadow-indigo-600/20'
                  )}
                >
                  <span>{activeHighPriorityToast.action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FLOATING TOP TOASTS LAYER (LOW = Subtle, MEDIUM = Prominent Banner)     */}
      {/* ========================================================================= */}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2.5 max-w-md w-[calc(100vw-2rem)] pointer-events-none"
      >
        {floatingToasts.map((toast) => {
          const isLow = toast.priority === 'low';

          const Icon =
            toast.type === 'success'
              ? CheckCircle2
              : toast.type === 'error'
              ? AlertCircle
              : toast.type === 'warning'
              ? AlertTriangle
              : Info;

          if (isLow) {
            // ---------------- LOW PRIORITY (Subtle pill toast) ----------------
            return (
              <div
                key={toast.id}
                role="status"
                className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 bg-slate-900/90 dark:bg-[#1a1c24]/95 text-white border border-slate-700/60 dark:border-white/10 rounded-full shadow-lg backdrop-blur-md text-xs transition-all duration-200 animate-in fade-in slide-in-from-top-2"
              >
                <Icon
                  className={clsx(
                    'w-3.5 h-3.5 shrink-0',
                    toast.type === 'success' && 'text-emerald-400',
                    toast.type === 'error' && 'text-rose-400',
                    toast.type === 'warning' && 'text-amber-400',
                    toast.type === 'info' && 'text-indigo-400'
                  )}
                />
                <span className="font-semibold">{toast.title}</span>
                {toast.message && (
                  <span className="text-slate-300 font-normal truncate max-w-[200px]">
                    — {toast.message}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors ml-1 cursor-pointer"
                  aria-label="Dismiss"
                >
                  <X className="w-3 h-3 stroke-[2]" />
                </button>
              </div>
            );
          }

          // ---------------- MEDIUM PRIORITY (Prominent card toast) ----------------
          return (
            <div
              key={toast.id}
              role="alert"
              className={clsx(
                'pointer-events-auto w-full p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-start gap-3.5 transition-all duration-300 animate-in fade-in zoom-in-95 slide-in-from-top-3',
                toast.type === 'success' &&
                  'bg-white/95 dark:bg-[#16171d]/95 border-emerald-500/30 text-slate-900 dark:text-white shadow-emerald-500/10 ring-1 ring-emerald-500/20',
                toast.type === 'error' &&
                  'bg-white/95 dark:bg-[#16171d]/95 border-rose-500/30 text-slate-900 dark:text-white shadow-rose-500/10 ring-1 ring-rose-500/20',
                toast.type === 'warning' &&
                  'bg-white/95 dark:bg-[#16171d]/95 border-amber-500/30 text-slate-900 dark:text-white shadow-amber-500/10 ring-1 ring-amber-500/20',
                toast.type === 'info' &&
                  'bg-white/95 dark:bg-[#16171d]/95 border-indigo-500/30 text-slate-900 dark:text-white shadow-indigo-500/10 ring-1 ring-indigo-500/20'
              )}
            >
              {/* Icon badge */}
              <div
                className={clsx(
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs',
                  toast.type === 'success' &&
                    'bg-emerald-50 dark:bg-[#14291f] text-emerald-600 dark:text-[#22c55e] border border-emerald-200/60 dark:border-emerald-500/20',
                  toast.type === 'error' &&
                    'bg-rose-50 dark:bg-[#2e181e] text-rose-600 dark:text-[#f87171] border border-rose-200/60 dark:border-rose-500/20',
                  toast.type === 'warning' &&
                    'bg-amber-50 dark:bg-[#2e2318] text-amber-600 dark:text-[#fbbf24] border border-amber-200/60 dark:border-amber-500/20',
                  toast.type === 'info' &&
                    'bg-indigo-50 dark:bg-[#1b1f38] text-indigo-600 dark:text-[#8e8bf5] border border-indigo-200/60 dark:border-indigo-500/20'
                )}
              >
                <Icon className="w-5 h-5 stroke-[2.4]" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h4 className="text-xs sm:text-[13px] font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-[11.5px] text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                    {toast.message}
                  </p>
                )}
                {toast.action && (
                  <button
                    type="button"
                    onClick={() => handleActionClick(toast.action!, toast.id)}
                    className="mt-2 text-xs font-bold text-indigo-600 dark:text-[#8e8bf5] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{toast.action.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Dismiss */}
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#20222a] transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
