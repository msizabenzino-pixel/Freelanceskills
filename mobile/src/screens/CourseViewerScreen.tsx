import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { theme } from '../theme';
import apiClient from '../api/client';
import { Lesson, CourseProgress } from '../types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, ChevronRight, ChevronLeft, Play, CheckCircle, Lock, Monitor, FileText, Video } from 'lucide-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const { width } = Dimensions.get('window');

const CourseViewerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { courseId, courseTitle } = route.params;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const currentLesson = lessons[currentLessonIndex];
  
  const player = useVideoPlayer(currentLesson?.videoUrl || '', (player) => {
    player.loop = false;
    player.play();
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsRes, progressRes] = await Promise.all([
          apiClient.get(`/academy/courses/${courseId}/lessons`),
          apiClient.get(`/academy/courses/${courseId}/progress`)
        ]);
        setLessons(lessonsRes.data.sort((a: Lesson, b: Lesson) => a.orderIndex - b.orderIndex));
        setProgress(progressRes.data);
      } catch (err) {
        console.error('Failed to fetch course data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const markComplete = async () => {
    if (!currentLesson) return;
    try {
      await apiClient.post(`/academy/lessons/${currentLesson.id}/complete`);
      // Update local progress
      if (!progress.find(p => p.lessonId === currentLesson.id)) {
        setProgress([...progress, { id: Date.now(), userId: 'me', courseId, lessonId: currentLesson.id, completed: true }]);
      }
      
      // Auto-advance if not last lesson
      if (currentLessonIndex < lessons.length - 1) {
        setCurrentLessonIndex(currentLessonIndex + 1);
      }
    } catch (err) {
      console.error('Failed to mark lesson complete', err);
    }
  };

  const isCompleted = (lessonId: number) => {
    return progress.some(p => p.lessonId === lessonId && p.completed);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} data-testid="button-back">
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} data-testid="text-course-title">{courseTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.videoContainer}>
        {currentLesson?.videoUrl ? (
          <VideoView 
            player={player} 
            style={styles.video} 
            data-testid={`video-lesson-${currentLesson.id}`}
            contentFit="contain"
          />
        ) : (
          <View style={styles.noVideo}>
            <FileText size={48} color={theme.colors.textMuted} />
            <Text style={styles.noVideoText}>This lesson is text-based</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle} data-testid="text-lesson-title">{currentLesson?.title}</Text>
          <Text style={styles.lessonMeta}>Lesson {currentLessonIndex + 1} of {lessons.length}</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressInner, { width: `${(progress.length / lessons.length) * 100}%` }]} data-testid="progress-bar-course" />
        </View>

        <View style={styles.lessonContent}>
          <Text style={styles.contentText} data-testid="text-lesson-content">{currentLesson?.content}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.navButton, currentLessonIndex === 0 && styles.disabledBtn]} 
            onPress={() => setCurrentLessonIndex(prev => Math.max(0, prev - 1))}
            disabled={currentLessonIndex === 0}
            data-testid="button-prev-lesson"
          >
            <ChevronLeft size={24} color={currentLessonIndex === 0 ? theme.colors.textMuted : theme.colors.text} />
            <Text style={[styles.navText, currentLessonIndex === 0 && styles.disabledText]}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.completeButton, isCompleted(currentLesson?.id) && styles.completedBtn]} 
            onPress={markComplete}
            data-testid="button-complete-lesson"
          >
            {isCompleted(currentLesson?.id) ? (
              <>
                <CheckCircle size={20} color="#fff" />
                <Text style={styles.completeText}>Completed</Text>
              </>
            ) : (
              <Text style={styles.completeText}>Mark Complete</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navButton, currentLessonIndex === lessons.length - 1 && styles.disabledBtn]} 
            onPress={() => setCurrentLessonIndex(prev => Math.min(lessons.length - 1, prev + 1))}
            disabled={currentLessonIndex === lessons.length - 1}
            data-testid="button-next-lesson"
          >
            <Text style={[styles.navText, currentLessonIndex === lessons.length - 1 && styles.disabledText]}>Next</Text>
            <ChevronRight size={24} color={currentLessonIndex === lessons.length - 1 ? theme.colors.textMuted : theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.lessonsList}>
          <Text style={styles.listTitle}>Course Content</Text>
          {lessons.map((lesson, index) => (
            <TouchableOpacity 
              key={lesson.id} 
              style={[styles.lessonItem, currentLessonIndex === index && styles.activeLessonItem]}
              onPress={() => setCurrentLessonIndex(index)}
              data-testid={`link-lesson-${lesson.id}`}
            >
              <View style={styles.lessonItemLeft}>
                {isCompleted(lesson.id) ? (
                  <CheckCircle size={20} color={theme.colors.success} />
                ) : (
                  <View style={styles.uncompletedCircle} />
                )}
                <Text style={[styles.lessonItemTitle, currentLessonIndex === index && styles.activeLessonItemTitle]}>
                  {index + 1}. {lesson.title}
                </Text>
              </View>
              {lesson.type === 'video' ? <Video size={16} color={theme.colors.textMuted} /> : <FileText size={16} color={theme.colors.textMuted} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: theme.colors.card, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, flex: 1, textAlign: 'center' },
  videoContainer: { width: '100%', aspectRatio: 16/9, backgroundColor: '#000' },
  video: { flex: 1 },
  noVideo: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noVideoText: { color: theme.colors.textMuted, marginTop: 12 },
  content: { flex: 1, padding: 20 },
  lessonHeader: { marginBottom: 16 },
  lessonTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
  lessonMeta: { fontSize: 14, color: theme.colors.textMuted },
  progressBar: { height: 6, backgroundColor: theme.colors.border, borderRadius: 3, marginBottom: 24, overflow: 'hidden' },
  progressInner: { height: '100%', backgroundColor: theme.colors.primary },
  lessonContent: { marginBottom: 30 },
  contentText: { fontSize: 16, color: theme.colors.text, lineHeight: 24 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  navButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  navText: { fontSize: 14, color: theme.colors.text, marginHorizontal: 4, fontWeight: '600' },
  disabledBtn: { opacity: 0.5 },
  disabledText: { color: theme.colors.textMuted },
  completeButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, flexDirection: 'row', alignItems: 'center', minWidth: 140, justifyContent: 'center' },
  completedBtn: { backgroundColor: theme.colors.success },
  completeText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
  lessonsList: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 30, paddingBottom: 50 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20 },
  lessonItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  activeLessonItem: { backgroundColor: theme.colors.primary + '10', borderRadius: 8, paddingHorizontal: 8 },
  lessonItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  uncompletedCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.border },
  lessonItemTitle: { fontSize: 15, color: theme.colors.text, marginLeft: 12, flex: 1 },
  activeLessonItemTitle: { fontWeight: 'bold', color: theme.colors.primary },
});

export default CourseViewerScreen;