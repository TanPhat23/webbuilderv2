export enum CollaboratorRole {
  OWNER = "owner",
  EDITOR = "editor",
  VIEWER = "viewer",
}

export interface Invitation {
  id: string;
  email: string;
  projectId: string;
  role: CollaboratorRole;
  token: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string | null;
}

interface ColalboratorUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface Collaborator {
  id: string;
  projectId: string;
  userId: string;
  role: CollaboratorRole;
  invitedBy: string;
  createdAt: string;
  updatedAt: string;
  user?: ColalboratorUser;
}

export interface CreateInvitationRequest {
  projectId: string;
  email: string;
  role: CollaboratorRole;
}

export interface AcceptInvitationRequest {
  token: string;
}

export interface UpdateCollaboratorRoleRequest {
  role: CollaboratorRole;
}

export interface InvitationListResponse {
  invitations: Invitation[];
}

export interface CollaboratorListResponse {
  collaborators: Collaborator[];
}
