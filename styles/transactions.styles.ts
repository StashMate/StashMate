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
    paddingTop: 10,
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
    top: 15,
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
  stickyHeaderWrapper: {
    backgroundColor: colors.background, // Ensure a solid background
    zIndex: 1, // Ensure it's above other content
  },
  accountListContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginTop: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  accountListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    paddingLeft: 5,
  },
  accountCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    marginRight: 12,
    marginBottom: 10,
    width: 230,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    justifyContent: 'space-between',
    minHeight: 90,
  },
  selectedAccountCard: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  accountCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  accountCardContent: {
    alignItems: 'flex-start',
  },
  accountName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  accountBalance: {
    fontSize: 19,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
  },
  accountType: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: colors.card,
    marginHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  summaryBox: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  historySummaryCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  historySummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  historySummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  historySummaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  historySummaryLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  historySummaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  historySummaryDateRange: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  dateRangeSeparator: {
    fontSize: 14,
    color: colors.secondaryText,
    marginHorizontal: 5,
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
});