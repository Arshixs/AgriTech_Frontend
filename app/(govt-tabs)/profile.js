import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import Button from "../../src/components/common/Button";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../secret";
const API_BASE = API_BASE_URL;

export default function GovtProfileScreen() {
  const { user, signOut, setUser } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const [localUser, setLocalUser] = useState(user || {});
  const [editVisible, setEditVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const token =
        user?.accessToken || user?.token || user?.access || user?.jwt;

      if (!token) {
        Alert.alert(t("Error"), t("No authentication token found"));
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/govt/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || t("Failed to fetch profile"));
      }

      const profileData = data?.employee || data?.user || {};
      setLocalUser(profileData);

      if (typeof setUser === "function") {
        setUser((prev) => ({ ...prev, ...profileData }));
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      Alert.alert(t("Error"), t("Unable to load profile Please try again"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSignOut = () => {
    signOut();
  };

  const openEdit = () => {
    setEditVisible(true);
  };

  const closeEdit = () => {
    setEditVisible(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  if (loading) {
    return (
      <ScreenWrapper style={styles.wrapper}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#606C38" />
          <Text style={styles.loadingText}>{t("Loading profile")}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("Profile and Settings")}</Text>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
          <MaterialCommunityIcons
            name="refresh"
            size={24}
            color={refreshing ? "#ccc" : "#606C38"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.container}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <MaterialCommunityIcons name="bank" size={40} color="#606C38" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {localUser?.name || t("Government Officer")}
                </Text>
                <Text style={styles.profileEmail}>
                  {localUser?.email || localUser?.phone || t("Not Available")}
                </Text>
              </View>
            </View>

            <View style={styles.details}>
              {localUser?.employeeId && (
                <DetailRow
                  label={t("Employee ID")}
                  value={localUser.employeeId}
                  t={t}
                />
              )}
              <DetailRow
                label={t("Department")}
                value={localUser?.department || t("Not Available")}
                t={t}
              />
              <DetailRow
                label={t("Designation")}
                value={localUser?.designation || t("MSP Compliance")}
                t={t}
              />
              <DetailRow
                label={t("Phone")}
                value={localUser?.phone || t("Not Available")}
                t={t}
              />
              {localUser?.homeAddress && (
                <DetailRow
                  label={t("Home Address")}
                  value={localUser.homeAddress}
                  t={t}
                />
              )}
              {localUser?.maritalStatus && (
                <DetailRow
                  label={t("Marital Status")}
                  value={localUser.maritalStatus}
                  t={t}
                />
              )}
              {localUser?.accountNumber && (
                <DetailRow
                  label={t("Account Number")}
                  value={localUser.accountNumber}
                  t={t}
                />
              )}
              {localUser?.IFSCCode && (
                <DetailRow
                  label={t("IFSC Code")}
                  value={localUser.IFSCCode}
                  t={t}
                />
              )}
            </View>

            <TouchableOpacity style={styles.editButton} onPress={openEdit}>
              <Text style={styles.editButtonText}>{t("Edit Profile")}</Text>
              <MaterialCommunityIcons name="pencil" size={14} color="#606C38" />
            </TouchableOpacity>
          </View>

          <View style={styles.signOutContainer}>
            <Button
              title={t("Sign Out")}
              onPress={handleSignOut}
              style={{ backgroundColor: "#E76F51" }}
            />
          </View>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={editVisible}
        onClose={closeEdit}
        user={localUser}
        onSaved={(updated) => {
          setLocalUser((prev) => ({ ...prev, ...updated }));
          if (typeof setUser === "function") {
            setUser((prev) => ({ ...prev, ...updated }));
          }
          fetchProfile();
        }}
      />
    </ScreenWrapper>
  );
}

function DetailRow({ label, value, t }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function EditProfileModal({ visible, onClose, user, onSaved }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const { user: authUser } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      homeAddress: user?.homeAddress || "",
      maritalStatus: user?.maritalStatus || "",
      accountNumber: user?.accountNumber || "",
      IFSCCode: user?.IFSCCode || "",
      employeeId: user?.employeeId || "",
    });
  }, [user, visible]);

  const updateField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    if (!form.name) {
      Alert.alert(t("Validation"), t("Name is required"));
      return;
    }

    if (form.email && form.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        Alert.alert(t("Validation"), t("Please enter a valid email address"));
        return;
      }
    }

    setLoading(true);
    try {
      const token =
        authUser?.accessToken ||
        authUser?.token ||
        authUser?.access ||
        authUser?.jwt;

      if (!token) {
        Alert.alert(t("Error"), t("Authentication token not found"));
        setLoading(false);
        return;
      }

      const payload = {};
      Object.keys(form).forEach((key) => {
        if (form[key] && form[key].toString().trim() !== "") {
          payload[key] = form[key].toString().trim();
        }
      });

      const resp = await fetch(`${API_BASE}/api/govt/auth/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!resp.ok) {
        const msg = data?.message || t("Failed to update profile");
        Alert.alert(t("Update Failed"), msg);
        setLoading(false);
        return;
      }

      const updated = data?.employee || data?.user || payload;
      Alert.alert(t("Success"), t("Profile updated successfully"));
      onSaved(updated);
      onClose();
    } catch (err) {
      console.error("EditProfileModal save error", err);
      Alert.alert(
        t("Error"),
        t("Unable to update profile Please check your connection and try again")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("Edit Profile")}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoBanner}>
              <MaterialCommunityIcons
                name="information"
                size={16}
                color="#606C38"
              />
              <Text style={styles.infoBannerText}>
                {t("Department and Designation are managed by administration")}
              </Text>
            </View>

            <LabelInput
              label={t("Full Name")}
              value={form.name}
              onChangeText={(v) => updateField("name", v)}
              placeholder={t("Enter your full name")}
              t={t}
            />
            <LabelInput
              label={t("Email")}
              value={form.email}
              onChangeText={(v) => updateField("email", v)}
              keyboardType="email-address"
              placeholder={t("Enter email address")}
              autoCapitalize="none"
              t={t}
            />
            <LabelInput
              label={t("Phone")}
              value={form.phone}
              onChangeText={(v) => updateField("phone", v)}
              keyboardType="phone-pad"
              placeholder={t("Enter phone number")}
              editable={false}
              t={t}
            />
            <LabelInput
              label={t("Home Address")}
              value={form.homeAddress}
              onChangeText={(v) => updateField("homeAddress", v)}
              multiline
              placeholder={t("Enter your home address")}
              t={t}
            />
            <LabelInput
              label={t("Marital Status")}
              value={form.maritalStatus}
              onChangeText={(v) => updateField("maritalStatus", v)}
              placeholder={t("Enter marital status")}
              t={t}
            />
            <LabelInput
              label={t("Account Number")}
              value={form.accountNumber}
              onChangeText={(v) => updateField("accountNumber", v)}
              keyboardType="number-pad"
              placeholder={t("Enter bank account number")}
              t={t}
            />
            <LabelInput
              label={t("IFSC Code")}
              value={form.IFSCCode}
              onChangeText={(v) => updateField("IFSCCode", v)}
              placeholder={t("Enter IFSC code")}
              autoCapitalize="characters"
              t={t}
            />

            <View style={styles.buttonContainer}>
              <Button
                title={loading ? t("Saving") : t("Save Changes")}
                onPress={handleSave}
                disabled={loading}
                style={styles.saveButton}
              />
            </View>

            {loading && (
              <ActivityIndicator style={{ marginTop: 12 }} color="#606C38" />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function LabelInput({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  multiline = false,
  placeholder = "",
  autoCapitalize = "sentences",
  editable = true,
  t,
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          !editable && styles.inputDisabled,
        ]}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor="#999"
        autoCapitalize={autoCapitalize}
        editable={editable}
      />
    </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
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
    backgroundColor: "#F0F2E6",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#264653",
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  details: {
    marginTop: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    width: 140,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#264653",
    marginLeft: 8,
    flex: 1,
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
    color: "#606C38",
    marginRight: 6,
  },
  signOutContainer: {
    marginTop: 16,
    marginBottom: 40,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#264653",
  },
  closeButton: {
    padding: 4,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2E6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoBannerText: {
    fontSize: 12,
    color: "#606C38",
    marginLeft: 8,
    flex: 1,
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
  input: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FAFAFA",
    fontSize: 15,
    color: "#264653",
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputDisabled: {
    backgroundColor: "#F0F0F0",
    color: "#999",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E0E0E0",
  },
  saveButton: {
    flex: 1,
  },
});
