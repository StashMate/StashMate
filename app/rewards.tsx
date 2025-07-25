import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SectionList, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { AwardedBadge, Badge, Challenge, fetchActiveChallenges, fetchAllBadges, fetchAwardedBadges } from '../services/gamificationService';
import { getRewardsStyles } from '../styles/rewards.styles';

export default function RewardsScreen() {
  const { colors } = useTheme();
  const styles = getRewardsStyles(colors);
  const { user } = useUser();

  const [awardedBadges, setAwardedBadges] = useState<AwardedBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [awarded, all, activeChallenges] = await Promise.all([
          fetchAwardedBadges(user.uid),
          fetchAllBadges(),
          fetchActiveChallenges(user.uid),
        ]);
        setAwardedBadges(awarded);
        setAllBadges(all);
        setChallenges(activeChallenges);
      } catch (err) {
        setError('Failed to load rewards. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Combine and sort badges - awarded first, then unobtained
  const sortedBadges = React.useMemo(() => {
    // Create a map of awarded badge IDs for quick lookup
    const awardedBadgeIds = new Set(awardedBadges.map(badge => badge.id));
    
    // Create combined badge list with isAwarded flag
    const combinedBadges = allBadges.map(badge => ({
      ...badge,
      isAwarded: awardedBadgeIds.has(badge.id)
    }));
    
    // Sort badges - awarded first
    return combinedBadges.sort((a, b) => {
      if (a.isAwarded && !b.isAwarded) return -1;
      if (!a.isAwarded && b.isAwarded) return 1;
      return 0;
    });
  }, [allBadges, awardedBadges]);

  // Format badges into rows for grid display
  const formattedBadges = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < sortedBadges.length; i += 2) {
      if (i + 1 < sortedBadges.length) {
        // Add a pair of badges
        result.push([sortedBadges[i], sortedBadges[i + 1]]);
      } else {
        // Add the last badge if there's an odd number
        result.push([sortedBadges[i]]);
      }
    }
    return result;
  }, [sortedBadges]);

  const renderBadge = ({ item }) => (
    <View style={[styles.badgeContainer, !item.isAwarded && styles.blurredBadge]}>
      <MaterialCommunityIcons name={getValidIconName(item.icon)} size={48} color={colors.primary} />
      <Text style={styles.badgeName}>{item.name}</Text>
      <Text style={styles.badgeDescription}>{item.description}</Text>
    </View>
  );

  // Render a row of badges
  const renderBadgeRow = ({ item }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12.5 }}>
      {item.map(badge => (
        <View key={badge.id} style={{ flex: 1, maxWidth: '48%' }}>
          {renderBadge({ item: badge })}
        </View>
      ))}
      {item.length === 1 && <View style={{ flex: 1, maxWidth: '48%' }} />}
    </View>
  );

  // Helper function to map invalid icon names to valid ones
  const getValidIconName = (iconName: string): string => {
    const iconMap = {
      'cash-outline': 'cash',
      'flame': 'fire',
      'fast-food-outline': 'food',
      'list-outline': 'format-list-bulleted',
      'medkit-outline': 'medical-bag',
      'stats-chart-outline': 'chart-bar'
    };
    
    return iconMap[iconName] || iconName;
  };

  const renderChallenge = ({ item }) => (
    <View style={styles.challengeContainer}>
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeName}>{item.name}</Text>
        <Text style={styles.challengeTimeRemaining}>{item.endDate ? new Date(item.endDate.seconds * 1000).toLocaleDateString() : 'N/A'}</Text>
      </View>
      <Text style={styles.challengeDescription}>{item.description}</Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${(item.currentValue / item.targetValue) * 100}%` }]} />
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (error) {
    return <View style={styles.container}><Text style={styles.errorText}>{error}</Text></View>;
  }

  // Create sections for SectionList
  const sections = [
    {
      title: 'My Badges',
      data: [formattedBadges],
      renderItem: ({ item }) => (
        <FlatList
          data={item}
          renderItem={renderBadgeRow}
          keyExtractor={(_, index) => `badge-row-${index}`}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No badges available yet. Keep it up!</Text>}
        />
      )
    },
    {
      title: 'Active Challenges',
      data: [challenges],
      renderItem: ({ item }) => (
        <FlatList
          data={item}
          renderItem={renderChallenge}
          keyExtractor={(challenge) => challenge.id}
          contentContainerStyle={styles.challengeList}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No active challenges. Check back later!</Text>}
        />
      )
    }
  ];

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={(item, index) => index.toString()}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Your Rewards</Text>
        </View>
      }
      stickySectionHeadersEnabled={false}
    />
  );
}