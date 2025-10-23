// File: app/listing-violation.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../src/components/common/ScreenWrapper';
import Button from '../src/components/common/Button';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ListingViolationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get the violation ID
  
  const [violation, setViolation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data loading
  useEffect(() => {
    // --- Mock API call to fetch violation details ---
    setTimeout(() => {
      setViolation({
        id: id,
        crop: 'Wheat',
        farmerName: 'Anil Kumar',
        listingId: 'L-456',
        listingPrice: 2100,
        msp: 2150,
      });
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const handleAction = (action) => {
    let title, message;
    if (action === 'Notify') {
      title = 'Send Warning';
      message = 'A warning notification will be sent to the farmer.';
    } else {
      title = 'Delist Item';
      message = 'This will immediately remove the listing from the marketplace. Are you sure?';
    }

    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: action === 'Delist' ? 'destructive' : 'default',
          onPress: () => {
            // --- Mock API call ---
            console.log(`Action: ${action} for violation ${id}`);
            Alert.alert('Action Taken', `The action was successful.`, [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#606C38" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MSP Violation</Text>
      </View>
      
      <ScrollView>
        <View style={styles.violationHeader}>
          <MaterialCommunityIcons name="alert-circle" size={50} color="#E76F51" />
          <Text style={styles.violationTitle}>Listing Below MSP</Text>
        </View>

        <View style={styles.container}>
          <Text style={styles.cropName}>{violation.crop}</Text>
          <Text style={styles.farmerName}>
            Farmer: {violation.farmerName} (Listing ID: {violation.listingId})
          </Text>
          
          <View style={styles.priceContainer}>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Mandatory MSP</Text>
              <Text style={styles.mspPrice}>₹{violation.msp}</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Listed Price</Text>
              <Text style={styles.listedPrice}>₹{violation.listingPrice}</Text>
            </View>
          </View>
          
          {/* Action Section */}
          <View style={styles.actionContainer}>
            <Text style={styles.sectionTitle}>Enforcement Action</Text>
            <Button
              title="Send Warning to Farmer"
              onPress={() => handleAction('Notify')}
              style={styles.notifyButton}
              textStyle={styles.notifyButtonText}
            />
            <Button
              title="Delist Item Immediately"
              onPress={() => handleAction('Delist')}
              style={styles.delistButton}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#F8F9FA',
  },
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
  violationHeader: {
    backgroundColor: '#FFF8F0',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E76F51',
  },
  violationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E76F51',
    marginTop: 8,
  },
  container: {
    padding: 20,
  },
  cropName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 8,
    textAlign: 'center',
  },
  farmerName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  priceBox: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    width: '45%',
    elevation: 2,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  mspPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A9D8F',
  },
  listedPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E76F51',
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 16,
    textAlign: 'center',
  },
  notifyButton: {
    backgroundColor: '#F4A261',
    marginBottom: 12,
  },
  notifyButtonText: {
    color: '#FFFFFF',
  },
  delistButton: {
    backgroundColor: '#E76F51',
  },
});