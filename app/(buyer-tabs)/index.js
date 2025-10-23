// File: app/(buyer-tabs)/index.js

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import { useAuth } from '../../src/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Button from '../../src/components/common/Button';

// Mock data for "My Active Requirements"
const MOCK_REQUIREMENTS = [
  { id: 'req1', crop: 'Basmati Rice', quantity: '100 Tons', status: 'Bidding Open' },
  { id: 'req2', crop: 'Tomatoes (Grade A)', quantity: '50 Tons', status: 'Bidding Open' },
  { id: 'req3', crop: 'Wheat', quantity: '500 Tons', status: 'Contract Farming' },
];

export default function BuyerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const stats = [
    { label: 'Posted Requirements', value: '5', icon: 'format-list-bulleted' },
    { label: 'Active Bids', value: '12', icon: 'gavel' },
    { label: 'Contracts', value: '2', icon: 'handshake' },
  ];

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome,</Text>
              <Text style={styles.userName}>
                {user?.companyName || 'Buyer Company'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/(buyer-tabs)/profile')}
            >
              <MaterialCommunityIcons name="account-group" size={40} color="#E76F51" />
            </TouchableOpacity>
          </View>

          {/* Call to Action Button */}
          <Button 
            title="Post New Crop Requirement"
            onPress={() => router.push('/post-requirement')}
            style={styles.postButton}
          />

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <MaterialCommunityIcons
                  name={stat.icon}
                  size={24}
                  color="#E76F51"
                />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Active Requirements List */}
          <Text style={styles.sectionTitle}>My Active Requirements</Text>
          {MOCK_REQUIREMENTS.map((req) => (
            <TouchableOpacity 
              key={req.id} 
              style={styles.reqCard}
              onPress={() => router.push('/(buyer-tabs)/requirements')}
            >
              <View style={styles.reqInfo}>
                <Text style={styles.reqCrop}>{req.crop}</Text>
                <Text style={styles.reqQuantity}>{req.quantity}</Text>
              </View>
              <View style={styles.reqStatusContainer}>
                <Text style={styles.reqStatus}>{req.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={styles.viewAllButton} 
            onPress={() => router.push('/(buyer-tabs)/requirements')}
          >
            <Text style={styles.viewAllText}>View All Requirements</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color="#E76F51" />
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#264653',
    marginTop: 4,
  },
  profileButton: {
    padding: 5,
  },
  postButton: {
    backgroundColor: '#E76F51',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#264653',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 16,
  },
  reqCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  reqInfo: {
    flex: 1,
  },
  reqCrop: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
  },
  reqQuantity: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  reqStatusContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFF8F0', // Light orange background
  },
  reqStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F4A261', // Orange
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E76F51',
    marginRight: 6,
  },
});