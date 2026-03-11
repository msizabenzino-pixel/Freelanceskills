import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { Settings, User, Shield, Bell, LogOut, ChevronRight } from 'lucide-react-native';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const menuItems = [
    { icon: User, label: 'Personal Information', color: theme.colors.text },
    { icon: Bell, label: 'Notifications', color: theme.colors.text, isSwitch: true },
    { icon: Shield, label: 'Security & Privacy', color: theme.colors.text },
    { icon: Settings, label: 'Account Settings', color: theme.colors.text },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
             <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{user?.username?.charAt(0).toUpperCase() || 'U'}</Text>
             </View>
          </View>
          <Text style={styles.name}>{user?.fullName || user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'MEMBER'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {menuItems.map((item, idx) => (
          <View key={idx} style={styles.menuItem}>
            <item.icon size={22} color={item.color} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.isSwitch ? (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            ) : (
              <ChevronRight size={20} color={theme.colors.textMuted} />
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
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
  avatarContainer: { marginBottom: 16 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
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
  menuLabel: { flex: 1, marginLeft: 16, fontSize: 16, color: theme.colors.text },
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
