"use client";

import { motion } from "framer-motion";
import { TrendingUp, Eye, Download, Heart } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChartDataPoint {
  date: string;
  views: number;
  downloads: number;
  likes: number;
}

interface OverviewProps {
  chartData?: ChartDataPoint[];
}

const defaultData: ChartDataPoint[] = [
  {
    date: "Jan 22",
    views: 1240,
    downloads: 320,
    likes: 180,
  },
  {
    date: "Jan 23",
    views: 1580,
    downloads: 420,
    likes: 245,
  },
  {
    date: "Jan 24",
    views: 1920,
    downloads: 580,
    likes: 310,
  },
  {
    date: "Jan 25",
    views: 1680,
    downloads: 490,
    likes: 275,
  },
  {
    date: "Jan 26",
    views: 2100,
    downloads: 650,
    likes: 380,
  },
  {
    date: "Jan 27",
    views: 2440,
    downloads: 720,
    likes: 425,
  },
  {
    date: "Jan 28",
    views: 2280,
    downloads: 680,
    likes: 395,
  },
];

const stats = [
  {
    label: "Total Views",
    value: "13.2K",
    change: "+20.1%",
    icon: Eye,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    label: "Downloads",
    value: "3.86K",
    change: "+15.3%",
    icon: Download,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    label: "Likes",
    value: "2.21K",
    change: "+12.8%",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
];

export function Overview({ chartData }: OverviewProps) {
  const data = chartData && chartData.length > 0 ? chartData : defaultData;
  return (
    <div className="w-full h-full flex justify-center items-stretch px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full space-y-4"
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="relative overflow-hidden bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                        {stat.label}
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold mt-2">
                        {stat.value}
                      </h3>
                      <p className="text-xs sm:text-sm text-green-500 font-medium mt-1">
                        {stat.change} from last week
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-full`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -5 }}
          className="transition-all duration-300"
        >
          <Card className="relative overflow-hidden bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div className="bg-primary/5 absolute -top-[50%] left-[50%] h-[80%] w-[80%] -translate-x-1/2 rounded-full blur-3xl" />
            </div>

            <CardHeader className="px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                  Template Marketplace Analytics
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base">
                  January 22-28, 2024 • Last 7 days
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 lg:px-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <ResponsiveContainer
                  width="100%"
                  height={350}
                  className="sm:h-[350px] md:h-[400px]"
                >
                  <LineChart
                    data={data}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      style={{
                        fontSize: "12px",
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      style={{
                        fontSize: "12px",
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="rounded-lg border bg-background p-3 shadow-lg backdrop-blur-sm"
                            >
                              <div className="text-sm font-medium mb-2">
                                {payload[0].payload.date}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                                  <span className="text-xs text-muted-foreground">
                                    Views:
                                  </span>
                                  <span className="text-sm font-bold">
                                    {payload[0].value}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-500" />
                                  <span className="text-xs text-muted-foreground">
                                    Downloads:
                                  </span>
                                  <span className="text-sm font-bold">
                                    {payload[1].value}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-pink-500" />
                                  <span className="text-xs text-muted-foreground">
                                    Likes:
                                  </span>
                                  <span className="text-sm font-bold">
                                    {payload[2].value}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "12px" }}
                      iconType="circle"
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      strokeWidth={2.5}
                      dot={{
                        r: 4,
                        fill: "rgb(59, 130, 246)",
                        stroke: "hsl(var(--background))",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "rgb(59, 130, 246)",
                        stroke: "hsl(var(--background))",
                        strokeWidth: 2,
                      }}
                      style={{
                        stroke: "rgb(59, 130, 246)",
                        filter: "drop-shadow(0 2px 4px rgb(59 130 246 / 0.3))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="downloads"
                      strokeWidth={2.5}
                      dot={{
                        r: 4,
                        fill: "rgb(34, 197, 94)",
                        stroke: "hsl(var(--background))",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "rgb(34, 197, 94)",
                        stroke: "hsl(var(--background))",
                        strokeWidth: 2,
                      }}
                      style={{
                        stroke: "rgb(34, 197, 94)",
                        filter: "drop-shadow(0 2px 4px rgb(34 197 94 / 0.3))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="likes"
                      strokeWidth={2.5}
                      dot={{
                        r: 4,
                        fill: "rgb(236, 72, 153)",
                        stroke: "hsl(var(--background))",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "rgb(236, 72, 153)",
                        stroke: "hsl(var(--background))",
                        strokeWidth: 2,
                      }}
                      style={{
                        stroke: "rgb(236, 72, 153)",
                        filter: "drop-shadow(0 2px 4px rgb(236 72 153 / 0.3))",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-xs sm:text-sm md:text-base border-t bg-secondary/10 pt-3 sm:pt-4 md:pt-5 px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="flex gap-2 leading-none font-medium text-primary items-center"
              >
                Trending up by 20.1% this month{" "}
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                className="text-muted-foreground leading-none"
              >
                Showing marketplace template metrics for the last 7 days
              </motion.div>
            </CardFooter>

            <div className="from-primary/5 pointer-events-none absolute right-0 bottom-0 left-0 h-1/3 rounded-b-lg bg-linear-to-t to-transparent" />
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}