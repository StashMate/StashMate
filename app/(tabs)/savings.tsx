import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { getSavingsStyles } from '../../styles/savings.styles';
import { useRouter, useLocalSearchParams } from 'expo-router';

const initialSavingsData = {
  totalSavings: 7500,
  vaults: [
    {
      name: 'Emergency Fund',
      icon: 'shield-checkmark-outline',
      amount: 5000,
    },
    {
      name: 'Vacation Fund',
      icon: 'airplane-outline',
      amount: 1500,
    },
    {
      name: 'New Gadgets',
      icon: 'phone-portrait-outline',
      amount: 1000,
    },
  ],
};

export default function SavingsScreen() {
  const { colors } = useTheme();
  const styles = getSavingsStyles(colors);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [savingsData, setSavingsData] = useState(initialSavingsData);

  useEffect(() => {
    if (params.newVault) {
      const newVault = JSON.parse(params.newVault as string);
      setSavingsData(currentData => ({
        ...currentData,
        vaults: [...currentData.vaults, newVault],
        totalSavings: currentData.totalSavings + newVault.amount,
      }));
    }
  }, [params.newVault]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Savings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.totalSavingsCard}>
          <Text style={styles.totalSavingsLabel}>Total Savings</Text>
          <Text style={styles.totalSavingsAmount}>${savingsData.totalSavings.toLocaleString()}</Text>
        </View>

        <Text style={styles.sectionTitle}>Savings Vaults</Text>
        {savingsData.vaults.map((vault, index) => (
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