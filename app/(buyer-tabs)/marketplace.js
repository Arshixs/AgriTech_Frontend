// File: app/(buyer-tabs)/marketplace.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data for farmer listings
const MOCK_LISTINGS = [
  {
    id: 'l1',
    crop: 'Basmati Rice (Grade A)',
    quantity: '50 Tons',
    farmerName: 'Ram Singh',
    location: 'Varanasi, UP',
    price: '₹3,200 / quintal',
    image: 'https://via.placeholder.com/100.png?text=Rice',
  },
  {
    id: 'l2',
    crop: 'Tomatoes',
    quantity: '20 Tons',
    farmerName: 'Priya Sharma',
    location: 'Nashik, MH',
    price: '₹1,800 / quintal',
    image: 'https://via.placeholder.com/100.png?text=Tomatoes',
  },
  {
    id: 'l3',
    crop: 'Wheat',
    quantity: '100 Tons',
    farmerName: 'Anil Kumar',
    location: 'Ludhiana, PB',
    price: '₹2,150 / quintal',
    image: 'https://via.placeholder.com/100.png?text=Wheat',
  },
];

export default function MarketplaceScreen() {
  const router = useRouter();
  const [listings, setListings] = useState(MOCK_LISTINGS);

  const renderListingItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.listingCard}
      // Navigate to see details and place a bid
      onPress={() => router.push({ 
        pathname: '/listing-details', 
        params: { id: item.id } 
      })}
    >
      <Image source={{ uri: item.image }} style={styles.listingImage} />
      <View style={styles.listingInfo}>
        <Text style={styles.listingCrop}>{item.crop}</Text>
        <Text style={styles.listingPrice}>{item.price}</Text>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="weight-kilogram" size={14} color="#666" />
          <Text style={styles.detailText}>{item.quantity}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account" size={14} color="#666" />
          <Text style={styles.detailText}>{item.farmerName} ({item.location})</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Post-Harvest Marketplace</Text>
        <Text style={styles.headerSubtitle}>Browse harvests posted by farmers</Text>
      </View>
      
      {/* TODO: Add Search Bar and Filters here */}

      <FlatList
        data={listings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No listings found.</Text>}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#264653',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
  },
  listingCard: {
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
  listingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 16,
  },
  listingInfo: {
    flex: 1,
  },
  listingCrop: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A9D8F', // Farmer green
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
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