import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { theme } from '../theme';
import apiClient from '../api/client';
import { Job } from '../types';
import { Search, Briefcase, TrendingUp, MapPin, WifiOff } from 'lucide-react-native';
import { useOfflineCache } from '../hooks/useOfflineCache';
import { useLocation } from '../hooks/useLocation';
import { useAnalytics } from '../hooks/useAnalytics';

const HomeScreen = ({ navigation }: any) => {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [nearbyJobs, setNearbyJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: cachedFeatured, updateData: cacheFeatured, isOffline } = useOfflineCache<Job[]>('featured_jobs', []);
  const { location } = useLocation();
  const { logScreen } = useAnalytics();

  const fetchJobs = useCallback(async () => {
    try {
      const response = await apiClient.get('/jobs?featured=true');
      setFeaturedJobs(response.data);
      cacheFeatured(response.data);
      
      // Fetch nearby if location is available
      if (location) {
        const nearbyResponse = await apiClient.get(`/jobs?lat=${location.coords.latitude}&lng=${location.coords.longitude}`);
        setNearbyJobs(nearbyResponse.data);
      }
    } catch (err) {
      console.error('Failed to fetch jobs', err);
      if (cachedFeatured) {
        setFeaturedJobs(cachedFeatured);
      }
    }
  }, [location, cacheFeatured, cachedFeatured]);

  useEffect(() => {
    logScreen('Home');
    fetchJobs();
  }, [fetchJobs, logScreen]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  }, [fetchJobs]);

  const categories = [
    { name: 'Design', icon: 'palette' },
    { name: 'Dev', icon: 'code' },
    { name: 'Writing', icon: 'edit' },
    { name: 'Marketing', icon: 'trending-up' },
  ];

  return (
    <ScrollView 
      style={styles.container}
      data-testid="screen-home"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
    >
      {isOffline && (
        <View style={styles.offlineBanner} data-testid="status-offline">
          <WifiOff size={16} color="#fff" />
          <Text style={styles.offlineText}>You are offline. Showing cached content.</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title} data-testid="text-app-title">FreelanceSkills</Text>
        <Text style={styles.subtitle}>Find your next opportunity</Text>
      </View>

      <View style={styles.searchBar}>
        <Search color={theme.colors.textMuted} size={20} />
        <TextInput
          placeholder="Search jobs..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          data-testid="input-search-jobs"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.name} 
              style={styles.categoryCard}
              data-testid={`button-category-${cat.name.toLowerCase()}`}
            >
              <Text style={styles.categoryText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {nearbyJobs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Jobs</Text>
            <MapPin size={18} color={theme.colors.primary} />
          </View>
          {nearbyJobs.map((job) => (
            <TouchableOpacity 
              key={job.id} 
              style={styles.jobCard}
              onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
              data-testid={`card-job-nearby-${job.id}`}
            >
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobBudget}>Budget: {job.currency} {job.budget}</Text>
              <Text style={styles.jobMeta}>{job.location || 'Remote'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Jobs</Text>
        {featuredJobs.map((job) => (
          <TouchableOpacity 
            key={job.id} 
            style={styles.jobCard}
            onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
            data-testid={`card-job-featured-${job.id}`}
          >
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobBudget}>Budget: {job.currency} {job.budget}</Text>
            <Text style={styles.jobMeta}>{job.category}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  offlineBanner: {
    backgroundColor: theme.colors.error,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineText: { color: '#fff', fontSize: 12, marginLeft: 8, fontWeight: '600' },
  header: { padding: theme.spacing.lg, paddingTop: theme.spacing.xl },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text },
  subtitle: { color: theme.colors.textMuted, fontSize: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: { marginLeft: 10, color: theme.colors.text, flex: 1 },
  section: { padding: theme.spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: theme.colors.text },
  categoryGrid: { flexDirection: 'row' },
  categoryCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryText: { color: theme.colors.text },
  jobCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  jobTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text },
  jobBudget: { color: theme.colors.primary, marginVertical: 4 },
  jobMeta: { color: theme.colors.textMuted, fontSize: 12 },
});

export default HomeScreen;
