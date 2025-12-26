import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
// 1. Add Import
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Ensure these paths match your project structure
import { API_BASE_URL } from "../secret";
import Button from "../src/components/common/Button";
import Input from "../src/components/common/Input";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import { useAuth } from "../src/context/AuthContext";

// Keep values in English for Backend
const CATEGORIES = [
  "crops",
  "grains",
  "vegetables",
  "fruits",
  "flowers",
  "spices",
];

export default function PostRequirementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  // 2. Initialize Hook
  const { t } = useTranslation();
  const getCategory = (key) => {
    if (key === "CROPS") return t("CROPS");
    if (key === "GRAINS") return t("GRAINS");
    if (key === "VEGETABLES") return t("VEGETABLES");
    if (key === "FRUITS") return t("FRUITS");
    if (key === "FLOWERS") return t("FLOWERS");
    if (key === "SPICES") return t("SPICES");
    return key;
  };

  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("crops");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!title || !quantity || !unit) {
      return Alert.alert(
        t("Missing Fields"),
        t("Please fill Title, Quantity and Unit.")
      );
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/buyer/requirements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          title,
          category,
          quantity: parseFloat(quantity),
          unit,
          targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
          description,
        }),
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
        <Input
          label={t("Requirement Title")}
          value={title}
          onChangeText={setTitle}
          placeholder={t("e.g. 50 Tons of Basmati Rice")}
        />

        <Text style={styles.label}>{t("Category")}</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                category === cat && styles.categoryPillActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}
              >
                {/* Translate category label */}
                {getCategory(cat.toUpperCase())}
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
              placeholder={t("e.g. 100")}
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

        <Input
          label={t("Target Price (Optional)")}
          value={targetPrice}
          onChangeText={setTargetPrice}
          keyboardType="numeric"
          placeholder={t("₹ per unit")}
        />

        <Input
          label={t("Description / Specifics")}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholder={t("Describe quality, delivery location etc.")}
        />

        <Button
          title={t("Post Requirement")}
          onPress={handleSubmit}
          loading={loading}
          style={{ marginTop: 20, backgroundColor: "#E76F51" }}
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
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
    fontWeight: "600",
    marginTop: 10,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
    marginBottom: 8,
  },
  categoryPillActive: {
    backgroundColor: "#E76F51",
  },
  categoryText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#FFF",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
