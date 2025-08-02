import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { fetchStockQuote, fetchStocks } from '../services/fmpService';
import { getInvestmentStyles } from '../styles/investment.styles';

interface InvestmentData {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
}

export default function InvestmentScreen() {
  const { colors } = useTheme();
  const styles = getInvestmentStyles(colors);
  const router = useRouter();

  const [stocks, setStocks] = useState<InvestmentData[]>([]);
  const [forex, setForex] = useState<InvestmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvestmentData = async () => {
      try {
        const fetchedStocks = await fetchStocks();
        const tslaStock = await fetchStockQuote('TSLA');

        let combinedStocks = [...fetchedStocks];
        if (tslaStock && !fetchedStocks.some(stock => stock.symbol === 'TSLA')) {
          combinedStocks.unshift(tslaStock); // Add TSLA to the beginning if not already present
        }

        setStocks(combinedStocks);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch investment data.');
      } finally {
        setLoading(false);
      }
    };

    loadInvestmentData();
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Investments</Text>
      </View>
      <ScrollView style={styles.contentContainer}>
        

        <Text style={styles.sectionTitle}>Stock Insights</Text>
        {stocks.length > 0 ? (
          stocks.map((item) => (
            <TouchableOpacity
              key={item.symbol}
              style={styles.card}
              onPress={() => router.push({ pathname: '/investmentDetail', params: { name: item.name, symbol: item.symbol, type: 'stock' } })}
            >
              <Text style={styles.cardTitle}>{item.name} ({item.symbol})</Text>
              <Text style={styles.cardValue}>${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              <Text style={[styles.cardChange, item.changesPercentage >= 0 ? styles.positiveChange : styles.negativeChange]}>
                {item.changesPercentage.toFixed(2)}%
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.infoText}>No stock data available.</Text>
        )}

        <Text style={styles.infoText}>Data provided by Financial Modeling Prep.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
