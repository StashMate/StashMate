import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { updateTransaction } from '../firebase';
import { getAddTransactionStyles } from '../styles/addTransaction.styles';

export default function EditTransactionScreen() {
  const { colors } = useTheme();
  const styles = getAddTransactionStyles(colors);
  const router = useRouter();
  const params = useLocalSearchParams();
  const transaction = JSON.parse(params.transaction as string);

  const [name, setName] = useState(transaction.name);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [category, setCategory] = useState(transaction.category);
  const [type, setType] = useState<'income' | 'expense'>(transaction.type);

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

    const updatedTransaction = {
      name,
      amount: numericAmount,
      category,
      type,
    };

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

        <View style={styles.form}>
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

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Food, Salary"
            placeholderTextColor={colors.secondaryText}
            value={category}
            onChangeText={setCategory}
          />

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
        </View>

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