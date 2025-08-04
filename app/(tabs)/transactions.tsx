import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { ComponentProps, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSavings } from '../../context/SavingsContext';
import { useTheme } from '../../context/ThemeContext';
import { Transaction, useTransactions } from '../../context/TransactionsContext';
import { getTransactionsStyles } from '../../styles/transactions.styles';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const styles = getTransactionsStyles(colors);
  const router = useRouter();
  const { transactions, refreshTransactions, loading, error, deleteTransaction } = useTransactions();
  const { accounts, loading: savingsLoading, error: savingsError } = useSavings();

  useFocusEffect(
    useCallback(() => {
      refreshTransactions();
    }, [refreshTransactions])
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('History');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(t => t.accountId); // Only show transactions with an accountId

    if (selectedAccountId) {
      filtered = filtered.filter(t => t.accountId === selectedAccountId);
    }
    if (activeTab === 'Received') {
      filtered = filtered.filter(t => t.type === 'income');
    } else if (activeTab === 'Sent') {
      filtered = filtered.filter(t => t.type === 'expense');
    }

    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return filtered;
  }, [activeTab, searchQuery, transactions]);

  const summary = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const daily = filteredTransactions.filter(t => new Date(t.date) >= today).reduce((sum, t) => sum + t.amount, 0);
    const weekly = filteredTransactions.filter(t => new Date(t.date) >= startOfWeek).reduce((sum, t) => sum + t.amount, 0);
    const monthly = filteredTransactions.filter(t => new Date(t.date) >= startOfMonth).reduce((sum, t) => sum + t.amount, 0);
    const totalTransactions = filteredTransactions.length;

    return { daily, weekly, monthly, totalTransactions };
  }, [filteredTransactions]);

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
    const transactionDate = item.date
      ? (typeof (item.date as any).toDate === 'function' ? (item.date as any).toDate() : new Date(item.date as string))
      : null;
    const formattedDate = transactionDate ? transactionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
    const formattedTime = transactionDate ? transactionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

    const isReceived = item.type === 'income';

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/transactionDetail',
            params: { transaction: JSON.stringify(item) },
          })
        }
      >
        <View style={[styles.transactionItem, isReceived ? styles.incomeBorder : styles.expenseBorder]}>
          <View style={styles.transactionIcon}>
            <MaterialCommunityIcons name={item.icon || "bank-transfer"} size={24} color={colors.primary} />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionName}>{item.name}</Text>
            <Text style={styles.transactionCategory}>
              {isReceived ? `From: ${item.category}` : `To: ${item.category}`}
            </Text>
            <Text style={styles.transactionDate}>{formattedDate} at {formattedTime}</Text>
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <Text style={[styles.transactionAmount, isReceived ? styles.income : styles.expense]}>
              {isReceived ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
            </Text>
            <TouchableOpacity onPress={() => handleDelete(item.id!, item.accountId)} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const RenderAccountItem = ({ item }: { item: any }) => {
    const isSelected = item.id === selectedAccountId;
    const iconName = item.type === 'mobile_money' ? 'cellphone' : 'bank';

    return (
      <TouchableOpacity 
        style={[styles.accountItem, isSelected && styles.selectedAccountItem]}
        onPress={() => setSelectedAccountId(item.id)}
      >
        <View style={styles.accountLogo}>
          <MaterialCommunityIcons name={iconName} size={24} color={colors.primary} />
        </View>
        <View style={styles.accountDetails}>
          <Text style={styles.accountName}>{item.name}</Text>
          <Text style={styles.accountBalance}>${item.balance.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>
      <View style={styles.accountListContainer}>
        <Text style={styles.accountListTitle}>Linked Accounts</Text>
        <FlatList
          data={accounts}
          renderItem={RenderAccountItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
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
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'History' && styles.activeTabButton]}
          onPress={() => setActiveTab('History')}>
          <Text style={[styles.tabButtonText, activeTab === 'History' && styles.activeTabButtonText]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Received' && styles.activeTabButton]}
          onPress={() => setActiveTab('Received')}>
          <Text style={[styles.tabButtonText, activeTab === 'Received' && styles.activeTabButtonText]}>Received</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Sent' && styles.activeTabButton]}
          onPress={() => setActiveTab('Sent')}>
          <Text style={[styles.tabButtonText, activeTab === 'Sent' && styles.activeTabButtonText]}>Sent</Text>
        </TouchableOpacity>
      </View>
      {activeTab !== 'History' && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Today</Text>
            <Text style={styles.summaryValue}>${summary.daily.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>This Week</Text>
            <Text style={styles.summaryValue}>${summary.weekly.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryValue}>${summary.monthly.toFixed(2)}</Text>
          </View>
        </View>
      )}
      {activeTab === 'History' && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryLabel}>Total Transactions</Text>
          <Text style={styles.summaryValue}>{summary.totalTransactions}</Text>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading || savingsLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }}/>
      ) : error || savingsError ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>{error || savingsError}</Text>
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
    </SafeAreaView>
  );
}

