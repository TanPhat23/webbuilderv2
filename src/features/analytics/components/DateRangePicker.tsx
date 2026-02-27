"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  TrendingUp,
  Trophy,
  Star,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface TopTemplate {
  template: string;
  views: number;
  downloads: number;
}

const defaultChartData: TopTemplate[] = [
  {
    template: "E-Commerce Dashboard",
    views: 3860,
    downloads: 892,
  },
  {
    template: "SaaS Admin Panel",
    views: 3540,
    downloads: 784,
  },
  {
    template: "Landing Page Pro",
    views: 3120,
    downloads: 698,
  },
  {
    template: "Portfolio Showcase",
    views: 2890,
    downloads: 612,
  },
  {
    template: "Blog Template",
    views: 2560,
    downloads: 543,
  },
  {
    template: "Analytics Dashboard",
    views: 2340,
    downloads: 489,
  },
];

interface CalendarDateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  topTemplates?: TopTemplate[];
}

export function CalendarDateRangePicker({
  className,
  topTemplates,
}: CalendarDateRangePickerProps) {
  const colors = [
    "rgb(59, 130, 246)",
    "rgb(34, 197, 94)",
    "rgb(168, 85, 247)",
    "rgb(236, 72, 153)",
    "rgb(249, 115, 22)",
    "rgb(14, 165, 233)",
  ];

  const chartDataWithColors = (
    topTemplates && topTemplates.length > 0 ? topTemplates : defaultChartData
  ).map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
  }));
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 20),
    to: new Date(2024, 0, 27),
  });

  const totalViews = chartDataWithColors.reduce(
    (sum, item) => sum + item.views,
    0,
  );
  const totalDownloads = chartDataWithColors.reduce(
    (sum, item) => sum + item.downloads,
    0,
  );
  const avgConversion = ((totalDownloads / totalViews) * 100).toFixed(1);

  return (
    <div className="w-full flex justify-center items-center min-h-[500px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ y: -5 }}
        className="transition-all duration-300 w-full max-w-5xl h-full"
      >
        <Card className="relative overflow-hidden bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
          {/* Background gradient effect */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="bg-primary/5 absolute -bottom-[50%] right-[50%] h-[80%] w-[80%] translate-x-1/2 rounded-full blur-3xl" />
          </div>

          <CardHeader className="px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                    <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                      Top Performing Templates
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm md:text-base mt-2">
                    Most viewed templates in marketplace
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-xs">Premium</span>
                </Badge>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
                <div className="bg-secondary/40 rounded-lg p-2 sm:p-3">
                  <p className="text-[0.65rem] sm:text-xs text-muted-foreground">
                    Total Views
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-500">
                    {(totalViews / 1000).toFixed(1)}K
                  </p>
                </div>
                <div className="bg-secondary/40 rounded-lg p-2 sm:p-3">
                  <p className="text-[0.65rem] sm:text-xs text-muted-foreground">
                    Downloads
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-500">
                    {(totalDownloads / 1000).toFixed(1)}K
                  </p>
                </div>
                <div className="bg-secondary/40 rounded-lg p-2 sm:p-3">
                  <p className="text-[0.65rem] sm:text-xs text-muted-foreground">
                    Avg Conv.
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-500">
                    {avgConversion}%
                  </p>
                </div>
              </div>
            </motion.div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center">
            <motion.div
              className={cn("grid gap-2 mb-4", className)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-75 justify-start text-left font-normal hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-300 text-xs sm:text-sm md:text-base",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {date.from.toLocaleDateString()} -{" "}
                          {date.to.toLocaleDateString()}
                        </>
                      ) : (
                        date.from.toLocaleDateString()
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                ></PopoverContent>
              </Popover>
            </motion.div>

            <motion.div
              className="flex justify-center w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <ResponsiveContainer
                width="100%"
                height={320}
                className="sm:h-[340px] md:h-[360px] lg:h-[380px]"
              >
                <BarChart
                  data={chartDataWithColors}
                  layout="vertical"
                  margin={{
                    left: 0,
                    right: 30,
                    top: 5,
                    bottom: 5,
                  }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="template"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={140}
                    style={{
                      fontSize: "11px",
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    className="sm:text-xs md:text-sm"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-lg border bg-background p-3 shadow-lg backdrop-blur-sm"
                          >
                            <div className="font-medium mb-2">
                              {data.template}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-muted-foreground">
                                  Views:
                                </span>
                                <span className="text-sm font-bold">
                                  {data.views.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-muted-foreground">
                                  Downloads:
                                </span>
                                <span className="text-sm font-bold text-green-500">
                                  {data.downloads.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-muted-foreground">
                                  Conversion:
                                </span>
                                <span className="text-sm font-bold text-purple-500">
                                  {(
                                    (data.downloads / data.views) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="views" radius={[0, 8, 8, 0]}>
                    {chartDataWithColors.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        style={{
                          filter: `drop-shadow(0 2px 4px ${entry.color}40)`,
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-xs sm:text-sm md:text-base border-t bg-secondary/10 pt-3 sm:pt-4 md:pt-5 px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="flex gap-2 leading-none font-medium text-primary items-center"
            >
              E-Commerce Dashboard leading with 3.86K views{" "}
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="text-muted-foreground leading-none"
            >
              Rankings based on total views and engagement metrics
            </motion.div>
          </CardFooter>

          {/* Subtle gradient overlay */}
          <div className="from-primary/5 pointer-events-none absolute right-0 bottom-0 left-0 h-1/3 rounded-b-lg bg-linear-to-t to-transparent" />
        </Card>
      </motion.div>
    </div>
  );
}
