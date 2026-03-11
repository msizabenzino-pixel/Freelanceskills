import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { theme } from '../theme';
import apiClient from '../api/client';
import { Job } from '../types';
import { Filter, MapPin, Briefcase, WifiOff } from 'lucide-react-native';
import { useOfflineCache } from '../hooks/useOfflineCache';
import { useAnalytics } from '../hooks/useAnalytics';

const JobsScreen = ({ navigation }: any) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: cachedJobs, updateData: cacheJobs, isOffline } = useOfflineCache<Job[]>('jobs_list', []);
  const { logScreen } = useAnalytics();

  const fetchJobs = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const endpoint = activeTab === 'all' ? '/jobs' : `/jobs?type=${activeTab}`;
      const response = await apiClient.get(endpoint);
      setJobs(response.data);
      cacheJobs(response.data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
      if (cachedJobs) {
        setJobs(cachedJobs);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, cacheJobs, cachedJobs]);

  useEffect(() => {
    logScreen('Jobs');
    fetchJobs();
  }, [fetchJobs, logScreen]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobs(true);
  }, [fetchJobs]);

  const renderJob = ({ item }: { item: Job }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
      data-testid={`card-job-${item.id}`}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle} data-testid={`text-job-title-${item.id}`}>{item.title}</Text>
        <Text style={styles.jobBudget} data-testid={`text-job-budget-${item.id}`}>{item.currency} {item.budget}</Text>
      </View>
      <Text style={styles.jobDescription} numberOfLines={2}>{item.description}</Text>
      <View style={styles.jobFooter}>
        <View style={styles.metaBadge}>
          <Briefcase size={12} color={theme.colors.textMuted} />
          <Text style={styles.metaText}>{item.category}</Text>
        </View>
        <Text style={styles.jobDate}>{new Date(item.createdAt || '').toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container} data-testid="screen-jobs">
      {isOffline && (
        <View style={styles.offlineBanner} data-testid="status-offline">
          <WifiOff size={16} color="#fff" />
          <Text style={styles.offlineText}>Offline Mode - Showing Cached Jobs</Text>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.title}>Job Board</Text>
        <TouchableOpacity style={styles.filterButton} data-testid="button-filter">
          <Filter size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {['all', 'fixed', 'hourly'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            data-testid={`button-tab-${tab}`}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No jobs found</Text>
            </View>
          }
        />
      )}
    </View>
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
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: theme.spacing.lg,
    paddingTop: 60,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
  filterButton: { padding: 8, backgroundColor: theme.colors.card, borderRadius: 8 },
  tabs: { 
    flexDirection: 'row', 
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  tab: { 
    marginRight: theme.spacing.md, 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeTab: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  tabText: { color: theme.colors.textMuted, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  listContent: { padding: theme.spacing.lg },
  jobCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  jobTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, flex: 1 },
  jobBudget: { color: theme.colors.primary, fontWeight: '600', marginLeft: 8 },
  jobDescription: { color: theme.colors.textMuted, fontSize: 14, marginBottom: 12 },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 4, borderRadius: 4 },
  metaText: { color: theme.colors.textMuted, fontSize: 12, marginLeft: 4 },
  jobDate: { color: theme.colors.textMuted, fontSize: 12 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: theme.colors.textMuted },
});

export default JobsScreen;
