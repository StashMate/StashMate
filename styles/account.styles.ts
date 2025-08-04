import { StyleSheet } from 'react-native';

export const getAccountStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
    },
    menuContainer: {
        marginTop: 30,
        paddingHorizontal: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        backgroundColor: colors.card,
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    menuItemText: {
        flex: 1,
        marginLeft: 20,
        fontSize: 18,
        color: colors.text,
    },
});