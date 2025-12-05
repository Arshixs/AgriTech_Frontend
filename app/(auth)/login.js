import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { styles } from '../../src/styles/auth/LoginScreenStyles';
import { API_BASE_URL } from "../../secret";

export default function LoginScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);

   const handleSendOTP = async () => {
    if (mobileNumber.length !== 10) return alert('Enter a valid 10-digit number.');
    setLoading(true);
    try {
    const res = await fetch(`${API_BASE_URL}/api/farmer-auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: `+91${mobileNumber}`, 
        role: "farmer"
      }),
    });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Server error');
      }
      const data = await res.json();
      // navigate to OTP screen (adjust if your backend returns different payload)
      router.push({ pathname: '/(auth)/otp', params: { mobileNumber } });
    } catch (err) {
      alert(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Farmer</Text>
        <Input
          label="Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          placeholder="e.g., 9876543210"
          keyboardType="phone-pad"
        />
        <Button title="Send OTP" onPress={handleSendOTP} loading={loading} />
      </View>
    </ScreenWrapper>
  );
}