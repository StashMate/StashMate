import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getReferralsStyles } from '../styles/referrals.styles';
import { useRouter, Stack } from 'expo-router';

export default function ReferralsScreen() {
  const { colors } = useTheme();
  const styles = getReferralsStyles(colors);
  const router = useRouter();
  
  const referralLink = 'https://stashmate.com/referral/sophia123';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referrals</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.image, { backgroundColor: colors.iconBackground }]} />
        <Text style={styles.title}>Invite friends, earn rewards</Text>
        <Text style={styles.description}>
          Share your referral link with friends and family. When they sign up and start saving, you'll both earn rewards!
        </Text>

        <Text style={styles.sectionTitle}>Your Referral Link</Text>
        <View style={styles.referralLinkContainer}>
          <Text style={styles.referralLink} numberOfLines={1}>{referralLink}</Text>
          <TouchableOpacity>
            <Ionicons name="copy-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Incentives</Text>
        <View style={styles.incentivesCard}>
          <View style={styles.incentiveIcon}>
            <Ionicons name="gift-outline" size={32} color={colors.primary} />
          </View>
          <View style={styles.incentiveTextContainer}>
            <Text style={styles.incentiveValue}>$20 bonus</Text>
            <Text style={styles.incentiveDescription}>For each friend who signs up and saves $100</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share Referral Link</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
} 