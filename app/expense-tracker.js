
import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../src/components/common/ScreenWrapper';
import Button from '../src/components/common/Button';
import Input from '../src/components/common/Input';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data
const MOCK_EXPENSES = [
  { id: 'e1', title: 'New Seed Stock', category: 'Inventory', amount: 45000 },
  { id: 'e2', title: 'Transport Fuel', category: 'Logistics', amount: 3500 },
  { id: 'e3', title: 'Warehouse Rent', category: 'Overhead', amount: 15000 },
  { id: 'e4', title: 'Packaging Materials', category: 'Inventory', amount: 5200 },
];

export default function ExpenseTrackerScreen() {
  const router = useRouter();
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);
  const [modalVisible, setModalVisible] = useState(false);

  // State for the new expense form
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const handleAddExpense = () => {
    if (!title || !amount || !category) {
      return Alert.alert('Error', 'Please fill in all fields.');
    }
    
    const newExpense = {
      id: `e${Math.random()}`,
      title,
      category,
      amount: parseFloat(amount),
    };

    // --- Mock API Call ---
    // In a real app, you'd send this to your backend
    // and then refetch or just add to state.
    setExpenses([newExpense, ...expenses]);

    // Clear form and close modal
    setTitle('');
    setAmount('');
    setCategory('');
    setModalVisible(false);
  };

  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseCard}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="receipt" size={24} color="#2A9D8F" />
      </View>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        <Text style={styles.expenseCategory}>{item.category}</Text>
      </View>
      <Text style={styles.expenseAmount}>
        - ₹{item.amount.toLocaleString('en-IN')}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Tracker</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Expenses (This Month)</Text>
        <Text style={styles.summaryAmount}>
          ₹{totalExpenses.toLocaleString('en-IN')}
        </Text>
      </View>

      <Button 
        title="Add New Expense"
        onPress={() => setModalVisible(true)}
        style={styles.addButton}
      />

      {/* Expense List */}
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={<Text style={styles.listTitle}>Recent Expenses</Text>}
      />

      {/* Add Expense Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Expense</Text>
            <Input label="Expense Title" value={title} onChangeText={setTitle} />
            <Input label="Category" value={category} onChangeText={setCategory} />
            <Input 
              label="Amount (₹)" 
              value={amount} 
              onChangeText={setAmount} 
              keyboardType="numeric" 
            />
            <Button title="Save Expense" onPress={handleAddExpense} />
            <Button 
              title="Cancel" 
              onPress={() => setModalVisible(false)} 
              style={styles.cancelButton}
              textStyle={styles.cancelButtonText}
            />
          </View>
        </View>
      </Modal>

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
    backgroundColor: '#264653', // Dark blue
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
  addButton: {
    marginHorizontal: 20,
    marginBottom: 0,
    backgroundColor: '#2A9D8F', // Green
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#264653',
    marginTop: 20,
    marginBottom: 10,
  },
  expenseCard: {
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
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
  },
  expenseCategory: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E76F51', // Red-ish
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#264653',
  },
});