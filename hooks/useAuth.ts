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
    console.log('Starting auth initialization...');

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      console.log('Starting sign in process...');
      setLoading(true);
      setError(null);
      
      // Configure additional OAuth parameters
      googleProvider.setCustomParameters({
        prompt: 'select_account',
        login_hint: '',
        redirect_uri: 'https://muse.colemanm.xyz/__/auth/handler'
      });

      const result = await signInWithPopup(auth, googleProvider);
      console.log('Sign in successful:', result.user.email);
    } catch (error: any) {
      console.error('Error in sign in:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, signIn, logOut };
} 