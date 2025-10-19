import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Button from '../../src/components/common/Button';
import { useAuth } from '../../src/context/AuthContext';

export default function HomeScreen() {
  const { user, signOut } = useAuth(); // Get user and signOut from context

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {user ? user.name : 'Farmer'}!</Text>
        <Text style={styles.subtitle}>This is your home dashboard.</Text>
        
        {/* We will add WeatherCard, TaskCalendar, etc. here */}

        <Button title="Sign Out" onPress={signOut} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#264653', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 40 },
});