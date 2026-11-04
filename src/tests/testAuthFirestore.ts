import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { sanitizePayload } from '../services/firebaseService';

async function testAuthenticatedFirestoreWrite() {
  console.log('--- TESTING AUTHENTICATED FIRESTORE WRITE ---');
  const testEmail = `testuser_${Date.now()}@spendly.app`;
  const testPassword = 'Password123!';

  let userCredential;
  try {
    console.log(`Creating test user: ${testEmail}`);
    userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✓ User created with UID:', userCredential.user.uid);
  } catch (err: any) {
    console.log('Could not create user, attempting sign in...', err?.message);
    try {
      userCredential = await signInWithEmailAndPassword(auth, 'user@spendly.app', 'password123');
      console.log('✓ Signed in with existing user UID:', userCredential.user.uid);
    } catch (loginErr: any) {
      console.error('✗ Login failed:', loginErr?.message);
      return;
    }
  }

  const userId = userCredential.user.uid;
  const testTxId = `tx-auth-${Date.now()}`;

  const payload = {
    id: testTxId,
    title: 'Auth Test Transaction',
    amount: 10000,
    currency: 'NGN',
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-08-25',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const clean = sanitizePayload(payload);
  console.log('Writing to Firestore path:', `users/${userId}/transactions/${testTxId}`);

  try {
    const docRef = doc(db, 'users', userId, 'transactions', testTxId);
    await setDoc(docRef, clean, { merge: true });
    console.log('✓ SUCCESS: Authenticated user write to Firestore succeeded!');
  } catch (err: any) {
    console.error('✗ Authenticated Firestore write threw error:');
    console.error('Message:', err?.message);
    console.error('Code:', err?.code);
    console.error('Full Error:', err);
  }
}

testAuthenticatedFirestoreWrite();
