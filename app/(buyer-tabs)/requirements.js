import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../../secret";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

// Tab Options
const TABS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Expired", value: "expired" },
];

export default function RequirementsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch Requirements from Backend
  const fetchRequirements = async () => {
    if (!user?.token) return;
    setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/buyer/requirements`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setRequirements(data.requirements || []);
      } else {
        console.log("Failed to load requirements");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequirements();
    }, [])
  );

  // Filter Logic
  const filteredRequirements = useMemo(() => {
    if (activeTab === "all") return requirements;
    if (activeTab === "expired") {
      return requirements.filter((r) =>
        ["expired", "cancelled"].includes(r.status)
      );
    }
    return requirements.filter((r) => r.status === activeTab.toLowerCase());
  }, [requirements, activeTab]);

  // Helper: Status Colors
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#2A9D8F";
      case "fulfilled":
        return "#4CAF50";
      case "expired":
        return "#E76F51";
      case "cancelled":
        return "#999";
      default:
        return "#666";
    }
  };

  // Helper: Contract Type formatting
  const getContractLabel = (type) => {
    if (type === "pre_harvest_contract") return t("Pre-Harvest");
    if (type === "spot_market") return t("Spot Market");
    return t("Contract");
  };

  const getContractColor = (type) => {
    if (type === "pre_harvest_contract") return "#9C27B0";
    return "#F4A261";
  };

  // Helper: Call Farmer
  const handleCall = (phoneNumber) => {
    if (phoneNumber) Linking.openURL(`tel:${phoneNumber}`);
  };

  const renderRequirementItem = ({ item }) => {
    const isFulfilled = item.status === "fulfilled";
    const farmer = item.fulfilledBy || {};

    return (
      <TouchableOpacity
        style={styles.reqCard}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: "/edit-requirement",
            params: { id: item._id },
          })
        }
      >
        {/* Header: Name + Status */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <MaterialCommunityIcons
              name="sprout"
              size={24}
              color={isFulfilled ? "#4CAF50" : "#2A9D8F"}
            />
            <View style={styles.titleText}>
              <Text style={styles.reqCrop}>{item.cropName}</Text>
              <View style={styles.tagsRow}>
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor:
                        getContractColor(item.contractType) + "15",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: getContractColor(item.contractType) },
                    ]}
                  >
                    {getContractLabel(item.contractType)}
                  </Text>
                </View>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {t(item.status?.toUpperCase())}
            </Text>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="weight" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.quantity} {item.unit}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="currency-inr"
              size={16}
              color="#666"
            />
            <Text style={styles.detailText}>
              ₹{item.targetPrice}/{item.unit}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>
              {new Date(item.requiredByDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Fulfilled By Section */}
        {isFulfilled && item.fulfilledBy && (
          <View style={styles.fulfilledContainer}>
            <View style={styles.fulfilledHeader}>
              <Text style={styles.fulfilledLabel}>{t("FULFILLED BY")}</Text>
              {farmer.isVerified && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={12}
                    color="#FFF"
                  />
                  <Text style={styles.verifiedText}>{t("Verified")}</Text>
                </View>
              )}
            </View>

            <View style={styles.farmerRow}>
              <View style={styles.farmerAvatar}>
                <Text style={styles.avatarText}>
                  {farmer.name ? farmer.name.charAt(0).toUpperCase() : "F"}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.farmerName}>
                  {farmer.name || t("Unknown Farmer")}
                </Text>
                <Text style={styles.farmerAddress} numberOfLines={1}>
                  <MaterialCommunityIcons name="map-marker" size={12} />{" "}
                  {farmer.address || t("No address")}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(farmer.phone)}
              >
                <MaterialCommunityIcons name="phone" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Footer: View Offers */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.offersButton}
            activeOpacity={0.7}
            onPress={() => {
              router.push({
                pathname: "/requirement-offers",
                params: {
                  requirementId: item._id,
                  cropName: item.cropName,
                },
              });
            }}
          >
            <View style={styles.offersContent}>
              <MaterialCommunityIcons
                name="email-outline"
                size={18}
                color="#457B9D"
              />
              <Text style={styles.offersText}>
                {item.totalOffersReceived || 0} {t("Offers Received")}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#457B9D"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterButton = ({ label, value }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeTab === value && styles.filterButtonActive,
      ]}
      onPress={() => setActiveTab(value)}
    >
      <Text
        style={[
          styles.filterText,
          activeTab === value && styles.filterTextActive,
        ]}
      >
        {t(label)}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t("My Requirements")}</Text>
          <Text style={styles.headerSubtitle}>
            {t("Manage your crop needs and contracts")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/post-requirement")}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#ffffffff" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {TABS.map((tab) => (
            <FilterButton key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </ScrollView>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{filteredRequirements.length}</Text>
          <Text style={styles.statLabel}>{t("Total")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#2A9D8F" }]}>
            {requirements.filter((r) => r.status === "active").length}
          </Text>
          <Text style={styles.statLabel}>{t("Active")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#4CAF50" }]}>
            {requirements.filter((r) => r.status === "fulfilled").length}
          </Text>
          <Text style={styles.statLabel}>{t("Fulfilled")}</Text>
        </View>
      </View>

      {/* Post New Button */}
      {/* <TouchableOpacity
        style={styles.postButton}
        onPress={() => router.push("/post-requirement")}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
        <Text style={styles.postButtonText}>{t("Post New Requirement")}</Text>
      </TouchableOpacity> */}

      <FlatList
        data={filteredRequirements}
        renderItem={renderRequirementItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchRequirements}
          />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={64}
                color="#CCC"
              />
              <Text style={styles.emptyText}>
                {activeTab === "all"
                  ? t("No requirements yet")
                  : t("No {{status}} requirements found", {
                      status: activeTab,
                    })}
              </Text>
              <Text style={styles.emptySubtext}>
                {t("Post a requirement to start receiving offers from farmers")}
              </Text>
            </View>
          )
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },

  filterContainer: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#2A9D8F",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#FFF",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  statsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    backgroundColor: "#F8F9FA",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#264653",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },

  postButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E76F51",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
  },
  postButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  listContainer: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: "#F8F9FA",
  },

  // Card Styles
  reqCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleText: {
    marginLeft: 12,
    flex: 1,
  },
  reqCrop: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  categoryText: {
    fontSize: 12,
    color: "#888",
  },

  cardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },

  // Fulfilled Section Styles
  fulfilledContainer: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  fulfilledHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  fulfilledLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#457B9D",
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A9D8F",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },
  farmerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  farmerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#457B9D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  farmerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1D3557",
  },
  farmerAddress: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  callButton: {
    backgroundColor: "#457B9D",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  cardActions: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  offersButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
  },
  offersContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  offersText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#457B9D",
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E76F51",
    justifyContent: "center",
    alignItems: "center",
  },
});
