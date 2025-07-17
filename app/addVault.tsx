import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

        const result = await addVault(accountId, vaultData);
        if (result.success) {
            Alert.alert('Success', 'Vault created successfully!');
            router.back();
        } else {
            Alert.alert('Error', result.error || 'Failed to create vault.');
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || deadline;
        setShowDatePicker(false);
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
                <Text style={styles.headerTitle}>Create New Vault</Text>
            </View>
            <ScrollView>
                <View style={styles.form}>
                    <Text style={styles.label}>Vault Name</Text>
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
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                        <Text style={styles.dateText}>{deadline ? deadline.toLocaleDateString() : 'Select a date'}</Text>
                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>

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

            {/* Date Picker Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showDatePicker}
                onRequestClose={() => setShowDatePicker(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Deadline</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={deadline || new Date()}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                            minimumDate={new Date()}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
} 