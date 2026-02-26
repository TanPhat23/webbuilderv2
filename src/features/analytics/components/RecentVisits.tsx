"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Download, Heart, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecentItem {
  id?: string;
  template: string;
  category: string;
  views: number;
  downloads: number;
  likes: number;
  time: string;
  avatar: string;
  trend: string;
  color?: string;
}

interface RecentVisitsProps {
  recentItems?: RecentItem[];
}

const defaultData: RecentItem[] = [
  {
    template: "E-Commerce Dashboard",
    category: "Dashboard",
    views: 1240,
    downloads: 320,
    likes: 180,
    time: "2 minutes ago",
    avatar: "ED",
    trend: "+12%",
    color: "bg-blue-500",
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
    color: "bg-purple-500",
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
    color: "bg-green-500",
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
    color: "bg-orange-500",
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
    color: "bg-pink-500",
  },
];

export function RecentVisits({ recentItems }: RecentVisitsProps) {
  const data =
    recentItems && recentItems.length > 0 ? recentItems : defaultData;
  return (
    <div className="w-full min-h-1 flex justify-center items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <Card className="w-full bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
        <CardHeader className="px-4 sm:px-6 lg:px-8 w-full">
          <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
            Recently Viewed Templates
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Top performing templates in marketplace
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 lg:px-8">
          <div className="w-full space-y-3 sm:space-y-4">
            {data.map((item, index) => (
              <motion.div
                key={item.template}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
                className="group cursor-pointer rounded-lg p-3 sm:p-4 -mx-2 hover:bg-secondary/30 transition-colors duration-200 border border-transparent hover:border-primary/20"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200">
                      <AvatarFallback
                        className={`${item.color} text-white font-bold text-sm sm:text-base`}
                      >
                        {item.avatar}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base md:text-lg font-semibold leading-none group-hover:text-primary transition-colors duration-200 truncate">
                          {item.template}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.time}
                          </span>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-1 text-green-500 font-medium text-xs sm:text-sm shrink-0"
                      >
                        <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {item.trend}
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-1.5 sm:gap-2 text-blue-500"
                      >
                        <div className="bg-blue-500/10 p-1.5 rounded">
                          <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold truncate">
                            {item.views}
                          </p>
                          <p className="text-[0.65rem] sm:text-xs text-muted-foreground">
                            views
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-1.5 sm:gap-2 text-green-500"
                      >
                        <div className="bg-green-500/10 p-1.5 rounded">
                          <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold truncate">
                            {item.downloads}
                          </p>
                          <p className="text-[0.65rem] sm:text-xs text-muted-foreground">
                            downloads
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-1.5 sm:gap-2 text-pink-500"
                      >
                        <div className="bg-pink-500/10 p-1.5 rounded">
                          <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold truncate">
                            {item.likes}
                          </p>
                          <p className="text-[0.65rem] sm:text-xs text-muted-foreground">
                            likes
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Conversion Rate Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Conversion Rate</span>
                        <span className="font-medium">
                          {((item.downloads / item.views) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(item.downloads / item.views) * 100}%`,
                          }}
                          transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                          className="h-full bg-linear-to-r from-green-500 to-green-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}