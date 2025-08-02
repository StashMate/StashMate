import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getInvestmentsStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 20,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  comingSoonSubtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});