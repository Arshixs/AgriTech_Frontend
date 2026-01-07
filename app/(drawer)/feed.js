import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../../secret";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

export default function RequirementsFeedScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Public Feed
  const fetchFeed = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/buyer/requirements/feed`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setRequirements(data.requirements || []);
      } else {
        console.log("Failed to load feed");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error fetching feed");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeed();
    }, [])
  );

  const renderRequirementItem = ({ item }) => {
    const isUrgent =
      new Date(item.requiredByDate) <
      new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/make-offer",
            params: {
              requirementId: item._id,
              buyerId: item.buyer._id, // Pass buyer ID for the offer
              cropName: item.cropName,
              targetPrice: item.targetPrice,
              unit: item.unit,
              crop: JSON.stringify(item),
            },
          })
        }
      >
        {/* Header: Crop Name & Badge */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cropName}>{item.cropName}</Text>
            <Text style={styles.buyerName}>
              By {item.buyer.companyName || "Verified Buyer"}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              isUrgent ? styles.urgentBadge : styles.normalBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isUrgent ? styles.urgentText : styles.normalText,
              ]}
            >
              {isUrgent
                ? "Urgent"
                : item.contractType === "spot_market"
                ? "Spot"
                : "Contract"}
            </Text>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Needed</Text>
            <Text style={styles.detailValue}>
              {item.quantity} {item.unit}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Target Price</Text>
            <Text style={[styles.detailValue, { color: "#2A9D8F" }]}>
              ₹{item.targetPrice}/{item.unit}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Deadline</Text>
            <Text style={styles.detailValue}>
              {new Date(item.requiredByDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Footer: Location & Action */}
        <View style={styles.cardFooter}>
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.deliveryLocation?.city || "Anywhere"},{" "}
              {item.deliveryLocation?.state || "India"}
            </Text>
          </View>
          <View style={styles.actionButton}>
            <Text style={styles.actionText}>Make Offer</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color="#FFF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buyer Requirements</Text>
        <Text style={styles.headerSubtitle}>
          Find contracts for your harvest
        </Text>
      </View>

      <FlatList
        data={requirements}
        renderItem={renderRequirementItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchFeed} />
        }
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>No active requirements found.</Text>
          )
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cropName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
  },
  buyerName: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentBadge: { backgroundColor: "#FFEBEE" },
  normalBadge: { backgroundColor: "#E0F2F1" },
  badgeText: { fontSize: 10, fontWeight: "bold" },
  urgentText: { color: "#D32F2F" },
  normalText: { color: "#00695C" },

  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailItem: { alignItems: "center", flex: 1 },
  detailLabel: {
    fontSize: 10,
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  detailValue: { fontSize: 14, fontWeight: "600", color: "#333" },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  actionButton: {
    backgroundColor: "#264653",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  actionText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 6,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#999",
  },
});
