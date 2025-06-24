import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { styles } from '../styles/welcome.styles';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const { colors } = useTheme();
  
  const iconScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }],
    };
  });
  
  const taglineAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: taglineOpacity.value,
    };
  });

  useEffect(() => {
    iconScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });

    textOpacity.value = withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) });
    textTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.exp) });
    
    taglineOpacity.value = withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) });

    const timer = setTimeout(() => {
      router.replace('/dashboard');
    }, 3000); // Increased timer to allow animation to complete

    return () => clearTimeout(timer);
  }, [iconScale, textOpacity, textTranslateY, taglineOpacity]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.logoContainer}>
        <Animated.View style={iconAnimatedStyle}>
          <FontAwesome5 name="piggy-bank" size={80} color={colors.primary} />
        </Animated.View>
        <Animated.Text style={[styles.logo, { color: colors.primary }, textAnimatedStyle]}>
          StashMate
        </Animated.Text>
      </View>
    </View>
  );
} 