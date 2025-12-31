import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../../secret";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const quickActions = [
    {
      title: t("Marketplace"),
      icon: "store", // Standard shop icon
      color: "#2A9D8F",
      route: "/(buyer-tabs)/marketplace",
    },
    {
      title: t("My Bids"),
      icon: "gavel", // The auction hammer is the standard symbol for bidding
      color: "#457B9D",
      route: "/(buyer-tabs)/bidding",
    },
    {
      title: t("Requirements Offer"),
      icon: "clipboard-text", // Represents a list of needs/requirements
      color: "#F4A261",
      route: "/requirement-offers",
    },
    {
      title: t("Add New Requirements"),
      icon: "clipboard-plus", // Represents adding a new item to that list
      color: "#E76F51",
      route: "/post-requirement",
    },
  ];

  // 1. STATE MANAGEMENT FOR REAL DATA
  const [recentRequirements, setRecentRequirements] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    requirementsCount: 0,
    activeBids: 0,
    wonBids: 0,
  });
  const [profileData, setProfileData] = useState(null);

  // 2. FETCH FUNCTION
  const fetchBuyerProfile = async () => {
    if (!user?.token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/buyer/auth/profile`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setRecentRequirements(data.recentRequirements || []);
        setDashboardStats(
          data.stats || {
            requirementsCount: 0,
            activeBids: 0,
            wonBids: 0,
          }
        );
        setProfileData(data.buyer);
      }
    } catch (error) {
      console.error(t("Failed to fetch buyer profile:"), error);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchBuyerProfile();
    }
  }, [user]);

  // 3. STATS MAPPING
  const stats = [
    {
      label: t("Requirements Posted"),
      value: dashboardStats.requirementsCount, // Real value
      icon: "clipboard-text-outline",
      color: "#457B9D",
    },
    {
      label: t("Active Bids"),
      value: dashboardStats.activeBids, // Real value
      icon: "gavel",
      color: "#E76F51",
    },
    {
      label: t("Contracts"),
      value: dashboardStats.wonBids, // Real value
      icon: "handshake-outline",
      color: "#2A9D8F",
    },
  ];

  // 4. HELPER FUNCTIONS
  const getStatusStyle = (status) => {
    // Normalized to lowercase for safety
    const safeStatus = status?.toLowerCase() || "";

    if (safeStatus === "active")
      return { bg: "#E0F2F1", text: "#2A9D8F", label: t("Bidding Open") };
    if (safeStatus === "won" || safeStatus === "contract")
      return { bg: "#FFF3E0", text: "#F4A261", label: t("Contract") };
    if (safeStatus === "fulfilled")
      return { bg: "#E8F5E9", text: "#43A047", label: t("Fulfilled") };

    return { bg: "#F1F3F5", text: "#666", label: t("Closed") };
  };

  // Helper to choose icon based on category (simple logic)
  const getCategoryIcon = (category) => {
    const cat = category?.toLowerCase() || "";
    if (cat.includes("rice") || cat.includes("wheat")) return "barley";
    if (cat.includes("fruit")) return "fruit-cherries";
    if (cat.includes("vegetable")) return "food-apple-outline";
    return "sprout"; // default
  };

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Modern Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{t("Welcome back,")}</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {/* Prefer contact person, then company name, then auth name */}
                {profileData?.companyName || user?.name || t("Buyer")}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push("/(buyer-tabs)/profile")}
            >
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(profileData?.companyName || user?.name || "B")
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Stats Section */}
        <View style={styles.statsWrapper}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: stat.color + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name={stat.icon}
                  size={22}
                  color={stat.color}
                />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bodyContainer}>
          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>{t("Quick Actions")}</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.title}
                style={styles.actionCard}
                onPress={() => router.push(action.route)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.actionIconContainer,
                    { backgroundColor: action.color },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={action.icon}
                    size={28}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Active Requirements List */}
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>{t("Recent Requirements")}</Text>
            <TouchableOpacity
              onPress={() => router.push("/(buyer-tabs)/requirements")}
            >
              <Text style={styles.seeAllText}>{t("See All")}</Text>
            </TouchableOpacity>
          </View>

          {recentRequirements.length > 0 ? (
            recentRequirements.map((req) => {
              const statusStyle = getStatusStyle(req.status);
              return (
                <TouchableOpacity
                  key={req._id}
                  style={styles.reqCard}
                  onPress={() => router.push("/(buyer-tabs)/requirements")}
                  activeOpacity={0.7}
                >
                  <View style={styles.reqIconContainer}>
                    <MaterialCommunityIcons
                      name={getCategoryIcon(req.category)}
                      size={24}
                      color="#264653"
                    />
                  </View>

                  <View style={styles.reqInfo}>
                    <Text style={styles.reqCrop} numberOfLines={1}>
                      {req.title}
                    </Text>
                    <Text style={styles.reqQuantity}>
                      {req.quantity} {req.unit} • ₹{req.targetPrice || "N/A"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.reqStatusBadge,
                      { backgroundColor: statusStyle.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.reqStatusText,
                        { color: statusStyle.text },
                      ]}
                    >
                      {statusStyle.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            // Empty State
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={40}
                color="#CCC"
              />
              <Text style={styles.emptyStateText}>
                {t("No requirements yet")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 16,
    marginTop: 16,
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
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  // Header with Curve effect
  headerContainer: {
    backgroundColor: "#ffffffff",
    paddingTop: 20,
    paddingBottom: 50, // Extra padding for floating overlap
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  greeting: {
    fontSize: 14,
    color: "#4a4646ff",
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000ff",
    marginTop: 4,
    maxWidth: 250,
  },
  profileButton: {
    padding: 2,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E76F51",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  // Floating Stats
  statsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -35, // Pull up to overlap header
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
    textAlign: "center",
    fontWeight: "500",
  },

  // Body
  bodyContainer: {
    padding: 20,
  },

  // Action Banner
  actionBanner: {
    backgroundColor: "#E76F51",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#E76F51",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionContent: {
    zIndex: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
    textAlign: "center",
  },
  actionSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    marginBottom: 16,
    maxWidth: "80%",
  },
  actionBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
    marginRight: 6,
  },
  actionBgIcon: {
    position: "absolute",
    right: -10,
    bottom: -10,
    zIndex: 1,
  },

  // List Items
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: "#E76F51",
    fontWeight: "600",
  },
  reqCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reqIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  reqInfo: {
    flex: 1,
    marginRight: 8,
  },
  reqCrop: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#264653",
  },
  reqQuantity: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    fontWeight: "500",
  },
  reqStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  reqStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyStateText: {
    color: "#999",
    marginTop: 8,
    fontSize: 14,
  },
});
