import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL, BUYER_COLOR } from "../../secret";
import Button from "../../src/components/common/Button";
import Input from "../../src/components/common/Input";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";

export default function BuyerRegistrationScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams(); // Get phone from Login screen
  const [loading, setLoading] = useState(false);

  // use translation
  const { t } = useTranslation();

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");

  const handleRegister = async () => {
    // 1. Validation
    if (!companyName || !contactPerson || !email) {
      return Alert.alert(t("Missing Fields"), t("Please fill in all details."));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Alert.alert(
        t("Invalid Email"),
        t("Please enter a valid email address."),
      );
    }

    setLoading(true);

    try {
      // 2. Send OTP (Creates account in DB if not exists)
      const res = await fetch(`${API_BASE_URL}/api/buyer/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok) {
        // 3. Prepare Pending Profile Data
        const pendingProfile = JSON.stringify({
          companyName,
          contactPerson,
          email,
        });

        // 4. Navigate to OTP with profile data
        router.push({
          pathname: "/(buyer-auth)/otp",
          params: {
            mobileNumber: phone,
            role: "buyer",
            pendingProfile: pendingProfile,
          },
        });
      } else {
        Alert.alert(t("Error"), data.message || t("Registration failed."));
      }
    } catch (err) {
      console.error(err);
      Alert.alert(t("Network Error"), t("Could not connect to server."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={20} color="#264653" />
          </TouchableOpacity>

          <Text style={styles.title}>{t("New Buyer Profile")}</Text>
          <Text style={styles.subtitle}>
            {t("Registering for:")}{" "}
            <Text style={{ fontWeight: "bold" }}>{phone}</Text>
          </Text>

          {/* Organisation Details */}
          <Text style={styles.sectionTitle}>{t("Company Details")}</Text>
          <Input
            label={t("Company Name")}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder={t("e.g., Fresh Foods Inc.")}
          />

          {/* Contact Details */}
          <Text style={styles.sectionTitle}>{t("Contact Information")}</Text>
          <Input
            label={t("Contact Person Name")}
            value={contactPerson}
            onChangeText={setContactPerson}
            placeholder={t("e.g., Rohan Gupta")}
          />
          <Input
            label={t("Business Email")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder={t("e.g., procurement@freshfoods.com")}
            autoCapitalize="none"
          />

          <Button
            title={t("Send OTP & Verify")}
            onPress={handleRegister}
            loading={loading}
            color={BUYER_COLOR}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  backButton: {
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#264653",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: BUYER_COLOR,
    marginTop: 16,
    marginBottom: 12,
  },
});
