import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getReferralsStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 16,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  referralLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  referralLink: {
    fontSize: 16,
    color: colors.text,
  },
  incentivesCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  incentiveIcon: {
    marginRight: 16,
  },
  incentiveTextContainer: {
    flex: 1,
  },
  incentiveValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  incentiveDescription: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 32,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
}); 