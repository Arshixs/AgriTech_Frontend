
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data for chat list
const MOCK_CHATS = [
  {
    id: 'c1',
    name: 'Ram Singh (Farmer)',
    lastMessage: 'Okay, ₹23,000 for the pump sounds good. When can I pick up?',
    timestamp: '10:30 AM',
    unreadCount: 1,
    avatar: 'https://via.placeholder.com/100.png?text=RS',
  },
  {
    id: 'c2',
    name: 'Priya Sharma (Farmer)',
    lastMessage: 'Do you have Basmati seeds in stock?',
    timestamp: 'Yesterday',
    unreadCount: 0,
    avatar: 'https://via.placeholder.com/100.png?text=PS',
  },
  {
    id: 'c3',
    name: 'Sunrise Agrotech (Business)',
    lastMessage: 'We can supply 500kg of fertilizer. See attached quote.',
    timestamp: 'Oct 20',
    unreadCount: 0,
    avatar: 'https://via.placeholder.com/100.png?text=SA',
  },
  {
    id: 'c4',
    name: 'Anil Kumar (Farmer)',
    lastMessage: 'Is the tractor available for rent next week?',
    timestamp: 'Oct 19',
    unreadCount: 2,
    avatar: 'https://via.placeholder.com/100.png?text=AK',
  },
];

export default function BargainScreen() {
  const router = useRouter();
  const [chats, setChats] = useState(MOCK_CHATS);

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatCard}
      // Navigate to the detailed chat screen, passing chat info
      onPress={() => router.push({ 
        pathname: '/chat-screen', 
        params: { chatId: item.id, name: item.name } 
      })}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages & Bargains</Text>
      </View>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No messages yet.</Text>}
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
  listContainer: {
    paddingHorizontal: 10,
  },
  chatCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  chatMeta: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  unreadBadge: {
    backgroundColor: '#2A9D8F',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});