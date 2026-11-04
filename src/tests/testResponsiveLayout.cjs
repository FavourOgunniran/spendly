const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('📱 RUNNING RESPONSIVE DESIGN & MOBILE VIEWPORT AUDIT TEST SUITE');
console.log('================================================================\n');

let allPassed = true;

function assert(condition, testName, detail) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    allPassed = false;
  }
}

// 1. Viewport Meta in index.html & Global Layout
console.log('[AUDIT 1] Viewport Meta Tag & Global Layout Constraints...');
const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf-8');
assert(
  indexHtml.includes('name="viewport" content="width=device-width, initial-scale=1.0"'),
  'HTML contains standard responsive viewport meta tag'
);

const appLayoutContent = fs.readFileSync(
  path.resolve('src/components/layout/AppLayout.tsx'),
  'utf-8'
);
assert(
  appLayoutContent.includes('px-2.5 sm:px-6 lg:px-8'),
  'AppLayout main content has responsive horizontal padding (px-2.5 on 320px)'
);
assert(
  appLayoutContent.includes('flex-1 flex flex-col min-w-0'),
  'AppLayout main content wrapper has min-w-0 to prevent child grid/flex expansion'
);

// 2. Header & Currency Selector Responsiveness
console.log('\n[AUDIT 2] Header & Currency Selector Responsiveness on 320px-430px...');
const headerContent = fs.readFileSync(
  path.resolve('src/components/layout/Header.tsx'),
  'utf-8'
);
assert(
  headerContent.includes('px-2.5 sm:px-6 lg:px-8'),
  'Header has responsive horizontal padding (px-2.5 on mobile, px-6/8 on desktop)'
);
assert(
  headerContent.includes('min-w-0 flex-1'),
  'Page title container has min-w-0 flex-1 to prevent pushing action buttons off-screen'
);
assert(
  headerContent.includes('text-sm min-[360px]:text-base sm:text-lg lg:text-xl'),
  'Page title text scales gracefully across 320px, 360px, and desktop'
);
assert(
  headerContent.includes('min-w-[36px] min-h-[36px]'),
  'Mobile menu toggle button meets touch target accessibility (min 36x36px)'
);

const currencyContent = fs.readFileSync(
  path.resolve('src/components/ui/CurrencySelector.tsx'),
  'utf-8'
);
assert(
  currencyContent.includes('h-8 sm:h-10 px-1.5 sm:px-3'),
  'CurrencySelector button is compacted on mobile viewports'
);
assert(
  currencyContent.includes('hidden min-[360px]:inline'),
  'Decorative vertical pipe divider is hidden on < 360px viewports'
);
assert(
  currencyContent.includes('w-52 sm:w-64 max-w-[calc(100vw-1.5rem)]'),
  'CurrencySelector dropdown menu width is bounded on mobile to prevent overflow'
);

// 3. Sidebar Off-Canvas Drawer Behavior
console.log('\n[AUDIT 3] Mobile Navigation Drawer Constraints...');
const sidebarContent = fs.readFileSync(
  path.resolve('src/components/layout/Sidebar.tsx'),
  'utf-8'
);
assert(
  sidebarContent.includes('max-w-[85vw]'),
  'Sidebar drawer uses max-w-[85vw] so user can always see and tap backdrop on 320px'
);
assert(
  sidebarContent.includes('-translate-x-full') && sidebarContent.includes('lg:translate-x-0'),
  'Sidebar is completely off-screen by default on mobile and sticky on desktop'
);
assert(
  !sidebarContent.includes('h-screen sticky top-0'),
  'Sidebar does not have unprefixed sticky in base classes, preventing mobile flex width reservation'
);
assert(
  sidebarContent.includes('min-w-[36px] min-h-[36px]'),
  'Sidebar mobile close button meets touch target requirements'
);

// 4. Dashboard Hero & Balance Display
console.log('\n[AUDIT 4] Dashboard Balance Card, Inflow/Outflow, & Donut Chart...');
const dashboardContent = fs.readFileSync(
  path.resolve('src/pages/Dashboard/DashboardPage.tsx'),
  'utf-8'
);
assert(
  dashboardContent.includes('w-full sm:w-auto'),
  'Hero action buttons flex naturally across full width on mobile'
);
assert(
  dashboardContent.includes('grid grid-cols-1 min-[380px]:grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto'),
  'Inflow vs Outflow pills adapt with responsive columns avoiding number truncation on 320px'
);
assert(
  dashboardContent.includes('max-w-[130px] truncate'),
  'Spending donut center total uses max-w and truncation to prevent overflowing circle hole'
);

