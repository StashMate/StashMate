import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { getLogoutStyles } from '../styles/logout.styles';

export default function LogoutScreen() {
  const { colors } = useTheme();
  const styles = getLogoutStyles(colors);
  const router = useRouter();
  const { setUser } = useUser();

  const handleLogout = () => {
    setUser(null);
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
        <TouchableOpacity style={{flex: 1}} onPress={() => router.back()} />
        <View style={styles.modalContent}>
            <Text style={styles.title}>Are you sure you want to log out?</Text>
            <Text style={styles.description}>
                Logging out will end your current session. You'll need to log in again to access your account.
            </Text>
            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => router.back()}>
                <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
} 