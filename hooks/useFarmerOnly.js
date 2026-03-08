// src/hooks/useFarmerOnly.js
// Drop this hook at the top of any screen that should be farmer-only.
// It checks role from AuthContext and redirects immediately if not a farmer.

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../src/context/AuthContext';

export default function useFarmerOnly() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'farmer') {
      router.replace('/welcome');
    }
  }, [user, isLoading]);

  // Returns true only when safe to render
  return !isLoading && !!user && user.role === 'farmer';
}
