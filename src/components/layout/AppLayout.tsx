import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSessionTimeout } from '../../context/SessionTimeoutContext';
import { SessionTimeoutModal } from '../auth/SessionTimeoutModal';

export const AppLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const {
    isWarningOpen,
    remainingMs,
    totalWarningMs,
    stayLoggedIn,
    logoutDueToInactivity,
  } = useSessionTimeout();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-[#0e0f13] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Responsive Sidebar (Sticky on Desktop, Off-canvas on Mobile) */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Header onToggleMobile={() => setIsMobileOpen((prev) => !prev)} />

        <main className="flex-1 px-2.5 sm:px-6 lg:px-8 pb-8 pt-2 overflow-y-auto max-w-[1500px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Inactivity Warning Modal */}
      <SessionTimeoutModal
        isOpen={isWarningOpen}
        remainingMs={remainingMs}
        totalWarningMs={totalWarningMs}
        onStayLoggedIn={stayLoggedIn}
        onLogoutNow={logoutDueToInactivity}
      />
    </div>
  );
};
