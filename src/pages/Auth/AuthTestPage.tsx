import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Shield,
  User,
  LogOut,
  LogIn,
  UserPlus,
  RefreshCw,
  ArrowLeft,
  Key,
  Mail,
  Clock,
  Timer,
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useSessionTimeout } from '../../context/SessionTimeoutContext';

export const AuthTestPage: React.FC = () => {
  const { currentUser, loading, login, signup, logout, sendPasswordReset, formatAuthError } = useAuth();
  const {
    timeoutDurationMs,
    totalWarningMs,
    remainingMs,
    isWarningOpen,
    stayLoggedIn,
    logoutDueToInactivity,
    updateTimeoutDuration,
    resetTimeoutToDefault,
    simulateWarning,
  } = useSessionTimeout();

  const [testName, setTestName] = useState('');
  const [testEmail, setTestEmail] = useState('testuser@spendly.app');
  const [testPassword, setTestPassword] = useState('spendly1234');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTestSignUp = async () => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      const user = await signup(testEmail, testPassword, testName || 'Test User');
      setFeedback({
        type: 'success',
        message: `Sign up successful! Account created for ${user.email} (UID: ${user.uid}).`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: formatAuthError(err),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestLogin = async () => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      const user = await login(testEmail, testPassword);
      setFeedback({
        type: 'success',
        message: `Login successful! Signed in as ${user.email} (UID: ${user.uid}).`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: formatAuthError(err),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestLogout = async () => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      await logout();
      setFeedback({
        type: 'info',
        message: 'Logout successful! Session ended.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: formatAuthError(err),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0e0f13] text-slate-900 dark:text-slate-100 p-4 sm:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#22242d] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Firebase Authentication Test Bench
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dev-only tool for verifying real-time Firebase Auth session and operations
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="px-3.5 py-2 bg-white dark:bg-[#16171e] hover:bg-slate-100 dark:hover:bg-[#20222e] border border-slate-200 dark:border-[#2f3242] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to App</span>
        </Link>
      </div>

      {/* Live Authentication Status Card */}
      <div className="p-6 bg-white dark:bg-[#16171d] border border-slate-200 dark:border-[#22242d] rounded-2xl shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Session State
            </span>
            {loading ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 animate-pulse">
                Checking...
              </span>
            ) : currentUser ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Authenticated</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#20222a] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                <span>Logged Out / Guest</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            title="Reload to test session persistence"
            className="px-3 py-1 bg-slate-100 dark:bg-[#20222a] hover:bg-slate-200 dark:hover:bg-[#282a36] text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Test Page Refresh Persistence</span>
          </button>
        </div>

        {/* User details table */}
        {currentUser ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl text-xs">
            <div>
              <span className="font-bold text-slate-400 block mb-0.5">UID:</span>
              <span className="font-mono text-[11px] bg-slate-200 dark:bg-[#20222a] px-2 py-0.5 rounded select-all break-all">
                {currentUser.uid}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block mb-0.5">Email:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {currentUser.email}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block mb-0.5">Display Name:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {currentUser.displayName || 'None set'}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block mb-0.5">Email Verified:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {currentUser.emailVerified ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-[#121319] border border-dashed border-slate-200 dark:border-[#282a36] rounded-xl text-center text-xs text-slate-400">
            No active user session. Use the actions below or visit the Sign In / Sign Up pages.
          </div>
        )}
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-start gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{feedback.message}</div>
        </div>
      )}

      {/* Test Controls */}
      <div className="p-6 bg-white dark:bg-[#16171d] border border-slate-200 dark:border-[#22242d] rounded-2xl shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Direct Authentication Triggers
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Test Full Name"
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Test User"
            leftIcon={<User className="w-3.5 h-3.5" />}
          />

          <Input
            label="Test Email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            leftIcon={<Mail className="w-3.5 h-3.5" />}
          />

          <Input
            label="Test Password"
            type="text"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            leftIcon={<Key className="w-3.5 h-3.5" />}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            type="button"
            variant="success"
            disabled={isProcessing}
            onClick={handleTestSignUp}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Test Sign Up
          </Button>

          <Button
            type="button"
            variant="primary"
            disabled={isProcessing}
            onClick={handleTestLogin}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Test Log In
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={isProcessing}
            onClick={async () => {
              setIsProcessing(true);
              setFeedback(null);
              try {
                await sendPasswordReset(testEmail);
                setFeedback({
                  type: 'success',
                  message: `Password reset email dispatched for ${testEmail}! Check your inbox.`,
                });
              } catch (err) {
                setFeedback({
                  type: 'error',
                  message: formatAuthError(err),
                });
              } finally {
                setIsProcessing(false);
              }
            }}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Test Password Reset
          </Button>

          {currentUser && (
            <Button
              type="button"
              variant="danger"
              disabled={isProcessing}
              onClick={handleTestLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Test Log Out
            </Button>
          )}
        </div>
      </div>

      {/* Session Inactivity Timeout Test Section */}
      <div className="p-6 bg-white dark:bg-[#16171d] border border-slate-200 dark:border-[#22242d] rounded-2xl shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Automatic Session Timeout Test Bench</h2>
              <p className="text-xs text-slate-400">
                Verify inactivity timer, warning modal, cross-tab synchronization, and safe auto-logout
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              currentUser
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {currentUser ? 'Monitoring Inactivity' : 'Inactive (Signed Out)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Active Timeout
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {timeoutDurationMs >= 60000
                ? `${Math.round(timeoutDurationMs / 60000)} Minutes`
                : `${Math.round(timeoutDurationMs / 1000)} Seconds`}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Warning Modal State
            </span>
            <span className={`font-extrabold ${isWarningOpen ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>
              {isWarningOpen ? `Open (${Math.ceil(remainingMs / 1000)}s remaining)` : 'Closed'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Lead Time
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {totalWarningMs >= 60000
                ? `${Math.round(totalWarningMs / 60000)}m Before`
                : `${Math.round(totalWarningMs / 1000)}s Before`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            type="button"
            variant="lavender"
            size="sm"
            onClick={simulateWarning}
            disabled={!currentUser}
            leftIcon={<Timer className="w-3.5 h-3.5" />}
          >
            Trigger Warning Modal
          </Button>

          <Button
            type="button"
            variant="success"
            size="sm"
            onClick={stayLoggedIn}
            disabled={!currentUser}
          >
            Stay Logged In (Reset Timer)
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => updateTimeoutDuration(30 * 1000, 15 * 1000)}
            disabled={!currentUser}
          >
            Set Quick 30s Timeout
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={resetTimeoutToDefault}
            disabled={!currentUser}
          >
            Reset to 30m Default
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={logoutDueToInactivity}
            disabled={!currentUser}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Trigger Immediate Inactivity Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
