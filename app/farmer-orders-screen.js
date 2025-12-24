import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../secret";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import { useAuth } from "../src/context/AuthContext";

// Helper function to format currency (local definition for self-containment)
const formatCurrency = (amount) => {
  if (amount === null || isNaN(amount)) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function FarmerOrdersScreen() {
  const { user } = useAuth();
  const authToken = user?.token;

  const router = useRouter();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  // --- Data Fetching ---

  const fetchOrders = async () => {
    if (!authToken) return;
    setRefreshing(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/farmer/list`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        throw new Error(t("Failed to fetch order history."));
      }

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Order Fetch Error:", error.message);
      setError(error.message);
      setOrders([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchOrders();
    }
  }, [authToken]);

  const onRefresh = () => {
    fetchOrders();
  };

  // --- Rendering Helpers ---

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "#2A9D8F"; // Green
      case "pending":
        return "#F4A261"; // Orange
      case "rejected":
      case "cancelled":
        return "#E76F51"; // Red
      case "completed":
        return "#457B9D"; // Blue
      default:
        return "#888";
    }
  };

  const getOrderTypeDetails = (type) => {
    if (type === "rental") {
      return { label: t("Rental"), icon: "truck-fast", color: "#E76F51" };
    }
    return { label: t("Purchase"), icon: "cart", color: "#2A9D8F" };
  };

  const renderOrderCard = (order) => {
    const typeDetails = getOrderTypeDetails(order.orderType);
    const statusColor = getStatusColor(order.status);

    // Check if vendor data is available after population
    const vendorName =
      order.vendor?.organizationName ||
      order.vendor?.name ||
      t("Unknown Vendor");

    const isRental = order.orderType === "rental";
    const totalDays = isRental ? order.rentalDuration?.totalDays : null;

    return (
      <View key={order._id} style={styles.orderCard}>
        {/* Header: Product Name and Status */}
        <View style={styles.orderHeader}>
          <MaterialCommunityIcons
            name={typeDetails.icon}
            size={24}
            color={typeDetails.color}
          />
          <View style={styles.productInfo}>
            <Text style={styles.orderProductName}>
              {order.productSnapshot.name}
            </Text>
            <Text style={styles.orderVendorName}>
              {typeDetails.label} {t("from")} {vendorName}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {t(order.status.toUpperCase())}
            </Text>
          </View>
        </View>

        <View style={styles.orderBody}>
          {/* Amount and Quantity */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("Total Amount")}</Text>
            <Text style={styles.detailValueAmount}>
              {formatCurrency(order.totalAmount)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("Quantity")}</Text>
            <Text style={styles.detailValue}>
              {order.quantity} {order.productSnapshot.unit}
            </Text>
          </View>

          {/* Rental Details */}
          {isRental && order.rentalDuration && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("Duration")}</Text>
                <Text style={styles.detailValue}>
                  {totalDays} {t("Days")}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("Period")}</Text>
                <Text style={styles.detailValuePeriod}>
                  {new Date(
                    order.rentalDuration.startDate
                  ).toLocaleDateString()}{" "}
                  -{" "}
                  {new Date(
                    order.rentalDuration.endDate
                  ).toLocaleDateString()}
                </Text>
              </View>
            </>
          )}

          {/* Footer */}
          <View style={styles.orderFooter}>
            <Text style={styles.orderDate}>
              {t("Ordered")}:{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (!authToken || loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            {t("Loading Order History...")}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <Text style={styles.header}>{t("My Orders")}</Text>
          <Text style={styles.subtitle}>
            {t("Track the status of your purchases and rentals")} (
            {orders.length} {t("total")})
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {t("Error")}: {error}
              </Text>
            </View>
          )}

          {orders.length === 0 && !error ? (
            <View style={styles.noOrdersCard}>
              <MaterialCommunityIcons
                name="clipboard-text-off"
                size={30}
                color="#888"
              />
              <Text style={styles.noOrdersText}>
                {t("No orders placed yet.")}
              </Text>
            </View>
          ) : (
            orders.map(renderOrderCard)
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: "#FFF0F0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E76F51",
  },
  errorText: {
    color: "#E76F51",
    fontWeight: "600",
    textAlign: "center",
  },
  noOrdersCard: {
    padding: 30,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  noOrdersText: {
    fontSize: 16,
    color: "#888",
    marginTop: 10,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#457B9D", // Default border color for orders
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  orderProductName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
  },
  orderVendorName: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    minWidth: 70,
    alignItems: "center",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  orderBody: {
    paddingTop: 5,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: "#888",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#264653",
  },
  detailValueAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E76F51",
  },
  detailValuePeriod: {
    fontSize: 13,
    fontWeight: "600",
    color: "#264653",
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F8F8F8",
    marginTop: 10,
    paddingTop: 10,
  },
  orderDate: {
    fontSize: 12,
    color: "#888",
    textAlign: "right",
  },
});
