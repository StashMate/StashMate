import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTransactionDetailStyles } from '../styles/transactionDetail.styles';

export default function TransactionDetailScreen() {
  const { colors } = useTheme();
  const styles = getTransactionDetailStyles(colors);
  const router = useRouter();
  const params = useLocalSearchParams();
  const transaction = JSON.parse(params.transaction as string);

  const transactionDate = transaction.date
    ? (typeof (transaction.date as any).toDate === 'function' ? (transaction.date as any).toDate() : new Date(transaction.date as string))
    : null;
  const formattedDate = transactionDate ? transactionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const formattedTime = transactionDate ? transactionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

  const isReceived = transaction.type === 'income';

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, isReceived ? styles.income : styles.expense]}>
              {isReceived ? '+' : '-'}GH₵{Math.abs(transaction.amount).toFixed(2)}
            </Text>
            <Text style={styles.transactionName}>{transaction.name}</Text>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{transaction.category}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{formattedDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Time</Text>
              <Text style={styles.value}>{formattedTime}</Text>
            </View>
            <View style={[styles.detailRow, styles.lastDetailRow]}>
              <Text style={styles.label}>{isReceived ? 'From' : 'To'}</Text>
              <Text style={styles.value}>{transaction.category}</Text>
            </View>
          </View>
        </View>
    </SafeAreaView>
  );
}