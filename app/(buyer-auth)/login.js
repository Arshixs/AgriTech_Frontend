// File: app/(buyer-auth)/login.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { useAuth } from '../../src/context/AuthContext';

export default function BuyerLoginScreen() {
  const router = useRouter();
  // You will need to add signInBuyer to your AuthContext
  const { signInBuyer } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) return alert('Please fill in all fields.');
    setLoading(true);

    // --- Mock API call ---
    setTimeout(() => {
      setLoading(false);
      
      // Mock data for an existing buyer
      const mockBuyerData = {
        id: 'b789',
        name: 'Rohan Gupta',
        companyName: 'Fresh Foods Inc.',
        email: email,
      };
      
      // Call signInBuyer to save session and trigger redirect
      // This assumes signInBuyer is in your context and sets role: 'buyer'
      if (signInBuyer) {
        signInBuyer(mockBuyerData);
      } else {
        alert("Sign-in function not set up in AuthContext.");
      }
      
    }, 1000);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Buyer Login</Text>
        <Text style={styles.subtitle}>Access the post-harvest marketplace</Text>
        
        <Input
          label="Business Email"
          value={email}
          onChangeText={setEmail}
          placeholder="e.g., procurement@freshfoods.com"
          keyboardType="email-address"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
        />
        
        <Button 
          title="Login" 
          onPress={handleLogin} 
          loading={loading}
          style={{ backgroundColor: '#E76F51' }} // Buyer theme color
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to the marketplace?</Text>
          <TouchableOpacity onPress={() => router.push('/(buyer-auth)/register')}>
            <Text style={styles.footerLink}>Register here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#264653', // Dark blue
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    color: '#E76F51', // Buyer theme color
    fontWeight: '600',
    marginLeft: 4,
  },
});