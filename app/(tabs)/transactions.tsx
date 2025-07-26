import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { ComponentProps, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Transaction, useTransactions } from '../../context/TransactionsContext';
import { getTransactionsStyles } from '../../styles/transactions.styles';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const styles = getTransactionsStyles(colors);
  const router = useRouter();
  const { transactions, refreshTransactions, loading, error, deleteTransaction } = useTransactions();

  useFocusEffect(
    useCallback(() => {
      refreshTransactions();
    }, [refreshTransactions])
  );

  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleDelete = (transactionId: string, accountId?: string | null) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(transactionId, accountId);
          },
        },
      ]
    );
  };

  const RenderTransactionItem = ({ item }: { item: Transaction }) => {
    const transactionDate = typeof item.date === 'string' ? new Date(item.date) : (item.date as any)?.toDate();
    const formattedDate = transactionDate ? transactionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    return (
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
            <MaterialCommunityIcons name={item.icon || "bank-transfer"} size={24} color={colors.primary} />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionName}>{item.name}</Text>
            <Text style={styles.transactionCategory}>{item.category} - {formattedDate}</Text>
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <Text style={[styles.transactionAmount, item.amount > 0 ? styles.income : styles.expense]}>
              ${Math.abs(item.amount).toFixed(2)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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