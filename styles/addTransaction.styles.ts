import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getAddTransactionStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  searchInput: {
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    paddingLeft: 45,
  },
  searchIcon: {
    position: 'absolute',
    top: 25,
    left: 35,
    zIndex: 1,
    color: colors.secondaryText,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeTabButtonText: {
    color: '#fff',
  },
  accountListContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  accountListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedAccountItem: {
    borderColor: colors.primary,
    backgroundColor: colors.selectedCard,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  accountLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    backgroundColor: colors.iconBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    color: colors.text,
  },
  accountBalance: {
    color: colors.secondaryText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateHeader: {
    color: colors.secondaryText,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingBottom: 100, // To make sure FAB doesn't hide last item
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    marginHorizontal: 20,
    borderLeftWidth: 5,
  },
  incomeBorder: {
    borderLeftColor: colors.success,
  },
  expenseBorder: {
    borderLeftColor: colors.danger,
  },
  transactionIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.iconBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  transactionCategory: {
    color: colors.secondaryText,
    fontSize: 14,
    fontStyle: 'italic',
  },
  transactionDate: {
    color: colors.secondaryText,
    fontSize: 12,
    marginTop: 4,
  },
  transactionPaymentMethod: {
    color: colors.secondaryText,
    fontSize: 12,
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  income: {
    color: colors.success,
  },
  expense: {
    color: colors.danger,
  },
  deleteButton: {
    marginTop: 5,
    padding: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});