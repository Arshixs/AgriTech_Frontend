import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTranslation } from "react-i18next"; // Added for i18n
import Button from "../../src/components/common/Button";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";
import { API_BASE_URL } from "../../secret";

export default function MyFarmScreen() {
  const { user } = useAuth();
  const { t } = useTranslation(); // Initialize translation hook
  const authToken = user?.token;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]); 
  const [selectedField, setSelectedField] = useState(null);

  // Modals
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showUpdateCropModal, setShowUpdateCropModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [isMapModalVisible, setMapModalVisible] = useState(false);

  // Map & Location State
  const [tempCoords, setTempCoords] = useState(null);
  const mapRef = useRef(null);
  const [fetchingGps, setFetchingGps] = useState(false);
  const [previewRegion, setPreviewRegion] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 12,
    longitudeDelta: 12,
  });

  // Forms
  const [newField, setNewField] = useState({
    name: "",
    area: "",
    soilType: "",
    coordinates: null,
  });

  const [selectedCropId, setSelectedCropId] = useState("");
  const [harvestData, setHarvestData] = useState({
    quantity: "",
    unit: "quintal",
    storageLocation: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authToken) {
      fetchData();
    }
  }, [authToken]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      const fieldsRes = await fetch(`${API_BASE_URL}/api/farm/fields`, { headers });
      if (fieldsRes.ok) {
        const data = await fieldsRes.json();
        setFields(data.fields || []);
      }
      const cropsRes = await fetch(`${API_BASE_URL}/api/crops/crops`, { headers });
      if (cropsRes.ok) {
        const data = await cropsRes.json();
        setCrops(data.crops || []);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = useCallback((e) => {
    const coords = e.nativeEvent.coordinate;
    setTempCoords({ lat: coords.latitude, lng: coords.longitude });
  }, []);

  const getCurrentLocation = async () => {
    setFetchingGps(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('farmer.farm.alerts.error'), t('farmer.farm.alerts.location_denied'));
        return;
      }
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      setTempCoords({ lat: latitude, lng: longitude });
      const newRegion = { latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 };
      mapRef.current?.animateToRegion(newRegion, 500);
    } catch (error) {
      Alert.alert(t('farmer.farm.alerts.error'), t('farmer.farm.alerts.gps_failed'));
    } finally {
      setFetchingGps(false);
    }
  };

  const confirmMapLocation = () => {
    if (tempCoords) {
      setNewField(prev => ({ ...prev, coordinates: tempCoords }));
      setPreviewRegion({
        latitude: tempCoords.lat,
        longitude: tempCoords.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
    setMapModalVisible(false);
  };

  const handleAddField = async () => {
    if (!newField.name || !newField.area || !newField.coordinates) {
      Alert.alert(t('farmer.farm.alerts.validation'), t('farmer.farm.add_modal.validation_msg'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/farm/fields`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: newField.name,
          area: parseFloat(newField.area),
          soilType: newField.soilType || "Unknown",
          coordinates: newField.coordinates,
        }),
      });

      if (res.ok) {
        Alert.alert(t('farmer.farm.alerts.success'), t('farmer.farm.alerts.success_add'));
        setNewField({ name: "", area: "", soilType: "", coordinates: null });
        setShowAddFieldModal(false);
        fetchData();
      }
    } catch (error) {
      Alert.alert(t('farmer.farm.alerts.error'), t('farmer.farm.alerts.failed_add'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectCropForField = (field) => {
    setSelectedField(field);
    setSelectedCropId(field.cropId?._id || "");
    setShowUpdateCropModal(true);
  };

  const handleUpdateFieldCrop = async () => {
    if (!selectedCropId) {
      Alert.alert(t('farmer.farm.alerts.validation'), t('farmer.farm.plant_modal.choose'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/farm/fields/${selectedField._id}/crop`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          cropId: selectedCropId,
          plantedDate: new Date(),
          expectedHarvest: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        }),
      });

      if (res.ok) {
        Alert.alert(t('farmer.farm.alerts.success'), t('farmer.farm.alerts.success_plant'));
        setShowUpdateCropModal(false);
        fetchData();
      }
    } catch (error) {
      Alert.alert(t('farmer.farm.alerts.error'), t('farmer.farm.alerts.failed_plant'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenHarvestModal = (field) => {
    if (!field.cropId) {
      Alert.alert(t('farmer.farm.alerts.error'), t('farmer.farm.alerts.no_crop_error'));
      return;
    }
    setSelectedField(field);
    setHarvestData({
      quantity: "",
      unit: "quintal",
      storageLocation: "",
      notes: "",
    });
    setShowHarvestModal(true);
  };

  const handleHarvestCrop = async () => {
    if (!harvestData.quantity) {
      Alert.alert(t('farmer.farm.alerts.validation'), t('farmer.farm.harvest_modal.quantity'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/crop-output/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fieldId: selectedField._id,
          quantity: parseFloat(harvestData.quantity),
          unit: harvestData.unit,
          storageLocation: harvestData.storageLocation,
          notes: harvestData.notes,
        }),
      });

      if (res.ok) {
        Alert.alert(t('farmer.farm.alerts.success'), t('farmer.farm.alerts.success_harvest'));
        setShowHarvestModal(false);
        fetchData();
      }
    } catch (error) {
      Alert.alert(t('farmer.farm.alerts.error'), t('farmer.farm.alerts.failed_harvest'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Growing": return t('farmer.farm.fields.status.growing');
      case "Preparing": return t('farmer.farm.fields.status.preparing');
      case "Harvesting": return t('farmer.farm.fields.status.harvesting');
      case "Fallow": return t('farmer.farm.fields.status.fallow');
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Growing": return "#2A9D8F";
      case "Preparing": return "#F4A261";
      case "Harvesting": return "#E9C46A";
      case "Fallow": return "#888";
      default: return "#666";
    }
  };

  const renderFieldCard = (field) => (
    <View key={field._id} style={styles.fieldCard}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldTitleRow}>
          <View style={[styles.fieldColorIndicator, { backgroundColor: field.color || "#2A9D8F" }]} />
          <View style={styles.fieldTitleContainer}>
            <Text style={styles.fieldName}>{field.name}</Text>
            <Text style={styles.fieldArea}>{field.area} {t('farmer.farm.fields.acres')} • {field.soilType}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(field.status) }]}>
          <Text style={styles.statusText}>{getStatusText(field.status)}</Text>
        </View>
      </View>

      {field.cropId ? (
        <View style={styles.cropSection}>
          <View style={styles.cropIconContainer}>
            <MaterialCommunityIcons name={field.cropId.icon || "sprout"} size={20} color="#2A9D8F" />
          </View>
          <View style={styles.cropInfo}>
            <Text style={styles.cropLabel}>{t('farmer.farm.fields.current_crop')}</Text>
            <Text style={styles.cropName}>{field.cropId.cropName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.changeCropButton}
            onPress={() => handleSelectCropForField(field)}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#2A9D8F" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.noCropSection}
          onPress={() => handleSelectCropForField(field)}
        >
          <MaterialCommunityIcons name="plus-circle" size={24} color="#2A9D8F" />
          <Text style={styles.noCropText}>{t('farmer.farm.fields.plant_crop')}</Text>
        </TouchableOpacity>
      )}

      {field.cropId && field.status === "Growing" && (
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleOpenHarvestModal(field)}
          >
            <MaterialCommunityIcons name="grass" size={18} color="#2A9D8F" />
            <Text style={styles.actionText}>{t('farmer.farm.fields.harvest')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.header}>{t('farmer.farm.header')}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="land-fields" size={24} color="#2A9D8F" />
              <Text style={styles.statValue}>{fields.reduce((sum, f) => sum + f.area, 0).toFixed(1)}</Text>
              <Text style={styles.statLabel}>{t('farmer.farm.stats.total_acres')}</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="sprout" size={24} color="#606C38" />
              <Text style={styles.statValue}>{fields.filter(f => f.status === "Growing").length}/{fields.length}</Text>
              <Text style={styles.statLabel}>{t('farmer.farm.stats.active_fields')}</Text>
            </View>
          </View>

          <View style={styles.fieldsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('farmer.farm.fields.title')}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setShowAddFieldModal(true)}>
                <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                <Text style={styles.addButtonText}>{t('farmer.farm.fields.add_button')}</Text>
              </TouchableOpacity>
            </View>
            {fields.map(renderFieldCard)}
          </View>
        </View>
      </ScrollView>

      {/* Add Field Modal */}
      <Modal visible={showAddFieldModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('farmer.farm.add_modal.title')}</Text>
              <TouchableOpacity onPress={() => setShowAddFieldModal(false)}>
                <FontAwesome name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('farmer.farm.add_modal.field_name')}</Text>
                <TextInput
                  style={styles.input}
                  value={newField.name}
                  onChangeText={(text) => setNewField({ ...newField, name: text })}
                  placeholder={t('farmer.farm.add_modal.name_placeholder')}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('farmer.farm.add_modal.area')}</Text>
                <TextInput
                  style={styles.input}
                  value={newField.area}
                  onChangeText={(text) => setNewField({ ...newField, area: text })}
                  keyboardType="decimal-pad"
                  placeholder={t('farmer.farm.add_modal.area_placeholder')}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('farmer.farm.add_modal.location')}</Text>
                <TouchableOpacity 
                    style={styles.mapPreview} 
                    onPress={() => {
                        setTempCoords(newField.coordinates);
                        setMapModalVisible(true);
                    }}
                    activeOpacity={0.8}
                >
                    <MapView 
                        style={StyleSheet.absoluteFillObject}
                        region={previewRegion}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        provider={PROVIDER_GOOGLE}
                    >
                        {newField.coordinates && (
                            <Marker coordinate={{ latitude: newField.coordinates.lat, longitude: newField.coordinates.lng }} pinColor="#2A9D8F" />
                        )}
                    </MapView>
                    {!newField.coordinates && (
                        <View style={styles.placeholderOverlay}>
                            <MaterialCommunityIcons name="map-marker-plus" size={30} color="#2A9D8F" />
                            <Text style={styles.placeholderText}>{t('farmer.farm.add_modal.tap_location')}</Text>
                        </View>
                    )}
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('farmer.farm.add_modal.soil_type')}</Text>
                <TextInput
                  style={styles.input}
                  value={newField.soilType}
                  onChangeText={(text) => setNewField({ ...newField, soilType: text })}
                  placeholder={t('farmer.farm.add_modal.soil_placeholder')}
                />
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={handleAddField} disabled={isSubmitting}>
                <Text style={styles.submitButtonText}>{isSubmitting ? t('farmer.farm.add_modal.submitting') : t('farmer.farm.add_modal.submit')}</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Full Map Modal */}
      <Modal visible={isMapModalVisible} animationType="slide" statusBarTranslucent onRequestClose={() => setMapModalVisible(false)}>
        <View style={styles.fullMapContainer}>
          <MapView 
            ref={mapRef}
            style={styles.fullMap}
            initialRegion={previewRegion}
            onPress={handleMapPress}
            showsUserLocation
            provider={PROVIDER_GOOGLE}
          >
            {tempCoords && (
                <Marker coordinate={{ latitude: tempCoords.lat, longitude: tempCoords.lng }} draggable onDragEnd={handleMapPress} pinColor="#2A9D8F" />
            )}
          </MapView>
          
          <View style={styles.fullMapHeader}>
              <TouchableOpacity onPress={() => setMapModalVisible(false)} style={styles.iconBtn}>
                  <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
              
              <Text style={styles.fullMapTitle}>{tempCoords ? t('farmer.farm.map.set') : t('farmer.farm.map.pin')}</Text>
              
              <TouchableOpacity onPress={confirmMapLocation} style={styles.confirmBtnSmall}>
                  <Text style={styles.confirmBtnText}>{t('farmer.farm.map.done')}</Text>
              </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.gpsFab} onPress={getCurrentLocation} disabled={fetchingGps}>
              {fetchingGps ? <ActivityIndicator color="#2A9D8F" /> : <MaterialCommunityIcons name="crosshairs-gps" size={28} color="#2A9D8F" />}
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Update Crop Modal */}
      <Modal visible={showUpdateCropModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('farmer.farm.plant_modal.title', { name: selectedField?.name })}</Text>
              <TouchableOpacity onPress={() => setShowUpdateCropModal(false)}>
                <FontAwesome name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>{t('farmer.farm.plant_modal.choose')}</Text>
              {crops.map((crop) => (
                <TouchableOpacity
                  key={crop._id}
                  style={[styles.cropOption, selectedCropId === crop._id && styles.cropOptionSelected]}
                  onPress={() => setSelectedCropId(crop._id)}
                >
                  <MaterialCommunityIcons name={crop.icon || "sprout"} size={24} color={selectedCropId === crop._id ? "#FFF" : "#2A9D8F"} />
                  <View style={styles.cropOptionInfo}>
                    <Text style={[styles.cropOptionName, selectedCropId === crop._id && styles.cropOptionNameSelected]}>{crop.cropName}</Text>
                    <Text style={[styles.cropOptionDetails, selectedCropId === crop._id && styles.cropOptionDetailsSelected]}>
                      {crop.season} • {crop.duration} • {crop.waterRequirement} {t('farmer.farm.plant_modal.water')}
                    </Text>
                  </View>
                  {selectedCropId === crop._id && <FontAwesome name="check-circle" size={20} color="#FFF" />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.submitButton} onPress={handleUpdateFieldCrop} disabled={isSubmitting}>
                <Text style={styles.submitButtonText}>{isSubmitting ? t('farmer.farm.plant_modal.submitting') : t('farmer.farm.plant_modal.submit')}</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Harvest Modal */}
      <Modal visible={showHarvestModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('farmer.farm.harvest_modal.title', { name: selectedField?.cropId?.cropName })}</Text>
              <TouchableOpacity onPress={() => setShowHarvestModal(false)}>
                <FontAwesome name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('farmer.farm.harvest_modal.quantity')}</Text>
                <TextInput
                  style={styles.input}
                  value={harvestData.quantity}
                  onChangeText={(text) => setHarvestData({ ...harvestData, quantity: text })}
                  keyboardType="decimal-pad"
                  placeholder="e.g., 50"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('farmer.farm.harvest_modal.unit')}</Text>
                <View style={styles.unitRow}>
                  {["kg", "quintal", "ton"].map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[styles.unitButton, harvestData.unit === unit && styles.unitButtonSelected]}
                      onPress={() => setHarvestData({ ...harvestData, unit })}
                    >
                      <Text style={[styles.unitButtonText, harvestData.unit === unit && styles.unitButtonTextSelected]}>{unit}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('farmer.farm.harvest_modal.storage')}</Text>
                <TextInput
                  style={styles.input}
                  value={harvestData.storageLocation}
                  onChangeText={(text) => setHarvestData({ ...harvestData, storageLocation: text })}
                  placeholder="e.g., Warehouse A"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('farmer.farm.harvest_modal.notes')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={harvestData.notes}
                  onChangeText={(text) => setHarvestData({ ...harvestData, notes: text })}
                  placeholder="Any additional notes..."
                  multiline
                  numberOfLines={3}
                />
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={handleHarvestCrop} disabled={isSubmitting}>
                <Text style={styles.submitButtonText}>{isSubmitting ? t('farmer.farm.harvest_modal.submitting') : t('farmer.farm.harvest_modal.submit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 32, fontWeight: "bold", color: "#264653", marginTop: 20, marginBottom: 20 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: "#FFF", borderRadius: 12, padding: 16, alignItems: "center", marginHorizontal: 4, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#264653", marginTop: 8 },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  fieldsSection: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#264653" },
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#2A9D8F", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: "#FFF", fontSize: 14, fontWeight: "600", marginLeft: 6 },
  fieldCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
  fieldHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  fieldTitleRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  fieldColorIndicator: { width: 4, height: 40, borderRadius: 2, marginRight: 12 },
  fieldTitleContainer: { flex: 1 },
  fieldName: { fontSize: 20, fontWeight: "bold", color: "#264653" },
  fieldArea: { fontSize: 14, color: "#666", marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  cropSection: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F9FA", padding: 12, borderRadius: 12, marginBottom: 12 },
  cropIconContainer: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#E8F5F3", justifyContent: "center", alignItems: "center", marginRight: 12 },
  cropInfo: { flex: 1 },
  cropLabel: { fontSize: 12, color: "#666" },
  cropName: { fontSize: 16, fontWeight: "600", color: "#264653", marginTop: 2 },
  changeCropButton: { padding: 8 },
  noCropSection: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#F0F8F7", padding: 16, borderRadius: 12, marginBottom: 12 },
  noCropText: { fontSize: 16, color: "#2A9D8F", fontWeight: "600", marginLeft: 8 },
  quickActions: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E8E8E8" },
  actionButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  actionText: { fontSize: 13, color: "#2A9D8F", fontWeight: "600", marginLeft: 6 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#264653" },
  modalBody: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: { backgroundColor: "#F8F9FA", borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  cropOption: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F9FA", padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: "#E0E0E0" },
  cropOptionSelected: { backgroundColor: "#2A9D8F", borderColor: "#2A9D8F" },
  cropOptionInfo: { flex: 1, marginLeft: 12 },
  cropOptionName: { fontSize: 16, fontWeight: "600", color: "#264653" },
  cropOptionNameSelected: { color: "#FFF" },
  cropOptionDetails: { fontSize: 12, color: "#666", marginTop: 4 },
  cropOptionDetailsSelected: { color: "#E8F5F3" },
  unitRow: { flexDirection: "row", gap: 12 },
  unitButton: { flex: 1, backgroundColor: "#F8F9FA", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#E0E0E0", alignItems: "center" },
  unitButtonSelected: { backgroundColor: "#2A9D8F", borderColor: "#2A9D8F" },
  unitButtonText: { fontSize: 14, color: "#666" },
  unitButtonTextSelected: { color: "#FFF", fontWeight: "600" },
  submitButton: { backgroundColor: "#2A9D8F", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
  submitButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },

  // New Map Specific Styles
  mapPreview: { height: 160, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#2A9D8F', marginTop: 5 },
  placeholderOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F8F7' },
  placeholderText: { color: '#2A9D8F', marginTop: 8, fontWeight: '500' },
  fullMapContainer: { flex: 1, backgroundColor: '#000' },
  fullMap: { flex: 1 },
  fullMapHeader: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', backgroundColor: 'white', borderRadius: 10, padding: 10, alignItems: 'center', elevation: 5 },
  fullMapTitle: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#264653' },
  iconBtn: { padding: 5 },
  confirmBtnSmall: { backgroundColor: '#2A9D8F', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  confirmBtnText: { color: 'white', fontWeight: 'bold' },
  gpsFab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: 'white', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
});