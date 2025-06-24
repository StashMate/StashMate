import { View, Text, SafeAreaView, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPreferencesStyles } from '../styles/preferences.styles';
import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export default function PreferencesScreen() {
  const router = useRouter();
  const { colors, theme, setTheme } = useTheme();
  const styles = getPreferencesStyles(colors);

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [syncData, setSyncData] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Preferences</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Appearance</Text>
                <View style={styles.row}>
                    <View style={styles.rowTextContainer}>
                        <Text style={styles.rowLabel}>Dark Mode</Text>
                        <Text style={styles.rowSubLabel}>{theme === 'dark' ? 'On' : 'Off'}</Text>
                    </View>
                    <Switch
                        value={theme === 'dark'}
                        onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        trackColor={{ false: '#767577', true: colors.primary }}
                        thumbColor={'#f4f3f4'}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <View style={styles.row}>
                    <View style={styles.rowTextContainer}>
                        <Text style={styles.rowLabel}>Push Notifications</Text>
                        <Text style={styles.rowSubLabel}>{pushNotifications ? 'On' : 'Off'}</Text>
                    </View>
                    <Switch value={pushNotifications} onValueChange={setPushNotifications} />
                </View>
                <View style={styles.row}>
                    <View style={styles.rowTextContainer}>
                        <Text style={styles.rowLabel}>Email Notifications</Text>
                        <Text style={styles.rowSubLabel}>{emailNotifications ? 'On' : 'Off'}</Text>
                    </View>
                    <Switch value={emailNotifications} onValueChange={setEmailNotifications} />
                </View>
            </View>
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Language</Text>
                <View style={styles.row}>
                     <View style={styles.rowTextContainer}>
                        <Text style={styles.rowLabel}>App Language</Text>
                        <Text style={styles.rowSubLabel}>English</Text>
                    </View>
                    <Text style={styles.rowValue}>English</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data</Text>
                <View style={styles.row}>
                    <View style={styles.rowTextContainer}>
                        <Text style={styles.rowLabel}>Sync Data</Text>
                        <Text style={styles.rowSubLabel}>{syncData ? 'On' : 'Off'}</Text>
                    </View>
                    <Switch value={syncData} onValueChange={setSyncData} />
                </View>
            </View>
        </ScrollView>
    </SafeAreaView>
  );
} 