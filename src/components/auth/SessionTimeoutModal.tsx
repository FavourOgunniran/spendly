import React, { useEffect } from 'react';
import { Clock, ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatRemainingTime } from '../../config/sessionConfig';

export interface SessionTimeoutModalProps {
  isOpen: boolean;
  remainingMs: number;
  totalWarningMs: number;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  remainingMs,
  totalWarningMs,
  onStayLoggedIn,
  onLogoutNow,
}) => {
  // Auto-focus the "Stay Logged In" button when modal appears for instant keyboard affirmation
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const btn = document.getElementById('spendly-stay-logged-in-btn');
        btn?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Calculate progress percentage (0 to 100)
  const progressPercent = Math.max(
    0,
    Math.min(100, (remainingMs / (totalWarningMs || 1)) * 100)
  );

  const formattedTime = formatRemainingTime(remainingMs);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onStayLoggedIn}
      size="sm"
      showCloseButton={false}
      closeOnOutsideClick={false}
      closeOnEscape={false}
      className="border-amber-200/60 dark:border-amber-900/40 shadow-2xl"
    >
      <div className="flex flex-col items-center text-center space-y-4 py-2">
        {/* Animated Warning Icon with concentric pulses */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner relative z-10 animate-pulse">
            <Clock className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-amber-400/20 dark:bg-amber-500/20 animate-ping opacity-75" />
        </div>

        {/* Title and Explanation */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Your session is about to expire
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            You will be logged out soon due to inactivity. To protect your financial workspace, inactive sessions are automatically signed out.
          </p>
        </div>

        {/* Live Countdown & Progress Bar */}
        <div className="w-full bg-slate-50 dark:bg-[#121319] border border-slate-200/80 dark:border-[#22242e] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              Auto-logout in:
            </span>
            <span className="font-mono text-sm font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200/70 dark:border-amber-800/60">
              {formattedTime}
            </span>
          </div>

          {/* Shrinking progress meter */}
          <div className="w-full h-1.5 bg-slate-200 dark:bg-[#20222a] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                progressPercent > 40
                  ? 'bg-amber-500'
                  : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <Button
            id="spendly-stay-logged-in-btn"
            type="button"
            variant="lavender"
            size="md"
            onClick={onStayLoggedIn}
            className="w-full shadow-md shadow-indigo-500/20 font-bold"
            leftIcon={<CheckCircle2 className="w-4 h-4 text-[#1d1760]" />}
          >
            Stay Logged In
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onLogoutNow}
            className="w-full text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs"
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Sign Out Now
          </Button>
        </div>
      </div>
    </Modal>
  );
};
