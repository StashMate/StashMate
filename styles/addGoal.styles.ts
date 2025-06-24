import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getAddGoalStyles = (colors: ThemeColors) => StyleSheet.create({
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
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    form: {
        padding: 20,
    },
    imagePicker: {
        height: 180,
        borderRadius: 10,
        backgroundColor: colors.iconBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: colors.separator,
        borderStyle: 'dashed',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    imagePickerText: {
        marginTop: 10,
        fontSize: 16,
        color: colors.primary,
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
}); 