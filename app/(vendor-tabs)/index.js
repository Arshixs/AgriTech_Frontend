import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../../secret";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";

export default function VendorDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [recentOrders, setRecentOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(NaN);
  const [activeOrders, setActiveOrders] = useState(NaN);
  const [pendingOrders, setPendingOrders] = useState(NaN);

  const fetchProfile = async () => {
    const res = await fetch(`${API_BASE_URL}/api/vendor/auth/my`, {
      method: "GET",
      headers: {
        "Content-type": "appication/json",
        Authorization: `Bearer ${user.token}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      console.log(data);
      setRecentOrders(data.recentOrders);
      setTotalRevenue(data.stats.monthlyRevenue);
      setPendingOrders(data.stats.pendingOrders);
      setActiveOrders(data.stats.activeOrders);
    } else {
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#2A9D8F";
      case "pending":
        return "#F4A261";
      case "rejected":
        return "#E76F51";
      default:
        return "#666";
    }
  };

  // Helper function to format order ID
  const formatOrderId = (id) => {
    return `#${id.slice(-6).toUpperCase()}`;
  };

  // Mock data for the dashboard
  const stats = [
    {
      label: "Total Sales (Month)",
      value: `${totalRevenue}`,
      icon: "currency-inr",
    },
    {
      label: "Pending Orders",
      value: `${pendingOrders}`,
      icon: "package-variant-closed",
    },
    {
      label: "Active Orders",
      value: `${activeOrders}`,
      icon: "run",
    },
  ];

  const quickActions = [
    {
      title: "My Products",
      icon: "store",
      color: "#2A9D8F",
      route: "/(vendor-tabs)/products",
    },
    {
      title: "My Orders",
      icon: "package",
      color: "#457B9D",
      route: "/(vendor-tabs)/orders",
    },
    {
      title: "Transactions",
      icon: "transfer",
      color: "#F4A261",
      route: "/transaction-history",
    },
    {
      title: "Add New Product",
      icon: "plus-box",
      color: "#E76F51",
      route: "/add-edit-product",
    },
  ];

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>
                {user ? user.name : "Vendor"}!
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push("/(vendor-tabs)/profile")}
            >
              <FontAwesome name="user-circle" size={40} color="#457B9D" />
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <MaterialCommunityIcons
                  name={stat.icon}
                  size={24}
                  color="#2A9D8F"
                />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.title}
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
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Orders List - Dynamic */}
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <View key={order._id} style={styles.taskCard}>
                <View style={styles.taskLeft}>
                  <Text style={styles.taskTitle}>
                    Order {formatOrderId(order._id)}
                  </Text>
                  <Text style={styles.taskTime}>
                    {order.productSnapshot.name}
                  </Text>
                  <Text style={styles.taskSubtitle}>
                    Qty: {order.quantity} | ₹{order.totalAmount}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.taskStatus,
                    { color: getStatusColor(order.status) },
                  ]}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="package-variant"
                size={48}
                color="#CCC"
              />
              <Text style={styles.emptyStateText}>No recent orders</Text>
            </View>
          )}
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
  greeting: {
    fontSize: 16,
    color: "#666",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
    marginTop: 4,
  },
  profileButton: {
    padding: 5,
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
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 16,
    marginTop: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
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
    textAlign: "center",
  },
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  taskLeft: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
    marginBottom: 2,
  },
  taskTime: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  taskSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  taskStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },
});
