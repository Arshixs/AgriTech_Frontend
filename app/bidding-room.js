import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native";

import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import io from "socket.io-client";

import { API_BASE_URL } from "../secret";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import { useAuth } from "../src/context/AuthContext";

const SOCKET_URL = API_BASE_URL;
const { width } = Dimensions.get("window");

export default function BiddingRoom() {
  const { saleId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [saleInfo, setSaleInfo] = useState(null);
  const [saleLoading, setSaleLoading] = useState(true);

  const socketRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bidFlashAnim = useRef(new Animated.Value(0)).current;

  const [bids, setBids] = useState([]);
  const [currentHighest, setCurrentHighest] = useState(0);
  const [auctionEndDate, setAuctionEndDate] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [highestBidder, setHighestBidder] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Flash animation when new bid arrives
  const flashNewBid = () => {
    bidFlashAnim.setValue(1);
    Animated.timing(bidFlashAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  // =========================
  // FETCH EXISTING BIDS
  // =========================
  const fetchBids = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bids/${saleId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();
      console.log(data.bids.currentHighestBid);
      if (res.ok) {
        setBids(data.bids.bids || []);
        setCurrentHighest(data.bids.currentHighestBid || 0);
        setAuctionEndDate(data.bids.auctionEndDate);
        setHighestBidder(data.bids.highestBidder);
      } else {
        Alert.alert("Error", data.message || "Failed to load bids");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleInfo = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/sales/marketplace/${saleId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to load sale info");
        return;
      }

      const sale = data.marketplaceSale;
      setSaleInfo(sale);

      // Use backend as source of truth
      setAuctionEndDate(sale.auctionEndDate);
      setCurrentHighest(sale.currentHighestBid || sale.minimumPrice);
      setHighestBidder(sale.highestBidder);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load sale details");
    } finally {
      setSaleLoading(false);
    }
  };

  // =========================
  // SOCKET.IO SETUP
  // =========================
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        token: user.token,
      },
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      console.log("✅ Socket connected");
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    socketRef.current.emit("join-sale-room", saleId);

    socketRef.current.on("new-bid", (payload) => {
      console.log("📨 New bid received:", payload);
      if (payload.saleId === saleId) {
        setBids((prev) => [payload.bid, ...prev]);
        setCurrentHighest(payload.currentHighestBid);
        setHighestBidder(payload.highestBidder);
        flashNewBid();
      }
    });

    socketRef.current.on("auction-ended", (data) => {
      Alert.alert(
        "Auction Ended",
        data.status === "sold"
          ? `Sold for ₹${data.finalPrice}!`
          : "No bids received",
        [{ text: "OK", onPress: () => router.back() }]
      );
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
      console.log("❌ Socket disconnected");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-sale-room", saleId);
        socketRef.current.disconnect();
      }
    };
  }, [saleId]);

  // =========================
  // COUNTDOWN TIMER
  // =========================
  useEffect(() => {
    if (!auctionEndDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(auctionEndDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Auction Ended");
        clearInterval(timer);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionEndDate]);

  // =========================
  // PLACE BID
  // =========================
  const handlePlaceBid = async () => {
    const amount = parseFloat(bidAmount);

    if (isNaN(amount) || amount <= currentHighest) {
      return Alert.alert(
        "Invalid Bid",
        `Bid must be higher than ₹${currentHighest}`
      );
    }

    setPlacingBid(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bids/place`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          saleId,
          amount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Bid failed");
      } else {
        setBidAmount("");
        Alert.alert("Success", "Your bid has been placed!");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network error");
    } finally {
      setPlacingBid(false);
      fetchBids();
    }
  };

  const handleQuickBid = (increment) => {
    const newBid = currentHighest + increment;
    setBidAmount(newBid.toString());
  };

  useEffect(() => {
    const initializeAuction = async () => {
      try {
        // Step 1: Fetch sale info first
        await fetchSaleInfo();

        // Step 2: Then fetch bids (after sale info is loaded)
        await fetchBids();
      } catch (error) {
        console.error("Failed to initialize auction:", error);
      }
    };

    initializeAuction();
  }, []);
  console.log(`highestBidder: ${highestBidder}`);
  console.log(`user: ${user?._id}`);

  const isWinning =
    highestBidder &&
    user?._id &&
    highestBidder.toString() === user._id.toString();

  const auctionEnded = timeLeft === "Auction Ended";

  // =========================
  // UI
  // =========================
  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E76F51" />
          <Text style={styles.loadingText}>Loading auction...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  console.log(`Bids: ${bids}`);
  console.log(`isWinning: ${isWinning}`);
  console.log(`highestBidder: ${highestBidder}`);

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={26}
                color="#264653"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Live Auction</Text>
            <View style={styles.connectionIndicator}>
              <View
                style={[
                  styles.connectionDot,
                  { backgroundColor: isConnected ? "#2A9D8F" : "#E76F51" },
                ]}
              />
            </View>
          </View>
          {/* CROP INFO CARD */}
          {saleInfo && (
            <View style={styles.cropCard}>
              <View style={styles.cropHeader}>
                <MaterialCommunityIcons name="seed" size={28} color="#2A9D8F" />
                <Text style={styles.cropName}>{saleInfo.cropId.cropName}</Text>
              </View>

              <View style={styles.cropRow}>
                <Text style={styles.cropLabel}>Quantity</Text>
                <Text style={styles.cropValue}>
                  {saleInfo.quantity} {saleInfo.unit}
                </Text>
              </View>

              <View style={styles.cropRow}>
                <Text style={styles.cropLabel}>Minimum Price</Text>
                <Text style={styles.cropValue}>
                  ₹{saleInfo.minimumPrice.toLocaleString()}
                </Text>
              </View>

              <View style={styles.cropRow}>
                <Text style={styles.cropLabel}>Farmer</Text>
                {/* <Text style={styles.cropValue}>{saleInfo.farmerId.name}</Text> */}
              </View>

              <View style={styles.cropRow}>
                <Text style={styles.cropLabel}>Location</Text>
                <Text style={styles.cropValue}>
                  {/* {saleInfo.farmerId.address} */}
                </Text>
              </View>

              {saleInfo.storageLocation && (
                <View style={styles.cropRow}>
                  <Text style={styles.cropLabel}>Storage</Text>
                  <Text style={styles.cropValue}>
                    {saleInfo.storageLocation}
                  </Text>
                </View>
              )}
            </View>
          )}
          {/* AUCTION STATUS CARD */}
          <Animated.View
            style={[
              styles.statusCard,
              {
                backgroundColor: bidFlashAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["#FFFFFF", "#FFF4E6"],
                }),
              },
            ]}
          >
            {/* TIMER */}
            <View style={styles.timerContainer}>
              <MaterialCommunityIcons
                name="timer-sand"
                size={24}
                color={auctionEnded ? "#E76F51" : "#2A9D8F"}
              />
              <Text
                style={[
                  styles.timerText,
                  { color: auctionEnded ? "#E76F51" : "#2A9D8F" },
                ]}
              >
                {timeLeft}
              </Text>
            </View>

            {/* CURRENT BID */}
            <View style={styles.currentBidContainer}>
              <Text style={styles.currentBidLabel}>Current Highest Bid</Text>
              <Text style={styles.currentBidAmount}>
                ₹{currentHighest.toLocaleString()}
              </Text>
              <Text style={styles.totalBidsText}>
                {bids.length} {bids.length === 1 ? "bid" : "bids"} placed
              </Text>
            </View>

            {/* WINNING STATUS */}
            {isWinning && !auctionEnded && (
              <View style={{ alignItems: "center" }}>
                <Text style={styles.winningText}>🏆 You're Winning!</Text>
              </View>
            )}
          </Animated.View>
          {/* BID INPUT SECTION */}
          {!auctionEnded && (
            <View style={styles.bidInputSection}>
              <Text style={styles.sectionTitle}>Place Your Bid</Text>

              {/* Quick Bid Buttons */}
              <View style={styles.quickBidContainer}>
                <TouchableOpacity
                  style={styles.quickBidButton}
                  onPress={() => handleQuickBid(100)}
                >
                  <Text style={styles.quickBidText}>+₹100</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickBidButton}
                  onPress={() => handleQuickBid(500)}
                >
                  <Text style={styles.quickBidText}>+₹500</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickBidButton}
                  onPress={() => handleQuickBid(1000)}
                >
                  <Text style={styles.quickBidText}>+₹1000</Text>
                </TouchableOpacity>
              </View>

              {/* Custom Bid Input */}
              <View style={styles.bidInputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    value={bidAmount}
                    onChangeText={setBidAmount}
                    style={styles.input}
                    placeholderTextColor="#999"
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.bidButton,
                    placingBid && styles.bidButtonDisabled,
                  ]}
                  onPress={handlePlaceBid}
                  disabled={placingBid}
                >
                  {placingBid ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="gavel"
                        size={20}
                        color="#FFF"
                      />
                      <Text style={styles.bidButtonText}>Place Bid</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* BID HISTORY */}
          {/* Replace the FlatList and the maxHeight View with this */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Bid History ({bids.length})</Text>

            {bids.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="gavel" size={60} color="#CCC" />
                <Text style={styles.emptyStateText}>No bids yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Be the first to place a bid!
                </Text>
              </View>
            ) : (
              /* ✅ Add ScrollView with constrained height */
              <ScrollView
                style={styles.bidScrollContainer}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.bidList}>
                  {bids.map((item, index) => (
                    <View
                      key={item._id}
                      style={[
                        styles.bidItem,
                        index === 0 && styles.highestBidItem,
                      ]}
                    >
                      <View style={styles.bidItemLeft}>
                        {index === 0 && (
                          <MaterialCommunityIcons
                            name="crown"
                            size={20}
                            color="#FFD700"
                            style={styles.crownIcon}
                          />
                        )}
                        <View style={styles.bidderAvatar}>
                          <Text style={styles.bidderAvatarText}>
                            {item.buyerId?.companyName?.[0]?.toUpperCase() ||
                              "?"}
                          </Text>
                        </View>
                        <View style={styles.bidInfo}>
                          <Text style={styles.bidderName}>
                            {item.buyerId?.companyName || "Anonymous"}
                          </Text>
                          <Text style={styles.bidTime}>
                            {new Date(item.bidTime).toLocaleTimeString()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.bidAmount}>
                        ₹{item.amount.toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

// =========================
// STYLES
// =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
    flex: 1,
    marginLeft: 12,
  },
  connectionIndicator: {
    padding: 4,
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F0F9FF",
    borderRadius: 20,
    alignSelf: "center",
  },
  timerText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
  currentBidContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  currentBidLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  currentBidAmount: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 4,
  },
  totalBidsText: {
    fontSize: 12,
    color: "#999",
  },
  winningBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4F1F4",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 16,
  },
  winningText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "#2A9D8F",
  },
  bidInputSection: {
    backgroundColor: "#FFF",
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 12,
  },
  quickBidContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  quickBidButton: {
    flex: 1,
    backgroundColor: "#E8F4F8",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A9D8F",
  },
  quickBidText: {
    color: "#2A9D8F",
    fontWeight: "bold",
    fontSize: 14,
  },
  bidInputContainer: {
    flexDirection: "row",
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: "#264653",
  },
  bidButton: {
    backgroundColor: "#E76F51",
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    minWidth: 120,
    elevation: 3,
    shadowColor: "#E76F51",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  bidButtonDisabled: {
    backgroundColor: "#CCC",
  },
  bidButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  historySection: {
    backgroundColor: "#FFF",
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bidList: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#999",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#BBB",
    marginTop: 4,
  },
  bidItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  highestBidItem: {
    backgroundColor: "#FFF9E6",
    borderColor: "#FFD700",
    borderWidth: 2,
  },
  bidItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  crownIcon: {
    marginRight: 8,
  },
  bidderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2A9D8F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bidderAvatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  bidInfo: {
    flex: 1,
  },
  bidderName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 2,
  },
  bidTime: {
    fontSize: 12,
    color: "#999",
  },
  bidAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E76F51",
  },
  cropCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cropHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cropName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#264653",
    marginLeft: 12,
  },
  cropRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cropLabel: {
    fontSize: 14,
    color: "#777",
  },
  cropValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#264653",
  },
  bidScrollContainer: {
    maxHeight: 350, // ✅ Constrain height to enable scrolling
  },
});
