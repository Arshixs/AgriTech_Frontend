import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { API_BASE_URL } from '../../secret';
import { useAuth } from '../../src/context/AuthContext';

export default function MarketplaceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchListings = async () => {
    if (!user?.token) return;
    setLoading(true);
    
    try {
      // The API endpoint for fetching marketplace sales
      // Note: The backend route is likely '/api/sales/marketplace' based on your app.js
      // You mentioned '${API_BASE_URL}/sales/marketplace', but standard pattern in your app is usually '/api/...'
      // I will assume '/api/sales/marketplace' based on your router setup.
      const res = await fetch(`${API_BASE_URL}/api/sales/marketplace`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      const data = await res.json();

      if (res.ok) {
        setListings(data.marketplaceSales || []);
      } else {
        // Handle empty or error states gracefully
        console.log("Fetch message:", data.message);
        setListings([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error fetching marketplace listings.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [])
  );

  const renderListingItem = ({ item }) => {
    // Extracting relevant info from the populated fields
    const cropName = item.cropId?.cropName || "Unknown Crop";
    const farmerName = item.farmerId?.name || "Unknown Farmer";
    const farmerLocation = item.farmerId?.address || "Location N/A";
    const quantity = `${item.quantity} ${item.unit}`;
    const price = item.minimumPrice ? `₹${item.minimumPrice}` : "Open to Bids";
    
    // Formatting date
    const harvestDate = new Date(item.harvestDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    // Quality Badge logic
    const qualityGrade = item.qualityGrade;
    const hasQualityCert = item.hasQualityCertificate;

    return (
      <TouchableOpacity 
        style={styles.listingCard}
        onPress={() => router.push({ 
          pathname: '/listing-details', 
          params: { id: item._id } 
        })}
      >
        {/* Placeholder Image logic based on crop name could go here */}
        <View style={styles.imagePlaceholder}>
           <MaterialCommunityIcons name="sprout" size={32} color="#2A9D8F" />
        </View>

        <View style={styles.listingInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.listingCrop}>{cropName}</Text>
            {hasQualityCert && (
              <View style={styles.qualityBadge}>
                <MaterialCommunityIcons name="check-decagram" size={12} color="#FFF" />
                <Text style={styles.qualityText}> Grade {qualityGrade}</Text>
              </View>
            )}
          </View>

          <Text style={styles.listingPrice}>Base Price: {price}</Text>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="weight-kilogram" size={14} color="#666" />
            <Text style={styles.detailText}>{quantity}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={14} color="#666" />
            <Text style={styles.detailText}>Harvested: {harvestDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>{farmerLocation}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="account" size={14} color="#666" />
            <Text style={styles.detailText}>{farmerName}</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" style={{alignSelf:'center'}} />
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Post-Harvest Marketplace</Text>
        <Text style={styles.headerSubtitle}>Browse verified harvests from farmers</Text>
      </View>
      
      {loading && listings.length === 0 ? (
        <ActivityIndicator size="large" color="#2A9D8F" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListingItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchListings} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="basket-off-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No crops listed for sale right now.</Text>
            </View>
          }
        />
      )}
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
    paddingBottom: 40,
  },
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E8F5E9', // Light green background
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap'
  },
  listingCrop: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#264653',
    marginRight: 8,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9C46A', // Gold/Yellow for quality
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qualityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});