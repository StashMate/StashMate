import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getInvestmentDetailStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.secondaryText,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  summaryChange: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  positiveChange: {
    color: colors.success,
  },
  negativeChange: {
    color: colors.danger,
  },
  detailSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  detailLabel: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  infoText: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedPeriodButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 12,
  },
  selectedPeriodButtonText: {
    color: '#FFFFFF',
  },
});