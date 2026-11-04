import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-2xl bg-slate-50/50 dark:bg-[#121319]/50 border border-dashed border-slate-200/80 dark:border-[#22242e]',
          className
        )
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1e2028] text-slate-400 dark:text-slate-400 flex items-center justify-center mb-3.5 border border-slate-200/60 dark:border-white/5 shadow-xs">
        {icon}
      </div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
        {title}
      </h4>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm font-medium leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
