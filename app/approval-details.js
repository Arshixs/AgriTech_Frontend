// File: app/approval-details.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../src/components/common/ScreenWrapper';
import Button from '../src/components/common/Button';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../src/components/common/Input'; // For rejection notes

export default function ApprovalDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get the item ID
  
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');

  // Mock data loading
  useEffect(() => {
    // --- Mock API call to fetch submission details ---
    setTimeout(() => {
      setItem({
        id: id,
        crop: 'Basmati Rice',
        farmerName: 'Ram Singh',
        location: 'Varanasi, UP',
        image: 'https://via.placeholder.com/400.png?text=Rice+Sample',
        labReport: 'Lab Report ID: #LR78923',
        details: [
          { label: 'Moisture', value: '12%' },
          { label: 'Broken Grains', value: '< 2%' },
          { label: 'Purity', value: '99.8%' },
        ],
      });
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const handleAction = (action) => {
    if (action === 'Reject' && !notes) {
      return Alert.alert('Error', 'Please provide rejection notes.');
    }

    // --- Mock API call ---
    console.log(`Submitting action: ${action} for item ${id} with notes: ${notes}`);
    
    Alert.alert(
      'Action Submitted',
      `The item has been ${action.toLowerCase()}ed.`,
      [{ text: 'OK', onPress: () => router.back() }]
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
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Approve Quality</Text>
      </View>
      
      <ScrollView>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <View style={styles.container}>
          <Text style={styles.cropName}>{item.crop}</Text>
          <Text style={styles.farmerName}>
            From {item.farmerName} ({item.location})
          </Text>
          
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>Lab Report Details</Text>
            {item.details.map((detail, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{detail.label}</Text>
                <Text style={styles.detailValue}>{detail.value}</Text>
              </View>
            ))}
          </View>
          
          {/* Action Section */}
          <View style={styles.actionContainer}>
            <Text style={styles.sectionTitle}>Take Action</Text>
            <Input 
              label="Rejection Notes (if any)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
            <View style={styles.buttonRow}>
              <Button
                title="Reject"
                onPress={() => handleAction('Reject')}
                style={styles.rejectButton}
                textStyle={styles.rejectButtonText}
              />
              <Button
                title="Approve"
                onPress={() => handleAction('Approve')}
                style={styles.approveButton}
              />
            </View>
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
  itemImage: {
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
  detailsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 15,
    color: '#555',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#264653',
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E76F51',
    marginRight: 8,
  },
  rejectButtonText: {
    color: '#E76F51',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#2A9D8F', // Green for approve
    marginLeft: 8,
  },
});