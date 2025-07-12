import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getInvestmentsStyles } from '../styles/investments.styles';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useRouter, Link } from 'expo-router';

const investmentPageData = {
  totalInvestments: 12345,
  totalReturns: 5678,
  totalDeposits: 6667,
  assetAllocation: {
    labels: ['Stocks', 'Bonds', 'Crypto', 'Real Estate'],
    data: [3000, 2500, 2000, 4845],
    colors: ['#34D399', '#60A5FA', '#FBBF24', '#F87171'],
  },
  performance: {
    totalReturns: 5678,
    totalReturnsPercentage: 10,
    annualizedReturn: 12.5,
    annualizedReturnPercentage: 5,
  },
  performanceHistory: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [5000, 5200, 5100, 5500, 5600, 5678],
  },
  investments: [
    { id: 'tech-stocks', name: 'Tech Stocks', type: 'Stocks', value: 3000, icon: 'analytics-outline' },
    { id: 'gov-bonds', name: 'Government Bonds', type: 'Bonds', value: 2500, icon: 'analytics-outline' },
    { id: 'bitcoin', name: 'Bitcoin', type: 'Crypto', value: 2000, icon: 'analytics-outline' },
    { id: 'reit', name: 'REIT', type: 'Real Estate', value: 4845, icon: 'analytics-outline' },
  ],
};

export default function InvestmentsScreen() {
  const { colors } = useTheme();
  const styles = getInvestmentsStyles(colors);
  const router = useRouter();

  const barChartData = {
    labels: investmentPageData.assetAllocation.labels,
    datasets: [{
      data: investmentPageData.assetAllocation.data,
      colors: investmentPageData.assetAllocation.colors.map(color => () => color)
    }]
  };

  const lineChartData = {
    labels: investmentPageData.performanceHistory.labels,
    datasets: [{
      data: investmentPageData.performanceHistory.data,
      color: (opacity = 1) => `rgba(52, 211, 153, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const barChartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: () => `rgba(128, 128, 128, 0.2)`,
    labelColor: () => colors.secondaryText,
    barPercentage: 0.8,
    propsForBackgroundLines: {
      strokeWidth: 0
    },
    propsForLabels: {
      fontSize: '10'
    }
  };

  const lineChartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(52, 211, 153, ${opacity})`,
    labelColor: (opacity = 1) => colors.secondaryText,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#34D399',
    },
    propsForBackgroundLines: {
      stroke: colors.border,
      strokeDasharray: '',
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Investments</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Investment</Text>
            <Text style={styles.summaryValue}>${investmentPageData.totalInvestments.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Returns</Text>
            <Text style={styles.summaryValue}>${investmentPageData.totalReturns.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Deposits</Text>
            <Text style={styles.summaryValue}>${investmentPageData.totalDeposits.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Asset Allocation</Text>
        <View style={styles.assetAllocationCard}>
          <View style={styles.allocationHeader}>
            <Text style={styles.allocationTitle}>Portfolio Allocation</Text>
            <Text style={styles.allocationValue}>${investmentPageData.totalInvestments.toLocaleString()}</Text>
          </View>
          <View style={styles.chartContainer}>
            <BarChart
              data={barChartData}
              width={Dimensions.get('window').width - 80}
              height={220}
              chartConfig={barChartConfig}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero={true}
              showValuesOnTopOfBars={true}
              withInnerLines={false}
              withHorizontalLabels={false}
              withCustomBarColorFromData={true}
            />
          </View>
          <View style={styles.legendContainer}>
            {investmentPageData.assetAllocation.labels.map((label, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColorBox, { backgroundColor: investmentPageData.assetAllocation.colors[index] }]} />
                <Text style={styles.legendText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.performanceContainer}>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceLabel}>Total Returns</Text>
            <Text style={styles.performanceValue}>${investmentPageData.performance.totalReturns.toLocaleString()}</Text>
            <Text style={[styles.performanceChange, { color: colors.success }]}>+{investmentPageData.performance.totalReturnsPercentage}%</Text>
          </View>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceLabel}>Annualized Return</Text>
            <Text style={styles.performanceValue}>{investmentPageData.performance.annualizedReturn}%</Text>
            <Text style={[styles.performanceChange, { color: colors.success }]}>+{investmentPageData.performance.annualizedReturnPercentage}%</Text>
          </View>
        </View>

        <View style={styles.assetAllocationCard}>
          <Text style={styles.chartTitle}>Performance History</Text>
          <LineChart
            data={lineChartData}
            width={Dimensions.get('window').width - 80}
            height={220}
            chartConfig={lineChartConfig}
            bezier
            yAxisLabel="$"
          />
        </View>

        <Text style={styles.sectionTitle}>Investments</Text>
        {investmentPageData.investments.map((item, index) => (
          <Link key={index} href={`/investment/${item.id}` as any} asChild>
            <TouchableOpacity style={styles.investmentCard}>
              <View style={styles.investmentIcon}>
                <Ionicons name={item.icon as any} size={24} color={colors.primary} />
              </View>
              <View style={styles.investmentInfo}>
                <Text style={styles.investmentName}>{item.name}</Text>
                <Text style={styles.investmentType}>{item.type}</Text>
              </View>
              <Text style={styles.investmentValue}>${item.value.toLocaleString()}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
} 