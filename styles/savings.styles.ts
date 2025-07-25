

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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    margin: 20,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    height: 40,
  },
  content: {
    paddingHorizontal: 20,
  },
  accountSelector: {
    marginBottom: 20,
  },
  accountCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 20,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    width: 150,
    height: 150,
  },
  selectedAccountCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 10,
  },
  accountBalance: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 5,
  },
  selectedAccountText: {
    color: '#fff',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  vaultAmount: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 4,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  emptyVaultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyVaultsText: {
    textAlign: 'center',
    color: colors.secondaryText,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  newVaultButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  newVaultButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    height: 50,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
    fontSize: 16,
  },
  depositAmountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  skeletonContainer: {
    padding: 20,
  },
  skeletonVaultCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    height: 100,
    marginBottom: 10,
    opacity: 0.5,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginTop: 20,
  },
}); 