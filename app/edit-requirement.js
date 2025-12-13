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
import { FontAwesome } from '@expo/vector-icons';


import ScreenWrapper from '../src/components/common/ScreenWrapper';
import Input from '../src/components/common/Input';
import Button from '../src/components/common/Button';
import { API_BASE_URL } from '../secret';
import { useAuth } from '../src/context/AuthContext';

const CATEGORIES = ['crops', 'grains', 'vegetables', 'fruits', 'flowers', 'spices'];

export default function EditRequirementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Get params passed from the list screen
  const params = useLocalSearchParams();
  const { id } = params;

  const [loading, setLoading] = useState(false);
  
  // Form State - Initialize with passed params
  const [title, setTitle] = useState(params.title || '');
  const [category, setCategory] = useState(params.category || 'crops');
  const [quantity, setQuantity] = useState(params.quantity?.toString() || '');
  const [unit, setUnit] = useState(params.unit || '');
  const [targetPrice, setTargetPrice] = useState(params.targetPrice?.toString() || '');
  const [description, setDescription] = useState(params.description || '');

  const handleUpdate = async () => {
    if (!title || !quantity || !unit) {
      return Alert.alert('Missing Fields', 'Please fill Title, Quantity and Unit.');
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/buyer/requirements/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title,
          category,
          quantity: parseFloat(quantity),
          unit,
          targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
          description
        })
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "Requirement updated successfully!");
        router.back();
      } else {
        Alert.alert("Error", data.message || "Failed to update");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Requirement",
      "Are you sure you want to remove this requirement?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/api/buyer/requirements/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
              });
              
              if (res.ok) {
                Alert.alert("Deleted", "Requirement removed.");
                router.back();
              } else {
                Alert.alert("Error", "Failed to delete");
              }
            } catch (error) {
              Alert.alert("Error", "Network error");
            }
          }
        }
      ]
    );
  };

  if (!id) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <Text style={{color: '#666'}}>Error: No Requirement ID provided.</Text>
          <Button title="Go Back" onPress={() => router.back()} style={{marginTop: 20}} />
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
        <Text style={styles.headerTitle}>Edit Requirement</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Input 
          label="Requirement Title" 
          value={title} 
          onChangeText={setTitle} 
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryPill, category === cat && styles.categoryPillActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                {cat.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={{flex: 1, marginRight: 10}}>
            <Input 
              label="Quantity" 
              value={quantity} 
              onChangeText={setQuantity} 
              keyboardType="numeric"
            />
          </View>
          <View style={{flex: 1}}>
            <Input 
              label="Unit" 
              value={unit} 
              onChangeText={setUnit} 
            />
          </View>
        </View>

        <Input 
          label="Target Price (Optional)" 
          value={targetPrice} 
          onChangeText={setTargetPrice} 
          keyboardType="numeric" 
          placeholder="₹ per unit"
        />

        <Input 
          label="Description / Specifics" 
          value={description} 
          onChangeText={setDescription} 
          multiline
          numberOfLines={4}
        />

        <Button 
          title="Update Requirement" 
          onPress={handleUpdate} 
          loading={loading}
          style={{marginTop: 20, backgroundColor: '#2A9D8F'}}
        />

        <Button 
          title="Delete Requirement" 
          onPress={handleDelete}
          style={styles.deleteButton}
          textStyle={styles.deleteButtonText}
        />
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
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#264653',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    fontWeight: '600',
    marginTop: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryPillActive: {
    backgroundColor: '#E76F51',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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