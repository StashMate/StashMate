import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getInvestmentsStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
  },
  backButton: {
    // Keping this empty as it is handled in the view
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 16,
  },
  content: {
    padding: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  assetAllocationCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  allocationHeader: {
    marginBottom: 16,
  },
  allocationTitle: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  allocationValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  chartContainer: {
    marginLeft: -16,
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  performanceCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  performanceLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 8,
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  performanceChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  investmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  investmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.iconBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  investmentInfo: {
    flex: 1,
  },
  investmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  investmentType: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  investmentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColorBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
}); 