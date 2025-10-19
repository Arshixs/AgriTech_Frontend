import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';

export default function FarmScreen() {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>My Farm</Text>
        <Text style={styles.subtitle}>Your farm plots will be listed here.</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#264653', marginTop: 20 },
  subtitle: { fontSize: 18, color: '#666', marginTop: 10 },
});