import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { linkAccount } from '../firebase';
import { getLinkBankStyles } from '../styles/linkBank.styles';

const popularBanks = [
    { name: 'Stanbic Bank', logoUrl: 'https://firebasestorage.googleapis.com/v0/b/stashmate-a4211.appspot.com/o/bank-logos%2Fstanbic.jpg?alt=media&token=e6b3e6e8-2b8a-4b0a-8b8a-1b0e6e8e6b3e' },
    { name: 'ABSA', logoUrl: 'https://firebasestorage.googleapis.com/v0/b/stashmate-a4211.appspot.com/o/bank-logos%2Fabsa.png?alt=media&token=e6b3e6e8-2b8a-4b0a-8b8a-1b0e6e8e6b3e' },
    { name: 'Zenith Bank', logoUrl: 'https://firebasestorage.googleapis.com/v0/b/stashmate-a4211.appspot.com/o/bank-logos%2Fzenith.jpg?alt=media&token=e6b3e6e8-2b8a-4b0a-8b8a-1b0e6e8e6b3e' },
    { name: 'EcoBank', logoUrl: 'https://firebasestorage.googleapis.com/v0/b/stashmate-a4211.appspot.com/o/bank-logos%2Fecobank.jpg?alt=media&token=e6b3e6e8-2b8a-4b0a-8b8a-1b0e6e8e6b3e' },
];

const mobileMoneyProviders = [
    { name: 'MTN Cash', logoUrl: 'https://firebasestorage.googleapis.com/v0/b/stashmate-a4211.appspot.com/o/bank-logos%2Fmtn.jpg?alt=media&token=e6b3e6e8-2b8a-4b0a-8b8a-1b0e6e8e6b3e' },
    { name: 'Telecel Cash', logoUrl: 'https://firebasestorage.googleapis.com/v0/b/stashmate-a4211.appspot.com/o/bank-logos%2Ftelecel.jpg?alt=media&token=e6b3e6e8-2b8a-4b0a-8b8a-1b0e6e8e6b3e' },
    { name: 'AirtelTigo Money', logoUrl: 'https://firebasestorage.googleapis.com/v0/b/stashmate-a4211.appspot.com/o/bank-logos%2Fairteltigo.webp?alt=media&token=e6b3e6e8-2b8a-4b0a-8b8a-1b0e6e8e6b3e' },
];

export default function LinkBankScreen() {
    const { colors } = useTheme();
    const styles = getLinkBankStyles(colors);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useUser();
    const [loading, setLoading] = useState<string | null>(null);

    const handleLinkAccount = async (institution: { name: string; logoUrl: string }, type: 'bank' | 'mobileMoney') => {
        if (!user) {
            Alert.alert("Error", "You must be logged in to link an account.");
            return;
        }
        setLoading(institution.name);

        const accountData = {
            accountName: `${institution.name} Account`,
            accountType: type,
            balance: Math.floor(Math.random() * (5000 - 500 + 1)) + 500, // Random balance between 500 and 5000
            institution: institution.name,
            logoUrl: institution.logoUrl,
        };

        const result = await linkAccount(user.uid, accountData);
        setLoading(null);

        if (result.success) {
            Alert.alert("Success", `${institution.name} has been linked successfully.`);
            router.back();
        } else {
            Alert.alert("Error", result.error || "Failed to link account.");
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top || 20 }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="x" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Link an Account</Text>
                <View style={styles.headerActionPlaceholder} />
            </View>
            <ScrollView>
                <Text style={styles.description}>
                    Select a bank or mobile money provider to link to your StashMate profile.
                </Text>

                <Text style={styles.sectionTitle}>Popular Banks</Text>
                <View style={styles.bankGrid}>
                    {popularBanks.map((bank) => (
                        <TouchableOpacity key={bank.name} style={styles.bankCard} onPress={() => handleLinkAccount(bank, 'bank')} disabled={!!loading}>
                            {loading === bank.name ? <ActivityIndicator /> : <Image source={{ uri: bank.logoUrl }} style={styles.bankLogo} />}
                            <Text style={styles.bankName}>{bank.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Mobile Money</Text>
                <View style={styles.bankGrid}>
                    {mobileMoneyProviders.map((provider) => (
                        <TouchableOpacity key={provider.name} style={styles.bankCard} onPress={() => handleLinkAccount(provider, 'mobileMoney')} disabled={!!loading}>
                            {loading === provider.name ? <ActivityIndicator /> : <Image source={{ uri: provider.logoUrl }} style={styles.bankLogo} />}
                            <Text style={styles.bankName}>{provider.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
} 