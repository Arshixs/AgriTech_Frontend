import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../secret";
import Button from "../../src/components/common/Button";
import Input from "../../src/components/common/Input";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

export default function VendorOtpScreen() {
  const router = useRouter();
  const { signInVendor } = useAuth(); // We use the context to manage session
  const { t } = useTranslation();

  // Get params passed from Login or Register screen
  const { mobileNumber, pendingProfile } = useLocalSearchParams();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      return Alert.alert(
        t("Invalid OTP"),
        t("Please enter a valid 6-digit code.")
      );
    }

    setLoading(true);

    try {
      // 1. Verify OTP
      const verifyRes = await fetch(
        `${API_BASE_URL}/api/vendor/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: mobileNumber, otp }),
        }
      );

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.message || t("Verification failed"));
      }

      // 2. Token & Vendor Data received
      const { token, vendor } = verifyData;
      let finalVendorData = { ...vendor, token };

      // 3. Check if there is a Pending Profile (New Registration)
      if (pendingProfile) {
        const profileData = JSON.parse(pendingProfile);

        // Update Profile on Backend
        const updateRes = await fetch(
          `${API_BASE_URL}/api/vendor/auth/update-profile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
          }
        );

        const updateData = await updateRes.json();

        if (!updateRes.ok) {
          Alert.alert(
            t("Warning"),
            t(
              "OTP Verified but Profile Update failed. Please update profile in settings."
            )
          );
        } else {
          // Update our local vendor object with the new profile info
          finalVendorData = { ...finalVendorData, ...updateData.vendor };
        }
      }

      // 4. Sign In & Redirect (Handled by AuthContext)
      // This function should save the user and redirect to /(vendor-tabs)
      await signInVendor(finalVendorData);

      // If signInVendor doesn't redirect automatically, uncomment below:
      // router.replace('/(vendor-tabs)');
    } catch (err) {
      console.error(err);
      Alert.alert(t("Error"), err.message || t("Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>

        <Text style={styles.title}>{t("Verification")}</Text>
        <Text style={styles.subtitle}>
          {t("Enter the 6-digit code sent to")}
          {"\n"}
          <Text style={{ fontWeight: "bold", color: "#264653" }}>
            {mobileNumber}
          </Text>
        </Text>

        <Input
          label={t("OTP Code")}
          value={otp}
          onChangeText={setOtp}
          placeholder="XXXXXX"
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
          style={styles.otpInput}
        />

        <Button
          title={t("Verify & Login")}
          onPress={handleVerify}
          loading={loading}
          style={{ marginTop: 20 }}
        />

        <TouchableOpacity style={styles.resendContainer}>
          <Text style={styles.resendText}>
            {t("Didn't receive code? Resend")}
          </Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    lineHeight: 24,
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: "bold",
  },
  resendContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  resendText: {
    color: "#2A9D8F",
    fontWeight: "600",
  },
});
