// File: app/(buyer-tabs)/profile.js

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../src/components/common/Button";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

export default function BuyerProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLanguage = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(nextLanguage);
  };

  // The signOut function from AuthContext will handle the redirect
  const handleSignOut = () => {
    signOut();
  };

  return (
    <ScreenWrapper style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("Company Profile")}</Text>
      </View>

      {/* Floating Language Toggle */}
      <TouchableOpacity
        onPress={toggleLanguage}
        style={styles.langButton}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="translate" size={20} color="#2A9D8F" />
        <Text style={styles.langText}>{t("हिन्दी")}</Text>
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.container}>
          {/* Profile Info Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <MaterialCommunityIcons
                  name="briefcase-account"
                  size={40}
                  color="#E76F51"
                />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileOrgName}>
                  {user?.companyName || t("Buyer Company")}
                </Text>
                <Text style={styles.profileEmail}>
                  {user?.email || t("buyer@email.com")}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t("Contact Person:")}</Text>
              <Text style={styles.infoValue}>{user?.name || "N/A"}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>
                {t("Edit Company Details")}
              </Text>
              <MaterialCommunityIcons name="pencil" size={14} color="#E76F51" />
            </TouchableOpacity>
          </View>

          {/* Settings Section */}
          <Text style={styles.sectionTitle}>{t("Settings")}</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons
                name="shield-account"
                size={24}
                color="#457B9D"
              />
              <Text style={styles.menuItemText}>{t("Account & Security")}</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#CCC"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="bank" size={24} color="#2A9D8F" />
              <Text style={styles.menuItemText}>{t("Payment & Billing")}</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#CCC"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="bell" size={24} color="#F4A261" />
              <Text style={styles.menuItemText}>{t("Notifications")}</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#CCC"
              />
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <View style={styles.signOutContainer}>
            <Button
              title={t("Sign Out")}
              onPress={handleSignOut}
              style={{ backgroundColor: "#E76F51" }}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
  },
  container: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileOrgName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#264653",
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#264653",
    marginLeft: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E76F51",
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0E0",
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: "#264653",
  },
  signOutContainer: {
    marginTop: 16,
    marginBottom: 40,
  },
  langButton: {
    position: "absolute", // This is key to removing the separation
    top: 60, // Adjusts based on OS
    right: 15,
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
});
