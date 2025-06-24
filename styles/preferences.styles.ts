import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getPreferencesStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    color: colors.text,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  rowTextContainer: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    color: colors.text,
  },
  rowSubLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 2,
  },
  rowValue: {
    fontSize: 16,
    color: colors.secondaryText,
  },
}); 