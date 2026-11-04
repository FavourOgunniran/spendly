import React from 'react';

// Business Colorful Star/Cross Logo Mark from the screenshot
export const BusinessLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="5" fill="#ec4899" />
    <circle cx="22" cy="10" r="5" fill="#8b5cf6" />
    <circle cx="10" cy="22" r="5" fill="#3b82f6" />
    <circle cx="22" cy="22" r="5" fill="#06b6d4" />
  </svg>
);

export const DashlyLogo = BusinessLogo;
export const DonezoLogo = BusinessLogo;

// Sidebar Analytics Icon
export const AnalyticsIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2.5" y="2.5" width="6" height="6" rx="2" stroke={color} strokeWidth="1.75" />
    <rect x="11.5" y="2.5" width="6" height="6" rx="2" stroke={color} strokeWidth="1.75" />
    <rect x="2.5" y="11.5" width="6" height="6" rx="2" stroke={color} strokeWidth="1.75" />
    <rect x="11.5" y="11.5" width="6" height="6" rx="2" stroke={color} strokeWidth="1.75" />
  </svg>
);

export const DashboardIcon = AnalyticsIcon;

// Products Icon (Shopping box)
export const ProductsIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 6.5L10 3L16.5 6.5V13.5L10 17L3.5 13.5V6.5Z" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.5 6.5L10 10L16.5 6.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 10V17" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

export const TasksIcon = ProductsIcon;

// Messages Icon (Chat bubble)
export const MessagesIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 9.5C17 13.0899 13.866 16 10 16C8.75549 16 7.58784 15.702 6.5746 15.1764L3 16.5L4.17068 13.4149C3.42777 12.2882 3 10.9472 3 9.5C3 5.91015 6.13401 3 10 3C13.866 3 17 5.91015 17 9.5Z" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CalendarIcon = MessagesIcon;

// Customers Icon (User profile)
export const CustomersIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="6" r="3.5" stroke={color} strokeWidth="1.75" />
    <path d="M4 16C4 13 6.68629 11.5 10 11.5C13.3137 11.5 16 13 16 16" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

export const TeamIcon = CustomersIcon;

// Settings Icon
export const SettingsIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="3" stroke={color} strokeWidth="1.75" />
    <path d="M10 2.5V4.5M10 15.5V17.5M2.5 10H4.5M15.5 10H17.5M4.7 4.7L6.1 6.1M13.9 13.9L15.3 15.3M4.7 15.3L6.1 13.9M13.9 6.1L15.3 4.7" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

// Sign Out / Logout Icon
export const SignOutIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 3.5H4.5C3.94772 3.5 3.5 3.94772 3.5 4.5V15.5C3.5 16.0523 3.94772 16.5 4.5 16.5H7.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    <path d="M12 6.5L15.5 10L12 13.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 10H15" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

export const LogoutIcon = SignOutIcon;
export const HelpIcon = SettingsIcon;

