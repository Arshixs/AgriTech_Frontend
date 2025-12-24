import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from "../../secret";
import { useTranslation } from "react-i18next";

const API_URL = API_BASE_URL;

export default function MspComplianceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [mspData, setMspData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); //  kharif, rabi, year-round

  const fetchMSPData = async () => {
    try {
      const endpoint =
        filter === "all"
          ? `${API_URL}/api/msp`
          : `${API_URL}/api/msp?season=${filter}`;

      const response = await axios.get(endpoint);
      setMspData(response.data.data);
    } catch (error) {
      console.error("Fetch MSP Error:", error);
      Alert.alert(t("Error"), t("Failed to fetch MSP data"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMSPData();
  }, [filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMSPData();
  }, [filter]);

  const handleEdit = (item) => {
    router.push({
      pathname: "/edit-msp",
      params: {
        id: item._id,
        cropName: item.cropName,
        price: item.price.toString(),
        unit: item.unit,
        season: item.season,
      },
    });
  };

  const getSeasonColor = (season) => {
    switch (season) {
      case "kharif":
        return "#2A9D8F";
      case "rabi":
        return "#E76F51";
      case "year-round":
        return "#457B9D";
      default:
        return "#666";
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleEdit(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <MaterialCommunityIcons name="leaf" size={24} color="#606C38" />
          <Text style={styles.cropName}>{item.cropName}</Text>
        </View>
        <View
          style={[
            styles.seasonBadge,
            { backgroundColor: getSeasonColor(item.season) },
          ]}
        >
          <Text style={styles.seasonText}>
            {item.season === "year-round"
              ? t("All Year")
              : item.season.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>{t("MSP Price")}</Text>
          <Text style={styles.priceValue}>₹{item.price}</Text>
          <Text style={styles.unitText}>
            {t("per")} {item.unit}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#606C38" />
        </TouchableOpacity>
      </View>

      {item.effectiveFrom && (
        <Text style={styles.effectiveText}>
          {t("Effective from")}:{" "}
          {new Date(item.effectiveFrom).toLocaleDateString("en-IN")}
        </Text>
      )}
    </TouchableOpacity>
  );

  const FilterButton = ({ label, value }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[styles.filterText, filter === value && styles.filterTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t("MSP")} {filter === "rabi" ? "(2026-2027)" : "(2025-2026)"}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add-msp")}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {/* <FilterButton label={t("All")} value="all" /> */}
        <FilterButton label={t("Kharif")} value="kharif" />
        <FilterButton label={t("Rabi")} value="rabi" />
        <FilterButton label={t("Year-Round")} value="year-round" />
      </View>

      <FlatList
        data={mspData}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.mspListSubheaderView}>
            <Text style={styles.listHeader}>
              {mspData.length} {t("crops listed")}
            </Text>
            <Text style={styles.listRefresh} onPress={onRefresh}>
              {t("Refresh")}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={48}
              color="#CCC"
            />
            <Text style={styles.emptyText}>{t("No MSP data available")}</Text>
          </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
  },
  mspListSubheaderView: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listRefresh: {
    color: "#0000FF",
  },
  addButton: {
    backgroundColor: "#606C38",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#F0F0F0",
  },
  filterButtonActive: {
    backgroundColor: "#606C38",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#FFF",
  },
  listContainer: {
    padding: 20,
  },
  listHeader: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#606C38",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
    marginLeft: 8,
    flex: 1,
  },
  seasonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  seasonText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFF",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#606C38",
  },
  unitText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F2E6",
    justifyContent: "center",
    alignItems: "center",
  },
  effectiveText: {
    fontSize: 12,
    color: "#888",
    marginTop: 12,
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
