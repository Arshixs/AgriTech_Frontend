// File: app/(govt-auth)/login.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { useAuth } from '../../src/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function GovtLoginScreen() {
  const router = useRouter();
  const { signInGovt } = useAuth(); // Get the new function from context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) return alert('Please fill in all fields.');
    setLoading(true);

    // --- Mock API call ---
    // In a real app, this would verify credentials against a secure endpoint
    setTimeout(() => {
      setLoading(false);
      
      const mockGovtUserData = {
        id: 'g001',
        name: 'Mr. A. Sharma',
        department: 'Dept. of Agriculture',
        email: email,
      };
      
      // Call signInGovt to save session and trigger redirect
      if (signInGovt) {
        signInGovt(mockGovtUserData);
      } else {
        alert("Sign-in function not set up in AuthContext.");
      }
      
    }, 1000);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Back button to go to role selection */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/')}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.iconHeader}>
          <MaterialCommunityIcons name="bank" size={60} color="#606C38" />
        </View>
        
        <Text style={styles.title}>Government Login</Text>
        <Text style={styles.subtitle}>Authorized Personnel Only</Text>
        
        <Input
          label="Official Email"
          value={email}
          onChangeText={setEmail}
          placeholder="e.g., a.sharma@agri.gov.in"
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
          style={{ backgroundColor: '#606C38' }} // Govt theme color
        />
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 1,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
});