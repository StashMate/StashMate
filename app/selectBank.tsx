import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { fetchBanks, linkAccount } from '../firebase';
import { getSelectBankStyles } from '../styles/selectBank.styles';

type Bank = {
    id: string;
    name: string;
    code: string;
    logo?: string;
};

export default function SelectBankScreen() {
    const { colors } = useTheme();
    const styles = getSelectBankStyles(colors);
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal states
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    
    // Form states
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState('');

    useEffect(() => {
        const loadBanks = async () => {
            try {
                const result = await fetchBanks();
                if (result.success && result.data) {
                    setBanks(result.data);
                    setFilteredBanks(result.data);
                }
            } catch (error) {
                console.error('Error loading banks:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBanks();
    }, []);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text) {
            const filtered = banks.filter(bank => 
                bank.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredBanks(filtered);
        } else {
            setFilteredBanks(banks);
        }
    };

    const selectBank = (bank: Bank) => {
        setSelectedBank(bank);
        setModalVisible(true);
    };

    const handleLinkAccount = async () => {
        if (!selectedBank || !accountNumber || !accountName || !user?.uid) {
            setVerificationError('Please enter both account number and account name');
            return;
        }
        
        setIsVerifying(true);
        setVerificationError('');
        
        try {
            // Link the account
            await linkAccount(user.uid, {
                accountName: accountName,
                accountNumber: accountNumber,
                accountType: 'bank',
                balance: 0,
                institution: selectedBank.name,
                logoUrl: '',
            });
            
            // Reset form and close modal
            setAccountNumber('');
            setAccountName('');
            setModalVisible(false);
            
            // Navigate back to the link bank screen
            router.back();
        } catch (error) {
            console.error('Error linking account:', error);
            setVerificationError('Failed to link account. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Select Bank</Text>
            </View>

            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for your bank"
                    placeholderTextColor={colors.secondaryText}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={filteredBanks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.bankItem} 
                            onPress={() => selectBank(item)}
                        >
                            <Text style={styles.bankName}>{item.name}</Text>
                            <Feather name="chevron-right" size={20} color={colors.secondaryText} />
                        </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    contentContainerStyle={styles.listContent}
                />
            )}
            
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
                        <Text style={styles.modalTitle}>Enter Bank Details</Text>
                        
                        {selectedBank && (
                            <View style={styles.selectedProviderContainer}>
                                <View style={styles.bankLogoPlaceholder}>
                                    <Feather name="credit-card" size={24} color={colors.primary} />
                                </View>
                                <Text style={styles.selectedProviderName}>{selectedBank.name}</Text>
                            </View>
                        )}
                        
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
                        
                        {verificationError ? <Text style={styles.errorText}>{verificationError}</Text> : null}
                        
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
                                disabled={isVerifying}
                            >
                                {isVerifying ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Link Account</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}