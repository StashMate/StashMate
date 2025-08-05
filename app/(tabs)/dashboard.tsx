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
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSavings } from '../../context/SavingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionsContext';
import { useUser } from '../../context/UserContext';
import { useNetBalance } from '../../hooks/useNetBalance';
import { deleteVault as deleteVaultFromFirebase } from '../../firebase';
import { fetchUnreadNotificationsCount } from '../../services/notificationService';
import { getDashboardStyles } from '../../styles/dashboard.styles';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function DashboardScreen() {
  const { colors } = useTheme();
  const dashboardStyles = getDashboardStyles(colors);
  const router = useRouter();
  const { user } = useUser();
  const { accounts, vaults, loading: savingsLoading, error: savingsError, savingsStreak, deleteVault: deleteVaultFromContext } = useSavings();
  const { transactions, refreshTransactions, loading: transactionsLoading, error: transactionsError } = useTransactions();
  const { netBalance, loading: netBalanceLoading, error: netBalanceError } = useNetBalance();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isNetBalanceInfoModalVisible, setNetBalanceInfoModalVisible] = useState(false);

  const chatbotWidth = useSharedValue(60);
  const chatbotTextOpacity = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      // Refresh transactions when dashboard is focused
      const unsubscribePromise = refreshTransactions();

      const loadUnreadNotificationsCount = async () => {
        if (user?.uid) {
          const count = await fetchUnreadNotificationsCount(user.uid);
          setUnreadNotificationsCount(count);
        }
      };

      loadUnreadNotificationsCount();

      // Chatbot animation
      chatbotWidth.value = withTiming(200, { duration: 500 });
      chatbotTextOpacity.value = withTiming(1, { duration: 500 });
      setTimeout(() => {
        chatbotWidth.value = withTiming(60, { duration: 500 });
        chatbotTextOpacity.value = withTiming(0, { duration: 500 });
      }, 3000);


      return () => {
        // Handle the promise returned by refreshTransactions
        if (unsubscribePromise && typeof unsubscribePromise.then === 'function') {
          unsubscribePromise.then(unsubscribeFn => {
            if (unsubscribeFn && typeof unsubscribeFn === 'function') {
              unsubscribeFn();
            }
          }).catch(error => {
            console.error('Error handling unsubscribe:', error);
          });
        }
      };
    }, [refreshTransactions, user?.uid])
  );

  const animatedChatbotStyle = useAnimatedStyle(() => {
    return {
      width: chatbotWidth.value,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: chatbotTextOpacity.value,
    };
  });

  const handleDeleteVault = async (vaultId: string) => {
    const result = await deleteVaultFromFirebase(vaultId);
    if (result.success) {
      deleteVaultFromContext(vaultId);
    } else {
      // Handle error
      console.error(result.error);
    }
  };

  const isLoading = savingsLoading || transactionsLoading || netBalanceLoading;
  const hasError = savingsError || transactionsError || netBalanceError;

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 3); // Get top 3 recent transactions
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

  const totalIncomeAllTime = useMemo(() => {
    return transactions.reduce((sum, tx) => {
      if (tx.type === 'income') {
        return sum + tx.amount;
      }
      return sum;
    }, 0);
  }, [transactions]);

  const totalExpenseAllTime = useMemo(() => {
    return transactions.reduce((sum, tx) => {
      if (tx.type === 'expense') {
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
            <TouchableOpacity onPress={() => router.push('/notifications')} style={{ position: 'relative' }}>
              <Ionicons name="notifications-outline" size={24} color={colors.primary} />
              {unreadNotificationsCount > 0 && (
                <View style={{
                  position: 'absolute',
                  right: -5,
                  top: -5,
                  backgroundColor: 'red',
                  borderRadius: 9,
                  width: 18,
                  height: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                    {unreadNotificationsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Net Worth Overview */}
          <View style={dashboardStyles.netWorthCard}>
            <TouchableOpacity style={{
              position: 'absolute',
              right: 15,
              top: 15,
              zIndex: 1,
            }} onPress={() => setNetBalanceInfoModalVisible(true)}>
              <Ionicons name="information-circle-outline" size={24} color={colors.secondaryText} />
            </TouchableOpacity>
            <Text style={dashboardStyles.netWorthLabel}>Total Net Balance</Text>
            <Text style={[dashboardStyles.netWorthAmount, netBalance < 0 ? dashboardStyles.negativeNetWorth : dashboardStyles.positiveNetWorth]}>
             GH₵{netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={dashboardStyles.summaryRow}>
              <View style={dashboardStyles.summaryItem}>
                <Text style={dashboardStyles.summaryLabel}>Total Income</Text>
                <Text style={[dashboardStyles.summaryValue, dashboardStyles.positiveNetWorth]}>₵{totalIncomeAllTime.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
              <View style={dashboardStyles.summaryItem}>
                <Text style={dashboardStyles.summaryLabel}>Total Expenses</Text>
                <Text style={[dashboardStyles.summaryValue, dashboardStyles.negativeNetWorth]}>₵{totalExpenseAllTime.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={dashboardStyles.quickActionsContainer}>
            <TouchableOpacity style={dashboardStyles.quickActionButton} onPress={() => router.push('/addVault')}>
              <Ionicons name="wallet-outline" size={28} color={colors.primary} />
              <Text style={dashboardStyles.quickActionButtonText}>Add Saving</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dashboardStyles.quickActionButton} onPress={() => router.push('/linkBank')}>
              <Ionicons name="link-outline" size={28} color={colors.primary} />
              <Text style={dashboardStyles.quickActionButtonText}>Link Account</Text>
            </TouchableOpacity>
            <View style={dashboardStyles.quickActionButton}>
              <Ionicons name="flame" size={28} color={savingsStreak > 0 ? colors.accent : colors.secondaryText} />
              <Text style={dashboardStyles.quickActionButtonText}>{savingsStreak} Day Streak</Text>
            </View>
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
                  <View style={dashboardStyles.accountCardHeader}>
                    <MaterialCommunityIcons name={account.type === 'credit-card' ? 'credit-card' : 'credit-card'} size={30} color={colors.primary} marginRight={10} />
                    <View>
                      <Text style={dashboardStyles.accountName}>{account.institution}</Text>
                      <Text style={dashboardStyles.accountType}>{account.accountName}</Text>
                    </View>
                  </View>
                  <View style={dashboardStyles.accountCardContent}>
                    <Text style={dashboardStyles.accountBalance}>₵{account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
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

          <Text style={dashboardStyles.sectionTitle}>Recent Transactions</Text>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((item) => {
            const transactionDate = item.date
              ? (typeof (item.date as any).toDate === 'function' ? (item.date as any).toDate() : new Date(item.date as string))
              : null;
            const formattedDate = transactionDate ? transactionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
            const formattedTime = transactionDate ? transactionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';
            const isReceived = item.type === 'income';

            return (
              <TouchableOpacity
                key={item.id}
                style={[dashboardStyles.transactionItem, item.amount > 0 ? dashboardStyles.incomeBorder : dashboardStyles.expenseBorder]}
                onPress={() =>
                  router.push({
                    pathname: '/transactionDetail',
                    params: { transaction: JSON.stringify(item) },
                  })
                }
              >
                <View style={dashboardStyles.transactionIcon}>
                  <MaterialCommunityIcons name={item.icon || "bank-transfer" || "cash" || "credit-card"} size={24} color={colors.primary} />
                </View>
                <View style={dashboardStyles.transactionDetails}>
                  <Text style={dashboardStyles.transactionName}>{item.name}</Text>
                  <Text style={dashboardStyles.transactionCategory}>
                    {isReceived ? `From: ${item.category}` : `To:${item.category}`}
                  </Text>
                  <Text style={dashboardStyles.transactionDate}>{formattedDate} at {formattedTime}</Text>
                </View>
                <Text style={[dashboardStyles.transactionAmount, item.amount > 0 ? dashboardStyles.incomeText : dashboardStyles.expenseText]}>
                  {item.amount > 0 ? '+' : '-'}GH₵{Math.abs(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </TouchableOpacity>
            );
          })
          ) : (
            <View style={dashboardStyles.emptyStateCard}>
              <Text style={dashboardStyles.emptyStateText}>No recent transactions.</Text>
            </View>
          )}

          {/* Savings Goals/Vaults */}
          <Text style={dashboardStyles.sectionTitle}>Savings Goals</Text>
          {vaults.length > 0 ? (
            vaults.slice(0, 3).map((vault) => (
              <TouchableOpacity
                key={vault.id}
                style={dashboardStyles.vaultItem}
                onPress={() => router.push(`/investment/${vault.id}`)} // Assuming a detail page for vaults
              >
                <View style={dashboardStyles.vaultDetails}>
                  <Ionicons name={vault.icon || "cube-outline"} size={24} color={colors.primary} />
                  <View style={{ marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={dashboardStyles.vaultName}>{vault.name}</Text>
                      <TouchableOpacity onPress={() => handleDeleteVault(vault.id)}>
                        <Ionicons name="trash-bin-outline" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                    <Text style={dashboardStyles.vaultProgressText}>GH₵{vault.currentAmount.toLocaleString()} / GH₵{vault.targetAmount.toLocaleString()}</Text>
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

          {/* Recent Transactions */}
          <Text style={dashboardStyles.sectionTitle}>Investments</Text>
          <TouchableOpacity onPress={() => router.push('/investment')} style={dashboardStyles.investmentCard}>
            <View style={dashboardStyles.investmentCardContent}>
              <MaterialCommunityIcons name="chart-line" size={40} color={colors.primary} />
              <View style={dashboardStyles.investmentTextContainer}>
                <Text style={dashboardStyles.investmentTitle}>Crypto & Stocks</Text>
                <Text style={dashboardStyles.investmentSubtitle}>Track your portfolio and discover opportunities</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.secondaryText} />
            </View>
          </TouchableOpacity>


        </View>
      </ScrollView>
      <Animated.View style={[dashboardStyles.chatbotButton, animatedChatbotStyle]}>
        <TouchableOpacity
          onPress={() => router.push('/chatbot')}
          style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}
        >
          <Ionicons name="chatbubbles" size={30} color="#FFFFFF" />
          <Animated.Text style={[dashboardStyles.chatbotText, animatedTextStyle]}>Ask StashMate AI</Animated.Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}