import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { SavingsProvider } from '@/context/SavingsContext';
import { Colors } from '@/constants/Colors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="addGoal" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="addVault" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="linkBank" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="logout" options={{ presentation: 'transparentModal', animation: 'fade_from_bottom', headerShown: false }} />
      <Stack.Screen name="investments" options={{ headerShown: false }} />
      <Stack.Screen name="investment/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="preferences" options={{ headerShown: false }} />
      <Stack.Screen name="account" options={{ headerShown: false }} />
      <Stack.Screen name="rewards" options={{ headerShown: false }} />
      <Stack.Screen name="referrals" options={{ headerShown: false }} />
      <Stack.Screen name="privacyAndSecurity" options={{ headerShown: false }} />
      <Stack.Screen name="chatbot" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <SavingsProvider>
        <RootLayoutNav />
      </SavingsProvider>
    </ThemeProvider>
  );
}
