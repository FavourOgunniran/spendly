import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  Menu,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { CurrencySelector } from '../ui/CurrencySelector';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const routeHeaders: Record<string, { title: string; subtitle: string } | null> = {
  '/expenses': {
    title: 'Expenses & Inflows',
    subtitle: 'Search, filter, and manage your daily cash transactions.',
  },
  '/transactions': {
    title: 'Transactions',
    subtitle: 'Search, filter, and manage your daily cash transactions.',
  },
  '/add-expense': {
    title: 'Record Expense / Income',
    subtitle: 'Log a new expense, recurring bill, subscription, or income stream.',
  },
  '/categories': {
    title: 'Category Classifications',
    subtitle: 'Manage custom colors, icons, and logical budget groups.',
  },
  '/insights': {
    title: 'Financial Intelligence & Insights',
    subtitle: 'Behavior detection, 7 & 30-day saving plans, and monthly narrative.',
  },
  '/analytics': {
    title: 'Analytics & Insights',
    subtitle: 'Deep dive into spending patterns, cash flow, and projections.',
  },
  '/budget': {
    title: 'Budgets & Spending Limits',
    subtitle: 'Configure category caps, pace burn rates, and warning alerts.',
  },
  '/settings': {
    title: 'Workspace Settings',
    subtitle: 'Manage currency defaults, security, and account preferences.',
  },
};

interface HeaderProps {
  onToggleMobile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { info, error: showError } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageHeader = routeHeaders[location.pathname];

  const currentDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Derive display name and initials
  const displayName =
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Spendly User';

  const userEmail = currentUser?.email || 'user@spendly.app';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'U';

  // Handle clicking outside the user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await logout();
      info('Signed Out', 'You have been signed out successfully.', { priority: 'low' });
      navigate('/login');
    } catch (err: unknown) {
      showError('Logout Failed', 'Could not sign out. Please try again.', { priority: 'high' });
      console.error(err);
    }
  };

  return (
    <header className="h-16 sm:h-20 bg-slate-50/95 dark:bg-[#0e0f13]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#181920] px-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-1.5 sm:gap-4 shrink-0 sticky top-0 z-40 transition-colors duration-200">
      {/* Left: Mobile Hamburger Toggle + Page Title/Search */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
        {onToggleMobile && (
          <button
            type="button"
            onClick={onToggleMobile}
            className="p-1.5 sm:p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#16171e] rounded-xl border border-slate-200 dark:border-[#22242e] lg:hidden shadow-subtle dark:shadow-none cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {pageHeader ? (
          <div className="min-w-0 flex-1">
            <h1 className="text-sm min-[360px]:text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
              {pageHeader.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block truncate">
              {pageHeader.subtitle}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Header Title on Dashboard */}
            <div className="min-w-0 flex-1 md:hidden">
              <span className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Spendly
              </span>
            </div>

            {/* Desktop Search Bar */}
            <div className="relative hidden md:flex items-center group w-80">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-[#8e8bf5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
              <input
                type="text"
                placeholder="Search in Spendly..."
                className="w-full pl-10 pr-3.5 py-2 bg-slate-100/90 dark:bg-[#151720] hover:bg-white dark:hover:bg-[#1a1c26] focus:bg-white dark:focus:bg-[#191a24] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200/90 dark:border-[#282a36] focus:border-indigo-500 dark:focus:border-[#8e8bf5]/70 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-xs transition-all"
              />
            </div>
          </>
        )}
      </div>

      {/* Right Group: Date Filter + Settings + Currency + Theme + Profile */}
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        {/* Date Filter Pill */}
        <div className="hidden md:flex items-center h-10 gap-2 px-4 min-w-[130px] justify-center bg-white dark:bg-[#16171e] border border-slate-200 dark:border-[#22242e] rounded-xl text-xs font-semibold text-slate-700 dark:text-white shadow-subtle dark:shadow-none select-none">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="leading-none whitespace-nowrap">{currentDate}</span>
        </div>

        {/* Currency Selector */}
        <CurrencySelector variant="header" />

        {/* Theme Toggle */}
        <ThemeToggle className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center bg-white dark:bg-[#16171e] border-slate-200 dark:border-[#22242e] shadow-subtle dark:shadow-none shrink-0" />

        {/* Dynamic User Profile Menu */}
        <div className="relative pl-1 sm:pl-2 border-l border-slate-200 dark:border-[#1f202a]" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1b1d26] transition-colors cursor-pointer"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <div className="flex flex-col text-right hidden md:flex">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[130px] truncate">
                {displayName}
              </span>
              <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 max-w-[130px] truncate">
                {userEmail}
              </span>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              {initials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#16171d] border border-slate-200 dark:border-[#282a36] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-[#22242e]">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {userEmail}
                </p>
              </div>

              <Link
                to="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#20222a] rounded-xl transition-colors"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
