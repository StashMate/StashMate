import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Keyboard, Modal, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

    return `≈ GH₵${monthlyAmount.toFixed(2)}/month`;
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { colors } = useTheme();
  const styles = getBudgetStyles(colors);
  const { budgets, addBudgetItem, updateBudgetItem, deleteBudgetItem } = useBudgets();
  const [isEditing, setIsEditing] = useState<BudgetItem | null>(null);
  const [displayType, setDisplayType] = useState<'income' | 'expense'>('income');

  const addItem = useCallback((budgetItem: string, category: string, amount: string, transactionType: 'income' | 'expense', deductFromIncome: boolean, budgetPeriod: 'Weekly' | 'Monthly' | 'Yearly') => {
    if (budgetItem.trim() === '' || amount.trim() === '' || category.trim() === '') return;

    const newItem: Omit<BudgetItem, 'id'> = {
      name: budgetItem,
      category,
      amount: parseFloat(amount),
      type: transactionType,
      allocated: 0,
      deductFromIncome,
    };

    if (isEditing) {
      updateBudgetItem(isEditing.id, newItem);
      setIsEditing(null);
    } else {
      addBudgetItem(newItem);
    }

    Keyboard.dismiss();
  }, [isEditing, addBudgetItem, updateBudgetItem]);

  const editItem = (item: BudgetItem) => {
    setIsEditing(item);
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
      <View style={styles.headerContainer}>
        <Text style={styles.title}>My Budget</Text>
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
    </>
  );
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


  const renderFooter = () => (
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
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        style={styles.container}
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
                <TouchableOpacity onPress={() => {
                  setIsEditing(item);
                  setIsModalVisible(true);
                }} style={styles.editButton}>
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
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
        }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
                <Text style={styles.title}>{isEditing ? 'Edit Item' : 'Add Item'}</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                    <Ionicons name="close-circle-outline" size={28} color={colors.text} />
                </TouchableOpacity>
            </View>
            <BudgetForm onAddItem={addItem} isEditing={isEditing} colors={colors} styles={styles} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
