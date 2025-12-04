// File: app/(buyer-auth)/otp.js

import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import Input from "../../src/components/common/Input";
import Button from "../../src/components/common/Button";
import { API_BASE_URL } from "../../secret";
import { useAuth } from "../../src/context/AuthContext";

export default function BuyerOTPScreen() {
  const router = useRouter();
  const { mobileNumber } = useLocalSearchParams();
  const { signInBuyer } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return alert("Enter a valid 6-digit OTP.");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/buyer/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+91${mobileNumber}`,
          otp: otp,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Invalid OTP");
      }

      const data = await res.json();

      // Check if profile is complete
      if (!data.isProfileComplete) {
        // New user or incomplete profile - redirect to registration
        router.push({
          pathname: "/(buyer-auth)/register",
          params: {
            mobileNumber,
            token: data.token,
            buyerId: data.buyer._id,
          },
        });
      } else {
        // Existing user with complete profile - sign them in directly
        const buyerData = {
          id: data.buyer._id,
          name: data.buyer.contactPerson,
          companyName: data.buyer.companyName,
          email: data.buyer.email,
          phone: data.buyer.phone,
          token: data.token,
        };
        signInBuyer(buyerData);
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
        <Text style={styles.subtitle}>
          Enter the 6-digit OTP sent to +91 {mobileNumber}
        </Text>

        <Input
          label="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          placeholder="XXXXXX"
          keyboardType="number-pad"
        />

        <Button
          title="Verify & Proceed"
          onPress={handleVerifyOTP}
          loading={loading}
          style={{ backgroundColor: "#E76F51" }}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
});