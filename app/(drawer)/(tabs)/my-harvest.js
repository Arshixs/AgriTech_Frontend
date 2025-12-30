// app/(tabs)/my-harvest.js - COMPLETE UPDATED VERSION WITH FRONTEND FILTERING

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../../../secret";
import ScreenWrapper from "../../../src/components/common/ScreenWrapper";
import { useAuth } from "../../../src/context/AuthContext";

export default function MyHarvestScreen() {
  const { user } = useAuth();
  const authToken = user?.token;
  const router = useRouter();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cropOutputs, setCropOutputs] = useState([]);
  const [filter, setFilter] = useState("all");

  // Sale modal states
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const [saleType, setSaleType] = useState(null); // 'marketplace' or 'msp'
  const [minimumPrice, setMinimumPrice] = useState("");
  const [mspData, setMspData] = useState(null);
  const [loadingMSP, setLoadingMSP] = useState(false);

  const fetchOutputs = async () => {
    if (!authToken) return;
    setRefreshing(true);

    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      const url = `${API_BASE_URL}/api/crop-output/my-outputs`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setCropOutputs(data.outputs || []);
      }
    } catch (error) {
      console.error("Fetch Outputs Error:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchOutputs();
    }
  }, [authToken]);

  const onRefresh = () => {
    fetchOutputs();
  };

  // Filter outputs based on selected filter
  const getFilteredOutputs = () => {
    if (filter === "all") {
      return cropOutputs;
    }

    if (filter === "quality-pending") {
      return cropOutputs.filter((o) => o.qualityStatus === "pending");
    }

    if (filter === "quality-approved") {
      return cropOutputs.filter((o) => o.qualityStatus === "approved");
    }

    if (filter === "quality-rejected") {
      return cropOutputs.filter((o) => o.qualityStatus === "rejected");
    }

    // Filter by sale status
    return cropOutputs.filter((o) => o.status === filter);
  };

  const filteredOutputs = getFilteredOutputs();

  const getQualityStatusColor = (qualityStatus) => {
    switch (qualityStatus) {
      case "not-requested":
        return "#888";
      case "pending":
        return "#F4A261";
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#E76F51";
      default:
        return "#666";
    }
  };

  const getSaleStatusColor = (status) => {
    switch (status) {
      case "available":
        return "#2A9D8F";
      case "listed-for-sale":
        return "#457B9D";
      case "sold":
        return "#888";
      case "reserved":
        return "#9C27B0";
      default:
        return "#666";
    }
  };

  const getQualityStatusText = (qualityStatus) => {
    switch (qualityStatus) {
      case "not-requested":
        return t("No Check");
      case "pending":
        return t("Pending");
      case "approved":
        return t("Certified");
      case "rejected":
        return t("Rejected");
      default:
        return qualityStatus;
    }
  };

  const getSaleStatusText = (status) => {
    switch (status) {
      case "available":
        return t("Available");
      case "listed-for-sale":
        return t("Listed");
      case "sold":
        return t("Sold");
      case "reserved":
        return t("Reserved");
      default:
        return status;
    }
  };

  const handleRequestQuality = async (output) => {
    Alert.alert(
      t("Request Quality Check"),
      t(
        "Submit quality inspection request for {{quantity}} {{unit}} of {{crop}}?",
        {
          quantity: output.quantity,
          unit: output.unit,
          crop: output.cropId?.cropName,
        }
      ),
      [
        {
          text: t("Cancel"),
          style: "cancel",
        },
        {
          text: t("Submit"),
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/quality/farmer/create`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                  },
                  body: JSON.stringify({
                    cropOutputId: output._id,
                    storageLocation:
                      output.storageLocation || t("Farm Storage"),
                  }),
                }
              );

              const data = await res.json();

              if (res.ok) {
                Alert.alert(
                  t("Success"),
                  t("Quality inspection request submitted successfully!"),
                  [
                    {
                      text: t("View Requests"),
                      onPress: () => router.push("/(tabs)/quality"),
                    },
                    {
                      text: t("OK"),
                      onPress: () => fetchOutputs(),
                    },
                  ]
                );
              } else {
                Alert.alert(
                  t("Error"),
                  data.message || t("Failed to create request")
                );
              }
            } catch (error) {
              console.error("Submit Request Error:", error);
              Alert.alert(t("Error"), t("Network error occurred"));
            }
          },
        },
      ]
    );
  };

  const handleViewCertificate = (output) => {
    if (output.qualityRequestId) {
      router.push({
        pathname: "/(tabs)/quality",
        params: { requestId: output.qualityRequestId },
      });
    }
  };

  // Fetch MSP for crop
  const fetchMSP = async (cropId) => {
    setLoadingMSP(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/msp/${cropId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();

      if (res.ok && data.hasMSP) {
        setMspData(data.msp);
      } else {
        setMspData(null);
      }
    } catch (error) {
      console.error("Fetch MSP Error:", error);
      setMspData(null);
    } finally {
      setLoadingMSP(false);
    }
  };

  // Open sale modal
  const openSaleModal = async (output, type) => {
    setSelectedOutput(output);
    setSaleType(type);
    setMinimumPrice("");

    if (type === "msp") {
      await fetchMSP(output.cropId._id);
    }

    setShowSaleModal(true);
  };

  // Close sale modal
  const closeSaleModal = () => {
    setShowSaleModal(false);
    setSelectedOutput(null);
    setSaleType(null);
    setMinimumPrice("");
    setMspData(null);
  };

  // List for marketplace
  const handleListForMarketplace = async () => {
    if (!minimumPrice || parseFloat(minimumPrice) <= 0) {
      Alert.alert(t("Error"), t("Please enter a valid minimum price"));
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/marketplace`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          cropOutputId: selectedOutput._id,
          minimumPrice: parseFloat(minimumPrice),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert(
          t("Success"),
          t("Your crop has been listed on the marketplace!"),
          [
            {
              text: t("OK"),
              onPress: () => {
                closeSaleModal();
                fetchOutputs();
              },
            },
          ]
        );
      } else {
        Alert.alert(t("Error"), data.message || t("Failed to list crop"));
      }
    } catch (error) {
      console.error("List Marketplace Error:", error);
      Alert.alert(t("Error"), t("Network error occurred"));
    }
  };

  // List for government MSP
  const handleListForMSP = async () => {
    if (!mspData) {
      Alert.alert(t("Error"), t("MSP data not available"));
      return;
    }

    const totalAmount = mspData.price * selectedOutput.quantity;

    Alert.alert(
      t("Confirm Government Sale"),
      t(
        "Sell {{quantity}} {{unit}} of {{crop}} to government at MSP?\n\nMSP Rate: ₹{{price}}/{{unit}}\nTotal Amount: ₹{{total}}\n\nNote: This will not be listed on marketplace.",
        {
          quantity: selectedOutput.quantity,
          unit: selectedOutput.unit,
          crop: selectedOutput.cropId?.cropName,
          price: mspData.price,
          total: totalAmount.toLocaleString(),
        }
      ),
      [
        { text: t("Cancel"), style: "cancel" },
        {
          text: t("Confirm"),
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/sales/government-msp`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                  },
                  body: JSON.stringify({
                    cropOutputId: selectedOutput._id,
                  }),
                }
              );

              const data = await res.json();

              if (res.ok) {
                Alert.alert(
                  t("Success"),
                  t("Government procurement request submitted successfully!"),
                  [
                    {
                      text: t("OK"),
                      onPress: () => {
                        closeSaleModal();
                        fetchOutputs();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  t("Error"),
                  data.message || t("Failed to submit request")
                );
              }
            } catch (error) {
              console.error("List MSP Error:", error);
              Alert.alert(t("Error"), t("Network error occurred"));
            }
          },
        },
      ]
    );
  };

  const renderOutputCard = (output) => (
    <View key={output._id} style={styles.outputCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <MaterialCommunityIcons
            name={output.cropId?.icon || "sprout"}
            size={24}
            color="#2A9D8F"
          />
          <View style={styles.titleText}>
            <Text style={styles.cropName}>{output.cropId?.cropName}</Text>
            <Text style={styles.fieldName}>
              {t("Field")}: {output.fieldId?.name || t("Unknown")}
            </Text>
          </View>
        </View>

        {/* Both status badges */}
        <View style={styles.statusBadges}>
          {/* Quality Status */}
          {output.qualityStatus && output.qualityStatus !== "not-requested" && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getQualityStatusColor(output.qualityStatus),
                },
              ]}
            >
              <MaterialCommunityIcons
                name="certificate"
                size={10}
                color="#FFF"
              />
              <Text style={styles.statusText}>
                {getQualityStatusText(output.qualityStatus)}
              </Text>
            </View>
          )}

          {/* Sale Status */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getSaleStatusColor(output.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getSaleStatusText(output.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="weight" size={16} color="#666" />
          <Text style={styles.detailText}>
            {output.quantity} {output.unit}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>
            {t("Harvested")}:{" "}
            {new Date(output.harvestDate).toLocaleDateString()}
          </Text>
        </View>
        {output.storageLocation && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="warehouse" size={16} color="#666" />
            <Text style={styles.detailText}>{output.storageLocation}</Text>
          </View>
        )}
      </View>

      {/* Actions based on BOTH statuses */}
      <View style={styles.cardActions}>
        {(!output.qualityStatus || output.qualityStatus === "not-requested") &&
          output.status === "available" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => handleRequestQuality(output)}
            >
              <MaterialCommunityIcons
                name="certificate"
                size={18}
                color="#FFF"
              />
              <Text style={styles.actionButtonText}>
                {t("Request Quality Check")}
              </Text>
            </TouchableOpacity>
          )}

        {/* Show certificate if approved */}
        {output.qualityStatus === "approved" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.successAction]}
            onPress={() => handleViewCertificate(output)}
          >
            <MaterialCommunityIcons name="certificate" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>{t("View Certificate")}</Text>
          </TouchableOpacity>
        )}

        {/* Show sale buttons if available (regardless of quality status) */}
        {output.status === "available" && (
          <View style={styles.saleButtonsRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.secondaryAction,
                { flex: 1, marginRight: 8 },
              ]}
              onPress={() => openSaleModal(output, "marketplace")}
            >
              <MaterialCommunityIcons
                name="storefront"
                size={18}
                color="#2A9D8F"
              />
              <Text style={styles.secondaryActionText}>
                {t("List on Market")}
              </Text>
            </TouchableOpacity>

            {output.cropId?.hasMSP && (
              <TouchableOpacity
                style={[styles.actionButton, styles.mspAction, { flex: 1 }]}
                onPress={() => openSaleModal(output, "msp")}
              >
                <MaterialCommunityIcons name="bank" size={18} color="#E76F51" />
                <Text style={styles.mspActionText}>{t("Sell at MSP")}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Show pending info */}
        {output.qualityStatus === "pending" && (
          <View style={styles.pendingInfo}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color="#F4A261"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.pendingText}>
                {t("Quality inspection in progress...")}
              </Text>
              <TouchableOpacity
                onPress={() => handleViewCertificate(output)}
                style={{ marginTop: 4 }}
              >
                <Text style={styles.trackLink}>{t("Track status")} →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Show rejected info */}
        {output.qualityStatus === "rejected" && (
          <View style={styles.rejectedInfo}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={20}
              color="#E76F51"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.rejectedText}>
                {t("Quality inspection failed")}
              </Text>
              <TouchableOpacity
                onPress={() => handleViewCertificate(output)}
                style={{ marginTop: 4 }}
              >
                <Text style={styles.detailsLink}>{t("View details")} →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Show listed info */}
        {output.status === "listed-for-sale" && (
          <View style={styles.listedInfo}>
            <View style={styles.listedInfoContent}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="#457B9D"
              />
              <Text style={styles.listedText}>{t("Listed for sale")}</Text>
            </View>

            <TouchableOpacity
              style={styles.viewListingBtn}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/listing-details",
                  params: { id: output.saleId },
                })
              }
            >
              <Text style={styles.viewListingText}>{t("View Details")}</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={14}
                color="#457B9D"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const FilterButton = ({ label, value }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[styles.filterText, filter === value && styles.filterTextActive]}
      >
        {t(label)}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
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
        <Text style={styles.headerTitle}>{t("My Harvest")}</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => router.push("/quality")}
        >
          <MaterialCommunityIcons
            name="certificate"
            size={24}
            color="#2A9D8F"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <FilterButton label="All" value="all" />
          <FilterButton label="Available" value="available" />
          <FilterButton label="Quality Pending" value="quality-pending" />
          <FilterButton label="Certified" value="quality-approved" />
          <FilterButton label="Quality Rejected" value="quality-rejected" />
          <FilterButton label="Listed" value="listed-for-sale" />
        </ScrollView>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{filteredOutputs.length}</Text>
            <Text style={styles.statLabel}>{t("Total Harvests")}</Text>
          </View>
          {/* <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#2A9D8F" }]}>
              {cropOutputs.filter((o) => o.status === "available").length}
            </Text>
            <Text style={styles.statLabel}>{t("Available")}</Text>
          </View> */}
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#4CAF50" }]}>
              {cropOutputs.filter((o) => o.qualityStatus === "approved").length}
            </Text>
            <Text style={styles.statLabel}>{t("Certified")}</Text>
          </View>
        </View>

        {filteredOutputs.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="tray-remove" size={64} color="#CCC" />
            <Text style={styles.emptyText}>{t("No crop outputs yet")}</Text>
            <Text style={styles.emptySubtext}>
              {filter === "all"
                ? t("Harvest crops from your fields to see them here")
                : t("No {{filter}} harvests found", {
                    filter: filter.replace("-", " "),
                  })}
            </Text>
          </View>
        ) : (
          <View style={styles.outputsList}>
            {filteredOutputs.map(renderOutputCard)}
          </View>
        )}
      </ScrollView>

      {/* Sale Modal */}
      <Modal
        visible={showSaleModal}
        transparent
        animationType="slide"
        onRequestClose={closeSaleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {saleType === "marketplace"
                  ? t("List on Marketplace")
                  : t("Sell to Government")}
              </Text>
              <TouchableOpacity onPress={closeSaleModal}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedOutput && (
              <>
                <View style={styles.modalCropInfo}>
                  <MaterialCommunityIcons
                    name={selectedOutput.cropId?.icon || "sprout"}
                    size={32}
                    color="#2A9D8F"
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.modalCropName}>
                      {selectedOutput.cropId?.cropName}
                    </Text>
                    <Text style={styles.modalCropQuantity}>
                      {selectedOutput.quantity} {selectedOutput.unit}
                    </Text>
                  </View>
                </View>

                {saleType === "marketplace" ? (
                  <>
                    <Text style={styles.modalLabel}>
                      {t("Set Minimum Price")}
                    </Text>
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder={t("Enter minimum price")}
                        keyboardType="numeric"
                        value={minimumPrice}
                        onChangeText={setMinimumPrice}
                      />
                      <Text style={styles.unitText}>
                        /{selectedOutput.unit}
                      </Text>
                    </View>
                    <Text style={styles.modalHint}>
                      {t(
                        "Set the lowest price you're willing to accept per {{unit}}",
                        { unit: selectedOutput.unit }
                      )}
                    </Text>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonPrimary]}
                      onPress={handleListForMarketplace}
                    >
                      <Text style={styles.modalButtonText}>
                        {t("List on Marketplace")}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {loadingMSP ? (
                      <ActivityIndicator size="large" color="#2A9D8F" />
                    ) : mspData ? (
                      <>
                        <View style={styles.mspInfoCard}>
                          <Text style={styles.mspLabel}>{t("MSP Rate")}</Text>
                          <Text style={styles.mspPrice}>
                            ₹{mspData.price}/{mspData.unit}
                          </Text>
                          <View style={styles.mspDivider} />
                          <Text style={styles.mspLabel}>
                            {t("Total Amount")}
                          </Text>
                          <Text style={styles.mspTotal}>
                            ₹
                            {(
                              mspData.price * selectedOutput.quantity
                            ).toLocaleString()}
                          </Text>
                        </View>

                        <View style={styles.mspNote}>
                          <MaterialCommunityIcons
                            name="information"
                            size={20}
                            color="#E76F51"
                          />
                          <Text style={styles.mspNoteText}>
                            {t(
                              "This crop will be sold to the government and will not appear on the marketplace"
                            )}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[styles.modalButton, styles.modalButtonMSP]}
                          onPress={handleListForMSP}
                        >
                          <Text style={styles.modalButtonText}>
                            {t("Submit to Government")}
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={styles.noMspCard}>
                        <MaterialCommunityIcons
                          name="alert-circle"
                          size={48}
                          color="#CCC"
                        />
                        <Text style={styles.noMspText}>
                          {t("MSP not available for this crop")}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
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
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F8F7",
    justifyContent: "center",
    alignItems: "center",
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
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
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
  outputsList: {
    padding: 20,
    paddingTop: 0,
  },
  outputCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleText: {
    marginLeft: 12,
  },
  cropName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
  },
  fieldName: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statusBadges: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
  },
  cardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  cardActions: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  saleButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryAction: {
    backgroundColor: "#2A9D8F",
  },
  successAction: {
    backgroundColor: "#4CAF50",
  },
  secondaryAction: {
    backgroundColor: "#F0F8F7",
    borderWidth: 1,
    borderColor: "#2A9D8F",
  },
  mspAction: {
    backgroundColor: "#FFF0EB",
    borderWidth: 1,
    borderColor: "#E76F51",
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryActionText: {
    color: "#2A9D8F",
    fontSize: 14,
    fontWeight: "600",
  },
  mspActionText: {
    color: "#E76F51",
    fontSize: 14,
    fontWeight: "600",
  },
  pendingInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    backgroundColor: "#FFF8F0",
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 14,
    color: "#F4A261",
    fontWeight: "600",
  },
  trackLink: {
    fontSize: 12,
    color: "#F4A261",
    textDecorationLine: "underline",
  },
  rejectedInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
  },
  rejectedText: {
    fontSize: 14,
    color: "#E76F51",
    fontWeight: "600",
  },
  detailsLink: {
    fontSize: 12,
    color: "#E76F51",
    textDecorationLine: "underline",
  },
  listedInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E1F5FE",
  },
  listedInfoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  listedText: {
    fontSize: 14,
    color: "#457B9D",
    fontWeight: "600",
  },
  viewListingBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(69, 123, 157, 0.2)",
    shadowColor: "#457B9D",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  viewListingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#457B9D",
  },
  emptyState: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
  },
  modalCropInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 20,
  },
  modalCropName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
  },
  modalCropQuantity: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 8,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#264653",
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 12,
    color: "#264653",
  },
  unitText: {
    fontSize: 14,
    color: "#666",
  },
  modalHint: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
    marginBottom: 20,
  },
  modalButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  modalButtonPrimary: {
    backgroundColor: "#2A9D8F",
  },
  modalButtonMSP: {
    backgroundColor: "#E76F51",
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  mspInfoCard: {
    backgroundColor: "#F8F9FA",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  mspLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  mspPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E76F51",
    marginBottom: 16,
  },
  mspDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 16,
  },
  mspTotal: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
  },
  mspNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    backgroundColor: "#FFF0EB",
    borderRadius: 8,
    marginBottom: 16,
  },
  mspNoteText: {
    flex: 1,
    fontSize: 12,
    color: "#E76F51",
    lineHeight: 18,
  },
  noMspCard: {
    alignItems: "center",
    padding: 40,
  },
  noMspText: {
    fontSize: 16,
    color: "#888",
    marginTop: 16,
    textAlign: "center",
  },
});
