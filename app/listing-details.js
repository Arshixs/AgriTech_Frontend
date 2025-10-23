// File: app/listing-details.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../src/components/common/ScreenWrapper';
import Button from '../src/components/common/Button';
import Input from '../src/components/common/Input';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ListingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get the listing ID
  
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bidPrice, setBidPrice] = useState('');

  // Mock data loading
  useEffect(() => {
    // --- Mock API call to fetch listing details ---
    setTimeout(() => {
      setListing({
        id: id,
        crop: 'Basmati Rice (Grade A)',
        quantity: '50 Tons',
        farmerName: 'Ram Singh',
        location: 'Varanasi, UP',
        basePrice: 3200, // as a number
        image: 'https://via.placeholder.com/400.png?text=Rice+Harvest',
        description: 'High-quality Basmati rice, harvested this season. Available for immediate pickup. MSP compliant.',
      });
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const handlePlaceBid = () => {
    const myBid = parseFloat(bidPrice);
    if (isNaN(myBid) || myBid <= 0) {
      return Alert.alert('Error', 'Please enter a valid bid price.');
    }

    if (myBid < listing.basePrice) {
      return Alert.alert('Error', `Your bid must be at least ₹${listing.basePrice}/quintal.`);
    }

    // --- Mock API call ---
    console.log(`Placing bid of ${myBid} on listing ${id}`);
    
    Alert.alert(
      'Bid Placed',
      `Your bid of ₹${myBid}/quintal has been placed.`,
      [
        { text: 'OK', onPress: () => router.push('/(buyer-tabs)/bidding') }
      ]
    );
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E76F51" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Listing Details</Text>
      </View>
      
      <ScrollView>
        <Image source={{ uri: listing.image }} style={styles.listingImage} />
        <View style={styles.container}>
          <Text style={styles.cropName}>{listing.crop}</Text>
          <Text style={styles.farmerName}>
            Posted by {listing.farmerName} ({listing.location})
          </Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Quantity</Text>
              <Text style={styles.detailValue}>{listing.quantity}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Base Price</Text>
              <Text style={styles.detailValue}>₹{listing.basePrice}/quintal</Text>
            </View>
          </View>
          
          <Text style={styles.description}>{listing.description}</Text>
          
          {/* Bidding Section */}
          <View style={styles.biddingContainer}>
            <Text style={styles.biddingTitle}>Place Your Bid</Text>
            <Input 
              label="Your Price (₹ per quintal)"
              value={bidPrice}
              onChangeText={setBidPrice}
              keyboardType="numeric"
              placeholder={`Must be > ₹${listing.basePrice}`}
            />
            <Button
              title="Place Bid"
              onPress={handlePlaceBid}
              style={styles.bidButton}
            />
          </View>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingImage: {
    width: '100%',
    height: 250,
  },
  container: {
    padding: 20,
  },
  cropName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 8,
  },
  farmerName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#264653',
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 24,
  },
  biddingContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  biddingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#264653',
    textAlign: 'center',
    marginBottom: 16,
  },
  bidButton: {
    backgroundColor: '#E76F51',
  },
});