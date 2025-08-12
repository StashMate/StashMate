import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { addChallenge, AwardedBadge, Badge, Challenge, fetchActiveChallenges, fetchAwardedBadges, predefinedBadges } from '../services/gamificationService';
import { getRewardsStyles } from '../styles/rewards.styles';


type Tab = 'badges' | 'challenges';

export default function RewardsScreen() {
  const { colors } = useTheme();
  const styles = getRewardsStyles(colors);
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState<Tab>('badges');
  const [awardedBadges, setAwardedBadges] = useState<AwardedBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const predefinedNewChallenges: Omit<Challenge, 'userId' | 'currentValue' | 'startDate' | 'endDate' | 'isCompleted' | 'isActive'>[] = [
    { id: 'save_50_in_7_days', name: 'Save $50 in 7 Days', description: 'Set aside $50 within a week.', type: 'savings_goal', targetValue: 50, durationDays: 7 },
    { id: 'track_all_expenses', name: 'Track All Expenses', description: 'Log every expense for a month.', type: 'spending_limit', targetValue: 0, durationDays: 30 },
    { id: 'no_takeout_week', name: 'No Takeout Week', description: 'Cook all meals at home for 7 days.', type: 'spending_limit', targetValue: 0, durationDays: 7, category: 'Food' },
  ];

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [awarded, activeChallenges] = await Promise.all([
          fetchAwardedBadges(user.uid),
          fetchActiveChallenges(user.uid),
        ]);
        setAwardedBadges(awarded);
        setAllBadges(predefinedBadges); // Use predefined badges
        setChallenges(activeChallenges);

        // Filter out predefined challenges that are already active for the user
        const activeChallengeIds = new Set(activeChallenges.map(c => c.id));
        const filteredAvailableChallenges = predefinedNewChallenges.filter(
          pc => !activeChallengeIds.has(pc.id)
        ).map(pc => ({ ...pc, userId: user.uid, currentValue: 0, startDate: null, endDate: null, isCompleted: false, isActive: false }));
        setAvailableChallenges(filteredAvailableChallenges as Challenge[]);

      } catch (err) {
        setError('Failed to load rewards. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleCancelChallenge = async (challengeId: string) => {
    if (!user) {
      setError("User not logged in.");
      return;
    }
    setLoading(true);
    try {
      // In a real app, you would update the challenge status in Firestore here
      // For now, we'll just remove it from the local state
      setChallenges(prev => prev.filter(c => c.id !== challengeId));
      // Optionally, add it back to available challenges if it's a predefined one
      const cancelledChallenge = predefinedNewChallenges.find(pc => pc.id === challengeId);
      if (cancelledChallenge) {
        setAvailableChallenges(prev => [...prev, { ...cancelledChallenge, userId: user.uid, currentValue: 0, startDate: null, endDate: null, isCompleted: false, isActive: false }]);
      }
    } catch (err) {
      setError("Failed to cancel challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChallengePress = async (challenge: Omit<Challenge, 'userId' | 'currentValue' | 'startDate' | 'endDate' | 'isCompleted' | 'isActive'>) => {
    if (!user) {
      setError("User not logged in.");
      return;
    }
    setLoading(true);
    try {
      const newChallengeData = {
        ...challenge,
        userId: user.uid,
        currentValue: 0,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + challenge.durationDays)),
        isCompleted: false,
        isActive: true,
      };
      const challengeId = await addChallenge(newChallengeData);
      if (challengeId) {
        setChallenges(prev => [...prev, { ...newChallengeData, id: challengeId }]);
        setAvailableChallenges(prev => prev.filter(c => c.id !== challenge.id));
      } else {
        setError("Failed to activate challenge.");
      }
    } catch (err) {
      setError("Failed to activate challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const { awarded, notAwarded } = React.useMemo(() => {
    const awardedBadgeIds = new Set(awardedBadges.map(badge => badge.id));
    const awarded: (Badge & { isAwarded: boolean })[] = [];
    const notAwarded: (Badge & { isAwarded: boolean })[] = [];

    allBadges.forEach(badge => {
      if (awardedBadgeIds.has(badge.id)) {
        awarded.push({ ...badge, isAwarded: true });
      } else {
        notAwarded.push({ ...badge, isAwarded: false });
      }
    });

    return { awarded, notAwarded };
  }, [allBadges, awardedBadges]);

  const getValidIconName = (iconName: string): any => {
    const iconMap: { [key: string]: string } = {
      'flame': 'fire',
      'fast-food-outline': 'food-fork-drink',
      'list-outline': 'format-list-bulleted',
      'medkit-outline': 'medical-bag',
      'stats-chart-outline': 'chart-bar',
      'piggy-bank': 'piggy-bank-outline',
      'star': 'star-outline',
      'receipt': 'receipt-outline',
      'safe': 'safe-outline',
      'book': 'book-open-outline',
      'trending-up': 'trending-up-outline',
      'trending-down': 'trending-down-outline',
      'wallet-outline': 'wallet-outline',
    };
    return iconMap[iconName] || 'trophy-award';
  };

  const renderBadge = (item: Badge & { isAwarded: boolean }) => (
    <View key={item.id} style={[styles.badgeContainer, item.isAwarded && styles.awardedBadge]}>
      <View style={styles.badgeIconContainer}>
        <MaterialCommunityIcons name={getValidIconName(item.icon)} size={32} color={item.isAwarded ? colors.primary : colors.secondaryText} />
      </View>
      <Text style={styles.badgeName}>{item.name}</Text>
      <Text style={styles.badgeDescription}>{item.description}</Text>
    </View>
  );

  const renderChallenge = (item: Challenge) => {
    const progress = Math.min((item.currentValue / item.targetValue) * 100, 100);
    const isActiveChallenge = item.isActive;

    return (
      <View key={item.id} style={[styles.challengeContainer, !isActiveChallenge && styles.inactiveChallengeContainer]}>
        <View style={styles.challengeHeader}>
          <MaterialCommunityIcons name="bullseye-arrow" size={24} color={isActiveChallenge ? colors.primary : colors.secondaryText} style={styles.challengeIcon} />
          <View style={styles.challengeInfo}>
            <Text style={[styles.challengeName, !isActiveChallenge && styles.inactiveChallengeName]}>{item.name}</Text>
            <Text style={[styles.challengeDescription, !isActiveChallenge && styles.inactiveChallengeDescription]}>{item.description}</Text>
          </View>
        </View>
        {isActiveChallenge ? (
          <>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{`${Math.round(progress)}%`}</Text>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
          </View>
          <TouchableOpacity style={styles.cancelChallengeButton} onPress={() => handleCancelChallenge(item.id)}>
            <Text style={styles.cancelChallengeButtonText}>Cancel Challenge</Text>
          </TouchableOpacity>
        </>
        ) : (
          <TouchableOpacity style={styles.activateChallengeButton} onPress={() => handleChallengePress(item)}>
            <Text style={styles.activateChallengeButtonText}>Activate Challenge</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

 

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    switch (activeTab) {
      case 'badges':
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Earned Badges</Text>
              {awarded.length > 0 ? (
                <View style={styles.grid}>
                  {awarded.map(renderBadge)}
                </View>
              ) : (
                <Text style={styles.emptyText}>No badges earned yet. Keep going!</Text>
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Badges</Text>
              {notAwarded.length > 0 ? (
                <View style={styles.grid}>
                  {notAwarded.map(renderBadge)}
                </View>
              ) : (
                <Text style={styles.emptyText}>All badges earned!</Text>
              )}
            </View>
          </>
        );
      case 'challenges':
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Challenges</Text>
              {challenges.length > 0 ? (
                challenges.map(renderChallenge)
              ) : (
                <Text style={styles.emptyText}>No active challenges. Start a new one!</Text>
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Challenges</Text>
              {availableChallenges.length > 0 ? (
                availableChallenges.map(renderChallenge)
              ) : (
                <Text style={styles.emptyText}>No new challenges available at the moment.</Text>
              )}
            </View>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rewards</Text>
        <View style={styles.pointsContainer}>
          <MaterialCommunityIcons name="star-circle" size={24} color={colors.white} />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {(['badges', 'challenges'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}