// File: src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router'; // Make sure this is imported

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
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    // This logic is fine - it just loads the user on startup
    const loadUser = async () => {
      let userString = null;
      try {
        userString = await SecureStore.getItemAsync('user'); 
        if (userString) {
          setUser(JSON.parse(userString)); 
        }
      } catch (e) {
        console.error('Failed to load user data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // const signInFarmer = async (userData, token) => {
  const signInFarmer = async (userData) => {
    const farmerUser = { ...userData, role: 'farmer' };
    await SecureStore.setItemAsync('user', JSON.stringify(farmerUser));
    setUser(farmerUser);
    router.replace('/(tabs)');
  };

  
  const signInVendor = async (vendorData) => {
    const vendorUser = { ...vendorData, role: 'vendor' };
    await SecureStore.setItemAsync('user', JSON.stringify(vendorUser));
    setUser(vendorUser);
    router.replace('/(vendor-tabs)'); // Redirect to vendor dashboard
  };

  const signInBuyer = async (buyerData) => {
    const buyerUser = { ...buyerData, role: 'buyer' };
    await SecureStore.setItemAsync('user', JSON.stringify(buyerUser));
    setUser(buyerUser);
    router.replace('/(buyer-tabs)'); // Redirect to buyer dashboard
  };

  const signInGovt = async (govtData) => {
    const govtUser = { ...govtData, role: 'govt' };
    await SecureStore.setItemAsync('user', JSON.stringify(govtUser));
    setUser(govtUser);
    router.replace('/(govt-tabs)'); // Redirect to govt dashboard
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('user');
    setUser(null);
    router.replace('../'); // Redirect to root (Role Selection)
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        signInFarmer, 
        signInVendor,
        signInBuyer, 
        signInGovt, 
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};