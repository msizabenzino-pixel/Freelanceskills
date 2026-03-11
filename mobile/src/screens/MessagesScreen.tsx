import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../theme';
import apiClient from '../api/client';
import { connectSocket } from '../api/socket';
import { Conversation, Message } from '../types';
import { Send, ArrowLeft } from 'lucide-react-native';

const MessagesScreen = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await apiClient.get('/conversations');
        setConversations(response.data);
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      }
    };

    const initSocket = async () => {
      const s = await connectSocket();
      setSocket(s);
      
      s.on('new_message', (msg: Message) => {
        if (selectedConv && msg.conversationId === selectedConv.id) {
          setMessages(prev => [...prev, msg]);
        }
      });
    };

    fetchConversations();
    initSocket();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!inputText.trim() || !selectedConv || !socket) return;
    
    const msgData = {
      conversationId: selectedConv.id,
      content: inputText,
    };

    socket.emit('send_message', msgData);
    setInputText('');
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.convCard} onPress={() => setSelectedConv(item)}>
      <View style={styles.avatarPlaceholder} />
      <View style={styles.convInfo}>
        <View style={styles.convHeader}>
          <Text style={styles.convName}>{item.participantName}</Text>
          <Text style={styles.convTime}>{item.lastMessageAt}</Text>
        </View>
        <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      {item.unreadCount > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadText}>{item.unreadCount}</Text></View>}
    </TouchableOpacity>
  );

  if (selectedConv) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedConv(null)}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.chatTitle}>{selectedConv.participantName}</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.msgBubble, item.senderId === 'me' ? styles.msgSent : styles.msgReceived]}>
              <Text style={styles.msgText}>{item.content}</Text>
            </View>
          )}
          style={styles.msgList}
        />

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
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
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.border },
  convInfo: { flex: 1, marginLeft: 12 },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convName: { color: theme.colors.text, fontWeight: 'bold', fontSize: 16 },
  convTime: { color: theme.colors.textMuted, fontSize: 12 },
  lastMsg: { color: theme.colors.textMuted, fontSize: 14 },
  unreadBadge: { backgroundColor: theme.colors.primary, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  // Chat View styles
  chatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.lg, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  chatTitle: { color: theme.colors.text, fontSize: 18, fontWeight: 'bold' },
  msgList: { flex: 1, padding: theme.spacing.md },
  msgBubble: { padding: 12, borderRadius: 16, marginBottom: 8, maxWidth: '80%' },
  msgSent: { backgroundColor: theme.colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  msgReceived: { backgroundColor: theme.colors.card, alignSelf: 'flex-start', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: theme.colors.border },
  msgText: { color: '#fff' },
  inputArea: { flexDirection: 'row', padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border },
  input: { flex: 1, backgroundColor: theme.colors.card, color: theme.colors.text, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, maxHeight: 100 },
  sendButton: { backgroundColor: theme.colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});

export default MessagesScreen;
