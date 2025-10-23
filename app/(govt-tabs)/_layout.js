// File: app/(govt-tabs)/_layout.js

import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function GovtTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#606C38', // Govt Theme Color
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="quality-approval"
        options={{
          title: 'Quality',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="check-decagram" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="msp-compliance"
        options={{
          title: 'MSP',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shield-check" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="logistics-reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-cog" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}