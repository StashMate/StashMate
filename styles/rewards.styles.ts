import { StyleSheet } from 'react-native';
import { IColors } from './types';

export const getRewardsStyles = (colors: IColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    marginTop: 50,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  badgeList: {
    paddingBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeContainer: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    // Remove width and marginHorizontal properties as we're handling layout differently now
  },
  blurredBadge: {
    opacity: 0.3,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 10,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 5,
  },
  challengeList: {
    paddingBottom: 20,
  },
  challengeContainer: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  challengeTimeRemaining: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 15,
  },
  challengeDetails: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  startButtonText: {
    color: colors.buttonText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: colors.secondaryText,
    textAlign: 'center',
  },
});


export const fetchAllBadges = (): void => {
  // ...
};