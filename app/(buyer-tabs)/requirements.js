// File: app/(buyer-tabs)/requirements.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Button from '../../src/components/common/Button';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data for posted requirements
const MOCK_REQUIREMENTS = [
  {
    id: 'req1',
    crop: 'Basmati Rice',
    quantity: '100 Tons',
    status: 'Bidding Open',
    bids: 5,
    expires: '2 days',
  },
  {
    id: 'req2',
    crop: 'Tomatoes (Grade A)',
    quantity: '50 Tons',
    status: 'Bidding Open',
    bids: 8,
    expires: '3 days',
  },
  {
    id: 'req3',
    crop: 'Wheat',
    quantity: '500 Tons',
    status: 'Contract Farming',
    bids: 1,
    expires: 'N/A',
  },
  {
    id: 'req4',
    crop: 'Organic Potatoes',
    quantity: '25 Tons',
    status: 'Bidding Closed',
    bids: 12,
    expires: 'N/A',
  },
];

export default function RequirementsScreen() {
  const router = useRouter();
  const [requirements, setRequirements] = useState(MOCK_REQUIREMENTS);

  const getStatusColor = (status) => {
    if (status === 'Bidding Open') return '#2A9D8F';
    if (status === 'Contract Farming') return '#457B9D';
    return '#666'; // Bidding Closed
  };

  const renderRequirementItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.reqCard}
      // Navigate to the bidding room for this requirement
      onPress={() => router.push({ 
        pathname: '/bidding-room', 
        params: { id: item.id } 
      })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.reqCrop}>{item.crop}</Text>
        <Text 
          style={[styles.statusBadge, { color: getStatusColor(item.status) }]}
        >
          {item.status}
        </Text>
      </View>
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="weight-kilogram" size={16} color="#666" />
          <Text style={styles.detailText}>{item.quantity}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="gavel" size={16} color="#666" />
          <Text style={styles.detailText}>{item.bids} Bids</Text>
        </View>
        {item.status === 'Bidding Open' && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#E76F51" />
            <Text style={[styles.detailText, {color: '#E76F51'}]}>
              Closes in {item.expires}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Crop Requirements</Text>
      </View>
      <Button
        title="Post New Requirement"
        onPress={() => router.push('/post-requirement')}
        style={styles.postButton}
      />
      <FlatList
        data={requirements}
        renderItem={renderRequirementItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>You have not posted any requirements.</Text>}
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
  postButton: {
    backgroundColor: '#E76F51',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  listContainer: {
    padding: 20,
  },
  reqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
  },
  reqCrop: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#264653',
    flex: 1,
  },
  statusBadge: {
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});