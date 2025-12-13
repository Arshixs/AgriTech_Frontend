import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Ensure these paths match your project structure
// Assuming 'app/' is at the root level alongside 'src/'
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

export default function PostRequirementScreen() {
  const router = useRouter();
  const { user } = useAuth();

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
        "Missing Fields",
        "Please fill Title, Quantity and Unit."
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
        Alert.alert("Success", "Requirement posted successfully!");
        router.back();
      } else {
        Alert.alert("Error", data.message || "Failed to post");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error");
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
        <Text style={styles.headerTitle}>New Requirement</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Input
          label="Requirement Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. 50 Tons of Basmati Rice"
        />

        <Text style={styles.label}>Category</Text>
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
                {cat.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Input
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="e.g. 100"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Unit"
              value={unit}
              onChangeText={setUnit}
              placeholder="e.g. Tons"
            />
          </View>
        </View>

        <Input
          label="Target Price (Optional)"
          value={targetPrice}
          onChangeText={setTargetPrice}
          keyboardType="numeric"
          placeholder="₹ per unit"
        />

        <Input
          label="Description / Specifics"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholder="Describe quality, delivery location etc."
        />

        <Button
          title="Post Requirement"
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
