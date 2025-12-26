import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../../../secret";
import ScreenWrapper from "../../../src/components/common/ScreenWrapper";
import { useAuth } from "../../../src/context/AuthContext";

export default function AlertsScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const authToken = user.token;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null); // Add error state

  // Fetch fields on mount
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

      if (!res.ok) {
        throw new Error(`Failed to fetch fields: ${res.status}`);
      }

      const data = await res.json();
      setFields(data.fields || []);

      // Auto-select first field if available
      if (data.fields && data.fields.length > 0) {
        handleFieldChange(data.fields[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(`Failed to load fields: ${err.message}`);
      setLoading(false);
    }
  };

  const handleFieldChange = (field) => {
    setSelectedField(field);
    setError(null); // Clear previous errors
    fetchFieldData(field._id);
  };

  const fetchFieldData = async (fieldId) => {
    if (!authToken || !fieldId) {
      return;
    }

    setRefreshing(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };

      // 1. Fetch Weather Data for specific field
      const weatherRes = await fetch(
        `${API_BASE_URL}/api/data/weather?fieldId=${fieldId}`,
        { headers }
      );

      if (weatherRes.ok) {
        const weatherJson = await weatherRes.json();
        setWeatherData(weatherJson.weather);
      } else {
        const errorText = await weatherRes.text();
        setWeatherData(null);
        setError(`Weather: ${errorText}`);
      }

      // 2. Fetch Alerts for specific field
      const alertsRes = await fetch(
        `${API_BASE_URL}/api/data/alerts?fieldId=${fieldId}`,
        { headers }
      );

      if (alertsRes.ok) {
        const alertsJson = await alertsRes.json();
        setAlerts(alertsJson.alerts || []);
      } else {
        const errorText = await alertsRes.text();
        setAlerts([]);
        setError((prev) =>
          prev ? `${prev} | Alerts: ${errorText}` : `Alerts: ${errorText}`
        );
      }
    } catch (error) {
      setError(`Network error: ${error.message}`);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const onRefresh = () => {
    fetchFields();
    if (selectedField) {
      fetchFieldData(selectedField._id);
    }
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

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
          <Text style={styles.loadingText}>Loading...</Text>
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

          {/* Error Display */}
          {error && (
            <View style={styles.errorCard}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color="#E76F51"
              />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={() =>
                  selectedField && fetchFieldData(selectedField._id)
                }
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Field Selection */}
          {fields.length > 0 && (
            <View style={styles.fieldSection}>
              <Text style={styles.sectionLabel}>{t("Select Field")}</Text>
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
                      selectedField?._id === field._id &&
                        styles.fieldChipActive,
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
            </View>
          )}

          {/* Show message if no fields */}
          {fields.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="map-marker-off"
                size={64}
                color="#CCC"
              />
              <Text style={styles.emptyStateText}>No fields found</Text>
              <Text style={styles.emptyStateSubtext}>
                Add fields to see weather and alerts
              </Text>
            </View>
          )}

          {/* Field Info - Only show if field is selected */}
          {selectedField && !loading && (
            <>
              <View style={styles.fieldInfoCard}>
                <FontAwesome name="map-marker" size={20} color="#2A9D8F" />
                <View style={styles.fieldInfoText}>
                  <Text style={styles.fieldName}>{selectedField.name}</Text>
                  <Text style={styles.fieldDetails}>
                    {selectedField.area}{" "}
                    acres
                  </Text>
                </View>
              </View>

              {/* Weather Card */}
              {weatherData ? (
                <View style={styles.weatherCard}>
                  <View style={styles.weatherHeader}>
                    <FontAwesome name="sun-o" size={32} color="#F4A261" />
                    <View>
                      <Text style={styles.weatherTitle}>
                        {t("Current Weather")}
                      </Text>
                      <Text style={styles.weatherLocation}>
                        {weatherData.location || selectedField.name}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.weatherGrid}>
                    <View style={styles.weatherItem}>
                      <FontAwesome
                        name="thermometer-half"
                        size={20}
                        color="#264653"
                      />
                      <Text style={styles.weatherLabel}>
                        {t("Temperature")}
                      </Text>
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
              ) : !error ? (
                <View style={styles.noDataCard}>
                  <MaterialCommunityIcons
                    name="weather-cloudy"
                    size={48}
                    color="#CCC"
                  />
                  <Text style={styles.noDataText}>
                    No weather data available
                  </Text>
                </View>
              ) : null}

              {/* Alerts Section */}
              <Text style={styles.sectionTitle}>{t("Active Alerts")}</Text>

              {alerts.length > 0 ? (
                alerts.map((alert) => (
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

                    <Text style={styles.alertDescription}>
                      {alert.description}
                    </Text>

                    <View style={styles.alertFooter}>
                      {alert.crop && (
                        <View style={styles.cropTag}>
                          <FontAwesome name="leaf" size={12} color="#2A9D8F" />
                          <Text style={styles.cropText}>{alert.crop}</Text>
                        </View>
                      )}
                      <Text style={styles.alertDate}>
                        {new Date(alert.dateGenerated).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noAlertsCard}>
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={48}
                    color="#2A9D8F"
                  />
                  <Text style={styles.noAlertsText}>
                    No active alerts for {selectedField.name}
                  </Text>
                </View>
              )}
            </>
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 20,
    marginBottom: 20,
  },
  errorCard: {
    backgroundColor: "#FFE5E5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#E76F51",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  retryText: {
    color: "#2A9D8F",
    fontWeight: "600",
    fontSize: 14,
  },
  fieldSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    fontWeight: "600",
  },
  fieldSelector: {
    flexDirection: "row",
  },
  fieldChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  fieldChipActive: {
    backgroundColor: "#264653",
    borderColor: "#264653",
  },
  fieldChipText: {
    color: "#666",
    fontWeight: "600",
  },
  fieldChipTextActive: {
    color: "#FFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    marginVertical: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  fieldInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5F3",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  fieldInfoText: {
    marginLeft: 12,
    flex: 1,
  },
  fieldName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
  },
  fieldDetails: {
    fontSize: 14,
    color: "#2A9D8F",
    marginTop: 2,
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
    elevation: 15,
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
  weatherLocation: {
    fontSize: 14,
    color: "#666",
    marginLeft: 12,
    marginTop: 2,
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
  noDataCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#EEE",
    borderStyle: "dashed",
  },
  noDataText: {
    fontSize: 16,
    color: "#888",
    marginTop: 12,
    textAlign: "center",
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
  noAlertsCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  noAlertsText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
});
