import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";

export default function AlertsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [alerts, setAlerts] = useState([]);

  // Mock data fetch
  const fetchData = () => {
    // Simulate API call
    setTimeout(() => {
      setWeatherData({
        temperature: 28,
        humidity: 65,
        rainfall: 12,
        condition: "Partly Cloudy",
        windSpeed: 15,
      });

      setAlerts([
        {
          id: 1,
          type: "disease",
          severity: "high",
          title: "Late Blight Alert",
          description:
            "High risk of late blight in tomato crops due to humid conditions. Apply fungicide preventively.",
          crop: "Tomato",
          date: "2 hours ago",
        },
        {
          id: 2,
          type: "weather",
          severity: "medium",
          title: "Heavy Rain Expected",
          description:
            "Heavy rainfall predicted in next 48 hours. Ensure proper drainage in fields.",
          date: "5 hours ago",
        },
        {
          id: 3,
          type: "disease",
          severity: "low",
          title: "Aphid Infestation Risk",
          description:
            "Monitor wheat crops for aphid activity. Early detection can prevent spread.",
          crop: "Wheat",
          date: "1 day ago",
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "#E76F51";
      case "medium":
        return "#F4A261";
      case "low":
        return "#E9C46A";
      default:
        return "#888";
    }
  };

  const getAlertIcon = (type) => {
    return type === "disease" ? "bug" : "cloud";
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
          <Text style={styles.header}>Weather & Alerts</Text>

          {/* Weather Card */}
          {weatherData && (
            <View style={styles.weatherCard}>
              <View style={styles.weatherHeader}>
                <FontAwesome name="sun-o" size={32} color="#F4A261" />
                <Text style={styles.weatherTitle}>Current Weather</Text>
              </View>

              <View style={styles.weatherGrid}>
                <View style={styles.weatherItem}>
                  <FontAwesome
                    name="thermometer-half"
                    size={20}
                    color="#264653"
                  />
                  <Text style={styles.weatherLabel}>Temperature</Text>
                  <Text style={styles.weatherValue}>
                    {weatherData.temperature}°C
                  </Text>
                </View>

                <View style={styles.weatherItem}>
                  <MaterialCommunityIcons
                    name="water-percent"
                    size={20}
                    color="#2A9D8F"
                  />
                  <Text style={styles.weatherLabel}>Humidity</Text>
                  <Text style={styles.weatherValue}>
                    {weatherData.humidity}%
                  </Text>
                </View>

                <View style={styles.weatherItem}>
                  <FontAwesome name="tint" size={20} color="#457B9D" />
                  <Text style={styles.weatherLabel}>Rainfall</Text>
                  <Text style={styles.weatherValue}>
                    {weatherData.rainfall}mm
                  </Text>
                </View>

                <View style={styles.weatherItem}>
                  <MaterialCommunityIcons
                    name="weather-windy"
                    size={20}
                    color="#606C38"
                  />
                  <Text style={styles.weatherLabel}>Wind</Text>
                  <Text style={styles.weatherValue}>
                    {weatherData.windSpeed} km/h
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Alerts Section */}
          <Text style={styles.sectionTitle}>Active Alerts</Text>

          {alerts.map((alert) => (
            <View
              key={alert.id}
              style={[
                styles.alertCard,
                { borderLeftColor: getSeverityColor(alert.severity) },
              ]}
            >
              <View style={styles.alertHeader}>
                <View style={styles.alertTitleRow}>
                  <MaterialCommunityIcons
                    name={getAlertIcon(alert.type)}
                    size={24}
                    color={getSeverityColor(alert.severity)}
                  />
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                </View>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(alert.severity) },
                  ]}
                >
                  <Text style={styles.severityText}>
                    {alert.severity.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.alertDescription}>{alert.description}</Text>

              <View style={styles.alertFooter}>
                {alert.crop && (
                  <View style={styles.cropTag}>
                    <FontAwesome name="leaf" size={12} color="#2A9D8F" />
                    <Text style={styles.cropText}>{alert.crop}</Text>
                  </View>
                )}
                <Text style={styles.alertDate}>{alert.date}</Text>
              </View>
            </View>
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
  weatherCard: {
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
  weatherHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  weatherTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
    marginLeft: 12,
  },
  weatherGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  weatherItem: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  weatherLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  weatherValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  alertTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
    marginLeft: 10,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  alertDescription: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cropTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5F3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cropText: {
    fontSize: 12,
    color: "#2A9D8F",
    marginLeft: 6,
    fontWeight: "600",
  },
  alertDate: {
    fontSize: 12,
    color: "#888",
  },
});
