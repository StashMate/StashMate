import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { deleteDoc, doc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSavings } from '../context/SavingsContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { db, linkAccount } from '../firebase';
import { getLinkBankStyles } from '../styles/linkBank.styles';

type AccountType = 'bank' | 'mobileMoney';

export default function LinkBankScreen() {
    const { colors } = useTheme();
    const styles = getLinkBankStyles(colors);
    const router = useRouter();
    const { user } = useUser();
    const { accounts, refetch } = useSavings();
    const [activeTab, setActiveTab] = useState<AccountType>('bank');
    
    // Modal states
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<any>(null);
    
    // Form states
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Bank logos
    const bankLogos = [
        { id: '1', name: 'Absa Bank', logo: require('../assets/images/BankAccountLogo/absa logo.png') },
        { id: '2', name: 'Ecobank', logo: require('../assets/images/BankAccountLogo/ecobank logo.jpg') },
        { id: '3', name: 'Stanbic Bank', logo: require('../assets/images/BankAccountLogo/stanbic logo.jpg') },
        { id: '4', name: 'Zenith Bank', logo: require('../assets/images/BankAccountLogo/zenith logo.jpg') },
    ];
    
    // Mobile Money logos
    const mobileMoneyLogos = [
        { id: '1', name: 'MTN Mobile Money', logo: require('../assets/images/MobileMoneyLogo/mtn-logo.jpg') },
        { id: '2', name: 'AirtelTigo Money', logo: require('../assets/images/MobileMoneyLogo/airteltigo-logo.webp') },
        { id: '3', name: 'Telecel Cash', logo: require('../assets/images/MobileMoneyLogo/telecel-logo.jpg') },
    ];
    
    const handleSelectBank = (bank: any) => {
        setSelectedProvider(bank);
        setModalVisible(true);
    };
    
    const handleManualEntry = () => {
        // Navigate to selectBank screen for manual selection
        router.push('/selectBank');
    };
    
    const handleSelectMobileMoney = (provider: any) => {
        setSelectedProvider(provider);
        setModalVisible(true);
    };
    
    const handleLinkAccount = async () => {
        if (!user?.uid) return;
        
        if (activeTab === 'bank' && (!accountNumber || !accountName)) {
            Alert.alert('Missing Information', 'Please enter both account number and account name');
            return;
        }
        
        if (activeTab === 'mobileMoney' && !phoneNumber) {
            Alert.alert('Missing Information', 'Please enter your mobile number');
            return;
        }
        
        try {
            // Link the account
            await linkAccount(user.uid, {
                accountName: activeTab === 'bank' ? accountName : selectedProvider.name,
                accountNumber: activeTab === 'bank' ? accountNumber : phoneNumber,
                accountType: activeTab,
                balance: 0,
                institution: selectedProvider.name,
                logoUrl: '',
            });
            
            // Reset form
            setAccountNumber('');
            setAccountName('');
            setPhoneNumber('');
            setModalVisible(false);
            refetch();
            
            Alert.alert('Success', `Your ${activeTab === 'bank' ? 'bank account' : 'mobile money'} has been linked successfully`);
        } catch (error) {
            Alert.alert('Error', 'Failed to link account. Please try again.');
        }
    };
    
    const handleUnlinkAccount = async (accountId: string) => {
        Alert.alert(
            'Unlink Account',
            'Are you sure you want to unlink this account? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Unlink',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Delete the account document from Firestore
                            await deleteDoc(doc(db, 'accounts', accountId));
                            refetch();
                            Alert.alert('Success', 'Account has been unlinked successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to unlink account. Please try again.');
                        }
                    },
                },
            ]
        );
    };
    
    // Filter accounts based on active tab
    const filteredAccounts = accounts.filter(account => 
        activeTab === 'bank' 
            ? account.institution !== 'MTN Mobile Money' && 
              account.institution !== 'AirtelTigo Money' && 
              account.institution !== 'Telecel Cash'
            : account.institution === 'MTN Mobile Money' || 
              account.institution === 'AirtelTigo Money' || 
              account.institution === 'Telecel Cash'
    );
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="x" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Link Account</Text>
                <View style={styles.headerActionPlaceholder} />
            </View>
            
            <Text style={styles.description}>
                Connect your bank account or mobile money to automatically sync your transactions
            </Text>
            
            {/* Tab selector */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'bank' && styles.activeTab]}
                    onPress={() => setActiveTab('bank')}
                >
                    <Text style={[styles.tabText, activeTab === 'bank' && styles.activeTabText]}>
                        Bank Account
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'mobileMoney' && styles.activeTab]}
                    onPress={() => setActiveTab('mobileMoney')}
                >
                    <Text style={[styles.tabText, activeTab === 'mobileMoney' && styles.activeTabText]}>
                        Mobile Money
                    </Text>
                </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Linked Accounts Section */}
                {filteredAccounts.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Your Linked Accounts</Text>
                        <View style={styles.linkedAccountsContainer}>
                            {filteredAccounts.map((account) => (
                                <View key={account.id} style={styles.linkedAccountCard}>
                                    <View style={styles.linkedAccountInfo}>
                                        <View style={styles.accountLogoContainer}>
                                            {account.logoUrl ? (
                                                <Image 
                                                    source={{ uri: account.logoUrl }} 
                                                    style={styles.accountLogo} 
                                                />
                                            ) : (
                                                <View style={styles.accountLogoPlaceholder}>
                                                    <Feather name="credit-card" size={24} color={colors.primary} />
                                                </View>
                                            )}
                                        </View>
                                        <View>
                                            <Text style={styles.accountName}>{account.accountName}</Text>
                                            <Text style={styles.institutionName}>{account.institution}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.accountActions}>
                                        <Text style={styles.accountBalance}>
                                            ${account.balance.toFixed(2)}
                                        </Text>
                                        <TouchableOpacity 
                                            style={styles.unlinkButton}
                                            onPress={() => handleUnlinkAccount(account.id)}
                                        >
                                            <Feather name="trash-2" size={18} color={colors.danger} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}
                
                {activeTab === 'bank' ? (
                    <>
                        <Text style={styles.sectionTitle}>Select Your Bank</Text>
                        <View style={styles.bankGrid}>
                            {bankLogos.map((bank) => (
                                <TouchableOpacity 
                                    key={bank.id} 
                                    style={styles.bankCard}
                                    onPress={() => handleSelectBank(bank)}
                                >
                                    <View style={styles.bankLogo}>
                                        <Image 
                                            source={bank.logo} 
                                            style={{ width: 80, height: 50, resizeMode: 'contain' }} 
                                        />
                                    </View>
                                    <Text style={styles.bankName}>{bank.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.manualEntryButton}
                            onPress={handleManualEntry}
                        >
                            <View style={styles.manualEntryContent}>
                                <Feather name="search" size={20} color={colors.primary} style={styles.manualEntryIcon} />
                                <Text style={styles.manualEntryText}>I don't see my bank</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Select Mobile Money Provider</Text>
                        <View style={styles.bankGrid}>
                            {mobileMoneyLogos.map((provider) => (
                                <TouchableOpacity 
                                    key={provider.id} 
                                    style={styles.bankCard}
                                    onPress={() => handleSelectMobileMoney(provider)}
                                >
                                    <View style={styles.bankLogo}>
                                        <Image 
                                            source={provider.logo} 
                                            style={{ width: 80, height: 50, resizeMode: 'contain' }} 
                                        />
                                    </View>
                                    <Text style={styles.bankName}>{provider.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
            
            {/* Account Details Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {activeTab === 'bank' ? 'Enter Bank Details' : 'Enter Mobile Money Details'}
                        </Text>
                        
                        {selectedProvider && (
                            <View style={styles.selectedProviderContainer}>
                                <Image 
                                    source={selectedProvider.logo} 
                                    style={styles.selectedProviderLogo} 
                                />
                                <Text style={styles.selectedProviderName}>{selectedProvider.name}</Text>
                            </View>
                        )}
                        
                        {activeTab === 'bank' ? (
                            <>
                                <View style={styles.formContainer}>
                                    <Text style={styles.label}>Account Number</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your account number"
                                        placeholderTextColor={colors.secondaryText}
                                        value={accountNumber}
                                        onChangeText={setAccountNumber}
                                        keyboardType="number-pad"
                                    />
                                </View>
                                
                                <View style={styles.formContainer}>
                                    <Text style={styles.label}>Account Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter account name"
                                        placeholderTextColor={colors.secondaryText}
                                        value={accountName}
                                        onChangeText={setAccountName}
                                    />
                                </View>
                            </>
                        ) : (
                            <View style={styles.formContainer}>
                                <Text style={styles.label}>Mobile Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your mobile number"
                                    placeholderTextColor={colors.secondaryText}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        )}
                        
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelButton]} 
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.button, styles.saveButton]} 
                                onPress={handleLinkAccount}
                            >
                                <Text style={styles.buttonText}>Link Account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}