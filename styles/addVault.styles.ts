import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getAddVaultStyles = (colors: ThemeColors) => StyleSheet.create({
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
    saveButton: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
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
    iconSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    iconButton: {
        width: '22%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.separator,
        marginBottom: 10,
    },
    selectedIconButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 