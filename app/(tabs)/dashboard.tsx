import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, limit, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import React, { ComponentProps, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { financialQuotes } from '../../data/quotes';
import { db, setCategoryBudget, trackBudget } from '../../firebase';
import { useNetBalance } from '../../hooks/useNetBalance';
import { getDashboardStyles } from '../../styles/dashboard.styles';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: Timestamp;
}

interface UserData {
  streak?: number;
  // Add other user properties as needed
}

type Quote = {
  q: string;
  a: string;
};

export default function DashboardScreen() {
  const { colors } = useTheme();
  const dashboardStyles = getDashboardStyles(colors);
  const router = useRouter();
  const { user } = useUser();
  const { netBalance, loading: netBalanceLoading, error: netBalanceError } = useNetBalance();

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
  const [isAddBudgetVisible, setAddBudgetVisible] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch user data for streak
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserData(doc.data() as UserData);
      }
      setLoading(false);
    });

    // Fetch budgets
    const fetchBudgets = async () => {
      const categories = ['Dining', 'Groceries', 'Transport']; // Example categories
      const budgetData = await Promise.all(
        categories.map(category => trackBudget(user.uid, category))
      );
      setBudgets(budgetData.filter(b => b.success));
    };

    fetchBudgets();

    // Fetch recent transactions
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(3)
    );
    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
      setRecentTransactions(transactions);
    });

    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, [user]);

  const handleSetBudget = async () => {
    if (user && newBudget.category && newBudget.amount) {
      await setCategoryBudget(user.uid, newBudget.category, parseFloat(newBudget.amount));
      setBudgetModalVisible(false);
      // Refresh budgets
      const budgetData = await Promise.all(
        [...budgets.map(b => b.category), newBudget.category].map(category => trackBudget(user.uid, category))
      );
      setBudgets(budgetData.filter(b => b.success));
      setNewBudget({ category: '', amount: '' });
    }
  };

  const fetchQuote = () => {
    const randomIndex = Math.floor(Math.random() * financialQuotes.length);
    setQuote(financialQuotes[randomIndex]);
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  if (loading || netBalanceLoading) {
    return (
      <SafeAreaView style={dashboardStyles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

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
            <Text style={[dashboardStyles.balance, netBalance < 0 && dashboardStyles.negativeBalance]}>${netBalance.toLocaleString()}</Text>
            <Text style={dashboardStyles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={dashboardStyles.summaryCardsContainer}>
            <TouchableOpacity style={dashboardStyles.summaryCard} onPress={() => setBudgetModalVisible(true)}>
                <Ionicons name="wallet-outline" size={28} color={colors.link} />
                <Text style={dashboardStyles.summaryCardTitle}>Budget</Text>
                <Text style={dashboardStyles.summaryCardValue}>View Budgets</Text>
            </TouchableOpacity>
            <View style={dashboardStyles.summaryCard}>
                <Ionicons name="flame-outline" size={28} color={colors.link} />
                <Text style={dashboardStyles.summaryCardTitle}>Savings Streak</Text>
                <Text style={dashboardStyles.summaryCardValue}>{userData?.streak || 0} days</Text>
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
              <MaterialCommunityIcons name={"bank-transfer"} size={24} color={colors.primary} />
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
            <Text style={dashboardStyles.transactionName}>Total Savings</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isBudgetModalVisible}
        onRequestClose={() => {
          setBudgetModalVisible(false);
          setAddBudgetVisible(false);
        }}
      >
        <View style={dashboardStyles.modalContainer}>
          <View style={dashboardStyles.modalContent}>
            {isAddBudgetVisible ? (
              <>
                <View style={dashboardStyles.modalHeader}>
                  <Text style={dashboardStyles.modalTitle}>Set New Budget</Text>
                  <TouchableOpacity onPress={() => setAddBudgetVisible(false)}>
                    <Ionicons name="close-outline" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                <View style={dashboardStyles.inputContainer}>
                  <Text style={dashboardStyles.inputLabel}>Category</Text>
                  <View style={dashboardStyles.enhancedInput}>
                    <Ionicons name="pricetag-outline" size={20} color={colors.primary} style={dashboardStyles.inputIcon} />
                    <TextInput
                      style={dashboardStyles.textInput}
                      placeholder="e.g., Dining"
                      placeholderTextColor={colors.secondaryText}
                      value={newBudget.category}
                      onChangeText={(text) => setNewBudget({ ...newBudget, category: text })}
                    />
                  </View>
                </View>
                <View style={dashboardStyles.inputContainer}>
                  <Text style={dashboardStyles.inputLabel}>Monthly Budget</Text>
                  <View style={dashboardStyles.enhancedInput}>
                    <Ionicons name="cash-outline" size={20} color={colors.primary} style={dashboardStyles.inputIcon} />
                    <TextInput
                      style={dashboardStyles.textInput}
                      keyboardType="numeric"
                      placeholder="e.g., 400"
                      placeholderTextColor={colors.secondaryText}
                      value={newBudget.amount}
                      onChangeText={(text) => setNewBudget({ ...newBudget, amount: text })}
                    />
                  </View>
                </View>
                <View style={dashboardStyles.modalActions}>
                  <TouchableOpacity style={[dashboardStyles.modalButton, dashboardStyles.cancelButton]} onPress={() => setAddBudgetVisible(false)}>
                    <Text style={dashboardStyles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[dashboardStyles.modalButton, dashboardStyles.saveButton]} onPress={handleSetBudget}>
                    <Text style={dashboardStyles.saveButtonText}>Set Budget</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={dashboardStyles.modalHeader}>
                  <Text style={dashboardStyles.modalTitle}>Budgets</Text>
                  <TouchableOpacity onPress={() => setBudgetModalVisible(false)}>
                    <Ionicons name="close-outline" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                {budgets.length === 0 ? (
                  <View style={dashboardStyles.emptyStateContainer}>
                    <Ionicons name="wallet-outline" size={60} color={colors.secondaryText} />
                    <Text style={dashboardStyles.emptyStateText}>No budgets set yet</Text>
                    <Text style={dashboardStyles.emptyStateSubText}>Create your first budget to track spending</Text>
                  </View>
                ) : (
                  <ScrollView style={dashboardStyles.budgetList}>
                    {budgets.map((item, index) => (
                      <View key={index} style={dashboardStyles.budgetItem}>
                        <View style={dashboardStyles.budgetHeader}>
                          <View style={dashboardStyles.categoryContainer}>
                            <View style={[dashboardStyles.categoryIcon, { backgroundColor: getBudgetCategoryColor(item.category, colors) }]}>
                              <Ionicons name={getBudgetCategoryIcon(item.category)} size={16} color="#fff" />
                            </View>
                            <Text style={dashboardStyles.budgetCategory}>{item.category}</Text>
                          </View>
                          <Text style={dashboardStyles.budgetValues}>
                            <Text style={item.progress >= 1 ? dashboardStyles.danger : item.progress >= 0.8 ? dashboardStyles.warning : dashboardStyles.success}>
                              ${item.spentAmount.toFixed(2)}
                            </Text> / ${item.budgetAmount.toFixed(2)}
                          </Text>
                        </View>
                        <View style={dashboardStyles.progressBarContainer}>
                          <View 
                            style={[
                              dashboardStyles.progressBar, 
                              { 
                                width: `${Math.min(item.progress * 100, 100)}%`, 
                                backgroundColor: item.progress >= 1 ? colors.danger : item.progress >= 0.8 ? colors.warning : colors.success 
                              }
                            ]} 
                          />
                        </View>
                        <View style={dashboardStyles.budgetFooter}>
                          {item.warning && (
                            <Text style={item.progress >= 1 ? dashboardStyles.dangerText : dashboardStyles.warningText}>
                              <Ionicons 
                                name={item.progress >= 1 ? "alert-circle" : "alert-triangle"} 
                                size={14} 
                                color={item.progress >= 1 ? colors.danger : colors.warning} 
                              /> {item.warning}
                            </Text>
                          )}
                          <Text style={dashboardStyles.remainingText}>
                            {item.progress < 1 ? 
                              `$${(item.budgetAmount - item.spentAmount).toFixed(2)} remaining` : 
                              `$${(item.spentAmount - item.budgetAmount).toFixed(2)} over budget`}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
                
                <TouchableOpacity 
                  style={[dashboardStyles.addBudgetButton]} 
                  onPress={() => setAddBudgetVisible(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.background} />
                  <Text style={dashboardStyles.addBudgetButtonText}>Add Budget</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


// Helper functions for budget categories
const getBudgetCategoryIcon = (category: string): IconName => {
const categoryMap: Record<string, IconName> = {
'Dining': 'restaurant-outline',
'Groceries': 'cart-outline',
'Transport': 'car-outline',
'Entertainment': 'film-outline',
'Shopping': 'bag-outline',
'Utilities': 'flash-outline',
'Housing': 'home-outline',
'Healthcare': 'medical-outline',
'Education': 'school-outline',
'Travel': 'airplane-outline',
};

return categoryMap[category] || 'pricetag-outline';
};

const getBudgetCategoryColor = (category: string, colors: ThemeColors): string => {
const categoryMap: Record<string, string> = {
'Dining': '#FF6B6B',
'Groceries': '#4ECDC4',
'Transport': '#FFD166',
'Entertainment': '#9D65C9',
'Shopping': '#FF9F1C',
'Utilities': '#5D8CAE',
'Housing': '#6B5CA5',
'Healthcare': '#72A276',
'Education': '#5D8CAE',
'Travel': '#FF9A76',
};

return categoryMap[category] || colors.primary;
};
