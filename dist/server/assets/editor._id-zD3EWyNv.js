import { c as createServerRpc } from "./createServerRpc-Bd3B-Ah9.js";
import { redirect } from "@tanstack/react-router";
import { b as Permission } from "./prisma-BUnO9f9X.js";
import "react/jsx-runtime";
import "react";
import "./project.service-Bci2lGYe.js";
import "sonner";
import "clsx";
import "next-themes";
import "socket.io-client";
import "@hookform/resolvers/zod";
import { g as getUserProjectAccess, h as hasPermission } from "./rbac-DQieFWKz.js";
import { a as auth } from "./auth-BkVoR3zB.js";
import { c as createServerFn } from "../server.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
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
import "@clerk/backend/internal";
import "./index-CSLGDVeV.js";
import "@clerk/shared/error";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
async function authorizeUserAction(userId, projectId, permission) {
  const access = await getUserProjectAccess(userId, projectId);
  if (!access) {
    return {
      authorized: false,
      reason: "User does not have access to this project"
    };
  }
  const hasRequiredPermission = hasPermission(access.role, permission);
  if (!hasRequiredPermission) {
    return {
      authorized: false,
      role: access.role,
      reason: `User role '${access.role}' does not have permission '${permission}'`
    };
  }
  return {
    authorized: true,
    role: access.role
  };
}
async function requirePermission(userId, projectId, permission) {
  const result = await authorizeUserAction(userId, projectId, permission);
  if (!result.authorized) {
    const error = new Error(result.reason || "Unauthorized");
    error.status = 403;
    throw error;
  }
  const access = await getUserProjectAccess(userId, projectId);
  if (!access) {
    const error = new Error("Failed to get user access information");
    error.status = 500;
    throw error;
  }
  return access;
}
const checkEditorAccess_createServerFn_handler = createServerRpc({
  id: "4e76fa5d97766bcab4dfbf483338c1327081ed3b31aa33ecf57450aab56d8514",
  name: "checkEditorAccess",
  filename: "src/app/_protected/editor.$id.tsx"
}, (opts) => checkEditorAccess.__executeServer(opts));
const checkEditorAccess = createServerFn({
  method: "GET"
}).inputValidator((projectId) => projectId).handler(checkEditorAccess_createServerFn_handler, async ({
  data: projectId
}) => {
  const {
    userId
  } = await auth();
  if (!userId) throw redirect({
    to: "/sign-in"
  });
  const access = await getUserProjectAccess(userId, projectId);
  if (!access) throw redirect({
    to: "/dashboard"
  });
  await requirePermission(userId, projectId, Permission.PROJECT_VIEW);
  return {
    userId
  };
});
export {
  checkEditorAccess_createServerFn_handler
};
