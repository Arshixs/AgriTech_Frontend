// File: app/(tabs)/quality.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import Button from "../../src/components/common/Button";
import { useAuth } from "../../src/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../secret";

export default function QualityCertificatesScreen() {
  const { user } = useAuth();
  const authToken = user?.token;

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [fields, setFields] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fieldId: "",
    cropName: "",
    quantity: "",
    unit: "quintal",
    harvestDate: new Date().toISOString().split("T")[0],
    storageLocation: "",
  });

  useEffect(() => {
    if (authToken) {
      fetchData();
    }
  }, [authToken]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };

      // Fetch quality requests
      const reqRes = await fetch(
        `${API_BASE_URL}/api/quality/farmer/requests`,
        {
          headers,
        }
      );
      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(data.requests || []);
      }

      // Fetch fields for dropdown
      const fieldsRes = await fetch(`${API_BASE_URL}/api/farm/fields`, {
        headers,
      });
      if (fieldsRes.ok) {
        const fieldsData = await fieldsRes.json();
        setFields(fieldsData.fields || []);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!formData.fieldId || !formData.cropName || !formData.quantity) {
      Alert.alert("Validation", "Please fill all required fields");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/quality/farmer/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert(
          "Success",
          "Quality inspection request created successfully"
        );
        setShowCreateModal(false);
        fetchData();
        setFormData({
          fieldId: "",
          cropName: "",
          quantity: "",
          unit: "quintal",
          harvestDate: new Date().toISOString().split("T")[0],
          storageLocation: "",
        });
      } else {
        Alert.alert("Error", data.message || "Failed to create request");
      }
    } catch (error) {
      console.error("Create Request Error:", error);
      Alert.alert("Error", "Network error");
    } finally {
      setCreating(false);
    }
  };

  const handleViewDetails = async (request) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/quality/farmer/request/${request._id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setSelectedRequest(data.request);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Fetch Details Error:", error);
      Alert.alert("Error", "Failed to load details");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#2A9D8F";
      case "rejected":
        return "#E76F51";
      case "in-progress":
        return "#F4A261";
      default:
        return "#888";
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "FAQ":
        return "#2A9D8F";
      case "A":
        return "#4CAF50";
      case "B":
        return "#F4A261";
      case "C":
        return "#FF9800";
      default:
        return "#888";
    }
  };

  const renderRequestCard = (request) => (
    <TouchableOpacity
      key={request._id}
      style={styles.requestCard}
      onPress={() => handleViewDetails(request)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <MaterialCommunityIcons name="sprout" size={24} color="#2A9D8F" />
          <View style={styles.titleText}>
            <Text style={styles.cropName}>{request.cropName}</Text>
            <Text style={styles.fieldName}>
              {request.fieldId?.name || "Unknown Field"}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(request.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="weight" size={16} color="#666" />
          <Text style={styles.detailText}>
            {request.quantity} {request.unit}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(request.harvestDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {request.grade && (
        <View style={styles.gradeSection}>
          <View
            style={[
              styles.gradeBadge,
              { backgroundColor: getGradeColor(request.grade) },
            ]}
          >
            <Text style={styles.gradeText}>Grade: {request.grade}</Text>
          </View>
          {request.certificateNumber && (
            <Text style={styles.certNumber}>
              Cert: {request.certificateNumber}
            </Text>
          )}
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.lotId}>Lot ID: {request._id.slice(-8)}</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#888" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quality Certificates</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{requests.length}</Text>
            <Text style={styles.statLabel}>Total Requests</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {requests.filter((r) => r.status === "approved").length}
            </Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {requests.filter((r) => r.status === "pending").length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Requests List */}
        <View style={styles.requestsList}>
          {requests.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="certificate-outline"
                size={64}
                color="#CCC"
              />
              <Text style={styles.emptyText}>No quality requests yet</Text>
              <Text style={styles.emptySubtext}>
                Create a request to get your crops graded
              </Text>
            </View>
          ) : (
            requests.map((request) => renderRequestCard(request))
          )}
        </View>
      </ScrollView>

      {/* Create Request Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Quality Inspection</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Field *</Text>
                <View style={styles.pickerContainer}>
                  {fields.map((field) => (
                    <TouchableOpacity
                      key={field._id}
                      style={[
                        styles.fieldOption,
                        formData.fieldId === field._id &&
                          styles.fieldOptionSelected,
                      ]}
                      onPress={() =>
                        setFormData({
                          ...formData,
                          fieldId: field._id,
                          cropName: field.crop,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.fieldOptionText,
                          formData.fieldId === field._id &&
                            styles.fieldOptionTextSelected,
                        ]}
                      >
                        {field.name} ({field.area} acres)
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Crop Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.cropName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, cropName: text })
                  }
                  placeholder="e.g., Basmati Rice"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.quantity}
                  onChangeText={(text) =>
                    setFormData({ ...formData, quantity: text })
                  }
                  placeholder="e.g., 50"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Unit</Text>
                <View style={styles.unitRow}>
                  {["quintal", "kg", "ton"].map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitButton,
                        formData.unit === unit && styles.unitButtonSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, unit })}
                    >
                      <Text
                        style={[
                          styles.unitButtonText,
                          formData.unit === unit &&
                            styles.unitButtonTextSelected,
                        ]}
                      >
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Storage Location</Text>
                <TextInput
                  style={styles.input}
                  value={formData.storageLocation}
                  onChangeText={(text) =>
                    setFormData({ ...formData, storageLocation: text })
                  }
                  placeholder="e.g., Warehouse A"
                />
              </View>

              <Button
                title={creating ? "Creating..." : "Submit Request"}
                onPress={handleCreateRequest}
                loading={creating}
                style={{ marginTop: 20 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Certificate Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <ScrollView style={styles.modalBody}>
                {/* Certificate Info */}
                {selectedRequest.certificateQRCode && (
                  <View style={styles.certificateSection}>
                    <Image
                      source={{ uri: selectedRequest.certificateQRCode }}
                      style={styles.qrCode}
                    />
                    <Text style={styles.certificateNumber}>
                      {selectedRequest.certificateNumber}
                    </Text>
                    <View
                      style={[
                        styles.largGradeBadge,
                        {
                          backgroundColor: getGradeColor(selectedRequest.grade),
                        },
                      ]}
                    >
                      <Text style={styles.largeGradeText}>
                        Grade: {selectedRequest.grade}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Request Details */}
                <View style={styles.detailsSection}>
                  <DetailRow label="Crop" value={selectedRequest.cropName} />
                  <DetailRow
                    label="Quantity"
                    value={`${selectedRequest.quantity} ${selectedRequest.unit}`}
                  />
                  <DetailRow
                    label="Field"
                    value={selectedRequest.fieldId?.name || "N/A"}
                  />
                  <DetailRow
                    label="Harvest Date"
                    value={new Date(
                      selectedRequest.harvestDate
                    ).toLocaleDateString()}
                  />
                  <DetailRow
                    label="Status"
                    value={selectedRequest.status.toUpperCase()}
                  />
                  {selectedRequest.assignedOfficer && (
                    <DetailRow
                      label="Inspector"
                      value={selectedRequest.assignedOfficer.name || "N/A"}
                    />
                  )}
                </View>

                {/* Quality Parameters */}
                {selectedRequest.qualityParams && (
                  <View style={styles.qualitySection}>
                    <Text style={styles.sectionTitle}>Quality Parameters</Text>
                    {Object.entries(selectedRequest.qualityParams).map(
                      ([key, value]) =>
                        value && (
                          <DetailRow
                            key={key}
                            label={key.charAt(0).toUpperCase() + key.slice(1)}
                            value={
                              typeof value === "number" ? `${value}%` : value
                            }
                          />
                        )
                    )}
                  </View>
                )}

                {selectedRequest.gradingNotes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.sectionTitle}>Inspector Notes</Text>
                    <Text style={styles.notesText}>
                      {selectedRequest.gradingNotes}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRowContainer}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
  addButton: {
    backgroundColor: "#2A9D8F",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  statsRow: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
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
  },
  requestsList: {
    padding: 20,
    paddingTop: 0,
  },
  requestCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  cardDetails: {
    flexDirection: "row",
    gap: 20,
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
  gradeSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginBottom: 8,
  },
  gradeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  gradeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  certNumber: {
    fontSize: 12,
    color: "#666",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lotId: {
    fontSize: 12,
    color: "#888",
    fontFamily: "monospace",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
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
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    gap: 8,
  },
  fieldOption: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  fieldOptionSelected: {
    backgroundColor: "#E8F5F3",
    borderColor: "#2A9D8F",
  },
  fieldOptionText: {
    fontSize: 14,
    color: "#666",
  },
  fieldOptionTextSelected: {
    color: "#2A9D8F",
    fontWeight: "600",
  },
  unitRow: {
    flexDirection: "row",
    gap: 12,
  },
  unitButton: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  unitButtonSelected: {
    backgroundColor: "#2A9D8F",
    borderColor: "#2A9D8F",
  },
  unitButtonText: {
    fontSize: 14,
    color: "#666",
  },
  unitButtonTextSelected: {
    color: "#FFF",
    fontWeight: "600",
  },
  certificateSection: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 20,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  certificateNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 12,
  },
  largGradeBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  largeGradeText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  detailsSection: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#264653",
  },
  qualitySection: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 12,
  },
  notesSection: {
    backgroundColor: "#FFF8F0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
