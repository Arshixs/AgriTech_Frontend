import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWrapper from "../src/components/common/ScreenWrapper";

const { width } = Dimensions.get("window");

export default function IoTDashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data fetch
  const fetchDeviceData = () => {
    setTimeout(() => {
      setDevices([
        {
          id: 1,
          name: "Soil Moisture Sensor",
          type: "soil",
          location: "Field A - Section 1",
          status: "active",
          battery: 85,
          readings: {
            moisture: 65,
            temperature: 24,
            ph: 6.8,
            ec: 1.2,
          },
          icon: "water-percent",
          color: "#2A9D8F",
          alerts: [],
        },
        {
          id: 2,
          name: "Weather Station",
          type: "weather",
          location: "Central Field",
          status: "active",
          battery: 92,
          readings: {
            temperature: 28,
            humidity: 68,
            rainfall: 0,
            windSpeed: 12,
            pressure: 1013,
            uvIndex: 7,
          },
          icon: "weather-partly-cloudy",
          color: "#F4A261",
          alerts: ["High UV Index"],
        },
        {
          id: 3,
          name: "NPK Sensor",
          type: "nutrient",
          location: "Field B - Section 2",
          status: "active",
          battery: 78,
          readings: {
            nitrogen: 45,
            phosphorus: 38,
            potassium: 52,
            soilTemp: 22,
          },
          icon: "flask",
          color: "#E76F51",
          alerts: ["Low Nitrogen"],
        },
        {
          id: 4,
          name: "Water Level Monitor",
          type: "water",
          location: "Irrigation Tank",
          status: "active",
          battery: 95,
          readings: {
            level: 78,
            flow: 25,
            pressure: 2.5,
            quality: "Good",
          },
          icon: "water",
          color: "#457B9D",
          alerts: [],
        },
        {
          id: 5,
          name: "Crop Health Camera",
          type: "camera",
          location: "Field A - Section 3",
          status: "active",
          battery: 68,
          readings: {
            ndvi: 0.72,
            coverage: 95,
            healthScore: 88,
            diseaseRisk: "Low",
          },
          icon: "camera",
          color: "#606C38",
          alerts: [],
        },
        {
          id: 6,
          name: "Pest Trap Sensor",
          type: "pest",
          location: "Field C - Corner",
          status: "warning",
          battery: 45,
          readings: {
            count: 15,
            species: "Mixed",
            trapStatus: "Active",
            lastReset: "2 days ago",
          },
          icon: "bug",
          color: "#E9C46A",
          alerts: ["Low Battery", "High Pest Count"],
        },
      ]);
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchDeviceData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeviceData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#2A9D8F";
      case "warning":
        return "#F4A261";
      case "offline":
        return "#E76F51";
      default:
        return "#888";
    }
  };

  const getBatteryIcon = (level) => {
    if (level > 75) return "battery-high";
    if (level > 40) return "battery-medium";
    if (level > 15) return "battery-low";
    return "battery-alert";
  };

  const getBatteryColor = (level) => {
    if (level > 40) return "#2A9D8F";
    if (level > 15) return "#F4A261";
    return "#E76F51";
  };

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const formatValue = (key, value) => {
    if (typeof value === "number") {
      if (
        key === "moisture" ||
        key === "humidity" ||
        key === "coverage" ||
        key === "level"
      ) {
        return `${value}%`;
      }
      if (key === "temperature" || key === "soilTemp") {
        return `${value}°C`;
      }
      if (key === "rainfall") {
        return `${value}mm`;
      }
      if (key === "windSpeed") {
        return `${value} km/h`;
      }
      if (key === "pressure") {
        return `${value} hPa`;
      }
      if (key === "ph") {
        return value.toFixed(1);
      }
      if (key === "ec") {
        return `${value} dS/m`;
      }
      if (key === "flow") {
        return `${value} L/min`;
      }
      if (key === "ndvi") {
        return value.toFixed(2);
      }
      if (key === "healthScore") {
        return `${value}/100`;
      }
      return value;
    }
    return value;
  };

  const renderReadings = (device) => {
    const readings = Object.entries(device.readings);
    return (
      <View style={styles.readingsGrid}>
        {readings.map(([key, value], index) => (
          <View key={index} style={styles.readingItem}>
            <Text style={styles.readingLabel}>{formatLabel(key)}</Text>
            <Text style={styles.readingValue}>{formatValue(key, value)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderDeviceCard = (device) => (
    <TouchableOpacity
      key={device.id}
      style={styles.deviceCard}
      onPress={() =>
        setSelectedDevice(device.id === selectedDevice ? null : device.id)
      }
      activeOpacity={0.7}
    >
      {/* Device Header */}
      <View style={styles.deviceHeader}>
        <View style={styles.deviceTitleRow}>
          <View
            style={[
              styles.deviceIconContainer,
              { backgroundColor: device.color },
            ]}
          >
            <MaterialCommunityIcons
              name={device.icon}
              size={24}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={styles.deviceLocation}>{device.location}</Text>
          </View>
        </View>
        <View style={styles.deviceStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(device.status) },
            ]}
          />
        </View>
      </View>

      {/* Battery & Alerts */}
      <View style={styles.deviceMeta}>
        <View style={styles.batteryContainer}>
          <MaterialCommunityIcons
            name={getBatteryIcon(device.battery)}
            size={18}
            color={getBatteryColor(device.battery)}
          />
          <Text
            style={[
              styles.batteryText,
              { color: getBatteryColor(device.battery) },
            ]}
          >
            {device.battery}%
          </Text>
        </View>
        {device.alerts.length > 0 && (
          <View style={styles.alertBadge}>
            <FontAwesome
              name="exclamation-triangle"
              size={12}
              color="#E76F51"
            />
            <Text style={styles.alertCount}>{device.alerts.length}</Text>
          </View>
        )}
      </View>

      {/* Readings - Show only when selected */}
      {selectedDevice === device.id && (
        <View style={styles.readingsContainer}>
          <View style={styles.readingsDivider} />
          {renderReadings(device)}
          {device.alerts.length > 0 && (
            <View style={styles.alertsSection}>
              <Text style={styles.alertsTitle}>Alerts:</Text>
              {device.alerts.map((alert, index) => (
                <View key={index} style={styles.alertItem}>
                  <FontAwesome name="warning" size={14} color="#E76F51" />
                  <Text style={styles.alertText}>{alert}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const activeDevices = devices.filter((d) => d.status === "active").length;
  const devicesWithAlerts = devices.filter((d) => d.alerts.length > 0).length;
  const avgBattery =
    devices.length > 0
      ? Math.round(
          devices.reduce((sum, d) => sum + d.battery, 0) / devices.length
        )
      : 0;

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <FontAwesome name="arrow-left" size={20} color="#264653" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>IoT Devices</Text>
              <Text style={styles.subtitle}>
                Real-time monitoring of your farm sensors
              </Text>
            </View>
          </View>

          {/* Summary Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons
                name="devices"
                size={24}
                color="#2A9D8F"
              />
              <Text style={styles.statValue}>
                {activeDevices}/{devices.length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons
                name="battery-charging"
                size={24}
                color="#606C38"
              />
              <Text style={styles.statValue}>{avgBattery}%</Text>
              <Text style={styles.statLabel}>Avg Battery</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="alert" size={24} color="#E76F51" />
              <Text style={styles.statValue}>{devicesWithAlerts}</Text>
              <Text style={styles.statLabel}>Alerts</Text>
            </View>
          </View>

          {/* Last Updated */}
          <View style={styles.lastUpdatedContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color="#666"
            />
            <Text style={styles.lastUpdatedText}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          </View>

          {/* Devices List */}
          <Text style={styles.sectionTitle}>All Devices</Text>
          {devices.map((device) => renderDeviceCard(device))}

          {/* Quick Tips */}
          <View style={styles.tipsCard}>
            <MaterialCommunityIcons
              name="lightbulb"
              size={24}
              color="#F4A261"
            />
            <Text style={styles.tipsTitle}>Quick Tips</Text>
            <Text style={styles.tipText}>
              • Tap on any device card to view detailed readings
            </Text>
            <Text style={styles.tipText}>
              • Check devices with alerts for optimal farm management
            </Text>
            <Text style={styles.tipText}>
              • Pull down to refresh all sensor data
            </Text>
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
  content: {
    padding: 20,
    paddingBottom: 40,
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
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  lastUpdatedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  lastUpdatedText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 16,
  },
  deviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  deviceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
  },
  deviceLocation: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  deviceStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  deviceMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  batteryText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0ED",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertCount: {
    fontSize: 12,
    color: "#E76F51",
    fontWeight: "600",
    marginLeft: 6,
  },
  readingsContainer: {
    marginTop: 12,
  },
  readingsDivider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginBottom: 16,
  },
  readingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  readingItem: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  readingLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  readingValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
  },
  alertsSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FFF8F0",
    borderRadius: 8,
  },
  alertsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 8,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    color: "#E76F51",
    marginLeft: 8,
  },
  tipsCard: {
    backgroundColor: "#FFF8F0",
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#264653",
    marginTop: 8,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 6,
  },
});
