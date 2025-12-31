import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../secret";
import Button from "../src/components/common/Button";
import Input from "../src/components/common/Input";
// Assuming ScreenWrapper handles SafeArea, but if not, I added SafeAreaView below just in case
import { useAuth } from "../src/context/AuthContext";

export default function MakeOfferScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { requirementId, buyerId, cropName, targetPrice, unit } = params;

  const [loading, setLoading] = useState(false);
  const [pricePerUnit, setPricePerUnit] = useState(
    targetPrice?.toString() || ""
  );
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [availableDate, setAvailableDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || availableDate;
    if (Platform.OS === "android") setShowDatePicker(false);
    setAvailableDate(currentDate);
  };

  const handleSubmit = async () => {
    if (!pricePerUnit || !quantity) {
      return Alert.alert(
        "Missing Fields",
        "Please enter your price and quantity."
      );
    }
    setLoading(true);
    try {
      // Mocking the fetch for visual testing, replace with your actual fetch
      const res = await fetch(`${API_BASE_URL}/api/requirement-offers/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          requirementId,
          buyerId,
          pricePerUnit: parseFloat(pricePerUnit),
          quantity: parseFloat(quantity),
          availableDate,
          message,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "Offer sent successfully!");
        router.back();
      } else {
        Alert.alert("Error", data.message || "Failed");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <FontAwesome name="arrow-left" size={20} color="#1D3557" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Make an Offer</Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryLabel}>REQUEST FOR</Text>
                <Text style={styles.summaryTitle}>{cropName}</Text>
              </View>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="sprout"
                  size={24}
                  color="#2A9D8F"
                />
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.targetContainer}>
              <Text style={styles.targetLabel}>Buyer's Target:</Text>
              <Text style={styles.targetPrice}>
                ₹{targetPrice}/{unit}
              </Text>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionHeader}>Your Offer Details</Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Input
                  label={`Price (₹/${unit})`}
                  value={pricePerUnit}
                  onChangeText={setPricePerUnit}
                  keyboardType="numeric"
                  placeholder="0.00"
                  containerStyle={styles.inputContainer}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Input
                  label={`Quantity (${unit})`}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="00"
                  containerStyle={styles.inputContainer}
                />
              </View>
            </View>

            {/* Date Picker Custom UI */}
            <Text style={styles.customInputLabel}>Available Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.dateIconBg}>
                <MaterialCommunityIcons
                  name="calendar-month"
                  size={22}
                  color="#264653"
                />
              </View>
              <Text style={styles.dateText}>
                {availableDate.toDateString()}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color="#999"
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={availableDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            <Input
              label="Note to Buyer (Optional)"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
              placeholder="E.g. Crop harvested yesterday, premium quality..."
              style={{ height: 100, textAlignVertical: "top" }}
            />
          </View>

          <View style={styles.footerSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Button */}
      <View style={styles.footerContainer}>
        <Button
          title="Submit Offer"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
          textStyle={styles.submitButtonText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  safeArea: {
    backgroundColor: "#FFF",
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1D3557",
  },
  scrollContent: {
    padding: 20,
  },

  // Summary Card Styles
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1D3557",
  },
  iconContainer: {
    backgroundColor: "#E0F2F1",
    padding: 10,
    borderRadius: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 1,
  },
  targetContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF7ED", // Light orange bg
    padding: 12,
    borderRadius: 8,
  },
  targetLabel: {
    fontSize: 14,
    color: "#9A3412",
    fontWeight: "600",
  },
  targetPrice: {
    fontSize: 16,
    color: "#C2410C",
    fontWeight: "bold",
  },

  // Form Styles
  formSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },

  // Custom Date Picker
  customInputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 5,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 20,
  },
  dateIconBg: {
    marginRight: 12,
  },
  dateText: {
    flex: 1,
    color: "#111827",
    fontSize: 16,
    fontWeight: "500",
  },

  // Footer / Submit Button
  footerSpacer: {
    height: 100, // Space for sticky footer
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    elevation: 20, // High elevation for shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  submitButton: {
    backgroundColor: "#264653",
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: "#264653",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
