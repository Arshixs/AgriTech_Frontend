import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from '../../styles/common/InputStyles';

const Input = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      placeholderTextColor="#888"
    />
  </View>
);
export default Input;