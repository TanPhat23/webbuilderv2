import type { Project as PrismaProject } from "@/generated/client";
import type { Project } from "../interfaces/project.interface";

export function mapPrismaProjectToProject(
  prismaProject: PrismaProject,
): Project {
  return {
    id: prismaProject.Id,
    name: prismaProject.Name,
    description: prismaProject.Description,
    subdomain: prismaProject.Subdomain,
    published: prismaProject.Published,
    ownerId: prismaProject.OwnerId,
    styles: prismaProject.Styles as any,
    header: prismaProject.Header as any,
    createdAt: prismaProject.CreatedAt.toISOString(),
    updatedAt: prismaProject.UpdatedAt.toISOString(),
    deletedAt: prismaProject.DeletedAt
      ? prismaProject.DeletedAt.toISOString()
      : null,
    views: (prismaProject as any).Views ?? 0,
  };
}
