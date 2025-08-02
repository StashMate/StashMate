import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getNotificationsStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Changed to space-between
    paddingHorizontal: 20, // Use paddingHorizontal instead of padding
    paddingTop: 20,
    borderBottomWidth: 1, // Added borderBottomWidth
    borderBottomColor: colors.separator,
    paddingBottom: 10, // Added paddingBottom
  },
  backButton: {
    // Removed absolute positioning
  },
  refreshButton: {
    // New style for refresh button if needed, but backButton style can be reused
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    padding: 20,
  },
  notificationItem: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 10,
  },
}); 