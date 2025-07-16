import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { Stack, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { signInWithGoogle, signUpWithEmail } from '../../firebase';
import { getAuthStyles } from '../../styles/auth.styles';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { colors } = useTheme();
  const styles = getAuthStyles(colors);
  const router = useRouter();
  const { setUser } = useUser();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
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

        const result = await signInWithGoogle(id_token);
        
        setLoading(false);
        
        if (result.success && result.user) {
          setUser({ uid: result.user.uid, email: result.user.email, displayName: result.user.displayName });
          Alert.alert("Welcome Back!", `You've signed in successfully.`);
          router.replace('/(tabs)/dashboard');
        } else {
          Alert.alert('Google Sign-In Failed', result.error);
        }
      };

      processGoogleSignIn();
    }
  }, [response]);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Sign Up Failed', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Sign Up Failed', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    // Call the function from firebase.ts
    const result = await signUpWithEmail(fullName, email, password);
    setLoading(false);

    if (result.success && result.user) {
      // On success, set the user and navigate
      setUser(result.user);
      Alert.alert("Welcome!", "Your account has been created successfully.");
      router.replace('/(tabs)/dashboard');
    } else {
      // On failure, show the error message from Firebase
      Alert.alert('Sign Up Failed', result.error);
    }
  };

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.scrollContainer}>
            <View style={styles.logoContainer}>
                <FontAwesome5 name="piggy-bank" size={60} color={colors.primary} />
                <Text style={styles.title}>Create Account</Text>
            </View>
            <Text style={styles.subtitle}>
              Get started with your financial journey
            </Text>

            <View style={styles.formContainer}>
                {/* Email, Password, etc. Inputs remain the same */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={colors.secondaryText}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
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
                        <Ionicons name={passwordVisible ? "eye-outline" : "eye-off-outline"} size={22} color={colors.secondaryText} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordTextInput}
                      placeholder="Confirm Password"
                      placeholderTextColor={colors.secondaryText}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!confirmPasswordVisible}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                      <Ionicons name={confirmPasswordVisible ? "eye-outline" : "eye-off-outline"} size={22} color={colors.secondaryText} />
                  </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
                  <Text style={styles.buttonText}>Sign Up</Text>
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
                    <TouchableOpacity style={styles.socialButton}>
                        <Ionicons name="logo-apple" size={22} color={colors.text} style={styles.socialIcon} />
                        <Text style={styles.socialButtonText}>Continue with Apple</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                Already have an account?
              </Text>
              <TouchableOpacity style={styles.toggleButton} onPress={() => router.push('/login')}>
                <Text style={styles.toggleButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 