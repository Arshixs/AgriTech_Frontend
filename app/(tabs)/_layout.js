import React from "react";
import { Tabs } from "expo-router";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2A9D8F",
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          marginBottom: 30,
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
      <Tabs.Screen
        name="farm"
        options={{
          title: "My Farm",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="leaf" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="bell" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recommendations"
        options={{
          title: "Crops",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="sprout" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="price-forecast"
        options={{
          title: "Price Forecast",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-line" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-harvest"
        options={{
          title: "Harvest",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="check-decagram" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
