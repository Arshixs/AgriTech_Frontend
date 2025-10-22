
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import { useAuth } from '../../src/context/AuthContext';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function VendorDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Mock data for the dashboard
  const stats = [
    { label: 'Total Sales (Month)', value: '₹1,20,500', icon: 'currency-inr' },
    { label: 'Pending Orders', value: '12', icon: 'package-variant-closed' },
    { label: 'New Messages', value: '3', icon: 'message-text' },
  ];

  const quickActions = [
    {
      title: 'My Products',
      icon: 'store',
      color: '#2A9D8F',
      route: '/(vendor-tabs)/products',
    },
    {
      title: 'Manage Rentals',
      icon: 'car',
      color: '#457B9D',
      route: '/(vendor-tabs)/rentals',
    },
    {
      title: 'View Messages',
      icon: 'chat',
      color: '#F4A261',
      route: '/(vendor-tabs)/bargain',
    },
    {
      title: 'Add New Product',
      icon: 'plus-box',
      color: '#E76F51',
      route: '/add-edit-product', // Navigates to top-level screen
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
                {user ? user.orgName : 'Vendor'}!
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/(vendor-tabs)/profile')}
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

          {/* Recent Orders List (Mock) */}
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <View style={styles.taskCard}>
            <View style={styles.taskLeft}>
              <Text style={styles.taskTitle}>Order #1024</Text>
              <Text style={styles.taskTime}>Farmer: Ram Singh</Text>
            </View>
            <Text style={styles.taskStatus}>Pending</Text>
          </View>
          <View style={styles.taskCard}>
            <View style={styles.taskLeft}>
              <Text style={styles.taskTitle}>Order #1023</Text>
              <Text style={styles.taskTime}>Farmer: Priya Sharma</Text>
            </View>
            <Text style={[styles.taskStatus, {color: '#2A9D8F'}]}>Completed</Text>
          </View>

        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

// Reusing styles from your farmer's index.js and adapting theme
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
    marginBottom: 30,
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
    marginTop: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
    textAlign: 'center',
  },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    fontWeight: '600',
    color: '#264653',
    marginBottom: 2,
  },
  taskTime: {
    fontSize: 13,
    color: '#666',
  },
  taskStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F4A261', // Orange for pending
  },
});