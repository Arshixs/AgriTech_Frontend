// app/(drawer)/(tabs)/profile.js
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  Alert as RNAlert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { API_BASE_URL } from "../../../secret";
import Button from "../../../src/components/common/Button";
import LanguageDropdown from "../../../src/components/common/LanguageDropdown";
import ScreenWrapper from "../../../src/components/common/ScreenWrapper";
import { useAuth } from "../../../src/context/AuthContext";
import ScoreCard from "../../../src/components/gamification/ScoreCard";

const { height } = Dimensions.get("window");

// ─── Static fallback districts ────────────────────────────────────────────────
const STATIC_DISTRICTS = {
  UP: [
    "Agra",
    "Aligarh",
    "Ambedkar Nagar",
    "Amethi",
    "Amroha",
    "Auraiya",
    "Ayodhya",
    "Azamgarh",
    "Baghpat",
    "Bahraich",
    "Ballia",
    "Balrampur",
    "Banda",
    "Barabanki",
    "Bareilly",
    "Basti",
    "Bhadohi",
    "Bijnor",
    "Budaun",
    "Bulandshahr",
    "Chandauli",
    "Chitrakoot",
    "Deoria",
    "Etah",
    "Etawah",
    "Farrukhabad",
    "Fatehpur",
    "Firozabad",
    "Gautam Buddha Nagar",
    "Ghaziabad",
    "Ghazipur",
    "Gonda",
    "Gorakhpur",
    "Hamirpur",
    "Hapur",
    "Hardoi",
    "Hathras",
    "Jalaun",
    "Jaunpur",
    "Jhansi",
    "Kannauj",
    "Kanpur Dehat",
    "Kanpur Nagar",
    "Kasganj",
    "Kaushambi",
    "Kheri",
    "Kushinagar",
    "Lalitpur",
    "Lucknow",
    "Maharajganj",
    "Mahoba",
    "Mainpuri",
    "Mathura",
    "Mau",
    "Meerut",
    "Mirzapur",
    "Moradabad",
    "Muzaffarnagar",
    "Pilibhit",
    "Pratapgarh",
    "Prayagraj",
    "Rae Bareli",
    "Rampur",
    "Saharanpur",
    "Sambhal",
    "Sant Kabir Nagar",
    "Shahjahanpur",
    "Shamli",
    "Shravasti",
    "Siddharthnagar",
    "Sitapur",
    "Sonbhadra",
    "Sultanpur",
    "Unnao",
    "Varanasi",
  ],
  MH: [
    "Ahmednagar",
    "Akola",
    "Amravati",
    "Aurangabad",
    "Beed",
    "Bhandara",
    "Buldhana",
    "Chandrapur",
    "Dhule",
    "Gadchiroli",
    "Gondia",
    "Hingoli",
    "Jalgaon",
    "Jalna",
    "Kolhapur",
    "Latur",
    "Mumbai City",
    "Mumbai Suburban",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Nashik",
    "Osmanabad",
    "Palghar",
    "Parbhani",
    "Pune",
    "Raigad",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Sindhudurg",
    "Solapur",
    "Thane",
    "Wardha",
    "Washim",
    "Yavatmal",
  ],
  PB: [
    "Amritsar",
    "Barnala",
    "Bathinda",
    "Faridkot",
    "Fatehgarh Sahib",
    "Fazilka",
    "Ferozepur",
    "Gurdaspur",
    "Hoshiarpur",
    "Jalandhar",
    "Kapurthala",
    "Ludhiana",
    "Mansa",
    "Moga",
    "Mohali",
    "Muktsar",
    "Nawanshahr",
    "Pathankot",
    "Patiala",
    "Rupnagar",
    "Sangrur",
    "Tarn Taran",
  ],
  RJ: [
    "Ajmer",
    "Alwar",
    "Banswara",
    "Baran",
    "Barmer",
    "Bharatpur",
    "Bhilwara",
    "Bikaner",
    "Bundi",
    "Chittorgarh",
    "Churu",
    "Dausa",
    "Dholpur",
    "Dungarpur",
    "Hanumangarh",
    "Jaipur",
    "Jaisalmer",
    "Jalore",
    "Jhalawar",
    "Jhunjhunu",
    "Jodhpur",
    "Karauli",
    "Kota",
    "Nagaur",
    "Pali",
    "Pratapgarh",
    "Rajsamand",
    "Sawai Madhopur",
    "Sikar",
    "Sirohi",
    "Sri Ganganagar",
    "Tonk",
    "Udaipur",
  ],
  MP: [
    "Agar Malwa",
    "Alirajpur",
    "Anuppur",
    "Ashoknagar",
    "Balaghat",
    "Barwani",
    "Betul",
    "Bhind",
    "Bhopal",
    "Burhanpur",
    "Chhatarpur",
    "Chhindwara",
    "Damoh",
    "Datia",
    "Dewas",
    "Dhar",
    "Dindori",
    "Guna",
    "Gwalior",
    "Harda",
    "Hoshangabad",
    "Indore",
    "Jabalpur",
    "Jhabua",
    "Katni",
    "Khandwa",
    "Khargone",
    "Mandla",
    "Mandsaur",
    "Morena",
    "Narsinghpur",
    "Neemuch",
    "Panna",
    "Raisen",
    "Rajgarh",
    "Ratlam",
    "Rewa",
    "Sagar",
    "Satna",
    "Sehore",
    "Seoni",
    "Shahdol",
    "Shajapur",
    "Sheopur",
    "Shivpuri",
    "Sidhi",
    "Singrauli",
    "Tikamgarh",
    "Ujjain",
    "Umaria",
    "Vidisha",
  ],
  BR: [
    "Araria",
    "Arwal",
    "Aurangabad",
    "Banka",
    "Begusarai",
    "Bhagalpur",
    "Bhojpur",
    "Buxar",
    "Darbhanga",
    "East Champaran",
    "Gaya",
    "Gopalganj",
    "Jamui",
    "Jehanabad",
    "Kaimur",
    "Katihar",
    "Khagaria",
    "Kishanganj",
    "Lakhisarai",
    "Madhepura",
    "Madhubani",
    "Munger",
    "Muzaffarpur",
    "Nalanda",
    "Nawada",
    "Patna",
    "Purnia",
    "Rohtas",
    "Saharsa",
    "Samastipur",
    "Saran",
    "Sheikhpura",
    "Sheohar",
    "Sitamarhi",
    "Siwan",
    "Supaul",
    "Vaishali",
    "West Champaran",
  ],
};

