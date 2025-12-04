import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../../secret";
import Button from "../../src/components/common/Button";
import Input from "../../src/components/common/Input";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";

export default function VendorRegistrationScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams(); // Get phone passed from Login Screen
  const [loading, setLoading] = useState(false);

  // Form state (Matched with your Mongoose Vendor Model)
  // Removed Email/Password as they aren't in your updated schema
  const [name, setName] = useState("");
  const [organizationName, setorganizationName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");

  const handleRegister = async () => {
    if (!name || !organizationName || !gstNumber || !address) {
      return Alert.alert("Missing Fields", "Please fill in all details.");
    }

    setLoading(true);

    try {
      // 1. Send OTP to create the initial account in DB
      const res = await fetch(`${API_BASE_URL}/api/vendor/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone }),
      });

      const data = await res.json();

      if (res.ok) {
        // 2. Prepare Profile Data to be saved AFTER verification
        // We stringify it to pass it securely via params
        const pendingProfileData = JSON.stringify({
          name,
          organizationName: organizationName,
          gstNumber,
          address,
        });

        // 3. Navigate to OTP Screen
        router.push({
          pathname: "/(vendor-auth)/otp",
          params: {
            mobileNumber: phone,
            role: "vendor",
            pendingProfile: pendingProfileData, // <--- Pass profile data here
          },
        });
      } else {
        Alert.alert("Error", data.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Network Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={20} color="#264653" />
          </TouchableOpacity>

          <Text style={styles.title}>New Vendor Profile</Text>
          <Text style={styles.subtitle}>
            Registering for: <Text style={{ fontWeight: "bold" }}>{phone}</Text>
          </Text>

          {/* Personal Details */}
          <Text style={styles.sectionTitle}>Owner Details</Text>
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Ramesh Kumar"
          />

          {/* Organisation Details */}
          <Text style={styles.sectionTitle}>Shop / Business Details</Text>
          <Input
            label="Shop/Organization Name"
            value={organizationName}
            onChangeText={setorganizationName}
            placeholder="e.g. Kisan Bhandar"
          />
          <Input
            label="GST Number"
            value={gstNumber}
            onChangeText={setGstNumber}
            autoCapitalize="characters"
            placeholder="e.g. 22AAAAA0000A1Z5"
          />
          <Input
            label="Business Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Shop No, Market, City"
            multiline
          />

          <Button
            title="Send OTP & Verify"
            onPress={handleRegister}
            loading={loading}
            style={{ marginTop: 24 }}
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
    paddingTop: 40,
  },
  backButton: {
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2A9D8F",
    marginTop: 16,
    marginBottom: 12,
  },
});
