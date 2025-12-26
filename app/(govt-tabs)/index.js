// File: app/(govt-tabs)/index.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../../secret";
import { useTranslation } from "react-i18next";

export default function GovtDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [myRequests, setMyRequests] = useState(0);
  const authToken = user?.token;

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authToken) {
      fetchData();
    }
  }, [authToken]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };

      const res = await fetch(`${API_BASE_URL}/api/quality/govt/pending`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.requests.length || 0);
      }

      const res2 = await fetch(`${API_BASE_URL}/api/quality/govt/my-requests`, {
        headers,
      });
      if (res2.ok) {
        const data = await res2.json();
        setMyRequests(data.requests.length || 0);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: t("Approve Quality"),
      icon: "check-decagram",
      route: "/(govt-tabs)/quality-grading",
    },
    {
      title: t("Enforce MSP"),
      icon: "shield-check",
      route: "/(govt-tabs)/msp-compliance",
    },
    {
      title: t("Manage Profile"),
      icon: "account-cog",
      route: "/(govt-tabs)/profile",
    },
  ];

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{t("Welcome")},</Text>
              <Text style={styles.userName}>{user?.name || t("Officer")}</Text>
              <Text style={styles.department}>
                {user?.department || t("Govt. of India")}
              </Text>
            </View>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="bank" size={50} color="#606C38" />
            </View>
          </View>

          {/* Stats Cards */}
          <Text style={styles.sectionTitle}>{t("Overview")}</Text>
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { borderColor: "#F4A261" }]}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={32}
                color={"#F4A261"}
              />
              <Text style={styles.statValue}>{pendingRequests}</Text>
              <Text style={styles.statLabel}>{t("Pending Gradings")}</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>{t("Actions")}</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.title}
                style={styles.actionCard}
                onPress={() => router.push(action.route)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={action.icon}
                  size={36}
                  color="#606C38"
                />
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: "#666",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 4,
  },
  department: {
    fontSize: 14,
    color: "#606C38",
    marginTop: 4,
    fontWeight: "600",
  },
  logoContainer: {
    padding: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
    textAlign: "center",
    marginTop: 12,
  },
});
