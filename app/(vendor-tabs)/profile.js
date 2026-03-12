import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
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
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
import Button from "../../src/components/common/Button";
import LanguageDropdown from "../../src/components/common/LanguageDropdown";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";
import { VENDOR_COLOR } from "../../constants";

export default function VendorProfileScreen() {
  const { user, signOut, setUser } = useAuth(); // Extracted setUser for optimistic updates
  const router = useRouter();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state tracking the fields expected by the backend
  const [formData, setFormData] = useState({
    name: user?.name || "",
    organizationName: user?.organizationName || "",
    gstNumber: user?.gstNumber || "",
    address: user?.address || "",
  });
  const [errors, setErrors] = useState({});

  const handleSignOut = () => {
    signOut();
  };

  const openEditModal = () => {
    setFormData({
      name: user?.name || "",
      organizationName: user?.organizationName || "",
      gstNumber: user?.gstNumber || "",
      address: user?.address || "",
    });
    setErrors({});
    setModalVisible(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t("Name is required");
    if (!formData.organizationName.trim())
      newErrors.organizationName = t("Organization name is required");
    if (!formData.gstNumber.trim())
      newErrors.gstNumber = t("GST number is required");
    if (!formData.address.trim()) newErrors.address = t("Address is required");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      organizationName: formData.organizationName.trim(),
      gstNumber: formData.gstNumber.trim(),
      address: formData.address.trim(),
    };

    const tempUser = user;

    // Optimistic UI update
    if (setUser) {
      setUser((prev) => ({
        ...prev,
        ...payload,
      }));
    }

    try {
      // Adjust the endpoint URL to match your exact vendor routes
      const response = await fetch(
        `${API_BASE_URL}/api/vendor/auth/update-profile`,
        {
          method: "POST", // Change to PUT/PATCH if your Express router defines it that way
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setUser(tempUser); // Revert UI if API fails
        throw new Error(data?.message || t("Failed to update profile"));
      }

      setModalVisible(false);
      Alert.alert(t("Success"), t("Profile updated successfully"));
    } catch (error) {
      setUser(tempUser); // Revert UI if API fails
      Alert.alert(t("Error"), error.message || t("Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper style={styles.wrapper}>
      <LanguageDropdown />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("Profile & Settings")}</Text>
        </View>

        <View style={styles.container}>
          {/* Profile Info Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <FontAwesome name="user-circle" size={50} color="#457B9D" />
              <View style={styles.profileInfo}>
                <Text style={styles.profileorganizationName}>
                  {user?.organizationName || t("Vendor Organisation")}
                </Text>
                <Text style={styles.profileName}>
                  {user?.name || t("Vendor Name")}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t("GST Number:")}</Text>
              <Text style={styles.infoValue}>
                {user?.gstNumber || t("N/A")}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t("Address")}:</Text>
              <Text style={styles.infoValue}>{user?.address || t("N/A")}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
              <Text style={styles.editButtonText}>{t("Edit Profile")}</Text>
              <MaterialCommunityIcons
                name="pencil"
                size={14}
                color={VENDOR_COLOR}
              />
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
          </View>

          {/* Sign Out */}
          <View style={styles.signOutContainer}>
            <Button
              title={t("Sign Out")}
              onPress={handleSignOut}
              color={VENDOR_COLOR}
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("Edit Profile")}</Text>
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
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("Vendor Name")}</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.name && styles.inputError,
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
                    value={formData.name}
                    onChangeText={(val) => {
                      setFormData((p) => ({ ...p, name: val }));
                      if (errors.name) setErrors((e) => ({ ...e, name: null }));
                    }}
                    placeholder={t("Enter vendor name")}
                    placeholderTextColor="#BBB"
                    editable={!loading}
                  />
                </View>
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}
              </View>

              {/* Organization Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("Organization Name")}</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.organizationName && styles.inputError,
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
                    value={formData.organizationName}
                    onChangeText={(val) => {
                      setFormData((p) => ({ ...p, organizationName: val }));
                      if (errors.organizationName)
                        setErrors((e) => ({ ...e, organizationName: null }));
                    }}
                    placeholder={t("Enter organization name")}
                    placeholderTextColor="#BBB"
                    editable={!loading}
                  />
                </View>
                {errors.organizationName ? (
                  <Text style={styles.errorText}>
                    {errors.organizationName}
                  </Text>
                ) : null}
              </View>

              {/* GST Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("GST Number")}</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.gstNumber && styles.inputError,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={18}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={formData.gstNumber}
                    onChangeText={(val) => {
                      setFormData((p) => ({ ...p, gstNumber: val }));
                      if (errors.gstNumber)
                        setErrors((e) => ({ ...e, gstNumber: null }));
                    }}
                    placeholder={t("Enter GST number")}
                    placeholderTextColor="#BBB"
                    autoCapitalize="characters"
                    editable={!loading}
                  />
                </View>
                {errors.gstNumber ? (
                  <Text style={styles.errorText}>{errors.gstNumber}</Text>
                ) : null}
              </View>

              {/* Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("Address")}</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.address && styles.inputError,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={18}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={formData.address}
                    onChangeText={(val) => {
                      setFormData((p) => ({ ...p, address: val }));
                      if (errors.address)
                        setErrors((e) => ({ ...e, address: null }));
                    }}
                    placeholder={t("Enter address")}
                    placeholderTextColor="#BBB"
                    editable={!loading}
                  />
                </View>
                {errors.address ? (
                  <Text style={styles.errorText}>{errors.address}</Text>
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
                  style={[
                    styles.saveBtn,
                    { backgroundColor: VENDOR_COLOR },
                    loading && styles.disabledBtn,
                  ]}
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
    width: 90,
  },
  infoValue: {
    flex: 1,
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
    color: VENDOR_COLOR,
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

  /* --- MODAL STYLES --- */
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
