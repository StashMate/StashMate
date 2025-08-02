import { StyleSheet } from 'react-native';
import { IColors } from './types';

export const getRewardsStyles = (colors: IColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    paddingTop: 60, // Add padding for status bar
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    borderRadius: 15,
    marginTop: -15, // Overlap with header
    paddingVertical: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  activeTab: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  activeTabText: {
    color: colors.primary,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeContainer: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  awardedBadge: {
    backgroundColor: colors.primary + '20', // A light tint of the primary color
    borderColor: colors.primary,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20', // Light primary color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 4,
  },
  challengeContainer: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeIcon: {
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
  },
  challengeDescription: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressText: {
    fontSize: 12,
    color: colors.secondaryText,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },

  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 20,
  },
});