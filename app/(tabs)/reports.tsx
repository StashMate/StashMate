import { eachDayOfInterval, eachMonthOfInterval, endOfMonth, endOfWeek, endOfYear, format, startOfMonth, startOfWeek, startOfYear } from 'date-fns';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { db } from '../../firebase';
import { getReportsStyles } from '../../styles/reports.styles';

interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category?: string;
    date: { toDate: () => Date };
    [key: string]: any;
}

interface Vault {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
}

interface Account {
    id: string;
    accountName: string;
    balance: number;
    vaults: Vault[];
}

type TimeRange = 'Weekly' | 'Monthly' | 'Yearly';

export default function ReportsScreen() {
    const { colors } = useTheme();
    const styles = getReportsStyles(colors);
    const { user } = useUser();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('Monthly');

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', user.uid));
        const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
            const fetchedTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
            setTransactions(fetchedTransactions);
            if(loading) setLoading(false);
        }, (err) => {
            console.error(err);
            setError("Failed to fetch transactions.");
            setLoading(false);
        });

        const accountsQuery = query(collection(db, 'accounts'), where('userId', '==', user.uid));
        const unsubscribeAccounts = onSnapshot(accountsQuery, async (snapshot) => {
            const fetchedAccounts: Account[] = [];
            for (const accountDoc of snapshot.docs) {
                const vaultsSnapshot = await getDocs(collection(db, 'accounts', accountDoc.id, 'vaults'));
                const vaults = vaultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vault));
                fetchedAccounts.push({ id: accountDoc.id, ...accountDoc.data(), vaults } as Account);
            }
            setAccounts(fetchedAccounts);
        }, (err) => {
            console.error(err);
            setError("Failed to fetch accounts.");
        });

        return () => {
            unsubscribeTransactions();
            unsubscribeAccounts();
        };
    }, [user]);

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

    // Prepare data for Income vs Expense Line Chart (Trend)
    const processTransactionTrendData = () => {
        const now = new Date();
        let interval;
        let dateFormat;

        switch (timeRange) {
            case 'Weekly':
                interval = { start: startOfWeek(now), end: endOfWeek(now) };
                dateFormat = 'EEE'; // Day of week (e.g., 'Mon')
                break;
            case 'Yearly':
                interval = { start: startOfYear(now), end: endOfYear(now) };
                dateFormat = 'MMM'; // Month abbreviation (e.g., 'Jan')
                break;
            case 'Monthly':
            default:
                interval = { start: startOfMonth(now), end: endOfMonth(now) };
                dateFormat = 'd'; // Day of month
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
    
    // Prepare data for Savings Bar Chart
    const savingsChartData = {
        labels: accounts.map(a => a.accountName.substring(0, 10)), // Truncate long names
        datasets: [{
            data: accounts.map(a => a.balance)
        }]
    };

    // Prepare data for Expense Categories Pie Chart
    const getExpenseCategoriesData = () => {
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        const categoryTotals: { [key: string]: number } = {};

        expenseTransactions.forEach(t => {
            const category = t.category || 'Other';
            categoryTotals[category] = (categoryTotals[category] || 0) + t.amount;
        });

        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#36A2EB'
        ];

        return Object.entries(categoryTotals).map(([name, amount], index) => ({
            name,
            amount,
            color: colors[index % colors.length],
            legendFontColor: colors.text,
            legendFontSize: 14,
        }));
    };

    // Calculate savings progress
    const getSavingsProgress = () => {
        const totalVaults = accounts.reduce((sum, account) => sum + account.vaults.length, 0);
        const completedVaults = accounts.reduce((sum, account) => 
            sum + account.vaults.filter(vault => vault.currentAmount >= vault.targetAmount).length, 0);
        
        return totalVaults > 0 ? (completedVaults / totalVaults) * 100 : 0;
    };

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

    const expenseCategoriesData = getExpenseCategoriesData();
    const savingsProgress = getSavingsProgress();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Reports</Text>
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

            {/* Savings Progress Overview */}
            <View style={styles.progressContainer}>
                <Text style={styles.progressTitle}>Savings Progress Overview</Text>
                <View style={styles.progressStats}>
                    <View style={styles.progressStatItem}>
                        <Text style={styles.progressStatValue}>{savingsProgress.toFixed(1)}%</Text>
                        <Text style={styles.progressStatLabel}>Goals Completed</Text>
                    </View>
                    <View style={styles.progressStatItem}>
                        <Text style={styles.progressStatValue}>{accounts.reduce((sum, acc) => sum + acc.vaults.length, 0)}</Text>
                        <Text style={styles.progressStatLabel}>Total Vaults</Text>
                    </View>
                    <View style={styles.progressStatItem}>
                        <Text style={styles.progressStatValue}>${accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}</Text>
                        <Text style={styles.progressStatLabel}>Total Savings</Text>
                    </View>
                </View>
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

            {/* Expense Categories Pie Chart */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Expense Categories</Text>
                {expenseCategoriesData.length > 0 ? (
                    <PieChart
                        data={expenseCategoriesData}
                        width={screenWidth - 32}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="amount"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                    />
                ) : (
                    <Text style={styles.emptyStateText}>No expense data available.</Text>
                )}
            </View>

            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Savings Distribution</Text>
                {accounts.length > 0 ? (
                    <BarChart
                        data={savingsChartData}
                        width={screenWidth - 32}
                        height={220}
                        chartConfig={chartConfig}
                        yAxisLabel="$"
                        yAxisSuffix=""
                        fromZero
                        showValuesOnTopOfBars
                    />
                ) : (
                    <Text style={styles.emptyStateText}>No savings data available.</Text>
                )}
            </View>
        </ScrollView>
    );
} 