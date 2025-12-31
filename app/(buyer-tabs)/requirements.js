import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
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
import Button from "../../src/components/common/Button";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

export default function RequirementsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Requirements from Backend
  const fetchRequirements = async () => {
    if (!user?.token) return;
    setLoading(true);
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
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequirements();
    }, [])
  );

  // Helper: Status Colors
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#2A9D8F";
      case "fulfilled":
        return "#457B9D";
      case "expired":
        return "#E76F51";
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
    if (type === "pre_harvest_contract") return "#9C27B0"; // Purple
    return "#F4A261"; // Orange for Spot
  };

  const renderRequirementItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reqCard}
      activeOpacity={0.7}
      onPress={() =>
        // Pass ID to edit/view details screen.
        // It's better to fetch fresh data on the next screen using ID.
        router.push({
          pathname: "/edit-requirement",
          params: { id: item._id },
        })
      }
    >
      {/* Header: Name + Status */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="sprout"
            size={20}
            color="#2A9D8F"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.reqCrop}>{item.cropName}</Text>
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
            {t(item.status?.toUpperCase())}
          </Text>
        </View>
      </View>

      {/* Sub-Header: Contract Type + Category */}
      <View style={styles.tagsRow}>
        <View
          style={[
            styles.tag,
            { backgroundColor: getContractColor(item.contractType) + "15" },
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
        <View style={styles.separator} />
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>

      <View style={styles.divider} />

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t("Quantity")}</Text>
          <Text style={styles.detailValue}>
            {item.quantity} {item.unit}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t("Target Price")}</Text>
          <Text style={styles.detailValue}>
            ₹{item.targetPrice}/{item.unit}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t("Deadline")}</Text>
          <Text style={[styles.detailValue, { color: "#E76F51" }]}>
            {new Date(item.requiredByDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.cardFooter}
        activeOpacity={0.7}
        onPress={() => {
          // Navigate to the offers screen with params
          router.push({
            pathname: "/requirement-offers", // Make sure this matches your file path
            params: {
              requirementId: item._id,
              cropName: item.cropName,
            },
          });
        }}
      >
        <View style={styles.offersBadge}>
          <MaterialCommunityIcons
            name="email-outline"
            size={16}
            color="#457B9D"
          />
          <Text style={styles.offersText}>
            {item.totalOffersReceived || 0} {t("Offers Received")}
          </Text>
        </View>

        {/* The chevron creates a natural visual cue that this is clickable */}
        <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("My Requirements")}</Text>
        <Text style={styles.headerSubtitle}>
          {t("Manage your crop needs and contracts")}
        </Text>
      </View>

      <Button
        title={t("Post New Requirement")}
        onPress={() => router.push("/post-requirement")}
        style={styles.postButton}
        icon={() => (
          <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
        )}
      />

      <FlatList
        data={requirements}
        renderItem={renderRequirementItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchRequirements} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={60}
                color="#DDD"
              />
              <Text style={styles.emptyText}>
                {t("You have not posted any requirements yet.")}
              </Text>
              <Text style={styles.emptySubText}>
                {t(
                  "Post a requirement to start receiving offers from farmers."
                )}
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
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 16,
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#264653",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  postButton: {
    backgroundColor: "#E76F51",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  listContainer: {
    padding: 20,
  },
  reqCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  reqCrop: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: "#DDD",
    marginHorizontal: 8,
  },
  categoryText: {
    fontSize: 13,
    color: "#888",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 10,
    borderRadius: 8,
  },
  offersBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  offersText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#457B9D",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
