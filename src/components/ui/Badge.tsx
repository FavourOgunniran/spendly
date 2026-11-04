import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'success' | 'danger' | 'warning' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
  dotColor?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  dotColor,
  icon,
  className,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-1.5 font-bold rounded-full select-none shrink-0 transition-colors';

  const variants = {
    brand:
      'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-[#9e9bf8] border border-indigo-200/60 dark:border-indigo-500/30',
    success:
      'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-[#34d399] border border-emerald-200/60 dark:border-emerald-500/30',
    danger:
      'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-[#f87171] border border-rose-200/60 dark:border-rose-500/30',
    warning:
      'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-[#fbbf24] border border-amber-200/60 dark:border-amber-500/30',
    neutral:
      'bg-slate-100 dark:bg-[#20222a] text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-[#2a2c38]',
    outline:
      'bg-transparent text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#282a38]',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-1',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
          style={dotColor ? { backgroundColor: dotColor } : undefined}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
