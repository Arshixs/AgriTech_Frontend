
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../src/components/common/ScreenWrapper';
import Input from '../src/components/common/Input';
import Button from '../src/components/common/Button';
import { FontAwesome } from '@expo/vector-icons';

const CATEGORIES = ['Seeds', 'Tools', 'Machines', 'Agri Inputs', 'Rentals'];

export default function AddEditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Check if an ID was passed
  
  const [isLoading, setIsLoading] = useState(false);
  const [screenTitle, setScreenTitle] = useState('Add New Product');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');

  // Mock data loading for "Edit" mode
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setScreenTitle('Edit Product');
      
      // --- Mock API call to fetch product details ---
      setTimeout(() => {
        // This is where you'd fetch data from your API using the 'id'
        const mockProductData = {
          name: 'Tractor Pump - Model X',
          description: 'A very good pump for small farms. 2-year warranty.',
          price: '25000',
          stock: '15',
          category: 'Machines'
        };
        
        setName(mockProductData.name);
        setDescription(mockProductData.description);
        setPrice(mockProductData.price);
        setStock(mockProductData.stock);
        setCategory(mockProductData.category);
        setIsLoading(false);
      }, 1000);
    }
  }, [id]);

  const handleSave = () => {
    if (!name || !price || !category) {
      return Alert.alert('Error', 'Please fill in Name, Price, and Category.');
    }
    
    const productData = { name, description, price, stock, category };
    
    // --- Mock API call ---
    if (id) {
      console.log('UPDATING product:', id, productData);
      // Your API call: axios.put(`/api/products/${id}`, productData)
    } else {
      console.log('CREATING new product:', productData);
      // Your API call: axios.post('/api/products', productData)
    }
    
    Alert.alert('Success', `Product ${id ? 'updated' : 'created'} successfully!`);
    router.back(); // Go back to the products list
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            // --- Mock API call ---
            console.log('DELETING product:', id);
            // Your API call: axios.delete(`/api/products/${id}`)
            Alert.alert('Deleted', 'Product has been deleted.');
            router.back();
          } 
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Input label="Product Name" value={name} onChangeText={setName} />
        <Input 
          label="Description" 
          value={description} 
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
        <Input 
          label="Price (₹)" 
          value={price} 
          onChangeText={setPrice} 
          keyboardType="numeric"
        />
        <Input 
          label="Stock / Quantity" 
          value={stock} 
          onChangeText={setStock} 
          keyboardType="numeric"
        />
        
        <Text style={styles.categoryLabel}>Category</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Button 
          title="Save Product" 
          onPress={handleSave} 
          style={{marginTop: 24}} 
        />
        
        {/* Show Delete button only in "Edit" mode */}
        {id && (
          <Button
            title="Delete Product"
            onPress={handleDelete}
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
          />
        )}
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#2A9D8F',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E76F51',
  },
  deleteButtonText: {
    color: '#E76F51',
  },
});