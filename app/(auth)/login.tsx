import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { Stack, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { signInWithEmail, signInWithGoogle } from '../../firebase';
import { getAuthStyles } from '../../styles/auth.styles';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { colors } = useTheme();
  const styles = getAuthStyles(colors);
  const router = useRouter();
  const { setUser } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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
        const result = await signInWithGoogle(id_token);
        setLoading(false);
        if (result.success && result.user) {
          setUser({ uid: result.user.uid, email: result.user.email, displayName: result.user.displayName });
          router.replace('/(tabs)/dashboard');
        } else {
          Alert.alert('Google Sign-In Failed', result.error);
        }
      };
      processGoogleSignIn();
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Login Failed', 'Please fill in both email and password.');
      return;
    }
    setLoading(true);
    const result = await signInWithEmail(email, password);
    setLoading(false);

    if (result.success && result.user) {
      setUser(result.user);
      router.replace('/(tabs)/dashboard');
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  const handleAppleSignIn = () => {
    // Apple Sign In is not implemented
    console.log('Bypassing Apple Sign-In');
    setUser({ uid: 'mock-apple-id', email: 'mock.apple.user@apple.com', displayName: 'Mock Apple User' });
    router.replace('/(tabs)/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <FontAwesome5 name="piggy-bank" size={60} color={colors.primary} />
            <Text style={styles.title}>Welcome Back</Text>
          </View>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.secondaryText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordTextInput}
                  placeholder="Password"
                  placeholderTextColor={colors.secondaryText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setPasswordVisible(!passwordVisible)}>
                  <Ionicons name={passwordVisible ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.secondaryText} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OR</Text>
              <View style={styles.separatorLine} />
          </View>

          <View style={styles.socialButtonContainer}>
              <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn} disabled={loading}>
                  <Ionicons name="logo-google" size={22} color={colors.text} style={styles.socialIcon} />
                  <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>
              {Platform.OS === 'ios' && (
                  <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn}>
                      <Ionicons name="logo-apple" size={22} color={colors.text} style={styles.socialIcon} />
                      <Text style={styles.socialButtonText}>Continue with Apple</Text>
                  </TouchableOpacity>
              )}
          </View>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Don't have an account?</Text>
            <TouchableOpacity style={styles.toggleButton} onPress={() => router.push('/signup')}>
              <Text style={styles.toggleButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 