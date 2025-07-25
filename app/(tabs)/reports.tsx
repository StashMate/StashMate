import { eachDayOfInterval, eachMonthOfInterval, endOfMonth, endOfWeek, endOfYear, format, startOfMonth, startOfWeek, startOfYear, subMonths } from 'date-fns';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { db } from '../../firebase';
import { getReportsStyles } from '../../styles/reports.styles';
import { useSavings } from '../../context/SavingsContext';

interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: { toDate: () => Date };
    accountId?: string;
    [key: string]: any;
}

type TimeRange = 'Weekly' | 'Monthly' | 'Yearly';

export default function ReportsScreen() {
    const { colors } = useTheme();
    const styles = getReportsStyles(colors);
    const { user } = useUser();
    const { accounts, selectedAccount, setSelectedAccount } = useSavings();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('Monthly');

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        let transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', user.uid));

        if (selectedAccount) {
            transactionsQuery = query(transactionsQuery, where('accountId', '==', selectedAccount.id));
        }

        const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
            const fetchedTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
            setTransactions(fetchedTransactions);
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError("Failed to fetch transactions.");
            setLoading(false);
        });

        return () => {
            unsubscribeTransactions();
        };
    }, [user, selectedAccount]);

    const chartConfig = {
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
        labelColor: (opacity = 1) => colors.text,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: colors.primary
        }
    };

    const screenWidth = Dimensions.get('window').width;

    const processTransactionTrendData = () => {
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

        transactions.forEach((t: Transaction) => {
            if (t.date) {
                const transactionDate = t.date.toDate();
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
                        expenseDataset[index] += t.amount;
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
    };

    const processExpenseCategoryData = () => {
        const expenseData: { [key: string]: number } = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            expenseData[t.category] = (expenseData[t.category] || 0) + t.amount;
        });

        const data = Object.keys(expenseData).map((category, index) => {
            const colorPalette = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
            return {
                name: category,
                population: expenseData[category],
                color: colorPalette[index % colorPalette.length],
                legendFontColor: colors.text,
                legendFontSize: 12,
            };
        });
        return data;
    };

    const { totalIncome, totalExpense, netSavings, savingsRate, monthlySpendingComparison } = useMemo(() => {
        const now = new Date();
        const currentMonthStart = startOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        const currentMonthTransactions = transactions.filter(t => t.date.toDate() >= currentMonthStart);
        const lastMonthTransactions = transactions.filter(t => {
            const transactionDate = t.date.toDate();
            return transactionDate >= lastMonthStart && transactionDate <= lastMonthEnd;
        });

        const totalIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const lastMonthExpense = lastMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        const netSavings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

        return {
            totalIncome,
            totalExpense,
            netSavings,
            savingsRate,
            monthlySpendingComparison: { currentMonth: totalExpense, lastMonth: lastMonthExpense }
        };
    }, [transactions]);

    if (loading) {
        return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, justifyContent: 'center' }} />;
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={{ color: colors.danger, textAlign: 'center', marginTop: 20 }}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Reports</Text>
            </View>

            <View style={styles.accountSelectorContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        key="all-accounts-button"
                        style={[styles.accountButton, !selectedAccount && styles.activeAccountButton]}
                        onPress={() => setSelectedAccount(null)}
                    >
                        <Text style={[styles.accountButtonText, !selectedAccount && styles.activeAccountButtonText]}>All Accounts</Text>
                    </TouchableOpacity>
                    {accounts.map(account => (
                        <TouchableOpacity
                            key={account.id}
                            style={[styles.accountButton, selectedAccount?.id === account.id && styles.activeAccountButton]}
                            onPress={() => setSelectedAccount(account)}
                        >
                            <Text style={[styles.accountButtonText, selectedAccount?.id === account.id && styles.activeAccountButtonText]}>{account.accountName}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.metricsContainer}>
                <View style={styles.metricRow}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Total Income</Text>
                        <Text style={[styles.metricValue, styles.incomeText]}>${totalIncome.toLocaleString()}</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Total Expenses</Text>
                        <Text style={[styles.metricValue, styles.expenseText]}>${totalExpense.toLocaleString()}</Text>
                    </View>
                </View>
                <View style={styles.metricRow}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Net Savings</Text>
                        <Text style={[styles.metricValue, netSavings >= 0 ? styles.incomeText : styles.expenseText]}>${netSavings.toLocaleString()}</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Savings Rate</Text>
                        <Text style={styles.savingsRateText}>{savingsRate.toFixed(2)}%</Text>
                    </View>
                </View>
            </View>

            <View style={styles.comparisonContainer}>
                <Text style={styles.chartTitle}>Monthly Spending Comparison</Text>
                <Text style={styles.comparisonText}>
                    Last Month: ${monthlySpendingComparison.lastMonth.toLocaleString()} | This Month: ${monthlySpendingComparison.currentMonth.toLocaleString()}
                </Text>
            </View>

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

            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>{timeRange} Financial Trend</Text>
                {transactions.length > 0 ? (
                    <LineChart
                        data={processTransactionTrendData()}
                        width={screenWidth - 32}
                        height={250}
                        chartConfig={chartConfig}
                        bezier
                    />
                ) : (
                    <Text style={styles.emptyStateText}>No transaction data to display trend.</Text>
                )}
            </View>

            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Expense Categories</Text>
                {transactions.filter(t => t.type === 'expense').length > 0 ? (
                    <PieChart
                        data={processExpenseCategoryData()}
                        width={screenWidth - 32}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                    />
                ) : (
                    <Text style={styles.emptyStateText}>No expense data to display categories.</Text>
                )}
            </View>
        </ScrollView>
    );
} 