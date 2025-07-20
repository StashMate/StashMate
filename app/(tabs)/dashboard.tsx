import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
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
import { db, calculateNetBalance, formatBalance, getNetBalanceStatus } from '../../firebase';
import { getChatbotStyles } from '../../styles/chatbot.styles';
import { getDashboardStyles } from '../../styles/dashboard.styles';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: Timestamp;
  status?: 'completed' | 'pending' | 'scheduled';
  paymentMethod?: string;
}

interface UserData {
  streak?: number;
  // Add other user properties as needed
}

interface NetBalanceData {
  netBalance: number;
  breakdown: {
    totalAccountBalance: number;
    totalIncome: number;
    totalExpenses: number;
    isNegative: boolean;
    accountBalances: Array<{accountName: string, balance: number, institution: string}>;
    transactionCounts: {
      income: number;
      expenses: number;
      total: number;
    };
  };
}

type Quote = {
  q: string;
  a: string;
};

export default function DashboardScreen() {
  const { colors } = useTheme();
  const dashboardStyles = getDashboardStyles(colors);
  const chatbotStyles = getChatbotStyles(colors);
  const router = useRouter();
  const { user } = useUser();

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [budget, setBudget] = useState({ current: 600, target: 1000 });
  const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget);
  
  // Net balance state
  const [netBalanceData, setNetBalanceData] = useState<NetBalanceData | null>(null);
  const [netBalanceLoading, setNetBalanceLoading] = useState(true);
  const [includePendingTransactions, setIncludePendingTransactions] = useState(false);

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

    // Fetch recent transactions
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
      const fetchedTransactions: Transaction[] = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Transaction)
      );
      setRecentTransactions(fetchedTransactions);
    });

    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, [user]);

  // Calculate net balance whenever user or pending transaction preference changes
  useEffect(() => {
    if (!user) return;

    const calculateBalance = async () => {
      setNetBalanceLoading(true);
      try {
        const result = await calculateNetBalance(user.uid, includePendingTransactions);
        if (result.success && result.breakdown) {
          setNetBalanceData({
            netBalance: result.netBalance || 0,
            breakdown: result.breakdown
          });
        } else {
          console.error('Failed to calculate net balance:', result.error);
          // Set default values if calculation fails
          setNetBalanceData({
            netBalance: 0,
            breakdown: {
              totalAccountBalance: 0,
              totalIncome: 0,
              totalExpenses: 0,
              isNegative: false,
              accountBalances: [],
              transactionCounts: { income: 0, expenses: 0, total: 0 }
            }
          });
        }
      } catch (error) {
        console.error('Error calculating net balance:', error);
        setNetBalanceData({
          netBalance: 0,
          breakdown: {
            totalAccountBalance: 0,
            totalIncome: 0,
            totalExpenses: 0,
            isNegative: false,
            accountBalances: [],
            transactionCounts: { income: 0, expenses: 0, total: 0 }
          }
        });
      } finally {
        setNetBalanceLoading(false);
      }
    };

    calculateBalance();
  }, [user, includePendingTransactions]);

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

  if (loading) {
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={dashboardStyles.title}>Net Balance</Text>
              <TouchableOpacity 
                onPress={() => setIncludePendingTransactions(!includePendingTransactions)}
                style={{ 
                  padding: 6, 
                  borderRadius: 4, 
                  backgroundColor: includePendingTransactions ? colors.primary : colors.surface 
                }}
              >
                <Text style={{ 
                  fontSize: 12, 
                  color: includePendingTransactions ? colors.surface : colors.primary 
                }}>
                  {includePendingTransactions ? 'All' : 'Current'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {netBalanceLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[dashboardStyles.balance, { marginLeft: 8 }]}>Calculating...</Text>
              </View>
            ) : netBalanceData ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons 
                    name={getNetBalanceStatus(netBalanceData.netBalance).icon} 
                    size={24} 
                    color={getNetBalanceStatus(netBalanceData.netBalance).color} 
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[
                    dashboardStyles.balance, 
                    { color: getNetBalanceStatus(netBalanceData.netBalance).color }
                  ]}>
                    {formatBalance(netBalanceData.netBalance)}
                  </Text>
                </View>
                
                {/* Balance breakdown */}
                <View style={{ marginTop: 12, opacity: 0.8 }}>
                  <Text style={{ fontSize: 12, color: colors.secondaryText, marginBottom: 4 }}>
                    Initial Balance: {formatBalance(netBalanceData.breakdown.totalAccountBalance)}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.secondaryText, marginBottom: 4 }}>
                    + Income: {formatBalance(netBalanceData.breakdown.totalIncome)}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.secondaryText, marginBottom: 4 }}>
                    - Expenses: {formatBalance(netBalanceData.breakdown.totalExpenses)}
                  </Text>
                  {netBalanceData.breakdown.isNegative && (
                    <Text style={{ fontSize: 11, color: '#FF6B6B', marginTop: 4, fontStyle: 'italic' }}>
                      ⚠️ {getNetBalanceStatus(netBalanceData.netBalance).message}
                    </Text>
                  )}
                </View>
              </>
            ) : (
              <Text style={dashboardStyles.balance}>$0.00</Text>
            )}
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
