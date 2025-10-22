
import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext"; // Adjust path
import { ActivityIndicator, View } from "react-native";

// This component handles the auth state logic
const RootLayout = () => {
  const { user, isLoading, signOut } = useAuth(); 
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; 

    // Handle old/bad user data from AsyncStorage
    if (user && !user.role) {
      signOut(); 
      return; 
    }

    const inAuthGroup = segments[0] === '(auth)' || segments[0] === '(vendor-auth)';
    const atRootIndex = segments.length === 0; // This means we are at '/'

    if (user) {
      // --- User is LOGGED IN ---
      // 
      // WE DO NOTHING HERE. 
      // The AuthContext now handles redirects *on login*.
      // This prevents the stale state loop on logout.
      //
    } else {
      // --- User is LOGGED OUT ---
      // This is now the ONLY logic this file runs.
      // If the user is logged out, but NOT on an auth screen 
      // or the root index, kick them to the root.
      if (!inAuthGroup && !atRootIndex) {
        router.replace('/');
      }
    }
  }, [user, isLoading, segments, router, signOut]); 

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2A9D8F" />
      </View>
    );
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      {/* Group Stacks (Layouts) */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(vendor-tabs)" />
      <Stack.Screen name="(vendor-auth)" />
      
      {/* Root Index Screen */}
      <Stack.Screen name="index" />

      {/* Farmer Top-Level Screens */}
      <Stack.Screen name="expense-prediction" />
      <Stack.Screen name="field-details" />
      <Stack.Screen name="iot-devices" />

      {/* Vendor Top-Level Screens */}
      <Stack.Screen name="add-edit-product" />
      <Stack.Screen name="chat-screen" />
      <Stack.Screen name="expense-tracker" />
      <Stack.Screen name="expense-calculator" />
      <Stack.Screen name="transaction-history" />
    </Stack>
  );
};

// Main export
export default function Layout() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}