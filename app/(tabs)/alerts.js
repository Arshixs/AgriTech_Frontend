import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";
import { API_BASE_URL } from "../../secret";
import { useTranslation } from "react-i18next";

export default function AlertsScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const authToken = user.token;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const fetchData = async () => {
    if (!authToken) return;
    setRefreshing(true);

    try {
      const headers = { Authorization: `Bearer ${authToken}` };

      // 1. Fetch Weather Data
      const weatherRes = await fetch(`${API_BASE_URL}/api/data/weather`, {
        headers,
      });
      if (weatherRes.ok) {
        const weatherJson = await weatherRes.json();
        setWeatherData(weatherJson.weather);
      } else {
        console.error("Failed to fetch weather data");
        setWeatherData(null);
      }

      // 2. Fetch Alerts
      const alertsRes = await fetch(`${API_BASE_URL}/api/data/alerts`, {
        headers,
      });
      if (alertsRes.ok) {
        const alertsJson = await alertsRes.json();
        setAlerts(alertsJson.alerts || []);
      } else {
        console.error("Failed to fetch alerts");
        setAlerts([]);
      }
    } catch (error) {
      console.error("Alerts Fetch Error:", error.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchData();
    }
  }, [authToken]);

  const onRefresh = () => {
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

  const getSeverityLabel = (severity) => {
    // Translate the severity badge text
    return t(`farmer.alerts.severity.${severity}`).toUpperCase();
  };

  const getAlertIcon = (type) => {
    return type === "disease" ? "bug" : "cloud";
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
          <Text style={styles.header}>{t("Weather & Alerts")}</Text>

          {/* Weather Card */}
          {weatherData && (
            <View style={styles.weatherCard}>
              <View style={styles.weatherHeader}>
                <FontAwesome name="sun-o" size={32} color="#F4A261" />
                <Text style={styles.weatherTitle}>{t("Current Weather")}</Text>
              </View>

              <View style={styles.weatherGrid}>
                <View style={styles.weatherItem}>
                  <FontAwesome
                    name="thermometer-half"
                    size={20}
                    color="#264653"
                  />
                  <Text style={styles.weatherLabel}>{t("Temperature")}</Text>
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
                  <Text style={styles.weatherLabel}>{t("Humidity")}</Text>
                  <Text style={styles.weatherValue}>
                    {weatherData.humidity}%
                  </Text>
                </View>

                <View style={styles.weatherItem}>
                  <FontAwesome name="tint" size={20} color="#457B9D" />
                  <Text style={styles.weatherLabel}>{t("Rainfall")}</Text>
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
                  <Text style={styles.weatherLabel}>{t("Wind")}</Text>
                  <Text style={styles.weatherValue}>
                    {weatherData.windSpeed} {t("km/h")}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Alerts Section */}
          <Text style={styles.sectionTitle}>{t("Active Alerts")}</Text>

          {alerts.map((alert) => (
            <View
              key={alert._id}
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
