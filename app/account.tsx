import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getAccountStyles } from '../styles/account.styles';

export default function AccountScreen() {
  const { colors } = useTheme();
  const styles = getAccountStyles(colors);
  const router = useRouter();

  const menuItems = [
    { icon: 'mail-outline', text: 'Change Email', screen: 'change-email' },
    { icon: 'lock-closed-outline', text: 'Change Password', screen: 'change-password' },
    { icon: 'help-circle-outline', text: 'Help & Support', screen: 'help' },
    { icon: 'trash-outline', text: 'Delete Account', screen: 'delete-account' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account Settings</Text>
      </View>
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={() => router.push(`/${item.screen}`)}>
            <Ionicons name={item.icon} size={24} color={colors.primary} />
            <Text style={styles.menuItemText}>{item.text}</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.secondaryText} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}