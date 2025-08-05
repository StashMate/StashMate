import { eachDayOfInterval, eachMonthOfInterval, endOfMonth, endOfWeek, endOfYear, format, startOfMonth, startOfWeek, startOfYear, subMonths } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator, Dimensions, SafeAreaView, ScrollView, Text, TouchableOpacity, View
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import AccountsReport from '../../components/reports/AccountsReport';
import BudgetReport from '../../components/reports/BudgetReport';
import SavingsReport from '../../components/reports/SavingsReport';
import { useBudgets } from '../../context/BudgetsContext';
import { useSavings } from '../../context/SavingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionsContext';
import { useUser } from '../../context/UserContext';
import { getReportsStyles } from '../../styles/reports.styles';


interface BudgetItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  allocated: number;
  deductFromIncome: boolean;
}

interface Transaction {
    id?: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: any; // Firebase Timestamp or string
    accountId?: string;
    [key: string]: any;
}

type TimeRange = 'Weekly' | 'Monthly' | 'Yearly';

export default function ReportsScreen() {
    const { colors } = useTheme();
    const styles = getReportsStyles(colors);
    const { user } = useUser();
    const { accounts, selectedAccount, setSelectedAccount, vaults } = useSavings();
    const { transactions, refreshTransactions, loading: transactionsLoading, error: transactionsError } = useTransactions();
    const { budgets: budgetItems, loading: budgetsLoading, error: budgetsError } = useBudgets();

    const totalSaved = useMemo(() => {
      return vaults.reduce((sum, vault) => sum + vault.currentAmount, 0);
    }, [vaults]);

    const totalTarget = useMemo(() => {
      return vaults.reduce((sum, vault) => sum + vault.targetAmount, 0);
    }, [vaults]);

    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    const [timeRange, setTimeRange] = useState<TimeRange>('Monthly');
    const [activeTab, setActiveTab] = useState('Transactions');

 

    useFocusEffect(
        useCallback(() => {
            refreshTransactions();
        }, [refreshTransactions])
    );

    const chartConfig = {
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, ${opacity})`,
        labelColor: (opacity = 1) => colors.text,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: colors.primary
        },
        propsForLabels: {
            fontSize: 10,
            fontWeight: 'bold',
        },
        propsForBackgroundLines: {
            strokeDasharray: "0", // Solid lines
            stroke: colors.border,
        },
    };

    const screenWidth = Dimensions.get('window').width;

    const filteredTransactionsByAccount = useMemo(() => {
        if (!selectedAccount) {
            return transactions;
        }
        return transactions.filter(tx => tx.accountId === selectedAccount.id);
    }, [transactions, selectedAccount]);

    const processTransactionTrendData = useCallback(() => {
        const now = new Date();
        let interval;
        let dateFormat;

        switch (timeRange) {
            case 'Weekly':
                interval = { start: startOfWeek(now), end: endOfWeek(now) };
                dateFormat = 'EEE';
                break;
            case 'Yearly':
                interval = { start: startOfYear(now), end: endOfYear(now) };
                dateFormat = 'MMM';
                break;
            case 'Monthly':
            default:
                interval = { start: startOfMonth(now), end: endOfMonth(now) };
                dateFormat = 'd';
                break;
        }

        const datePoints =
            timeRange === 'Weekly' ? eachDayOfInterval(interval) :
            timeRange === 'Yearly' ? eachMonthOfInterval(interval) :
            eachDayOfInterval(interval);

        const labels = datePoints.map(date => format(date, dateFormat));
        const incomeDataset = new Array(labels.length).fill(0);
        const expenseDataset = new Array(labels.length).fill(0);

        filteredTransactionsByAccount.forEach((t: Transaction) => {
            if (t.date) {
                const transactionDate = t.date.toDate ? t.date.toDate() : new Date(t.date);
                let index = -1;

                if (timeRange === 'Weekly' || timeRange === 'Monthly') {
                    index = datePoints.findIndex(d => format(d, 'yyyy-MM-dd') === format(transactionDate, 'yyyy-MM-dd'));
                } else { // Yearly
                    index = datePoints.findIndex(d => format(d, 'yyyy-MM') === format(transactionDate, 'yyyy-MM'));
                }

                if (index !== -1) {
                    if (t.type === 'income') {
                        incomeDataset[index] += t.amount;
                    } else {
                        expenseDataset[index] += Math.abs(t.amount); // Use Math.abs for expenses
                    }
                }
            }
        });

        return {
            labels,
            datasets: [
                { data: incomeDataset, color: (opacity = 1) => colors.success, strokeWidth: 2 },
                { data: expenseDataset, color: (opacity = 1) => colors.danger, strokeWidth: 2 }
            ],
            legend: ["Income", "Expenses"]
        };
    }, [filteredTransactionsByAccount, timeRange, colors]);

    const processExpenseCategoryData = useCallback(() => {
        const expenseData: { [key: string]: number } = {};
        filteredTransactionsByAccount.filter(t => t.type === 'expense').forEach(t => {
            expenseData[t.category] = (expenseData[t.category] || 0) + Math.abs(t.amount); // Use Math.abs
        });

        const data = Object.keys(expenseData).map((category, index) => {
            const colorPalette = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8A2BE2', '#7FFF00', '#DC143C', '#00FFFF'];
            return {
                name: category,
                population: expenseData[category],
                color: colorPalette[index % colorPalette.length],
                legendFontColor: colors.text,
                legendFontSize: 12,
            };
        });
        return data;
    }, [filteredTransactionsByAccount, colors]);

    const { totalIncome, totalExpense, netSavings, savingsRate, monthlySpendingComparison } = useMemo(() => {
        const now = new Date();
        const currentMonthStart = startOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        const currentMonthTransactions = filteredTransactionsByAccount.filter(t => {
            const transactionDate = t.date.toDate ? t.date.toDate() : new Date(t.date);
            return transactionDate >= currentMonthStart;
        });
        const lastMonthTransactions = filteredTransactionsByAccount.filter(t => {
            const transactionDate = t.date.toDate ? t.date.toDate() : new Date(t.date);
            return transactionDate >= lastMonthStart && transactionDate <= lastMonthEnd;
        });

        const currentMonthIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const currentMonthExpense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const lastMonthExpense = lastMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const netSavings = currentMonthIncome - currentMonthExpense;
        const savingsRate = currentMonthIncome > 0 ? (netSavings / currentMonthIncome) * 100 : 0;

        return {
            totalIncome: currentMonthIncome,
            totalExpense: currentMonthExpense,
            netSavings,
            savingsRate,
            monthlySpendingComparison: { currentMonth: currentMonthExpense, lastMonth: lastMonthExpense }
        };
    }, [filteredTransactionsByAccount]);

    if (transactionsLoading) {
        return <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />;
    }

    if (transactionsError) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error loading transactions: {transactionsError}</Text>
            </View>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'Transactions':
                return (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.filterContainer}>
                            {(['Weekly', 'Monthly', 'Yearly'] as TimeRange[]).map(range => (
                                <TouchableOpacity
                                    key={range}
                                    style={[styles.filterButton, timeRange === range && styles.activeFilterButton]}
                                    onPress={() => setTimeRange(range)}
                                >
                                    <Text style={[styles.filterButtonText, timeRange === range && styles.activeFilterButtonText]}>
                                        {range}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Metrics Overview */}
                        <View style={styles.metricsContainer}>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Total Income</Text>
                                <Text style={[styles.metricValue, styles.incomeText]}>GH₵{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                            </View>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Total Expenses</Text>
                                <Text style={[styles.metricValue, styles.expenseText]}>GH₵{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                            </View>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Net Savings</Text>
                                <Text style={[styles.metricValue, netSavings >= 0 ? styles.incomeText : styles.expenseText]}>GH₵{netSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                            </View>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Savings Rate</Text>
                                <Text style={styles.savingsRateText}>{savingsRate.toFixed(2)}%</Text>
                            </View>
                        </View>

                        {/* Monthly Spending Comparison */}
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>Monthly Spending Comparison</Text>
                            {monthlySpendingComparison.currentMonth > 0 || monthlySpendingComparison.lastMonth > 0 ? (
                                <BarChart
                                    data={{
                                        labels: ['Last Month', 'This Month'],
                                        datasets: [
                                            { data: [monthlySpendingComparison.lastMonth, monthlySpendingComparison.currentMonth], colors: [(opacity = 1) => colors.warning, (opacity = 1) => colors.danger] }
                                        ],
                                    }}
                                    width={screenWidth - 60} // Adjusted for padding
                                    height={200}
                                    chartConfig={{
                                        ...chartConfig,
                                        backgroundGradientFrom: colors.card,
                                        backgroundGradientTo: colors.card,
                                        color: (opacity = 1) => colors.text,
                                        barPercentage: 0.5,
                                    }}
                                    showValuesOnTopOfBars={true}
                                    fromZero={true}
                                />
                            ) : (
                                <View style={styles.emptyChartTextContainer}>
                                    <Text style={styles.emptyChartText}>No spending data for comparison.</Text>
                                </View>
                            )}
                        </View>

                        {/* Financial Trend Chart */}
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>{timeRange} Financial Trend</Text>
                            {filteredTransactionsByAccount.length > 0 ? (
                                <LineChart
                                    data={processTransactionTrendData()}
                                    width={screenWidth - 60} // Adjusted for padding
                                    height={250}
                                    chartConfig={{
                                        ...chartConfig,
                                        backgroundGradientFrom: colors.card,
                                        backgroundGradientTo: colors.card,
                                        color: (opacity = 1) => colors.text,
                                    }}
                                    bezier
                                />
                            ) : (
                                <View style={styles.emptyChartTextContainer}>
                                    <Text style={styles.emptyChartText}>No transaction data to display trend.</Text>
                                </View>
                            )}
                        </View>

                        {/* Expense Categories Pie Chart */}
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>Expense Categories</Text>
                            {filteredTransactionsByAccount.filter(t => t.type === 'expense').length > 0 ? (
                                <PieChart
                                    data={processExpenseCategoryData()}
                                    width={screenWidth - 60} // Adjusted for padding
                                    height={220}
                                    chartConfig={{
                                        ...chartConfig,
                                        backgroundGradientFrom: colors.card,
                                        backgroundGradientTo: colors.card,
                                        color: (opacity = 1) => colors.text,
                                    }}
                                    accessor="population"
                                    backgroundColor="transparent"
                                    paddingLeft="15"
                                    absolute
                                />
                            ) : (
                                <View style={styles.emptyChartTextContainer}>
                                    <Text style={styles.emptyChartText}>No expense data to display categories.</Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                );
            case 'Savings':
                return (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <SavingsReport
                            vaults={vaults}
                            totalSaved={totalSaved}
                            totalTarget={totalTarget}
                            overallProgress={overallProgress}
                        />
                    </ScrollView>
                );
            case 'Budget':
                return <BudgetReport budgetItems={budgetItems} />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Reports</Text>
            </View>

            <View style={styles.accountsSectionContainer}>
                <Text style={styles.sectionTitle}>Select Account</Text>
                <AccountsReport accounts={accounts} onSelect={setSelectedAccount} selectedAccount={selectedAccount} />
            </View>

            {/* Time Range Filter */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'Transactions' && styles.activeTabButton]}
                    onPress={() => setActiveTab('Transactions')}
                >
                    <Text style={[styles.tabButtonText, activeTab === 'Transactions' && styles.activeTabButtonText]}>Transactions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'Savings' && styles.activeTabButton]}
                    onPress={() => setActiveTab('Savings')}
                >
                    <Text style={[styles.tabButtonText, activeTab === 'Savings' && styles.activeTabButtonText]}>Savings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'Budget' && styles.activeTabButton]}
                    onPress={() => setActiveTab('Budget')}
                >
                    <Text style={[styles.tabButtonText, activeTab === 'Budget' && styles.activeTabButtonText]}>Budget</Text>
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
                {renderContent()}
            </View>
        </SafeAreaView>
    );
}
