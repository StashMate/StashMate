import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const getInvestmentDetailsStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  mainInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  fundName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  fundDetails: {
    fontSize: 16,
    color: colors.secondaryText,
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
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryReturn: {
    fontSize: 16,
    color: colors.success,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  performanceCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceFund: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  performanceReturn: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
  },
  performanceTimeline: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  newsContent: {
    flex: 1,
  },
  newsSource: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  newsDescription: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginLeft: 16,
  },
  imagePlaceholder: {
    backgroundColor: colors.iconBackground,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  button: { 
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  sellButton: {
    backgroundColor: colors.iconBackground,
  },
  buyButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 