import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";

export default function AllActionsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const quickActions = [
    {
      id: 1,
      title: t("Expense Predictor"),
      description: t("Calculate farming costs"),
      icon: "calculator",
      color: "#2A9D8F",
      route: "/expense-prediction",
    },
    {
      id: 2,
      title: t("Marketplace"),
      description: t("Rentals and buy raw materials"),
      icon: "store",
      color: "#2A9D8F",
      route: "/vendor-market-screen",
    },
    {
      id: 3,
      title: t("Price Forecast"),
      description: t("Track crop prices"),
      icon: "chart-line",
      color: "#F4A261",
      route: "/price-forecast",
    },
    {
      id: 4,
      title: t("Weather & Alerts"),
      description: t("Stay updated"),
      icon: "bell",
      color: "#E76F51",
      route: "/alerts",
    },
    {
      id: 5,
      title: t("Crop Guide"),
      description: t("Get recommendations"),
      icon: "sprout",
      color: "#606C38",
      route: "/recommendations",
    },
    {
      id: 6,
      title: t("IoT Devices"),
      description: t("Monitor sensors"),
      icon: "access-point",
      color: "#457B9D",
      route: "/iot-devices",
    },
    {
      id: 7,
      title: t("My Orders"),
      description: t("All orders and Rentals"),
      icon: "clipboard-list",
      color: "#809d45",
      route: "/farmer-orders-screen",
    },
    {
      id: 8,
      title: t("My Certificates"),
      description: t("All certificates"),
      icon: "check-decagram",
      color: "#2A9D8F",
      route: "/quality",
    },
    {
      id: 9,
      title: t("My Offers"),
      description: t("See Requirement offer status"),
      icon: "tag-multiple",
      color: "#459d9d",
      route: "/my-offers",
    },
    {
      id: 10,
      title: t("Transaction History"),
      description: t("Check your recent transactions"),
      icon: "cash-multiple",
      color: "#6A4C93",
      route: "/farmer-transaction-history",
    },
    {
      id: 11,
      title: t("Pre-Harvest Marketplace"),
      description: t("Check the buyer's requirements"),
      icon: "handshake",
      color: "#F77F00",
      route: "/feed",
    },
    {
      id: 12,
      title: t("View MSP"),
      description: t("MSP of common crops"),
      icon: "currency-inr",
      color: "#2A9D8F",
      route: "/view-msp",
    },
    // {
    //   id: 13,
    //   title: t("My Farm"),
    //   description: t("Manage fields and crops"),
    //   icon: "land-fields",
    //   color: "#264653",
    //   route: "/farm",
    // },
  ];

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.userName}>{t("Quick Actions")}</Text>
          </View>

          <Text style={styles.sectionTitle}>{t("All Features")}</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => router.push(action.route)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.actionIconContainer,
                    { backgroundColor: action.color },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={action.icon}
                    size={28}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>
                  {action.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: "#666",
  },
});
