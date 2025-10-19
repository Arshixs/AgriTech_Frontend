import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// The AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Check for a stored token when the app loads
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          // In a real app, you'd verify the token with your backend.
          // For now, we'll just set a dummy user if a token exists.
          setUser({ id: 1, name: 'Farmer' }); // Mock user
        }
      } catch (e) {
        console.error('Failed to load user token:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    // This effect handles redirection
    if (isLoading) return; // Don't redirect while checking auth

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // If user is not signed in and not in the (auth) group, redirect to login.
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // If user is signed in and in the (auth) group, redirect to the main app (home).
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading, router]);

  const signIn = async (userData) => {
    // 1. Send data to your Node/Express backend to verify/create user
    // 2. On success, your backend should return a token.
    
    // Mocking successful login:
    await SecureStore.setItemAsync('userToken', 'mock-token-123');
    setUser(userData);
    router.replace('/(tabs)'); // Redirect to the main app
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setUser(null);
    router.replace('/(auth)/login'); // Redirect to login
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};