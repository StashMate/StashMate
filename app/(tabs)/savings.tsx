import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, Timestamp, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { db, deleteVault, updateVault } from '../../firebase';
import { getSavingsStyles } from '../../styles/savings.styles';

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

    const handleDeleteVault = (vaultId: string) => {
        if (!selectedAccount) return;
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
        setModalVisible(true);
    };

    const handleUpdateVault = async () => {
        if (!editingVault || !selectedAccount) return;

        const updatedData = {
            ...editingVault,
            name: editedName,
            targetAmount: parseFloat(editedTargetAmount),
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

    const renderDeadlineStatus = (deadline: Timestamp) => {
        const now = new Date();
        const deadlineDate = deadline.toDate();
        const daysRemaining = (deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24);

        if (daysRemaining < 0) {
            return <Text style={[styles.statusText, styles.overdueStatus]}>Overdue</Text>;
        }
        if (daysRemaining <= 7) {
            return <Text style={[styles.statusText, styles.dueSoonStatus]}>Due Soon</Text>;
        }
        return <Text style={styles.deadlineText}>Deadline: {deadlineDate.toLocaleDateString()}</Text>;
    };


    if (loading) {
        return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, justifyContent: 'center' }} />;
    }

    if (accounts.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Savings</Text>
                </View>
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>No accounts linked yet.</Text>
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
                        <View style={styles.totalSavingsCard}>
                            <Text style={styles.totalSavingsLabel}>{selectedAccount.accountName}</Text>
                            <Text style={styles.totalSavingsAmount}>${selectedAccount.balance.toLocaleString()}</Text>
                        </View>

                        <Text style={styles.sectionTitle}>Savings Vaults</Text>
                        {vaults.length > 0 ? (
                            vaults.map((vault) => {
                                const progress = vault.targetAmount > 0 ? (vault.currentAmount / vault.targetAmount) * 100 : 0;
                                return (
                                <View key={vault.id} style={styles.vaultCard}>
                                    <Ionicons name={vault.icon as any} size={32} color={colors.primary} />
                                    <View style={styles.vaultInfo}>
                                        <Text style={styles.vaultName}>{vault.name}</Text>
                                        <Text style={styles.vaultAmount}>
                                            ${vault.currentAmount.toLocaleString()} / ${vault.targetAmount.toLocaleString()}
                                        </Text>
                                        <View style={styles.progressBarContainer}>
                                            <View style={[styles.progressBar, { width: `${progress}%` }]} />
                                        </View>
                                        {vault.deadline && renderDeadlineStatus(vault.deadline)}
                                    </View>
                                    <View style={styles.vaultActions}>
                                        <TouchableOpacity onPress={() => handleEditVault(vault)}>
                                            <Ionicons name="pencil-outline" size={24} color={colors.secondaryText} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteVault(vault.id)}>
                                            <Ionicons name="trash-outline" size={24} color={colors.danger} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )})
                        ) : (
                            <Text style={styles.emptyVaultsText}>No savings vaults in this account yet.</Text>
                        )}
                    </>
                )}
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Vault</Text>
                        <TextInput
                            style={styles.input}
                            value={editedName}
                            onChangeText={setEditedName}
                            placeholder="Vault Name"
                        />
                        <TextInput
                            style={styles.input}
                            value={editedTargetAmount}
                            onChangeText={setEditedTargetAmount}
                            placeholder="Target Amount"
                            keyboardType="numeric"
                        />
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleUpdateVault}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity style={styles.newVaultButton} onPress={() => router.push({ pathname: '/addVault', params: { accountId: selectedAccount?.id }})}>
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.newVaultButtonText}>Create New Vault</Text>
            </TouchableOpacity>
        </View>
    );
} 