
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

import { useTransactions } from '../context/TransactionsContext';
import { useUser } from '../context/UserContext';
import { useSavings } from '../context/SavingsContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAddTransactionStyles } from '../styles/addTransaction.styles';
import { checkAndAwardBadges } from '../services/gamificationService';


export default function AddTransactionScreen() {
  const { colors } = useTheme();
  const styles = getAddTransactionStyles(colors);
  const router = useRouter();
  const { addTransaction, refreshTransactions } = useTransactions();
  const { user } = useUser();
  const { accounts, selectedAccount } = useSavings();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  useEffect(() => {
    // Reset fields when transaction type changes
    setName('');
    setAmount('');
    setCategory('');
    setPaymentMethod('');
    setSelectedAccountId(null);
  }, [type]);

  const handleAddTransaction = async () => {
    // Allow skipping account selection if payment method is Cash
    if (!name.trim() || !amount.trim() || !user || (!selectedAccountId && paymentMethod !== 'Cash')) {
      Alert.alert('Missing Information', 'Please fill out all required fields and select an account (unless it\'s a cash transaction).');
      return;
    }

    if (type === 'expense' && !category.trim()) {
      Alert.alert('Missing Information', 'Please provide a category for the expense.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number for the amount.');
      return;
    }

    let numericAmount = parsedAmount;
    if (type === 'expense') {
      numericAmount = -parsedAmount;
    }

    let iconName = 'cash'; // Default icon for cash
    if (paymentMethod === 'Mobile Money') {
      iconName = 'cellphone';
    } else if (paymentMethod && paymentMethod !== 'Cash') {
      iconName = 'bank-transfer'; // Assuming other payment methods are bank-related
    } else if (type === 'income') {
      iconName = 'cash-plus';
    } else if (type === 'expense') {
      iconName = 'cash-minus';
    }

    const transactionData = {
      name,
      amount: numericAmount,
      type,
      category: type === 'income' ? 'Income' : category,
      paymentMethod,
      date: serverTimestamp(), // Use server timestamp for consistency
      accountId: paymentMethod === 'Cash' ? null : selectedAccountId, // Set accountId to null for cash transactions
      icon: iconName,
    };

    try {
      if (!user) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }

      // For cash transactions, store them under a generic 'cash' account or directly under user if no account is selected
      let transactionCollectionRef;
      if (paymentMethod === 'Cash') {
        transactionCollectionRef = collection(db, 'users', user.uid, 'transactions');
      } else {
        if (!selectedAccountId) {
          Alert.alert('Error', 'Please select an account for non-cash transactions.');
          return;
        }
        transactionCollectionRef = collection(db, 'users', user.uid, 'accounts', selectedAccountId, 'transactions');
      }

      await addDoc(transactionCollectionRef, transactionData);
      Alert.alert('Success', 'Transaction added successfully!');
      refreshTransactions(); // Refresh transactions after successful addition
      checkAndAwardBadges(user.uid); // Check for new badges
      router.back();
    } catch (error) {
      console.error("Error adding transaction: ", error);
      Alert.alert('Error', 'Failed to add transaction.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form}>
          <Text style={styles.label}>Account</Text>
          <View style={styles.accountSelector}>
            {accounts.map(account => (
              <TouchableOpacity
                key={account.id}
                style={[styles.accountButton, selectedAccountId === account.id && styles.selectedAccountButton]}
                onPress={() => setSelectedAccountId(account.id)}
              >
                <Text style={[styles.accountButtonText, selectedAccountId === account.id && styles.selectedAccountButtonText]}>{account.institution}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{type === 'income' ? 'Source' : 'Transaction Name'}</Text>
          <TextInput
            style={styles.input}
            placeholder={type === 'income' ? 'e.g., Salary, Gift' : 'e.g., Coffee, Groceries'}
            placeholderTextColor={colors.secondaryText}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.secondaryText}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          
          {type === 'expense' && (
            <>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
                placeholder="e.g., Food, Bills"
            placeholderTextColor={colors.secondaryText}
            value={category}
            onChangeText={setCategory}
          />

              <Text style={styles.label}>Payment Method</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Credit Card, Mobile Money, Cash"
                placeholderTextColor={colors.secondaryText}
                value={paymentMethod}
                onChangeText={setPaymentMethod}
              />
            </>
          )}

          <Text style={styles.label}>Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'expense' && styles.activeTypeButton]}
              onPress={() => setType('expense')}
            >
              <Text style={[styles.typeButtonText, type === 'expense' && styles.activeTypeText]}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'income' && styles.activeTypeButton]}
              onPress={() => setType('income')}
            >
              <Text style={[styles.typeButtonText, type === 'income' && styles.activeTypeText]}>Income</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              type === 'income'
                ? styles.saveButtonIncome
                : styles.saveButtonExpense,
            ]}
            onPress={handleAddTransaction}
          >
            <Text style={styles.saveButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}