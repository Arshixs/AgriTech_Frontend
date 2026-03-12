import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
// import { API_BASE_URL } from "../../secret";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
import Button from "../../src/components/common/Button";
import Input from "../../src/components/common/Input";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { styles } from "../../src/styles/auth/LoginScreenStyles";

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (mobileNumber.length !== 10) {
      return Alert.alert(
        t("Invalid Input"),
        t("Enter a valid 10-digit number."),
      );
    }

    if (!API_BASE_URL) {
      Alert.alert("Configuration Error", "API URL is missing");
      return;
    }


    setLoading(true);
    const fullPhoneNumber = `+91${mobileNumber}`;

    try {
      const res = await fetch(`${API_BASE_URL}/api/farmer-auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhoneNumber }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push({
          pathname: "/(auth)/otp",
          params: { mobileNumber: mobileNumber, role: "farmer" },
        });
      } else {
        Alert.alert(t("Error"), data.message || t("Failed to send OTP"));
      }
    } catch (err) {
      console.error(err);
      Alert.alert(
        t("Network Error"),
        t("Check your connection and IP address."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNumberEnter = (text) => {
    const filtered = text.replace(/[^0-9]/g, "");
    if (text !== filtered) {
      Alert.alert(
        t("Invalid Input"),
        t("Please type the mobile number using English digits (0–9) only."),
      );
    }

    setMobileNumber(filtered);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>{t("Farmer Login")}</Text>
        <Text style={styles.subtitle}>
          {t("Enter your mobile number to continue")}
        </Text>

        <Input
          label={t("Mobile Number")}
          value={mobileNumber}
          onChangeText={handleNumberEnter}
          placeholder={t("e.g., 9876543210")}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Button
          title={t("Send OTP")}
          onPress={handleSendOTP}
          loading={loading}
        />
      </View>
    </ScreenWrapper>
  );
}
