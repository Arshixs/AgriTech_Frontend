// File: app/(buyer-tabs)/bidding.js

import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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

// import axios from '../../src/utils/axios'; // use your axios instance

export default function BiddingScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [bids, setBids] = useState([]);
  const [activeTab, setActiveTab] = useState("All");

  // 🔹 Fetch unique latest bids
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
      setBids(data.bids);

      // TEMP: assume API response already matches the structure you shared
      // setBids(apiResponse.bids);
    } catch (err) {
      console.log("Error fetching bids", err);
    }
  };

  // 🔹 Map backend status → tab
  const filterByTab = (bid) => {
    if (activeTab === "All") return true;

    if (activeTab === "Winning") return bid.status === "active";
    if (activeTab === "Outbid") return bid.status === "outbid";
    if (activeTab === "Closed")
      return bid.status === "won" || bid.status === "lost";

    return false;
  };

  const filteredBids = bids.filter(filterByTab);

  // 🔹 Status color
  const getStatusColor = (status) => {
    if (status === "active") return "#2A9D8F"; // Winning
    if (status === "outbid") return "#E76F51";
    if (status === "won") return "#457B9D";
    return "#666"; // lost
  };

  // 🔹 Human readable status
  const getStatusLabel = (status) => {
    if (status === "active") return "Winning";
    if (status === "outbid") return "Outbid";
    if (status === "won") return "Won";
    return "Lost";
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
          <Text style={styles.bidType}>Bid Placed</Text>
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusLabel(item.status)}
          </Text>
        </View>

        <Text style={styles.bidTitle}>
          {crop.cropName} ({sale.quantity} {sale.unit})
        </Text>

        <View style={styles.priceRow}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Current Bid</Text>
            <Text style={styles.priceValue}>₹{sale.currentHighestBid}</Text>
          </View>

          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>My Bid</Text>
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
        <Text style={styles.headerTitle}>My Bids</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["All", "Winning", "Outbid", "Closed"].map((tab) => (
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

        {/* ❌ Live tab removed */}
        {/*
        <TouchableOpacity>
          <Text>Live</Text>
        </TouchableOpacity>
        */}
      </View>

      <FlatList
        data={filteredBids}
        renderItem={renderBidItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No {activeTab.toLowerCase()} bids found.
          </Text>
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
