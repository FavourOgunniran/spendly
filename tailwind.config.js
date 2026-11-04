/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        spendly: {
          bg: '#0e0f13',
          sidebar: '#0a0b0e',
          card: '#16171d',
          'card-border': '#22242d',
          'card-hover': '#1b1d24',
          lavender: '#8e8bf5',
          'lavender-light': '#9e9bf8',
          'lavender-text': '#1d1760',
          'lavender-sub': '#4c469b',
          green: '#22c55e',
          'green-bg': '#14291f',
          rose: '#f87171',
          'rose-bg': '#2e181e',
          indigo: '#6366f1',
          'indigo-bg': '#1b1f38',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.2)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
        'float': '0 12px 36px -4px rgba(0, 0, 0, 0.5)',
        'lavender': '0 8px 24px -4px rgba(142, 139, 245, 0.25)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
