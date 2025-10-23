// File: app/(govt-tabs)/msp-compliance.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data for MSP violations
const MOCK_VIOLATIONS = [
  {
    id: 'v1',
    crop: 'Wheat',
    farmerName: 'Anil Kumar',
    listingPrice: 2100,
    msp: 2150,
  },
  {
    id: 'v2',
    crop: 'Basmati Rice',
    farmerName: 'Ram Singh',
    listingPrice: 3000,
    msp: 3200,
  },
  {
    id: 'v3',
    crop: 'Paddy (Grade A)',
    farmerName: 'Meena Kumari',
    listingPrice: 2000,
    msp: 2040,
  },
];

export default function MspComplianceScreen() {
  const router = useRouter();
  const [violations, setViolations] = useState(MOCK_VIOLATIONS);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      // Navigate to a details screen to take action
      onPress={() => router.push({ 
        pathname: '/listing-violation', 
        params: { id: item.id } 
      })}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="alert-circle" size={32} color="#E76F51" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.crop}</Text>
        <Text style={styles.cardSubtitle}>Farmer: {item.farmerName}</Text>
      </View>
      <View style={styles.priceInfo}>
        <Text style={styles.priceLabel}>Listed Price</Text>
        <Text style={styles.priceValue}>₹{item.listingPrice}</Text>
        <Text style={styles.mspValue}>(MSP: ₹{item.msp})</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MSP Compliance</Text>
      </View>
      <FlatList
        data={violations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.listHeader}>
            {violations.length} listings found below MSP
          </Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No MSP violations found.</Text>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#264653',
  },
  listContainer: {
    padding: 20,
  },
  listHeader: {
    fontSize: 16,
    color: '#E76F51',
    marginBottom: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#E76F51',
  },
  iconContainer: {
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#264653',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E76F51',
  },
  mspValue: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});