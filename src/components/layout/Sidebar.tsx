import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  ArrowLeftRight,
  Sparkles,
  PieChart,
  Layers,
  Settings,
  Plus,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';

// Structured Navigation Sections
const navSections = [
  {
    title: 'OVERVIEW',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutGrid },
      { path: '/expenses', label: 'Expenses', icon: ArrowLeftRight },
    ],
  },
  {
    title: 'PLANNING & INSIGHTS',
    items: [
      { path: '/budget', label: 'Budgets', icon: PieChart },
      { path: '/insights', label: 'Insights', icon: Sparkles },
      { path: '/categories', label: 'Categories', icon: Layers },
    ],
  },
  {
    title: 'SYSTEM',
    items: [{ path: '/settings', label: 'Settings', icon: Settings }],
  },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const displayName =
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Spendly User';
  const email = currentUser?.email || 'user@spendly.app';
  const initial = (displayName[0] || 'U').toUpperCase();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={clsx(
          'w-64 max-w-[85vw] bg-white dark:bg-[#0c0d12] border-r border-slate-200/80 dark:border-[#1c1d25] flex flex-col shrink-0 h-screen select-none p-4 sm:p-5 justify-between transition-transform duration-300 ease-in-out',
          // Desktop: sticky in-flow sidebar
          'lg:sticky lg:top-0 lg:z-30 lg:translate-x-0',
          // Mobile: fixed overlay drawer when open; completely out-of-flow and non-interactive when closed
          isMobileOpen
            ? 'fixed inset-y-0 left-0 z-50 translate-x-0 shadow-2xl'
            : 'fixed inset-y-0 left-0 z-50 -translate-x-full pointer-events-none max-lg:invisible lg:pointer-events-auto'
        )}
      >
        {/* Top Brand Header & Grouped Navigation */}
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9d9af8] to-[#7f7cf0] text-[#1d1760] flex items-center justify-center font-black text-lg shadow-sm shadow-indigo-500/20">
                S
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Spendly
                </span>
                <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500">
                  Wealth & Budgeting
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white lg:hidden cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Grouped Navigation Sections */}
          <div className="space-y-5">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1.5">
                <span className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  {section.title}
                </span>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          clsx(
                            'group flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs min-h-[38px] transition-all duration-150 relative',
                            isActive
                              ? 'bg-indigo-50/90 dark:bg-[#1a1c28] text-indigo-700 dark:text-[#8e8bf5] font-bold shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-[#14151e]'
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 dark:bg-[#8e8bf5] rounded-r-full" />
                            )}
                            <Icon
                              className={clsx(
                                'w-4 h-4 transition-colors',
                                isActive
                                  ? 'text-indigo-600 dark:text-[#8e8bf5]'
                                  : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                              )}
                            />
                            <span>{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Area: CTA Button & Profile Chip */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#1c1d25]">
          {/* + Record Expense CTA Button */}
          <button
            type="button"
            onClick={() => {
              navigate('/add-expense');
              handleNavClick();
            }}
            className="w-full py-2.5 px-4 bg-[#8e8bf5] hover:bg-[#9e9bf8] active:scale-[0.98] text-[#1d1760] font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record Expense</span>
          </button>

          {/* User Profile Mini Card */}
          <div
            onClick={() => {
              navigate('/settings');
              handleNavClick();
            }}
            className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/80 dark:bg-[#12131a] hover:bg-slate-100 dark:hover:bg-[#181a24] border border-slate-200/60 dark:border-[#222430] transition-colors cursor-pointer"
            title="View Account Settings"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-[#202235] text-indigo-700 dark:text-[#8e8bf5] flex items-center justify-center font-bold text-xs shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                {email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
