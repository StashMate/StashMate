import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import React, { ComponentProps, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { db, deleteTransaction } from '../../firebase';
import { getTransactionsStyles } from '../../styles/transactions.styles';
import { useSavings } from '../../context/SavingsContext';

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
}

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const styles = getTransactionsStyles(colors);
  const { user } = useUser();
  const router = useRouter();
  const { accounts, selectedAccount, setSelectedAccount } = useSavings();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const transactionsQuery = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(transactionsQuery, 
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
        (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return filtered;
  }, [filter, searchQuery, transactions]);

  const groupedTransactions = useMemo(() => filteredTransactions.reduce((acc, tx) => {
    if (!tx.date) {
      return acc; // Don't process transactions without a date
    }
    const date = new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[date]) {
        acc[date] = [];
    }
    acc[date].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>), [filteredTransactions]);

  const { totalIncome, totalExpense } = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
        if (t.amount > 0) acc.totalIncome += t.amount;
        else acc.totalExpense += Math.abs(t.amount);
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
            // Implement delete functionality if needed, but for now, we'll just log it.
            console.log("Deleting transaction:", transactionId);
          },
        },
      ]
    );
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
      <View style={[styles.transactionItem, item.amount > 0 ? styles.incomeBorder : styles.expenseBorder]}>
        <View style={styles.transactionIcon}>
          <MaterialCommunityIcons name={"bank-transfer"} size={24} color={colors.primary} />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionName}>{item.name}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={[styles.transactionAmount, item.amount > 0 ? styles.income : styles.expense]}>
            ${Math.abs(item.amount).toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>
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
              <Text style={styles.emptyStateText}>Link a bank account to get started!</Text>
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