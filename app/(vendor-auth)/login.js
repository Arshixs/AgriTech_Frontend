import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
import { API_BASE_URL } from "../../secret";
import Button from "../../src/components/common/Button";
import Input from "../../src/components/common/Input";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { styles } from "../../src/styles/auth/LoginScreenStyles";

export default function VendorLoginScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleContinue = async () => {
    // 1. Validation
    if (mobileNumber.length !== 10) {
      return Alert.alert(
        t("Invalid Input"),
        t("Enter a valid 10-digit number.")
      );
    }

    setLoading(true);
    const fullPhoneNumber = `+91${mobileNumber}`;

    try {
      // 2. Check if Vendor Exists
      // Note: Using the specific /api/vendor endpoint
      const checkRes = await fetch(
        `${API_BASE_URL}/api/vendor/auth/vendor-exist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: fullPhoneNumber }),
        }
      );

      const checkData = await checkRes.json();

      console.log(checkData);

      if (checkRes.status === 404 || checkData.exists === false) {
        // CASE A: NEW VENDOR -> Redirect to Registration
        // We pass the phone number so they don't have to type it again
        router.push({
          pathname: "/(vendor-auth)/register",
          params: { phone: fullPhoneNumber },
        });
      } else if (checkRes.ok && checkData.exists === true) {
        // CASE B: RETURNING VENDOR -> Send OTP and Login
        await sendOtpAndNavigate(fullPhoneNumber);
      } else {
        Alert.alert(
          t("Error"),
          checkData.message || t("Something went wrong.")
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert(
        t("Network Error"),
        t("Check your connection and IP address.")
      );
    } finally {
      setLoading(false);
    }
  };

  const sendOtpAndNavigate = async (phone) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok) {
        // Navigate to OTP screen
        router.push({
          pathname: "/(vendor-auth)/otp",
          params: { mobileNumber: phone, role: "vendor" }, // Tell OTP screen this is a vendor
        });
      } else {
        Alert.alert(t("Error"), data.message || t("Failed to send OTP"));
      }
    } catch (err) {
      Alert.alert(t("Error"), t("Failed to send OTP request."));
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
        <Text style={styles.title}>{t("Vendor Login")}</Text>
        <Text style={styles.subtitle}>
          {t("Enter your mobile number to manage your shop")}
        </Text>
        <Input
          label={t("Mobile Number")}
          value={mobileNumber}
          onChangeText={handleNumberEnter}
          placeholder={t("e.g.") + `, 9876543210`}
          keyboardType="phone-pad"
          maxLength={10}
        />
        <Button
          title={t("Continue")}
          onPress={handleContinue}
          loading={loading}
        />
      </View>
    </ScreenWrapper>
  );
}
