import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { styles } from '../../src/styles/auth/OTPScreenStyles';

export default function OTPScreen() {
  const router = useRouter();
  const { mobileNumber } = useLocalSearchParams(); // Get param from login screen
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = () => {
    if (otp.length !== 6) return alert('Enter a valid 6-digit OTP.');
    setLoading(true);
    // --- Mock API call ---
    setTimeout(() => {
      setLoading(false);
      // In a real app, you'd check if this user is new or existing.
      // We'll assume they are new and send to registration.
      router.push('/(auth)/register');
    }, 1000);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit OTP sent to +91 {mobileNumber}</Text>
        <Input
          label="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          placeholder="XXXXXX"
          keyboardType="number-pad"
        />
        <Button title="Verify & Proceed" onPress={handleVerifyOTP} loading={loading} />
      </View>
    </ScreenWrapper>
  );
}