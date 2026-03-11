import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { theme } from '../theme';
import apiClient from '../api/client';
import { Conversation } from '../types';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAnalytics } from '../hooks/useAnalytics';

const MessagesScreen = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const navigation = useNavigation<any>();
  const { logScreen } = useAnalytics();

  useFocusEffect(
    useCallback(() => {
      logScreen('Messages');
      fetchConversations();
    }, [])
  );

  const fetchConversations = async () => {
    try {
      const response = await apiClient.get('/conversations');
      setConversations(response.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity 
      style={styles.convCard} 
      onPress={() => navigation.navigate('Chat', { conversationId: item.id, participantName: item.participantName })}
      data-testid={`link-conversation-${item.id}`}
    >
      <View style={styles.avatarContainer}>
        {item.participantAvatar ? (
          <Image source={{ uri: item.participantAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
             <Text style={styles.avatarInitial}>{item.participantName.charAt(0)}</Text>
          </View>
        )}
      </View>
      <View style={styles.convInfo}>
        <View style={styles.convHeader}>
          <Text style={styles.convName} data-testid={`text-participant-name-${item.id}`}>{item.participantName}</Text>
          <Text style={styles.convTime} data-testid={`text-last-message-time-${item.id}`}>{item.lastMessageAt}</Text>
        </View>
        <Text style={styles.lastMsg} numberOfLines={1} data-testid={`text-last-message-${item.id}`}>{item.lastMessage}</Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge} data-testid={`status-unread-count-${item.id}`}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} data-testid="text-messages-title">Messages</Text>
      </View>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText} data-testid="text-no-messages">No conversations yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: theme.spacing.lg, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
  listContent: { padding: theme.spacing.md },
  convCard: { 
    flexDirection: 'row', 
    padding: theme.spacing.md, 
    backgroundColor: theme.colors.card, 
    borderRadius: 12, 
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarContainer: { width: 50, height: 50 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  convInfo: { flex: 1, marginLeft: 12 },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convName: { color: theme.colors.text, fontWeight: 'bold', fontSize: 16 },
  convTime: { color: theme.colors.textMuted, fontSize: 12 },
  lastMsg: { color: theme.colors.textMuted, fontSize: 14 },
  unreadBadge: { backgroundColor: theme.colors.primary, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: theme.colors.textMuted, fontSize: 16 },
});

export default MessagesScreen;
