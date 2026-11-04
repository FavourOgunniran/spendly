import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SESSION_STORAGE_KEYS } from '../../config/sessionConfig';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inactivityNotice, setInactivityNotice] = useState<boolean>(false);

  const { login, formatAuthError } = useAuth();
  const { success, info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for inactivity logout notice on mount
  React.useEffect(() => {
    const isStateInactivity = (location.state as { inactivityLogout?: boolean })?.inactivityLogout;
    const isStorageInactivity =
      window.sessionStorage.getItem(SESSION_STORAGE_KEYS.INACTIVITY_NOTICE) === 'true' ||
      window.localStorage.getItem(SESSION_STORAGE_KEYS.INACTIVITY_NOTICE) === 'true';

    if (isStateInactivity || isStorageInactivity) {
      setInactivityNotice(true);
      info(
        'Session Expired',
        'You have been logged out due to inactivity. Please log in again.',
        { priority: 'medium' }
      );
      // Clean up after consuming
      try {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEYS.INACTIVITY_NOTICE);
        window.localStorage.removeItem(SESSION_STORAGE_KEYS.INACTIVITY_NOTICE);
      } catch {
        // Ignore
      }
    }
  }, [location.state, info]);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      success('Welcome back!', 'You have successfully signed in.', { priority: 'medium' });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-3 sm:p-6 bg-slate-50 dark:bg-[#0e0f13] transition-colors duration-200">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#b4b2f8] text-[#1d1760] flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-500/20 mb-3">
            S
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign in to Spendly
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Access your financial dashboard and real-time trackers
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#16171d] border border-slate-200/80 dark:border-[#22242d] rounded-2xl p-5 sm:p-7 shadow-subtle dark:shadow-none space-y-5">
          {/* Inactivity Logout Notice */}
          {inactivityNotice && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-start gap-3 animate-in fade-in zoom-in-95 duration-150">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">
                <p className="font-bold text-amber-800 dark:text-amber-300">Session Expired</p>
                <p className="font-medium text-amber-700/90 dark:text-amber-400/90 mt-0.5">
                  You have been logged out due to inactivity. Please log in again.
                </p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <Input
              id="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              leftIcon={<Mail className="w-4 h-4" />}
              isRequired
            />

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  Password <span className="text-rose-500">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 dark:text-[#8e8bf5] hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="lavender"
              size="lg"
              className="w-full mt-2 shadow-sm shadow-indigo-500/20"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#22242d] text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-bold text-indigo-600 dark:text-[#8e8bf5] hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-500 px-2 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secured with Firebase Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
