import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWrapper from "../src/components/common/ScreenWrapper";

const { width } = Dimensions.get("window");

export default function FieldDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [field, setField] = useState(null);
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    // Mock field data - replace with API call
    const mockField = {
      id: parseInt(id),
      name: "Field A",
      area: 5.5,
      crop: "Rice",
      variety: "Basmati 1509",
      soilType: "Loamy",
      status: "Growing",
      plantedDate: "2025-01-15",
      expectedHarvest: "2025-05-20",
      health: 92,
      irrigation: "Drip",
      coordinates: { lat: 25.3176, lng: 82.9739 },
      color: "#2A9D8F",
      soilData: {
        ph: 6.8,
        nitrogen: "Medium",
        phosphorus: "High",
        potassium: "Medium",
        moisture: 65,
        temperature: 24,
      },
      weatherData: {
        temperature: 28,
        humidity: 68,
        rainfall: 12,
        forecast: "Partly Cloudy",
      },
      activities: [
        {
          id: 1,
          type: "irrigation",
          title: "Irrigation",
          description: "Applied drip irrigation",
          date: "2025-10-18",
          icon: "water",
          color: "#2A9D8F",
        },
        {
          id: 2,
          type: "fertilizer",
          title: "Fertilizer Application",
          description: "Applied NPK 20-20-20",
          date: "2025-10-15",
          icon: "flask",
          color: "#E76F51",
        },
        {
          id: 3,
          type: "pest",
          title: "Pest Control",
          description: "Sprayed neem-based pesticide",
          date: "2025-10-12",
          icon: "bug",
          color: "#F4A261",
        },
        {
          id: 4,
          type: "inspection",
          title: "Field Inspection",
          description: "Regular health check completed",
          date: "2025-10-10",
          icon: "magnify",
          color: "#606C38",
        },
      ],
      sensors: [
        {
          id: 1,
          name: "Soil Moisture Sensor",
          status: "active",
          lastReading: "65%",
          location: "Section 1",
        },
        {
          id: 2,
          name: "NPK Sensor",
          status: "active",
          lastReading: "N:45 P:38 K:52",
          location: "Section 2",
        },
        {
          id: 3,
          name: "Weather Station",
          status: "active",
          lastReading: "28°C, 68% humidity",
          location: "Center",
        },
      ],
      yield: {
        expected: 22,
        unit: "quintals/acre",
        quality: "Grade A",
        marketPrice: 2100,
      },
    };

    setField(mockField);
  }, [id]);

  if (!field) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const calculateDaysToHarvest = () => {
    const today = new Date();
    const harvest = new Date(field.expectedHarvest);
    const diff = Math.ceil((harvest - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getHealthColor = (health) => {
    if (health >= 80) return "#2A9D8F";
    if (health >= 60) return "#F4A261";
    return "#E76F51";
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Health Status Card */}
      <View style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <MaterialCommunityIcons
            name="heart-pulse"
            size={28}
            color={getHealthColor(field.health)}
          />
          <Text style={styles.healthTitle}>Field Health Score</Text>
        </View>
        <View style={styles.healthScoreContainer}>
          <Text
            style={[
              styles.healthScore,
              { color: getHealthColor(field.health) },
            ]}
          >
            {field.health}%
          </Text>
          <View style={styles.healthBarContainer}>
            <View
              style={[
                styles.healthBar,
                {
                  width: `${field.health}%`,
                  backgroundColor: getHealthColor(field.health),
                },
              ]}
            />
          </View>
        </View>
        <Text style={styles.healthDescription}>
          Excellent health status. Continue current care routine.
        </Text>
      </View>

      {/* Harvest Countdown */}
      <View style={styles.harvestCard}>
        <View style={styles.harvestHeader}>
          <MaterialCommunityIcons name="timer-sand" size={24} color="#F4A261" />
          <Text style={styles.harvestTitle}>Days Until Harvest</Text>
        </View>
        <Text style={styles.harvestDays}>{calculateDaysToHarvest()}</Text>
        <Text style={styles.harvestDate}>
          Expected: {formatDate(field.expectedHarvest)}
        </Text>
        <View style={styles.yieldEstimate}>
          <MaterialCommunityIcons name="chart-line" size={18} color="#2A9D8F" />
          <Text style={styles.yieldText}>
            Expected Yield: {field.yield.expected} {field.yield.unit}
          </Text>
        </View>
      </View>

      {/* Soil Data */}
      <View style={styles.dataCard}>
        <Text style={styles.dataTitle}>Soil Analysis</Text>
        <View style={styles.dataGrid}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>pH Level</Text>
            <Text style={styles.dataValue}>{field.soilData.ph}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Nitrogen</Text>
            <Text style={styles.dataValue}>{field.soilData.nitrogen}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Phosphorus</Text>
            <Text style={styles.dataValue}>{field.soilData.phosphorus}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Potassium</Text>
            <Text style={styles.dataValue}>{field.soilData.potassium}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Moisture</Text>
            <Text style={styles.dataValue}>{field.soilData.moisture}%</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Temperature</Text>
            <Text style={styles.dataValue}>{field.soilData.temperature}°C</Text>
          </View>
        </View>
      </View>

      {/* Weather Data */}
      <View style={styles.dataCard}>
        <Text style={styles.dataTitle}>Current Weather</Text>
        <View style={styles.weatherGrid}>
          <View style={styles.weatherItem}>
            <MaterialCommunityIcons
              name="thermometer"
              size={24}
              color="#E76F51"
            />
            <Text style={styles.weatherValue}>
              {field.weatherData.temperature}°C
            </Text>
            <Text style={styles.weatherLabel}>Temperature</Text>
          </View>
          <View style={styles.weatherItem}>
            <MaterialCommunityIcons
              name="water-percent"
              size={24}
              color="#2A9D8F"
            />
            <Text style={styles.weatherValue}>
              {field.weatherData.humidity}%
            </Text>
            <Text style={styles.weatherLabel}>Humidity</Text>
          </View>
          <View style={styles.weatherItem}>
            <MaterialCommunityIcons
              name="weather-rainy"
              size={24}
              color="#457B9D"
            />
            <Text style={styles.weatherValue}>
              {field.weatherData.rainfall}mm
            </Text>
            <Text style={styles.weatherLabel}>Rainfall</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderActivitiesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Recent Activities</Text>
      {field.activities.map((activity) => (
        <View key={activity.id} style={styles.activityCard}>
          <View
            style={[
              styles.activityIcon,
              { backgroundColor: activity.color + "20" },
            ]}
          >
            <MaterialCommunityIcons
              name={activity.icon}
              size={24}
              color={activity.color}
            />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDescription}>
              {activity.description}
            </Text>
            <Text style={styles.activityDate}>{formatDate(activity.date)}</Text>
          </View>
        </View>
      ))}

      {/* Add Activity Button */}
      <TouchableOpacity style={styles.addActivityButton}>
        <MaterialCommunityIcons name="plus-circle" size={24} color="#2A9D8F" />
        <Text style={styles.addActivityText}>Log New Activity</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSensorsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Connected Sensors</Text>
      {field.sensors.map((sensor) => (
        <TouchableOpacity
          key={sensor.id}
          style={styles.sensorCard}
          onPress={() => router.push("/iot-devices")}
        >
          <View style={styles.sensorLeft}>
            <View style={styles.sensorIconContainer}>
              <MaterialCommunityIcons
                name="access-point"
                size={24}
                color="#2A9D8F"
              />
            </View>
            <View style={styles.sensorInfo}>
              <Text style={styles.sensorName}>{sensor.name}</Text>
              <Text style={styles.sensorLocation}>{sensor.location}</Text>
            </View>
          </View>
          <View style={styles.sensorRight}>
            <View
              style={[styles.sensorStatus, { backgroundColor: "#2A9D8F" }]}
            />
            <Text style={styles.sensorReading}>{sensor.lastReading}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={() => router.push("/iot-devices")}
      >
        <Text style={styles.viewAllText}>View All IoT Devices</Text>
        <FontAwesome name="chevron-right" size={14} color="#2A9D8F" />
      </TouchableOpacity>
    </View>
  );

  const renderYieldTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.yieldCard}>
        <Text style={styles.yieldCardTitle}>Expected Yield</Text>
        <View style={styles.yieldValueContainer}>
          <Text style={styles.yieldValue}>
            {field.yield.expected}{" "}
            <Text style={styles.yieldUnit}>{field.yield.unit}</Text>
          </Text>
        </View>
        <View style={styles.yieldDetails}>
          <View style={styles.yieldDetailItem}>
            <MaterialCommunityIcons name="star" size={20} color="#F4A261" />
            <Text style={styles.yieldDetailText}>
              Quality: {field.yield.quality}
            </Text>
          </View>
          <View style={styles.yieldDetailItem}>
            <MaterialCommunityIcons
              name="currency-inr"
              size={20}
              color="#2A9D8F"
            />
            <Text style={styles.yieldDetailText}>
              Market Price: ₹{field.yield.marketPrice}/quintal
            </Text>
          </View>
        </View>
      </View>

      {/* Revenue Estimation */}
      <View style={styles.revenueCard}>
        <Text style={styles.revenueTitle}>Estimated Revenue</Text>
        <Text style={styles.revenueAmount}>
          ₹
          {(
            (field.yield.expected * field.area * field.yield.marketPrice) /
            100
          ).toFixed(0)}
        </Text>
        <Text style={styles.revenueSubtext}>
          Based on {field.area} acres at current market rates
        </Text>
      </View>

      {/* Historical Yield */}
      <View style={styles.historicalCard}>
        <Text style={styles.historicalTitle}>Historical Performance</Text>
        <View style={styles.historicalItem}>
          <Text style={styles.historicalSeason}>Kharif 2024</Text>
          <Text style={styles.historicalYield}>21 quintals/acre</Text>
        </View>
        <View style={styles.historicalItem}>
          <Text style={styles.historicalSeason}>Rabi 2023-24</Text>
          <Text style={styles.historicalYield}>19 quintals/acre</Text>
        </View>
        <View style={styles.historicalItem}>
          <Text style={styles.historicalSeason}>Kharif 2023</Text>
          <Text style={styles.historicalYield}>20 quintals/acre</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <FontAwesome name="arrow-left" size={20} color="#264653" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{field.name}</Text>
              <Text style={styles.headerSubtitle}>
                {field.area} acres • {field.crop}
              </Text>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <MaterialCommunityIcons name="cog" size={24} color="#264653" />
            </TouchableOpacity>
          </View>

          {/* Status Banner */}
          <View style={styles.statusBanner}>
            <View style={[styles.statusDot, { backgroundColor: "#2A9D8F" }]} />
            <Text style={styles.statusText}>Status: {field.status}</Text>
            <Text style={styles.plantedText}>
              Planted: {formatDate(field.plantedDate)}
            </Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "overview" && styles.tabActive,
                ]}
                onPress={() => setSelectedTab("overview")}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === "overview" && styles.tabTextActive,
                  ]}
                >
                  Overview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "activities" && styles.tabActive,
                ]}
                onPress={() => setSelectedTab("activities")}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === "activities" && styles.tabTextActive,
                  ]}
                >
                  Activities
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "sensors" && styles.tabActive,
                ]}
                onPress={() => setSelectedTab("sensors")}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === "sensors" && styles.tabTextActive,
                  ]}
                >
                  Sensors
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "yield" && styles.tabActive,
                ]}
                onPress={() => setSelectedTab("yield")}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === "yield" && styles.tabTextActive,
                  ]}
                >
                  Yield
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Tab Content */}
          {selectedTab === "overview" && renderOverviewTab()}
          {selectedTab === "activities" && renderActivitiesTab()}
          {selectedTab === "sensors" && renderSensorsTab()}
          {selectedTab === "yield" && renderYieldTab()}

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionCard}>
                <MaterialCommunityIcons
                  name="water"
                  size={32}
                  color="#2A9D8F"
                />
                <Text style={styles.quickActionText}>Irrigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <MaterialCommunityIcons
                  name="flask"
                  size={32}
                  color="#E76F51"
                />
                <Text style={styles.quickActionText}>Fertilize</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <MaterialCommunityIcons name="bug" size={32} color="#F4A261" />
                <Text style={styles.quickActionText}>Pest Control</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <MaterialCommunityIcons
                  name="notebook"
                  size={32}
                  color="#606C38"
                />
                <Text style={styles.quickActionText}>Add Log</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  settingsButton: {
    padding: 5,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5F3",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#264653",
    fontWeight: "600",
    flex: 1,
  },
  plantedText: {
    fontSize: 12,
    color: "#666",
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
  },
  tabActive: {
    backgroundColor: "#2A9D8F",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  tabContent: {
    marginBottom: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 16,
  },
  healthCard: {
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
  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#264653",
    marginLeft: 12,
  },
  healthScoreContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  healthScore: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 12,
  },
  healthBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#E8E8E8",
    borderRadius: 4,
  },
  healthBar: {
    height: 8,
    borderRadius: 4,
  },
  healthDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  harvestCard: {
    backgroundColor: "#FFF8F0",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  harvestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  harvestTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
    marginLeft: 8,
  },
  harvestDays: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#F4A261",
    marginBottom: 8,
  },
  harvestDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  yieldEstimate: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  yieldText: {
    fontSize: 14,
    color: "#264653",
    fontWeight: "600",
    marginLeft: 8,
  },
  dataCard: {
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
  dataTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 16,
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  dataItem: {
    width: "33.33%",
    paddingHorizontal: 6,
    marginBottom: 16,
  },
  dataLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
  },
  weatherGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weatherItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  weatherValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 8,
  },
  weatherLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  activityCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: "#888",
  },
  addActivityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#2A9D8F",
    marginTop: 8,
  },
  addActivityText: {
    fontSize: 16,
    color: "#2A9D8F",
    fontWeight: "600",
    marginLeft: 8,
  },
  sensorCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sensorLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sensorIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#E8F5F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
  },
  sensorLocation: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  sensorRight: {
    alignItems: "flex-end",
  },
  sensorStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  sensorReading: {
    fontSize: 13,
    color: "#666",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 16,
    color: "#2A9D8F",
    fontWeight: "600",
    marginRight: 8,
  },
  yieldCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  yieldCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 16,
  },
  yieldValueContainer: {
    marginBottom: 20,
  },
  yieldValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2A9D8F",
  },
  yieldUnit: {
    fontSize: 20,
    color: "#666",
  },
  yieldDetails: {
    width: "100%",
  },
  yieldDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  yieldDetailText: {
    fontSize: 16,
    color: "#264653",
    marginLeft: 12,
  },
  revenueCard: {
    backgroundColor: "#2A9D8F",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
  },
  revenueTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 12,
  },
  revenueAmount: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  revenueSubtext: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  historicalCard: {
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
  historicalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 16,
  },
  historicalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  historicalSeason: {
    fontSize: 15,
    color: "#264653",
  },
  historicalYield: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2A9D8F",
  },
  quickActionsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  quickActionCard: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginRight: "2%",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    color: "#264653",
    fontWeight: "600",
    marginTop: 8,
  },
});