// 5. Transaction Item & List Responsiveness
console.log('\n[AUDIT 5] Transaction Item & List Layout on Mobile Viewports...');
const txItemContent = fs.readFileSync(
  path.resolve('src/components/transactions/TransactionItem.tsx'),
  'utf-8'
);
assert(
  txItemContent.includes('min-w-0 flex-1'),
  'Transaction item content uses min-w-0 flex-1 to prevent title overflow'
);
assert(
  txItemContent.includes('min-w-[34px] min-h-[34px]'),
  'Mobile Edit and Delete buttons meet touch target accessibility requirements'
);

const txListContent = fs.readFileSync(
  path.resolve('src/components/transactions/TransactionList.tsx'),
  'utf-8'
);
assert(
  txListContent.includes('flex-1 min-w-0'),
  'Transaction search input container has min-w-0 to prevent flex expansion'
);
assert(
  txListContent.includes('flex-1 sm:flex-initial text-center justify-center'),
  'Transaction filter pills (All, Expenses, Income) flex evenly across mobile width'
);
assert(
  txListContent.includes('grid grid-cols-1 min-[340px]:grid-cols-2 gap-2'),
  'Advanced filter amount inputs reflow responsively on 320px'
);

// 6. Budgets & Month Navigators
console.log('\n[AUDIT 6] Budget Page & Month Navigator Layout...');
const budgetPageContent = fs.readFileSync(
  path.resolve('src/pages/Budget/BudgetPage.tsx'),
  'utf-8'
);
assert(
  budgetPageContent.includes('min-w-[105px] sm:min-w-[130px]'),
  'Budget month navigator uses compact min-width on 320px viewports'
);

const budgetCardContent = fs.readFileSync(
  path.resolve('src/components/budget/BudgetOverviewCard.tsx'),
  'utf-8'
);
assert(
  budgetCardContent.includes('text-sm min-[360px]:text-base sm:text-xl'),
  'Budget metrics typography scales down gracefully on 320px screens'
);

const budgetCategoryContent = fs.readFileSync(
  path.resolve('src/components/budget/BudgetCategoryBreakdown.tsx'),
  'utf-8'
);
assert(
  budgetCategoryContent.includes('p-3.5 sm:p-5'),
  'Category budget cards use compact padding on mobile'
);
assert(
  budgetCategoryContent.includes('w-full sm:w-auto'),
  'BudgetCategoryBreakdown tab pills and add button flex responsive on mobile'
);

// 7. Analytics & Chart Constraints
console.log('\n[AUDIT 7] Analytics & Recharts Responsive Constraints...');
const analyticsPageContent = fs.readFileSync(
  path.resolve('src/pages/Analytics/AnalyticsPage.tsx'),
  'utf-8'
);
assert(
  analyticsPageContent.includes('lg:col-span-6 min-w-0 w-full'),
  'Analytics chart columns have min-w-0 w-full to bound Recharts ResponsiveContainer'
);

const barChartContent = fs.readFileSync(
  path.resolve('src/components/analytics/IncomeExpenseBarChart.tsx'),
  'utf-8'
);
assert(
  barChartContent.includes('w-full min-w-0'),
  'IncomeExpenseBarChart container has w-full min-w-0 to prevent layout overflow'
);

const pieChartContent = fs.readFileSync(
  path.resolve('src/components/analytics/CategoryExpenseChart.tsx'),
  'utf-8'
);
assert(
  pieChartContent.includes('max-w-[110px] truncate'),
  'CategoryExpenseChart center callout has max-w truncation to prevent donut overflow'
);

// 8. Categories, Modals & Dialogs on 320px
console.log('\n[AUDIT 8] Modals & Category Dialog Grids...');
const modalContent = fs.readFileSync(
  path.resolve('src/components/ui/Modal.tsx'),
  'utf-8'
);
assert(
  modalContent.includes('p-2.5 sm:p-6'),
  'Modal backdrop padding is reduced to p-2.5 on mobile to maximize viewport area'
);

const categoryModalContent = fs.readFileSync(
  path.resolve('src/components/categories/CategoryModal.tsx'),
  'utf-8'
);
assert(
  categoryModalContent.includes('w-7 h-7 sm:w-8 sm:h-8'),
  'Color palette buttons use responsive sizes (w-7 h-7 on 320px)'
);
assert(
  categoryModalContent.includes('w-8 h-8 sm:w-9 sm:h-9'),
  'Icon picker buttons use responsive sizes (w-8 h-8 on 320px)'
);

console.log('\n================================================================');
if (allPassed) {
  console.log('🎉 ALL 8 RESPONSIVE VIEWPORT AUDIT CHECKS PASSED 100%!');
} else {
  console.error('❌ SOME CHECKS FAILED!');
  process.exit(1);
}
console.log('================================================================\n');
