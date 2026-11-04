import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
  suffixText?: string;
  onClear?: () => void;
  containerClassName?: string;
  isRequired?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      prefixText,
      suffixText,
      onClear,
      containerClassName,
      isRequired,
      className,
      id,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const hasValue = value !== undefined && value !== null && value !== '';

    return (
      <div className={twMerge('w-full space-y-1.5', containerClassName)}>
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            >
              {label} {isRequired && <span className="text-rose-500">*</span>}
            </label>
            {onClear && hasValue && !disabled && (
              <button
                type="button"
                onClick={onClear}
                className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#20222a]"
              >
                Clear
              </button>
            )}
          </div>
        )}

        <div className="relative group flex items-center">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-[#8e8bf5] transition-colors shrink-0 z-10">
              {leftIcon}
            </div>
          )}

          {/* Prefix Text (e.g., "$") */}
          {prefixText && !leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-[#8e8bf5] pointer-events-none select-none z-10 transition-colors">
              {prefixText}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            value={value}
            className={twMerge(
              clsx(
                'w-full h-11 bg-slate-50/80 dark:bg-[#121319] hover:bg-slate-100/70 dark:hover:bg-[#161722] focus:bg-white dark:focus:bg-[#161722] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border rounded-xl text-xs font-semibold outline-none transition-all shadow-2xs box-border dark:[color-scheme:dark]',
                leftIcon
                  ? 'pl-10'
                  : prefixText
                  ? 'pl-8'
                  : 'pl-3.5',
                rightIcon || suffixText || (onClear && hasValue)
                  ? 'pr-10'
                  : 'pr-3.5',
                error
                  ? 'border-rose-400 dark:border-rose-600/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200/90 dark:border-[#262835] focus:border-indigo-500 dark:focus:border-[#8e8bf5] focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-[#8e8bf5]/20',
                disabled && 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-[#101116]'
              ),
              className
            )}
            {...props}
          />

          {/* Right Suffix or Icon */}
          {suffixText && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none select-none">
              {suffixText}
            </span>
          )}

          {rightIcon && !suffixText && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-[#8e8bf5] transition-colors shrink-0">
              {rightIcon}
            </div>
          )}

          {/* Clear X Icon button if no other right accessory */}
          {onClear && hasValue && !rightIcon && !suffixText && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
              aria-label="Clear field"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Error message or Helper text */}
        {error ? (
          <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1 pl-1 animate-in fade-in">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal pl-1">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
