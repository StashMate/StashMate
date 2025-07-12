import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getLinkBankStyles } from '../styles/linkBank.styles';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const popularBanks = [
    { name: 'Stanbic Bank', image: require('../assets/images/BankAccountLogo/stanbic logo.jpg') },
    { name: 'ABSA', image: require('../assets/images/BankAccountLogo/absa logo.png') },
    { name: 'Zenith Bank', image: require('../assets/images/BankAccountLogo/zenith logo.jpg') },
    { name: 'EcoBank', image: require('../assets/images/BankAccountLogo/ecobank logo.jpg') },
];

const mobileMoneyProviders = [
    { name: 'MTN Cash', image: require('../assets/images/MobileMoneyLogo/mtn-logo.jpg') },
            { name: 'Telecel Cash', image: require('../assets/images/MobileMoneyLogo/telecel-logo.jpg') },
    { name: 'AirtelTigo Money', image: require('../assets/images/MobileMoneyLogo/airteltigo-logo.webp') },
];

export default function LinkBankScreen() {
  const { colors } = useTheme();
  const styles = getLinkBankStyles(colors);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top || 20 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Link your bank</Text>
        <View style={styles.headerActionPlaceholder} />
      </View>
      <ScrollView>
        <Text style={styles.description}>
          Link your bank account to StashMate to track your spending and savings automatically. Your data is encrypted and secure.
        </Text>

        <Text style={styles.sectionTitle}>Popular Banks</Text>
        <View style={styles.bankGrid}>
          {popularBanks.map((bank) => (
            <TouchableOpacity key={bank.name} style={styles.bankCard}>
              <Image source={bank.image} style={styles.bankLogo} />
              <Text style={styles.bankName}>{bank.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Mobile Money</Text>
        <View style={styles.bankGrid}>
            {mobileMoneyProviders.map((provider) => (
                <TouchableOpacity key={provider.name} style={styles.bankCard}>
                    <Image source={provider.image} style={styles.bankLogo} />
                    <Text style={styles.bankName}>{provider.name}</Text>
                </TouchableOpacity>
            ))}
        </View>

        <Text style={styles.sectionTitle}>Other Banks</Text>
        <TouchableOpacity style={styles.manualEntryCard}>
            <Text style={styles.manualEntryText}>Manually enter bank details</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
} 