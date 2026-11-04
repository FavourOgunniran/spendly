import React from 'react';
import { SpendingAlert } from '../../utils/alertCalculations';
import {
  AlertTriangle,
  AlertOctagon,
  TrendingDown,
  PieChart,
  ShieldCheck,
  BellRing,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

interface SmartAlertsSectionProps {
  alerts: SpendingAlert[];
}

export const SmartAlertsSection: React.FC<SmartAlertsSectionProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-5 bg-white dark:bg-[#16171d] border border-slate-200/80 dark:border-[#22242d] rounded-2xl shadow-subtle dark:shadow-none flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#14291f] text-emerald-600 dark:text-[#4ade80] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            All Spending Within Healthy Limits
          </h4>
          <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            No budget overruns or excessive spending spikes detected. Keep up the good work!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-[#1e2028] text-indigo-600 dark:text-[#8e8bf5] flex items-center justify-center">
          <BellRing className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Smart Spending Alerts
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Real-time notifications triggered by your budget thresholds and weekly trends.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {alerts.map((alert) => {
          const isDanger = alert.severity === 'danger';
          const isWarning = alert.severity === 'warning';
          const isSuccess = alert.severity === 'success';

          const Icon = isDanger
            ? AlertOctagon
            : isWarning
            ? AlertTriangle
            : isSuccess
            ? TrendingDown
            : PieChart;

          const cardBorder = isDanger
            ? 'border-rose-200/80 dark:border-rose-900/40 bg-rose-50/40 dark:bg-[#201518]'
            : isWarning
            ? 'border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-[#201b15]'
            : isSuccess
            ? 'border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-[#14221a]'
            : 'border-slate-200/80 dark:border-[#22242d] bg-white dark:bg-[#16171d]';

          const iconStyles = isDanger
            ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-[#f87171]'
            : isWarning
            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-[#fbbf24]'
            : isSuccess
            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-[#4ade80]'
            : 'bg-indigo-50 dark:bg-[#1f2233] text-indigo-600 dark:text-[#8e8bf5]';

          const badgeStyles = isDanger
            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
            : isWarning
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
            : isSuccess
            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
            : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300';

          return (
            <div
              key={alert.id}
              className={clsx(
                'p-4 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all shadow-subtle dark:shadow-none',
                cardBorder
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', iconStyles)}>
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    {alert.title}
                  </span>
                </div>
                {alert.metricLabel && (
                  <span className={clsx('text-[10.5px] font-extrabold px-2 py-0.5 rounded-lg shrink-0', badgeStyles)}>
                    {alert.metricLabel}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {alert.message}
              </p>

              <div className="pt-1 flex items-center justify-end">
                <Link
                  to={alert.type.startsWith('budget') ? '/budget' : '/expenses'}
                  className="text-[11px] font-bold text-indigo-600 dark:text-[#8e8bf5] hover:underline"
                >
                  {alert.type.startsWith('budget') ? 'Review Budget →' : 'View Transactions →'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
