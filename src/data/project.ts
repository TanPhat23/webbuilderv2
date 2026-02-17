import { Project } from "@/interfaces/project.interface";
import prisma from "@/lib/prisma";
import { getUserProjectAccess, Permission, hasPermission } from "@/lib/rbac";

export const projectDAL = {
  createProject: async (project: Project, userId: string) => {
    if (!project.name || !project.id) {
      throw new Error("Project Name is required");
    }
    const now = new Date();
    return await prisma?.project.create({
      data: {
        Id: project.id,
        Name: project.name,
        Description: project.description || "",
        OwnerId: userId,
        Subdomain: project.subdomain || "",
        Published: project.published || false,
        Styles: JSON.stringify(project.styles || {}),
        CreatedAt: now,
        UpdatedAt: now,
        DeletedAt: null,
      },
    });
  },

  // Soft delete: set DeletedAt to current date
  deleteProject: async (projectId: string, userId: string) => {
    if (!projectId) {
      throw new Error("Project Id is required");
    }
    return await prisma?.project.updateMany({
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

  // Get only active (not deleted) projects for a user
  getActiveProjects: async (userId: string) => {
    return await prisma?.project.findMany({
      where: {
        OwnerId: userId,
        DeletedAt: null,
      },
    });
  },

  // Get a specific project by ID with ownership check
  getProject: async (projectId: string, userId: string) => {
    if (!projectId) {
      throw new Error("Project Id is required");
    }
    try {
      const project = await prisma?.project.findUnique({
        where: { Id: projectId },
      });

      if (!project) return null;
      if (project.OwnerId !== userId) return null;
      if (project.DeletedAt !== null) return null;

      return project;
    } catch (err) {
      console.error("projectDAL.getProject error:", err);
      return null;
    }
  },

  /**
   * Get a project by ID with role-based access control
   * Allows both owners and collaborators with view permission to access
   */
  getProjectWithAccess: async (projectId: string, userId: string) => {
    if (!projectId) {
      throw new Error("Project Id is required");
    }
    try {
      // Check user's access level
      const access = await getUserProjectAccess(userId, projectId);

      if (!access) {
        return null;
      }

      // User has access, fetch the project
      const project = await prisma?.project.findUnique({
        where: { Id: projectId },
      });

      if (!project || project.DeletedAt !== null) {
        return null;
      }

      return project;
    } catch (err) {
      console.error("projectDAL.getProjectWithAccess error:", err);
      return null;
    }
  },

  /**
   * Get all projects where user has access (owned + collaborated)
   */
  getAllUserProjects: async (userId: string) => {
    try {
      // Get owned projects
      const ownedProjects = await prisma?.project.findMany({
        where: {
          OwnerId: userId,
          DeletedAt: null,
        },
      });

      // Get collaborated projects
      const collaborations = await prisma?.collaborator.findMany({
        where: {
          UserId: userId,
        },
        include: {
          Project: true,
        },
      });

      const collaboratedProjects = collaborations
        .filter((collab) => collab.Project.DeletedAt === null)
        .map((collab) => collab.Project);

      // Combine and deduplicate
      const allProjects = [...(ownedProjects || []), ...collaboratedProjects];
      const uniqueProjects = Array.from(
        new Map(allProjects.map((p) => [p.Id, p])).values(),
      );

      return uniqueProjects;
    } catch (err) {
      console.error("projectDAL.getAllUserProjects error:", err);
      return [];
    }
  },

  /**
   * Update a project.
   *
   * Performs an ownership check and ensures the project is not soft-deleted.
   * Accepts a partial `updates` object containing fields to change (e.g. Name, Description, Styles, Published, Subdomain, Header).
   *
   * Returns the updated project object on success, or null if the project was not found / not owned by the user / deleted.
   */
  updateProject: async (
    projectId: string,
    userId: string,
    updates: Partial<Project>,
  ) => {
    if (!projectId) {
      throw new Error("Project Id is required");
    }
    try {
      const existing = await prisma?.project.findUnique({
        where: { Id: projectId },
      });

      if (!existing) return null;
      if (existing.OwnerId !== userId) return null;
      if (existing.DeletedAt !== null) return null;

      const updated = await prisma?.project.update({
        where: { Id: projectId },
        data: {
          UpdatedAt: new Date(),
          Styles: JSON.stringify(updates.styles ?? existing.Styles),
          Header: updates.header
            ? (JSON.stringify(updates.header) as any)
            : existing.Header,
          Name: updates.name ?? existing.Name,
          Description: updates.description ?? existing.Description,
          Published:
            updates.published !== undefined
              ? updates.published
              : existing.Published,
          Subdomain: updates.subdomain ?? existing.Subdomain,
        },
      });

      return updated || null;
    } catch (err) {
      console.error("projectDAL.updateProject error:", err);
      return null;
    }
  },

  /**
   * Update a project with role-based access control
   * Allows editors and owners to update based on their permissions
   */
  updateProjectWithAccess: async (
    projectId: string,
    userId: string,
    updates: Partial<Project>,
  ) => {
    if (!projectId) {
      throw new Error("Project Id is required");
    }
    try {
      // Check user's access level
      const access = await getUserProjectAccess(userId, projectId);

      if (!access) {
        return null;
      }

      // Check if user has edit permission
      const canEdit = hasPermission(access.role, Permission.PROJECT_EDIT);
      if (!canEdit) {
        return null;
      }

      const existing = await prisma?.project.findUnique({
        where: { Id: projectId },
      });

      if (!existing || existing.DeletedAt !== null) {
        return null;
      }

      // Restrict certain fields to owners only
      const isOwner = access.isOwner;
      const allowedUpdates: any = {
        UpdatedAt: new Date(),
      };

      // Everyone with edit permission can update these
      if (updates.styles !== undefined) {
        allowedUpdates.Styles = JSON.stringify(updates.styles);
      }
      if (updates.header !== undefined) {
        allowedUpdates.Header = JSON.stringify(updates.header);
      }

      // Only owners can update these
      if (isOwner) {
        if (updates.name !== undefined) {
          allowedUpdates.Name = updates.name;
        }
        if (updates.description !== undefined) {
          allowedUpdates.Description = updates.description;
        }
        if (updates.published !== undefined) {
          allowedUpdates.Published = updates.published;
        }
        if (updates.subdomain !== undefined) {
          allowedUpdates.Subdomain = updates.subdomain;
        }
      }

      const updated = await prisma?.project.update({
        where: { Id: projectId },
        data: allowedUpdates,
      });

      return updated || null;
    } catch (err) {
      console.error("projectDAL.updateProjectWithAccess error:", err);
      return null;
    }
  },

  restoreProject: async (projectId: string, userId: string) => {
    return await prisma?.project.updateMany({
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
