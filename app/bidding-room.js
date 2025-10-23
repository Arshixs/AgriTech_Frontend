// File: app/bidding-room.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../src/components/common/ScreenWrapper';
import Input from '../src/components/common/Input';
import Button from '../src/components/common/Button';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data
const MOCK_BID_DATA = {
  id: 'req1',
  title: 'Tomatoes (Grade A)',
  quantity: '50 Tons',
  status: 'Live',
  timeLeft: '02:45:10', // 2 hours, 45 mins, 10 secs
  currentHighestBid: 1900,
  bids: [
    { id: 'b1', name: 'Farmer B', amount: 1900 },
    { id: 'b2', name: 'Farmer C', amount: 1850 },
    { id: 'b3', name: 'Farmer A', amount: 1800 },
  ],
};

export default function BiddingRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [item, setItem] = useState(MOCK_BID_DATA);
  const [myBid, setMyBid] = useState('');

  // This would be a websocket in a real app
  useEffect(() => {
    const timer = setInterval(() => {
      // Mock a new bid coming in
      setItem(prevItem => {
        const newAmount = prevItem.currentHighestBid + 50;
        const newBid = {
          id: `b${prevItem.bids.length + 1}`,
          name: `Farmer ${String.fromCharCode(68 + prevItem.bids.length)}`,
          amount: newAmount,
        };
        return {
          ...prevItem,
          currentHighestBid: newAmount,
          bids: [newBid, ...prevItem.bids],
        };
      });
    }, 15000); // New bid every 15 seconds

    return () => clearInterval(timer);
  }, []);

  const handlePlaceBid = () => {
    const bidAmount = parseFloat(myBid);
    if (isNaN(bidAmount) || bidAmount <= item.currentHighestBid) {
      return Alert.alert('Error', `Your bid must be higher than ₹${item.currentHighestBid}.`);
    }

    const newBid = {
      id: `b${item.bids.length + 1}`,
      name: 'You (Fresh Foods Inc.)',
      amount: bidAmount,
    };

    setItem({
      ...item,
      currentHighestBid: bidAmount,
      bids: [newBid, ...item.bids],
    });
    setMyBid('');
  };

  const renderBidItem = ({ item, index }) => (
    <View style={[styles.bidCard, index === 0 && styles.winningBid]}>
      <Text style={styles.bidName}>{item.name}</Text>
      <Text style={styles.bidAmount}>₹{item.amount}/quintal</Text>
    </View>
  );

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Bidding</Text>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <View style={styles.timerContainer}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#E76F51" />
            <Text style={styles.timerText}>{item.timeLeft} left</Text>
          </View>
        </View>

        <View style={styles.highestBidContainer}>
          <Text style={styles.highestBidLabel}>Current Highest Bid</Text>
          <Text style={styles.highestBidAmount}>
            ₹{item.currentHighestBid}/quintal
          </Text>
        </View>

        <FlatList
          data={item.bids}
          renderItem={renderBidItem}
          keyExtractor={(item) => item.id}
          style={styles.bidList}
          ListHeaderComponent={<Text style={styles.listTitle}>Bid History</Text>}
        />
        
        <View style={styles.inputContainer}>
          <Input
            style={styles.textInput}
            value={myBid}
            onChangeText={setMyBid}
            placeholder={`Bid > ₹${item.currentHighestBid}`}
            keyboardType="numeric"
          />
          <Button 
            title="Place Bid" 
            onPress={handlePlaceBid} 
            style={styles.bidButton}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#FFF',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#264653',
  },
  keyboardView: {
    flex: 1,
  },
  itemHeader: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E76F51',
    marginLeft: 6,
  },
  highestBidContainer: {
    backgroundColor: '#E76F51',
    padding: 20,
    alignItems: 'center',
  },
  highestBidLabel: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  highestBidAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bidList: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#264653',
    padding: 20,
    paddingBottom: 10,
  },
  bidCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  winningBid: {
    backgroundColor: '#E8F5F3', // Light green
    borderLeftWidth: 4,
    borderLeftColor: '#2A9D8F',
  },
  bidName: {
    fontSize: 16,
    color: '#333',
  },
  bidAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#264653',
  },
  inputContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  textInput: {
    flex: 1,
    // Using a more standard input here
    marginRight: 10,
  },
  bidButton: {
    backgroundColor: '#E76F51',
    paddingHorizontal: 20,
  },
});