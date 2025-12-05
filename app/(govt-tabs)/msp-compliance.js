// // File: app/(govt-tabs)/msp-compliance.js

// import React, { useState } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
// import ScreenWrapper from '../../src/components/common/ScreenWrapper';
// import { useRouter } from 'expo-router';
// import { MaterialCommunityIcons } from '@expo/vector-icons';

// // Mock data for MSP violations
// const MOCK_VIOLATIONS = [
//   {
//     id: 'v1',
//     crop: 'Wheat',
//     farmerName: 'Anil Kumar',
//     listingPrice: 2100,
//     msp: 2150,
//   },
//   {
//     id: 'v2',
//     crop: 'Basmati Rice',
//     farmerName: 'Ram Singh',
//     listingPrice: 3000,
//     msp: 3200,
//   },
//   {
//     id: 'v3',
//     crop: 'Paddy (Grade A)',
//     farmerName: 'Meena Kumari',
//     listingPrice: 2000,
//     msp: 2040,
//   },
// ];

// export default function MspComplianceScreen() {
//   const router = useRouter();
//   const [violations, setViolations] = useState(MOCK_VIOLATIONS);

//   const renderItem = ({ item }) => (
//     <TouchableOpacity 
//       style={styles.card}
//       // Navigate to a details screen to take action
//       onPress={() => router.push({ 
//         pathname: '/listing-violation', 
//         params: { id: item.id } 
//       })}
//     >
//       <View style={styles.iconContainer}>
//         <MaterialCommunityIcons name="alert-circle" size={32} color="#E76F51" />
//       </View>
//       <View style={styles.cardInfo}>
//         <Text style={styles.cardTitle}>{item.crop}</Text>
//         <Text style={styles.cardSubtitle}>Farmer: {item.farmerName}</Text>
//       </View>
//       <View style={styles.priceInfo}>
//         <Text style={styles.priceLabel}>Listed Price</Text>
//         <Text style={styles.priceValue}>₹{item.listingPrice}</Text>
//         <Text style={styles.mspValue}>(MSP: ₹{item.msp})</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <ScreenWrapper>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>MSP Compliance</Text>
//       </View>
//       <FlatList
//         data={violations}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.listContainer}
//         ListHeaderComponent={
//           <Text style={styles.listHeader}>
//             {violations.length} listings found below MSP
//           </Text>
//         }
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>No MSP violations found.</Text>
//         }
//       />
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     paddingHorizontal: 20,
//     paddingTop: 40,
//     paddingBottom: 16,
//     backgroundColor: '#FFF',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#264653',
//   },
//   listContainer: {
//     padding: 20,
//   },
//   listHeader: {
//     fontSize: 16,
//     color: '#E76F51',
//     marginBottom: 16,
//     fontWeight: '600',
//   },
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 2,
//     borderLeftWidth: 5,
//     borderLeftColor: '#E76F51',
//   },
//   iconContainer: {
//     marginRight: 16,
//   },
//   cardInfo: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#264653',
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     color: '#555',
//     marginTop: 4,
//   },
//   priceInfo: {
//     alignItems: 'flex-end',
//   },
//   priceLabel: {
//     fontSize: 12,
//     color: '#666',
//   },
//   priceValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#E76F51',
//   },
//   mspValue: {
//     fontSize: 12,
//     color: '#666',
//     fontStyle: 'italic',
//   },
//   emptyText: {
//     textAlign: 'center',
//     marginTop: 50,
//     fontSize: 16,
//     color: '#666',
//   },
// });

// File: app/(govt-tabs)/msp-compliance.js

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  RefreshControl 
} from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../../secret';
const API_URL = API_BASE_URL;

export default function MspComplianceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [mspData, setMspData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, kharif, rabi, year-round

  const fetchMSPData = async () => {
    try {
      const endpoint = filter === 'all' 
        ? `${API_URL}/api/msp`
        : `${API_URL}/api/msp?season=${filter}`;
      
      const response = await axios.get(endpoint);
      setMspData(response.data.data);
    } catch (error) {
      console.error('Fetch MSP Error:', error);
      Alert.alert('Error', 'Failed to fetch MSP data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMSPData();
  }, [filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMSPData();
  }, [filter]);

  const handleEdit = (item) => {
    router.push({
      pathname: '/edit-msp',
      params: { 
        id: item._id,
        cropName: item.cropName,
        price: item.price.toString(),
        unit: item.unit,
        season: item.season,
      }
    });
  };

  const getSeasonColor = (season) => {
    switch (season) {
      case 'kharif': return '#2A9D8F';
      case 'rabi': return '#E76F51';
      case 'year-round': return '#457B9D';
      default: return '#666';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleEdit(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <MaterialCommunityIcons 
            name="leaf" 
            size={24} 
            color="#606C38" 
          />
          <Text style={styles.cropName}>{item.cropName}</Text>
        </View>
        <View style={[styles.seasonBadge, { backgroundColor: getSeasonColor(item.season) }]}>
          <Text style={styles.seasonText}>
            {item.season === 'year-round' ? 'All Year' : item.season.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>MSP Price</Text>
          <Text style={styles.priceValue}>₹{item.price}</Text>
          <Text style={styles.unitText}>per {item.unit}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#606C38" />
        </TouchableOpacity>
      </View>

      {item.effectiveFrom && (
        <Text style={styles.effectiveText}>
          Effective from: {new Date(item.effectiveFrom).toLocaleDateString('en-IN')}
        </Text>
      )}
    </TouchableOpacity>
  );

  const FilterButton = ({ label, value }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MSP Compliance</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-msp')}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <FilterButton label="All" value="all" />
        <FilterButton label="Kharif" value="kharif" />
        <FilterButton label="Rabi" value="rabi" />
        <FilterButton label="Year-Round" value="year-round" />
      </View>

      <FlatList
        data={mspData}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Text style={styles.listHeader}>
            {mspData.length} crops listed
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No MSP data available</Text>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#264653',
  },
  addButton: {
    backgroundColor: '#606C38',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  filterButtonActive: {
    backgroundColor: '#606C38',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFF',
  },
  listContainer: {
    padding: 20,
  },
  listHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#606C38',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#264653',
    marginLeft: 8,
    flex: 1,
  },
  seasonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  seasonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#606C38',
  },
  unitText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F2E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  effectiveText: {
    fontSize: 12,
    color: '#888',
    marginTop: 12,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});