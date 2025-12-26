import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, Text, View } from "react-native";
import { API_BASE_URL } from "../../secret";
import Button from "../../src/components/common/Button";
import Input from "../../src/components/common/Input";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

export default function BuyerOTPScreen() {
  const router = useRouter();
  const { mobileNumber, pendingProfile } = useLocalSearchParams();
  const { signInBuyer } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      return Alert.alert(
        t("Invalid OTP"),
        t("Please enter a valid 6-digit code.")
      );
    }
    setLoading(true);
    console.log(mobileNumber);

    try {
      const verifyRes = await fetch(
        `${API_BASE_URL}/api/buyer/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: `${mobileNumber}`,
            otp: otp,
          }),
        }
      );

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.message || t("Verification failed"));
      }

      // 2. Token & Buyer Data received
      const { token, buyer } = verifyData;
      let finalBuyerData = { ...buyer, token };

      // 3. Check if there is a Pending Profile (New Registration)
      if (pendingProfile) {
        const profileData = JSON.parse(pendingProfile);

        // Update Profile on Backend
        const updateRes = await fetch(
          `${API_BASE_URL}/api/buyer/auth/update-profile`,
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
          // Update our local buyer object with the new profile info
          finalBuyerData = { ...finalBuyerData, ...updateData.buyer };
        }
      }

      await signInBuyer(finalBuyerData);
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
        <Text style={styles.title}>{t("Verify OTP")}</Text>
        <Text style={styles.subtitle}>
          {t("Enter the 6-digit OTP sent to") + ` ${mobileNumber}`}
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
