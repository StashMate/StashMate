import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { updateUserProfile, uploadImageAndGetURL } from '../firebase';
import { getEditProfileStyles } from '../styles/editProfile.styles'; // Assuming a new style file

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const styles = getEditProfileStyles(colors);
  const router = useRouter();
  const { user, setUser } = useUser();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || ''); // Email is usually read-only or requires re-auth
  const [bio, setBio] = useState(user?.bio || '');
  const [image, setImage] = useState<string | null>(user?.photoURL || null);
  const [loading, setLoading] = useState(false);

  const handleChoosePhoto = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
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
        displayName,
        email, // Note: Changing email usually requires re-authentication in Firebase
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
          <Ionicons name="close-outline" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 28 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Picture Section */}
        <TouchableOpacity style={styles.profileImageContainer} onPress={handleChoosePhoto}>
          <Image source={{ uri: image || 'https://i.pravatar.cc/150' }} style={styles.profileImage} />
          <View style={styles.changePhotoButton}>
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
            <Text style={styles.changePhotoButtonText}>Change Photo</Text>
          </View>
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your Name"
            placeholderTextColor={colors.secondaryText}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@example.com"
            placeholderTextColor={colors.secondaryText}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false} // Email changes often require re-authentication
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]} // Apply bio-specific styles
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            placeholderTextColor={colors.secondaryText}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}