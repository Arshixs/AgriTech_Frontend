import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../secret";
import Button from "../src/components/common/Button";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import { useAuth } from "../src/context/AuthContext";

export default function ExpensePredictionScreen() {
  const { user } = useAuth();
  const authToken = user?.token;
  const router = useRouter();

  // State
  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [landArea, setLandArea] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [useSoilData, setUseSoilData] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSoilData, setHasSoilData] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [cropRes, fieldRes, soilRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/crops/crops`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch(`${API_BASE_URL}/api/farm/fields`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch(`${API_BASE_URL}/api/data/soil/latest`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      const cropData = await cropRes.json();
      const fieldData = await fieldRes.json();
      const soilData = await soilRes.json();

      setCrops(cropData.crops || []);
      setFields(fieldData.fields || []);

      const exists = !!(soilData.soilData && soilData.soilData.pH);
      setHasSoilData(exists);
    } catch (err) {
      console.error("Initialization Error", err);
      setHasSoilData(false);
    }
  };

  const handleSelectField = async (field) => {
    setSelectedField(field);
    setLandArea(field.area.toString());
    setUseSoilData(false); // Reset toggle when field changes

    // Check if this specific field has soil data
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/data/soil/latest?fieldId=${field._id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      const data = await res.json();

      // Enable or disable Soil-Sync based on this specific field's data
      setHasSoilData(!!data.soilData);
    } catch (err) {
      setHasSoilData(false);
    }
  };

  const handlePredictExpense = async () => {
    setError(null);
    if (!selectedCrop || !landArea) {
      setError("Please select a crop and land area.");
      return;
    }

    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/data/expenses/predict?crop=${
        selectedCrop.cropName
      }&area=${landArea}&fieldId=${
        selectedField?._id || ""
      }&useSoilData=${useSoilData}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) throw new Error("Failed to calculate prediction.");
      const data = await res.json();
      setPrediction(data.prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter((c) =>
    c.cropName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const renderBreakdownItem = (label, amount, icon) => (
    <View style={styles.breakdownRow} key={label}>
      <View style={styles.breakdownLabelGroup}>
        <MaterialCommunityIcons name={icon} size={18} color="#666" />
        <Text style={styles.breakdownLabel}>{label}</Text>
      </View>
      <Text style={styles.breakdownValue}>{formatCurrency(amount)}</Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <FontAwesome name="arrow-left" size={20} color="#264653" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Expense Prediction</Text>
          </View>

          <Text style={styles.sectionTitle}>Select Field (Optional)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.fieldList}
          >
            {fields.map((f) => (
              <TouchableOpacity
                key={f._id}
                onPress={() => handleSelectField(f)}
                style={[
                  styles.fieldChip,
                  selectedField?._id === f._id && styles.activeChip,
                ]}
              >
                <Text
                  style={[
                    styles.fieldChipText,
                    selectedField?._id === f._id && styles.activeChipText,
                  ]}
                >
                  {f.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Land Area (Acres)</Text>
              <TextInput
                style={styles.input}
                value={landArea}
                onChangeText={setLandArea}
                keyboardType="decimal-pad"
                placeholder="0.0"
              />
            </View>
            <TouchableOpacity
              disabled={!hasSoilData}
              onPress={() => setUseSoilData(!useSoilData)}
              style={[
                styles.soilToggle,
                useSoilData && styles.soilToggleActive,
                !hasSoilData && { borderColor: "#CCC", opacity: 0.5 },
              ]}
            >
              <MaterialCommunityIcons
                name={hasSoilData ? "test-tube" : "test-tube-off"}
                size={20}
                color={!hasSoilData ? "#888" : useSoilData ? "#FFF" : "#2A9D8F"}
              />
              <Text
                style={[
                  styles.soilText,
                  useSoilData && { color: "#FFF" },
                  !hasSoilData && { color: "#888" },
                ]}
              >
                {hasSoilData ? "Soil-Sync" : "No Soil Data"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Select Crop</Text>
          <TextInput
            style={styles.searchBar}
            placeholder="Search 30+ crops..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.cropsGrid}>
            {filteredCrops.map((crop) => (
              <TouchableOpacity
                key={crop._id}
                style={[
                  styles.cropCard,
                  selectedCrop?._id === crop._id && styles.cropCardActive,
                ]}
                onPress={() => setSelectedCrop(crop)}
              >
                <MaterialCommunityIcons
                  name={crop.icon || "leaf"}
                  size={28}
                  color={selectedCrop?._id === crop._id ? "#FFF" : "#2A9D8F"}
                />
                <Text
                  style={[
                    styles.cropName,
                    selectedCrop?._id === crop._id && { color: "#FFF" },
                  ]}
                >
                  {crop.cropName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Analyze Profitability"
            onPress={handlePredictExpense}
            loading={loading}
          />

          {prediction && (
            <View style={styles.resultContainer}>
              <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>
                  Total Estimated Investment
                </Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(prediction.total)}
                </Text>
              </View>

              {/* Cost Breakdown Section */}
              <View style={styles.breakdownContainer}>
                <Text style={styles.sectionTitle}>Cost Breakdown</Text>
                {prediction.breakdown && (
                  <>
                    {renderBreakdownItem(
                      "Seeds",
                      prediction.breakdown.seeds,
                      "seed"
                    )}
                    {renderBreakdownItem(
                      "Fertilizers",
                      prediction.breakdown.fertilizers,
                      "flask"
                    )}
                    {renderBreakdownItem(
                      "Pesticides",
                      prediction.breakdown.pesticides,
                      "bug"
                    )}
                    {renderBreakdownItem(
                      "Irrigation",
                      prediction.breakdown.irrigation,
                      "water"
                    )}
                    {renderBreakdownItem(
                      "Labor",
                      prediction.breakdown.labor,
                      "account-group"
                    )}
                    {renderBreakdownItem(
                      "Machinery",
                      prediction.breakdown.machinery,
                      "tractor"
                    )}
                  </>
                )}
              </View>

              {/* Conditional Revenue Rendering */}
              {(prediction.expectedRevenueMSP ||
                prediction.expectedRevenueMarket) && (
                <>
                  <Text style={styles.sectionTitle}>
                    Expected Revenue Scenarios
                  </Text>
                  <View style={styles.comparisonRow}>
                    {prediction.expectedRevenueMSP !== null && (
                      <View style={styles.revCard}>
                        <Text style={styles.revLabel}>Govt MSP</Text>
                        <Text style={styles.revVal}>
                          {formatCurrency(prediction.expectedRevenueMSP)}
                        </Text>
                        <Text style={styles.profitLabel}>
                          Profit:{" "}
                          {formatCurrency(
                            prediction.expectedRevenueMSP - prediction.total
                          )}
                        </Text>
                      </View>
                    )}
                    {prediction.expectedRevenueMarket !== null && (
                      <View
                        style={[styles.revCard, { borderColor: "#E9C46A" }]}
                      >
                        <Text style={styles.revLabel}>Market Rate</Text>
                        <Text style={styles.revVal}>
                          {formatCurrency(prediction.expectedRevenueMarket)}
                        </Text>
                        <Text
                          style={[styles.profitLabel, { color: "#E9C46A" }]}
                        >
                          Profit:{" "}
                          {formatCurrency(
                            prediction.expectedRevenueMarket - prediction.total
                          )}
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#264653" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
    marginVertical: 10,
  },
  fieldList: { marginBottom: 15 },
  fieldChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDD",
    marginRight: 10,
  },
  activeChip: { backgroundColor: "#264653", borderColor: "#264653" },
  activeChipText: { color: "#FFF" },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    fontSize: 16,
  },
  soilToggle: {
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2A9D8F",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  soilToggleActive: { backgroundColor: "#2A9D8F" },
  soilText: { fontWeight: "600", color: "#2A9D8F" },
  searchBar: {
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cropsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  cropCard: {
    width: "30%",
    height: 90,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  cropCardActive: { backgroundColor: "#2A9D8F", borderColor: "#2A9D8F" },
  cropName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2A9D8F",
    marginTop: 5,
    textAlign: "center",
  },
  resultContainer: { marginTop: 20 },
  totalCard: {
    backgroundColor: "#264653",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  totalLabel: { color: "#AAA", fontSize: 12 },
  totalAmount: { color: "#FFF", fontSize: 32, fontWeight: "bold" },
  breakdownContainer: {
    marginTop: 15,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 15,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  breakdownLabelGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  breakdownLabel: { fontSize: 14, color: "#555" },
  breakdownValue: { fontSize: 14, fontWeight: "600", color: "#264653" },
  comparisonRow: { flexDirection: "row", gap: 10 },
  revCard: {
    flex: 1,
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2A9D8F",
  },
  revLabel: { fontSize: 12, color: "#666", fontWeight: "bold" },
  revVal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
    marginVertical: 5,
  },
  profitLabel: { fontSize: 11, color: "#2A9D8F", fontWeight: "600" },
});
