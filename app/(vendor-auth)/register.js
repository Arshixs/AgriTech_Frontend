import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { useAuth } from '../../src/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons'; // For back button

export default function VendorRegistrationScreen() {
  const router = useRouter();
  const { signInVendor } = useAuth(); // Use the new vendor sign-in
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');

  const handleRegister = () => {
    if (!name || !email || !password || !orgName || !gstNumber) {
      return alert('Please fill in all required fields.');
    }
    setLoading(true);

    // --- Mock API call ---
    setTimeout(() => {
      setLoading(false);
      
      // Create the new vendor data object
      const newVendorData = {
        id: `v${Math.floor(Math.random() * 1000)}`, // Mock ID
        name: name,
        email: email,
        orgName: orgName,
        gst: gstNumber,
        address: address,
      };
      
      // Call signInVendor to save session and trigger redirect
      signInVendor(newVendorData);
      
      // No router.replace() needed, app/_layout.js handles it
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
          
          <Text style={styles.title}>Create Vendor Profile</Text>
          <Text style={styles.subtitle}>Fill in your business details to get started</Text>

          {/* Step 1: Account Details */}
          <Text style={styles.sectionTitle}>Account Details</Text>
          <Input label="Full Name" value={name} onChangeText={setName} />
          <Input 
            label="Email" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address"
          />
          <Input 
            label="Password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
          />
          
          {/* Step 2: Organisation Details (from image) */}
          <Text style={styles.sectionTitle}>Organisation Details</Text>
          <Input 
            label="Organisation Name" 
            value={orgName} 
            onChangeText={setOrgName} 
          />
          <Input 
            label="GST Number" 
            value={gstNumber} 
            onChangeText={setGstNumber} 
            autoCapitalize="characters"
          />
          <Input 
            label="Business Address (Optional)" 
            value={address} 
            onChangeText={setAddress} 
          />

          <Button 
            title="Complete Registration" 
            onPress={handleRegister} 
            loading={loading} 
            style={{marginTop: 16}} 
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#264653',
    marginTop: 16,
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
});