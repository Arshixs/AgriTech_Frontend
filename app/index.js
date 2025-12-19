import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLanguage = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(nextLanguage);
  };

  return (
    <ScreenWrapper>
      {/* Floating Language Toggle - Now Absolute Positioned */}
      <TouchableOpacity 
        onPress={toggleLanguage} 
        style={styles.langButton}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="translate" size={20} color="#2A9D8F" />
        <Text style={styles.langText}>{t("index.language_toggle")}</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.title}>{t("index.welcome")}</Text>
        <Text style={styles.subtitle}>{t("index.select_role")}</Text>

        {/* Farmer Button */}
        <TouchableOpacity
          style={[styles.roleButton, { backgroundColor: "#2A9D8F" }]}
          onPress={() => router.push("/(auth)/login")}
        >
          <MaterialCommunityIcons name="barley" size={40} color="#FFFFFF" />
          <Text style={styles.buttonText}>{t("index.farmer")}</Text>
        </TouchableOpacity>

        {/* Vendor Button */}
        <TouchableOpacity
          style={[styles.roleButton, { backgroundColor: "#457B9D" }]}
          onPress={() => router.push("/(vendor-auth)/login")}
        >
          <MaterialCommunityIcons name="store" size={40} color="#FFFFFF" />
          <Text style={styles.buttonText}>{t("index.vendor")}</Text>
        </TouchableOpacity>

        {/* Buyer Button */}
        <TouchableOpacity
          style={[styles.roleButton, { backgroundColor: "#E76F51" }]}
          onPress={() => router.push("/(buyer-auth)/login")}
        >
          <MaterialCommunityIcons name="briefcase-account" size={40} color="#FFFFFF" />
          <Text style={styles.buttonText}>{t("index.buyer")}</Text>
        </TouchableOpacity>

        {/* Govt BUTTON */}
        <TouchableOpacity
          style={[styles.roleButton, { backgroundColor: "#606C38" }]}
          onPress={() => router.push("/(govt-auth)/login")}
        >
          <MaterialCommunityIcons name="bank" size={40} color="#FFFFFF" />
          <Text style={styles.buttonText}>{t("index.govt")}</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  langButton: {
    position: 'absolute', // This is key to removing the separation
    top:40, // Adjusts based on OS
    right: 20,
    zIndex: 10, // Ensures it stays above all other content
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#2A9D8F",
    // Stronger elevation for a clean floating look
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  langText: {
    color: "#2A9D8F",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  roleButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 16,
  },
});