import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator, // Added for loading state
} from "react-native";
import Button from "../../src/components/common/Button";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";
import {API_BASE_URL} from "../../secret"

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const authToken = user?.token; 
  // console.log("user");
  // console.log(user.token);

  const [loading, setLoading] = useState(true);
  const [farmStats, setFarmStats] = useState({
    totalArea: "0.0",
    activeFields: 0,
    activeAlerts: 0,
    avgHealth: 0
  });
  const [todaysTasks, setTodaysTasks] = useState([]);

  const fetchData = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch(`${API_BASE_URL}/api/farm/stats`, {
        headers: { 
          "Authorization": `Bearer ${authToken}` 
        }
      });

      if (!statsRes.ok) throw new Error("Failed to fetch farm stats");
      const statsData = await statsRes.json();
      
      setFarmStats({
        totalArea: statsData.totalArea || "0.0",
        activeFields: statsData.activeFields || 0,
        activeAlerts: statsData.activeAlerts || 0,
        avgHealth: statsData.avgHealth || 0,
      });
    
      // 2. Fetch Today's Tasks
      const tasksRes = await fetch(`${API_BASE_URL}/api/farm/tasks/today`, {
        headers: { 
          "Authorization": `Bearer ${authToken}` 
        }
      });
      
      if (!tasksRes.ok) throw new Error("Failed to fetch tasks");
      const tasksData = await tasksRes.json();
      setTodaysTasks(tasksData.tasks || []);

    } catch (error) {
      console.error("Home Screen Fetch Error:", error.message);
      // Optionally display error to user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchData();
    }
  }, [authToken]);

  const quickActions = [
    {
      id: 1,
      title: "Expense Predictor",
      description: "Calculate farming costs",
      icon: "calculator",
      color: "#2A9D8F",
      route: "/expense-prediction",
    },
    {
      id: 2,
      title: "Marketplace",
      description: "Rentals and buy raw maerials",
      icon: "tools",
      color: "#2A9D8F",
      route: "/vendor-market-screen",
    },
    {
      id: 3,
      title: "Price Forecast",
      description: "Track crop prices",
      icon: "chart-line",
      color: "#F4A261",
      route: "/(tabs)/price-forecast",
    },
    {
      id: 4,
      title: "Weather & Alerts",
      description: "Stay updated",
      icon: "bell",
      color: "#E76F51",
      route: "/(tabs)/alerts",
    },
    {
      id: 5,
      title: "Crop Guide",
      description: "Get recommendations",
      icon: "sprout",
      color: "#606C38",
      route: "/(tabs)/recommendations",
    },
    {
      id: 6,
      title: "IoT Devices",
      description: "Monitor sensors",
      icon: "access-point",
      color: "#457B9D",
      route: "/iot-devices",
    },
    {
      id: 6,
      title: "Crop Guide",
      description: "Get recommendations",
      icon: "sprout",
      color: "#606C38",
      route: "/(tabs)/recommendations",
    },
  ];

  const stats = [
    { label: "Total Land", value: `${farmStats.totalArea} Acres`, icon: "terrain" },
    { label: "Active Fields", value: `${farmStats.activeFields}`, icon: "leaf" },
    { label: "Alerts", value: `${farmStats.activeAlerts}`, icon: "bell-alert" },
  ];

  const handleTaskCompletion = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/farm/tasks/${taskId}/complete`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        // Refresh tasks or filter completed task out
        setTodaysTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
        setFarmStats(prevStats => ({ 
          ...prevStats, 
          todaysTasks: prevStats.todaysTasks - 1 
        }));
      } else {
        console.error("Failed to complete task");
      }
    } catch (error) {
      console.error("Task completion error:", error.message);
    }
  };

  if (!authToken || loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
          <Text style={{ marginTop: 10, color: '#666' }}>Loading Dashboard...</Text>
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
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>
                {user ? user.name : "Farmer"}!
              </Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <FontAwesome name="user-circle" size={40} color="#2A9D8F" />
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

          {/* Featured: Expense Predictor */}
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => router.push("/expense-prediction")}
            activeOpacity={0.8}
          >
            <View style={styles.featuredContent}>
              <View style={styles.featuredLeft}>
                <View style={styles.featuredIconContainer}>
                  <MaterialCommunityIcons
                    name="calculator"
                    size={32}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.featuredText}>
                  <Text style={styles.featuredTitle}>Expense Predictor</Text>
                  <Text style={styles.featuredDescription}>
                    Get accurate cost estimates for your crops
                  </Text>
                </View>
              </View>
              <FontAwesome name="chevron-right" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
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

          {/* Today's Tasks */}
          <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>Today's Tasks ({farmStats.todaysTasks})</Text>
            {todaysTasks.length === 0 ? (
              <Text style={styles.noTasksText}>No tasks scheduled for today. Good work!</Text>
            ) : (
              todaysTasks.map((task) => (
                <View key={task._id} style={styles.taskCard}>
                  <View style={styles.taskLeft}>
                    <MaterialCommunityIcons
                      name={task.type === 'Irrigation' ? "water" : task.type === 'Fertilization' ? "spray" : "clipboard-text"}
                      size={24}
                      color="#2A9D8F"
                    />
                    <View style={styles.taskInfo}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <Text style={styles.taskTime}>
                        {task.fieldId?.name ? `Field: ${task.fieldId.name}` : `Type: ${task.type}`}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.taskCheckbox}
                    onPress={() => handleTaskCompletion(task._id)}
                  >
                    <FontAwesome name="circle-o" size={24} color="#CCC" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Sign Out Button */}
          <View style={styles.signOutContainer}>
            <Button title="Sign Out" onPress={signOut} />
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
  },
  featuredCard: {
    backgroundColor: "#2A9D8F",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  featuredContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  featuredIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featuredText: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
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
  tasksSection: {
    marginBottom: 30,
  },
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  taskInfo: {
    marginLeft: 12,
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
  },
  taskCheckbox: {
    padding: 5,
  },
  signOutContainer: {
    marginTop: 20,
  },
});
