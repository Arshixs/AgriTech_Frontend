// File: app/(vendor-auth)/otp.js

import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, TouchableOpacity, View } from "react-native";
// import { API_BASE_URL } from "../../secret";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
import { VENDOR_COLOR } from "../../constants";
import Button from "../../src/components/common/Button";
import Input from "../../src/components/common/Input";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";
import { styles } from "../../src/styles/auth/OTPScreenStyles";

export default function VendorOtpScreen() {
  const router = useRouter();
  const { signInVendor } = useAuth();
  const { t } = useTranslation();

  const { mobileNumber, pendingProfile } = useLocalSearchParams();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown === 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendOtp = async () => {
    if (cooldown > 0) return;

    setResending(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: `${mobileNumber}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      alert(t("OTP sent again successfully"));

      // Start cooldown
      setCooldown(60);
    } catch (err) {
      alert(err.message || "Error resending OTP");
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      return Alert.alert(
        t("Invalid OTP"),
        t("Please enter a valid 6-digit code."),
      );
    }

    setLoading(true);

    try {
      const verifyRes = await fetch(
        `${API_BASE_URL}/api/vendor/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: mobileNumber, otp }),
        },
      );

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.message || t("Verification failed"));
      }

      const { token, vendor } = verifyData;
      let finalVendorData = { ...vendor, token };

      if (pendingProfile) {
        const profileData = JSON.parse(pendingProfile);

        const updateRes = await fetch(
          `${API_BASE_URL}/api/vendor/auth/update-profile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
          },
        );

        const updateData = await updateRes.json();

        if (!updateRes.ok) {
          Alert.alert(
            t("Warning"),
            t(
              "OTP Verified but Profile Update failed. Please update profile in settings.",
            ),
          );
        } else {
          finalVendorData = { ...finalVendorData, ...updateData.vendor };
        }
      }

      await signInVendor(finalVendorData);
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

        <Text style={styles.title}>{t("Verify OTP")}</Text>
        <Text style={styles.subtitle}>
          {t("Enter the 6-digit code sent to")}
          {"\n"}
          <Text style={styles.subtitleHighlight}>{mobileNumber}</Text>
        </Text>

        <Input
          label={t("OTP Code")}
          value={otp}
          onChangeText={setOtp}
          placeholder="XXXXXX"
          keyboardType="number-pad"
          maxLength={6}
          style={styles.otpInput}
        />

        <Button
          title={t("Verify & Proceed")}
          onPress={handleVerify}
          loading={loading}
          style={{ marginTop: 20 }}
          color={VENDOR_COLOR}
        />

        <View style={styles.resendContainer}>
          {cooldown > 0 ? (
            <Text
              style={[styles.resendText, { color: "#888", marginBottom: 16 }]}
            >
              {t("Resend OTP in")} {cooldown}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOtp} disabled={resending}>
              <Text
                style={[
                  styles.resendText,
                  { color: VENDOR_COLOR, marginBottom: 16 },
                ]}
              >
                {resending ? t("Sending...") : t("Didn't receive code? Resend")}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.resendText, { color: VENDOR_COLOR }]}>
              {t("Change Number")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
