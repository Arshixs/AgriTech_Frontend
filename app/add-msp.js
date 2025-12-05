// File: app/add-msp.js

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../src/components/common/ScreenWrapper';
import Input from '../src/components/common/Input';
import Button from '../src/components/common/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import axios from 'axios';


import { API_BASE_URL } from '../secret';
const API_URL = API_BASE_URL;
export default function AddMSPScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [cropName, setCropName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('quintal');
  const [season, setSeason] = useState('year-round');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!cropName.trim()) {
      return Alert.alert('Error', 'Please enter crop name');
    }

    if (!price || parseFloat(price) <= 0) {
      return Alert.alert('Error', 'Please enter a valid price');
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/msp`,
        {
          cropName: cropName.trim(),
          price: parseFloat(price),
          unit,
          season,
          effectiveFrom: new Date(),
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      Alert.alert('Success', 'MSP added successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Add MSP Error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add MSP'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New MSP</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.iconHeader}>
          <MaterialCommunityIcons name="plus-circle" size={60} color="#606C38" />
        </View>

        <View style={styles.form}>
          <Input
            label="Crop Name"
            value={cropName}
            onChangeText={setCropName}
            placeholder="e.g., Wheat, Paddy, etc."
          />

          <Input
            label="MSP Price (₹)"
            value={price}
            onChangeText={setPrice}
            placeholder="Enter price"
            keyboardType="decimal-pad"
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Unit</Text>
            <View style={styles.radioGroup}>
              {['quintal', 'kg', 'ton'].map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.radioButton, unit === u && styles.radioButtonActive]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[styles.radioText, unit === u && styles.radioTextActive]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Season</Text>
            <View style={styles.radioGroup}>
              {[
                { label: 'Kharif', value: 'kharif' },
                { label: 'Rabi', value: 'rabi' },
                { label: 'Year-Round', value: 'year-round' },
              ].map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.radioButton, season === s.value && styles.radioButtonActive]}
                  onPress={() => setSeason(s.value)}
                >
                  <Text style={[styles.radioText, season === s.value && styles.radioTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Add MSP"
            onPress={handleAdd}
            loading={loading}
            style={{ backgroundColor: '#606C38', marginTop: 24 }}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#264653',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  iconHeader: {
    alignItems: 'center',
    marginVertical: 24,
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  radioButtonActive: {
    borderColor: '#606C38',
    backgroundColor: '#F0F2E6',
  },
  radioText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  radioTextActive: {
    color: '#606C38',
  },
});