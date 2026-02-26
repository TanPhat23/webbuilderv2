"use client";

import { motion } from "framer-motion";
import { Activity, Edit2, FileText, Award, Heart, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { ActivityItem, RecentActivitiesCardProps } from "@/features/profile";

export default function RecentActivitiesCard({ projects = [], templates = [] }: RecentActivitiesCardProps) {
  const recentActivities: ActivityItem[] = useMemo(() => {
    const activities: ActivityItem[] = [];
    
    // Add recent project updates
    const recentProjects = [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 2);
    
    recentProjects.forEach(project => {
      const timeDiff = Date.now() - new Date(project.updatedAt).getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      let timeStr = "";
      if (days > 0) {
        timeStr = `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (hours > 0) {
        timeStr = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        timeStr = "Just now";
      }
      
      activities.push({
        action: `Updated project "${project.name}"`,
        time: timeStr,
        icon: Edit2
      });
    });
    
    // Add recent template uploads
    const recentTemplates = [...templates]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 2);
    
    recentTemplates.forEach(template => {
      const timeDiff = Date.now() - (template.createdAt ? new Date(template.createdAt).getTime() : Date.now());
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      let timeStr = "";
      if (days > 0) {
        timeStr = `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (hours > 0) {
        timeStr = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        timeStr = "Just now";
      }
      
      activities.push({
        action: `Published template "${template.title}"`,
        time: timeStr,
        icon: Upload
      });
    });
    
    return activities.slice(0, 4);
  }, [projects, templates]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full">
        <CardHeader className="px-4 sm:px-6 pb-3">
          <CardTitle className="text-base sm:text-lg lg:text-xl flex items-center gap-2">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Recent Activities
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Your latest actions and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 space-y-3 sm:space-y-4">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No recent activities</p>
              <p className="text-xs text-muted-foreground mt-1">Start creating projects to see activities here</p>
            </div>
          ) : (
            recentActivities.map((activity, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 shrink-0">
                  <activity.icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
        <CardFooter className="px-4 sm:px-6 pt-2 pb-4 sm:pb-6">
          <Button
            variant="ghost"
            className="w-full text-xs sm:text-sm h-9 sm:h-10"
          >
            View All Activities
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
