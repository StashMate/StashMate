import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { linkAccount } from '../firebase';
import { getLinkBankStyles } from '../styles/linkBank.styles';

type AccountType = 'bank' | 'mobileMoney';

export default function LinkBankScreen() {
    const { colors } = useTheme();
    const styles = getLinkBankStyles(colors);
    const router = useRouter();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<AccountType>('bank');
    const [accountNumber, setAccountNumber] = useState('');
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
        // Navigate to bank details screen with the selected bank
        router.push({
            pathname: '/selectBank',
            params: { selectedBank: bank.name, bankId: bank.id }
        });
    };
    
    const handleManualEntry = () => {
        // Navigate to selectBank screen for manual selection
        router.push('/selectBank');
    };
    
    const handleSelectMobileMoney = (provider: any) => {
        // Handle mobile money selection
        if (!user?.uid) return;
        
        // Link the mobile money account
        linkAccount(user.uid, {
            accountName: provider.name,
            accountType: 'mobileMoney',
            balance: 0,
            institution: provider.name,
            logoUrl: '',
        }).then(() => {
            router.back();
        });
    };
    
   
    
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
                            style={styles.manualEntryCard}
                            onPress={handleManualEntry}
                        >
                            <Text style={styles.manualEntryText}>I don't see my bank</Text>
                            <Feather name="chevron-right" size={20} color={colors.secondaryText} />
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
                        
                        {activeTab === 'mobileMoney' && (
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
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}