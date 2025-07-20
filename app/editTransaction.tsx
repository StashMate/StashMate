import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    Switch,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { updateTransaction } from '../firebase';
import { getAddTransactionStyles } from '../styles/addTransaction.styles';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';

interface Account {
  id: string;
  accountName: string;
  institution: string;
  logoUrl: string;
  balance: number;
}

export default function EditTransactionScreen() {
  const { colors } = useTheme();
  const styles = getAddTransactionStyles(colors);
  const router = useRouter();
  const { user } = useUser();
  const params = useLocalSearchParams();
  const transaction = JSON.parse(params.transaction as string);

  const [name, setName] = useState(transaction.name);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [category, setCategory] = useState(transaction.category);
  const [type, setType] = useState<'income' | 'expense'>(transaction.type);
  const [paymentMethod, setPaymentMethod] = useState(transaction.paymentMethod || '');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isRecurring, setIsRecurring] = useState(transaction.isRecurring || false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
    transaction.recurringFrequency || 'monthly'
  );

  // Fetch accounts
  useEffect(() => {
    if (!user) return;

    const accountsQuery = query(collection(db, 'accounts'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(accountsQuery, (snapshot) => {
      const fetchedAccounts: Account[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
      setAccounts(fetchedAccounts);
      
      // Set selected account based on transaction's accountId
      if (transaction.accountId) {
        const account = fetchedAccounts.find(acc => acc.id === transaction.accountId);
        setSelectedAccount(account || null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpdateTransaction = async () => {
    if (!name.trim() || !amount.trim() || !category.trim()) {
      Alert.alert('Missing Information', 'Please fill out all fields.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid positive number for the amount.'
      );
      return;
    }

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

    const updatedTransaction: any = {
      name,
      amount: numericAmount,
      category,
      type,
      accountId: selectedAccount?.id || null,
      isRecurring: isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : null,
    };

    if (type === 'expense') {
      updatedTransaction.paymentMethod = paymentMethod;
    }

    // Only update nextDueDate if this is a recurring transaction template (not an instance)
    if (isRecurring && !transaction.parentRecurringId) {
      updatedTransaction.nextDueDate = getNextDueDate();
    }

    const result = await updateTransaction(transaction.id, updatedTransaction);
    if (result.success) {
      Alert.alert('Success', 'Transaction updated successfully!');
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
          <Text style={styles.headerTitle}>Edit Transaction</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <Text style={styles.label}>Transaction Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Coffee, Paycheck"
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
                <TouchableOpacity
                  style={[
                    styles.accountButton,
                    !selectedAccount && styles.selectedAccountButton
                  ]}
                  onPress={() => setSelectedAccount(null)}
                >
                  <Text style={[
                    styles.accountButtonText,
                    !selectedAccount && styles.selectedAccountButtonText
                  ]}>No Account</Text>
                </TouchableOpacity>
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

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Food, Salary"
            placeholderTextColor={colors.secondaryText}
            value={category}
            onChangeText={setCategory}
          />

          {type === 'expense' && (
            <>
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
              style={[
                styles.typeButton,
                type === 'expense' && styles.activeTypeButton,
              ]}
              onPress={() => setType('expense')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'expense' && styles.activeTypeText,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'income' && styles.activeTypeButton,
              ]}
              onPress={() => setType('income')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'income' && styles.activeTypeText,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Only show recurring options if this is not an instance of a recurring transaction */}
          {!transaction.parentRecurringId && (
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
          )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleUpdateTransaction}
          >
            <Text style={styles.saveButtonText}>Update Transaction</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 