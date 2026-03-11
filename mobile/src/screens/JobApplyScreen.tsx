import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../theme';
import { ArrowLeft, Mic, Send, Upload, Trash2, CheckCircle } from 'lucide-react-native';
import { useAnalytics } from '../hooks/useAnalytics';
import { useHaptics } from '../hooks/useHaptics';
import { transcribeVoice, VoiceInputService } from '../services/voiceInput';

const JobApplyScreen = ({ route, navigation }: any) => {
  const { jobId, jobTitle } = route.params;
  const [coverLetter, setCoverLetter] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attachments, setAttachments] = useState<{name: string, size: string}[]>([]);

  const { logScreen, logApply, logCustomEvent } = useAnalytics();
  const { impactLight, notificationSuccess } = useHaptics();

  useEffect(() => {
    logScreen(`JobApply_${jobId}`);
  }, [jobId, logScreen]);

  const handleVoiceInput = async () => {
    await impactLight();
    setIsRecording(true);
    
    // Simulate voice recording and transcription
    setTimeout(async () => {
      const transcription = await transcribeVoice();
      setCoverLetter(prev => prev + (prev ? ' ' : '') + transcription);
      setIsRecording(false);
      await impactLight();
    }, 2000);
  };

  const handleUpload = () => {
    // Mock upload functionality
    const newFile = { name: `Resume_Freelancer_${Date.now()}.pdf`, size: '1.2 MB' };
    setAttachments([...attachments, newFile]);
    impactLight();
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    impactLight();
  };

  const handleSubmit = async () => {
    if (!coverLetter) {
      Alert.alert('Error', 'Please provide a cover letter');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      logApply(jobId);
      await notificationSuccess();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <View style={styles.container} data-testid="screen-apply-success">
        <View style={styles.successContent}>
          <CheckCircle size={80} color={theme.colors.success} />
          <Text style={styles.successTitle}>Application Sent!</Text>
          <Text style={styles.successSubtitle}>
            Your application for "{jobTitle}" has been successfully submitted.
          </Text>
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => navigation.popToTop()}
            data-testid="button-done"
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} data-testid={`screen-job-apply-${jobId}`}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          data-testid="button-back"
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply for Job</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitleLabel}>Applying for:</Text>
          <Text style={styles.jobTitleValue}>{jobTitle}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cover Letter</Text>
            <TouchableOpacity 
              onPress={handleVoiceInput} 
              style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
              data-testid="button-voice-input"
            >
              <Mic size={20} color={isRecording ? '#fff' : theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.coverLetterInput}
            placeholder="Introduce yourself and explain why you're a great fit for this job..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            textAlignVertical="top"
            value={coverLetter}
            onChangeText={setCoverLetter}
            data-testid="input-cover-letter"
          />
          {isRecording && (
            <Text style={styles.recordingIndicator}>Listening...</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attachments</Text>
          {attachments.map((file, index) => (
            <View key={index} style={styles.attachmentItem}>
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentName} numberOfLines={1}>{file.name}</Text>
                <Text style={styles.attachmentSize}>{file.size}</Text>
              </View>
              <TouchableOpacity onPress={() => removeAttachment(index)} data-testid={`button-remove-attachment-${index}`}>
                <Trash2 size={20} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleUpload}
            data-testid="button-upload-resume"
          >
            <Upload size={20} color={theme.colors.primary} />
            <Text style={styles.uploadButtonText}>Upload Resume/Portfolio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, (!coverLetter || isSubmitting) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!coverLetter || isSubmitting}
          data-testid="button-submit-application"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Submit Application</Text>
              <Send size={20} color="#fff" style={{ marginLeft: 8 }} />
            </>
          )}
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
    alignItems: 'center',
    paddingHorizontal: 16, 
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  content: { flex: 1, padding: 20 },
  jobInfo: { 
    marginBottom: 24, 
    padding: 16, 
    backgroundColor: theme.colors.card, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  jobTitleLabel: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 4 },
  jobTitleValue: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  voiceButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  voiceButtonActive: { backgroundColor: theme.colors.primary },
  coverLetterInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    color: theme.colors.text,
    minHeight: 200,
    fontSize: 16,
  },
  recordingIndicator: { color: theme.colors.primary, fontSize: 12, marginTop: 8, textAlign: 'center', fontWeight: 'bold' },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    marginTop: 12,
  },
  uploadButtonText: { marginLeft: 8, color: theme.colors.primary, fontWeight: '600' },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 8,
  },
  attachmentInfo: { flex: 1 },
  attachmentName: { color: theme.colors.text, fontWeight: '500' },
  attachmentSize: { color: theme.colors.textMuted, fontSize: 12 },
  footer: { 
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  successContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginTop: 24, marginBottom: 12 },
  successSubtitle: { fontSize: 16, color: theme.colors.textMuted, textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  doneButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  doneButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default JobApplyScreen;
