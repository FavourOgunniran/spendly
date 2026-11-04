import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'lavender' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none cursor-pointer';

  const variants = {
    // Spendly Signature Lavender Button
    lavender:
      'bg-[#8e8bf5] hover:bg-[#9d9af7] active:bg-[#7e7be5] text-[#1d1760] shadow-sm shadow-indigo-500/20 focus:ring-[#8e8bf5]',
    // Primary Indigo Button
    primary:
      'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-500/20 focus:ring-indigo-500',
    // Secondary Subtle Button
    secondary:
      'bg-slate-100 dark:bg-[#20222a] hover:bg-slate-200 dark:hover:bg-[#282b39] text-slate-700 dark:text-slate-200 focus:ring-slate-400 dark:focus:ring-[#383b4a]',
    // Bordered Outline Button
    outline:
      'border border-slate-200/90 dark:border-[#282a38] bg-white dark:bg-[#16171e] hover:bg-slate-50 dark:hover:bg-[#1f212c] text-slate-700 dark:text-slate-200 focus:ring-indigo-500/30 shadow-2xs',
    // Ghost Button
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-[#20222a] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:ring-slate-400',
    // Destructive Danger Button
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-500/20 focus:ring-rose-500',
    // Positive Success Button
    success:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-500/20 focus:ring-emerald-500',
  };

  const sizes = {
    xs: 'text-[11px] px-2.5 py-1 gap-1 rounded-lg',
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-xs font-bold px-4 py-2.5 gap-2 rounded-xl',
    lg: 'text-sm font-bold px-5 py-3 gap-2.5 rounded-xl',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="inline-flex shrink-0">{leftIcon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};
