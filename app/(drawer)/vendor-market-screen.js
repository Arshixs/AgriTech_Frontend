import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { API_BASE_URL } from "../../secret";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

const CATEGORY_TABS = [
  { label: "All", value: "all" },
  { label: "Rentals", value: "rentals" },
  { label: "Seeds", value: "seeds" },
  { label: "Agri Inputs", value: "agri-inputs" },
];

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
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(new Date());
  const [tempEndDate, setTempEndDate] = useState(new Date());

  const formatDateForDisplay = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setTempStartDate(selectedDate);
      setStartDate(formatDateForAPI(selectedDate));
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setTempEndDate(selectedDate);
      setEndDate(formatDateForAPI(selectedDate));
    }
  };

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

  const getFilteredProducts = () => {
    if (categoryFilter === "all") return products;
    return products.filter((p) => p.category === categoryFilter);
  };

  const filteredProducts = getFilteredProducts();

  const openOrderModal = (product) => {
    setSelectedProduct(product);
    setOrderQuantity("1");

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    setTempStartDate(today);
    setTempEndDate(tomorrow);
    setStartDate(formatDateForAPI(today));
    setEndDate(formatDateForAPI(tomorrow));

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

    if (orderType === "rental") {
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

  const getCategoryLabel = (category) => {
    switch (category) {
      case "rentals":
        return t("Rental");
      case "seeds":
        return t("Seeds");
      case "agri-inputs":
        return t("Agri Input");
      default:
        return category;
    }
  };

  const renderProductCard = (product) => {
    const isRental = product.category === "rentals";
    const cardColor = getCategoryColor(product.category);

    return (
      <TouchableOpacity
        key={product._id}
        style={styles.productCard}
        activeOpacity={0.7}
        onPress={() => openOrderModal(product)}
      >
        <View style={styles.cardContent}>
          {/* Icon Badge */}
          <View
            style={[styles.iconBadge, { backgroundColor: cardColor + "15" }]}
          >
            <MaterialCommunityIcons
              name={getCategoryIcon(product.category)}
              size={28}
              color={cardColor}
            />
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: cardColor + "20" },
                ]}
              >
                <Text style={[styles.categoryText, { color: cardColor }]}>
                  {getCategoryLabel(product.category)}
                </Text>
              </View>
            </View>

            <Text style={styles.vendorName} numberOfLines={1}>
              <MaterialCommunityIcons name="store" size={12} color="#888" />{" "}
              {product.vendor?.organizationName ||
                product.vendor?.name ||
                t("Unknown Vendor")}
            </Text>

            {product.description && (
              <Text style={styles.productDescription} numberOfLines={2}>
                {product.description}
              </Text>
            )}

            {/* Price and Stock Row */}
            <View style={styles.bottomRow}>
              <View style={styles.priceSection}>
                <Text style={styles.priceLabel}>
                  {isRental ? t("Per Day") : t("Price")}
                </Text>
                <Text style={[styles.priceValue, { color: cardColor }]}>
                  {formatCurrency(product.price)}
                  <Text style={styles.unitText}>/{product.unit}</Text>
                </Text>
              </View>

              <View style={styles.stockSection}>
                <MaterialCommunityIcons
                  name="package-variant"
                  size={14}
                  color="#666"
                />
                <Text style={styles.stockText}>
                  {product.stock} {product.unit}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={[styles.actionButton, { backgroundColor: cardColor }]}>
          <Text style={styles.actionButtonText}>
            {isRental ? t("Rent Now") : t("Buy Now")}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
        </View>
      </TouchableOpacity>
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
              <View style={styles.modalHeaderLeft}>
                <View
                  style={[
                    styles.modalIcon,
                    { backgroundColor: cardColor + "15" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={getCategoryIcon(selectedProduct.category)}
                    size={24}
                    color={cardColor}
                  />
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    {isRental ? t("Rent Equipment") : t("Place Order")}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedProduct.name}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={closeOrderModal}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Product Summary Card */}
              <View style={styles.productSummaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t("Vendor")}</Text>
                  <Text style={styles.summaryValue}>
                    {selectedProduct.vendor?.organizationName}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {isRental ? t("Rate per Day") : t("Unit Price")}
                  </Text>
                  <Text style={[styles.summaryValue, { color: cardColor }]}>
                    {formatCurrency(selectedProduct.price)}/
                    {selectedProduct.unit}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {t("Available Stock")}
                  </Text>
                  <Text style={styles.summaryValue}>
                    {selectedProduct.stock} {selectedProduct.unit}
                  </Text>
                </View>
              </View>

              {/* Quantity Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {t("Quantity")} ({selectedProduct.unit})
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={orderQuantity}
                  onChangeText={setOrderQuantity}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor="#888"
                />
              </View>

              {/* Rental Dates */}
              {isRental && (
                <View style={styles.rentalContainer}>
                  <View style={styles.rentalHeader}>
                    <MaterialCommunityIcons
                      name="calendar-range"
                      size={20}
                      color={cardColor}
                    />
                    <Text style={[styles.rentalTitle, { color: cardColor }]}>
                      {t("Rental Period")}
                    </Text>
                  </View>

                  <View style={styles.dateRow}>
                    <View style={styles.dateInputWrapper}>
                      <Text style={styles.dateLabel}>{t("Start Date")}</Text>
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => setShowStartDatePicker(true)}
                      >
                        <MaterialCommunityIcons
                          name="calendar"
                          size={16}
                          color={cardColor}
                        />
                        <Text style={styles.dateText}>
                          {formatDateForDisplay(tempStartDate)}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={20}
                      color="#CCC"
                      style={{ marginTop: 28 }}
                    />

                    <View style={styles.dateInputWrapper}>
                      <Text style={styles.dateLabel}>{t("End Date")}</Text>
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => setShowEndDatePicker(true)}
                      >
                        <MaterialCommunityIcons
                          name="calendar"
                          size={16}
                          color={cardColor}
                        />
                        <Text style={styles.dateText}>
                          {formatDateForDisplay(tempEndDate)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {showStartDatePicker && (
                    <DateTimePicker
                      value={tempStartDate}
                      mode="date"
                      display="default"
                      onChange={onStartDateChange}
                      minimumDate={new Date()}
                    />
                  )}

                  {showEndDatePicker && (
                    <DateTimePicker
                      value={tempEndDate}
                      mode="date"
                      display="default"
                      onChange={onEndDateChange}
                      minimumDate={tempStartDate}
                    />
                  )}
                </View>
              )}

              {/* Error/Success Messages */}
              {orderError && (
                <View style={styles.messageBox}>
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={20}
                    color="#E76F51"
                  />
                  <Text style={styles.errorText}>{orderError}</Text>
                </View>
              )}
              {orderSuccess && (
                <View style={[styles.messageBox, styles.successBox]}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#4CAF50"
                  />
                  <Text style={styles.successText}>{orderSuccess}</Text>
                </View>
              )}

              {/* Confirm Button */}
              {!orderSuccess && (
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: cardColor },
                    isPlacingOrder && styles.confirmButtonDisabled,
                  ]}
                  onPress={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  activeOpacity={0.8}
                >
                  {isPlacingOrder ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.confirmButtonText}>
                        {isRental ? t("Confirm Rental") : t("Confirm Order")}
                      </Text>
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color="#FFF"
                      />
                    </>
                  )}
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const FilterButton = ({ label, value }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        categoryFilter === value && styles.filterButtonActive,
      ]}
      onPress={() => setCategoryFilter(value)}
    >
      <Text
        style={[
          styles.filterText,
          categoryFilter === value && styles.filterTextActive,
        ]}
      >
        {t(label)}
      </Text>
    </TouchableOpacity>
  );

  if (!authToken || loading) {
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
      {renderOrderModal()}

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t("Vendor Marketplace")}</Text>
          <Text style={styles.headerSubtitle}>
            {t("Farm supplies and equipment")}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORY_TABS.map((tab) => (
            <FilterButton key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </ScrollView>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {/* <View style={styles.statCard}>
          <Text style={styles.statValue}>{filteredProducts.length}</Text>
          <Text style={styles.statLabel}>{t("Products")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#E76F51" }]}>
            {products.filter((p) => p.category === "rentals").length}
          </Text>
          <Text style={styles.statLabel}>{t("Rentals")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#2A9D8F" }]}>
            {products.filter((p) => p.category === "seeds").length}
          </Text>
          <Text style={styles.statLabel}>{t("Seeds")}</Text>
        </View> */}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={20}
              color="#E76F51"
            />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {filteredProducts.length === 0 && !error ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="store-off" size={64} color="#CCC" />
            <Text style={styles.emptyText}>
              {categoryFilter === "all"
                ? t("No products available")
                : t("No {{category}} products found", {
                    category: categoryFilter,
                  })}
            </Text>
            <Text style={styles.emptySubtext}>
              {t("Check back later for new listings")}
            </Text>
          </View>
        ) : (
          filteredProducts.map(renderProductCard)
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  headerSubtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },

  filterContainer: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#2A9D8F",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#FFF",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },


  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#264653",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },

  scrollView: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop:3
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF0F0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E76F51",
  },
  errorBannerText: {
    flex: 1,
    color: "#E76F51",
    fontSize: 14,
    fontWeight: "600",
  },

  productCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  productName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#264653",
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700",
  },
  vendorName: {
    fontSize: 13,
    color: "#888",
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: "#888",
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  unitText: {
    fontSize: 13,
    fontWeight: "normal",
    color: "#888",
  },
  stockSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Dimensions.get("window").height * 0.85,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  modalBody: {
    padding: 20,
  },

  productSummaryCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#264653",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },

  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 16,
    color: "#264653",
  },

  rentalContainer: {
    backgroundColor: "#F0F8F7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  rentalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  rentalTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateInputWrapper: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    fontWeight: "600",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateText: {
    fontSize: 14,
    color: "#264653",
    fontWeight: "600",
  },

  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#E76F51",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#E76F51",
    fontWeight: "600",
  },
  successBox: {
    backgroundColor: "#F0FFF4",
    borderColor: "#4CAF50",
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },

  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
