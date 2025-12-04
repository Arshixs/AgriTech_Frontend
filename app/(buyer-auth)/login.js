// File: app/(buyer-auth)/login.js

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import Input from "../../src/components/common/Input";
import Button from "../../src/components/common/Button";
import { API_BASE_URL } from "../../secret";

export default function BuyerLoginScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (mobileNumber.length !== 10)
      return alert("Enter a valid 10-digit number.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/buyer/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+91${mobileNumber}`,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Server error");
      }

      const data = await res.json();
      // Navigate to OTP screen
      router.push({ pathname: "/(buyer-auth)/otp", params: { mobileNumber } });
    } catch (err) {
      alert(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Buyer Login</Text>
        <Text style={styles.subtitle}>Access the post-harvest marketplace</Text>

        <Input
          label="Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          placeholder="e.g., 9876543210"
          keyboardType="phone-pad"
        />

        <Button
          title="Send OTP"
          onPress={handleSendOTP}
          loading={loading}
          style={{ backgroundColor: "#E76F51" }}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to the marketplace?</Text>
          <TouchableOpacity
            onPress={() => router.push("/(buyer-auth)/register")}
          >
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
  footer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  footerLink: {
    fontSize: 14,
    color: "#E76F51",
    fontWeight: "600",
    marginLeft: 4,
  },
});