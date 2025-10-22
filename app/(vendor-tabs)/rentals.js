// File: app/(vendor-tabs)/rentals.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data for rental requests
const MOCK_RENTALS = [
  {
    id: 'r1',
    farmerName: 'Ram Singh',
    itemName: 'Tractor - John Deere',
    dates: 'Oct 25 - Oct 27, 2025',
    status: 'Pending',
  },
  {
    id: 'r2',
    farmerName: 'Priya Sharma',
    itemName: 'Manual Sprayer (x5)',
    dates: 'Oct 28, 2025',
    status: 'Pending',
  },
  {
    id: 'r3',
    farmerName: 'Anil Kumar',
    itemName: 'Tractor Pump',
    dates: 'Oct 20 - Oct 22, 2025',
    status: 'Active',
  },
  {
    id: 'r4',
    farmerName: 'Sunita Devi',
    itemName: 'Harvester',
    dates: 'Oct 15 - Oct 18, 2025',
    status: 'Completed',
  },
];

export default function RentalsScreen() {
  const [rentals, setRentals] = useState(MOCK_RENTALS);
  const [activeTab, setActiveTab] = useState('Pending');

  const handleAccept = (id) => {
    // Mock logic: Update item status
    setRentals(rentals.map(r => r.id === id ? { ...r, status: 'Active' } : r));
  };

  const handleDecline = (id) => {
    // Mock logic: Update item status
    setRentals(rentals.map(r => r.id === id ? { ...r, status: 'Declined' } : r));
  };

  const getStatusColor = (status) => {
    if (status === 'Pending') return '#F4A261';
    if (status === 'Active') return '#2A9D8F';
    if (status === 'Completed') return '#666';
    return '#E76F51'; // Declined
  };

  const renderRentalItem = ({ item }) => (
    <View style={styles.rentalCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.itemName}>{item.itemName}</Text>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialCommunityIcons name="account" size={16} color="#666" />
        <Text style={styles.detailText}>Farmer: {item.farmerName}</Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialCommunityIcons name="calendar" size={16} color="#666" />
        <Text style={styles.detailText}>Dates: {item.dates}</Text>
      </View>

      {/* Show buttons only for Pending requests */}
      {item.status === 'Pending' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleDecline(item.id)}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAccept(item.id)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const filteredRentals = rentals.filter(r => r.status === activeTab);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Rentals</Text>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['Pending', 'Active', 'Completed', 'Declined'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRentals}
        renderItem={renderRentalItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No {activeTab.toLowerCase()} requests.</Text>
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2A9D8F',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#2A9D8F',
  },
  listContainer: {
    padding: 20,
  },
  rentalCard: {
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
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#264653',
    flex: 1, // Allow text to wrap
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  declineButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E76F51',
  },
  declineButtonText: {
    color: '#E76F51',
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#2A9D8F',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});