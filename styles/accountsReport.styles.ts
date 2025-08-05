
import { StyleSheet } from 'react-native';

export const getAccountsReportStyles = (colors) => StyleSheet.create({
  container: {
    borderRadius: 15,
    paddingVertical: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  accountItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
  },
  selectedAccountItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  accountIcon: {
    marginBottom: 8,
  },
  accountDetails: {
    alignItems: 'center',
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  selectedAccountName: {
    color: colors.card,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
  },
  selectedAccountBalance: {
    color: colors.card,
  },
});
