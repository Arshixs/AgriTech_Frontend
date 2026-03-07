import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { styles } from "../../styles/common/ButtonStyles";

const Button = ({
  title,
  onPress,
  style,
  loading = false,
  color = "#2A9D8F",
}) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor: color }, style]}
    onPress={onPress}
    disabled={loading}
  >
    {loading ? (
      <ActivityIndicator color="#FFF" />
    ) : (
      <Text style={styles.text}>{title}</Text>
    )}
  </TouchableOpacity>
);
export default Button;
