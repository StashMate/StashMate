import { StyleSheet } from 'react-native';

export const getTransactionDetailStyles = (colors: any) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
    },
    content: {
      padding: 20,
    },
    amountContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },
    amount: {
      fontSize: 48,
      fontWeight: 'bold',
    },
    transactionName: {
      fontSize: 20,
      color: colors.secondaryText,
      marginTop: 5,
    },
    detailsCard: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 20,
      marginTop: 20,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastDetailRow: {
      borderBottomWidth: 0,
    },
    label: {
      fontSize: 16,
      color: colors.secondaryText,
    },
    value: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    income: {
      color: colors.primary,
    },
    expense: {
      color: colors.error,
    },
  });
};