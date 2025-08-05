import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../context/ThemeContext';

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

interface BudgetReportProps {
  budgetItems: BudgetItem[];
}

const BudgetReport: React.FC<BudgetReportProps> = ({ budgetItems }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    summaryTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 15,
      textAlign: 'center',
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    summaryLabel: {
      fontSize: 16,
      color: colors.secondaryText,
    },
    summaryAmount: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    incomeText: {
      color: colors.success,
    },
    expenseText: {
      color: colors.danger,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
      marginTop: 20, // Added margin top for spacing
    },
    itemContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 15,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
    },
    itemDetails: {
      flex: 1,
    },
    itemText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    itemSubText: {
      fontSize: 13,
      color: colors.secondaryText,
    },
    itemAmount: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    chartContainer: {
        alignItems: 'center',
    }
  });

  const totalIncome = useMemo(() => budgetItems.filter(item => item.type === 'income').reduce((acc, item) => acc + item.amount, 0), [budgetItems]);
  const totalExpenses = useMemo(() => budgetItems.filter(item => item.type === 'expense' && item.deductFromIncome).reduce((acc, item) => acc + item.amount, 0), [budgetItems]);
  const balance = totalIncome - totalExpenses;

  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => `rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, ${opacity})`,
    labelColor: (opacity = 1) => colors.text,
    propsForLabels: {
      fontSize: 10,
      fontWeight: 'bold',
    },
  };

  const processBudgetCategoryData = useMemo(() => {
    const expenseData: { [key: string]: number } = {};
    budgetItems.filter(item => item.type === 'expense').forEach(item => {
      expenseData[item.category] = (expenseData[item.category] || 0) + item.amount;
    });

    const colorPalette = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8A2BE2', '#7FFF00', '#DC143C', '#00FFFF'];
    return Object.keys(expenseData).map((category, index) => ({
      name: category,
      population: expenseData[category],
      color: colorPalette[index % colorPalette.length],
      legendFontColor: colors.text,
      legendFontSize: 12,
    }));
  }, [budgetItems, colors]);

  const renderListHeader = () => (
    <>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Budget Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Income:</Text>
          <Text style={[styles.summaryAmount, styles.incomeText]}>GH₵{totalIncome.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Expenses:</Text>
          <Text style={[styles.summaryAmount, styles.expenseText]}>GH₵{totalExpenses.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Balance:</Text>
          <Text style={[styles.summaryAmount, balance >= 0 ? styles.incomeText : styles.expenseText]}>GH₵{balance.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Expense Categories</Text>
      <View style={styles.chartContainer}>
        {processBudgetCategoryData.length > 0 ? (
          <PieChart
            data={processBudgetCategoryData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <Text style={{ textAlign: 'center', color: colors.secondaryText }}>No expense data to display categories.</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Budget Items</Text>
    </>
  );

  return (
    <FlatList
      style={styles.container}
      data={budgetItems}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderListHeader}
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          <View style={styles.itemDetails}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.itemSubText}>{item.category} - {item.date}</Text>
          </View>
          <Text style={[styles.itemAmount, item.type === 'income' ? styles.incomeText : styles.expenseText]}>
            {item.type === 'income' ? '+' : '-'}GH₵{item.amount.toFixed(2)}
          </Text>
        </View>
      )}
      ListEmptyComponent={(
        <View>
            {renderListHeader()} 
            <Text style={{ textAlign: 'center', color: colors.secondaryText, marginTop: 10 }}>No budget items to display.</Text>
        </View>
      )}
    />
  );
};

export default BudgetReport;
