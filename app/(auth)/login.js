import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { styles } from '../../src/styles/auth/LoginScreenStyles';

export default function LoginScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = () => {
    if (mobileNumber.length !== 10) return alert('Enter a valid 10-digit number.');
    setLoading(true);
    // --- Mock API call ---
    setTimeout(() => {
      setLoading(false);
      router.push({ pathname: '/(auth)/otp', params: { mobileNumber } });
    }, 1000);
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