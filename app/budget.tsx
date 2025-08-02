
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getBudgetStyles } from '../styles/budget.styles';

interface BudgetItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}

export default function BudgetScreen() {
  const { colors } = useTheme();
  const styles = getBudgetStyles(colors);
  const [budgetItem, setBudgetItem] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [isEditing, setIsEditing] = useState<BudgetItem | null>(null);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [displayType, setDisplayType] = useState<'income' | 'expense'>('income');

  const addItem = () => {
    if (budgetItem.trim() === '' || amount.trim() === '' || category.trim() === '') return;

    const newItem: BudgetItem = {
      id: isEditing ? isEditing.id : Math.random().toString(),
      name: budgetItem,
      category,
      amount: parseFloat(amount),
      date: new Date().toLocaleDateString(),
      type: transactionType,
    };

    if (isEditing) {
      setItems(items.map(item => (item.id === isEditing.id ? newItem : item)));
      setIsEditing(null);
    } else {
      setItems([...items, newItem]);
    }

    setBudgetItem('');
    setCategory('');
    setAmount('');
    Keyboard.dismiss();
  };

  const editItem = (item: BudgetItem) => {
    setIsEditing(item);
    setTransactionType(item.type);
    setBudgetItem(item.name);
    setCategory(item.category);
    setAmount(item.amount.toString());
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const displayedItems = items.filter(item => item.type === displayType);

  const totalIncome = items.filter(item => item.type === 'income').reduce((acc, item) => acc + item.amount, 0);
  const totalExpenses = items.filter(item => item.type === 'expense').reduce((acc, item) => acc + item.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container}>
          <Text style={styles.title}>{isEditing ? 'Edit Item' : 'My Budget'}</Text>
          <View style={styles.inputContainer}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleButton, transactionType === 'income' && styles.activeToggleButton]}
                onPress={() => setTransactionType('income')}
              >
                <Text style={[styles.toggleButtonText, transactionType === 'income' && styles.activeToggleButtonText]}>Income</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleButton, transactionType === 'expense' && styles.activeToggleButton]}
                onPress={() => setTransactionType('expense')}
              >
                <Text style={[styles.toggleButtonText, transactionType === 'expense' && styles.activeToggleButtonText]}>Expense</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Item Name (e.g., Salary, Rent)"
              placeholderTextColor={colors.secondaryText}
              value={budgetItem}
              onChangeText={setBudgetItem}
            />
            <TextInput
              style={styles.input}
              placeholder="Category (e.g., Food, Bills)"
              placeholderTextColor={colors.secondaryText}
              value={category}
              onChangeText={setCategory}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor={colors.secondaryText}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: transactionType === 'income' ? colors.success : colors.danger }]}
              onPress={addItem}
            >
              <Text style={styles.buttonText}>{isEditing ? 'Update' : 'Add'} {transactionType === 'income' ? 'Income' : 'Expense'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, displayType === 'income' && styles.activeToggleButton, { borderTopLeftRadius: 20, borderBottomLeftRadius: 20, borderRightWidth: 0 }]}
              onPress={() => setDisplayType('income')}
            >
              <Text style={[styles.toggleButtonText, displayType === 'income' && styles.activeToggleButtonText]}>Income</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, displayType === 'expense' && styles.activeToggleButton, { borderTopRightRadius: 20, borderBottomRightRadius: 20, borderLeftWidth: 0 }]}
              onPress={() => setDisplayType('expense')}
            >
              <Text style={[styles.toggleButtonText, displayType === 'expense' && styles.activeToggleButtonText]}>Expense</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            style={styles.listContainer}
            data={displayedItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemText}>{item.name}</Text>
                  <Text style={styles.itemSubText}>{item.category} - {item.date}</Text>
                </View>
                <View style={styles.itemAmountContainer}>
                  <Text style={[styles.itemAmount, { color: item.type === 'income' ? colors.success : colors.danger }]}>
                    {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                  </Text>
                  <View style={styles.itemActions}>
                    <TouchableOpacity onPress={() => editItem(item)} style={styles.editButton}>
                      <Ionicons name="pencil-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={24} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Income:</Text>
              <Text style={[styles.summaryAmount, { color: colors.success }]}>${totalIncome.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Expenses:</Text>
              <Text style={[styles.summaryAmount, { color: colors.danger }]}>${totalExpenses.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Balance:</Text>
              <Text style={[styles.summaryAmount, { color: balance >= 0 ? colors.success : colors.danger }]}>${balance.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

