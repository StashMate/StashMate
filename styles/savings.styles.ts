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
  accountSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  accountButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    marginHorizontal: 5,
  },
  selectedAccountButton: {
    backgroundColor: colors.primary,
  },
  accountButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  selectedAccountButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  accountLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderRadius: 12,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addAccountButtonText: {
    color: colors.primary,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  totalSavingsCard: {
    backgroundColor: colors.card,
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
  accountInfoCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  accountInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  accountInfoLabel: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  accountInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
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
    fontWeight: '600',
    color: colors.text,
  },
  vaultAmount: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  deadlineText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 6,
  },
  dueSoonStatus: {
    color: colors.warning,
  },
  overdueStatus: {
    color: colors.danger,
  },
  vaultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    marginLeft: 8,
    fontWeight: '600',
  },
  emptyVaultsText: {
    textAlign: 'center',
    color: colors.secondaryText,
    marginVertical: 20,
    fontStyle: 'italic',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 20,
  },
  linkButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: colors.background,
    color: colors.text,
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.secondaryText,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 