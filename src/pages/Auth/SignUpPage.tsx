import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const SignUpPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup, formatAuthError } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords are identical.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(email, password, fullName);
      success('Account Created!', 'Your Spendly account has been set up successfully.', { priority: 'medium' });
      navigate('/', { replace: true });
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
            Create your account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Start managing your wealth, budgets, and transactions today
          </p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-white dark:bg-[#16171d] border border-slate-200/80 dark:border-[#22242d] rounded-2xl p-5 sm:p-7 shadow-subtle dark:shadow-none space-y-5">
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <Input
              id="fullName"
              label="Full Name"
              type="text"
              placeholder="e.g. Alex Morgan"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              leftIcon={<UserIcon className="w-4 h-4" />}
              isRequired
            />

            {/* Email Address */}
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

            {/* Password */}
            <Input
              id="password"
              label="Password"
              helperText="Minimum 6 characters"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
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
              isRequired
            />

            {/* Confirm Password */}
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              leftIcon={<Lock className="w-4 h-4" />}
              isRequired
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="lavender"
              size="lg"
              className="w-full mt-2 shadow-sm shadow-indigo-500/20"
              isLoading={isSubmitting}
              leftIcon={<Check className="w-4 h-4 stroke-[2.5]" />}
            >
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#22242d] text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-indigo-600 dark:text-[#8e8bf5] hover:underline"
              >
                Sign in
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
