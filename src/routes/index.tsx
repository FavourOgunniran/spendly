import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PublicRoute } from '../components/auth/PublicRoute';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { TransactionsPage } from '../pages/Transactions/TransactionsPage';
import { AddExpensePage } from '../pages/Transactions/AddExpensePage';
import { CategoriesPage } from '../pages/Categories/CategoriesPage';
import { AnalyticsPage } from '../pages/Analytics/AnalyticsPage';
import { BudgetPage } from '../pages/Budget/BudgetPage';
import { SettingsPage } from '../pages/Settings/SettingsPage';
import { LoginPage } from '../pages/Auth/LoginPage';
import { SignUpPage } from '../pages/Auth/SignUpPage';
import { ForgotPasswordPage } from '../pages/Auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/Auth/ResetPasswordPage';
import { AuthTestPage } from '../pages/Auth/AuthTestPage';

export const router = createBrowserRouter([
  // Public-only Auth Routes
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <SignUpPage />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PublicRoute>
        <ResetPasswordPage />
      </PublicRoute>
    ),
  },

  // Dedicated Dev Testing Route
  {
    path: '/auth-test',
    element: <AuthTestPage />,
  },

  // Protected Application Routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      // Expenses / Transactions
      {
        path: 'expenses',
        element: <TransactionsPage />,
      },
      {
        path: 'transactions',
        element: <TransactionsPage />,
      },
      // Add Expense
      {
        path: 'add-expense',
        element: <AddExpensePage />,
      },
      // Categories Management
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      // Insights / Analytics
      {
        path: 'insights',
        element: <AnalyticsPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      // Budgeting
      {
        path: 'budget',
        element: <BudgetPage />,
      },
      // Settings
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },

  // Fallback Wildcard
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
