import { Page, CreatePageInput, UpdatePageInput } from "@/features/pages";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";
import {
  getUserProjectAccess,
  hasPermission,
  Permission,
} from "@/features/auth";

// ─── Internal helpers ─────────────────────────────────────────────────────────

const LOG = "[PageDAL]";

type PrismaPage = {
  Id: string;
  Name: string;
  Type: string;
  Styles: unknown;
  ProjectId: string;
  CreatedAt: Date;
  UpdatedAt: Date;
  DeletedAt: Date | null;
};

/** Map a raw Prisma page row to the application `Page` interface. */
function mapPage(row: PrismaPage): Page {
  return {
    Id: row.Id,
    Name: row.Name,
    Type: row.Type,
    Styles: (row.Styles as Record<string, unknown>) ?? null,
    ProjectId: row.ProjectId,
    CreatedAt: row.CreatedAt,
    UpdatedAt: row.UpdatedAt,
    DeletedAt: row.DeletedAt,
  };
}

// ─── DAL ──────────────────────────────────────────────────────────────────────

export const pageDAL = {
  /**
   * Create a new page.
   *
   * If `page.Id` is omitted a UUID is generated automatically.
   */
  createPage: async (page: CreatePageInput): Promise<Page> => {
    const created = await prisma.page.create({
      data: {
        Id: page.Id ?? uuidv4(),
        Name: page.Name,
        Type: page.Type,
        Styles: (page.Styles ?? {}) as object,
        ProjectId: page.ProjectId,
        CreatedAt: page.CreatedAt ?? new Date(),
        UpdatedAt: page.UpdatedAt ?? new Date(),
        DeletedAt: page.DeletedAt ?? null,
      },
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
  getPage: async (pageId: string, userId: string): Promise<Page | null> => {
    if (!pageId) throw new Error("Page id is required");

    try {
      const page = await prisma.page.findUnique({
        where: { Id: pageId, DeletedAt: null },
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
  getPagesByProject: async (
    projectId: string,
    userId: string,
  ): Promise<Page[]> => {
    if (!projectId) throw new Error("Project id is required");

    try {
      const access = await getUserProjectAccess(userId, projectId);
      if (!access || !hasPermission(access.role, Permission.PAGE_VIEW)) {
        return [];
      }

      const pages = await prisma.page.findMany({
        where: { ProjectId: projectId, DeletedAt: null },
        orderBy: { CreatedAt: "asc" },
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
  updatePage: async (
    pageId: string,
    updates: Partial<Omit<UpdatePageInput, "Id">>,
    userId: string,
  ): Promise<Page | null> => {
    if (!pageId) throw new Error("Page id is required");

    try {
      // Resolve the owning project before checking permissions.
      const existing = await prisma.page.findUnique({
        where: { Id: pageId, DeletedAt: null },
        select: { ProjectId: true },
      });

      if (!existing) return null;

      const access = await getUserProjectAccess(userId, existing.ProjectId);
      if (!access || !hasPermission(access.role, Permission.PAGE_EDIT)) {
        return null;
      }

      // Build the update data from only the fields that were provided.
      const data: Record<string, unknown> = { UpdatedAt: new Date() };
      if (updates.Name !== undefined) data.Name = updates.Name;
      if (updates.Type !== undefined) data.Type = updates.Type;
      if (updates.Styles !== undefined) data.Styles = updates.Styles as object;

      const updated = await prisma.page.update({
        where: { Id: pageId },
        data,
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
  deletePage: async (pageId: string, projectId: string): Promise<boolean> => {
    if (!pageId) throw new Error("Page id is required");

    try {
      await prisma.page.delete({
        where: { Id: pageId, ProjectId: projectId },
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
  softDeletePage: async (pageId: string, userId: string): Promise<boolean> => {
    if (!pageId) throw new Error("Page id is required");

    try {
      const existing = await prisma.page.findUnique({
        where: { Id: pageId, DeletedAt: null },
        select: { ProjectId: true },
      });

      if (!existing) return false;

      const access = await getUserProjectAccess(userId, existing.ProjectId);
      if (!access || !hasPermission(access.role, Permission.PAGE_DELETE)) {
        return false;
      }

      await prisma.page.update({
        where: { Id: pageId },
        data: { DeletedAt: new Date(), UpdatedAt: new Date() },
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
  restorePage: async (pageId: string, userId: string): Promise<Page | null> => {
    if (!pageId) throw new Error("Page id is required");

    try {
      const existing = await prisma.page.findUnique({
        where: { Id: pageId },
        select: { ProjectId: true, DeletedAt: true },
      });

      if (!existing || existing.DeletedAt === null) return null;

      const access = await getUserProjectAccess(userId, existing.ProjectId);
      if (!access || !hasPermission(access.role, Permission.PAGE_EDIT)) {
        return null;
      }

      const restored = await prisma.page.update({
        where: { Id: pageId },
        data: { DeletedAt: null, UpdatedAt: new Date() },
      });

      return mapPage(restored);
    } catch (err) {
      console.error(`${LOG} restorePage error:`, err);
      return null;
    }
  },
};
