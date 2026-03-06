import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
import { API_BASE_URL, GOVERNMENT_COLOR } from "../../secret";
import Button from "../../src/components/common/Button";
import Input from "../../src/components/common/Input";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";
import { styles } from "../../src/styles/auth/LoginScreenStyles";

export default function GovtLoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signInGovt } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      return Alert.alert(
        t("Invalid Input"),
        t("Enter a valid 10-digit number."),
      );
    }

    setLoading(true);
    const fullPhoneNumber = `+91${phone}`;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/govt/auth/send-otp`,
        { phone: fullPhoneNumber },
      );

      Alert.alert(t("Success"), response.data.message);
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      Alert.alert(
        t("Error"),
        err.response?.data?.message || t("Failed to send OTP"),
      );
    } finally {
      setLoading(false);
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
    const fullPhoneNumber = `+91${phone}`;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/govt/auth/verify-otp`,
        { phone: fullPhoneNumber, otp },
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

  const handleNumberEnter = (text) => {
    const filtered = text.replace(/[^0-9]/g, "");
    if (text !== filtered) {
      Alert.alert(
        t("Invalid Input"),
        t("Please type the mobile number using English digits (0–9) only."),
      );
    }
    setPhone(filtered);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>{t("Government Login")}</Text>
        <Text style={styles.subtitle}>
          {t("Enter your registered mobile number")}
        </Text>

        <Input
          label={t("Mobile Number")}
          value={phone}
          onChangeText={handleNumberEnter}
          placeholder={t("e.g., 9876543210")}
          keyboardType="phone-pad"
          maxLength={10}
          editable={!otpSent}
        />

        {otpSent && (
          <Input
            label={t("OTP")}
            value={otp}
            onChangeText={setOtp}
            placeholder={t("Enter 6-digit OTP")}
            keyboardType="number-pad"
            maxLength={6}
          />
        )}

        {!otpSent ? (
          <Button
            title={t("Send OTP")}
            onPress={handleSendOtp}
            loading={loading}
            color={GOVERNMENT_COLOR}
          />
        ) : (
          <>
            <Button
              title={t("Verify and Login")}
              onPress={handleVerifyOtp}
              loading={loading}
            />

            <Text
              style={styles.resendText}
              onPress={() => {
                setOtpSent(false);
                setOtp("");
              }}
            >
              {t("Change Number")}
            </Text>
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}
