import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Keyboard, Modal, Platform, Switch, Text, TextInput, TouchableOpacity, View, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { FAB } from 'react-native-paper';
import { useBudgets } from '../context/BudgetsContext';
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
  notes: string;
  reminder: boolean;
  reminderDate?: Date;
}

const categories = {
  income: [
    { name: 'Salary', icon: 'cash-outline' },
    { name: 'Freelance', icon: 'briefcase-outline' },
    { name: 'Investment', icon: 'trending-up-outline' },
    { name: 'Gift', icon: 'gift-outline' },
    { name: 'Other', icon: 'add-circle-outline' },
  ],
  expense: [
    { name: 'Food', icon: 'fast-food-outline' },
    { name: 'Rent', icon: 'home-outline' },
    { name: 'Bills', icon: 'receipt-outline' },
    { name: 'Transport', icon: 'bus-outline' },
    { name: 'Entertainment', icon: 'film-outline' },
    { name: 'Other', icon: 'add-circle-outline' },
  ],
};

const BudgetForm = React.memo(({ onAddItem, isEditing, colors, styles, closeModal }) => {
  const [budgetItem, setBudgetItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<{ name: string; icon: string } | null>(null);
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [deductFromIncome, setDeductFromIncome] = useState(false);
  const [budgetPeriod, setBudgetPeriod] = useState<'Monthly' | 'Weekly' | 'Yearly'>('Monthly');
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [notes, setNotes] = useState('');
  const [billReminder, setBillReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddItem = () => {
    if (!selectedCategory) return;
    onAddItem(budgetItem, selectedCategory.name, amount, transactionType, deductFromIncome, budgetPeriod, notes, billReminder, reminderDate);
    setBudgetItem('');
    setSelectedCategory(null);
    setAmount('');
    setDeductFromIncome(false);
    setNotes('');
    setBillReminder(false);
  };

  const getApproximation = (period: 'Weekly' | 'Monthly' | 'Yearly') => {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount === 0) return '';

    let monthlyAmount = 0;
    if (period === 'Weekly') monthlyAmount = numericAmount * 4.33;
    else if (period === 'Monthly') monthlyAmount = numericAmount;
    else if (period === 'Yearly') monthlyAmount = numericAmount / 12;

    return `≈ GH₵${monthlyAmount.toFixed(2)}/month`;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || reminderDate;
    setShowDatePicker(Platform.OS === 'ios');
    setReminderDate(currentDate);
  };

  return (
    <View style={styles.formContainer}>
        <View style={styles.handleBar} />
        <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Item' : 'Add New Item'}</Text>
            <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close-circle" size={28} color={colors.secondaryText} />
            </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
                <View style={styles.toggleContainer}>
                    <TouchableOpacity 
                        style={[styles.toggleButton, transactionType === 'income' && styles.activeToggleButton]}
                        onPress={() => {
                        setTransactionType('income');
                        setSelectedCategory(null);
                        }}
                    >
                        <Text style={[styles.toggleButtonText, transactionType === 'income' && styles.activeToggleButtonText]}>Income</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.toggleButton, transactionType === 'expense' && styles.activeToggleButton]}
                        onPress={() => {
                        setTransactionType('expense');
                        setSelectedCategory(null);
                        }}
                    >
                        <Text style={[styles.toggleButtonText, transactionType === 'expense' && styles.activeToggleButtonText]}>Expense</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryContainer}>
                {categories[transactionType].map(cat => (
                    <TouchableOpacity 
                    key={cat.name} 
                    style={[styles.categoryButton, selectedCategory?.name === cat.name && styles.activeCategory]} 
                    onPress={() => setSelectedCategory(cat)}
                    >
                    <Ionicons name={cat.icon as any} size={30} color={selectedCategory?.name === cat.name ? '#FFFFFF' : colors.primary} style={styles.categoryIcon} />
                    <Text style={[styles.categoryText, selectedCategory?.name === cat.name && styles.activeCategoryText]}>{cat.name}</Text>
                    </TouchableOpacity>
                ))}
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Item Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Salary, Rent, Groceries"
                    placeholderTextColor={colors.secondaryText}
                    value={budgetItem}
                    onChangeText={setBudgetItem}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Amount</Text>
                <View style={styles.amountContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="0.00"
                        placeholderTextColor={colors.secondaryText}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                    />
                    <TouchableOpacity onPress={() => setShowPeriodSelector(!showPeriodSelector)} style={styles.periodSelectorButton}>
                        <Ionicons name="calendar-outline" size={24} color={colors.primary} />
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
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    placeholder="Add any details, like 'for the first week'"
                    placeholderTextColor={colors.secondaryText}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                />
            </View>

            {transactionType === 'expense' && (
                <View style={styles.formGroup}>
                    <View style={styles.deductContainer}>
                        <Text style={styles.deductLabel}>Deduct from income?</Text>
                        <Switch
                        value={deductFromIncome}
                        onValueChange={setDeductFromIncome}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : colors.card}
                        />
                    </View>
                </View>
            )}

            <View style={styles.formGroup}>
                <View style={styles.reminderContainer}>
                    <Text style={styles.reminderLabel}>Set Bill Reminder</Text>
                    <Switch
                        value={billReminder}
                        onValueChange={setBillReminder}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : colors.card}
                    />
                </View>
                {billReminder && (
                <View>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                    <Text style={styles.datePickerButtonText}>{reminderDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={reminderDate}
                        mode="date"
                        is24Hour={true}
                        display="default"
                        onChange={onDateChange}
                    />
                    )}
                </View>
                )}
            </View>

            <TouchableOpacity 
                style={[styles.button, { backgroundColor: transactionType === 'income' ? colors.success : colors.danger }]}
                onPress={handleAddItem}
            >
                <Text style={styles.buttonText}>{isEditing ? 'Update' : 'Add'} {transactionType === 'income' ? 'Income' : 'Expense'}</Text>
            </TouchableOpacity>
        </ScrollView>
    </View>
  );
});

