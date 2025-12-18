"use client";

import { useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Download,
  FileText,
  Heart,
  Star,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useUserProjects } from "@/hooks/features/useProjects";
import { useMarketplaceItems } from "@/hooks/features/useMarketplace";
import ProfileHero from "./ProfileHero";
import PersonalInfoCard from "./PersonalInfoCard";
import RecentActivitiesCard from "./RecentActivitiesCard";
import { EditProfileDialog } from "./EditProfileDialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SubscriptionCard } from "./SubscriptionCard";

export function ProfileContent() {
  const { user, isLoaded } = useUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects();
  
  const { data: allMarketplaceItems = [], isLoading: templatesLoading } = useMarketplaceItems();
  const userTemplates = useMemo(() => {
    if (!user?.id) return [];
    return allMarketplaceItems.filter(item => item.authorId === user.id);
  }, [allMarketplaceItems, user?.id]);

  const profile = useMemo(() => {
    if (!user) return null;

    const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
    const joinDate = createdAt.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const metaFirstName =
      (user.unsafeMetadata?.firstName as string) || user.firstName || "";
    const metaLastName =
      (user.unsafeMetadata?.lastName as string) || user.lastName || "";
    const metaUsername =
      (user.unsafeMetadata?.username as string) || user.username || "";

    const fullName = `${metaFirstName} ${metaLastName}`.trim();

    return {
      name: fullName || user.fullName || "User",
      email: user.primaryEmailAddress?.emailAddress || "Not provided",
      address: (user.unsafeMetadata?.address as string) || "Not provided",
      bio: (user.unsafeMetadata?.bio as string) || "No bio yet",
      joinDate,
      avatar: user.imageUrl || "",
      initials:
        `${metaFirstName[0] || ""}${metaLastName[0] || ""}`.toUpperCase() ||
        "U",
      username: metaUsername,
    };
  }, [user]);

  const stats = useMemo(
    () => [
      {
        label: "Projects",
        value: projectsLoading ? "..." : projects.length.toString(),
        icon: FileText,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      },
      {
        label: "Templates",
        value: templatesLoading ? "..." : userTemplates.length.toString(),
        icon: Heart,
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
      },
      {
        label: "Shared",
        value: templatesLoading ? "..." : userTemplates.filter(t => t.featured).length.toString(),
        icon: Star,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
      },
      {
        label: "Activity",
        value: "100%",
        icon: TrendingUp,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
      },
    ],
    [projects.length, projectsLoading, userTemplates, templatesLoading]
  );

  const handleDownload = () => {
    if (!user) return;

    const data = {
      name: user.fullName,
      email: user.primaryEmailAddress?.emailAddress,
      username: user.username,
      createdAt: user.createdAt,
      metadata: user.unsafeMetadata,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profile-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">Unable to load profile</p>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              View and manage your personal information
            </p>
          </div>
          <Button onClick={handleDownload} className="gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground font-medium">
                  Your {stat.label.toLowerCase()} count
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="w-full">
          <ProfileHero
            profile={profile}
            stats={stats}
            onEditClick={() => setIsEditDialogOpen(true)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PersonalInfoCard profile={profile} />
          <SubscriptionCard />
          <RecentActivitiesCard projects={projects} templates={userTemplates} />
        </div>

        <div className="flex justify-end pt-4">
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <EditProfileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
