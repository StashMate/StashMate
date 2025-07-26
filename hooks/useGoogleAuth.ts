import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';
import { signInWithGoogle } from '../firebase';

interface UseGoogleAuthResult {
  promptAsync: () => void;
  loading: boolean;
  error: string | null;
}

export const useGoogleAuth = (): UseGoogleAuthResult => {
  const router = useRouter();
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const processGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
          const result = await signInWithGoogle(id_token);
          if (result.success && result.user) {
            setUser({ uid: result.user.uid, email: result.user.email, displayName: result.user.displayName });
            router.replace('/(tabs)/dashboard');
          } else {
            setError(result.error || 'An unknown error occurred during Google Sign-In.');
            Alert.alert('Google Sign-In Failed', result.error || 'An unknown error occurred.');
          }
        } catch (err: any) {
          setError(err.message || 'An unexpected error occurred.');
          Alert.alert('Google Sign-In Failed', err.message || 'An unexpected error occurred.');
        } finally {
          setLoading(false);
        }
      };
      processGoogleSignIn();
    } else if (response?.type === 'error') {
      setError(response.error?.message || 'Google Sign-In was cancelled or failed.');
      Alert.alert('Google Sign-In Cancelled', response.error?.message || 'You cancelled the sign-in process.');
    }
  }, [response, setUser, router]);

  return { promptAsync, loading, error };
};
