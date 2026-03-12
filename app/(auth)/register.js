import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
// import { API_BASE_URL } from "../../secret";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
import Button from "../../src/components/common/Button";
import Input from "../../src/components/common/Input";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

// ─── Searchable Dropdown Component ──────────────────────────────────────────

function SearchableDropdown({
  label,
  placeholder,
  value,
  items,
  onSelect,
  disabled = false,
  disabledMessage,
  loading = false,
  icon,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { t } = useTranslation();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const filtered = items.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleOpen = () => {
    if (disabled) {
      shake();
      return;
    }
    setIsOpen(true);
    setQuery("");
  };

  const handleSelect = (item) => {
    onSelect(item);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <View style={dd.wrapper}>
      <Text style={dd.label}>{label}</Text>
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <TouchableOpacity
          onPress={handleOpen}
          style={[
            dd.trigger,
            disabled && dd.triggerDisabled,
            value && dd.triggerSelected,
          ]}
          activeOpacity={0.7}
        >
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={18}
              color={disabled ? "#aaa" : value ? "#2A9D8F" : "#666"}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              dd.triggerText,
              disabled && dd.triggerTextDisabled,
              value && dd.triggerTextSelected,
            ]}
            numberOfLines={1}
          >
            {value ? t(value) : placeholder}
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color="#2A9D8F" />
          ) : (
            <MaterialCommunityIcons
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color={disabled ? "#aaa" : "#666"}
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Inline disabled hint */}
      {disabled && disabledMessage && (
        <Text style={dd.disabledHint}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={12}
            color="#E76F51"
          />
          {"  "}
          {disabledMessage}
        </Text>
      )}

      {/* Dropdown Modal */}
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
          {/* Header */}
          <View style={dd.sheetHeader}>
            <Text style={dd.sheetTitle}>{label}</Text>
            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              style={dd.sheetClose}
            >
              <MaterialCommunityIcons name="close" size={22} color="#264653" />
            </TouchableOpacity>
          </View>

          {/* Search box */}
          <View style={dd.searchBox}>
            <MaterialCommunityIcons name="magnify" size={18} color="#888" />
            <TextInput
              style={dd.searchInput}
              placeholder={t("Type to filter...")}
              placeholderTextColor="#aaa"
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
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

          {/* Results count */}
          <Text style={dd.resultCount}>
            {filtered.length} {t("result(s)")}
          </Text>

          {/* List */}
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

// ─── Static fallback data (used if API is unavailable) ───────────────────────

const STATIC_STATES = [
  { state: "Uttar Pradesh", stateCode: "UP" },
  { state: "Maharashtra", stateCode: "MH" },
  { state: "Punjab", stateCode: "PB" },
  { state: "Rajasthan", stateCode: "RJ" },
  { state: "Madhya Pradesh", stateCode: "MP" },
  { state: "Bihar", stateCode: "BR" },
];

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

