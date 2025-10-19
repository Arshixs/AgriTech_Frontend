import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";

export default function RecommendationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [soilData, setSoilData] = useState(null);

  // Mock data fetch
  const fetchData = () => {
    setTimeout(() => {
      setSoilData({
        pH: 6.5,
        nitrogen: "Medium",
        phosphorus: "High",
        potassium: "Medium",
        soilType: "Loamy",
      });

      setRecommendations([
        {
          id: 1,
          cropName: "Rice (Basmati)",
          season: "Kharif",
          suitability: 95,
          expectedYield: "4-5 tons/hectare",
          duration: "120-150 days",
          waterRequirement: "High",
          icon: "grain",
          benefits: [
            "Excellent match for current soil pH",
            "High market demand",
            "Good monsoon season crop",
          ],
          considerations: [
            "Requires consistent water supply",
            "Monitor for blast disease",
          ],
        },
        {
          id: 2,
          cropName: "Wheat",
          season: "Rabi",
          suitability: 88,
          expectedYield: "3-4 tons/hectare",
          duration: "110-130 days",
          waterRequirement: "Medium",
          icon: "barley",
          benefits: [
            "Suitable for loamy soil",
            "Good rotation crop after rice",
            "Stable market prices",
          ],
          considerations: ["Requires cool weather", "Monitor soil moisture"],
        },
        {
          id: 3,
          cropName: "Tomato",
          season: "Year-round",
          suitability: 82,
          expectedYield: "25-30 tons/hectare",
          duration: "90-120 days",
          waterRequirement: "Medium",
          icon: "food-apple",
          benefits: [
            "High profit potential",
            "Multiple harvests possible",
            "Growing urban demand",
          ],
          considerations: [
            "Requires disease management",
            "Needs support structures",
          ],
        },
        {
          id: 4,
          cropName: "Lentils (Masoor)",
          season: "Rabi",
          suitability: 78,
          expectedYield: "1-1.5 tons/hectare",
          duration: "90-110 days",
          waterRequirement: "Low",
          icon: "seed",
          benefits: [
            "Low water requirement",
            "Improves soil nitrogen",
            "Good for crop rotation",
          ],
          considerations: [
            "Sensitive to waterlogging",
            "Market price fluctuations",
          ],
        },
      ]);

      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getSuitabilityColor = (score) => {
    if (score >= 85) return "#2A9D8F";
    if (score >= 70) return "#F4A261";
    return "#E76F51";
  };

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <Text style={styles.header}>Crop Recommendations</Text>

          {/* Soil Analysis Card */}
          {soilData && (
            <View style={styles.soilCard}>
              <View style={styles.soilHeader}>
                <MaterialCommunityIcons
                  name="terrain"
                  size={28}
                  color="#606C38"
                />
                <Text style={styles.soilTitle}>Soil Analysis</Text>
              </View>

              <View style={styles.soilGrid}>
                <View style={styles.soilItem}>
                  <Text style={styles.soilLabel}>pH Level</Text>
                  <Text style={styles.soilValue}>{soilData.pH}</Text>
                </View>
                <View style={styles.soilItem}>
                  <Text style={styles.soilLabel}>Soil Type</Text>
                  <Text style={styles.soilValue}>{soilData.soilType}</Text>
                </View>
                <View style={styles.soilItem}>
                  <Text style={styles.soilLabel}>Nitrogen</Text>
                  <Text style={styles.soilValue}>{soilData.nitrogen}</Text>
                </View>
                <View style={styles.soilItem}>
                  <Text style={styles.soilLabel}>Phosphorus</Text>
                  <Text style={styles.soilValue}>{soilData.phosphorus}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Recommendations List */}
          <Text style={styles.sectionTitle}>Recommended Crops</Text>
          <Text style={styles.sectionSubtitle}>
            Based on your soil conditions, location, and season
          </Text>

          {recommendations.map((crop) => (
            <TouchableOpacity
              key={crop.id}
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
                    <Text style={styles.cropSeason}>{crop.season} Season</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.suitabilityBadge,
                    { backgroundColor: getSuitabilityColor(crop.suitability) },
                  ]}
                >
                  <Text style={styles.suitabilityText}>
                    {crop.suitability}%
                  </Text>
                  <Text style={styles.suitabilityLabel}>Match</Text>
                </View>
              </View>

              {/* Crop Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <FontAwesome name="calendar" size={16} color="#666" />
                  <Text style={styles.detailText}>{crop.duration}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="water" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {crop.waterRequirement} Water
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={16}
                    color="#666"
                  />
                  <Text style={styles.detailText}>{crop.expectedYield}</Text>
                </View>
              </View>

              {/* Benefits */}
              <View style={styles.benefitsSection}>
                <Text style={styles.benefitsTitle}>Why this crop?</Text>
                {crop.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <FontAwesome
                      name="check-circle"
                      size={14}
                      color="#2A9D8F"
                    />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              {/* Considerations */}
              {crop.considerations.length > 0 && (
                <View style={styles.considerationsSection}>
                  <Text style={styles.considerationsTitle}>
                    Things to consider:
                  </Text>
                  {crop.considerations.map((consideration, index) => (
                    <View key={index} style={styles.considerationItem}>
                      <FontAwesome
                        name="info-circle"
                        size={14}
                        color="#F4A261"
                      />
                      <Text style={styles.considerationText}>
                        {consideration}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Full Details</Text>
                <FontAwesome name="chevron-right" size={14} color="#2A9D8F" />
              </TouchableOpacity> */}
            </TouchableOpacity>
          ))}
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
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 20,
    marginBottom: 20,
  },
  soilCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  soilHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  soilTitle: {
    fontSize: 20,
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
  soilLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  soilValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#264653",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
  },
  cropCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cropHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cropTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cropTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  cropName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
  },
  cropSeason: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  suitabilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 60,
  },
  suitabilityText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  suitabilityLabel: {
    fontSize: 10,
    color: "#FFFFFF",
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  benefitsSection: {
    marginBottom: 12,
  },
  benefitsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    flex: 1,
  },
  considerationsSection: {
    marginBottom: 12,
    backgroundColor: "#FFF8F0",
    padding: 12,
    borderRadius: 8,
  },
  considerationsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 8,
  },
  considerationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  considerationText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  viewDetailsText: {
    fontSize: 15,
    color: "#2A9D8F",
    fontWeight: "600",
    marginRight: 6,
  },
});
