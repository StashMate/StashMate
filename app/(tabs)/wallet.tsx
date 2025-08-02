import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, RefreshControl, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSavings } from '../../context/SavingsContext';
import { useTheme } from '../../context/ThemeContext';
import { addVaultDeposit, deleteVault, updateVault } from '../../firebase';
import { getSavingsStyles } from '../../styles/savings.styles';


import BudgetScreen from '../budget';

interface Vault {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    icon: string;
    deadline: any; // Firebase Timestamp or string
}

export default function SavingsScreen() {
    const { colors } = useTheme();
    const styles = getSavingsStyles(colors);
    const router = useRouter();
    const { accounts, vaults, loading, error, selectedAccount, setSelectedAccount, refetch } = useSavings();

    const [showBudget, setShowBudget] = useState(false);

    
    const [refreshing, setRefreshing] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isDepositModalVisible, setDepositModalVisible] = useState(false);
    const [editingVault, setEditingVault] = useState<Vault | null>(null);
    const [depositingVault, setDepositingVault] = useState<Vault | null>(null);
    const [editedName, setEditedName] = useState('');
    const [editedTargetAmount, setEditedTargetAmount] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refetch();
        setTimeout(() => setRefreshing(false), 1000);
    }, [refetch]);

    const handleDeleteVault = async (vaultId: string) => {
        if (!selectedAccount) {
            Alert.alert("Error", "Please select an account first.");
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            "Delete Vault",
            "Are you sure you want to delete this savings vault?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        const result = await deleteVault(selectedAccount.id, vaultId);
                        if (!result.success) {
                            Alert.alert("Error", "Failed to delete vault.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const handleEditVault = (vault: Vault) => {
        setEditingVault(vault);
        setEditedName(vault.name);
        setEditedTargetAmount(vault.targetAmount.toString());
        setEditModalVisible(true);
    };

    const handleUpdateVault = async () => {
        if (!editingVault || !selectedAccount) return;

        const updatedData = {
            name: editedName,
            targetAmount: parseFloat(editedTargetAmount),
        };

        const result = await updateVault(selectedAccount.id, editingVault.id, updatedData);
        if (result.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success", "Vault updated successfully.");
            setEditModalVisible(false);
            setEditingVault(null);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Error", "Failed to update vault.");
        }
    };

    const handleDeposit = (vault: Vault) => {
        setDepositingVault(vault);
        setDepositModalVisible(true);
    };

    const handleConfirmDeposit = async () => {
        if (!depositingVault || !selectedAccount || !depositAmount) return;

        const amount = parseFloat(depositAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid deposit amount.");
            return;
        }

        const result = await addVaultDeposit(selectedAccount.id, depositingVault.id, amount);
        if (result.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success", "Deposit successful.");
            setDepositModalVisible(false);
            setDepositingVault(null);
            setDepositAmount('');
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Error", "Failed to make deposit.");
        }
    };

    const filteredVaults = useMemo(() => {
        return vaults.filter(vault =>
            vault.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [vaults, searchQuery]);

    const totalSaved = useMemo(() => {
        return filteredVaults.reduce((sum, vault) => sum + vault.currentAmount, 0);
    }, [filteredVaults]);

    const totalTarget = useMemo(() => {
        return filteredVaults.reduce((sum, vault) => sum + vault.targetAmount, 0);
    }, [filteredVaults]);

    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    const totalAccountBalance = useMemo(() => {
        return accounts.reduce((sum, account) => sum + account.balance, 0);
    }, [accounts]);

    const netBalance = useMemo(() => {
        if (!selectedAccount) return 0; // If no account is selected, net balance is 0
        return selectedAccount.balance - totalSaved;
    }, [selectedAccount, totalSaved]);

    const savingsPercentage = selectedAccount ? (totalSaved / selectedAccount.balance) * 100 : 0;

    const [isNetBalanceInfoModalVisible, setNetBalanceInfoModalVisible] = useState(false);

    const renderVault = ({ item }: { item: Vault }) => {
        const progress = item.targetAmount > 0 ? (item.currentAmount / item.targetAmount) * 100 : 0;
        const deadlineDate = item.deadline instanceof Timestamp ? item.deadline.toDate() : new Date(item.deadline);
        const formattedDeadline = deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return (
            <View style={styles.vaultCard}>
                <View style={styles.vaultHeader}>
                    <View style={styles.vaultIconContainer}>
                        <Ionicons name={item.icon as any} size={24} color={colors.primary} />
                    </View>
                    <View style={styles.vaultTitleContainer}>
                        <Text style={styles.vaultName}>{item.name}</Text>
                        <Text style={styles.vaultDeadline}>Due: {formattedDeadline}</Text>
                    </View>
                </View>
                <Text style={styles.vaultAmount}>
                    ${item.currentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${item.targetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <View style={styles.progressBarContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            { width: `${Math.min(progress, 100)}%` },
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>{progress.toFixed(0)}% Complete</Text>
                <View style={styles.vaultActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleDeposit(item)}>
                        <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                        <Text style={styles.actionButtonText}>Deposit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleEditVault(item)}>
                        <Ionicons name="pencil-outline" size={24} color={colors.secondaryText} />
                        <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteVault(item.id)}>
                        <Ionicons name="trash-outline" size={24} color={colors.danger} />
                        <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error loading savings data.</Text>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, !showBudget && styles.activeToggleButton]}
                    onPress={() => setShowBudget(false)}
                >
                    <Text style={[styles.toggleButtonText, !showBudget && styles.activeToggleButtonText]}>Savings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, showBudget && styles.activeToggleButton]}
                    onPress={() => setShowBudget(true)}
                >
                    <Text style={[styles.toggleButtonText, showBudget && styles.activeToggleButtonText]}>Budget</Text>
                </TouchableOpacity>
            </View>

            {showBudget ? (
                <BudgetScreen />
            ) : (
                <FlatList
                    data={filteredVaults}
                    renderItem={renderVault}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.flatListContentContainer}
                    ListHeaderComponent={
                        <>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Savings</Text>
                            </View>

                            {/* Accounts Overview */}
                            <Text style={styles.sectionTitle}>Your Accounts</Text>
                            {accounts.length > 0 ? (
                                <FlatList
                                    horizontal
                                    data={accounts}
                                    keyExtractor={(item) => item.id}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.accountsListContainer}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.accountCard, selectedAccount?.id === item.id && styles.selectedAccountCard]}
                                            onPress={() => setSelectedAccount(item)}
                                        >
                                            <Ionicons name="wallet-outline" size={32} color={selectedAccount?.id === item.id ? colors.card : colors.primary} />
                                            <Text style={[styles.accountName, selectedAccount?.id === item.id && { color: colors.card }]}>{item.institution}</Text>
                                            <Text style={[styles.accountBalance, selectedAccount?.id === item.id && { color: colors.card }]}>${item.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            ) : (
                                <View style={styles.emptyStateCard}>
                                    <Text style={styles.emptyStateText}>No accounts linked yet.</Text>
                                    <TouchableOpacity onPress={() => router.push('/linkBank')}>
                                        <Text style={styles.linkAccountText}>Link your first account!</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Savings Summary */}
                            <Text style={styles.sectionTitle}>Savings Summary</Text>
                            <View style={styles.summaryCard}>
                                <TouchableOpacity style={styles.infoIconContainer} onPress={() => setNetBalanceInfoModalVisible(true)}>
                                    <Ionicons name="information-circle-outline" size={24} color={colors.secondaryText} />
                                </TouchableOpacity>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Net Balance</Text>
                                    <Text style={styles.summaryValue}>${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <View style={styles.summaryItemHalf}>
                                        <Text style={styles.summaryLabel}>Total Saved</Text>
                                        <Text style={styles.summaryValueSmall}>${totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                                    </View>
                                    <View style={styles.summaryItemHalf}>
                                        <Text style={styles.summaryLabel}>Total Target</Text>
                                        <Text style={styles.summaryValueSmall}>${totalTarget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                                    </View>
                                </View>
                                <View style={styles.progressBarContainer}>
                                    <View
                                        style={[
                                            styles.progressBar,
                                            { width: `${Math.min(overallProgress, 100)}%` },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>{overallProgress.toFixed(0)}% Overall Progress</Text>
                                <Text style={styles.savingsPercentageText}>You've saved {savingsPercentage.toFixed(0)}% of your account balance!</Text>
                            </View>

                            <Text style={styles.sectionTitle}>Your Savings Vaults</Text>
                        </>
                    }
                    ListEmptyComponent={!loading && (
                        <View style={styles.emptyVaultsContainer}>
                            <Text style={styles.emptyVaultsText}>No savings vaults found.</Text>
                            <TouchableOpacity style={styles.newVaultButtonInline} onPress={() => router.push({ pathname: '/addVault', params: { accountId: selectedAccount?.id }})}>
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text style={styles.newVaultButtonText}>Create a Vault</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]}/>}
                />
            )}

            {/* Edit Vault Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isEditModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Savings Vault</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="create-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={editedName}
                                onChangeText={setEditedName}
                                placeholder="Vault Name"
                                placeholderTextColor={colors.secondaryText}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Ionicons name="cash-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={editedTargetAmount}
                                onChangeText={setEditedTargetAmount}
                                placeholder="Target Amount"
                                placeholderTextColor={colors.secondaryText}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEditModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleUpdateVault}>
                                <Text style={styles.buttonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Deposit Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isDepositModalVisible}
                onRequestClose={() => setDepositModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Deposit Funds</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="cash-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter amount"
                                placeholderTextColor={colors.secondaryText}
                                keyboardType="numeric"
                                value={depositAmount}
                                onChangeText={setDepositAmount}
                            />
                        </View>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setDepositModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleConfirmDeposit}>
                                <Text style={styles.buttonText}>Confirm Deposit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Net Balance Info Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isNetBalanceInfoModalVisible}
                onRequestClose={() => setNetBalanceInfoModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.fullScreenModalContainer} 
                    activeOpacity={1} 
                    onPress={() => setNetBalanceInfoModalVisible(false)}
                >
                    <View style={styles.infoModalContent}>
                        <Text style={styles.infoModalTitle}>What is Net Balance?</Text>
                        <Text style={styles.infoModalText}>
                            Your Net Balance is the amount of money currently available in your selected account 
                            after deducting the funds you have already allocated to your savings vaults.
                            It represents the liquid funds you have at your disposal, separate from your savings goals.
                        </Text>
                        <TouchableOpacity 
                            style={styles.infoModalButton} 
                            onPress={() => setNetBalanceInfoModalVisible(false)}
                        >
                            <Text style={styles.infoModalButtonText}>Got It!</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {!showBudget && (
                <TouchableOpacity style={styles.fab} onPress={() => router.push({ pathname: '/addVault', params: { accountId: selectedAccount?.id }})}>
                    <Ionicons name="add" size={32} color="#fff" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}