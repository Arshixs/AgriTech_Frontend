import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../../secret";
import Button from "../../src/components/common/Button";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

export default function ProductsScreen() {
  const router = useRouter();
  const { user } = useAuth(); // Get user token
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Products function
  const fetchProducts = async () => {
    if (!user?.token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor/product`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setProducts(data.products || []);
      } else {
        // Silent fail or minimal alert to not annoy user on refresh
        console.log("Failed to fetch products:", data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Could not load products");
    } finally {
      setLoading(false);
    }
  };

  // Reload data whenever this screen comes into focus (e.g., after adding a product)
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        router.push({ pathname: "/add-edit-product", params: { id: item._id } })
      } // Passed _id
    >
      {/* Placeholder image logic since we simplified the model */}
      <View style={styles.imagePlaceholder}>
        <MaterialCommunityIcons name="leaf" size={24} color="#2A9D8F" />
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory} numberOfLines={1}>
          {item.category?.toUpperCase()} • {item.unit}
        </Text>
        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          <Text
            style={[
              styles.productStock,
              { color: item.stock < 10 ? "#E76F51" : "#2A9D8F" },
            ]}
          >
            Stock: {item.stock}
          </Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Products</Text>
        <Button
          title="Add New Product"
          onPress={() => router.push("/add-edit-product")}
          style={styles.addButton}
          icon={() => (
            <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2A9D8F"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id} // MongoDB uses _id
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found. Add one!</Text>
          }
          refreshing={loading}
          onRefresh={fetchProducts} // Pull to refresh
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#2A9D8F",
  },
  listContainer: {
    padding: 20,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 10,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#264653",
  },
  productStock: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
});
