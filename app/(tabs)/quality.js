// File: app/(tabs)/quality.js - UPDATED VERSION

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../secret";
import { useRouter } from "expo-router";

export default function QualityCertificatesScreen() {
  const { user } = useAuth();
  const authToken = user?.token;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected

  useEffect(() => {
    if (authToken) {
      fetchRequests();
    }
  }, [authToken, filter]);

  const fetchRequests = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      const res = await fetch(`${API_BASE_URL}/api/quality/farmer/requests`, {
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        let filteredRequests = data.requests || [];

        // Apply filter
        if (filter !== "all") {
          filteredRequests = filteredRequests.filter(
            (r) => r.status === filter
          );
        }

        setRequests(filteredRequests);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Failed to load quality requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      console.log("Request details:", request);

    //   const cropRes = await fetch(
    //     `${API_BASE_URL}/api/crops/crops`,
    //     {
    //       headers: { Authorization: `Bearer ${authToken}` },
    //     }
    //   );

    //   const cropsData = await res.json();
    //   data.request

      
      if (res.ok) {
        const data = await res.json();
        setSelectedRequest(data.request);
        console.log(data.request);
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
        return "#4CAF50";
      case "rejected":
        return "#E76F51";
      case "in-progress":
        return "#F4A261";
      case "pending":
        return "#457B9D";
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
          <MaterialCommunityIcons
            name={request.cropId?.icon || "sprout"}
            size={24}
            color="#2A9D8F"
          />
          <View style={styles.titleText}>
            <Text style={styles.cropName}>
              {request.cropId?.cropName || "Unknown Crop"}
            </Text>
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
            {request.status.charAt(0).toUpperCase() +
              request.status.slice(1).replace("-", " ")}
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
        {request.storageLocation && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="warehouse" size={16} color="#666" />
            <Text style={styles.detailText}>{request.storageLocation}</Text>
          </View>
        )}
      </View>

      {request.grade && request.status === "approved" && (
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
            <Text style={styles.certNumber}>{request.certificateNumber}</Text>
          )}
        </View>
      )}

      {request.status === "in-progress" && (
        <View style={styles.statusInfo}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={20}
            color="#F4A261"
          />
          <Text style={styles.statusInfoText}>Inspection in progress</Text>
        </View>
      )}

      {request.status === "pending" && (
        <View style={styles.statusInfo}>
          <MaterialCommunityIcons
            name="clock-alert-outline"
            size={20}
            color="#457B9D"
          />
          <Text style={styles.statusInfoText}>Awaiting assignment</Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.lotId}>ID: {request._id.slice(-8)}</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#888" />
      </View>
    </TouchableOpacity>
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
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
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
          style={styles.infoButton}
          onPress={() => router.push("/my-harvest")}
        >
          <MaterialCommunityIcons name="harvest" size={24} color="#2A9D8F" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FilterButton label="All" value="all" />
        <FilterButton label="Pending" value="pending" />
        <FilterButton label="Approved" value="approved" />
        <FilterButton label="Rejected" value="rejected" />
      </View>

      <ScrollView style={styles.container}>
        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{requests.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: "#4CAF50" }]}>
              {requests.filter((r) => r.status === "approved").length}
            </Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: "#457B9D" }]}>
              {requests.filter((r) => r.status === "pending").length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: "#F4A261" }]}>
              {requests.filter((r) => r.status === "in-progress").length}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
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
              <Text style={styles.emptyText}>
                {filter === "all"
                  ? "No quality requests yet"
                  : `No ${filter} requests`}
              </Text>
              <Text style={styles.emptySubtext}>
                Go to My Harvest to request quality inspection
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push("/my-harvest")}
              >
                <Text style={styles.emptyButtonText}>View My Harvest</Text>
              </TouchableOpacity>
            </View>
          ) : (
            requests.map((request) => renderRequestCard(request))
          )}
        </View>
      </ScrollView>

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
                {/* Certificate Section - Only for approved */}
                {selectedRequest.status === "approved" &&
                  selectedRequest.certificateQRCode && (
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
                          styles.largeGradeBadge,
                          {
                            backgroundColor: getGradeColor(
                              selectedRequest.grade
                            ),
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
                  <Text style={styles.sectionTitle}>Request Information</Text>
                  <DetailRow
                    label="Crop"
                    value={selectedRequest.cropId?.cropName || "N/A"}
                  />
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
                  {selectedRequest.storageLocation && (
                    <DetailRow
                      label="Storage"
                      value={selectedRequest.storageLocation}
                    />
                  )}
                </View>

                {/* Lab Information */}
                {selectedRequest.labName && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Laboratory Details</Text>
                    <DetailRow
                      label="Lab Name"
                      value={selectedRequest.labName}
                    />
                    {selectedRequest.labLocation && (
                      <DetailRow
                        label="Location"
                        value={selectedRequest.labLocation}
                      />
                    )}
                    {selectedRequest.labCertificationNumber && (
                      <DetailRow
                        label="Cert Number"
                        value={selectedRequest.labCertificationNumber}
                      />
                    )}
                  </View>
                )}

                {/* Inspector Info */}
                {selectedRequest.assignedOfficer && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Inspector Details</Text>
                    <DetailRow
                      label="Name"
                      value={selectedRequest.assignedOfficer.name || "N/A"}
                    />
                    {selectedRequest.assignedOfficer.employeeId && (
                      <DetailRow
                        label="Employee ID"
                        value={selectedRequest.assignedOfficer.employeeId}
                      />
                    )}
                    {selectedRequest.inspectionDate && (
                      <DetailRow
                        label="Inspection Date"
                        value={new Date(
                          selectedRequest.inspectionDate
                        ).toLocaleDateString()}
                      />
                    )}
                  </View>
                )}

                {/* Quality Parameters */}
                {selectedRequest.qualityParams && (
                  <View style={styles.qualitySection}>
                    <Text style={styles.sectionTitle}>Quality Parameters</Text>
                    {selectedRequest.qualityParams.moisture && (
                      <DetailRow
                        label="Moisture"
                        value={`${selectedRequest.qualityParams.moisture}%`}
                      />
                    )}
                    {selectedRequest.qualityParams.foreignMatter && (
                      <DetailRow
                        label="Foreign Matter"
                        value={`${selectedRequest.qualityParams.foreignMatter}%`}
                      />
                    )}
                    {selectedRequest.qualityParams.damagedGrains && (
                      <DetailRow
                        label="Damaged Grains"
                        value={`${selectedRequest.qualityParams.damagedGrains}%`}
                      />
                    )}
                    {selectedRequest.qualityParams.discoloredGrains && (
                      <DetailRow
                        label="Discolored Grains"
                        value={`${selectedRequest.qualityParams.discoloredGrains}%`}
                      />
                    )}
                    {selectedRequest.qualityParams.weevilDamage && (
                      <DetailRow
                        label="Weevil Damage"
                        value={`${selectedRequest.qualityParams.weevilDamage}%`}
                      />
                    )}
                  </View>
                )}

                {/* Notes */}
                {selectedRequest.gradingNotes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.sectionTitle}>Inspector Notes</Text>
                    <Text style={styles.notesText}>
                      {selectedRequest.gradingNotes}
                    </Text>
                  </View>
                )}

                {/* Rejection Reason */}
                {selectedRequest.rejectionReason && (
                  <View style={styles.rejectionSection}>
                    <Text style={styles.sectionTitle}>Rejection Reason</Text>
                    <Text style={styles.rejectionText}>
                      {selectedRequest.rejectionReason}
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
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F8F7",
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
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
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  statsRow: {
    flexDirection: "row",
    padding: 20,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
  },
  statLabel: {
    fontSize: 11,
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
    fontSize: 11,
    color: "#666",
    fontFamily: "monospace",
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginBottom: 8,
  },
  statusInfoText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
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
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: "#2A9D8F",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
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
  largeGradeBadge: {
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
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 12,
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
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  qualitySection: {
    backgroundColor: "#F0F8F7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  rejectionSection: {
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  rejectionText: {
    fontSize: 14,
    color: "#E76F51",
    lineHeight: 20,
    fontWeight: "500",
  },
});
