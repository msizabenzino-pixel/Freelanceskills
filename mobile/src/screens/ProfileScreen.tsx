import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Alert } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { Settings, User, Shield, Bell, LogOut, ChevronRight, Moon, Star, Fingerprint } from 'lucide-react-native';
import { useAnalytics } from '../hooks/useAnalytics';
import { useBiometrics } from '../hooks/useBiometrics';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  
  const { logScreen, logCustomEvent } = useAnalytics();
  const { isCompatible, isEnrolled, authenticate } = useBiometrics();

  useEffect(() => {
    logScreen('Profile');
  }, [logScreen]);

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      const success = await authenticate('Confirm to enable biometric login');
      if (success) {
        setBiometricsEnabled(true);
        logCustomEvent('biometrics_enabled');
      }
    } else {
      setBiometricsEnabled(false);
      logCustomEvent('biometrics_disabled');
    }
  };

  const menuItems = [
    { 
      icon: User, 
      label: 'Personal Information', 
      color: theme.colors.text,
      testId: 'button-personal-info'
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      color: theme.colors.text, 
      isSwitch: true, 
      value: notificationsEnabled, 
      onValueChange: setNotificationsEnabled,
      testId: 'switch-notifications'
    },
    { 
      icon: Moon, 
      label: 'Dark Mode', 
      color: theme.colors.text, 
      isSwitch: true, 
      value: darkMode, 
      onValueChange: setDarkMode,
      testId: 'switch-dark-mode'
    },
    { 
      icon: Fingerprint, 
      label: 'Biometric Login', 
      color: theme.colors.text, 
      isSwitch: true, 
      value: biometricsEnabled, 
      onValueChange: toggleBiometrics,
      disabled: !isCompatible || !isEnrolled,
      testId: 'switch-biometrics'
    },
    { 
      icon: Shield, 
      label: 'Security & Privacy', 
      color: theme.colors.text,
      testId: 'button-security'
    },
    { 
      icon: Settings, 
      label: 'Account Settings', 
      color: theme.colors.text,
      testId: 'button-settings'
    },
  ];

  return (
    <ScrollView style={styles.container} data-testid="screen-profile">
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
             <View style={styles.avatarPlaceholder} data-testid="img-avatar">
                <Text style={styles.avatarInitial}>{user?.username?.charAt(0).toUpperCase() || 'U'}</Text>
             </View>
             {user?.isPremium && (
               <View style={styles.premiumBadge} data-testid="status-premium">
                 <Star size={12} color="#fff" fill="#fff" />
               </View>
             )}
          </View>
          <Text style={styles.name} data-testid="text-username">{user?.fullName || user?.username}</Text>
          <Text style={styles.email} data-testid="text-email">{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'MEMBER'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {menuItems.map((item, idx) => (
          <View key={idx} style={[styles.menuItem, item.disabled && styles.menuItemDisabled]}>
            <item.icon size={22} color={item.disabled ? theme.colors.textMuted : item.color} />
            <Text style={[styles.menuLabel, item.disabled && styles.menuLabelDisabled]}>{item.label}</Text>
            {item.isSwitch ? (
              <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                disabled={item.disabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                data-testid={item.testId}
              />
            ) : (
              <TouchableOpacity data-testid={item.testId}>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={() => {
          Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', onPress: logout, style: 'destructive' }
          ]);
        }}
        data-testid="button-logout"
      >
        <LogOut size={22} color={theme.colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 1.0.0 (Build 120)</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { 
    paddingTop: 80, 
    paddingBottom: 40, 
    backgroundColor: theme.colors.card, 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  profileHeader: { alignItems: 'center' },
  avatarContainer: { marginBottom: 16, position: 'relative' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F59E0B',
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  name: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
  email: { fontSize: 16, color: theme.colors.textMuted, marginBottom: 16 },
  roleBadge: { backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 12 },
  section: { padding: theme.spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textMuted, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border,
  },
  menuItemDisabled: { opacity: 0.5 },
  menuLabel: { flex: 1, marginLeft: 16, fontSize: 16, color: theme.colors.text },
  menuLabelDisabled: { color: theme.colors.textMuted },
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: theme.spacing.lg, 
    marginTop: 20,
    marginHorizontal: theme.spacing.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
  },
  logoutText: { marginLeft: 12, fontSize: 16, color: theme.colors.error, fontWeight: 'bold' },
  footer: { padding: 40, alignItems: 'center' },
  versionText: { color: theme.colors.textMuted, fontSize: 12 },
});

export default ProfileScreen;
