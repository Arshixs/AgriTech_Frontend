import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../src/components/common/Button";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";

const { width, height } = Dimensions.get("window");

export default function MyFarmScreen() {
  const router = useRouter();
  const [selectedField, setSelectedField] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({
    name: "",
    area: "",
    crop: "",
  });

  useEffect(() => {
    // Mock data - replace with API call
    setFields([
      {
        id: 1,
        name: "Field A",
        area: 5.5,
        crop: "Rice",
        soilType: "Loamy",
        status: "Growing",
        plantedDate: "2025-01-15",
        expectedHarvest: "2025-05-20",
        health: 92,
        irrigation: "Drip",
        coordinates: { lat: 25.3176, lng: 82.9739 },
        color: "#2A9D8F",
      },
      {
        id: 2,
        name: "Field B",
        area: 8.2,
        crop: "Wheat",
        soilType: "Clay",
        status: "Preparing",
        plantedDate: null,
        expectedHarvest: "2025-06-15",
        health: null,
        irrigation: "Sprinkler",
        coordinates: { lat: 25.3196, lng: 82.9759 },
        color: "#F4A261",
      },
      {
        id: 3,
        name: "Field C",
        area: 3.8,
        crop: "Tomato",
        soilType: "Sandy Loam",
        status: "Growing",
        plantedDate: "2025-02-01",
        expectedHarvest: "2025-04-30",
        health: 85,
        irrigation: "Drip",
        coordinates: { lat: 25.3156, lng: 82.9779 },
        color: "#E76F51",
      },
      {
        id: 4,
        name: "Field D",
        area: 6.0,
        crop: "Cotton",
        soilType: "Black Soil",
        status: "Growing",
        plantedDate: "2025-01-10",
        expectedHarvest: "2025-06-10",
        health: 88,
        irrigation: "Flood",
        coordinates: { lat: 25.3136, lng: 82.9719 },
        color: "#606C38",
      },
    ]);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Growing":
        return "#2A9D8F";
      case "Preparing":
        return "#F4A261";
      case "Harvesting":
        return "#E9C46A";
      case "Fallow":
        return "#888";
      default:
        return "#666";
    }
  };

  const getHealthColor = (health) => {
    if (!health) return "#888";
    if (health >= 80) return "#2A9D8F";
    if (health >= 60) return "#F4A261";
    return "#E76F51";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not planted";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const calculateDaysToHarvest = (harvestDate) => {
    if (!harvestDate) return null;
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diff = Math.ceil((harvest - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const totalArea = fields.reduce((sum, field) => sum + field.area, 0);
  const activeFields = fields.filter((f) => f.status === "Growing").length;
  const avgHealth = Math.round(
    fields.filter((f) => f.health).reduce((sum, f) => sum + f.health, 0) /
      fields.filter((f) => f.health).length
  );

  const handleAddField = () => {
    if (!newField.name || !newField.area || !newField.crop) {
      alert("Please fill all fields");
      return;
    }

    const field = {
      id: fields.length + 1,
      name: newField.name,
      area: parseFloat(newField.area),
      crop: newField.crop,
      soilType: "Loamy",
      status: "Preparing",
      plantedDate: null,
      expectedHarvest: null,
      health: null,
      irrigation: "Drip",
      coordinates: {
        lat: 25.3176 + Math.random() * 0.01,
        lng: 82.9739 + Math.random() * 0.01,
      },
      color: ["#2A9D8F", "#F4A261", "#E76F51", "#606C38"][
        Math.floor(Math.random() * 4)
      ],
    };

    setFields([...fields, field]);
    setNewField({ name: "", area: "", crop: "" });
    setShowAddModal(false);
  };

  const renderMap = () => (
    <View style={styles.mapContainer}>
      {/* Map Header */}
      <View style={styles.mapHeader}>
        <MaterialCommunityIcons
          name="map-marker-radius"
          size={20}
          color="#2A9D8F"
        />
        <Text style={styles.mapTitle}>Farm Location: Varanasi, UP</Text>
      </View>

      {/* Simple Map Representation */}
      <View style={styles.mapView}>
        <View style={styles.mapGrid}>
          {/* Grid lines for visual effect */}
          {[...Array(5)].map((_, i) => (
            <View
              key={`h-${i}`}
              style={[styles.gridLineH, { top: `${i * 25}%` }]}
            />
          ))}
          {[...Array(5)].map((_, i) => (
            <View
              key={`v-${i}`}
              style={[styles.gridLineV, { left: `${i * 25}%` }]}
            />
          ))}

          {/* Field Markers */}
          {fields.map((field, index) => (
            <TouchableOpacity
              key={field.id}
              style={[
                styles.fieldMarker,
                {
                  backgroundColor: field.color,
                  left: `${20 + index * 20}%`,
                  top: `${30 + (index % 2) * 30}%`,
                },
              ]}
              onPress={() =>
                setSelectedField(field.id === selectedField ? null : field.id)
              }
            >
              <Text style={styles.markerText}>
                {field.name[field.name.length - 1]}
              </Text>
              {selectedField === field.id && (
                <View style={styles.markerLabel}>
                  <Text style={styles.markerLabelText}>{field.name}</Text>
                  <Text style={styles.markerLabelSubtext}>
                    {field.area} acres
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Farm Center Marker */}
          <View style={styles.centerMarker}>
            <MaterialCommunityIcons name="home" size={24} color="#264653" />
          </View>
        </View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapButton}>
            <MaterialCommunityIcons name="plus" size={20} color="#264653" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapButton}>
            <MaterialCommunityIcons name="minus" size={20} color="#264653" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapButton}>
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={20}
              color="#264653"
            />
          </TouchableOpacity>
        </View>

        {/* Map Legend */}
        <View style={styles.mapLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#2A9D8F" }]} />
            <Text style={styles.legendText}>Growing</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#F4A261" }]} />
            <Text style={styles.legendText}>Preparing</Text>
          </View>
        </View>
      </View>

      {/* Map Footer Info */}
      <View style={styles.mapFooter}>
        <Text style={styles.mapFooterText}>
          Tap on field markers to see details • Total area:{" "}
          {totalArea.toFixed(1)} acres
        </Text>
      </View>
    </View>
  );

  const renderFieldCard = (field) => {
    const daysToHarvest = calculateDaysToHarvest(field.expectedHarvest);

    return (
      <TouchableOpacity
        key={field.id}
        style={styles.fieldCard}
        // onPress={() => router.push(`/field-details?id=${field.id}`)}
        activeOpacity={1}
      >
        {/* Field Header */}
        <View style={styles.fieldHeader}>
          <View style={styles.fieldTitleRow}>
            <View
              style={[
                styles.fieldColorIndicator,
                { backgroundColor: field.color },
              ]}
            />
            <View style={styles.fieldTitleContainer}>
              <Text style={styles.fieldName}>{field.name}</Text>
              <Text style={styles.fieldArea}>
                {field.area} acres • {field.soilType}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(field.status) },
            ]}
          >
            <Text style={styles.statusText}>{field.status}</Text>
          </View>
        </View>

        {/* Crop Info */}
        <View style={styles.cropSection}>
          <View style={styles.cropIconContainer}>
            <MaterialCommunityIcons name="sprout" size={20} color="#2A9D8F" />
          </View>
          <View style={styles.cropInfo}>
            <Text style={styles.cropLabel}>Current Crop</Text>
            <Text style={styles.cropName}>{field.crop}</Text>
          </View>
          {field.health && (
            <View style={styles.healthContainer}>
              <MaterialCommunityIcons
                name="heart-pulse"
                size={18}
                color={getHealthColor(field.health)}
              />
              <Text
                style={[
                  styles.healthText,
                  { color: getHealthColor(field.health) },
                ]}
              >
                {field.health}%
              </Text>
            </View>
          )}
        </View>

        {/* Field Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="calendar-check"
              size={16}
              color="#666"
            />
            <Text style={styles.detailText}>
              Planted: {formatDate(field.plantedDate)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="water" size={16} color="#666" />
            <Text style={styles.detailText}>{field.irrigation}</Text>
          </View>
        </View>

        {/* Harvest Countdown */}
        {daysToHarvest !== null && (
          <View style={styles.harvestSection}>
            <MaterialCommunityIcons
              name="timer-sand"
              size={18}
              color="#F4A261"
            />
            <Text style={styles.harvestText}>
              {daysToHarvest} days until harvest (
              {formatDate(field.expectedHarvest)})
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons
              name="water-outline"
              size={18}
              color="#2A9D8F"
            />
            <Text style={styles.actionText}>Irrigate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons
              name="chart-line"
              size={18}
              color="#2A9D8F"
            />
            <Text style={styles.actionText}>Monitor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons
              name="notebook-outline"
              size={18}
              color="#2A9D8F"
            />
            <Text style={styles.actionText}>Logs</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.header}>My Farm</Text>

          {/* Summary Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons
                name="land-fields"
                size={24}
                color="#2A9D8F"
              />
              <Text style={styles.statValue}>{totalArea.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Total Acres</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="sprout" size={24} color="#606C38" />
              <Text style={styles.statValue}>
                {activeFields}/{fields.length}
              </Text>
              <Text style={styles.statLabel}>Active Fields</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons
                name="heart-pulse"
                size={24}
                color="#E76F51"
              />
              <Text style={styles.statValue}>{avgHealth}%</Text>
              <Text style={styles.statLabel}>Avg Health</Text>
            </View>
          </View>

          {/* Map Section */}
          {renderMap()}

          {/* Fields List */}
          <View style={styles.fieldsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Fields</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Field</Text>
              </TouchableOpacity>
            </View>

            {fields.map((field) => renderFieldCard(field))}
          </View>

          {/* Farm Insights */}
          <View style={styles.insightsCard}>
            <MaterialCommunityIcons
              name="lightbulb"
              size={24}
              color="#F4A261"
            />
            <Text style={styles.insightsTitle}>Farm Insights</Text>
            <Text style={styles.insightText}>
              • Field A is performing excellently with 92% health score
            </Text>
            <Text style={styles.insightText}>
              • Consider rotating crops in Field B after current season
            </Text>
            <Text style={styles.insightText}>
              • 3 fields ready for harvest in next 60 days
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Field Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Field</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <FontAwesome name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Field Name</Text>
                <TextInput
                  style={styles.input}
                  value={newField.name}
                  onChangeText={(text) =>
                    setNewField({ ...newField, name: text })
                  }
                  placeholder="e.g., Field E"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Area (acres)</Text>
                <TextInput
                  style={styles.input}
                  value={newField.area}
                  onChangeText={(text) =>
                    setNewField({ ...newField, area: text })
                  }
                  placeholder="e.g., 5.5"
                  keyboardType="decimal-pad"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Crop Type</Text>
                <TextInput
                  style={styles.input}
                  value={newField.crop}
                  onChangeText={(text) =>
                    setNewField({ ...newField, crop: text })
                  }
                  placeholder="e.g., Rice"
                  placeholderTextColor="#888"
                />
              </View>

              <Button title="Add Field" onPress={handleAddField} />
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  mapContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
    marginLeft: 8,
  },
  mapView: {
    height: 300,
    backgroundColor: "#F0F4F3",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  mapGrid: {
    flex: 1,
    position: "relative",
  },
  gridLineH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#D0E8E4",
  },
  gridLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#D0E8E4",
  },
  fieldMarker: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  markerText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  markerLabel: {
    position: "absolute",
    top: -40,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 80,
  },
  markerLabelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#264653",
  },
  markerLabelSubtext: {
    fontSize: 10,
    color: "#666",
  },
  centerMarker: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2A9D8F",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mapControls: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  mapLegend: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: "#666",
  },
  mapFooter: {
    marginTop: 12,
    alignItems: "center",
  },
  mapFooterText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
  fieldsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A9D8F",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  fieldCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  fieldTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fieldColorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  fieldTitleContainer: {
    flex: 1,
  },
  fieldName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
  },
  fieldArea: {
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
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  cropSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  cropIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#E8F5F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cropInfo: {
    flex: 1,
  },
  cropLabel: {
    fontSize: 12,
    color: "#666",
  },
  cropName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
    marginTop: 2,
  },
  healthContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  healthText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  harvestSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8F0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  harvestText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 13,
    color: "#2A9D8F",
    fontWeight: "600",
    marginLeft: 6,
  },
  insightsCard: {
    backgroundColor: "#FFF8F0",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#264653",
    marginTop: 8,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    fontSize: 16,
    color: "#333",
  },
  cancelButton: {
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
});
