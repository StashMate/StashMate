import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { getRewardsStyles, badgeSize } from '../styles/rewards.styles';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const badges = [
  { name: 'Budget Master', icon: 'calculator-outline', color: '#4CAF50' },
  { name: 'Savings Champion', icon: 'shield-checkmark-outline', color: '#2196F3' },
  { name: 'Expense Tracker Pro', icon: 'bar-chart-outline', color: '#FF9800' },
  { name: 'AI Reminder Ace', icon: 'alarm-outline', color: '#9C27B0' },
  { name: 'Gamification Guru', icon: 'game-controller-outline', color: '#F44336' },
  { name: 'Investment Navigator', icon: 'trending-up-outline', color: '#009688' },
];

const achievements = [
  { icon: 'calendar-outline', title: 'Budgeting Streak', description: 'Completed 5 budgets' },
  { icon: 'wallet-outline', title: 'Savings Milestone', description: 'Saved $500' },
  { icon: 'document-text-outline', title: 'Expense Tracking Consistency', description: 'Tracked expenses for 3 months' },
];

export default function RewardsScreen() {
  const { colors } = useTheme();
  const styles = getRewardsStyles(colors);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgeGrid}>
          {badges.map((badge, index) => (
            <View key={index} style={styles.badgeContainer}>
              <View style={[styles.badgeImageContainer, { backgroundColor: badge.color + '20' }]}>
                <Ionicons name={badge.icon as any} size={badgeSize * 0.5} color={badge.color} />
              </View>
              <Text style={styles.badgeName}>{badge.name}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Points</Text>
        <View style={styles.pointsCard}>
          <Ionicons name="server-outline" size={24} color={colors.primary} />
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsLabel}>Total Points</Text>
            <Text style={styles.pointsValue}>1200 points</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Achievements</Text>
        {achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Ionicons name={achievement.icon as any} size={24} color={colors.primary} />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
} 