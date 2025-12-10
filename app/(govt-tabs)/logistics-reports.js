// File: app/(govt-tabs)/logistics-reports.js

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LogisticsReportsScreen() {
  
  // Mock data for reports
  const reportStats = [
    { 
      title: 'Total Cold Storage', 
      value: '85%', 
      label: 'Capacity Used', 
      icon: 'warehouse', 
      color: '#457B9D' 
    },
    { 
      title: 'Quality Audits', 
      value: '98.2%', 
      label: 'Pass Rate', 
      icon: 'check-all', 
      color: '#2A9D8F' 
    },
    //{ 
    //   title: 'Logistics Partners', 
    //   value: '45', 
    //   label: 'Active Carriers', 
    //   icon: 'truck-fast', 
    //   color: '#606C38' 
    // },
  ];

  const reportLinks = [
    { title: 'Monthly Quality Grading Report', icon: 'file-chart' },
    { title: 'State-wise Storage Occupancy', icon: 'file-chart' },
    { title: 'Logistics Performance Review', icon: 'file-chart' },
    { title: 'MSP Compliance Trends (Q3)', icon: 'file-chart' },
  ];

  return (
    <ScreenWrapper style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Access & Reports</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Live Statistics</Text>
        {reportStats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name={stat.icon} size={24} color={stat.color} />
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
            <View style={styles.statBody}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          </View>
        ))}
        
        <Text style={styles.sectionTitle}>Downloadable Reports</Text>
        <View style={styles.linksContainer}>
          {reportLinks.map((link, index) => (
            <TouchableOpacity key={index} style={styles.linkCard}>
              <MaterialCommunityIcons name={link.icon} size={24} color="#606C38" />
              <Text style={styles.linkText}>{link.title}</Text>
              <MaterialCommunityIcons name="download" size={24} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#264653',
  },
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
    marginLeft: 10,
  },
  statBody: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#264653',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  linksContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: '#264653',
    marginLeft: 12,
  },
});