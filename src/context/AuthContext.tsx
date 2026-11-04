import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  ActionCodeSettings,
  AuthError,
} from 'firebase/auth';
import { auth } from '../firebase';
import { createUserProfileDocument } from '../services/firebaseService';

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName?: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  verifyResetCode: (oobCode: string) => Promise<string>;
  confirmResetPassword: (oobCode: string, newPassword: string) => Promise<void>;
  formatAuthError: (error: unknown) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const formatAuthError = (error: unknown): string => {
  if (!error) return 'An unknown error occurred.';
  const authErr = error as AuthError;
  switch (authErr.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in instead.';
    case 'auth/invalid-email':
      return 'The email address entered is invalid.';
    case 'auth/missing-email':
      return 'Please enter your email address.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in the Firebase Console.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed attempts. Try again later.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    case 'auth/expired-action-code':
      return 'The password reset link has expired. Please request a new one.';
    case 'auth/invalid-action-code':
      return 'The password reset link is invalid or has already been used.';
    case 'auth/unauthorized-continue-uri':
      return 'The redirection domain is not authorized. Please try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in your Firebase Console. Please add vercel.app to Authorized Domains in Firebase Authentication Settings.';
    default:
      return authErr.message || 'Authentication failed. Please try again.';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, displayName?: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    const cleanName = displayName ? displayName.trim() : '';

    if (cleanName) {
      await updateProfile(user, {
        displayName: cleanName,
      });
      // Force update user state with new displayName
      setCurrentUser({ ...user, displayName: cleanName } as User);
    }

    // Initialize clean user document in Firestore without financial artifacts
    await createUserProfileDocument(user.uid, user.email || email.trim(), cleanName);

    return user;
  };

  const login = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }

    // Configure dynamic actionCodeSettings pointing back to Spendly login
    // Ensures the user returns to Spendly whether testing locally or on the deployed app
    const continueUrl =
      typeof window !== 'undefined' && window.location?.origin
        ? `${window.location.origin}/login`
        : 'https://spendly-expense-tracker-4ddb2.firebaseapp.com/login';

    const actionCodeSettings: ActionCodeSettings = {
      url: continueUrl,
      handleCodeInApp: false,
    };

    try {
      await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
    } catch (err: unknown) {
      const authErr = err as AuthError;
      // If the domain is not in Firebase authorized continue URIs, gracefully retry without continueUrl
      if (authErr?.code === 'auth/unauthorized-continue-uri') {
        await sendPasswordResetEmail(auth, cleanEmail);
        return;
      }
      // Generic Security Behavior: If Firebase has email enumeration protection disabled
      // and returns auth/user-not-found, resolve without throwing so the client emits
      // the generic "If an account exists, we'll send a reset link" confirmation.
      if (authErr?.code === 'auth/user-not-found') {
        return;
      }
      throw err;
    }
  };

  const verifyResetCode = async (oobCode: string): Promise<string> => {
    return await verifyPasswordResetCode(auth, oobCode);
  };

  const confirmResetPassword = async (oobCode: string, newPassword: string): Promise<void> => {
    await confirmPasswordReset(auth, oobCode, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        signup,
        login,
        logout,
        sendPasswordReset,
        verifyResetCode,
        confirmResetPassword,
        formatAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

