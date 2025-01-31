import { useState, useEffect } from 'react';
import { 
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Just need auth state listener, no redirect handling
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser?.email || 'No user');
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      console.log('Starting sign in...');
      setLoading(true);
      setError(null);

      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, googleProvider);
      console.log('Sign in successful:', result.user.email);
      setUser(result.user);
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, signIn, logOut };
} 