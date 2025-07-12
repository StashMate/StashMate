import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getInvestmentDetailsStyles } from '../../styles/investmentDetails.styles';
import { LineChart } from 'react-native-chart-kit';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { investmentDetailsData } from '../../data/investmentDetails';

type InvestmentDetail = {
    name: string;
    portfolioPercentage: number;
    ticker: string;
    currentValue: number;
    totalReturn: number;
    totalReturnPercentage: number;
    performance: {
        labels: string[];
        data: number[];
    };
    news: {
        title: string;
        source: string;
        description: string;
        image: any;
    }[];
    image: any;
};

export default function InvestmentDetailsScreen() {
  const { colors, isDark } = useTheme();
  const styles = getInvestmentDetailsStyles(colors);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const investmentId = Array.isArray(id) ? id[0] : id;
  const investment: InvestmentDetail | undefined = investmentId ? (investmentDetailsData as Record<string, InvestmentDetail>)[investmentId] : undefined;


  if (!investment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Investment Not Found</Text>
        </View>
        <View style={styles.content}>
          <Text style={{ color: colors.text }}>Sorry, we couldn't find the investment details.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const lineChartData = {
    labels: investment.performance.labels,
    datasets: [{
      data: investment.performance.data,
      color: (opacity = 1) => isDark ? `rgba(52, 211, 153, ${opacity})` : `rgba(10, 126, 164, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const lineChartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => isDark ? `rgba(52, 211, 153, ${opacity})` : `rgba(10, 126, 164, ${opacity})`,
    labelColor: (opacity = 1) => colors.secondaryText,
    propsForDots: { r: '4', strokeWidth: '2', stroke: isDark ? '#34D399' : '#0a7ea4' },
    propsForBackgroundLines: { stroke: colors.border, strokeDasharray: '' },
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Investment Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mainInfo}>
          {investment.image ? (
            <Image source={investment.image} style={styles.image} />
          ) : (
            <View style={[styles.image, { backgroundColor: colors.iconBackground }]} />
          )}
          <Text style={styles.fundName}>{investment.name}</Text>
          <Text style={styles.fundDetails}>Portfolio: {investment.portfolioPercentage}% | Ticker: {investment.ticker}</Text>
        </View>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Current Value</Text>
            <Text style={styles.summaryValue}>${investment.currentValue.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Return</Text>
            <Text style={styles.summaryValue}>+${investment.totalReturn.toLocaleString()}</Text>
            <Text style={styles.summaryReturn}>(+{investment.totalReturnPercentage}%)</Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <Text style={styles.performanceFund}>{investment.name}</Text>
            <Text style={styles.performanceReturn}>+{investment.totalReturnPercentage}%</Text>
          </View>
          <Text style={styles.performanceTimeline}>1Y: +{investment.totalReturnPercentage}%</Text>
          <LineChart data={lineChartData} width={Dimensions.get('window').width - 80} height={220} chartConfig={lineChartConfig} bezier />
        </View>

        <Text style={styles.sectionTitle}>News</Text>
        {investment.news.map((item, index) => (
          <TouchableOpacity key={index} style={styles.newsCard}>
            <View style={styles.newsContent}>
              <Text style={styles.newsSource}>{item.source}</Text>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDescription}>{item.description}</Text>
            </View>
            {item.image ? (
              <Image source={item.image} style={styles.newsImage} />
            ) : (
              <View style={[styles.newsImage, { backgroundColor: colors.iconBackground }]} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.sellButton]}>
          <Text style={[styles.buttonText, { color: colors.text }]}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buyButton]}>
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Buy</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 