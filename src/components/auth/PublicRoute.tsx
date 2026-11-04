import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0e0f13]">
        <div className="w-8 h-8 border-3 border-indigo-600 dark:border-[#8e8bf5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (currentUser) {
    // If user is already authenticated, redirect to the page they were trying to access or home
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
