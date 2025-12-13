import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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

const SOCKET_URL = API_BASE_URL; // same backend

export default function BiddingRoom() {
  const { saleId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const socketRef = useRef(null);

  const [bids, setBids] = useState([]);
  const [currentHighest, setCurrentHighest] = useState(0);
  const [auctionEndDate, setAuctionEndDate] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [highestBidder, setHighestBidder] = useState(null);

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

      if (res.ok) {
        setBids(data.bids);
        setCurrentHighest(data.currentHighestBid);
        setAuctionEndDate(data.auctionEndDate);
        setHighestBidder(data.highestBidder);
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

    socketRef.current.emit("join-sale-room", saleId);

    socketRef.current.on("new-bid", (payload) => {
      if (payload.saleId === saleId) {
        setBids((prev) => [payload.bid, ...prev]);
        setCurrentHighest(payload.currentHighestBid);
        setHighestBidder(payload.highestBidder);
      }
    });

    return () => {
      socketRef.current.disconnect();
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
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network error");
    } finally {
      setPlacingBid(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const isWinning =
    highestBidder &&
    user?.userId &&
    highestBidder.toString() === user.userId.toString();

  const auctionEnded = timeLeft === "Auction Ended";

  // =========================
  // UI
  // =========================
  if (loading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="large" color="#E76F51" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bidding Room</Text>
      </View>

      {/* TIMER */}
      <View style={styles.timerBox}>
        <MaterialCommunityIcons
          name="timer-outline"
          size={22}
          color="#E76F51"
        />
        <Text style={styles.timerText}>{timeLeft}</Text>
      </View>

      {/* CURRENT BID */}
      <Text style={styles.currentBid}>₹{currentHighest}</Text>

      {isWinning && (
        <Text style={styles.winningText}>You are currently winning 🎉</Text>
      )}

      {/* BID INPUT */}
      {!auctionEnded && (
        <View style={styles.bidBox}>
          <TextInput
            placeholder="Enter bid amount"
            keyboardType="numeric"
            value={bidAmount}
            onChangeText={setBidAmount}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.bidButton}
            onPress={handlePlaceBid}
            disabled={placingBid}
          >
            <Text style={styles.bidButtonText}>
              {placingBid ? "Placing..." : "Place Bid"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* BID HISTORY */}
      <FlatList
        data={bids}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.bidItem}>
            <Text style={styles.bidAmount}>₹{item.amount}</Text>
            <Text style={styles.bidder}>
              Bidder: {item.bidder?.name || "Anonymous"}
            </Text>
          </View>
        )}
      />
    </ScreenWrapper>
  );
}

// =========================
// STYLES
// =========================
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 12,
  },
  timerBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  timerText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "bold",
    color: "#E76F51",
  },
  currentBid: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
    color: "#264653",
  },
  winningText: {
    textAlign: "center",
    color: "#2A9D8F",
    fontWeight: "bold",
    marginBottom: 10,
  },
  bidBox: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  bidButton: {
    backgroundColor: "#E76F51",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 8,
  },
  bidButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  bidItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  bidAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bidder: {
    fontSize: 12,
    color: "#777",
  },
});
