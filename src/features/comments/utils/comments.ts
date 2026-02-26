import { ElementComment } from "@/features/comments";

export type ViewMode = "all" | "unresolved" | "resolved";
export type SortOrder = "newest" | "oldest";

/**
 * Filters comments based on the view mode
 */
export function filterCommentsByViewMode(
  comments: ElementComment[],
  viewMode: ViewMode
): ElementComment[] {
  if (viewMode === "unresolved") {
    return comments.filter((c) => !c.resolved);
  }
  if (viewMode === "resolved") {
    return comments.filter((c) => c.resolved);
  }
  return comments;
}

/**
 * Sorts comments by creation date
 */
export function sortCommentsByDate(
  comments: ElementComment[],
  order: SortOrder
): ElementComment[] {
  const sorted = [...comments];
  sorted.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return order === "newest" ? dateB - dateA : dateA - dateB;
  });
  return sorted;
}

/**
 * Filters and sorts comments in one operation
 */
export function processComments(
  comments: ElementComment[],
  viewMode: ViewMode,
  sortOrder: SortOrder
): ElementComment[] {
  const filtered = filterCommentsByViewMode(comments, viewMode);
  return sortCommentsByDate(filtered, sortOrder);
}

/**
 * Gets the count of unresolved comments
 */
export function getUnresolvedCount(comments: ElementComment[]): number {
  return comments.filter((c) => !c.resolved).length;
}

/**
 * Formats author name with fallback
 */
export function formatAuthorName(author: {
  firstName?: string;
  lastName?: string;
  email?: string;
}): string {
  if (author.firstName && author.lastName) {
    return `${author.firstName} ${author.lastName}`;
  }
  return author.email || "Unknown User";
}

/**
 * Gets author initials for avatar
 */
export function getAuthorInitial(author: {
  firstName?: string;
  email?: string;
}): string {
  return (
    author.firstName?.[0] || author.email?.[0]?.toUpperCase() || "U"
  );
}

/**
 * Gets empty state message based on view mode
 */
export function getEmptyStateMessage(viewMode: ViewMode): {
  title: string;
  description: string;
} {
  switch (viewMode) {
    case "unresolved":
      return {
        title: "No active comments",
        description: "All issues have been resolved!",
      };
    case "resolved":
      return {
        title: "No resolved comments",
        description: "No comments have been marked as done yet.",
      };
    default:
      return {
        title: "No comments yet",
        description: "Start the conversation!",
      };
  }
}
