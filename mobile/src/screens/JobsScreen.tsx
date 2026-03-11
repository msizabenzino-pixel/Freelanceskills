import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../theme';
import apiClient from '../api/client';
import { Job } from '../types';
import { Filter, MapPin, Briefcase } from 'lucide-react-native';

const JobsScreen = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/jobs');
        setJobs(response.data);
      } catch (err) {
        console.error('Failed to fetch jobs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [activeTab]);

  const renderJob = ({ item }: { item: Job }) => (
    <TouchableOpacity style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobBudget}>{item.currency} {item.budget}</Text>
      </View>
      <Text style={styles.jobDescription} numberOfLines={2}>{item.description}</Text>
      <View style={styles.jobFooter}>
        <View style={styles.metaBadge}>
          <Briefcase size={12} color={theme.colors.textMuted} />
          <Text style={styles.metaText}>{item.category}</Text>
        </View>
        <Text style={styles.jobDate}>{new Date(item.postedAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Job Board</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {['all', 'fixed', 'hourly'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
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
});

export default JobsScreen;
