import { StyleSheet } from 'react-native';

export const getBudgetStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 15,
    },
    toggleContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: colors.border,
        borderRadius: 20,
        overflow: 'hidden',
    },
    toggleButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeToggleButton: {
        backgroundColor: colors.primary,
    },
    toggleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.secondaryText,
    },
    activeToggleButtonText: {
        color: '#FFFFFF',
    },
    input: {
        backgroundColor: colors.input,
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        color: colors.text,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deductContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    deductLabel: {
        fontSize: 16,
        color: colors.text,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContainer: {
        marginTop: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: colors.card,
        borderRadius: 8,
        marginBottom: 10,
    },
    itemDetails: {
        flex: 1,
    },
    itemText: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.text,
    },
    itemSubText: {
        fontSize: 14,
        color: colors.secondaryText,
        marginTop: 4,
    },
    itemAmountContainer: {
        alignItems: 'flex-end',
    },
    itemAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemActions: {
        flexDirection: 'row',
        marginTop: 8,
    },
    editButton: {
        marginRight: 15,
    },
    deleteButton: {},
    summaryCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
    },
    summaryTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 15,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 16,
        color: colors.secondaryText,
    },
    summaryAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    periodSelectorButton: {
        padding: 10,
        marginLeft: 10,
    },
    periodOptionsContainer: {
        backgroundColor: colors.card,
        borderRadius: 8,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 10,
    },
    periodOption: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    periodOptionText: {
        fontSize: 16,
        color: colors.text,
    },
    periodApproximationText: {
        fontSize: 12,
        color: colors.secondaryText,
    },
});