import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  colorDot?: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
  id?: string;
  isRequired?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  disabled = false,
  error,
  icon,
  className,
  id,
  isRequired,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const enabledOptions = options.filter((o) => !o.disabled);
        const currentIndex = enabledOptions.findIndex((opt) => opt.value === value);
        const nextIndex = (currentIndex + 1) % enabledOptions.length;
        if (enabledOptions[nextIndex]) {
          onChange(enabledOptions[nextIndex].value);
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const enabledOptions = options.filter((o) => !o.disabled);
        const currentIndex = enabledOptions.findIndex((opt) => opt.value === value);
        const prevIndex = (currentIndex - 1 + enabledOptions.length) % enabledOptions.length;
        if (enabledOptions[prevIndex]) {
          onChange(enabledOptions[prevIndex].value);
        }
      }
    }
  };

  const handleSelectOption = (optionValue: string, optionDisabled?: boolean) => {
    if (optionDisabled) return;
    onChange(optionValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className={twMerge('w-full space-y-1.5', className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
        >
          {label} {isRequired && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={clsx(
            'w-full h-11 px-3.5 bg-slate-50/80 dark:bg-[#121319] hover:bg-slate-100/70 dark:hover:bg-[#161722] focus:bg-white dark:focus:bg-[#161722] text-slate-900 dark:text-slate-100 border rounded-xl text-xs font-semibold outline-none transition-all shadow-2xs flex items-center justify-between text-left box-border group cursor-pointer',
            isOpen
              ? 'border-indigo-500 dark:border-[#8e8bf5] ring-2 ring-indigo-500/20 dark:ring-[#8e8bf5]/20 bg-white dark:bg-[#161722]'
              : error
              ? 'border-rose-400 dark:border-rose-600/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-200/90 dark:border-[#262835] focus:border-indigo-500 dark:focus:border-[#8e8bf5] focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-[#8e8bf5]/20',
            disabled && 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-[#101116]'
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            {icon && (
              <span className="text-slate-400 group-focus:text-indigo-600 dark:group-focus:text-[#8e8bf5] group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0">
                {icon}
              </span>
            )}
            {selectedOption?.colorDot && (
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: selectedOption.colorDot }}
              />
            )}
            {selectedOption?.icon && (
              <span className="shrink-0 text-slate-500 dark:text-slate-400">{selectedOption.icon}</span>
            )}
            <span
              className={clsx(
                'truncate',
                !selectedOption && 'text-slate-400 dark:text-slate-500 font-normal'
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <ChevronDown
            className={clsx(
              'w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0',
              isOpen && 'rotate-180 text-indigo-500 dark:text-[#8e8bf5]'
            )}
          />
        </button>

        {/* Dropdown Menu Popover */}
        {isOpen && (
          <div
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="absolute z-50 mt-1.5 w-full bg-white dark:bg-[#16171e] border border-slate-200 dark:border-[#282a38] rounded-xl shadow-xl py-1.5 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectOption(option.value, option.disabled)}
                  className={clsx(
                    'flex items-center justify-between px-3.5 py-2.5 mx-1 my-0.5 rounded-lg text-xs font-semibold cursor-pointer transition-all',
                    isSelected
                      ? 'bg-indigo-50 dark:bg-[#202235] text-indigo-700 dark:text-[#9e9bf8] font-bold'
                      : option.disabled
                      ? 'opacity-40 cursor-not-allowed text-slate-400'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-[#1f212c]'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {option.colorDot && (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: option.colorDot }}
                      />
                    )}
                    {option.icon && (
                      <span className="shrink-0 text-slate-500 dark:text-slate-400">
                        {option.icon}
                      </span>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{option.label}</span>
                      {option.description && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-[#8e8bf5] stroke-[2.5] shrink-0 ml-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium pl-1 animate-in fade-in">
          {error}
        </p>
      )}
    </div>
  );
};
