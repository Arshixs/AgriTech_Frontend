// File: app/(govt-auth)/complete-profile.js

import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
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
import { API_BASE_URL } from "../../secret";
import Button from "../../src/components/common/Button";
import Input from "../../src/components/common/Input";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";
import { uploadMultipleDocuments } from "../../src/utils/uploadUtils";

export default function CompleteProfileScreen() {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: user.phone,
    designation: "",
    homeAddress: "",
    maritalStatus: "N/A",
    accountNumber: "",
    IFSCCode: "",
  });

  const [documents, setDocuments] = useState({
    idProof: null,
    addressProof: null,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickDocument = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert(t("Error"), t("File size must be less than 5MB"));
          return;
        }

        setDocuments((prev) => ({
          ...prev,
          [type]: file,
        }));
        Alert.alert(t("Success"), t("Document selected successfully"));
      }
    } catch (error) {
      console.error("Document Picker Error:", error);
      Alert.alert(t("Error"), t("Failed to pick document"));
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email) {
      Alert.alert(t("Validation"), t("Please fill all required fields"));
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert(t("Validation"), t("Please enter a valid email address"));
      return;
    }

    if (!documents.idProof || !documents.addressProof) {
      Alert.alert(
        t("Validation"),
        t("Please upload ID Proof and Address Proof")
      );
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Upload documents to Firebase
      Alert.alert(
        t("Uploading"),
        t("Uploading documents to secure storage...")
      );

      const documentUrls = await uploadMultipleDocuments(
        documents,
        user.id || user.phone,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Submit profile with document URLs
      const response = await axios.post(
        `${API_BASE_URL}/api/govt/auth/complete-profile`,
        {
          ...formData,
          documents: documentUrls,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      Alert.alert(
        t("Success"),
        t(
          "Profile submitted for verification. You will be notified once approved."
        )
      );

      // Update user context
      if (setUser) {
        setUser((prev) => ({
          ...prev,
          profileComplete: true,
          verificationStatus: "pending",
        }));
      }

      router.replace("verification-pending");
    } catch (error) {
      console.error("Complete Profile Error:", error);
      Alert.alert(
        t("Error"),
        error.response?.data?.message ||
          error.message ||
          t("Failed to complete profile")
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="account-edit"
            size={60}
            color="#606C38"
          />
          <Text style={styles.title}>{t("Complete Your Profile")}</Text>
          <Text style={styles.subtitle}>
            {t("Please provide your details and upload required documents")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("Personal Information")}</Text>

          <Input
            label={`${t("Full Name")} *`}
            value={formData.name}
            onChangeText={(val) => updateField("name", val)}
            placeholder={t("Enter your full name")}
          />

          <Input
            label={`${t("Email Address")} *`}
            value={formData.email}
            onChangeText={(val) => updateField("email", val)}
            placeholder={t("Enter your email")}
            keyboardType="email-address"
          />

          <Input
            label={`${t("Designation")} *`}
            value={formData.designation}
            onChangeText={(val) => updateField("designation", val)}
            placeholder={t("Enter your designation")}
          />

          <Input
            label={t("Home Address")}
            value={formData.homeAddress}
            onChangeText={(val) => updateField("homeAddress", val)}
            placeholder={t("Enter your address")}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t("Marital Status")}</Text>
            <View style={styles.radioGroup}>
              {["single", "married", "divorced", "widowed"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.radioOption}
                  onPress={() => updateField("maritalStatus", status)}
                >
                  <MaterialCommunityIcons
                    name={
                      formData.maritalStatus === status
                        ? "radiobox-marked"
                        : "radiobox-blank"
                    }
                    size={24}
                    color="#606C38"
                  />
                  <Text style={styles.radioLabel}>
                    {t(status.charAt(0).toUpperCase() + status.slice(1))}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("Bank Details")}</Text>

          <Input
            label={t("Account Number")}
            value={formData.accountNumber}
            onChangeText={(val) => updateField("accountNumber", val)}
            placeholder={t("Enter account number")}
            keyboardType="number-pad"
          />

          <Input
            label={t("IFSC Code")}
            value={formData.IFSCCode}
            onChangeText={(val) => updateField("IFSCCode", val.toUpperCase())}
            placeholder={t("Enter IFSC code")}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("Required Documents")}</Text>
          <Text style={styles.documentNote}>
            {t(
              "Please upload clear PDF copies of the following documents (Max 5MB each)"
            )}
          </Text>

          <DocumentUploadButton
            label={`${t("ID Proof")} *`}
            document={documents.idProof}
            onPress={() => pickDocument("idProof")}
            t={t}
          />

          <DocumentUploadButton
            label={`${t("Address Proof")} *`}
            document={documents.addressProof}
            onPress={() => pickDocument("addressProof")}
            t={t}
          />
        </View>

        {loading && uploadProgress > 0 && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {t("Uploading documents")}: {uploadProgress}%
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${uploadProgress}%` }]}
              />
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? t("Submitting...") : t("Submit for Verification")}
            onPress={handleSubmit}
            loading={loading}
            style={{ backgroundColor: "#606C38" }}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t("Your profile will be reviewed by an administrator")}
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

function DocumentUploadButton({ label, document, onPress, t }) {
  return (
    <View style={styles.documentUpload}>
      <Text style={styles.documentLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.uploadButton, document && styles.uploadButtonSuccess]}
        onPress={onPress}
      >
        <MaterialCommunityIcons
          name={document ? "check-circle" : "upload"}
          size={24}
          color={document ? "#2A9D8F" : "#606C38"}
        />
        <Text style={[styles.uploadText, document && styles.uploadTextSuccess]}>
          {document ? document.name : t("Choose File")}
        </Text>
      </TouchableOpacity>
      {document && (
        <Text style={styles.fileSizeText}>
          {(document.size / 1024).toFixed(2)} KB
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 14,
    color: "#333",
    marginLeft: 6,
  },
  documentNote: {
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
    fontStyle: "italic",
  },
  documentUpload: {
    marginBottom: 16,
  },
  documentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2E6",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  uploadButtonSuccess: {
    backgroundColor: "#E8F5F3",
    borderColor: "#2A9D8F",
    borderStyle: "solid",
  },
  uploadText: {
    fontSize: 14,
    color: "#606C38",
    marginLeft: 12,
    flex: 1,
  },
  uploadTextSuccess: {
    color: "#2A9D8F",
  },
  fileSizeText: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    marginLeft: 4,
  },
  progressContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: "#F0F2E6",
    borderRadius: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#606C38",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#606C38",
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
