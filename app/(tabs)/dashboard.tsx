import React, { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ComponentProps, useEffect, useState } from 'react';
import { getDashboardStyles } from '../../styles/dashboard.styles';
import { getChatbotStyles } from '../../styles/chatbot.styles';
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
  const dashboardStyles = getDashboardStyles(colors);
  const chatbotStyles = getChatbotStyles(colors);
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
    <SafeAreaView style={dashboardStyles.container}>
      <ScrollView>
        <View style={dashboardStyles.header}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }}
            style={dashboardStyles.profileImage}
          />
          <Text style={dashboardStyles.headerTitle}>StashMate</Text>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={dashboardStyles.card}>
            <Text style={dashboardStyles.title}>Net Balance</Text>
            <Text style={dashboardStyles.balance}>$11,675.67</Text>
        </View>

        <View style={dashboardStyles.summaryCardsContainer}>
            <TouchableOpacity style={dashboardStyles.summaryCard} onPress={() => { setTempBudget(budget); setBudgetModalVisible(true); }}>
                <Ionicons name="wallet-outline" size={28} color={colors.link} />
                <Text style={dashboardStyles.summaryCardTitle}>Budget</Text>
                <Text style={dashboardStyles.summaryCardValue}>${budget.current} / ${budget.target}</Text>
            </TouchableOpacity>
            <View style={dashboardStyles.summaryCard}>
                <Ionicons name="flame-outline" size={28} color={colors.link} />
                <Text style={dashboardStyles.summaryCardTitle}>Savings Streak</Text>
                <Text style={dashboardStyles.summaryCardValue}>12 weeks</Text>
            </View>
        </View>

        <View style={dashboardStyles.quoteCard}>
          <Ionicons name="bulb-outline" size={24} color={colors.secondaryText} style={dashboardStyles.quoteIcon} />
          {quote ? (
            <>
              <Text style={dashboardStyles.quoteText}>"{quote.q}"</Text>
              <Text style={dashboardStyles.quoteAuthor}>- {quote.a}</Text>
            </>
          ) : (
            <Text style={dashboardStyles.quoteText}>Loading quote...</Text>
          )}
          <TouchableOpacity onPress={fetchQuote} style={dashboardStyles.refreshButton}>
            <Ionicons name="refresh-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={dashboardStyles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.map((item, index) => (
          <TouchableOpacity key={index} style={dashboardStyles.transactionItem} onPress={() => router.push('/(tabs)/transactions')}>
            <View style={dashboardStyles.transactionIcon}>
              <MaterialCommunityIcons name={item.icon as any} size={24} color={colors.primary} />
            </View>
            <View style={dashboardStyles.transactionDetails}>
              <Text style={dashboardStyles.transactionName}>{item.name}</Text>
              <Text style={dashboardStyles.transactionCategory}>{item.category}</Text>
            </View>
            <Text style={[dashboardStyles.transactionAmount, item.type === 'expense' ? dashboardStyles.expense : dashboardStyles.income]}>
              {item.type === 'expense' ? '-' : '+'}${item.amount.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={dashboardStyles.sectionTitle}>Savings Overview</Text>
        <TouchableOpacity style={dashboardStyles.transactionItem} onPress={() => router.push('/(tabs)/savings')}>
          <View style={dashboardStyles.transactionIcon}>
            <MaterialCommunityIcons name="bank-outline" size={24} color={colors.primary} />
          </View>
          <View style={dashboardStyles.transactionDetails}>
            <Text style={dashboardStyles.transactionName}>{selectedAccount.bankName}</Text>
            <Text style={dashboardStyles.transactionCategory}>Total Savings</Text>
          </View>
          <Text style={dashboardStyles.savingsAmount}>${selectedAccount.totalSavings.toFixed(2)}</Text>
        </TouchableOpacity>

        <Text style={dashboardStyles.sectionTitle}>Investments</Text>
        <TouchableOpacity style={dashboardStyles.transactionItem} onPress={() => router.push('/investments')}>
          <View style={dashboardStyles.transactionIcon}>
            <Ionicons name="analytics" size={24} color={colors.primary} />
          </View>
          <View style={dashboardStyles.transactionDetails}>
            <Text style={dashboardStyles.transactionName}>View Investment Performance</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>

      </ScrollView>
      <TouchableOpacity style={chatbotStyles.fab} onPress={() => router.push('/chatbot')}>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isBudgetModalVisible}
        onRequestClose={() => setBudgetModalVisible(false)}
      >
        <View style={dashboardStyles.modalContainer}>
            <View style={dashboardStyles.modalContent}>
                <Text style={dashboardStyles.modalTitle}>Adjust Budget</Text>
                <View style={dashboardStyles.inputContainer}>
                    <Text style={dashboardStyles.inputLabel}>Current Spend</Text>
                    <TextInput
                        style={dashboardStyles.input}
                        keyboardType="numeric"
                        value={String(tempBudget.current)}
                        onChangeText={(text) => setTempBudget({ ...tempBudget, current: Number(text) })}
                    />
                </View>
                <View style={dashboardStyles.inputContainer}>
                    <Text style={dashboardStyles.inputLabel}>Target Budget</Text>
                    <TextInput
                        style={dashboardStyles.input}
                        keyboardType="numeric"
                        value={String(tempBudget.target)}
                        onChangeText={(text) => setTempBudget({ ...tempBudget, target: Number(text) })}
                    />
                </View>
                <View style={dashboardStyles.modalActions}>
                    <TouchableOpacity style={[dashboardStyles.modalButton, dashboardStyles.cancelButton]} onPress={() => setBudgetModalVisible(false)}>
                        <Text style={dashboardStyles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[dashboardStyles.modalButton, dashboardStyles.saveButton]} onPress={handleSaveBudget}>
                        <Text style={dashboardStyles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
