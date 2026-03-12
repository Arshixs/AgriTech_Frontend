// File: app/(govt-auth)/otp.js

import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, TouchableOpacity, View } from "react-native";
// import { API_BASE_URL } from "../../secret";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
import { GOVERNMENT_COLOR } from "../../constants";
import Button from "../../src/components/common/Button";
import Input from "../../src/components/common/Input";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";
import { styles } from "../../src/styles/auth/OTPScreenStyles";

export default function GovtOtpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signInGovt } = useAuth();

  const { mobileNumber } = useLocalSearchParams();

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
      const res = await fetch(`${API_BASE_URL}/api/govt/auth/resend-otp`, {
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

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      return Alert.alert(
        t("Invalid Input"),
        t("Please enter a valid 6-digit OTP."),
      );
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/govt/auth/verify-otp`,
        { phone: mobileNumber, otp },
      );

      const { token, employee } = response.data;
      await signInGovt({ ...employee, token });
    } catch (err) {
      console.error(err);
      Alert.alert(
        t("Error"),
        err.response?.data?.message || t("Failed to verify OTP"),
      );
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
          onPress={handleVerifyOtp}
          loading={loading}
          style={{ marginTop: 20 }}
          color={GOVERNMENT_COLOR}
        />

        {/* Grouped both text elements inside the resendContainer */}
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
                  { color: GOVERNMENT_COLOR, marginBottom: 16 },
                ]}
              >
                {resending ? t("Sending...") : t("Didn't receive code? Resend")}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.resendText, { color: GOVERNMENT_COLOR }]}>
              {t("Change Number")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
