import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, Text, View } from "react-native";
import { API_BASE_URL } from "../../secret";
import Button from "../../src/components/common/Button";
import Input from "../../src/components/common/Input";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";

export default function BuyerLoginScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleContinue = async () => {
    // 1. Basic Validation
    if (mobileNumber.length !== 10) {
      return Alert.alert(
        t("Invalid Input"),
        t("Enter a valid 10-digit number.")
      );
    }

    setLoading(true);
    const fullPhoneNumber = `+91${mobileNumber}`;

    try {
      // 2. CHECK IF BUYER EXISTS
      const checkRes = await fetch(
        `${API_BASE_URL}/api/buyer/auth/buyer-exist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: fullPhoneNumber }),
        }
      );

      const checkData = await checkRes.json();

      if (checkRes.status === 404 || checkData.exists === false) {
        // CASE A: NEW BUYER -> Redirect to Registration
        // Pass phone number so they don't type it again
        router.push({
          pathname: "/(buyer-auth)/register",
          params: { phone: fullPhoneNumber },
        });
      } else if (checkRes.ok && checkData.exists === true) {
        // CASE B: RETURNING BUYER -> Send OTP immediately
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
      // const res = { ok: true };
      const res = await fetch(`${API_BASE_URL}/api/buyer/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert(
          t("Welcome Back"),
          t("OTP sent to your registered number.")
        );
        router.push({
          pathname: "/(buyer-auth)/otp",
          params: { mobileNumber: phone, role: "buyer" },
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
        <Text style={styles.title}>{t("Buyer Login")}</Text>
        <Text style={styles.subtitle}>
          {t("Access the post-harvest marketplace")}
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
          title={t("Continue")}
          onPress={handleContinue}
          loading={loading}
          style={{ backgroundColor: "#E76F51" }}
        />
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
});
