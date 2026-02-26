"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Send, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { aiContentService } from "@/features/ai";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface AIChatbotBubbleProps {
    onContentGenerated?: (content: string) => void;
    fieldName?: string;
    currentContent?: string;
}

// Typing indicator component
function TypingIndicator() {
    return (
        <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-3">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
            </div>
        </div>
    );
}

export function AIChatbotBubble({ onContentGenerated, fieldName, currentContent }: AIChatbotBubbleProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: fieldName
                ? `Mình sẽ giúp bạn tạo nội dung cho "${fieldName}". Hãy mô tả nội dung bạn muốn tạo.`
                : "Mình có thể giúp gì cho bạn? Hãy mô tả nội dung bạn muốn tạo.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Build context with field information
            let contextString = messages
                .filter((m) => m.role === "user")
                .map((m) => m.content)
                .join("\n");

            if (fieldName) {
                contextString = `Trường đang chỉnh sửa: ${fieldName}\n${contextString}`;
            }

            if (currentContent) {
                contextString = `Nội dung hiện tại:\n${currentContent}\n\n${contextString}`;
            }

            // Use aiContentService from aicontent.ts
            const data = await aiContentService.generateContent({
                prompt: input,
                context: contextString,
                includeImages: true,
            });

            const generatedContent = data.content || data.html || "";

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "✨ Đã tạo nội dung! Nội dung đã được cập nhật vào trường.",
            };

            setMessages((prev) => [...prev, assistantMessage]);

            // Call the callback to insert content
            if (onContentGenerated && generatedContent) {
                onContentGenerated(generatedContent);
            }
        } catch (error) {
            console.error("Error generating content:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-50">
            {isOpen ? (
                <Card className="w-[380px] h-[500px] flex flex-col shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            <span className="font-semibold">AI Content Assistant</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            className="h-8 w-8 p-0 hover:bg-white/20"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex",
                                    message.role === "user" ? "justify-end" : "justify-start",
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-lg px-4 py-2 shadow-sm",
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted",
                                    )}
                                >
                                    <p className="text-sm whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isLoading && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Nhập yêu cầu của bạn..."
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                size="icon"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <Button
                    onClick={() => setIsOpen(true)}
                    size="lg"
                    className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                    <Sparkles className="h-6 w-6" />
                </Button>
            )}
        </div>
    );
}
