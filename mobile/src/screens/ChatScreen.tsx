import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { theme } from '../theme';
import apiClient from '../api/client';
import { connectSocket } from '../api/socket';
import { Message } from '../types';
import { Send, ArrowLeft, Image as ImageIcon, Paperclip } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useHaptics } from '../hooks/useHaptics';
import { CameraService } from '../services/camera';

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { conversationId, participantName } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const { impactLight, impactMedium } = useHaptics();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await apiClient.get(`/conversations/${conversationId}/messages`);
        setMessages(response.data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };

    const initSocket = async () => {
      const s = await connectSocket();
      setSocket(s);
      
      s.emit('join_conversation', conversationId);

      s.on('new_message', (msg: Message) => {
        if (msg.conversationId === conversationId) {
          setMessages(prev => [...prev, msg]);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      });
    };

    fetchMessages();
    initSocket();

    return () => {
      if (socket) {
        socket.emit('leave_conversation', conversationId);
        socket.disconnect();
      }
    };
  }, [conversationId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !socket) return;
    
    impactLight();
    const msgData = {
      conversationId,
      content: inputText,
      type: 'text'
    };

    socket.emit('send_message', msgData);
    setInputText('');
  };

  const sendImage = async () => {
    const hasPermission = await CameraService.requestPermissions();
    if (!hasPermission) return;

    const imageUri = await CameraService.pickImage();
    if (imageUri && socket) {
      impactMedium();
      // In a real app, we would upload the image to a storage bucket first
      // then send the URL via socket. For this prototype, we'll simulate.
      const msgData = {
        conversationId,
        content: 'Sent an image',
        type: 'image',
        fileUrl: imageUri
      };
      socket.emit('send_message', msgData);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === 'me'; // Assuming 'me' for current user in prototype
    return (
      <View style={[styles.msgBubble, isMe ? styles.msgSent : styles.msgReceived]}>
        {item.type === 'image' && item.fileUrl ? (
          <Image source={{ uri: item.fileUrl }} style={styles.msgImage} data-testid={`img-message-${item.id}`} />
        ) : (
          <Text style={[styles.msgText, isMe && styles.msgTextSent]} data-testid={`text-message-content-${item.id}`}>
            {item.content}
          </Text>
        )}
        <Text style={styles.msgTime}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} data-testid="button-back">
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title} data-testid="text-chat-participant">{participantName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        style={styles.msgList}
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputArea}>
        <TouchableOpacity style={styles.iconButton} onPress={sendImage} data-testid="button-send-image">
          <ImageIcon size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} data-testid="button-attach-file">
          <Paperclip size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          data-testid="input-message"
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
          onPress={sendMessage} 
          disabled={!inputText.trim()}
          data-testid="button-send-message"
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: theme.spacing.lg, 
    paddingTop: 60, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card
  },
  title: { color: theme.colors.text, fontSize: 18, fontWeight: 'bold' },
  msgList: { flex: 1, padding: theme.spacing.md },
  msgBubble: { padding: 12, borderRadius: 16, marginBottom: 8, maxWidth: '80%' },
  msgSent: { backgroundColor: theme.colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  msgReceived: { backgroundColor: theme.colors.card, alignSelf: 'flex-start', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: theme.colors.border },
  msgText: { color: theme.colors.text, fontSize: 16 },
  msgTextSent: { color: '#fff' },
  msgTime: { fontSize: 10, color: theme.colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  msgImage: { width: 200, height: 200, borderRadius: 8, marginBottom: 4 },
  inputArea: { 
    flexDirection: 'row', 
    padding: 12, 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card
  },
  iconButton: { padding: 8 },
  input: { 
    flex: 1, 
    backgroundColor: theme.colors.background, 
    color: theme.colors.text, 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    marginHorizontal: 8, 
    maxHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  sendButton: { backgroundColor: theme.colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { backgroundColor: theme.colors.textMuted },
});

export default ChatScreen;