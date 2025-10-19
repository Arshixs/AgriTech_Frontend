import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../src/components/common/ScreenWrapper';
import Button from '../src/components/common/Button';

export default function ExpensePredictionScreen() {
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [landArea, setLandArea] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const crops = [
    { id: 1, name: 'Rice', icon: 'grain', color: '#F4A261' },
    { id: 2, name: 'Wheat', icon: 'barley', color: '#E9C46A' },
    { id: 3, name: 'Tomato', icon: 'food-apple', color: '#E76F51' },
    { id: 4, name: 'Cotton', icon: 'spa', color: '#2A9D8F' },
    { id: 5, name: 'Sugarcane', icon: 'grass', color: '#606C38' },
    { id: 6, name: 'Potato', icon: 'food', color: '#D4A373' },
  ];

  const handlePredictExpense = () => {
    if (!selectedCrop || !landArea) {
      alert('Please select a crop and enter land area');
      return;
    }

    setLoading(true);

    // Mock API call with calculation
    setTimeout(() => {
      const area = parseFloat(landArea);
      const baseCostPerAcre = {
        'Rice': 25000,
        'Wheat': 20000,
        'Tomato': 35000,
        'Cotton': 28000,
        'Sugarcane': 40000,
        'Potato': 32000,
      };

      const base = baseCostPerAcre[selectedCrop.name] * area;
      
      const breakdown = {
        seeds: Math.round(base * 0.15),
        fertilizers: Math.round(base * 0.25),
        pesticides: Math.round(base * 0.12),
        irrigation: Math.round(base * 0.18),
        labor: Math.round(base * 0.20),
        machinery: Math.round(base * 0.10),
      };

      const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

      setPrediction({
        crop: selectedCrop.name,
        area: area,
        total: total,
        breakdown: breakdown,
        perAcre: Math.round(total / area),
        expectedYield: Math.round(area * 30), // quintals
        expectedRevenue: Math.round(total * 1.4), // 40% profit margin
      });

      setLoading(false);
    }, 1500);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
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
                  selectedCrop?.id === crop.id && styles.cropCardSelected,
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
                    selectedCrop?.id === crop.id && styles.cropNameSelected,
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

          {/* Prediction Result */}
          {prediction && (
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
                
                {Object.entries(prediction.breakdown).map(([key, value]) => {
                  const icons = {
                    seeds: 'seed',
                    fertilizers: 'flask',
                    pesticides: 'bug-outline',
                    irrigation: 'water',
                    labor: 'account-group',
                    machinery: 'tractor',
                  };
                  const percentage = ((value / prediction.total) * 100).toFixed(0);

                  return (
                    <View key={key} style={styles.breakdownItem}>
                      <View style={styles.breakdownLeft}>
                        <MaterialCommunityIcons
                          name={icons[key]}
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
                  <Text style={[styles.returnValue, styles.profitValue]}>
                    {formatCurrency(prediction.expectedRevenue - prediction.total)}
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#264653',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 15,
  },
  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  cropCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  cropCardSelected: {
    backgroundColor: '#2A9D8F',
    borderColor: '#2A9D8F',
  },
  cropName: {
    fontSize: 13,
    color: '#264653',
    marginTop: 8,
    fontWeight: '600',
  },
  cropNameSelected: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 18,
    color: '#333',
  },
  inputUnit: {
    paddingRight: 15,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 30,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#264653',
    marginLeft: 12,
  },
  totalCard: {
    backgroundColor: '#2A9D8F',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  perAcreText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  breakdownRight: {
    alignItems: 'flex-end',
  },
  breakdownPercent: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
  },
  returnsCard: {
    backgroundColor: '#F0F8F7',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  returnsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 16,
  },
  returnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  returnLabel: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  returnValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
  },
  profitValue: {
    color: '#2A9D8F',
  },
  viewPriceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2A9D8F',
  },
  viewPriceText: {
    fontSize: 16,
    color: '#2A9D8F',
    fontWeight: '600',
    marginRight: 8,
  },
});