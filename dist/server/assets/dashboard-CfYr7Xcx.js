import { jsxs, jsx } from "react/jsx-runtime";
import { Outlet } from "@tanstack/react-router";
import { k as Sheet, l as SheetTrigger, B as Button, d as Badge, h as cn, m as SheetContent, n as SheetHeader, o as SheetTitle, T as Tabs, e as TabsList, f as TabsTrigger, g as TabsContent, I as Input, S as SidebarProvider, q as SidebarInset } from "./prisma-BUnO9f9X.js";
import "clsx";
import { D as DashboardSidebar } from "./DashboardSidebar-CKy-we4B.js";
import { useState, useRef, useEffect, useCallback } from "react";
import "./project.service-Bci2lGYe.js";
import "sonner";
import { useTheme } from "next-themes";
import { S as ScrollArea } from "./scroll-area-D0pODww5.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-BTnsTn8t.js";
import { MessageCircle, Users, Send, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { io } from "socket.io-client";
import { useAuth, useUser } from "@clerk/react";
import "@hookform/resolvers/zod";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "uuid";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "react-hook-form";
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "./dropdown-menu-Bk3fcYaf.js";
function useChat() {
  const { getToken } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error loading messages from localStorage:", error);
      }
    }
  }, []);
  useEffect(() => {
    if (messages.length > 0) {
      const messagesToSave = messages.slice(-100);
      localStorage.setItem("chatMessages", JSON.stringify(messagesToSave));
    }
  }, [messages]);
  useEffect(() => {
    return () => {
      localStorage.removeItem("chatMessages");
    };
  }, []);
  const initializeSocket = useCallback(async (isOpen) => {
    if (!isOpen) return;
    try {
      const token = await getToken();
      if (!token) return;
      const socketUrl = "https://nodejs-realtime-chat-production.up.railway.app";
      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"]
      });
      newSocket.on("connect", () => {
        console.log("✅ Connected to chat server");
        setIsConnected(true);
      });
      newSocket.on("receive_message", (message) => {
        setMessages((prev) => [...prev, message]);
      });
      newSocket.on("users_online", (users) => {
        const uniqueUsers = users.filter(
          (user, index, self) => index === self.findIndex((u) => u.userId === user.userId)
        );
        setOnlineUsers(uniqueUsers);
        setAllUsers((prevAllUsers) => {
          const updatedUsers = [...prevAllUsers];
          const onlineUserIds = new Set(uniqueUsers.map((u) => u.userId));
          updatedUsers.forEach((user) => {
            user.isOnline = onlineUserIds.has(user.userId);
          });
          uniqueUsers.forEach((onlineUser) => {
            if (!updatedUsers.find((u) => u.userId === onlineUser.userId)) {
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
      newSocket.on("connect_error", (error) => {
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
  const sendMessage = useCallback((text, recipientId) => {
    if (!socket || !text.trim()) return;
    const messageData = {
      text: text.trim()
    };
    if (recipientId) {
      messageData.recipientId = recipientId;
    }
    socket.emit("send_message", messageData);
  }, [socket]);
  const startChatWithUser = useCallback((user) => {
    setSelectedUser(user);
    setActiveTab("chat");
  }, []);
  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
  }, []);
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
    initializeSocket
  };
}
function RealtimeChat() {
  const { user: clerkUser } = useUser();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const {
    messages,
    onlineUsers,
    allUsers,
    selectedUser,
    isConnected,
    activeTab,
    searchQuery,
    scrollRef,
    sendMessage,
    startChatWithUser,
    clearSelectedUser,
    setActiveTab,
    setSearchQuery,
    initializeSocket
  } = useChat();
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    let cleanup;
    if (isOpen) {
      initializeSocket(isOpen).then((cleanupFn) => {
        cleanup = cleanupFn;
      });
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [isOpen, initializeSocket]);
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage, selectedUser?.userId);
    setInputMessage("");
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const filteredUsers = allUsers.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return user.username.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query);
  });
  const displayedMessages = selectedUser ? messages.filter(
    (msg) => msg.userId === selectedUser.userId && msg.recipientId === clerkUser?.id || msg.userId === clerkUser?.id && msg.recipientId === selectedUser.userId
  ) : messages.filter((msg) => !msg.recipientId);
  if (!mounted) {
    return null;
  }
  return /* @__PURE__ */ jsxs(Sheet, { open: isOpen, onOpenChange: setIsOpen, children: [
    /* @__PURE__ */ jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      Button,
      {
        size: "icon",
        className: cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-110 z-50",
          theme === "dark" ? "border-2 border-gray-700" : "border-2 border-white"
        ),
        children: [
          /* @__PURE__ */ jsx(MessageCircle, { className: "h-6 w-6 text-white" }),
          onlineUsers.length > 0 && /* @__PURE__ */ jsx(Badge, { className: cn(
            "absolute -top-1 -right-1 h-6 w-6 rounded-full bg-green-500 p-0 flex items-center justify-center text-white font-bold",
            theme === "dark" ? "border-2 border-gray-700" : "border-2 border-white"
          ), children: onlineUsers.length })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(
      SheetContent,
      {
        side: "right",
        className: cn(
          "w-full sm:max-w-md p-0 flex flex-col",
          theme === "dark" ? "bg-gray-950 border-l border-gray-800" : "bg-gray-50"
        ),
        children: [
          /* @__PURE__ */ jsx(SheetHeader, { className: cn(
            "px-6 py-4 border-b shadow-sm",
            theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white"
          ), children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx(SheetTitle, { className: cn(
              "text-2xl font-bold",
              theme === "dark" ? "text-white" : "text-gray-900"
            ), children: selectedUser ? `💬 ${selectedUser.username}` : "💬 Chat" }),
            selectedUser && /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: clearSelectedUser, className: "text-xs", children: "← Back" })
          ] }) }),
          /* @__PURE__ */ jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "flex-1 flex flex-col", children: [
            /* @__PURE__ */ jsxs(TabsList, { className: cn(
              "mx-6 mt-4 grid w-auto grid-cols-2 shadow-sm",
              theme === "dark" ? "bg-gray-900 border border-gray-700" : "bg-white"
            ), children: [
              /* @__PURE__ */ jsxs(TabsTrigger, { value: "chat", className: "gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white", children: [
                /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4" }),
                "Chat"
              ] }),
              /* @__PURE__ */ jsxs(TabsTrigger, { value: "users", className: "gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white", children: [
                /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
                "Users (",
                allUsers.length,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(TabsContent, { value: "chat", className: "flex-1 flex flex-col m-0 mt-4", children: [
              messages.length === 0 && /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 text-center", children: [
                /* @__PURE__ */ jsx(MessageCircle, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                /* @__PURE__ */ jsx("p", { className: cn(
                  "text-sm",
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                ), children: "No messages yet. Start chatting!" })
              ] }),
              /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1 px-6", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 pb-4", children: [
                /* @__PURE__ */ jsx(AnimatePresence, { children: displayedMessages.map((msg, idx) => {
                  const isOwn = msg.userId === clerkUser?.id;
                  const uniqueKey = `${msg.timestamp || Date.now()}-${msg.userId}-${idx}`;
                  return /* @__PURE__ */ jsxs(
                    motion.div,
                    {
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      exit: { opacity: 0, y: -20 },
                      transition: { duration: 0.3 },
                      className: `flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`,
                      children: [
                        /* @__PURE__ */ jsxs(Avatar, { className: cn(
                          "h-9 w-9",
                          theme === "dark" ? "border-2 border-gray-600" : "border-2 border-gray-200"
                        ), children: [
                          /* @__PURE__ */ jsx(AvatarImage, { src: msg.imageUrl, alt: msg.user }),
                          /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-blue-500 text-white text-sm font-semibold", children: msg.user?.charAt(0).toUpperCase() || "?" })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: `flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%]`, children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                            /* @__PURE__ */ jsx("span", { className: cn(
                              "text-xs font-semibold",
                              theme === "dark" ? "text-gray-300" : "text-gray-700"
                            ), children: isOwn ? "You" : msg.user }),
                            msg.timestamp && /* @__PURE__ */ jsx("span", { className: cn(
                              "text-xs",
                              theme === "dark" ? "text-gray-500" : "text-gray-400"
                            ), children: new Date(msg.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) })
                          ] }),
                          /* @__PURE__ */ jsx(
                            "div",
                            {
                              className: cn(
                                "px-4 py-2.5 rounded-2xl shadow-md",
                                isOwn ? "bg-blue-600 text-white" : theme === "dark" ? "bg-gray-800 text-gray-100 border border-gray-600" : "bg-white text-gray-900 border border-gray-200"
                              ),
                              children: /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed", children: msg.text })
                            }
                          )
                        ] })
                      ]
                    },
                    uniqueKey
                  );
                }) }),
                /* @__PURE__ */ jsx("div", { ref: scrollRef })
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: cn(
                "p-4 border-t shadow-lg",
                theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white"
              ), children: [
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      value: inputMessage,
                      onChange: (e) => setInputMessage(e.target.value),
                      onKeyDown: handleKeyPress,
                      placeholder: selectedUser ? `Message ${selectedUser.username}...` : "Type a message...",
                      className: cn(
                        "flex-1 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        theme === "dark" ? "text-white bg-gray-800 placeholder:text-gray-400" : "text-gray-900 bg-gray-50"
                      ),
                      disabled: !isConnected
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      onClick: handleSendMessage,
                      disabled: !isConnected || !inputMessage.trim(),
                      className: "bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
                      size: "icon",
                      children: /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" })
                    }
                  )
                ] }),
                !isConnected && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500 mt-2", children: "⚠️ Disconnected from server" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(TabsContent, { value: "users", className: "flex-1 flex flex-col m-0 mt-4", children: [
              /* @__PURE__ */ jsx("div", { className: "px-6 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Search, { className: cn(
                  "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                ) }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                    placeholder: "Search by email or username...",
                    className: cn(
                      "pl-10 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500",
                      theme === "dark" ? "text-white bg-gray-800 placeholder:text-gray-400" : "text-gray-900 bg-white"
                    )
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1 px-6", children: /* @__PURE__ */ jsx("div", { className: "space-y-2 pb-4", children: filteredUsers.length === 0 ? /* @__PURE__ */ jsxs("div", { className: cn(
                "text-center py-8",
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              ), children: [
                /* @__PURE__ */ jsx(Users, { className: "h-12 w-12 mx-auto mb-2 opacity-50" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm", children: "No users found" })
              ] }) : filteredUsers.map((user) => {
                const isCurrentUser = user.userId === clerkUser?.id;
                return /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, x: -20 },
                    animate: { opacity: 1, x: 0 },
                    whileHover: { scale: 1.02 },
                    className: cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border",
                      isCurrentUser ? theme === "dark" ? "bg-blue-900/30 border-blue-700" : "bg-blue-50 border-blue-200" : theme === "dark" ? "bg-gray-800 hover:bg-blue-900/20 border-gray-600" : "bg-white hover:bg-blue-50 border-gray-200"
                    ),
                    onClick: () => !isCurrentUser && startChatWithUser(user),
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                        /* @__PURE__ */ jsxs(Avatar, { className: cn(
                          "h-11 w-11",
                          theme === "dark" ? "border-2 border-gray-600" : "border-2 border-gray-200"
                        ), children: [
                          /* @__PURE__ */ jsx(AvatarImage, { src: user.imageUrl, alt: user.username }),
                          /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-blue-500 text-white font-semibold", children: user.username?.charAt(0).toUpperCase() || "?" })
                        ] }),
                        user.isOnline && /* @__PURE__ */ jsx("div", { className: cn(
                          "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500",
                          theme === "dark" ? "border-2 border-gray-800" : "border-2 border-white"
                        ) })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxs("p", { className: cn(
                          "font-semibold text-sm truncate",
                          theme === "dark" ? "text-gray-100" : "text-gray-900"
                        ), children: [
                          user.username,
                          isCurrentUser && /* @__PURE__ */ jsx("span", { className: cn(
                            "ml-2 text-xs font-normal",
                            theme === "dark" ? "text-blue-400" : "text-blue-600"
                          ), children: "(You)" })
                        ] }),
                        user.email && /* @__PURE__ */ jsx("p", { className: cn(
                          "text-xs truncate",
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        ), children: user.email })
                      ] }),
                      !isCurrentUser && /* @__PURE__ */ jsx(MessageCircle, { className: cn(
                        "h-5 w-5 shrink-0",
                        theme === "dark" ? "text-blue-400" : "text-blue-600"
                      ) })
                    ]
                  },
                  user.userId
                );
              }) }) })
            ] })
          ] })
        ]
      }
    )
  ] });
}
function DashboardLayout() {
  return /* @__PURE__ */ jsxs(SidebarProvider, { children: [
    /* @__PURE__ */ jsx(DashboardSidebar, {}),
    /* @__PURE__ */ jsx(SidebarInset, { children: /* @__PURE__ */ jsx(Outlet, {}) }),
    /* @__PURE__ */ jsx(RealtimeChat, {})
  ] });
}
export {
  DashboardLayout as component
};
