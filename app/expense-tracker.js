import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Ensure these paths match your actual folder structure
import ScreenWrapper from '../src/components/common/ScreenWrapper';
import Button from '../src/components/common/Button';
import Input from '../src/components/common/Input';
import { API_BASE_URL } from '../secret';
import { useAuth } from '../src/context/AuthContext';

export default function ExpenseTrackerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  
  // Date & Time State
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date'); // 'date' or 'time'

  // 1. Fetch Expenses
  const fetchExpenses = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/expenses`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setExpenses(data.expenses || []);
      } else {
        console.log("Failed to load expenses");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Handle Date Picker Change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    // On Android, the picker dismisses itself.
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShowDatePicker(true);
    setDatePickerMode(currentMode);
  };

  // 2. Add Expense
  const handleAddExpense = async () => {
    if (!title || !amount || !category) {
      return Alert.alert('Error', 'Please fill in all fields.');
    }
    
    setSubmitLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/expenses/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title,
          category,
          amount: parseFloat(amount),
          date: date // Send selected date
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Optimistic update
        setExpenses([data.expense, ...expenses]);
        
        // Reset Form
        setTitle('');
        setAmount('');
        setCategory('');
        setDate(new Date()); 
        setModalVisible(false);
      } else {
        Alert.alert("Error", data.message || "Failed to add expense");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // 3. Delete Expense
  const handleDeleteExpense = (id) => {
    Alert.alert(
      "Delete Expense", 
      "Are you sure you want to delete this record?", 
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
              });
              if (res.ok) {
                setExpenses(expenses.filter(e => e._id !== id));
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

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const renderExpenseItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.expenseCard} 
      onLongPress={() => handleDeleteExpense(item._id)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="receipt" size={24} color="#2A9D8F" />
      </View>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        <Text style={styles.expenseCategory}>
          {item.category} • {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.expenseAmount}>
        - ₹{item.amount.toLocaleString('en-IN')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Tracker</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Expenses</Text>
        <Text style={styles.summaryAmount}>
          ₹{totalExpenses.toLocaleString('en-IN')}
        </Text>
      </View>

      <Button 
        title="Add New Expense"
        onPress={() => setModalVisible(true)}
        style={styles.addButton}
        icon={() => <MaterialCommunityIcons name="plus" size={20} color="#FFF" style={{marginRight: 8}} />}
      />

      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchExpenses} />}
        ListHeaderComponent={<Text style={styles.listTitle}>Recent Expenses (Hold to Delete)</Text>}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No expenses recorded yet.</Text>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Expense</Text>
            
            <Input 
              label="Expense Title" 
              value={title} 
              onChangeText={setTitle}
              placeholder="e.g. Fuel, Wages"
            />
            
            {/* Date & Time Selection Row */}
            <Text style={styles.inputLabel}>Date & Time</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => showMode('date')}
              >
                <MaterialCommunityIcons name="calendar" size={20} color="#264653" />
                <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => showMode('time')}
              >
                <MaterialCommunityIcons name="clock-outline" size={20} color="#264653" />
                <Text style={styles.dateText}>
                  {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker Component */}
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={datePickerMode}
                is24Hour={true}
                display="default"
                onChange={onDateChange}
              />
            )}

            <Input 
              label="Category" 
              value={category} 
              onChangeText={setCategory} 
              placeholder="e.g. Logistics"
            />
            <Input 
              label="Amount (₹)" 
              value={amount} 
              onChangeText={setAmount} 
              keyboardType="numeric" 
              placeholder="0.00"
            />
            
            <Button 
              title="Save Expense" 
              onPress={handleAddExpense} 
              loading={submitLoading}
            />
            
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
    flex: 1,
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
    backgroundColor: '#264653', 
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
    backgroundColor: '#2A9D8F',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1}
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
    color: '#E76F51', 
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontStyle: 'italic'
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
  // Date Picker Styles
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600'
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 0.48 // almost half width
  },
  dateText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
    fontWeight: '500'
  }
});