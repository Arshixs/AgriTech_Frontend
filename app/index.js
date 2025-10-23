import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../src/components/common/ScreenWrapper"; // Adjust path as needed
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function RoleSelectionScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Agri-Tech</Text>
        <Text style={styles.subtitle}>How would you like to continue?</Text>

        {/* Farmer Button */}
        <TouchableOpacity
          style={[styles.roleButton, { backgroundColor: "#2A9D8F" }]} // Green
          onPress={() => router.push("/(auth)/login")}
        >
          <MaterialCommunityIcons name="barley" size={40} color="#FFFFFF" />
          <Text style={styles.buttonText}>I am a Farmer</Text>
        </TouchableOpacity>

        {/* Vendor Button */}
        <TouchableOpacity
          style={[styles.roleButton, { backgroundColor: "#457B9D" }]} // Blue
          onPress={() => router.push("/(vendor-auth)/login")}
        >
          <MaterialCommunityIcons name="store" size={40} color="#FFFFFF" />
          <Text style={styles.buttonText}>I am a Vendor</Text>
        </TouchableOpacity>
        
        {/* --- BUYER BUTTON --- */}
        <TouchableOpacity
          style={[styles.roleButton, { backgroundColor: "#E76F51" }]} // Orange/Red
          onPress={() => router.push("/(buyer-auth)/login")}
        >
          <MaterialCommunityIcons name="briefcase-account" size={40} color="#FFFFFF" />
          <Text style={styles.buttonText}>I am a Buyer</Text>
        </TouchableOpacity>

        {/* --- Govt BUTTON --- */}
        <TouchableOpacity
          style={[styles.roleButton, { backgroundColor: "#606C38" }]} // Dark Green/Brown
          onPress={() => router.push("/(govt-auth)/login")}
        >
          <MaterialCommunityIcons name="bank" size={40} color="#FFFFFF" />
          <Text style={styles.buttonText}>Government Login</Text>
        </TouchableOpacity>
        
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F9FA", // Your app's background color
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#264653", // Your dark blue
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  roleButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 16,
  },
});