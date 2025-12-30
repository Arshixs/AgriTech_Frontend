// File: src/context/AuthContext.js

import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      let userString = null;
      try {
        userString = await SecureStore.getItemAsync("user");
        if (userString) {
          setUser(JSON.parse(userString));
        }
      } catch (e) {
        console.error("Failed to load user data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const signInFarmer = async (userData) => {
    const farmerUser = { ...userData, role: "farmer" };
    await SecureStore.setItemAsync("user", JSON.stringify(farmerUser));
    setUser(farmerUser);
    router.replace("/(tabs)");
  };

  const signInVendor = async (vendorData) => {
    const vendorUser = { ...vendorData, role: "vendor" };
    await SecureStore.setItemAsync("user", JSON.stringify(vendorUser));
    setUser(vendorUser);
    router.replace("/(vendor-tabs)");
  };

  const signInBuyer = async (buyerData) => {
    const buyerUser = { ...buyerData, role: "buyer" };
    await SecureStore.setItemAsync("user", JSON.stringify(buyerUser));
    setUser(buyerUser);
    router.replace("/(buyer-tabs)");
  };

  const signInGovt = async (govtData) => {
    const govtUser = { ...govtData, role: "govt" };
    await SecureStore.setItemAsync("user", JSON.stringify(govtUser));
    setUser(govtUser);

    // Route based on profile completion and verification status
    if (!govtUser.profileComplete) {
      router.replace("/(govt-auth)/complete-profile");
    } else if (govtUser.verificationStatus !== "verified") {
      router.replace("/(govt-auth)/verification-pending");
    } else {
      router.replace("/(govt-tabs)");
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("user");
    setUser(null);
    router.replace("../");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        signInFarmer,
        signInVendor,
        signInBuyer,
        signInGovt,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
