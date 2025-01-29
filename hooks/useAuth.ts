import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user?.email || 'No user');
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    console.log('Attempting sign in...');
    try {
      setError(null);
      setLoading(true);
      console.log('Opening Google popup...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Sign in successful:', result.user.email);
    } catch (error: any) {
      console.error('Error signing in:', error.code, error.message);
      setError(error.message);
      if (error.code === 'auth/popup-blocked') {
        alert('Please allow popups for this site to sign in with Google');
      } else if (error.code === 'auth/configuration-not-found') {
        console.error('Firebase configuration error - check your settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      console.log('Sign out successful');
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, signIn, logOut };
} 