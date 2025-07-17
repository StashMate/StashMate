import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getProfileStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 20,
    position: 'relative',
    borderBottomColor: colors.separator,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  editImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  profileTextContainer: {
    flex: 1,
  },

  profileHandle: {
    fontSize: 20,
    color: colors.secondaryText,
  },
  bioText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 5,
  },
  initialsContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  initialsText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  editButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 10,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  profileJoinDate: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 5,
  },
  editIcon: {
    display: 'none',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 20,
    paddingVertical: 10,
  },
  menuSection: {
    backgroundColor: colors.card,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.iconBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  menuItemSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 70,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 