export default function BudgetScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { colors } = useTheme();
  const styles = getBudgetStyles(colors);
  const { budgets, addBudgetItem, updateBudgetItem, deleteBudgetItem } = useBudgets();
  const [isEditing, setIsEditing] = useState<BudgetItem | null>(null);
  const [displayType, setDisplayType] = useState<'income' | 'expense'>('income');

  const addItem = useCallback((budgetItem: string, category: string, amount: string, transactionType: 'income' | 'expense', deductFromIncome: boolean, budgetPeriod: 'Weekly' | 'Monthly' | 'Yearly', notes: string, reminder: boolean, reminderDate?: Date) => {
    if (budgetItem.trim() === '' || amount.trim() === '' || category.trim() === '') return;

    const newItem: Omit<BudgetItem, 'id'> = {
      name: budgetItem,
      category,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      type: transactionType,
      allocated: 0,
      deductFromIncome,
      notes,
      reminder,
      reminderDate,
    };

    if (isEditing) {
      updateBudgetItem(isEditing.id, newItem);
      setIsEditing(null);
    } else {
      addBudgetItem(newItem);
    }

    setIsModalVisible(false);
    Keyboard.dismiss();
  }, [isEditing, addBudgetItem, updateBudgetItem]);

  const editItem = (item: BudgetItem) => {
    setIsEditing(item);
    setIsModalVisible(true);
  };

  const deleteItem = (id: string) => {
    deleteBudgetItem(id);
  };

  const displayedItems = useMemo(() => budgets.filter(item => item.type === displayType), [budgets, displayType]);

  const totalIncome = useMemo(() => budgets.filter(item => item.type === 'income').reduce((acc, item) => acc + item.amount, 0), [budgets]);
  const totalExpenses = useMemo(() => budgets.filter(item => item.type === 'expense' && item.deductFromIncome).reduce((acc, item) => acc + item.amount, 0), [budgets]);
  const balance = totalIncome - totalExpenses;

  const renderHeader = () => (
    <>
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Text style={styles.title}>My Budget</Text>
        <View style={styles.toggleContainer}>
            <TouchableOpacity
            style={[styles.toggleButton, displayType === 'income' && styles.activeToggleButton, { borderTopLeftRadius: 12, borderBottomLeftRadius: 12, borderRightWidth: 0 }]}
            onPress={() => setDisplayType('income')}
            >
            <Text style={[styles.toggleButtonText, displayType === 'income' && styles.activeToggleButtonText]}>Income</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[styles.toggleButton, displayType === 'expense' && styles.activeToggleButton, { borderTopRightRadius: 12, borderBottomRightRadius: 12, borderLeftWidth: 0 }]}
            onPress={() => setDisplayType('expense')}
            >
            <Text style={[styles.toggleButtonText, displayType === 'expense' && styles.activeToggleButtonText]}>Expense</Text>
            </TouchableOpacity>
        </View>
      </View>
    </>
  );

  const renderFooter = () => (
    <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Income:</Text>
                <Text style={[styles.summaryAmount, { color: colors.success }]}>GH₵{totalIncome.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Expenses:</Text>
                <Text style={[styles.summaryAmount, { color: colors.danger }]}>GH₵{totalExpenses.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Balance:</Text>
                <Text style={[styles.summaryAmount, { color: balance >= 0 ? colors.success : colors.danger }]}>GH₵{balance.toFixed(2)}</Text>
            </View>
        </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        data={displayedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemSubText}>{item.category}</Text>
            </View>
            <View style={styles.itemAmountContainer}>
              <Text style={[styles.itemAmount, { color: item.type === 'income' ? colors.success : colors.danger }]}>
                {item.type === 'income' ? '+' : '-'}GH₵{item.amount.toFixed(2)}
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
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          setIsEditing(null);
          setIsModalVisible(true);
        }}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
            <View style={styles.modalBackdrop}>
                <TouchableWithoutFeedback>
                    <BudgetForm 
                        onAddItem={addItem} 
                        isEditing={isEditing} 
                        colors={colors} 
                        styles={styles} 
                        closeModal={() => setIsModalVisible(false)}
                    />
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}