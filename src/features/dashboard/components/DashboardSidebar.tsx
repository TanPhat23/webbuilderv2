import * as React from "react";
import {
  BarChart3,
  Settings,
  User,
  FolderOpen,
  Plus,
  Home,
  Bell,
  HelpCircle,
  LogOut,
  ChevronUp,
  Store,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { SignOutButton, useUser } from "@clerk/tanstack-react-start";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateProjectDialog } from "./CreateProjectDialog";
import type { Project } from "@/features/projects";

type NavigationItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

type QuickActionItem = {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: "create-project";
};

type DashboardSidebarProps = React.ComponentProps<typeof Sidebar> & {
  projects?: Project[];
};

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Projects",
    url: "/dashboard",
    icon: FolderOpen,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Market place",
    url: "/marketplace",
    icon: Store,
  },
];

const quickActions: QuickActionItem[] = [
  {
    title: "New Project",
    icon: Plus,
    action: "create-project",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    url: "/help",
    icon: HelpCircle,
  },
];

function SidebarBrand({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link to="/dashboard">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{title}</span>
              <span className="truncate text-xs">{subtitle}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function SidebarUserMenu() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";

  const initials = `${(user.firstName || "U").charAt(0)}${(user.lastName || "").charAt(0)}`;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user.imageUrl || "/placeholder.svg"}
                  alt={fullName}
                />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{fullName}</span>
                <span className="truncate text-xs">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
              <ChevronUp className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <div className="w-full">
                <SignOutButton redirectUrl="/">
                  <button type="button" className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="ml-2">Log out</span>
                  </button>
                </SignOutButton>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function RecentProjectsSection({ projects }: { projects: Project[] }) {
  const recentProjects = React.useMemo(() => {
    return [...projects]
      .sort((a, b) => {
        const aTime = a.updatedAt ? new Date(String(a.updatedAt)).getTime() : 0;
        const bTime = b.updatedAt ? new Date(String(b.updatedAt)).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [projects]);

  if (recentProjects.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Recent Projects</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {recentProjects.map((project) => (
            <SidebarMenuItem key={project.id}>
              <SidebarMenuButton asChild tooltip={project.name ?? "Project"}>
                <Link to="/dashboard">
                  <FolderOpen />
                  <span className="truncate">
                    {project.name ?? "Untitled project"}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function DashboardSidebar({
  projects = [],
  ...props
}: DashboardSidebarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const { user, isLoaded } = useUser();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isAuthenticated = isLoaded && !!user;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarBrand
          title="ProjectHub"
          subtitle={
            !isLoaded
              ? "Loading..."
              : isAuthenticated
                ? "Dashboard"
                : "Not signed in"
          }
        />
      </SidebarHeader>

      {isAuthenticated ? (
        <>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                      >
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {quickActions.map((item) =>
                    item.action === "create-project" ? (
                      <SidebarMenuItem key={item.title}>
                        <CreateProjectDialog
                          isCreateDialogOpen={isCreateDialogOpen}
                          setIsCreateDialogOpen={setIsCreateDialogOpen}
                        >
                          <SidebarMenuButton
                            onClick={() => setIsCreateDialogOpen(true)}
                          >
                            <item.icon />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </CreateProjectDialog>
                      </SidebarMenuItem>
                    ) : (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link to={item.url!}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ),
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <RecentProjectsSection projects={projects} />
          </SidebarContent>

          <SidebarFooter>
            <SidebarUserMenu />
          </SidebarFooter>
        </>
      ) : null}

      <SidebarRail />
    </Sidebar>
  );
}
