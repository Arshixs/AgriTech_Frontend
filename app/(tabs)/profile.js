import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert as RNAlert,
} from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import Button from "../../src/components/common/Button";
import { useAuth } from "../../src/context/AuthContext";
import {API_BASE_URL} from "../../secret"

export default function FarmerProfileScreen() {
  const { user, signOut } = useAuth();
  const authToken = user?.token;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    adharNumber: "",
    address: "",
    coordinates: { lat: null, lng: null }
  });

  // Fetch initial profile data from backend
  const fetchProfile = async () => {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/farmer-auth/profile`, {
        headers: { "Authorization": `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.farmer);
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Request location and update local state
  const handleUpdateLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        RNAlert.alert("Permission Denied", "Location access is required for accurate weather alerts.");
        return;
      }

      setSaving(true);
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      
      const newCoords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      };

      setProfile(prev => ({ ...prev, coordinates: newCoords }));
      
      // Immediately suggest saving if coordinates changed
      RNAlert.alert("Location Found", `Lat: ${newCoords.lat.toFixed(4)}, Lng: ${newCoords.lng.toFixed(4)}. Please Save Changes.`);
    } catch (error) {
      RNAlert.alert("Error", "Could not fetch current location.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/farmer-auth/register`, { // Reusing registration update logic
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
        RNAlert.alert("Success", "Profile and location updated successfully.");
        fetchProfile(); // Refresh
      } else {
        throw new Error("Update failed.");
      }
    } catch (error) {
      RNAlert.alert("Error", "Failed to update profile.");
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
                <FontAwesome name="user-circle" size={80} color="#2A9D8F" />
            </View>
            <Text style={styles.userName}>{profile.name || "Farmer"}</Text>
            <Text style={styles.userPhone}>{profile.phone}</Text>
          </View>

          {/* Location Management Card */}
          <View style={styles.locationCard}>
            <View style={styles.cardHeaderRow}>
                <MaterialCommunityIcons name="map-marker-radius" size={24} color="#E76F51" />
                <Text style={styles.cardTitle}>Farm Location</Text>
            </View>
            <Text style={styles.locationDescription}>
                Setting your precise location ensures you get accurate localized weather alerts and crop recommendations.
            </Text>
            
            <View style={styles.coordsDisplay}>
                <View style={styles.coordItem}>
                    <Text style={styles.coordLabel}>Latitude</Text>
                    <Text style={styles.coordValue}>{profile.coordinates?.lat?.toFixed(6) || "Not Set"}</Text>
                </View>
                <View style={styles.coordDivider} />
                <View style={styles.coordItem}>
                    <Text style={styles.coordLabel}>Longitude</Text>
                    <Text style={styles.coordValue}>{profile.coordinates?.lng?.toFixed(6) || "Not Set"}</Text>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.locationButton} 
                onPress={handleUpdateLocation}
                disabled={saving}
            >
                <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#FFFFFF" />
                <Text style={styles.locationButtonText}>Get Current Location</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput 
                    style={styles.input}
                    value={profile.name}
                    onChangeText={(t) => setProfile({...profile, name: t})}
                    placeholder="Enter full name"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Adhar Number</Text>
                <TextInput 
                    style={styles.input}
                    value={profile.adharNumber}
                    onChangeText={(t) => setProfile({...profile, adharNumber: t})}
                    placeholder="12 Digit Adhar"
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Farm Address</Text>
                <TextInput 
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    value={profile.address}
                    onChangeText={(t) => setProfile({...profile, address: t})}
                    placeholder="Enter complete address"
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
                <Text style={styles.signOutText}>Logout Account</Text>
            </TouchableOpacity>
          </View>

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
  
  // Location Card
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#264653', marginLeft: 10 },
  locationDescription: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 15 },
  coordsDisplay: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center'
  },
  coordItem: { flex: 1, alignItems: 'center' },
  coordLabel: { fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase' },
  coordValue: { fontSize: 15, fontWeight: '700', color: '#264653' },
  coordDivider: { width: 1, height: 30, backgroundColor: '#DDD' },
  locationButton: {
    flexDirection: 'row',
    backgroundColor: '#E76F51',
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  locationButtonText: { color: '#FFFFFF', fontWeight: 'bold', marginLeft: 10 },

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