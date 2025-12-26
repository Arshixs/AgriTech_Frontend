import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import moment from "moment";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWrapper from "../src/components/common/ScreenWrapper";

// 1. Add Import
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../secret";
import { useAuth } from "../src/context/AuthContext";

// Keep these keys in English for logic filtering
const TABS = ["All", "Completed", "Pending", "Rejected"];

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  // 2. Initialize Hook
  const { t } = useTranslation();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // State keeps 'All', 'Completed' (English) keys
  const [activeTab, setActiveTab] = useState("All");

  // 1. Fetch Orders and Transform into Transactions
  const fetchTransactions = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/vendor/list`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();

      if (res.ok) {
        // Transform Order Data to Transaction Format
        const mappedData = (data.orders || []).map((order) => ({
          id: order._id,
          orderId: order._id.slice(-6).toUpperCase(),
          // Translate fallback "Unknown"
          farmerName:
            order.buyer?.contactPerson ||
            order.buyer?.companyName ||
            t("Unknown"),
          amount: order.totalAmount,
          date: order.createdAt,
          // Map backend status to Transaction UI status
          status: mapStatus(order.status),
        }));

        setTransactions(mappedData);
      }
    } catch (error) {
      console.error(error); // Keep logs in English
      Alert.alert(t("Error"), t("Could not fetch transactions"));
    } finally {
      setLoading(false);
    }
  };

  // Helper to map backend order status to Transaction Tab categories
  const mapStatus = (backendStatus) => {
    if (backendStatus === "completed") return "Completed";
    if (backendStatus === "pending" || backendStatus === "accepted")
      return "Pending";
    if (backendStatus === "rejected" || backendStatus === "cancelled")
      return "Rejected";
    return "Pending";
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  // 2. Calculate Total Revenue (Only Completed)
  const totalRevenue = useMemo(() => {
    return transactions
      .filter((t) => t.status === "Completed")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // 3. Filter Logic (Compares English keys)
  const filteredTransactions = useMemo(() => {
    if (activeTab === "All") {
      return transactions;
    }
    return transactions.filter((t) => t.status === activeTab);
  }, [activeTab, transactions]);

  // 4. Styles Helper
  const getStatusStyles = (status) => {
    switch (status) {
      case "Completed":
        return { icon: "check-circle", color: "#2A9D8F" };
      case "Pending":
        return { icon: "clock-outline", color: "#F4A261" };
      case "Rejected":
        return { icon: "alert-circle", color: "#E76F51" };
      default:
        return { icon: "help-circle", color: "#666" };
    }
  };

  const renderTransactionItem = ({ item }) => {
    const statusStyle = getStatusStyles(item.status);

    return (
      <View style={styles.card}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: statusStyle.color + "20" },
          ]}
        >
          <MaterialCommunityIcons
            name={statusStyle.icon}
            size={24}
            color={statusStyle.color}
          />
        </View>
        <View style={styles.cardInfo}>
          {/* Translate "Order #" */}
          <Text style={styles.cardTitle}>
            {t("Order #")}
            {item.orderId}
          </Text>
          <Text style={styles.cardSubtitle}>{item.farmerName}</Text>
        </View>
        <View style={styles.cardAmountContainer}>
          <Text style={[styles.cardAmount, { color: statusStyle.color }]}>
            ₹{item.amount.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.cardDate}>
            {moment(item.date).format("DD MMM")}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("Transaction History")}</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>{t("Total Completed Revenue")}</Text>
        <Text style={styles.summaryAmount}>
          ₹{totalRevenue.toLocaleString("en-IN")}
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            {/* Logic uses English 'tab' key, UI shows Translated text */}
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {t(tab)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchTransactions} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              {/* Dynamic translation: "No Rejected transactions found" */}
              <Text style={styles.emptyText}>
                {t("No {{status}} transactions found.", {
                  status: t(activeTab),
                })}
              </Text>
            </View>
          )
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#F8F9FA",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#FFF",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#264653",
  },
  summaryCard: {
    backgroundColor: "#457B9D", // Vendor blue
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#FFF",
    opacity: 0.8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#457B9D", // Vendor blue
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#457B9D",
  },
  listContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  cardAmountContainer: {
    alignItems: "flex-end",
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#264653",
  },
  cardDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
