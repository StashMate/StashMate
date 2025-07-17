import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { updateUserProfile, uploadImageAndGetURL } from '../firebase';
import { getProfileStyles } from '../styles/profile.styles';

export default function EditProfileScreen() {
    const { colors } = useTheme();
    const styles = getProfileStyles(colors);
    const router = useRouter();
    const { user, setUser } = useUser();
    const [bio, setBio] = useState(user?.bio || '');
    const [image, setImage] = useState<string | null>(user?.photoURL || null);
    const [loading, setLoading] = useState(false);

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
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        setLoading(true);

        try {
            let photoURL = user?.photoURL;
            if (image && image !== user?.photoURL) {
                photoURL = await uploadImageAndGetURL(image, user.uid);
            }

            const updatedData = {
                bio,
                photoURL,
            };

            const result = await updateUserProfile(user.uid, updatedData);

            if (result.success) {
                setUser({ ...user, ...updatedData });
                Alert.alert("Success", "Your profile has been updated.");
                router.back();
            } else {
                Alert.alert("Error", result.error || "Failed to update profile.");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>
            <View style={styles.content}>
                <TouchableOpacity style={styles.profileImageContainer} onPress={handleChoosePhoto}>
                    <Image source={{ uri: image || 'https://i.pravatar.cc/150' }} style={styles.profileImage} />
                    <View style={styles.editImageOverlay}>
                        <Ionicons name="camera-outline" size={24} color="#fff" />
                    </View>
                </TouchableOpacity>

                <Text style={styles.label}>Bio</Text>
                <TextInput
                    style={[styles.input, { height: 100 }]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell us about yourself"
                    placeholderTextColor={colors.secondaryText}
                    multiline
                />

                <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
} 