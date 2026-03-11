import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import { Mail, Lock, LogIn } from 'lucide-react-native';

const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>FreelanceSkills</Text>
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
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : (
            <>
              <LogIn size={20} color="#fff" />
              <Text style={styles.loginButtonText}>Log In</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  forgotPassword: { marginTop: 20, alignItems: 'center' },
  forgotText: { color: theme.colors.primary, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40 },
  footerText: { color: theme.colors.textMuted },
  signupText: { color: theme.colors.primary, fontWeight: 'bold' },
});

export default LoginScreen;
