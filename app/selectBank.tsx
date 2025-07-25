import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { fetchBanks } from '../firebase';
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
    const [loading, setLoading] = useState(true);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
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
    };

    const verifyAndLinkAccount = async () => {
        if (!selectedBank || !accountNumber || !user?.uid) {
            setVerificationError('Please select a bank and enter your account number');
            return;
        }
        
        setIsVerifying(true);
        setVerificationError('');
        
        try {
            // Call the linkAccountWithPaystack function from firebase.ts
            const result = await linkAccountWithPaystack(user.uid, {
                accountNumber,
                bankCode: selectedBank.code,
                bankName: selectedBank.name
            });
            
            if (result.success) {
                // Account linked successfully
                router.back();
            } else {
                // Account verification failed
                setVerificationError(result.error || 'Failed to verify account');
            }
        } catch (error) {
            console.error('Error linking account:', error);
            setVerificationError('An unexpected error occurred');
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
        </SafeAreaView>
    );
    // Add this to your render function after the bank list
    {selectedBank && (
        <View style={styles.verificationContainer}>
            <Text style={styles.selectedBankText}>Selected Bank: {selectedBank.name}</Text>
            <TextInput
                style={styles.accountInput}
                placeholder="Enter your account number"
                placeholderTextColor={colors.secondaryText}
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
            />
            {verificationError ? <Text style={styles.errorText}>{verificationError}</Text> : null}
            <TouchableOpacity 
                style={styles.verifyButton}
                onPress={verifyAndLinkAccount}
                disabled={isVerifying}
            >
                {isVerifying ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.verifyButtonText}>Verify & Link Account</Text>
                )}
            </TouchableOpacity>
        </View>
    )}
}