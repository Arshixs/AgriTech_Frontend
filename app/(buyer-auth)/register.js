// File: app/(buyer-auth)/register.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { useAuth } from '../../src/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons'; // For back button

export default function BuyerRegistrationScreen() {
  const router = useRouter();
  // You will need to add signInBuyer to your AuthContext
  const { signInBuyer } = useAuth(); 
  const [loading, setLoading] = useState(false);

  // Form state based on "Company Details"
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!companyName || !contactPerson || !email || !password) {
      return alert('Please fill in all fields.');
    }
    setLoading(true);

    // --- Mock API call ---
    setTimeout(() => {
      setLoading(false);
      
      // Create the new buyer data object
      const newBuyerData = {
        id: `b${Math.floor(Math.random() * 1000)}`, // Mock ID
        name: contactPerson,
        companyName: companyName,
        email: email,
      };
      
      // Call signInBuyer to save session and trigger redirect
      if (signInBuyer) {
        signInBuyer(newBuyerData);
      } else {
        alert("Sign-in function not set up in AuthContext.");
      }
      
    }, 1500);
  };

  return (
    <ScreenWrapper>
      <ScrollView>
        <View style={styles.container}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={20} color="#264653" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Register as a Buyer</Text>
          <Text style={styles.subtitle}>Register using your Company Details</Text>

          {/* Form based on your image */}
          <Input 
            label="Company Name" 
            value={companyName} 
            onChangeText={setCompanyName} 
            placeholder="e.g., Fresh Foods Inc."
          />
          <Input 
            label="Contact Person Name" 
            value={contactPerson} 
            onChangeText={setContactPerson} 
            placeholder="e.g., Rohan Gupta"
          />
          <Input 
            label="Business Email" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address"
            placeholder="e.g., procurement@freshfoods.com"
          />
          <Input 
            label="Password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
          />

          <Button 
            title="Complete Registration" 
            onPress={handleRegister} 
            loading={loading} 
            style={{marginTop: 16, backgroundColor: '#E76F51'}} // Buyer theme
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60, // Add padding for back button
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
});