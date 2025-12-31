import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
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

export default function EditRequirementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // --- Form State ---
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [category, setCategory] = useState("crops");

  // Contract
  const [contractType, setContractType] = useState("pre_harvest_contract");
  const [requiredByDate, setRequiredByDate] = useState("");

  // Qty/Price
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(true);

  // Quality/Logistics
  const [qualityGrade, setQualityGrade] = useState("Any");
  const [logisticsType, setLogisticsType] = useState("buyer_pick_up");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [description, setDescription] = useState("");

  // 1. Fetch Details on Mount
  useEffect(() => {
    if (id && user?.token) {
      fetchDetails();
    }
  }, [id, user]);

  const fetchDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/buyer/requirements/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();

      if (res.ok && data.requirement) {
        const r = data.requirement;
        setCropName(r.cropName || "");
        setVariety(r.variety || "");
        setCategory(r.category || "crops");
        setContractType(r.contractType || "pre_harvest_contract");

        // Format Date to YYYY-MM-DD for input
        if (r.requiredByDate) {
          setRequiredByDate(
            new Date(r.requiredByDate).toISOString().split("T")[0]
          );
        }

        setQuantity(r.quantity?.toString() || "");
        setUnit(r.unit || "");
        setTargetPrice(r.targetPrice?.toString() || "");
        setIsNegotiable(r.isNegotiable ?? true);
        setQualityGrade(r.qualityGrade || "Any");
        setLogisticsType(r.logisticsType || "buyer_pick_up");
        setDeliveryAddress(r.deliveryLocation?.address || "");
        setDescription(r.description || "");
      } else {
        Alert.alert(t("Error"), t("Failed to fetch details"));
        router.back();
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t("Error"), t("Network error"));
    } finally {
      setInitialLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!cropName || !quantity || !unit || !targetPrice) {
      return Alert.alert(
        t("Missing Fields"),
        t("Please fill all required fields")
      );
    }

    setLoading(true);

    try {
      const payload = {
        cropName,
        variety,
        category,
        contractType,
        requiredByDate: new Date(requiredByDate),
        quantity: parseFloat(quantity),
        unit,
        targetPrice: parseFloat(targetPrice),
        isNegotiable,
        qualityGrade,
        logisticsType,
        deliveryLocation: { address: deliveryAddress },
        description,
      };

      const res = await fetch(`${API_BASE_URL}/api/buyer/requirements/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert(t("Success"), t("Requirement updated successfully!"));
        router.back();
      } else {
        Alert.alert(t("Error"), data.message || t("Failed to update"));
      }
    } catch (error) {
      Alert.alert(t("Error"), t("Network error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t("Delete Requirement"),
      t("Are you sure you want to remove this requirement?"),
      [
        { text: t("Cancel"), style: "cancel" },
        {
          text: t("Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/buyer/requirements/${id}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${user.token}` },
                }
              );

              if (res.ok) {
                Alert.alert(t("Deleted"), t("Requirement removed."));
                router.back();
              } else {
                Alert.alert(t("Error"), t("Failed to delete"));
              }
            } catch (error) {
              Alert.alert(t("Error"), t("Network error"));
            }
          },
        },
      ]
    );
  };

  if (initialLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2A9D8F" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("Edit Requirement")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Contract Type Toggle */}
        <View style={styles.contractToggleContainer}>
          <TouchableOpacity
            style={[
              styles.contractOption,
              contractType === "spot_market" && styles.spotActive,
            ]}
            onPress={() => setContractType("spot_market")}
          >
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

        <Input
          label={t("Crop Name")}
          value={cropName}
          onChangeText={setCropName}
        />

        <Input label={t("Variety")} value={variety} onChangeText={setVariety} />

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

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Input
              label={t("Quantity")}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input label={t("Unit")} value={unit} onChangeText={setUnit} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Input
              label={t("Target Price")}
              value={targetPrice}
              onChangeText={setTargetPrice}
              keyboardType="numeric"
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

        <Input
          label={t("Required By (YYYY-MM-DD)")}
          value={requiredByDate}
          onChangeText={setRequiredByDate}
          placeholder="YYYY-MM-DD"
        />

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

        <Text style={styles.label}>{t("Logistics")}</Text>
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
          label={t("Delivery Address")}
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          multiline
        />

        <Input
          label={t("Description / Notes")}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Button
          title={t("Save Changes")}
          onPress={handleUpdate}
          loading={loading}
          style={{ marginTop: 20, backgroundColor: "#2A9D8F" }}
        />

        <Button
          title={t("Delete Requirement")}
          onPress={handleDelete}
          style={styles.deleteButton}
          textStyle={styles.deleteButtonText}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 15,
    color: "#666",
    marginBottom: 8,
    fontWeight: "600",
    marginTop: 10,
  },
  // Toggles
  contractToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  contractOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  spotActive: { backgroundColor: "#F4A261", elevation: 2 },
  preHarvestActive: { backgroundColor: "#9C27B0", elevation: 2 },
  contractText: { fontWeight: "600", color: "#666" },
  activeText: { color: "#FFF" },

  // Pills
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  scrollSelect: { flexDirection: "row", marginBottom: 10 },
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
  pillActive: { backgroundColor: "#E76F51" },
  gradeActive: { backgroundColor: "#2A9D8F" },
  pillText: { fontSize: 13, color: "#666", fontWeight: "600" },
  pillTextActive: { color: "#FFF" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  switchContainer: { alignItems: "center", marginLeft: 10, marginTop: 5 },
  switchLabel: { fontSize: 10, color: "#666", marginBottom: 4 },

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
  radioActive: { backgroundColor: "#457B9D", borderColor: "#457B9D" },
  radioText: { color: "#666", fontWeight: "600", fontSize: 13 },

  deleteButton: {
    marginTop: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E76F51",
  },
  deleteButtonText: {
    color: "#E76F51",
  },
});
