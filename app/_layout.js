import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { ActivityIndicator, View } from "react-native";

const RootLayout = () => {
  const { user, isLoading, signOut } = useAuth(); 
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; 

    if (user && !user.role) {
      signOut(); 
      return; 
    }

    const inAuthGroup = segments[0] === '(auth)' || 
                        segments[0] === '(vendor-auth)' || 
                        segments[0] === '(buyer-auth)' ||
                        segments[0] === '(govt-auth)';
    const atRootIndex = segments.length === 0;

    if (user) {
      // --- (No changes to this logic) ---
    } else {
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
      
      {/* ---  BUYER LAYOUTS --- */}
      <Stack.Screen name="(buyer-tabs)" />
      <Stack.Screen name="(buyer-auth)" />

      {/* ---  Govt LAYOUTS --- */}
      <Stack.Screen name="(govt-tabs)" />
      <Stack.Screen name="(govt-auth)" />
      
      {/* Root Index Screen */}
      <Stack.Screen name="index" />

      {/* --- (All your top-level screens remain here) --- */}
      <Stack.Screen name="expense-prediction" />
      <Stack.Screen name="field-details" />
      <Stack.Screen name="iot-devices" />
      <Stack.Screen name="add-edit-product" />
      <Stack.Screen name="chat-screen" />
      <Stack.Screen name="expense-tracker" />
      <Stack.Screen name="expense-calculator" />
      <Stack.Screen name="transaction-history" />
      
      {/* --- BUYER TOP-LEVEL SCREENS --- */}
      <Stack.Screen name="post-requirement" />
      <Stack.Screen name="listing-details" />
      <Stack.Screen name="bidding-room" />

      {/* --- GOVT TOP-LEVEL SCREENS --- */}
      <Stack.Screen name="approval-details" />
      <Stack.Screen name="listing-violation" />
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