


import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CircularProgress } from 'react-native-circular-progress';
import { SavingsProvider, useSavings } from '../../context/SavingsContext';
import { useTheme } from '../../context/ThemeContext';
import { addVaultDeposit, deleteVault, updateVault } from '../../firebase';
import { getSavingsStyles } from '../../styles/savings.styles';
import * as Haptics from 'expo-haptics';

interface Vault {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    icon: string;
    deadline: Timestamp;
}

const SavingsScreenContent = () => {
    const { colors } = useTheme();
    const styles = getSavingsStyles(colors);
    const router = useRouter();
    const { accounts, vaults, loading, error, selectedAccount, setSelectedAccount, refetch } = useSavings();

    const [refreshing, setRefreshing] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isDepositModalVisible, setDepositModalVisible] = useState(false);
    const [editingVault, setEditingVault] = useState<Vault | null>(null);
    const [depositingVault, setDepositingVault] = useState<Vault | null>(null);
    const [editedName, setEditedName] = useState('');
    const [editedTargetAmount, setEditedTargetAmount] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        refetch();
        setTimeout(() => setRefreshing(false), 1000);
    }, [refetch]);

    const handleDeleteVault = (vaultId: string) => {
        if (!selectedAccount) return;
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

    const filteredVaults = vaults.filter(vault =>
        vault.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderVault = ({ item }: { item: Vault }) => {
        const progress = item.targetAmount > 0 ? (item.currentAmount / item.targetAmount) * 100 : 0;
        return (
            <View style={styles.vaultCard}>
                <CircularProgress
                    size={80}
                    width={8}
                    fill={progress}
                    tintColor={colors.primary}
                    backgroundColor={colors.border}
                    rotation={0}
                >
                    {() => <Ionicons name={item.icon as any} size={32} color={colors.primary} />}
                </CircularProgress>
                <View style={styles.vaultInfo}>
                    <Text style={styles.vaultName}>{item.name}</Text>
                    <Text style={styles.vaultAmount}>
                        ${item.currentAmount.toLocaleString()} / ${item.targetAmount.toLocaleString()}
                    </Text>
                </View>
                <View style={styles.vaultActions}>
                    <TouchableOpacity onPress={() => handleDeposit(item)}>
                        <Ionicons name="add-circle-outline" size={28} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleEditVault(item)}>
                        <Ionicons name="pencil-outline" size={24} color={colors.secondaryText} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteVault(item.id)}>
                        <Ionicons name="trash-outline" size={24} color={colors.danger} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderSkeleton = () => (
        <View style={styles.skeletonContainer}>
            {[...Array(3)].map((_, i) => (
                <View key={i} style={styles.skeletonVaultCard} />
            ))}
        </View>
    );

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Savings</Text>
            </View>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search vaults..."
                    placeholderTextColor={colors.secondaryText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <FlatList
                data={loading ? [] : filteredVaults}
                renderItem={renderVault}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.content}
                ListHeaderComponent={
                    <>
                        <Text style={styles.sectionTitle}>Accounts</Text>
                        <FlatList
                            horizontal
                            data={accounts}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.accountCard, selectedAccount?.id === item.id && styles.selectedAccountCard]}
                                    onPress={() => setSelectedAccount(item)}
                                >
                                    <Ionicons name="wallet-outline" size={32} color={selectedAccount?.id === item.id ? '#fff' : colors.primary} />
                                    <Text style={[styles.accountName, selectedAccount?.id === item.id && styles.selectedAccountText]}>{item.institution}</Text>
                                    <Text style={[styles.accountBalance, selectedAccount?.id === item.id && styles.selectedAccountText]}>${item.balance.toLocaleString()}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.id}
                            showsHorizontalScrollIndicator={false}
                            style={styles.accountSelector}
                        />
                        <Text style={styles.sectionTitle}>Savings Vaults</Text>
                    </>
                }
                ListEmptyComponent={loading ? renderSkeleton : (
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

            <TouchableOpacity style={styles.newVaultButton} onPress={() => router.push({ pathname: '/addVault', params: { accountId: selectedAccount?.id }})}>
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

export default function SavingsScreenWithProvider() {
    return (
        <SavingsProvider>
            <SavingsScreenContent />
        </SavingsProvider>
    );
} 