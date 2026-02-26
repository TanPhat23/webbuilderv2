"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";
import { Message, OnlineUser, ChatState, ChatActions } from "../interfaces/chat.interface";

export function useChat(): ChatState & ChatActions {
  const { getToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [allUsers, setAllUsers] = useState<OnlineUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading messages from localStorage:', error);
      }
    }
  }, []);

  // Save messages to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Limit to last 100 messages to prevent localStorage from getting too large
      const messagesToSave = messages.slice(-100);
      localStorage.setItem('chatMessages', JSON.stringify(messagesToSave));
    }
  }, [messages]);

  // Cleanup: remove messages from localStorage when component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem('chatMessages');
    };
  }, []);

  const initializeSocket = useCallback(async (isOpen: boolean): Promise<(() => void) | undefined> => {
    if (!isOpen) return;

    try {
      const token = await getToken();
      if (!token) return;

      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("✅ Connected to chat server");
        setIsConnected(true);
      });

      newSocket.on("receive_message", (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      newSocket.on("users_online", (users: OnlineUser[]) => {
        // Filter out duplicates by userId to prevent React key conflicts
        const uniqueUsers = users.filter((user, index, self) =>
          index === self.findIndex(u => u.userId === user.userId)
        );
        setOnlineUsers(uniqueUsers);
        
        setAllUsers(prevAllUsers => {
          const updatedUsers = [...prevAllUsers];
          const onlineUserIds = new Set(uniqueUsers.map(u => u.userId));
          
          updatedUsers.forEach(user => {
            user.isOnline = onlineUserIds.has(user.userId);
          });
          
          uniqueUsers.forEach(onlineUser => {
            if (!updatedUsers.find(u => u.userId === onlineUser.userId)) {
              updatedUsers.push({ ...onlineUser, isOnline: true });
            }
          });
          
          return updatedUsers;
        });
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Disconnected from chat server");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error : unknown) => {
        console.error("Connection error:", error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    }
  }, [getToken]);

  const sendMessage = useCallback((text: string, recipientId?: string) => {
    if (!socket || !text.trim()) return;

    const messageData: { text: string; recipientId?: string } = {
      text: text.trim(),
    };

    // If recipientId is provided, send direct message
    if (recipientId) {
      messageData.recipientId = recipientId;
    }

    socket.emit("send_message", messageData);
  }, [socket]);

  const startChatWithUser = useCallback((user: OnlineUser) => {
    setSelectedUser(user);
    setActiveTab("chat");
  }, []);

  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
  }, []);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return {
    // State
    messages,
    onlineUsers,
    allUsers,
    selectedUser,
    isConnected,
    activeTab,
    searchQuery,
    scrollRef,

    // Actions
    sendMessage,
    startChatWithUser,
    clearSelectedUser,
    setActiveTab,
    setSearchQuery,
    initializeSocket,
  };
}