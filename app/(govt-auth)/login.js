import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, TouchableOpacity, View, Text } from "react-native";
import { API_BASE_URL, GOVERNMENT_COLOR } from "../../secret";
import Button from "../../src/components/common/Button";
import Input from "../../src/components/common/Input";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { styles } from "../../src/styles/auth/LoginScreenStyles";

export default function GovtLoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      return Alert.alert(
        t("Invalid Input"),
        t("Enter a valid 10-digit number.")
      );
    }

    setLoading(true);
    const fullPhoneNumber = `+91${phone}`;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/govt/auth/send-otp`,
        { phone: fullPhoneNumber }
      );

      Alert.alert(t("Success"), response.data.message);
      router.push({
        pathname: "/(govt-auth)/otp",
        params: { mobileNumber: fullPhoneNumber, role: "govt" },
      });
    } catch (err) {
      console.error(err);
      Alert.alert(
        t("Error"),
        err.response?.data?.message || t("Failed to send OTP")
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
        t("Please type the mobile number using English digits (0–9) only.")
      );
    }
    setPhone(filtered);
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
          <MaterialCommunityIcons name="bank" size={60} color={GOVERNMENT_COLOR} />
        </View>

        <Text style={styles.titleCentered}>{t("Government Portal")}</Text>
        <Text style={styles.subtitleCentered}>{t("Authorized Personnel Only")}</Text>

        <Input
          label={t("Mobile Number")}
          value={phone}
          onChangeText={handleNumberEnter}
          placeholder={t("e.g., 9876543210")}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Button
          title={t("Send OTP")}
          onPress={handleSendOtp}
          loading={loading}
          color={GOVERNMENT_COLOR}
        />
      </View>
    </ScreenWrapper>
  );
}