import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type IColors = typeof Colors.light;

export const getReportsStyles = (colors: IColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 50,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    accountSelectorContainer: {
        marginBottom: 20,
    },
    accountButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 10,
    },
    activeAccountButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    accountButtonText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
    },
    activeAccountButtonText: {
        color: '#FFFFFF',
    },
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    metricCard: {
        backgroundColor: colors.card,
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    metricLabel: {
        fontSize: 14,
        color: colors.secondaryText,
        marginBottom: 5,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    incomeText: {
        color: colors.success,
    },
    expenseText: {
        color: colors.danger,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activeFilterButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterButtonText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
    },
    activeFilterButtonText: {
        color: '#FFFFFF',
    },
    chartContainer: {
        marginBottom: 30,
        backgroundColor: colors.card,
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 15,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: colors.text,
        textAlign: 'center',
        marginTop: 10,
    }
}); 