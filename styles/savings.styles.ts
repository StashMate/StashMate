import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getSavingsStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    padding: 20,
  },
  totalSavingsCard: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
  },
  totalSavingsLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  totalSavingsAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  vaultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  vaultInfo: {
    flex: 1,
    marginLeft: 15,
  },
  vaultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  vaultAmount: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 2,
  },
  newVaultButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  newVaultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
}); 