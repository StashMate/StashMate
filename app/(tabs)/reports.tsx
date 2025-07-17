import { eachDayOfInterval, eachMonthOfInterval, endOfMonth, endOfWeek, endOfYear, format, startOfMonth, startOfWeek, startOfYear, subMonths, subWeeks, subYears } from 'date-fns';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Text, TouchableOpacity, View, Alert, Share } from 'react-native';
import { BarChart, LineChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { db } from '../../firebase';
import { getReportsStyles } from '../../styles/reports.styles';
import { Ionicons } from '@expo/vector-icons';

interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    date: { toDate: () => Date };
    category?: string;
    description?: string;
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
type ChartType = 'trend' | 'categories' | 'savings' | 'progress' | 'comparison';

export default function ReportsScreen() {
    const { colors } = useTheme();
    const styles = getReportsStyles(colors);
    const { user } = useUser();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('Monthly');
    const [activeChart, setActiveChart] = useState<ChartType>('trend');

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

    const enhancedChartConfig = {
        ...chartConfig,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.background,
        backgroundGradientFromOpacity: 0.8,
        backgroundGradientToOpacity: 0.3,
        fillShadowGradientFrom: colors.primary,
        fillShadowGradientTo: colors.primary,
        fillShadowGradientFromOpacity: 0.6,
        fillShadowGradientToOpacity: 0.1,
    };

    const screenWidth = Dimensions.get('window').width;

    // Enhanced analytics calculations
    const analytics = useMemo(() => {
        const now = new Date();
        const currentPeriodTransactions = transactions.filter(t => {
            const transactionDate = t.date.toDate();
            switch (timeRange) {
                case 'Weekly':
                    return transactionDate >= startOfWeek(now) && transactionDate <= endOfWeek(now);
                case 'Yearly':
                    return transactionDate >= startOfYear(now) && transactionDate <= endOfYear(now);
                case 'Monthly':
                default:
                    return transactionDate >= startOfMonth(now) && transactionDate <= endOfMonth(now);
            }
        });

        const previousPeriodStart = timeRange === 'Weekly' ? subWeeks(now, 1) : 
                                   timeRange === 'Yearly' ? subYears(now, 1) : 
                                   subMonths(now, 1);

        const previousPeriodTransactions = transactions.filter(t => {
            const transactionDate = t.date.toDate();
            switch (timeRange) {
                case 'Weekly':
                    return transactionDate >= startOfWeek(previousPeriodStart) && transactionDate <= endOfWeek(previousPeriodStart);
                case 'Yearly':
                    return transactionDate >= startOfYear(previousPeriodStart) && transactionDate <= endOfYear(previousPeriodStart);
                case 'Monthly':
                default:
                    return transactionDate >= startOfMonth(previousPeriodStart) && transactionDate <= endOfMonth(previousPeriodStart);
            }
        });

        const currentIncome = currentPeriodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const currentExpenses = currentPeriodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const previousIncome = previousPeriodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const previousExpenses = previousPeriodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        const incomeChange = previousIncome ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
        const expenseChange = previousExpenses ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0;
        const savingsRate = currentIncome ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0;

        return {
            currentIncome,
            currentExpenses,
            incomeChange,
            expenseChange,
            savingsRate,
            netSavings: currentIncome - currentExpenses
        };
    }, [transactions, timeRange]);

    // Prepare data for Income vs Expense Line Chart (Trend)
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
                } else {
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
                { data: incomeDataset, color: (opacity = 1) => colors.success, strokeWidth: 3 },
                { data: expenseDataset, color: (opacity = 1) => colors.danger, strokeWidth: 3 }
            ],
            legend: ["Income", "Expenses"]
        };
    };

    // Prepare data for expense categories pie chart
    const processCategoryData = () => {
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        const categoryTotals: { [key: string]: number } = {};
        
        expenseTransactions.forEach(t => {
            const category = t.category || 'Other';
            categoryTotals[category] = (categoryTotals[category] || 0) + t.amount;
        });

        const categories = Object.keys(categoryTotals);
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ];

        return categories.map((category, index) => ({
            name: category,
            amount: categoryTotals[category],
            color: colors[index % colors.length],
            legendFontColor: colors.text,
            legendFontSize: 12
        }));
    };

    // Prepare data for savings progress
    const processSavingsProgressData = () => {
        const totalSavings = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const totalVaultTargets = accounts.reduce((sum, acc) => 
            sum + acc.vaults.reduce((vaultSum, vault) => vaultSum + vault.targetAmount, 0), 0);
        const totalVaultCurrent = accounts.reduce((sum, acc) => 
            sum + acc.vaults.reduce((vaultSum, vault) => vaultSum + vault.currentAmount, 0), 0);

        return {
            labels: ['Savings Progress', 'Vault Progress'],
            data: [
                totalVaultTargets > 0 ? Math.min(totalVaultCurrent / totalVaultTargets, 1) : 0,
                analytics.savingsRate > 0 ? Math.min(analytics.savingsRate / 100, 1) : 0
            ]
        };
    };

    // Prepare data for Savings Bar Chart
    const savingsChartData = {
        labels: accounts.map(a => a.accountName.substring(0, 8)),
        datasets: [{
            data: accounts.map(a => a.balance)
        }]
    };

    // Export functionality
    const exportData = async () => {
        try {
            const reportData = {
                period: timeRange,
                analytics,
                totalTransactions: transactions.length,
                totalAccounts: accounts.length,
                generatedAt: new Date().toISOString()
            };

            const reportText = `
Financial Report - ${timeRange}
Generated: ${new Date().toLocaleDateString()}

📊 Summary:
• Income: $${analytics.currentIncome.toFixed(2)}
• Expenses: $${analytics.currentExpenses.toFixed(2)}
• Net Savings: $${analytics.netSavings.toFixed(2)}
• Savings Rate: ${analytics.savingsRate.toFixed(1)}%

📈 Changes:
• Income Change: ${analytics.incomeChange.toFixed(1)}%
• Expense Change: ${analytics.expenseChange.toFixed(1)}%

💰 Accounts:
${accounts.map(acc => `• ${acc.accountName}: $${acc.balance.toFixed(2)}`).join('\n')}
            `;

            await Share.share({
                message: reportText,
                title: 'Financial Report'
            });
        } catch (error) {
            Alert.alert('Export Error', 'Failed to export report data.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading your financial insights...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    const renderChart = () => {
        switch (activeChart) {
            case 'trend':
                return (
                    <View style={styles.chartContainer}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.chartTitle}>{timeRange} Financial Trend</Text>
                            <View style={styles.analyticsRow}>
                                <View style={styles.analyticsItem}>
                                    <Text style={styles.analyticsLabel}>Income</Text>
                                    <Text style={[styles.analyticsValue, { color: colors.success }]}>
                                        ${analytics.currentIncome.toFixed(0)}
                                    </Text>
                                    <Text style={[styles.analyticsChange, { color: analytics.incomeChange >= 0 ? colors.success : colors.danger }]}>
                                        {analytics.incomeChange >= 0 ? '+' : ''}{analytics.incomeChange.toFixed(1)}%
                                    </Text>
                                </View>
                                <View style={styles.analyticsItem}>
                                    <Text style={styles.analyticsLabel}>Expenses</Text>
                                    <Text style={[styles.analyticsValue, { color: colors.danger }]}>
                                        ${analytics.currentExpenses.toFixed(0)}
                                    </Text>
                                    <Text style={[styles.analyticsChange, { color: analytics.expenseChange <= 0 ? colors.success : colors.danger }]}>
                                        {analytics.expenseChange >= 0 ? '+' : ''}{analytics.expenseChange.toFixed(1)}%
                                    </Text>
                                </View>
                            </View>
                        </View>
                        {transactions.length > 0 ? (
                            <LineChart
                                data={processTransactionTrendData()}
                                width={screenWidth - 32}
                                height={280}
                                chartConfig={enhancedChartConfig}
                                bezier
                                withShadow
                                withDots
                                withInnerLines
                                withOuterLines
                                style={styles.chart}
                            />
                        ) : (
                            <Text style={styles.emptyStateText}>No transaction data to display trend.</Text>
                        )}
                    </View>
                );

            case 'categories':
                const categoryData = processCategoryData();
                return (
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>Expense Categories</Text>
                        {categoryData.length > 0 ? (
                            <PieChart
                                data={categoryData}
                                width={screenWidth - 32}
                                height={220}
                                chartConfig={chartConfig}
                                accessor="amount"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                style={styles.chart}
                            />
                        ) : (
                            <Text style={styles.emptyStateText}>No expense categories to display.</Text>
                        )}
                    </View>
                );

            case 'savings':
                return (
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>Savings Distribution</Text>
                        {accounts.length > 0 ? (
                            <BarChart
                                data={savingsChartData}
                                width={screenWidth - 32}
                                height={220}
                                chartConfig={enhancedChartConfig}
                                yAxisLabel="$"
                                yAxisSuffix=""
                                fromZero
                                showValuesOnTopOfBars
                                style={styles.chart}
                            />
                        ) : (
                            <Text style={styles.emptyStateText}>No savings data available.</Text>
                        )}
                    </View>
                );

            case 'progress':
                const progressData = processSavingsProgressData();
                return (
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>Savings & Goals Progress</Text>
                        <View style={styles.progressStats}>
                            <View style={styles.progressStat}>
                                <Text style={styles.progressLabel}>Savings Rate</Text>
                                <Text style={[styles.progressValue, { color: analytics.savingsRate > 20 ? colors.success : colors.warning }]}>
                                    {analytics.savingsRate.toFixed(1)}%
                                </Text>
                            </View>
                            <View style={styles.progressStat}>
                                <Text style={styles.progressLabel}>Net Savings</Text>
                                <Text style={[styles.progressValue, { color: analytics.netSavings > 0 ? colors.success : colors.danger }]}>
                                    ${analytics.netSavings.toFixed(0)}
                                </Text>
                            </View>
                        </View>
                        <ProgressChart
                            data={progressData}
                            width={screenWidth - 32}
                            height={220}
                            strokeWidth={16}
                            radius={32}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1, index = 0) => {
                                    const colors = [colors.primary, colors.success];
                                    return colors[index] || colors.primary;
                                }
                            }}
                            style={styles.chart}
                        />
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Financial Reports</Text>
                <TouchableOpacity onPress={exportData} style={styles.exportButton}>
                    <Ionicons name="share-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
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

            <View style={styles.chartTypeContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { key: 'trend', label: 'Trends', icon: 'trending-up' },
                        { key: 'categories', label: 'Categories', icon: 'pie-chart' },
                        { key: 'savings', label: 'Savings', icon: 'bar-chart' },
                        { key: 'progress', label: 'Progress', icon: 'analytics' }
                    ].map(chart => (
                        <TouchableOpacity
                            key={chart.key}
                            style={[styles.chartTypeButton, activeChart === chart.key && styles.activeChartTypeButton]}
                            onPress={() => setActiveChart(chart.key as ChartType)}
                        >
                            <Ionicons 
                                name={chart.icon as any} 
                                size={20} 
                                color={activeChart === chart.key ? colors.background : colors.text} 
                            />
                            <Text style={[styles.chartTypeButtonText, activeChart === chart.key && styles.activeChartTypeButtonText]}>
                                {chart.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {renderChart()}

            <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Quick Insights</Text>
                <View style={styles.insightGrid}>
                    <View style={styles.insightCard}>
                        <Ionicons name="trending-up" size={24} color={colors.success} />
                        <Text style={styles.insightLabel}>Best Saving Month</Text>
                        <Text style={styles.insightValue}>This {timeRange.toLowerCase()}</Text>
                    </View>
                    <View style={styles.insightCard}>
                        <Ionicons name="wallet" size={24} color={colors.primary} />
                        <Text style={styles.insightLabel}>Total Balance</Text>
                        <Text style={styles.insightValue}>${accounts.reduce((sum, acc) => sum + acc.balance, 0).toFixed(0)}</Text>
                    </View>
                    <View style={styles.insightCard}>
                        <Ionicons name="stats-chart" size={24} color={colors.warning} />
                        <Text style={styles.insightLabel}>Transactions</Text>
                        <Text style={styles.insightValue}>{transactions.length}</Text>
                    </View>
                    <View style={styles.insightCard}>
                        <Ionicons name="trophy" size={24} color={analytics.savingsRate > 20 ? colors.success : colors.danger} />
                        <Text style={styles.insightLabel}>Savings Rate</Text>
                        <Text style={styles.insightValue}>{analytics.savingsRate.toFixed(1)}%</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
} 