import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import moment from "moment";
import { useCallback, useMemo, useState } from "react";
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
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

// Filter Keys
const TABS = ["All", "Income", "Expense"];

export default function FarmerTransactionHistory() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  // 1. Fetch Transactions (Unified Endpoint)
  const fetchTransactions = async () => {
    if (!user?.token) return;
    setLoading(true);

    try {
      // Ensure you have added this route to your backend (farmerRoutes.js)
      const res = await fetch(`${API_BASE_URL}/api/data/transactions`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTransactions(data.data || []);
        setSummary(
          data.summary || { totalIncome: 0, totalExpense: 0, balance: 0 }
        );
      } else {
        // Fallback for empty state or error
        setTransactions([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert(t("Error"), t("Could not fetch transaction history"));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  // 2. Filter Logic
  const filteredTransactions = useMemo(() => {
    if (activeTab === "All") return transactions;
    return transactions.filter(
      (t) => t.type?.toLowerCase() === activeTab.toLowerCase()
    );
  }, [activeTab, transactions]);

  // 3. Render Helper
  const renderTransactionItem = ({ item }) => {
    const isIncome = item.type === "income";
    const color = isIncome ? "#2A9D8F" : "#E76F51"; // Green for Income, Red for Expense
    const icon = isIncome ? "arrow-down-circle" : "arrow-up-circle"; // Down = into pocket, Up = out of pocket (or use explicit icons)
    const sign = isIncome ? "+" : "-";

    return (
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
          <MaterialCommunityIcons
            name={item.icon || (isIncome ? "cash" : "shopping")}
            size={24}
            color={color}
          />
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </View>

        <View style={styles.cardAmountContainer}>
          <Text style={[styles.cardAmount, { color }]}>
            {sign}₹{item.amount?.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.cardDate}>
            {moment(item.date).format("DD MMM, YY")}
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
        <Text style={styles.headerTitle}>{t("My Transactions")}</Text>
      </View>

      {/* Financial Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>{t("Net Balance")}</Text>
          <Text style={styles.balanceAmount}>
            ₹{summary.balance?.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(42, 157, 143, 0.2)" },
              ]}
            >
              <MaterialCommunityIcons
                name="arrow-down"
                size={16}
                color="#2A9D8F"
              />
            </View>
            <View>
              <Text style={styles.statLabel}>{t("Income")}</Text>
              <Text style={[styles.statValue, { color: "#2A9D8F" }]}>
                ₹{summary.totalIncome?.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(231, 111, 81, 0.2)" },
              ]}
            >
              <MaterialCommunityIcons
                name="arrow-up"
                size={16}
                color="#E76F51"
              />
            </View>
            <View>
              <Text style={styles.statLabel}>{t("Expense")}</Text>
              <Text style={[styles.statValue, { color: "#E76F51" }]}>
                ₹{summary.totalExpense?.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
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
              {t(tab)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchTransactions} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="receipt" size={48} color="#CCC" />
              <Text style={styles.emptyText}>
                {t("No {{type}} transactions found.", {
                  type: t(activeTab).toLowerCase(),
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#264653",
  },

  // Summary Card Styles
  summaryCard: {
    backgroundColor: "#264653", // Dark Green/Teal
    borderRadius: 20,
    margin: 20,
    padding: 20,
    shadowColor: "#2A9D8F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#2A9D8F", // Farmer Green
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#2A9D8F",
  },

  // List
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#264653",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#888",
    textTransform: "capitalize",
  },
  cardAmountContainer: {
    alignItems: "flex-end",
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardDate: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#999",
  },
});