// ─── District centre coordinates for auto-zoom ────────────────────────────────
// Format: "District Name": [latitude, longitude]
const DISTRICT_COORDS = {
  // Uttar Pradesh
  Agra: [27.1767, 78.0081],
  Aligarh: [27.8974, 78.088],
  "Ambedkar Nagar": [26.4499, 82.6924],
  Amethi: [26.1542, 81.8125],
  Amroha: [28.9042, 78.4673],
  Auraiya: [26.4644, 79.511],
  Ayodhya: [26.7922, 82.1998],
  Azamgarh: [26.0737, 83.1836],
  Baghpat: [28.9443, 77.2163],
  Bahraich: [27.5742, 81.596],
  Ballia: [25.7516, 84.1469],
  Balrampur: [27.4305, 82.1836],
  Banda: [25.48, 80.336],
  Barabanki: [26.9239, 81.1848],
  Bareilly: [28.367, 79.4304],
  Basti: [26.8013, 82.7263],
  Bhadohi: [25.3939, 82.568],
  Bijnor: [29.3726, 78.1352],
  Budaun: [28.0377, 79.1219],
  Bulandshahr: [28.4072, 77.8498],
  Chandauli: [25.2707, 83.2712],
  Chitrakoot: [25.1985, 80.8979],
  Deoria: [26.5022, 83.7804],
  Etah: [27.5591, 78.667],
  Etawah: [26.7856, 79.0106],
  Farrukhabad: [27.391, 79.5797],
  Fatehpur: [25.9299, 80.8133],
  Firozabad: [27.159, 78.3955],
  "Gautam Buddha Nagar": [28.5355, 77.391],
  Ghaziabad: [28.6692, 77.4538],
  Ghazipur: [25.5784, 83.5716],
  Gonda: [27.1338, 81.9602],
  Gorakhpur: [26.7606, 83.3732],
  Hamirpur: [25.95, 80.15],
  Hapur: [28.7295, 77.7756],
  Hardoi: [27.3955, 80.1289],
  Hathras: [27.5952, 78.052],
  Jalaun: [25.92, 79.33],
  Jaunpur: [25.746, 82.6836],
  Jhansi: [25.4484, 78.5685],
  Kannauj: [27.0536, 79.9154],
  "Kanpur Dehat": [26.42, 80.14],
  "Kanpur Nagar": [26.4499, 80.3319],
  Kasganj: [27.8055, 78.645],
  Kaushambi: [25.53, 81.38],
  Kheri: [27.9, 80.8],
  Kushinagar: [26.7408, 83.8892],
  Lalitpur: [24.689, 78.4116],
  Lucknow: [26.8467, 80.9462],
  Maharajganj: [27.1292, 83.5606],
  Mahoba: [25.29, 79.87],
  Mainpuri: [27.2352, 79.022],
  Mathura: [27.4924, 77.6737],
  Mau: [25.942, 83.561],
  Meerut: [28.9845, 77.7064],
  Mirzapur: [25.1459, 82.569],
  Moradabad: [28.8386, 78.7733],
  Muzaffarnagar: [29.4727, 77.7085],
  Pilibhit: [28.6316, 79.8031],
  Pratapgarh: [25.8959, 81.9997],
  Prayagraj: [25.4358, 81.8463],
  "Rae Bareli": [26.2251, 81.2351],
  Rampur: [28.8188, 79.0241],
  Saharanpur: [29.968, 77.546],
  Sambhal: [28.5906, 78.5724],
  "Sant Kabir Nagar": [26.7897, 83.0561],
  Shahjahanpur: [27.8829, 79.9054],
  Shamli: [29.45, 77.31],
  Shravasti: [27.51, 82.0],
  Siddharthnagar: [27.2892, 83.0714],
  Sitapur: [27.5647, 80.681],
  Sonbhadra: [24.6868, 83.0688],
  Sultanpur: [26.2637, 82.0728],
  Unnao: [26.5475, 80.4928],
  Varanasi: [25.3176, 82.9739],
  // Maharashtra
  Pune: [18.5204, 73.8567],
  "Mumbai City": [18.9388, 72.8354],
  "Mumbai Suburban": [19.1136, 72.8697],
  Nagpur: [21.1458, 79.0882],
  Nashik: [19.9975, 73.7898],
  Aurangabad: [19.8762, 75.3433],
  Kolhapur: [16.705, 74.2433],
  Solapur: [17.6805, 75.9064],
  Thane: [19.2183, 72.9781],
  Amravati: [20.932, 77.7523],
  // Punjab
  Ludhiana: [30.901, 75.8573],
  Amritsar: [31.634, 74.8723],
  Jalandhar: [31.326, 75.5762],
  Patiala: [30.3398, 76.3869],
  Bathinda: [30.211, 74.9455],
  Mohali: [30.7046, 76.7179],
  // Rajasthan
  Jaipur: [26.9124, 75.7873],
  Jodhpur: [26.2389, 73.0243],
  Udaipur: [24.5854, 73.7125],
  Kota: [25.2138, 75.8648],
  Ajmer: [26.4499, 74.6399],
  Bikaner: [28.0229, 73.3119],
  // Madhya Pradesh
  Bhopal: [23.2599, 77.4126],
  Indore: [22.7196, 75.8577],
  Gwalior: [26.2183, 78.1828],
  Jabalpur: [23.1815, 79.9864],
  Ujjain: [23.1765, 75.7885],
  // Bihar
  Patna: [25.5941, 85.1376],
  Gaya: [24.7973, 85.0002],
  Muzaffarpur: [26.1197, 85.391],
  Bhagalpur: [25.2425, 86.9842],
  Darbhanga: [26.1542, 85.8918],
};

