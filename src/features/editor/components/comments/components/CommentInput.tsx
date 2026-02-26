"use client";

import React from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export function CommentInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Share your thoughts...",
}: CommentInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2 pt-3 border-t-2"
    >
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px] resize-none pr-12 border-border focus:border-primary bg-muted focus:bg-card transition-colors"
          onKeyDown={handleKeyDown}
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <Button
            size="sm"
            onClick={onSubmit}
            disabled={!value.trim() || isLoading}
            className="h-8 px-3 gap-1.5 shadow-md hover:shadow-lg transition-all"
          >
            <Send className="h-3.5 w-3.5" />
            Send
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
          ⌘
        </kbd>
        +
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
          Enter
        </kbd>
        to send
      </p>
    </motion.div>
  );
}
