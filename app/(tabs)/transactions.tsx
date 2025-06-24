import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getTransactionsStyles } from '../../styles/transactions.styles';
import { ComponentProps, useMemo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { transactions } from '../../data/transactions';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const styles = getTransactionsStyles(colors);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (filter !== 'All') {
      filtered = filtered.filter(t => t.type.toLowerCase() === filter.toLowerCase());
    }

    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [filter, searchQuery]);

  const groupedTransactions = useMemo(() => filteredTransactions.reduce((acc, tx) => {
    const date = new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[date]) {
        acc[date] = [];
    }
    acc[date].push(tx);
    return acc;
  }, {} as Record<string, typeof transactions>), [filteredTransactions]);

  const { totalIncome, totalExpense } = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
        if (t.type === 'income') acc.totalIncome += t.amount;
        else acc.totalExpense += t.amount;
        return acc;
    }, { totalIncome: 0, totalExpense: 0 });
  }, [filteredTransactions]);

  const FilterButton = ({ label }: { label: string }) => (
      <TouchableOpacity 
        style={[styles.filterButton, filter === label && styles.activeFilterButton]}
        onPress={() => setFilter(label)}
      >
          <Text style={[styles.filterText, filter === label && styles.activeFilterText]}>{label}</Text>
      </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Transactions</Text>
        </View>

        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} style={styles.searchIcon} />
            <TextInput 
                placeholder="Search transactions" 
                style={styles.searchInput}
                placeholderTextColor={colors.secondaryText}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
        
        <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Income</Text>
                <Text style={[styles.summaryAmount, styles.incomeText]}>+${totalIncome.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Expenses</Text>
                <Text style={[styles.summaryAmount, styles.expenseText]}>-${totalExpense.toFixed(2)}</Text>
            </View>
        </View>

        <View style={styles.filtersContainer}>
            <FilterButton label="All" />
            <FilterButton label="Income" />
            <FilterButton label="Expenses" />
        </View>

        <ScrollView contentContainerStyle={styles.listContainer}>
            {Object.keys(groupedTransactions).map(date => (
              <View key={date}>
                <Text style={styles.dateHeader}>{date}</Text>
                {groupedTransactions[date].map((item, index) => (
                    <View key={index} style={styles.transactionItem}>
                        <View style={styles.transactionIcon}>
                            <MaterialCommunityIcons name={item.icon as IconName} size={24} color={colors.primary} />
                        </View>
                        <View style={styles.transactionDetails}>
                            <Text style={styles.transactionName}>{item.name}</Text>
                            <Text style={styles.transactionCategory}>{item.category}</Text>
                        </View>
                        <Text style={[styles.transactionAmount, item.type === 'income' ? styles.income : styles.expense]}>
                            {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                        </Text>
                    </View>
                ))}
              </View>
            ))}
        </ScrollView>
      
    </SafeAreaView>
  );
}
