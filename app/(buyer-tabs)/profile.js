import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../../secret"; // adjust path as needed
import Button from "../../src/components/common/Button";
import LanguageDropdown from "../../src/components/common/LanguageDropdown";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

export default function BuyerProfileScreen() {
  const { user, signOut, setUser } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Swapped gstNumber for email to match backend
  const [formData, setFormData] = useState({
    companyName: user?.companyName || "",
    contactPerson: user?.contactPerson || "",
    email: user?.email || "",
  });
  const [errors, setErrors] = useState({});

  const handleSignOut = () => {
    signOut();
  };

  const openEditModal = () => {
    setFormData({
      companyName: user?.companyName || "",
      contactPerson: user?.contactPerson || "",
      email: user?.email || "",
    });
    setErrors({});
    setModalVisible(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName.trim())
      newErrors.companyName = t("Organization name is required");
    if (!formData.contactPerson.trim())
      newErrors.contactPerson = t("Contact person name is required");

    // Simple email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!formData.email.trim()) {
      newErrors.email = t("Email is required");
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = t("Please enter a valid email");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    setLoading(true);

    // Store current user state to revert if API fails
    const tempUser = user;

    const payload = {
      companyName: formData.companyName.trim(),
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim(),
    };

    // Optimistic UI update
    if (setUser) {
      setUser((prev) => ({
        ...prev,
        ...payload,
      }));
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/buyer/auth/update-profile`,
        {
          method: "POST", // Ensure this matches your route (often PUT or PATCH for updates)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          // 2. Send only the fields the backend expects
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setUser(tempUser); // Revert optimistic update
        throw new Error(data?.message || t("Failed to update profile"));
      }

      setModalVisible(false);
      Alert.alert(t("Success"), t("Profile updated successfully"));
    } catch (error) {
      setUser(tempUser); // Revert optimistic update
      Alert.alert(t("Error"), error.message || t("Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("Company Profile")}</Text>
      </View>

      {/* Floating Language Toggle */}
      <LanguageDropdown />

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
              <Text style={styles.infoValue}>
                {user?.contactPerson || "N/A"}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
              <Text style={styles.editButtonText}>
                {t("Edit Company Details")}
              </Text>
              <MaterialCommunityIcons name="pencil" size={14} color="#E76F51" />
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

      {/* Edit Profile Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("Edit Company Details")}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
                disabled={loading}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#264653"
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Organization Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("Organization Name")}</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.companyName && styles.inputError,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="office-building"
                    size={18}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={formData.companyName}
                    onChangeText={(val) => {
                      setFormData((p) => ({ ...p, companyName: val }));
                      if (errors.companyName)
                        setErrors((e) => ({ ...e, companyName: null }));
                    }}
                    placeholder={t("Enter organization name")}
                    placeholderTextColor="#BBB"
                    editable={!loading}
                  />
                </View>
                {errors.companyName ? (
                  <Text style={styles.errorText}>{errors.companyName}</Text>
                ) : null}
              </View>

              {/* Contact Person */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("Contact Person")}</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    // 3. Fixed error mapping (was previously errors.name)
                    errors.contactPerson && styles.inputError,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="account"
                    size={18}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={formData.contactPerson}
                    onChangeText={(val) => {
                      setFormData((p) => ({ ...p, contactPerson: val }));
                      if (errors.contactPerson)
                        setErrors((e) => ({ ...e, contactPerson: null }));
                    }}
                    placeholder={t("Enter contact person name")}
                    placeholderTextColor="#BBB"
                    editable={!loading}
                  />
                </View>
                {errors.contactPerson ? (
                  <Text style={styles.errorText}>{errors.contactPerson}</Text>
                ) : null}
              </View>

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("Email Address")}</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.email && styles.inputError,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={18}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={formData.email}
                    onChangeText={(val) => {
                      setFormData((p) => ({ ...p, email: val }));
                      if (errors.email)
                        setErrors((e) => ({ ...e, email: null }));
                    }}
                    placeholder={t("Enter email address")}
                    placeholderTextColor="#BBB"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, loading && styles.disabledBtn]}
                  onPress={() => setModalVisible(false)}
                  disabled={loading}
                >
                  <Text style={styles.cancelBtnText}>{t("Cancel")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, loading && styles.disabledBtn]}
                  onPress={handleUpdate}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>{t("Save Changes")}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  signOutContainer: {
    marginTop: 16,
    marginBottom: 40,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
  },
  closeButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: "#E76F51",
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: "#264653",
  },
  errorText: {
    fontSize: 12,
    color: "#E76F51",
    marginTop: 5,
    marginLeft: 4,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#E76F51",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
