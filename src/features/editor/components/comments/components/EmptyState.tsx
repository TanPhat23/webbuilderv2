"use client";

import React from "react";
import { MessageSquare, MousePointerClick } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "message" | "pointer";
  showSelectElement?: boolean;
}

export function EmptyState({
  title,
  description,
  icon = "message",
  showSelectElement = false,
}: EmptyStateProps) {
  const IconComponent = icon === "message" ? MessageSquare : MousePointerClick;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-32 text-center"
    >
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3">
        <IconComponent className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </motion.div>
  );
}
