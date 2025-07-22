
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { addTransaction } from '../firebase';
import { getAddTransactionStyles } from '../styles/addTransaction.styles';
import { useSavings } from '../context/SavingsContext';

export default function AddTransactionScreen() {
  const { colors } = useTheme();
  const styles = getAddTransactionStyles(colors);
  const router = useRouter();
  const { user } = useUser();
  const { accounts } = useSavings();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const handleAddTransaction = async () => {
    if (!name.trim() || !amount.trim() || !user || !selectedAccountId) {
      Alert.alert('Missing Information', 'Please fill out all required fields and select an account.');
      return;
    }

    if (type === 'expense' && !category.trim()) {
      Alert.alert('Missing Information', 'Please provide a category for the expense.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number for the amount.');
      return;
    }

    const newTransaction: {
      name: string;
      amount: number;
      type: 'income' | 'expense';
      date: Date;
      category: string;
      paymentMethod?: string;
      accountId: string;
    } = {
      name,
      amount: numericAmount,
      type,
      date: new Date(),
      category: type === 'income' ? 'Income' : category,
      accountId: selectedAccountId,
    };

    if (type === 'expense') {
      newTransaction.paymentMethod = paymentMethod;
    }

    const result = await addTransaction(user.uid, newTransaction);
    if (result.success) {
      Alert.alert('Success', 'Transaction added successfully!');
      router.back();
    } else {
      Alert.alert('Error', result.error);
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
                placeholder="e.g., Credit Card, Cash"
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