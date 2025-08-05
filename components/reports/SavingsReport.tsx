import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useTheme } from '../../context/ThemeContext';

interface Vault {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  icon: string;
  deadline: any; // Firebase Timestamp or string
}

interface SavingsReportProps {
  vaults: Vault[];
  totalSaved: number;
  totalTarget: number;
  overallProgress: number;
}

const SavingsReport: React.FC<SavingsReportProps> = ({ vaults, totalSaved, totalTarget, overallProgress }) => {
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
    summaryValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    circularProgressContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },
    circularProgressText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
    },
    vaultItem: {
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
    vaultDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    vaultName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    vaultProgressText: {
      fontSize: 14,
      color: colors.secondaryText,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: colors.separator,
      borderRadius: 4,
      overflow: 'hidden',
      marginTop: 5,
    },
    progressBar: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12,
      color: colors.secondaryText,
      textAlign: 'right',
      marginTop: 5,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Overall Savings Progress</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Saved:</Text>
          <Text style={styles.summaryValue}>GH₵{totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Target:</Text>
          <Text style={styles.summaryValue}>GH₵{totalTarget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>
        <View style={styles.circularProgressContainer}>
          <AnimatedCircularProgress
            size={120}
            width={10}
            fill={overallProgress}
            tintColor={colors.primary}
            backgroundColor={colors.separator}
            rotation={0}
            lineCap="round"
          >
            {(
              fill,
            ) => (
              <Text style={styles.circularProgressText}>
                {fill.toFixed(0)}%
              </Text>
            )}
          </AnimatedCircularProgress>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your Savings Goals</Text>
      <View>
        {vaults.length > 0 ? (
          vaults.map((vault) => {
            const progress = vault.targetAmount > 0 ? (vault.currentAmount / vault.targetAmount) * 100 : 0;
            const deadlineDate = vault.deadline instanceof Date ? vault.deadline : new Date(vault.deadline);
            const formattedDeadline = deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <View key={vault.id} style={styles.vaultItem}>
                <View style={styles.vaultDetails}>
                  <Ionicons name={vault.icon as any} size={24} color={colors.primary} style={{ marginRight: 10 }} />
                  <View>
                    <Text style={styles.vaultName}>{vault.name}</Text>
                    <Text style={styles.vaultProgressText}>GH₵{vault.currentAmount.toLocaleString()} / GH₵{vault.targetAmount.toLocaleString()}</Text>
                    <Text style={styles.vaultProgressText}>Due: {formattedDeadline}</Text>
                  </View>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${Math.min(progress, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{progress.toFixed(0)}% Complete</Text>
              </View>
            );
          })
        ) : (
          <Text style={{ textAlign: 'center', color: colors.secondaryText }}>No savings goals to display.</Text>
        )}
      </View>
    </View>
  );
};

export default SavingsReport;
