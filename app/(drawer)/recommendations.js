import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../secret";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

export default function RecommendationsScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [soilData, setSoilData] = useState(null);
  const authToken = user?.token;

  // 1. Fetch Fields on Mount
  useEffect(() => {
    if (authToken) {
      fetchFields();
    }
  }, [authToken]);

  const fetchFields = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/farm/fields`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setFields(data.fields || []);

      // Auto-select first field if available
      if (data.fields && data.fields.length > 0) {
        handleFieldChange(data.fields[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Field Fetch Error:", err);
      setLoading(false);
    }
  };

  const handleFieldChange = (field) => {
    setSelectedField(field);
    fetchFieldSpecificData(field._id);
  };

  const fetchFieldSpecificData = async (fieldId) => {
    setRefreshing(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };

      // 2. Fetch Latest Soil Data for THIS Field
      const soilRes = await fetch(
        `${API_BASE_URL}/api/data/soil/latest?fieldId=${fieldId}`,
        { headers }
      );
      const soilJson = await soilRes.json();
      setSoilData(soilJson.soilData);

      // 3. Fetch Crop Recommendations (Logic now uses field-specific soil)
      // Note: You may want to update this endpoint to take fieldId as well
      const recRes = await fetch(
        `${API_BASE_URL}/api/data/recommendations?fieldId=${fieldId}`,
        { headers }
      );
      const recJson = await recRes.json();
      setRecommendations(recJson.recommendations || []);
    } catch (error) {
      console.error("Fetch Error:", error.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const onRefresh = () => {
    fetchFields();
    if (selectedField) fetchFieldSpecificData(selectedField._id);
  };

  const getSuitabilityColor = (score) => {
    if (score >= 85) return "#2A9D8F";
    if (score >= 70) return "#F4A261";
    return "#E76F51";
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
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
          <Text style={styles.header}>{t("Recommendations")}</Text>

          {/* Field Selection Horizontal List */}
          <Text style={styles.sectionLabel}>{t("Select a Field")}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.fieldSelector}
          >
            {fields.map((field) => (
              <TouchableOpacity
                key={field._id}
                onPress={() => handleFieldChange(field)}
                style={[
                  styles.fieldChip,
                  selectedField?._id === field._id && styles.fieldChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.fieldChipText,
                    selectedField?._id === field._id &&
                      styles.fieldChipTextActive,
                  ]}
                >
                  {field.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Soil Analysis Card */}
          {soilData ? (
            <View style={styles.soilCard}>
              <View style={styles.soilHeader}>
                <MaterialCommunityIcons
                  name="terrain"
                  size={28}
                  color="#606C38"
                />
                <Text style={styles.soilTitle}>
                  {t("Soil Analysis")}: {selectedField?.name}
                </Text>
              </View>

              <View style={styles.soilGrid}>
                <View style={styles.soilItem}>
                  <Text style={styles.soilLabel}>{t("pH Level")}</Text>
                  <Text style={styles.soilValue}>{soilData.pH}</Text>
                </View>
                <View style={styles.soilItem}>
                  <Text style={styles.soilLabel}>{t("Soil Type")}</Text>
                  <Text style={styles.soilValue}>{soilData.soilType}</Text>
                </View>
                <View style={styles.soilItem}>
                  <Text style={styles.soilLabel}>{t("Nitrogen")}</Text>
                  <Text style={styles.soilValue}>{soilData.nitrogen}</Text>
                </View>
                <View style={styles.soilItem}>
                  <Text style={styles.soilLabel}>{t("Phosphorus")}</Text>
                  <Text style={styles.soilValue}>{soilData.phosphorus}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noDataCard}>
              <MaterialCommunityIcons
                name="flask-empty-off-outline"
                size={40}
                color="#CCC"
              />
              <Text style={styles.noDataText}>
                {t("No soil analysis found for this field.")}
              </Text>
            </View>
          )}

          {/* Recommendations List */}
          {recommendations.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                {t("Recommended Crops")}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {t("Best suited for")} {selectedField?.name}
              </Text>

              {recommendations.map((crop) => (
                <TouchableOpacity
                  key={crop._id}
                  style={styles.cropCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.cropHeader}>
                    <View style={styles.cropTitleRow}>
                      <MaterialCommunityIcons
                        name={crop.icon}
                        size={32}
                        color="#2A9D8F"
                      />
                      <View style={styles.cropTitleContainer}>
                        <Text style={styles.cropName}>{crop.cropName}</Text>
                        <Text style={styles.cropSeason}>
                          {crop.season} {t("Season")}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.suitabilityBadge,
                        {
                          backgroundColor: getSuitabilityColor(
                            crop.suitability
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.suitabilityText}>
                        {crop.suitability}%
                      </Text>
                      <Text style={styles.suitabilityLabel}>
                        {t("Match")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <FontAwesome name="calendar" size={16} color="#666" />
                      <Text style={styles.detailText}>{crop.duration}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons
                        name="water"
                        size={16}
                        color="#666"
                      />
                      <Text style={styles.detailText}>
                        {crop.waterRequirement}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons
                        name="chart-line"
                        size={16}
                        color="#666"
                      />
                      <Text style={styles.detailText}>
                        {crop.expectedYield}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 10,
    marginBottom: 5,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    fontWeight: "600",
  },
  fieldSelector: { marginBottom: 20, flexDirection: "row" },
  fieldChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  fieldChipActive: { backgroundColor: "#264653", borderColor: "#264653" },
  fieldChipText: { color: "#666", fontWeight: "600" },
  fieldChipTextActive: { color: "#FFF" },
  soilCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 20,
  },
  soilHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  soilTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
    marginLeft: 12,
  },
  soilGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  soilItem: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  soilLabel: { fontSize: 12, color: "#666", marginBottom: 4 },
  soilValue: { fontSize: 15, fontWeight: "bold", color: "#264653" },
  noDataCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    marginBottom: 24,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#CCC",
  },
  noDataText: { marginTop: 10, color: "#999", fontSize: 14 },
  sectionTitle: { fontSize: 22, fontWeight: "bold", color: "#264653" },
  sectionSubtitle: { fontSize: 14, color: "#666", marginBottom: 15 },
  cropCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  cropHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  cropTitleRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  cropTitleContainer: { marginLeft: 12 },
  cropName: { fontSize: 18, fontWeight: "bold", color: "#264653" },
  cropSeason: { fontSize: 13, color: "#666" },
  suitabilityBadge: {
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 55,
  },
  suitabilityText: { fontSize: 16, fontWeight: "bold", color: "#FFF" },
  suitabilityLabel: { fontSize: 9, color: "#FFF" },
  detailsGrid: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 10,
  },
  detailItem: { flexDirection: "row", alignItems: "center", marginRight: 15 },
  detailText: { fontSize: 12, color: "#666", marginLeft: 5 },
});
