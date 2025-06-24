import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getSavingsStyles } from '../../styles/savings.styles';
import { useRouter } from 'expo-router';
import { useSavings } from '../../context/SavingsContext';

export default function SavingsScreen() {
  const { colors } = useTheme();
  const styles = getSavingsStyles(colors);
  const router = useRouter();
  const { accounts, selectedAccount, setSelectedAccount } = useSavings();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Savings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.accountSelector}>
          {accounts.map(account => (
            <TouchableOpacity 
              key={account.id} 
              style={[styles.accountButton, selectedAccount.id === account.id && styles.selectedAccountButton]}
              onPress={() => setSelectedAccount(account)}
            >
              <Text style={[styles.accountButtonText, selectedAccount.id === account.id && styles.selectedAccountButtonText]}>{account.bankName}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.totalSavingsCard}>
          <Text style={styles.totalSavingsLabel}>Total Savings</Text>
          <Text style={styles.totalSavingsAmount}>${selectedAccount.totalSavings.toLocaleString()}</Text>
        </View>

        <View style={styles.accountInfoCard}>
          <View style={styles.accountInfoRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="bank-outline" size={22} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={styles.accountInfoLabel}>Bank Name</Text>
            </View>
            <Text style={styles.accountInfoValue}>{selectedAccount.bankName}</Text>
          </View>
          <View style={[styles.accountInfoRow, { marginBottom: 0 }]}>
            <Text style={styles.accountInfoLabel}>Available Balance</Text>
            <Text style={styles.accountInfoValue}>${selectedAccount.totalSavings.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Savings Vaults</Text>
        {selectedAccount.vaults.map((vault, index) => (
          <TouchableOpacity key={index} style={styles.vaultCard}>
            <Ionicons name={vault.icon as any} size={28} color={colors.primary} />
            <View style={styles.vaultInfo}>
              <Text style={styles.vaultName}>{vault.name}</Text>
              <Text style={styles.vaultAmount}>${vault.amount.toLocaleString()}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color={colors.secondaryText} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.newVaultButton} onPress={() => router.push('/addVault')}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.newVaultButtonText}>Create New Vault</Text>
      </TouchableOpacity>
    </View>
  );
} 