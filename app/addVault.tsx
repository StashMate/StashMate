import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSavings } from '../context/SavingsContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { addVault as addVaultToFirebase } from '../firebase';
import { checkAndAwardBadges } from '../services/gamificationService';
import { getAddVaultStyles } from '../styles/addVault.styles';

export default function AddVaultScreen() {
    const { colors } = useTheme();
    const styles = getAddVaultStyles(colors);
    const router = useRouter();
    const { accountId } = useLocalSearchParams();
    const { user } = useUser();
    const { addVault: addVaultToContext, refetch } = useSavings();

    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('wallet-outline');
    const [deadline, setDeadline] = useState<Date | undefined>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);


    const handleSave = async () => {
        if (!name.trim() || !targetAmount.trim() || !deadline) {
            Alert.alert('Missing Information', 'Please fill out all fields, including the deadline.');
            return;
        }

        if (typeof accountId !== 'string') {
            Alert.alert('Error', 'No account selected.');
            return;
        }

        const vaultData = {
            name,
            targetAmount: parseFloat(targetAmount),
            icon: selectedIcon,
            deadline,
        };

        console.log("Vault Data being sent:", vaultData);
        const result = await addVaultToFirebase(accountId, vaultData);
        if (result.success && result.vaultId) {
            const newVault = {
                id: result.vaultId,
                ...vaultData,
                currentAmount: 0, // Assuming new vaults start with 0
            };
            addVaultToContext(newVault);
            Alert.alert('Success', 'Vault created successfully!');
            if(user) {
                checkAndAwardBadges(user.uid);
            }
            router.back();
        } else {
            Alert.alert('Error', result.error || 'Failed to create vault.');
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || deadline;
        setShowDatePicker(Platform.OS === 'ios');
        setDeadline(currentDate);
    };

    const icons = [
        'wallet-outline', 'card-outline', 'home-outline', 'car-sport-outline', 
        'airplane-outline', 'school-outline', 'heart-outline', 'star-outline',
        'game-controller-outline', 'headset-outline', 'musical-notes-outline', 'book-outline',
        'gift-outline', 'construct-outline', 'medkit-outline', 'phone-portrait-outline',
        'laptop-outline', 'watch-outline', 'camera-outline', 'videocam-outline',
        'bicycle-outline', 'train-outline', 'boat-outline', 'restaurant-outline'
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close-circle" size={28} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Savings Goal</Text>
            </View>
            <ScrollView>
                <View style={styles.form}>
                    <Text style={styles.label}>Savings Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Emergency Fund"
                        value={name}
                        onChangeText={setName}
                    />
                    <Text style={styles.label}>Target Amount</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="1000"
                        value={targetAmount}
                        onChangeText={setTargetAmount}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Deadline</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                        <Text style={{color: colors.text}}>{deadline ? deadline.toLocaleDateString() : 'Select a date'}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={deadline || new Date()}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    )}

                    <Text style={styles.label}>Choose an Icon</Text>
                    <View style={styles.iconSelector}>
                        {icons.map(icon => (
                            <TouchableOpacity 
                                key={icon} 
                                style={[styles.iconButton, selectedIcon === icon && styles.selectedIconButton]}
                                onPress={() => setSelectedIcon(icon)}
                            >
                                <Ionicons name={icon as any} size={28} color={selectedIcon === icon ? '#fff' : colors.primary} />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save Vault</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}