const STATE_CODE_MAP = {
  "Uttar Pradesh": "UP",
  Maharashtra: "MH",
  Punjab: "PB",
  Rajasthan: "RJ",
  "Madhya Pradesh": "MP",
  Bihar: "BR",
};

// ─── District Dropdown ────────────────────────────────────────────────────────
function DistrictDropdown({ label, value, items, onSelect, loading = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { t } = useTranslation();

  const filtered = items.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (item) => {
    onSelect(item);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <View style={dd.wrapper}>
      <Text style={dd.label}>{label}</Text>
      <TouchableOpacity
        onPress={() => {
          setIsOpen(true);
          setQuery("");
        }}
        style={[dd.trigger, value && dd.triggerSelected]}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="city"
          size={18}
          color={value ? "#2A9D8F" : "#666"}
          style={{ marginRight: 8 }}
        />
        <Text
          style={[dd.triggerText, value && dd.triggerTextSelected]}
          numberOfLines={1}
        >
          {value ? t(value) : t("Select District")}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color="#2A9D8F" />
        ) : (
          <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
        )}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={dd.backdrop} />
        </TouchableWithoutFeedback>
        <View style={dd.sheet}>
          <View style={dd.sheetHeader}>
            <Text style={dd.sheetTitle}>{label}</Text>
            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              style={dd.sheetClose}
            >
              <MaterialCommunityIcons name="close" size={22} color="#264653" />
            </TouchableOpacity>
          </View>
          <View style={dd.searchBox}>
            <MaterialCommunityIcons name="magnify" size={18} color="#888" />
            <TextInput
              style={dd.searchInput}
              placeholder={t("Type to filter...")}
              placeholderTextColor="#aaa"
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={16}
                  color="#aaa"
                />
              </TouchableOpacity>
            )}
          </View>
          <Text style={dd.resultCount}>
            {filtered.length} {t("result(s)")}
          </Text>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[dd.option, item === value && dd.optionSelected]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    dd.optionText,
                    item === value && dd.optionTextSelected,
                  ]}
                >
                  {t(item)}
                </Text>
                {item === value && (
                  <MaterialCommunityIcons
                    name="check"
                    size={18}
                    color="#2A9D8F"
                  />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={dd.emptyBox}>
                <MaterialCommunityIcons
                  name="magnify-close"
                  size={32}
                  color="#ccc"
                />
                <Text style={dd.emptyText}>{t("No matches found")}</Text>
              </View>
            }
            ItemSeparatorComponent={() => <View style={dd.separator} />}
          />
        </View>
      </Modal>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function FarmerProfileScreen() {
  const { user, signOut } = useAuth();
  const authToken = user?.token;
  const router = useRouter();
  const { t } = useTranslation();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);
  const [isMapModalVisible, setMapModalVisible] = useState(false);
  const [tempCoords, setTempCoords] = useState({ lat: null, lng: null });
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [mapType, setMapType] = useState("hybrid");

  const [gamification, setGamification] = useState({
    totalPoints: 0,
    level: "Bronze",
    pointsToNext: null,
    loading: true,
  });

  const mapRef = useRef(null);
  const previewMapRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    adharNumber: "",
    address: "",
    state: "",
    district: "",
    coordinates: { lat: null, lng: null },
  });

  const [previewRegion, setPreviewRegion] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 12,
    longitudeDelta: 12,
  });

  // ── Fetch districts for the farmer's registered state ───────────────────
  const fetchDistricts = async (stateCode) => {
    if (!stateCode) return;
    setLoadingDistricts(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/location/districts/${stateCode}`,
      );
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          setDistricts(data.districts);
          setLoadingDistricts(false);
          return;
        }
      }
    } catch (_) {}
    setDistricts(STATIC_DISTRICTS[stateCode] || []);
    setLoadingDistricts(false);
  };

  // ── Fetch profile ────────────────────────────────────────────────────────
  const fetchProfile = async () => {
    if (!authToken) return;
    setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/farmer-auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.farmer);
        if (data.farmer.coordinates?.lat) {
          setPreviewRegion({
            latitude: data.farmer.coordinates.lat,
            longitude: data.farmer.coordinates.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
        const code = STATE_CODE_MAP[data.farmer.state];
        if (code) fetchDistricts(code);
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // ── Fetch gamification ───────────────────────────────────────────────────
  const fetchGamification = async () => {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/gamification/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setGamification({
          totalPoints: data.totalPoints,
          level: data.level,
          pointsToNext: data.pointsToNext,
          loading: false,
        });
      }
    } catch (_) {
      setGamification((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchGamification();
    fetchDistricts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
    fetchGamification();
  }, []);

  // ── Map ──────────────────────────────────────────────────────────────────
  const handleMapPress = useCallback((e) => {
    const coords = e.nativeEvent.coordinate;
    setTempCoords({ lat: coords.latitude, lng: coords.longitude });
  }, []);

  const getCurrentLocation = async () => {
    setFetchingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        RNAlert.alert(
          "Permission Denied",
          t("Location permission is required"),
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;
      setTempCoords({ lat: latitude, lng: longitude });
      mapRef.current?.animateToRegion(
        { latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 },
        500,
      );
    } catch (_) {
      RNAlert.alert("Error", t("Failed to get location"));
    } finally {
      setFetchingGps(false);
    }
  };

  const handleConfirmLocation = () => {
    if (!tempCoords.lat) {
      RNAlert.alert("Alert", t("Please select a location on the map"));
      return;
    }
    setProfile((prev) => ({ ...prev, coordinates: tempCoords }));
    setPreviewRegion({
      latitude: tempCoords.lat,
      longitude: tempCoords.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setMapModalVisible(false);
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSaveChanges = async () => {
    if (!profile.name.trim())
      return RNAlert.alert(t("Error"), t("Please enter your full name"));
    if (!profile.district)
      return RNAlert.alert(t("Error"), t("Please select your district"));

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/farmer-auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: profile.name,
          address: profile.address,
          adharNumber: profile.adharNumber,
          district: profile.district,
          coordinates: profile.coordinates,
        }),
      });
      if (res.ok) {
        RNAlert.alert(t("Success"), t("Profile updated successfully."));
        fetchProfile();
        fetchGamification();
      } else {
        throw new Error("Update failed.");
      }
    } catch (_) {
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
      <LanguageDropdown />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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

          {/* Score Card */}
          {gamification.loading ? (
            <ActivityIndicator
              size="small"
              color="#2A9D8F"
              style={{ marginBottom: 16 }}
            />
          ) : (
            <ScoreCard
              totalPoints={gamification.totalPoints}
              level={gamification.level}
              pointsToNext={gamification.pointsToNext}
            />
          )}

          {/* ── Farm Location ──────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialCommunityIcons
                name="home-map-marker"
                size={14}
                color="#2A9D8F"
              />
              {"  "}
              {t("Farm Location")}
            </Text>

            <TouchableOpacity
              style={[
                styles.mapPreview,
                profile.coordinates?.lat && styles.mapPreviewActive,
              ]}
              onPress={() => {
                setTempCoords(profile.coordinates);
                setMapModalVisible(true);
              }}
              activeOpacity={0.85}
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
                mapType="hybrid"
                loadingEnabled
              >
                {profile.coordinates?.lat && (
                  <Marker
                    coordinate={{
                      latitude: profile.coordinates.lat,
                      longitude: profile.coordinates.lng,
                    }}
                    pinColor="#2A9D8F"
                  />
                )}
              </MapView>

              {!profile.coordinates?.lat ? (
                <View style={styles.placeholderOverlay}>
                  <MaterialCommunityIcons
                    name="map-marker-plus"
                    size={40}
                    color="#2A9D8F"
                  />
                  <Text style={styles.placeholderText}>
                    {t("Tap to set location on Map")}
                  </Text>
                </View>
              ) : (
                <View style={styles.mapEditOverlay}>
                  <MaterialCommunityIcons
                    name="pencil-circle"
                    size={34}
                    color="#2A9D8F"
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Personal Details ───────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialCommunityIcons
                name="account"
                size={14}
                color="#2A9D8F"
              />
              {"  "}
              {t("Personal Details")}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("Full Name")}</Text>
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(v) => setProfile({ ...profile, name: v })}
                placeholder={t("Enter full name")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("Adhar Number")}</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={profile.adharNumber}
                editable={false}
                keyboardType="numeric"
              />
              <Text style={styles.lockedHint}>
                <MaterialCommunityIcons name="lock" size={11} color="#bbb" />
                {"  "}
                {t("Aadhaar cannot be changed after registration")}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("Farm Address")}</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                value={profile.address}
                onChangeText={(v) => setProfile({ ...profile, address: v })}
                placeholder={t("Enter complete address")}
                multiline
              />
            </View>
          </View>

          {/* ── Location Details ───────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialCommunityIcons name="map" size={14} color="#2A9D8F" />
              {"  "}
              {t("Location Details")}
            </Text>

            {/* State — locked, read-only */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("State")}</Text>
              <View style={[styles.input, styles.lockedField]}>
                <MaterialCommunityIcons
                  name="map-outline"
                  size={16}
                  color="#bbb"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.lockedFieldText}>
                  {t(profile.state) || t("Not set")}
                </Text>
                <MaterialCommunityIcons name="lock" size={14} color="#ccc" />
              </View>
              <Text style={styles.lockedHint}>
                <MaterialCommunityIcons name="lock" size={11} color="#bbb" />
                {"  "}
                {t("State cannot be changed after registration")}
              </Text>
            </View>

            {/* District — validated dropdown only */}
            {districts.length > 0 ? (
              <DistrictDropdown
                label={t("District")}
                value={profile.district}
                items={districts}
                onSelect={(d) => setProfile({ ...profile, district: d })}
                loading={loadingDistricts}
              />
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("District")}</Text>
                <View style={[styles.input, styles.lockedField]}>
                  <MaterialCommunityIcons
                    name="city"
                    size={16}
                    color="#bbb"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.lockedFieldText}>
                    {t(profile.district) || t("Not set")}
                  </Text>
                  {loadingDistricts && (
                    <ActivityIndicator size="small" color="#2A9D8F" />
                  )}
                </View>
              </View>
            )}

            <Text style={styles.districtNote}>
              <MaterialCommunityIcons
                name="information-outline"
                size={12}
                color="#2A9D8F"
              />
              {"  "}
              {t("District is used for leaderboard and MSP matching")}
            </Text>
          </View>

          {/* ── Actions ────────────────────────────────────────────────── */}
          <View style={styles.actions}>
            <Button
              title={t("Save Profile Changes")}
              onPress={handleSaveChanges}
              loading={saving}
              style={{ backgroundColor: "#2A9D8F" }}
            />

            {profile.district ? (
              <TouchableOpacity
                style={styles.leaderboardButton}
                onPress={() =>
                  router.push({
                    pathname: "/leaderboard",
                    params: { district: profile.district },
                  })
                }
              >
                <MaterialCommunityIcons
                  name="podium"
                  size={20}
                  color="#2A9D8F"
                />
                <Text style={styles.leaderboardButtonText}>
                  {t("View")} {t(profile.district)} {t("Leaderboard")}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
              <MaterialCommunityIcons name="logout" size={20} color="#E76F51" />
              <Text style={styles.signOutText}>{t("Logout Account")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Fullscreen Map Modal ──────────────────────────────────────── */}
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
              showsUserLocation
              showsMyLocationButton={false}
              provider={PROVIDER_GOOGLE}
              mapType={mapType}
            >
              {tempCoords?.lat && (
                <Marker
                  coordinate={{
                    latitude: tempCoords.lat,
                    longitude: tempCoords.lng,
                  }}
                  draggable
                  onDragEnd={handleMapPress}
                  pinColor="#2A9D8F"
                />
              )}
            </MapView>

            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setMapModalVisible(false)}
                style={styles.iconBtn}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#264653"
                />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {tempCoords?.lat
                    ? t("Move marker to adjust")
                    : t("Tap map to pin farm")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleConfirmLocation}
                style={[
                  styles.confirmBtn,
                  !tempCoords?.lat && styles.confirmBtnDisabled,
                ]}
                disabled={!tempCoords?.lat}
              >
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
                <Text style={styles.confirmBtnText}>{t("Confirm")}</Text>
              </TouchableOpacity>
            </View>

            {/* GPS FAB */}
            <TouchableOpacity
              style={styles.gpsFab}
              onPress={getCurrentLocation}
              disabled={fetchingGps}
            >
              {fetchingGps ? (
                <ActivityIndicator color="#2A9D8F" size="small" />
              ) : (
                <MaterialCommunityIcons
                  name="crosshairs-gps"
                  size={26}
                  color="#2A9D8F"
                />
              )}
            </TouchableOpacity>

            {/* Map type toggle FAB */}
            <TouchableOpacity
              style={styles.mapTypeFab}
              onPress={() =>
                setMapType((m) => (m === "hybrid" ? "standard" : "hybrid"))
              }
            >
              <MaterialCommunityIcons
                name={mapType === "hybrid" ? "map" : "satellite-variant"}
                size={22}
                color="#2A9D8F"
              />
            </TouchableOpacity>

            {/* Bottom card */}
            {tempCoords?.lat ? (
              <View style={styles.coordsInfo}>
                <View style={styles.coordsIcon}>
                  <MaterialCommunityIcons
                    name="home-map-marker"
                    size={20}
                    color="#2A9D8F"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.coordsText}>
                    {t("Lat")}: {tempCoords.lat.toFixed(5)}, {t("Lng")}:{" "}
                    {tempCoords.lng.toFixed(5)}
                  </Text>
                  <Text style={styles.coordsHint}>
                    {t("Tap on map or drag marker to adjust")}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.instructionBanner}>
                <MaterialCommunityIcons
                  name="gesture-tap"
                  size={20}
                  color="#264653"
                />
                <Text style={styles.instructionText}>
                  {t("Tap anywhere on the map to drop a pin at your farm")}
                </Text>
              </View>
            )}
          </View>
        </Modal>
      </ScrollView>
    </ScreenWrapper>
  );
}

// ─── Dropdown Styles ──────────────────────────────────────────────────────────
const dd = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: "600", color: "#264653", marginBottom: 6 },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#dde3e9",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 50,
  },
  triggerSelected: { borderColor: "#2A9D8F", backgroundColor: "#f0faf9" },
  triggerText: { flex: 1, fontSize: 15, color: "#aaa" },
  triggerTextSelected: { color: "#264653", fontWeight: "500" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.72,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    overflow: "hidden",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sheetTitle: { flex: 1, fontSize: 17, fontWeight: "700", color: "#264653" },
  sheetClose: { padding: 4 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 6,
    backgroundColor: "#f4f6f7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#264653", padding: 0 },
  resultCount: { fontSize: 12, color: "#999", marginLeft: 20, marginBottom: 6 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionSelected: { backgroundColor: "#f0faf9" },
  optionText: { flex: 1, fontSize: 15, color: "#333" },
  optionTextSelected: { color: "#2A9D8F", fontWeight: "600" },
  separator: { height: 1, backgroundColor: "#f5f5f5", marginHorizontal: 20 },
  emptyBox: { paddingVertical: 40, alignItems: "center", gap: 8 },
  emptyText: { color: "#aaa", fontSize: 14 },
});

// ─── Main Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 400,
  },

  header: { alignItems: "center", paddingTop: 50, paddingBottom: 24 },
  avatarContainer: { marginBottom: 12 },
  userName: { fontSize: 24, fontWeight: "800", color: "#264653" },
  userPhone: { fontSize: 14, color: "#888", marginTop: 4 },

  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2A9D8F",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 14,
  },

  mapPreview: {
    height: 180,
    backgroundColor: "#e8f4f8",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#d0e8e6",
    borderStyle: "dashed",
    position: "relative",
  },
  mapPreviewActive: { borderStyle: "solid", borderColor: "#2A9D8F" },
  placeholderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(244,246,248,0.93)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  placeholderText: {
    color: "#2A9D8F",
    marginTop: 12,
    fontWeight: "600",
    fontSize: 15,
  },
  mapEditOverlay: { position: "absolute", bottom: 10, right: 10, zIndex: 2 },

  inputGroup: { marginBottom: 14 },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#dde3e9",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#264653",
  },
  disabledInput: {
    backgroundColor: "#f4f5f6",
    color: "#aaa",
    borderColor: "#e5e7ea",
  },
  lockedField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f5f6",
    borderColor: "#e5e7ea",
  },
  lockedFieldText: { flex: 1, fontSize: 15, color: "#aaa" },
  lockedHint: { fontSize: 11, color: "#bbb", marginTop: 5, marginLeft: 2 },
  districtNote: { fontSize: 12, color: "#2A9D8F", marginTop: 2, opacity: 0.8 },

  actions: { marginTop: 8 },
  leaderboardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#2A9D8F",
    gap: 8,
  },
  leaderboardButtonText: { color: "#2A9D8F", fontWeight: "700", fontSize: 15 },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    padding: 10,
  },
  signOutText: {
    color: "#E76F51",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },

  modalBody: { flex: 1, backgroundColor: "#000" },
  fullMap: { flex: 1 },
  modalHeader: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  iconBtn: { padding: 6, borderRadius: 8, backgroundColor: "#f4f6f8" },
  modalTitle: { fontWeight: "600", color: "#264653", fontSize: 14 },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2A9D8F",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    elevation: 3,
  },
  confirmBtnDisabled: { backgroundColor: "#aaa" },
  confirmBtnText: { color: "white", fontWeight: "700", fontSize: 14 },
  gpsFab: {
    position: "absolute",
    bottom: 190,
    right: 18,
    backgroundColor: "white",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  mapTypeFab: {
    position: "absolute",
    bottom: 122,
    right: 18,
    backgroundColor: "white",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  coordsInfo: {
    position: "absolute",
    bottom: 36,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  coordsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0faf9",
    justifyContent: "center",
    alignItems: "center",
  },
  coordsText: { fontSize: 13, fontWeight: "600", color: "#264653" },
  coordsHint: { fontSize: 11, color: "#888", marginTop: 2 },
  instructionBanner: {
    position: "absolute",
    bottom: 36,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    elevation: 8,
  },
  instructionText: { flex: 1, fontSize: 13, color: "#264653", lineHeight: 18 },
});
