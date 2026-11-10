import { URLBuilder } from "@/utils/urlbuilder";
import {
  Comment,
  CommentResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  CreateReactionRequest,
  CommentReaction,
  CommentFilter,
} from "@/features/comments";
import apiClient from "@/services/apiclient";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";

interface ICommentService {
  // Comment operations
  createComment: (data: CreateCommentRequest) => Promise<Comment>;
  getCommentsByItemId: (
    itemId: string,
    filter?: Omit<CommentFilter, "itemId">,
  ) => Promise<CommentResponse>;
  updateComment: (
    commentId: string,
    data: UpdateCommentRequest,
  ) => Promise<Comment>;
  deleteComment: (commentId: string) => Promise<boolean>;
  moderateComment: (
    commentId: string,
    status: string,
  ) => Promise<{ message: string; status: string }>;

  // Reaction operations
  createReaction: (
    commentId: string,
    data: CreateReactionRequest,
  ) => Promise<CommentReaction>;
  deleteReaction: (commentId: string, reactionType: string) => Promise<boolean>;
}

export const commentService: ICommentService = {
  // Comment operations
  createComment: async (data: CreateCommentRequest): Promise<Comment> => {
    return apiClient.post<Comment>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.CREATE)
        .build(),
      data,
    );
  },

  getCommentsByItemId: async (
    itemId: string,
    filter?: Omit<CommentFilter, "itemId">,
  ): Promise<CommentResponse> => {
    const builder = new URLBuilder("api").setPath(
      API_ENDPOINTS.MARKETPLACE.COMMENTS.GET_BY_ITEM(itemId),
    );
    if (filter) {
      if (filter.status) builder.addQueryParam("status", filter.status);
      if (filter.limit) builder.addQueryParam("limit", String(filter.limit));
      if (filter.offset) builder.addQueryParam("offset", String(filter.offset));
      if (filter.sortBy) builder.addQueryParam("sortBy", filter.sortBy);
      if (filter.sortOrder)
        builder.addQueryParam("sortOrder", filter.sortOrder);
    }

    return apiClient.get<CommentResponse>(builder.build());
  },

  updateComment: async (
    commentId: string,
    data: UpdateCommentRequest,
  ): Promise<Comment> => {
    return apiClient.patch<Comment>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.UPDATE(commentId))
        .build(),
      data,
    );
  },

  deleteComment: async (commentId: string): Promise<boolean> => {
    return apiClient.delete(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.DELETE(commentId))
        .build(),
    );
  },

  moderateComment: async (
    commentId: string,
    status: string,
  ): Promise<{ message: string; status: string }> => {
    return apiClient.post<{ message: string; status: string }>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.MODERATE(commentId))
        .build(),
      { status },
    );
  },

  // Reaction operations
  createReaction: async (
    commentId: string,
    data: CreateReactionRequest,
  ): Promise<CommentReaction> => {
    return apiClient.post<CommentReaction>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.CREATE_REACTION(commentId))
        .build(),
      data,
    );
  },

  deleteReaction: async (
    commentId: string,
    reactionType: string,
  ): Promise<boolean> => {
    return apiClient.delete(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.DELETE_REACTION(commentId))
        .addQueryParam("type", reactionType)
        .build(),
    );
  },
};
