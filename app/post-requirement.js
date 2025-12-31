import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../secret";
import Button from "../src/components/common/Button";
import Input from "../src/components/common/Input";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import { useAuth } from "../src/context/AuthContext";

const CATEGORIES = [
  "crops",
  "grains",
  "vegetables",
  "fruits",
  "flowers",
  "spices",
];

const GRADES = ["Any", "A", "B", "C", "Export", "Organic"];

export default function PostRequirementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  // --- Form State ---
  const [cropName, setCropName] = useState(""); // Changed from title
  const [variety, setVariety] = useState("");
  const [category, setCategory] = useState("crops");

  // Contract Specifics
  const [contractType, setContractType] = useState("pre_harvest_contract"); // Default
  const [requiredByDate, setRequiredByDate] = useState(""); // Format: YYYY-MM-DD

  // Qty & Price
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("ton");
  const [targetPrice, setTargetPrice] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(true);

  // Quality & Logistics
  const [qualityGrade, setQualityGrade] = useState("Any");
  const [logisticsType, setLogisticsType] = useState("buyer_pick_up");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    // Basic Validation
    if (!cropName || !quantity || !targetPrice || !requiredByDate) {
      return Alert.alert(
        t("Missing Fields"),
        t("Please fill Crop Name, Quantity, Price and Date.")
      );
    }

    // Date Validation (Simple Regex YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(requiredByDate)) {
      return Alert.alert(t("Invalid Date"), t("Please use YYYY-MM-DD format"));
    }

    setLoading(true);

    try {
      const payload = {
        cropName,
        category,
        variety,
        quantity: parseFloat(quantity),
        unit,
        targetPrice: parseFloat(targetPrice),
        isNegotiable,
        contractType,
        requiredByDate: new Date(requiredByDate), // Backend expects Date object
        qualityGrade,
        logisticsType,
        deliveryLocation: {
          address: deliveryAddress || t("Main Warehouse"), // Simple string wrapper
        },
        description,
      };

      const res = await fetch(`${API_BASE_URL}/api/buyer/requirements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert(t("Success"), t("Requirement posted successfully!"));
        router.back();
      } else {
        Alert.alert(t("Error"), data.message || t("Failed to post"));
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t("Error"), t("Network error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("New Requirement")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* 1. Contract Type Selector */}
        <View style={styles.contractToggleContainer}>
          <TouchableOpacity
            style={[
              styles.contractOption,
              contractType === "spot_market" && styles.spotActive,
            ]}
            onPress={() => setContractType("spot_market")}
          >
            <MaterialCommunityIcons
              name="store"
              size={20}
              color={contractType === "spot_market" ? "#FFF" : "#666"}
            />
            <Text
              style={[
                styles.contractText,
                contractType === "spot_market" && styles.activeText,
              ]}
            >
              {t("Spot Market")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.contractOption,
              contractType === "pre_harvest_contract" &&
                styles.preHarvestActive,
            ]}
            onPress={() => setContractType("pre_harvest_contract")}
          >
            <MaterialCommunityIcons
              name="sprout"
              size={20}
              color={contractType === "pre_harvest_contract" ? "#FFF" : "#666"}
            />
            <Text
              style={[
                styles.contractText,
                contractType === "pre_harvest_contract" && styles.activeText,
              ]}
            >
              {t("Pre-Harvest")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. Basic Crop Info */}
        <Input
          label={t("Crop Name")}
          value={cropName}
          onChangeText={setCropName}
          placeholder={t("e.g. Potato, Wheat")}
        />

        <Input
          label={t("Variety (Optional)")}
          value={variety}
          onChangeText={setVariety}
          placeholder={t("e.g. Jyoti, Sharbati")}
        />

        <Text style={styles.label}>{t("Category")}</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.pill, category === cat && styles.pillActive]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.pillText,
                  category === cat && styles.pillTextActive,
                ]}
              >
                {t(cat.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. Quantity & Price */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Input
              label={t("Quantity")}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="100"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label={t("Unit")}
              value={unit}
              onChangeText={setUnit}
              placeholder={t("e.g. Tons")}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Input
              label={t("Target Price")}
              value={targetPrice}
              onChangeText={setTargetPrice}
              keyboardType="numeric"
              placeholder={t("₹ per unit")}
            />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>{t("Negotiable")}</Text>
            <Switch
              value={isNegotiable}
              onValueChange={setIsNegotiable}
              trackColor={{ false: "#767577", true: "#2A9D8F" }}
            />
          </View>
        </View>

        {/* 4. Timeline (Critical for Pre-Harvest) */}
        <Input
          label={t("Required By Date (Deadline)")}
          value={requiredByDate}
          onChangeText={setRequiredByDate}
          placeholder="YYYY-MM-DD"
          icon={
            <MaterialCommunityIcons name="calendar" size={20} color="#666" />
          }
        />
        {contractType === "pre_harvest_contract" && (
          <Text style={styles.helperText}>
            {t("Farmers need to know when you expect the harvest.")}
          </Text>
        )}

        {/* 5. Quality & Logistics */}
        <Text style={styles.label}>{t("Quality Grade")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollSelect}
        >
          {GRADES.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.pill, qualityGrade === g && styles.gradeActive]}
              onPress={() => setQualityGrade(g)}
            >
              <Text
                style={[
                  styles.pillText,
                  qualityGrade === g && styles.pillTextActive,
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>{t("Logistics / Delivery")}</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.radioBtn,
              logisticsType === "buyer_pick_up" && styles.radioActive,
            ]}
            onPress={() => setLogisticsType("buyer_pick_up")}
          >
            <Text
              style={[
                styles.radioText,
                logisticsType === "buyer_pick_up" && styles.activeText,
              ]}
            >
              {t("I will Pick Up")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioBtn,
              logisticsType === "farmer_delivery" && styles.radioActive,
            ]}
            onPress={() => setLogisticsType("farmer_delivery")}
          >
            <Text
              style={[
                styles.radioText,
                logisticsType === "farmer_delivery" && styles.activeText,
              ]}
            >
              {t("Farmer Delivers")}
            </Text>
          </TouchableOpacity>
        </View>

        <Input
          label={t("Delivery/Pickup Address")}
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          placeholder={t("City, State or Warehouse Address")}
          multiline
          numberOfLines={2}
        />

        <Input
          label={t("Additional Requirements")}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          placeholder={t("Moisture content, packaging requirements, etc.")}
        />

        <Button
          title={t("Post Requirement")}
          onPress={handleSubmit}
          loading={loading}
          style={{
            marginTop: 20,
            marginBottom: 40,
            backgroundColor: "#E76F51",
          }}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#264653",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 15,
    color: "#666",
    marginBottom: 8,
    fontWeight: "600",
    marginTop: 10,
  },
  // Contract Toggle
  contractToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  contractOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  spotActive: {
    backgroundColor: "#F4A261", // Orange
    shadowColor: "#000",
    shadowOpacity: 0.1,
    elevation: 2,
  },
  preHarvestActive: {
    backgroundColor: "#9C27B0", // Purple
    shadowColor: "#000",
    shadowOpacity: 0.1,
    elevation: 2,
  },
  contractText: {
    fontWeight: "600",
    color: "#666",
  },
  activeText: {
    color: "#FFF",
  },

  // Pills
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  scrollSelect: {
    flexDirection: "row",
    marginBottom: 10,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  pillActive: {
    backgroundColor: "#E76F51",
  },
  gradeActive: {
    backgroundColor: "#2A9D8F",
  },
  pillText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#FFF",
  },

  // Layout
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginTop: 5,
  },
  switchLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#9C27B0",
    marginTop: -10,
    marginBottom: 10,
    fontStyle: "italic",
  },

  // Radio Btns
  radioBtn: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#FFF",
  },
  radioActive: {
    backgroundColor: "#457B9D",
    borderColor: "#457B9D",
  },
  radioText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 13,
  },
});
