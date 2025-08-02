import React, { useContext } from 'react';
import { Text, View } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { getInvestmentsStyles } from '../styles/investments.styles';

const InvestmentsScreen = () => {
  const { theme } = useContext(ThemeContext);
  const styles = getInvestmentsStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Investments</Text>
      <View style={styles.comingSoonContainer}>
        <Text style={styles.comingSoonText}>Coming Soon!</Text>
        <Text style={styles.comingSoonSubtitle}>
          Our new investment platform is under construction. Stay tuned for exciting updates!
        </Text>
      </View>
    </View>
  );
};

export default InvestmentsScreen;