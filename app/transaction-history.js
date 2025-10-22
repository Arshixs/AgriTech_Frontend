
import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../src/components/common/ScreenWrapper';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data
const MOCK_TRANSACTIONS = [
  { 
    id: 't1', 
    farmerName: 'Ram Singh', 
    orderId: '1024', 
    amount: 25000, 
    date: '2025-10-22', 
    status: 'Completed' 
  },
  { 
    id: 't2', 
    farmerName: 'Priya Sharma', 
    orderId: '1023', 
    amount: 1500, 
    date: '2025-10-21', 
    status: 'Completed' 
  },
  { 
    id: 't3', 
    farmerName: 'Anil Kumar', 
    orderId: '1022', 
    amount: 8000, 
    date: '2025-10-20', 
    status: 'Pending' 
  },
  { 
    id: 't4', 
    farmerName: 'Sunita Devi', 
    orderId: '1021', 
    amount: 12500, 
    date: '2025-10-19', 
    status: 'Completed' 
  },
  { 
    id: 't5', 
    farmerName: 'Ravi Verma', 
    orderId: '1020', 
    amount: 3000, 
    date: '2025-10-18', 
    status: 'Failed' 
  },
  { 
    id: 't6', 
    farmerName: 'Meena Kumari', 
    orderId: '1019', 
    amount: 6200, 
    date: '2025-10-17', 
    status: 'Completed' 
  },
];

const TABS = ['All', 'Completed', 'Pending', 'Failed'];

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState('All');

  // Calculate total completed revenue
  const totalRevenue = useMemo(() => {
    return transactions
      .filter(t => t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Filter transactions based on the active tab
  const filteredTransactions = useMemo(() => {
    if (activeTab === 'All') {
      return transactions;
    }
    return transactions.filter(t => t.status === activeTab);
  }, [activeTab, transactions]);

  // Helper to get styles for different statuses
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Completed':
        return { icon: 'check-circle', color: '#2A9D8F' };
      case 'Pending':
        return { icon: 'clock-outline', color: '#F4A261' };
      case 'Failed':
        return { icon: 'alert-circle', color: '#E76F51' };
      default:
        return { icon: 'help-circle', color: '#666' };
    }
  };

  const renderTransactionItem = ({ item }) => {
    const status = getStatusStyles(item.status);
    const date = new Date(item.date);

    return (
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: status.color + '20' }]}>
          <MaterialCommunityIcons name={status.icon} size={24} color={status.color} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>Order #{item.orderId}</Text>
          <Text style={styles.cardSubtitle}>{item.farmerName}</Text>
        </View>
        <View style={styles.cardAmountContainer}>
          <Text style={styles.cardAmount}>
            ₹{item.amount.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.cardDate}>
            {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Completed Revenue</Text>
        <Text style={styles.summaryAmount}>
          ₹{totalRevenue.toLocaleString('en-IN')}
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
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

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} transactions.</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#F8F9FA',
  },
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
  summaryCard: {
    backgroundColor: '#457B9D', // Vendor blue
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#457B9D', // Vendor blue
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#457B9D',
  },
  listContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  cardAmountContainer: {
    alignItems: 'flex-end',
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#264653',
  },
  cardDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});