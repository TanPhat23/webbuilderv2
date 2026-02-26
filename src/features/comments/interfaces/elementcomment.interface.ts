// Element Comment interfaces based on Go backend models

export interface ElementCommentAuthor {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  imageUrl?: string | null;
}

export interface ElementComment {
  id: string;
  elementId: string;
  content: string;
  authorId: string;
  projectId: string;
  resolved: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  author?: ElementCommentAuthor;
}

export interface ElementCommentResponse {
  data: ElementComment[];
  total: number;
}

export interface CreateElementCommentRequest {
  elementId: string;
  content: string;
  projectId: string;
}

export interface UpdateElementCommentRequest {
  content?: string;
}

export interface ElementCommentFilter {
  elementId?: string;
  authorId?: string;
  projectId?: string;
  resolved?: boolean;
}
