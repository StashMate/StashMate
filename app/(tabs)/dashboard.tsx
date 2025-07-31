import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { ComponentProps, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSavings } from '../../context/SavingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionsContext';
import { useUser } from '../../context/UserContext';
import { useNetBalance } from '../../hooks/useNetBalance';
import { fetchCrypto, fetchStocks } from '../../services/fmpService';
import { getDashboardStyles } from '../../styles/dashboard.styles';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function DashboardScreen() {
  const { colors } = useTheme();
  const dashboardStyles = getDashboardStyles(colors);
  const router = useRouter();
  const { user } = useUser();
  const { accounts, vaults, loading: savingsLoading, error: savingsError } = useSavings();
  const { transactions, refreshTransactions, loading: transactionsLoading, error: transactionsError } = useTransactions();
  const { netBalance, loading: netBalanceLoading, error: netBalanceError } = useNetBalance();

  const [stocks, setStocks] = useState<any[]>([]);
  const [crypto, setCrypto] = useState<any[]>([]);
  const [investmentLoading, setInvestmentLoading] = useState(true);
  const [investmentError, setInvestmentError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      // Refresh transactions when dashboard is focused
      refreshTransactions();

      const loadInvestmentData = async () => {
        setInvestmentLoading(true);
        setInvestmentError(null);
        try {
          const fetchedStocks = await fetchStocks();
          const fetchedCrypto = await fetchCrypto();
          setStocks(fetchedStocks);
          setCrypto(fetchedCrypto);
        } catch (err: any) {
          setInvestmentError(err.message || 'Failed to fetch investment data.');
        } finally {
          setInvestmentLoading(false);
        }
      };

      loadInvestmentData();
    }, [refreshTransactions])
  );

  const isLoading = savingsLoading || transactionsLoading || netBalanceLoading || investmentLoading;
  const hasError = savingsError || transactionsError || netBalanceError || investmentError;

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5); // Get top 5 recent transactions
  }, [transactions]);

  const totalIncomeThisMonth = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactions.reduce((sum, tx) => {
      const txDate = new Date(tx.date as string);
      if (tx.type === 'income' && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        return sum + tx.amount;
      }
      return sum;
    }, 0);
  }, [transactions]);

  const totalExpenseThisMonth = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactions.reduce((sum, tx) => {
      const txDate = new Date(tx.date as string);
      if (tx.type === 'expense' && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        return sum + Math.abs(tx.amount); // Use Math.abs because expenses are stored as negative
      }
      return sum;
    }, 0);
  }, [transactions]);

  if (isLoading) {
    return (
      <SafeAreaView style={dashboardStyles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={dashboardStyles.container}>
        <View style={dashboardStyles.errorContainer}>
          <Text style={dashboardStyles.errorText}>Error loading dashboard data.</Text>
          <Text style={dashboardStyles.errorText}>{hasError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dashboardStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
        {/* Header */}
        <View style={dashboardStyles.header}>
          <Image
            source={{ uri: user?.photoURL || 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }} // Use user's photo or a placeholder
            style={dashboardStyles.profileImage}
          />
          <Text style={dashboardStyles.greeting}>Hello, {user?.displayName || 'User'}!</Text>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Net Worth Overview */}
        <View style={dashboardStyles.netWorthCard}>
          <Text style={dashboardStyles.netWorthLabel}>Total Net Balance</Text>
          <Text style={[dashboardStyles.netWorthAmount, netBalance < 0 ? dashboardStyles.negativeNetWorth : dashboardStyles.positiveNetWorth]}>
            ${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={dashboardStyles.summaryRow}>
            <View style={dashboardStyles.summaryItem}>
              <Text style={dashboardStyles.summaryLabel}>Income this month</Text>
              <Text style={[dashboardStyles.summaryValue, dashboardStyles.positiveNetWorth]}>${totalIncomeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
            <View style={dashboardStyles.summaryItem}>
              <Text style={dashboardStyles.summaryLabel}>Expenses this month</Text>
              <Text style={[dashboardStyles.summaryValue, dashboardStyles.negativeNetWorth]}>${totalExpenseThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={dashboardStyles.quickActionsContainer}>
          <TouchableOpacity style={dashboardStyles.quickActionButton} onPress={() => router.push('/addTransaction')}>
            <Ionicons name="add-circle-outline" size={28} color={colors.primary} />
            <Text style={dashboardStyles.quickActionButtonText}>Add Transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity style={dashboardStyles.quickActionButton} onPress={() => router.push('/addVault')}>
            <Ionicons name="wallet-outline" size={28} color={colors.primary} />
            <Text style={dashboardStyles.quickActionButtonText}>Add Vault</Text>
          </TouchableOpacity>
          <TouchableOpacity style={dashboardStyles.quickActionButton} onPress={() => router.push('/linkBank')}>
            <Ionicons name="link-outline" size={28} color={colors.primary} />
            <Text style={dashboardStyles.quickActionButtonText}>Link Account</Text>
          </TouchableOpacity>
        </View>

        {/* Accounts Overview */}
        <Text style={dashboardStyles.sectionTitle}>Your Accounts</Text>
        {accounts.length > 0 ? (
          <FlatList
            data={accounts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item: account }) => (
              <View style={dashboardStyles.accountCard}>
                <Image source={{ uri: account.logoUrl }} style={dashboardStyles.accountLogo} />
                <Text style={dashboardStyles.accountName}>{account.institution}</Text>
                <Text style={dashboardStyles.accountBalance}>${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                <Text style={dashboardStyles.accountType}>{account.accountName}</Text>
              </View>
            )}
          />
        ) : (
          <View style={dashboardStyles.emptyStateCard}>
            <Text style={dashboardStyles.emptyStateText}>No accounts linked yet.</Text>
            <TouchableOpacity onPress={() => router.push('/linkBank')}>
              <Text style={dashboardStyles.linkAccountText}>Link your first account!</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Transactions */}
        <Text style={dashboardStyles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.length > 0 ? (
          recentTransactions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[dashboardStyles.transactionItem, item.amount > 0 ? dashboardStyles.incomeBorder : dashboardStyles.expenseBorder]}
              onPress={() => router.push('/transactions')}
            >
              <View style={dashboardStyles.transactionIcon}>
                <MaterialCommunityIcons name={item.icon || "bank-transfer"} size={24} color={colors.primary} />
              </View>
              <View style={dashboardStyles.transactionDetails}>
                <Text style={dashboardStyles.transactionName}>{item.name}</Text>
                <Text style={dashboardStyles.transactionCategory}>{item.category}</Text>
              </View>
              <Text style={[dashboardStyles.transactionAmount, item.amount > 0 ? dashboardStyles.incomeText : dashboardStyles.expenseText]}>
                {item.amount > 0 ? '+' : '-'}${Math.abs(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={dashboardStyles.emptyStateCard}>
            <Text style={dashboardStyles.emptyStateText}>No recent transactions.</Text>
            <TouchableOpacity onPress={() => router.push('/addTransaction')}>
              <Text style={dashboardStyles.linkAccountText}>Add your first transaction!</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Savings Goals/Vaults */}
        <Text style={dashboardStyles.sectionTitle}>Savings Goals</Text>
        {vaults.length > 0 ? (
          vaults.map((vault) => (
            <TouchableOpacity
              key={vault.id}
              style={dashboardStyles.vaultItem}
              onPress={() => router.push(`/investment/${vault.id}`)} // Assuming a detail page for vaults
            >
              <View style={dashboardStyles.vaultDetails}>
                <Ionicons name={vault.icon || "cube-outline"} size={24} color={colors.primary} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={dashboardStyles.vaultName}>{vault.name}</Text>
                  <Text style={dashboardStyles.vaultProgressText}>${vault.currentAmount.toLocaleString()} / ${vault.targetAmount.toLocaleString()}</Text>
                </View>
              </View>
              <View style={dashboardStyles.progressBarContainer}>
                <View
                  style={[
                    dashboardStyles.progressBar,
                    { width: `${(vault.currentAmount / vault.targetAmount) * 100}%` },
                  ]}
                />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={dashboardStyles.emptyStateCard}>
            <Text style={dashboardStyles.emptyStateText}>No savings goals set.</Text>
            <TouchableOpacity onPress={() => router.push('/addVault')}>
              <Text style={dashboardStyles.linkAccountText}>Create your first savings goal!</Text>
            </TouchableOpacity>
          </View>
        )}

            {/* Investment Overview */}
        <Text style={dashboardStyles.sectionTitle}>Investments</Text>
        {investmentLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : investmentError ? (
          <View style={dashboardStyles.emptyStateCard}>
            <Text style={dashboardStyles.errorText}>{investmentError}</Text>
          </View>
        ) : (stocks.length > 0 || crypto.length > 0) ? (
          <TouchableOpacity
            style={dashboardStyles.investmentSummaryCard}
            onPress={() => router.push('/investments')}
          >
            <Text style={dashboardStyles.investmentSummaryTitle}>Total Investments</Text>
            <Text style={dashboardStyles.investmentSummaryValue}>
              ${(stocks.reduce((sum, stock) => sum + stock.price, 0) + crypto.reduce((sum, coin) => sum + coin.price, 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={dashboardStyles.investmentSummaryAction}>View Details &gt;</Text>
          </TouchableOpacity>
        ) : (
          <View style={dashboardStyles.emptyStateCard}>
            <Text style={dashboardStyles.emptyStateText}>No investment data available.</Text>
          </View>
        )}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={dashboardStyles.chatbotButton}
        onPress={() => router.push('/chatbot')}
      >
        <Ionicons name="chatbubbles" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}