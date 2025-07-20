import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getTransactionsStyles = (colors: ThemeColors) => StyleSheet.create({
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
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.iconBackground,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  filterText: {
    color: colors.text,
    marginRight: 5,
    fontWeight: '500',
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  activeFilterText: {
    color: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 10,
    backgroundColor: colors.background,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  summaryLabel: {
    color: colors.secondaryText,
    fontSize: 14,
    marginBottom: 5,
  },
  summaryAmount: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeText: {
    color: colors.success,
  },
  expenseText: {
    color: colors.danger,
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: colors.secondaryText,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  chartContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  accountSelectorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  accountScrollView: {
    flexDirection: 'row',
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAccountButton: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  accountButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  selectedAccountButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  transactionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 10,
  },
  recurringText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  recurringInstanceBadge: {
    backgroundColor: colors.iconBackground,
    borderRadius: 10,
    padding: 4,
    marginLeft: 8,
  },
}); 