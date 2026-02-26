"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  MessageSquare,
  UserPlus,
  Settings,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useUpdateNotification,
} from "../hooks/useNotifications";
import type {
  Notification,
  NotificationFilters,
  NotificationType,
} from "../interfaces/notification.interface";

interface NotificationListProps {
  filter: string;
  search: string;
}

const iconMap: Record<NotificationType, typeof Bell> = {
  message: MessageSquare,
  user: UserPlus,
  alert: AlertCircle,
  settings: Settings,
};

const iconBgMap: Record<NotificationType, string> = {
  message: "bg-blue-500/10",
  user: "bg-green-500/10",
  alert: "bg-red-500/10",
  settings: "bg-purple-500/10",
};

const iconColorMap: Record<NotificationType, string> = {
  message: "text-blue-500",
  user: "text-green-500",
  alert: "text-red-500",
  settings: "text-purple-500",
};

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export function NotificationList({ filter, search }: NotificationListProps) {
  const filters: NotificationFilters = { filter, search };
  const { data, isLoading } = useNotifications(filters);
  const updateNotification = useUpdateNotification();

  const notifications = data?.notifications || [];

  const handleMarkAsRead = (
    notificationId: string,
    currentReadStatus: boolean
  ) => {
    updateNotification.mutate({
      notificationId,
      read: !currentReadStatus,
    });
  };
  return (
    <div className="w-full min-h-1 flex justify-center items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <Card className="w-full bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
        <CardHeader className="px-4 sm:px-6 lg:px-8 w-full">
          <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No notifications found</p>
            </div>
          ) : (
            <div className="w-full space-y-4 sm:space-y-6 lg:space-y-8">
              {notifications.map((notification, index) => {
                const Icon = iconMap[notification.Type] || Bell;
                const iconBg = iconBgMap[notification.Type] || "bg-gray-500/10";
                const iconColor =
                  iconColorMap[notification.Type] || "text-gray-500";

                return (
                  <motion.div
                    key={notification.Id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    onClick={() =>
                      handleMarkAsRead(notification.Id, notification.Read)
                    }
                    className={cn(
                      "flex items-start group cursor-pointer rounded-lg p-3 sm:p-4 -mx-2 hover:bg-secondary/30 transition-colors duration-200",
                      !notification.Read && "bg-secondary/20"
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200",
                        iconBg
                      )}
                    >
                      <Icon
                        className={cn("h-5 w-5 sm:h-6 sm:w-6", iconColor)}
                      />
                    </motion.div>
                    <div className="ml-3 sm:ml-4 md:ml-5 space-y-1 flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm sm:text-base md:text-lg font-medium leading-none group-hover:text-primary transition-colors duration-200",
                          !notification.Read && "font-semibold"
                        )}
                      >
                        {notification.Title}
                      </p>
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground line-clamp-1">
                        {notification.Description}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground/80">
                        {getTimeAgo(notification.CreatedAt)}
                      </p>
                    </div>
                    {!notification.Read && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-2 flex-shrink-0"
                      >
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
