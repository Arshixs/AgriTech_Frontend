// File: app/(govt-auth)/verification-pending.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import Button from "../../src/components/common/Button";
import { useAuth } from "../../src/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../secret";
import axios from "axios";

export default function VerificationPendingScreen() {
  const { user, signOut, setUser } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const checkVerificationStatus = async () => {
    setCheckingStatus(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/govt/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const employee = response.data.employee;

      if (employee.verificationStatus === "verified") {
        Alert.alert(
          t("Verified"),
          t("Your profile has been verified! You can now access the portal."),
          [
            {
              text: "OK",
              onPress: () => {
                if (setUser) {
                  setUser((prev) => ({
                    ...prev,
                    verificationStatus: "verified",
                  }));
                }
                router.replace("/(govt-tabs)");
              },
            },
          ]
        );
      } else if (employee.verificationStatus === "rejected") {
        Alert.alert(
          t("Rejected"),
          employee.rejectionReason ||
            t("Your profile verification was rejected"),
          [
            {
              text: "OK",
              onPress: () => signOut(),
            },
          ]
        );
      } else {
        Alert.alert(
          t("Pending"),
          t("Your verification is still pending. Please check back later.")
        );
      }
    } catch (error) {
      console.error("Check Status Error:", error);
      Alert.alert(t("Error"), t("Failed to check verification status"));
    } finally {
      setCheckingStatus(false);
    }
  };

  const getStatusInfo = () => {
    if (user?.verificationStatus === "rejected") {
      return {
        icon: "close-circle",
        iconColor: "#E76F51",
        title: t("Verification Rejected"),
        message:
          user?.rejectionReason ||
          t(
            "Your profile verification was rejected. Please contact administration."
          ),
        showSignOut: true,
      };
    }

    return {
      icon: "clock-outline",
      iconColor: "#F4A261",
      title: t("Verification Pending"),
      message: t(
        "Your profile has been submitted and is currently under review by our administration team. You will be notified once the verification is complete."
      ),
      showSignOut: false,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={statusInfo.icon}
              size={100}
              color={statusInfo.iconColor}
            />
          </View>

          <Text style={styles.title}>{statusInfo.title}</Text>
          <Text style={styles.message}>{statusInfo.message}</Text>

          <View style={styles.infoBox}>
            <MaterialCommunityIcons
              name="information-outline"
              size={24}
              color="#606C38"
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{t("What happens next?")}</Text>
              <Text style={styles.infoText}>
                {t("Our team will review your documents and information")}
              </Text>
              <Text style={styles.infoText}>
                {t("This process typically takes 1-2 business days")}
              </Text>
              <Text style={styles.infoText}>
                {t("You will receive a notification once verified")}
              </Text>
            </View>
          </View>

          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("Submitted By")}:</Text>
              <Text style={styles.detailValue}>{user?.name || t("You")}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("Phone")}:</Text>
              <Text style={styles.detailValue}>{user?.phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("Status")}:</Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color:
                      user?.verificationStatus === "rejected"
                        ? "#E76F51"
                        : "#F4A261",
                  },
                ]}
              >
                {user?.verificationStatus === "rejected"
                  ? t("Rejected")
                  : t("Pending Review")}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={
                checkingStatus
                  ? t("Checking...")
                  : t("Check Verification Status")
              }
              onPress={checkVerificationStatus}
              loading={checkingStatus}
              style={{ backgroundColor: "#606C38", marginBottom: 12 }}
            />

            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
              <Text style={styles.signOutText}>{t("Sign Out")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactBox}>
            <Text style={styles.contactText}>
              {t("Need help? Contact administration at:")}
            </Text>
            <Text style={styles.contactEmail}>support@agriportal.gov.in</Text>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F0F2E6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#606C38",
    marginBottom: 4,
    lineHeight: 20,
  },
  detailsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    color: "#264653",
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 20,
  },
  signOutButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E76F51",
  },
  contactBox: {
    marginTop: 32,
    alignItems: "center",
  },
  contactText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    color: "#606C38",
    fontWeight: "600",
  },
});
