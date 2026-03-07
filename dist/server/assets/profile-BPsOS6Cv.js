import { jsxs, jsx } from "react/jsx-runtime";
import { Outlet } from "@tanstack/react-router";
import { j as SidebarTrigger } from "./prisma-BUnO9f9X.js";
import "clsx";
import { D as DashboardSidebar } from "./DashboardSidebar-CKy-we4B.js";
import "react";
import "./project.service-Bci2lGYe.js";
import "sonner";
import "next-themes";
import "socket.io-client";
import "@hookform/resolvers/zod";
import { S as Separator } from "./separator-02AnxWMB.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-ByhdzHpl.js";
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
import "lucide-react";
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "./dropdown-menu-Bk3fcYaf.js";
import "./avatar-BTnsTn8t.js";
import "@clerk/react";
function ProfileLayout() {
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen w-full bg-background", children: [
    /* @__PURE__ */ jsx(DashboardSidebar, {}),
    /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto", children: [
      /* @__PURE__ */ jsxs("header", { className: "flex h-16 shrink-0 items-center gap-2 border-b px-4", children: [
        /* @__PURE__ */ jsx(SidebarTrigger, { className: "-ml-1" }),
        /* @__PURE__ */ jsx(Separator, { orientation: "vertical", className: "mr-2 h-4" }),
        /* @__PURE__ */ jsx(Breadcrumb, { children: /* @__PURE__ */ jsxs(BreadcrumbList, { children: [
          /* @__PURE__ */ jsx(BreadcrumbItem, { className: "hidden md:block", children: /* @__PURE__ */ jsx(BreadcrumbLink, { href: "/dashboard", children: "Dashboard" }) }),
          /* @__PURE__ */ jsx(BreadcrumbSeparator, { className: "hidden md:block" }),
          /* @__PURE__ */ jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsx(BreadcrumbPage, { children: "Profile" }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(Outlet, {})
    ] }) })
  ] });
}
export {
  ProfileLayout as component
};
