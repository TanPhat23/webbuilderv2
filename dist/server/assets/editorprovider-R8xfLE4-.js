import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import * as React from "react";
import React__default, { useState, useCallback, useEffect, useMemo, useRef, createContext, useContext, Suspense, useTransition } from "react";
import { ah as usePageStore, ac as useProjectStore, ao as useProjectPages, ap as useProject, aq as showErrorToast, ar as customComps, as as PERMISSION_ERRORS, J as Dialog, L as DialogHeader, M as DialogTitle, N as DialogDescription, K as DialogContent, j as cn, U as URLBuilder, at as ElementStore, au as ElementTreeHelper, av as useElementStore, ae as useMouseStore, c as createSsrRpc, B as Button, af as DialogTrigger, Q as DialogFooter, a3 as Form, a4 as FormField, a5 as FormItem, a6 as FormLabel, a7 as FormControl, I as Input, a8 as FormMessage, ai as TooltipProvider, aj as Tooltip, ak as TooltipTrigger, al as TooltipContent, aw as elementHolders, ax as useSidebar, t as Sidebar, u as SidebarHeader, z as SidebarContent, H as SidebarFooter, v as SidebarMenu, w as SidebarMenuItem, x as SidebarMenuButton, y as SidebarRail, Y as Empty, a1 as EmptyContent, Z as EmptyHeader, _ as EmptyMedia, $ as EmptyTitle, a0 as EmptyDescription, T as Tabs, g as TabsList, h as TabsTrigger, f as Badge, k as elementHelper, am as useElementCommentStore, S as SidebarProvider } from "./prisma-Cq49YOYM.js";
import { useNavigate, useParams, Link as Link$1, useSearch } from "@tanstack/react-router";
import { b as useEditorPermissions, c as useAddElement, d as useSelectedElement, e as ElementFactory, C as CMSContentGridComponent, f as CMSContentItemComponent, g as CMSContentListComponent, B as BaseComponent, L as ListComponent, h as CarouselComponent, F as FrameComponent, i as FormComponent, S as SelectComponent, I as InputComponent, j as ImageComponent, k as SectionComponent, l as ButtonComponent, m as useSelectedElementWithSetter, a as useElements, n as useElementComments, o as useProjectComments } from "./SelectComponent-t_K3xf5i.js";
import "clsx";
import "next-themes";
import "socket.io-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, useUser } from "@clerk/react";
import { toast } from "sonner";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { EventEmitter } from "events";
import { Awareness } from "y-protocols/awareness";
import { A as Accordion, a as AccordionItem, c as AccordionTrigger, b as AccordionContent } from "./accordion-Dg3retHz.js";
import { SearchIcon, Grid3X3, FileText, RefreshCw, Upload, Send, List, ChevronLeft, ChevronRight, ExternalLink, ChevronDown, Type, Image, Database, SlidersHorizontal, Link, TextSelection, FormInput, CardSim, MousePointerClick, Component, Square, Files, Table2, BarChart2, LayoutGrid, Images, Frame, MousePointer, PanelLeftOpen, Blocks, Layers, Settings as Settings$1, PanelLeftClose, ImageIcon, Camera, Zap, PanelRightOpen, PanelRightClose, Palette, Settings2, Code2, Bot, MessageSquare, EyeOff, X, SortDesc, Check, Loader2Icon, CheckCircle2, Circle, MoreVertical, Edit2, Trash2, Eye, XIcon, Paperclip, Command as Command$2, LoaderIcon, SendIcon, Sparkles, MonitorIcon, LayoutTemplate, PenTool } from "lucide-react";
import { Command as Command$1 } from "cmdk";
import { v4 } from "uuid";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPjHyyea.js";
import { P as PageSchema } from "./page-Cy1amgId.js";
import { c as createServerFn } from "../server.js";
import "isomorphic-dompurify";
import { S as ScrollArea } from "./scroll-area-BYa8i-Jn.js";
import { Collapsible as Collapsible$1 } from "radix-ui";
import { motion, AnimatePresence } from "framer-motion";
import { b as CardHeader, c as CardTitle, d as CardDescription, C as Card, a as CardContent } from "./card-LOcGasZb.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem, d as DropdownMenuSeparator } from "./dropdown-menu-B0s9PypA.js";
import { formatDistanceToNow } from "date-fns";
import { T as Textarea$1 } from "./textarea-BDhK7YnG.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-vyaRObia.js";
const useEditor = (id, pageId, options) => {
  const [currentView, setCurrentView] = useState("desktop");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const navigate = useNavigate();
  const { userId } = useAuth();
  const effectiveUserId = userId ?? void 0;
  const permissions = useEditorPermissions(id);
  const isReadOnly = options?.isReadOnly ?? !permissions.canEditElements;
  const isLocked = options?.isLocked ?? false;
  const addElement = useAddElement();
  const selectedElement = useSelectedElement();
  const { loadPages, setCurrentPage } = usePageStore();
  const { loadProject } = useProjectStore();
  const { data: projectPages, isLoading: isLoadingPages } = useProjectPages(id);
  const { data: project, isLoading: isLoadingProject } = useProject(id);
  const isEventOverElement = useCallback((target) => {
    return !!(target && typeof target.closest === "function" && target.closest("[data-element-id]"));
  }, []);
  const redirectToDefaultOrRequestedPage = useCallback(
    (pagesList) => {
      if (!pagesList || pagesList.length === 0) return;
      loadPages(pagesList);
      if (pageId) {
        const found = pagesList.find((p) => p.Id === pageId);
        if (found) {
          setCurrentPage(found);
          return;
        }
      }
      const defaultPage = pagesList.find((p) => p.Name === "");
      if (defaultPage) {
        navigate({ to: `/editor/${id}?page=${defaultPage.Id}` });
      } else if (!pageId) {
        navigate({ to: `/editor/${id}` });
      }
    },
    [loadPages, pageId, setCurrentPage, navigate, id]
  );
  useEffect(() => {
    if (!projectPages || projectPages.length === 0) return;
    redirectToDefaultOrRequestedPage(projectPages);
  }, [projectPages, loadPages, pageId, setCurrentPage, navigate, id]);
  useEffect(() => {
    if (!project) return;
    if (project.deletedAt) {
      navigate({ to: "/dashboard" });
      return;
    }
    loadProject(project);
  }, [project, loadProject, navigate]);
  const showReadOnlyError = useCallback(() => {
    showErrorToast(PERMISSION_ERRORS.cannotAdd);
  }, []);
  const canCreate = !isReadOnly && !isLocked && permissions.canCreateElements;
  const handleDrop = useCallback(
    (e) => {
      const target = e.target;
      if (isEventOverElement(target)) return;
      if (!canCreate) {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        showReadOnlyError();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
      const elementType = e.dataTransfer.getData("elementType");
      const customElement = e.dataTransfer.getData("customComponentName");
      let newElement;
      if (elementType) {
        newElement = ElementFactory.getInstance().createElement({
          type: elementType,
          pageId
        });
      } else if (customElement) {
        const customComp = customComps[parseInt(customElement, 10)];
        if (customComp) {
          newElement = ElementFactory.getInstance().createElementFromTemplate({
            element: customComp,
            pageId
          });
        }
      }
      if (!newElement) return;
      addElement(newElement);
    },
    [isEventOverElement, canCreate, pageId, addElement, showReadOnlyError]
  );
  const handleDragOver = useCallback(
    (e) => {
      const target = e.target;
      if (isEventOverElement(target)) return;
      if (!canCreate) return;
      e.preventDefault();
      setIsDraggingOver(true);
    },
    [isEventOverElement, canCreate]
  );
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);
  const addNewSection = useCallback(() => {
    if (!canCreate) {
      showReadOnlyError();
      return;
    }
    const newElement = ElementFactory.getInstance().createElement({
      type: "Section",
      pageId
    });
    if (newElement) addElement(newElement);
  }, [canCreate, showReadOnlyError, pageId, addElement]);
  const isLoading = isLoadingPages || isLoadingProject;
  const permissionsSummary = useMemo(
    () => ({
      canCreateElements: permissions.canCreateElements,
      canEditElements: permissions.canEditElements,
      canDeleteElements: permissions.canDeleteElements,
      canReorderElements: permissions.canReorderElements
    }),
    [
      permissions.canCreateElements,
      permissions.canEditElements,
      permissions.canDeleteElements,
      permissions.canReorderElements
    ]
  );
  return useMemo(
    () => ({
      currentView,
      setCurrentView,
      isDraggingOver,
      isLoading,
      selectedElement,
      handleDrop,
      handleDragOver,
      handleDragLeave,
      addNewSection,
      isReadOnly,
      isLocked,
      permissions: permissionsSummary,
      userId: effectiveUserId
    }),
    [
      currentView,
      setCurrentView,
      isDraggingOver,
      isLoading,
      selectedElement,
      handleDrop,
      handleDragOver,
      handleDragLeave,
      addNewSection,
      isReadOnly,
      isLocked,
      permissionsSummary,
      effectiveUserId
    ]
  );
};
function filterCommentsByViewMode(comments, viewMode) {
  if (viewMode === "unresolved") {
    return comments.filter((c) => !c.resolved);
  }
  if (viewMode === "resolved") {
    return comments.filter((c) => c.resolved);
  }
  return comments;
}
function sortCommentsByDate(comments, order) {
  const sorted = [...comments];
  sorted.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return order === "newest" ? dateB - dateA : dateA - dateB;
  });
  return sorted;
}
function processComments(comments, viewMode, sortOrder) {
  const filtered = filterCommentsByViewMode(comments, viewMode);
  return sortCommentsByDate(filtered, sortOrder);
}
function getUnresolvedCount(comments) {
  return comments.filter((c) => !c.resolved).length;
}
function getEmptyStateMessage(viewMode) {
  switch (viewMode) {
    case "unresolved":
      return {
        title: "No active comments",
        description: "All issues have been resolved!"
      };
    case "resolved":
      return {
        title: "No resolved comments",
        description: "No comments have been marked as done yet."
      };
    default:
      return {
        title: "No comments yet",
        description: "Start the conversation!"
      };
  }
}
function useCommentManager({
  comments,
  isLoading,
  onUpdate,
  onDelete,
  onToggleResolved
}) {
  const [state, setState] = useState({
    editingCommentId: null,
    editingText: "",
    viewMode: "all",
    sortOrder: "newest"
  });
  const setViewMode = useCallback((viewMode) => {
    setState((prev) => ({ ...prev, viewMode }));
  }, []);
  const setSortOrder = useCallback((sortOrder) => {
    setState((prev) => ({ ...prev, sortOrder }));
  }, []);
  const startEditing = useCallback((commentId, content) => {
    setState((prev) => ({
      ...prev,
      editingCommentId: commentId,
      editingText: content
    }));
  }, []);
  const cancelEditing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      editingCommentId: null,
      editingText: ""
    }));
  }, []);
  const setEditingText = useCallback((text) => {
    setState((prev) => ({
      ...prev,
      editingText: text
    }));
  }, []);
  const handleUpdate = useCallback(
    async (commentId) => {
      if (!state.editingText.trim()) return;
      try {
        const result = await onUpdate(commentId, state.editingText);
        if (result) {
          cancelEditing();
        }
      } catch (error) {
        console.error("Failed to update comment:", error);
      }
    },
    [state.editingText, onUpdate, cancelEditing]
  );
  const handleDelete = useCallback(
    async (commentId) => {
      if (!window.confirm("Are you sure you want to delete this comment?")) {
        return;
      }
      try {
        const result = await onDelete(commentId);
        if (!result) {
          console.error("Failed to delete comment");
        }
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    },
    [onDelete]
  );
  const handleToggleResolved = useCallback(
    async (commentId) => {
      try {
        const result = await onToggleResolved(commentId);
        if (!result) {
          console.error("Failed to toggle comment resolved status");
        }
      } catch (error) {
        console.error("Failed to toggle comment resolved status:", error);
      }
    },
    [onToggleResolved]
  );
  const processedComments = processComments(
    comments,
    state.viewMode,
    state.sortOrder
  );
  const unresolvedCount = getUnresolvedCount(comments);
  return {
    // State
    editingCommentId: state.editingCommentId,
    editingText: state.editingText,
    viewMode: state.viewMode,
    sortOrder: state.sortOrder,
    isEditing: state.editingCommentId !== null,
    // Processed data
    processedComments,
    unresolvedCount,
    // Setters
    setViewMode,
    setSortOrder,
    setEditingText,
    startEditing,
    cancelEditing,
    // Handlers
    handleUpdate,
    handleDelete,
    handleToggleResolved
  };
}
const COMMENTS_SCROLL_HEIGHT = "h-[450px]";
const COMMENTS_PANEL = {
  WIDTH: "w-1/4",
  POSITION: "fixed right-4 top-20 z-50"
};
function Command({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1,
    {
      "data-slot": "command",
      className: cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      ),
      ...props
    }
  );
}
function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}) {
  return /* @__PURE__ */ jsxs(Dialog, { ...props, children: [
    /* @__PURE__ */ jsxs(DialogHeader, { className: "sr-only", children: [
      /* @__PURE__ */ jsx(DialogTitle, { children: title }),
      /* @__PURE__ */ jsx(DialogDescription, { children: description })
    ] }),
    /* @__PURE__ */ jsx(
      DialogContent,
      {
        className: cn("overflow-hidden p-0", className),
        showCloseButton,
        children: /* @__PURE__ */ jsx(Command, { className: "[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5", children })
      }
    )
  ] });
}
function CommandInput({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "data-slot": "command-input-wrapper",
      className: "flex h-9 items-center gap-2 border-b px-3",
      children: [
        /* @__PURE__ */ jsx(SearchIcon, { className: "size-4 shrink-0 opacity-50" }),
        /* @__PURE__ */ jsx(
          Command$1.Input,
          {
            "data-slot": "command-input",
            className: cn(
              "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
              className
            ),
            ...props
          }
        )
      ]
    }
  );
}
function CommandList({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1.List,
    {
      "data-slot": "command-list",
      className: cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      ),
      ...props
    }
  );
}
function CommandEmpty({
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1.Empty,
    {
      "data-slot": "command-empty",
      className: "py-6 text-center text-sm",
      ...props
    }
  );
}
function CommandGroup({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1.Group,
    {
      "data-slot": "command-group",
      className: cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className
      ),
      ...props
    }
  );
}
function CommandSeparator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1.Separator,
    {
      "data-slot": "command-separator",
      className: cn("bg-border -mx-1 h-px", className),
      ...props
    }
  );
}
function CommandItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1.Item,
    {
      "data-slot": "command-item",
      className: cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
class ConnectionManager extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
    this.ws = null;
    this.reconnectTimeout = null;
    this.reconnectAttempts = 0;
    this.isDestroyed = false;
    this._connected = false;
    this.baseInterval = options.reconnectBaseInterval ?? 500;
    this.multiplier = options.reconnectMultiplier ?? 1.5;
    this.maxInterval = options.maxReconnectInterval ?? 3e4;
  }
  // --------------------------------------------------------------------------
  // Public API
  // --------------------------------------------------------------------------
  /**
   * Initiate or re-initiate the WebSocket connection.
   * On success, emits `"open"`. On failure, schedules a reconnect.
   */
  async connect() {
    if (this.isDestroyed || this._connected) return;
    this.disconnect();
    try {
      const token = await this.getAuthToken();
      const wsUrl = this.buildUrl(token);
      if (this.isDestroyed) return;
      this.ws = new WebSocket(wsUrl);
      this.attachHandlers();
    } catch (err) {
      if (!this.isDestroyed) {
        this.emit("error", err instanceof Error ? err : new Error(String(err)));
        this.scheduleReconnect();
      }
    }
  }
  /**
   * Disconnect the current WebSocket and cancel any pending reconnection.
   */
  disconnect() {
    this._connected = false;
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      try {
        this.ws.close();
      } catch {
      }
      this.ws = null;
    }
    this.clearReconnection();
  }
  /**
   * Send raw string data through the WebSocket.
   * @returns `true` if the message was sent, `false` if the socket is not open.
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
      return true;
    }
    return false;
  }
  /** Whether the WebSocket is currently open. */
  get connected() {
    return this._connected;
  }
  /** Alias kept for backward compat with old Provider code. */
  isConnected() {
    return this._connected;
  }
  /** Permanently tear down the manager and release all resources. */
  destroy() {
    this.isDestroyed = true;
    this.disconnect();
    this.removeAllListeners();
  }
  // --------------------------------------------------------------------------
  // Internal — Auth & URL
  // --------------------------------------------------------------------------
  async getAuthToken() {
    const token = await this.options.getToken();
    if (!token) {
      const error = new Error("No authentication token available");
      this.emit("error", error);
      throw error;
    }
    return token;
  }
  /**
   * Build the WebSocket URL following the new spec:
   *   `ws://<host>/ws/:project?token=<jwt>`
   *
   * Browser WebSocket API cannot set custom headers on the handshake,
   * so the token is passed as a query parameter.
   */
  buildUrl(token) {
    const projectId = encodeURIComponent(this.options.projectId);
    return new URLBuilder(this.options.url).setPath(`/ws/${projectId}`).addQueryParam("token", token).build();
  }
  // --------------------------------------------------------------------------
  // Internal — WebSocket event handlers
  // --------------------------------------------------------------------------
  attachHandlers() {
    if (!this.ws) return;
    this.ws.onopen = () => {
      if (this.isDestroyed) {
        this.ws?.close();
        return;
      }
      this._connected = true;
      this.reconnectAttempts = 0;
      this.emit("open");
      this.sendJoinMessage();
    };
    this.ws.onmessage = (event) => {
      this.emit("message", event.data);
    };
    this.ws.onclose = () => {
      const wasConnected = this._connected;
      this._connected = false;
      if (wasConnected) {
        this.emit("close");
      }
      if (!this.isDestroyed) {
        this.scheduleReconnect();
      }
    };
    this.ws.onerror = () => {
      this.emit("error", new Error("WebSocket error"));
    };
  }
  /**
   * Automatically send a `join` message after connection opens.
   * The server expects this before any element operations.
   *
   * @see WebSocket API Reference — Section 3: Join Page
   */
  sendJoinMessage() {
    const joinEnvelope = JSON.stringify({
      type: "join",
      projectId: this.options.projectId,
      pageId: this.options.pageId,
      timestamp: Date.now(),
      payload: {
        pageId: this.options.pageId
      }
    });
    this.send(joinEnvelope);
  }
  // --------------------------------------------------------------------------
  // Internal — Reconnection with exponential backoff + jitter
  // --------------------------------------------------------------------------
  /**
   * Schedule a reconnection attempt using exponential backoff with jitter.
   *
   * delay = min(baseInterval × multiplier^attempts, maxInterval)
   * jitter = random(0, delay × 0.5)
   * total  = delay + jitter
   *
   * @see WebSocket API Reference — Reconnection guidance
   */
  scheduleReconnect() {
    if (this.isDestroyed || this.reconnectTimeout) return;
    const exponentialDelay = Math.min(
      this.baseInterval * Math.pow(this.multiplier, this.reconnectAttempts),
      this.maxInterval
    );
    const jitter = Math.random() * exponentialDelay * 0.5;
    const totalDelay = Math.round(exponentialDelay + jitter);
    this.reconnectAttempts++;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      void this.connect();
    }, totalDelay);
  }
  clearReconnection() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}
