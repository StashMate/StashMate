import { Feather, Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { fetchCrypto, fetchStocks } from '../services/fmpService';
import { getInvestmentsStyles } from '../styles/investments.styles';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
}

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
}

export default function InvestmentsScreen() {
  const { colors } = useTheme();
  const styles = getInvestmentsStyles(colors);
  const router = useRouter();

  const [stocks, setStocks] = useState<StockData[]>([]);
  const [crypto, setCrypto] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadInvestmentData = async () => {
        setLoading(true);
        setError(null);
        try {
          const fetchedStocks = await fetchStocks();
          const fetchedCrypto = await fetchCrypto();
          setStocks(fetchedStocks);
          setCrypto(fetchedCrypto);
        } catch (err: any) {
          setError(err.message || 'Failed to fetch investment data.');
        } finally {
          setLoading(false);
        }
      };

      loadInvestmentData();
    }, [])
  );

  const totalInvestments = useMemo(() => {
    const totalStockValue = stocks.reduce((sum, stock) => sum + stock.price, 0);
    const totalCryptoValue = crypto.reduce((sum, coin) => sum + coin.price, 0);
    return totalStockValue + totalCryptoValue;
  }, [stocks, crypto]);

  const assetAllocation = useMemo(() => {
    const stockValue = stocks.reduce((sum, stock) => sum + stock.price, 0);
    const cryptoValue = crypto.reduce((sum, coin) => sum + coin.price, 0);

    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];

    if (stockValue > 0) {
      labels.push('Stocks');
      data.push(stockValue);
      colors.push('#34D399'); // Green for Stocks
    }
    if (cryptoValue > 0) {
      labels.push('Crypto');
      data.push(cryptoValue);
      colors.push('#FBBF24'); // Yellow for Crypto
    }

    // Add other asset types if you have them, e.g., Bonds, Real Estate (mocked or from other sources)
    // For now, keeping them as mock if no real data source is available
    const mockOtherAssets = [
      { label: 'Bonds', value: 2500, color: '#60A5FA' }, // Blue for Bonds
      { label: 'Real Estate', value: 4845, color: '#F87171' }, // Red for Real Estate
    ];

    mockOtherAssets.forEach(asset => {
      if (asset.value > 0) {
        labels.push(asset.label);
        data.push(asset.value);
        colors.push(asset.color);
      }
    });

    return { labels, data, colors };
  }, [stocks, crypto]);

  const allInvestments = useMemo(() => {
    const stockInvestments = stocks.map(stock => ({
      id: stock.symbol,
      name: stock.name,
      type: 'Stocks',
      value: stock.price,
      icon: 'trending-up', // Example icon
    }));

    const cryptoInvestments = crypto.map(coin => ({
      id: coin.symbol,
      name: coin.name,
      type: 'Crypto',
      value: coin.price,
      icon: 'logo-bitcoin', // Example icon
    }));

    // Combine and sort, or handle as needed
    return [...stockInvestments, ...cryptoInvestments];
  }, [stocks, crypto]);

  // Mock data for sections that require historical or transactional data not available from FMP free tier
  const mockPerformance = {
    totalReturns: 5678,
    totalReturnsPercentage: 10,
    annualizedReturn: 12.5,
    annualizedReturnPercentage: 5,
  };

  const mockPerformanceHistory = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [5000, 5200, 5100, 5500, 5600, 5678],
  };

  const mockTotalDeposits = 6667; // This would come from user's transaction history

  const barChartData = {
    labels: assetAllocation.labels,
    datasets: [{
      data: assetAllocation.data,
      colors: assetAllocation.colors.map(color => () => color)
    }]
  };

  const lineChartData = {
    labels: mockPerformanceHistory.labels,
    datasets: [{
      data: mockPerformanceHistory.data,
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading investment data.</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.summaryValue}>${totalInvestments.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Returns</Text>
            <Text style={styles.summaryValue}>${mockPerformance.totalReturns.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Deposits</Text>
            <Text style={styles.summaryValue}>${mockTotalDeposits.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Asset Allocation</Text>
        <View style={styles.assetAllocationCard}>
          <View style={styles.allocationHeader}>
            <Text style={styles.allocationTitle}>Portfolio Allocation</Text>
            <Text style={styles.allocationValue}>${totalInvestments.toLocaleString()}</Text>
          </View>
          <View style={styles.chartContainer}>
            {assetAllocation.data.length > 0 ? (
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
            ) : (
              <Text style={styles.emptyChartText}>No data for asset allocation.</Text>
            )}
          </View>
          <View style={styles.legendContainer}>
            {assetAllocation.labels.map((label, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColorBox, { backgroundColor: assetAllocation.colors[index] }]} />
                <Text style={styles.legendText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.performanceContainer}>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceLabel}>Total Returns</Text>
            <Text style={styles.performanceValue}>${mockPerformance.totalReturns.toLocaleString()}</Text>
            <Text style={[styles.performanceChange, { color: colors.success }]}>+{mockPerformance.totalReturnsPercentage}%</Text>
          </View>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceLabel}>Annualized Return</Text>
            <Text style={styles.performanceValue}>{mockPerformance.annualizedReturn}%</Text>
            <Text style={[styles.performanceChange, { color: colors.success }]}>+{mockPerformance.annualizedReturnPercentage}%</Text>
          </View>
        </View>

        <View style={styles.assetAllocationCard}>
          <Text style={styles.chartTitle}>Performance History</Text>
          {mockPerformanceHistory.data.length > 0 ? (
            <LineChart
              data={lineChartData}
              width={Dimensions.get('window').width - 80}
              height={220}
              chartConfig={lineChartConfig}
              bezier
              yAxisLabel="$"
            />
          ) : (
            <Text style={styles.emptyChartText}>No data for performance history.</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Investments</Text>
        {allInvestments.length > 0 ? (
          allInvestments.map((item, index) => (
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
          ))
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>No investments to display.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}