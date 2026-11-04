import React from 'react';
import { Card } from '../../components/ui/Card';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Bell,
  User,
  Palette,
  LogOut,
  Mail,
  Key,
  Calendar,
  Coins,
  RefreshCw,
  Clock,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CurrencySelector } from '../../components/ui/CurrencySelector';
import { useSessionTimeout } from '../../context/SessionTimeoutContext';
import { DEFAULT_SESSION_TIMEOUT_MS } from '../../config/sessionConfig';

export const SettingsPage: React.FC = () => {
  const { theme } = useTheme();
  const { currentUser, logout } = useAuth();
  const { rates, refreshRates, isLoadingRates } = useCurrency();
  const { info, success, error: toastError } = useToast();
  const navigate = useNavigate();
  const {
    timeoutDurationMs,
    totalWarningMs,
    updateTimeoutDuration,
    resetTimeoutToDefault,
    simulateWarning,
  } = useSessionTimeout();

  const handleLogout = async () => {
    await logout();
    info('Signed Out Successfully', 'You have been safely logged out of your account.', { priority: 'low' });
    navigate('/login');
  };

  const handleRefreshRates = async () => {
    try {
      await refreshRates();
      success('Exchange Rates Updated', 'Live exchange rates from Frankfurter v2 have been synchronized.', { priority: 'low' });
    } catch (err) {
      toastError('Refresh Failed', 'Unable to retrieve live exchange rates. Please try again.', { priority: 'high' });
    }
  };

  const memberSince = currentUser?.metadata?.creationTime
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(currentUser.metadata.creationTime))
    : 'Recently';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          Preferences & Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage account information, appearance themes, and authentication security.
        </p>
      </div>

      {/* Account Profile Card */}
      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#22242d]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              {currentUser?.displayName
                ? currentUser.displayName.substring(0, 2).toUpperCase()
                : currentUser?.email?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.displayName || 'Spendly User'}
                </h3>
                <Badge variant="success" size="sm" dot>
                  Active Session
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {currentUser?.email}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            className="self-start sm:self-auto bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 shadow-xs shrink-0"
          >
            Sign Out
          </Button>
        </div>

        {/* Account Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-1">
          <div className="p-3 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl flex items-center gap-3 min-w-0">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="truncate min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Email
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                {currentUser?.email || 'N/A'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl flex items-center gap-3 min-w-0">
            <Key className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="truncate min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                User ID (UID)
              </span>
              <span className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate block">
                {currentUser?.uid || 'N/A'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl flex items-center gap-3 min-w-0 sm:col-span-2 lg:col-span-1">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Member Since
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                {memberSince}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Theme Appearance Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Appearance & Theme
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Choose between Light Mode and Dark Mode for your dashboard. Currently:{' '}
                <strong className="capitalize text-indigo-600 dark:text-indigo-400">
                  {theme} Mode
                </strong>
              </p>
            </div>
          </div>
          <ThemeToggle variant="segmented" />
        </div>
      </Card>

      {/* Currency & Financial Region Card */}
      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-[#22242d]">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-[#14291f] text-[#22c55e] shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  Primary Display Currency
                </h3>
                <Badge variant="brand" size="sm">
                  Frankfurter API
                </Badge>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Dashboard totals, budgets, analytics, and summaries will be converted and displayed in this currency.
              </p>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <CurrencySelector variant="full" id="settings-currency-selector" />
          </div>
        </div>

        {/* Live Conversion Rates Info */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              1 USD in NGN
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              ₦{rates['NGN']?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '1,346.48'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              1 USD in EUR
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              €{rates['EUR']?.toFixed(4) || '0.8560'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              1 USD in GBP
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              £{rates['GBP']?.toFixed(4) || '0.7337'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                FX Provider
              </span>
              <span className="font-bold text-indigo-600 dark:text-[#8e8bf5]">
                Frankfurter v2
              </span>
            </div>
            <button
              type="button"
              onClick={handleRefreshRates}
              disabled={isLoadingRates}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#20222a] hover:bg-slate-200 dark:hover:bg-[#282a38] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh exchange rates"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRates ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Automatic Session Timeout Card */}
      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-[#22242d]">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  Automatic Session Timeout & Security
                </h3>
                <Badge variant={timeoutDurationMs === DEFAULT_SESSION_TIMEOUT_MS ? 'brand' : 'warning'} size="sm">
                  {timeoutDurationMs === DEFAULT_SESSION_TIMEOUT_MS ? '30m Default' : `${Math.round(timeoutDurationMs / 1000)}s Testing`}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Automatically signs out inactive users to protect financial privacy. Firebase data (transactions, budgets) remains permanently preserved.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {timeoutDurationMs !== DEFAULT_SESSION_TIMEOUT_MS && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetTimeoutToDefault();
                  success('Reset to Default', 'Session timeout restored to 30 minutes.');
                }}
                className="text-xs"
              >
                Reset to 30m
              </Button>
            )}
            <Button
              type="button"
              variant="lavender"
              size="sm"
              onClick={simulateWarning}
              leftIcon={<Timer className="w-3.5 h-3.5" />}
              className="text-xs shadow-xs"
            >
              Test Warning Modal
            </Button>
          </div>
        </div>

        {/* Inactivity System Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Inactivity Limit
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {timeoutDurationMs >= 60000
                ? `${Math.round(timeoutDurationMs / 60000)} Minutes`
                : `${Math.round(timeoutDurationMs / 1000)} Seconds`}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Warning Window
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {totalWarningMs >= 60000
                ? `${Math.round(totalWarningMs / 60000)} Minutes Before`
                : `${Math.round(totalWarningMs / 1000)}s Before`}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Cross-Tab Sync
            </span>
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Synchronized</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Dev Test Mode
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <button
                type="button"
                onClick={() => {
                  updateTimeoutDuration(30 * 1000, 15 * 1000);
                  info('30s Test Mode Enabled', 'Session will show warning in 15s and logout in 30s if idle.');
                }}
                className="text-[11px] font-bold text-indigo-600 dark:text-[#8e8bf5] hover:underline cursor-pointer"
              >
                Set 30s Quick Test
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Preferences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverEffect className="cursor-pointer">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Profile & Identity
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {currentUser?.displayName || 'Personal settings'}
              </p>
            </div>
          </div>
        </Card>

        <Card hoverEffect className="cursor-pointer">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Notifications
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Budget alerts & reports
              </p>
            </div>
          </div>
        </Card>

        <Card hoverEffect className="cursor-pointer">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Security & Auth
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Firebase Protected
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
