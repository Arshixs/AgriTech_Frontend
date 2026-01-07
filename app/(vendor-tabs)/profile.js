import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// 1. Add Import
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

export default function VendorProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  // 2. Initialize Hook
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLanguage = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(nextLanguage);
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <ScreenWrapper style={styles.wrapper}>
      <ScrollView>
        <View style={styles.header}>
          {/* 3. Wrap Static Strings */}
          <Text style={styles.headerTitle}>{t("Profile & Settings")}</Text>
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

        <View style={styles.container}>
          {/* Profile Info Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <FontAwesome name="user-circle" size={50} color="#457B9D" />
              <View style={styles.profileInfo}>
                <Text style={styles.profileorganizationName}>
                  {/* Translate fallback text */}
                  {user?.organizationName || t("Vendor Organisation")}
                </Text>
                <Text style={styles.profileName}>
                  {user?.name || t("Vendor Name")}
                </Text>
              </View>
            </View>
            <View style={styles.gstInfo}>
              <Text style={styles.gstLabel}>{t("GST Number:")}</Text>
              <Text style={styles.gstValue}>{user?.gstNumber || t("N/A")}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>{t("Edit Profile")}</Text>
              <MaterialCommunityIcons name="pencil" size={14} color="#2A9D8F" />
            </TouchableOpacity>
          </View>

          {/* Finance Tools Section */}
          <Text style={styles.sectionTitle}>{t("Finance Tools")}</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/transaction-history")}
            >
              <MaterialCommunityIcons
                name="receipt"
                size={24}
                color="#2A9D8F"
              />
              <Text style={styles.menuItemText}>
                {t("Track Transactions & Payments")}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#CCC"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/expense-tracker")}
            >
              <MaterialCommunityIcons
                name="chart-bar-stacked"
                size={24}
                color="#F4A261"
              />
              <Text style={styles.menuItemText}>{t("Expense Tracking")}</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#CCC"
              />
            </TouchableOpacity>

            {/* Commented out sections left as-is, remember to add t() if you uncomment them */}
            {/* <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/expense-calculator")}
            >
              <MaterialCommunityIcons
                name="calculator-variant"
                size={24}
                color="#E76F51"
              />
              <Text style={styles.menuItemText}>Expense Calculator</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#CCC"
              />
            </TouchableOpacity> */}
          </View>

          {/* Settings Section - Commented Out */}
          {/* <Text style={styles.sectionTitle}>Settings</Text> */}
          {/* ... */}

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
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileorganizationName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#264653",
  },
  profileName: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  gstInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  gstLabel: {
    fontSize: 14,
    color: "#666",
  },
  gstValue: {
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
    color: "#2A9D8F",
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
    borderBottomColor: "#F0F0F0",
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
    top: 20, // Adjusts based on OS
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
