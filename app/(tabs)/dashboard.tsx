import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, limit, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
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
import { db } from '../../firebase';
import { getChatbotStyles } from '../../styles/chatbot.styles';
import { getDashboardStyles } from '../../styles/dashboard.styles';
import { useNetBalance } from '../../hooks/useNetBalance';

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
  const chatbotStyles = getChatbotStyles(colors);
  const router = useRouter();
  const { user } = useUser();
  const { netBalance, loading: netBalanceLoading, error: netBalanceError } = useNetBalance();

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [budget, setBudget] = useState({ current: 600, target: 1000 });
  const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget);

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

    // Fetch recent transactions from each account
    const fetchRecentTransactions = async () => {
      const accountsQuery = query(collection(db, 'accounts'), where('userId', '==', user.uid));
      const accountsSnapshot = await getDocs(accountsQuery);
      const accountIds = accountsSnapshot.docs.map(doc => doc.id);

      const latestTransactions: Transaction[] = [];
      for (const accountId of accountIds) {
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid),
          where('accountId', '==', accountId),
          orderBy('date', 'desc'),
          limit(1) // Get only the latest transaction for this account
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          latestTransactions.push(snapshot.docs[0].data() as Transaction);
        }
      }

      // Sort all fetched latest transactions by date and take the top 3
      latestTransactions.sort((a, b) => b.date.toMillis() - a.date.toMillis());
      setRecentTransactions(latestTransactions.slice(0, 3));
    };

    fetchRecentTransactions(); // Initial fetch

    // Set up real-time listeners for transactions (optional, but good for dynamic updates)
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
      // Re-fetch recent transactions from each account on any transaction change
      fetchRecentTransactions();
    });


    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, [user]);

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
