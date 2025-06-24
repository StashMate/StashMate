import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getAddVaultStyles } from '../styles/addVault.styles';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function AddVaultScreen() {
    const { colors } = useTheme();
    const styles = getAddVaultStyles(colors);
    const router = useRouter();

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    const handleSave = () => {
        const newVault = {
            name: name || 'New Vault',
            icon: 'wallet-outline', // Default icon
            amount: parseFloat(amount) || 0,
        };

        router.replace({
            pathname: '/(tabs)/savings',
            params: { newVault: JSON.stringify(newVault) },
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close-outline" size={32} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Vault</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
                <Text style={styles.label}>Vault Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., Emergency Fund"
                    placeholderTextColor={colors.secondaryText}
                />

                <Text style={styles.label}>Initial Amount</Text>
                <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="$1,000"
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="numeric"
                />
            </ScrollView>
        </View>
    );
} 