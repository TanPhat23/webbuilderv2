"use client";

import { motion } from "framer-motion";
import { Bell, CheckCheck, Clock, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNotifications } from "../hooks/useNotifications";
import type { NotificationFilters } from "../interfaces/notification.interface";

interface NotificationStatsProps {
  filter?: string;
  search?: string;
}

export function NotificationStats({ filter, search }: NotificationStatsProps) {
  const filters: NotificationFilters = { filter, search };
  const { data, isLoading } = useNotifications(filters);

  const stats = data?.stats || {
    total: 0,
    unread: 0,
    readToday: 0,
  };

  const statsConfig = [
    {
      label: "Total Notifications",
      value: stats.total.toString(),
      icon: Bell,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      change: "+12.3%",
      changeType: "positive",
    },
    {
      label: "Unread",
      value: stats.unread.toString(),
      icon: Clock,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
      change: `+${stats.unread}`,
      changeType: "neutral",
    },
    {
      label: "Read Today",
      value: stats.readToday.toString(),
      icon: CheckCheck,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
      change: "+8.1%",
      changeType: "positive",
    },
  ];
  return (
    <div className="w-full h-full flex justify-center items-stretch px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
      >
        <Card className="relative overflow-hidden bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="bg-primary/5 absolute -top-[50%] left-[50%] h-[80%] w-[80%] -translate-x-1/2 rounded-full blur-3xl" />
          </div>

          <CardHeader className="px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                Notification Overview
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm md:text-base">
                Your notification summary for this week
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 lg:px-8 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Loading stats...</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 h-full">
                {statsConfig.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative overflow-hidden rounded-lg border bg-card p-4 sm:p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div
                            className={`flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full ${stat.iconBg}`}
                          >
                            <Icon
                              className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconColor}`}
                            />
                          </div>
                          {stat.changeType === "positive" && (
                            <div className="flex items-center gap-1 text-green-500 text-xs sm:text-sm font-medium">
                              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                              {stat.change}
                            </div>
                          )}
                          {stat.changeType === "neutral" && (
                            <div className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm font-medium">
                              {stat.change}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                            {stat.value}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                      <div className="from-primary/[0.03] pointer-events-none absolute right-0 bottom-0 left-0 h-1/2 rounded-b-lg bg-gradient-to-t to-transparent" />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
