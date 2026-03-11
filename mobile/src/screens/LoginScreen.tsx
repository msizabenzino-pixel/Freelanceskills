import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import { Mail, Lock, LogIn, Fingerprint } from 'lucide-react-native';
import { useBiometrics } from '../hooks/useBiometrics';
import { useAnalytics } from '../hooks/useAnalytics';

const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { isCompatible, isEnrolled, authenticate } = useBiometrics();
  const { logScreen, logCustomEvent } = useAnalytics();

  useEffect(() => {
    logScreen('Login');
  }, [logScreen]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, token } = response.data;
      await login(user, token);
      logCustomEvent('login_success', { method: 'password' });
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials');
      logCustomEvent('login_failure', { reason: err.response?.data?.message || 'unknown' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    const success = await authenticate('Login with biometrics');
    if (success) {
      // In a real app, we would use a stored token or exchange a biometric secret for a session
      // For this prototype, we'll simulate a successful login if biometrics pass
      // In a real implementation, you'd fetch the user data using the stored secure token
      Alert.alert('Biometric Login', 'Biometric authentication successful!');
      logCustomEvent('login_success', { method: 'biometrics' });
      // login(mockUser, mockToken);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      data-testid="screen-login"
    >
      <View style={styles.header}>
        <Text style={styles.logo} data-testid="text-logo">FreelanceSkills</Text>
        <Text style={styles.subtitle}>Welcome back</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Mail size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor={theme.colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            data-testid="input-email"
          />
        </View>

        <View style={styles.inputGroup}>
          <Lock size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={theme.colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            data-testid="input-password"
          />
        </View>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin} 
          disabled={isLoading}
          data-testid="button-login"
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : (
            <>
              <LogIn size={20} color="#fff" />
              <Text style={styles.loginButtonText}>Log In</Text>
            </>
          )}
        </TouchableOpacity>

        {isCompatible && isEnrolled && (
          <TouchableOpacity 
            style={styles.biometricButton} 
            onPress={handleBiometricLogin}
            data-testid="button-biometric-login"
          >
            <Fingerprint size={24} color={theme.colors.primary} />
            <Text style={styles.biometricText}>Login with Biometrics</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.forgotPassword} data-testid="link-forgot-password">
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity data-testid="link-signup">
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.xl },
  header: { marginTop: 100, marginBottom: 40, alignItems: 'center' },
  logo: { fontSize: 32, fontWeight: 'bold', color: theme.colors.primary },
  subtitle: { fontSize: 18, color: theme.colors.textMuted, marginTop: 8 },
  form: { flex: 1 },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 56, color: theme.colors.text, fontSize: 16 },
  loginButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  biometricText: { color: theme.colors.primary, fontSize: 16, fontWeight: '600', marginLeft: 10 },
  forgotPassword: { marginTop: 20, alignItems: 'center' },
  forgotText: { color: theme.colors.primary, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40 },
  footerText: { color: theme.colors.textMuted },
  signupText: { color: theme.colors.primary, fontWeight: 'bold' },
});

export default LoginScreen;
