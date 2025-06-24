import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getInvestmentsStyles } from '../styles/investments.styles';
import { BarChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';

// This data will eventually come from Firebase
const investmentsData = {
  totalValue: 25000,
  overallGain: 2500,
  gainPercentage: 10,
  holdings: [
    { name: 'Tech Innovations Inc.', symbol: 'TECH', value: 10000, gain: 1200, icon: 'hardware-chip-outline' },
    { name: 'Green Energy Fund', symbol: 'GREEN', value: 8000, gain: 800, icon: 'leaf-outline' },
    { name: 'Real Estate Trust', symbol: 'REIT', value: 7000, gain: 500, icon: 'home-outline' },
  ],
};

export default function InvestmentsScreen() {
  const { colors, isDark } = useTheme();
  const styles = getInvestmentsStyles(colors);
  const router = useRouter();

  const chartData = {
    labels: investmentsData.holdings.map(h => h.symbol),
    datasets: [{
      data: investmentsData.holdings.map(h => h.value),
    }]
  };

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => isDark ? `rgba(52, 211, 153, ${opacity})` : `rgba(10, 126, 164, ${opacity})`,
    labelColor: (opacity = 1) => colors.secondaryText,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      stroke: colors.border,
    },
    barPercentage: 0.8,
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
        <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
                <Ionicons name="stats-chart-outline" size={24} color={colors.primary} />
                <Text style={styles.summaryTitle}>Portfolio Value</Text>
            </View>
            <Text style={styles.summaryValue}>${investmentsData.totalValue.toLocaleString()}</Text>
            <Text style={styles.summaryGain}>
                +${investmentsData.overallGain.toLocaleString()} ({investmentsData.gainPercentage}%) All Time
            </Text>
        </View>

        <View style={styles.chartContainer}>
            <BarChart
                data={chartData}
                width={Dimensions.get('window').width - 64}
                height={220}
                yAxisLabel="$"
                chartConfig={chartConfig}
                verticalLabelRotation={0}
                fromZero={true}
                showValuesOnTopOfBars={true}
                yAxisSuffix=""
            />
        </View>

        <Text style={styles.sectionTitle}>My Holdings</Text>
        {investmentsData.holdings.map((holding, index) => (
          <TouchableOpacity key={index} style={styles.holdingCard}>
            <View style={styles.holdingIcon}>
              <Ionicons name={holding.icon as any} size={20} color={colors.primary} />
            </View>
            <View style={styles.holdingInfo}>
              <Text style={styles.holdingName}>{holding.name}</Text>
              <Text style={styles.holdingSymbol}>{holding.symbol}</Text>
            </View>
            <View style={styles.holdingValueContainer}>
              <Text style={styles.holdingValue}>${holding.value.toLocaleString()}</Text>
              <Text style={styles.holdingGain}>+${holding.gain.toLocaleString()}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
} 