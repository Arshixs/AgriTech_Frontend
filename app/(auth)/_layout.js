import React from 'react';
import { Stack } from 'expo-router';

// This is the layout for the (auth) group
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="register" />
    </Stack>
  );
}