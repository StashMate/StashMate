import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View, ScrollView, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { addTransactionWithAccount } from '../firebase';
import { getAddTransactionStyles } from '../styles/addTransaction.styles';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';

interface Account {
  id: string;
  accountName: string;
  institution: string;
  logoUrl: string;
  balance: number;
}

export default function AddTransactionScreen() {
  const { colors } = useTheme();
  const styles = getAddTransactionStyles(colors);
  const router = useRouter();
  const { user } = useUser();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Fetch accounts
  useEffect(() => {
    if (!user) return;

    const accountsQuery = query(collection(db, 'accounts'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(accountsQuery, (snapshot) => {
      const fetchedAccounts: Account[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
      setAccounts(fetchedAccounts);
      if (fetchedAccounts.length > 0 && !selectedAccount) {
        setSelectedAccount(fetchedAccounts[0]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddTransaction = async () => {
    if (!name.trim() || !amount.trim() || !user) {
      Alert.alert('Missing Information', 'Please fill out all required fields.');
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

    const nextDueDate = isRecurring ? getNextDueDate() : undefined;

    const newTransaction: {
      name: string;
      amount: number;
      type: 'income' | 'expense';
      category: string;
      paymentMethod?: string;
      accountId?: string;
      isRecurring?: boolean;
      recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
      nextDueDate?: Date;
    } = {
      name,
      amount: numericAmount,
      type,
      category: type === 'income' ? 'Income' : category,
      accountId: selectedAccount?.id,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      nextDueDate,
    };

    if (type === 'expense') {
      newTransaction.paymentMethod = paymentMethod;
    }

    const result = await addTransactionWithAccount(user.uid, newTransaction);
    if (result.success) {
      Alert.alert('Success', 'Transaction added successfully!');
      router.back();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const getNextDueDate = (): Date => {
    const now = new Date();
    const nextDue = new Date(now);
    
    switch (recurringFrequency) {
      case 'daily':
        nextDue.setDate(nextDue.getDate() + 1);
        break;
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case 'yearly':
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
    }
    
    return nextDue;
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

        <ScrollView style={styles.form}>
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

          {accounts.length > 0 && (
            <>
              <Text style={styles.label}>Account</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountSelector}>
                {accounts.map(account => (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.accountButton,
                      selectedAccount?.id === account.id && styles.selectedAccountButton
                    ]}
                    onPress={() => setSelectedAccount(account)}
                  >
                    <Text style={[
                      styles.accountButtonText,
                      selectedAccount?.id === account.id && styles.selectedAccountButtonText
                    ]}>{account.institution}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
          
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

          <View style={styles.recurringContainer}>
            <View style={styles.recurringHeader}>
              <Text style={styles.label}>Recurring Transaction</Text>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: colors.iconBackground, true: colors.primary + '50' }}
                thumbColor={isRecurring ? colors.primary : colors.secondaryText}
              />
            </View>
            
            {isRecurring && (
              <>
                <Text style={styles.sublabel}>Frequency</Text>
                <View style={styles.frequencySelector}>
                  {['daily', 'weekly', 'monthly', 'yearly'].map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.frequencyButton,
                        recurringFrequency === freq && styles.activeFrequencyButton
                      ]}
                      onPress={() => setRecurringFrequency(freq as any)}
                    >
                      <Text style={[
                        styles.frequencyButtonText,
                        recurringFrequency === freq && styles.activeFrequencyText
                      ]}>
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
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