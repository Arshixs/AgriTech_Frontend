import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
import { API_BASE_URL } from "../secret";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import { useAuth } from "../src/context/AuthContext";

const FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" }, // ✅ ADD THIS
];

export default function MyOffersScreen() {
  const { user } = useAuth();
  const authToken = user?.token;
  const router = useRouter();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offers, setOffers] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchOffers = async () => {
    if (!authToken) return;
    setRefreshing(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/requirement-offers/my-offers`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers || []);
      } else {
        Alert.alert(t("Error"), t("Failed to load offers"));
      }
    } catch (error) {
      console.error("Fetch Offers Error:", error);
      Alert.alert(t("Error"), t("Network error occurred"));
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOffers();
    }, [authToken])
  );

  const getFilteredOffers = () => {
    if (filter === "all") return offers;
    return offers.filter((o) => o.status === filter);
  };

  const filteredOffers = getFilteredOffers();

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#F4A261";
      case "accepted":
        return "#4CAF50";
      case "rejected":
        return "#E76F51";
      case "cancelled": // ✅ ADD THIS
        return "#999";
      default:
        return "#666";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return t("Pending");
      case "accepted":
        return t("Accepted");
      case "rejected":
        return t("Rejected");
      case "cancelled": // ✅ ADD THIS
        return t("Cancelled");
      default:
        return status;
    }
  };

  const handleCancelOffer = (offerId) => {
    Alert.alert(
      t("Cancel Offer"),
      t("Are you sure you want to cancel this offer?"),
      [
        {
          text: t("No"),
          style: "cancel",
        },
        {
          text: t("Yes, Cancel"),
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/requirement-offers/${offerId}/cancel`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                  },
                  body: JSON.stringify({ status: "cancelled" }),
                }
              );

              const data = await res.json();

              if (res.ok) {
                Alert.alert(t("Success"), t("Offer cancelled successfully"));
                fetchOffers();
              } else {
                Alert.alert(
                  t("Error"),
                  data.message || t("Failed to cancel offer")
                );
              }
            } catch (error) {
              console.error("Cancel Offer Error:", error);
              Alert.alert(t("Error"), t("Network error occurred"));
            }
          },
        },
      ]
    );
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) Linking.openURL(`tel:${phoneNumber}`);
  };

  const renderOfferCard = ({ item }) => {
    const requirement = item.requirement || {};
    const buyer = item.buyer || {};
    const isAccepted = item.status === "accepted";
    const isPending = item.status === "pending";
    const isRejected = item.status === "rejected";
    const isCancelled = item.status === "cancelled";

    return (
      <View style={styles.offerCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <MaterialCommunityIcons
              name="sprout"
              size={24}
              color={isAccepted ? "#4CAF50" : "#2A9D8F"}
            />
            <View style={styles.titleText}>
              <Text style={styles.cropName}>{requirement.cropName}</Text>
              <Text style={styles.categoryText}>{requirement.category}</Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        {/* Offer Details */}
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="weight" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.quantity} {requirement.unit} {t("offered")}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="currency-inr"
              size={16}
              color="#666"
            />
            <Text style={styles.detailText}>
              ₹{item.pricePerUnit}/{requirement.unit}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>
              {t("Available")}:{" "}
              {new Date(item.availableDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Requirement Info */}
        {/* <View style={styles.requirementInfo}>
          <View style={styles.requirementHeader}>
            <Text style={styles.requirementLabel}>
              {t("BUYER REQUIREMENT")}
            </Text>
          </View>
          <View style={styles.requirementDetails}>
            <Text style={styles.requirementText}>
              {requirement.quantity} {requirement.unit} {t("needed")}
            </Text>
          </View>
        </View> */}

        {/* Buyer Info Section */}
        <View style={styles.buyerContainer}>
          <View style={styles.buyerHeader}>
            <Text style={styles.buyerLabel}>{t("BUYER")}</Text>
          </View>

          <View style={styles.buyerRow}>
            <View style={styles.buyerAvatar}>
              <MaterialCommunityIcons name="briefcase" size={20} color="#FFF" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.buyerName}>
                {buyer.companyName || t("Unknown Buyer")}
              </Text>
              <Text style={styles.buyerPhone}>
                <MaterialCommunityIcons name="phone" size={12} />{" "}
                {buyer.phone || t("No phone")}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(buyer.phone)}
            >
              <MaterialCommunityIcons name="phone" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Message if exists */}
        {item.message && (
          <View style={styles.messageContainer}>
            <MaterialCommunityIcons
              name="message-text-outline"
              size={16}
              color="#666"
            />
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        )}

        {/* Status Info */}
        {isPending && (
          <View style={styles.pendingInfo}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color="#F4A261"
            />
            <Text style={styles.pendingText}>
              {t("Waiting for buyer response...")}
            </Text>
          </View>
        )}

        {isPending && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelOffer(item._id)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={18}
              color="#E76F51"
            />
            <Text style={styles.cancelButtonText}>{t("Cancel Offer")}</Text>
          </TouchableOpacity>
        )}

        {isAccepted && (
          <View style={styles.acceptedInfo}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#4CAF50"
            />
            <Text style={styles.acceptedText}>
              {t("Offer accepted! Contact buyer to proceed")}
            </Text>
          </View>
        )}

        {isRejected && (
          <View style={styles.rejectedInfo}>
            <MaterialCommunityIcons
              name="close-circle"
              size={20}
              color="#E76F51"
            />
            <Text style={styles.rejectedText}>
              {t("Offer was not accepted by buyer")}
            </Text>
          </View>
        )}

        {isCancelled && (
          <View style={styles.cancelledInfo}>
            <MaterialCommunityIcons name="cancel" size={20} color="#999" />
            <Text style={styles.cancelledText}>
              {t("You cancelled this offer")}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>
            {t("Submitted")}: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  const FilterButton = ({ label, value }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[styles.filterText, filter === value && styles.filterTextActive]}
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
          <Text style={styles.headerTitle}>{t("My Offers")}</Text>
          <Text style={styles.headerSubtitle}>
            {t("Track your submitted offers")}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_TABS.map((tab) => (
            <FilterButton key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </ScrollView>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{filteredOffers.length}</Text>
          <Text style={styles.statLabel}>{t("Total")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#F4A261" }]}>
            {offers.filter((o) => o.status === "pending").length}
          </Text>
          <Text style={styles.statLabel}>{t("Pending")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#4CAF50" }]}>
            {offers.filter((o) => o.status === "accepted").length}
          </Text>
          <Text style={styles.statLabel}>{t("Accepted")}</Text>
        </View>
      </View>

      <FlatList
        data={filteredOffers}
        renderItem={renderOfferCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchOffers} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="email-outline"
                size={64}
                color="#CCC"
              />
              <Text style={styles.emptyText}>
                {filter === "all"
                  ? t("No offers submitted yet")
                  : t("No {{status}} offers found", { status: filter })}
              </Text>
              <Text style={styles.emptySubtext}>
                {t("Browse buyer requirements and submit offers")}
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

  listContainer: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: "#F8F9FA",
  },

  offerCard: {
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
  },
  cropName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
  },
  categoryText: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
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

  requirementInfo: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  requirementHeader: {
    marginBottom: 6,
  },
  requirementLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#666",
    letterSpacing: 0.5,
  },
  requirementDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  requirementText: {
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
  },

  buyerContainer: {
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  buyerHeader: {
    marginBottom: 10,
  },
  buyerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#457B9D",
    letterSpacing: 0.5,
  },
  buyerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  buyerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#457B9D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  buyerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1D3557",
  },
  buyerPhone: {
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

  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  pendingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#FFF8F0",
    borderRadius: 8,
    marginBottom: 8,
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    color: "#F4A261",
    fontWeight: "600",
  },

  acceptedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#F0FFF4",
    borderRadius: 8,
    marginBottom: 8,
  },
  acceptedText: {
    flex: 1,
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
  },

  rejectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
    marginBottom: 8,
  },
  rejectedText: {
    flex: 1,
    fontSize: 13,
    color: "#E76F51",
    fontWeight: "600",
  },

  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  footerText: {
    fontSize: 12,
    color: "#888",
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
  cancelledInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 8,
  },
  cancelledText: {
    flex: 1,
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
  },

  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E76F51",
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E76F51",
  },
});
