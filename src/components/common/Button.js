import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { styles } from '../../styles/common/ButtonStyles';

const Button = ({ title, onPress, loading = false }) => (
  <TouchableOpacity style={styles.button} onPress={onPress} disabled={loading}>
    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.text}>{title}</Text>}
  </TouchableOpacity>
);
export default Button;