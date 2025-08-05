import { SavingsProvider } from '@/context/SavingsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { BudgetsProvider } from '../context/BudgetsContext';
import { TransactionsProvider } from '../context/TransactionsContext';
import { UserProvider, useUser } from '../context/UserContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <UserProvider>
      <ThemeProvider>
        <SavingsProvider>
          <TransactionsProvider>
            <BudgetsProvider>
              <RootLayoutNav />
            </BudgetsProvider>
          </TransactionsProvider>
        </SavingsProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

function RootLayoutNav() {
  const { user } = useUser();
  const router = useRouter();
  const segments = useSegments();
  
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(tabs)';

    if (user && inAuthGroup) {
      router.replace('/(tabs)/dashboard');
    } else if (!user && inAppGroup) {
      router.replace('/(auth)/login');
    }
  }, [user, segments, router]);

  return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="addVault" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="editTransaction" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="transactionDetail" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="linkBank" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="logout" options={{ presentation: 'transparentModal', animation: 'fade_from_bottom', headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="preferences" options={{ headerShown: false }} />
        <Stack.Screen name="selectBank" options={{ headerShown: false }} />
        <Stack.Screen name="investment" options={{ headerShown: false }} />
        <Stack.Screen name="investmentDetail" options={{ headerShown: false }} />
        <Stack.Screen name="account" options={{ headerShown: false }} />
        <Stack.Screen name="rewards" options={{ headerShown: false }} />
        <Stack.Screen name="referrals" options={{ headerShown: false }} />
        <Stack.Screen name="privacyAndSecurity" options={{ headerShown: false }} />
        <Stack.Screen name="chatbot" options={{ headerShown: false }} />
        <Stack.Screen name="editProfile" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
  );
}
