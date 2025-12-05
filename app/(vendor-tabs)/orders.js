import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import moment from "moment";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../../secret";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

export default function VendorOrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Design State: Active Tab
  const [activeTab, setActiveTab] = useState("Pending");

  // 1. Fetch Orders from Backend
  const fetchOrders = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/vendor/list`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      console.log(data.orders[0]);
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  // 2. Handle API Actions (Accept/Reject)
  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/orders/vendor/update-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ orderId, status: newStatus }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", `Order ${newStatus}!`);
        fetchOrders(); // Refresh to move item to new tab
      } else {
        Alert.alert("Failed", data.message || "Could not update status");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setActionLoading(null);
    }
  };

  // 3. Helper to Filter Orders based on Tabs
  const getFilteredOrders = () => {
    return orders.filter((order) => {
      const status = order.status; // pending, accepted, rejected, completed
      switch (activeTab) {
        case "Pending":
          return status === "pending";
        case "Active":
          return status === "accepted";
        case "Completed":
          return status === "completed";
        case "Declined":
          return status === "rejected" || status === "cancelled";
        default:
          return true;
      }
    });
  };

  const getStatusColor = (status) => {
    if (status === "pending") return "#F4A261"; // Orange
    if (status === "accepted") return "#2A9D8F"; // Teal
    if (status === "completed") return "#264653"; // Dark Blue
    return "#E76F51"; // Red (Rejected)
  };

  const renderOrderItem = ({ item }) => {
    const isRental = item.orderType === "rental";
    const isPending = item.status === "pending";

    return (
      <View style={styles.rentalCard}>
        {/* Header: Item Name & Status */}
        <View style={styles.cardHeader}>
          <Text style={styles.itemName}>
            {item.productSnapshot?.name || item.product?.name || "Unknown Item"}
          </Text>
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>

        {/* Detail: Buyer Name */}
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account" size={16} color="#666" />
          <Text style={styles.detailText}>
            Buyer:{" "}
            {item.buyer?.contactPerson || item.buyer?.companyName || "Unknown"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="phone" size={16} color="#666" />
          <Text
            onPress={() => {
              Linking.openURL(`tel:${item.buyer?.phone}`);
            }}
            style={styles.detailText}
          >
            Phone:{" "}
            <Text style={[styles.phoneText, { fontWeight: "600" }]}>
              {item.buyer?.phone || "Unknown"}
            </Text>
          </Text>
        </View>

        {/* Detail: Dates (if Rental) or Quantity (if Purchase) */}
        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name={isRental ? "calendar-range" : "package-variant"}
            size={16}
            color="#666"
          />
          <Text style={styles.detailText}>
            {isRental
              ? `${moment(item.rentalDuration?.startDate).format(
                  "DD MMM"
                )} - ${moment(item.rentalDuration?.endDate).format(
                  "DD MMM YYYY"
                )} (${item.rentalDuration?.totalDays} Days)`
              : `Quantity: ${item.quantity} ${
                  item.productSnapshot?.unit || "units"
                }`}
          </Text>
        </View>

        {/* Detail: Price */}
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="cash" size={16} color="#666" />
          <Text
            style={[styles.detailText, { fontWeight: "600", color: "#2A9D8F" }]}
          >
            Total: ₹{item.totalAmount}
          </Text>
        </View>

        {/* Action Buttons (Only for Pending) */}
        {isPending && (
          <View style={styles.buttonRow}>
            {actionLoading === item._id ? (
              <ActivityIndicator size="small" color="#2A9D8F" />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => handleUpdateStatus(item._id, "rejected")}
                >
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleUpdateStatus(item._id, "accepted")}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Action Buttons (For Active Orders -> Mark Complete) */}
        {activeTab === "Active" && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleUpdateStatus(item._id, "completed")}
            >
              <Text style={styles.acceptButtonText}>Mark Completed</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Orders</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["Pending", "Active", "Completed", "Declined"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getFilteredOrders()}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchOrders} />
        }
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>
              No {activeTab.toLowerCase()} orders found.
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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#2A9D8F",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#2A9D8F",
  },
  listContainer: {
    padding: 20,
  },
  rentalCard: {
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
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
    flex: 1,
    marginRight: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    flex: 1,
  },
  phoneText: {
    fontSize: 14,
    color: "#0794a3ff",
    marginLeft: 8,
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 16,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  declineButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E76F51",
  },
  declineButtonText: {
    color: "#E76F51",
    fontWeight: "600",
  },
  acceptButton: {
    backgroundColor: "#2A9D8F",
  },
  completeButton: {
    backgroundColor: "#264653",
    width: "100%",
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
});
