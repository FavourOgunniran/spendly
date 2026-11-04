# Spendly

> A personal finance and expense tracking web application built with React and Firebase.

Spendly is a modern, responsive personal finance dashboard designed to help individuals track their income and expenses, manage category-level budgets, monitor cash flow, and gain actionable insights into their financial health.

---

## Features

- **Dashboard Overview**: Real-time snapshot of total balance, income, expenses, and savings rate with quick-access action buttons and recent transactions.
- **Transaction Management**: Add, view, filter, sort, and categorize income and expense records with customizable dates and descriptions.
- **Budgeting & Limits**: Set monthly and category-specific spending limits with visual progress indicators and budget threshold alerts.
- **Visual Analytics**: Interactive charts powered by Recharts, illustrating spending distributions, expense categories, and monthly trends.
- **Custom Categories**: Organize finances with customized categories, colors, and icons.
- **Multi-Currency Support**: Switch between currencies (NGN, USD, EUR, GBP, and more) with automatic formatting across the dashboard.
- **Secure Authentication**: User registration, login, and password reset workflows powered by Firebase Authentication with automatic session timeout protection.
- **Light & Dark Mode**: Seamless toggle between Light Sage and Deep Dark themes with persistence.
- **Responsive Layout**: Designed for seamless experiences across desktop, tablet, and mobile devices.

---

## Technology Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), PostCSS, Autoprefixer
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Cloud Firestore, Hosting)
- **Deployment**: [Netlify](https://www.netlify.com/) (with Vercel and Firebase Hosting configurations included)

---

## Project Structure

```
spendly/
├── public/                 # Static assets and SPA redirect rules
├── src/
│   ├── assets/             # Vector illustrations and avatars
│   ├── components/         # Modular React components (layout, forms, charts, modals)
│   ├── config/             # Firebase configuration and session timeout settings
│   ├── context/            # React Context providers (Auth, Currency, Budget, etc.)
│   ├── data/               # Default categories and seed data
│   ├── hooks/              # Custom hooks for state, storage, and screen size
│   ├── pages/              # Primary routes (Dashboard, Transactions, Budget, Analytics, Auth)
│   ├── routes/             # Client-side router configuration
│   ├── services/           # Firebase Authentication and Firestore service layer
│   ├── types/              # TypeScript interfaces and data models
│   ├── utils/              # Currency formatting, date helpers, analytics calculations
│   ├── App.tsx             # Root component with provider wrappers
│   ├── firebase.js         # Firebase app initialization
│   ├── index.css           # Global Tailwind CSS layers and custom styles
│   └── main.tsx            # Application entry point
├── .env.example            # Environment variables template
├── firestore.rules         # Security rules for Cloud Firestore
├── netlify.toml            # Netlify build and routing configuration
└── vite.config.ts          # Vite build configuration
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- A [Firebase](https://firebase.google.com/) account and project

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/spendly.git
   cd spendly
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

---

### Environment Configuration

1. Copy the example environment file to create your local `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase project credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

---

### Firebase Setup

1. **Create a Firebase Project**:
   - Navigate to the [Firebase Console](https://console.firebase.google.com/) and create a new project.

2. **Enable Authentication**:
   - In the sidebar, select **Authentication** → **Get Started**.
   - Under the **Sign-in method** tab, enable **Email/Password**.

3. **Enable Cloud Firestore**:
   - In the sidebar, select **Firestore Database** → **Create Database**.
   - Start in production mode.

4. **Deploy Security Rules**:
   - Apply the rules provided in `firestore.rules`:
   ```javascript
   rules_version = '2';

   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;

         match /{allPaths=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```
   *(You can deploy these via the Firebase CLI using `firebase deploy --only firestore:rules` or paste them into the Firestore Rules editor in the Firebase Console).*

---

### Running Locally

Start the local development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

### Building for Production

Compile TypeScript and build the production-ready assets:
```bash
npm run build
```

To locally preview the production build:
```bash
npm run preview
```

---

## Deployment

### Netlify (Recommended)

This repository includes a preconfigured `netlify.toml` file.

1. Connect your repository to [Netlify](https://www.netlify.com/).
2. The build settings are configured automatically:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. In Netlify's **Site settings** → **Environment variables**, add all `VITE_FIREBASE_*` variables from your `.env` file.
4. Deploy the site.

### Alternative Hosting (Vercel & Firebase Hosting)

Configuration files for Vercel (`vercel.json`) and Firebase Hosting (`firebase.json`) are also included in the repository. Set the corresponding environment variables in your hosting provider's dashboard.

---

## Security

- **User Data Isolation**: Firestore security rules ensure that authenticated users can strictly read and write only their own records (`/users/{userId}/*`). No cross-tenant access is permitted.
- **Client-Side Secrets Protection**: All sensitive API credentials remain in environment variables and are excluded from Git version control via `.gitignore`.
- **Session Protection**: Automatic inactivity detection and session timeouts safeguard sensitive financial data when left unattended.

---

## Screenshots

<!-- Add application screenshots or animated demos here -->
| Dashboard | Analytics |
|:---:|:---:|
| *(Add Dashboard screenshot here)* | *(Add Analytics screenshot here)* |

| Budget Tracker | Transactions |
|:---:|:---:|
| *(Add Budget screenshot here)* | *(Add Transactions screenshot here)* |

---

## License

This project is licensed under the [MIT License](LICENSE).
