import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Clock, CheckCheck, TrendingUp, Filter, Search, Settings, AlertCircle, UserPlus, MessageSquare, Download } from "lucide-react";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-LOcGasZb.js";
import { a as useNotifications, b as useUpdateNotification } from "./notification.service-DgEbN2NO.js";
import { I as Input, B as Button, j as cn } from "./prisma-Cq49YOYM.js";
import "clsx";
import "sonner";
import "@tanstack/react-query";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "uuid";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "@hookform/resolvers/zod";
import "react-hook-form";
import "next-themes";
import "socket.io-client";
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
import "@tanstack/react-router";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
function NotificationStats({ filter, search }) {
  const filters = { filter, search };
  const { data, isLoading } = useNotifications(filters);
  const stats = data?.stats || {
    total: 0,
    unread: 0,
    readToday: 0
  };
  const statsConfig = [
    {
      label: "Total Notifications",
      value: stats.total.toString(),
      icon: Bell,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      change: "+12.3%",
      changeType: "positive"
    },
    {
      label: "Unread",
      value: stats.unread.toString(),
      icon: Clock,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
      change: `+${stats.unread}`,
      changeType: "neutral"
    },
    {
      label: "Read Today",
      value: stats.readToday.toString(),
      icon: CheckCheck,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
      change: "+8.1%",
      changeType: "positive"
    }
  ];
  return /* @__PURE__ */ jsx("div", { className: "w-full h-full flex justify-center items-stretch px-4 sm:px-6 lg:px-8 py-4 sm:py-6", children: /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
      className: "w-full h-full",
      children: /* @__PURE__ */ jsxs(Card, { className: "relative overflow-hidden bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full flex flex-col", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 -z-10 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "bg-primary/5 absolute -top-[50%] left-[50%] h-[80%] w-[80%] -translate-x-1/2 rounded-full blur-3xl" }) }),
        /* @__PURE__ */ jsx(CardHeader, { className: "px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.5, delay: 0.2 },
            children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-base sm:text-lg md:text-xl lg:text-2xl font-bold", children: "Notification Overview" }),
              /* @__PURE__ */ jsx(CardDescription, { className: "text-xs sm:text-sm md:text-base", children: "Your notification summary for this week" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(CardContent, { className: "px-4 sm:px-6 lg:px-8 flex-1", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Loading stats..." }) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 h-full", children: statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, scale: 0.9 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.4, delay: 0.3 + index * 0.1 },
              whileHover: { scale: 1.05, y: -5 },
              className: "relative overflow-hidden rounded-lg border bg-card p-4 sm:p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-md",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: `flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full ${stat.iconBg}`,
                        children: /* @__PURE__ */ jsx(
                          Icon,
                          {
                            className: `h-5 w-5 sm:h-6 sm:w-6 ${stat.iconColor}`
                          }
                        )
                      }
                    ),
                    stat.changeType === "positive" && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-green-500 text-xs sm:text-sm font-medium", children: [
                      /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3 sm:h-4 sm:w-4" }),
                      stat.change
                    ] }),
                    stat.changeType === "neutral" && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 text-muted-foreground text-xs sm:text-sm font-medium", children: stat.change })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-2xl sm:text-3xl md:text-4xl font-bold text-foreground", children: stat.value }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-muted-foreground mt-1", children: stat.label })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "from-primary/[0.03] pointer-events-none absolute right-0 bottom-0 left-0 h-1/2 rounded-b-lg bg-gradient-to-t to-transparent" })
              ]
            },
            stat.label
          );
        }) }) })
      ] })
    }
  ) });
}
function NotificationFilters({
  filter,
  setFilter,
  search,
  setSearch
}) {
  const filters = { filter, search };
  const { data } = useNotifications(filters);
  const filterCounts = data?.filterCounts || {
    all: 0,
    unread: 0,
    messages: 0,
    followers: 0,
    alerts: 0,
    updates: 0
  };
  const filterOptions = [
    { id: "all", label: "All", count: filterCounts.all },
    { id: "unread", label: "Unread", count: filterCounts.unread },
    { id: "message", label: "Messages", count: filterCounts.messages },
    { id: "user", label: "Followers", count: filterCounts.followers },
    { id: "alert", label: "Alerts", count: filterCounts.alerts },
    { id: "settings", label: "Updates", count: filterCounts.updates }
  ];
  const activeFilter = filterOptions.find((f) => f.id === filter) || filterOptions[0];
  return /* @__PURE__ */ jsx("div", { className: "w-full flex justify-center items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6", children: /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay: 0.1 },
      className: "transition-all duration-300 w-full",
      children: /* @__PURE__ */ jsxs(Card, { className: "relative overflow-hidden bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 -z-10 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "bg-primary/5 absolute -bottom-[50%] right-[50%] h-[80%] w-[80%] translate-x-1/2 rounded-full blur-3xl" }) }),
        /* @__PURE__ */ jsx(CardHeader, { className: "px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.5, delay: 0.3 },
            children: [
              /* @__PURE__ */ jsxs(CardTitle, { className: "text-base sm:text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Filter, { className: "h-5 w-5 sm:h-6 sm:w-6" }),
                "Filter Notifications"
              ] }),
              /* @__PURE__ */ jsx(CardDescription, { className: "text-xs sm:text-sm md:text-base", children: "Search and filter your notifications" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "px-4 sm:px-6 lg:px-8 space-y-6", children: [
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.4, delay: 0.4 },
              className: "relative",
              children: [
                /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    placeholder: "Search notifications...",
                    value: search,
                    onChange: (e) => setSearch(e.target.value),
                    className: "pl-10 bg-background/50 border-muted hover:border-primary/30 focus:border-primary transition-colors"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            motion.div,
            {
              className: "flex flex-wrap gap-2",
              initial: { opacity: 0, scale: 0.95 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.4, delay: 0.5 },
              children: filterOptions.map((filterOption, index) => /* @__PURE__ */ jsx(
                motion.div,
                {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.3, delay: 0.6 + index * 0.05 },
                  whileHover: { scale: 1.05 },
                  whileTap: { scale: 0.95 },
                  children: /* @__PURE__ */ jsxs(
                    Button,
                    {
                      variant: filter === filterOption.id ? "default" : "outline",
                      size: "sm",
                      onClick: () => setFilter(filterOption.id),
                      className: cn(
                        "text-xs sm:text-sm md:text-base transition-all duration-300 relative",
                        filter === filterOption.id ? "shadow-md" : "hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
                      ),
                      children: [
                        filterOption.label,
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: cn(
                              "ml-2 px-2 py-0.5 rounded-full text-xs font-semibold",
                              filter === filterOption.id ? "bg-background/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                            ),
                            children: filterOption.count
                          }
                        )
                      ]
                    }
                  )
                },
                filterOption.id
              ))
            }
          ),
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { duration: 0.4, delay: 0.9 },
              className: "text-xs sm:text-sm text-muted-foreground pt-2 border-t",
              children: [
                "Showing",
                " ",
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: activeFilter.count }),
                " ",
                activeFilter.label.toLowerCase(),
                " notifications"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "from-primary/[0.05] pointer-events-none absolute right-0 bottom-0 left-0 h-1/3 rounded-b-lg bg-gradient-to-t to-transparent" })
      ] })
    }
  ) });
}
const iconMap = {
  message: MessageSquare,
  user: UserPlus,
  alert: AlertCircle,
  settings: Settings
};
const iconBgMap = {
  message: "bg-blue-500/10",
  user: "bg-green-500/10",
  alert: "bg-red-500/10",
  settings: "bg-purple-500/10"
};
const iconColorMap = {
  message: "text-blue-500",
  user: "text-green-500",
  alert: "text-red-500",
  settings: "text-purple-500"
};
function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = /* @__PURE__ */ new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1e3);
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
function NotificationList({ filter, search }) {
  const filters = { filter, search };
  const { data, isLoading } = useNotifications(filters);
  const updateNotification = useUpdateNotification();
  const notifications = data?.notifications || [];
  const handleMarkAsRead = (notificationId, currentReadStatus) => {
    updateNotification.mutate({
      notificationId,
      read: !currentReadStatus
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "w-full min-h-1 flex justify-center items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6", children: /* @__PURE__ */ jsxs(Card, { className: "w-full bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "px-4 sm:px-6 lg:px-8 w-full", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base sm:text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5 sm:h-6 sm:w-6" }),
      "Recent Notifications"
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "px-4 sm:px-6 lg:px-8", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Loading notifications..." }) }) : notifications.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "No notifications found" }) }) : /* @__PURE__ */ jsx("div", { className: "w-full space-y-4 sm:space-y-6 lg:space-y-8", children: notifications.map((notification, index) => {
      const Icon = iconMap[notification.Type] || Bell;
      const iconBg = iconBgMap[notification.Type] || "bg-gray-500/10";
      const iconColor = iconColorMap[notification.Type] || "text-gray-500";
      return /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.4, delay: index * 0.1 },
          whileHover: { x: 5, transition: { duration: 0.2 } },
          onClick: () => handleMarkAsRead(notification.Id, notification.Read),
          className: cn(
            "flex items-start group cursor-pointer rounded-lg p-3 sm:p-4 -mx-2 hover:bg-secondary/30 transition-colors duration-200",
            !notification.Read && "bg-secondary/20"
          ),
          children: [
            /* @__PURE__ */ jsx(
              motion.div,
              {
                whileHover: { scale: 1.1 },
                transition: { duration: 0.2 },
                className: cn(
                  "flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200",
                  iconBg
                ),
                children: /* @__PURE__ */ jsx(
                  Icon,
                  {
                    className: cn("h-5 w-5 sm:h-6 sm:w-6", iconColor)
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "ml-3 sm:ml-4 md:ml-5 space-y-1 flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx(
                "p",
                {
                  className: cn(
                    "text-sm sm:text-base md:text-lg font-medium leading-none group-hover:text-primary transition-colors duration-200",
                    !notification.Read && "font-semibold"
                  ),
                  children: notification.Title
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm md:text-base text-muted-foreground line-clamp-1", children: notification.Description }),
              /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-muted-foreground/80", children: getTimeAgo(notification.CreatedAt) })
            ] }),
            !notification.Read && /* @__PURE__ */ jsx(
              motion.div,
              {
                initial: { scale: 0 },
                animate: { scale: 1 },
                className: "ml-2 flex-shrink-0",
                children: /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-primary" })
              }
            )
          ]
        },
        notification.Id
      );
    }) }) })
  ] }) });
}
function NotificationsContent() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const handleDownload = () => {
    console.log("Exporting notifications...");
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col gap-4 p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-2", children: "Notifications" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm sm:text-base text-muted-foreground mt-1", children: "Stay updated with your latest notifications and alerts" })
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: handleDownload, className: "gap-2 w-full sm:w-auto", children: [
        /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
        "Export Report"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6 sm:space-y-8", children: [
      /* @__PURE__ */ jsx(NotificationStats, { filter, search }),
      /* @__PURE__ */ jsx(
        NotificationFilters,
        {
          filter,
          setFilter,
          search,
          setSearch
        }
      ),
      /* @__PURE__ */ jsx(NotificationList, { filter, search })
    ] })
  ] });
}
const SplitComponent = NotificationsContent;
export {
  SplitComponent as component
};
