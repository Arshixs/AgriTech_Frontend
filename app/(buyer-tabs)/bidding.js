import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../../secret";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

// 1. Define stable keys outside the component (In English)
const TABS = ["All", "Winning", "Outbid", "Closed"];

export default function BiddingScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [bids, setBids] = useState([]);

  // 2. State always holds the English key, e.g., "All"
  const [activeTab, setActiveTab] = useState("All");
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      if (user?.token) {
        fetchBids();
      }
    }, [user])
  );

  const fetchBids = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bids/my/unique`, {
        method: "GET",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setBids(data.bids || []);
    } catch (err) {
      console.log("Error fetching bids", err);
    }
  };

  // 3. Filter logic compares English State against English Strings
  const filterByTab = (bid) => {
    if (activeTab === "All") return true; // "All" matches "All" regardless of language

    if (activeTab === "Winning") return bid.status === "active";
    if (activeTab === "Outbid") return bid.status === "outbid";
    if (activeTab === "Closed")
      return bid.status === "won" || bid.status === "lost";

    return false;
  };

  const filteredBids = bids.filter(filterByTab);

  const getStatusColor = (status) => {
    if (status === "active") return "#2A9D8F";
    if (status === "outbid") return "#E76F51";
    if (status === "won") return "#457B9D";
    return "#666";
  };

  const getStatusLabel = (status) => {
    if (status === "active") return t("Winning");
    if (status === "outbid") return t("Outbid");
    if (status === "won") return t("Won");
    return t("Lost");
  };

  const renderBidItem = ({ item }) => {
    const sale = item.saleId;
    const crop = sale.cropId;

    return (
      <TouchableOpacity
        style={styles.bidCard}
        onPress={() =>
          router.push({
            pathname: "/bidding-room",
            params: { saleId: sale._id },
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.bidType}>{t("Bid Placed")}</Text>
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusLabel(item.status)}
          </Text>
        </View>

        <Text style={styles.bidTitle}>
          {crop?.cropName || t("Unknown Crop")} ({sale?.quantity} {sale?.unit})
        </Text>

        <View style={styles.priceRow}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>{t("Current Bid")}</Text>
            <Text style={styles.priceValue}>₹{sale?.currentHighestBid}</Text>
          </View>

          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>{t("My Bid")}</Text>
            <Text
              style={[
                styles.priceValue,
                { color: getStatusColor(item.status) },
              ]}
            >
              ₹{item.amount}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("My Bids")}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {/* 4. Loop over English keys */}
        {TABS.map((tabKey) => (
          <TouchableOpacity
            key={tabKey}
            // Compare English key to English state
            style={[styles.tab, activeTab === tabKey && styles.tabActive]}
            // Set English key to state
            onPress={() => setActiveTab(tabKey)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tabKey && styles.tabTextActive,
              ]}
            >
              {/* 5. ONLY Translate for display */}
              {t(tabKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBids}
        renderItem={renderBidItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {/* 6. Clean up the empty message translation */}
            {t("No bids found for")} "{t(activeTab)}"
          </Text>
        }
      />
    </ScreenWrapper>
  );
}

// ... styles remain exactly the same
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#FFF",
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#264653" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#E76F51" },
  tabText: { fontSize: 14, color: "#666", fontWeight: "600" },
  tabTextActive: { color: "#E76F51" },
  listContainer: { padding: 20 },
  bidCard: {
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
    alignItems: "center",
    marginBottom: 4,
  },
  bidType: {
    fontSize: 12,
    color: "#FFF",
    backgroundColor: "#606C38",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    overflow: "hidden",
  },
  statusText: { fontSize: 14, fontWeight: "bold" },
  bidTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
    marginVertical: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  priceItem: { flex: 1, alignItems: "flex-start" },
  priceLabel: { fontSize: 13, color: "#666", marginBottom: 4 },
  priceValue: { fontSize: 16, fontWeight: "600", color: "#264653" },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
});
