// File: app/(govt-auth)/_layout.js

import React from "react";
import { Stack } from "expo-router";

export default function GovtAuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="complete-profile" />
      <Stack.Screen name="verification-pending" />
    </Stack>
  );
}
