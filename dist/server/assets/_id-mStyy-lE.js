import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, Suspense } from "react";
import "clsx";
import { Q as QUERY_CONFIG, O as onMutationError, a9 as showSuccessToast, B as Button, d as Badge, h as cn } from "./prisma-BUnO9f9X.js";
import { a as apiClient, U as URLBuilder, A as API_ENDPOINTS } from "./project.service-Bci2lGYe.js";
import "sonner";
import "next-themes";
import "socket.io-client";
import { C as Card, a as CardContent } from "./card-D42cGFKZ.js";
import { MessageSquare, Loader2, Send, MoreVertical, Edit, Trash2, Heart, Reply, Flag, ArrowLeft, Star, Eye, Download, Code2, Zap, Share2, TrendingUp } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { T as Textarea } from "./textarea-D5_jSc2n.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-BTnsTn8t.js";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem } from "./dropdown-menu-Bk3fcYaf.js";
import { useAuth } from "@clerk/react";
import "@hookform/resolvers/zod";
import { a as useDownloadMarketplaceItem, b as useIncrementLikes, f as useMarketplaceItem } from "./useMarketplace-D0GCoGnq.js";
import { a as Route } from "./router-BlPuUPbX.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "uuid";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "react-hook-form";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "@clerk/react/internal";
import "./index-CSLGDVeV.js";
import "@clerk/shared/error";
import "./env-VSwWZfm9.js";
import "@clerk/shared/getEnvVariable";
import "@clerk/shared/underscore";
import "./auth-BkVoR3zB.js";
import "@clerk/backend/internal";
import "@clerk/backend";
import "@babel/generator";
import "@babel/types";
const commentKeys = {
  all: ["comments"],
  lists: () => [...commentKeys.all, "list"],
  list: (filters) => [...commentKeys.lists(), { filters }],
  details: () => [...commentKeys.all, "detail"],
  detail: (id) => [...commentKeys.details(), id],
  byItem: (itemId) => [...commentKeys.all, "byItem", itemId],
  count: (itemId) => [...commentKeys.all, "count", itemId],
  reactions: (commentId) => [...commentKeys.all, "reactions", commentId],
  reactionSummary: (commentId) => [...commentKeys.all, "reactionSummary", commentId]
};
function useCommentsByItem(itemId, filter) {
  return useQuery({
    queryKey: commentKeys.byItem(itemId),
    queryFn: () => commentService.getCommentsByItemId(itemId, filter),
    enabled: !!itemId,
    ...QUERY_CONFIG.SHORT
  });
}
function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => commentService.createComment(data),
    onSuccess: (newComment) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.byItem(newComment.itemId)
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.count(newComment.itemId)
      });
      showSuccessToast("Comment posted successfully!");
    },
    onError: onMutationError("Failed to post comment")
  });
}
function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      data
    }) => commentService.updateComment(commentId, data),
    onSuccess: (updatedComment) => {
      queryClient.setQueryData(
        commentKeys.detail(updatedComment.id),
        updatedComment
      );
      queryClient.invalidateQueries({
        queryKey: commentKeys.byItem(updatedComment.itemId)
      });
      showSuccessToast("Comment updated successfully!");
    },
    onError: onMutationError("Failed to update comment")
  });
}
function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => commentService.deleteComment(commentId),
    onSuccess: (_, commentId) => {
      queryClient.removeQueries({ queryKey: commentKeys.detail(commentId) });
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
      showSuccessToast("Comment deleted successfully!");
    },
    onError: onMutationError("Failed to delete comment")
  });
}
function useCreateReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      data
    }) => commentService.createReaction(commentId, data),
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.reactions(commentId)
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.reactionSummary(commentId)
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(commentId)
      });
    },
    onError: onMutationError("Failed to add reaction")
  });
}
function useDeleteReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      reactionType
    }) => commentService.deleteReaction(commentId, reactionType),
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.reactions(commentId)
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.reactionSummary(commentId)
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(commentId)
      });
    },
    onError: onMutationError("Failed to remove reaction")
  });
}
const commentService = {
  // Comment operations
  createComment: async (data) => {
    return apiClient.post(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.CREATE).build(),
      data
    );
  },
  getComments: async (filter) => {
    const builder = new URLBuilder("api").setPath(
      API_ENDPOINTS.MARKETPLACE.COMMENTS.GET_ALL
    );
    if (filter) {
      if (filter.itemId) builder.addQueryParam("itemId", filter.itemId);
      if (filter.authorId) builder.addQueryParam("authorId", filter.authorId);
      if (filter.status) builder.addQueryParam("status", filter.status);
      if (filter.parentId !== void 0) {
        builder.addQueryParam("parentId", filter.parentId || "");
      }
      if (filter.topLevel) builder.addQueryParam("topLevel", "true");
      if (filter.limit) builder.addQueryParam("limit", String(filter.limit));
      if (filter.offset) builder.addQueryParam("offset", String(filter.offset));
      if (filter.sortBy) builder.addQueryParam("sortBy", filter.sortBy);
      if (filter.sortOrder)
        builder.addQueryParam("sortOrder", filter.sortOrder);
    }
    return apiClient.get(builder.build());
  },
  getCommentById: async (commentId) => {
    return apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.GET_BY_ID(commentId)).build()
    );
  },
  getCommentsByItemId: async (itemId, filter) => {
    const builder = new URLBuilder("api").setPath(
      API_ENDPOINTS.MARKETPLACE.COMMENTS.GET_BY_ITEM(itemId)
    );
    if (filter) {
      if (filter.status) builder.addQueryParam("status", filter.status);
      if (filter.limit) builder.addQueryParam("limit", String(filter.limit));
      if (filter.offset) builder.addQueryParam("offset", String(filter.offset));
      if (filter.sortBy) builder.addQueryParam("sortBy", filter.sortBy);
      if (filter.sortOrder)
        builder.addQueryParam("sortOrder", filter.sortOrder);
    }
    return apiClient.get(builder.build());
  },
  updateComment: async (commentId, data) => {
    return apiClient.patch(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.UPDATE(commentId)).build(),
      data
    );
  },
  deleteComment: async (commentId) => {
    return apiClient.delete(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.DELETE(commentId)).build()
    );
  },
  moderateComment: async (commentId, status) => {
    return apiClient.post(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.MODERATE(commentId)).build(),
      { status }
    );
  },
  getCommentCount: async (itemId) => {
    return apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.GET_COUNT(itemId)).build()
    );
  },
  // Reaction operations
  createReaction: async (commentId, data) => {
    return apiClient.post(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.CREATE_REACTION(commentId)).build(),
      data
    );
  },
  deleteReaction: async (commentId, reactionType) => {
    return apiClient.delete(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.DELETE_REACTION(commentId)).addQueryParam("type", reactionType).build()
    );
  },
  getReactions: async (commentId) => {
    return apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.COMMENTS.GET_REACTIONS(commentId)).build()
    );
  },
  getReactionSummary: async (commentId) => {
    return apiClient.get(
      new URLBuilder("api").setPath(
        API_ENDPOINTS.MARKETPLACE.COMMENTS.GET_REACTION_SUMMARY(commentId)
      ).build()
    );
  }
};
function CommentItem({ comment, onReply }) {
  const { userId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const createReaction = useCreateReaction();
  const deleteReaction = useDeleteReaction();
  const isAuthor = userId === comment.authorId;
  const userHasLiked = comment.reactions?.some(
    (r) => r.userId === userId && r.type === "like"
  );
  const likeCount = comment.reactions?.filter((r) => r.type === "like").length || 0;
  const handleEdit = () => {
    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };
  const handleSaveEdit = async () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }
    await updateComment.mutateAsync({
      commentId: comment.id,
      data: { content: editContent.trim() }
    });
    setIsEditing(false);
  };
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      await deleteComment.mutateAsync(comment.id);
    }
  };
  const handleReaction = async (type) => {
    const hasReacted = comment.reactions?.some(
      (r) => r.userId === userId && r.type === type
    );
    if (hasReacted) {
      await deleteReaction.mutateAsync({ commentId: comment.id, reactionType: type });
    } else {
      await createReaction.mutateAsync({ commentId: comment.id, data: { type } });
    }
  };
  const getAuthorInitials = () => {
    const firstName = comment.author?.firstName || "";
    const lastName = comment.author?.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return comment.author?.email?.[0]?.toUpperCase() || "U";
  };
  const getAuthorName = () => {
    const firstName = comment.author?.firstName || "";
    const lastName = comment.author?.lastName || "";
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return comment.author?.email || "Anonymous";
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
    /* @__PURE__ */ jsxs(Avatar, { className: "h-9 w-9 shrink-0", children: [
      /* @__PURE__ */ jsx(AvatarImage, { src: comment.author?.imageUrl || void 0 }),
      /* @__PURE__ */ jsx(AvatarFallback, { className: "text-xs", children: getAuthorInitials() })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-sm", children: getAuthorName() }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) }),
          comment.edited && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs py-0 px-1.5", children: "Edited" })
        ] }),
        isAuthor && /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
            /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: handleEdit, children: [
              /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
              "Edit"
            ] }),
            /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: handleDelete, className: "text-destructive", children: [
              /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
              "Delete"
            ] })
          ] })
        ] })
      ] }),
      isEditing ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(
          Textarea,
          {
            value: editContent,
            onChange: (e) => setEditContent(e.target.value),
            className: "min-h-20",
            placeholder: "Edit your comment..."
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: handleSaveEdit,
              disabled: updateComment.isPending || !editContent.trim(),
              children: [
                updateComment.isPending && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                "Save"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: handleCancelEdit,
              disabled: updateComment.isPending,
              children: "Cancel"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground leading-relaxed whitespace-pre-wrap", children: comment.content }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 pt-1", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: cn(
                "h-7 px-2 gap-1.5",
                userHasLiked && "text-red-500 hover:text-red-600"
              ),
              onClick: () => handleReaction("like"),
              children: [
                /* @__PURE__ */ jsx(Heart, { className: cn("h-4 w-4", userHasLiked && "fill-current") }),
                likeCount > 0 && /* @__PURE__ */ jsx("span", { className: "text-xs", children: likeCount })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "h-7 px-2 gap-1.5",
              onClick: () => setShowReplyForm(!showReplyForm),
              children: [
                /* @__PURE__ */ jsx(Reply, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Reply" })
              ]
            }
          ),
          !isAuthor && /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "h-7 px-2 gap-1.5", children: [
            /* @__PURE__ */ jsx(Flag, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Report" })
          ] })
        ] }),
        showReplyForm && /* @__PURE__ */ jsx("div", { className: "pt-3", children: /* @__PURE__ */ jsx(
          CommentForm,
          {
            itemId: comment.itemId,
            parentId: comment.id,
            onSuccess: () => setShowReplyForm(false),
            placeholder: "Write a reply...",
            submitLabel: "Reply",
            autoFocus: true
          }
        ) })
      ] }),
      comment.replies && comment.replies.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-4 pt-4 pl-4 border-l-2 border-border/50", children: comment.replies.map((reply) => /* @__PURE__ */ jsx(CommentItem, { comment: reply }, reply.id)) })
    ] })
  ] });
}
function CommentForm({
  itemId,
  parentId,
  onSuccess,
  placeholder = "Write a comment...",
  submitLabel = "Post Comment",
  autoFocus = false
}) {
  const [content, setContent] = useState("");
  const createComment = useCreateComment();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    await createComment.mutateAsync({
      content: content.trim(),
      itemId,
      parentId: parentId || null
    });
    setContent("");
    onSuccess?.();
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [
    /* @__PURE__ */ jsx(
      Textarea,
      {
        value: content,
        onChange: (e) => setContent(e.target.value),
        placeholder,
        className: "min-h-[100px] resize-none",
        autoFocus
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(
      Button,
      {
        type: "submit",
        disabled: createComment.isPending || !content.trim(),
        size: "sm",
        children: [
          createComment.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 mr-2" }),
          submitLabel
        ]
      }
    ) })
  ] });
}
function CommentSection({ itemId }) {
  const { data: commentsData, isLoading } = useCommentsByItem(itemId, {
    status: "published",
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const { userId } = useAuth();
  const comments = commentsData?.data || [];
  const totalComments = commentsData?.total || 0;
  return /* @__PURE__ */ jsx(Card, { className: "border border-border/40 bg-card/40 backdrop-blur-sm", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-8 space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(MessageSquare, { className: "h-5 w-5 text-primary" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground text-lg", children: "Comments" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
          totalComments,
          " ",
          totalComments === 1 ? "comment" : "comments"
        ] })
      ] })
    ] }) }),
    userId && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(CommentForm, { itemId }) }),
    /* @__PURE__ */ jsx("div", { className: "space-y-6", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : comments.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(MessageSquare, { className: "h-12 w-12 mx-auto mb-3 opacity-50" }),
      /* @__PURE__ */ jsx("p", { children: "No comments yet. Be the first to comment!" })
    ] }) : comments.map((comment) => /* @__PURE__ */ jsx(CommentItem, { comment }, comment.id)) })
  ] }) });
}
function MarketplaceItemDetail({ item }) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const downloadItem = useDownloadMarketplaceItem();
  const incrementLikes = useIncrementLikes();
  const getTemplateTypeLabel = (type) => {
    switch (type) {
      case "full-site":
        return "Full Site";
      case "page":
        return "Page";
      case "section":
        return "Section";
      case "block":
        return "Block";
      default:
        return type;
    }
  };
  const handleDownload = async () => {
    try {
      const newProject = await downloadItem.mutateAsync(item.id);
      navigate({ to: `/editor/${newProject.id}` });
    } catch (error) {
      console.error("Failed to download template:", error);
    }
  };
  const handleLike = async () => {
    if (isLiked) return;
    try {
      await incrementLikes.mutateAsync(item.id);
      setIsLiked(true);
    } catch (error) {
      console.error("Failed to like item:", error);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen min-w-screen bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "sticky top-0 z-40 border-b border-border/30 bg-background/95 backdrop-blur-md", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-3 max-w-screen flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          className: "text-muted-foreground hover:text-foreground transition-colors",
          onClick: () => navigate({ to: "/marketplace" }),
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
            "Back to Marketplace"
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: item.featured && /* @__PURE__ */ jsxs(
        Badge,
        {
          variant: "secondary",
          className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200/30 dark:border-amber-900/30",
          children: [
            /* @__PURE__ */ jsx(Star, { className: "h-3 w-3 mr-1.5 fill-current" }),
            "Featured"
          ]
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-16 max-w-screen", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative rounded-2xl overflow-hidden border border-border/40 bg-muted/20 shadow-lg", children: [
          /* @__PURE__ */ jsx("div", { className: "relative aspect-video bg-gradient-to-br from-muted/50 to-muted/20", children: /* @__PURE__ */ jsx(
            "iframe",
            {
              src: `/preview/${item.projectId}`,
              className: "w-full h-full border-0",
              title: `${item.title} preview`,
              loading: "lazy",
              sandbox: "allow-same-origin"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-6 right-6", children: /* @__PURE__ */ jsx(Badge, { className: "bg-background/95 text-foreground border border-border/50 backdrop-blur-sm font-medium", children: getTemplateTypeLabel(item.templateType) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-5xl font-bold text-foreground mb-4 leading-tight", children: item.title }),
            /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground leading-relaxed max-w-2xl", children: item.description })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-6 pt-8 border-t border-border/30", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
                /* @__PURE__ */ jsx(Eye, { className: "h-5 w-5" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Views" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-4xl font-bold text-foreground", children: (item.downloads || 0).toLocaleString() })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
                /* @__PURE__ */ jsx(Download, { className: "h-5 w-5" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Downloads" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-4xl font-bold text-foreground", children: (item.downloads || 0).toLocaleString() })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
                /* @__PURE__ */ jsx(Heart, { className: "h-5 w-5" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Likes" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-4xl font-bold text-foreground", children: (item.likes || 0).toLocaleString() })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsx(Card, { className: "border border-border/40 bg-card/40 backdrop-blur-sm hover:border-border/60 transition-colors", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-8 space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(Code2, { className: "h-5 w-5 text-primary" }) }),
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground text-lg", children: "Technical Details" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-3 border-b border-border/20", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground font-medium", children: "Type" }),
                /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs font-medium", children: getTemplateTypeLabel(item.templateType) })
              ] }),
              item.pageCount && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-3 border-b border-border/20", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground font-medium", children: "Pages" }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: item.pageCount })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-3 border-b border-border/20", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground font-medium", children: "Downloads" }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: (item.downloads || 0).toLocaleString() })
              ] }),
              item.createdAt && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-3", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground font-medium", children: "Created" }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: new Date(item.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  }
                ) })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { className: "border border-border/40 bg-card/40 backdrop-blur-sm hover:border-border/60 transition-colors", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-8 space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5 text-primary" }) }),
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground text-lg", children: "Tags & Categories" })
            ] }),
            item.categories && item.categories.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Categories" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: item.categories.map((category, index) => /* @__PURE__ */ jsx(
                Badge,
                {
                  variant: "secondary",
                  className: "text-xs font-medium",
                  children: category.name
                },
                category.id || `category-${index}`
              )) })
            ] }),
            item.tags && item.tags.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Tags" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: item.tags.map((tag, index) => /* @__PURE__ */ jsx(
                Badge,
                {
                  variant: "outline",
                  className: "text-xs font-medium",
                  children: typeof tag === "string" ? tag : tag?.name || tag?.id || "Unknown"
                },
                `tag-${typeof tag === "string" ? tag : tag?.name || tag?.id || index}`
              )) })
            ] })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 sticky top-24", children: [
        item.author && /* @__PURE__ */ jsx(Card, { className: "border border-border/40 bg-card/40 backdrop-blur-sm", children: /* @__PURE__ */ jsx(CardContent, { className: "p-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
          /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto border border-primary/20", children: /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-primary", children: item.author.name.charAt(0).toUpperCase() }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-foreground text-base", children: item.author.name }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground font-medium", children: "Template Creator" })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              className: "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-lg transition-all duration-200 text-base",
              size: "lg",
              onClick: handleDownload,
              disabled: downloadItem.isPending,
              children: [
                downloadItem.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 mr-2 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "h-5 w-5 mr-2" }),
                downloadItem.isPending ? "Creating Project..." : "Download Template"
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "outline",
                className: cn(
                  "flex-1 py-6 rounded-lg transition-all duration-200 font-medium",
                  incrementLikes.isPending ? "border-red-500/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20" : "border-border/40 hover:border-red-300/50 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/10"
                ),
                size: "lg",
                onClick: handleLike,
                disabled: incrementLikes.isPending,
                children: incrementLikes.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsx(Heart, { className: "h-5 w-5 transition-all" })
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "outline",
                className: "flex-1 py-6 rounded-lg border-border/40 bg-transparent hover:bg-muted/50 transition-colors font-medium",
                size: "lg",
                children: /* @__PURE__ */ jsx(Share2, { className: "h-5 w-5" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(Card, { className: "border border-border/40 bg-card/40 backdrop-blur-sm", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-6", children: [
            /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Performance" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground font-medium", children: "Downloads" }),
              /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-foreground", children: (item.downloads || 0).toLocaleString() })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground font-medium", children: "Likes" }),
              /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-foreground", children: (item.likes || 0).toLocaleString() })
            ] }),
            item.pageCount && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground font-medium", children: "Pages" }),
              /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-foreground", children: item.pageCount })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsx(CommentSection, { itemId: item.id }) })
      ] }) })
    ] }) })
  ] });
}
function MarketplaceItemDetailWrapper({
  id
}) {
  const {
    data: item,
    error
  } = useMarketplaceItem(id);
  if (error || !item) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen min-w-screen bg-background flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-2", children: "Template Not Found" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "The template you're looking for doesn't exist or has been removed." }),
      /* @__PURE__ */ jsx("a", { href: "/marketplace", className: "text-primary hover:underline", children: "Back to Marketplace" })
    ] }) });
  }
  return /* @__PURE__ */ jsx(MarketplaceItemDetail, { item });
}
function MarketplaceItemPage() {
  const {
    id
  } = Route.useParams();
  return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "min-h-screen min-w-screen bg-background flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" }),
    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Loading template..." })
  ] }) }), children: /* @__PURE__ */ jsx(MarketplaceItemDetailWrapper, { id }) });
}
export {
  MarketplaceItemPage as component
};
