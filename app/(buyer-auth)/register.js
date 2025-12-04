// File: app/(buyer-auth)/register.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import Input from "../../src/components/common/Input";
import Button from "../../src/components/common/Button";
import { useAuth } from "../../src/context/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import { API_BASE_URL } from "../../secret";

export default function BuyerRegistrationScreen() {
  const router = useRouter();
  const { mobileNumber, token, buyerId } = useLocalSearchParams();
  const { signInBuyer } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");

  const handleRegister = async () => {
    if (!companyName || !contactPerson || !email) {
      return alert("Please fill in all fields.");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return alert("Please enter a valid email address.");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/buyer/auth/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: companyName,
          contactPerson: contactPerson,
          email: email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await res.json();

      // Create buyer data object and sign in
      const newBuyerData = {
        id: buyerId,
        name: contactPerson,
        companyName: companyName,
        email: email,
        phone: `+91${mobileNumber}`,
        token: token,
      };

      signInBuyer(newBuyerData);
    } catch (err) {
      alert(err.message || "Failed to complete registration");
    } finally {
      setLoading(false);
    }
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

          <Text style={styles.title}>Register as a Buyer</Text>
          <Text style={styles.subtitle}>
            Complete your profile to access the marketplace
          </Text>

          <Input
            label="Company Name"
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="e.g., Fresh Foods Inc."
          />
          <Input
            label="Contact Person Name"
            value={contactPerson}
            onChangeText={setContactPerson}
            placeholder="e.g., Rohan Gupta"
          />
          <Input
            label="Business Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="e.g., procurement@freshfoods.com"
            autoCapitalize="none"
          />

          <Button
            title="Complete Registration"
            onPress={handleRegister}
            loading={loading}
            style={{ marginTop: 16, backgroundColor: "#E76F51" }}
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
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 1,
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