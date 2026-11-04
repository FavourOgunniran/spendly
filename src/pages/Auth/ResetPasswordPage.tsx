import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const { verifyResetCode, confirmResetPassword, formatAuthError } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  // Verify action code on mount
  useEffect(() => {
    let isMounted = true;

    const verifyCode = async () => {
      if (!oobCode) {
        if (isMounted) {
          setVerificationError('Missing password reset code. Please request a new reset link.');
          setIsVerifying(false);
        }
        return;
      }

      try {
        const email = await verifyResetCode(oobCode);
        if (isMounted) {
          setVerifiedEmail(email);
          setIsVerifying(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setVerificationError(formatAuthError(err));
          setIsVerifying(false);
        }
      }
    };

    verifyCode();

    return () => {
      isMounted = false;
    };
  }, [oobCode, verifyResetCode, formatAuthError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!password) {
      setSubmitError('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    if (!oobCode) {
      setSubmitError('Missing reset code. Please request a new link.');
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmResetPassword(oobCode, password);
      setIsComplete(true);
      success('Password Updated', 'Your password has been reset successfully. Please log in.', {
        priority: 'high',
      });
    } catch (err: unknown) {
      setSubmitError(formatAuthError(err));
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
            {isComplete ? 'Password reset complete' : 'Choose a new password'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 max-w-sm">
            {isComplete
              ? 'Your password has been changed. You can now sign in with your new credentials.'
              : verifiedEmail
              ? `Creating a new password for ${verifiedEmail}`
              : 'Set a secure new password for your Spendly account.'}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-[#16171d] border border-slate-200/80 dark:border-[#22242d] rounded-2xl p-5 sm:p-7 shadow-subtle dark:shadow-none space-y-5">
          {/* Loading verification state */}
          {isVerifying && (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Verifying reset link...
              </p>
            </div>
          )}

          {/* Invalid or Expired Code Error State */}
          {!isVerifying && verificationError && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-800 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Invalid or Expired Link</span>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-300/90 leading-relaxed pl-6">
                  {verificationError}
                </p>
              </div>

              <Link to="/forgot-password" className="block w-full">
                <Button
                  variant="lavender"
                  size="lg"
                  className="w-full shadow-sm shadow-indigo-500/20"
                  rightIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Request New Reset Link
                </Button>
              </Link>
            </div>
          )}

          {/* Password Reset Completed State */}
          {!isVerifying && !verificationError && isComplete && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 space-y-2">
                <div className="flex items-center gap-2.5 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Password successfully updated</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300/90 leading-relaxed pl-6.5">
                  Your new password is now active. Please sign in to access your dashboard.
                </p>
              </div>

              <Button
                variant="lavender"
                size="lg"
                className="w-full shadow-sm shadow-indigo-500/20"
                onClick={() => navigate('/login')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />}
              >
                Sign In Now
              </Button>
            </div>
          )}

          {/* Reset Password Form */}
          {!isVerifying && !verificationError && !isComplete && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-snug">{submitError}</div>
                </div>
              )}

              {/* New Password */}
              <Input
                id="new-password"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (submitError) setSubmitError(null);
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
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                isRequired
                autoFocus
              />

              {/* Confirm New Password */}
              <Input
                id="confirm-new-password"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (submitError) setSubmitError(null);
                }}
                disabled={isSubmitting}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                isRequired
              />

              <Button
                type="submit"
                variant="lavender"
                size="lg"
                className="w-full mt-2 shadow-sm shadow-indigo-500/20"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />}
              >
                Update Password
              </Button>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#22242d] text-center">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-[#8e8bf5] transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-500 px-2 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secured with Firebase Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
