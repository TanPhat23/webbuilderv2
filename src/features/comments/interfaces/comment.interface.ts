// Comment interfaces based on Go backend models

export interface CommentAuthor {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  imageUrl?: string | null;
}

export interface ReactionSummary {
  type: string;
  count: number;
}

export interface CommentReaction {
  id: string;
  commentId: string;
  userId: string;
  type: string;
  createdAt: Date | string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  itemId: string;
  parentId?: string | null;
  status: string;
  edited: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
  author?: CommentAuthor;
  replies?: Comment[];
  reactions?: CommentReaction[];
}

export interface CommentResponse {
  data: Comment[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateCommentRequest {
  content: string;
  itemId: string;
  parentId?: string | null;
}

export interface UpdateCommentRequest {
  content?: string;
  status?: string;
}

export interface CreateReactionRequest {
  type: string;
}

export interface CommentFilter {
  itemId?: string;
  authorId?: string;
  status?: string;
  parentId?: string | null;
  topLevel?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
