import { FontAwesome } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useAuth } from "../../src/context/AuthContext";

// Custom Sidebar Component
function CustomDrawerContent(props) {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const handleProfilePress = () => {
    // Navigate to the profile screen
    router.push("/profile");
    // props.navigation.closeDrawer();
  };
  return (
    <DrawerContentScrollView {...props}>
      {/* Wrap header in TouchableOpacity to make it clickable */}
      <TouchableOpacity
        style={styles.drawerHeader}
        onPress={handleProfilePress}
        activeOpacity={0.7}
      >
        <FontAwesome name="user-circle" size={60} color="#2A9D8F" />
        <View style={styles.textContainer}>
          <Text style={styles.userName}>{user?.name || t("Farmer")}</Text>
          <Text style={styles.viewProfileText}>{t("View Profile")}</Text>
        </View>
      </TouchableOpacity>

      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { t } = useTranslation();
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // Hides the default top bar globally
        drawerActiveTintColor: "#2A9D8F",
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ drawerLabel: t("Home") }} />
      <Drawer.Screen
        name="farmer-orders-screen"
        options={{ drawerLabel: t("My Orders") }}
      />
      <Drawer.Screen
        name="iot-devices"
        options={{ drawerLabel: t("IoT Devices") }}
      />
      <Drawer.Screen
        name="expense-prediction"
        options={{ drawerLabel: t("Expense Prediction") }}
      />
      <Drawer.Screen name="view-msp" options={{ drawerLabel: t("View MSP") }} />
      <Drawer.Screen
        name="vendor-market-screen"
        options={{ drawerLabel: t("Vendor Marketplace") }}
      />
      <Drawer.Screen
        name="quality"
        options={{ drawerLabel: t("Quality Certification") }}
      />
      {/* <Drawer.Screen name="field-details" options={{ drawerLabel: "Field Details" }} /> */}
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    marginBottom: 10,
    alignItems: "center"
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 10,
    borderRadius: 5
  },
  userRole: { fontSize: 12, color: "#666" },
});
