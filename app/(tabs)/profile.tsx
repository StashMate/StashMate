import { View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProfileStyles } from '../../styles/profile.styles';
import { ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

type IconName = ComponentProps<typeof Ionicons>['name'];

export default function ProfileScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const styles = getProfileStyles(colors);

    const menuItems = [
        {
          title: 'Account',
          items: [
            { icon: 'person-outline', label: 'Account Settings', onPress: () => router.push('/account') },
            { icon: 'settings-outline', label: 'App Preferences', onPress: () => router.push('/preferences') },
            { icon: 'notifications-outline', label: 'Notifications', onPress: () => router.push('/notifications') },
          ],
        },
        {
          title: 'Investing',
          items: [
            { icon: 'analytics-outline', label: 'Portfolio Overview', onPress: () => router.push('/investments') },
          ],
        },
        {
          title: 'Rewards',
          items: [
            { icon: 'trophy-outline', label: 'Rewards & Achievements', onPress: () => router.push('/rewards') },
          ],
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>
                <View style={styles.profileSection}>
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }}
                        style={styles.profileImage}
                    />
                    <View style={styles.profileTextContainer}>
                        <Text style={styles.profileName}>Sophia Carter</Text>
                        <Text style={styles.profileHandle}>@sophia.carter</Text>
                    </View>
                </View>

                {menuItems.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.card}>
                        {section.items.map((item, index) => (
                            <View key={index}>
                                <TouchableOpacity onPress={item.onPress} style={styles.menuItem}>
                                    <View style={styles.menuIcon}>
                                        <Ionicons name={item.icon as IconName} size={20} color={colors.primary} />
                                    </View>
                                    <Text style={styles.menuText}>{item.label}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
                                </TouchableOpacity>
                                {index < section.items.length - 1 && <View style={styles.menuItemSeparator} />}
                            </View>
                        ))}
                    </View>
                ))}

            </ScrollView>
        </SafeAreaView>
    );
} 