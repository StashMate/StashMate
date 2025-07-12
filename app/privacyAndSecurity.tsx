import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getPrivacyAndSecurityStyles } from '../styles/privacyAndSecurity.styles';
import { useRouter, Stack } from 'expo-router';

const privacyOptions = [
    {
        icon: 'shield-check-outline',
        title: 'Privacy Settings',
        description: 'Control how your data is used and shared',
        onPress: () => {},
    },
];

const securityOptions = [
    {
        icon: 'key-variant',
        title: 'Update Password',
        description: 'Change your current password',
        onPress: () => {},
    },
    {
        icon: 'two-factor-authentication',
        title: 'Two-Factor Authentication',
        description: 'Add an extra layer of security to your account',
        onPress: () => {},
    },
    {
        icon: 'information-outline',
        title: 'Security Information',
        description: 'Learn about our security measures',
        onPress: () => {},
    },
];

export default function PrivacyAndSecurityScreen() {
  const { colors } = useTheme();
  const styles = getPrivacyAndSecurityStyles(colors);
  const router = useRouter();

  const MenuItem = ({ icon, title, description, onPress }: { icon: string, title: string, description: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIcon}>
            <MaterialCommunityIcons name={icon as any} size={24} color={colors.primary} />
        </View>
        <View style={styles.menuTextContainer}>
            <Text style={styles.menuItemTitle}>{title}</Text>
            <Text style={styles.menuItemDescription}>{description}</Text>
        </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        {privacyOptions.map((item, index) => (
            <MenuItem key={index} {...item} />
        ))}
        
        <Text style={styles.sectionTitle}>Security</Text>
        {securityOptions.map((item, index) => (
            <MenuItem key={index} {...item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
} 