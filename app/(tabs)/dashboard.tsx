import React, { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ComponentProps, useEffect, useState } from 'react';
import { getDashboardStyles } from '../../styles/dashboard.styles';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import { transactions } from '../../data/transactions';
import { useSavings } from '../../context/SavingsContext';
import { financialQuotes } from '../../data/quotes';

type IconName = ComponentProps<typeof Ionicons>['name'];

const recentTransactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

type Quote = {
  q: string;
  a: string;
};

export default function DashboardScreen() {
  const { colors } = useTheme();
  const styles = getDashboardStyles(colors);
  const router = useRouter();
  const { selectedAccount } = useSavings();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [budget, setBudget] = useState({ current: 600, target: 1000 });
  const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget);

  const handleSaveBudget = () => {
    setBudget(tempBudget);
    setBudgetModalVisible(false);
  };

  const fetchQuote = () => {
    const randomIndex = Math.floor(Math.random() * financialQuotes.length);
    setQuote(financialQuotes[randomIndex]);
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }}
            style={styles.profileImage}
          />
          <Text style={styles.headerTitle}>StashMate</Text>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
            <Text style={styles.title}>Net Balance</Text>
            <Text style={styles.balance}>$11,675.67</Text>
        </View>

        <View style={styles.summaryCardsContainer}>
            <TouchableOpacity style={styles.summaryCard} onPress={() => { setTempBudget(budget); setBudgetModalVisible(true); }}>
                <Ionicons name="wallet-outline" size={28} color={colors.link} />
                <Text style={styles.summaryCardTitle}>Budget</Text>
                <Text style={styles.summaryCardValue}>${budget.current} / ${budget.target}</Text>
            </TouchableOpacity>
            <View style={styles.summaryCard}>
                <Ionicons name="flame-outline" size={28} color={colors.link} />
                <Text style={styles.summaryCardTitle}>Savings Streak</Text>
                <Text style={styles.summaryCardValue}>12 weeks</Text>
            </View>
        </View>

        <View style={styles.quoteCard}>
          <Ionicons name="bulb-outline" size={24} color={colors.secondaryText} style={styles.quoteIcon} />
          {quote ? (
            <>
              <Text style={styles.quoteText}>"{quote.q}"</Text>
              <Text style={styles.quoteAuthor}>- {quote.a}</Text>
            </>
          ) : (
            <Text style={styles.quoteText}>Loading quote...</Text>
          )}
          <TouchableOpacity onPress={fetchQuote} style={styles.refreshButton}>
            <Ionicons name="refresh-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.map((item, index) => (
          <TouchableOpacity key={index} style={styles.transactionItem} onPress={() => router.push('/(tabs)/transactions')}>
            <View style={styles.transactionIcon}>
              <MaterialCommunityIcons name={item.icon as any} size={24} color={colors.primary} />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionName}>{item.name}</Text>
              <Text style={styles.transactionCategory}>{item.category}</Text>
            </View>
            <Text style={[styles.transactionAmount, item.type === 'expense' ? styles.expense : styles.income]}>
              {item.type === 'expense' ? '-' : '+'}${item.amount.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Savings Overview</Text>
        <TouchableOpacity style={styles.transactionItem} onPress={() => router.push('/(tabs)/savings')}>
          <View style={styles.transactionIcon}>
            <MaterialCommunityIcons name="bank-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionName}>{selectedAccount.bankName}</Text>
            <Text style={styles.transactionCategory}>Total Savings</Text>
          </View>
          <Text style={styles.savingsAmount}>${selectedAccount.totalSavings.toFixed(2)}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Investments</Text>
        <TouchableOpacity style={styles.transactionItem} onPress={() => router.push('/investments')}>
          <View style={styles.transactionIcon}>
            <Ionicons name="analytics" size={24} color={colors.primary} />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionName}>View Investment Performance</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>

      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isBudgetModalVisible}
        onRequestClose={() => setBudgetModalVisible(false)}
      >
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Adjust Budget</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Current Spend</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={String(tempBudget.current)}
                        onChangeText={(text) => setTempBudget({ ...tempBudget, current: Number(text) })}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Target Budget</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={String(tempBudget.target)}
                        onChangeText={(text) => setTempBudget({ ...tempBudget, target: Number(text) })}
                    />
                </View>
                <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setBudgetModalVisible(false)}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveBudget}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
