import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next"; //
import { Text, View } from "react-native";
import { API_BASE_URL } from "../../secret";
import Button from "../../src/components/common/Button";
import Input from "../../src/components/common/Input";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";
import { styles } from "../../src/styles/auth/OTPScreenStyles";

export default function OTPScreen() {
  const router = useRouter();
  const { t } = useTranslation(); //
  const { mobileNumber } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const { signInFarmer } = useAuth();

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return alert(t("Enter a valid 6-digit OTP."));

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/farmer-auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+91${mobileNumber}`,
          otp: otp,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || t("Invalid or Expired OTP."));
      }

      const data = await res.json();
      const { token, farmer } = data;
      let farmerData = { ...farmer, token };

      await signInFarmer(farmerData);

      if (data.isProfileComplete) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/register");
      }
    } catch (err) {
      alert(err.message || t("Failed to verify OTP"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>{t("Verify OTP")}</Text>
        <Text style={styles.subtitle}>
          {t("Enter the 6-digit OTP sent to +91 {{mobile}}", {
            mobile: mobileNumber,
          })}
        </Text>
        <Input
          label={t("Enter OTP")}
          value={otp}
          onChangeText={setOtp}
          placeholder="XXXXXX"
          keyboardType="number-pad"
        />
        <Button
          title={t("Verify & Proceed")}
          onPress={handleVerifyOTP}
          loading={loading}
        />
      </View>
    </ScreenWrapper>
  );
}