/**
 * Returns {latitude, longitude, latitudeDelta, longitudeDelta} centred on district.
 * Falls back to state centre, then India centre.
 */
function getRegionForDistrict(districtName, stateCode) {
  if (districtName && DISTRICT_COORDS[districtName]) {
    const [lat, lng] = DISTRICT_COORDS[districtName];
    return {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.35,
      longitudeDelta: 0.35,
    };
  }
  // State-level fallbacks
  const STATE_CENTRES = {
    UP: {
      latitude: 26.8467,
      longitude: 80.9462,
      latitudeDelta: 8,
      longitudeDelta: 8,
    },
    MH: {
      latitude: 19.7515,
      longitude: 75.7139,
      latitudeDelta: 8,
      longitudeDelta: 8,
    },
    PB: {
      latitude: 31.1471,
      longitude: 75.3412,
      latitudeDelta: 4,
      longitudeDelta: 4,
    },
    RJ: {
      latitude: 27.0238,
      longitude: 74.2179,
      latitudeDelta: 8,
      longitudeDelta: 8,
    },
    MP: {
      latitude: 22.9734,
      longitude: 78.6569,
      latitudeDelta: 8,
      longitudeDelta: 8,
    },
    BR: {
      latitude: 25.0961,
      longitude: 85.3131,
      latitudeDelta: 5,
      longitudeDelta: 5,
    },
  };
  if (stateCode && STATE_CENTRES[stateCode]) return STATE_CENTRES[stateCode];
  return {
    latitude: 22.5937,
    longitude: 80.9629,
    latitudeDelta: 20,
    longitudeDelta: 20,
  };
}

// ─── Main Registration Screen ────────────────────────────────────────────────

