import { FARMER_COLOR } from "@/secret";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: FARMER_COLOR, // Buyer Theme Color
        tabBarInactiveTintColor: "#888",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarStyle: {
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="bell" size={24} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="farm"
        options={{
          title: "My Farm",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="leaf" size={24} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="recommendations"
        options={{
          title: "Crops",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="sprout" size={24} color={color} />
          ),
        }}
      /> */}
      {/* <Tabs.Screen
        name="price-forecast"
        options={{
          title: "Price Forecast",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-line" size={24} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="my-harvest"
        options={{
          title: "Harvest",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="check-decagram"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "profile",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
