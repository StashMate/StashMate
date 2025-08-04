import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo, useCallback } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getBudgetStyles } from '../styles/budget.styles';

interface BudgetItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  allocated: number;
  deductFromIncome: boolean;
}

const BudgetForm = React.memo(({ onAddItem, isEditing, colors, styles }) => {
  const [budgetItem, setBudgetItem] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [deductFromIncome, setDeductFromIncome] = useState(false);
  const [budgetPeriod, setBudgetPeriod] = useState<'Monthly' | 'Weekly' | 'Yearly'>('Monthly');
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);

  const handleAddItem = () => {
    onAddItem(budgetItem, category, amount, transactionType, deductFromIncome, budgetPeriod);
    setBudgetItem('');
    setCategory('');
    setAmount('');
    setDeductFromIncome(false);
  };

  const getApproximation = (period: 'Weekly' | 'Monthly' | 'Yearly') => {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount === 0) return '';

    let monthlyAmount = 0;
    if (period === 'Weekly') monthlyAmount = numericAmount * 4.33;
    else if (period === 'Monthly') monthlyAmount = numericAmount;
    else if (period === 'Yearly') monthlyAmount = numericAmount / 12;

    return `≈ $${monthlyAmount.toFixed(2)}/month`;
  };

  return (
    <View>
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
        <View style={styles.amountContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Amount"
            placeholderTextColor={colors.secondaryText}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
          <TouchableOpacity onPress={() => setShowPeriodSelector(!showPeriodSelector)} style={styles.periodSelectorButton}>
            <Ionicons name="pencil-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {showPeriodSelector && (
          <View style={styles.periodOptionsContainer}>
            {(['Weekly', 'Monthly', 'Yearly'] as const).map(period => (
              <TouchableOpacity key={period} onPress={() => { setBudgetPeriod(period); setShowPeriodSelector(false); }} style={styles.periodOption}>
                <Text style={styles.periodOptionText}>{period}</Text>
                <Text style={styles.periodApproximationText}>{getApproximation(period)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {transactionType === 'expense' && (
          <View style={styles.deductContainer}>
            <Text style={styles.deductLabel}>Deduct from income?</Text>
            <Switch
              value={deductFromIncome}
              onValueChange={setDeductFromIncome}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
        )}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: transactionType === 'income' ? colors.success : colors.danger }]}
          onPress={handleAddItem}
        >
          <Text style={styles.buttonText}>{isEditing ? 'Update' : 'Add'} {transactionType === 'income' ? 'Income' : 'Expense'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function BudgetScreen() {
  const { colors } = useTheme();
  const styles = getBudgetStyles(colors);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [isEditing, setIsEditing] = useState<BudgetItem | null>(null);
  const [displayType, setDisplayType] = useState<'income' | 'expense'>('income');

  const addItem = useCallback((budgetItem: string, category: string, amount: string, transactionType: 'income' | 'expense', deductFromIncome: boolean, budgetPeriod: 'Weekly' | 'Monthly' | 'Yearly') => {
    if (budgetItem.trim() === '' || amount.trim() === '' || category.trim() === '') return;

    const newItem: BudgetItem = {
      id: isEditing ? isEditing.id : Math.random().toString(),
      name: budgetItem,
      category,
      amount: parseFloat(amount),
      date: new Date().toLocaleDateString(),
      type: transactionType,
      allocated: 0,
      deductFromIncome,
    };

    if (isEditing) {
      setItems(items.map(item => (item.id === isEditing.id ? { ...newItem, allocated: item.allocated } : item)));
      setIsEditing(null);
    } else {
      setItems(prevItems => [...prevItems, newItem]);
    }

    Keyboard.dismiss();
  }, [items, isEditing]);

  const editItem = (item: BudgetItem) => {
    setIsEditing(item);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const displayedItems = useMemo(() => items.filter(item => item.type === displayType), [items, displayType]);

  const totalIncome = useMemo(() => items.filter(item => item.type === 'income').reduce((acc, item) => acc + item.amount, 0), [items]);
  const totalExpenses = useMemo(() => items.filter(item => item.type === 'expense' && item.deductFromIncome).reduce((acc, item) => acc + item.amount, 0), [items]);
  const balance = totalIncome - totalExpenses;

  const renderHeader = () => (
    <>
      <BudgetForm onAddItem={addItem} isEditing={isEditing} colors={colors} styles={styles} />
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
    </>
  );

  const renderFooter = () => (
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
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <FlatList
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
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
          onScrollBeginDrag={Keyboard.dismiss}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
