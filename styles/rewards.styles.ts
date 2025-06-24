import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;
const { width } = Dimensions.get('window');
export const badgeSize = (width - 60) / 2;

export const getRewardsStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 15,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeContainer: {
    width: badgeSize,
    marginBottom: 20,
    alignItems: 'center',
  },
  badgeImageContainer: {
    width: badgeSize,
    height: badgeSize,
    backgroundColor: colors.card,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  badgeName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  pointsCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsInfo: {
    marginLeft: 15,
  },
  pointsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  pointsValue: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 2,
  },
  achievementCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementIcon: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: colors.iconBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  achievementDescription: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 2,
  },
}); 