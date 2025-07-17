import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { addVault } from '../firebase';
import { getAddVaultStyles } from '../styles/addVault.styles';

export default function AddVaultScreen() {
    const { colors } = useTheme();
    const styles = getAddVaultStyles(colors);
    const router = useRouter();
    const { accountId } = useLocalSearchParams();

    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('wallet-outline');
    const [deadline, setDeadline] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Default to 30 days from now
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSave = async () => {
        if (!name.trim() || !targetAmount.trim()) {
            Alert.alert('Missing Information', 'Please fill out all required fields.');
            return;
        }

        if (parseFloat(targetAmount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid target amount greater than 0.');
            return;
        }

        if (typeof accountId !== 'string') {
            Alert.alert('Error', 'No account selected.');
            return;
        }

        const vaultData = {
            name: name.trim(),
            targetAmount: parseFloat(targetAmount),
            icon: selectedIcon,
            deadline,
        };

        const result = await addVault(accountId, vaultData);
        if (result.success) {
            Alert.alert('Success', 'Vault created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            Alert.alert('Error', result.error || 'Failed to create vault.');
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || deadline;
        setShowDatePicker(Platform.OS === 'ios');
        setDeadline(currentDate);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysUntilDeadline = (date: Date) => {
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const icons = [
        { name: 'wallet-outline', label: 'Wallet' },
        { name: 'card-outline', label: 'Card' },
        { name: 'home-outline', label: 'Home' },
        { name: 'car-sport-outline', label: 'Car' },
        { name: 'airplane-outline', label: 'Travel' },
        { name: 'school-outline', label: 'Education' },
        { name: 'heart-outline', label: 'Health' },
        { name: 'star-outline', label: 'Goal' },
        { name: 'game-controller-outline', label: 'Gaming' },
        { name: 'headset-outline', label: 'Music' },
        { name: 'musical-notes-outline', label: 'Audio' },
        { name: 'book-outline', label: 'Books' },
        { name: 'gift-outline', label: 'Gift' },
        { name: 'construct-outline', label: 'Tools' },
        { name: 'medkit-outline', label: 'Medical' },
        { name: 'phone-portrait-outline', label: 'Phone' },
        { name: 'laptop-outline', label: 'Laptop' },
        { name: 'watch-outline', label: 'Watch' },
        { name: 'camera-outline', label: 'Camera' },
        { name: 'videocam-outline', label: 'Video' },
        { name: 'bicycle-outline', label: 'Bike' },
        { name: 'train-outline', label: 'Train' },
        { name: 'boat-outline', label: 'Boat' },
        { name: 'restaurant-outline', label: 'Food' }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create New Vault</Text>
                <View style={{ width: 28 }} />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    <View style={styles.sectionCard}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                <Ionicons name="create-outline" size={18} color={colors.primary} /> Vault Name
                            </Text>
                            <View style={styles.inputWithIcon}>
                                <Ionicons name="bookmark-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g., Emergency Fund, Vacation"
                                    placeholderTextColor={colors.secondaryText}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                <Ionicons name="cash-outline" size={18} color={colors.primary} /> Target Amount
                            </Text>
                            <View style={styles.inputWithIcon}>
                                <Ionicons name="logo-usd" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="1000"
                                    placeholderTextColor={colors.secondaryText}
                                    value={targetAmount}
                                    onChangeText={setTargetAmount}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                <Ionicons name="calendar-outline" size={18} color={colors.primary} /> Deadline
                            </Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="time-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.dateText}>{formatDate(deadline)}</Text>
                                        <Text style={[styles.placeholderText, { fontSize: 12, marginTop: 2 }]}>
                                            {getDaysUntilDeadline(deadline)} days remaining
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.iconSelectorContainer}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="color-palette-outline" size={20} color={colors.primary} /> Choose an Icon
                        </Text>
                        <View style={styles.iconSelector}>
                            {icons.map(icon => (
                                <TouchableOpacity 
                                    key={icon.name} 
                                    style={[styles.iconButton, selectedIcon === icon.name && styles.selectedIconButton]}
                                    onPress={() => setSelectedIcon(icon.name)}
                                >
                                    <Ionicons 
                                        name={icon.name as any} 
                                        size={28} 
                                        color={selectedIcon === icon.name ? '#fff' : colors.primary} 
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.saveButtonText}>Create Vault</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={deadline}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    minimumDate={new Date()}
                />
            )}
        </SafeAreaView>
    );
} 