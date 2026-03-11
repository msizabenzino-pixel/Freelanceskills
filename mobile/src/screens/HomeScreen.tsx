import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import apiClient from '../api/client';
import { Job } from '../types';
import { Search, Briefcase, TrendingUp } from 'lucide-react-native';

const HomeScreen = () => {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await apiClient.get('/jobs?featured=true');
        setFeaturedJobs(response.data);
      } catch (err) {
        console.error('Failed to fetch featured jobs', err);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    { name: 'Design', icon: 'palette' },
    { name: 'Dev', icon: 'code' },
    { name: 'Writing', icon: 'edit' },
    { name: 'Marketing', icon: 'trending-up' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FreelanceSkills</Text>
        <Text style={styles.subtitle}>Find your next opportunity</Text>
      </View>

      <View style={styles.searchBar}>
        <Search color={theme.colors.textMuted} size={20} />
        <TextInput
          placeholder="Search jobs..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.name} style={styles.categoryCard}>
              <Text style={styles.categoryText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Jobs</Text>
        {featuredJobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobBudget}>Budget: {job.currency} {job.budget}</Text>
            <Text style={styles.jobMeta}>{job.category}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
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
  sectionTitle: { fontSize: 20, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.md },
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
