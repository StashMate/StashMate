import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { getAuthStyles } from '../styles/auth.styles';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function AuthScreen() {
  const { colors } = useTheme();
  const styles = getAuthStyles(colors);
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleAuth = () => {
    if (isLogin) {
      if (email.trim() && password.trim()) {
        console.log('Successfully signed in with:', email);
        router.replace('/(tabs)/dashboard');
      } else {
        Alert.alert('Sign In Failed', 'Email and password cannot be empty.');
      }
    } else {
      if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
        Alert.alert('Sign Up Failed', 'Please fill in all fields.');
      } else if (password !== confirmPassword) {
        Alert.alert('Sign Up Failed', 'Passwords do not match.');
      } else {
        console.log('Successfully signed up with:', email);
        router.replace('/(tabs)/dashboard');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.logoContainer}>
                <FontAwesome5 name="piggy-bank" size={60} color={colors.primary} />
                <Text style={styles.title}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>
            </View>
            <Text style={styles.subtitle}>
              {isLogin ? 'Sign in to continue' : 'Get started with your financial journey'}
            </Text>

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
                        <Ionicons name={passwordVisible ? "eye-outline" : "eye-off-outline"} size={22} color={colors.secondaryText} />
                    </TouchableOpacity>
                  </View>
                </View>

                {!isLogin && (
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
                        <Ionicons name={confirmPasswordVisible ? "eye-off-outline" : "eye-outline"} size={22} color={colors.secondaryText} />
                    </TouchableOpacity>
                    </View>
                  </View>
                )}

                <TouchableOpacity style={styles.button} onPress={handleAuth}>
                  <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.separatorContainer}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>OR</Text>
                <View style={styles.separatorLine} />
            </View>

            <View style={styles.socialButtonContainer}>
                <TouchableOpacity style={styles.socialButton}>
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
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <TouchableOpacity style={styles.toggleButton} onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.toggleButtonText}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
              </TouchableOpacity>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 