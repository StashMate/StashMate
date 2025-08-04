import { FontAwesome5 } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { getWelcomeStyles } from '../styles/welcome.styles';

const brandName = "StashMate";
const tagline = "Your Personal Finance Companion";

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const styles = getWelcomeStyles(colors);

  const iconScale = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  const letterAnimations = brandName.split('').map(() => ({
    opacity: useSharedValue(0),
    translateY: useSharedValue(20),
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }],
    };
  });
  
  const taglineAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: taglineOpacity.value,
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
    };
  });

  useEffect(() => {
    iconScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });

    letterAnimations.forEach((anim, index) => {
      anim.opacity.value = withDelay(
        200 + index * 100,
        withTiming(1, { duration: 400 })
      );
      anim.translateY.value = withDelay(
        200 + index * 100,
        withTiming(0, { duration: 400, easing: Easing.out(Easing.exp) })
      );
    });
    
    taglineOpacity.value = withDelay(1200, withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }));
    buttonOpacity.value = withDelay(1800, withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }));

  }, []);

  const handleGetStarted = () => {
    router.push('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.logoContainer}>
        <Animated.View style={iconAnimatedStyle}>
          <FontAwesome5 name="piggy-bank" size={80} color={colors.primary} />
        </Animated.View>
        <View style={{ flexDirection: 'row' }}>
          {brandName.split('').map((letter, index) => {
            const letterAnimatedStyle = useAnimatedStyle(() => {
              return {
                opacity: letterAnimations[index].opacity.value,
                transform: [{ translateY: letterAnimations[index].translateY.value }],
              };
            });
            return (
              <Animated.Text key={index} style={[styles.logo, { color: colors.primary }, letterAnimatedStyle]}>
                {letter}
              </Animated.Text>
            );
          })}
        </View>
        <Animated.Text style={[styles.tagline, { color: colors.secondaryText }, taglineAnimatedStyle]}>
          {tagline}
        </Animated.Text>
      </View>

      <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}