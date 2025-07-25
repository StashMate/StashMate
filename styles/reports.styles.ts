import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type IColors = typeof Colors.light;

export const getReportsStyles = (colors: IColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 50,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
    },
    accountSelectorContainer: {
        marginBottom: 30,
    },
    accountButton: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 25,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    activeAccountButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    accountButtonText: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '600',
    },
    activeAccountButtonText: {
        color: '#FFFFFF',
    },
    metricsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    metricCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        width: '48%', // Two cards per row
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    metricLabel: {
        fontSize: 15,
        color: colors.secondaryText,
        marginBottom: 8,
        textAlign: 'center',
    },
    metricValue: {
        fontSize: 20,
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
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: colors.card,
        borderRadius: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    filterButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        // backgroundColor: colors.card, // Removed to make active button stand out more
        // borderWidth: 1,
        // borderColor: colors.border,
    },
    activeFilterButton: {
        backgroundColor: colors.primary,
        // borderColor: colors.primary,
    },
    filterButtonText: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '600',
    },
    activeFilterButtonText: {
        color: '#FFFFFF',
    },
    chartContainer: {
        marginBottom: 25,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 15,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyStateText: {
        fontSize: 16,
        color: colors.secondaryText,
        textAlign: 'center',
        marginTop: 10,
    },
    comparisonContainer: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 18,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    comparisonText: {
        fontSize: 16,
        color: colors.text,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 24,
    },
    savingsRateCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        width: '100%', // Full width for this card
        marginTop: 15, // Space from other metric cards
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    savingsRateText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    // New styles for better layout of metrics
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    fullWidthCard: {
        width: '100%',
        marginHorizontal: 0,
    }
}); 