export default function RegistrationScreen() {
  const { signInFarmer, user } = useAuth();
  const router = useRouter();
  const authToken = user?.token;
  const { t } = useTranslation();

  // Form fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [adharNumber, setAdharNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);

  // State / District
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Map & Location
  const mapRef = useRef(null);
  const previewMapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [isMapModalVisible, setMapModalVisible] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);
  const [mapType, setMapType] = useState("hybrid"); // satellite on open

  const [previewRegion, setPreviewRegion] = useState({
    latitude: 26.8467,
    longitude: 80.9462,
    latitudeDelta: 8,
    longitudeDelta: 8,
  });

  // ── Fetch all states on mount (falls back to static data if API missing) ──
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/location/states`);
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error(`Server returned non-JSON (${res.status})`);
        }
        const data = await res.json();
        if (data.success) {
          setStates(data.states.map((s) => s.state));
          stateCodeMap.current = Object.fromEntries(
            data.states.map((s) => [s.state, s.stateCode]),
          );
          setLoadingStates(false);
          return;
        }
      } catch (err) {
        console.warn(
          "States API unavailable, using built-in data:",
          err.message,
        );
      }
      // ── Fallback: use hardcoded static data ──
      setStates(STATIC_STATES.map((s) => s.state));
      stateCodeMap.current = Object.fromEntries(
        STATIC_STATES.map((s) => [s.state, s.stateCode]),
      );
      setLoadingStates(false);
    })();
  }, []);

  const stateCodeMap = useRef({});

  // ── Fetch districts when state changes (falls back to static data) ──
  useEffect(() => {
    if (!selectedStateCode) {
      setDistricts([]);
      setSelectedDistrict(null);
      return;
    }
    (async () => {
      setLoadingDistricts(true);
      setSelectedDistrict(null);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/location/districts/${selectedStateCode}`,
        );
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error(`Server returned non-JSON (${res.status})`);
        }
        const data = await res.json();
        if (data.success) {
          setDistricts(data.districts);
          setLoadingDistricts(false);
          return;
        }
      } catch (err) {
        console.warn(
          "Districts API unavailable, using built-in data:",
          err.message,
        );
      }
      // ── Fallback: use hardcoded static data ──
      setDistricts(STATIC_DISTRICTS[selectedStateCode] || []);
      setLoadingDistricts(false);
    })();
  }, [selectedStateCode]);

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedStateCode(stateCodeMap.current[state] || null);
  };

  // ── Auto-zoom map to district when district is selected ──
  useEffect(() => {
    if (!selectedDistrict) return;
    const region = getRegionForDistrict(selectedDistrict, selectedStateCode);
    setPreviewRegion(region);
    // If map modal is open, animate there too
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 800);
    }
  }, [selectedDistrict]);

  // ── Map interactions ──
  const handleMapPress = useCallback((e) => {
    const coords = e.nativeEvent.coordinate;
    setTempLocation({ lat: coords.latitude, lng: coords.longitude });
  }, []);

  const getCurrentLocation = async () => {
    setFetchingGps(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert(t("Location permission is required"));
        return;
      }

      let loc = await Location.getLastKnownPositionAsync({});
      if (!loc) {
        loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      const { latitude, longitude } = loc.coords;
      setTempLocation({ lat: latitude, lng: longitude });

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          { latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 },
          500,
        );
      }
    } catch (error) {
      console.error("GPS Error:", error);
      alert(t("Failed to get location"));
    } finally {
      setFetchingGps(false);
    }
  };

  const handleConfirmLocation = () => {
    if (!tempLocation) {
      alert(t("Please select a location on the map"));
      return;
    }
    setLocation(tempLocation);
    setPreviewRegion({
      latitude: tempLocation.lat,
      longitude: tempLocation.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setMapModalVisible(false);
  };

  // ── Form submit ──
  const handleCompleteProfile = async () => {
    if (!name.trim()) return alert(t("Please enter your full name"));
    if (!adharNumber || adharNumber.length !== 12)
      return alert(t("Please enter a valid 12-digit Aadhaar number"));
    if (!address.trim()) return alert(t("Please enter your address"));
    if (!selectedState) return alert(t("Please select your state"));
    if (!selectedDistrict) return alert(t("Please select your district"));
    if (!location) return alert(t("Please pin your home location on the map"));

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/farmer-auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          adharNumber,
          state: selectedState,
          district: selectedDistrict,
          coordinates: location,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("Update failed"));

      await signInFarmer({ ...data.farmer, token: authToken });
      router.replace("/(tabs)");
    } catch (err) {
      console.error("Registration Error:", err.message);
      alert(err.message || t("Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons
                name="account-edit"
                size={28}
                color="#fff"
              />
            </View>
            <Text style={styles.title}>{t("Complete Your Profile")}</Text>
            <Text style={styles.subtitle}>
              {t("Fill in the details to get started")}
            </Text>
          </View>

          {/* Section: Personal Info */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              <MaterialCommunityIcons
                name="account"
                size={14}
                color="#2A9D8F"
              />
              {"  "}
              {t("Personal Information")}
            </Text>

            <Input
              label={t("Full Name")}
              value={name}
              onChangeText={setName}
              placeholder={t("Enter your full name")}
            />
            <Input
              label={t("Aadhaar Number")}
              value={adharNumber}
              onChangeText={(v) => setAdharNumber(v.replace(/\D/g, ""))}
              keyboardType="number-pad"
              placeholder={t("12-digit Aadhaar number")}
              maxLength={12}
            />
            {adharNumber.length > 0 && adharNumber.length < 12 && (
              <Text style={styles.fieldHint}>
                {12 - adharNumber.length} {t("more digits needed")}
              </Text>
            )}
          </View>

          {/* Section: Address */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color="#2A9D8F"
              />
              {"  "}
              {t("Address Details")}
            </Text>

            <Input
              label={t("Village / Town / Street")}
              value={address}
              onChangeText={setAddress}
              placeholder={t("e.g. Village Rampur, Tehsil Sadar")}
            />

            {/* State Dropdown */}
            <SearchableDropdown
              label={t("State")}
              placeholder={t("Select State")}
              value={selectedState}
              items={states}
              onSelect={handleStateSelect}
              loading={loadingStates}
              icon="map"
            />

            {/* District Dropdown */}
            <SearchableDropdown
              label={t("District")}
              placeholder={t("Select District")}
              value={selectedDistrict}
              items={districts}
              onSelect={setSelectedDistrict}
              disabled={!selectedState}
              disabledMessage={t("Please select a state first")}
              loading={loadingDistricts}
              icon="city"
            />
          </View>

          {/* Section: Home Location */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              <MaterialCommunityIcons
                name="home-map-marker"
                size={14}
                color="#2A9D8F"
              />
              {"  "}
              {t("Home Location")}
            </Text>
            <Text style={styles.sectionSub}>
              {t("We use this to connect you with nearby services")}
            </Text>

            {/* Preview Map */}
            <TouchableOpacity
              style={[styles.mapPreview, location && styles.mapPreviewActive]}
              onPress={() => setMapModalVisible(true)}
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
                loadingEnabled={true}
              >
                {location && (
                  <Marker
                    coordinate={{
                      latitude: location.lat,
                      longitude: location.lng,
                    }}
                    pinColor="#2A9D8F"
                  />
                )}
              </MapView>

              {!location ? (
                <View style={styles.mapPlaceholder}>
                  <View style={styles.mapPlaceholderIcon}>
                    <MaterialCommunityIcons
                      name="home-map-marker"
                      size={36}
                      color="#2A9D8F"
                    />
                  </View>
                  <Text style={styles.mapPlaceholderTitle}>
                    {t("Pin Your Home")}
                  </Text>
                  <Text style={styles.mapPlaceholderSub}>
                    {t("Tap to open map and mark your location")}
                  </Text>
                </View>
              ) : (
                <View style={styles.mapBadge}>
                  <MaterialCommunityIcons
                    name="home-circle"
                    size={14}
                    color="#fff"
                  />
                  <Text style={styles.mapBadgeText}>{t("Home pinned")}</Text>
                </View>
              )}

              {/* Edit overlay when location is set */}
              {location && (
                <View style={styles.mapEditOverlay}>
                  <MaterialCommunityIcons
                    name="pencil-circle"
                    size={36}
                    color="#2A9D8F"
                  />
                </View>
              )}
            </TouchableOpacity>

            {/* Location confirmed indicator */}
            {location && (
              <View style={styles.locationInfo}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={16}
                  color="#2A9D8F"
                />
                <Text style={styles.locationInfoText}>
                  {t("Location saved. Tap map above to change.")}
                </Text>
              </View>
            )}
          </View>

          {/* Submit */}
          <View style={{ marginTop: 8, marginBottom: 30 }}>
            <Button
              title={t("Complete Registration")}
              onPress={handleCompleteProfile}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Fullscreen Map Modal ─────────────────────────────────────────── */}
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
            mapType={mapType}
          >
            {tempLocation && (
              <Marker
                coordinate={{
                  latitude: tempLocation.lat,
                  longitude: tempLocation.lng,
                }}
                draggable
                onDragEnd={handleMapPress}
                pinColor="#2A9D8F"
              />
            )}
          </MapView>

          {/* Top Header Bar */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setMapModalVisible(false)}
              style={styles.iconBtn}
            >
              <MaterialCommunityIcons name="close" size={22} color="#264653" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {tempLocation
                  ? t("Move marker to adjust")
                  : t("Tap map to pin home")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleConfirmLocation}
              style={[
                styles.confirmBtn,
                !tempLocation && styles.confirmBtnDisabled,
              ]}
              disabled={!tempLocation}
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

          {/* Satellite / Standard toggle FAB */}
          <TouchableOpacity
            style={styles.mapTypeFab}
            onPress={() =>
              setMapType((t) => (t === "satellite" ? "standard" : "satellite"))
            }
          >
            <MaterialCommunityIcons
              name={mapType === "satellite" ? "map" : "satellite-variant"}
              size={22}
              color="#2A9D8F"
            />
          </TouchableOpacity>

          {/* Bottom pin card — no address text, just district name */}
          {tempLocation && (
            <View style={styles.addressCard}>
              <View style={styles.addressCardIcon}>
                <MaterialCommunityIcons
                  name="home-map-marker"
                  size={22}
                  color="#2A9D8F"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressCardTitle}>
                  {t("Your Home Location")}
                </Text>
                {selectedDistrict ? (
                  <Text style={styles.addressCardAddress}>
                    {t(selectedDistrict)}
                    {selectedState ? `, ${t(selectedState)}` : ""}
                  </Text>
                ) : (
                  <Text style={styles.addressCardSub}>
                    {t("Pin dropped on map")}
                  </Text>
                )}
                <Text style={styles.addressCardHint}>
                  {t("Drag the pin to fine-tune your location")}
                </Text>
              </View>
            </View>
          )}

          {/* Instruction when no pin placed */}
          {!tempLocation && (
            <View style={styles.instructionBanner}>
              <MaterialCommunityIcons
                name="gesture-tap"
                size={20}
                color="#264653"
              />
              <Text style={styles.instructionText}>
                {t("Tap anywhere on the map to drop a pin at your home")}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

// ─── Dropdown Styles ─────────────────────────────────────────────────────────

const dd = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 6,
  },
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
  triggerDisabled: {
    backgroundColor: "#f4f5f6",
    borderColor: "#e5e7ea",
  },
  triggerSelected: {
    borderColor: "#2A9D8F",
    backgroundColor: "#f0faf9",
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    color: "#aaa",
  },
  triggerTextDisabled: {
    color: "#bbb",
  },
  triggerTextSelected: {
    color: "#264653",
    fontWeight: "500",
  },
  disabledHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#E76F51",
    marginLeft: 4,
  },
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
  sheetTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#264653",
  },
  sheetClose: {
    padding: 4,
  },
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
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#264653",
    padding: 0,
  },
  resultCount: {
    fontSize: 12,
    color: "#999",
    marginLeft: 20,
    marginBottom: 6,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionSelected: {
    backgroundColor: "#f0faf9",
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  optionTextSelected: {
    color: "#2A9D8F",
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 20,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 14,
  },
});

// ─── Main Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#f4f6f8",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
    paddingTop: 8,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2A9D8F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#2A9D8F",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#264653",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
  },
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2A9D8F",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  sectionSub: {
    fontSize: 12,
    color: "#999",
    marginTop: -10,
    marginBottom: 14,
  },
  fieldHint: {
    fontSize: 11,
    color: "#E76F51",
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 2,
  },

  // Map Preview
  mapPreview: {
    height: 170,
    backgroundColor: "#e8f4f8",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
    borderWidth: 2,
    borderColor: "#d0e8e6",
    borderStyle: "dashed",
    position: "relative",
  },
  mapPreviewActive: {
    borderStyle: "solid",
    borderColor: "#2A9D8F",
  },
  mapPlaceholder: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(244,246,248,0.93)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  mapPlaceholderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e8f7f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  mapPlaceholderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#264653",
    marginBottom: 3,
  },
  mapPlaceholderSub: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  mapBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#2A9D8F",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    zIndex: 2,
  },
  mapBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  mapEditOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    zIndex: 2,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    backgroundColor: "#f0faf9",
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  locationInfoText: {
    flex: 1,
    fontSize: 13,
    color: "#264653",
    lineHeight: 18,
  },

  // Map Modal
  modalBody: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullMap: {
    flex: 1,
  },
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
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f4f6f8",
  },
  modalTitle: {
    fontWeight: "600",
    color: "#264653",
    fontSize: 14,
  },
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
  confirmBtnDisabled: {
    backgroundColor: "#aaa",
  },
  confirmBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  gpsFab: {
    position: "absolute",
    bottom: 210,
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
  addressCard: {
    position: "absolute",
    bottom: 36,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  addressCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0faf9",
    justifyContent: "center",
    alignItems: "center",
  },
  addressCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#264653",
    marginBottom: 3,
  },
  addressCardAddress: {
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
    marginBottom: 4,
  },
  addressCardSub: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 4,
  },
  addressCardHint: {
    fontSize: 11,
    color: "#bbb",
    fontStyle: "italic",
  },
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
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: "#264653",
    lineHeight: 18,
  },
});
