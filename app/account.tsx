import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getAccountStyles } from '../styles/account.styles';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export default function AccountScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getAccountStyles(colors);

  const MenuItem = ({ icon, name, rightContent }: { icon: React.ReactNode, name: string, rightContent?: React.ReactNode }) => (
    <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuIcon}>{icon}</View>
        <Text style={styles.menuText}>{name}</Text>
        {rightContent}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Account</Text>
        </View>
        <ScrollView>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Settings</Text>
                <MenuItem icon={<MaterialCommunityIcons name="bank-outline" size={24} color={colors.icon} />} name="Link bank accounts" />
                <MenuItem icon={<MaterialCommunityIcons name="email-outline" size={24} color={colors.icon} />} name="Email" />
                <MenuItem icon={<MaterialCommunityIcons name="phone-outline" size={24} color={colors.icon} />} name="Contact" />
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>
                <MenuItem icon={<MaterialCommunityIcons name="shield-check-outline" size={24} color={colors.icon} />} name="Privacy & Security" />
                <MenuItem icon={<MaterialCommunityIcons name="help-circle-outline" size={24} color={colors.icon} />} name="Help" />
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <MenuItem icon={<MaterialCommunityIcons name="logout" size={24} color={colors.icon} />} name="Log out" />
                <MenuItem 
                    icon={<MaterialCommunityIcons name="account-group-outline" size={24} color={colors.icon} />} 
                    name="Referrals" 
                    rightContent={<MaterialCommunityIcons name="open-in-new" size={24} color={colors.icon} />}
                />
            </View>
        </ScrollView>
    </SafeAreaView>
  );
} 