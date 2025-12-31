import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../secret";
import { useAuth } from "../src/context/AuthContext";

// Helper for status colors
const getStatusColor = (status) => {
  switch (status) {
    case "accepted":
      return "#2E7D32"; // Green
    case "rejected":
      return "#C62828"; // Red
    default:
      return "#F57C00"; // Orange (Pending)
  }
};

export default function BuyerOffersScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Get requirement details passed from the previous screen
  const { requirementId, cropName } = useLocalSearchParams();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Offers for this Requirement
  const fetchOffers = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/requirement-offers/requirement/${requirementId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setOffers(data.offers);
      } else {
        Alert.alert("Error", data.message || "Could not fetch offers");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (requirementId) fetchOffers();
  }, [requirementId]);

  // 2. Handle Accept/Reject Action
  const handleAction = async (offerId, action) => {
    // action should be 'accepted' or 'rejected'

    // Optimistic UI update (optional, but good for UX)
    const originalOffers = [...offers];

    try {
      // 1. Call API
      const res = await fetch(
        `${API_BASE_URL}/api/requirement-offers/${offerId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ status: action }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // 2. Update Local State on success
        setOffers((prev) =>
          prev.map((offer) =>
            offer._id === offerId ? { ...offer, status: action } : offer
          )
        );
        Alert.alert("Success", `Offer marked as ${action}`);
      } else {
        Alert.alert("Error", data.message || "Action failed");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update status");
    }
  };

  const renderOfferCard = ({ item }) => (
    <View style={styles.card}>
      {/* Header: Farmer Info */}
      <View style={styles.cardHeader}>
        <View style={styles.farmerRow}>
          <View style={styles.avatarContainer}>
            {item.farmer?.profileImage ? (
              <Image
                source={{ uri: item.farmer.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <FontAwesome5 name="user-alt" size={20} color="#555" />
            )}
          </View>
          <View>
            <Text style={styles.farmerName}>
              {item.farmer?.name || "Unknown Farmer"}
            </Text>
            <Text style={styles.farmerLocation}>
              <Ionicons name="location-sharp" size={12} color="#777" />{" "}
              {item.farmer?.address || "Location N/A"}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Offer Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Price Offered</Text>
          <Text style={styles.detailValue}>₹{item.pricePerUnit}</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Quantity</Text>
          <Text style={styles.detailValue}>{item.quantity} units</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Available</Text>
          <Text style={styles.detailDate}>
            {new Date(item.availableDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Message Bubble */}
      {item.message ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>"{item.message}"</Text>
        </View>
      ) : null}

      {/* Action Buttons (Only show if Pending) */}
      {item.status === "pending" && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleAction(item._id, "rejected")}
          >
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={() => handleAction(item._id, "accepted")}
          >
            <Text style={styles.acceptText}>Accept Offer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1D3557" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Received Offers</Text>
          <Text style={styles.headerSubtitle}>
            For: {cropName || "Requirement"}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#264653" />
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item._id}
          renderItem={renderOfferCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchOffers();
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="inbox-outline"
                size={60}
                color="#CCC"
              />
              <Text style={styles.emptyText}>No offers received yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1D3557" },
  headerSubtitle: { fontSize: 14, color: "#6B7280" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  listContent: { padding: 16 },

  // Card Styles
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  farmerRow: { flexDirection: "row", alignItems: "center" },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  avatar: { width: 40, height: 40 },
  farmerName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  farmerLocation: { fontSize: 12, color: "#777", marginTop: 2 },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: "700" },

  divider: { height: 1, backgroundColor: "#F0F0F0", marginBottom: 12 },

  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  detailItem: { alignItems: "center", flex: 1 },
  detailLabel: { fontSize: 11, color: "#888", marginBottom: 2 },
  detailValue: { fontSize: 15, fontWeight: "700", color: "#264653" },
  detailDate: { fontSize: 13, fontWeight: "600", color: "#264653" },
  verticalDivider: { width: 1, backgroundColor: "#F0F0F0" },

  messageBox: {
    backgroundColor: "#F1F8E9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  messageText: { color: "#558B2F", fontStyle: "italic", fontSize: 13 },

  actionRow: { flexDirection: "row", justifyContent: "space-between" },
  actionBtn: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtn: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  acceptBtn: { backgroundColor: "#2E7D32" },
  rejectText: { color: "#C62828", fontWeight: "bold" },
  acceptText: { color: "#FFF", fontWeight: "bold" },

  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#999", marginTop: 10, fontSize: 16 },
});
