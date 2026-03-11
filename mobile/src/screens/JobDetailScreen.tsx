import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { theme } from '../theme';
import { MapPin, Calendar, Briefcase, Share2, ArrowLeft, Send } from 'lucide-react-native';
import { useAnalytics } from '../hooks/useAnalytics';

const JobDetailScreen = ({ route, navigation }: any) => {
  const { jobId } = route.params;
  const { logScreen, logCustomEvent } = useAnalytics();

  // Mock job data (in real app, fetch from API)
  const job = {
    id: jobId,
    title: 'Senior React Native Developer',
    description: 'We are looking for an experienced React Native developer to help us build a high-quality mobile application. You will be responsible for implementing complex UI components and integrating with backend services.\n\nRequirements:\n- 3+ years of experience with React Native\n- Strong knowledge of TypeScript\n- Experience with Expo and EAS\n- Good communication skills',
    budget: 5000,
    currency: 'USD',
    category: 'Development',
    location: 'Remote',
    postedAt: '2023-10-27T10:00:00Z',
    company: 'TechFlow Inc.'
  };

  useEffect(() => {
    logScreen(`JobDetail_${jobId}`);
  }, [jobId, logScreen]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this job on FreelanceSkills: ${job.title} at ${job.company}`,
        url: `https://freelanceskills.net/jobs/${jobId}`,
      });
      logCustomEvent('job_shared', { jobId });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container} data-testid={`screen-job-detail-${jobId}`}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          data-testid="button-back"
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleShare} 
          style={styles.backButton}
          data-testid="button-share"
        >
          <Share2 size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title} data-testid="text-job-title">{job.title}</Text>
        <Text style={styles.company} data-testid="text-company">{job.company}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <MapPin size={16} color={theme.colors.textMuted} />
            <Text style={styles.metaText}>{job.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Briefcase size={16} color={theme.colors.textMuted} />
            <Text style={styles.metaText}>{job.category}</Text>
          </View>
          <View style={styles.metaItem}>
            <Calendar size={16} color={theme.colors.textMuted} />
            <Text style={styles.metaText}>{new Date(job.postedAt).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.budgetCard}>
          <Text style={styles.budgetText}>Budget</Text>
          <Text style={styles.budgetAmount} data-testid="text-budget">{job.currency} {job.budget}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description} data-testid="text-description">{job.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={() => navigation.navigate('JobApply', { jobId, jobTitle: job.title })}
          data-testid="button-apply-now"
        >
          <Text style={styles.applyButtonText}>Apply Now</Text>
          <Send size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: { 
    padding: 8, 
    backgroundColor: theme.colors.card, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
  company: { fontSize: 18, color: theme.colors.primary, marginBottom: 20, fontWeight: '600' },
  metaContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 8 },
  metaText: { marginLeft: 6, color: theme.colors.textMuted, fontSize: 14 },
  budgetCard: {
    backgroundColor: theme.colors.card,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 24,
  },
  budgetText: { color: theme.colors.textMuted, fontSize: 14, marginBottom: 4 },
  budgetAmount: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 },
  description: { fontSize: 16, color: theme.colors.text, lineHeight: 24 },
  footer: { 
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default JobDetailScreen;
