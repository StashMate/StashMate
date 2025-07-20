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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.separator,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        color: colors.secondaryText,
        marginBottom: 8,
        marginTop: 10,
    },
    input: {
        backgroundColor: colors.card,
        color: colors.text,
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
    },
    typeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
        marginBottom: 20,
        backgroundColor: colors.card,
        borderRadius: 10,
    },
    typeButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        flex: 1,
        alignItems: 'center',
    },
    activeTypeButton: {
        backgroundColor: colors.primary,
    },
    typeButtonText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '600',
    },
    activeTypeText: {
        color: '#FFFFFF',
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 'auto',
    },
    saveButton: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonIncome: {
        backgroundColor: colors.success,
    },
    saveButtonExpense: {
        backgroundColor: colors.danger,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    accountSelector: {
        marginTop: 10,
        marginBottom: 10,
    },
    accountButton: {
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
    },
    selectedAccountButtonText: {
        color: colors.primary,
        fontWeight: '600',
    },
    recurringContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: colors.card,
        borderRadius: 10,
    },
    recurringHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sublabel: {
        fontSize: 14,
        color: colors.secondaryText,
        marginBottom: 10,
        marginTop: 10,
    },
    frequencySelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    frequencyButton: {
        backgroundColor: colors.iconBackground,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginBottom: 10,
        minWidth: '22%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeFrequencyButton: {
        backgroundColor: colors.primary + '20',
        borderColor: colors.primary,
    },
    frequencyButtonText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: '500',
    },
    activeFrequencyText: {
        color: colors.primary,
        fontWeight: '600',
    },
}); 