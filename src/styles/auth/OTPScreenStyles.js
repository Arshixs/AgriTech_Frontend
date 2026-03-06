// src/styles/auth/OTPScreenStyles.js

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    lineHeight: 24,
  },
  subtitleHighlight: {
    fontWeight: "bold",
    color: "#264653",
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: "bold",
  },
  resendContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  resendText: {
    color: "#2A9D8F",
    fontWeight: "600",
    fontSize: 14,
  },
});
