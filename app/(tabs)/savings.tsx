import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, Timestamp, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { db, deleteVault, updateVault, addMoneyToVault, withdrawMoneyFromVault, getTotalAllocatedSavings } from '../../firebase';
import { getSavingsStyles } from '../../styles/savings.styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface Account {
    id: string;
    accountName: string;
    balance: number;
    institution: string;
    logoUrl: string;
}

interface Vault {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    icon: string;
    deadline: Timestamp;
}

export default function SavingsScreen() {
    const { colors } = useTheme();
    const styles = getSavingsStyles(colors);
    const router = useRouter();
    const { user } = useUser();

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [loading, setLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingVault, setEditingVault] = useState<Vault | null>(null);
    const [editedName, setEditedName] = useState('');
    const [editedTargetAmount, setEditedTargetAmount] = useState('');
    const [editedDeadline, setEditedDeadline] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [totalAllocated, setTotalAllocated] = useState(0);
    const [isMoneyModalVisible, setMoneyModalVisible] = useState(false);
    const [moneyAction, setMoneyAction] = useState<'add' | 'withdraw'>('add');
    const [moneyAmount, setMoneyAmount] = useState('');
    const [selectedVault, setSelectedVault] = useState<Vault | null>(null);

    useEffect(() => {
        if (!user) return;

        const accountsQuery = query(collection(db, 'accounts'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(accountsQuery, (snapshot) => {
            const fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
            setAccounts(fetchedAccounts);
            if (fetchedAccounts.length > 0 && !selectedAccount) {
                setSelectedAccount(fetchedAccounts[0]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, selectedAccount]);

    useEffect(() => {
        if (!selectedAccount) return;

        const vaultsQuery = query(collection(db, 'accounts', selectedAccount.id, 'vaults'));
        const unsubscribe = onSnapshot(vaultsQuery, (snapshot) => {
            const fetchedVaults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vault));
            setVaults(fetchedVaults);
        });

        return () => unsubscribe();
    }, [selectedAccount]);

    useEffect(() => {
        if (!selectedAccount) return;

        const fetchTotalAllocated = async () => {
            const result = await getTotalAllocatedSavings(selectedAccount.id);
            if (result.success) {
                setTotalAllocated(result.totalAllocated || 0);
            }
        };

        fetchTotalAllocated();
    }, [selectedAccount, vaults]);

    const handleDeleteVault = (vaultId: string) => {
        if (!selectedAccount) return;
        Alert.alert(
            "Delete Vault",
            "Are you sure you want to delete this savings vault? Any money in this vault will be returned to your account balance.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        // First, return money to account if any
                        const vault = vaults.find(v => v.id === vaultId);
                        if (vault && vault.currentAmount > 0) {
                            await withdrawMoneyFromVault(selectedAccount.id, vaultId, vault.currentAmount);
                        }
                        
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
        setEditedDeadline(vault.deadline.toDate());
        setModalVisible(true);
    };

    const handleUpdateVault = async () => {
        if (!editingVault || !selectedAccount) return;

        if (!editedName.trim() || !editedTargetAmount.trim()) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        const updatedData = {
            name: editedName.trim(),
            targetAmount: parseFloat(editedTargetAmount),
            deadline: editedDeadline,
        };

        const result = await updateVault(selectedAccount.id, editingVault.id, updatedData);
        if (result.success) {
            Alert.alert("Success", "Vault updated successfully.");
            setModalVisible(false);
            setEditingVault(null);
        } else {
            Alert.alert("Error", "Failed to update vault.");
        }
    };

    const handleMoneyAction = (action: 'add' | 'withdraw', vault: Vault) => {
        setMoneyAction(action);
        setSelectedVault(vault);
        setMoneyAmount('');
        setMoneyModalVisible(true);
    };

    const handleMoneySubmit = async () => {
        if (!selectedVault || !selectedAccount || !moneyAmount.trim()) {
            Alert.alert("Error", "Please enter a valid amount.");
            return;
        }

        const amount = parseFloat(moneyAmount);
        if (amount <= 0) {
            Alert.alert("Error", "Please enter a valid amount greater than 0.");
            return;
        }

        let result;
        if (moneyAction === 'add') {
            result = await addMoneyToVault(selectedAccount.id, selectedVault.id, amount);
        } else {
            result = await withdrawMoneyFromVault(selectedAccount.id, selectedVault.id, amount);
        }

        if (result.success) {
            Alert.alert("Success", `Money ${moneyAction === 'add' ? 'added to' : 'withdrawn from'} vault successfully.`);
            setMoneyModalVisible(false);
            setMoneyAmount('');
            setSelectedVault(null);
        } else {
            Alert.alert("Error", result.error || `Failed to ${moneyAction} money.`);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || editedDeadline;
        setShowDatePicker(Platform.OS === 'ios');
        setEditedDeadline(currentDate);
    };

    const renderDeadlineStatus = (deadline: Timestamp) => {
        const now = new Date();
        const deadlineDate = deadline.toDate();
        const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

        if (daysRemaining < 0) {
            return <Text style={[styles.statusText, styles.overdueStatus]}>Overdue by {Math.abs(daysRemaining)} days</Text>;
        }
        if (daysRemaining === 0) {
            return <Text style={[styles.statusText, styles.dueSoonStatus]}>Due Today</Text>;
        }
        if (daysRemaining <= 7) {
            return <Text style={[styles.statusText, styles.dueSoonStatus]}>Due in {daysRemaining} day{daysRemaining > 1 ? 's' : ''}</Text>;
        }
        return <Text style={styles.deadlineText}>Due in {daysRemaining} days</Text>;
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.emptyStateText, { marginTop: 10 }]}>Loading your savings...</Text>
            </View>
        );
    }

    if (accounts.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Savings</Text>
                </View>
                <View style={styles.emptyStateContainer}>
                    <Ionicons name="wallet-outline" size={80} color={colors.secondaryText} />
                    <Text style={styles.emptyStateText}>No accounts linked yet.</Text>
                    <Text style={[styles.emptyStateText, { fontSize: 14, marginTop: 10 }]}>
                        Link your bank account to start saving
                    </Text>
                    <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/linkBank')}>
                        <Text style={styles.linkButtonText}>Link an Account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Savings</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.accountSelector}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {accounts.map(account => (
                            <TouchableOpacity
                                key={account.id}
                                style={[styles.accountButton, selectedAccount?.id === account.id && styles.selectedAccountButton]}
                                onPress={() => setSelectedAccount(account)}
                            >
                                {imageErrors[account.id] ? (
                                    <MaterialCommunityIcons name="bank" size={24} color={colors.primary} />
                                ) : (
                                    <Image 
                                        source={{ uri: account.logoUrl }} 
                                        style={styles.accountLogo} 
                                        onError={() => setImageErrors(prev => ({...prev, [account.id]: true}))}
                                    />
                                )}
                                <Text style={[styles.accountButtonText, selectedAccount?.id === account.id && styles.selectedAccountButtonText]}>{account.institution}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.addAccountButton} onPress={() => router.push('/linkBank')}>
                            <Ionicons name="add" size={20} color={colors.primary} />
                            <Text style={styles.addAccountButtonText}>Add Account</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {selectedAccount && (
                    <>
                        <View style={styles.accountInfoCard}>
                            <View style={styles.accountInfoRow}>
                                <Text style={styles.accountInfoLabel}>Account</Text>
                                <Text style={styles.accountInfoValue}>{selectedAccount.accountName}</Text>
                            </View>
                            <View style={styles.accountInfoRow}>
                                <Text style={styles.accountInfoLabel}>Current Balance</Text>
                                <Text style={[styles.accountInfoValue, { color: colors.primary, fontSize: 18, fontWeight: 'bold' }]}>
                                    ${selectedAccount.balance.toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.accountInfoRow}>
                                <Text style={styles.accountInfoLabel}>Total Allocated to Savings</Text>
                                <Text style={[styles.accountInfoValue, { color: colors.warning, fontSize: 18, fontWeight: 'bold' }]}>
                                    ${totalAllocated.toLocaleString()}
                                </Text>
                            </View>
                            <View style={[styles.accountInfoRow, { borderTopWidth: 1, borderTopColor: colors.separator, paddingTop: 15, marginTop: 10 }]}>
                                <Text style={[styles.accountInfoLabel, { fontWeight: 'bold' }]}>Available Balance</Text>
                                <Text style={[styles.accountInfoValue, { color: colors.success, fontSize: 20, fontWeight: 'bold' }]}>
                                    ${(selectedAccount.balance).toLocaleString()}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Savings Vaults</Text>
                            <Text style={styles.sectionSubtitle}>{vaults.length} vault{vaults.length !== 1 ? 's' : ''}</Text>
                        </View>

                        {vaults.length > 0 ? (
                            vaults.map((vault) => {
                                const progress = vault.targetAmount > 0 ? (vault.currentAmount / vault.targetAmount) * 100 : 0;
                                return (
                                <View key={vault.id} style={styles.vaultCard}>
                                    <View style={styles.vaultHeader}>
                                        <Ionicons name={vault.icon as any} size={32} color={colors.primary} />
                                        <View style={styles.vaultInfo}>
                                            <Text style={styles.vaultName}>{vault.name}</Text>
                                            <Text style={styles.vaultAmount}>
                                                ${vault.currentAmount.toLocaleString()} / ${vault.targetAmount.toLocaleString()}
                                            </Text>
                                            <View style={styles.progressBarContainer}>
                                                <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
                                            </View>
                                            <View style={styles.vaultStats}>
                                                <Text style={styles.progressText}>{progress.toFixed(1)}% complete</Text>
                                                {vault.deadline && renderDeadlineStatus(vault.deadline)}
                                            </View>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.vaultActions}>
                                        <TouchableOpacity 
                                            style={[styles.actionButton, styles.addMoneyButton]}
                                            onPress={() => handleMoneyAction('add', vault)}
                                        >
                                            <Ionicons name="add" size={20} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.actionButton, styles.withdrawButton]}
                                            onPress={() => handleMoneyAction('withdraw', vault)}
                                        >
                                            <Ionicons name="remove" size={20} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.actionButton, styles.editButton]}
                                            onPress={() => handleEditVault(vault)}
                                        >
                                            <Ionicons name="pencil-outline" size={20} color={colors.secondaryText} />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.actionButton, styles.deleteButton]}
                                            onPress={() => handleDeleteVault(vault.id)}
                                        >
                                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )})
                        ) : (
                            <View style={styles.emptyVaultsContainer}>
                                <Ionicons name="save-outline" size={60} color={colors.secondaryText} />
                                <Text style={styles.emptyVaultsText}>No savings vaults yet</Text>
                                <Text style={[styles.emptyVaultsText, { fontSize: 14, marginTop: 5 }]}>
                                    Create your first vault to start saving
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Edit Vault Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Vault</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.secondaryText} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.modalForm}>
                            <Text style={styles.modalLabel}>Vault Name</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={editedName}
                                onChangeText={setEditedName}
                                placeholder="Vault Name"
                                placeholderTextColor={colors.secondaryText}
                            />
                            
                            <Text style={styles.modalLabel}>Target Amount</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={editedTargetAmount}
                                onChangeText={setEditedTargetAmount}
                                placeholder="Target Amount"
                                placeholderTextColor={colors.secondaryText}
                                keyboardType="numeric"
                            />
                            
                            <Text style={styles.modalLabel}>Deadline</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.modalInput}>
                                <Text style={{ color: colors.text }}>
                                    {editedDeadline.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleUpdateVault}>
                                <Text style={styles.buttonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Money Action Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isMoneyModalVisible}
                onRequestClose={() => setMoneyModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {moneyAction === 'add' ? 'Add Money' : 'Withdraw Money'}
                            </Text>
                            <TouchableOpacity onPress={() => setMoneyModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.secondaryText} />
                            </TouchableOpacity>
                        </View>
                        
                        {selectedVault && (
                            <View style={styles.vaultPreview}>
                                <Ionicons name={selectedVault.icon as any} size={24} color={colors.primary} />
                                <Text style={styles.vaultPreviewText}>{selectedVault.name}</Text>
                                <Text style={styles.vaultPreviewAmount}>
                                    ${selectedVault.currentAmount.toLocaleString()} / ${selectedVault.targetAmount.toLocaleString()}
                                </Text>
                            </View>
                        )}
                        
                        <View style={styles.modalForm}>
                            <Text style={styles.modalLabel}>Amount</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={moneyAmount}
                                onChangeText={setMoneyAmount}
                                placeholder="Enter amount"
                                placeholderTextColor={colors.secondaryText}
                                keyboardType="numeric"
                            />
                            
                            {moneyAction === 'add' && selectedAccount && (
                                <Text style={styles.balanceInfo}>
                                    Available: ${selectedAccount.balance.toLocaleString()}
                                </Text>
                            )}
                            
                            {moneyAction === 'withdraw' && selectedVault && (
                                <Text style={styles.balanceInfo}>
                                    In Vault: ${selectedVault.currentAmount.toLocaleString()}
                                </Text>
                            )}
                        </View>
                        
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setMoneyModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleMoneySubmit}>
                                <Text style={styles.buttonText}>
                                    {moneyAction === 'add' ? 'Add Money' : 'Withdraw Money'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={editedDeadline}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    minimumDate={new Date()}
                />
            )}

            <TouchableOpacity 
                style={styles.newVaultButton} 
                onPress={() => router.push({ pathname: '/addVault', params: { accountId: selectedAccount?.id }})}
            >
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.newVaultButtonText}>Create New Vault</Text>
            </TouchableOpacity>
        </View>
    );
} 