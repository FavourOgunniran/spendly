export type TransactionType = 'income' | 'expense';

export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR' | string;

export type RecurrenceInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  locale: string;
}

export type TransactionCategory =
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Food & Dining'
  | 'Housing & Rent'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Utilities'
  | 'Healthcare'
  | 'Education'
  | 'Other'
  | string;

export interface CategoryItem {
  id: string;
  name: string;
  type: TransactionType;
  icon: string; // Lucide icon identifier string (e.g. 'UtensilsCrossed', 'Car', etc.)
  color: string; // Hex color code
  group: string; // e.g. 'Living & Housing', 'Food & Dining', 'Transportation', 'Lifestyle', 'Financial & Work', 'Personal Care', 'Custom'
  isCustom?: boolean;
  description?: string;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  currency?: CurrencyCode;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  description?: string;
  notes?: string;
  isRecurring?: boolean;
  recurringInterval?: RecurrenceInterval;
  exchangeRate?: number;
  convertedCurrency?: CurrencyCode;
  convertedAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type NewTransactionInput = Omit<Transaction, 'id'>;

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  transactionCount?: number;
  currency?: CurrencyCode;
}

export type TransactionSummary = FinancialSummary;

export type BudgetStatusLevel = 'safe' | 'warning' | 'critical' | 'exceeded' | 'unset';

export interface BudgetStatus {
  level: BudgetStatusLevel;
  message: string;
  colorClass: string;
  badgeClass: string;
  progressGradient: string;
}

export interface CategoryBudget {
  id: string;
  category: string;
  limit: number;
  currency?: CurrencyCode;
  period?: 'monthly' | 'weekly' | 'yearly';
  periodMonth?: string; // 'YYYY-MM', e.g. '2026-08'
  month?: number;       // 1 - 12
  year?: number;        // e.g. 2026
}

export interface MonthBudgetConfig {
  periodMonth: string; // 'YYYY-MM', e.g. '2026-08'
  month: number;       // 1 - 12
  year: number;        // e.g. 2026
  monthlyBudget: number;
  categoryBudgets: CategoryBudget[];
  updatedAt?: string;
}

export interface CategoryBudgetProgress {
  id?: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  statusLevel: BudgetStatusLevel;
  color: string;
  transactionCount: number;
}

export type InsightType =
  | 'highest_spend'
  | 'near_limit'
  | 'over_budget'
  | 'remaining_runway'
  | 'spending_pace'
  | 'healthy_budget'
  | 'spending_spike'
  | 'frequent_merchant'
  | 'smart_saving';

export interface BudgetInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  severity: 'normal' | 'warning' | 'danger' | 'success';
  value?: string;
  categoryName?: string;
}

export interface BudgetMetrics {
  monthlyBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  percentageUsed: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  status: BudgetStatus;
  daysInMonth: number;
  daysPassed: number;
  daysRemaining: number;
  dailyBurnRate: number;
  projectedMonthlySpend: number;
  projectedBudgetDifference: number;
  categoryBudgets: CategoryBudgetProgress[];
  unbudgetedCategories: CategoryBudgetProgress[];
  insights: BudgetInsight[];
  selectedMonth: string;
  currency?: CurrencyCode;
}

