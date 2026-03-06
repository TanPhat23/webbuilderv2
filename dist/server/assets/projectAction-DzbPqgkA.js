import { c as createServerRpc } from "./createServerRpc-Bd3B-Ah9.js";
import { d as prisma, e as Permission } from "./prisma-Cq49YOYM.js";
import { g as getUserProjectAccess, h as hasPermission } from "./rbac-DoMj1n9M.js";
import "react/jsx-runtime";
import "react";
import "sonner";
import "clsx";
import "next-themes";
import "socket.io-client";
import "@hookform/resolvers/zod";
import { v4 } from "uuid";
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
const LOG = "[ProjectDAL]";
function buildEditorFields(updates) {
  const data = { UpdatedAt: /* @__PURE__ */ new Date() };
  if (updates.styles !== void 0) {
    data.Styles = JSON.stringify(updates.styles);
  }
  if (updates.header !== void 0) {
    data.Header = updates.header ? JSON.stringify(updates.header) : null;
  }
  return data;
}
function buildOwnerFields(updates) {
  const data = buildEditorFields(updates);
  if (updates.name !== void 0) data.Name = updates.name;
  if (updates.description !== void 0)
    data.Description = updates.description ?? null;
  if (updates.published !== void 0) data.Published = updates.published;
  if (updates.subdomain !== void 0)
    data.Subdomain = updates.subdomain ?? null;
  return data;
}
const projectDAL = {
  /**
   * Create a new project together with its mandatory first page, all inside a
   * single transaction so neither record is ever left dangling.
   *
   * Note: callers must **not** create the default page separately; that would
   * produce duplicate pages per project.
   */
  createProject: async (project, userId) => {
    if (!project.name || !project.id) {
      throw new Error("Project name and id are required");
    }
    const now = /* @__PURE__ */ new Date();
    return await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          Id: project.id,
          Name: project.name,
          Description: project.description ?? "",
          OwnerId: userId,
          Subdomain: project.subdomain ?? "",
          Published: project.published ?? false,
          Styles: JSON.stringify(project.styles ?? {}),
          CreatedAt: now,
          UpdatedAt: now,
          DeletedAt: null
        }
      });
      await tx.page.create({
        data: {
          Id: crypto.randomUUID(),
          Name: "",
          Type: "page",
          Styles: JSON.stringify({}),
          ProjectId: newProject.Id,
          CreatedAt: now,
          UpdatedAt: now,
          DeletedAt: null
        }
      });
      return newProject;
    });
  },
  /**
   * Soft-delete a project by setting `DeletedAt`.
   * Only the project owner may delete their own project.
   */
  deleteProject: async (projectId, userId) => {
    if (!projectId) throw new Error("Project id is required");
    return await prisma.project.updateMany({
      where: {
        Id: projectId,
        OwnerId: userId,
        DeletedAt: null
      },
      data: {
        DeletedAt: /* @__PURE__ */ new Date(),
        UpdatedAt: /* @__PURE__ */ new Date()
      }
    });
  },
  /** Return all active (non-deleted) projects owned by `userId`. */
  getActiveProjects: async (userId) => {
    return await prisma.project.findMany({
      where: { OwnerId: userId, DeletedAt: null }
    });
  },
  /**
   * Return a project by id, but only if `userId` is the owner and the project
   * has not been soft-deleted.
   *
   * Use `getProjectWithAccess` when collaborator access is also required.
   */
  getProject: async (projectId, userId) => {
    if (!projectId) throw new Error("Project id is required");
    try {
      return await prisma.project.findUnique({
        where: {
          Id: projectId,
          OwnerId: userId,
          DeletedAt: null
        }
      });
    } catch (err) {
      console.error(`${LOG} getProject error:`, err);
      return null;
    }
  },
  /**
   * Return a project by id for any user who has at least view access
   * (owner **or** collaborator).  Uses the RBAC layer to determine access.
   */
  getProjectWithAccess: async (projectId, userId) => {
    if (!projectId) throw new Error("Project id is required");
    try {
      const access = await getUserProjectAccess(userId, projectId);
      if (!access) return null;
      return await prisma.project.findUnique({
        where: { Id: projectId }
      });
    } catch (err) {
      console.error(`${LOG} getProjectWithAccess error:`, err);
      return null;
    }
  },
  /**
   * Return all non-deleted projects where `userId` is either the owner or an
   * active collaborator.  Results are deduplicated.
   */
  getAllUserProjects: async (userId) => {
    try {
      const [ownedProjects, collaborations] = await Promise.all([
        prisma.project.findMany({
          where: { OwnerId: userId, DeletedAt: null }
        }),
        // The nested `Project: { DeletedAt: null }` filter ensures we only
        // receive collaborations on live projects; no extra client-side filter
        // is needed.
        prisma.collaborator.findMany({
          where: {
            UserId: userId,
            Project: { DeletedAt: null }
          },
          include: { Project: true }
        })
      ]);
      const collaboratedProjects = collaborations.map((c) => c.Project);
      const uniqueProjects = Array.from(
        new Map(
          [...ownedProjects, ...collaboratedProjects].map((p) => [p.Id, p])
        ).values()
      );
      return uniqueProjects;
    } catch (err) {
      console.error(`${LOG} getAllUserProjects error:`, err);
      return [];
    }
  },
  /**
   * Update a project as its owner.
   *
   * Validates ownership and soft-delete status before writing.  All fields in
   * `updates` are applied; omitted fields are left unchanged.
   *
   * Returns the updated project, or `null` if the project was not found / not
   * owned by `userId` / already deleted.
   */
  updateProject: async (projectId, userId, updates) => {
    if (!projectId) throw new Error("Project id is required");
    try {
      const existing = await prisma.project.findUnique({
        where: { Id: projectId, OwnerId: userId, DeletedAt: null },
        select: { Id: true }
      });
      if (!existing) return null;
      return await prisma.project.update({
        where: { Id: projectId },
        data: buildOwnerFields(updates)
      });
    } catch (err) {
      console.error(`${LOG} updateProject error:`, err);
      return null;
    }
  },
  /**
   * Update a project using RBAC rules:
   * - **Editors** may update `styles` and `header`.
   * - **Owners** may additionally update `name`, `description`, `published`,
   *   and `subdomain`.
   *
   * Returns the updated project, or `null` on authorization failure or error.
   */
  updateProjectWithAccess: async (projectId, userId, updates) => {
    if (!projectId) throw new Error("Project id is required");
    try {
      const access = await getUserProjectAccess(userId, projectId);
      if (!access) return null;
      if (!hasPermission(access.role, Permission.PROJECT_EDIT)) return null;
      const data = access.isOwner ? buildOwnerFields(updates) : buildEditorFields(updates);
      return await prisma.project.update({
        where: { Id: projectId },
        data
      });
    } catch (err) {
      console.error(`${LOG} updateProjectWithAccess error:`, err);
      return null;
    }
  },
  /**
   * Restore a previously soft-deleted project owned by `userId`.
   */
  restoreProject: async (projectId, userId) => {
    return await prisma.project.updateMany({
      where: {
        Id: projectId,
        OwnerId: userId,
        DeletedAt: { not: null }
      },
      data: {
        DeletedAt: null,
        UpdatedAt: /* @__PURE__ */ new Date()
      }
    });
  }
};
const CreateProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional()
});
const createProject_createServerFn_handler = createServerRpc({
  id: "6a0643ddc1f5eef517e083f878a467ea542d48a4b3071275fda2bb775bf45ee7",
  name: "createProject",
  filename: "src/features/projects/actions/projectAction.ts"
}, (opts) => createProject.__executeServer(opts));
const createProject = createServerFn({
  method: "POST"
}).inputValidator((data) => CreateProjectSchema.parse(data)).handler(createProject_createServerFn_handler, async ({
  data
}) => {
  const {
    userId
  } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const project = {
    ...data,
    id: data.id ?? v4()
  };
  await projectDAL.createProject(project, userId);
  return {
    success: true,
    projectId: project.id
  };
});
export {
  createProject_createServerFn_handler
};
