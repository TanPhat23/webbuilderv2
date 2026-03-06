import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { BarChart3, Home, FolderOpen, Bell, Store, Plus, Settings, HelpCircle, ChevronUp, User, LogOut } from "lucide-react";
import { t as Sidebar, u as SidebarHeader, v as SidebarMenu, w as SidebarMenuItem, x as SidebarMenuButton, y as SidebarRail, z as SidebarContent, D as SidebarGroup, E as SidebarGroupLabel, F as SidebarGroupContent, G as CreateProjectDialog, H as SidebarFooter } from "./prisma-Cq49YOYM.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem, d as DropdownMenuSeparator } from "./dropdown-menu-B0s9PypA.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-vyaRObia.js";
import { Link } from "@tanstack/react-router";
import { useUser, SignOutButton } from "@clerk/react";
const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    isActive: true
  },
  {
    title: "Projects",
    url: "/dashboard",
    icon: FolderOpen
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell
  },
  {
    title: "Market place",
    url: "/marketplace",
    icon: Store
  }
];
const quickActions = [
  {
    title: "New Project",
    url: "/dashboard?create=true",
    icon: Plus,
    isSpecial: true
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings
  },
  {
    title: "Help & Support",
    url: "/help",
    icon: HelpCircle
  }
];
function DashboardSidebar({ ...props }) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const { user, isLoaded } = useUser();
  if (!isLoaded) {
    return /* @__PURE__ */ jsxs(Sidebar, { collapsible: "icon", ...props, children: [
      /* @__PURE__ */ jsx(SidebarHeader, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxs(SidebarMenuButton, { size: "lg", children: [
        /* @__PURE__ */ jsx("div", { className: "flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(BarChart3, { className: "size-4" }) }),
        /* @__PURE__ */ jsx("div", { className: "grid flex-1 text-left text-sm leading-tight", children: /* @__PURE__ */ jsx("span", { className: "truncate font-semibold", children: "Loading..." }) })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(SidebarRail, {})
    ] });
  }
  if (!user) {
    return /* @__PURE__ */ jsxs(Sidebar, { collapsible: "icon", ...props, children: [
      /* @__PURE__ */ jsx(SidebarHeader, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxs(SidebarMenuButton, { size: "lg", children: [
        /* @__PURE__ */ jsx("div", { className: "flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(BarChart3, { className: "size-4" }) }),
        /* @__PURE__ */ jsx("div", { className: "grid flex-1 text-left text-sm leading-tight", children: /* @__PURE__ */ jsx("span", { className: "truncate font-semibold", children: "Not signed in" }) })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(SidebarRail, {})
    ] });
  }
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(Sidebar, { collapsible: "icon", ...props, children: [
    /* @__PURE__ */ jsx(SidebarHeader, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(SidebarMenuButton, { size: "lg", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/dashboard", children: [
      /* @__PURE__ */ jsx("div", { className: "flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(BarChart3, { className: "size-4" }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid flex-1 text-left text-sm leading-tight", children: [
        /* @__PURE__ */ jsx("span", { className: "truncate font-semibold", children: "ProjectHub" }),
        /* @__PURE__ */ jsx("span", { className: "truncate text-xs", children: "Dashboard" })
      ] })
    ] }) }) }) }) }),
    /* @__PURE__ */ jsxs(SidebarContent, { children: [
      /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        /* @__PURE__ */ jsx(SidebarGroupLabel, { children: "Navigation" }),
        /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: navigationItems.map((item) => /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(SidebarMenuButton, { asChild: true, isActive: item.isActive, children: /* @__PURE__ */ jsxs(Link, { to: item.url, children: [
          /* @__PURE__ */ jsx(item.icon, {}),
          /* @__PURE__ */ jsx("span", { children: item.title })
        ] }) }) }, item.title)) }) })
      ] }),
      /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        /* @__PURE__ */ jsx(SidebarGroupLabel, { children: "Quick Actions" }),
        /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: quickActions.map(
          (item) => item.title === "New Project" ? /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(
            CreateProjectDialog,
            {
              isCreateDialogOpen,
              setIsCreateDialogOpen,
              children: /* @__PURE__ */ jsxs(
                SidebarMenuButton,
                {
                  onClick: () => setIsCreateDialogOpen(true),
                  children: [
                    /* @__PURE__ */ jsx(item.icon, {}),
                    /* @__PURE__ */ jsx("span", { children: item.title })
                  ]
                }
              )
            }
          ) }, item.title) : /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(SidebarMenuButton, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: item.url, children: [
            /* @__PURE__ */ jsx(item.icon, {}),
            /* @__PURE__ */ jsx("span", { children: item.title })
          ] }) }) }, item.title)
        ) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(SidebarFooter, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
        SidebarMenuButton,
        {
          size: "lg",
          className: "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
          children: [
            /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8 rounded-lg", children: [
              /* @__PURE__ */ jsx(
                AvatarImage,
                {
                  src: user.imageUrl || "/placeholder.svg",
                  alt: `${user.firstName} ${user.lastName}`
                }
              ),
              /* @__PURE__ */ jsxs(AvatarFallback, { className: "rounded-lg", children: [
                (user.firstName || "U").charAt(0),
                (user.lastName || "").charAt(0)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid flex-1 text-left text-sm leading-tight", children: [
              /* @__PURE__ */ jsxs("span", { className: "truncate font-semibold", children: [
                user.firstName,
                " ",
                user.lastName
              ] }),
              /* @__PURE__ */ jsx("span", { className: "truncate text-xs", children: user.primaryEmailAddress?.emailAddress })
            ] }),
            /* @__PURE__ */ jsx(ChevronUp, { className: "ml-auto size-4" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs(
        DropdownMenuContent,
        {
          className: "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
          side: "bottom",
          align: "end",
          sideOffset: 4,
          children: [
            /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/profile", children: [
              /* @__PURE__ */ jsx(User, { className: "mr-2 h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { children: "Profile" })
            ] }) }),
            /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/profile", children: [
              /* @__PURE__ */ jsx(Settings, { className: "mr-2 h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { children: "Settings" })
            ] }) }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(SignOutButton, { redirectUrl: "/", children: /* @__PURE__ */ jsxs("button", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx(LogOut, { className: "mr-2 h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { className: "ml-2", children: "Log out" })
            ] }) }) }) })
          ]
        }
      )
    ] }) }) }) }),
    /* @__PURE__ */ jsx(SidebarRail, {})
  ] }) });
}
export {
  DashboardSidebar as D
};
