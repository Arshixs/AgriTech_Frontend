
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { useAuth } from '../../src/context/AuthContext';

export default function VendorLoginScreen() {
  const router = useRouter();
  const { signInVendor } = useAuth(); // Use the new vendor sign-in
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) return alert('Please fill in all fields.');
    setLoading(true);

    // --- Mock API call ---
    // In a real app, you'd send this to your backend
    setTimeout(() => {
      setLoading(false);
      
      // Mock data for an existing vendor
      const mockVendorData = {
        id: 'v123',
        name: 'Suresh Kumar',
        orgName: 'Agri Supplies Co.',
        email: email,
        gst: '22ABCDE1234F1Z5',
      };
      
      // Call signInVendor to save session and trigger redirect
      signInVendor(mockVendorData);
      
      // No router.replace() needed here, app/_layout.js handles it
    }, 1000);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Vendor Login</Text>
        <Text style={styles.subtitle}>Welcome back to the marketplace</Text>
        
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="e.g., vendor@agri.com"
          keyboardType="email-address"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
        />
        
        <Button title="Login" onPress={handleLogin} loading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(vendor-auth)/register')}>
            <Text style={styles.footerLink}>Register here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

// You can reuse styles from your farmer login or create new ones
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#264653', // Your dark blue
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
    color: '#2A9D8F', // Your primary green
    fontWeight: '600',
    marginLeft: 4,
  },
});