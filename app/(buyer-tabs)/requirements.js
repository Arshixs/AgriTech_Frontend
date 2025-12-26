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

// Adjust these paths based on your actual folder structure
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

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchRequirements();
    }, [])
  );

  const getStatusColor = (status) => {
    if (status === "active") return "#2A9D8F"; // Green
    if (status === "fulfilled") return "#457B9D"; // Blue
    return "#E76F51"; // Cancelled/Closed
  };

  const formatStatus = (status) => {
    if (status === "active") return t("Sourcing Open");
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderRequirementItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reqCard}
      onPress={() =>
        router.push({
          pathname: "/edit-requirement",
          params: {
            id: item._id,
            title: item.title,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            targetPrice: item.targetPrice || "",
            description: item.description || "",
          },
        })
      }
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.reqCrop}>{item.title}</Text>
          <Text style={styles.reqCategory}>{item.category}</Text>
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
            {formatStatus(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="weight-kilogram"
            size={16}
            color="#666"
          />
          <Text style={styles.detailText}>
            {item.quantity} {item.unit}
          </Text>
        </View>

        {/* Showing Target Price if available */}
        {item.targetPrice && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="cash" size={16} color="#666" />
            <Text style={styles.detailText}>
              {t("Target")}: ₹{item.targetPrice}/{item.unit}
            </Text>
          </View>
        )}

        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("My Crop Requirements")}</Text>
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
            <Text style={styles.emptyText}>
              {t("You have not posted any requirements yet.")}
            </Text>
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
    paddingBottom: 16,
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 12,
  },
  reqCrop: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
  },
  reqCategory: {
    fontSize: 12,
    color: "#888",
    textTransform: "uppercase",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 6,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
});
