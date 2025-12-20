import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Modal,
  Alert as RNAlert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // Added MapView
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import Button from "../../src/components/common/Button";
import { useAuth } from "../../src/context/AuthContext";
import { API_BASE_URL } from "../../secret"
import { useTranslation } from 'react-i18next';

export default function FarmerProfileScreen() {
  const { user, signOut } = useAuth();
  const authToken = user?.token;
  const router = useRouter();
  const { t } = useTranslation();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false); // Added for GPS loading
  const [isMapModalVisible, setMapModalVisible] = useState(false); // Added for Modal
  const [tempCoords, setTempCoords] = useState({ lat: null, lng: null });

  const mapRef = useRef(null);
  const previewMapRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    adharNumber: "",
    address: "",
    coordinates: { lat: null, lng: null }
  });

  // Map region state
  const [previewRegion, setPreviewRegion] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 12,
    longitudeDelta: 12,
  });

  const fetchProfile = async () => {
    if (!authToken) return;
    setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/farmer-auth/profile`, {
        headers: { "Authorization": `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.farmer);
        // Sync map preview if coords exist
        if (data.farmer.coordinates?.lat) {
          setPreviewRegion({
            latitude: data.farmer.coordinates.lat,
            longitude: data.farmer.coordinates.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      }
    } catch (error) {
      console.error(t("Profile Fetch Error:"), error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

  /**
   * MAP LOGIC FROM REGISTER.JS
   */
  const handleMapPress = useCallback((e) => {
    const coords = e.nativeEvent.coordinate;
    // Update ONLY temp state
    setTempCoords({ lat: coords.latitude, lng: coords.longitude });
  }, []);

  const getCurrentLocation = async () => {
    setFetchingGps(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        RNAlert.alert('Permission Denied', t('Location permission is required'));
        return;
      }

      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;

      // Update ONLY temp state
      setTempCoords({ lat: latitude, lng: longitude });

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 500);
      }
    } catch (error) {
      RNAlert.alert('Error', t('Failed to get location'));
    } finally {
      setFetchingGps(false);
    }
  };

  const handleConfirmLocation = () => {
    if (!tempCoords.lat) {
      RNAlert.alert('Alert', t('Please select a location on the map'));
      return;
    }
    
    // Save temp to profile
    setProfile(prev => ({ ...prev, coordinates: tempCoords }));
    
    // Sync the small preview map
    setPreviewRegion({
      latitude: tempCoords.lat,
      longitude: tempCoords.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    setMapModalVisible(false);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/farmer-auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: profile.name,
          address: profile.address,
          adharNumber: profile.adharNumber,
          coordinates: profile.coordinates
        })
      });

      if (res.ok) {
        RNAlert.alert("Success", t("Profile updated successfully."));
        fetchProfile();
      } else {
        throw new Error("Update failed.");
      }
    } catch (error) {
      RNAlert.alert("Error", t("Failed to update profile."));
    } finally {
      setSaving(false);
    }
  };

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
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <FontAwesome name="user-circle" size={80} color="#2A9D8F" />
            </View>
            <Text style={styles.userName}>{profile.name || t("Farmer")}</Text>
            <Text style={styles.userPhone}>{profile.phone}</Text>
          </View>

          {/* Location Management Section (Updated to match Register style) */}
          <Text style={styles.sectionTitle}>{t("Farm Location")}</Text>

          <TouchableOpacity
            style={styles.mapPreview}
            onPress={() => {
              // Initialize tempCoords with existing profile coords when opening
              setTempCoords(profile.coordinates); 
              setMapModalVisible(true);
            }}
          >
            <MapView
              ref={previewMapRef}
              style={StyleSheet.absoluteFillObject}
              region={previewRegion}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              provider={PROVIDER_GOOGLE}
            >
              {profile.coordinates?.lat && (
                <Marker
                  coordinate={{
                    latitude: profile.coordinates.lat,
                    longitude: profile.coordinates.lng
                  }}
                  pinColor="#2A9D8F"
                />
              )}
            </MapView>

            {!profile.coordinates?.lat && (
              <View style={styles.placeholderOverlay}>
                <MaterialCommunityIcons name="map-marker-plus" size={40} color="#2A9D8F" />
                <Text style={styles.placeholderText}>{t("Tap to set location on Map")}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Personal Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>{t("Personal Details")}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("Full Name")}</Text>
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(t) => setProfile({ ...profile, name: t })}
                placeholder={t("Enter full name")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("Adhar Number")}</Text>
              <TextInput
                style={styles.input}
                value={profile.adharNumber}
                editable={false}
                onChangeText={(t) => setProfile({ ...profile, adharNumber: t })}
                placeholder={t("12 Digit Adhar")}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("Farm Address")}</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={profile.address}
                onChangeText={(t) => setProfile({ ...profile, address: t })}
                placeholder={t("Enter complete address")}
                multiline
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="Save Profile Changes"
              onPress={handleSaveChanges}
              loading={saving}
              style={{ backgroundColor: '#2A9D8F' }}
            />

            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
              <MaterialCommunityIcons name="logout" size={20} color="#E76F51" />
              <Text style={styles.signOutText}>{t("Logout Account")}</Text>
            </TouchableOpacity>
          </View>

          {/* Fullscreen Map Modal (Copied from Register) */}
          <Modal
            visible={isMapModalVisible}
            animationType="slide"
            statusBarTranslucent
            onRequestClose={() => setMapModalVisible(false)}
          >
            <View style={styles.modalBody}>
              <MapView
                ref={mapRef}
                style={styles.fullMap}
                initialRegion={previewRegion}
                onPress={handleMapPress}
                showsUserLocation={true}
                showsMyLocationButton={false}
                provider={PROVIDER_GOOGLE}
              >
                {tempCoords?.lat && (
                  <Marker
                    coordinate={{
                      latitude: tempCoords.lat,
                      longitude: tempCoords.lng
                    }}
                    draggable
                    onDragEnd={handleMapPress}
                    pinColor="#2A9D8F"
                  />
                )}
              </MapView>

              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setMapModalVisible(false)} style={styles.iconBtn}>
                  <MaterialCommunityIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {tempCoords?.lat ? t('Location Selected') : t('Pin your Farm')}
                </Text>
                <TouchableOpacity onPress={handleConfirmLocation} style={styles.confirmBtn}>
                  <Text style={styles.confirmBtnText}>{t("Confirm")}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.gpsFab}
                onPress={getCurrentLocation}
                disabled={fetchingGps}
              >
                {fetchingGps ? (
                  <ActivityIndicator color="#2A9D8F" size="small" />
                ) : (
                  <MaterialCommunityIcons name="crosshairs-gps" size={28} color="#2A9D8F" />
                )}
              </TouchableOpacity>
            </View>
          </Modal>

        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 400 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  avatarContainer: { marginBottom: 15 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#264653' },
  userPhone: { fontSize: 16, color: '#666', marginTop: 4 },

  // Map Preview (Style from Register)
  mapPreview: {
    height: 180,
    backgroundColor: '#e8f4f8',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#2A9D8F',
    borderStyle: 'dashed',
    position: 'relative',
  },
  placeholderOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  placeholderText: {
    color: '#2A9D8F',
    marginTop: 12,
    fontWeight: '600',
    fontSize: 15,
  },

  // Form
  infoSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#264653', marginBottom: 15 },
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 14, color: '#666', marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#264653'
  },
  disabledInput: {
    backgroundColor: '#F0F0F0', // Greyed out background
    color: '#888',             // Muted text color
    borderColor: '#E0E0E0',
  },
  helperText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic'
  },

  // Modal Styles (From Register)
  modalBody: { flex: 1, backgroundColor: '#000' },
  fullMap: { flex: 1 },
  modalHeader: {
    position: 'absolute',
    top: 50, left: 20, right: 20,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 15,
  },
  iconBtn: { padding: 6 },
  modalTitle: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#264653', fontSize: 17 },
  confirmBtn: { backgroundColor: '#2A9D8F', paddingHorizontal: 22, paddingVertical: 9, borderRadius: 10 },
  confirmBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  gpsFab: {
    position: 'absolute',
    bottom: 50, right: 20,
    backgroundColor: 'white',
    width: 60, height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
  },

  
  // Footer Actions
  actions: { marginTop: 10 },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    padding: 10
  },
  signOutText: { color: '#E76F51', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }
});