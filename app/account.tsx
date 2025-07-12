import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getAccountStyles } from '../styles/account.styles';
import { useRouter, Stack, Link } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export default function AccountScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getAccountStyles(colors);

  const MenuItem = ({ icon, name, href, rightContent }: { icon: React.ReactNode, name: string, href: string, rightContent?: React.ReactNode }) => (
    <Link href={href as any} asChild>
        <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>{icon}</View>
            <Text style={styles.menuText}>{name}</Text>
            {rightContent}
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.icon} />
        </TouchableOpacity>
    </Link>
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
                <MenuItem href="/linkBank" icon={<MaterialCommunityIcons name="bank-outline" size={24} color={colors.icon} />} name="Bank/Mobile Money Accounts" />
                <MenuItem href="/preferences" icon={<MaterialCommunityIcons name="email-outline" size={24} color={colors.icon} />} name="Email" />
                <MenuItem href="/preferences" icon={<MaterialCommunityIcons name="phone-outline" size={24} color={colors.icon} />} name="Contact" />
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>
                <MenuItem href="/privacyAndSecurity" icon={<MaterialCommunityIcons name="shield-check-outline" size={24} color={colors.icon} />} name="Privacy & Security" />
                <MenuItem href="/preferences" icon={<MaterialCommunityIcons name="help-circle-outline" size={24} color={colors.icon} />} name="Help" />
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <MenuItem href="/logout" icon={<MaterialCommunityIcons name="logout" size={24} color={colors.icon} />} name="Log out" />
                <MenuItem 
                    href="/referrals"
                    icon={<MaterialCommunityIcons name="account-group-outline" size={24} color={colors.icon} />} 
                    name="Referrals" 
                />
            </View>
        </ScrollView>
    </SafeAreaView>
  );
} 