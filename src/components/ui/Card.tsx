import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-subtle dark:shadow-none transition-colors duration-200',
          hoverEffect && 'hover:shadow-card dark:hover:border-slate-700 hover:border-slate-300/80 transition-all duration-200',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
