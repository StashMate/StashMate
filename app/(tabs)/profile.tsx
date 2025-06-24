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

    const MenuItem = ({ item }: { item: { icon: IconName; label:string, onPress?: () => void }}) => {
        return (
            <TouchableOpacity onPress={item.onPress} style={styles.menuItem}>
                <View style={styles.menuIcon}>
                    <Ionicons name={item.icon} size={22} color={colors.icon} />
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
        );
    }

    const accountItems: { icon: IconName; label: string, onPress?: () => void }[] = [
        { icon: 'person-outline', label: 'Account Details', onPress: () => router.push('/account') },
        { icon: 'settings-outline', label: 'App Preferences', onPress: () => router.push('/preferences') },
        { icon: 'notifications-outline', label: 'Notifications' },
    ];
    
    const investmentItems: { icon: IconName; label: string }[] = [
        { icon: 'analytics-outline', label: 'Portfolio Overview' },
    ];
    
    const rewardItems: { icon: IconName; label: string, onPress?: () => void }[] = [
        { icon: 'trophy-outline', label: 'Rewards & Achievements', onPress: () => router.push('/rewards') },
    ];

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>
            <View style={styles.profileSection}>
                <Image 
                    source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }}
                    style={styles.profileImage}
                />
                <Text style={styles.profileName}>Sophia Carter</Text>
                <Text style={styles.profileHandle}>@sophia.carter</Text>
                <Text style={styles.profileJoinDate}>Joined 2021</Text>
            </View>

            <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>Account</Text>
                {accountItems.map((item, index) => <MenuItem key={index} item={item} />)}
            </View>

            <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>Investments</Text>
                {investmentItems.map((item, index) => <MenuItem key={index} item={item} />)}
            </View>
            
            <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>Rewards</Text>
                {rewardItems.map((item, index) => <MenuItem key={index} item={item} />)}
            </View>

        </ScrollView>
    </SafeAreaView>
  );
} 