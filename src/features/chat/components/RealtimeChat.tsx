"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Send, Search, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../hooks/useChat";
import { cn } from "@/lib/utils";

export default function RealtimeChat() {
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
    initializeSocket,
  } = useChat();

  // Initialize mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize socket when chat opens
  useEffect(() => {
    let cleanup: (() => void) | undefined;

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredUsers = allUsers.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  // Filter messages for selected user (1-1 chat)
  const displayedMessages = selectedUser
    ? messages.filter(
        (msg) =>
          (msg.userId === selectedUser.userId && msg.recipientId === clerkUser?.id) ||
          (msg.userId === clerkUser?.id && msg.recipientId === selectedUser.userId)
      )
    : messages.filter((msg) => !msg.recipientId); // Global chat (no recipientId)

  if (!mounted) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className={cn(
            "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-110 z-50",
            theme === "dark" ? "border-2 border-gray-700" : "border-2 border-white"
          )}
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {onlineUsers.length > 0 && (
            <Badge className={cn(
              "absolute -top-1 -right-1 h-6 w-6 rounded-full bg-green-500 p-0 flex items-center justify-center text-white font-bold",
              theme === "dark" ? "border-2 border-gray-700" : "border-2 border-white"
            )}>
              {onlineUsers.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className={cn(
          "w-full sm:max-w-md p-0 flex flex-col",
          theme === "dark" ? "bg-gray-950 border-l border-gray-800" : "bg-gray-50"
        )}
      >
        <SheetHeader className={cn(
          "px-6 py-4 border-b shadow-sm",
          theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white"
        )}>
          <div className="flex items-center justify-between">
            <SheetTitle className={cn(
              "text-2xl font-bold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}>
              {selectedUser ? `💬 ${selectedUser.username}` : "💬 Chat"}
            </SheetTitle>
            {selectedUser && (
              <Button variant="outline" size="sm" onClick={clearSelectedUser} className="text-xs">
                ← Back
              </Button>
            )}
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className={cn(
            "mx-6 mt-4 grid w-auto grid-cols-2 shadow-sm",
            theme === "dark" ? "bg-gray-900 border border-gray-700" : "bg-white"
          )}>
            <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              Users ({allUsers.length})
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col m-0 mt-4">
            {messages.length === 0 && (
              <div className="px-6 py-4 text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className={cn(
                  "text-sm",
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                )}>No messages yet. Start chatting!</p>
              </div>
            )}
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 pb-4">
                <AnimatePresence>
                  {displayedMessages.map((msg, idx) => {
                    const isOwn = msg.userId === clerkUser?.id;
                    // Create unique key using timestamp and userId to avoid duplicates
                    const uniqueKey = `${msg.timestamp || Date.now()}-${msg.userId}-${idx}`;
                    return (
                      <motion.div
                        key={uniqueKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar className={cn(
                          "h-9 w-9",
                          theme === "dark" ? "border-2 border-gray-600" : "border-2 border-gray-200"
                        )}>
                          <AvatarImage src={msg.imageUrl} alt={msg.user} />
                          <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
                            {msg.user?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%]`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "text-xs font-semibold",
                              theme === "dark" ? "text-gray-300" : "text-gray-700"
                            )}>
                              {isOwn ? "You" : msg.user}
                            </span>
                            {msg.timestamp && (
                              <span className={cn(
                                "text-xs",
                                theme === "dark" ? "text-gray-500" : "text-gray-400"
                              )}>
                                {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <div
                            className={cn(
                              "px-4 py-2.5 rounded-2xl shadow-md",
                              isOwn
                                ? "bg-blue-600 text-white"
                                : theme === "dark"
                                  ? "bg-gray-800 text-gray-100 border border-gray-600"
                                  : "bg-white text-gray-900 border border-gray-200"
                            )}
                          >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className={cn(
              "p-4 border-t shadow-lg",
              theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white"
            )}>
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={selectedUser ? `Message ${selectedUser.username}...` : "Type a message..."}
                  className={cn(
                    "flex-1 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    theme === "dark" ? "text-white bg-gray-800 placeholder:text-gray-400" : "text-gray-900 bg-gray-50"
                  )}
                  disabled={!isConnected}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!isConnected || !inputMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-2">⚠️ Disconnected from server</p>
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="flex-1 flex flex-col m-0 mt-4">
            <div className="px-6 mb-4">
              <div className="relative">
                <Search className={cn(
                  "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                )} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by email or username..."
                  className={cn(
                    "pl-10 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500",
                    theme === "dark" ? "text-white bg-gray-800 placeholder:text-gray-400" : "text-gray-900 bg-white"
                  )}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-2 pb-4">
                {filteredUsers.length === 0 ? (
                  <div className={cn(
                    "text-center py-8",
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  )}>
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No users found</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const isCurrentUser = user.userId === clerkUser?.id;
                    return (
                      <motion.div
                        key={user.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border",
                          isCurrentUser
                            ? theme === "dark"
                              ? "bg-blue-900/30 border-blue-700"
                              : "bg-blue-50 border-blue-200"
                            : theme === "dark"
                              ? "bg-gray-800 hover:bg-blue-900/20 border-gray-600"
                              : "bg-white hover:bg-blue-50 border-gray-200"
                        )}
                        onClick={() => !isCurrentUser && startChatWithUser(user)}
                      >
                        <div className="relative">
                          <Avatar className={cn(
                            "h-11 w-11",
                            theme === "dark" ? "border-2 border-gray-600" : "border-2 border-gray-200"
                          )}>
                            <AvatarImage src={user.imageUrl} alt={user.username} />
                            <AvatarFallback className="bg-blue-500 text-white font-semibold">
                              {user.username?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          {user.isOnline && (
                            <div className={cn(
                              "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500",
                              theme === "dark" ? "border-2 border-gray-800" : "border-2 border-white"
                            )} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-semibold text-sm truncate",
                            theme === "dark" ? "text-gray-100" : "text-gray-900"
                          )}>
                            {user.username}
                            {isCurrentUser && (
                              <span className={cn(
                                "ml-2 text-xs font-normal",
                                theme === "dark" ? "text-blue-400" : "text-blue-600"
                              )}>(You)</span>
                            )}
                          </p>
                          {user.email && (
                            <p className={cn(
                              "text-xs truncate",
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            )}>{user.email}</p>
                          )}
                        </div>
                        {!isCurrentUser && (
                          <MessageCircle className={cn(
                            "h-5 w-5 shrink-0",
                            theme === "dark" ? "text-blue-400" : "text-blue-600"
                          )} />
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
