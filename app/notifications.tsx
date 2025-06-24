import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getNotificationsStyles } from '../styles/notifications.styles';
import { useRouter } from 'expo-router';

const notifications = [
  { id: 1, title: 'Goal Achieved!', message: 'You have successfully reached your goal for "Vacation in Hawaii".', read: false },
  { id: 2, title: 'New Vault Created', message: 'A new vault "New Gadgets" has been added to your savings.', read: false },
  { id: 3, title: 'Transaction Alert', message: 'A new expense of $65.20 has been recorded for "Fresh Foods Market".', read: true },
];

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = getNotificationsStyles(colors);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {notifications.map(item => (
          <View key={item.id} style={[styles.notificationItem, !item.read && styles.unreadItem]}>
            <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
} 