class MessageDispatcher extends EventEmitter {
  constructor() {
    super();
    this.pendingRequests = /* @__PURE__ */ new Map();
    this.requestIdCounter = 0;
    this.messageQueue = [];
    this.rateLimiter = {
      tokens: 100,
      maxTokens: 100,
      refillRate: 100,
      // tokens per second
      lastRefill: Date.now()
    };
  }
  // --------------------------------------------------------------------------
  // Envelope Factory
  // --------------------------------------------------------------------------
  /**
   * Creates a standard message envelope following the WebSocket API spec.
   *
   * @param type      The action type (e.g. `element:create`)
   * @param projectId ID of the project
   * @param pageId    ID of the page
   * @param payload   Action-specific data
   * @param options   Optional userId and requestId overrides
   */
  createEnvelope(type, projectId, pageId, payload, options) {
    return {
      type,
      projectId,
      pageId,
      userId: options?.userId,
      requestId: options?.requestId,
      timestamp: Date.now(),
      payload
    };
  }
  // --------------------------------------------------------------------------
  // Request ID Generation
  // --------------------------------------------------------------------------
  /**
   * Generates a unique request ID for tracking request/response cycles.
   * Format: `req-<timestamp>-<counter>` for easy debugging.
   */
  generateRequestId() {
    return `req-${Date.now()}-${++this.requestIdCounter}`;
  }
  // --------------------------------------------------------------------------
  // Rate Limiting (Token Bucket)
  // --------------------------------------------------------------------------
  /**
   * Implements a token bucket algorithm to rate limit outgoing operations.
   * @returns `true` if the operation is allowed, `false` if rate limited.
   */
  checkRateLimit() {
    const now = Date.now();
    const timePassed = now - this.rateLimiter.lastRefill;
    const tokensToAdd = timePassed * this.rateLimiter.refillRate / 1e3;
    this.rateLimiter.tokens = Math.min(
      this.rateLimiter.maxTokens,
      this.rateLimiter.tokens + tokensToAdd
    );
    this.rateLimiter.lastRefill = now;
    if (this.rateLimiter.tokens >= 1) {
      this.rateLimiter.tokens -= 1;
      return true;
    }
    return false;
  }
  // --------------------------------------------------------------------------
  // Pending Request Tracking
  // --------------------------------------------------------------------------
  /**
   * Creates a promise-based pending request that will be resolved when a
   * matching response message arrives (correlated by `requestId`), or
   * rejected on timeout.
   *
   * @param requestId  The client-generated request ID
   * @param timeoutMs  How long to wait before timing out (default: 10s)
   */
  createPendingRequest(requestId, timeoutMs = 1e4) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(
            new Error(`Request ${requestId} timed out after ${timeoutMs}ms`)
          );
        }
      }, timeoutMs);
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout
      });
    });
  }
  /**
   * Resolves or rejects a pending request based on a server response.
   * Called when an incoming message contains a matching `requestId`.
   *
   * @param requestId The requestId from the server response
   * @param success   Whether the response indicates success or error
   * @param data      The response data to resolve with, or error info to reject with
   * @returns `true` if a pending request was found and handled
   */
  resolvePendingRequest(requestId, success, data) {
    const pending = this.pendingRequests.get(requestId);
    if (!pending) return false;
    clearTimeout(pending.timeout);
    this.pendingRequests.delete(requestId);
    if (success) {
      pending.resolve(data);
    } else {
      const errData = data;
      const errorMsg = errData?.payload?.message || errData?.message || errData?.error || errData?.payload?.code || errData?.code || "Unknown error";
      pending.reject(new Error(errorMsg));
    }
    return true;
  }
  /**
   * Rejects all currently pending requests.
   * Typically called on WebSocket disconnection.
   */
  rejectAllPendingRequests(reason = "Connection closed") {
    this.pendingRequests.forEach((pending) => {
      clearTimeout(pending.timeout);
      pending.reject(new Error(reason));
    });
    this.pendingRequests.clear();
  }
  /** Returns the number of currently pending (unresolved) requests. */
  get pendingCount() {
    return this.pendingRequests.size;
  }
  // --------------------------------------------------------------------------
  // Offline Message Queue
  // --------------------------------------------------------------------------
  /**
   * Adds an envelope to the offline queue.
   * Messages are flushed when the connection is restored.
   */
  enqueueMessage(message) {
    this.messageQueue.push(message);
    if (this.messageQueue.length > 1e3) {
      this.messageQueue.shift();
    }
  }
  /**
   * Returns and clears the current message queue.
   * Call this on reconnection to flush pending messages.
   */
  consumeQueue() {
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    return queue;
  }
  /**
   * Checks if there are pending messages in the offline queue.
   */
  hasQueuedMessages() {
    return this.messageQueue.length > 0;
  }
  // --------------------------------------------------------------------------
  // Cleanup
  // --------------------------------------------------------------------------
  /**
   * Cleans up all dispatcher resources:
   * rejects pending requests, clears queue, removes event listeners.
   */
  destroy() {
    this.rejectAllPendingRequests("Dispatcher destroyed");
    this.messageQueue = [];
    this.removeAllListeners();
  }
}
class MessageSender extends EventEmitter {
  constructor(connection, dispatcher) {
    super();
    this.attached = false;
    this.onOpen = () => {
      try {
        this.flushQueue();
      } catch (err) {
        console.error("[MessageSender] Error flushing queue on open:", err);
      }
      this.emit("connected");
    };
    this.onClose = () => {
      try {
        this.dispatcher.rejectAllPendingRequests("Connection closed");
      } catch (err) {
        console.error(
          "[MessageSender] Error rejecting pending requests on close:",
          err
        );
      }
      this.emit("disconnected");
    };
    this.onError = (err) => {
      this.emit("error", err);
    };
    this.connection = connection;
    this.dispatcher = dispatcher;
    this.attachHandlers();
  }
  // --------------------------------------------------------------------------
  // Public API
  // --------------------------------------------------------------------------
  /**
   * Send the envelope immediately if the connection is open, otherwise enqueue
   * it for later delivery.
   *
   * Mirror of the old provider helper; keeping the same name makes it an easy
   * drop-in for refactor.
   */
  sendOrQueue(envelope) {
    if (this.trySend(envelope)) return;
    this.dispatcher.enqueueMessage(envelope);
  }
  /**
   * Send a tracked request:
   *  - enforces rate limiting via MessageDispatcher.checkRateLimit
   *  - registers a pending request via MessageDispatcher.createPendingRequest
   *  - sends or enqueues the envelope
   */
  async sendRequest(envelope, requestId) {
    if (!this.dispatcher.checkRateLimit()) {
      throw new Error("Rate limit exceeded. Please slow down.");
    }
    const promise = this.dispatcher.createPendingRequest(requestId);
    this.sendOrQueue(envelope);
    return promise;
  }
  /**
   * Force a flush of the offline queue. Any messages that fail to send will be
   * re-enqueued so they are retried on the next connection open.
   */
  flushQueue() {
    if (!this.connection.connected) return;
    const queue = this.dispatcher.consumeQueue();
    if (queue.length === 0) return;
    const failed = [];
    for (const msg of queue) {
      try {
        const ok = this.connection.send(JSON.stringify(msg));
        if (!ok) {
          failed.push(msg);
        }
      } catch (err) {
        console.error("[MessageSender] Failed to send queued message:", err);
        failed.push(msg);
      }
    }
    for (const m of failed) {
      this.dispatcher.enqueueMessage(m);
    }
    if (failed.length > 0) {
      this.emit("flushPartial", { total: queue.length, failed: failed.length });
    } else {
      this.emit("flushComplete", { total: queue.length });
    }
  }
  /**
   * Returns whether there are queued messages.
   */
  hasQueuedMessages() {
    return this.dispatcher.hasQueuedMessages();
  }
  /**
   * Clean up listeners and resources.
   */
  destroy() {
    this.detachHandlers();
    this.removeAllListeners();
  }
  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------
  /**
   * Try to send immediately. Returns true if the send was performed (socket
   * open and `.send()` returned true), false otherwise.
   */
  trySend(envelope) {
    if (!this.connection.connected) return false;
    try {
      const sent = this.connection.send(JSON.stringify(envelope));
      return !!sent;
    } catch (err) {
      console.error("[MessageSender] Error while sending message:", err);
      return false;
    }
  }
  // --------------------------------------------------------------------------
  // Connection event wiring
  // --------------------------------------------------------------------------
  attachHandlers() {
    if (this.attached) return;
    this.attached = true;
    this.connection.on("open", this.onOpen);
    this.connection.on("close", this.onClose);
    this.connection.on("error", this.onError);
  }
  detachHandlers() {
    if (!this.attached) return;
    this.attached = false;
    this.connection.off("open", this.onOpen);
    this.connection.off("close", this.onClose);
    this.connection.off("error", this.onError);
  }
}
class AwarenessController extends EventEmitter {
  constructor(doc, userId, userName = userId) {
    super();
    this.userId = userId;
    this.userName = userName;
    this._remotePresences = /* @__PURE__ */ new Map();
    this.lastSentSelectedElement = null;
    this.lastAwarenessChangeTime = 0;
    this.awarenessThrottleMs = 100;
    this.handleAwarenessChange = () => {
      const now = Date.now();
      if (now - this.lastAwarenessChangeTime < this.awarenessThrottleMs) {
        return;
      }
      this.lastAwarenessChangeTime = now;
      this.emitNormalizedChange();
    };
    this.awareness = this.initializeAwareness(doc);
    this.setupAwarenessState();
    this.awareness.on("change", this.handleAwarenessChange);
  }
  // ==========================================================================
  // Initialization
  // ==========================================================================
  /**
   * Initializes the Awareness instance, reusing one already attached to
   * the Y.Doc if present.
   */
  initializeAwareness(doc) {
    const existing = doc.awareness;
    if (existing) return existing;
    const newAwareness = new Awareness(doc);
    doc.awareness = newAwareness;
    return newAwareness;
  }
  /**
   * Sets the initial local state for the current user.
   */
  setupAwarenessState() {
    try {
      this.awareness.setLocalState({
        user: {
          userId: this.userId,
          userName: this.userName,
          email: "",
          color: this.generateUserColor(this.userId)
        },
        cursor: { x: 0, y: 0 },
        selectedElement: null
      });
      this.lastSentSelectedElement = null;
    } catch (err) {
      console.error(
        "[AwarenessController] Failed to setup awareness state:",
        err
      );
    }
  }
  // ==========================================================================
  // Local State Updates (written by the Provider before sending `presence`)
  // ==========================================================================
  /**
   * Updates the local user's cursor position in the Awareness instance.
   * The Provider reads this to build the `presence` envelope payload.
   */
  updateLocalCursor(position) {
    try {
      this.awareness.setLocalStateField("cursor", position);
    } catch (err) {
      console.error(
        "[AwarenessController] Failed to update local cursor:",
        err
      );
    }
  }
  /**
   * Updates the local user's selected element in the Awareness instance.
   * Skips the update if the value hasn't changed.
   */
  updateLocalSelection(elementId) {
    try {
      if (this.lastSentSelectedElement === elementId) return;
      this.awareness.setLocalStateField("selectedElement", elementId);
      this.lastSentSelectedElement = elementId;
    } catch (err) {
      console.error(
        "[AwarenessController] Failed to update local selection:",
        err
      );
    }
  }
  /**
   * Returns the current local cursor position from Awareness.
   * Used by the Provider to build presence payloads.
   */
  getLocalCursor() {
    try {
      const state = this.awareness.getLocalState();
      return state?.cursor ?? null;
    } catch {
      return null;
    }
  }
  /**
   * Returns the current local selected element from Awareness.
   */
  getLocalSelectedElement() {
    try {
      const state = this.awareness.getLocalState();
      return state?.selectedElement ?? null;
    } catch {
      return null;
    }
  }
  // ==========================================================================
  // Remote Presence (incoming `presence` broadcasts from server)
  // ==========================================================================
  /**
   * Processes an incoming `presence` broadcast from another user.
   * Updates both the internal RemotePresence map and emits a `change` event
   * so the mouse store gets updated.
   *
   * @see WebSocket API Reference — Section 4: Broadcasted Operations
   */
  handleRemotePresence(data) {
    if (data.userId === this.userId) return;
    this._remotePresences.set(data.userId, {
      userId: data.userId,
      userName: data.userName,
      cursorX: data.cursorX,
      cursorY: data.cursorY,
      elementId: data.elementId,
      lastUpdated: Date.now(),
      meta: data.meta
    });
    this.emitNormalizedChange();
  }
  /**
   * Initializes remote presences from a `sync` response's user list.
   * Replaces all existing remote presence data.
   *
   * @see WebSocket API Reference — Section 4: Initial State Sync
   */
  handleSyncUsers(users) {
    this._remotePresences.clear();
    for (const user of users) {
      if (user.userId === this.userId) continue;
      this._remotePresences.set(user.userId, {
        userId: user.userId,
        userName: user.userName,
        cursorX: user.presence.cursorX,
        cursorY: user.presence.cursorY,
        elementId: user.presence.elementId,
        lastUpdated: Date.now()
      });
    }
    this.emitNormalizedChange();
  }
  /**
   * Removes a disconnected user's presence data.
   */
  removeUser(userId) {
    if (this._remotePresences.delete(userId)) {
      this.emitNormalizedChange();
    }
  }
  /**
   * Returns a snapshot of all remote presences.
   */
  get remotePresences() {
    return new Map(this._remotePresences);
  }
  // ==========================================================================
  // Awareness Event Handling
  // ==========================================================================
  /**
   * Returns all current Awareness states.
   */
  getStates() {
    return this.awareness.getStates();
  }
  /**
   * Extracts normalized data from both the Awareness states and the
   * internal remote presences map, then emits a `change` event.
   *
   * The emitted data shape is compatible with the mouse store setters:
   *   - `remoteUsers`   — Record<string, MousePosition>
   *   - `selectedByUser` — Record<string, string | null>
   *   - `users`          — Record<string, UserInfo>
   */
  emitNormalizedChange() {
    const remoteUsers = {};
    const selectedByUser = {};
    const users = {};
    for (const [uid, presence] of this._remotePresences) {
      remoteUsers[uid] = {
        x: presence.cursorX,
        y: presence.cursorY
      };
      if (presence.elementId) {
        selectedByUser[uid] = presence.elementId;
      }
      users[uid] = {
        userId: presence.userId,
        userName: presence.userName,
        email: ""
      };
    }
    const states = this.getStates();
    states.forEach((state, clientId) => {
      if (!state) return;
      const clientIdStr = clientId.toString();
      if (this._remotePresences.has(clientIdStr)) return;
      if (state.user) {
        const u = state.user;
        users[clientIdStr] = {
          userId: u.userId || clientIdStr,
          userName: u.userName || u.name || "Unknown",
          email: u.email || ""
        };
      }
      if (state.cursor) {
        remoteUsers[clientIdStr] = state.cursor;
      }
      if (state.selectedElement !== void 0) {
        selectedByUser[clientIdStr] = state.selectedElement;
      }
    });
    this.emit("change", { remoteUsers, selectedByUser, users });
  }
  // ==========================================================================
  // Stale Presence Pruning
  // ==========================================================================
  /**
   * Remove presences older than `maxAgeMs`.
   * Call this periodically (e.g. every 60s) to clean up disconnected users
   * whose disconnect message may have been missed.
   */
  pruneStale(maxAgeMs = 6e4) {
    const now = Date.now();
    let changed = false;
    for (const [userId, presence] of this._remotePresences) {
      if (now - presence.lastUpdated > maxAgeMs) {
        this._remotePresences.delete(userId);
        changed = true;
      }
    }
    if (changed) {
      this.emitNormalizedChange();
    }
  }
  // ==========================================================================
  // Utility
  // ==========================================================================
  /**
   * Generates a stable HSL color for a user based on their ID string.
   */
  generateUserColor(userId) {
    const hash = Array.from(userId).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }
  // ==========================================================================
  // Cleanup
  // ==========================================================================
  /**
   * Cleans up all resources: removes Awareness listener, clears remote
   * presences, and removes all event listeners.
   */
  destroy() {
    this.awareness.off("change", this.handleAwarenessChange);
    this._remotePresences.clear();
    this.removeAllListeners();
  }
}
class ElementMessageHandler {
  constructor(options) {
    this.options = options;
  }
  handle(envelope) {
    if (envelope.requestId) {
      const isSuccess = envelope.type !== "error";
      const wasResolved = this.options.resolvePendingRequest(
        envelope.requestId,
        isSuccess,
        this.toOperationResult(envelope)
      );
      if (wasResolved && !isSuccess) return;
    }
    switch (envelope.type) {
      case "sync:page": {
        const payload = envelope.payload;
        ElementStore.getState().loadElements(
          payload.elements,
          true
        );
        this.options.handleSyncUsers(payload.users);
        this.options.onSynced?.(true);
        break;
      }
      case "element:create": {
        const payload = envelope.payload;
        ElementStore.getState().remoteAdd(payload.element);
        break;
      }
      case "element:update": {
        const payload = envelope.payload;
        const { id, settings, styles, ...rest } = payload;
        const existing = ElementTreeHelper.findById(
          ElementStore.getState().elements,
          id
        );
        if (!existing) break;
        const patch = {
          ...rest,
          ...settings !== void 0 && {
            settings: {
              ...existing.settings ?? {},
              ...settings ?? {}
            }
          },
          ...styles !== void 0 && {
            styles: {
              ...existing.styles ?? {},
              ...styles ?? {}
            }
          }
        };
        ElementStore.getState().remoteUpdate(id, patch);
        break;
      }
      case "element:move": {
        const payload = envelope.payload;
        ElementStore.getState().remoteMove(
          payload.id,
          payload.parentId ?? null,
          payload.order
        );
        break;
      }
      case "element:delete": {
        const payload = envelope.payload;
        ElementStore.getState().remoteDelete(payload.id);
        break;
      }
      case "presence": {
        const payload = envelope.payload;
        this.options.handleRemotePresence(payload);
        this.options.onPresence?.(payload);
        break;
      }
      case "error": {
        const payload = envelope.payload;
        this.options.onError?.({
          ...payload,
          requestId: envelope.requestId
        });
        break;
      }
    }
  }
  toOperationResult(envelope) {
    switch (envelope.type) {
      case "element:create": {
        const payload = envelope.payload;
        return {
          operationType: "create",
          element: payload.element,
          requestId: envelope.requestId
        };
      }
      case "element:update": {
        const payload = envelope.payload;
        return {
          operationType: "update",
          elementId: payload.id,
          requestId: envelope.requestId
        };
      }
      case "element:move": {
        const payload = envelope.payload;
        return {
          operationType: "move",
          elementId: payload.id,
          parentId: payload.parentId,
          order: payload.order,
          requestId: envelope.requestId
        };
      }
      case "element:delete": {
        const payload = envelope.payload;
        return {
          operationType: "delete",
          deletedElementId: payload.id,
          requestId: envelope.requestId
        };
      }
      default:
        return {
          operationType: "update",
          requestId: envelope.requestId
        };
    }
  }
}
class ElementOperations {
  constructor(projectId, pageId, userId, dispatcher, sender) {
    this.projectId = projectId;
    this.pageId = pageId;
    this.userId = userId;
    this.dispatcher = dispatcher;
    this.sender = sender;
  }
  toPayloadNode(element, parentId, position) {
    const children = element.elements;
    return {
      id: element.id,
      type: element.type,
      settings: element.settings ?? null,
      styles: element.styles ?? null,
      tailwindStyles: element.tailwindStyles ?? "",
      order: position ?? element.order ?? 0,
      parentId: parentId ?? element.parentId ?? null,
      ...element.content !== void 0 ? { content: element.content } : {},
      ...element.name !== void 0 ? { name: element.name } : {},
      ...element.src !== void 0 ? { src: element.src } : {},
      ...element.href !== void 0 ? { href: element.href } : {},
      ...children && children.length > 0 ? { elements: children.map((child) => this.toPayloadNode(child, element.id)) } : {}
    };
  }
  sendRequest(envelope, requestId) {
    return this.sender.sendRequest(envelope, requestId);
  }
  async createElement(element, parentId, position) {
    const requestId = this.dispatcher.generateRequestId();
    const envelope = this.dispatcher.createEnvelope(
      "element:create",
      this.projectId,
      this.pageId,
      { element: this.toPayloadNode(element, parentId, position) },
      { userId: this.userId, requestId }
    );
    return this.sendRequest(envelope, requestId);
  }
  async updateElement(elementId, updates, _updateType = "partial") {
    const requestId = this.dispatcher.generateRequestId();
    const envelope = this.dispatcher.createEnvelope(
      "element:update",
      this.projectId,
      this.pageId,
      {
        id: elementId,
        ...updates.settings !== void 0 ? { settings: updates.settings } : {},
        ...updates.styles !== void 0 ? { styles: updates.styles } : {},
        ...updates.content !== void 0 ? { content: updates.content } : {},
        ...updates.name !== void 0 ? { name: updates.name } : {},
        ...updates.order !== void 0 ? { order: updates.order } : {},
        ...updates.tailwindStyles !== void 0 ? { tailwindStyles: updates.tailwindStyles } : {},
        ...updates.src !== void 0 ? { src: updates.src } : {},
        ...updates.href !== void 0 ? { href: updates.href } : {}
      },
      { userId: this.userId, requestId }
    );
    return this.sendRequest(envelope, requestId);
  }
  async deleteElement(elementId, _deleteChildren = false, _preserveStructure = true) {
    const requestId = this.dispatcher.generateRequestId();
    const envelope = this.dispatcher.createEnvelope(
      "element:delete",
      this.projectId,
      this.pageId,
      { id: elementId },
      { userId: this.userId, requestId }
    );
    return this.sendRequest(envelope, requestId);
  }
  async moveElement(elementId, newParentId = null, newPosition) {
    const requestId = this.dispatcher.generateRequestId();
    const envelope = this.dispatcher.createEnvelope(
      "element:move",
      this.projectId,
      this.pageId,
      { id: elementId, parentId: newParentId, order: newPosition ?? 0 },
      { userId: this.userId, requestId }
    );
    return this.sendRequest(envelope, requestId);
  }
}
class CustomYjsProviderV2 {
  constructor(options) {
    this.connected = false;
    this.isSynced = false;
    this.statusListeners = /* @__PURE__ */ new Set();
    this.syncedListeners = /* @__PURE__ */ new Set();
    this.pruneInterval = null;
    this.doc = options.doc;
    this.projectId = options.projectId;
    this.pageId = options.pageId;
    this.userId = options.userId;
    this.userName = options.userName ?? options.userId;
    this.onSyncUsers = options.onSyncUsers;
    this.onConflict = options.onConflict;
    this.onError = options.onError;
    this.onPresence = options.onPresence;
    this.connection = new ConnectionManager({
      url: options.url,
      projectId: options.projectId,
      pageId: options.pageId,
      getToken: options.getToken
    });
    this.dispatcher = new MessageDispatcher();
    this.sender = new MessageSender(this.connection, this.dispatcher);
    this.awarenessController = new AwarenessController(
      this.doc,
      this.userId,
      this.userName
    );
    this.awareness = this.awarenessController.awareness;
    this.messageHandler = new ElementMessageHandler({
      onError: (payload) => this.onError?.({
        type: "error",
        message: payload.message,
        code: payload.code,
        requestId: payload.requestId
      }),
      onPresence: this.onPresence,
      onSynced: (synced) => {
        this.isSynced = synced;
        this.emitSynced(synced);
      },
      handleSyncUsers: (users) => this.awarenessController.handleSyncUsers(users),
      handleRemotePresence: (payload) => this.awarenessController.handleRemotePresence(payload),
      resolvePendingRequest: (requestId, isSuccess, result) => this.dispatcher.resolvePendingRequest(requestId, isSuccess, result)
    });
    this.elementOps = new ElementOperations(
      this.projectId,
      this.pageId,
      this.userId,
      this.dispatcher,
      this.sender
    );
    this.setupEventForwarding();
    void this.connection.connect();
    this.pruneInterval = setInterval(() => {
      this.awarenessController.pruneStale();
    }, 6e4);
  }
  // --------------------------------------------------------------------------
  // Event wiring
  // --------------------------------------------------------------------------
  setupEventForwarding() {
    this.connection.on("open", () => {
      this.connected = true;
      this.emitStatus("connected");
    });
    this.connection.on("close", () => {
      this.connected = false;
      this.isSynced = false;
      this.emitStatus("disconnected");
    });
    this.connection.on("error", (err) => {
      this.emitStatus("error");
      this.onError?.({
        type: "error",
        message: err.message || "WebSocket error",
        code: "PROCESS_ERROR"
      });
    });
    this.connection.on("message", (data) => {
      try {
        const envelope = JSON.parse(data);
        this.messageHandler.handle(envelope);
      } catch (err) {
        console.error("[CustomYjsProviderV2] Failed to parse message:", err);
      }
    });
    this.awarenessController.on("change", (data) => {
      this.onSyncUsers?.(data.users);
    });
  }
  // --------------------------------------------------------------------------
  // Element operations (outbound)
  // --------------------------------------------------------------------------
  async createElement(element, parentId, position) {
    return this.elementOps.createElement(element, parentId, position);
  }
  async updateElement(elementId, updates, updateType = "partial") {
    return this.elementOps.updateElement(elementId, updates, updateType);
  }
  async deleteElement(elementId, deleteChildren = false, preserveStructure = true) {
    return this.elementOps.deleteElement(
      elementId,
      deleteChildren,
      preserveStructure
    );
  }
  async moveElement(elementId, newParentId = null, newPosition) {
    return this.elementOps.moveElement(elementId, newParentId, newPosition);
  }
  // --------------------------------------------------------------------------
  // Page operations (REST — WS not implemented)
  // --------------------------------------------------------------------------
  async createPage(_page) {
    console.warn("[CustomYjsProviderV2] createPage — use REST API");
    return { operationType: "create", page: _page };
  }
  async updatePage(pageId, _updates) {
    console.warn("[CustomYjsProviderV2] updatePage — use REST API");
    return { operationType: "update", pageId };
  }
  async deletePage(pageId) {
    console.warn("[CustomYjsProviderV2] deletePage — use REST API");
    return { operationType: "delete", deletedPageId: pageId };
  }
  // --------------------------------------------------------------------------
  // Presence
  // --------------------------------------------------------------------------
  sendPresence(cursorX, cursorY, elementId) {
    this.awarenessController.updateLocalCursor({ x: cursorX, y: cursorY });
    if (elementId !== void 0) {
      this.awarenessController.updateLocalSelection(elementId);
    }
    const envelope = this.dispatcher.createEnvelope(
      "presence",
      this.projectId,
      this.pageId,
      {
        userId: this.userId,
        userName: this.userName,
        cursorX,
        cursorY,
        elementId: elementId ?? this.awarenessController.getLocalSelectedElement()
      },
      { userId: this.userId }
    );
    this.sender.sendOrQueue(envelope);
  }
  requestSync() {
    const envelope = this.dispatcher.createEnvelope(
      "sync:page",
      this.projectId,
      this.pageId,
      {},
      { userId: this.userId }
    );
    this.sender.sendOrQueue(envelope);
  }
  // --------------------------------------------------------------------------
  // Event subscription & control
  // --------------------------------------------------------------------------
  on(event, callback) {
    if (event === "status") {
      this.statusListeners.add(callback);
      const currentStatus = this.connected ? "connected" : "connecting";
      callback({ status: currentStatus });
    } else if (event === "synced") {
      this.syncedListeners.add(callback);
    }
  }
  off(event, callback) {
    if (event === "status") {
      this.statusListeners.delete(callback);
    } else if (event === "synced") {
      this.syncedListeners.delete(callback);
    }
  }
  get pendingUpdates() {
    return this.dispatcher.pendingCount;
  }
  onPresenceChange(callback) {
    try {
      callback(this.awarenessController.remotePresences);
    } catch (err) {
      console.error(
        "[CustomYjsProviderV2] onPresenceChange callback error:",
        err
      );
    }
    const handler = () => {
      try {
        callback(this.awarenessController.remotePresences);
      } catch (err) {
        console.error(
          "[CustomYjsProviderV2] onPresenceChange callback error:",
          err
        );
      }
    };
    this.awarenessController.on("change", handler);
    return () => this.awarenessController.off("change", handler);
  }
  async reconnect() {
    this.connection.disconnect();
    this.isSynced = false;
    await this.connection.connect();
  }
  disconnect() {
    this.connection.disconnect();
  }
  isConnected() {
    return this.connected;
  }
  destroy() {
    if (this.pruneInterval) {
      clearInterval(this.pruneInterval);
      this.pruneInterval = null;
    }
    this.connection.destroy();
    this.sender.destroy();
    this.dispatcher.destroy();
    this.awarenessController.destroy();
    this.statusListeners.clear();
    this.syncedListeners.clear();
  }
  emitStatus(status) {
    this.statusListeners.forEach((l) => l({ status }));
  }
  emitSynced(synced) {
    this.syncedListeners.forEach((l) => l(synced));
  }
}
const DEFAULT_WS_URL = "ws://localhost:8080";
const PRESENCE_SEND_THROTTLE_MS = 50;
const CollaborationContext = createContext(
  null
);
function useCollaborationOptional() {
  return useContext(CollaborationContext);
}
function CollaborationProvider({
  children,
  config
}) {
  const {
    projectId,
    pageId,
    wsUrl = DEFAULT_WS_URL,
    enabled = true,
    onSync,
    onError,
    onDisconnect,
    onReconnect
  } = config;
  const { userId, getToken, isLoaded } = useAuth();
  const { loadElements } = useElementStore();
  const setUsers = useMouseStore((s) => s.setUsers);
  const setRemoteUsers = useMouseStore((s) => s.setRemoteUsers);
  const setSelectedByUser = useMouseStore((s) => s.setSelectedByUser);
  const updateMousePosition = useMouseStore((s) => s.updateMousePosition);
  const removeUser = useMouseStore((s) => s.removeUser);
  const [state, setState] = useState({
    roomState: "connecting",
    error: null,
    isSynced: false,
    pendingUpdates: 0
  });
  const [remotePresences, setRemotePresences] = useState(/* @__PURE__ */ new Map());
  const providerRef = useRef(null);
  const canvasRef = useRef(null);
  const internalRef = useRef({
    isApplyingRemoteUpdate: false,
    pendingMoves: /* @__PURE__ */ new Set()
  });
  const latest = useRef({
    onSync,
    onError,
    onDisconnect,
    onReconnect,
    getToken,
    pageId
  });
  latest.current = {
    onSync,
    onError,
    onDisconnect,
    onReconnect,
    getToken,
    pageId
  };
  useEffect(() => {
    if (!enabled || !isLoaded || !userId || !pageId || pageId === "undefined")
      return;
    const ydoc = new Y.Doc();
    let persistence = null;
    try {
      persistence = new IndexeddbPersistence(pageId, ydoc);
    } catch {
      persistence = null;
    }
    const provider = new CustomYjsProviderV2({
      url: wsUrl,
      pageId,
      projectId,
      userId,
      userName: userId,
      getToken: () => latest.current.getToken(),
      doc: ydoc,
      // Called when awareness/user list changes (sync + awareness updates)
      onSyncUsers: (users) => {
        setUsers(users);
      },
      // Errors from provider surface here
      onError: (e) => {
        const msg = e?.message || e?.error || "Unknown provider error";
        latest.current.onError?.(new Error(msg));
        setState((s) => ({ ...s, error: msg }));
      },
      // Presence envelopes from the server can be handled immediately
      onPresence: (data) => {
        if (data.userId === userId) return;
        updateMousePosition(data.userId, {
          x: data.cursorX,
          y: data.cursorY
        });
        if (data.elementId) {
          useMouseStore.getState().setSelectedElement(data.userId, data.elementId);
        }
      }
    });
    providerRef.current = provider;
    provider.on("status", ({ status }) => {
      const roomState = status === "connected" ? "connected" : status === "error" ? "error" : "connecting";
      setState((s) => ({
        ...s,
        roomState,
        error: status === "error" ? "Connection failed" : s.error,
        pendingUpdates: providerRef.current?.pendingUpdates ?? s.pendingUpdates
      }));
      if (status === "connected") latest.current.onReconnect?.();
      else if (status === "disconnected") latest.current.onDisconnect?.();
    });
    provider.on("synced", (synced) => {
      setState((s) => ({ ...s, isSynced: synced }));
      if (synced) latest.current.onSync?.();
    });
    const yElementsText = ydoc.getText("elementsJson");
    const observer = (event, transaction) => {
      if (internalRef.current.isApplyingRemoteUpdate) return;
      try {
        const json = yElementsText.toString();
        const elements = json ? JSON.parse(json) : [];
        loadElements(elements, true);
        if (transaction?.origin === "v2-sync") {
          setState((s) => ({ ...s, isSynced: true }));
        }
      } catch (err) {
        console.warn("[YJS] Failed to parse remote elements", err);
      }
    };
    yElementsText.observe(observer);
    const unsubPresence = provider.onPresenceChange((presences) => {
      setRemotePresences(new Map(presences));
      const remoteUsersRecord = {};
      const selectedByUserRecord = {};
      const usersRecord = {};
      presences.forEach((p, uid) => {
        remoteUsersRecord[uid] = { x: p.cursorX, y: p.cursorY };
        if (p.elementId) {
          selectedByUserRecord[uid] = p.elementId;
        }
        usersRecord[uid] = {
          userId: p.userId,
          userName: p.userName,
          email: ""
        };
      });
      setRemoteUsers(remoteUsersRecord);
      setSelectedByUser(selectedByUserRecord);
      const existingUsers = useMouseStore.getState().users;
      setUsers({ ...existingUsers, ...usersRecord });
    });
    ElementStore.getState().setCollaborativeCallback(async (type, id, data) => {
      if (internalRef.current.isApplyingRemoteUpdate) return;
      if (!providerRef.current?.isSynced) return;
      if (!providerRef.current.isConnected()) return;
      const p = providerRef.current;
      try {
        if (type === "update" && id && data) {
          await p.updateElement(id, data);
        } else if (type === "delete" && id) {
          await p.deleteElement(id);
        } else if (type === "create" && data) {
          const el = data;
          p.createElement(el, el.parentId ?? null, el.order).catch(
            (err) => latest.current.onError?.(err)
          );
        } else if (type === "move" && data) {
          const moveData = data;
          if (internalRef.current.pendingMoves.has(moveData.elementId)) return;
          internalRef.current.pendingMoves.add(moveData.elementId);
          try {
            await p.moveElement(
              moveData.elementId,
              moveData.newParentId,
              moveData.newPosition
            );
          } finally {
            internalRef.current.pendingMoves.delete(moveData.elementId);
          }
        }
      } catch (err) {
        latest.current.onError?.(err);
      }
    });
    return () => {
      unsubPresence();
      try {
        yElementsText.unobserve(observer);
      } catch {
      }
      ElementStore.getState().setCollaborativeCallback(null);
      ElementStore.getState().setYjsUpdateCallback(null);
      provider.destroy();
      providerRef.current = null;
      persistence?.destroy();
    };
  }, [
    pageId,
    projectId,
    wsUrl,
    enabled,
    userId,
    isLoaded,
    loadElements,
    setUsers,
    setRemoteUsers,
    setSelectedByUser,
    updateMousePosition,
    removeUser
  ]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !providerRef.current) return;
    let lastX = -1;
    let lastY = -1;
    let lastSendTime = 0;
    const handleMouseMove = (e) => {
      if (!providerRef.current?.isConnected()) return;
      const now = Date.now();
      if (now - lastSendTime < PRESENCE_SEND_THROTTLE_MS) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      if (lastX !== -1 && deltaX < 3 && deltaY < 3) return;
      lastX = x;
      lastY = y;
      lastSendTime = now;
      providerRef.current.sendPresence(x, y);
    };
    const handleMouseLeave = () => {
      if (providerRef.current?.isConnected()) {
        providerRef.current.sendPresence(-1, -1);
      }
    };
    canvas.addEventListener("mousemove", handleMouseMove, { passive: true });
    canvas.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [state.roomState]);
  const createElement = useCallback(
    async (el, parentId, position) => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      await providerRef.current.createElement(el, parentId, position);
    },
    []
  );
  const updateElement = useCallback(
    async (id, updates) => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      await providerRef.current.updateElement(id, updates);
    },
    []
  );
  const deleteElement = useCallback(async (id) => {
    if (!providerRef.current) throw new Error("Provider not initialized");
    await providerRef.current.deleteElement(id);
  }, []);
  const moveElement = useCallback(
    async (id, newParentId, newPosition) => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      await providerRef.current.moveElement(
        id,
        newParentId ?? null,
        newPosition ?? 0
      );
    },
    []
  );
  const createPage2 = useCallback(async (_page) => {
    console.warn(
      "[CollaborationProvider] createPage via WebSocket not yet implemented — use REST API"
    );
  }, []);
  const updatePage = useCallback(
    async (_id, _updates) => {
      console.warn(
        "[CollaborationProvider] updatePage via WebSocket not yet implemented — use REST API"
      );
    },
    []
  );
  const deletePage = useCallback(async (_id) => {
    console.warn(
      "[CollaborationProvider] deletePage via WebSocket not yet implemented — use REST API"
    );
  }, []);
  const reconnect = useCallback(async () => {
    await providerRef.current?.reconnect();
  }, []);
  const contextValue = useMemo(
    () => ({
      // State
      isConnected: state.roomState === "connected",
      isSynced: state.isSynced,
      roomState: state.roomState,
      error: state.error,
      pendingUpdates: state.pendingUpdates,
      collabType: "websocket",
      // Canvas ref
      canvasRef,
      // Remote presences
      remotePresences,
      // Element operations
      createElement,
      updateElement,
      deleteElement,
      moveElement,
      // Page operations
      createPage: createPage2,
      updatePage,
      deletePage,
      // Control
      reconnect
    }),
    [
      state.roomState,
      state.isSynced,
      state.error,
      state.pendingUpdates,
      remotePresences,
      createElement,
      updateElement,
      deleteElement,
      moveElement,
      createPage2,
      updatePage,
      deletePage,
      reconnect
    ]
  );
  return /* @__PURE__ */ jsx(CollaborationContext.Provider, { value: contextValue, children });
}
const AIChatContext = React__default.createContext(void 0);
function useAiChat() {
  const context = React__default.useContext(AIChatContext);
  if (!context) {
    throw new Error("useAiContext must be used within an AiProvider");
  }
  return context;
}
function AIChatProvider({
  children
}) {
  const [chatOpen, setChatOpen] = React__default.useState(false);
  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);
  const toggleChat = () => setChatOpen((prev) => !prev);
  return /* @__PURE__ */ jsx(
    AIChatContext.Provider,
    {
      value: { chatOpen, openChat, closeChat, toggleChat },
      children
    }
  );
}
const CreatePageSchema = z.object({
  Id: z.string().optional(),
  Name: z.string().min(1),
  ProjectId: z.string(),
  Order: z.number().optional(),
  Slug: z.string().optional()
});
const createPage = createServerFn({
  method: "POST"
}).inputValidator((data) => CreatePageSchema.parse(data)).handler(createSsrRpc("6b94caa9dcfaf35534753be4d9a0f6a175e99f65f5df024f44f31fb3d823d596"));
const createPageSchema = z.object({
  name: z.string().min(1, "Page name is required"),
  type: z.enum(["sp", "dp"])
});
function CreatePageDialog() {
  const { addPage } = usePageStore();
  const { id } = useParams({ strict: false });
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(createPageSchema),
    defaultValues: {
      name: "",
      type: "sp"
    }
  });
  const onSubmit = async (data) => {
    const newPageData = {
      Id: v4(),
      Name: data.name,
      ProjectId: id,
      Styles: {},
      Type: data.type,
      DeletedAt: void 0,
      CreatedAt: /* @__PURE__ */ new Date(),
      UpdatedAt: /* @__PURE__ */ new Date()
    };
    const newPage = PageSchema.safeParse(newPageData);
    if (!newPage.success) {
      console.error("Validation failed:", newPage.error);
      return;
    }
    const response = await createPage({ data: newPage.data });
    if (response) {
      addPage(response);
    }
    setOpen(false);
    form.reset();
  };
  return /* @__PURE__ */ jsxs(
    Dialog,
    {
      open,
      onOpenChange: (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset();
        }
      },
      children: [
        /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "w-full justify-start h-6", children: "+ Add New Page" }) }),
        /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [
          /* @__PURE__ */ jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsx(DialogTitle, { children: "Create New Page" }),
            /* @__PURE__ */ jsx(DialogDescription, { children: "Enter a name and select a type for your new page." })
          ] }),
          /* @__PURE__ */ jsx(Form, { ...form, children: /* @__PURE__ */ jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "name",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { children: "Name" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Enter page name", ...field }) }),
                  /* @__PURE__ */ jsx(FormMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "type",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { children: "Type" }),
                  /* @__PURE__ */ jsxs(
                    Select,
                    {
                      onValueChange: field.onChange,
                      defaultValue: field.value,
                      children: [
                        /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select a page type" }) }) }),
                        /* @__PURE__ */ jsxs(SelectContent, { children: [
                          /* @__PURE__ */ jsx(SelectItem, { value: "sp", children: "Single Page" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "dp", children: "Dynamic Page" })
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(FormMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsxs(DialogFooter, { children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  onClick: () => {
                    setOpen(false);
                    form.reset();
                  },
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsx(Button, { type: "submit", children: "Create" })
            ] })
          ] }) })
        ] })
      ]
    }
  );
}
function DeletePageDialog({ page, onDelete }) {
  const [open, setOpen] = useState(false);
  const handleDelete = () => {
    onDelete(page.Id);
    setOpen(false);
  };
  return /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "text-xs h-6 px-2", children: "Delete" }) }),
    /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Delete Page" }),
        /* @__PURE__ */ jsxs(DialogDescription, { children: [
          "Are you sure you want to delete the page named `",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: page.Name }),
          "`? This action cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { onClick: () => setOpen(false), variant: "secondary", children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { onClick: handleDelete, variant: "destructive", children: "Delete" })
      ] })
    ] })
  ] });
}
function ProjectPageCommand() {
  const { pages, deletePage } = usePageStore();
  const { id } = useParams({ strict: false });
  return /* @__PURE__ */ jsxs(Command, { className: "rounded-lg border shadow-md", children: [
    /* @__PURE__ */ jsx(CommandInput, { placeholder: "Type a page or search..." }),
    /* @__PURE__ */ jsxs(CommandList, { children: [
      /* @__PURE__ */ jsx(CommandEmpty, { children: "No results found." }),
      pages.map((page) => /* @__PURE__ */ jsxs(CommandItem, { className: "group justify-between", children: [
        /* @__PURE__ */ jsx("span", { children: page.Name }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              className: "text-xs h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity",
              children: "Edit"
            }
          ),
          /* @__PURE__ */ jsx(DeletePageDialog, { page, onDelete: deletePage })
        ] })
      ] }, page.Id)),
      /* @__PURE__ */ jsx(CommandSeparator, {}),
      /* @__PURE__ */ jsx(CommandItem, { asChild: true, onSelect: () => {
      }, children: /* @__PURE__ */ jsx(CreatePageDialog, {}) })
    ] })
  ] });
}
const componentInfo = {
  Text: {
    title: "Text",
    description: "Add text content to your page. Double-click to edit."
  },
  Span: {
    title: "Span",
    description: "Inline text span for styling portions of text"
  },
  Heading: {
    title: "Heading",
    description: "Semantic heading element with multiple levels (H1-H6)"
  },
  Label: {
    title: "Label",
    description: "Label text for form inputs and accessibility"
  },
  Blockquote: {
    title: "Blockquote",
    description: "Semantic blockquote for quoted text"
  },
  Code: {
    title: "Code",
    description: "Preformatted code display"
  },
  Button: {
    title: "Button",
    description: "Interactive button for actions or navigation"
  },
  Section: {
    title: "Section",
    description: "Page section with customizable layout and background"
  },
  Image: {
    title: "Image",
    description: "Add images to your page. Supports upload or URL."
  },
  Video: {
    title: "Video",
    description: "Embed or upload video content"
  },
  Audio: {
    title: "Audio",
    description: "Embed or upload audio content"
  },
  IFrame: {
    title: "IFrame",
    description: "Embed external content via iframe"
  },
  Input: {
    title: "Input Field",
    description: "Text input field for collecting user data"
  },
  Textarea: {
    title: "Textarea",
    description: "Multi-line text input field"
  },
  Checkbox: {
    title: "Checkbox",
    description: "Checkbox input for boolean selections"
  },
  Radio: {
    title: "Radio",
    description: "Radio button for single selection from options"
  },
  Select: {
    title: "Select Dropdown",
    description: "Dropdown menu for selecting from multiple options"
  },
  Link: {
    title: "Link",
    description: "Clickable link for navigation to other pages or URLs"
  },
  Form: {
    title: "Form",
    description: "Create data collection forms with validation"
  },
  Frame: {
    title: "Frame",
    description: "Flexible container for grouping elements. Drag and drop components inside."
  },
  Carousel: {
    title: "Carousel",
    description: "Sliding showcase for images or content"
  },
  List: {
    title: "List",
    description: "Repeatable list items for displaying collections of data"
  },
  Separator: {
    title: "Separator",
    description: "Horizontal or vertical divider line"
  },
  Icon: {
    title: "Icon",
    description: "Display an icon from the icon library"
  },
  Progress: {
    title: "Progress",
    description: "Progress bar for displaying completion status"
  },
  Table: {
    title: "Table",
    description: "Data table with rows and columns"
  },
  Nav: {
    title: "Navigation",
    description: "Semantic navigation container"
  },
  Header: {
    title: "Header",
    description: "Semantic header/page header container"
  },
  Footer: {
    title: "Footer",
    description: "Semantic footer container"
  },
  Article: {
    title: "Article",
    description: "Semantic article content container"
  },
  Aside: {
    title: "Aside",
    description: "Semantic sidebar or complementary content"
  },
  CMSContentList: {
    title: "CMS Content List",
    description: "Display a list of CMS content items"
  },
  CMSContentItem: {
    title: "CMS Content Item",
    description: "Display a single CMS content item with full details"
  },
  CMSContentGrid: {
    title: "CMS Content Grid",
    description: "Display CMS content in a responsive grid layout"
  }
};
const createMockElement = (type) => {
  const base = {
    id: `preview-${type}`,
    projectId: "preview",
    pageId: "preview",
    type,
    content: "",
    styles: { default: {} }
  };
  const mocks = {
    Text: {
      ...base,
      content: "Sample text content",
      styles: {
        default: { fontSize: "13px", color: "#374151", lineHeight: "1.5" }
      }
    },
    Button: {
      ...base,
      content: "Click Me",
      styles: {
        default: {
          padding: "8px 20px",
          backgroundColor: "#2563eb",
          color: "white",
          borderRadius: "6px",
          border: "none",
          fontWeight: "500",
          fontSize: "13px",
          cursor: "pointer"
        }
      }
    },
    Section: {
      ...base,
      content: "Section",
      elements: [],
      styles: {
        default: {
          padding: "20px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "8px",
          color: "white",
          textAlign: "center",
          fontWeight: "500",
          fontSize: "12px",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      }
    },
    Image: {
      ...base,
      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80'%3E%3Crect fill='%23e5e7eb' width='120' height='80'/%3E%3Cpath fill='%239ca3af' d='M30 30 L45 45 L60 30 L90 60 L30 60 Z'/%3E%3Ccircle fill='%23fbbf24' cx='90' cy='25' r='8'/%3E%3C/svg%3E",
      styles: {
        default: {
          width: "100%",
          maxWidth: "120px",
          height: "auto",
          borderRadius: "4px"
        }
      }
    },
    Input: {
      ...base,
      styles: {
        default: {
          width: "100%",
          padding: "6px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          fontSize: "13px"
        }
      },
      settings: { placeholder: "Enter text...", type: "text" }
    },
    Select: {
      ...base,
      content: "<option>Choose option</option>",
      styles: {
        default: {
          width: "100%",
          padding: "6px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          fontSize: "13px",
          backgroundColor: "white"
        }
      }
    },
    Link: {
      ...base,
      content: "Link Text →",
      href: "#",
      styles: {
        default: {
          color: "#2563eb",
          textDecoration: "underline",
          fontSize: "13px"
        }
      }
    },
    Form: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "12px",
          border: "2px solid #d1d5db",
          borderRadius: "6px",
          backgroundColor: "#f9fafb"
        }
      },
      settings: { submitUrl: "", method: "post" }
    },
    Frame: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "16px",
          border: "2px dashed #9ca3af",
          borderRadius: "6px",
          backgroundColor: "#f9fafb",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontSize: "11px"
        }
      }
    },
    Carousel: {
      ...base,
      elements: [],
      styles: {
        default: {
          width: "100%",
          height: "80px",
          backgroundColor: "#e5e7eb",
          borderRadius: "6px",
          position: "relative"
        }
      },
      settings: { options: { loop: true } }
    },
    List: {
      ...base,
      elements: [],
      styles: {
        default: {
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }
      }
    },
    Span: {
      ...base,
      content: "Span text",
      styles: {
        default: { fontSize: "13px", color: "#374151" }
      }
    },
    Heading: {
      ...base,
      content: "Heading",
      styles: {
        default: {
          fontSize: "24px",
          fontWeight: "700",
          color: "#1f2937",
          lineHeight: "1.2"
        }
      }
    },
    Label: {
      ...base,
      content: "Label",
      styles: {
        default: {
          fontSize: "12px",
          fontWeight: "500",
          color: "#374151"
        }
      }
    },
    Blockquote: {
      ...base,
      content: "Quoted text",
      styles: {
        default: {
          fontSize: "14px",
          fontStyle: "italic",
          color: "#6b7280",
          borderLeft: "4px solid #d1d5db",
          paddingLeft: "12px"
        }
      }
    },
    Code: {
      ...base,
      content: "const x = 1;",
      styles: {
        default: {
          fontSize: "12px",
          fontFamily: "monospace",
          backgroundColor: "#f3f4f6",
          padding: "2px 6px",
          borderRadius: "3px",
          color: "#1f2937"
        }
      }
    },
    Video: {
      ...base,
      src: "https://example.com/video.mp4",
      styles: {
        default: {
          width: "100%",
          maxWidth: "320px",
          height: "180px",
          borderRadius: "4px",
          backgroundColor: "#000"
        }
      }
    },
    Audio: {
      ...base,
      src: "https://example.com/audio.mp3",
      styles: {
        default: {
          width: "100%",
          maxWidth: "300px"
        }
      }
    },
    IFrame: {
      ...base,
      src: "https://example.com",
      styles: {
        default: {
          width: "100%",
          maxWidth: "320px",
          height: "240px",
          borderRadius: "4px",
          border: "1px solid #d1d5db"
        }
      }
    },
    Textarea: {
      ...base,
      styles: {
        default: {
          width: "100%",
          minHeight: "80px",
          padding: "8px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          fontSize: "13px",
          fontFamily: "inherit"
        }
      },
      settings: { placeholder: "Enter text...", rows: 4 }
    },
    Checkbox: {
      ...base,
      styles: {
        default: {
          width: "16px",
          height: "16px",
          cursor: "pointer"
        }
      },
      settings: { label: "Checkbox" }
    },
    Radio: {
      ...base,
      styles: {
        default: {
          width: "16px",
          height: "16px",
          cursor: "pointer"
        }
      },
      settings: { label: "Radio", name: "radio" }
    },
    Separator: {
      ...base,
      styles: {
        default: {
          width: "100%",
          height: "1px",
          backgroundColor: "#d1d5db",
          margin: "16px 0"
        }
      }
    },
    Icon: {
      ...base,
      styles: {
        default: {
          width: "24px",
          height: "24px",
          color: "#6b7280"
        }
      },
      settings: { name: "Heart" }
    },
    Progress: {
      ...base,
      styles: {
        default: {
          width: "100%",
          height: "8px",
          backgroundColor: "#e5e7eb",
          borderRadius: "4px",
          overflow: "hidden"
        }
      },
      settings: { value: 65, max: 100 }
    },
    Table: {
      ...base,
      elements: [],
      styles: {
        default: {
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #d1d5db"
        }
      }
    },
    Nav: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "12px 20px",
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #d1d5db"
        }
      }
    },
    Header: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "20px",
          backgroundColor: "#f3f4f6",
          borderBottom: "1px solid #d1d5db"
        }
      }
    },
    Footer: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "20px",
          backgroundColor: "#f9fafb",
          borderTop: "1px solid #d1d5db",
          fontSize: "12px",
          color: "#6b7280"
        }
      }
    },
    Article: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "20px"
        }
      }
    },
    Aside: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "16px",
          backgroundColor: "#f9fafb",
          borderLeft: "4px solid #d1d5db"
        }
      }
    },
    CMSContentList: {
      ...base,
      elements: [],
      styles: {
        default: {
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }
      },
      settings: { collectionId: "" }
    },
    CMSContentItem: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "12px",
          border: "2px solid #c084fc",
          borderRadius: "6px",
          backgroundColor: "#faf5ff"
        }
      },
      settings: { collectionId: "" }
    },
    CMSContentGrid: {
      ...base,
      elements: [],
      styles: {
        default: {
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px"
        }
      },
      settings: { collectionId: "" }
    }
  };
  return mocks[type];
};
const componentMap = {
  Text: BaseComponent,
  Span: BaseComponent,
  Heading: BaseComponent,
  Label: BaseComponent,
  Blockquote: BaseComponent,
  Code: BaseComponent,
  Button: ButtonComponent,
  Section: SectionComponent,
  Image: ImageComponent,
  Video: BaseComponent,
  Audio: BaseComponent,
  IFrame: BaseComponent,
  Input: InputComponent,
  Textarea: BaseComponent,
  Checkbox: BaseComponent,
  Radio: BaseComponent,
  Select: SelectComponent,
  Link: BaseComponent,
  Form: FormComponent,
  Frame: FrameComponent,
  Carousel: CarouselComponent,
  List: ListComponent,
  Separator: BaseComponent,
  Icon: BaseComponent,
  Progress: BaseComponent,
  Table: BaseComponent,
  Nav: BaseComponent,
  Header: BaseComponent,
  Footer: BaseComponent,
  Article: BaseComponent,
  Aside: BaseComponent,
  CMSContentList: CMSContentListComponent,
  CMSContentItem: CMSContentItemComponent,
  CMSContentGrid: CMSContentGridComponent
};
const customPreviews = {
  Image: /* @__PURE__ */ jsx("div", { className: "w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
    /* @__PURE__ */ jsx(Image, { className: "w-8 h-8 text-gray-400" }),
    /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "Image" })
  ] }) }),
  Input: /* @__PURE__ */ jsxs("div", { className: "w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center gap-2 px-3", children: [
    /* @__PURE__ */ jsx(Type, { className: "w-4 h-4 text-gray-400" }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 h-2 bg-gray-100 rounded" })
  ] }),
  Select: /* @__PURE__ */ jsxs("div", { className: "w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center justify-between px-3", children: [
    /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "Choose option" }),
    /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 text-gray-400" })
  ] }),
  Link: /* @__PURE__ */ jsxs("div", { className: "w-full h-16 bg-white rounded-lg border border-blue-300 flex items-center gap-2 px-3", children: [
    /* @__PURE__ */ jsx("span", { className: "text-xs text-blue-600 underline", children: "Link Text" }),
    /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3 text-blue-600" })
  ] }),
  Carousel: /* @__PURE__ */ jsxs("div", { className: "w-full h-20 bg-linear-to-r from-blue-400 to-purple-500 rounded-lg relative flex items-center justify-center", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4 text-white/70" }),
      /* @__PURE__ */ jsx("div", { className: "w-16 h-12 bg-white/20 rounded flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-white font-bold text-sm", children: "1/3" }) }),
      /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-white/70" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1", children: [
      /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-white" }),
      /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-white/50" }),
      /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-white/30" })
    ] })
  ] }),
  List: /* @__PURE__ */ jsxs("div", { className: "w-full space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
      /* @__PURE__ */ jsx(List, { className: "w-4 h-4 text-gray-600" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-600 font-medium", children: "List Items" })
    ] }),
    [1, 2, 3].map((i) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-center gap-2 p-2 bg-gray-100 rounded",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-gray-600 rounded-full" }),
          /* @__PURE__ */ jsx("div", { className: "h-2 bg-gray-400 rounded flex-1" })
        ]
      },
      i
    ))
  ] }),
  Form: /* @__PURE__ */ jsxs("div", { className: "w-full space-y-2 p-3 border-2 border-gray-300 rounded-lg bg-white", children: [
    /* @__PURE__ */ jsx("div", { className: "h-2 bg-gray-300 rounded w-1/3" }),
    /* @__PURE__ */ jsx("div", { className: "h-8 bg-gray-100 border border-gray-300 rounded" }),
    /* @__PURE__ */ jsxs("div", { className: "h-7 bg-blue-600 rounded w-24 flex items-center justify-center gap-1", children: [
      /* @__PURE__ */ jsx(Send, { className: "w-3 h-3 text-white" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-white font-medium", children: "Submit" })
    ] })
  ] }),
  Frame: /* @__PURE__ */ jsxs("div", { className: "w-full h-20 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center bg-gray-50 gap-1", children: [
    /* @__PURE__ */ jsx(Upload, { className: "w-6 h-6 text-gray-400" }),
    /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "Drop Zone" })
  ] }),
  Span: /* @__PURE__ */ jsx("div", { className: "w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center px-3", children: /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "Span text" }) }),
  Heading: /* @__PURE__ */ jsx("div", { className: "w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center px-3", children: /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-gray-900", children: "Heading" }) }),
  Label: /* @__PURE__ */ jsx("div", { className: "w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center px-3", children: /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-gray-600", children: "Label" }) }),
  Blockquote: /* @__PURE__ */ jsx("div", { className: "w-full h-20 bg-gray-50 rounded-lg border-l-4 border-gray-400 flex items-center px-3", children: /* @__PURE__ */ jsx("span", { className: "text-sm italic text-gray-600", children: '"Quoted text"' }) }),
  Code: /* @__PURE__ */ jsx("div", { className: "w-full h-16 bg-gray-900 rounded-lg flex items-center px-3", children: /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-green-400", children: "const x = 1;" }) }),
  Video: /* @__PURE__ */ jsx("div", { className: "w-full h-20 bg-black rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
    /* @__PURE__ */ jsx(FileText, { className: "w-6 h-6 text-gray-500" }),
    /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: "Video" })
  ] }) }),
  Audio: /* @__PURE__ */ jsx("div", { className: "w-full h-16 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx("div", { className: "w-6 h-6 bg-gray-700 rounded-full" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-0.5", children: [
      /* @__PURE__ */ jsx("div", { className: "w-1 h-8 bg-gray-500 rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "w-1 h-6 bg-gray-500 rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "w-1 h-10 bg-gray-500 rounded-full" })
    ] })
  ] }) }),
  IFrame: /* @__PURE__ */ jsx("div", { className: "w-full h-20 bg-blue-50 rounded-lg border-2 border-blue-300 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-blue-600 font-medium", children: "IFrame" }) }),
  Textarea: /* @__PURE__ */ jsx("div", { className: "w-full h-20 bg-white rounded-lg border border-gray-300 flex items-center px-3", children: /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-1", children: [
    /* @__PURE__ */ jsx("div", { className: "h-2 bg-gray-200 rounded w-full" }),
    /* @__PURE__ */ jsx("div", { className: "h-2 bg-gray-200 rounded w-4/5" })
  ] }) }),
  Checkbox: /* @__PURE__ */ jsxs("div", { className: "w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center gap-2 px-3", children: [
    /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-gray-400 rounded flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-gray-600 rounded-sm" }) }),
    /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-600", children: "Checkbox" })
  ] }),
  Radio: /* @__PURE__ */ jsxs("div", { className: "w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center gap-2 px-3", children: [
    /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-gray-400 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 bg-gray-600 rounded-full" }) }),
    /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-600", children: "Radio" })
  ] }),
  Separator: /* @__PURE__ */ jsx("div", { className: "w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-3/4 h-px bg-gray-400" }) }),
  Icon: /* @__PURE__ */ jsx("div", { className: "w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-6 h-6 text-gray-600", children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-6 h-6" }) }) }),
  Progress: /* @__PURE__ */ jsxs("div", { className: "w-full h-16 bg-white rounded-lg border border-gray-300 flex flex-col items-center justify-center gap-2 px-3", children: [
    /* @__PURE__ */ jsx("div", { className: "w-full h-2 bg-gray-200 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "w-2/3 h-full bg-blue-600" }) }),
    /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "65%" })
  ] }),
  Table: /* @__PURE__ */ jsx("div", { className: "w-full h-20 bg-white rounded-lg border border-gray-300 overflow-hidden", children: /* @__PURE__ */ jsx("table", { className: "w-full text-xs", children: /* @__PURE__ */ jsxs("tbody", { children: [
    /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-300", children: [
      /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-gray-600 font-medium", children: "Header 1" }),
      /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-gray-600 font-medium", children: "Header 2" })
    ] }),
    /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-gray-500", children: "Data 1" }),
      /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-gray-500", children: "Data 2" })
    ] })
  ] }) }) }),
  Nav: /* @__PURE__ */ jsxs("div", { className: "w-full h-16 bg-gray-200 rounded-lg border border-gray-400 flex items-center px-3 gap-2", children: [
    /* @__PURE__ */ jsx("div", { className: "h-2 bg-gray-400 rounded w-16" }),
    /* @__PURE__ */ jsx("div", { className: "h-2 bg-gray-400 rounded w-12" })
  ] }),
  Header: /* @__PURE__ */ jsx("div", { className: "w-full h-20 bg-gradient-to-b from-gray-300 to-gray-200 rounded-lg border border-gray-400 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-700 font-medium", children: "Header" }) }),
  Footer: /* @__PURE__ */ jsx("div", { className: "w-full h-16 bg-gray-200 rounded-lg border border-gray-400 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-600", children: "© 2024 Footer" }) }),
  Article: /* @__PURE__ */ jsxs("div", { className: "w-full h-20 bg-white rounded-lg border border-gray-300 flex flex-col px-3 py-2 gap-1", children: [
    /* @__PURE__ */ jsx("div", { className: "h-2 bg-gray-300 rounded w-2/3" }),
    /* @__PURE__ */ jsx("div", { className: "h-1.5 bg-gray-200 rounded w-full" })
  ] }),
  Aside: /* @__PURE__ */ jsx("div", { className: "w-full h-20 bg-gray-100 rounded-lg border-l-4 border-gray-400 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-600", children: "Sidebar" }) }),
  CMSContentList: /* @__PURE__ */ jsxs("div", { className: "w-full space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
      /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-purple-600" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-purple-700 font-medium", children: "Content List" })
    ] }),
    [1, 2].map((i) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex gap-2 p-2 border border-purple-300 rounded bg-purple-50",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-purple-200 rounded shrink-0" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-1", children: [
            /* @__PURE__ */ jsx("div", { className: "h-2 bg-purple-300 rounded w-3/4" }),
            /* @__PURE__ */ jsx("div", { className: "h-1.5 bg-purple-200 rounded w-1/2" })
          ] })
        ]
      },
      i
    ))
  ] }),
  CMSContentItem: /* @__PURE__ */ jsxs("div", { className: "w-full p-3 border-2 border-purple-400 rounded-lg bg-purple-50", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
      /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-purple-600" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-purple-700 font-medium", children: "Content Item" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "w-full h-16 bg-purple-200 rounded mb-2" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("div", { className: "h-2 bg-purple-300 rounded w-full" }),
      /* @__PURE__ */ jsx("div", { className: "h-2 bg-purple-300 rounded w-4/5" })
    ] })
  ] }),
  CMSContentGrid: /* @__PURE__ */ jsxs("div", { className: "w-full space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
      /* @__PURE__ */ jsx(Grid3X3, { className: "w-4 h-4 text-purple-600" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-purple-700 font-medium", children: "Content Grid" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "w-full grid grid-cols-2 gap-2", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx(
      "div",
      {
        className: "aspect-square border-2 border-purple-300 rounded bg-purple-50 flex items-center justify-center",
        children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-purple-300 rounded" })
      },
      i
    )) })
  ] })
};
function ComponentPreview({ type }) {
  const Component2 = componentMap[type];
  const mockElement = createMockElement(type);
  if (!Component2)
    return /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 p-4", children: "No preview" });
  return customPreviews[type] || /* @__PURE__ */ jsx("div", { className: "w-full min-h-10 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { style: { transform: "scale(0.95)", width: "100%" }, children: /* @__PURE__ */ jsx(Component2, { element: mockElement }) }) });
}
function ComponentTooltip({
  children,
  componentType,
  side = "right",
  sideOffset = 10
}) {
  const [isOpen, setIsOpen] = useState(false);
  const info = componentInfo[componentType];
  if (!info) return /* @__PURE__ */ jsx(Fragment, { children });
  return /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs(Tooltip, { open: isOpen, onOpenChange: setIsOpen, children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children }),
    /* @__PURE__ */ jsxs(
      TooltipContent,
      {
        side,
        sideOffset,
        className: "max-w-70 p-0 overflow-hidden",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 bg-linear-to-r from-gray-50 to-gray-100 border-b", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-semibold text-sm text-gray-900", children: info.title }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600 mt-0.5", children: info.description })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-3 bg-white", children: /* @__PURE__ */ jsx("div", { className: "bg-gray-50 rounded p-3 border", children: /* @__PURE__ */ jsx(ComponentPreview, { type: componentType }) }) })
        ]
      }
    )
  ] }) });
}
const iconMap = {
  Type,
  MousePointerClick,
  CardSim,
  Image,
  FormInput,
  TextSelection,
  Link,
  SlidersHorizontal,
  List,
  Database
};
function IconRenderer({
  name,
  className = "w-4 h-4"
}) {
  const IconComponent = iconMap[name];
  return IconComponent ? /* @__PURE__ */ jsx(IconComponent, { className }) : /* @__PURE__ */ jsx(Component, { className });
}
const ComponentHolder = ({ icon, type }) => {
  const onDragStart = (e, elementType) => {
    e.dataTransfer.setData("elementType", elementType);
  };
  return /* @__PURE__ */ jsx(ComponentTooltip, { componentType: type, children: /* @__PURE__ */ jsxs(
    "div",
    {
      draggable: true,
      onDragStart: (e) => onDragStart(e, type),
      className: "flex flex-row items-center gap-2 w-full px-2 h-full text-xs rounded-md cursor-grab active:cursor-grabbing transition-colors",
      children: [
        /* @__PURE__ */ jsx(
          IconRenderer,
          {
            name: icon,
            className: "w-3.5 h-3.5 shrink-0 text-muted-foreground"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "truncate", children: type })
      ]
    }
  ) });
};
function CustomComponentHolder({
  name,
  index
}) {
  const onDragStart = (e) => {
    e.dataTransfer.setData("customComponentName", index.toString());
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      draggable: true,
      onDragStart: (e) => onDragStart(e),
      className: "flex flex-row items-center gap-2 w-full px-2 h-full text-xs rounded-md cursor-grab active:cursor-grabbing transition-colors",
      children: [
        /* @__PURE__ */ jsx(Component, { className: "w-3.5 h-3.5 shrink-0 text-muted-foreground" }),
        /* @__PURE__ */ jsx("span", { className: "truncate", children: name })
      ]
    }
  );
}
function ElementSelector() {
  const defaultComponents = useMemo(
    () => [...elementHolders].sort(
      (a, b) => a.type.localeCompare(b.type, void 0, { sensitivity: "base" })
    ),
    []
  );
  const customComponents = useMemo(() => {
    return customComps.map((component, index) => {
      const label = component.name || component.content || `Custom component ${index + 1}`;
      return { component, index, label };
    }).sort(
      (left, right) => left.label.localeCompare(right.label, void 0, {
        sensitivity: "base"
      })
    );
  }, []);
  return /* @__PURE__ */ jsxs(Command, { className: "flex h-full w-full flex-col border-none bg-transparent shadow-none [&_[data-slot=command-input-wrapper]]:border-none [&_[data-slot=command-input-wrapper]]:bg-muted/40 [&_[data-slot=command-input-wrapper]]:mx-4 [&_[data-slot=command-input-wrapper]]:mt-4 [&_[data-slot=command-input-wrapper]]:rounded-lg [&_[data-slot=command-input-wrapper]]:transition-colors [&_[data-slot=command-input-wrapper]]:focus-within:bg-muted/60", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx(CommandInput, { placeholder: "Search elements...", className: "h-9" }),
      /* @__PURE__ */ jsx("div", { className: "px-5 pt-2 pb-1", children: /* @__PURE__ */ jsx("h2", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40", children: "Components" }) })
    ] }),
    /* @__PURE__ */ jsxs(CommandList, { className: "flex-1 px-3 pb-6 scrollbar-none max-h-none overflow-y-auto", children: [
      /* @__PURE__ */ jsx(CommandEmpty, { className: "py-12 text-center text-xs text-muted-foreground", children: "No matches found." }),
      /* @__PURE__ */ jsx(
        CommandGroup,
        {
          heading: "Standard",
          className: "px-1 [&_[cmdk-group-heading]]:sr-only",
          children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-0.5", children: defaultComponents.map((element) => /* @__PURE__ */ jsx(
            CommandItem,
            {
              value: element.type,
              className: "p-0 h-9 rounded-md transition-all hover:bg-accent/50 data-[selected=true]:bg-accent/70 cursor-pointer",
              children: /* @__PURE__ */ jsx(
                ComponentHolder,
                {
                  icon: element.icon,
                  type: element.type
                }
              )
            },
            element.type
          )) })
        }
      ),
      customComponents.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(CommandSeparator, { className: "my-4 mx-2 opacity-10" }),
        /* @__PURE__ */ jsx("div", { className: "px-2 pt-2 pb-2", children: /* @__PURE__ */ jsx("h3", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40", children: "Custom" }) }),
        /* @__PURE__ */ jsx(
          CommandGroup,
          {
            heading: "Custom",
            className: "px-1 [&_[cmdk-group-heading]]:sr-only",
            children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-0.5", children: customComponents.map(({ index, label }) => /* @__PURE__ */ jsx(
              CommandItem,
              {
                value: label,
                className: "p-0 h-9 rounded-md transition-all hover:bg-accent/50 data-[selected=true]:bg-accent/70 cursor-pointer",
                children: /* @__PURE__ */ jsx(CustomComponentHolder, { name: label, index })
              },
              `${label}-${index}`
            )) })
          }
        )
      ] })
    ] })
  ] });
}
function Collapsible({
  ...props
}) {
  return /* @__PURE__ */ jsx(Collapsible$1.Root, { "data-slot": "collapsible", ...props });
}
function CollapsibleTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Collapsible$1.CollapsibleTrigger,
    {
      "data-slot": "collapsible-trigger",
      ...props
    }
  );
}
function CollapsibleContent({
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Collapsible$1.CollapsibleContent,
    {
      "data-slot": "collapsible-content",
      ...props
    }
  );
}
const iconColorMap = {
  Text: "text-blue-500",
  Link: "text-indigo-500",
  Button: "text-pink-500",
  Image: "text-yellow-500",
  Frame: "text-teal-500",
  List: "text-orange-500",
  ListItem: "text-orange-300",
  Carousel: "text-purple-500",
  Input: "text-green-500",
  Select: "text-cyan-500",
  Chart: "text-rose-500",
  DataTable: "text-lime-500",
  Form: "text-fuchsia-500",
  Section: "text-gray-500",
  default: "text-gray-400"
};
const getElementIcon = (type) => {
  const colorClass = iconColorMap[type] || iconColorMap.default;
  switch (type) {
    case "Text":
      return /* @__PURE__ */ jsx(Type, { className: `h-4 w-4 mr-2 ${colorClass}` });
    case "Link":
      return /* @__PURE__ */ jsx(Link, { className: `h-4 w-4 mr-2 ${colorClass}` });
    case "Button":
      return /* @__PURE__ */ jsx(MousePointer, { className: `h-4 w-4 mr-2 ${colorClass}` });
    case "Image":
      return /* @__PURE__ */ jsx(Image, { className: `h-4 w-4 mr-2 ${colorClass}` });
    case "Frame":
      return /* @__PURE__ */ jsx(Frame, { className: `h-4 w-4 mr-2 ${colorClass}` });
    case "List":
      return /* @__PURE__ */ jsx(List, { className: `h-4 w-4 mr-2 ${colorClass}` });
    case "ListItem":
      return /* @__PURE__ */ jsx(Square, { className: `h-4 w-4 mr-2 ${colorClass}` });
    case "Carousel":
      return /* @__PURE__ */ jsx(Images, { className: `h-4 w-4 mr-2 ${colorClass}` });
    case "Input":
      return /* @__PURE__ */ jsx(FormInput, { className: `h-4 w-4 mr-2 ${colorClass}` });
    case "Select":
      return /* @__PURE__ */ jsx(LayoutGrid, { className: `h-4 w-4 mr-2 ${colorClass}` });
    case "Chart":
      return /* @__PURE__ */ jsx(BarChart2, { className: `h-4 w-4 mr-2 ${colorClass}` });
    case "DataTable":
      return /* @__PURE__ */ jsx(Table2, { className: `h-4 w-4 mr-2 ${colorClass}` });
    case "Form":
      return /* @__PURE__ */ jsx(Files, { className: `h-4 w-4 mr-2 ${colorClass}` });
    case "Section":
      return /* @__PURE__ */ jsx(Square, { className: `h-4 w-4 mr-2 ${colorClass}` });
    default:
      return /* @__PURE__ */ jsx(Square, { className: `h-4 w-4 mr-2 ${colorClass}` });
  }
};
function ElementTreeItem({
  element,
  level = 0
}) {
  const { selectedElement, setSelectedElement } = useSelectedElementWithSetter();
  const [isOpen, setIsOpen] = React__default.useState(true);
  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedElement(
      selectedElement?.id === element.id ? void 0 : element
    );
  };
  const displayName = element.name || element.content || element.type;
  const hasChildren = "elements" in element && Array.isArray(element.elements) && element.elements.length > 0;
  return /* @__PURE__ */ jsx(Collapsible, { open: isOpen, onOpenChange: setIsOpen, children: /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center group", children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: cn(
            "flex items-center flex-1 p-2 cursor-pointer text-xs hover:bg-accent hover:rounded-md transition-colors",
            {
              "bg-accent rounded-md": selectedElement?.id === element.id
            }
          ),
          style: { paddingLeft: `${level * 16 + 8}px` },
          onClick: handleClick,
          children: [
            getElementIcon(element.type),
            /* @__PURE__ */ jsx("span", { className: "truncate flex-1", children: displayName })
          ]
        }
      ),
      hasChildren && /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          className: "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
          onClick: (e) => e.stopPropagation(),
          children: /* @__PURE__ */ jsx(
            ChevronDown,
            {
              className: cn(
                "h-3 w-3 transition-transform",
                isOpen && "rotate-180"
              )
            }
          )
        }
      ) })
    ] }),
    hasChildren && /* @__PURE__ */ jsx(CollapsibleContent, { children: /* @__PURE__ */ jsx("div", { children: element.elements.map(
      (child) => /* @__PURE__ */ jsx(
        ElementTreeItem,
        {
          element: child,
          level: level + 1
        },
        child.id
      )
    ) }) })
  ] }) });
}
const CMSManager = React__default.lazy(
  () => import("./CMSManagerDialog-VT5Ei9WQ.js")
);
const SnapshotManager = React__default.lazy(() => import("./SnapshotManager-0OTCxSp1.js"));
const ImageSelector = React__default.lazy(
  () => import("./ImageSelector-DHItPQLQ.js").then((m) => ({
    default: m.ImageSelector
  }))
);
const EventWorkflowManagerDialog = React__default.lazy(
  () => import("./EventWorkflowManagerDialog-B-sLO4BZ.js").then(
    (m) => ({
      default: m.EventWorkflowManagerDialog
    })
  )
);
function PanelFallback$1() {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" }) });
}
const MAIN_TABS = [
  { id: "components", label: "Components", icon: Blocks },
  { id: "layers", label: "Layers", icon: Layers },
  { id: "tools", label: "Tools", icon: Settings$1 }
];
const TOOL_SECTIONS = [
  { id: "pages", label: "Pages", icon: FileText },
  { id: "imageupload", label: "Images", icon: ImageIcon },
  { id: "cms", label: "CMS", icon: Database },
  { id: "snapshots", label: "Snapshots", icon: Camera },
  { id: "workflows", label: "Workflows", icon: Zap }
];
function EditorSideBar() {
  const { chatOpen } = useAiChat();
  const { projectId } = useEditorContext();
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const { state, toggleSidebar, setOpen } = useSidebar();
  const elements = useElements();
  const [activeTab, setActiveTab] = useState("components");
  const [activeToolSection, setActiveToolSection] = useState("pages");
  const isCollapsed = state === "collapsed";
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isCollapsed) setOpen(true);
  };
  const handleToolSelect = (section) => {
    setActiveTab("tools");
    setActiveToolSection(section);
    if (isCollapsed) setOpen(true);
  };
  if (chatOpen) return null;
  return /* @__PURE__ */ jsxs(
    Sidebar,
    {
      side: "left",
      collapsible: "icon",
      className: "border-r border-border bg-card",
      children: [
        /* @__PURE__ */ jsx(SidebarHeader, { className: "border-b border-border p-0", children: isCollapsed ? (
          /* collapsed: single centered expand button */
          /* @__PURE__ */ jsx("div", { className: "flex h-11 items-center justify-center", children: /* @__PURE__ */ jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7",
                onClick: toggleSidebar,
                children: /* @__PURE__ */ jsx(PanelLeftOpen, { className: "h-4 w-4" })
              }
            ) }),
            /* @__PURE__ */ jsx(TooltipContent, { side: "right", children: "Expand" })
          ] }) })
        ) : (
          /* expanded: inline tab row + collapse button */
          /* @__PURE__ */ jsxs("div", { className: "flex h-11 items-center", children: [
            MAIN_TABS.map((tab) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleTabChange(tab.id),
                className: cn(
                  "flex-1 h-full text-xs font-medium transition-colors border-b-2",
                  activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                ),
                children: tab.label
              },
              tab.id
            )),
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7 mx-1 shrink-0",
                  onClick: toggleSidebar,
                  children: /* @__PURE__ */ jsx(PanelLeftClose, { className: "h-4 w-4" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "right", children: "Collapse" })
            ] })
          ] })
        ) }),
        /* @__PURE__ */ jsx(SidebarContent, { className: "p-0", children: isCollapsed ? (
          /* collapsed icon rail */
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 py-3", children: [
            MAIN_TABS.map((tab) => /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: cn(
                    "h-8 w-8",
                    activeTab === tab.id && "bg-accent text-accent-foreground"
                  ),
                  onClick: () => handleTabChange(tab.id),
                  children: /* @__PURE__ */ jsx(tab.icon, { className: "h-4 w-4" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "right", children: tab.label })
            ] }, tab.id)),
            /* @__PURE__ */ jsx("div", { className: "my-1 h-px w-6 bg-border" }),
            TOOL_SECTIONS.map((s) => /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: cn(
                    "h-8 w-8",
                    activeTab === "tools" && activeToolSection === s.id && "bg-accent text-accent-foreground"
                  ),
                  onClick: () => handleToolSelect(s.id),
                  children: /* @__PURE__ */ jsx(s.icon, { className: "h-4 w-4" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "right", children: s.label })
            ] }, s.id))
          ] })
        ) : /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col overflow-hidden", children: [
          activeTab === "components" && /* @__PURE__ */ jsx(ElementSelector, {}),
          activeTab === "layers" && /* @__PURE__ */ jsx(ScrollArea, { className: "h-full", children: /* @__PURE__ */ jsx("div", { className: "py-2", children: elements.length > 0 ? elements.map((element) => /* @__PURE__ */ jsx(
            ElementTreeItem,
            {
              element
            },
            element.id ?? Math.random()
          )) : /* @__PURE__ */ jsx("p", { className: "py-10 text-center text-xs text-muted-foreground px-4", children: "No elements yet. Add components to see them here." }) }) }),
          activeTab === "tools" && /* @__PURE__ */ jsx(ScrollArea, { className: "h-full", children: /* @__PURE__ */ jsx(
            Accordion,
            {
              type: "single",
              collapsible: true,
              value: activeToolSection,
              onValueChange: setActiveToolSection,
              className: "w-full",
              children: TOOL_SECTIONS.map((section) => /* @__PURE__ */ jsxs(
                AccordionItem,
                {
                  value: section.id,
                  className: "border-b",
                  children: [
                    /* @__PURE__ */ jsx(AccordionTrigger, { className: "px-3 py-2.5 hover:no-underline hover:bg-accent/40 text-xs font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx(section.icon, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                      section.label
                    ] }) }),
                    /* @__PURE__ */ jsx(AccordionContent, { className: "px-3 pb-3 pt-1", children: /* @__PURE__ */ jsxs(Suspense, { fallback: /* @__PURE__ */ jsx(PanelFallback$1, {}), children: [
                      section.id === "pages" && /* @__PURE__ */ jsx(ProjectPageCommand, {}),
                      section.id === "imageupload" && /* @__PURE__ */ jsx(ImageSelector, {}),
                      section.id === "cms" && /* @__PURE__ */ jsx(CMSManager, {}),
                      section.id === "snapshots" && /* @__PURE__ */ jsx(SnapshotManager, {}),
                      section.id === "workflows" && (projectId ? /* @__PURE__ */ jsxs(Fragment, { children: [
                        /* @__PURE__ */ jsx(
                          EventWorkflowManagerDialog,
                          {
                            projectId,
                            isOpen: workflowDialogOpen,
                            onOpenChange: setWorkflowDialogOpen
                          }
                        ),
                        /* @__PURE__ */ jsxs(
                          "button",
                          {
                            onClick: () => setWorkflowDialogOpen(true),
                            className: "w-full px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-xs font-medium flex items-center justify-center gap-2",
                            children: [
                              /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5" }),
                              "Open Workflow Editor"
                            ]
                          }
                        )
                      ] }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Project not loaded" }))
                    ] }) })
                  ]
                },
                section.id
              ))
            }
          ) })
        ] }) }),
        /* @__PURE__ */ jsx(SidebarFooter, { className: "border-t border-border p-1.5", children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(SidebarMenuButton, { asChild: true, tooltip: "Settings", children: /* @__PURE__ */ jsxs(
          Link$1,
          {
            to: "/profile",
            className: "flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx(Settings$1, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: cn(
                    "text-xs transition-opacity duration-200",
                    isCollapsed && "opacity-0 w-0 overflow-hidden"
                  ),
                  children: "Settings"
                }
              )
            ]
          }
        ) }) }) }) }),
        /* @__PURE__ */ jsx(SidebarRail, {})
      ]
    }
  );
}
const SidebarEmptyState = ({
  title = "Nothing selected yet",
  description = "Pick an element on the canvas to show its settings, styles, or code.",
  icon,
  className,
  children
}) => {
  return /* @__PURE__ */ jsx(
    Empty,
    {
      className: cn("h-full min-h-0 bg-transparent border-none p-4", className),
      children: /* @__PURE__ */ jsxs(EmptyContent, { className: "gap-6", children: [
        /* @__PURE__ */ jsxs(EmptyHeader, { className: "gap-3", children: [
          /* @__PURE__ */ jsx(EmptyMedia, { variant: "icon", children: icon ?? /* @__PURE__ */ jsx(Square, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsx(EmptyTitle, { children: title }),
          /* @__PURE__ */ jsx(EmptyDescription, { children: description })
        ] }),
        children && /* @__PURE__ */ jsx("div", { className: "flex w-full flex-col items-center gap-2 text-sm text-muted-foreground", children })
      ] })
    }
  );
};
const Settings = React__default.lazy(() => import("./Settings-Clhxy6nI.js"));
const Styles = React__default.lazy(() => import("./Styles-CLBfq05m.js"));
const CssTextareaImporter = React__default.lazy(
  () => import("./CssTextareaImporter-BFgDOHhq.js")
);
function PanelFallback() {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" }) });
}
const TABS = [
  { id: "styles", label: "Design", icon: Palette },
  { id: "settings", label: "Settings", icon: Settings2 },
  { id: "code", label: "Code", icon: Code2 }
];
function LayoutSideBar() {
  const params = useParams({ strict: false });
  const { toggleSidebar, state, setOpen } = useSidebar();
  const { toggleChat } = useAiChat();
  const selectedElement = useSelectedElement();
  const [activeTab, setActiveTab] = useState("styles");
  const isCollapsed = state === "collapsed";
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isCollapsed) setOpen(true);
  };
  const visitProjectSubdomain = (projectId) => {
    window.open(`http://localhost:3000/preview/${projectId}`);
  };
  return /* @__PURE__ */ jsxs(
    Sidebar,
    {
      side: "right",
      collapsible: "icon",
      className: "border-l border-border bg-card",
      children: [
        /* @__PURE__ */ jsx(SidebarHeader, { className: "border-b border-border p-0", children: isCollapsed ? (
          /* collapsed: single centered collapse button */
          /* @__PURE__ */ jsx("div", { className: "flex h-11 items-center justify-center", children: /* @__PURE__ */ jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7",
                onClick: toggleSidebar,
                children: /* @__PURE__ */ jsx(PanelRightOpen, { className: "h-4 w-4" })
              }
            ) }),
            /* @__PURE__ */ jsx(TooltipContent, { side: "left", children: "Expand" })
          ] }) })
        ) : (
          /* expanded: collapse button + inline tab row */
          /* @__PURE__ */ jsxs("div", { className: "flex h-11 items-center", children: [
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7 mx-1 shrink-0",
                  onClick: toggleSidebar,
                  children: /* @__PURE__ */ jsx(PanelRightClose, { className: "h-4 w-4" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "left", children: "Collapse" })
            ] }),
            TABS.map((tab) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleTabChange(tab.id),
                className: cn(
                  "flex-1 h-full text-xs font-medium transition-colors border-b-2",
                  activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                ),
                children: tab.label
              },
              tab.id
            ))
          ] })
        ) }),
        /* @__PURE__ */ jsx(SidebarContent, { className: "p-0", children: isCollapsed ? (
          /* collapsed icon rail */
          /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center gap-1 py-3", children: TABS.map((tab) => /* @__PURE__ */ jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: cn(
                  "h-8 w-8",
                  activeTab === tab.id && "bg-accent text-accent-foreground"
                ),
                onClick: () => handleTabChange(tab.id),
                children: /* @__PURE__ */ jsx(tab.icon, { className: "h-4 w-4" })
              }
            ) }),
            /* @__PURE__ */ jsx(TooltipContent, { side: "left", children: tab.label })
          ] }, tab.id)) })
        ) : /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0 flex flex-col overflow-hidden", children: [
          activeTab === "settings" && /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-auto p-3", children: selectedElement ? /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(PanelFallback, {}), children: /* @__PURE__ */ jsx(Settings, {}) }) : /* @__PURE__ */ jsx(
            SidebarEmptyState,
            {
              title: "Select an element",
              description: "Click any component in the canvas to configure it here.",
              icon: /* @__PURE__ */ jsx(Settings2, { className: "h-5 w-5" })
            }
          ) }),
          activeTab === "styles" && /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-auto", children: selectedElement ? /* @__PURE__ */ jsx("div", { className: "p-3", children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(PanelFallback, {}), children: /* @__PURE__ */ jsx(Styles, {}) }) }) : /* @__PURE__ */ jsx(
            SidebarEmptyState,
            {
              title: "Select an element",
              description: "Pick a canvas node to unlock its style controls.",
              icon: /* @__PURE__ */ jsx(Palette, { className: "h-5 w-5" })
            }
          ) }),
          activeTab === "code" && /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-auto p-3", children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(PanelFallback, {}), children: /* @__PURE__ */ jsx(CssTextareaImporter, {}) }) })
        ] }) }),
        /* @__PURE__ */ jsx(SidebarFooter, { className: "border-t border-border p-1.5", children: /* @__PURE__ */ jsxs(SidebarMenu, { children: [
          /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxs(
            SidebarMenuButton,
            {
              tooltip: "AI Assistant",
              onClick: () => {
                toggleChat();
                toggleSidebar();
              },
              children: [
                /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4 shrink-0" }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: cn(
                      "text-xs transition-opacity duration-200",
                      isCollapsed && "opacity-0 w-0 overflow-hidden"
                    ),
                    children: "AI Assistant"
                  }
                )
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxs(
            SidebarMenuButton,
            {
              tooltip: "View Live Site",
              onClick: () => visitProjectSubdomain(params.id),
              className: "bg-primary text-primary-foreground hover:bg-primary/90",
              children: [
                /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4 shrink-0" }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: cn(
                      "text-xs transition-opacity duration-200",
                      isCollapsed && "opacity-0 w-0 overflow-hidden"
                    ),
                    children: "View Live"
                  }
                )
              ]
            }
          ) })
        ] }) }),
        /* @__PURE__ */ jsx(SidebarRail, {})
      ]
    }
  );
}
function CommentsPanelHeader({
  title,
  description,
  showAllComments,
  totalComments,
  unresolvedCount,
  viewMode,
  sortOrder,
  onViewModeChange,
  onSortOrderChange,
  onClose,
  onShowAll,
  onClearSelection
}) {
  return /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-accent flex items-center justify-center", children: /* @__PURE__ */ jsx(MessageSquare, { className: "h-5 w-5 text-accent-foreground" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: title }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: description })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            onClick: onClose,
            className: "h-8 w-8 hover:bg-muted",
            title: "Hide comments",
            children: /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" })
          }
        ),
        !showAllComments && /* @__PURE__ */ jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            onClick: onClearSelection,
            className: "h-8 w-8 hover:bg-muted",
            title: "Show all comments",
            children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        Tabs,
        {
          value: viewMode,
          onValueChange: (value) => onViewModeChange(value),
          className: "flex-1",
          children: /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-3 h-9", children: [
            /* @__PURE__ */ jsxs(TabsTrigger, { value: "all", className: "text-xs", children: [
              "All",
              " ",
              showAllComments ? totalComments > 0 && `(${totalComments})` : ""
            ] }),
            /* @__PURE__ */ jsxs(TabsTrigger, { value: "unresolved", className: "text-xs", children: [
              "Active",
              " ",
              unresolvedCount > 0 && /* @__PURE__ */ jsx(
                Badge,
                {
                  variant: "secondary",
                  className: "ml-1 h-4 px-1 text-[10px]",
                  children: unresolvedCount
                }
              )
            ] }),
            /* @__PURE__ */ jsx(TabsTrigger, { value: "resolved", className: "text-xs", children: "Done" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxs(DropdownMenu, { defaultOpen: false, children: [
        /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "h-9 px-2",
            title: "Sort options",
            children: /* @__PURE__ */ jsx(SortDesc, { className: "h-4 w-4" })
          }
        ) }),
        /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => onSortOrderChange("newest"), children: [
            /* @__PURE__ */ jsx(
              Check,
              {
                className: cn(
                  "h-4 w-4 mr-2",
                  sortOrder === "newest" ? "opacity-100" : "opacity-0"
                )
              }
            ),
            "Newest first"
          ] }),
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => onSortOrderChange("oldest"), children: [
            /* @__PURE__ */ jsx(
              Check,
              {
                className: cn(
                  "h-4 w-4 mr-2",
                  sortOrder === "oldest" ? "opacity-100" : "opacity-0"
                )
              }
            ),
            "Oldest first"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function Spinner({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    Loader2Icon,
    {
      role: "status",
      "aria-label": "Loading",
      className: cn("size-4 animate-spin", className),
      ...props
    }
  );
}
function CommentCard({
  comment,
  isEditing,
  editingText,
  isLoading,
  canEdit,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onToggleResolved,
  onEditTextChange,
  onDoubleClick
}) {
  const { user } = useUser();
  const authorName = comment.author?.firstName && comment.author?.lastName ? `${comment.author.firstName} ${comment.author.lastName}` : comment.author?.email || "Unknown User";
  const authorInitial = comment.author?.firstName?.[0] || comment.author?.email?.[0]?.toUpperCase() || "U";
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, x: -100 },
      layout: true,
      onDoubleClick,
      className: cn(
        "bg-card rounded-lg p-3 space-y-2 border transition-all cursor-pointer",
        comment.resolved ? "border-accent bg-accent/50" : "border-border hover:border-primary hover:shadow-md"
      ),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8 border-2 border-card shadow-sm", children: [
              /* @__PURE__ */ jsx(AvatarImage, { src: comment.author?.imageUrl || void 0 }),
              /* @__PURE__ */ jsx(AvatarFallback, { className: "text-xs font-medium bg-linear-to-br from-primary to-accent text-primary-foreground", children: authorInitial })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: authorName }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(
              Badge,
              {
                variant: "outline",
                className: cn(
                  "text-xs",
                  comment.resolved ? "bg-accent text-accent-foreground border-accent" : "bg-secondary text-secondary-foreground border-secondary"
                ),
                children: comment.resolved ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3 h-3 mr-1" }),
                  "Resolved"
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Circle, { className: "w-3 h-3 mr-1" }),
                  "Active"
                ] })
              }
            ),
            canEdit && /* @__PURE__ */ jsxs(DropdownMenu, { children: [
              /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                Button,
                {
                  size: "icon",
                  variant: "ghost",
                  className: "h-7 w-7 hover:bg-muted",
                  onClick: (e) => e.stopPropagation(),
                  children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
                /* @__PURE__ */ jsxs(
                  DropdownMenuItem,
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      onStartEdit(comment.id, comment.content);
                    },
                    children: [
                      /* @__PURE__ */ jsx(Edit2, { className: "h-3.5 w-3.5 mr-2" }),
                      "Edit"
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  DropdownMenuItem,
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      onToggleResolved(comment.id);
                    },
                    children: comment.resolved ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(Circle, { className: "h-3.5 w-3.5 mr-2" }),
                      "Mark as active"
                    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 mr-2" }),
                      "Mark as resolved"
                    ] })
                  }
                ),
                /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
                /* @__PURE__ */ jsxs(
                  DropdownMenuItem,
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      onDelete(comment.id);
                    },
                    className: "text-destructive focus:text-destructive",
                    children: [
                      /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5 mr-2" }),
                      "Delete"
                    ]
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        isEditing ? /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            className: "space-y-2",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsx(
                Textarea$1,
                {
                  value: editingText,
                  onChange: (e) => onEditTextChange(e.target.value),
                  className: "min-h-20 text-sm resize-none border-border focus:border-primary",
                  placeholder: "Edit your comment...",
                  autoFocus: true
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
                /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: onCancelEdit, children: "Cancel" }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    size: "sm",
                    onClick: () => onUpdate(comment.id),
                    disabled: !editingText.trim() || isLoading,
                    children: "Save changes"
                  }
                )
              ] })
            ]
          }
        ) : /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground whitespace-pre-wrap wrap-break-word leading-relaxed pl-10", children: comment.content })
      ]
    }
  );
}
function ElementCommentGroup({
  elementId,
  comments,
  isEditing,
  editingCommentId,
  editingText,
  isLoading,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onToggleResolved,
  onEditTextChange,
  onElementSelect
}) {
  const { user } = useUser();
  const elements = useElements();
  const [isOpen, setIsOpen] = useState(true);
  const element = elementHelper.findById(elements, elementId);
  const unresolvedCount = comments.filter((c) => !c.resolved).length;
  return /* @__PURE__ */ jsx(Collapsible, { open: isOpen, onOpenChange: setIsOpen, children: /* @__PURE__ */ jsxs("div", { className: "border border-border rounded-lg overflow-hidden bg-card", children: [
    /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        className: "w-full flex items-center justify-between p-3 hover:bg-muted",
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx(
            motion.div,
            {
              animate: { rotate: isOpen ? 0 : -90 },
              transition: { duration: 0.2 },
              children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-accent flex items-center justify-center", children: /* @__PURE__ */ jsx(Layers, { className: "h-4 w-4 text-accent-foreground" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 text-left", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: element?.type || "Element" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground truncate", children: [
              "#",
              elementId.slice(0, 12),
              "..."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: comments.length }),
            unresolvedCount > 0 && /* @__PURE__ */ jsxs(Badge, { variant: "destructive", className: "text-xs", children: [
              unresolvedCount,
              " active"
            ] })
          ] })
        ] })
      }
    ) }),
    /* @__PURE__ */ jsx(CollapsibleContent, { children: /* @__PURE__ */ jsxs("div", { className: "p-3 pt-0 space-y-2 border-t border-border", children: [
      /* @__PURE__ */ jsxs(
        Button,
        {
          size: "sm",
          variant: "outline",
          className: "w-full gap-2",
          onClick: () => onElementSelect(elementId),
          children: [
            /* @__PURE__ */ jsx(MousePointerClick, { className: "h-3.5 w-3.5" }),
            "Focus on this element"
          ]
        }
      ),
      /* @__PURE__ */ jsx(AnimatePresence, { mode: "popLayout", children: comments.map((comment) => /* @__PURE__ */ jsx(
        CommentCard,
        {
          comment,
          isEditing: isEditing && editingCommentId === comment.id,
          editingText,
          isLoading,
          canEdit: user?.id === comment.authorId,
          onStartEdit,
          onCancelEdit,
          onUpdate,
          onDelete,
          onToggleResolved,
          onEditTextChange,
          onDoubleClick: () => onElementSelect(elementId)
        },
        comment.id
      )) })
    ] }) })
  ] }) });
}
function EmptyState({
  title,
  description,
  icon = "message",
  showSelectElement = false
}) {
  const IconComponent = icon === "message" ? MessageSquare : MousePointerClick;
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      className: "flex flex-col items-center justify-center h-32 text-center",
      children: [
        /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3", children: /* @__PURE__ */ jsx(IconComponent, { className: "h-8 w-8 text-muted-foreground" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: title }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: description })
      ]
    }
  );
}
function CommentsListView({
  comments,
  isLoading,
  viewMode,
  isEditing,
  editingCommentId,
  editingText,
  isAllComments,
  commentsByElement = {},
  elementIds = [],
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onToggleResolved,
  onEditTextChange,
  onElementSelect,
  userId
}) {
  const emptyMessage = getEmptyStateMessage(viewMode);
  if (isLoading) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-32 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Spinner, { className: "h-8 w-8 mb-2" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Loading comments..." })
    ] });
  }
  if (isAllComments) {
    if (elementIds.length === 0) {
      return /* @__PURE__ */ jsx(
        EmptyState,
        {
          title: emptyMessage.title,
          description: emptyMessage.description,
          icon: "message"
        }
      );
    }
    return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground mb-2", children: [
        /* @__PURE__ */ jsx(Layers, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsx("span", { children: "Double-click any comment to focus on its element" })
      ] }),
      /* @__PURE__ */ jsx(AnimatePresence, { mode: "popLayout", children: elementIds.map((elementId) => /* @__PURE__ */ jsx(
        ElementCommentGroup,
        {
          elementId,
          comments: commentsByElement[elementId] || [],
          isEditing,
          editingCommentId,
          editingText,
          isLoading,
          onStartEdit,
          onCancelEdit,
          onUpdate,
          onDelete,
          onToggleResolved,
          onEditTextChange,
          onElementSelect
        },
        elementId
      )) })
    ] });
  }
  if (comments.length === 0) {
    return /* @__PURE__ */ jsx(
      EmptyState,
      {
        title: emptyMessage.title,
        description: emptyMessage.description,
        icon: "message"
      }
    );
  }
  return /* @__PURE__ */ jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "popLayout", children: comments.map((comment) => /* @__PURE__ */ jsx(
    CommentCard,
    {
      comment,
      isEditing: isEditing && editingCommentId === comment.id,
      editingText,
      isLoading,
      canEdit: userId === comment.authorId,
      onStartEdit,
      onCancelEdit,
      onUpdate,
      onDelete,
      onToggleResolved,
      onEditTextChange
    },
    comment.id
  )) }) });
}
function CommentInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Share your thoughts..."
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      className: "space-y-2 pt-3 border-t-2",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            Textarea$1,
            {
              value,
              onChange: (e) => onChange(e.target.value),
              placeholder,
              className: "min-h-[100px] resize-none pr-12 border-border focus:border-primary bg-muted focus:bg-card transition-colors",
              onKeyDown: handleKeyDown
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-2 right-2 flex items-center gap-2", children: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: onSubmit,
              disabled: !value.trim() || isLoading,
              className: "h-8 px-3 gap-1.5 shadow-md hover:shadow-lg transition-all",
              children: [
                /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }),
                "Send"
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("kbd", { className: "px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono", children: "⌘" }),
          "+",
          /* @__PURE__ */ jsx("kbd", { className: "px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono", children: "Enter" }),
          "to send"
        ] })
      ]
    }
  );
}
function ElementCommentsPanel() {
  const { user } = useUser();
  const { project } = useProjectStore();
  const { selectedElement, setSelectedElement } = useSelectedElementWithSetter();
  const {
    activeCommentElementId,
    isCommentsVisible,
    toggleCommentsVisibility,
    setActiveCommentElement
  } = useElementCommentStore();
  const [newCommentText, setNewCommentText] = useState("");
  const elementId = selectedElement?.id || activeCommentElementId;
  const showAllComments = !elementId;
  useEffect(() => {
    if (selectedElement && activeCommentElementId && activeCommentElementId !== selectedElement.id) {
      setActiveCommentElement(void 0);
    }
  }, [selectedElement?.id, activeCommentElementId, setActiveCommentElement]);
  const {
    comments: singleElementComments,
    unresolvedCount: singleUnresolvedCount,
    isLoading: singleLoading,
    createComment,
    updateComment,
    deleteComment,
    toggleResolved
  } = useElementComments({
    elementId: elementId || void 0,
    autoLoad: !showAllComments
  });
  const {
    commentsByElement,
    elementIds,
    totalComments,
    unresolvedCount: projectUnresolvedCount,
    isLoading: projectLoading
  } = useProjectComments(showAllComments ? project?.id : void 0);
  const isLoading = showAllComments ? projectLoading : singleLoading;
  const unresolvedCount = showAllComments ? projectUnresolvedCount : singleUnresolvedCount;
  const {
    editingCommentId,
    editingText,
    viewMode,
    sortOrder,
    isEditing,
    processedComments,
    setViewMode,
    setSortOrder,
    setEditingText,
    startEditing,
    cancelEditing,
    handleUpdate,
    handleDelete,
    handleToggleResolved
  } = useCommentManager({
    comments: showAllComments ? [] : singleElementComments,
    isLoading,
    onUpdate: updateComment,
    onDelete: deleteComment,
    onToggleResolved: toggleResolved
  });
  const handleCreateComment = async () => {
    if (!newCommentText.trim()) return;
    const result = await createComment(newCommentText);
    if (result) {
      setNewCommentText("");
    }
  };
  const handleElementSelect = (id) => {
    setActiveCommentElement(id);
  };
  const handleClearSelection = () => {
    setActiveCommentElement(void 0);
    setSelectedElement(void 0);
  };
  if (!isCommentsVisible) {
    return /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        className: COMMENTS_PANEL.POSITION,
        children: /* @__PURE__ */ jsx(
          Button,
          {
            size: "icon",
            variant: "outline",
            onClick: toggleCommentsVisibility,
            className: "h-12 w-12 rounded-full shadow-xl hover:shadow-2xl transition-all bg-card border-border",
            title: "Show comments",
            children: /* @__PURE__ */ jsx(Eye, { className: "h-5 w-5" })
          }
        )
      }
    );
  }
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { x: 400, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 400, opacity: 0 },
      transition: { type: "spring", damping: 25, stiffness: 200 },
      children: /* @__PURE__ */ jsxs(
        Card,
        {
          className: `${COMMENTS_PANEL.POSITION} ${COMMENTS_PANEL.WIDTH} shadow-2xl border-border`,
          children: [
            /* @__PURE__ */ jsx(
              CommentsPanelHeader,
              {
                title: showAllComments ? "All Comments" : "Comments",
                description: showAllComments ? `${totalComments} comments across project` : "Collaborate on elements",
                showAllComments,
                totalComments,
                unresolvedCount,
                viewMode,
                sortOrder,
                onViewModeChange: setViewMode,
                onSortOrderChange: setSortOrder,
                onClose: toggleCommentsVisibility,
                onClearSelection: handleClearSelection
              }
            ),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 p-4 pt-0", children: [
              /* @__PURE__ */ jsx(ScrollArea, { className: `${COMMENTS_SCROLL_HEIGHT} pr-3`, children: /* @__PURE__ */ jsx(
                CommentsListView,
                {
                  comments: showAllComments ? [] : processedComments,
                  isLoading,
                  viewMode,
                  isEditing,
                  editingCommentId,
                  editingText,
                  isAllComments: showAllComments,
                  commentsByElement,
                  elementIds,
                  onStartEdit: startEditing,
                  onCancelEdit: cancelEditing,
                  onUpdate: handleUpdate,
                  onDelete: handleDelete,
                  onToggleResolved: handleToggleResolved,
                  onEditTextChange: setEditingText,
                  onElementSelect: handleElementSelect,
                  userId: user?.id
                }
              ) }),
              !showAllComments ? /* @__PURE__ */ jsx(
                CommentInput,
                {
                  value: newCommentText,
                  onChange: setNewCommentText,
                  onSubmit: handleCreateComment,
                  isLoading,
                  placeholder: "Share your thoughts..."
                }
              ) : /* @__PURE__ */ jsxs("div", { className: "text-center py-8 border-t border-border", children: [
                /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-3", children: /* @__PURE__ */ jsx(MousePointer, {}) }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground mb-1", children: "Select an element" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Click on an element or focus button to add comments" })
              ] })
            ] })
          ]
        }
      )
    }
  );
}
function useAutoResizeTextarea({
  minHeight,
  maxHeight
}) {
  const textareaRef = useRef(null);
  const adjustHeight = useCallback(
    (reset) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);
  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);
  return { textareaRef, adjustHeight };
}
const Textarea = React.forwardRef(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    return /* @__PURE__ */ jsxs("div", { className: cn("relative", containerClassName), children: [
      /* @__PURE__ */ jsx(
        "textarea",
        {
          className: cn(
            "border-input bg-background flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none" : "",
            className
          ),
          ref,
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
          ...props
        }
      ),
      showRing && isFocused && /* @__PURE__ */ jsx(
        motion.span,
        {
          className: "ring-primary/30 pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-0",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.2 }
        }
      ),
      props.onChange && /* @__PURE__ */ jsx(
        "div",
        {
          className: "bg-primary absolute right-2 bottom-2 h-2 w-2 rounded-full opacity-0",
          style: {
            animation: "none"
          },
          id: "textarea-ripple"
        }
      )
    ] });
  }
);
Textarea.displayName = "Textarea";
function AnimatedAIChat() {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [recentCommand, setRecentCommand] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200
  });
  const { closeChat } = useAiChat();
  const { open: sidebarOpen, setOpen } = useSidebar();
  const [inputFocused, setInputFocused] = useState(false);
  const commandPaletteRef = useRef(null);
  const { selectedElement, setSelectedElement } = useSelectedElementWithSetter();
  const commandSuggestions = [
    {
      icon: /* @__PURE__ */ jsx(ImageIcon, { className: "h-4 w-4" }),
      label: "Clone UI",
      description: "Generate a UI from a screenshot",
      prefix: "/clone"
    },
    {
      icon: /* @__PURE__ */ jsx(MonitorIcon, { className: "h-4 w-4" }),
      label: "Create Page",
      description: "Generate a new web page",
      prefix: "/page"
    },
    {
      icon: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
      label: "Improve",
      description: "Improve existing UI design",
      prefix: "/improve"
    }
  ];
  useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      setShowCommandPalette(true);
      const matchingSuggestionIndex = commandSuggestions.findIndex(
        (cmd) => cmd.prefix.startsWith(value)
      );
      if (matchingSuggestionIndex >= 0) {
        setActiveSuggestion(matchingSuggestionIndex);
      } else {
        setActiveSuggestion(-1);
      }
    } else {
      setShowCommandPalette(false);
    }
  }, [value]);
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const commandButton = document.querySelector("[data-command-button]");
      if (commandPaletteRef.current && !commandPaletteRef.current.contains(target) && !commandButton?.contains(target)) {
        setShowCommandPalette(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleKeyDown = (e) => {
    if (showCommandPalette) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion(
          (prev) => prev < commandSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion(
          (prev) => prev > 0 ? prev - 1 : commandSuggestions.length - 1
        );
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          const selectedCommand = commandSuggestions[activeSuggestion];
          setValue(selectedCommand.prefix + " ");
          setShowCommandPalette(false);
          setRecentCommand(selectedCommand.label);
          setTimeout(() => setRecentCommand(null), 3500);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        handleSendMessage();
      }
    }
  };
  const handleSendMessage = () => {
    if (value.trim()) {
      startTransition(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setValue("");
          adjustHeight(true);
        }, 3e3);
      });
    }
  };
  const handleAttachFile = () => {
    const mockFileName = `file-${Math.floor(Math.random() * 1e3)}.pdf`;
    setAttachments((prev) => [...prev, mockFileName]);
  };
  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };
  const selectCommandSuggestion = (index) => {
    const selectedCommand = commandSuggestions[index];
    setValue(selectedCommand.prefix + " ");
    setShowCommandPalette(false);
    setRecentCommand(selectedCommand.label);
    setTimeout(() => setRecentCommand(null), 2e3);
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex w-1/3 overflow-x-hidden", children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        className: "relative   z-50 rounded-full bg-primary/10  hover transition-colors",
        onClick: () => {
          closeChat();
          if (!sidebarOpen) {
            setOpen(true);
          }
        },
        children: "x"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "text-foreground relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-transparent p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 h-full w-full overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-primary/10 absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full mix-blend-normal blur-[128px] filter" }),
        /* @__PURE__ */ jsx("div", { className: "bg-secondary/10 absolute right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full mix-blend-normal blur-[128px] filter delay-700" }),
        /* @__PURE__ */ jsx("div", { className: "bg-primary/10 absolute top-1/4 right-1/3 h-64 w-64 animate-pulse rounded-full mix-blend-normal blur-[96px] filter delay-1000" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "relative mx-auto w-full max-w-2xl", children: /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "relative z-10 space-y-12",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: "easeOut" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-center", children: [
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.2, duration: 0.5 },
                  className: "inline-block",
                  children: [
                    /* @__PURE__ */ jsx("h1", { className: "pb-1 text-3xl font-medium tracking-tight", children: "How can I help today?" }),
                    /* @__PURE__ */ jsx(
                      motion.div,
                      {
                        className: "via-primary/50 h-px bg-gradient-to-r from-transparent to-transparent",
                        initial: { width: 0, opacity: 0 },
                        animate: { width: "100%", opacity: 1 },
                        transition: { delay: 0.5, duration: 0.8 }
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                motion.p,
                {
                  className: "text-muted-foreground text-sm",
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { delay: 0.3 },
                  children: "Type a command or ask a question"
                }
              )
            ] }),
            selectedElement && /* @__PURE__ */ jsxs(
              motion.div,
              {
                className: "bg-primary/5 text-muted-foreground flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs",
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.4 },
                children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Selected Element:" }),
                  /* @__PURE__ */ jsx("span", { className: "bg-primary/10 text-primary px-2 py-0.5 rounded", children: selectedElement.name || selectedElement.type }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setSelectedElement(void 0),
                      className: "text-muted-foreground hover:text-foreground transition-colors",
                      children: "✕"
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                className: "border-border bg-card/80 relative rounded-2xl border shadow-2xl backdrop-blur-2xl",
                initial: { scale: 0.98 },
                animate: { scale: 1 },
                transition: { delay: 0.1 },
                children: [
                  /* @__PURE__ */ jsx(AnimatePresence, { children: showCommandPalette && /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      ref: commandPaletteRef,
                      className: "border-border bg-background/90 absolute right-4 bottom-full left-4 z-50 mb-2 overflow-hidden rounded-lg border shadow-lg backdrop-blur-xl",
                      initial: { opacity: 0, y: 5 },
                      animate: { opacity: 1, y: 0 },
                      exit: { opacity: 0, y: 5 },
                      transition: { duration: 0.15 },
                      children: /* @__PURE__ */ jsx("div", { className: "bg-background py-1", children: commandSuggestions.map((suggestion, index) => /* @__PURE__ */ jsxs(
                        motion.div,
                        {
                          className: cn(
                            "flex cursor-pointer items-center gap-2 px-3 py-2 text-xs transition-colors",
                            activeSuggestion === index ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:bg-primary/10"
                          ),
                          onClick: () => selectCommandSuggestion(index),
                          initial: { opacity: 0 },
                          animate: { opacity: 1 },
                          transition: {
                            delay: index * 0.03
                          },
                          children: [
                            /* @__PURE__ */ jsx("div", { className: "text-primary flex h-5 w-5 items-center justify-center", children: suggestion.icon }),
                            /* @__PURE__ */ jsx("div", { className: "font-medium", children: suggestion.label }),
                            /* @__PURE__ */ jsx("div", { className: "text-muted-foreground ml-1 text-xs", children: suggestion.prefix })
                          ]
                        },
                        suggestion.prefix
                      )) })
                    }
                  ) }),
                  /* @__PURE__ */ jsx("div", { className: "p-4", children: /* @__PURE__ */ jsx(
                    Textarea,
                    {
                      ref: textareaRef,
                      value,
                      onChange: (e) => {
                        setValue(e.target.value);
                        adjustHeight();
                      },
                      onKeyDown: handleKeyDown,
                      onFocus: () => setInputFocused(true),
                      onBlur: () => setInputFocused(false),
                      placeholder: "Ask mvp.ai a question...",
                      containerClassName: "w-full",
                      className: cn(
                        "w-full px-4 py-3",
                        "resize-none",
                        "bg-transparent",
                        "border-none",
                        "text-foreground text-sm",
                        "focus:outline-none",
                        "placeholder:text-muted-foreground",
                        "min-h-[60px]"
                      ),
                      style: {
                        overflow: "hidden"
                      },
                      showRing: false
                    }
                  ) }),
                  /* @__PURE__ */ jsx(AnimatePresence, { children: attachments.length > 0 && /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      className: "flex flex-wrap gap-2 px-4 pb-3",
                      initial: { opacity: 0, height: 0 },
                      animate: { opacity: 1, height: "auto" },
                      exit: { opacity: 0, height: 0 },
                      children: attachments.map((file, index) => /* @__PURE__ */ jsxs(
                        motion.div,
                        {
                          className: "bg-primary/5 text-muted-foreground flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs",
                          initial: {
                            opacity: 0,
                            scale: 0.9
                          },
                          animate: {
                            opacity: 1,
                            scale: 1
                          },
                          exit: {
                            opacity: 0,
                            scale: 0.9
                          },
                          children: [
                            /* @__PURE__ */ jsx("span", { children: file }),
                            /* @__PURE__ */ jsx(
                              "button",
                              {
                                onClick: () => removeAttachment(index),
                                className: "text-muted-foreground hover:text-foreground transition-colors",
                                children: /* @__PURE__ */ jsx(XIcon, { className: "h-3 w-3" })
                              }
                            )
                          ]
                        },
                        index
                      ))
                    }
                  ) }),
                  /* @__PURE__ */ jsxs("div", { className: "border-border flex items-center justify-between gap-4 border-t p-4", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                      /* @__PURE__ */ jsxs(
                        motion.button,
                        {
                          type: "button",
                          onClick: handleAttachFile,
                          whileTap: { scale: 0.94 },
                          className: "group text-muted-foreground hover:text-foreground relative rounded-lg p-2 transition-colors",
                          children: [
                            /* @__PURE__ */ jsx(Paperclip, { className: "h-4 w-4" }),
                            /* @__PURE__ */ jsx(
                              motion.span,
                              {
                                className: "bg-primary/10 absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100",
                                layoutId: "button-highlight"
                              }
                            )
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxs(
                        motion.button,
                        {
                          type: "button",
                          "data-command-button": true,
                          onClick: (e) => {
                            e.stopPropagation();
                            setShowCommandPalette((prev) => !prev);
                          },
                          whileTap: { scale: 0.94 },
                          className: cn(
                            "group text-muted-foreground hover:text-foreground relative rounded-lg p-2 transition-colors",
                            showCommandPalette && "bg-primary/20 text-foreground"
                          ),
                          children: [
                            /* @__PURE__ */ jsx(Command$2, { className: "h-4 w-4" }),
                            /* @__PURE__ */ jsx(
                              motion.span,
                              {
                                className: "bg-primary/10 absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100",
                                layoutId: "button-highlight"
                              }
                            )
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs(
                      motion.button,
                      {
                        type: "button",
                        onClick: handleSendMessage,
                        whileHover: { scale: 1.01 },
                        whileTap: { scale: 0.98 },
                        disabled: isTyping || !value.trim(),
                        className: cn(
                          "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                          "flex items-center gap-2",
                          value.trim() ? "bg-primary text-primary-foreground shadow-primary/10 shadow-lg" : "bg-muted/50 text-muted-foreground"
                        ),
                        children: [
                          isTyping ? /* @__PURE__ */ jsx(LoaderIcon, { className: "h-4 w-4 animate-[spin_2s_linear_infinite]" }) : /* @__PURE__ */ jsx(SendIcon, { className: "h-4 w-4" }),
                          /* @__PURE__ */ jsx("span", { children: "Send" })
                        ]
                      }
                    )
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center justify-center gap-2", children: commandSuggestions.map((suggestion, index) => /* @__PURE__ */ jsxs(
              motion.button,
              {
                onClick: () => selectCommandSuggestion(index),
                className: "group bg-primary/5 text-muted-foreground hover:bg-primary/10 hover:text-foreground relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: index * 0.1 },
                children: [
                  suggestion.icon,
                  /* @__PURE__ */ jsx("span", { children: suggestion.label }),
                  /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      className: "border-border/50 absolute inset-0 rounded-lg border",
                      initial: false,
                      animate: {
                        opacity: [0, 1],
                        scale: [0.98, 1]
                      },
                      transition: {
                        duration: 0.3,
                        ease: "easeOut"
                      }
                    }
                  )
                ]
              },
              suggestion.prefix
            )) })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(AnimatePresence, { children: isTyping && /* @__PURE__ */ jsx(
        motion.div,
        {
          className: "border-border bg-background/80 fixed bottom-8 mx-auto -translate-x-1/2 transform rounded-full border px-4 py-2 shadow-lg backdrop-blur-2xl",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 20 },
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-primary/10 flex h-7 w-8 items-center justify-center rounded-full text-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "text-primary h-4 w-4" }) }),
            /* @__PURE__ */ jsxs("div", { className: "text-muted-foreground flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsx("span", { children: "Thinking" }),
              /* @__PURE__ */ jsx(TypingDots, {})
            ] })
          ] })
        }
      ) }),
      inputFocused && /* @__PURE__ */ jsx(
        motion.div,
        {
          className: "from-primary via-primary/80 to-secondary pointer-events-none fixed z-0 h-[50rem] w-[50rem] rounded-full bg-gradient-to-r opacity-[0.02] blur-[96px]",
          animate: {
            x: mousePosition.x - 400,
            y: mousePosition.y - 400
          },
          transition: {
            type: "spring",
            damping: 25,
            stiffness: 150,
            mass: 0.5
          }
        }
      )
    ] })
  ] });
}
function TypingDots() {
  return /* @__PURE__ */ jsx("div", { className: "ml-1 flex items-center", children: [1, 2, 3].map((dot) => /* @__PURE__ */ jsx(
    motion.div,
    {
      className: "bg-primary mx-0.5 h-1.5 w-1.5 rounded-full",
      initial: { opacity: 0.3 },
      animate: {
        opacity: [0.3, 0.9, 0.3],
        scale: [0.85, 1.1, 0.85]
      },
      transition: {
        duration: 1.2,
        repeat: Infinity,
        delay: dot * 0.15,
        ease: "easeInOut"
      },
      style: {
        boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)"
      }
    },
    dot
  )) });
}
const rippleKeyframes = `
@keyframes ripple {
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
`;
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = rippleKeyframes;
  document.head.appendChild(style);
}
function LeftSidebarWrapper({ children }) {
  const { chatOpen } = useAiChat();
  const { editingMode } = useEditorContext();
  const showSidebars = editingMode !== "code";
  return /* @__PURE__ */ jsxs(
    SidebarProvider,
    {
      defaultOpen: true,
      className: "shrink-0",
      style: {
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "3rem"
      },
      children: [
        showSidebars && /* @__PURE__ */ jsx(EditorSideBar, {}),
        showSidebars && chatOpen && /* @__PURE__ */ jsx(AnimatedAIChat, {}),
        children
      ]
    }
  );
}
function RightSidebarWrapper({ children }) {
  const { editingMode } = useEditorContext();
  const showSidebars = editingMode !== "code";
  return /* @__PURE__ */ jsxs(
    SidebarProvider,
    {
      defaultOpen: true,
      className: "shrink-0",
      style: {
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "3rem"
      },
      children: [
        children,
        showSidebars && /* @__PURE__ */ jsx(LayoutSideBar, {})
      ]
    }
  );
}
function EditorShell({
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex h-screen w-screen overflow-hidden", children: [
    /* @__PURE__ */ jsx(LeftSidebarWrapper, { children: /* @__PURE__ */ jsx("div", { className: "flex flex-1 min-w-0", children: /* @__PURE__ */ jsx(RightSidebarWrapper, { children: /* @__PURE__ */ jsx("main", { className: "flex-1 relative h-screen overflow-hidden min-w-0", children }) }) }) }),
    /* @__PURE__ */ jsx(ElementCommentsPanel, {})
  ] });
}
const WireframeManager = React__default.lazy(
  () => import("./WireframeManager-D3MSR2fM.js")
);
function WireframeHeader({ mode, setMode }) {
  return /* @__PURE__ */ jsx("header", { className: "h-12 shrink-0 flex items-center justify-center border-b border-border bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center rounded-lg bg-muted/50 border border-border p-0.5 gap-0.5", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setMode("wireframe"),
        "aria-pressed": mode === "wireframe",
        className: cn(
          "inline-flex items-center gap-1.5 h-7 px-2.5 text-xs rounded-md font-medium transition-all duration-150",
          mode === "wireframe" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
        ),
        children: [
          /* @__PURE__ */ jsx(LayoutTemplate, { className: "w-3.5 h-3.5" }),
          "Wireframe"
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setMode("editor"),
        "aria-pressed": mode === "editor",
        className: cn(
          "inline-flex items-center gap-1.5 h-7 px-2.5 text-xs rounded-md font-medium transition-all duration-150",
          mode === "editor" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
        ),
        children: [
          /* @__PURE__ */ jsx(PenTool, { className: "w-3.5 h-3.5" }),
          "Editor"
        ]
      }
    )
  ] }) });
}
function WireframeView({ mode, setMode, pageId }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-screen w-screen overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsx(WireframeHeader, { mode, setMode }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0", children: /* @__PURE__ */ jsx(
      Suspense,
      {
        fallback: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full h-full", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground border-t-transparent" }) }),
        children: /* @__PURE__ */ jsx(WireframeManager, { pageId })
      }
    ) })
  ] });
}
const EditorContext = createContext(void 0);
function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within EditorProvider");
  }
  return context;
}
function EditorProvider({
  children,
  projectId,
  userId
}) {
  const search = useSearch({ strict: false });
  const pageId = search.page || "";
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState("editor");
  const [editingMode, setEditingMode] = useState("visual");
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const collabEnabled = isMounted && !!userId;
  const editorData = useEditor(projectId || "", pageId, {});
  const contextValue = useMemo(
    () => ({
      projectId: projectId || null,
      userId: userId || null,
      editor: editorData,
      mode,
      setMode,
      editingMode,
      setEditingMode,
      pageId
    }),
    [projectId, userId, editorData, mode, editingMode, pageId]
  );
  return /* @__PURE__ */ jsx(EditorContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(
    CollaborationProvider,
    {
      config: {
        projectId: projectId || "",
        pageId,
        wsUrl: "wss://webbuilderrealtimev2go-production.up.railway.app",
        enabled: collabEnabled,
        onSync: () => {
          toast.dismiss("collab-offline");
          toast.success("Live collaboration connected", {
            id: "collab-connected",
            duration: 3e3
          });
        },
        onError: () => {
          toast.info("Working in offline mode", {
            id: "collab-offline",
            description: "Collaboration server unavailable. Changes will be saved locally.",
            duration: 5e3
          });
        }
      },
      children: /* @__PURE__ */ jsx(AIChatProvider, { children: mode === "wireframe" ? /* @__PURE__ */ jsx(WireframeView, { mode, setMode, pageId }) : /* @__PURE__ */ jsx(EditorShell, { children }) })
    }
  ) });
}
export {
  Command as C,
  EditorProvider as E,
  ProjectPageCommand as P,
  CommandInput as a,
  CommandList as b,
  CommandEmpty as c,
  CommandGroup as d,
  CommandItem as e,
  CommandDialog as f,
  useCollaborationOptional as g,
  useEditorContext as u
};
