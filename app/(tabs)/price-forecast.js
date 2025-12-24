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
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../secret";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

const { width } = Dimensions.get("window");

export default function PriceForecastScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { crop: initialCrop } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(initialCrop || "Wheat");
  const [timeframe, setTimeframe] = useState("3months");
  const [forecast, setForecast] = useState(null);
  const authToken = user.token;

  const crops = ["Rice", "Wheat", "Tomato", "Cotton", "Sugarcane", "Potato"];
  const timeframes = [
    { value: "1month", label: t("1 Month") },
    { value: "3months", label: t("3 Months") },
    { value: "6months", label: t("6 Months") },
  ];

  const fetchForecast = async () => {
    if (!authToken || !selectedCrop || !timeframe) return;
    setLoading(true);

    try {
      const url = `${API_BASE_URL}/api/data/market/forecast?crop=${selectedCrop}&timeframe=${timeframe}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(
          errorJson.message ||
            t("Failed to fetch forecast for {{crop}}", {
              crop: selectedCrop,
            })
        );
      }

      const data = await res.json();
      setForecast(data.forecast);
    } catch (error) {
      console.error("Forecast Fetch Error:", error.message);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchForecast();
    }
  }, [authToken, selectedCrop, timeframe]);

  const formatCurrency = (amount) => {
    if (amount === null || isNaN(amount)) return t("N/A");
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderSimpleChart = () => {
    if (!forecast || !forecast.chartData || forecast.chartData.length === 0)
      return null;

    const chartData = forecast.chartData;
    const prices = chartData.map((d) => d.price);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const range = maxPrice - minPrice;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{t("Price Trend")}</Text>
        <View style={styles.chart}>
          <View style={styles.yAxis}>
            <Text style={styles.axisLabel}>{formatCurrency(maxPrice)}</Text>
            <Text style={styles.axisLabel}>
              {formatCurrency((maxPrice + minPrice) / 2)}
            </Text>
            <Text style={styles.axisLabel}>{formatCurrency(minPrice)}</Text>
          </View>
          <View style={styles.chartArea}>
            {forecast.chartData.map((point, index) => {
              const height = ((point.price - minPrice) / range) * 120;
              const isLast = index === forecast.chartData.length - 1;
              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        { height: height },
                        isLast && styles.barFuture,
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#2A9D8F" }]} />
            <Text style={styles.legendText}>{t("Historical")}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#F4A261" }]} />
            <Text style={styles.legendText}>{t("Forecast")}</Text>
          </View>
        </View>
      </View>
    );
  };

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
            <Text style={styles.headerTitle}>{t("Price Forecast")}</Text>
          </View>

          <Text style={styles.subtitle}>
            {t("AI-powered price predictions for your crops")}
          </Text>

          {/* Crop Selection */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cropScroll}
          >
            {crops.map((cropName) => (
              <TouchableOpacity
                key={cropName}
                style={[
                  styles.cropPill,
                  selectedCrop === cropName && styles.cropPillSelected,
                ]}
                onPress={() => setSelectedCrop(cropName)}
              >
                <Text
                  style={[
                    styles.cropPillText,
                    selectedCrop === cropName && styles.cropPillTextSelected,
                  ]}
                >
                  {t(cropName)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Timeframe Selection */}
          <View style={styles.timeframeContainer}>
            {timeframes.map((tf) => (
              <TouchableOpacity
                key={tf.value}
                style={[
                  styles.timeframeButton,
                  timeframe === tf.value && styles.timeframeButtonSelected,
                ]}
                onPress={() => setTimeframe(tf.value)}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    timeframe === tf.value && styles.timeframeTextSelected,
                  ]}
                >
                  {tf.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Forecast Results */}
          {forecast && (
            <>
              {/* Current vs Predicted Price */}
              <View style={styles.priceComparisonCard}>
                <View style={styles.priceSection}>
                  <Text style={styles.priceLabel}>{t("Current Price")}</Text>
                  <Text style={styles.currentPrice}>
                    {formatCurrency(forecast.currentPrice)}
                  </Text>
                  <Text style={styles.perUnit}>{t("per quintal")}</Text>
                </View>

                <MaterialCommunityIcons
                  name="arrow-right-thick"
                  size={32}
                  color="#2A9D8F"
                />

                <View style={styles.priceSection}>
                  <Text style={styles.priceLabel}>{t("Predicted Price")}</Text>
                  <Text style={styles.predictedPrice}>
                    {formatCurrency(forecast.predictedPrice)}
                  </Text>
                  <View style={styles.changeContainer}>
                    <MaterialCommunityIcons
                      name={
                        forecast.change >= 0 ? "trending-up" : "trending-down"
                      }
                      size={16}
                      color={forecast.change >= 0 ? "#2A9D8F" : "#E76F51"}
                    />
                    <Text
                      style={[
                        styles.changeText,
                        {
                          color:
                            forecast.change >= 0 ? "#2A9D8F" : "#E76F51",
                        },
                      ]}
                    >
                      {forecast.change >= 0 ? "+" : ""}
                      {formatCurrency(Math.abs(forecast.change))}
                    </Text>
                    <Text style={styles.changePercent}>
                      ({forecast.changePercent}%)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Confidence Score */}
              <View style={styles.confidenceCard}>
                <View style={styles.confidenceHeader}>
                  <MaterialCommunityIcons
                    name="chart-bell-curve"
                    size={24}
                    color="#2A9D8F"
                  />
                  <Text style={styles.confidenceTitle}>
                    {t("Prediction Confidence")}
                  </Text>
                </View>
                <View style={styles.confidenceBarContainer}>
                  <View
                    style={[
                      styles.confidenceBar,
                      { width: `${forecast.confidence}%` },
                    ]}
                  />
                </View>
                <Text style={styles.confidenceText}>
                  {forecast.confidence}% {t("Accurate")}
                </Text>
              </View>

              {/* Chart */}
              {renderSimpleChart()}

              {/* Market Factors */}
              <View style={styles.factorsCard}>
                <Text style={styles.factorsTitle}>
                  {t("Key Market Factors")}
                </Text>
                {forecast.factors.map((factor, index) => (
                  <View key={index} style={styles.factorItem}>
                    <View style={styles.factorLeft}>
                      <View
                        style={[
                          styles.impactDot,
                          {
                            backgroundColor:
                              factor.impact === "high"
                                ? "#E76F51"
                                : factor.impact === "medium"
                                ? "#F4A261"
                                : "#E9C46A",
                          },
                        ]}
                      />
                      <Text style={styles.factorName}>{t(factor.name)}</Text>
                    </View>
                    <View style={styles.factorRight}>
                      <MaterialCommunityIcons
                        name={
                          factor.trend === "up"
                            ? "arrow-up"
                            : factor.trend === "down"
                            ? "arrow-down"
                            : "minus"
                        }
                        size={18}
                        color={
                          factor.trend === "up"
                            ? "#2A9D8F"
                            : factor.trend === "down"
                            ? "#E76F51"
                            : "#666"
                        }
                      />
                      <Text style={styles.impactText}>
                        {t("{{impact}} impact", { impact: factor.impact })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Insights */}
              <View style={styles.insightsCard}>
                <MaterialCommunityIcons
                  name="lightbulb"
                  size={24}
                  color="#F4A261"
                />
                <Text style={styles.insightsTitle}>
                  {t("Market Insights")}
                </Text>
                <Text style={styles.insightsText}>
                  •{" "}
                  {t("{{crop}} prices are showing a {{trend}} seasonal trend", {
                    crop: selectedCrop,
                    trend: forecast.seasonalTrend,
                  })}
                </Text>
                <Text style={styles.insightsText}>
                  •{" "}
                  {t("Historical average: {{price}} per quintal", {
                    price: formatCurrency(forecast.historicalAvg),
                  })}
                </Text>
                <Text style={styles.insightsText}>
                  •{" "}
                  {timeframe === "1month"
                    ? t("Best time to sell: End of this month")
                    : t("Best time to sell: Within next 2-3 months")}
                </Text>
              </View>

              {/* Action Button */}
              <TouchableOpacity style={styles.actionButton}>
                <MaterialCommunityIcons
                  name="bell-plus"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.actionButtonText}>
                  {t("Set Price Alert")}
                </Text>
              </TouchableOpacity>
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
  cropScroll: {
    marginBottom: 20,
  },
  cropPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#E8E8E8",
  },
  cropPillSelected: {
    backgroundColor: "#2A9D8F",
    borderColor: "#2A9D8F",
  },
  cropPillText: {
    fontSize: 15,
    color: "#264653",
    fontWeight: "600",
  },
  cropPillTextSelected: {
    color: "#FFFFFF",
  },
  timeframeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8E8E8",
  },
  timeframeButtonSelected: {
    backgroundColor: "#F0F8F7",
    borderColor: "#2A9D8F",
  },
  timeframeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  timeframeTextSelected: {
    color: "#2A9D8F",
  },
  priceComparisonCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  priceSection: {
    flex: 1,
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
  },
  predictedPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2A9D8F",
  },
  perUnit: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  changePercent: {
    fontSize: 12,
    color: "#888",
    marginLeft: 4,
  },
  confidenceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  confidenceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  confidenceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
    marginLeft: 10,
  },
  confidenceBarContainer: {
    height: 8,
    backgroundColor: "#E8E8E8",
    borderRadius: 4,
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: "#2A9D8F",
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 16,
  },
  chart: {
    flexDirection: "row",
    height: 150,
  },
  yAxis: {
    justifyContent: "space-between",
    paddingRight: 10,
    width: 70,
  },
  axisLabel: {
    fontSize: 10,
    color: "#888",
  },
  chartArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E8E8E8",
    paddingLeft: 10,
    paddingBottom: 5,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barWrapper: {
    width: "80%",
    alignItems: "center",
  },
  bar: {
    width: "100%",
    backgroundColor: "#2A9D8F",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    minHeight: 5,
  },
  barFuture: {
    backgroundColor: "#F4A261",
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  factorsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  factorsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 16,
  },
  factorItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  factorLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  impactDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  factorName: {
    fontSize: 15,
    color: "#333",
  },
  factorRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  impactText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  insightsCard: {
    backgroundColor: "#FFF8F0",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 12,
    marginTop: 8,
  },
  insightsText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 6,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2A9D8F",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 10,
  },
});
