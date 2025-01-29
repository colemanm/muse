import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
} from '@env';

const firebaseConfig = {
  apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('Firebase config:', firebaseConfig);

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider(); 