import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useSavings } from '../../context/SavingsContext';
import { getSavingsStyles } from '../../styles/savings.styles';
import { BankAccount, Vault } from '../../data/savings';

interface EditingVault extends Vault {
    id: string;
    targetAmount: number;
}

export default function SavingsScreen() {
    const { colors } = useTheme();
    const styles = getSavingsStyles(colors);
    const router = useRouter();
    const { accounts, selectedAccount, setSelectedAccount } = useSavings();

    const [loading, setLoading] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingVault, setEditingVault] = useState<EditingVault | null>(null);
    const [editedName, setEditedName] = useState('');
    const [editedTargetAmount, setEditedTargetAmount] = useState('');

    // Initialize with first account if none selected
    useEffect(() => {
        if (accounts.length > 0 && !selectedAccount) {
            setSelectedAccount(accounts[0]);
        }
    }, [accounts, selectedAccount, setSelectedAccount]);

    const handleDeleteVault = (vaultName: string) => {
        if (!selectedAccount) return;
        Alert.alert(
            "Delete Vault",
            "Are you sure you want to delete this savings vault?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {
                        // In a real app, this would delete from storage/database
                        Alert.alert("Info", "Vault deletion not implemented in demo mode.");
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const handleEditVault = (vault: Vault, index: number) => {
        const editVault: EditingVault = {
            ...vault,
            id: index.toString(),
            targetAmount: vault.amount * 1.5 // Demo target amount
        };
        setEditingVault(editVault);
        setEditedName(vault.name);
        setEditedTargetAmount(editVault.targetAmount.toString());
        setModalVisible(true);
    };

    const handleUpdateVault = () => {
        if (!editingVault || !selectedAccount) return;

        // In a real app, this would update the storage/database
        Alert.alert("Info", "Vault editing not implemented in demo mode.");
        setModalVisible(false);
        setEditingVault(null);
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
                    <Text style={styles.emptyStateText}>No accounts available.</Text>
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
                                <MaterialCommunityIcons name="bank" size={24} color={colors.primary} />
                                <Text style={[styles.accountButtonText, selectedAccount?.id === account.id && styles.selectedAccountButtonText]}>{account.bankName}</Text>
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
                            <Text style={styles.totalSavingsLabel}>{selectedAccount.bankName}</Text>
                            <Text style={styles.totalSavingsAmount}>${selectedAccount.totalSavings.toLocaleString()}</Text>
                        </View>

                        <Text style={styles.sectionTitle}>Savings Vaults</Text>
                        {selectedAccount.vaults.length > 0 ? (
                            selectedAccount.vaults.map((vault, index) => {
                                const targetAmount = vault.amount * 1.5; // Demo target amount
                                const progress = targetAmount > 0 ? (vault.amount / targetAmount) * 100 : 0;
                                return (
                                <View key={index} style={styles.vaultCard}>
                                    <Ionicons name={vault.icon as any} size={32} color={colors.primary} />
                                    <View style={styles.vaultInfo}>
                                        <Text style={styles.vaultName}>{vault.name}</Text>
                                        <Text style={styles.vaultAmount}>
                                            ${vault.amount.toLocaleString()} / ${targetAmount.toLocaleString()}
                                        </Text>
                                        <View style={styles.progressBarContainer}>
                                            <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
                                        </View>
                                    </View>
                                    <View style={styles.vaultActions}>
                                        <TouchableOpacity onPress={() => handleEditVault(vault, index)}>
                                            <Ionicons name="pencil-outline" size={24} color={colors.secondaryText} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteVault(vault.name)}>
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

            <TouchableOpacity style={styles.newVaultButton} onPress={() => {
                if (selectedAccount) {
                    router.push({ pathname: '/addVault', params: { accountId: selectedAccount.id.toString() }});
                } else {
                    Alert.alert("No Account", "Please select an account first.");
                }
            }}>
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.newVaultButtonText}>Create New Vault</Text>
            </TouchableOpacity>
        </View>
    );
} 