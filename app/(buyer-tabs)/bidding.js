// File: app/(buyer-tabs)/bidding.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data for bidding activities
const MOCK_BIDS = [
  {
    id: 'b1',
    type: 'My Requirement',
    title: 'Tomatoes (Grade A)',
    status: 'Live',
    currentBid: '₹1,900 / quintal',
    myBid: 'N/A',
  },
  {
    id: 'b2',
    type: 'Bid Placed',
    title: 'Basmati Rice (by Ram Singh)',
    status: 'Outbid',
    currentBid: '₹3,300 / quintal',
    myBid: '₹3,200 / quintal',
  },
  {
    id: 'b3',
    type: 'Bid Placed',
    title: 'Wheat (by Anil Kumar)',
    status: 'Winning',
    currentBid: '₹2,150 / quintal',
    myBid: '₹2,150 / quintal',
  },
  {
    id: 'b4',
    type: 'My Requirement',
    title: 'Organic Potatoes',
    status: 'Closed',
    currentBid: '₹2,500 / quintal',
    myBid: 'N/A',
  },
];

export default function BiddingScreen() {
  const router = useRouter();
  const [bids, setBids] = useState(MOCK_BIDS);
  const [activeTab, setActiveTab] = useState('Live');

  const getStatusColor = (status) => {
    if (status === 'Winning') return '#2A9D8F';
    if (status === 'Live') return '#457B9D';
    if (status === 'Outbid') return '#E76F51';
    return '#666'; // Closed
  };
  
  const filteredBids = bids.filter(b => activeTab === 'All' || b.status === activeTab);

  const renderBidItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bidCard}
      // Navigate to the specific bidding room
      onPress={() => router.push({ 
        pathname: '/bidding-room', 
        params: { id: item.id } 
      })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.bidType}>{item.type}</Text>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.bidTitle}>{item.title}</Text>
      
      <View style={styles.priceRow}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Current Bid</Text>
          <Text style={styles.priceValue}>{item.currentBid}</Text>
        </View>
        {item.myBid !== 'N/A' && (
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>My Bid</Text>
            <Text style={[styles.priceValue, { color: getStatusColor(item.status) }]}>
              {item.myBid}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Bidding & Contracts</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['All', 'Live', 'Winning', 'Outbid', 'Closed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <FlatList
        data={filteredBids}
        renderItem={renderBidItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No {activeTab.toLowerCase()} bids found.</Text>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#E76F51',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#E76F51',
  },
  listContainer: {
    padding: 20,
  },
  bidCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bidType: {
    fontSize: 12,
    color: '#FFF',
    backgroundColor: '#606C38',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bidTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#264653',
    marginVertical: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  priceItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});