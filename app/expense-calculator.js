
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../src/components/common/ScreenWrapper';
import Button from '../src/components/common/Button';
import Input from '../src/components/common/Input';
import { FontAwesome } from '@expo/vector-icons';

export default function ExpenseCalculatorScreen() {
  const router = useRouter();
  
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [result, setResult] = useState(null); // { profit: 0, margin: 0 }

  const handleCalculate = () => {
    const cost = parseFloat(costPrice);
    const selling = parseFloat(sellingPrice);

    if (isNaN(cost) || isNaN(selling)) {
      setResult(null);
      return Alert.alert('Error', 'Please enter valid numbers for both prices.');
    }
    
    if (selling === 0) {
      setResult(null);
      return Alert.alert('Error', 'Selling price cannot be zero.');
    }

    const profit = selling - cost;
    const margin = (profit / selling) * 100;

    setResult({
      profit: profit,
      margin: margin,
    });
  };

  const getResultColor = (value) => {
    return value >= 0 ? '#2A9D8F' : '#E76F51'; // Green for profit, Red for loss
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profit Calculator</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>
          Calculate your profit and profit margin.
        </Text>
        
        <Input 
          label="Cost Price (₹)"
          placeholder="e.g., 800"
          value={costPrice}
          onChangeText={setCostPrice}
          keyboardType="numeric"
        />
        <Input 
          label="Selling Price (₹)"
          placeholder="e.g., 1000"
          value={sellingPrice}
          onChangeText={setSellingPrice}
          keyboardType="numeric"
        />
        
        <Button title="Calculate" onPress={handleCalculate} />

        {/* Results Card */}
        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Profit / Loss</Text>
              <Text 
                style={[
                  styles.resultValue, 
                  { color: getResultColor(result.profit) }
                ]}
              >
                {result.profit >= 0 ? '₹' : '-₹'}
                {Math.abs(result.profit).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Profit Margin</Text>
              <Text 
                style={[
                  styles.resultValue, 
                  { color: getResultColor(result.margin) }
                ]}
              >
                {result.margin.toFixed(2)}%
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#FFF',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#264653',
  },
  container: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultItem: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 40,
    fontWeight: 'bold',
  },
});