import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, Timestamp, where } from 'firebase/firestore';
import React, { useEffect, useState, useRef } from 'react';
import { 
    ActivityIndicator, 
    Alert, 
    Animated, 
    Dimensions, 
    Image, 
    Modal, 
    RefreshControl,
    ScrollView, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { db, deleteVault, updateVault, addVaultDeposit } from '../../firebase';
import { getSavingsStyles } from '../../styles/savings.styles';

const { width } = Dimensions.get('window');

interface Account {
    id: string;
    accountName: string;
    balance: number;
    institution: string;
    logoUrl: string;
    accountType: string;
}

interface Vault {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    icon: string;
    deadline: Timestamp;
    createdAt?: Timestamp;
    color?: string;
}

interface VaultWithProgress extends Vault {
    progress: number;
    daysRemaining: number;
    isOverdue: boolean;
    monthlyTarget?: number;
}

export default function SavingsScreen() {
    const { colors } = useTheme();
    const styles = getSavingsStyles(colors);
    const router = useRouter();
    const { user } = useUser();

    // State management
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [vaults, setVaults] = useState<VaultWithProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
    
    // Modal states
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isDepositModalVisible, setDepositModalVisible] = useState(false);
    const [editingVault, setEditingVault] = useState<Vault | null>(null);
    const [depositingVault, setDepositingVault] = useState<Vault | null>(null);
    
    // Form states
    const [editedName, setEditedName] = useState('');
    const [editedTargetAmount, setEditedTargetAmount] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    
    // Animation values
    const progressAnimations = useRef<{[key: string]: Animated.Value}>({}).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-100)).current;

    // Initialize animations
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    // Enhanced vault data processing
    const processVaultData = (rawVaults: Vault[]): VaultWithProgress[] => {
        return rawVaults.map(vault => {
            const progress = vault.targetAmount > 0 ? (vault.currentAmount / vault.targetAmount) * 100 : 0;
            const now = new Date();
            const deadlineDate = vault.deadline ? vault.deadline.toDate() : new Date();
            const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
            const isOverdue = daysRemaining < 0;
            
            // Calculate monthly target if deadline exists
            const monthsRemaining = Math.max(1, daysRemaining / 30);
            const remainingAmount = vault.targetAmount - vault.currentAmount;
            const monthlyTarget = remainingAmount > 0 ? remainingAmount / monthsRemaining : 0;
            
            return {
                ...vault,
                progress: Math.min(progress, 100),
                daysRemaining,
                isOverdue,
                monthlyTarget,
                color: getVaultColor(vault.icon)
            };
        });
    };

    const getVaultColor = (icon: string): string => {
        const colorMap: {[key: string]: string} = {
            'shield-checkmark-outline': '#4CAF50',
            'airplane-outline': '#2196F3',
            'phone-portrait-outline': '#FF9800',
            'car-sport-outline': '#9C27B0',
            'hourglass-outline': '#607D8B',
            'home-outline': '#795548',
            'heart-outline': '#E91E63',
            'school-outline': '#3F51B5'
        };
        return colorMap[icon] || colors.primary;
    };

    // Data fetching with refresh capability
    const fetchData = async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) setRefreshing(true);
        if (!user) return;

        const accountsQuery = query(collection(db, 'accounts'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(accountsQuery, (snapshot) => {
            const fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
            setAccounts(fetchedAccounts);
            if (fetchedAccounts.length > 0 && !selectedAccount) {
                setSelectedAccount(fetchedAccounts[0]);
            }
            setLoading(false);
            if (showRefreshIndicator) setRefreshing(false);
        });

        return () => unsubscribe();
    };

    useEffect(() => {
        fetchData();
    }, [user, selectedAccount]);

    useEffect(() => {
        if (!selectedAccount) return;

        const vaultsQuery = query(collection(db, 'accounts', selectedAccount.id, 'vaults'));
        const unsubscribe = onSnapshot(vaultsQuery, (snapshot) => {
            const fetchedVaults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vault));
            const processedVaults = processVaultData(fetchedVaults);
            setVaults(processedVaults);
            
            // Animate progress bars
            processedVaults.forEach(vault => {
                if (!progressAnimations[vault.id]) {
                    progressAnimations[vault.id] = new Animated.Value(0);
                }
                
                Animated.timing(progressAnimations[vault.id], {
                    toValue: vault.progress,
                    duration: 1000,
                    useNativeDriver: false,
                }).start();
            });
        });

        return () => unsubscribe();
    }, [selectedAccount]);

    // Enhanced action handlers
    const handleDeleteVault = (vaultId: string, vaultName: string) => {
        if (!selectedAccount) return;
        Alert.alert(
            "Delete Savings Vault",
            `Are you sure you want to delete "${vaultName}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        const result = await deleteVault(selectedAccount.id, vaultId);
                        if (!result.success) {
                            Alert.alert("Error", "Failed to delete vault. Please try again.");
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

    const handleDepositToVault = (vault: Vault) => {
        setDepositingVault(vault);
        setDepositAmount('');
        setDepositModalVisible(true);
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
            setEditModalVisible(false);
            setEditingVault(null);
        } else {
            Alert.alert("Error", "Failed to update vault. Please try again.");
        }
    };

    const handleMakeDeposit = async () => {
        if (!depositingVault || !selectedAccount || !depositAmount) return;

        const amount = parseFloat(depositAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid deposit amount.");
            return;
        }

        const newCurrentAmount = depositingVault.currentAmount + amount;
        const updatedData = {
            ...depositingVault,
            currentAmount: newCurrentAmount,
        };

        const result = await updateVault(selectedAccount.id, depositingVault.id, updatedData);
        if (result.success) {
            Alert.alert("Success", `Successfully deposited $${amount.toLocaleString()} to ${depositingVault.name}!`);
            setDepositModalVisible(false);
            setDepositingVault(null);
            setDepositAmount('');
        } else {
            Alert.alert("Error", "Failed to make deposit. Please try again.");
        }
    };

    // Enhanced UI components
    const renderDeadlineStatus = (vault: VaultWithProgress) => {
        if (vault.isOverdue) {
            return (
                <View style={styles.statusBadge}>
                    <Ionicons name="warning" size={12} color={colors.danger} />
                    <Text style={[styles.statusText, styles.overdueStatus]}>Overdue</Text>
                </View>
            );
        }
        if (vault.daysRemaining <= 7) {
            return (
                <View style={styles.statusBadge}>
                    <Ionicons name="time" size={12} color={colors.warning} />
                    <Text style={[styles.statusText, styles.dueSoonStatus]}>Due Soon</Text>
                </View>
            );
        }
        return (
            <Text style={styles.deadlineText}>
                {vault.daysRemaining} days remaining
            </Text>
        );
    };

    const renderVaultCard = (vault: VaultWithProgress) => {
        const progressAnim = progressAnimations[vault.id] || new Animated.Value(0);
        
        return (
            <Animated.View 
                key={vault.id} 
                style={[styles.vaultCard, { opacity: fadeAnim }]}
            >
                <LinearGradient
                    colors={[vault.color + '20', vault.color + '10']}
                    style={styles.vaultGradient}
                >
                    <View style={styles.vaultHeader}>
                        <View style={styles.vaultIconContainer}>
                            <View style={[styles.vaultIconBg, { backgroundColor: vault.color + '30' }]}>
                                <Ionicons name={vault.icon as any} size={24} color={vault.color} />
                            </View>
                            <View style={styles.vaultTitleContainer}>
                                <Text style={styles.vaultName}>{vault.name}</Text>
                                <Text style={styles.vaultAmount}>
                                    ${vault.currentAmount.toLocaleString()} / ${vault.targetAmount.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.vaultActions}>
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => handleDepositToVault(vault)}
                            >
                                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => handleEditVault(vault)}
                            >
                                <Ionicons name="pencil-outline" size={20} color={colors.secondaryText} />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => handleDeleteVault(vault.id, vault.name)}
                            >
                                <Ionicons name="trash-outline" size={20} color={colors.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.progressSection}>
                        <View style={styles.progressBarContainer}>
                            <Animated.View 
                                style={[
                                    styles.progressBar, 
                                    { 
                                        backgroundColor: vault.color,
                                        width: progressAnim.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: ['0%', '100%'],
                                            extrapolate: 'clamp'
                                        })
                                    }
                                ]} 
                            />
                        </View>
                        <View style={styles.progressInfo}>
                            <Text style={styles.progressText}>{vault.progress.toFixed(1)}% complete</Text>
                            {renderDeadlineStatus(vault)}
                        </View>
                    </View>

                    {vault.monthlyTarget && vault.monthlyTarget > 0 && (
                        <View style={styles.monthlyTargetContainer}>
                            <AntDesign name="calendar" size={14} color={colors.secondaryText} />
                            <Text style={styles.monthlyTargetText}>
                                Monthly target: ${vault.monthlyTarget.toFixed(0)}
                            </Text>
                        </View>
                    )}
                </LinearGradient>
            </Animated.View>
        );
    };

    // Loading state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading your savings...</Text>
            </View>
        );
    }

    // Empty state for no accounts
    if (accounts.length === 0) {
        return (
            <View style={styles.container}>
                <Animated.View style={[styles.header, { transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.headerTitle}>Savings</Text>
                    <Text style={styles.headerSubtitle}>Build your financial future</Text>
                </Animated.View>
                <Animated.View style={[styles.emptyStateContainer, { opacity: fadeAnim }]}>
                    <MaterialCommunityIcons 
                        name="bank-outline" 
                        size={80} 
                        color={colors.secondaryText} 
                    />
                    <Text style={styles.emptyStateTitle}>No accounts linked yet</Text>
                    <Text style={styles.emptyStateDescription}>
                        Link your bank or mobile money account to start saving towards your goals
                    </Text>
                    <TouchableOpacity 
                        style={styles.primaryButton} 
                        onPress={() => router.push('/linkBank')}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.primaryButtonText}>Link an Account</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }
    
    // Main render
    return (
        <View style={styles.container}>
            <Animated.View style={[styles.header, { transform: [{ translateY: slideAnim }] }]}>
                <Text style={styles.headerTitle}>Savings</Text>
                <Text style={styles.headerSubtitle}>Your path to financial freedom</Text>
            </Animated.View>

            <ScrollView 
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchData(true)}
                        colors={[colors.primary]}
                    />
                }
            >
                {/* Account Selector */}
                <View style={styles.accountSelector}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {accounts.map(account => (
                            <TouchableOpacity
                                key={account.id}
                                style={[
                                    styles.accountButton, 
                                    selectedAccount?.id === account.id && styles.selectedAccountButton
                                ]}
                                onPress={() => setSelectedAccount(account)}
                            >
                                <View style={styles.accountButtonContent}>
                                    {imageErrors[account.id] ? (
                                        <MaterialCommunityIcons 
                                            name="bank" 
                                            size={20} 
                                            color={selectedAccount?.id === account.id ? '#fff' : colors.primary} 
                                        />
                                    ) : (
                                        <Image 
                                            source={{ uri: account.logoUrl }} 
                                            style={styles.accountLogo} 
                                            onError={() => setImageErrors(prev => ({...prev, [account.id]: true}))}
                                        />
                                    )}
                                    <Text style={[
                                        styles.accountButtonText, 
                                        selectedAccount?.id === account.id && styles.selectedAccountButtonText
                                    ]}>
                                        {account.institution}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity 
                            style={styles.addAccountButton} 
                            onPress={() => router.push('/linkBank')}
                        >
                            <Ionicons name="add" size={18} color={colors.primary} />
                            <Text style={styles.addAccountButtonText}>Add Account</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {selectedAccount && (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        {/* Account Balance Card */}
                        <LinearGradient
                            colors={[colors.primary, colors.primary + '90']}
                            style={styles.totalSavingsCard}
                        >
                            <View style={styles.balanceHeader}>
                                <Text style={styles.totalSavingsLabel}>{selectedAccount.accountName}</Text>
                                <Text style={styles.accountType}>{selectedAccount.accountType}</Text>
                            </View>
                            <Text style={styles.totalSavingsAmount}>
                                ${selectedAccount.balance.toLocaleString()}
                            </Text>
                            <View style={styles.balanceFooter}>
                                <AntDesign name="arrowup" size={12} color="#fff" />
                                <Text style={styles.balanceChange}>+2.5% this month</Text>
                            </View>
                        </LinearGradient>

                        {/* Savings Overview */}
                        <View style={styles.overviewSection}>
                            <Text style={styles.sectionTitle}>Savings Overview</Text>
                            <View style={styles.overviewCards}>
                                <View style={styles.overviewCard}>
                                    <AntDesign name="wallet" size={20} color={colors.primary} />
                                    <Text style={styles.overviewCardValue}>
                                        {vaults.length}
                                    </Text>
                                    <Text style={styles.overviewCardLabel}>Active Vaults</Text>
                                </View>
                                <View style={styles.overviewCard}>
                                    <AntDesign name="target" size={20} color={colors.success} />
                                    <Text style={styles.overviewCardValue}>
                                        ${vaults.reduce((sum, vault) => sum + vault.targetAmount, 0).toLocaleString()}
                                    </Text>
                                    <Text style={styles.overviewCardLabel}>Total Goals</Text>
                                </View>
                                <View style={styles.overviewCard}>
                                    <AntDesign name="checkcircle" size={20} color={colors.warning} />
                                    <Text style={styles.overviewCardValue}>
                                        {vaults.filter(v => v.progress >= 100).length}
                                    </Text>
                                    <Text style={styles.overviewCardLabel}>Completed</Text>
                                </View>
                            </View>
                        </View>

                        {/* Savings Vaults */}
                        <View style={styles.vaultsSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Savings Vaults</Text>
                                <TouchableOpacity
                                    style={styles.sortButton}
                                    onPress={() => {/* TODO: Add sorting functionality */}}
                                >
                                    <AntDesign name="sort-ascending" size={16} color={colors.secondaryText} />
                                </TouchableOpacity>
                            </View>
                            
                            {vaults.length > 0 ? (
                                vaults.map(renderVaultCard)
                            ) : (
                                <View style={styles.emptyVaultsContainer}>
                                    <MaterialCommunityIcons 
                                        name="safe" 
                                        size={60} 
                                        color={colors.secondaryText} 
                                    />
                                    <Text style={styles.emptyVaultsTitle}>No savings vaults yet</Text>
                                    <Text style={styles.emptyVaultsText}>
                                        Create your first savings vault to start building towards your financial goals
                                    </Text>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                )}
            </ScrollView>

            {/* Edit Vault Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isEditModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Vault</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.secondaryText} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Vault Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editedName}
                                    onChangeText={setEditedName}
                                    placeholder="Enter vault name"
                                    placeholderTextColor={colors.secondaryText}
                                />
                            </View>
                            
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Target Amount</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editedTargetAmount}
                                    onChangeText={setEditedTargetAmount}
                                    placeholder="Enter target amount"
                                    placeholderTextColor={colors.secondaryText}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                        
                        <View style={styles.modalFooter}>
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelButton]} 
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.button, styles.saveButton]} 
                                onPress={handleUpdateVault}
                            >
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Deposit Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isDepositModalVisible}
                onRequestClose={() => setDepositModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Make Deposit</Text>
                            <TouchableOpacity onPress={() => setDepositModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.secondaryText} />
                            </TouchableOpacity>
                        </View>
                        
                        {depositingVault && (
                            <View style={styles.modalBody}>
                                <View style={styles.vaultPreview}>
                                    <Ionicons 
                                        name={depositingVault.icon as any} 
                                        size={32} 
                                        color={colors.primary} 
                                    />
                                    <Text style={styles.vaultPreviewName}>{depositingVault.name}</Text>
                                    <Text style={styles.vaultPreviewAmount}>
                                        Current: ${depositingVault.currentAmount.toLocaleString()}
                                    </Text>
                                </View>
                                
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Deposit Amount</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={depositAmount}
                                        onChangeText={setDepositAmount}
                                        placeholder="Enter amount to deposit"
                                        placeholderTextColor={colors.secondaryText}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        )}
                        
                        <View style={styles.modalFooter}>
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelButton]} 
                                onPress={() => setDepositModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.button, styles.saveButton]} 
                                onPress={handleMakeDeposit}
                            >
                                <Text style={styles.saveButtonText}>Deposit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Floating Action Button */}
            {selectedAccount && (
                <Animated.View style={[styles.fabContainer, { opacity: fadeAnim }]}>
                    <TouchableOpacity 
                        style={styles.fab} 
                        onPress={() => router.push({ 
                            pathname: '/addVault', 
                            params: { accountId: selectedAccount?.id }
                        })}
                    >
                        <LinearGradient
                            colors={[colors.primary, colors.primary + '90']}
                            style={styles.fabGradient}
                        >
                            <Ionicons name="add" size={28} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
} 