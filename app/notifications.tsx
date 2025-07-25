import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getNotificationsStyles } from '../styles/notifications.styles';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';
import { fetchNotifications, markNotificationAsRead, Notification } from '../services/notificationService';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = getNotificationsStyles(colors);
  const router = useRouter();
  const { user } = useUser();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("User not logged in.");
      return;
    }

    const loadNotifications = async () => {
      try {
        setLoading(true);
        const fetchedNotifications = await fetchNotifications(user.uid);
        setNotifications(fetchedNotifications);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  const handleNotificationPress = async (notificationId: string) => {
    if (user) {
      await markNotificationAsRead(notificationId, user.uid);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    }
    // Optionally navigate or show details based on notification type
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, justifyContent: 'center' }} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: colors.danger, textAlign: 'center', marginTop: 20 }}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {notifications.length === 0 ? (
          <Text style={styles.emptyStateText}>No new notifications.</Text>
        ) : (
          notifications.map(item => (
            <TouchableOpacity key={item.id} onPress={() => handleNotificationPress(item.id)}>
              <View style={[styles.notificationItem, !item.read && styles.unreadItem]}>
                <View style={styles.notificationTextContainer}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 