import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0e0f13] text-slate-800 dark:text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 dark:bg-[#8e8bf5]/20 flex items-center justify-center text-indigo-600 dark:text-[#8e8bf5] animate-pulse">
            <div className="w-6 h-6 border-3 border-indigo-600 dark:border-[#8e8bf5] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
            Verifying authentication session...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login, preserving the intended location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
