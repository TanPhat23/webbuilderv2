import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Q as QUERY_CONFIG, d as Badge, B as Button, h as cn } from "./prisma-BUnO9f9X.js";
import { Link } from "@tanstack/react-router";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription, e as CardFooter } from "./card-D42cGFKZ.js";
import { motion } from "framer-motion";
import { Eye, Download, Heart, TrendingUp, Trophy, Star, Calendar } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, BarChart, Bar, Cell } from "recharts";
import { A as Avatar, b as AvatarFallback } from "./avatar-BTnsTn8t.js";
import * as React from "react";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-CR7T1iYq.js";
import * as XLSX from "xlsx";
import "./project.service-Bci2lGYe.js";
import "sonner";
import "clsx";
import "next-themes";
import "socket.io-client";
import { S as Skeleton } from "./skeleton-CYb2-ffB.js";
import "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
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
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
const analyticsKeys = {
  all: ["analytics"],
  detail: () => [...analyticsKeys.all, "detail"]
};
function useAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.detail(),
    queryFn: async () => {
      const response = await fetch("/api/analytics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch analytics");
      }
      return response.json();
    },
    ...QUERY_CONFIG.DEFAULT,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1e3 * 2 ** attemptIndex, 3e4)
  });
}
const defaultData$1 = [
  {
    date: "Jan 22",
    views: 1240,
    downloads: 320,
    likes: 180
  },
  {
    date: "Jan 23",
    views: 1580,
    downloads: 420,
    likes: 245
  },
  {
    date: "Jan 24",
    views: 1920,
    downloads: 580,
    likes: 310
  },
  {
    date: "Jan 25",
    views: 1680,
    downloads: 490,
    likes: 275
  },
  {
    date: "Jan 26",
    views: 2100,
    downloads: 650,
    likes: 380
  },
  {
    date: "Jan 27",
    views: 2440,
    downloads: 720,
    likes: 425
  },
  {
    date: "Jan 28",
    views: 2280,
    downloads: 680,
    likes: 395
  }
];
const stats = [
  {
    label: "Total Views",
    value: "13.2K",
    change: "+20.1%",
    icon: Eye,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  {
    label: "Downloads",
    value: "3.86K",
    change: "+15.3%",
    icon: Download,
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  {
    label: "Likes",
    value: "2.21K",
    change: "+12.8%",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10"
  }
];
function Overview({ chartData }) {
  const data = chartData && chartData.length > 0 ? chartData : defaultData$1;
  return /* @__PURE__ */ jsx("div", { className: "w-full h-full flex justify-center items-stretch px-4 sm:px-6 lg:px-8 py-4 sm:py-6", children: /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
      className: "w-full h-full space-y-4",
      children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: stats.map((stat, index) => /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5, delay: index * 0.1 },
            whileHover: { y: -5 },
            children: /* @__PURE__ */ jsx(Card, { className: "relative overflow-hidden bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4 sm:p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-muted-foreground font-medium", children: stat.label }),
                /* @__PURE__ */ jsx("h3", { className: "text-2xl sm:text-3xl font-bold mt-2", children: stat.value }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs sm:text-sm text-green-500 font-medium mt-1", children: [
                  stat.change,
                  " from last week"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: `${stat.bgColor} p-3 rounded-full`, children: /* @__PURE__ */ jsx(stat.icon, { className: `h-6 w-6 ${stat.color}` }) })
            ] }) }) })
          },
          stat.label
        )) }),
        /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5, delay: 0.3 },
            whileHover: { y: -5 },
            className: "transition-all duration-300",
            children: /* @__PURE__ */ jsxs(Card, { className: "relative overflow-hidden bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 -z-10 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "bg-primary/5 absolute -top-[50%] left-[50%] h-[80%] w-[80%] -translate-x-1/2 rounded-full blur-3xl" }) }),
              /* @__PURE__ */ jsx(CardHeader, { className: "px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { duration: 0.5, delay: 0.5 },
                  children: [
                    /* @__PURE__ */ jsx(CardTitle, { className: "text-base sm:text-lg md:text-xl lg:text-2xl font-bold", children: "Template Marketplace Analytics" }),
                    /* @__PURE__ */ jsx(CardDescription, { className: "text-xs sm:text-sm md:text-base", children: "January 22-28, 2024 • Last 7 days" })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx(CardContent, { className: "px-2 sm:px-4 lg:px-8", children: /* @__PURE__ */ jsx(
                motion.div,
                {
                  initial: { opacity: 0, scale: 0.95 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.5, delay: 0.6 },
                  children: /* @__PURE__ */ jsx(
                    ResponsiveContainer,
                    {
                      width: "100%",
                      height: 350,
                      className: "sm:h-[350px] md:h-[400px]",
                      children: /* @__PURE__ */ jsxs(
                        LineChart,
                        {
                          data,
                          margin: { top: 5, right: 10, left: 10, bottom: 5 },
                          children: [
                            /* @__PURE__ */ jsx(
                              CartesianGrid,
                              {
                                vertical: false,
                                strokeDasharray: "3 3",
                                opacity: 0.3
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              XAxis,
                              {
                                dataKey: "date",
                                tickLine: false,
                                axisLine: false,
                                style: {
                                  fontSize: "12px",
                                  fill: "hsl(var(--muted-foreground))"
                                }
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              YAxis,
                              {
                                tickLine: false,
                                axisLine: false,
                                style: {
                                  fontSize: "12px",
                                  fill: "hsl(var(--muted-foreground))"
                                }
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              Tooltip,
                              {
                                content: ({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return /* @__PURE__ */ jsxs(
                                      motion.div,
                                      {
                                        initial: { opacity: 0, scale: 0.9 },
                                        animate: { opacity: 1, scale: 1 },
                                        className: "rounded-lg border bg-background p-3 shadow-lg backdrop-blur-sm",
                                        children: [
                                          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium mb-2", children: payload[0].payload.date }),
                                          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                                            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                                              /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-blue-500" }),
                                              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Views:" }),
                                              /* @__PURE__ */ jsx("span", { className: "text-sm font-bold", children: payload[0].value })
                                            ] }),
                                            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                                              /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-green-500" }),
                                              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Downloads:" }),
                                              /* @__PURE__ */ jsx("span", { className: "text-sm font-bold", children: payload[1].value })
                                            ] }),
                                            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                                              /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-pink-500" }),
                                              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Likes:" }),
                                              /* @__PURE__ */ jsx("span", { className: "text-sm font-bold", children: payload[2].value })
                                            ] })
                                          ] })
                                        ]
                                      }
                                    );
                                  }
                                  return null;
                                }
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              Legend,
                              {
                                wrapperStyle: { fontSize: "12px" },
                                iconType: "circle"
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              Line,
                              {
                                type: "monotone",
                                dataKey: "views",
                                strokeWidth: 2.5,
                                dot: {
                                  r: 4,
                                  fill: "rgb(59, 130, 246)",
                                  stroke: "hsl(var(--background))",
                                  strokeWidth: 2
                                },
                                activeDot: {
                                  r: 6,
                                  fill: "rgb(59, 130, 246)",
                                  stroke: "hsl(var(--background))",
                                  strokeWidth: 2
                                },
                                style: {
                                  stroke: "rgb(59, 130, 246)",
                                  filter: "drop-shadow(0 2px 4px rgb(59 130 246 / 0.3))"
                                }
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              Line,
                              {
                                type: "monotone",
                                dataKey: "downloads",
                                strokeWidth: 2.5,
                                dot: {
                                  r: 4,
                                  fill: "rgb(34, 197, 94)",
                                  stroke: "hsl(var(--background))",
                                  strokeWidth: 2
                                },
                                activeDot: {
                                  r: 6,
                                  fill: "rgb(34, 197, 94)",
                                  stroke: "hsl(var(--background))",
                                  strokeWidth: 2
                                },
                                style: {
                                  stroke: "rgb(34, 197, 94)",
                                  filter: "drop-shadow(0 2px 4px rgb(34 197 94 / 0.3))"
                                }
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              Line,
                              {
                                type: "monotone",
                                dataKey: "likes",
                                strokeWidth: 2.5,
                                dot: {
                                  r: 4,
                                  fill: "rgb(236, 72, 153)",
                                  stroke: "hsl(var(--background))",
                                  strokeWidth: 2
                                },
                                activeDot: {
                                  r: 6,
                                  fill: "rgb(236, 72, 153)",
                                  stroke: "hsl(var(--background))",
                                  strokeWidth: 2
                                },
                                style: {
                                  stroke: "rgb(236, 72, 153)",
                                  filter: "drop-shadow(0 2px 4px rgb(236 72 153 / 0.3))"
                                }
                              }
                            )
                          ]
                        }
                      )
                    }
                  )
                }
              ) }),
              /* @__PURE__ */ jsxs(CardFooter, { className: "flex-col items-start gap-2 text-xs sm:text-sm md:text-base border-t bg-secondary/10 pt-3 sm:pt-4 md:pt-5 px-4 sm:px-6 lg:px-8", children: [
                /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.4, delay: 0.8 },
                    className: "flex gap-2 leading-none font-medium text-primary items-center",
                    children: [
                      "Trending up by 20.1% this month",
                      " ",
                      /* @__PURE__ */ jsx(TrendingUp, { className: "h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.4, delay: 0.9 },
                    className: "text-muted-foreground leading-none",
                    children: "Showing marketplace template metrics for the last 7 days"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "from-primary/5 pointer-events-none absolute right-0 bottom-0 left-0 h-1/3 rounded-b-lg bg-linear-to-t to-transparent" })
            ] })
          }
        )
      ]
    }
  ) });
}
const defaultData = [
  {
    template: "E-Commerce Dashboard",
    category: "Dashboard",
    views: 1240,
    downloads: 320,
    likes: 180,
    time: "2 minutes ago",
    avatar: "ED",
    trend: "+12%",
    color: "bg-blue-500"
  },
  {
    template: "Landing Page Pro",
    category: "Marketing",
    views: 980,
    downloads: 245,
    likes: 142,
    time: "15 minutes ago",
    avatar: "LP",
    trend: "+8%",
    color: "bg-purple-500"
  },
  {
    template: "SaaS Admin Panel",
    category: "Dashboard",
    views: 756,
    downloads: 198,
    likes: 123,
    time: "32 minutes ago",
    avatar: "SA",
    trend: "+15%",
    color: "bg-green-500"
  },
  {
    template: "Blog Template",
    category: "Content",
    views: 645,
    downloads: 167,
    likes: 98,
    time: "1 hour ago",
    avatar: "BT",
    trend: "+5%",
    color: "bg-orange-500"
  },
  {
    template: "Portfolio Showcase",
    category: "Portfolio",
    views: 532,
    downloads: 142,
    likes: 87,
    time: "2 hours ago",
    avatar: "PS",
    trend: "+18%",
    color: "bg-pink-500"
  }
];
function RecentVisits({ recentItems }) {
  const data = recentItems && recentItems.length > 0 ? recentItems : defaultData;
  return /* @__PURE__ */ jsx("div", { className: "w-full min-h-1 flex justify-center items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6", children: /* @__PURE__ */ jsxs(Card, { className: "w-full bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "px-4 sm:px-6 lg:px-8 w-full", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-base sm:text-lg md:text-xl lg:text-2xl font-bold", children: "Recently Viewed Templates" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-muted-foreground mt-1", children: "Top performing templates in marketplace" })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { className: "px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsx("div", { className: "w-full space-y-3 sm:space-y-4", children: data.map((item, index) => /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.4, delay: index * 0.1 },
        whileHover: { x: 5, transition: { duration: 0.2 } },
        className: "group cursor-pointer rounded-lg p-3 sm:p-4 -mx-2 hover:bg-secondary/30 transition-colors duration-200 border border-transparent hover:border-primary/20",
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 sm:gap-4", children: [
          /* @__PURE__ */ jsx(
            motion.div,
            {
              whileHover: { scale: 1.1, rotate: 5 },
              transition: { duration: 0.2 },
              children: /* @__PURE__ */ jsx(Avatar, { className: "h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200", children: /* @__PURE__ */ jsx(
                AvatarFallback,
                {
                  className: `${item.color} text-white font-bold text-sm sm:text-base`,
                  children: item.avatar
                }
              ) })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm sm:text-base md:text-lg font-semibold leading-none group-hover:text-primary transition-colors duration-200 truncate", children: item.template }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1.5", children: [
                  /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: item.category }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: item.time })
                ] })
              ] }),
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  whileHover: { scale: 1.05 },
                  className: "flex items-center gap-1 text-green-500 font-medium text-xs sm:text-sm shrink-0",
                  children: [
                    /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3 sm:h-3.5 sm:w-3.5" }),
                    item.trend
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 sm:gap-3 md:gap-4", children: [
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  whileHover: { scale: 1.05 },
                  className: "flex items-center gap-1.5 sm:gap-2 text-blue-500",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "bg-blue-500/10 p-1.5 rounded", children: /* @__PURE__ */ jsx(Eye, { className: "h-3 w-3 sm:h-3.5 sm:w-3.5" }) }),
                    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm font-bold truncate", children: item.views }),
                      /* @__PURE__ */ jsx("p", { className: "text-[0.65rem] sm:text-xs text-muted-foreground", children: "views" })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  whileHover: { scale: 1.05 },
                  className: "flex items-center gap-1.5 sm:gap-2 text-green-500",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "bg-green-500/10 p-1.5 rounded", children: /* @__PURE__ */ jsx(Download, { className: "h-3 w-3 sm:h-3.5 sm:w-3.5" }) }),
                    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm font-bold truncate", children: item.downloads }),
                      /* @__PURE__ */ jsx("p", { className: "text-[0.65rem] sm:text-xs text-muted-foreground", children: "downloads" })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  whileHover: { scale: 1.05 },
                  className: "flex items-center gap-1.5 sm:gap-2 text-pink-500",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "bg-pink-500/10 p-1.5 rounded", children: /* @__PURE__ */ jsx(Heart, { className: "h-3 w-3 sm:h-3.5 sm:w-3.5" }) }),
                    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm font-bold truncate", children: item.likes }),
                      /* @__PURE__ */ jsx("p", { className: "text-[0.65rem] sm:text-xs text-muted-foreground", children: "likes" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsx("span", { children: "Conversion Rate" }),
                /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                  (item.downloads / item.views * 100).toFixed(1),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-1.5 bg-secondary rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                motion.div,
                {
                  initial: { width: 0 },
                  animate: {
                    width: `${item.downloads / item.views * 100}%`
                  },
                  transition: { duration: 1, delay: index * 0.1 + 0.5 },
                  className: "h-full bg-linear-to-r from-green-500 to-green-400"
                }
              ) })
            ] })
          ] })
        ] })
      },
      item.template
    )) }) })
  ] }) });
}
const defaultChartData = [
  {
    template: "E-Commerce Dashboard",
    views: 3860,
    downloads: 892
  },
  {
    template: "SaaS Admin Panel",
    views: 3540,
    downloads: 784
  },
  {
    template: "Landing Page Pro",
    views: 3120,
    downloads: 698
  },
  {
    template: "Portfolio Showcase",
    views: 2890,
    downloads: 612
  },
  {
    template: "Blog Template",
    views: 2560,
    downloads: 543
  },
  {
    template: "Analytics Dashboard",
    views: 2340,
    downloads: 489
  }
];
function CalendarDateRangePicker({
  className,
  topTemplates
}) {
  const colors = [
    "rgb(59, 130, 246)",
    "rgb(34, 197, 94)",
    "rgb(168, 85, 247)",
    "rgb(236, 72, 153)",
    "rgb(249, 115, 22)",
    "rgb(14, 165, 233)"
  ];
  const chartDataWithColors = (topTemplates && topTemplates.length > 0 ? topTemplates : defaultChartData).map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  }));
  const [date, setDate] = React.useState({
    from: new Date(2024, 0, 20),
    to: new Date(2024, 0, 27)
  });
  const totalViews = chartDataWithColors.reduce(
    (sum, item) => sum + item.views,
    0
  );
  const totalDownloads = chartDataWithColors.reduce(
    (sum, item) => sum + item.downloads,
    0
  );
  const avgConversion = (totalDownloads / totalViews * 100).toFixed(1);
  return /* @__PURE__ */ jsx("div", { className: "w-full flex justify-center items-center min-h-[500px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6", children: /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay: 0.1 },
      whileHover: { y: -5 },
      className: "transition-all duration-300 w-full max-w-5xl h-full",
      children: /* @__PURE__ */ jsxs(Card, { className: "relative overflow-hidden bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full flex flex-col", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 -z-10 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "bg-primary/5 absolute -bottom-[50%] right-[50%] h-[80%] w-[80%] translate-x-1/2 rounded-full blur-3xl" }) }),
        /* @__PURE__ */ jsx(CardHeader, { className: "px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.5, delay: 0.3 },
            className: "space-y-3",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Trophy, { className: "h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" }),
                    /* @__PURE__ */ jsx(CardTitle, { className: "text-base sm:text-lg md:text-xl lg:text-2xl font-bold", children: "Top Performing Templates" })
                  ] }),
                  /* @__PURE__ */ jsx(CardDescription, { className: "text-xs sm:text-sm md:text-base mt-2", children: "Most viewed templates in marketplace" })
                ] }),
                /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Star, { className: "h-3 w-3 fill-yellow-500 text-yellow-500" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Premium" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 sm:gap-4 pt-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-secondary/40 rounded-lg p-2 sm:p-3", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[0.65rem] sm:text-xs text-muted-foreground", children: "Total Views" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-lg sm:text-xl md:text-2xl font-bold text-blue-500", children: [
                    (totalViews / 1e3).toFixed(1),
                    "K"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-secondary/40 rounded-lg p-2 sm:p-3", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[0.65rem] sm:text-xs text-muted-foreground", children: "Downloads" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-lg sm:text-xl md:text-2xl font-bold text-green-500", children: [
                    (totalDownloads / 1e3).toFixed(1),
                    "K"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-secondary/40 rounded-lg p-2 sm:p-3", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[0.65rem] sm:text-xs text-muted-foreground", children: "Avg Conv." }),
                  /* @__PURE__ */ jsxs("p", { className: "text-lg sm:text-xl md:text-2xl font-bold text-purple-500", children: [
                    avgConversion,
                    "%"
                  ] })
                ] })
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center", children: [
          /* @__PURE__ */ jsx(
            motion.div,
            {
              className: cn("grid gap-2 mb-4", className),
              initial: { opacity: 0, scale: 0.95 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.4, delay: 0.4 },
              children: /* @__PURE__ */ jsxs(Popover, { children: [
                /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
                  Button,
                  {
                    id: "date",
                    variant: "outline",
                    className: cn(
                      "w-full sm:w-75 justify-start text-left font-normal hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-300 text-xs sm:text-sm md:text-base",
                      !date && "text-muted-foreground"
                    ),
                    children: [
                      /* @__PURE__ */ jsx(Calendar, { className: "mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" }),
                      date?.from ? date.to ? /* @__PURE__ */ jsxs(Fragment, { children: [
                        date.from.toLocaleDateString(),
                        " -",
                        " ",
                        date.to.toLocaleDateString()
                      ] }) : date.from.toLocaleDateString() : /* @__PURE__ */ jsx("span", { children: "Pick a date range" })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsx(
                  PopoverContent,
                  {
                    className: "w-auto p-0",
                    align: "start"
                  }
                )
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            motion.div,
            {
              className: "flex justify-center w-full",
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.5, delay: 0.5 },
              children: /* @__PURE__ */ jsx(
                ResponsiveContainer,
                {
                  width: "100%",
                  height: 320,
                  className: "sm:h-[340px] md:h-[360px] lg:h-[380px]",
                  children: /* @__PURE__ */ jsxs(
                    BarChart,
                    {
                      data: chartDataWithColors,
                      layout: "vertical",
                      margin: {
                        left: 0,
                        right: 30,
                        top: 5,
                        bottom: 5
                      },
                      children: [
                        /* @__PURE__ */ jsx(XAxis, { type: "number", hide: true }),
                        /* @__PURE__ */ jsx(
                          YAxis,
                          {
                            dataKey: "template",
                            type: "category",
                            tickLine: false,
                            tickMargin: 10,
                            axisLine: false,
                            width: 140,
                            style: {
                              fontSize: "11px",
                              fill: "hsl(var(--muted-foreground))"
                            },
                            className: "sm:text-xs md:text-sm"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          Tooltip,
                          {
                            content: ({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return /* @__PURE__ */ jsxs(
                                  motion.div,
                                  {
                                    initial: { opacity: 0, scale: 0.9 },
                                    animate: { opacity: 1, scale: 1 },
                                    className: "rounded-lg border bg-background p-3 shadow-lg backdrop-blur-sm",
                                    children: [
                                      /* @__PURE__ */ jsx("div", { className: "font-medium mb-2", children: data.template }),
                                      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                                        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
                                          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Views:" }),
                                          /* @__PURE__ */ jsx("span", { className: "text-sm font-bold", children: data.views.toLocaleString() })
                                        ] }),
                                        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
                                          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Downloads:" }),
                                          /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-green-500", children: data.downloads.toLocaleString() })
                                        ] }),
                                        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
                                          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Conversion:" }),
                                          /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-purple-500", children: [
                                            (data.downloads / data.views * 100).toFixed(1),
                                            "%"
                                          ] })
                                        ] })
                                      ] })
                                    ]
                                  }
                                );
                              }
                              return null;
                            }
                          }
                        ),
                        /* @__PURE__ */ jsx(Bar, { dataKey: "views", radius: [0, 8, 8, 0], children: chartDataWithColors.map((entry, index) => /* @__PURE__ */ jsx(
                          Cell,
                          {
                            fill: entry.color,
                            style: {
                              filter: `drop-shadow(0 2px 4px ${entry.color}40)`
                            }
                          },
                          `cell-${index}`
                        )) })
                      ]
                    }
                  )
                }
              )
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(CardFooter, { className: "flex-col items-start gap-2 text-xs sm:text-sm md:text-base border-t bg-secondary/10 pt-3 sm:pt-4 md:pt-5 px-4 sm:px-6 lg:px-8", children: [
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.4, delay: 0.7 },
              className: "flex gap-2 leading-none font-medium text-primary items-center",
              children: [
                "E-Commerce Dashboard leading with 3.86K views",
                " ",
                /* @__PURE__ */ jsx(TrendingUp, { className: "h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.4, delay: 0.8 },
              className: "text-muted-foreground leading-none",
              children: "Rankings based on total views and engagement metrics"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "from-primary/5 pointer-events-none absolute right-0 bottom-0 left-0 h-1/3 rounded-b-lg bg-linear-to-t to-transparent" })
      ] })
    }
  ) });
}
function AnalyticsContent() {
  const { data, isLoading, error, refetch } = useAnalytics();
  const handleDownload = () => {
    if (!data) return;
    const workbook = XLSX.utils.book_new();
    const statsSheet = XLSX.utils.json_to_sheet([data.stats]);
    statsSheet["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, statsSheet, "Overview Stats");
    const trafficSheet = XLSX.utils.json_to_sheet(data.chartData);
    trafficSheet["!cols"] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, trafficSheet, "Daily Metrics");
    const visitsSheet = XLSX.utils.json_to_sheet(data.recentItems);
    visitsSheet["!cols"] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(
      workbook,
      visitsSheet,
      "Recent Template Views"
    );
    const topSheet = XLSX.utils.json_to_sheet(data.topTemplates);
    topSheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, topSheet, "Top Templates");
    const fileName = `marketplace_analytics_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "flex flex-1 flex-col gap-4 p-4", children: /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-red-500", children: [
        "Error loading analytics: ",
        error.message
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: () => refetch(), className: "mt-4", children: "Try Again" })
    ] }) });
  }
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col gap-4 p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-2", children: "Marketplace Analytics" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm sm:text-base text-muted-foreground mt-1", children: "Track template performance and engagement metrics" })
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: handleDownload,
          className: "gap-2 w-full sm:w-auto",
          disabled: !data || isLoading,
          children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
            "Export Report"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: isLoading ? /* @__PURE__ */ jsx(Fragment, { children: [...Array(4)].map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-32 w-full rounded-lg" }, i)) }) : data ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(Card, { className: "hover:shadow-lg transition-shadow duration-300", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Total Views" }),
          /* @__PURE__ */ jsxs(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "2",
              className: "h-4 w-4 text-blue-500",
              children: [
                /* @__PURE__ */ jsx("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }),
                /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold", children: [
            (data.stats.totalViews / 1e3).toFixed(1),
            "K"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-green-500 font-medium", children: "Real-time data" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "hover:shadow-lg transition-shadow duration-300", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Downloads" }),
          /* @__PURE__ */ jsxs(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "2",
              className: "h-4 w-4 text-green-500",
              children: [
                /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                /* @__PURE__ */ jsx("polyline", { points: "7 10 12 15 17 10" }),
                /* @__PURE__ */ jsx("line", { x1: "12", x2: "12", y1: "15", y2: "3" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold", children: [
            (data.stats.totalDownloads / 1e3).toFixed(1),
            "K"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-green-500 font-medium", children: "Real-time data" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "hover:shadow-lg transition-shadow duration-300", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Total Likes" }),
          /* @__PURE__ */ jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "2",
              className: "h-4 w-4 text-pink-500",
              children: /* @__PURE__ */ jsx("path", { d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold", children: [
            (data.stats.totalLikes / 1e3).toFixed(1),
            "K"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-green-500 font-medium", children: "Real-time data" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "hover:shadow-lg transition-shadow duration-300", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Conversion Rate" }),
          /* @__PURE__ */ jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "2",
              className: "h-4 w-4 text-purple-500",
              children: /* @__PURE__ */ jsx("polyline", { points: "22 12 18 12 15 21 9 3 6 12 2 12" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold", children: [
            data.stats.conversionRate.toFixed(1),
            "%"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-green-500 font-medium", children: "Real-time data" })
        ] })
      ] })
    ] }) : null }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: isLoading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-96 w-full rounded-lg" }) : /* @__PURE__ */ jsx(Overview, { chartData: data?.chartData }) }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: isLoading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-96 w-full rounded-lg" }) : /* @__PURE__ */ jsx(CalendarDateRangePicker, { topTemplates: data?.topTemplates }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "w-full", children: isLoading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-96 w-full rounded-lg" }) : /* @__PURE__ */ jsx(RecentVisits, { recentItems: data?.recentItems }) }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end pt-4", children: /* @__PURE__ */ jsx(Link, { to: "/dashboard", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "gap-2", children: [
      /* @__PURE__ */ jsxs(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "2",
          className: "h-4 w-4",
          children: [
            /* @__PURE__ */ jsx("path", { d: "m12 19-7-7 7-7" }),
            /* @__PURE__ */ jsx("path", { d: "M19 12H5" })
          ]
        }
      ),
      "Back to Dashboard"
    ] }) }) })
  ] }) });
}
function AnalyticsPage() {
  return /* @__PURE__ */ jsx(AnalyticsContent, {});
}
export {
  AnalyticsPage as component
};
