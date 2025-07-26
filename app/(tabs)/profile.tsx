import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { ComponentProps } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { getProfileStyles } from '../../styles/profile.styles';

type IconName = ComponentProps<typeof Ionicons>['name'];

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getProfileStyles(colors);
  const { user } = useUser();

  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.substring(0, 2).toUpperCase();
  };

  const profileSections = [
    {
      title: 'Account Settings',
      items: [
        { icon: 'person-outline', label: 'Account Details', onPress: () => router.push('/account') },
        { icon: 'card-outline', label: 'Linked Banks & Mobile Money', onPress: () => router.push('/linkBank') },
        { icon: 'notifications-outline', label: 'Notifications', onPress: () => router.push('/notifications') },
      ],
    },
    {
      title: 'General Settings',
      items: [
        { icon: 'settings-outline', label: 'Preferences', onPress: () => router.push('/preferences') },
        { icon: 'lock-closed-outline', label: 'Privacy & Security', onPress: () => router.push('/privacyAndSecurity') },
      ],
    },
    {
      title: 'Support & Information',
      items: [
        { icon: 'people-outline', label: 'Referrals', onPress: () => router.push('/referrals') },
        { icon: 'trophy-outline', label: 'Rewards', onPress: () => router.push('/rewards') },
        { icon: 'chatbubble-ellipses-outline', label: 'Chatbot', onPress: () => router.push('/chatbot') },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Section */}
        <View style={styles.profileHeader}>
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>{getInitials(user?.displayName || '')}</Text>
            </View>
          )}
          <Text style={styles.profileName}>{user?.displayName || 'User Name'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          <TouchableOpacity style={styles.editProfileButton} onPress={() => router.push('/editProfile')}>
            <Ionicons name="pencil-outline" size={20} color={colors.primary} />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <React.Fragment key={itemIndex}>
                <TouchableOpacity onPress={item.onPress} style={styles.menuItem}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon as IconName} size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
                </TouchableOpacity>
                {itemIndex < section.items.length - 1 && <View style={styles.menuItemSeparator} />}
              </React.Fragment>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/logout')}>
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}