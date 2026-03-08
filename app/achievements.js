// app/achievements.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import useFarmerOnly from "../hooks/useFarmerOnly";
import { useAuth } from "../src/context/AuthContext";
import { API_BASE_URL } from "../secret";

export default function AchievementsScreen() {
  const isFarmer = useFarmerOnly();
  const { user } = useAuth();
  const authToken = user?.token;
  const router = useRouter();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("badges");

  // EVENT_LABELS inside component so t() is available
  const EVENT_LABELS = {
    QUIZ_COMPLETED: {
      label: t("Quiz Completed"),
      icon: "school",
      color: "#9C27B0",
    },
    QUALITY_APPROVED: {
      label: t("Quality Approved"),
      icon: "check-decagram",
      color: "#4CAF50",
    },
    VENDOR_PURCHASE: {
      label: t("Vendor Purchase"),
      icon: "shopping",
      color: "#2196F3",
    },
    AUCTION_COMPLETED: {
      label: t("Auction Completed"),
      icon: "gavel",
      color: "#FF9800",
    },
    PROFILE_COMPLETED: {
      label: t("Profile Completed"),
      icon: "account-check",
      color: "#00BCD4",
    },
    BADGE_EARNED: {
      label: t("Badge Earned"),
      icon: "trophy",
      color: "#FFD700",
    },
    CROP_LISTED: { label: t("Crop Listed"), icon: "sprout", color: "#8BC34A" },
  };

  const TABS = [
    { key: "badges", label: t("Badges") },
    { key: "history", label: t("Point History") },
  ];

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        if (!authToken) return;
        try {
          setLoading(true);
          const res = await fetch(`${API_BASE_URL}/api/gamification/profile`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          const json = await res.json();
          if (!cancelled) {
            if (res.ok) setData(json);
            else console.error("Achievements fetch error:", json.message);
          }
        } catch (e) {
          console.error("Achievements fetch error:", e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      load();
      return () => {
        cancelled = true;
      };
    }, [authToken]),
  );

  if (!isFarmer) return null;

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2A9D8F" />
        </View>
      </ScreenWrapper>
    );
  }

  const earnedBadges = data?.earnedBadges ?? [];
  const lockedBadges = data?.lockedBadges ?? [];
  const history = data?.recentHistory ?? [];

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("Achievements")}</Text>
      </View>

      {/* Tab selector */}
      <View style={styles.tabRow}>
        {TABS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.tabBtn, tab === item.key && styles.tabBtnActive]}
            onPress={() => setTab(item.key)}
          >
            <Text
              style={[styles.tabText, tab === item.key && styles.tabTextActive]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              setLoading(true);
              setData(null);
            }}
          />
        }
      >
        {tab === "badges" ? (
          <>
            {earnedBadges.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  {t("Earned")} ({earnedBadges.length})
                </Text>
                <View style={styles.badgeGrid}>
                  {earnedBadges.map((badge) => (
                    <BadgeTile key={badge.key} badge={badge} earned t={t} />
                  ))}
                </View>
              </>
            )}
            {earnedBadges.length === 0 && lockedBadges.length === 0 && (
              <Text style={styles.empty}>
                {t("No badges yet. Keep farming!")}
              </Text>
            )}
            {lockedBadges.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>{t("Locked")}</Text>
                <View style={styles.badgeGrid}>
                  {lockedBadges.map((badge) => (
                    <BadgeTile
                      key={badge.key}
                      badge={badge}
                      earned={false}
                      t={t}
                    />
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>{t("Recent Activity")}</Text>
            {history.length === 0 ? (
              <Text style={styles.empty}>
                {t("No activity yet. Start earning points!")}
              </Text>
            ) : (
              history.map((item, idx) => {
                const cfg = EVENT_LABELS[item.eventType] || {
                  label: item.eventType,
                  icon: "star",
                  color: "#888",
                };
                return (
                  <View key={idx} style={styles.historyItem}>
                    <View
                      style={[
                        styles.historyIcon,
                        { backgroundColor: cfg.color + "20" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={cfg.icon}
                        size={20}
                        color={cfg.color}
                      />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyLabel}>{cfg.label}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(item.createdAt).toLocaleDateString("en-IN")}
                      </Text>
                    </View>
                    <Text style={[styles.historyPoints, { color: cfg.color }]}>
                      +{item.points}
                    </Text>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

function BadgeTile({ badge, earned, t }) {
  return (
    <View style={[styles.badgeTile, !earned && styles.badgeTileLocked]}>
      <View
        style={[
          styles.badgeIconWrap,
          { backgroundColor: earned ? badge.color + "25" : "#F0F0F0" },
        ]}
      >
        <MaterialCommunityIcons
          name={badge.icon || "medal"}
          size={32}
          color={earned ? badge.color : "#BDBDBD"}
        />
      </View>
      <Text
        style={[styles.badgeName, !earned && styles.badgeNameLocked]}
        numberOfLines={2}
      >
        {badge.name}
      </Text>
      <Text style={styles.badgeDesc} numberOfLines={3}>
        {badge.description}
      </Text>
      {earned && badge.earnedAt && (
        <Text style={styles.badgeDate}>
          {new Date(badge.earnedAt).toLocaleDateString("en-IN")}
        </Text>
      )}
      {!earned && (
        <View style={styles.lockRow}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={12}
            color="#BDBDBD"
          />
          <Text style={styles.lockText}>{t("Locked")}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FFF",
  },
  back: { marginRight: 12 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#264653" },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: "#FFF", elevation: 2 },
  tabText: { color: "#888", fontWeight: "600" },
  tabTextActive: { color: "#264653" },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#264653",
    marginBottom: 12,
    marginTop: 8,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  badgeTile: {
    width: "46%",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    elevation: 2,
  },
  badgeTileLocked: { backgroundColor: "#FAFAFA", opacity: 0.7 },
  badgeIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#264653",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeNameLocked: { color: "#9E9E9E" },
  badgeDesc: {
    fontSize: 11,
    color: "#888",
    textAlign: "center",
    lineHeight: 15,
  },
  badgeDate: { fontSize: 10, color: "#2A9D8F", marginTop: 6 },
  lockRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  lockText: { fontSize: 10, color: "#BDBDBD" },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  historyInfo: { flex: 1 },
  historyLabel: { fontSize: 14, fontWeight: "600", color: "#264653" },
  historyDate: { fontSize: 11, color: "#888", marginTop: 2 },
  historyPoints: { fontSize: 18, fontWeight: "800" },
  empty: { textAlign: "center", color: "#888", marginTop: 40 },
});
