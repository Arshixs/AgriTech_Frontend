// File: app/chat-screen.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../src/components/common/ScreenWrapper';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

// Mock messages for the chat
const MOCK_MESSAGES = [
  { id: 'm4', text: 'Do you have Basmati seeds in stock?', sender: 'farmer' },
  { id: 'm3', text: 'Hello, I have a question about your products.', sender: 'farmer' },
  { id: 'm2', text: 'I am available to chat.', sender: 'vendor' },
  { id: 'm1', text: 'Hi there!', sender: 'vendor' },
];

export default function ChatScreen() {
  const router = useRouter();
  const { chatId, name } = useLocalSearchParams(); // Get name from params
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Load initial messages
  useEffect(() => {
    // In a real app, you'd fetch messages for 'chatId'
    setMessages(MOCK_MESSAGES);
  }, [chatId]);

  const handleSend = () => {
    if (newMessage.trim() === '') return;

    const myMessage = {
      id: `m${messages.length + 1}`,
      text: newMessage,
      sender: 'vendor', // 'vendor' is "me"
    };

    // Add my message to the list (at the start for inverted FlatList)
    setMessages([myMessage, ...messages]);
    setNewMessage('');

    // --- Mock a reply from the farmer ---
    setTimeout(() => {
      const farmerReply = {
        id: `m${messages.length + 2}`,
        text: 'That sounds great, thank you!',
        sender: 'farmer',
      };
      setMessages((prevMessages) => [farmerReply, ...prevMessages]);
    }, 1500);
  };

  const renderMessageItem = ({ item }) => {
    const isMyMessage = item.sender === 'vendor';
    return (
      <View 
        style={[
          styles.messageBubble, 
          isMyMessage ? styles.myMessage : styles.theirMessage
        ]}
      >
        <Text style={isMyMessage ? styles.myText : styles.theirText}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name || 'Chat'}</Text>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          style={styles.chatList}
          inverted // This makes messages start from the bottom
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <MaterialCommunityIcons name="send" size={24} color="#FFFFFF" />
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#264653',
  },
  keyboardView: {
    flex: 1,
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  myMessage: {
    backgroundColor: '#2A9D8F',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#E9E9EB',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  myText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  theirText: {
    color: '#264653',
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
    maxHeight: 120,
    fontSize: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#2A9D8F',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});