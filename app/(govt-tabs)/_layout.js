// File: app/(govt-tabs)/_layout.js

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../src/context/AuthContext";

export default function GovtTabLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) {
      router.replace("/(govt-auth)/login");
    } else if (!user.profileComplete) {
      router.replace("/(govt-auth)/complete-profile");
    } else if (user.verificationStatus !== "verified") {
      router.replace("/(govt-auth)/verification-pending");
    }
  }, [user]);

  if (
    !user ||
    !user.profileComplete ||
    user.verificationStatus !== "verified"
  ) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#606C38",
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
          title: t("Dashboard"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="view-dashboard"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="quality-grading"
        options={{
          title: t("Quality"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="check-decagram"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="msp-compliance"
        options={{
          title: t("MSP"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="shield-check"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("Profile"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-cog"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
