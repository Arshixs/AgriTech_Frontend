import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; // Icon library

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2A9D8F', // Our app's theme color
        headerShown: false, // We'll add custom headers later
      }}
    >
      <Tabs.Screen
        name="index" // This is app/(tabs)/index.js
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="farm" // This is app/(tabs)/farm.js
        options={{
          title: 'My Farm',
          tabBarIcon: ({ color }) => <FontAwesome name="leaf" size={24} color={color} />,
        }}
      />
      {/* We can add more tabs for Devices, Market, etc. later */}
    </Tabs>
  );
}