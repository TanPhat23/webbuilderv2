import { RefObject } from "react";

export interface Message {
  text: string;
  user: string;
  userId: string;
  email?: string;
  imageUrl?: string;
  timestamp?: number;
  recipientId?: string;
}

export interface OnlineUser {
  userId: string;
  username: string;
  email?: string;
  imageUrl?: string;
  isOnline?: boolean;
}

export interface ChatState {
  messages: Message[];
  onlineUsers: OnlineUser[];
  allUsers: OnlineUser[];
  selectedUser: OnlineUser | null;
  isConnected: boolean;
  activeTab: string;
  searchQuery: string;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export interface ChatActions {
  sendMessage: (text: string, recipientId?: string) => void;
  startChatWithUser: (user: OnlineUser) => void;
  clearSelectedUser: () => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  initializeSocket: (isOpen: boolean) => Promise<(() => void) | undefined>;
}