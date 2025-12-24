import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../secret";
import Button from "../src/components/common/Button";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import { useAuth } from "../src/context/AuthContext";
// Assuming a shared Input component exists for Modal consistency

// Helper function to format currency
const formatCurrency = (amount) => {
  if (amount === null || isNaN(amount)) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function VendorMarketScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const authToken = user?.token;

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  // Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // --- Data Fetching ---

  const fetchProducts = async () => {
    if (!authToken) return;
    setRefreshing(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor/product/all`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        throw new Error(t("Failed to fetch product list."));
      }

      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Product Fetch Error:", error.message);
      setError(error.message);
      setProducts([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchProducts();
    }
  }, [authToken]);

  const onRefresh = () => {
    fetchProducts();
  };

  // --- Order Handling ---

  const openOrderModal = (product) => {
    setSelectedProduct(product);
    setOrderQuantity("1");
    setStartDate("");
    setEndDate("");
    setOrderError(null);
    setOrderSuccess(null);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedProduct(null);
  };

  const handlePlaceOrder = async () => {
    if (!selectedProduct || !orderQuantity)
      return setOrderError(t("Missing product or quantity."));
    if (selectedProduct.category === "rentals" && (!startDate || !endDate)) {
      return setOrderError(t("Rental requires both start and end dates."));
    }

    setIsPlacingOrder(true);
    setOrderError(null);
    setOrderSuccess(null);

    const orderType =
      selectedProduct.category === "rentals" ? "rental" : "purchase";
    let body = {
      productId: selectedProduct._id,
      orderType: orderType,
      quantity: parseInt(orderQuantity),
    };

    if (orderType === "rentals") {
      body = { ...body, startDate, endDate };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || t("Failed to place order."));
      }

      const data = await res.json();
      setOrderSuccess(
        t("Order placed successfully! Total: {{total}}", {
          total: formatCurrency(data.order.totalAmount),
        })
      );

      setTimeout(() => {
        closeOrderModal();
        fetchProducts();
      }, 2000);
    } catch (err) {
      console.error("Order Error:", err.message);
      setOrderError(err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // --- Rendering Helpers ---

  const getCategoryIcon = (category) => {
    switch (category) {
      case "rentals":
        return "tractor";
      case "seeds":
        return "seed";
      case "agri-inputs":
        return "flask";
      default:
        return "shopping";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "rentals":
        return "#E76F51";
      case "seeds":
        return "#2A9D8F";
      case "agri-inputs":
        return "#F4A261";
      default:
        return "#457B9D";
    }
  };

  const renderProductCard = (product) => {
    const isRental = product.category === "rentals";
    const cardColor = getCategoryColor(product.category);

    return (
      <View key={product._id} style={styles.productCard}>
        <View style={[styles.cardHeader, { borderLeftColor: cardColor }]}>
          <View
            style={[styles.iconCircle, { backgroundColor: cardColor + "10" }]}
          >
            <MaterialCommunityIcons
              name={getCategoryIcon(product.category)}
              size={30}
              color={cardColor}
            />
          </View>
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.vendorName}>
              {t("Vendor")}: {product.vendor?.organizationName || product.vendor?.name || t("Unknown Vendor")}
            </Text>
          </View>
        </View>

        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>
              {isRental ? t("Price/Day") : t("Price/Unit")}
            </Text>
            <Text style={styles.priceValue}>
              {formatCurrency(product.price)} / {product.unit}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.buyButton, { backgroundColor: cardColor }]}
            onPress={() => openOrderModal(product)}
          >
            <Text style={styles.buyButtonText}>
              {isRental ? t("Rent Now") : t("Buy Now")}
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderOrderModal = () => {
    if (!selectedProduct) return null;
    const isRental = selectedProduct.category === "rentals";
    const cardColor = getCategoryColor(selectedProduct.category);

    return (
      <Modal
        visible={showOrderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeOrderModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isRental ? t("Place Rental Order") : t("Place Purchase Order")}
              </Text>
              <TouchableOpacity onPress={closeOrderModal}>
                <FontAwesome name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modalProductInfo}>
                <Text style={[styles.modalProductName, { color: cardColor }]}>
                  {selectedProduct.name}
                </Text>
                <Text style={styles.modalProductVendor}>
                  {selectedProduct.vendor.organizationName}
                </Text>
                <Text style={styles.modalProductPrice}>
                  {formatCurrency(selectedProduct.price)} / {selectedProduct.unit}
                </Text>
                <Text style={styles.modalStockText}>
                  {t("Stock Available")}: {selectedProduct.stock} {selectedProduct.unit}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {t("Quantity")} ({selectedProduct.unit})
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={orderQuantity}
                  onChangeText={setOrderQuantity}
                  keyboardType="numeric"
                  placeholder={t("1")}
                  placeholderTextColor="#888"
                />
              </View>

              {isRental && (
                <View style={styles.rentalContainer}>
                  <Text style={styles.inputLabel}>
                    {t("Rental Period (YYYY-MM-DD)")}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder={t("Start Date (e.g., 2025-12-15)")}
                    placeholderTextColor="#888"
                    keyboardType="numbers-and-punctuation"
                  />
                  <TextInput
                    style={styles.textInput}
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder={t("End Date (e.g., 2025-12-20)")}
                    placeholderTextColor="#888"
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              )}

              {/* Error/Success Messages */}
              {orderError && (
                <View style={styles.modalError}>
                  <Text style={styles.modalErrorText}>{orderError}</Text>
                </View>
              )}
              {orderSuccess && (
                <View style={styles.modalSuccess}>
                  <Text style={styles.modalSuccessText}>{orderSuccess}</Text>
                </View>
              )}

              {/* Final Order Button */}
              {/* Instead of the Button, use conditional rendering */}
              {!orderSuccess && (
                <Button
                  title={t(`Confirm ${isRental ? "Rental" : "Purchase"}`)}
                  onPress={handlePlaceOrder}
                  loading={isPlacingOrder}
                  style={{ backgroundColor: cardColor, marginTop: 15 }}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // --- Main Render ---

  if (!authToken || loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            {t("Fetching Vendor Products...")}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {renderOrderModal()}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <Text style={styles.header}>{t("Vendor Marketplace")}</Text>
          <Text style={styles.subtitle}>
            {t(
              "Browse farm supplies and rental machinery from verified vendors ({{count}} items)",
              { count: products.length }
            )}
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {t("Connection Error")}: {error}
              </Text>
            </View>
          )}

          {products.length === 0 && !error ? (
            <View style={styles.noProductsCard}>
              <MaterialCommunityIcons name="store-off" size={30} color="#888" />
              <Text style={styles.noProductsText}>
                {t("No products found in the marketplace.")}
              </Text>
            </View>
          ) : (
            products.map(renderProductCard)
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: "#FFF0F0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E76F51",
  },
  errorText: {
    color: "#E76F51",
    fontWeight: "600",
    textAlign: "center",
  },
  noProductsCard: {
    padding: 30,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  noProductsText: {
    fontSize: 16,
    color: "#888",
    marginTop: 10,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    // borderLeftColor set inline
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    // backgroundColor set inline
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
  },
  vendorName: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  productDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#888",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "extrabold",
    color: "#E76F51",
    marginTop: 4,
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    // backgroundColor set inline
    minWidth: 120,
    justifyContent: "space-between",
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Dimensions.get("window").height * 0.9,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#264653",
  },
  modalBody: {
    padding: 20,
  },
  modalProductInfo: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalProductName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    // color set inline
  },
  modalProductVendor: {
    fontSize: 15,
    color: "#666",
    marginBottom: 10,
  },
  modalProductPrice: {
    fontSize: 20,
    fontWeight: "600",
    color: "#E76F51",
  },
  modalStockText: {
    fontSize: 14,
    color: "#2A9D8F",
    marginTop: 5,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
  },
  textInput: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  rentalContainer: {
    padding: 10,
    backgroundColor: "#F0F8F7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2A9D8F",
    marginBottom: 15,
  },
  modalError: {
    backgroundColor: "#FFDDDD",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalErrorText: {
    color: "#E76F51",
    textAlign: "center",
    fontWeight: "600",
  },
  modalSuccess: {
    backgroundColor: "#DDEEDD",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalSuccessText: {
    color: "#2A9D8F",
    textAlign: "center",
    fontWeight: "600",
  },
});
