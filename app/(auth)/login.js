import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
import { API_BASE_URL } from "../../secret";
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
    if (mobileNumber.length !== 10)
      return alert(t("Enter a valid 10-digit number."));
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/farmer-auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+91${mobileNumber}`,
          role: "farmer",
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || t("Server error"));
      }
      const data = await res.json();
      // navigate to OTP screen (adjust if your backend returns different payload)
      router.push({ pathname: "/(auth)/otp", params: { mobileNumber } });
    } catch (err) {
      alert(err.message || t("Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleNumberEnter = (text) => {
    const filtered = text.replace(/[^0-9]/g, "");
    if (text !== filtered) {
      Alert.alert(
        "Invalid input",
        "Please type the mobile number using English digits (0–9) only."
      );
    }

    setMobileNumber(filtered);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>{t("Welcome Farmer")}</Text>
        <Input
          label={t("Mobile Number")}
          value={mobileNumber}
          onChangeText={handleNumberEnter}
          placeholder={t("e.g., 9876543210")}
          keyboardType="phone-pad"
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
