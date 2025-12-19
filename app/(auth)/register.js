import React, { useState, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ActivityIndicator 
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { useAuth } from '../../src/context/AuthContext';
import { API_BASE_URL } from "../../secret";
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function RegistrationScreen() {
    const { signInFarmer, user } = useAuth();
    const router = useRouter();
    const authToken = user?.token;

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [adharNumber, setAdharNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingGps, setFetchingGps] = useState(false);

    // Map & Location State
    const mapRef = useRef(null);
    const previewMapRef = useRef(null); // Separate ref for preview map
    const [location, setLocation] = useState(null); // { lat, lng }
    const [isMapModalVisible, setMapModalVisible] = useState(false);
    const [tempLocation, setTempLocation] = useState(null);
    
    // Store region for preview map
    const [previewRegion, setPreviewRegion] = useState({
        latitude: 20.5937,
        longitude: 78.9629,
        latitudeDelta: 12,
        longitudeDelta: 12,
    });

    /**
     * Updates location and preview region
     */
    const handleMapPress = useCallback((e) => {
        const coords = e.nativeEvent.coordinate;
        // Update temporary state, NOT main state
        setTempLocation({ lat: coords.latitude, lng: coords.longitude });
    }, []);

    /**
     * Get current location with proper preview update
     */
    const getCurrentLocation = async () => {
        setFetchingGps(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Location permission is required');
                return;
            }

            // Try cached location first for speed
            let loc = await Location.getLastKnownPositionAsync({});
            if (!loc) {
                loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
            }

            const { latitude, longitude } = loc.coords;
            
            // Update temporary state, NOT main state
            setTempLocation({ lat: latitude, lng: longitude });

            // Animate main map
            if (mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }, 500);
            }

            // Also animate preview map when modal closes
            if (previewMapRef.current) {
                setTimeout(() => {
                    if (previewMapRef.current) {
                        previewMapRef.current.animateToRegion({
                            latitude,
                            longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }, 100);
                    }
                }, 100);
            }

        } catch (error) {
            console.error("GPS Error:", error);
            alert('Failed to get location');
        } finally {
            setFetchingGps(false);
        }
    };

    /**
     * Close modal and ensure preview map updates
     */
    const handleConfirmLocation = () => {
        // If no location selected but we have GPS location, use that
        if (!tempLocation) {
            alert('Please select a location on the map');
            return;
        }
        setLocation(tempLocation);
        
        // Ensure preview map is updated
        setPreviewRegion({
            latitude: tempLocation.lat,
            longitude: tempLocation.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
        
        setMapModalVisible(false);
    };

    const handleCompleteProfile = async () => {
        if (!name || !address || !adharNumber || !location) {
            alert('Please fill all fields and select location');
            return;
        }
        
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/farmer-auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    name,
                    address,
                    adharNumber,
                    coordinates: location,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Update failed');

            await signInFarmer({ ...data.farmer, token: authToken });
            router.replace('/(tabs)');
        } catch (err) {
            console.error("Registration Error:", err.message);
            alert(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Complete Your Profile</Text>
                
                <Input 
                    label="Full Name" 
                    value={name} 
                    onChangeText={setName} 
                    placeholder="Enter your full name" 
                />
                <Input 
                    label="Adhar Number" 
                    value={adharNumber} 
                    onChangeText={setAdharNumber} 
                    keyboardType="number-pad" 
                    placeholder="12-digit number"
                    maxLength={12}
                />
                <Input 
                    label="Farm Address" 
                    value={address} 
                    onChangeText={setAddress} 
                    placeholder="Village, Tehsil, District" 
                />

                <Text style={styles.label}>Farm Location on Map</Text>
                
                {/* Preview Map */}
                <TouchableOpacity 
                    style={styles.mapPreview} 
                    onPress={() => setMapModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <MapView 
                        ref={previewMapRef}
                        style={StyleSheet.absoluteFillObject}
                        // initialRegion={previewRegion}
                        region={previewRegion} // Use region prop for updates
                        scrollEnabled={false}
                        zoomEnabled={false}
                        pitchEnabled={false}
                        rotateEnabled={false}
                        provider={PROVIDER_GOOGLE}
                        cacheEnabled={false}
                        loadingEnabled={true}
                    >
                        {location && (
                            <Marker 
                                coordinate={{ 
                                    latitude: location.lat, 
                                    longitude: location.lng 
                                }}
                                pinColor="#2A9D8F"
                            />
                        )}
                    </MapView>
                    
                    {!location && (
                        <View style={styles.placeholderOverlay}>
                            <MaterialCommunityIcons name="map-marker-plus" size={40} color="#2A9D8F" />
                            <Text style={styles.placeholderText}>Tap to set location on Map</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Button 
                    title="Complete Registration" 
                    onPress={handleCompleteProfile} 
                    loading={loading} 
                />

                {/* Fullscreen Map Modal */}
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
                            {tempLocation && (
                                <Marker 
                                    coordinate={{ 
                                        latitude: tempLocation.lat, 
                                        longitude: tempLocation.lng 
                                    }}
                                    draggable
                                    onDragEnd={handleMapPress}
                                    pinColor="#2A9D8F"
                                />
                            )}
                        </MapView>

                        {/* Top Controls */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity 
                                onPress={() => setMapModalVisible(false)} 
                                style={styles.iconBtn}
                            >
                                <MaterialCommunityIcons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                {location ? 'Location Selected' : 'Pin your Farm'}
                            </Text>
                            <TouchableOpacity 
                                onPress={handleConfirmLocation} 
                                style={styles.confirmBtn}
                            >
                                <Text style={styles.confirmBtnText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>

                        {/* GPS Button */}
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

                        {/* Bottom Info */}
                        {tempLocation && (
                            <View style={styles.coordsInfo}>
                                <Text style={styles.coordsText}>
                                    Lat: {tempLocation.lat.toFixed(6)}, Lng: {tempLocation.lng.toFixed(6)}
                                </Text>
                                <Text style={styles.coordsHint}>
                                    Tap on map or drag marker to adjust
                                </Text>
                            </View>
                        )}
                    </View>
                </Modal>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    formContainer: { 
        padding: 20,
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#264653', 
        marginBottom: 25,
        textAlign: 'center',
    },
    label: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#264653', 
        marginBottom: 10, 
        marginTop: 5,
    },
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
    
    // Modal UI
    modalBody: { 
        flex: 1, 
        backgroundColor: '#000',
    },
    fullMap: { 
        flex: 1,
    },
    modalHeader: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        alignItems: 'center',
        elevation: 15,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    iconBtn: { 
        padding: 6,
    },
    modalTitle: { 
        flex: 1, 
        textAlign: 'center', 
        fontWeight: 'bold', 
        color: '#264653',
        fontSize: 17,
        marginLeft: 10,
    },
    confirmBtn: { 
        backgroundColor: '#2A9D8F', 
        paddingHorizontal: 22, 
        paddingVertical: 9, 
        borderRadius: 10,
        elevation: 3,
    },
    confirmBtnText: { 
        color: 'white', 
        fontWeight: 'bold',
        fontSize: 15,
    },
    gpsFab: {
        position: 'absolute',
        bottom: 120,
        right: 20,
        backgroundColor: 'white',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 12,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    coordsInfo: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        elevation: 8,
    },
    coordsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#264653',
        marginBottom: 4,
    },
    coordsHint: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
});