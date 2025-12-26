import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
// 1. Add Import
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../secret";
import Button from "../src/components/common/Button";
import Input from "../src/components/common/Input";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import { useAuth } from "../src/context/AuthContext";

// Categories matching your Backend Model Enums
// Keep values in English for Backend, Labels can be English here and translated in render
const CATEGORIES = [
  { label: "Seeds", value: "seeds" },
  { label: "Tools", value: "tools" },
  { label: "Machines", value: "machines" },
  { label: "Agri Inputs", value: "agri-inputs" },
  { label: "Rentals", value: "rentals" },
];

export default function AddEditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  // 2. Initialize Hook
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);

  // Removed screenTitle state. derived it in render instead for better reactivity.

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");

  // 1. Fetch Details if Editing
  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor/product/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setName(data.name);
        setDescription(data.description);
        setPrice(data.price.toString());
        setStock(data.stock.toString());
        setUnit(data.unit || "");
        setCategory(data.category);
      } else {
        Alert.alert(t("Error"), t("Could not fetch product details"));
        router.back();
      }
    } catch (err) {
      console.error(err);
      Alert.alert(t("Error"), t("Network error fetching details"));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Save (Create or Update)
  const handleSave = async () => {
    // Basic Validation
    if (!name || !price || !category || !unit) {
      return Alert.alert(
        t("Missing Fields"),
        t("Please fill in Name, Price, Unit, and Category.")
      );
    }

    setIsLoading(true);
    const productData = {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      unit,
      category,
    };

    try {
      const url = id
        ? `${API_BASE_URL}/api/vendor/product/${id}`
        : `${API_BASE_URL}/api/vendor/product`;

      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (res.ok) {
        // FIX: Split messages so translation is grammatically correct
        const successMsg = id
          ? t("Product updated successfully!")
          : t("Product created successfully!");

        Alert.alert(t("Success"), successMsg);
        router.back();
      } else {
        Alert.alert(t("Error"), data.message || t("Operation failed"));
      }
    } catch (err) {
      console.error(err);
      Alert.alert(t("Error"), t("Network request failed"));
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Delete
  const handleDelete = () => {
    Alert.alert(
      t("Delete Product"),
      t("Are you sure you want to delete this product? This cannot be undone."),
      [
        { text: t("Cancel"), style: "cancel" },
        {
          text: t("Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/vendor/product/${id}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${user.token}` },
                }
              );

              if (res.ok) {
                Alert.alert(t("Deleted"), t("Product has been deleted."));
                router.back();
              } else {
                Alert.alert(t("Error"), t("Failed to delete product"));
              }
            } catch (err) {
              Alert.alert(t("Error"), t("Network error"));
            }
          },
        },
      ]
    );
  };

  if (isLoading && id && !name) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
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
        {/* Dynamic Title Translation */}
        <Text style={styles.headerTitle}>
          {id ? t("Edit Product") : t("Add New Product")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Input label={t("Product Name")} value={name} onChangeText={setName} />

        <Input
          label={t("Description")}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        {/* Row for Price and Stock */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Input
              label={t("Price (₹)")}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label={t("Stock")}
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* NEW UNIT INPUT */}
        <Input
          label={t("Unit (e.g., kg, ton, piece)")}
          value={unit}
          onChangeText={setUnit}
          placeholder={t("kg")}
        />

        <Text style={styles.categoryLabel}>{t("Category")}</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryButton,
                category === cat.value && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(cat.value)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat.value && styles.categoryTextActive,
                ]}
              >
                {/* Translate the label here */}
                {t(cat.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={t("Save Product")}
          onPress={handleSave}
          loading={isLoading}
          style={{ marginTop: 24 }}
        />

        {id && (
          <Button
            title={t("Delete Product")}
            onPress={handleDelete}
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
          />
        )}
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
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#264653",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
    marginTop: 8,
    fontWeight: "600",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryButton: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#2A9D8F",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },
  categoryTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
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
