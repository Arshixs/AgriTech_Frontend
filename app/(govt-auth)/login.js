// File: app/(govt-auth)/login.js

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import Input from "../../src/components/common/Input";
import Button from "../../src/components/common/Button";
import { useAuth } from "../../src/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../secret";
const API_URL = API_BASE_URL;

export default function GovtLoginScreen() {
  const router = useRouter();
  const { signInGovt } = useAuth();
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      return Alert.alert(
        t("Error"),
        t("Please enter a valid 10 digit phone number")
      );
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/govt/auth/send-otp`, {
        phone: phone.startsWith("+91") ? phone : `+91${phone}`,
      });

      Alert.alert(t("Success"), response.data.message);
      setOtpSent(true);
    } catch (error) {
      console.error("Send OTP Error:", error);
      Alert.alert(
        t("Error"),
        error.response?.data?.message || t("Failed to send OTP")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      return Alert.alert(t("Error"), t("Please enter a valid 6 digit OTP"));
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/govt/auth/verify-otp`, {
        phone: phone.startsWith("+91") ? phone : `+91${phone}`,
        otp,
      });

      const { token, employee } = response.data;

      // Store token and user data
      await signInGovt({
        ...employee,
        token,
      });
    } catch (error) {
      console.error("Verify OTP Error:", error);
      Alert.alert(
        t("Error"),
        error.response?.data?.message || t("Failed to verify OTP")
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
          onPress={() => router.replace("/")}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.iconHeader}>
          <MaterialCommunityIcons name="bank" size={60} color="#606C38" />
        </View>

        <Text style={styles.title}>{t("Government Portal")}</Text>
        <Text style={styles.subtitle}>{t("Authorized Personnel Only")}</Text>

        <Input
          label={t("Mobile Number")}
          value={phone}
          onChangeText={setPhone}
          placeholder={t("Enter 10 digit mobile number")}
          keyboardType="phone-pad"
          maxLength={13}
          editable={!otpSent}
        />

        {otpSent && (
          <Input
            label={t("OTP")}
            value={otp}
            onChangeText={setOtp}
            placeholder={t("Enter 6 digit OTP")}
            keyboardType="number-pad"
            maxLength={6}
          />
        )}

        {!otpSent ? (
          <Button
            title={t("Send OTP")}
            onPress={handleSendOtp}
            loading={loading}
            style={{ backgroundColor: "#606C38" }}
          />
        ) : (
          <>
            <Button
              title={t("Verify and Login")}
              onPress={handleVerifyOtp}
              loading={loading}
              style={{ backgroundColor: "#606C38" }}
            />
            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => {
                setOtpSent(false);
                setOtp("");
              }}
            >
              <Text style={styles.resendText}>{t("Change Number")}</Text>
            </TouchableOpacity>
          </>
        )}
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
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 1,
  },
  iconHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  resendButton: {
    marginTop: 16,
    alignItems: "center",
  },
  resendText: {
    fontSize: 16,
    color: "#606C38",
    fontWeight: "600",
  },
});
