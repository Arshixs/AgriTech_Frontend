import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    // Wrap the entire app in the AuthProvider
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* The (auth) and (tabs) layouts are rendered here */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </AuthProvider>
  );
}