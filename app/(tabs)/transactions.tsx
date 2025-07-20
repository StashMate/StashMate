import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import React, { ComponentProps, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { db, deleteTransaction, createDueRecurringTransactions } from '../../firebase';
import { getTransactionsStyles } from '../../styles/transactions.styles';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  paymentMethod?: string;
  type: 'income' | 'expense';
  date: Timestamp;
  accountId?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  parentRecurringId?: string;
  nextDueDate?: Timestamp;
}

interface Account {
  id: string;
  accountName: string;
  institution: string;
  logoUrl: string;
  balance: number;
}

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const styles = getTransactionsStyles(colors);
  const { user } = useUser();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Create due recurring transactions on component mount
  useEffect(() => {
    if (!user) return;
    
    const createRecurringTransactions = async () => {
      try {
        await createDueRecurringTransactions(user.uid);
      } catch (error) {
        console.error('Error creating recurring transactions:', error);
      }
    };

    createRecurringTransactions();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    // Build query based on selected account
    let q;
    if (selectedAccount) {
      q = query(
        collection(db, 'transactions'), 
        where('userId', '==', user.uid),
        where('accountId', '==', selectedAccount.id),
        orderBy('date', 'desc')
      );
    } else {
      q = query(
        collection(db, 'transactions'), 
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedTransactions: Transaction[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        setTransactions(fetchedTransactions);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore Error:", err);
        setError("Failed to load transactions. This often requires creating a database index. Please check the developer console for a direct link to create it.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, selectedAccount]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (filter !== 'All') {
      filtered = filtered.filter(t => t.type.toLowerCase() === filter.toLowerCase());
    }
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [filter, searchQuery, transactions]);

  const groupedTransactions = useMemo(() => filteredTransactions.reduce((acc, tx) => {
    if (!tx.date) {
      return acc; // Don't process transactions without a date
    }
    const date = tx.date.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[date]) {
        acc[date] = [];
    }
    acc[date].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>), [filteredTransactions]);

  const { totalIncome, totalExpense } = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
        if (t.type === 'income') acc.totalIncome += t.amount;
        else acc.totalExpense += t.amount;
        return acc;
    }, { totalIncome: 0, totalExpense: 0 });
  }, [filteredTransactions]);

  const handleDelete = (transactionId: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(transactionId);
          },
        },
      ]
    );
  };

  const getRecurringIcon = (frequency?: string) => {
    switch (frequency) {
      case 'daily': return 'calendar-today';
      case 'weekly': return 'calendar-week';
      case 'monthly': return 'calendar-month';
      case 'yearly': return 'calendar-year';
      default: return 'repeat';
    }
  };

  const RenderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/editTransaction',
          params: { transaction: JSON.stringify(item) },
        })
      }
    >
      <View style={[styles.transactionItem, item.type === 'income' ? styles.incomeBorder : styles.expenseBorder]}>
        <View style={styles.transactionIcon}>
          <MaterialCommunityIcons name={"bank-transfer"} size={24} color={colors.primary} />
        </View>
        <View style={styles.transactionDetails}>
          <View style={styles.transactionNameRow}>
            <Text style={styles.transactionName}>{item.name}</Text>
            {item.isRecurring && (
              <View style={styles.recurringBadge}>
                <MaterialCommunityIcons 
                  name={getRecurringIcon(item.recurringFrequency)} 
                  size={14} 
                  color={colors.primary} 
                />
                <Text style={styles.recurringText}>
                  {item.recurringFrequency?.charAt(0).toUpperCase() + item.recurringFrequency?.slice(1)}
                </Text>
              </View>
            )}
            {item.parentRecurringId && (
              <View style={styles.recurringInstanceBadge}>
                <MaterialCommunityIcons name="autorenew" size={12} color={colors.secondaryText} />
              </View>
            )}
          </View>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          {item.type === 'expense' && item.paymentMethod && (
            <Text style={styles.transactionPaymentMethod}>Paid with: {item.paymentMethod}</Text>
          )}
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={[styles.transactionAmount, item.type === 'income' ? styles.income : styles.expense]}>
            ${item.amount.toFixed(2)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <TouchableOpacity
              style={{ marginRight: 10 }}
              onPress={() =>
                router.push({
                  pathname: '/editTransaction',
                  params: { transaction: JSON.stringify(item) },
                })
              }
            >
              <Ionicons name="pencil" size={18} color={colors.secondaryText} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-bin" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const AccountSelector = () => (
    <View style={styles.accountSelectorContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountScrollView}>
        <TouchableOpacity
          style={[
            styles.accountButton,
            !selectedAccount && styles.selectedAccountButton
          ]}
          onPress={() => setSelectedAccount(null)}
        >
          <MaterialCommunityIcons name="view-dashboard" size={20} color={colors.primary} />
          <Text style={[
            styles.accountButtonText,
            !selectedAccount && styles.selectedAccountButtonText
          ]}>All Accounts</Text>
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
            <MaterialCommunityIcons name="bank" size={20} color={colors.primary} />
            <Text style={[
              styles.accountButtonText,
              selectedAccount?.id === account.id && styles.selectedAccountButtonText
            ]}>{account.institution}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const ListHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>
      
      {accounts.length > 0 && <AccountSelector />}
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} style={styles.searchIcon} />
        <TextInput 
            placeholder="Search transactions" 
            style={styles.searchInput}
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryAmount, styles.incomeText]}>${totalIncome.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, styles.expenseText]}>${totalExpense.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Net Flow</Text>
            <Text style={[styles.summaryAmount, (totalIncome - totalExpense) >= 0 ? styles.incomeText : styles.expenseText]}>
              ${(totalIncome - totalExpense).toFixed(2)}
            </Text>
        </View>
      </View>
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={[styles.filterButton, filter === 'All' && styles.activeFilterButton]} onPress={() => setFilter('All')}>
          <Text style={[styles.filterText, filter === 'All' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, filter === 'Income' && styles.activeFilterButton]} onPress={() => setFilter('Income')}>
          <Text style={[styles.filterText, filter === 'Income' && styles.activeFilterText]}>Income</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, filter === 'Expense' && styles.activeFilterButton]} onPress={() => setFilter('Expense')}>
          <Text style={[styles.filterText, filter === 'Expense' && styles.activeFilterText]}>Expenses</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }}/>
      ) : error ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={Object.keys(groupedTransactions)}
          keyExtractor={(date) => date}
          ListHeaderComponent={ListHeader}
          stickyHeaderIndices={[0]}
          renderItem={({ item: date }) => (
            <View>
              <Text style={styles.dateHeader}>{date}</Text>
              {groupedTransactions[date].map((tx) => (
                <RenderTransactionItem key={tx.id} item={tx} />
              ))}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No transactions found.</Text>
              <Text style={styles.emptyStateText}>Tap the '+' button to add one!</Text>
            </View>
          }
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/addTransaction')}>
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
