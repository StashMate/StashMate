import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { fetchInvestmentDetail, fetchHistoricalPrices, InvestmentDetailData } from '../services/fmpService';
import { getInvestmentDetailStyles } from '../styles/investmentDetail.styles';

const screenWidth = Dimensions.get("window").width;

type ChartPeriod = '1day' | '1week' | '1month' | '3month' | '1year' | '5year';

export default function InvestmentDetailScreen() {
  const { colors } = useTheme();
  const styles = getInvestmentDetailStyles(colors);
  const router = useRouter();
  const { name, symbol, type } = useLocalSearchParams();

  const [investmentDetail, setInvestmentDetail] = useState<InvestmentDetailData | null>(null);
  const [historicalData, setHistoricalData] = useState<{ date: string; close: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('1month');

  useEffect(() => {
    const loadDetail = async () => {
      if (!symbol || !type) {
        setError('Missing investment symbol or type.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await fetchInvestmentDetail(symbol as string, type as 'stock');
        if (data) {
          setInvestmentDetail(data);
        } else {
          setError('Investment details not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch investment details.');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [symbol, type]);

  useEffect(() => {
    const loadHistoricalData = async () => {
      if (!symbol || !type) return;

      setChartLoading(true);
      setChartError(null);
      try {
        const data = await fetchHistoricalPrices(symbol as string, type as 'stock', selectedPeriod);
        setHistoricalData(data);
      } catch (err: any) {
        setChartError(err.message || 'Failed to fetch historical data.');
      } finally {
        setChartLoading(false);
      }
    };

    loadHistoricalData();
  }, [symbol, type, selectedPeriod]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!investmentDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No data available for this investment.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const chartData = {
    labels: historicalData.map((data, index) => (index % Math.ceil(historicalData.length / 5) === 0 ? data.date.substring(5, 10) : '')),
    datasets: [
      {
        data: historicalData.map(data => data.close),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 2, // optional, defaults to 2dp
    color: (opacity = 1) => colors.text,
    labelColor: (opacity = 1) => colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "0",
      strokeWidth: "0",
      stroke: "#ffa726"
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{investmentDetail.name || 'Investment Detail'}</Text>
      </View>
      <ScrollView style={styles.contentContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Current Price</Text>
          <Text style={styles.summaryValue}>${investmentDetail.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <Text style={[styles.summaryChange, investmentDetail.changesPercentage >= 0 ? styles.positiveChange : styles.negativeChange]}>
            {investmentDetail.changesPercentage.toFixed(2)}%
          </Text>
        </View>

        {investmentDetail.marketCap && (
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Market Cap:</Text>
            <Text style={styles.detailValue}>${investmentDetail.marketCap.toLocaleString()}</Text>
          </View>
        )}
        {investmentDetail.volume && (
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Volume:</Text>
            <Text style={styles.detailValue}>${investmentDetail.volume.toLocaleString()}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Price History</Text>
        <View style={styles.chartContainer}>
          {chartLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : chartError ? (
            <Text style={styles.errorText}>{chartError}</Text>
          ) : historicalData.length > 0 ? (
            <LineChart
              data={chartData}
              width={screenWidth - 32} // from padding 16 on each side
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={styles.infoText}>No historical data available for this period.</Text>
          )}
          <View style={styles.periodSelector}>
            {['1day', '1week', '1month', '3month', '1year', '5year'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[styles.periodButton, selectedPeriod === period && styles.selectedPeriodButton]}
                onPress={() => setSelectedPeriod(period as ChartPeriod)}
              >
                <Text style={[styles.periodButtonText, selectedPeriod === period && styles.selectedPeriodButtonText]}>
                  {period.replace('month', 'M').replace('year', 'Y').replace('week', 'W').replace('day', 'D')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {investmentDetail.description && (
          <>
            <Text style={styles.sectionTitle}>About {investmentDetail.name}</Text>
            <Text style={styles.descriptionText}>
              {investmentDetail.description}
            </Text>
          </>
        )}

        <Text style={styles.infoText}>Data provided by Financial Modeling Prep.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
