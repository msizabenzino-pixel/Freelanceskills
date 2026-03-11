export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'freelancer' | 'client' | 'admin';
}

export interface Job {
  id: number;
  title: string;
  description: string;
  budget: number;
  currency: string;
  status: string;
  category: string;
  postedAt: string;
  clientId: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: number;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface Profile extends User {
  bio?: string;
  skills: string[];
  hourlyRate?: number;
  rating?: number;
  reviewCount?: number;
  location?: string;
}
