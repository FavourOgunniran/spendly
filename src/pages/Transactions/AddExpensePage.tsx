import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TransactionForm } from '../../components/transactions/TransactionForm';
import { useTransactions } from '../../context/TransactionContext';
import { useCurrency } from '../../context/CurrencyContext';
import { ArrowLeft, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';

export const AddExpensePage: React.FC = () => {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { preferredCurrency } = useCurrency();

  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 bg-white dark:bg-[#16171d] hover:bg-slate-100 dark:hover:bg-[#1e2028] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-[#22242d] rounded-xl shadow-xs transition-colors shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              Add Expense or Income
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block truncate">
              Record a new expense, repeating bill, subscription, or incoming income stream.
            </p>
          </div>
        </div>

        <Link
          to="/transactions"
          className="text-xs font-bold text-indigo-600 dark:text-[#8e8bf5] hover:underline flex items-center gap-1 shrink-0 self-end sm:self-auto"
        >
          <span>All Transactions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid: Form on Left, Contextual Assist & Recents on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Container */}
        <div className="lg:col-span-7">
          <TransactionForm onSuccess={() => navigate('/transactions')} />
        </div>

        {/* Right Info Cards */}
        <div className="lg:col-span-5 space-y-5">
          {/* Smart Entry Tips */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/60 dark:from-[#151722] dark:to-[#181a28] border border-indigo-100 dark:border-[#24273c] rounded-2xl p-5 shadow-subtle dark:shadow-none space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-[#8e8bf5]">
              <Sparkles className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Fast & Accurate Tracking</h4>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>
                  <strong>Recurring Expense:</strong> Turn on the toggle for monthly rent, wifi, Netflix, or weekly groceries to track subscriptions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>
                  <strong>Multi-Currency:</strong> Recorded amounts in USD, GBP, or EUR are automatically converted to {preferredCurrency} using live rates.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>
                  <strong>Budgets & Insights:</strong> Your spending limits, category analytics, and saving plans update immediately upon saving.
                </span>
              </li>
            </ul>
          </div>

          {/* Recent Entries mini list */}
          <div className="bg-white dark:bg-[#16171d] border border-slate-200/80 dark:border-[#22242d] rounded-2xl p-5 shadow-subtle dark:shadow-none space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#20222b]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Recently Recorded
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {recentTransactions.length} entries
              </span>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="space-y-2.5">
                {recentTransactions.map((tx) => {
                  const isExp = tx.type === 'expense';
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#121319] border border-slate-200/50 dark:border-[#22242e] text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                          {tx.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {tx.category} • {tx.date}
                        </p>
                      </div>
                      <span
                        className={`font-bold tabular-nums shrink-0 ${
                          isExp ? 'text-rose-600 dark:text-[#f87171]' : 'text-emerald-600 dark:text-[#22c55e]'
                        }`}
                      >
                        {isExp ? '-' : '+'}
                        {formatCurrency(tx.amount, tx.currency || 'NGN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">
                No recent entries. Add your first above!
              </p>
            )}
          </div>

          <div className="p-3 bg-emerald-50/70 dark:bg-[#102419] border border-emerald-200/60 dark:border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-[#22c55e]" />
            <span>End-to-end synchronized with your cloud Firestore profile.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
