import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getLogoutStyles } from '../styles/logout.styles';
import { useRouter } from 'expo-router';

export default function LogoutScreen() {
  const { colors } = useTheme();
  const styles = getLogoutStyles(colors);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
        <TouchableOpacity style={{flex: 1}} onPress={() => router.back()} />
        <View style={styles.modalContent}>
            <Text style={styles.title}>Are you sure you want to log out?</Text>
            <Text style={styles.description}>
                Logging out will end your current session. You'll need to log in again to access your account.
            </Text>
            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={() => router.replace('/auth')}>
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => router.back()}>
                <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
} 