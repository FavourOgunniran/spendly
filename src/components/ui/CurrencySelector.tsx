import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Coins } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { CurrencyCode } from '../../types';

import { useToast } from '../../context/ToastContext';

interface CurrencySelectorProps {
  variant?: 'header' | 'compact' | 'full';
  className?: string;
  id?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  variant = 'header',
  className = '',
  id = 'currency-selector',
}) => {
  const { preferredCurrency, setPreferredCurrency, supportedCurrencies, currentCurrencyInfo } =
    useCurrency();
  const { success } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (code: CurrencyCode) => {
    if (code !== preferredCurrency) {
      setPreferredCurrency(code);
      const chosen = supportedCurrencies.find((c) => c.code === code);
      success(
        'Display Currency Updated',
        `Financial workspace converted to ${chosen?.name || code} (${chosen?.symbol || code}).`,
        { priority: 'low' }
      );
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* Dropdown Trigger Button */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Change preferred currency"
        className={`inline-flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer select-none leading-none ${
          variant === 'header'
            ? 'h-8 sm:h-10 px-1.5 sm:px-3 bg-white dark:bg-[#16171e] hover:bg-slate-50 dark:hover:bg-[#1e202a] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#22242e] hover:border-slate-300 dark:hover:border-slate-600 shadow-subtle dark:shadow-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-[#8e8bf5]/20 gap-1 sm:gap-2 shrink-0'
            : variant === 'compact'
            ? 'h-8 px-2.5 bg-slate-100 dark:bg-[#1a1b24] hover:bg-slate-200 dark:hover:bg-[#222430] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#282a36] gap-1.5'
            : 'w-full px-4 py-3 justify-between bg-white dark:bg-[#121319] hover:bg-slate-50 dark:hover:bg-[#161720] text-slate-900 dark:text-white border border-slate-200 dark:border-[#262835] shadow-xs'
        }`}
      >
        <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
          {/* Flag / Country Code */}
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-tight leading-none">
            {currentCurrencyInfo.flag}
          </span>

          {/* Divider " | " (hidden on extra small screens < 360px) */}
          <span className="hidden min-[360px]:inline text-slate-300 dark:text-slate-600 font-semibold select-none leading-none">
            |
          </span>

          {/* Currency code in brackets */}
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight leading-none text-[11px] sm:text-xs">
            ({currentCurrencyInfo.code})
          </span>

          {variant === 'full' && (
            <span className="text-slate-400 font-medium text-[11px] ml-1">
              — {currentCurrencyInfo.name} ({currentCurrencyInfo.symbol})
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-600 dark:text-[#8e8bf5]' : ''
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-52 sm:w-64 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-[#16171d] border border-slate-200 dark:border-[#282a36] rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-2 border-b border-slate-100 dark:border-[#22242e] flex items-center justify-between text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
            <span>Select Currency</span>
            <Coins className="w-3.5 h-3.5" />
          </div>

          <div className="py-1 space-y-0.5 max-h-60 overflow-y-auto">
            {supportedCurrencies.map((curr) => {
              const isSelected = preferredCurrency === curr.code;
              return (
                <button
                  key={curr.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(curr.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-[#8e8bf5] font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#20222a]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm leading-none">{curr.flag}</span>
                    <span className="text-slate-300 dark:text-slate-600 font-semibold select-none">
                      |
                    </span>
                    <span className="font-extrabold tracking-tight">
                      ({curr.code})
                    </span>
                    <div className="flex flex-col truncate ml-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {curr.name} ({curr.symbol})
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-indigo-600 dark:text-[#8e8bf5] stroke-[2.5] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
