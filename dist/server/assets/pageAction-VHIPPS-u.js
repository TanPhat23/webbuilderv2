import { c as createServerRpc } from "./createServerRpc-Bd3B-Ah9.js";
import { v4 } from "uuid";
import { d as prisma, e as Permission } from "./prisma-Cq49YOYM.js";
import { g as getUserProjectAccess, h as hasPermission } from "./rbac-DoMj1n9M.js";
import "react/jsx-runtime";
import "react";
import "sonner";
import "clsx";
import "next-themes";
import "socket.io-client";
import "@hookform/resolvers/zod";
import { P as PageSchema } from "./page-Cy1amgId.js";
import { z } from "zod";
import { a as auth } from "./auth-BkVoR3zB.js";
import { c as createServerFn } from "../server.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
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
import "@tanstack/react-router";
const LOG = "[PageDAL]";
function mapPage(row) {
  return {
    Id: row.Id,
    Name: row.Name,
    Type: row.Type,
    Styles: row.Styles ?? null,
    ProjectId: row.ProjectId,
    CreatedAt: row.CreatedAt,
    UpdatedAt: row.UpdatedAt,
    DeletedAt: row.DeletedAt
  };
}
const pageDAL = {
  /**
   * Create a new page.
   *
   * If `page.Id` is omitted a UUID is generated automatically.
   */
  createPage: async (page) => {
    const created = await prisma.page.create({
      data: {
        Id: page.Id ?? v4(),
        Name: page.Name,
        Type: page.Type,
        Styles: page.Styles ?? {},
        ProjectId: page.ProjectId,
        CreatedAt: page.CreatedAt ?? /* @__PURE__ */ new Date(),
        UpdatedAt: page.UpdatedAt ?? /* @__PURE__ */ new Date(),
        DeletedAt: page.DeletedAt ?? null
      }
    });
    return mapPage(created);
  },
  /**
   * Return a single non-deleted page by id.
   *
   * Authorization: the caller must have at least `PAGE_VIEW` permission on
   * the project that owns the page.  Returns `null` on any failure, including
   * authorization failures, so callers cannot distinguish "not found" from
   * "forbidden" (intentional — avoids resource enumeration).
   */
  getPage: async (pageId, userId) => {
    if (!pageId) throw new Error("Page id is required");
    try {
      const page = await prisma.page.findUnique({
        where: { Id: pageId, DeletedAt: null }
      });
      if (!page) return null;
      const access = await getUserProjectAccess(userId, page.ProjectId);
      if (!access || !hasPermission(access.role, Permission.PAGE_VIEW)) {
        return null;
      }
      return mapPage(page);
    } catch (err) {
      console.error(`${LOG} getPage error:`, err);
      return null;
    }
  },
  /**
   * Return all non-deleted pages that belong to `projectId`.
   *
   * Authorization: the caller must have at least `PAGE_VIEW` permission on
   * the project.
   */
  getPagesByProject: async (projectId, userId) => {
    if (!projectId) throw new Error("Project id is required");
    try {
      const access = await getUserProjectAccess(userId, projectId);
      if (!access || !hasPermission(access.role, Permission.PAGE_VIEW)) {
        return [];
      }
      const pages = await prisma.page.findMany({
        where: { ProjectId: projectId, DeletedAt: null },
        orderBy: { CreatedAt: "asc" }
      });
      return pages.map(mapPage);
    } catch (err) {
      console.error(`${LOG} getPagesByProject error:`, err);
      return [];
    }
  },
  /**
   * Apply partial updates to a page.
   *
   * Authorization: the caller must have `PAGE_EDIT` permission on the
   * owning project.  Returns `null` on any failure or authorization error.
   */
  updatePage: async (pageId, updates, userId) => {
    if (!pageId) throw new Error("Page id is required");
    try {
      const existing = await prisma.page.findUnique({
        where: { Id: pageId, DeletedAt: null },
        select: { ProjectId: true }
      });
      if (!existing) return null;
      const access = await getUserProjectAccess(userId, existing.ProjectId);
      if (!access || !hasPermission(access.role, Permission.PAGE_EDIT)) {
        return null;
      }
      const data = { UpdatedAt: /* @__PURE__ */ new Date() };
      if (updates.Name !== void 0) data.Name = updates.Name;
      if (updates.Type !== void 0) data.Type = updates.Type;
      if (updates.Styles !== void 0) data.Styles = updates.Styles;
      const updated = await prisma.page.update({
        where: { Id: pageId },
        data
      });
      return mapPage(updated);
    } catch (err) {
      console.error(`${LOG} updatePage error:`, err);
      return null;
    }
  },
  /**
   * Hard-delete a page from the database.
   *
   * Used when permanently removing a page; prefer `softDeletePage` when you
   * want to allow recovery.
   */
  deletePage: async (pageId, projectId) => {
    if (!pageId) throw new Error("Page id is required");
    try {
      await prisma.page.delete({
        where: { Id: pageId, ProjectId: projectId }
      });
      return true;
    } catch (err) {
      console.error(`${LOG} deletePage error:`, err);
      return false;
    }
  },
  /**
   * Soft-delete a page by setting `DeletedAt`.
   *
   * Authorization: the caller must have `PAGE_DELETE` permission on the
   * owning project.  Returns `false` on any failure or authorization error.
   */
  softDeletePage: async (pageId, userId) => {
    if (!pageId) throw new Error("Page id is required");
    try {
      const existing = await prisma.page.findUnique({
        where: { Id: pageId, DeletedAt: null },
        select: { ProjectId: true }
      });
      if (!existing) return false;
      const access = await getUserProjectAccess(userId, existing.ProjectId);
      if (!access || !hasPermission(access.role, Permission.PAGE_DELETE)) {
        return false;
      }
      await prisma.page.update({
        where: { Id: pageId },
        data: { DeletedAt: /* @__PURE__ */ new Date(), UpdatedAt: /* @__PURE__ */ new Date() }
      });
      return true;
    } catch (err) {
      console.error(`${LOG} softDeletePage error:`, err);
      return false;
    }
  },
  /**
   * Restore a previously soft-deleted page.
   *
   * Authorization: the caller must have `PAGE_EDIT` permission on the
   * owning project.  Returns `null` on any failure or authorization error.
   */
  restorePage: async (pageId, userId) => {
    if (!pageId) throw new Error("Page id is required");
    try {
      const existing = await prisma.page.findUnique({
        where: { Id: pageId },
        select: { ProjectId: true, DeletedAt: true }
      });
      if (!existing || existing.DeletedAt === null) return null;
      const access = await getUserProjectAccess(userId, existing.ProjectId);
      if (!access || !hasPermission(access.role, Permission.PAGE_EDIT)) {
        return null;
      }
      const restored = await prisma.page.update({
        where: { Id: pageId },
        data: { DeletedAt: null, UpdatedAt: /* @__PURE__ */ new Date() }
      });
      return mapPage(restored);
    } catch (err) {
      console.error(`${LOG} restorePage error:`, err);
      return null;
    }
  }
};
const CreatePageSchema = z.object({
  Id: z.string().optional(),
  Name: z.string().min(1),
  ProjectId: z.string(),
  Order: z.number().optional(),
  Slug: z.string().optional()
});
const createPage_createServerFn_handler = createServerRpc({
  id: "6b94caa9dcfaf35534753be4d9a0f6a175e99f65f5df024f44f31fb3d823d596",
  name: "createPage",
  filename: "src/features/projects/actions/pageAction.ts"
}, (opts) => createPage.__executeServer(opts));
const createPage = createServerFn({
  method: "POST"
}).inputValidator((data) => CreatePageSchema.parse(data)).handler(createPage_createServerFn_handler, async ({
  data
}) => {
  const {
    userId
  } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const page = {
    ...data,
    Id: data.Id ?? v4()
  };
  const result = PageSchema.safeParse(page);
  if (result.error) throw new Error(JSON.stringify(result.error));
  const response = await pageDAL.createPage(page);
  return response;
});
export {
  createPage_createServerFn_handler
};
