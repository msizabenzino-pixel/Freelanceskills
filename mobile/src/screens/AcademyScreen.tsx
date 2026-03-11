import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import { theme } from '../theme';
import apiClient from '../api/client';
import { Course } from '../types';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BookOpen, Clock, Star, Trophy, Search, Filter } from 'lucide-react-native';
import { useAnalytics } from '../hooks/useAnalytics';

const AcademyScreen = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();
  const { logScreen } = useAnalytics();

  useFocusEffect(
    useCallback(() => {
      logScreen('Academy');
      fetchCourses();
    }, [])
  );

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get('/academy/courses');
      setCourses(response.data);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  const categories = ['All', 'Web Dev', 'Design', 'Marketing', 'Business', 'Writing'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredCourses = selectedCategory === 'All' 
    ? courses 
    : courses.filter(c => c.category === selectedCategory);

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity 
      style={styles.courseCard} 
      onPress={() => navigation.navigate('CourseViewer', { courseId: item.id, courseTitle: item.title })}
      data-testid={`card-course-${item.id}`}
    >
      <Image 
        source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop' }} 
        style={styles.courseImage} 
      />
      <View style={styles.courseContent}>
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}><Text style={styles.categoryText}>{item.category}</Text></View>
          {item.isFree ? (
            <View style={[styles.priceBadge, styles.freeBadge]}><Text style={styles.freeText}>FREE</Text></View>
          ) : (
            <View style={styles.priceBadge}><Text style={styles.priceText}>PREMIUM</Text></View>
          )}
        </View>
        <Text style={styles.courseTitle} numberOfLines={2} data-testid={`text-course-title-${item.id}`}>{item.title}</Text>
        <Text style={styles.courseDesc} numberOfLines={2} data-testid={`text-course-desc-${item.id}`}>{item.description}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <BookOpen size={14} color={theme.colors.textMuted} />
            <Text style={styles.statText}>{item.totalLessons} lessons</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={14} color={theme.colors.textMuted} />
            <Text style={styles.statText}>{item.duration}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title} data-testid="text-academy-title">Academy</Text>
          <TouchableOpacity style={styles.searchButton} data-testid="button-academy-search">
            <Search size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.categoryBtn, selectedCategory === cat && styles.categoryBtnActive]}
              onPress={() => setSelectedCategory(cat)}
              data-testid={`button-category-${cat}`}
            >
              <Text style={[styles.categoryBtnText, selectedCategory === cat && styles.categoryBtnTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText} data-testid="text-no-courses">No courses found in this category</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.card, paddingTop: 60 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text },
  searchButton: { padding: 8 },
  categoryScroll: { paddingHorizontal: 20 },
  categoryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border },
  categoryBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  categoryBtnText: { color: theme.colors.textMuted, fontWeight: '600' },
  categoryBtnTextActive: { color: '#fff' },
  listContent: { padding: 16 },
  courseCard: { backgroundColor: theme.colors.card, borderRadius: 16, marginBottom: 20, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, borderWidth: 1, borderColor: theme.colors.border },
  courseImage: { width: '100%', height: 160 },
  courseContent: { padding: 16 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  categoryBadge: { backgroundColor: theme.colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border },
  categoryText: { fontSize: 10, color: theme.colors.textMuted, fontWeight: 'bold' },
  priceBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  freeBadge: { backgroundColor: theme.colors.primary + '20' },
  freeText: { color: theme.colors.primary, fontSize: 10, fontWeight: 'bold' },
  priceText: { color: '#F59E0B', fontSize: 10, fontWeight: 'bold' },
  courseTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
  courseDesc: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  statText: { fontSize: 12, color: theme.colors.textMuted, marginLeft: 4 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: theme.colors.textMuted, fontSize: 16 },
});

export default AcademyScreen;