import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../secret";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import { useTranslation } from "react-i18next";

export default function MspScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mspList, setMspList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSeasonFilter, setActiveSeasonFilter] = useState(t("All")); // New State for quick filtering
  const [initialFetchError, setInitialFetchError] = useState(null);

  // Data fetch function (PUBLIC endpoint, no Auth token needed)
  const fetchMspData = async () => {
    setRefreshing(true);
    setInitialFetchError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/msp`); // Assuming publicRoutes is bound to /api/public

      if (!res.ok) {
        throw new Error(t("Failed to fetch MSP data."));
      }

      const data = await res.json();
      const fetchedList = data.data || [];

      setMspList(fetchedList);
      // We rely on the search/filter useEffect to update filteredList
    } catch (error) {
      console.error("MSP Fetch Error:", error.message);
      setInitialFetchError(t("Could not connect to fetch public price list."));
      setMspList([]);
      setFilteredList([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMspData();
  }, []);

  // Filter/Search Logic
  useEffect(() => {
    let listToFilter = mspList;
    let lowerQuery = searchQuery.toLowerCase().trim();
    let seasonFilter = activeSeasonFilter;

    // 1. Filter by Season
    if (seasonFilter !== t("All")) {
      listToFilter = listToFilter.filter(
        (msp) => msp.season.toLowerCase() === seasonFilter.toLowerCase()
      );
    }

    // 2. Filter by Search Query
    if (lowerQuery !== "") {
      listToFilter = listToFilter.filter(
        (msp) =>
          msp.cropName.toLowerCase().includes(lowerQuery) ||
          msp.season.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredList(listToFilter);
  }, [searchQuery, mspList, activeSeasonFilter]);

  const onRefresh = () => {
    // Reset filters on pull-to-refresh
    setSearchQuery("");
    setActiveSeasonFilter(t("All"));
    fetchMspData();
  };

  const formatCurrency = (amount) => {
    if (amount === null || isNaN(amount)) return t("N/A");
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSeasonColor = (season) => {
    switch (season.toLowerCase()) {
      case "kharif":
        return "#2A9D8F"; // Green for Monsoon/Summer
      case "rabi":
        return "#F4A261"; // Orange for Winter
      default:
        return "#457B9D";
    }
  };

  // Calculate summary stats
  const totalCrops = mspList.length;
  // Kharif crops are typically planted with the start of the monsoon season.
  const kharifCount = mspList.filter(
    (msp) => msp.season.toLowerCase() === "kharif"
  ).length;
  // Rabi crops are typically planted in winter.
  const rabiCount = mspList.filter(
    (msp) => msp.season.toLowerCase() === "rabi"
  ).length;

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            {t("Fetching Public MSP Data...")}
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
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <FontAwesome name="arrow-left" size={20} color="#264653" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t("Minimum Support Price")}</Text>
          </View>
          <Text style={styles.subtitle}>
            {t("Official MSP rates for key crops")} ({mspList.length} {t("total listed")})
          </Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <FontAwesome
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t("Search by crop name or season...")}
              placeholderTextColor="#888"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Summary Stats Card (NEW ADDITION) */}
          <View style={styles.summaryStatsContainer}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.statLabel}>{t("Total Crops")}</Text>
              <Text style={styles.statValue}>{totalCrops}</Text>
            </View>
            <View style={styles.summaryStatDivider} />
            <View style={styles.summaryStatItem}>
              <Text style={styles.statLabel}>{t("Kharif Crops")}</Text>
              <Text style={[styles.statValue, { color: "#2A9D8F" }]}>
                {kharifCount}
              </Text>
            </View>
            <View style={styles.summaryStatDivider} />
            <View style={styles.summaryStatItem}>
              <Text style={styles.statLabel}>{t("Rabi Crops")}</Text>
              <Text style={[styles.statValue, { color: "#F4A261" }]}>
                {rabiCount}
              </Text>
            </View>
          </View>

          {/* Quick Filters (NEW ADDITION) */}
          <View style={styles.filterContainer}>
            {[t("All"), t("Kharif"), t("Rabi")].map((season) => (
              <TouchableOpacity
                key={season}
                style={[
                  styles.filterPill,
                  activeSeasonFilter === season && styles.filterPillActive,
                  // Color the active pill based on the season color
                  activeSeasonFilter === season && {
                    backgroundColor: getSeasonColor(season) || "#457B9D",
                    borderColor: getSeasonColor(season) || "transparent",
                  },
                ]}
                onPress={() => setActiveSeasonFilter(season)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeSeasonFilter === season
                      ? styles.filterTextActive
                      : styles.filterTextInactive,
                  ]}
                >
                  {season}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Error Message */}
          {initialFetchError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{t("Error")}: {initialFetchError}</Text>
            </View>
          )}

          {/* MSP List */}
          {filteredList.length > 0
            ? filteredList.map((msp) => (
                <View key={msp._id} style={styles.mspCard}>
                  <View style={styles.mspHeader}>
                    <Text style={styles.cropName}>{msp.cropName}</Text>
                    <View
                      style={[
                        styles.seasonBadge,
                        { backgroundColor: getSeasonColor(msp.season) },
                      ]}
                    >
                      <Text style={styles.seasonText}>
                        {msp.season.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.priceRow}>
                    <View style={styles.priceColumn}>
                      <Text style={styles.priceLabel}>{t("MSP Rate")}</Text>
                      <Text style={styles.priceValue}>
                        {formatCurrency(msp.price)}
                      </Text>
                      <Text style={styles.priceUnit}>
                        {t("per")} {msp.unit || t("quintal")}
                      </Text>
                    </View>

                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>{t("Implemented Year")}</Text>
                      <Text style={styles.detailValue}>
                        {msp.implementedYear || "2024-25"}
                      </Text>

                      <Text style={styles.detailLabel}>{t("Grade")}</Text>
                      <Text style={styles.detailValue}>
                        {msp.grade || t("A Grade")}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            : !initialFetchError && (
                <View style={styles.noResultsCard}>
                  <Text style={styles.noResultsText}>
                    {t("No results found for")} "{searchQuery || activeSeasonFilter}"
                  </Text>
                  <Text style={styles.noResultsSubtext}>
                    {t("Try adjusting your search or filter.")}
                  </Text>
                </View>
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
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
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
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E76F51",
  },
  errorText: {
    color: "#E76F51",
    fontWeight: "600",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#264653",
  },
  clearButton: {
    marginLeft: 10,
  },
  // --- NEW STYLES FOR SUMMARY STATS ---
  summaryStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  summaryStatItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryStatDivider: {
    width: 1,
    backgroundColor: "#E8E8E8",
    marginHorizontal: 10,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
  },
  // --- NEW STYLES FOR QUICK FILTERS ---
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CCC",
    marginHorizontal: 5,
    alignItems: "center",
  },
  filterPillActive: {
    // Background color set inline via getSeasonColor
    borderColor: "transparent",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  filterTextInactive: {
    color: "#666",
  },
  // --- EXISTING STYLES ---
  mspCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mspHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 10,
  },
  cropName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#264653",
  },
  seasonBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  seasonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceColumn: {
    flex: 1.5,
    paddingRight: 15,
    borderRightWidth: 1,
    borderRightColor: "#F0F0F0",
  },
  detailColumn: {
    flex: 1,
    paddingLeft: 15,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 30,
    fontWeight: "extrabold",
    color: "#E76F51",
    marginTop: 5,
  },
  priceUnit: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginTop: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 5,
  },
  noResultsCard: {
    backgroundColor: "#F8F8F8",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 5,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
});
