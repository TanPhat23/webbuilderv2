import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useQuery, useQueryClient, HydrationBoundary } from "@tanstack/react-query";
import React__default, { useDeferredValue, useState, useMemo, useEffect, memo, useRef } from "react";
import { UserPlus, Loader2, Eye, Edit, Crown, LogOut, Trash2, Mail, CheckCircle, Clock, Users, Zap, ZapOff, FileText, LayoutTemplate, PenTool, ChevronRight, Search, Code, MessageSquare, MessageSquareOff, Smartphone, Tablet, Monitor, MousePointer, GripVerticalIcon } from "lucide-react";
import { aa as useMouseStore, Q as QUERY_CONFIG, C as CollaboratorRole, F as Dialog, ab as DialogTrigger, B as Button, G as DialogContent, H as DialogHeader, J as DialogTitle, K as DialogDescription, L as Label, M as DialogFooter, d as Badge, a8 as useProjectStore, ac as useEventModeStore, h as cn, ad as usePageStore, ae as TooltipProvider, af as Tooltip, ag as TooltipTrigger, ah as TooltipContent, ai as useElementCommentStore } from "./prisma-BUnO9f9X.js";
import { U as URLBuilder, A as API_ENDPOINTS, a as apiClient } from "./project.service-Bci2lGYe.js";
import "sonner";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-D42cGFKZ.js";
import "clsx";
import "next-themes";
import "socket.io-client";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPf1Vtyb.js";
import "@hookform/resolvers/zod";
import { C as Command, a as CommandInput, b as CommandList, c as CommandEmpty, d as CommandGroup, e as CommandItem, f as CommandDialog, u as useEditorContext, g as useCollaborationOptional } from "./editorprovider-C0ucQMtg.js";
import { formatDistanceToNow } from "date-fns";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BKkMS2Kc.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-8AV7uvvC.js";
import { u as useCollaboratorManager, K as KeyboardEvent, E as ElementLoader, a as useElements } from "./SelectComponent-Bh8IGRc1.js";
import { a as useInvitationManager } from "./useInvitations-A9u_4N3B.js";
import { useAuth } from "@clerk/react";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-CR7T1iYq.js";
import { A as Avatar, b as AvatarFallback } from "./avatar-BTnsTn8t.js";
import { useShallow } from "zustand/react/shallow";
import { D as DropdownMenu, b as DropdownMenuContent, e as DropdownMenuLabel, d as DropdownMenuSeparator, f as DropdownMenuCheckboxItem, c as DropdownMenuItem } from "./dropdown-menu-Bk3fcYaf.js";
import { useParams, useNavigate } from "@tanstack/react-router";
import { S as Separator } from "./separator-02AnxWMB.js";
import { createPortal } from "react-dom";
import { S as Skeleton } from "./skeleton-CYb2-ffB.js";
import Editor$1, { useMonaco } from "@monaco-editor/react";
import { e as elementService, c as Route } from "./router-BlPuUPbX.js";
import * as ResizablePrimitive from "react-resizable-panels";
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
import "yjs";
import "y-indexeddb";
import "events";
import "y-protocols/awareness";
import "./accordion-D43pR8IL.js";
import "cmdk";
import "./page-Cy1amgId.js";
import "isomorphic-dompurify";
import "./scroll-area-D0pODww5.js";
import "framer-motion";
import "./textarea-D5_jSc2n.js";
import "./carousel-CEa84Ygm.js";
import "embla-carousel-react";
import "@radix-ui/react-context-menu";
import "./checkbox-Cs4k79tJ.js";
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
const useCollaboratorUsers = () => useMouseStore((s) => s.users);
const useCollaborationCursors = () => useMouseStore(
  useShallow((s) => ({
    remoteUsers: s.remoteUsers,
    users: s.users
  }))
);
const viewportSizes = {
  mobile: { width: "375px", height: "667px" },
  tablet: { width: "768px", height: "1024px" },
  desktop: { width: "100%", height: "100%" }
};
const userService = {
  searchUsers: async (query, limit = 20, offset = 0) => {
    try {
      console.log("User search params:", { query, limit, offset });
      const url = new URLBuilder("api").setPath(API_ENDPOINTS.USERS.SEARCH).addQueryParam("q", query).addQueryParam("limit", limit.toString()).addQueryParam("offset", offset.toString()).build();
      console.log("User search URL:", url);
      const response = await apiClient.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.warn(`Failed to search users with query ${query}:`, error);
      return [];
    }
  },
  getUserByEmail: async (email) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.USERS.GET_BY_EMAIL(email)).build();
    return apiClient.get(url);
  },
  getUserByUsername: async (username) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.USERS.GET_BY_USERNAME(username)).build();
    return apiClient.get(url);
  }
};
const userKeys = {
  all: ["users"],
  lists: () => [...userKeys.all, "list"],
  list: (filters) => [...userKeys.lists(), filters],
  search: (query, limit, offset) => [...userKeys.all, "search", query, limit, offset],
  byEmail: (email) => [...userKeys.all, "email", email],
  byUsername: (username) => [...userKeys.all, "username", username]
};
function useSearchUsers(query, enabled = true, limit = 20, offset = 0) {
  const debouncedQuery = useDeferredValue(query);
  return useQuery({
    queryKey: userKeys.search(debouncedQuery, limit, offset),
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const result = await userService.searchUsers(
        debouncedQuery,
        limit,
        offset
      );
      return result;
    },
    enabled: !!debouncedQuery.trim() && enabled,
    ...QUERY_CONFIG.DEFAULT
  });
}
function InviteMemberDialog({
  isOpen,
  onOpenChange,
  onInvite,
  isCreating
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState(
    CollaboratorRole.VIEWER
  );
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(
    inviteEmail,
    inviteEmail.length > 2
  );
  console.log("Search results:", searchResults);
  console.log("Is searching:", isSearching);
  console.log("Invite email:", inviteEmail);
  console.log("Search results type:", Array.isArray(searchResults));
  const handleInvite = async () => {
    if (!inviteEmail || !inviteRole) return;
    try {
      await onInvite(inviteEmail, inviteRole);
      setInviteEmail("");
      setInviteRole(CollaboratorRole.VIEWER);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to send invitation:", error);
    }
  };
  return /* @__PURE__ */ jsxs(Dialog, { open: isOpen, onOpenChange, children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
      /* @__PURE__ */ jsx(UserPlus, { className: "mr-2 h-4 w-4" }),
      "Invite Member"
    ] }) }),
    /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Invite Team Member" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Send an invitation to collaborate on this project" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email Address" }),
          /* @__PURE__ */ jsxs(
            Command,
            {
              className: "rounded-lg border shadow-md",
              shouldFilter: false,
              children: [
                /* @__PURE__ */ jsx(
                  CommandInput,
                  {
                    placeholder: "Search users or enter email...",
                    value: inviteEmail,
                    onValueChange: setInviteEmail
                  }
                ),
                /* @__PURE__ */ jsx(CommandList, { children: isSearching ? /* @__PURE__ */ jsx("div", { className: "py-6 text-center text-sm", children: /* @__PURE__ */ jsx(Loader2, { className: "mx-auto h-4 w-4 animate-spin" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(CommandEmpty, { children: inviteEmail ? "No users found. You can still invite by email." : "Start typing to search users or enter an email." }),
                  searchResults && Array.isArray(searchResults) && searchResults.length > 0 && /* @__PURE__ */ jsx(CommandGroup, { heading: "Select a user", children: searchResults.map((user) => /* @__PURE__ */ jsx(
                    CommandItem,
                    {
                      value: user.email,
                      onSelect: () => setInviteEmail(user.email),
                      children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                        /* @__PURE__ */ jsx("span", { children: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "No name" }),
                        /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: user.email })
                      ] })
                    },
                    user.id
                  )) })
                ] }) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "role", children: "Role" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: inviteRole,
              onValueChange: (value) => setInviteRole(value),
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { id: "role", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select a role" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: CollaboratorRole.VIEWER, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsx("span", { children: "Viewer - Can view only" })
                  ] }) }),
                  /* @__PURE__ */ jsx(SelectItem, { value: CollaboratorRole.EDITOR, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsx("span", { children: "Editor - Can view and edit" })
                  ] }) })
                ] })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: handleInvite,
            disabled: !inviteEmail || !inviteRole || isCreating,
            children: [
              isCreating && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Send Invitation"
            ]
          }
        )
      ] })
    ] })
  ] });
}
const getRoleIcon = (role) => {
  switch (role) {
    case CollaboratorRole.OWNER:
      return /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4 text-yellow-500" });
    case CollaboratorRole.EDITOR:
      return /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 text-blue-500" });
    case CollaboratorRole.VIEWER:
      return /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 text-gray-500" });
    default:
      return null;
  }
};
const getRoleBadgeVariant = (role) => {
  switch (role) {
    case CollaboratorRole.OWNER:
      return "default";
    case CollaboratorRole.EDITOR:
      return "secondary";
    case CollaboratorRole.VIEWER:
      return "outline";
    default:
      return "outline";
  }
};
const getFullName$1 = (user) => {
  if (!user) return "Unknown User";
  const { firstName, lastName } = user;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  return "Unknown User";
};
const getAvatarInitial$1 = (user) => {
  if (!user) return "";
  const { firstName, lastName, email } = user;
  if (firstName) return firstName.charAt(0).toUpperCase();
  if (lastName) return lastName.charAt(0).toUpperCase();
  if (email) return email.charAt(0).toUpperCase();
  return "";
};
function CollaboratorsTable({
  collaborators,
  currentUserId,
  isOwner,
  isLoading,
  isUpdatingRole,
  onUpdateRole,
  onRemoveCollaborator
}) {
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  if (collaborators.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No team members yet. Invite someone to collaborate!" });
  }
  return /* @__PURE__ */ jsxs(Table, { children: [
    /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
      /* @__PURE__ */ jsx(TableHead, { children: "User" }),
      /* @__PURE__ */ jsx(TableHead, { children: "Role" }),
      /* @__PURE__ */ jsx(TableHead, { children: "Joined" }),
      /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
    ] }) }),
    /* @__PURE__ */ jsx(TableBody, { children: collaborators.map((collaborator) => {
      const isCurrentUser = collaborator.userId === currentUserId;
      const canModify = isOwner && collaborator.role !== CollaboratorRole.OWNER;
      return /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary/10", children: getAvatarInitial$1(collaborator.user) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "font-medium", children: [
              getFullName$1(collaborator.user),
              isCurrentUser && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs text-muted-foreground", children: "(You)" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: collaborator.user?.email })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: canModify ? /* @__PURE__ */ jsxs(
          Select,
          {
            value: collaborator.role,
            onValueChange: (value) => onUpdateRole(collaborator.id, value),
            disabled: isUpdatingRole,
            children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[140px]", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                getRoleIcon(collaborator.role),
                /* @__PURE__ */ jsx(SelectValue, {})
              ] }) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: CollaboratorRole.VIEWER, children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx("span", { children: "Viewer" }) }) }),
                /* @__PURE__ */ jsx(SelectItem, { value: CollaboratorRole.EDITOR, children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx("span", { children: "Editor" }) }) })
              ] })
            ]
          }
        ) : /* @__PURE__ */ jsx(Badge, { variant: getRoleBadgeVariant(collaborator.role), children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          getRoleIcon(collaborator.role),
          /* @__PURE__ */ jsx("span", { className: "capitalize", children: collaborator.role })
        ] }) }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-sm text-muted-foreground", children: formatDistanceToNow(new Date(collaborator.createdAt), {
          addSuffix: true
        }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: isCurrentUser && collaborator.role !== CollaboratorRole.OWNER ? /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => onRemoveCollaborator(collaborator.id),
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4 mr-2" }),
              "Leave"
            ]
          }
        ) : canModify ? /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => onRemoveCollaborator(collaborator.id),
            children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
          }
        ) : null })
      ] }, collaborator.id);
    }) })
  ] });
}
function InvitationsTable({
  invitations,
  isLoading,
  onDeleteInvitation
}) {
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  if (invitations.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No pending invitations" });
  }
  return /* @__PURE__ */ jsxs(Table, { children: [
    /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
      /* @__PURE__ */ jsx(TableHead, { children: "Email" }),
      /* @__PURE__ */ jsx(TableHead, { children: "Role" }),
      /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
      /* @__PURE__ */ jsx(TableHead, { children: "Sent" }),
      /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
    ] }) }),
    /* @__PURE__ */ jsx(TableBody, { children: invitations.map((invitation) => {
      const isExpired = new Date(invitation.expiresAt) < /* @__PURE__ */ new Date();
      const isAccepted = !!invitation.acceptedAt;
      return /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx("span", { children: invitation.email })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: getRoleBadgeVariant(invitation.role), children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          getRoleIcon(invitation.role),
          /* @__PURE__ */ jsx("span", { className: "capitalize", children: invitation.role })
        ] }) }) }),
        /* @__PURE__ */ jsx(TableCell, { children: isAccepted ? /* @__PURE__ */ jsxs(Badge, { variant: "default", className: "bg-green-500", children: [
          /* @__PURE__ */ jsx(CheckCircle, { className: "mr-1 h-3 w-3" }),
          "Accepted"
        ] }) : isExpired ? /* @__PURE__ */ jsxs(Badge, { variant: "destructive", children: [
          /* @__PURE__ */ jsx(Clock, { className: "mr-1 h-3 w-3" }),
          "Expired"
        ] }) : /* @__PURE__ */ jsxs(Badge, { variant: "secondary", children: [
          /* @__PURE__ */ jsx(Clock, { className: "mr-1 h-3 w-3" }),
          "Pending"
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-sm text-muted-foreground", children: formatDistanceToNow(new Date(invitation.createdAt), {
          addSuffix: true
        }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: !isAccepted && /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => onDeleteInvitation(invitation.id),
            children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
          }
        ) })
      ] }, invitation.id);
    }) })
  ] });
}
function ConfirmationDialogs({
  deleteCollaboratorId,
  deleteInvitationId,
  collaborators,
  currentUserId,
  isRemoving,
  isDeleting,
  onCancelRemoveCollaborator,
  onConfirmRemoveCollaborator,
  onCancelDeleteInvitation,
  onConfirmDeleteInvitation
}) {
  const collaboratorToRemove = collaborators.find(
    (c) => c.id === deleteCollaboratorId
  );
  const isLeaving = collaboratorToRemove?.userId === currentUserId;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      AlertDialog,
      {
        open: !!deleteCollaboratorId,
        onOpenChange: (open) => !open && onCancelRemoveCollaborator(),
        children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsx(AlertDialogTitle, { children: isLeaving ? "Leave Project" : "Remove Team Member" }),
            /* @__PURE__ */ jsx(AlertDialogDescription, { children: isLeaving ? "Are you sure you want to leave this project? You will lose access to all project resources." : "Are you sure you want to remove this team member? They will lose access to the project." })
          ] }),
          /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
            /* @__PURE__ */ jsxs(
              AlertDialogAction,
              {
                onClick: onConfirmRemoveCollaborator,
                className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                children: [
                  isRemoving && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                  isLeaving ? "Leave Project" : "Remove"
                ]
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      AlertDialog,
      {
        open: !!deleteInvitationId,
        onOpenChange: (open) => !open && onCancelDeleteInvitation(),
        children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Revoke Invitation" }),
            /* @__PURE__ */ jsx(AlertDialogDescription, { children: "Are you sure you want to revoke this invitation? The recipient will no longer be able to use the invitation link." })
          ] }),
          /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
            /* @__PURE__ */ jsxs(
              AlertDialogAction,
              {
                onClick: onConfirmDeleteInvitation,
                className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                children: [
                  isDeleting && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                  "Revoke"
                ]
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
function CollaborationManager({
  projectId,
  currentUserId,
  isOwner
}) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [deleteCollaboratorId, setDeleteCollaboratorId] = useState(null);
  const [deleteInvitationId, setDeleteInvitationId] = useState(
    null
  );
  const invitations = useInvitationManager(projectId);
  const collaborators = useCollaboratorManager(projectId);
  const handleInvite = async (email, role) => {
    await invitations.createInvitationAsync({
      projectId,
      email,
      role
    });
  };
  const handleUpdateRole = async (collaboratorId, role) => {
    await collaborators.updateCollaboratorRoleAsync(collaboratorId, { role });
  };
  const handleRemoveCollaborator = async () => {
    if (!deleteCollaboratorId) return;
    await collaborators.removeCollaboratorAsync(deleteCollaboratorId);
    setDeleteCollaboratorId(null);
  };
  const handleDeleteInvitation = async () => {
    if (!deleteInvitationId) return;
    await invitations.deleteInvitationAsync(deleteInvitationId);
    setDeleteInvitationId(null);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Team Members" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Manage who has access to this project" })
        ] }),
        isOwner && /* @__PURE__ */ jsx(
          InviteMemberDialog,
          {
            isOpen: isInviteDialogOpen,
            onOpenChange: setIsInviteDialogOpen,
            onInvite: handleInvite,
            isCreating: invitations.isCreating
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(
        CollaboratorsTable,
        {
          collaborators: collaborators.collaborators,
          currentUserId,
          isOwner,
          isLoading: collaborators.isLoading,
          isUpdatingRole: collaborators.isUpdatingRole,
          onUpdateRole: handleUpdateRole,
          onRemoveCollaborator: setDeleteCollaboratorId
        }
      ) })
    ] }),
    isOwner && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Pending Invitations" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Invitations sent but not yet accepted" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(
        InvitationsTable,
        {
          invitations: invitations.invitations,
          isLoading: invitations.isLoading,
          onDeleteInvitation: setDeleteInvitationId
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(
      ConfirmationDialogs,
      {
        deleteCollaboratorId,
        deleteInvitationId,
        collaborators: collaborators.collaborators,
        currentUserId,
        isRemoving: collaborators.isRemoving,
        isDeleting: invitations.isDeleting,
        onCancelRemoveCollaborator: () => setDeleteCollaboratorId(null),
        onConfirmRemoveCollaborator: handleRemoveCollaborator,
        onCancelDeleteInvitation: () => setDeleteInvitationId(null),
        onConfirmDeleteInvitation: handleDeleteInvitation
      }
    )
  ] });
}
function CollaborationButton({
  projectId
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { userId } = useAuth();
  const { project } = useProjectStore();
  const isOwner = project?.ownerId === userId;
  if (!isOwner) {
    return null;
  }
  return /* @__PURE__ */ jsxs(Dialog, { open: isOpen, onOpenChange: setIsOpen, children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        size: "sm",
        className: "flex items-center gap-2 hover:text-foreground bg-blue-500 hover:bg-blue-600 text-white",
        children: "Share"
      }
    ) }),
    /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-[40vw]! min-w-[20vw] max-h-[95vh] overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(UserPlus, { className: "h-5 w-5" }),
        "Project Collaboration"
      ] }) }),
      /* @__PURE__ */ jsx(
        CollaborationManager,
        {
          projectId,
          currentUserId: userId || "",
          isOwner
        }
      )
    ] })
  ] });
}
const getFullName = (user) => {
  return user.userName || user.email || "Unknown User";
};
const getAvatarInitial = (user) => {
  if (user.userName) return user.userName.charAt(0).toUpperCase();
  if (user.email) return user.email.charAt(0).toUpperCase();
  return "";
};
function OnlineUserItem({ user, isCurrentUser = false }) {
  const displayName = isCurrentUser ? "You" : getFullName(user);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex items-center justify-between p-2 ${isCurrentUser ? "rounded-lg bg-muted/50 mb-2" : ""}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Avatar, { className: "h-6 w-6", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "text-xs", children: getAvatarInitial(user) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: displayName }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: user.email })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: "Online" }) })
      ]
    }
  );
}
function CollaboratorIndicator({
  projectId
}) {
  const { userId } = useAuth();
  const users = useCollaboratorUsers();
  const onlineUsers = Object.values(users);
  const currentUser = onlineUsers.find((u) => u.userId === userId);
  const otherUsers = onlineUsers.filter((u) => u.userId !== userId);
  const onlineCount = onlineUsers.length;
  const hasOnlineUsers = onlineCount > 0;
  if (!hasOnlineUsers) {
    return null;
  }
  return /* @__PURE__ */ jsxs(Popover, { children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "ghost",
        size: "sm",
        className: "flex items-center gap-2 text-muted-foreground hover:text-foreground",
        children: [
          /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: hasOnlineUsers ? `${onlineCount} ` : "No one online" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(PopoverContent, { className: "w-80", align: "end", children: /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h4", { className: "font-medium text-sm mb-3", children: "Online Collaborators" }),
      !hasOnlineUsers && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-3", children: "No one is currently online in this session." }),
      currentUser && /* @__PURE__ */ jsx(OnlineUserItem, { user: currentUser, isCurrentUser: true }),
      otherUsers.map((user) => /* @__PURE__ */ jsx(OnlineUserItem, { user }, user.userId))
    ] }) }) })
  ] });
}
const EventModeToggle = () => {
  const {
    isEventModeEnabled,
    toggleEventMode,
    setEventModeEnabled,
    clearDisabledElements
  } = useEventModeStore();
  return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: isEventModeEnabled ? "default" : "outline",
        size: "sm",
        className: cn(
          "gap-2",
          isEventModeEnabled && "bg-blue-600 hover:bg-blue-700"
        ),
        onClick: () => toggleEventMode(),
        title: `${isEventModeEnabled ? "Disable" : "Enable"} event mode`,
        children: isEventModeEnabled ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Events On" })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(ZapOff, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Events Off" })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-56", children: [
      /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Event Mode Settings" }),
      /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
      /* @__PURE__ */ jsxs(
        DropdownMenuCheckboxItem,
        {
          checked: isEventModeEnabled,
          onCheckedChange: setEventModeEnabled,
          className: "cursor-pointer flex flex-col items-start py-3",
          children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium", children: "Enable Event Handlers" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "When enabled, click/hover events on elements will execute their configured actions. When disabled, the editor is in normal mode allowing drag/drop and element selection." })
          ]
        }
      ),
      /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
      /* @__PURE__ */ jsx(
        DropdownMenuItem,
        {
          onClick: clearDisabledElements,
          className: "text-xs cursor-pointer",
          children: "Clear All Disabled Elements"
        }
      ),
      /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
      /* @__PURE__ */ jsxs("div", { className: "px-2 py-2 text-xs text-muted-foreground space-y-1", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Event Mode:" }),
          " ",
          isEventModeEnabled ? "✓ ON" : "✗ OFF"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-2", children: isEventModeEnabled ? "Elements will respond to configured events" : "Editor is in selection/drag mode" })
      ] })
    ] })
  ] }) });
};
function PageNavigationCommand({
  setOpen,
  open
}) {
  const { id } = useParams({ strict: false });
  const { pages, setCurrentPage, currentPage } = usePageStore();
  const navigate = useNavigate();
  const handleSelect = (page) => {
    setCurrentPage(page);
    navigate({ to: `/editor/${id}?page=${page.Id}` });
    setOpen(false);
  };
  return /* @__PURE__ */ jsxs(CommandDialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(CommandInput, { placeholder: "Type a command or search pages..." }),
    /* @__PURE__ */ jsxs(CommandList, { children: [
      /* @__PURE__ */ jsx(CommandEmpty, { children: "No pages found." }),
      /* @__PURE__ */ jsx(CommandGroup, { heading: "Project Pages", children: pages.map((page) => /* @__PURE__ */ jsxs(
        CommandItem,
        {
          value: page.Name,
          onSelect: () => handleSelect(page),
          className: `flex items-center gap-3 ${currentPage?.Id === page.Id ? "bg-muted" : ""}`,
          children: [
            /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: page.Name }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                page.Type,
                " page"
              ] })
            ] })
          ]
        },
        page.Id
      )) })
    ] })
  ] });
}
const VIEWPORT_OPTIONS = [
  { view: "mobile", icon: Smartphone, label: "Mobile" },
  { view: "tablet", icon: Tablet, label: "Tablet" },
  { view: "desktop", icon: Monitor, label: "Desktop" }
];
function useNavigationShortcut(onToggle) {
  React__default.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onToggle();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onToggle]);
}
function PillGroup({
  children,
  className
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "flex items-center rounded-lg bg-muted/50 border border-border p-0.5 gap-0.5",
        className
      ),
      children
    }
  );
}
function ProjectBreadcrumb() {
  const { project } = useProjectStore();
  const { currentPage } = usePageStore();
  if (!project) return null;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
    /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-foreground truncate max-w-32", children: project.name }),
    currentPage && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(ChevronRight, { className: "w-3 h-3 text-muted-foreground/40 shrink-0" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground truncate max-w-24", children: currentPage.Name || "Home" })
    ] })
  ] });
}
function ViewportToggle({
  currentView,
  setCurrentView
}) {
  return /* @__PURE__ */ jsx(PillGroup, { children: VIEWPORT_OPTIONS.map(({ view, icon: Icon, label }) => /* @__PURE__ */ jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setCurrentView(view),
        "aria-pressed": currentView === view,
        "aria-label": label,
        className: cn(
          "inline-flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150",
          currentView === view ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
        ),
        children: /* @__PURE__ */ jsx(Icon, { className: "w-3.5 h-3.5" })
      }
    ) }),
    /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", children: label })
  ] }, view)) });
}
function EditingModeToggle() {
  const { editingMode, setEditingMode } = useEditorContext();
  const isVisual = editingMode === "visual";
  return /* @__PURE__ */ jsxs(PillGroup, { children: [
    /* @__PURE__ */ jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setEditingMode("visual"),
          "aria-pressed": isVisual,
          className: cn(
            "inline-flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150",
            isVisual ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          ),
          children: /* @__PURE__ */ jsx(PenTool, { className: "w-3.5 h-3.5" })
        }
      ) }),
      /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", children: "Visual" })
    ] }),
    /* @__PURE__ */ jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setEditingMode("code"),
          "aria-pressed": !isVisual,
          className: cn(
            "inline-flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150",
            !isVisual ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          ),
          children: /* @__PURE__ */ jsx(Code, { className: "w-3.5 h-3.5" })
        }
      ) }),
      /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", children: "Code" })
    ] })
  ] });
}
function CanvasModeToggle() {
  const { mode, setMode } = useEditorContext();
  return /* @__PURE__ */ jsxs(PillGroup, { children: [
    /* @__PURE__ */ jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setMode("wireframe"),
          "aria-pressed": mode === "wireframe",
          className: cn(
            "inline-flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150",
            mode === "wireframe" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          ),
          children: /* @__PURE__ */ jsx(LayoutTemplate, { className: "w-3.5 h-3.5" })
        }
      ) }),
      /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", children: "Wireframe" })
    ] }),
    /* @__PURE__ */ jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setMode("editor"),
          "aria-pressed": mode === "editor",
          className: cn(
            "inline-flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150",
            mode === "editor" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          ),
          children: /* @__PURE__ */ jsx(PenTool, { className: "w-3.5 h-3.5" })
        }
      ) }),
      /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", children: "Editor" })
    ] })
  ] });
}
function CommentToggleButton() {
  const { showCommentButtons, toggleCommentButtons } = useElementCommentStore();
  return /* @__PURE__ */ jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: toggleCommentButtons,
        "aria-pressed": showCommentButtons,
        "aria-label": "Toggle comments",
        className: cn(
          "h-7 w-7 p-0 transition-colors",
          showCommentButtons ? "text-primary bg-primary/10 hover:bg-primary/15" : "text-muted-foreground hover:text-foreground"
        ),
        children: showCommentButtons ? /* @__PURE__ */ jsx(MessageSquare, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsx(MessageSquareOff, { className: "w-3.5 h-3.5" })
      }
    ) }),
    /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", children: showCommentButtons ? "Hide comments" : "Show comments" })
  ] });
}
function NavigateButton({ onClick }) {
  return /* @__PURE__ */ jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick,
        "aria-label": "Open page navigation (Cmd+K)",
        className: "inline-flex items-center justify-center h-7 w-7 text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-all duration-150",
        children: /* @__PURE__ */ jsx(Search, { className: "w-3.5 h-3.5" })
      }
    ) }),
    /* @__PURE__ */ jsxs(TooltipContent, { side: "bottom", children: [
      "Pages ",
      /* @__PURE__ */ jsx("kbd", { className: "font-mono opacity-60 text-[10px] ml-1", children: "⌘K" })
    ] })
  ] });
}
function LeftSection({
  projectId,
  onNavigate
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
    /* @__PURE__ */ jsx(ProjectBreadcrumb, {}),
    /* @__PURE__ */ jsx(NavigateButton, { onClick: onNavigate }),
    /* @__PURE__ */ jsx(CollaboratorIndicator, { projectId }),
    /* @__PURE__ */ jsx(CollaborationButton, { projectId })
  ] });
}
function RightSection({
  currentView,
  setCurrentView
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 ml-auto", children: [
    /* @__PURE__ */ jsx(EventModeToggle, {}),
    /* @__PURE__ */ jsx(EditingModeToggle, {}),
    /* @__PURE__ */ jsx(CommentToggleButton, {}),
    /* @__PURE__ */ jsx(Separator, { orientation: "vertical" }),
    /* @__PURE__ */ jsx(
      ViewportToggle,
      {
        currentView,
        setCurrentView
      }
    )
  ] });
}
function EditorHeader({
  currentView,
  setCurrentView,
  projectId
}) {
  const [navigationCommandOpen, setNavigationCommandOpen] = useState(false);
  useNavigationShortcut(() => setNavigationCommandOpen((prev) => !prev));
  return /* @__PURE__ */ jsxs(TooltipProvider, { children: [
    /* @__PURE__ */ jsxs("header", { className: "relative z-40 h-11 flex items-center justify-between gap-4 border-b border-border bg-background px-3", children: [
      /* @__PURE__ */ jsx(
        LeftSection,
        {
          projectId,
          onNavigate: () => setNavigationCommandOpen(true)
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 -translate-x-1/2", children: /* @__PURE__ */ jsx(CanvasModeToggle, {}) }),
      /* @__PURE__ */ jsx(
        RightSection,
        {
          currentView,
          setCurrentView
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      PageNavigationCommand,
      {
        open: navigationCommandOpen,
        setOpen: setNavigationCommandOpen
      }
    )
  ] });
}
const ElementLoading = ({ count = 5, variant = "mixed" }) => {
  const renderSkeletonElement = (index) => {
    switch (variant) {
      case "text":
        return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-3/4" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-1/2" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-5/6" })
        ] }, index);
      case "button":
        return /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-32 rounded-md" }, index);
      case "card":
        return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border p-4 space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
            /* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-12 rounded-full" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-32" }),
              /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-24" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-full" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-3/4" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-20 rounded-md" })
        ] }, index);
      case "form":
        return /* @__PURE__ */ jsxs("div", { className: "space-y-4 rounded-lg border p-4", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-24" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-16" }),
            /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-full rounded-md" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-20" }),
            /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-full rounded-md" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
            /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-20 rounded-md" }),
            /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-20 rounded-md" })
          ] })
        ] }, index);
      case "chart":
        return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border p-4 space-y-4", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-32" }),
          /* @__PURE__ */ jsx("div", { className: "flex items-end space-x-2 h-40", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsx(
            Skeleton,
            {
              className: "w-8 rounded-t-sm",
              style: { height: `${Math.random() * 120 + 40}px` }
            },
            i
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-16" }),
            /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-16" }),
            /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-16" })
          ] })
        ] }, index);
      case "image":
        return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-48 w-full rounded-lg" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-3/4" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-1/2" })
        ] }, index);
      case "mixed":
      default:
        return renderSkeletonElement(index);
    }
  };
  const renderMixedElement = (index) => {
    const elementTypes = [
      // Header with text
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-48" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-full" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-3/4" })
      ] }, `header-${index}`),
      // Button group
      /* @__PURE__ */ jsxs("div", { className: "flex space-x-3", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-24" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-32" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-20" })
      ] }, `buttons-${index}`),
      // Card with avatar
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border p-4 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-10 rounded-full" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-24" }),
            /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-16" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-full" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-2/3" })
      ] }, `card-${index}`),
      // Image with caption
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-32 w-full rounded-md" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-3/4" })
      ] }, `image-${index}`),
      // Form elements
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-20" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-full rounded-md" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-24" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-24 w-full rounded-md" })
      ] }, `form-${index}`)
    ];
    return elementTypes[index % elementTypes.length];
  };
  return /* @__PURE__ */ jsx("div", { className: "space-y-6 p-4", children: Array.from({ length: count }).map(
    (_, index) => variant === "mixed" ? renderMixedElement(index) : renderSkeletonElement(index)
  ) });
};
function useProjectHead(cssStyles) {
  return useMemo(() => {
    const cs = (cssStyles ?? "").trim();
    if (!cs) return "";
    const looksLikeHtml = cs.startsWith("<") || /<link\b|<style\b|<meta\b|<script\b/i.test(cs);
    return looksLikeHtml ? cs : `<style>${cs}</style>`;
  }, [cssStyles]);
}
function useIframeSrcDoc(projectHead, currentView) {
  const [srcDoc, setSrcDoc] = useState("");
  useEffect(() => {
    if (typeof document === "undefined") return;
    const fallback = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>${projectHead}<style>html,body,#react-iframe-root{height:100%;margin:0;padding:0;background:transparent;overflow:hidden}</style></head><body><div id="react-iframe-root" style="height:100%;width:100%"></div></body></html>`;
    try {
      const headNodes = Array.from(
        document.head.querySelectorAll("link[rel='stylesheet'], style")
      );
      const headHtml = headNodes.map((node) => {
        try {
          return node.outerHTML;
        } catch {
          const name = node.nodeName.toLowerCase();
          if (name === "style")
            return `<style>${node.textContent ?? ""}</style>`;
          if (name === "link") {
            const href = node.href;
            return href ? `<link rel="stylesheet" href="${href}">` : "";
          }
          return "";
        }
      }).join("\n");
      const viewportHtml = document.head.querySelector('meta[name="viewport"]')?.outerHTML ?? "";
      setSrcDoc(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    ${viewportHtml}
    ${headHtml}
    ${projectHead}
    <style>html,body,#react-iframe-root{height:100%;margin:0;padding:0;background:transparent;overflow:hidden}</style>
  </head>
  <body>
    <div id="react-iframe-root" style="height:100%;width:100%"></div>
  </body>
</html>`);
    } catch {
      setSrcDoc(fallback);
    }
  }, [projectHead, currentView]);
  return srcDoc;
}
function useIframeMountNode(iframeRef, srcDoc, currentView) {
  const [mountNode, setMountNode] = useState(null);
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      setMountNode(null);
      return;
    }
    const handleLoad = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) {
          setMountNode(null);
          return;
        }
        setMountNode(
          doc.getElementById("react-iframe-root") ?? doc.body
        );
      } catch {
        setMountNode(null);
      }
    };
    iframe.addEventListener("load", handleLoad);
    if (iframe.contentDocument?.readyState === "complete") handleLoad();
    return () => {
      iframe.removeEventListener("load", handleLoad);
      setMountNode(null);
    };
  }, [srcDoc, currentView, iframeRef]);
  return mountNode;
}
function useIframeStyleInjection(iframeRef, projectHead, mountNode) {
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !mountNode) return;
    try {
      const doc = iframe.contentDocument;
      if (!doc) return;
      const MARKER_ID = "project-custom-styles";
      doc.getElementById(MARKER_ID)?.remove();
      if (!projectHead) return;
      const wrapper = doc.createElement("div");
      wrapper.id = MARKER_ID;
      wrapper.innerHTML = projectHead;
      const appendStyle = (cssText) => {
        try {
          const style = doc.createElement("style");
          style.setAttribute("data-wbv2-custom", "1");
          style.appendChild(doc.createTextNode(cssText));
          doc.head.appendChild(style);
        } catch {
        }
      };
      const importNode = (node) => {
        try {
          const imported = doc.importNode(node, true);
          imported?.setAttribute?.("data-wbv2-custom", "1");
          doc.head.appendChild(imported);
        } catch {
        }
      };
      const asyncFetches = [];
      Array.from(wrapper.childNodes).forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          importNode(node);
          return;
        }
        const el = node;
        const tag = el.tagName.toLowerCase();
        if (tag === "link" && el.getAttribute("rel")?.toLowerCase() === "stylesheet") {
          const href = el.getAttribute("href") ?? "";
          if (href.startsWith("blob:")) {
            asyncFetches.push(
              fetch(href).then((r) => {
                if (!r.ok) throw new Error("blob fetch failed");
                return r.text();
              }).then(appendStyle).catch(() => {
              })
            );
            return;
          }
        }
        importNode(node);
      });
      if (asyncFetches.length > 0) Promise.all(asyncFetches).catch(() => {
      });
    } catch {
    }
  }, [projectHead, mountNode, iframeRef]);
}
const PreviewContainer = ({
  currentView,
  children,
  isLoading = false
}) => {
  const iframeRef = useRef(null);
  const { project } = useProjectStore();
  const projectHead = useProjectHead(project?.header?.cssStyles);
  const srcDoc = useIframeSrcDoc(projectHead, currentView);
  const mountNode = useIframeMountNode(iframeRef, srcDoc, currentView);
  useIframeStyleInjection(iframeRef, projectHead, mountNode);
  const containerStyle = {
    width: viewportSizes[currentView].width,
    height: viewportSizes[currentView].height,
    minHeight: viewportSizes[currentView].height
  };
  const containerClasses = cn(
    "transition-all duration-300 bg-card relative",
    currentView === "desktop" ? "h-full w-full" : "rounded-lg border-2 border-border shadow-lg"
  );
  const content = isLoading ? /* @__PURE__ */ jsx(ElementLoading, { count: 6, variant: "mixed" }) : React__default.cloneElement(children, { iframeRef });
  return /* @__PURE__ */ jsx("div", { className: "overflow-auto scrollbar-hide h-full flex items-start justify-center bg-neutral-200 dark:bg-neutral-900 p-8", children: /* @__PURE__ */ jsxs("div", { className: containerClasses, style: containerStyle, children: [
    /* @__PURE__ */ jsx(
      "iframe",
      {
        ref: iframeRef,
        id: "preview-iframe",
        title: `preview-${currentView}`,
        srcDoc: srcDoc || `<!doctype html><html><head>${projectHead}</head><body><div id="react-iframe-root"></div></body></html>`,
        "aria-label": "editor-preview-iframe",
        style: { width: "100%", height: "100%", border: "none" }
      },
      currentView
    ),
    !mountNode && isLoading && /* @__PURE__ */ jsx(ElementLoading, { count: 6, variant: "mixed" }),
    mountNode && createPortal(content, mountNode)
  ] }) });
};
const PreviewContainer$1 = memo(PreviewContainer);
const EditorCanvas = ({
  isDraggingOver,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  isLoading,
  selectedElement,
  addNewSection,
  userId,
  isReadOnly = false,
  isLocked = false,
  showAddSectionButton = true,
  iframeRef
}) => {
  const collab = useCollaborationOptional();
  const canvasRef = useRef(null);
  const innerContentRef = useRef(null);
  const keyboardEventRef = useRef(new KeyboardEvent());
  const { remoteUsers, users } = useCollaborationCursors();
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (collab && canvasRef.current) {
      collab.canvasRef.current = canvasRef.current;
    }
  }, [collab, canvasRef.current]);
  useEffect(() => {
    keyboardEventRef.current.setReadOnly(isReadOnly);
    keyboardEventRef.current.setLocked(isLocked);
  }, [isReadOnly, isLocked]);
  useEffect(() => {
    if (!innerContentRef.current) return;
    const handleScroll = () => {
      setScrollOffset({
        x: innerContentRef.current?.scrollLeft || 0,
        y: innerContentRef.current?.scrollTop || 0
      });
    };
    const container = innerContentRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const remoteCursors = useMemo(() => {
    if (!remoteUsers) return [];
    return Object.entries(remoteUsers).filter(([uid]) => uid !== userId).filter(([_, pos]) => {
      const x = typeof pos.x === "number" ? pos.x : 0;
      const y = typeof pos.y === "number" ? pos.y : 0;
      return x >= 0 && y >= 0;
    }).map(([uid, pos]) => {
      const x = typeof pos.x === "number" ? pos.x : 0;
      const y = typeof pos.y === "number" ? pos.y : 0;
      return {
        uid,
        x: x - scrollOffset.x,
        y: y - scrollOffset.y,
        userName: users[uid]?.userName || `User ${uid.slice(0, 8)}`
      };
    });
  }, [remoteUsers, userId, users, scrollOffset]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const kb = keyboardEventRef.current;
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "c":
            e.preventDefault();
            kb.copyElement();
            break;
          case "v":
            e.preventDefault();
            kb.pasteElement();
            break;
          case "x":
            e.preventDefault();
            kb.cutElement();
            break;
          case "z":
            e.preventDefault();
            kb.undo();
            break;
          case "y":
            e.preventDefault();
            kb.redo();
            break;
        }
      } else if (e.key === "Delete") {
        e.preventDefault();
        kb.deleteElement();
      } else if (e.key === "Escape") {
        e.preventDefault();
        kb.deselectAll();
      }
    };
    canvas.addEventListener("keydown", handleKeyDown);
    let iframeDoc = null;
    if (iframeRef?.current?.contentDocument) {
      iframeDoc = iframeRef.current.contentDocument;
      iframeDoc.addEventListener("keydown", handleKeyDown, true);
    }
    return () => {
      canvas.removeEventListener("keydown", handleKeyDown);
      if (iframeDoc) {
        iframeDoc.removeEventListener("keydown", handleKeyDown, true);
      }
    };
  }, [iframeRef]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: canvasRef,
      className: `h-full relative flex flex-col bg-background ${isDraggingOver ? "bg-primary/10" : ""}`,
      onDrop: handleDrop,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      id: "canvas",
      tabIndex: 0,
      children: [
        remoteCursors.map(({ uid, x, y, userName }) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "absolute pointer-events-none z-9999 flex flex-col items-start gap-1 transition-all duration-75",
            style: {
              left: `${x}px`,
              top: `${y}px`,
              transform: "translate(-2px, -2px)"
            },
            children: [
              /* @__PURE__ */ jsx(MousePointer, { className: "w-5 h-5 text-blue-500 drop-shadow-lg" }),
              /* @__PURE__ */ jsx("div", { className: "bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap", children: userName })
            ]
          },
          `cursor-${uid}`
        )),
        /* @__PURE__ */ jsx(
          "div",
          {
            ref: innerContentRef,
            className: "overflow-y-auto overflow-x-hidden flex-1 w-full scrollbar-hide p-4",
            children: isLoading ? null : /* @__PURE__ */ jsx(
              ElementLoader,
              {
                isReadOnly,
                isLocked,
                iframeRef
              }
            )
          }
        ),
        !selectedElement && showAddSectionButton && /* @__PURE__ */ jsx("div", { className: "p-4 shrink-0", children: /* @__PURE__ */ jsx(
          Button,
          {
            className: "w-full",
            onClick: addNewSection,
            disabled: isReadOnly || isLocked,
            children: "+ Add new section"
          }
        ) })
      ]
    }
  );
};
const EditorCanvas$1 = memo(EditorCanvas);
const DEFAULT_EDITOR_VALUE = `import React from 'react';

export function Hello() {
  return <div>Hello JSX</div>;
}
`;
const MONACO_COMPILER_OPTIONS = {
  jsx: 1,
  // monaco.languages.typescript.JsxEmit.Preserve (Value is 1)
  target: 99,
  // monaco.languages.typescript.ScriptTarget.ESNext/ES2020 (Value is 99)
  allowJs: true,
  lib: ["es2020", "dom"],
  allowSyntheticDefaultImports: true,
  esModuleInterop: true,
  module: 99,
  // monaco.languages.typescript.ModuleKind.ESNext (Value is 99)
  moduleResolution: 2,
  // monaco.languages.typescript.ModuleResolutionKind.NodeJs (Value is 2)
  typeRoots: ["file:///node_modules/@types", "file:///node_modules"],
  types: ["react", "react-dom"],
  paths: {
    "@/*": ["file:///src/*"]
  },
  baseUrl: "file:///"
};
const MONACO_EXTERNAL_LIBS = [
  {
    url: "https://unpkg.com/@types/react@19.2.2/index.d.ts",
    path: "file:///node_modules/@types/react/index.d.ts"
  },
  {
    url: "https://unpkg.com/@types/react@19.2.2/jsx-runtime.d.ts",
    path: "file:///node_modules/@types/react/jsx-runtime.d.ts"
  },
  {
    url: "https://unpkg.com/@types/react-dom@19.2.2/index.d.ts",
    path: "file:///node_modules/@types/react-dom/index.d.ts"
  },
  {
    url: "https://unpkg.com/csstype@3.2.2/index.d.ts",
    path: "file:///node_modules/csstype/index.d.ts"
  }
];
function manualFormat(code) {
  let result = code;
  result = result.replace(/\r\n/g, "\n");
  let lines = result.split("\n");
  let formatted = [];
  let indentLevel = 0;
  const indentString = "  ";
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formatted.push("");
      continue;
    }
    if (trimmed.startsWith("}") || trimmed.startsWith("]") || trimmed.startsWith(")")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    formatted.push(indentString.repeat(indentLevel) + trimmed);
    const openCount = (trimmed.match(/[\{\[\(]/g) || []).length;
    const closeCount = (trimmed.match(/[\}\]\)]/g) || []).length;
    indentLevel += openCount - closeCount;
    indentLevel = Math.max(0, indentLevel);
  }
  return formatted.join("\n");
}
const registerPrettierFormatter = (monaco) => {
  const registerFor = (language) => {
    monaco.languages.registerDocumentFormattingEditProvider(language, {
      async provideDocumentFormattingEdits(model) {
        try {
          console.log(`[Prettier] Starting format for ${language}`);
          const originalText = model.getValue();
          let formatted = originalText;
          let formatSource = "prettier";
          try {
            const prettierModule = await import("prettier/standalone");
            const babelModule = await import("prettier/parser-babel");
            const prettier = prettierModule.default || prettierModule;
            const babelParser = babelModule.default || babelModule;
            console.log("[Prettier] Successfully imported Prettier and Babel");
            if (prettier && typeof prettier.format === "function") {
              formatted = await prettier.format(originalText, {
                parser: "babel",
                plugins: [babelParser],
                semi: true,
                singleQuote: false,
                trailingComma: "es5"
              });
              console.log("[Prettier] Format successful with Prettier");
            } else {
              throw new Error("Prettier.format is not a function");
            }
          } catch (prettierError) {
            console.warn(
              "[Prettier] Prettier formatting failed, falling back to manual format:",
              prettierError instanceof Error ? prettierError.message : String(prettierError)
            );
            formatted = manualFormat(originalText);
            formatSource = "manual";
          }
          if (formatted && formatted !== originalText) {
            console.log(
              `[Prettier] Returning formatted code (source: ${formatSource})`
            );
            return [
              {
                range: model.getFullModelRange(),
                text: formatted
              }
            ];
          }
          console.log("[Prettier] Code unchanged after formatting");
          return [];
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          console.error(`[Prettier] Unexpected error during formatting:`, {
            message: error.message,
            stack: error.stack,
            language
          });
          return [];
        }
      }
    });
  };
  registerFor("typescript");
  registerFor("javascript");
  registerFor("jsx");
  registerFor("tsx");
};
async function fetchLibContent(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch types from ${url}: ${res.status}`);
    }
    return await res.text();
  } catch (err) {
    console.warn("Monaco Type Loader:", err);
    return null;
  }
}
const UI_COMPONENT_STUBS = `
declare module '@/components/ui/carousel' {
  import { ReactNode } from 'react';
  export interface CarouselProps {
    children?: ReactNode;
    className?: string;
    [key: string]: any;
  }
  export const Carousel: React.FC<CarouselProps>;
  export const CarouselContent: React.FC<any>;
  export const CarouselItem: React.FC<any>;
  export const CarouselPrevious: React.FC<any>;
  export const CarouselNext: React.FC<any>;
}

declare module '@/components/ui/button' {
  import { ReactNode } from 'react';
  export interface ButtonProps {
    children?: ReactNode;
    className?: string;
    onClick?: () => void;
    [key: string]: any;
  }
  export const Button: React.FC<ButtonProps>;
}

declare module '@/components/ui/card' {
  import { ReactNode } from 'react';
  export interface CardProps {
    children?: ReactNode;
    className?: string;
    [key: string]: any;
  }
  export const Card: React.FC<CardProps>;
  export const CardContent: React.FC<CardProps>;
  export const CardDescription: React.FC<CardProps>;
  export const CardHeader: React.FC<CardProps>;
  export const CardTitle: React.FC<CardProps>;
}

declare module '@/components/ui/input' {
  export interface InputProps {
    className?: string;
    [key: string]: any;
  }
  export const Input: React.FC<InputProps>;
}

declare module '@/components/ui/select' {
  import { ReactNode } from 'react';
  export interface SelectProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Select: React.FC<SelectProps>;
  export const SelectContent: React.FC<SelectProps>;
  export const SelectItem: React.FC<SelectProps>;
  export const SelectTrigger: React.FC<SelectProps>;
  export const SelectValue: React.FC<SelectProps>;
}

declare module '@/components/ui/dialog' {
  import { ReactNode } from 'react';
  export interface DialogProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Dialog: React.FC<DialogProps>;
  export const DialogContent: React.FC<DialogProps>;
  export const DialogDescription: React.FC<DialogProps>;
  export const DialogHeader: React.FC<DialogProps>;
  export const DialogTitle: React.FC<DialogProps>;
  export const DialogTrigger: React.FC<DialogProps>;
}

declare module '@/components/ui/checkbox' {
  export interface CheckboxProps {
    className?: string;
    [key: string]: any;
  }
  export const Checkbox: React.FC<CheckboxProps>;
}

declare module '@/components/ui/radio-group' {
  import { ReactNode } from 'react';
  export interface RadioGroupProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const RadioGroup: React.FC<RadioGroupProps>;
  export const RadioGroupItem: React.FC<RadioGroupProps>;
}

declare module '@/components/ui/tabs' {
  import { ReactNode } from 'react';
  export interface TabsProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Tabs: React.FC<TabsProps>;
  export const TabsContent: React.FC<TabsProps>;
  export const TabsList: React.FC<TabsProps>;
  export const TabsTrigger: React.FC<TabsProps>;
}

declare module '@/components/ui/badge' {
  import { ReactNode } from 'react';
  export interface BadgeProps {
    children?: ReactNode;
    className?: string;
    [key: string]: any;
  }
  export const Badge: React.FC<BadgeProps>;
}

declare module '@/components/ui/alert' {
  import { ReactNode } from 'react';
  export interface AlertProps {
    children?: ReactNode;
    className?: string;
    [key: string]: any;
  }
  export const Alert: React.FC<AlertProps>;
  export const AlertDescription: React.FC<AlertProps>;
  export const AlertTitle: React.FC<AlertProps>;
}

declare module '@/components/ui/tooltip' {
  import { ReactNode } from 'react';
  export interface TooltipProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Tooltip: React.FC<TooltipProps>;
  export const TooltipContent: React.FC<TooltipProps>;
  export const TooltipProvider: React.FC<TooltipProps>;
  export const TooltipTrigger: React.FC<TooltipProps>;
}

declare module '@/components/ui/popover' {
  import { ReactNode } from 'react';
  export interface PopoverProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Popover: React.FC<PopoverProps>;
  export const PopoverContent: React.FC<PopoverProps>;
  export const PopoverTrigger: React.FC<PopoverProps>;
}

declare module '@/components/ui/accordion' {
  import { ReactNode } from 'react';
  export interface AccordionProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Accordion: React.FC<AccordionProps>;
  export const AccordionContent: React.FC<AccordionProps>;
  export const AccordionItem: React.FC<AccordionProps>;
  export const AccordionTrigger: React.FC<AccordionProps>;
}

declare module '@/components/ui/sheet' {
  import { ReactNode } from 'react';
  export interface SheetProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Sheet: React.FC<SheetProps>;
  export const SheetContent: React.FC<SheetProps>;
  export const SheetDescription: React.FC<SheetProps>;
  export const SheetHeader: React.FC<SheetProps>;
  export const SheetTitle: React.FC<SheetProps>;
  export const SheetTrigger: React.FC<SheetProps>;
}

declare module '@/components/ui/slider' {
  export interface SliderProps {
    className?: string;
    [key: string]: any;
  }
  export const Slider: React.FC<SliderProps>;
}

declare module '@/components/ui/switch' {
  export interface SwitchProps {
    className?: string;
    [key: string]: any;
  }
  export const Switch: React.FC<SwitchProps>;
}

declare module '@/components/ui/table' {
  import { ReactNode } from 'react';
  export interface TableProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Table: React.FC<TableProps>;
  export const TableBody: React.FC<TableProps>;
  export const TableCell: React.FC<TableProps>;
  export const TableHead: React.FC<TableProps>;
  export const TableHeader: React.FC<TableProps>;
  export const TableRow: React.FC<TableProps>;
}
`;
async function loadMonacoTypes(monaco) {
  try {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      UI_COMPONENT_STUBS,
      "file:///node_modules/@ui-components/types.d.ts"
    );
    const results = await Promise.all(
      MONACO_EXTERNAL_LIBS.map(async (lib) => {
        const content = await fetchLibContent(lib.url);
        return { content, path: lib.path };
      })
    );
    for (const { content, path } of results) {
      if (content) {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          path
        );
      }
    }
  } catch (err) {
    console.error("Error loading Monaco types:", err);
  }
}
const SELF_CLOSING_TAGS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];
function contentChange(event, editor) {
  const lastChange = event.changes[event.changes.length - 1];
  if (!lastChange) return;
  if (lastChange.text === ">") {
    const model = editor.getModel();
    if (!model) return;
    const position = editor.getPosition();
    if (!position) return;
    const lineContent = model.getLineContent(position.lineNumber);
    const textBeforeCursor = lineContent.substring(0, position.column - 1);
    const match = textBeforeCursor.match(/<([a-zA-Z0-9\-]+)(?:\s+[^>]*?)?>$/);
    if (match && !textBeforeCursor.endsWith("/>")) {
      const tagName = match[1];
      if (SELF_CLOSING_TAGS.includes(tagName.toLowerCase())) {
        return;
      }
      const closingTag = `</${tagName}>`;
      editor.executeEdits("auto-close-tag", [
        {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          },
          text: closingTag,
          forceMoveMarkers: false
          // Keep cursor before the inserted closing tag
        }
      ]);
    }
  }
}
function useDebouncedValue(value, delay = 50) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
function useMonacoEditor(initialValue = DEFAULT_EDITOR_VALUE) {
  const monaco = useMonaco();
  const elements = useElements();
  const [value, setValue] = useState(initialValue);
  const editorRef = useRef(
    null
  );
  const isEditorFocusedRef = useRef(false);
  const lastAppliedCodeRef = useRef(null);
  const pendingCodeRef = useRef(null);
  const queryClient = useQueryClient();
  const handleBeforeMount = (monaco2) => {
    monaco2.languages.typescript.typescriptDefaults.setCompilerOptions(
      MONACO_COMPILER_OPTIONS
    );
    registerPrettierFormatter(monaco2);
  };
  const handleOnMount = async (editor, monaco2) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent((e) => contentChange(e, editor));
    editor.onDidFocusEditorWidget(() => isEditorFocusedRef.current = true);
    editor.onDidBlurEditorWidget(() => {
      isEditorFocusedRef.current = false;
      const pending = pendingCodeRef.current;
      if (pending && editorRef.current) {
        try {
          editorRef.current.setValue(pending);
          lastAppliedCodeRef.current = pending;
          setValue(pending);
        } catch (err) {
          console.error("Failed to apply pending generated code on blur", err);
        }
        pendingCodeRef.current = null;
      }
    });
    loadMonacoTypes(monaco2).catch((err) => {
      console.error("Failed to load Monaco types", err);
    });
    const cached = queryClient.getQueryData(["generatedCode", elements]);
    if (cached?.code) {
      try {
        setValue(cached.code);
        if (editorRef.current) {
          editorRef.current.setValue(cached.code);
          lastAppliedCodeRef.current = cached.code;
        }
      } catch (err) {
        console.error("Failed to set initial generated code on mount", err);
      }
    }
  };
  const debouncedElements = useDebouncedValue(elements, 50);
  const {
    data: generated,
    isFetching,
    error
  } = useQuery({
    queryKey: ["generatedCode", debouncedElements],
    queryFn: async ({ signal }) => elementService.generateCode(debouncedElements, { signal }),
    refetchOnWindowFocus: false,
    retry: false
  });
  useEffect(() => {
    if (!error) return;
    if (error?.name === "AbortError") return;
    console.error("Failed to generate code from server", error);
  }, [error]);
  const cancelGeneration = (silent = true) => {
    try {
      queryClient.cancelQueries({ queryKey: ["generatedCode"] }, { silent });
    } catch (err) {
      console.debug("cancelGeneration failed", err);
    }
  };
  useEffect(() => {
    return () => {
      cancelGeneration(true);
    };
  }, [queryClient]);
  useEffect(() => {
    if (!generated) return;
    const code = generated?.code ?? "";
    setValue(code);
    if (!isEditorFocusedRef.current && editorRef.current) {
      try {
        editorRef.current.setValue(code);
        lastAppliedCodeRef.current = code;
        pendingCodeRef.current = null;
      } catch (err) {
        console.error("Failed to apply generated code to editor", err);
      }
    } else {
      pendingCodeRef.current = code;
    }
  }, [generated]);
  const handleValueChange = (newValue) => {
    setValue(newValue ?? "");
  };
  return {
    value,
    setValue,
    editorRef,
    handleBeforeMount,
    monaco,
    handleOnMount,
    handleValueChange,
    cancelGeneration,
    isFetching,
    generated
  };
}
function EditorCodePanel() {
  const {
    value,
    handleValueChange,
    handleBeforeMount,
    handleOnMount,
    // cancelGeneration is exposed by the hook to explicitly cancel in-flight generation requests
    cancelGeneration,
    // isFetching indicates an in-progress generation operation
    isFetching
  } = useMonacoEditor();
  return /* @__PURE__ */ jsxs("div", { className: "h-full w-full relative", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 z-10", children: isFetching ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => cancelGeneration(),
        className: "px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700",
        children: "Cancel"
      }
    ) : null }),
    /* @__PURE__ */ jsx(
      Editor$1,
      {
        height: "100%",
        width: "100%",
        theme: "vs-dark",
        defaultLanguage: "typescript",
        path: "src/example.tsx",
        value,
        onChange: handleValueChange,
        beforeMount: handleBeforeMount,
        onMount: handleOnMount,
        options: {
          smoothScrolling: true,
          padding: { top: 10 },
          minimap: { enabled: false },
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true,
          fontSize: 14,
          fixedOverflowWidgets: true
        }
      }
    )
  ] });
}
function ResizablePanelGroup({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    ResizablePrimitive.Group,
    {
      "data-slot": "resizable-panel-group",
      className: cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      ),
      ...props
    }
  );
}
function ResizablePanel({ ...props }) {
  return /* @__PURE__ */ jsx(ResizablePrimitive.Panel, { "data-slot": "resizable-panel", ...props });
}
function ResizableHandle({
  withHandle,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    ResizablePrimitive.Separator,
    {
      "data-slot": "resizable-handle",
      className: cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
        className
      ),
      ...props,
      children: withHandle && /* @__PURE__ */ jsx("div", { className: "bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border", children: /* @__PURE__ */ jsx(GripVerticalIcon, { className: "size-2.5" }) })
    }
  );
}
function CodeSplit({
  canvas,
  defaultSize = 50,
  minSize = 25,
  className = ""
}) {
  return /* @__PURE__ */ jsxs(
    ResizablePanelGroup,
    {
      orientation: "horizontal",
      className: `h-full w-full ${className}`.trim(),
      children: [
        /* @__PURE__ */ jsx(ResizablePanel, { defaultSize, minSize, children: /* @__PURE__ */ jsx(EditorCodePanel, {}) }),
        /* @__PURE__ */ jsx(ResizableHandle, { withHandle: true }),
        /* @__PURE__ */ jsx(
          ResizablePanel,
          {
            defaultSize: Math.max(0, 100 - defaultSize),
            minSize,
            children: /* @__PURE__ */ jsx("div", { className: "h-full min-w-0 overflow-auto", children: canvas })
          }
        )
      ]
    }
  );
}
const PreviewChild = React__default.memo(function PreviewChild2({
  iframeRef
}) {
  const { editor, editingMode } = useEditorContext();
  const {
    isDraggingOver,
    isLoading,
    selectedElement,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    addNewSection,
    isReadOnly,
    isLocked,
    userId
  } = editor;
  const isCodeMode = editingMode === "code";
  const effectiveUserId = userId ?? "guest";
  return /* @__PURE__ */ jsx("div", { className: "h-full w-full transition-opacity duration-200 ease-in-out", children: /* @__PURE__ */ jsx(
    EditorCanvas$1,
    {
      isDraggingOver,
      handleDrop,
      handleDragOver,
      handleDragLeave,
      isLoading,
      selectedElement: selectedElement ?? null,
      addNewSection,
      userId: effectiveUserId,
      iframeRef,
      isReadOnly: isReadOnly || isCodeMode,
      isLocked: isLocked || isCodeMode,
      showAddSectionButton: !isCodeMode
    }
  ) });
});
PreviewChild.displayName = "PreviewChild";
function Editor({ id }) {
  const { editor, editingMode } = useEditorContext();
  const { currentView, setCurrentView, isLoading } = editor;
  const isCodeMode = editingMode === "code";
  const previewContent = useMemo(
    () => /* @__PURE__ */ jsx(PreviewContainer$1, { currentView, isLoading, children: /* @__PURE__ */ jsx(PreviewChild, {}) }),
    [currentView, isLoading]
  );
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 w-full h-full flex flex-col bg-background text-foreground relative", children: [
    /* @__PURE__ */ jsx(
      EditorHeader,
      {
        currentView,
        setCurrentView,
        projectId: id
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-hidden", children: isCodeMode ? /* @__PURE__ */ jsx(CodeSplit, { canvas: previewContent }) : previewContent })
  ] });
}
function EditorPage() {
  const {
    id
  } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const dehydratedState = loaderData?.dehydratedState;
  return /* @__PURE__ */ jsx(HydrationBoundary, { state: dehydratedState, children: /* @__PURE__ */ jsx(Editor, { id }) });
}
export {
  EditorPage as component
};
