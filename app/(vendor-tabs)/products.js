// File: app/(vendor-tabs)/products.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Button from '../../src/components/common/Button';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data (assuming MOCK_PRODUCTS is defined here as before)
const MOCK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Basmati Seeds (10kg)',
    price: '₹1,500',
    stock: 120,
    category: 'Seeds',
    image: 'https://via.placeholder.com/100.png?text=Seeds',
  },
  {
    id: 'p2',
    name: 'Tractor Pump - Model X',
    price: '₹25,000',
    stock: 15,
    category: 'Machines',
    image: 'https://via.placeholder.com/100.png?text=Pump',
  },
  // ... other mock products
];

export default function ProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => router.push({ pathname: '/add-edit-product', params: { id: item.id } })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>{item.price}</Text>
          <Text style={styles.productStock}>Stock: {item.stock}</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      {/* --- UPDATED HEADER --- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Products</Text>
        <Button 
          title="Add New Product" // More descriptive title
          onPress={() => router.push('/add-edit-product')}
          style={styles.addButton}
          // Assuming your Button component can take an icon prop
          icon={() => <MaterialCommunityIcons name="plus" size={18} color="#FFF" />}
        />
      </View>
      {/* --- END OF UPDATE --- */}

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No products found. Add one!</Text>}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // --- UPDATED HEADER STYLE ---
  header: {
    paddingHorizontal: 20,
    paddingTop: 40, // Space from status bar
    paddingBottom: 20, // More space below button
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    // Removed: flexDirection, justifyContent, alignItems
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 16, // Space between title and button
  },
  addButton: {
    backgroundColor: '#2A9D8F',
    // Assuming your custom button styles itself well
    // We no longer need padding/text styles here
  },
  // --- END OF UPDATE ---

  listContainer: {
    padding: 20,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2A9D8F',
  },
  productStock: {
    fontSize: 13,
    color: '#E76F51',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});