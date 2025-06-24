import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { getDashboardStyles } from '../../styles/dashboard.styles';
import { useTheme } from '../../context/ThemeContext';

type IconName = ComponentProps<typeof Ionicons>['name'];

// This data will eventually come from Firebase
const transactions: {icon: IconName, name: string, category: string, amount: number}[] = [
  {
    icon: 'cart-outline',
    name: 'Supermarket',
    category: 'Groceries',
    amount: 50.00,
  },
  {
    icon: 'film-outline',
    name: 'Cinema',
    category: 'Entertainment',
    amount: 20.00,
  },
  {
    icon: 'chatbubble-ellipses-outline',
    name: 'Electricity Bill',
    category: 'Utilities',
    amount: 100.00,
  },
];

const savings: {icon: IconName, name: string, fund: string, amount: number} = {
  icon: 'wallet-outline',
  name: 'Savings Account',
  fund: 'Vacation Fund',
  amount: 5000.00,
};


export default function DashboardScreen() {
  const { colors } = useTheme();
  const styles = getDashboardStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }}
            style={styles.profileImage}
          />
          <Text style={styles.headerTitle}>StashMate</Text>
          <Ionicons name="settings-outline" size={24} color={colors.primary} />
        </View>

        <View style={styles.card}>
            <Text style={styles.title}>Net Balance</Text>
            <Text style={styles.balance}>$11,675.67</Text>
        </View>

        <View style={styles.summaryCardsContainer}>
            <View style={styles.summaryCard}>
                <Ionicons name="wallet-outline" size={28} color={colors.link} />
                <Text style={styles.summaryCardTitle}>Budget</Text>
                <Text style={styles.summaryCardValue}>$600 / $1000</Text>
            </View>
            <View style={styles.summaryCard}>
                <Ionicons name="flame-outline" size={28} color={colors.link} />
                <Text style={styles.summaryCardTitle}>Savings Streak</Text>
                <Text style={styles.summaryCardValue}>12 weeks</Text>
            </View>
        </View>

        <View style={styles.quoteCard}>
          <Ionicons name="bulb-outline" size={24} color={colors.secondaryText} style={styles.quoteIcon} />
          <Text style={styles.quoteText}>"The best time to plant a tree was 20 years ago. The second best time is now."</Text>
          <Text style={styles.quoteAuthor}>- Chinese Proverb</Text>
        </View>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.map((item, index) => (
          <View key={index} style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <Ionicons name={item.icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionName}>{item.name}</Text>
              <Text style={styles.transactionCategory}>{item.category}</Text>
            </View>
            <Text style={styles.transactionAmount}>-${item.amount.toFixed(2)}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Savings Overview</Text>
        <View style={styles.transactionItem}>
          <View style={styles.transactionIcon}>
            <Ionicons name={savings.icon} size={24} color={colors.primary} />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionName}>{savings.name}</Text>
            <Text style={styles.transactionCategory}>{savings.fund}</Text>
          </View>
          <Text style={styles.savingsAmount}>${savings.amount.toFixed(2)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Investments</Text>
        <TouchableOpacity style={styles.transactionItem}>
          <View style={styles.transactionIcon}>
            <Ionicons name="analytics" size={24} color={colors.primary} />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionName}>View Investment Performance</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
