import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getAccountsReportStyles } from '../../styles/accountsReport.styles';

const AccountItem = ({ item, styles, onSelect, isSelected, colors}) => {
  const getIconName = (institution) => {
    switch (institution) {
      case 'MTN Mobile Money':
        return 'phone-portrait-outline';
      case 'Vodafone Cash':
        return 'phone-portrait-outline';
      case 'AirtelTigo Money':
        return 'phone-portrait-outline';
      default:
        return 'card';
    }
  };

  return (
    <TouchableOpacity onPress={() => onSelect(item)} style={[styles.accountItem, isSelected && styles.selectedAccountItem]}>
      <Ionicons name={getIconName(item.institution)} size={24} color={isSelected ? colors.card : colors.primary} style={styles.accountIcon} />
      <View style={styles.accountDetails}>
        <Text style={[styles.accountName, isSelected && styles.selectedAccountName]}>{item.institution}</Text>
        <Text style={[styles.accountBalance, isSelected && styles.selectedAccountBalance]}>GH₵{item.balance.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function AccountsReport({ accounts, onSelect, selectedAccount }) {
  const { colors } = useTheme();
  const styles = getAccountsReportStyles(colors);

  return (
    <View style={styles.container}>
      <FlatList
        data={accounts}
        renderItem={({ item }) => <AccountItem item={item} styles={styles} onSelect={onSelect} isSelected={selectedAccount?.id === item.id} colors={colors} />}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}
