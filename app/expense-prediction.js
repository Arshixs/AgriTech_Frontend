import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import Button from "../src/components/common/Button";
import { useAuth } from "../src/context/AuthContext";
import {API_BASE_URL} from "../secret"


export default function ExpensePredictionScreen() {
  const { user } = useAuth();
  // Safely access the JWT token from the user object
  const authToken = user?.token;

  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [landArea, setLandArea] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Note: Colors updated to match the final styles previously used for visual consistency
  const crops = [
    { id: 1, name: 'Rice', icon: 'grain', color: '#2A9D8F' }, 
    { id: 2, name: 'Wheat', icon: 'barley', color: '#F4A261' },
    { id: 3, name: 'Tomato', icon: 'food-apple', color: '#E76F51' },
    { id: 4, name: 'Cotton', icon: 'spa', color: '#457B9D' },
    { id: 5, name: 'Sugarcane', icon: 'grass', color: '#606C38' },
    { id: 6, name: 'Potato', icon: 'food', color: '#E9C46A' },
  ];

  const handlePredictExpense = async () => {
    setError(null);
    if (!selectedCrop || !landArea) {
      console.error('Validation Error: Please select a crop and enter land area.');
      setError('Please select a crop and enter land area.');
      return;
    }
    if (!authToken) {
      console.error('Authentication Error: User not logged in.');
      setError('You must be logged in to run predictions.');
      return;
    }

    setLoading(true);

    try {
      const area = parseFloat(landArea);
      if (isNaN(area) || area <= 0) {
        throw new Error("Invalid area value.");
      }
      
      const cropName = selectedCrop.name;
      
      // API Call to the prediction endpoint (GET method, sending data via query params)
      const url = `${API_BASE_URL}/api/data/expenses/predict?crop=${cropName}&area=${area}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        // Attempt to parse JSON error response for better message
        const errorText = await res.text();
        let errorMessage = 'Failed to get prediction from server.';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = await res.json();
      
      // The backend is expected to return a 'prediction' object containing
      // total, breakdown, perAcre, expectedYield, and expectedRevenue.
      setPrediction(data.prediction);

    } catch (err) {
      console.error("Prediction API Error:", err.message);
      setError(err.message);
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Renders the prediction card using the fetched data
  const renderPredictionCard = () => {
    if (!prediction) return null;
    
    // Safety check for profit calculation
    const profit = (prediction.expectedRevenue || 0) - (prediction.total || 0);

    // Map keys to MaterialCommunityIcons names
    const icons = {
        seeds: 'seed',
        fertilizers: 'flask',
        pesticides: 'bug-outline',
        irrigation: 'water',
        labor: 'account-group',
        machinery: 'tractor',
    };

    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultHeader}>
          <MaterialCommunityIcons name="calculator" size={28} color="#2A9D8F" />
          <Text style={styles.resultTitle}>Expense Breakdown</Text>
        </View>

        {/* Total Cost Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Estimated Cost</Text>
          <Text style={styles.totalAmount}>{formatCurrency(prediction.total)}</Text>
          <Text style={styles.perAcreText}>
            {formatCurrency(prediction.perAcre)} per acre
          </Text>
        </View>

        {/* Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Cost Breakdown</Text>
          
          {Object.entries(prediction.breakdown || {}).map(([key, value]) => {
            const percentage = prediction.total > 0 ? ((value / prediction.total) * 100).toFixed(0) : 0;

            return (
              <View key={key} style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <MaterialCommunityIcons
                    name={icons[key] || 'label-outline'}
                    size={20}
                    color="#666"
                  />
                  <Text style={styles.breakdownLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                </View>
                <View style={styles.breakdownRight}>
                  <Text style={styles.breakdownPercent}>{percentage}%</Text>
                  <Text style={styles.breakdownAmount}>
                    {formatCurrency(value)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Expected Returns */}
        <View style={styles.returnsCard}>
          <Text style={styles.returnsTitle}>Expected Returns</Text>
          <View style={styles.returnItem}>
            <MaterialCommunityIcons name="chart-line" size={20} color="#2A9D8F" />
            <Text style={styles.returnLabel}>Expected Yield</Text>
            <Text style={styles.returnValue}>{prediction.expectedYield} quintals</Text>
          </View>
          <View style={styles.returnItem}>
            <MaterialCommunityIcons name="cash-multiple" size={20} color="#2A9D8F" />
            <Text style={styles.returnLabel}>Projected Revenue</Text>
            <Text style={styles.returnValue}>
              {formatCurrency(prediction.expectedRevenue)}
            </Text>
          </View>
          <View style={styles.returnItem}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#2A9D8F" />
            <Text style={styles.returnLabel}>Expected Profit</Text>
            <Text style={[styles.returnValue, { color: profit >= 0 ? '#2A9D8F' : '#E76F51' }]}>
              {formatCurrency(profit)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.viewPriceButton}
          onPress={() => router.push({
            pathname: '/(tabs)/price-forecast',
            params: { crop: prediction.crop }
          })}
        >
          <Text style={styles.viewPriceText}>View Price Forecast</Text>
          <FontAwesome name="chevron-right" size={16} color="#2A9D8F" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <FontAwesome name="arrow-left" size={20} color="#264653" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Expense Prediction</Text>
          </View>

          <Text style={styles.subtitle}>
            Get accurate cost estimates for your farming activities
          </Text>

          {/* Crop Selection */}
          <Text style={styles.sectionTitle}>Select Your Crop</Text>
          <View style={styles.cropsGrid}>
            {crops.map((crop) => (
              <TouchableOpacity
                key={crop.id}
                style={[
                  styles.cropCard,
                  // Inline style logic for dynamic colors/selection
                  selectedCrop?.id === crop.id && { backgroundColor: crop.color, borderColor: crop.color },
                  selectedCrop?.id !== crop.id && { borderColor: '#E0E0E0' },
                ]}
                onPress={() => setSelectedCrop(crop)}
              >
                <MaterialCommunityIcons
                  name={crop.icon}
                  size={32}
                  color={selectedCrop?.id === crop.id ? '#FFFFFF' : crop.color}
                />
                <Text
                  style={[
                    styles.cropName,
                    selectedCrop?.id === crop.id ? styles.cropNameSelected : { color: crop.color },
                  ]}
                >
                  {crop.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Land Area Input */}
          <Text style={styles.sectionTitle}>Enter Land Area</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={landArea}
              onChangeText={setLandArea}
              placeholder="e.g., 5"
              keyboardType="decimal-pad"
              placeholderTextColor="#888"
            />
            <Text style={styles.inputUnit}>Acres</Text>
          </View>

          {/* Predict Button */}
          <Button
            title="Calculate Expenses"
            onPress={handlePredictExpense}
            loading={loading}
          />
          
          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
            </View>
          )}

          {/* Prediction Result */}
          {renderPredictionCard()}
          
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 12,
    marginTop: 15,
  },
  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cropCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginVertical: 4,
    borderWidth: 2,
    // borderColor: set via inline style based on selection
    justifyContent: 'center',
    height: 100,
  },
  // Removed cropCardSelected as background color is set inline
  cropName: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
    // color: set via inline style based on selection
  },
  cropNameSelected: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    height: 55,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#264653',
    fontWeight: 'bold',
  },
  inputUnit: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginLeft: 10,
  },
  errorContainer: {
    backgroundColor: '#FFF0F0',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E76F51',
  },
  errorText: {
    color: '#E76F51',
    fontWeight: '600',
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#264653",
    marginLeft: 10,
  },
  totalCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  totalLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'extrabold',
    color: '#E76F51',
  },
  perAcreText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  breakdownCard: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 10,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  breakdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    justifyContent: 'flex-end',
  },
  breakdownPercent: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#264653',
    minWidth: 70,
    textAlign: 'right',
  },
  returnsCard: {
    backgroundColor: '#E8F5F3',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#2A9D8F',
    marginBottom: 20,
  },
  returnsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A9D8F',
    marginBottom: 10,
  },
  returnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  returnLabel: {
    flex: 1,
    fontSize: 15,
    color: '#264653',
    marginLeft: 10,
  },
  returnValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#264653',
  },
  profitValue: {
    fontWeight: 'bold',
  },
  viewPriceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8F7',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A9D8F',
  },
  viewPriceText: {
    fontSize: 16,
    color: '#2A9D8F',
    fontWeight: '600',
    marginRight: 10,
  },
});