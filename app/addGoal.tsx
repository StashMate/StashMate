import { View, Text, TextInput, TouchableOpacity, Image, Platform, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getAddGoalStyles } from '../styles/addGoal.styles';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function AddGoalScreen() {
    const { colors } = useTheme();
    const styles = getAddGoalStyles(colors);
    const router = useRouter();

    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [deadline, setDeadline] = useState('');
    const [image, setImage] = useState<string | null>(null);

    const handleChoosePhoto = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
                return;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        const newGoal = {
            name: name || 'New Goal',
            icon: 'star-outline', // Default icon
            current: 0,
            target: parseFloat(target) || 0,
            deadline: deadline || new Date().toISOString().split('T')[0],
            image: image || 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        };

        router.replace({
            pathname: '/(tabs)/goals',
            params: { newGoal: JSON.stringify(newGoal) },
        });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close-outline" size={32} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Goal</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <TouchableOpacity style={styles.imagePicker} onPress={handleChoosePhoto}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.imagePreview} />
                    ) : (
                        <>
                            <Ionicons name="camera-outline" size={40} color={colors.primary} />
                            <Text style={styles.imagePickerText}>Add Cover Photo</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.label}>Goal Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., European Adventure"
                    placeholderTextColor={colors.secondaryText}
                />

                <Text style={styles.label}>Target Amount</Text>
                <TextInput
                    style={styles.input}
                    value={target}
                    onChangeText={setTarget}
                    placeholder="$5,000"
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Deadline</Text>
                <TextInput
                    style={styles.input}
                    value={deadline}
                    onChangeText={setDeadline}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.secondaryText}
                />
            </View>
        </ScrollView>
    );
} 