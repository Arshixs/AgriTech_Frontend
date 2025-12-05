import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { styles } from '../../src/styles/auth/OTPScreenStyles';
import { useAuth } from "../../src/context/AuthContext";
import { API_BASE_URL } from "../../secret"

export default function OTPScreen() {
  const router = useRouter();
  const { mobileNumber } = useLocalSearchParams(); // Get param from login screen
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signInFarmer } = useAuth(); // Import this at the top of OTPScreen component

  const handleVerifyOTP = async () => {
  if (otp.length !== 6) return alert("Enter a valid 6-digit OTP.");

  setLoading(true);

  try {
        const res = await fetch(`${API_BASE_URL}/api/farmer-auth/verify-otp`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone: `+91${mobileNumber}`,
                otp: otp,
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Invalid or Expired OTP.");
        }

        const data = await res.json();
        // console.log(data);
        // console.log("data.token");
        const { token, farmer } = data;
        let farmerData = { ...farmer, token };

        await signInFarmer(farmerData);

        if (data.isProfileComplete) {
            router.replace("/(tabs)"); 
        } else {
            router.replace("/(auth)/register"); 
        }

    } catch (err) {
        alert(err.message || "Failed to verify OTP");
    } finally {
        setLoading(false);
    }
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