// Stat Card Top-Right Icons
export const OrderBoxIcon = ({ size = 18, color = "#94a3b8" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3.5" y="3.5" width="13" height="13" rx="3.5" stroke={color} strokeWidth="1.75" />
  </svg>
);

export const ApprovedCheckIcon = ({ size = 18, color = "#94a3b8" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3.5" y="3.5" width="13" height="13" rx="3.5" stroke={color} strokeWidth="1.75" />
    <path d="M7 10L9 12L13 8" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DollarSignIcon = ({ size = 18, color = "#94a3b8" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3V17M13 6.5C13 5.11929 11.6569 4 10 4C8.34315 4 7 5.11929 7 6.5C7 7.88071 8.34315 9 10 9C11.6569 9 13 10.1193 13 11.5C13 12.8807 11.6569 14 10 14C8.34315 14 7 12.8807 7 11.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

export const CreditCardIcon = ({ size = 18, color = "#94a3b8" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2.5" y="4.5" width="15" height="11" rx="3" stroke={color} strokeWidth="1.75" />
    <path d="M2.5 8.5H17.5" stroke={color} strokeWidth="1.75" />
    <rect x="5.5" y="12" width="3" height="1" rx="0.5" fill={color} />
  </svg>
);

// Wallet Icon for Paid Invoices
export const WalletIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V9H4V7Z" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    <rect x="4" y="9" width="16" height="10" rx="2" stroke={color} strokeWidth="1.75" />
    <circle cx="15" cy="14" r="1.5" fill={color} />
  </svg>
);

// Money Bag Icon for Funds Received
export const MoneyBagIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4C10.5 4 9 5 8.5 6.5L6.5 13C5.5 16 7 19 12 19C17 19 18.5 16 17.5 13L15.5 6.5C15 5 13.5 4 12 4Z" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 8H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 11V16M13.5 12.5C13.5 11.6716 12.8284 11 12 11C11.1716 11 10.5 11.6716 10.5 12.5C10.5 13.3284 11.1716 14 12 14C12.8284 14 13.5 14.6716 13.5 15.5C13.5 16.3284 12.8284 17 12 17C11.1716 17 10.5 16.3284 10.5 15.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Refresh / Reload Icon
export const RefreshIcon = ({ size = 16, color = "#94a3b8" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 10C16 13.3137 13.3137 16 10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C12.1931 4 14.1197 5.17835 15.1764 6.9416" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    <path d="M16 4V7H13" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Sun Icon for Light Theme
export const SunIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="3.5" stroke={color} strokeWidth="1.75" />
    <path d="M10 2.5V4.5M10 15.5V17.5M2.5 10H4.5M15.5 10H17.5M4.7 4.7L6.1 6.1M13.9 13.9L15.3 15.3M4.7 15.3L6.1 13.9M13.9 6.1L15.3 4.7" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

// Moon Icon for Dark Theme
export const MoonIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.29 13.27A8 8 0 0 1 6.73 2.71 8 8 0 1 0 17.29 13.27Z" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Calendar Icon for Header Date Picker
export const DateRangeCalendarIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2.5" y="3.5" width="11" height="10" rx="2" stroke={color} strokeWidth="1.25" />
    <path d="M2.5 6.5H13.5" stroke={color} strokeWidth="1.25" />
    <path d="M5 2V4" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
    <path d="M11 2V4" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

// Other Icon aliases for compatibility
export const ArrowUpRightIcon = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 10.5L10.5 3.5M10.5 3.5H4.5M10.5 3.5V9.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const SearchIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="6" stroke={color} strokeWidth="1.75" />
    <path d="M13.5 13.5L17.5 17.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);
export const MailIcon = MessagesIcon;
export const BellIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2.5C7.51472 2.5 5.5 4.51472 5.5 7V10.5L4 13.5H16L14.5 10.5V7C14.5 4.51472 12.4853 2.5 10 2.5Z" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 15C8 16.1046 8.89543 17 10 17C11.1046 17 12 16.1046 12 15" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);
export const VideoCameraIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2.5" y="4.5" width="10.5" height="11" rx="2.5" fill={color} />
    <path d="M13.5 8L17.5 5.5V14.5L13.5 12V8Z" fill={color} />
  </svg>
);
export const ApiEndpointIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#eff6ff" />
    <path d="M6 14L10 8M14 16L18 10" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
export const OnboardingFlowIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#f0fdfa" />
    <circle cx="12" cy="12" r="5" stroke="#0d9488" strokeWidth="2" />
  </svg>
);
export const BuildDashboardIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#fffbeb" />
    <path d="M12 6V18M6 12H18" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
export const OptimizePageIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#fefce8" />
    <circle cx="12" cy="12" r="3" fill="#eab308" />
  </svg>
);
export const TestingIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#f5f3ff" />
    <circle cx="12" cy="12" r="3" fill="#7c3aed" />
  </svg>
);
