import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getSelectBankStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 8,
        marginHorizontal: 20,
        marginVertical: 16,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 48,
        color: colors.text,
        fontSize: 16,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
    },
    bankItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    bankName: {
        fontSize: 16,
        color: colors.text,
    },
    separator: {
        height: 1,
        backgroundColor: colors.border,
    },
    verificationContainer: {
        marginTop: 20,
        padding: 20,
        backgroundColor: colors.card,
        borderRadius: 8,
        marginHorizontal: 20,
    },
    selectedBankText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    accountInput: {
        backgroundColor: colors.background,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.text,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    errorText: {
        color: 'red',
        marginBottom: 12,
    },
    verifyButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});