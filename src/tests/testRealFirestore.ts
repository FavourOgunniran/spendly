import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { sanitizePayload } from '../services/firebaseService';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || '',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testLiveFirestoreWrite() {
  console.log('--- TESTING REAL FIRESTORE WRITE ---');
  const testUserId = 'test-debug-user-123';
  const testTxId = `tx-debug-${Date.now()}`;

  const payload = {
    id: testTxId,
    title: 'Test Debug Transaction',
    amount: 5000,
    currency: 'NGN',
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-08-25',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const clean = sanitizePayload(payload);
  console.log('Sending sanitized payload:', clean);

  try {
    const docRef = doc(db, 'users', testUserId, 'transactions', testTxId);
    console.log('Executing setDoc...');
    await setDoc(docRef, clean, { merge: true });
    console.log('✓ Firestore setDoc resolved successfully without error!');
  } catch (err: any) {
    console.error('✗ Firestore setDoc threw error:');
    console.error('Message:', err?.message);
    console.error('Code:', err?.code);
    console.error('Full Error:', err);
  }
}

testLiveFirestoreWrite();
