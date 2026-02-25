import { Project } from "@/interfaces/project.interface";
import prisma from "@/lib/prisma";
import { getUserProjectAccess, Permission, hasPermission } from "@/lib/rbac";

// ─── Internal helpers ─────────────────────────────────────────────────────────

const LOG = "[ProjectDAL]";

/**
 * Builds the Prisma `data` object for fields that any collaborator with edit
 * permission can change (styles and header).
 */
function buildEditorFields(updates: Partial<Project>): Record<string, unknown> {
  const data: Record<string, unknown> = { UpdatedAt: new Date() };

  if (updates.styles !== undefined) {
    data.Styles = JSON.stringify(updates.styles);
  }
  if (updates.header !== undefined) {
    data.Header = updates.header ? JSON.stringify(updates.header) : null;
  }

  return data;
}

/**
 * Extends the editor fields with the additional fields that only project
 * owners are allowed to change.
 */
function buildOwnerFields(updates: Partial<Project>): Record<string, unknown> {
  const data = buildEditorFields(updates);

  if (updates.name !== undefined) data.Name = updates.name;
  if (updates.description !== undefined)
    data.Description = updates.description ?? null;
  if (updates.published !== undefined) data.Published = updates.published;
  if (updates.subdomain !== undefined)
    data.Subdomain = updates.subdomain ?? null;

  return data;
}

// ─── DAL ──────────────────────────────────────────────────────────────────────

export const projectDAL = {
  /**
   * Create a new project together with its mandatory first page, all inside a
   * single transaction so neither record is ever left dangling.
   *
   * Note: callers must **not** create the default page separately; that would
   * produce duplicate pages per project.
   */
  createProject: async (project: Project, userId: string) => {
    if (!project.name || !project.id) {
      throw new Error("Project name and id are required");
    }

    const now = new Date();

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
          DeletedAt: null,
        },
      });

      // Every project must have at least one page.  Creating it here keeps the
      // two records atomic — if page creation fails the project is rolled back.
      await tx.page.create({
        data: {
          Id: crypto.randomUUID(),
          Name: "",
          Type: "page",
          Styles: JSON.stringify({}),
          ProjectId: newProject.Id,
          CreatedAt: now,
          UpdatedAt: now,
          DeletedAt: null,
        },
      });

      return newProject;
    });
  },

  /**
   * Soft-delete a project by setting `DeletedAt`.
   * Only the project owner may delete their own project.
   */
  deleteProject: async (projectId: string, userId: string) => {
    if (!projectId) throw new Error("Project id is required");

    return await prisma.project.updateMany({
      where: {
        Id: projectId,
        OwnerId: userId,
        DeletedAt: null,
      },
      data: {
        DeletedAt: new Date(),
        UpdatedAt: new Date(),
      },
    });
  },

  /** Return all active (non-deleted) projects owned by `userId`. */
  getActiveProjects: async (userId: string) => {
    return await prisma.project.findMany({
      where: { OwnerId: userId, DeletedAt: null },
    });
  },

  /**
   * Return a project by id, but only if `userId` is the owner and the project
   * has not been soft-deleted.
   *
   * Use `getProjectWithAccess` when collaborator access is also required.
   */
  getProject: async (projectId: string, userId: string) => {
    if (!projectId) throw new Error("Project id is required");

    try {
      return await prisma.project.findUnique({
        where: {
          Id: projectId,
          OwnerId: userId,
          DeletedAt: null,
        },
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
  getProjectWithAccess: async (projectId: string, userId: string) => {
    if (!projectId) throw new Error("Project id is required");

    try {
      const access = await getUserProjectAccess(userId, projectId);
      if (!access) return null;

      // `getUserProjectAccess` already confirms the project is not deleted,
      // so we can fetch it directly.
      return await prisma.project.findUnique({
        where: { Id: projectId },
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
  getAllUserProjects: async (userId: string) => {
    try {
      const [ownedProjects, collaborations] = await Promise.all([
        prisma.project.findMany({
          where: { OwnerId: userId, DeletedAt: null },
        }),
        // The nested `Project: { DeletedAt: null }` filter ensures we only
        // receive collaborations on live projects; no extra client-side filter
        // is needed.
        prisma.collaborator.findMany({
          where: {
            UserId: userId,
            Project: { DeletedAt: null },
          },
          include: { Project: true },
        }),
      ]);

      const collaboratedProjects = collaborations.map((c) => c.Project);

      const uniqueProjects = Array.from(
        new Map(
          [...ownedProjects, ...collaboratedProjects].map((p) => [p.Id, p]),
        ).values(),
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
  updateProject: async (
    projectId: string,
    userId: string,
    updates: Partial<Project>,
  ) => {
    if (!projectId) throw new Error("Project id is required");

    try {
      // Confirm the project exists, belongs to the user, and is active before
      // issuing the UPDATE.
      const existing = await prisma.project.findUnique({
        where: { Id: projectId, OwnerId: userId, DeletedAt: null },
        select: { Id: true },
      });

      if (!existing) return null;

      return await prisma.project.update({
        where: { Id: projectId },
        data: buildOwnerFields(updates),
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
  updateProjectWithAccess: async (
    projectId: string,
    userId: string,
    updates: Partial<Project>,
  ) => {
    if (!projectId) throw new Error("Project id is required");

    try {
      const access = await getUserProjectAccess(userId, projectId);

      if (!access) return null;
      if (!hasPermission(access.role, Permission.PROJECT_EDIT)) return null;

      const data = access.isOwner
        ? buildOwnerFields(updates)
        : buildEditorFields(updates);

      return await prisma.project.update({
        where: { Id: projectId },
        data,
      });
    } catch (err) {
      console.error(`${LOG} updateProjectWithAccess error:`, err);
      return null;
    }
  },

  /**
   * Restore a previously soft-deleted project owned by `userId`.
   */
  restoreProject: async (projectId: string, userId: string) => {
    return await prisma.project.updateMany({
      where: {
        Id: projectId,
        OwnerId: userId,
        DeletedAt: { not: null },
      },
      data: {
        DeletedAt: null,
        UpdatedAt: new Date(),
      },
    });
  },
};
