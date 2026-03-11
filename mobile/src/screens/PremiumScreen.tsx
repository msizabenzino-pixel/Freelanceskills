import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { theme } from '../theme';
import { Check, Star, Zap, Shield, HelpCircle, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAnalytics } from '../hooks/useAnalytics';

const PremiumScreen = () => {
  const navigation = useNavigation();
  const { logPurchase } = useAnalytics();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const features = [
    { title: 'Zero Service Fees', description: 'Keep 100% of what you earn', icon: <Zap size={20} color={theme.colors.primary} /> },
    { title: 'Priority Job Access', description: 'See new jobs 24 hours before everyone else', icon: <Star size={20} color={theme.colors.primary} /> },
    { title: 'Premium Badge', description: 'Stand out with a gold verified badge', icon: <Shield size={20} color={theme.colors.primary} /> },
    { title: 'Unlimited Proposals', description: 'Apply to as many jobs as you want', icon: <Check size={20} color={theme.colors.primary} /> },
    { title: 'AI Assistant', description: 'Get help with proposals and job matching', icon: <Zap size={20} color={theme.colors.primary} /> },
  ];

  const handleSubscribe = () => {
    logPurchase(selectedPlan === 'monthly' ? 'premium_monthly' : 'premium_yearly');
    // Simulated purchase logic
    alert('Subscription successful (Prototype simulation)');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} data-testid="button-back">
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} data-testid="text-premium-title">Upgrade to Premium</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.heroSection}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1579389083078-4e7018379f7e?q=80&w=2070&auto=format&fit=crop' }} 
          style={styles.heroImage} 
        />
        <Text style={styles.heroTitle}>Unlock Your Potential</Text>
        <Text style={styles.heroSubtitle}>Join 10,000+ freelancers growing their careers with Premium.</Text>
      </View>

      <View style={styles.planSelector}>
        <TouchableOpacity 
          style={[styles.planCard, selectedPlan === 'monthly' && styles.selectedPlan]} 
          onPress={() => setSelectedPlan('monthly')}
          data-testid="button-select-monthly"
        >
          <Text style={styles.planName}>Monthly</Text>
          <Text style={styles.planPrice}>$19.99</Text>
          <Text style={styles.planPeriod}>per month</Text>
          {selectedPlan === 'monthly' && <View style={styles.selectedCheck}><Check size={16} color="#fff" /></View>}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.planCard, selectedPlan === 'yearly' && styles.selectedPlan]} 
          onPress={() => setSelectedPlan('yearly')}
          data-testid="button-select-yearly"
        >
          <View style={styles.saveBadge}><Text style={styles.saveText}>SAVE 20%</Text></View>
          <Text style={styles.planName}>Yearly</Text>
          <Text style={styles.planPrice}>$189.99</Text>
          <Text style={styles.planPeriod}>per year</Text>
          {selectedPlan === 'yearly' && <View style={styles.selectedCheck}><Check size={16} color="#fff" /></View>}
        </TouchableOpacity>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Premium Features</Text>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={styles.featureIcon}>{feature.icon}</View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle} data-testid={`text-feature-title-${index}`}>{feature.title}</Text>
              <Text style={styles.featureDesc} data-testid={`text-feature-desc-${index}`}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.guaranteeBox}>
        <Shield size={20} color={theme.colors.textMuted} />
        <Text style={styles.guaranteeText}>Secure payment with Stripe. Cancel anytime.</Text>
      </View>

      <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe} data-testid="button-subscribe">
        <Text style={styles.subscribeText}>Subscribe Now</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.faqLink}>
        <HelpCircle size={16} color={theme.colors.textMuted} />
        <Text style={styles.faqText}>View FAQ & Terms</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: theme.colors.card },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  heroSection: { alignItems: 'center', padding: 24 },
  heroImage: { width: '100%', height: 180, borderRadius: 16, marginBottom: 20 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center' },
  heroSubtitle: { fontSize: 16, color: theme.colors.textMuted, textAlign: 'center', marginTop: 8 },
  planSelector: { flexDirection: 'row', padding: 16, justifyContent: 'space-between' },
  planCard: { 
    flex: 0.48, 
    backgroundColor: theme.colors.card, 
    borderRadius: 16, 
    padding: 20, 
    borderWidth: 2, 
    borderColor: 'transparent',
    alignItems: 'center',
    position: 'relative'
  },
  selectedPlan: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' },
  planName: { fontSize: 16, color: theme.colors.textMuted, marginBottom: 8 },
  planPrice: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
  planPeriod: { fontSize: 12, color: theme.colors.textMuted },
  selectedCheck: { 
    position: 'absolute', 
    top: -10, 
    right: -10, 
    backgroundColor: theme.colors.primary, 
    borderRadius: 12, 
    width: 24, 
    height: 24, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  saveBadge: { position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  saveText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  featuresSection: { padding: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 },
  featureItem: { flexDirection: 'row', marginBottom: 20 },
  featureIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  featureDesc: { fontSize: 14, color: theme.colors.textMuted },
  guaranteeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 20 },
  guaranteeText: { fontSize: 12, color: theme.colors.textMuted, marginLeft: 8 },
  subscribeButton: { marginHorizontal: 24, backgroundColor: theme.colors.primary, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  subscribeText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  faqLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  faqText: { color: theme.colors.textMuted, fontSize: 14, marginLeft: 6, textDecorationLine: 'underline' }
});

export default PremiumScreen;