import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CategoryProvider } from './context/CategoryContext';
import { TransactionProvider } from './context/TransactionContext';
import { ThemeProvider } from './context/ThemeContext';
import { BudgetProvider } from './context/BudgetContext';
import { ToastProvider } from './context/ToastContext';
import { SessionTimeoutProvider } from './context/SessionTimeoutContext';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CurrencyProvider>
            <CategoryProvider>
              <TransactionProvider>
                <BudgetProvider>
                  <SessionTimeoutProvider>
                    <RouterProvider router={router} />
                  </SessionTimeoutProvider>
                </BudgetProvider>
              </TransactionProvider>
            </CategoryProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
