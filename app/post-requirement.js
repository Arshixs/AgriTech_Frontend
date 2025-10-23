// File: app/post-requirement.js

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
import { FontAwesome } from '@expo/vector-icons';

const REQUIREMENT_TYPES = ['Live Bidding', 'Contract Farming'];
const GRADES = ['Grade A', 'Grade B', 'Grade C', 'Any'];

export default function PostRequirementScreen() {
  const router = useRouter();
  
  // Form State
  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [grade, setGrade] = useState('');
  const [reqType, setReqType] = useState('Live Bidding');

  const handlePostRequirement = () => {
    if (!cropName || !quantity || !grade || !reqType) {
      return Alert.alert('Error', 'Please fill in all fields.');
    }
    
    const requirementData = { cropName, quantity, grade, reqType };
    
    // --- Mock API call ---
    console.log('POSTING new requirement:', requirementData);
    // Your API call: axios.post('/api/requirements', requirementData)
    
    Alert.alert(
      'Success', 
      'Your requirement has been posted. Farmers can now place bids.',
      [
        { text: 'OK', onPress: () => router.back() } // Go back after success
      ]
    );
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Crop Requirement</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        <Input 
          label="Crop Name" 
          value={cropName} 
          onChangeText={setCropName} 
          placeholder="e.g., Basmati Rice, Tomatoes"
        />
        <Input 
          label="Quantity (in Tons)" 
          value={quantity} 
          onChangeText={setQuantity} 
          keyboardType="numeric"
          placeholder="e.g., 100"
        />
        
        <Text style={styles.label}>Select Grade</Text>
        <View style={styles.chipContainer}>
          {GRADES.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.chip, grade === g && styles.chipActive]}
              onPress={() => setGrade(g)}
            >
              <Text style={[styles.chipText, grade === g && styles.chipTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Requirement Type</Text>
        <View style={styles.chipContainer}>
          {REQUIREMENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, reqType === type && styles.chipActive]}
              onPress={() => setReqType(type)}
            >
              <Text style={[styles.chipText, reqType === type && styles.chipTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Button 
          title="Post Requirement" 
          onPress={handlePostRequirement} 
          style={styles.postButton}
        />
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
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#E76F51', // Buyer theme
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  postButton: {
    marginTop: 32,
    backgroundColor: '#E76F51',
  },
});