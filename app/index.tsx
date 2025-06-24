import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { styles } from '../styles/welcome.styles';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withDelay } from 'react-native-reanimated';
import { router, Stack } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const brandName = "StashMate";

export default function WelcomeScreen() {
  const { colors } = useTheme();
  
  const iconScale = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

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

    const timer = setTimeout(() => {
      router.replace('/auth');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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
      </View>
    </View>
  );
} 