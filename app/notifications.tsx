import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getNotificationsStyles } from '../styles/notifications.styles';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';
import { fetchNotifications, markNotificationAsRead, Notification } from '../services/notificationService';
import { useFocusEffect } from 'expo-router';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = getNotificationsStyles(colors);
  const router = useRouter();
  const { user } = useUser();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError("User not logged in.");
      return;
    }

    try {
      setLoading(true);
      // Fetch only unread notifications
      const fetchedNotifications = await fetchNotifications(user.uid, true);
      setNotifications(fetchedNotifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleNotificationPress = async (notificationId: string, notificationData?: any) => {
    if (user) {
      await markNotificationAsRead(notificationId, user.uid);
      // Optimistically remove the notification from the UI
      setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== notificationId));

      if (notificationData?.targetScreen) {
        if (notificationData.targetScreen === 'rewards') {
          router.push({
            pathname: '/rewards',
            params: { tab: notificationData.targetTab },
          });
        } else {
          router.push(`/(tabs)/${notificationData.targetScreen}`);
        }
      }
    }
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
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={loadNotifications}>
          <Feather name="refresh-cw" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {notifications.length === 0 ? (
          <Text style={styles.emptyStateText}>No new notifications.</Text>
        ) : (
          notifications.map(item => (
            <TouchableOpacity key={item.id} onPress={() => handleNotificationPress(item.id, item.data)}>
              <View style={styles.notificationItem}>
                <View style={styles.notificationTextContainer}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                </View>
                <View style={styles.unreadDot} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
