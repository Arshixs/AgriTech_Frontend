// File: app/(govt-tabs)/quality-approval.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data for pending quality approvals
const MOCK_APPROVALS = [
  {
    id: 'qa1',
    crop: 'Basmati Rice',
    farmerName: 'Ram Singh',
    location: 'Varanasi, UP',
    submitted: '2025-10-23 09:15 AM',
  },
  {
    id: 'qa2',
    crop: 'Tomatoes (Grade A)',
    farmerName: 'Priya Sharma',
    location: 'Nashik, MH',
    submitted: '2025-10-23 08:30 AM',
  },
  {
    id: 'qa3',
    crop: 'Wheat',
    farmerName: 'Anil Kumar',
    location: 'Ludhiana, PB',
    submitted: '2025-10-22 04:00 PM',
  },
];

export default function QualityApprovalScreen() {
  const router = useRouter();
  const [approvals, setApprovals] = useState(MOCK_APPROVALS);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      // Navigate to the details screen to approve/reject
      onPress={() => router.push({ 
        pathname: '/approval-details', 
        params: { id: item.id } 
      })}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="clipboard-text-clock" size={32} color="#F4A261" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.crop}</Text>
        <Text style={styles.cardSubtitle}>Farmer: {item.farmerName}</Text>
        <Text style={styles.cardLocation}>{item.location}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quality Grading Queue</Text>
      </View>
      <FlatList
        data={approvals}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.listHeader}>
            {approvals.length} items awaiting approval
          </Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>The approval queue is empty.</Text>
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
    color: '#666',
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
  cardLocation: {
    fontSize: 13,
    color: '#606C38',
    fontWeight: '500',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});