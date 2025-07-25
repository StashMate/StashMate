import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getDashboardStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 10,
  },
  title: {
    color: colors.secondaryText,
    fontSize: 16,
    marginBottom: 5
  },
  balance: {
    color: colors.text,
    fontSize: 36,
    fontWeight: 'bold',
  },
  negativeBalance: {
    color: colors.danger,
  },
  lastUpdated: {
    color: colors.secondaryText,
    fontSize: 12,
    marginTop: 5,
  },
  summaryCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  summaryCardTitle: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 8,
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: colors.separator,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5
  },
  progressBar: {
    width: '60%', // This should be dynamic
    height: '100%',
    backgroundColor: colors.success,
  },
  budgetText: {
    color: colors.secondaryText,
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
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
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionCategory: {
    color: colors.secondaryText,
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  expense: {
    color: colors.danger,
  },
  income: {
    color: colors.success,
  },
  savingsAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  quoteCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: 10,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  quoteAuthor: {
    color: colors.secondaryText,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  refreshButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: colors.secondaryText,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.iconBackground,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: colors.primary,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  saveButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    budgetItem: {
        backgroundColor: colors.card,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    budgetInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    budgetCategory: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    budgetValues: {
        fontSize: 16,
        color: colors.secondaryText,
    },
    budgetProgressBarContainer: {
        height: 10,
        backgroundColor: colors.border,
        borderRadius: 5,
        overflow: 'hidden',
        marginTop: 5,
    },
    budgetProgressBar: {
        height: '100%',
        borderRadius: 5,
    },
    warning: {
        marginTop: 8,
        color: 'orange',
        fontSize: 12,
        fontStyle: 'italic',
    },
    danger: {
        marginTop: 8,
        color: 'red',
        fontSize: 12,
        fontStyle: 'italic',
    },
    // Enhanced budget card styles
    budgetSummaryCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    },
    budgetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    },
    noBudgetsText: {
    fontSize: 14,
    color: colors.secondaryText,
    fontStyle: 'italic',
    marginTop: 5,
    },
    budgetPreview: {
    width: '100%',
    },
    miniProgressContainer: {
    marginBottom: 8,
    },
    miniProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    },
    miniCategoryText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
    },
    miniAmountText: {
    fontSize: 12,
    color: colors.secondaryText,
    },
    miniProgressBarContainer: {
    height: 6,
    backgroundColor: colors.separator,
    borderRadius: 3,
    overflow: 'hidden',
    },
    miniProgressBar: {
    height: '100%',
    },
    viewMoreButton: {
    alignItems: 'center',
    marginTop: 5,
    },
    viewMoreText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    },
    
    // Enhanced modal styles
    modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    },
    enhancedInput: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    },
    inputIcon: {
    marginRight: 10,
    },
    textInput: {
    flex: 1,
    color: colors.text,
    padding: 12,
    fontSize: 16,
    },
    budgetList: {
    width: '100%',
    maxHeight: 350,
    },
    budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    },
    categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    },
    categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    },
    budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    },
    remainingText: {
    fontSize: 12,
    color: colors.secondaryText,
    fontStyle: 'italic',
    },
    warningText: {
    fontSize: 12,
    color: colors.warning,
    fontStyle: 'italic',
    },
    dangerText: {
    fontSize: 12,
    color: colors.danger,
    fontStyle: 'italic',
    },
    addBudgetButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    width: '100%',
    },
    addBudgetButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    marginLeft: 8,
    },
    emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    },
    emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 15,
    },
    emptyStateSubText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 5,
    },
    warning: {
    color: colors.warning,
    },
    success: {
    color: colors.success,
    },
    loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    },
    loadingIcon: {
    opacity: 0.8,
    },
});