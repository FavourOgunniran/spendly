import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

// Standard RFC-compliant email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { sendPasswordReset, formatAuthError } = useAuth();

  // Handle resend countdown cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();

    // Client-side validation
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordReset(cleanEmail);
      setIsSubmitted(true);
      setCooldown(30); // 30-second cooldown for rate-limit protection
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setCooldown(30);
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
            {isSubmitted ? 'Check your email' : 'Reset your password'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 max-w-sm">
            {isSubmitted
              ? 'Follow the instructions sent to your email to recover your account.'
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-[#16171d] border border-slate-200/80 dark:border-[#22242d] rounded-2xl p-5 sm:p-7 shadow-subtle dark:shadow-none space-y-5">
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{error}</div>
            </div>
          )}

          {isSubmitted ? (
            /* Success Confirmation State */
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 space-y-2">
                <div className="flex items-center gap-2.5 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Password reset link sent</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300/90 leading-relaxed pl-6.5">
                  If an account exists for <span className="font-bold underline decoration-emerald-400">{email}</span>,
                  we'll send you a password reset link. Check your email for instructions.
                </p>
              </div>

              {/* Spam/Junk Reminder */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121319] border border-slate-200/80 dark:border-[#22242d] text-slate-600 dark:text-slate-400 text-xs flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Don't see the email?</span>{' '}
                  Check your spam or junk folder, or ensure the email address was spelled correctly.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <Link to="/login" className="block w-full">
                  <Button
                    variant="lavender"
                    size="lg"
                    className="w-full shadow-sm shadow-indigo-500/20"
                  >
                    Return to Sign In
                  </Button>
                </Link>

                <div className="flex items-center justify-between pt-2 px-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setError(null);
                    }}
                    className="font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    Try another email
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0 || isSubmitting}
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-[#8e8bf5] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {cooldown > 0 ? `Resend link in ${cooldown}s` : 'Resend link'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Input Form State */
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="reset-email"
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
                autoFocus
              />

              <Button
                type="submit"
                variant="lavender"
                size="lg"
                className="w-full mt-2 shadow-sm shadow-indigo-500/20"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />}
              >
                Send Reset Link
              </Button>
            </form>
          )}

          {/* Back to Login Option */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#22242d] text-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-[#8e8bf5] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
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
