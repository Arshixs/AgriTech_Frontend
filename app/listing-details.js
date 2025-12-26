import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
// 1. Add Import
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../secret";
import Button from "../src/components/common/Button";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import { useAuth } from "../src/context/AuthContext";

export default function ListingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  // 2. Initialize Hook
  const { t } = useTranslation();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH LISTING DETAILS
  // =========================
  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/sales/marketplace/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setListing(data.marketplaceSale);
      } else {
        Alert.alert(t("Error"), data.message || t("Failed to load listing"));
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t("Error"), t("Network error"));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (id) fetchListingDetails();
    }, [id])
  );

  // =========================
  // LOADING STATES
  // =========================
  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E76F51" />
        </View>
      </ScreenWrapper>
    );
  }

  if (!listing) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <Text>{t("Listing not found.")}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // =========================
  // DATA FORMATTING
  // =========================
  // Wrap fallbacks in t()
  const cropName = listing.cropId?.cropName || t("Unknown Crop");
  const farmerName = listing.farmerId?.name || t("Unknown Farmer");
  const farmerLocation = listing.farmerId?.address || t("Location N/A");
  const quantity = `${listing.quantity} ${listing.unit}`;

  const isAuctionActive = listing.status === "active";

  const isWinning =
    listing.highestBidder &&
    user?.userId &&
    listing.highestBidder.toString() === user.userId.toString();

  const currentPrice =
    listing.totalBids > 0 ? listing.currentHighestBid : listing.minimumPrice;

  // =========================
  // UI
  // =========================
  return (
    <ScreenWrapper>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("Listing Details")}</Text>
      </View>

      {/* REFRESH BUTTON */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={fetchListingDetails}
      >
        <MaterialCommunityIcons name="refresh" size={20} color="#264653" />
        <Text style={styles.refreshText}>{t("Refresh")}</Text>
      </TouchableOpacity>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchListingDetails}
          />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* IMAGE PLACEHOLDER */}
        <View style={styles.imagePlaceholder}>
          <MaterialCommunityIcons name="sprout" size={64} color="#2A9D8F" />
        </View>

        <View style={styles.container}>
          <Text style={styles.cropName}>{cropName}</Text>

          {/* FARMER INFO */}
          <View style={styles.farmerRow}>
            <MaterialCommunityIcons
              name="account-circle"
              size={40}
              color="#CCC"
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.farmerName}>{farmerName}</Text>
              <Text style={styles.farmerLocation}>{farmerLocation}</Text>
            </View>
          </View>

          {/* DETAILS */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t("Quantity")}</Text>
              <Text style={styles.detailValue}>{quantity}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>
                {listing.totalBids > 0
                  ? t("Current Highest Bid")
                  : t("Starting Price")}
              </Text>
              <Text style={[styles.detailValue, { color: "#E76F51" }]}>
                ₹{currentPrice}
              </Text>
            </View>
          </View>

          {/* QUALITY CERT */}
          {listing.hasQualityCertificate && (
            <View style={styles.certBox}>
              <MaterialCommunityIcons
                name="certificate"
                size={24}
                color="#E9C46A"
              />
              <Text style={styles.certText}>
                {t("Quality Certified: Grade")} {listing.qualityGrade}
              </Text>
            </View>
          )}

          {/* STATUS & ACTIONS */}
          <View style={{ marginTop: 20 }}>
            {isAuctionActive ? (
              <>
                {isWinning && (
                  <View style={styles.winningBox}>
                    <MaterialCommunityIcons
                      name="trophy"
                      size={24}
                      color="#2A9D8F"
                    />
                    <Text style={styles.winningText}>
                      {t("You are currently winning this auction")}
                    </Text>
                  </View>
                )}

                <Button
                  title={t("Go to Bidding Room")}
                  onPress={() =>
                    router.push({
                      pathname: "/bidding-room",
                      params: { saleId: listing._id },
                    })
                  }
                  style={styles.bidRoomButton}
                />
              </>
            ) : (
              <View style={styles.statusContainer}>
                {/* Translate both the Label and the dynamic Status */}
                <Text style={styles.statusTitle}>
                  {t("Status:")} {t(listing.status).toUpperCase()}
                </Text>

                {listing.status === "sold" && (
                  <Text style={styles.statusMessage}>
                    {t("This listing has been sold.")}
                  </Text>
                )}

                {listing.status === "unsold" && (
                  <Text style={styles.statusMessage}>
                    {t("Auction ended with no bids.")}
                  </Text>
                )}

                {listing.status === "cancelled" && (
                  <Text style={styles.statusMessage}>
                    {t("Listing was cancelled by the seller.")}
                  </Text>
                )}

                {listing.status === "pending" && (
                  <Text style={styles.statusMessage}>
                    {t("Auction has not started yet.")}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

// Styles remain unchanged
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#264653",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginRight: 20,
    marginTop: 10,
  },
  refreshText: {
    marginLeft: 6,
    color: "#264653",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 20,
  },
  cropName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 16,
  },
  farmerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  farmerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  farmerLocation: {
    fontSize: 14,
    color: "#666",
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailItem: {
    alignItems: "center",
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#264653",
  },
  certBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  certText: {
    marginLeft: 10,
    color: "#F9A825",
    fontWeight: "bold",
  },
  winningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2F1",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  winningText: {
    marginLeft: 10,
    color: "#2A9D8F",
    fontWeight: "bold",
  },
  bidRoomButton: {
    backgroundColor: "#E76F51",
  },
  statusContainer: {
    padding: 20,
    backgroundColor: "#ECEFF1",
    borderRadius: 12,
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#37474F",
  },
  statusMessage: {
    marginTop: 6,
    fontSize: 14,
    color: "#607D8B",
  },
});
