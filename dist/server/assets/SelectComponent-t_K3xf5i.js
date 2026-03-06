import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import DOMPurify from "isomorphic-dompurify";
import * as React from "react";
import React__default, { useCallback, useMemo, useState, useRef, useEffect, createContext, useContext, memo } from "react";
import { X as QUERY_CONFIG, a as apiClient, U as URLBuilder, A as API_ENDPOINTS, e as Permission, C as CollaboratorRole, R as ROLE_PERMISSIONS, av as useElementStore, ay as useSelectionStore, az as SelectionStore, aq as showErrorToast, as as PERMISSION_ERRORS, k as elementHelper, j as cn, ad as showSuccessToast, ar as customComps, W as onMutationError, aA as getErrorMessage, aB as elementEventWorkflowKeys, aC as useElementEventWorkflowStore, ac as useProjectStore, an as onMutationSuccess, ah as usePageStore, ag as useEventModeStore, aD as getComponentFactory, am as useElementCommentStore, ai as TooltipProvider, aj as Tooltip, ak as TooltipTrigger, B as Button, f as Badge, al as TooltipContent, at as ElementStore, J as Dialog, K as DialogContent, L as DialogHeader, M as DialogTitle, N as DialogDescription, O as Label, I as Input, Q as DialogFooter, Y as Empty, Z as EmptyHeader, _ as EmptyMedia, $ as EmptyTitle, a0 as EmptyDescription } from "./prisma-Cq49YOYM.js";
import { toast } from "sonner";
import "clsx";
import "next-themes";
import "socket.io-client";
import "@hookform/resolvers/zod";
import { motion, AnimatePresence, Reorder, LayoutGroup } from "framer-motion";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Upload, Database, MessageCircle, MessageSquare, Pause, X, Plus, CheckCircle, Copy, Layers, ArrowUp, ArrowDown, Save, Trash2, ArrowRightLeft, ImageIcon } from "lucide-react";
import { C as Carousel, a as CarouselContent, b as CarouselItem, c as CarouselPrevious, d as CarouselNext } from "./carousel-DZpoDDoq.js";
import { useShallow } from "zustand/react/shallow";
import { v4 } from "uuid";
import { useAuth, useUser } from "@clerk/react";
import { useParams, useSearch } from "@tanstack/react-router";
import { clamp } from "lodash-es";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { ContextMenu as ContextMenu$1 } from "radix-ui";
import { T as Textarea } from "./textarea-BDhK7YnG.js";
import { C as Checkbox } from "./checkbox-BX2VzNwa.js";
const useCMSContent = (options = {}) => {
  const { contentTypeId, limit, sortBy, sortOrder, enabled = true } = options;
  const {
    data: contentItemsData,
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: ["cms-public-content", contentTypeId, limit, sortBy, sortOrder],
    queryFn: () => cmsService.getPublicContent({
      contentTypeId,
      limit,
      sortBy,
      sortOrder
    }),
    enabled: enabled && !!contentTypeId,
    ...QUERY_CONFIG.DEFAULT
  });
  const contentItems = contentItemsData ?? [];
  return {
    contentItems,
    contentTypes: [],
    isLoading,
    isFetching,
    error,
    refetch
  };
};
const useCMSContentItem = (contentTypeId, slug) => {
  const {
    data: contentItem,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: ["cms-public-content-item", contentTypeId, slug],
    queryFn: () => cmsService.getPublicContentItem(contentTypeId, slug),
    enabled: !!contentTypeId && !!slug,
    ...QUERY_CONFIG.DEFAULT
  });
  return {
    contentItem,
    isLoading: isFetching,
    isFetching,
    error,
    refetch
  };
};
const getFieldValue = (contentItem, fieldName) => {
  if (fieldName in contentItem) {
    const value = contentItem[fieldName];
    return value != null ? String(value) : void 0;
  }
  if (contentItem.fieldValues) {
    const fieldValue = contentItem.fieldValues.find(
      (fv) => fv.field?.name === fieldName
    );
    return fieldValue?.value;
  }
  return void 0;
};
const useCMSContentTypes = () => {
  return useQuery({
    queryKey: ["cms-content-types"],
    queryFn: () => cmsService.getContentTypes(),
    ...QUERY_CONFIG.LONG
  });
};
const cmsService = {
  getContentTypes: async () => {
    return apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.GET).build()
    );
  },
  createContentType: async (data) => {
    return apiClient.post(
      new URLBuilder("api").setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.CREATE).build(),
      data
    );
  },
  getContentTypeById: async (id) => {
    return apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.GET_BY_ID(id)).build()
    );
  },
  updateContentType: async (id, data) => {
    return apiClient.patch(
      new URLBuilder("api").setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.UPDATE(id)).build(),
      data
    );
  },
  deleteContentType: async (id) => {
    return apiClient.delete(
      new URLBuilder("api").setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.DELETE(id)).build()
    );
  },
  // Content Fields
  getContentFieldsByContentType: async (contentTypeId) => {
    return apiClient.get(
      new URLBuilder("api").setPath(
        API_ENDPOINTS.CMS.CONTENT_FIELDS.GET_BY_CONTENT_TYPE(contentTypeId)
      ).build()
    );
  },
  createContentField: async (contentTypeId, data) => {
    return apiClient.post(
      new URLBuilder("api").setPath(API_ENDPOINTS.CMS.CONTENT_FIELDS.CREATE(contentTypeId)).build(),
      data
    );
  },
  getContentFieldById: async (contentTypeId, fieldId) => {
    return apiClient.get(
      new URLBuilder("api").setPath(
        API_ENDPOINTS.CMS.CONTENT_FIELDS.GET_BY_ID(contentTypeId, fieldId)
      ).build()
    );
  },
  updateContentField: async (contentTypeId, fieldId, data) => {
    return apiClient.patch(
      new URLBuilder("api").setPath(
        API_ENDPOINTS.CMS.CONTENT_FIELDS.UPDATE(contentTypeId, fieldId)
      ).build(),
      data
    );
  },
  deleteContentField: async (contentTypeId, fieldId) => {
    return apiClient.delete(
      new URLBuilder("api").setPath(
        API_ENDPOINTS.CMS.CONTENT_FIELDS.DELETE(contentTypeId, fieldId)
      ).build()
    );
  },
  // Content Items
  getContentItemsByContentType: async (contentTypeId) => {
    return apiClient.get(
      new URLBuilder("api").setPath(
        API_ENDPOINTS.CMS.CONTENT_ITEMS.GET_BY_CONTENT_TYPE(contentTypeId)
      ).build()
    );
  },
  createContentItem: async (contentTypeId, data) => {
    return apiClient.post(
      new URLBuilder("api").setPath(API_ENDPOINTS.CMS.CONTENT_ITEMS.CREATE(contentTypeId)).build(),
      data
    );
  },
  getContentItemById: async (contentTypeId, itemId) => {
    return apiClient.get(
      new URLBuilder("api").setPath(
        API_ENDPOINTS.CMS.CONTENT_ITEMS.GET_BY_ID(contentTypeId, itemId)
      ).build()
    );
  },
  updateContentItem: async (contentTypeId, itemId, data) => {
    return apiClient.patch(
      new URLBuilder("api").setPath(API_ENDPOINTS.CMS.CONTENT_ITEMS.UPDATE(contentTypeId, itemId)).build(),
      data
    );
  },
  deleteContentItem: async (contentTypeId, itemId) => {
    return apiClient.delete(
      new URLBuilder("api").setPath(API_ENDPOINTS.CMS.CONTENT_ITEMS.DELETE(contentTypeId, itemId)).build()
    );
  },
  // Public Content — reuses the existing items endpoint with client-side sort/limit
  getPublicContent: async (params) => {
    if (!params?.contentTypeId) return [];
    const items = await apiClient.get(
      new URLBuilder("api").setPath(
        API_ENDPOINTS.CMS.CONTENT_ITEMS.GET_BY_CONTENT_TYPE(
          params.contentTypeId
        )
      ).build()
    );
    const sortBy = params.sortBy ?? "createdAt";
    const sortOrder = params.sortOrder ?? "desc";
    const sorted = [...items].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return params.limit ? sorted.slice(0, params.limit) : sorted;
  },
  getPublicContentItem: async (contentTypeId, slug) => {
    const items = await apiClient.get(
      new URLBuilder("api").setPath(
        API_ENDPOINTS.CMS.CONTENT_ITEMS.GET_BY_CONTENT_TYPE(contentTypeId)
      ).build()
    );
    const item = items.find((i) => i.slug === slug);
    if (!item) throw new Error(`Content item with slug "${slug}" not found`);
    return item;
  }
};
const eventWorkflowService = {
  getEventWorkflows: async (projectId) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.EVENT_WORKFLOWS.GET_BY_PROJECT(projectId)).build();
    const response = await apiClient.get(url);
    return Array.isArray(response) ? response : response?.data || [];
  },
  getEventWorkflowById: async (workflowId) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.EVENT_WORKFLOWS.GET_BY_ID(workflowId)).build();
    return apiClient.get(url);
  },
  createEventWorkflow: async (projectId, data) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.EVENT_WORKFLOWS.CREATE).build();
    return apiClient.post(url, {
      ...data,
      projectId
    });
  },
  updateEventWorkflow: async (workflowId, data) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.EVENT_WORKFLOWS.UPDATE(workflowId)).build();
    return apiClient.patch(url, data);
  },
  updateEventWorkflowEnabled: async (workflowId, enabled) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.EVENT_WORKFLOWS.UPDATE_ENABLED(workflowId)).build();
    return apiClient.patch(url, { enabled });
  },
  deleteEventWorkflow: async (workflowId) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.EVENT_WORKFLOWS.DELETE(workflowId)).build();
    return apiClient.delete(url);
  }
};
const elementEventWorkflowService = {
  createElementEventWorkflow: async (data) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.CREATE).build();
    return apiClient.post(url, data);
  },
  getElementEventWorkflows: async () => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_ALL).build();
    return apiClient.get(url);
  },
  getElementEventWorkflowsByElement: async (elementId) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_ALL).addQueryParam("elementId", elementId).build();
    const response = await apiClient.get(url);
    if (response && typeof response === "object" && "data" in response) {
      return Array.isArray(response.data) ? response.data : [];
    }
    return Array.isArray(response) ? response : [];
  },
  getElementEventWorkflowsByPage: async (pageId) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_BY_PAGE(pageId)).build();
    const response = await apiClient.get(url);
    if (response && typeof response === "object" && "data" in response) {
      return Array.isArray(response.data) ? response.data : [];
    }
    return Array.isArray(response) ? response : [];
  },
  getElementEventWorkflowByID: async (id) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_BY_ID(id)).build();
    return apiClient.get(url);
  },
  updateElementEventWorkflow: async (id, data) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.UPDATE(id)).build();
    return apiClient.patch(url, data);
  },
  deleteElementEventWorkflow: async (id) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.DELETE(id)).build();
    return apiClient.delete(url);
  },
  deleteElementEventWorkflowsByElement: async (elementId) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_ALL).addQueryParam("elementId", elementId).build();
    return apiClient.delete(url);
  },
  deleteElementEventWorkflowsByWorkflow: async (workflowId) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_ALL).addQueryParam("workflowId", workflowId).build();
    return apiClient.delete(url);
  }
};
const eventWorkflowKeys = {
  all: ["eventWorkflows"],
  lists: () => [...eventWorkflowKeys.all, "list"],
  list: (projectId) => [...eventWorkflowKeys.lists(), projectId],
  details: () => [...eventWorkflowKeys.all, "detail"],
  detail: (workflowId) => [...eventWorkflowKeys.details(), workflowId]
};
function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}
function getUserRole(userId, collaborators) {
  if (!userId) return null;
  const collab = collaborators.find(
    (c) => c.userId === userId || c.user?.id === userId
  );
  return collab ? collab.role : null;
}
function useProjectPermissions(projectId, enabled = true) {
  const { userId, isLoaded } = useAuth();
  const { data: collaborators = [], isLoading } = useProjectCollaborators(
    projectId,
    enabled && isLoaded && !!userId && !!projectId
  );
  const role = getUserRole(userId, collaborators);
  const checkPermission = (permission) => role ? hasPermission(role, permission) : false;
  const checkAnyPermission = (permissions) => role ? permissions.some((p) => hasPermission(role, p)) : false;
  const checkAllPermissions = (permissions) => role ? permissions.every((p) => hasPermission(role, p)) : false;
  return {
    role,
    isOwner: role === CollaboratorRole.OWNER,
    isEditor: role === CollaboratorRole.EDITOR,
    isViewer: role === CollaboratorRole.VIEWER,
    isLoading: isLoading || !isLoaded,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    canEdit: checkPermission(Permission.PROJECT_EDIT),
    canView: checkPermission(Permission.PROJECT_VIEW),
    canDelete: checkPermission(Permission.PROJECT_DELETE),
    canManageCollaborators: checkPermission(Permission.COLLABORATOR_EDIT),
    canPublish: checkPermission(Permission.PROJECT_PUBLISH),
    canExport: checkPermission(Permission.EXPORT_CODE)
  };
}
const useElements = () => useElementStore((s) => s.elements);
const useUpdateElement = () => useElementStore((s) => s.updateElement);
const useAddElement = () => useElementStore((s) => s.addElement);
const useInsertElement = () => useElementStore((s) => s.insertElement);
const useSwapElement = () => useElementStore((s) => s.swapElement);
const useElementsWithActions = () => useElementStore(
  useShallow((s) => ({
    elements: s.elements,
    addElement: s.addElement,
    deleteElement: s.deleteElement,
    updateElement: s.updateElement,
    insertElement: s.insertElement,
    swapElement: s.swapElement
  }))
);
const useElementsWithLoad = () => useElementStore(
  useShallow((s) => ({
    elements: s.elements,
    loadElements: s.loadElements
  }))
);
const useSelectedElement = () => useSelectionStore((s) => s.selectedElement);
const useSetSelectedElement = () => useSelectionStore((s) => s.setSelectedElement);
const useSetDraggedOverElement = () => useSelectionStore((s) => s.setDraggedOverElement);
const useDragState = () => useSelectionStore(
  useShallow((s) => ({
    draggingElement: s.draggingElement,
    draggedOverElement: s.draggedOverElement
  }))
);
const useDragAndSelectionState = () => useSelectionStore(
  useShallow((s) => ({
    selectedElement: s.selectedElement,
    draggedOverElement: s.draggedOverElement,
    hoveredElement: s.hoveredElement
  }))
);
const useDragActions = () => useSelectionStore(
  useShallow((s) => ({
    setDraggingElement: s.setDraggingElement,
    setDraggedOverElement: s.setDraggedOverElement
  }))
);
const useSelectedElementWithSetter = () => useSelectionStore(
  useShallow((s) => ({
    selectedElement: s.selectedElement,
    setSelectedElement: s.setSelectedElement
  }))
);
const useFullDragContext = () => useSelectionStore(
  useShallow((s) => ({
    draggingElement: s.draggingElement,
    draggedOverElement: s.draggedOverElement,
    selectedElement: s.selectedElement,
    setSelectedElement: s.setSelectedElement,
    setDraggingElement: s.setDraggingElement,
    setDraggedOverElement: s.setDraggedOverElement,
    setHoveredElement: s.setHoveredElement
  }))
);
const useInteractionSelectionState = () => useSelectionStore(
  useShallow((s) => ({
    selectedElement: s.selectedElement,
    hoveredElement: s.hoveredElement,
    setSelectedElement: s.setSelectedElement,
    setHoveredElement: s.setHoveredElement
  }))
);
const directionalClasses = {
  n: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize",
  s: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize",
  e: "right-0 top-1/2 -translate-y-1/2 translate-x-1/2 cursor-e-resize",
  w: "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-w-resize",
  ne: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize",
  nw: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize",
  se: "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-se-resize",
  sw: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize",
  "margin-n": "top-0 left-1/2 -translate-x-1/2 -translate-y-full cursor-n-resize",
  "margin-s": "bottom-0 left-1/2 -translate-x-1/2 translate-y-full cursor-s-resize",
  "margin-e": "right-0 top-1/2 translate-x-full -translate-y-1/2 cursor-e-resize",
  "margin-w": "left-0 top-1/2 -translate-x-full -translate-y-1/2 cursor-w-resize",
  "padding-n": "top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 cursor-n-resize",
  "padding-s": "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 cursor-s-resize",
  "padding-e": "right-0 top-1/2 translate-x-1/3 -translate-y-1/2 cursor-e-resize",
  "padding-w": "left-0 top-1/2 -translate-x-1/3 -translate-y-1/2 cursor-w-resize",
  gap: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize"
};
function hasMargin(styles, prop) {
  const value = styles?.[prop];
  return value !== void 0 && value !== null && value !== "0" && value !== 0;
}
function hasPadding(styles, prop) {
  const value = styles?.[prop];
  return value !== void 0 && value !== null && value !== "0" && value !== 0;
}
function hasGap(styles) {
  const value = styles?.gap;
  return value !== void 0 && value !== null && value !== "0" && value !== 0;
}
function getResizeHandles(styles) {
  return [
    "n",
    "s",
    "e",
    "w",
    "ne",
    "nw",
    "se",
    "sw",
    ...hasMargin(styles, "marginTop") ? ["margin-n"] : [],
    ...hasMargin(styles, "marginBottom") ? ["margin-s"] : [],
    ...hasMargin(styles, "marginRight") ? ["margin-e"] : [],
    ...hasMargin(styles, "marginLeft") ? ["margin-w"] : [],
    ...hasPadding(styles, "paddingTop") ? ["padding-n"] : [],
    ...hasPadding(styles, "paddingBottom") ? ["padding-s"] : [],
    ...hasPadding(styles, "paddingRight") ? ["padding-e"] : [],
    ...hasPadding(styles, "paddingLeft") ? ["padding-w"] : [],
    ...hasGap(styles) ? ["gap"] : []
  ];
}
const EVENT_TYPES = {
  CLICK: "onClick",
  DOUBLE_CLICK: "onDoubleClick",
  MOUSE_ENTER: "onMouseEnter",
  MOUSE_LEAVE: "onMouseLeave",
  MOUSE_DOWN: "onMouseDown",
  MOUSE_UP: "onMouseUp",
  FOCUS: "onFocus",
  BLUR: "onBlur",
  CHANGE: "onChange",
  SUBMIT: "onSubmit",
  KEY_DOWN: "onKeyDown",
  KEY_UP: "onKeyUp",
  SCROLL: "onScroll",
  LOAD: "onLoad",
  ERROR: "onError"
};
const ACTION_TYPES = {
  NAVIGATE: "navigate",
  SHOW_ELEMENT: "showElement",
  HIDE_ELEMENT: "hideElement",
  TOGGLE_ELEMENT: "toggleElement",
  API_CALL: "apiCall",
  SET_DATA: "setData",
  CUSTOM_CODE: "customCode",
  SCROLL_TO: "scrollTo",
  MODAL: "modal",
  SUBMIT_FORM: "submitForm",
  RESET_FORM: "resetForm",
  PLAY_ANIMATION: "playAnimation",
  SHOW_NOTIFICATION: "showNotification",
  COPY_TO_CLIPBOARD: "copyToClipboard",
  DOWNLOAD_FILE: "downloadFile",
  TOGGLE_CLASS: "toggleClass",
  ADD_CLASS: "addClass",
  REMOVE_CLASS: "removeClass"
};
function createBaseElement(state, overrides = {}) {
  return {
    id: state.id,
    type: state.type,
    src: state.src,
    href: state.href,
    parentId: state.parentId && state.parentId !== "" ? state.parentId : void 0,
    pageId: state.pageId,
    content: "",
    styles: {},
    tailwindStyles: "",
    elements: [],
    settings: null,
    // Strategy defaults come first
    ...overrides,
    // Template values always win when explicitly provided
    ...state.content !== void 0 ? { content: state.content } : {},
    ...state.styles && Object.keys(state.styles).length > 0 ? { styles: state.styles } : {},
    ...state.tailwindStyles !== void 0 && state.tailwindStyles !== "" ? { tailwindStyles: state.tailwindStyles } : {}
  };
}
class TextElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "Text"
    });
  }
}
class SpanElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "Span text",
      styles: {
        default: {
          display: "inline"
        }
      }
    });
  }
}
class HeadingElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "Heading",
      settings: {
        level: 2
      },
      styles: {
        default: {
          fontSize: "24px",
          fontWeight: "700",
          lineHeight: "1.3",
          color: "var(--text-heading, #0f172a)"
        }
      },
      tailwindStyles: "text-2xl font-bold leading-tight text-slate-900 dark:text-white"
    });
  }
}
class LabelElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "Label",
      settings: {
        htmlFor: ""
      },
      styles: {
        default: {
          fontSize: "14px",
          fontWeight: "500",
          color: "var(--text-label, #374151)",
          display: "inline-block",
          marginBottom: "4px"
        }
      },
      tailwindStyles: "text-sm font-medium text-gray-700 dark:text-gray-300 inline-block mb-1"
    });
  }
}
class BlockquoteElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "Blockquote text goes here...",
      settings: {
        cite: ""
      },
      styles: {
        default: {
          borderLeft: "4px solid var(--color-primary, #2563eb)",
          padding: "12px 20px",
          margin: "16px 0",
          backgroundColor: "var(--bg-muted, #f8fafc)",
          fontStyle: "italic",
          fontSize: "16px",
          lineHeight: "1.6",
          color: "var(--text-secondary, #475569)",
          borderRadius: "0 8px 8px 0"
        }
      },
      tailwindStyles: "border-l-4 border-primary pl-5 py-3 my-4 bg-slate-50 dark:bg-slate-800/50 italic text-base text-slate-600 dark:text-slate-300 rounded-r-lg"
    });
  }
}
class CodeElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "// Your code here\nconsole.log('Hello, world!');",
      settings: {
        language: "javascript",
        preformatted: true
      },
      styles: {
        default: {
          fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
          fontSize: "13px",
          lineHeight: "1.6",
          backgroundColor: "var(--bg-code, #1e293b)",
          color: "var(--text-code, #e2e8f0)",
          padding: "16px 20px",
          borderRadius: "8px",
          overflow: "auto",
          whiteSpace: "pre",
          tabSize: 2
        }
      },
      tailwindStyles: "font-mono text-sm leading-relaxed bg-slate-800 text-slate-200 p-4 rounded-lg overflow-auto whitespace-pre"
    });
  }
}
class SeparatorElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "",
      styles: {
        default: {
          width: "100%",
          height: "1px",
          backgroundColor: "var(--border-color, #e2e8f0)",
          border: "none",
          margin: "16px 0"
        }
      },
      tailwindStyles: "w-full h-px bg-gray-200 dark:bg-slate-700 my-4 border-none"
    });
  }
}
class IconElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "",
      settings: {
        iconName: "star",
        size: 24,
        strokeWidth: 2,
        color: "currentColor",
        fill: "none",
        absoluteStrokeWidth: false
      },
      styles: {
        default: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-primary, #1e293b)"
        }
      },
      tailwindStyles: "inline-flex items-center justify-center text-slate-800 dark:text-slate-200"
    });
  }
}
class ImageElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: state.content ?? "Image",
      settings: {
        objectFit: "cover",
        loading: "lazy",
        decoding: "async"
      },
      styles: {
        default: {
          width: "100%",
          height: "auto",
          borderRadius: "8px",
          backgroundColor: "transparent"
        }
      },
      tailwindStyles: "w-full rounded-lg bg-transparent"
    });
  }
}
class VideoElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "Video",
      settings: {
        controls: true,
        autoplay: false,
        loop: false,
        muted: false,
        preload: "metadata",
        playsInline: true,
        objectFit: "contain"
      },
      styles: {
        default: {
          width: "100%",
          height: "auto",
          minHeight: "200px",
          borderRadius: "8px",
          backgroundColor: "var(--bg-surface, #000000)"
        }
      },
      tailwindStyles: "w-full rounded-lg bg-black"
    });
  }
}
class AudioElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "Audio",
      settings: {
        controls: true,
        autoplay: false,
        loop: false,
        muted: false,
        preload: "metadata"
      },
      styles: {
        default: {
          width: "100%",
          height: "54px",
          borderRadius: "28px"
        }
      },
      tailwindStyles: "w-full rounded-full"
    });
  }
}
class IFrameElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "Embedded content",
      settings: {
        sandbox: "allow-scripts allow-same-origin",
        loading: "lazy",
        width: "100%",
        height: 400
      },
      styles: {
        default: {
          width: "100%",
          height: "400px",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "8px",
          backgroundColor: "var(--bg-surface, #ffffff)"
        }
      },
      tailwindStyles: "w-full h-[400px] rounded-lg border border-gray-200 bg-white"
    });
  }
}
class ButtonElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "Click me",
      styles: {
        default: {
          minWidth: "96px",
          height: "44px",
          backgroundColor: "var(--color-primary, #2563eb)",
          color: "var(--color-on-primary, #ffffff)",
          border: "none",
          borderRadius: "10px",
          padding: "10px 18px",
          cursor: "pointer",
          fontSize: "15px",
          fontWeight: "600",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center"
        }
      },
      tailwindStyles: "inline-flex items-center justify-center min-w-[96px] h-11 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition"
    });
  }
}
class InputElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      settings: {
        type: "text",
        placeholder: "Enter text..."
      },
      styles: {
        default: {
          width: "100%",
          height: "44px",
          padding: "10px 14px",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: "8px",
          fontSize: "15px",
          backgroundColor: "var(--bg-input, #ffffff)"
        }
      },
      tailwindStyles: "w-full h-11 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition"
    });
  }
}
class TextareaElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "",
      settings: {
        placeholder: "Enter text...",
        rows: 4,
        resize: "vertical"
      },
      styles: {
        default: {
          width: "100%",
          minHeight: "100px",
          padding: "10px 14px",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: "8px",
          fontSize: "15px",
          backgroundColor: "var(--bg-input, #ffffff)",
          resize: "vertical",
          fontFamily: "inherit"
        }
      },
      tailwindStyles: "w-full min-h-[100px] px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition"
    });
  }
}
class CheckboxElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "Checkbox label",
      settings: {
        name: "",
        checked: false,
        defaultChecked: false,
        required: false,
        disabled: false,
        value: "",
        label: "Checkbox label"
      },
      styles: {
        default: {
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          fontSize: "14px",
          color: "var(--text-primary, #1e293b)"
        }
      },
      tailwindStyles: "inline-flex items-center gap-2 cursor-pointer text-sm text-slate-800 dark:text-slate-200"
    });
  }
}
class RadioElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "Radio label",
      settings: {
        name: "",
        checked: false,
        defaultChecked: false,
        required: false,
        disabled: false,
        value: "",
        label: "Radio label"
      },
      styles: {
        default: {
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          fontSize: "14px",
          color: "var(--text-primary, #1e293b)"
        }
      },
      tailwindStyles: "inline-flex items-center gap-2 cursor-pointer text-sm text-slate-800 dark:text-slate-200"
    });
  }
}
class ProgressElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "",
      settings: {
        value: 50,
        max: 100,
        indeterminate: false,
        label: "Progress"
      },
      styles: {
        default: {
          width: "100%",
          height: "8px",
          borderRadius: "9999px",
          backgroundColor: "var(--bg-muted, #e2e8f0)",
          overflow: "hidden"
        }
      },
      tailwindStyles: "w-full h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden"
    });
  }
}
class SelectElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      styles: {
        default: {
          width: "100%",
          height: "44px",
          padding: "10px 12px",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "8px",
          fontSize: "15px",
          backgroundColor: "var(--bg-input, #ffffff)",
          cursor: "pointer"
        }
      },
      tailwindStyles: "w-full h-11 rounded-lg border border-gray-200 bg-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
    });
  }
}
class ListElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      styles: {
        default: {
          width: state.styles?.default?.width ?? "100%",
          minHeight: "160px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "8px",
          padding: "12px"
        }
      },
      tailwindStyles: "w-full rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
    });
  }
}
class FormElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      settings: {
        method: "post",
        action: "",
        autoComplete: "on",
        encType: "application/x-www-form-urlencoded",
        target: "_self",
        validateOnSubmit: false,
        redirectUrl: ""
      },
      styles: {
        default: {
          width: "100%",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "12px",
          padding: "24px"
        }
      },
      tailwindStyles: "w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    });
  }
}
class TableElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      content: "",
      settings: {
        caption: "",
        bordered: true,
        striped: false,
        hoverable: true,
        compact: false,
        columns: [
          { id: "col-1", header: "Column 1", align: "left" },
          { id: "col-2", header: "Column 2", align: "left" },
          { id: "col-3", header: "Column 3", align: "left" }
        ]
      },
      styles: {
        default: {
          width: "100%",
          minHeight: "120px",
          borderCollapse: "collapse",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: "8px",
          overflow: "hidden",
          fontSize: "14px",
          backgroundColor: "var(--bg-surface, #ffffff)"
        }
      },
      tailwindStyles: "w-full min-h-[120px] border-collapse rounded-lg border border-gray-200 bg-white text-sm overflow-hidden"
    });
  }
}
class FrameElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      styles: {
        default: {
          minHeight: "160px",
          width: "100%",
          margin: "0 auto",
          backgroundColor: "var(--bg-surface, #ffffff)",
          borderRadius: "8px",
          padding: "16px"
        }
      },
      tailwindStyles: "w-full mx-auto rounded-lg p-4 bg-white dark:bg-slate-800"
    });
  }
}
class SectionElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      styles: {
        default: {
          width: "100%",
          minHeight: "220px",
          backgroundColor: "var(--bg-surface)",
          padding: "32px 24px"
        }
      },
      tailwindStyles: "w-full min-h-[220px] py-8 px-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800"
    });
  }
}
class NavElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      styles: {
        default: {
          width: "100%",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          borderBottom: "1px solid rgba(15,23,42,0.06)"
        }
      },
      tailwindStyles: "w-full min-h-[60px] flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800"
    });
  }
}
class HeaderElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      styles: {
        default: {
          width: "100%",
          minHeight: "80px",
          padding: "24px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          borderBottom: "1px solid rgba(15,23,42,0.06)"
        }
      },
      tailwindStyles: "w-full min-h-[80px] p-6 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800"
    });
  }
}
class FooterElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      styles: {
        default: {
          width: "100%",
          minHeight: "80px",
          padding: "24px",
          backgroundColor: "var(--bg-surface, #f8fafc)",
          borderTop: "1px solid rgba(15,23,42,0.06)"
        }
      },
      tailwindStyles: "w-full min-h-[80px] p-6 bg-slate-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800"
    });
  }
}
class ArticleElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      styles: {
        default: {
          width: "100%",
          minHeight: "200px",
          padding: "24px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "12px"
        }
      },
      tailwindStyles: "w-full min-h-[200px] p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl"
    });
  }
}
class AsideElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      styles: {
        default: {
          width: "100%",
          minHeight: "160px",
          padding: "20px",
          backgroundColor: "var(--bg-muted, #f8fafc)",
          borderLeft: "3px solid var(--color-primary, #2563eb)",
          borderRadius: "0 8px 8px 0"
        }
      },
      tailwindStyles: "w-full min-h-[160px] p-5 bg-slate-50 dark:bg-slate-800/50 border-l-[3px] border-primary rounded-r-lg"
    });
  }
}
class CarouselElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      settings: {
        autoplay: true
      },
      styles: {
        default: {
          width: "100%",
          height: "360px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "12px",
          padding: "16px",
          overflow: "hidden"
        }
      },
      tailwindStyles: "w-full h-90 md:h-[360px] rounded-xl border border-gray-200 bg-white p-4 shadow-md overflow-hidden"
    });
  }
}
class CMSContentListElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      settings: {
        contentTypeId: "",
        displayMode: "list",
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc"
      },
      styles: {
        default: {
          width: "100%",
          minHeight: "200px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "8px",
          padding: "16px"
        }
      },
      tailwindStyles: "w-full min-h-[200px] rounded-lg p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm"
    });
  }
}
class CMSContentItemElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      settings: {
        contentTypeId: "",
        itemSlug: ""
      },
      styles: {
        default: {
          width: "100%",
          minHeight: "300px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "8px",
          padding: "24px"
        }
      },
      tailwindStyles: "w-full min-h-[300px] rounded-lg p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm"
    });
  }
}
class CMSContentGridElementCreateStrategy {
  buildElement(state) {
    return createBaseElement(state, {
      settings: {
        contentTypeId: "",
        displayMode: "grid",
        limit: 6,
        sortBy: "createdAt",
        sortOrder: "desc",
        fieldsToShow: ["title", "content"]
      },
      styles: {
        default: {
          width: "100%",
          minHeight: "400px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "8px",
          padding: "16px"
        }
      },
      tailwindStyles: "w-full min-h-[400px] rounded-lg p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm"
    });
  }
}
const ElementStrategyMap = /* @__PURE__ */ new Map([
  // Inline / Leaf
  ["Text", new TextElementCreateStrategy()],
  ["Span", new SpanElementCreateStrategy()],
  ["Heading", new HeadingElementCreateStrategy()],
  ["Label", new LabelElementCreateStrategy()],
  ["Blockquote", new BlockquoteElementCreateStrategy()],
  ["Code", new CodeElementCreateStrategy()],
  ["Separator", new SeparatorElementCreateStrategy()],
  ["Icon", new IconElementCreateStrategy()],
  // Media
  ["Image", new ImageElementCreateStrategy()],
  ["Video", new VideoElementCreateStrategy()],
  ["Audio", new AudioElementCreateStrategy()],
  ["IFrame", new IFrameElementCreateStrategy()],
  // Interactive
  ["Button", new ButtonElementCreateStrategy()],
  // Form
  ["Input", new InputElementCreateStrategy()],
  ["Textarea", new TextareaElementCreateStrategy()],
  ["Checkbox", new CheckboxElementCreateStrategy()],
  ["Radio", new RadioElementCreateStrategy()],
  ["Progress", new ProgressElementCreateStrategy()],
  ["List", new ListElementCreateStrategy()],
  ["Select", new SelectElementCreateStrategy()],
  ["Form", new FormElementCreateStrategy()],
  // Table
  ["Table", new TableElementCreateStrategy()],
  // Container / Layout
  ["Frame", new FrameElementCreateStrategy()],
  ["Section", new SectionElementCreateStrategy()],
  ["Nav", new NavElementCreateStrategy()],
  ["Header", new HeaderElementCreateStrategy()],
  ["Footer", new FooterElementCreateStrategy()],
  ["Article", new ArticleElementCreateStrategy()],
  ["Aside", new AsideElementCreateStrategy()],
  // Carousel
  ["Carousel", new CarouselElementCreateStrategy()],
  // CMS
  ["CMSContentList", new CMSContentListElementCreateStrategy()],
  ["CMSContentItem", new CMSContentItemElementCreateStrategy()],
  ["CMSContentGrid", new CMSContentGridElementCreateStrategy()]
]);
const getElementStrategy = (type) => {
  const strategy = ElementStrategyMap.get(type);
  if (!strategy) {
    throw new Error(`No strategy found for element type: ${type}`);
  }
  return strategy;
};
class ElementFactoryError extends Error {
  constructor(message, code, context) {
    super(message);
    this.code = code;
    this.context = context;
    this.name = "ElementFactoryError";
  }
}
class ElementFactory {
  constructor() {
  }
  /**
   * Returns the singleton {@link ElementFactory} instance.
   *
   * The instance is created lazily on first access.
   */
  static getInstance() {
    if (!ElementFactory.instance) {
      ElementFactory.instance = new ElementFactory();
    }
    return ElementFactory.instance;
  }
  generateId() {
    return v4();
  }
  isContainerTemplate(t) {
    return t.hasOwnProperty("elements");
  }
  validatePageId(pageId) {
    if (!pageId || pageId.trim() === "") {
      throw new ElementFactoryError(
        "pageId is required and must not be empty",
        "MISSING_PAGE_ID"
      );
    }
  }
  buildWithStrategy(options) {
    try {
      const strategy = getElementStrategy(options.type);
      const built = strategy.buildElement(options);
      if (!built) {
        throw new ElementFactoryError(
          `Strategy returned null for element type "${options.type}"`,
          "STRATEGY_FAILED",
          { type: options.type, id: options.id }
        );
      }
      return built;
    } catch (error) {
      if (error instanceof ElementFactoryError) {
        throw error;
      }
      throw new ElementFactoryError(
        `Failed to build element for type "${options.type}": ${error instanceof Error ? error.message : "Unknown error"}`,
        "BUILD_FAILED",
        { type: options.type, originalError: error }
      );
    }
  }
  createBuilderState({
    id,
    type,
    pageId,
    parentId,
    styles,
    tailwindStyles,
    src,
    href,
    content
  }) {
    return {
      id,
      type,
      pageId,
      src: src ?? void 0,
      parentId: parentId && parentId !== "" ? parentId : void 0,
      styles: styles ?? {},
      tailwindStyles: tailwindStyles ?? void 0,
      href: href ?? void 0,
      content: content ?? void 0
    };
  }
  mergeSettings(strategySettings, templateSettings) {
    if (!templateSettings) {
      return strategySettings;
    }
    if (typeof strategySettings === "object" && strategySettings !== null && typeof templateSettings === "object" && templateSettings !== null) {
      return { ...strategySettings, ...templateSettings };
    }
    return templateSettings ?? strategySettings;
  }
  /**
   * Create a new element of the specified type with sensible defaults.
   *
   * The created element is automatically set as the selected element in the
   * global {@link SelectionStore}.
   *
   * @typeParam T - The element type literal (e.g. `"Button"`, `"Section"`).
   * @param params - Creation parameters (type, pageId, optional parentId).
   * @returns The newly created element narrowed to `ElementByType<T>`, or
   *          `undefined` if creation failed.
   *
   * @example
   * ```ts
   * const input = ElementFactory.getInstance().createElement({
   *   type: "Input",
   *   pageId: "page-1",
   *   parentId: "form-abc",
   * });
   * ```
   */
  createElement(params) {
    const { type, pageId, parentId } = params;
    const id = this.generateId();
    try {
      this.validatePageId(pageId);
      const state = this.createBuilderState({
        id,
        type,
        pageId,
        parentId
      });
      const newElement = this.buildWithStrategy(state);
      SelectionStore.getState().setSelectedElement(
        newElement
      );
      return newElement;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(
        `[ElementFactory.createElement] Failed to create element of type "${type}": ${message}`,
        { type, pageId, parentId, originalError: error }
      );
      return void 0;
    }
  }
  /**
   * Recursively create an element tree from a template definition.
   *
   * Each node in the template receives a fresh UUID. Container templates
   * have their `elements` array recursively instantiated as well. Template
   * `settings` are merged on top of the strategy defaults.
   *
   * The root element is automatically set as the selected element in the
   * global {@link SelectionStore}.
   *
   * @typeParam T - Optional narrowed return type (defaults to `EditorElement`).
   * @param params - Template and target pageId.
   * @returns The fully instantiated root element, or `undefined` on failure.
   *
   * @example
   * ```ts
   * const card = ElementFactory.getInstance().createElementFromTemplate({
   *   element: cardTemplate,
   *   pageId: "page-1",
   * });
   * ```
   */
  createElementFromTemplate(params) {
    const { element: rootTemplate, pageId } = params;
    try {
      this.validatePageId(pageId);
      const recursivelyCreate = (tmpl, parentId) => {
        const id = this.generateId();
        const state = this.createBuilderState({
          id,
          type: tmpl.type,
          pageId,
          parentId,
          styles: tmpl.styles,
          tailwindStyles: tmpl.tailwindStyles,
          src: tmpl.src,
          href: tmpl.href,
          content: tmpl.content
        });
        const base = this.buildWithStrategy(state);
        if (this.isContainerTemplate(tmpl)) {
          const children = tmpl.elements ?? [];
          const createdChildren = children.map(
            (child) => recursivelyCreate(child, id)
          );
          base.elements = createdChildren;
        }
        if (tmpl.settings) {
          base.settings = this.mergeSettings(
            base.settings,
            tmpl.settings
          );
        }
        return base;
      };
      const root = recursivelyCreate(rootTemplate, void 0);
      SelectionStore.getState().setSelectedElement(root);
      return root;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(
        "[ElementFactory.createElementFromTemplate] Failed to create element from template:",
        { pageId, originalError: error, message }
      );
      return void 0;
    }
  }
}
function useEditorPermissions(projectId, enabled = true) {
  const { id } = useParams({ strict: false });
  const effectiveProjectId = projectId || id;
  const perms = useProjectPermissions(
    effectiveProjectId,
    enabled
  );
  const hasPermission2 = useCallback(
    (permission) => {
      return perms.hasPermission(permission);
    },
    [perms]
  );
  const can = useCallback(
    (action, resource) => {
      const permissionKey = `${resource}:${action}`;
      return hasPermission2(permissionKey);
    },
    [hasPermission2]
  );
  const editorPermissions = useMemo(
    () => ({
      // Core states
      role: perms.role,
      isLoading: perms.isLoading,
      // Element operations
      canCreateElements: hasPermission2(Permission.ELEMENT_CREATE),
      canEditElements: hasPermission2(Permission.ELEMENT_EDIT),
      canDeleteElements: hasPermission2(Permission.ELEMENT_DELETE),
      canReorderElements: hasPermission2(Permission.ELEMENT_REORDER),
      // Page operations
      canCreatePages: hasPermission2(Permission.PAGE_CREATE),
      canEditPages: hasPermission2(Permission.PAGE_EDIT),
      canDeletePages: hasPermission2(Permission.PAGE_DELETE),
      // Project operations
      canEditProject: hasPermission2(Permission.PROJECT_EDIT),
      canDeleteProject: hasPermission2(Permission.PROJECT_DELETE),
      canPublishProject: hasPermission2(Permission.PROJECT_PUBLISH),
      canExportProject: hasPermission2(Permission.EXPORT_CODE),
      canAccessSettings: hasPermission2(Permission.PROJECT_SETTINGS),
      // Collaboration
      canInviteCollaborators: hasPermission2(Permission.COLLABORATOR_INVITE),
      canManageCollaborators: hasPermission2(Permission.COLLABORATOR_EDIT),
      // Comments
      canCreateComments: hasPermission2(Permission.COMMENT_CREATE),
      canEditComments: perms.hasAnyPermission([
        Permission.COMMENT_EDIT_OWN,
        Permission.COMMENT_EDIT_ALL
      ]),
      canDeleteComments: perms.hasAnyPermission([
        Permission.COMMENT_DELETE_OWN,
        Permission.COMMENT_DELETE_ALL
      ]),
      canResolveComments: hasPermission2(Permission.COMMENT_RESOLVE),
      // Snapshots
      canCreateSnapshots: hasPermission2(Permission.SNAPSHOT_CREATE),
      canRestoreSnapshots: hasPermission2(Permission.SNAPSHOT_RESTORE),
      canDeleteSnapshots: hasPermission2(Permission.SNAPSHOT_DELETE),
      // CMS
      canEditCMS: hasPermission2(Permission.CMS_EDIT),
      canPublishCMS: hasPermission2(Permission.CMS_PUBLISH),
      // Generic checkers
      hasPermission: hasPermission2,
      can
    }),
    [perms, hasPermission2, can]
  );
  return editorPermissions;
}
function useElementCreator() {
  const addElement = useAddElement();
  const setSelectedElement = useSetSelectedElement();
  const setDraggedOverElement = useSetDraggedOverElement();
  const params = useParams({ strict: false });
  const search = useSearch({ strict: false });
  const pageId = search.page ?? "";
  const projectId = params?.id;
  const permissions = useEditorPermissions(projectId ?? null);
  const canCreate = permissions.canCreateElements;
  const createElementFromType = (type, parentId) => {
    return ElementFactory.getInstance().createElement({
      type,
      pageId,
      parentId
    });
  };
  const handleImageDrop = (parsed, parentElement) => {
    const isContainer = elementHelper.isContainerElement(parentElement);
    if (!isContainer) {
      return null;
    }
    const newElement = createElementFromType("Image", parentElement.id);
    if (newElement) {
      newElement.src = parsed.imageLink;
      newElement.name = parsed.imageName || "Image";
    }
    return newElement || null;
  };
  const createElementFromDrop = (e, parentElement) => {
    const data = e.dataTransfer.getData("elementType");
    if (data) {
      if (!permissions.canCreateElements) {
        showErrorToast(PERMISSION_ERRORS.cannotAdd);
        return null;
      }
      const isContainer = elementHelper.isContainerElement(parentElement);
      if (!isContainer) {
        return null;
      }
      const newElement = createElementFromType(
        data,
        parentElement.id
      );
      return newElement || null;
    }
    const imageData = e.dataTransfer.getData("application/json");
    if (imageData) {
      try {
        const parsed = JSON.parse(imageData);
        if (typeof parsed === "object" && parsed !== null && "type" in parsed && parsed.type === "image") {
          if (!permissions.canCreateElements) {
            showErrorToast(PERMISSION_ERRORS.cannotAdd);
            return null;
          }
          return handleImageDrop(parsed, parentElement);
        }
      } catch {
      }
    }
    return null;
  };
  const completeElementCreation = (newElement) => {
    addElement(newElement);
    setSelectedElement(newElement);
    setDraggedOverElement(void 0);
  };
  return {
    createElementFromType,
    handleImageDrop,
    createElementFromDrop,
    completeElementCreation,
    canCreate
  };
}
function useElementDnD({
  projectId = null,
  isReadOnly = false,
  isLocked = false
} = {}) {
  const permissions = useEditorPermissions(projectId);
  const elementCreator = useElementCreator();
  const swapElement = useSwapElement();
  const {
    selectedElement,
    setSelectedElement,
    setDraggingElement,
    draggingElement,
    draggedOverElement,
    setDraggedOverElement,
    setHoveredElement
  } = useFullDragContext();
  const canDrag = !isReadOnly && !isLocked && permissions.canEditElements;
  const canReorder = !isReadOnly && !isLocked && permissions.canReorderElements;
  const handleDrop = useCallback(
    (e, parentElement) => {
      e.stopPropagation();
      e.preventDefault();
      if (!canDrag && !elementCreator.canCreate && !canReorder) {
        showErrorToast(PERMISSION_ERRORS.cannotPerformAction);
        return;
      }
      setSelectedElement(void 0);
      if (draggingElement) {
        if (!canReorder) {
          showErrorToast(PERMISSION_ERRORS.cannotReorder);
          return;
        }
        swapElement(draggingElement.id, parentElement.id);
        setDraggedOverElement(void 0);
      } else {
        const newElement = elementCreator.createElementFromDrop(
          e,
          parentElement
        );
        if (newElement) {
          elementCreator.completeElementCreation(newElement);
        }
      }
      setHoveredElement(void 0);
      setDraggingElement(void 0);
    },
    [
      canDrag,
      canReorder,
      elementCreator,
      draggingElement,
      setDraggedOverElement,
      setDraggingElement,
      setHoveredElement,
      setSelectedElement,
      swapElement
    ]
  );
  const handleDragStart = useCallback(
    (e, element) => {
      e.stopPropagation();
      if (!canDrag) {
        e.preventDefault();
        return;
      }
      setDraggingElement(element);
    },
    [canDrag, setDraggingElement]
  );
  const handleDragOver = useCallback(
    (e, element) => {
      e.preventDefault();
      e.stopPropagation();
      if (!canDrag) {
        return;
      }
      if (draggingElement?.id === element.id || draggingElement?.parentId === element.id)
        return;
      if (!elementHelper.isContainerElement(element)) return;
      setDraggedOverElement(element);
    },
    [canDrag, draggingElement, setDraggedOverElement]
  );
  const handleDragLeave = useCallback(
    (e, element) => {
      e.stopPropagation();
      if (draggedOverElement?.id === element.id) {
        setDraggedOverElement(void 0);
      }
    },
    [draggedOverElement, setDraggedOverElement]
  );
  const handleDragEnd = useCallback(
    (e) => {
      e.stopPropagation();
      setDraggingElement(void 0);
      setDraggedOverElement(void 0);
    },
    [setDraggedOverElement, setDraggingElement]
  );
  return {
    handleDrop,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    canDrag,
    canReorder,
    canCreate: elementCreator.canCreate
  };
}
function useElementInteraction({
  isReadOnly = false,
  isLocked = false,
  projectId = null
} = {}) {
  const updateElement = useUpdateElement();
  const {
    hoveredElement,
    selectedElement,
    setSelectedElement,
    setHoveredElement
  } = useInteractionSelectionState();
  const permissions = useEditorPermissions(projectId ?? null);
  const canDelete = !isReadOnly && !isLocked && permissions.canDeleteElements;
  const canEdit = !isReadOnly && !isLocked && permissions.canEditElements;
  const canDrag = !isReadOnly && !isLocked && permissions.canEditElements;
  const handleDoubleClick = useCallback(
    (e, element) => {
      e.preventDefault();
      e.stopPropagation();
      if (!permissions.canEditElements) {
        showErrorToast(PERMISSION_ERRORS.cannotEdit);
        return;
      }
      if (selectedElement && selectedElement.id === element.id) {
        setSelectedElement(void 0);
        return;
      }
      setSelectedElement(element);
    },
    [permissions, selectedElement, setSelectedElement]
  );
  const handleMouseEnter = useCallback(
    (e, element) => {
      if (selectedElement && elementHelper.isEditableElement(selectedElement) && document.activeElement?.contentEditable === "true") {
        return;
      }
      setHoveredElement(element);
      e.stopPropagation();
    },
    [selectedElement, setHoveredElement]
  );
  const handleMouseLeave = useCallback(
    (e, element) => {
      if (selectedElement && elementHelper.isEditableElement(selectedElement) && document.activeElement?.contentEditable === "true") {
        return;
      }
      if (hoveredElement?.id === element.id) {
        setHoveredElement(void 0);
      }
    },
    [hoveredElement, selectedElement, setHoveredElement]
  );
  const handleTextChange = useCallback(
    (e, element) => {
      e.stopPropagation();
      e.preventDefault();
      if (!elementHelper.isEditableElement(element)) {
        return;
      }
      if (!permissions.canEditElements) {
        showErrorToast(PERMISSION_ERRORS.cannotEdit);
        return;
      }
      updateElement(element.id, {
        content: e.currentTarget.textContent || ""
      });
    },
    [permissions, updateElement]
  );
  const getTailwindStyles = useCallback((element) => {
    return cn("", element.tailwindStyles);
  }, []);
  const getStyles = useCallback(
    (element) => {
      if (!element.styles || typeof element.styles !== "object" || Array.isArray(element.styles)) {
        return {};
      }
      const merged = {};
      const styles = element.styles;
      const breakpoints = ["default", "sm", "md", "lg", "xl"];
      for (const bp of breakpoints) {
        if (styles[bp]) {
          Object.assign(merged, styles[bp]);
        }
      }
      return merged;
    },
    []
  );
  const getEventHandlers = useCallback(
    (element, dndHandlers = {}) => {
      const isEditableElement = elementHelper.isEditableElement(element);
      return {
        onDragStart: (e) => dndHandlers.onDragStart?.(e),
        onDragLeave: (e) => dndHandlers.onDragLeave?.(e),
        onDragEnd: (e) => dndHandlers.onDragEnd?.(e),
        onDragOver: (e) => dndHandlers.onDragOver?.(e),
        // Do not allow drop on editable elements
        onDrop: isEditableElement ? void 0 : (e) => dndHandlers.onDrop?.(e),
        onDoubleClick: (e) => handleDoubleClick(e, element),
        onMouseEnter: (e) => handleMouseEnter(e, element),
        onMouseLeave: (e) => handleMouseLeave(e, element),
        onBlur: (e) => handleTextChange(e, element)
      };
    },
    [handleDoubleClick, handleMouseEnter, handleMouseLeave, handleTextChange]
  );
  const getCommonProps = useCallback(
    (element, dndHandlers) => {
      const tailwindStyles = getTailwindStyles(element);
      const mergedStyles = getStyles(element);
      const eventHandlers = getEventHandlers(element, dndHandlers);
      return {
        style: mergedStyles,
        draggable: canDrag,
        className: tailwindStyles,
        contentEditable: elementHelper.isEditableElement(element) && selectedElement?.id === element.id && permissions.canEditElements,
        suppressContentEditableWarning: true,
        ...eventHandlers
      };
    },
    [
      canDrag,
      getEventHandlers,
      getStyles,
      getTailwindStyles,
      permissions,
      selectedElement
    ]
  );
  return {
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleTextChange,
    getTailwindStyles,
    getStyles,
    getEventHandlers,
    getCommonProps,
    canDelete,
    canEdit,
    canDrag
  };
}
function useElementHandler(isReadOnly, isLocked) {
  useElementCreator();
  const dnd = useElementDnD({ isReadOnly, isLocked });
  const interaction = useElementInteraction({ isReadOnly, isLocked });
  const {
    handleDrop,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    canDrag,
    canReorder,
    canCreate: dndCanCreate
  } = dnd;
  const {
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
    getTailwindStyles,
    getCommonProps,
    getStyles,
    canDelete
  } = interaction;
  return {
    handleDoubleClick,
    handleDrop,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleMouseEnter,
    handleMouseLeave,
    getTailwindStyles,
    getCommonProps,
    getStyles,
    // Export permission states for UI purposes
    canDrag,
    canDelete,
    canReorder,
    canCreate: dndCanCreate
  };
}
function useElementDragHandlers({
  elements,
  isReadOnly = false,
  isLocked = false,
  projectId = null
} = {}) {
  const params = useParams({ strict: false });
  const routeId = params?.id;
  const effectiveProjectId = projectId ?? routeId ?? null;
  const permissions = useEditorPermissions(effectiveProjectId);
  const { draggedOverElement, draggingElement } = useDragState();
  const { setDraggingElement, setDraggedOverElement } = useDragActions();
  const allElements = useElements();
  const insertElement = useInsertElement();
  const swapElement = useSwapElement();
  const addElement = useAddElement();
  const elementCreator = useElementCreator();
  const items = useMemo(() => elements ?? allElements, [elements, allElements]);
  const [isDraggingLocal, setIsDraggingLocal] = useState(null);
  const canDrag = !isReadOnly && !isLocked && !!permissions?.canEditElements;
  const canCreate = !isReadOnly && !isLocked && !!permissions?.canCreateElements;
  const resetDragState = useCallback(() => {
    setDraggedOverElement(void 0);
    setDraggingElement(void 0);
    setIsDraggingLocal(null);
  }, [setDraggedOverElement, setDraggingElement]);
  const handleHover = useCallback(
    (e, element) => {
      e.preventDefault();
      e.stopPropagation();
      if (!canDrag) return;
      const isCreating = Boolean(
        e.dataTransfer.getData("elementType") || e.dataTransfer.getData("customComponentName") || e.dataTransfer.getData("application/json")
      );
      if (isCreating && !elementHelper.isContainerElement(element)) return;
      if (draggedOverElement?.id !== element.id) {
        setDraggedOverElement(element);
      }
    },
    [canDrag, draggedOverElement, setDraggedOverElement]
  );
  const handleDragStart = useCallback(
    (e, element) => {
      if (!canDrag) {
        e.preventDefault();
        return;
      }
      setIsDraggingLocal(element.id);
      setDraggingElement(element);
      try {
        e.dataTransfer.setData("elementId", element.id);
        e.dataTransfer.effectAllowed = "move";
      } catch (err) {
        console.warn("Failed to set drag data:", err);
      }
    },
    [canDrag, setIsDraggingLocal, setDraggingElement]
  );
  const handleDragEnd = useCallback(() => {
    resetDragState();
  }, [resetDragState]);
  const handleDrop = useCallback(
    (e, element) => {
      e.preventDefault();
      e.stopPropagation();
      if (!canDrag && !canCreate) {
        showErrorToast(PERMISSION_ERRORS.cannotPerformAction);
        resetDragState();
        return;
      }
      const elementType = e.dataTransfer.getData("elementType");
      const customElement = e.dataTransfer.getData("customComponentName");
      const draggedElementId = e.dataTransfer.getData("elementId");
      if (draggedElementId && draggingElement) {
        if (draggedElementId !== element.id) {
          swapElement(draggedElementId, element.id);
          showSuccessToast("Elements swapped successfully");
        }
        resetDragState();
        return;
      }
      if (elementType) {
        if (!canCreate) {
          showErrorToast(PERMISSION_ERRORS.cannotAdd);
          resetDragState();
          return;
        }
        const isContainer = elementHelper.isContainerElement(element);
        if (isContainer) {
          const newElement = elementCreator.createElementFromDrop(e, element);
          if (newElement) {
            elementCreator.completeElementCreation(newElement);
          }
        } else {
          const newElement = ElementFactory.getInstance().createElement({
            type: elementType,
            pageId: element.pageId
          });
          if (newElement) insertElement(element, newElement);
        }
        resetDragState();
        return;
      }
      if (customElement) {
        try {
          if (!canCreate) {
            showErrorToast(PERMISSION_ERRORS.cannotAdd);
            resetDragState();
            return;
          }
          const compIndex = parseInt(customElement, 10);
          const customComp = customComps[compIndex];
          const newElement = ElementFactory.getInstance().createElementFromTemplate({
            element: customComp,
            pageId: element.pageId
          });
          if (newElement) {
            if (elementHelper.isContainerElement(element)) {
              newElement.parentId = element.id;
              addElement(newElement);
            } else {
              insertElement(element, newElement);
            }
          }
        } catch (error) {
          console.warn("Failed to create custom element from template", error);
        }
        resetDragState();
        return;
      }
      resetDragState();
    },
    [
      canDrag,
      canCreate,
      draggingElement,
      insertElement,
      resetDragState,
      swapElement,
      elementCreator,
      addElement
    ]
  );
  const handleReorder = useCallback(
    (newOrder) => {
      if (!canDrag) return;
      const currentIds = items?.map((e) => e.id) || [];
      const newIds = newOrder.map((e) => e.id);
      for (let i = 0; i < currentIds.length; i++) {
        if (currentIds[i] !== newIds[i]) {
          const originalIndex = newIds.indexOf(currentIds[i]);
          if (originalIndex !== -1 && originalIndex !== i) {
            swapElement(currentIds[i], newIds[i]);
            break;
          }
        }
      }
    },
    [canDrag, items, swapElement]
  );
  return {
    items,
    draggedOverElement,
    draggingElement,
    isDraggingLocal,
    canDrag,
    canCreate,
    permissions,
    resetDragState,
    handleHover,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleReorder
  };
}
const RESIZE_DOM_PROPS = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "gap",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight"
]);
function applyStylesToDom(el, styles) {
  const s = styles.default ?? {};
  for (const [prop, val] of Object.entries(s)) {
    if (RESIZE_DOM_PROPS.has(prop) && val !== void 0) {
      el.style[prop] = String(val);
    }
  }
}
const MIN_SIZE = 20;
const MAX_PERCENT = 100;
function parseDirection(direction) {
  if (direction === "gap") {
    return {
      isNorth: false,
      isSouth: false,
      isEast: false,
      isWest: false,
      isSpecial: true,
      specialType: "gap"
    };
  }
  if (direction.startsWith("padding-")) {
    const side = direction.split("-")[1];
    return {
      isNorth: false,
      isSouth: false,
      isEast: false,
      isWest: false,
      isSpecial: true,
      specialType: "padding",
      specialSide: side
    };
  }
  if (direction.startsWith("margin-")) {
    const side = direction.split("-")[1];
    return {
      isNorth: false,
      isSouth: false,
      isEast: false,
      isWest: false,
      isSpecial: true,
      specialType: "margin",
      specialSide: side
    };
  }
  const normalized = direction.toLowerCase().replace(/[-_]/g, "");
  return {
    isNorth: normalized.includes("n"),
    isSouth: normalized.includes("s"),
    isEast: normalized.includes("e"),
    isWest: normalized.includes("w"),
    isSpecial: false
  };
}
function directionToCursor(direction) {
  if (direction === "gap") return "ns-resize";
  if (direction.startsWith("padding-") || direction.startsWith("margin-"))
    return "move";
  const cursorMap = {
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
    ne: "nesw-resize",
    nw: "nwse-resize",
    se: "nwse-resize",
    sw: "nesw-resize"
  };
  return cursorMap[direction.replace(/[-_]/g, "").toLowerCase()] ?? "default";
}
function computeSpecialStyles(state, element, clientX, clientY) {
  const { directionFlags, startPos, initialStyles } = state;
  const initialDefault = initialStyles.default ?? {};
  if (directionFlags.specialType === "gap") {
    const initialGap = parseInt(String(initialDefault.gap ?? "0"), 10);
    return {
      ...element.styles,
      default: {
        ...element.styles?.default,
        gap: `${Math.max(0, initialGap + (clientY - startPos.y))}px`
      }
    };
  }
  if ((directionFlags.specialType === "padding" || directionFlags.specialType === "margin") && directionFlags.specialSide) {
    const { specialType: type, specialSide: side } = directionFlags;
    const sideMap = { n: "Top", s: "Bottom", e: "Right", w: "Left" };
    const propName = `${type}${sideMap[side]}`;
    const deltaMap = {
      n: startPos.y - clientY,
      s: clientY - startPos.y,
      e: clientX - startPos.x,
      w: startPos.x - clientX
    };
    const initialValue = parseInt(String(initialDefault[propName] ?? "0"), 10);
    const newValue = Math.max(0, initialValue + deltaMap[side]);
    return {
      ...element.styles,
      default: { ...element.styles?.default, [propName]: `${newValue}px` }
    };
  }
  return element.styles ?? { default: {} };
}
function computeDimensionStyles(state, element, clientX, clientY, shiftKey) {
  const { directionFlags, startRect, parentRect, parentElement, aspectRatio } = state;
  let newWidth = startRect.width;
  let newHeight = startRect.height;
  let newTop = startRect.top - parentRect.top;
  let newLeft = startRect.left - parentRect.left;
  if (directionFlags.isEast) newWidth = clientX - startRect.left;
  if (directionFlags.isWest) {
    newWidth = startRect.width + (startRect.left - clientX);
    newLeft = clientX - parentRect.left;
  }
  if (directionFlags.isSouth) newHeight = clientY - startRect.top;
  if (directionFlags.isNorth) {
    newHeight = startRect.height + (startRect.top - clientY);
    newTop = clientY - parentRect.top;
  }
  if (shiftKey && aspectRatio && aspectRatio > 0) {
    const isDiagonal = (directionFlags.isNorth || directionFlags.isSouth) && (directionFlags.isEast || directionFlags.isWest);
    if (isDiagonal) {
      if (Math.abs(newWidth - startRect.width) > Math.abs(newHeight - startRect.height)) {
        newHeight = newWidth / aspectRatio;
        if (directionFlags.isNorth)
          newTop = startRect.bottom - parentRect.top - newHeight;
      } else {
        newWidth = newHeight * aspectRatio;
        if (directionFlags.isWest)
          newLeft = startRect.right - parentRect.left - newWidth;
      }
    }
  }
  newWidth = Math.max(MIN_SIZE, newWidth);
  newHeight = Math.max(MIN_SIZE, newHeight);
  const parentWidth = parentElement.clientWidth || parentRect.width;
  const parentHeight = parentElement.clientHeight || parentRect.height;
  if (parentWidth <= 0 || parentHeight <= 0)
    return element.styles ?? { default: {} };
  const widthPercent = clamp(newWidth / parentWidth * 100, 0, MAX_PERCENT);
  const heightPercent = clamp(newHeight / parentHeight * 100, 0, MAX_PERCENT);
  const defaultStyles = element.styles?.default ?? {};
  const updatedDefault = {
    ...defaultStyles
  };
  const isVerticalOnly = (directionFlags.isNorth || directionFlags.isSouth) && !(directionFlags.isEast || directionFlags.isWest);
  const isHorizontalOnly = (directionFlags.isEast || directionFlags.isWest) && !(directionFlags.isNorth || directionFlags.isSouth);
  if (!isVerticalOnly) updatedDefault.width = `${widthPercent.toFixed(2)}%`;
  if (!isHorizontalOnly) updatedDefault.height = `${heightPercent.toFixed(2)}%`;
  if (defaultStyles.position === "absolute") {
    updatedDefault.left = `${clamp(newLeft / parentWidth * 100, 0, MAX_PERCENT).toFixed(2)}%`;
    updatedDefault.top = `${clamp(newTop / parentHeight * 100, 0, MAX_PERCENT).toFixed(2)}%`;
  }
  return { ...element.styles, default: updatedDefault };
}
function useResizeHandler({
  element,
  updateElement,
  targetRef,
  enabled = true
}) {
  const elementRef = useRef(element);
  elementRef.current = element;
  const updateElementRef = useRef(updateElement);
  updateElementRef.current = updateElement;
  const resizeStateRef = useRef(null);
  const pendingStylesRef = useRef(null);
  const rafRef = useRef(null);
  const lastOwnerDocRef = useRef(null);
  const lastOwnerWinRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const handlersRef = useRef({
    onMouseMove: (_e) => {
    },
    onMouseUp: () => {
    }
  });
  const domMouseMove = useCallback(
    (e) => handlersRef.current.onMouseMove(e),
    []
  );
  const domMouseUp = useCallback(() => handlersRef.current.onMouseUp(), []);
  const restoreBodyStyles = useCallback((doc) => {
    try {
      if (doc.body) {
        doc.body.style.userSelect = "";
        doc.body.style.cursor = "";
      }
    } catch {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
  }, []);
  handlersRef.current.onMouseMove = (e) => {
    const state = resizeStateRef.current;
    if (!state) return;
    e.preventDefault();
    const computed = state.directionFlags.isSpecial ? computeSpecialStyles(state, elementRef.current, e.clientX, e.clientY) : computeDimensionStyles(
      state,
      elementRef.current,
      e.clientX,
      e.clientY,
      e.shiftKey
    );
    pendingStylesRef.current = computed;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (pendingStylesRef.current && targetRef.current) {
        applyStylesToDom(targetRef.current, pendingStylesRef.current);
      }
    });
  };
  handlersRef.current.onMouseUp = () => {
    if (!resizeStateRef.current) return;
    resizeStateRef.current = null;
    setIsResizing(false);
    const ownerDoc = lastOwnerDocRef.current ?? document;
    const ownerWin = lastOwnerWinRef.current ?? window;
    ownerDoc.removeEventListener("mousemove", domMouseMove);
    ownerDoc.removeEventListener("mouseup", domMouseUp);
    ownerWin.removeEventListener("mouseup", domMouseUp);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (pendingStylesRef.current) {
      updateElementRef.current(elementRef.current.id, {
        styles: pendingStylesRef.current
      });
      pendingStylesRef.current = null;
    }
    restoreBodyStyles(ownerDoc);
    lastOwnerDocRef.current = null;
  };
  const handleResizeStart = useCallback(
    (direction, e) => {
      if (!enabled || !targetRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      const ownerDoc = targetRef.current.ownerDocument ?? document;
      const ownerWin = ownerDoc.defaultView ?? window;
      lastOwnerDocRef.current = ownerDoc;
      lastOwnerWinRef.current = ownerWin;
      const parentElement = targetRef.current.parentElement ?? ownerDoc.getElementById("preview-iframe") ?? ownerDoc.getElementById("canvas") ?? document.body;
      const startRect = targetRef.current.getBoundingClientRect();
      const parentRect = parentElement.getBoundingClientRect();
      resizeStateRef.current = {
        direction,
        directionFlags: parseDirection(direction),
        startRect,
        startPos: { x: e.clientX, y: e.clientY },
        parentElement,
        parentRect,
        aspectRatio: startRect.height > 0 ? startRect.width / startRect.height : void 0,
        ownerDocument: ownerDoc,
        ownerWindow: ownerWin,
        initialStyles: elementRef.current.styles ?? { default: {} }
      };
      setIsResizing(true);
      ownerDoc.addEventListener("mousemove", domMouseMove);
      ownerDoc.addEventListener("mouseup", domMouseUp);
      ownerWin.addEventListener("mouseup", domMouseUp);
      try {
        if (ownerDoc.body) {
          ownerDoc.body.style.userSelect = "none";
          ownerDoc.body.style.cursor = directionToCursor(direction);
        }
      } catch {
        document.body.style.userSelect = "none";
        document.body.style.cursor = directionToCursor(direction);
      }
    },
    [enabled, targetRef, domMouseMove, domMouseUp]
  );
  useEffect(() => {
    return () => {
      const ownerDoc = lastOwnerDocRef.current ?? document;
      const ownerWin = lastOwnerWinRef.current ?? window;
      resizeStateRef.current = null;
      ownerDoc.removeEventListener("mousemove", domMouseMove);
      ownerDoc.removeEventListener("mouseup", domMouseUp);
      ownerWin.removeEventListener("mouseup", domMouseUp);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      pendingStylesRef.current = null;
      restoreBodyStyles(ownerDoc);
      lastOwnerDocRef.current = null;
      lastOwnerWinRef.current = null;
    };
  }, [domMouseMove, domMouseUp, restoreBodyStyles]);
  return {
    handleResizeStart,
    isResizing,
    currentResizeDirection: resizeStateRef.current?.direction ?? null,
    pendingStylesRef
  };
}
const useCreateEventWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, input }) => eventWorkflowService.createEventWorkflow(projectId, input),
    onSuccess: (created, { projectId }) => {
      queryClient.setQueryData(
        eventWorkflowKeys.list(projectId),
        (old) => old ? [...old, created] : [created]
      );
      queryClient.setQueryData(eventWorkflowKeys.detail(created.id), created);
    },
    onError: onMutationError("Failed to create workflow", { log: true })
  });
};
const useUpdateEventWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workflowId, input }) => eventWorkflowService.updateEventWorkflow(workflowId, input),
    onSuccess: (updated, { workflowId }) => {
      queryClient.setQueryData(eventWorkflowKeys.detail(workflowId), updated);
      queryClient.setQueriesData(
        { queryKey: eventWorkflowKeys.lists() },
        (old) => old?.map((w) => w.id === workflowId ? updated : w)
      );
    },
    onError: onMutationError("Failed to update workflow", { log: true })
  });
};
const useUpdateEventWorkflowEnabled = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workflowId, enabled }) => eventWorkflowService.updateEventWorkflowEnabled(workflowId, enabled),
    onSuccess: (updated, { workflowId }) => {
      queryClient.setQueryData(eventWorkflowKeys.detail(workflowId), updated);
      queryClient.setQueriesData(
        { queryKey: eventWorkflowKeys.lists() },
        (old) => old?.map((w) => w.id === workflowId ? updated : w)
      );
    },
    onError: onMutationError("Failed to update workflow status", { log: true })
  });
};
const useDeleteEventWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workflowId }) => {
      await eventWorkflowService.deleteEventWorkflow(workflowId);
      return workflowId;
    },
    onSuccess: (workflowId) => {
      queryClient.removeQueries({
        queryKey: eventWorkflowKeys.detail(workflowId),
        exact: true
      });
      queryClient.setQueriesData(
        { queryKey: eventWorkflowKeys.lists() },
        (old) => old?.filter((w) => w.id !== workflowId)
      );
    },
    onError: onMutationError("Failed to delete workflow", { log: true })
  });
};
function useEventWorkflows(projectId) {
  return useQuery({
    queryKey: eventWorkflowKeys.list(projectId),
    queryFn: async () => {
      const result = await eventWorkflowService.getEventWorkflows(projectId);
      return Array.isArray(result) ? result : [];
    },
    enabled: !!projectId,
    staleTime: 3e4,
    gcTime: 5 * 6e4
  });
}
function useEventWorkflow(workflowId, enabled = true) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: eventWorkflowKeys.detail(workflowId),
    queryFn: () => eventWorkflowService.getEventWorkflowById(workflowId),
    enabled: enabled && !!workflowId,
    staleTime: 3e4,
    gcTime: 5 * 6e4,
    // Seed from any list cache that already contains this workflow so the
    // component renders immediately rather than showing a loading state.
    initialData: () => {
      const lists = queryClient.getQueriesData({
        queryKey: eventWorkflowKeys.lists()
      });
      for (const [, data] of lists) {
        const found = data?.find((w) => w.id === workflowId);
        if (found) return found;
      }
      return void 0;
    }
  });
}
function useEventWorkflowActions(projectId) {
  const queryClient = useQueryClient();
  const query = useEventWorkflows(projectId);
  const createMutation = useCreateEventWorkflow();
  const updateMutation = useUpdateEventWorkflow();
  const updateEnabledMutation = useUpdateEventWorkflowEnabled();
  const deleteMutation = useDeleteEventWorkflow();
  const mutationError = createMutation.error ?? updateMutation.error ?? updateEnabledMutation.error ?? deleteMutation.error;
  const invalidateAll = useCallback(
    () => queryClient.invalidateQueries({ queryKey: eventWorkflowKeys.all }),
    [queryClient]
  );
  const invalidateList = useCallback(
    (pid) => pid ? queryClient.invalidateQueries({
      queryKey: eventWorkflowKeys.list(pid),
      exact: true
    }) : queryClient.invalidateQueries({
      queryKey: eventWorkflowKeys.lists()
    }),
    [queryClient]
  );
  const invalidateDetail = useCallback(
    (workflowId) => queryClient.invalidateQueries({
      queryKey: eventWorkflowKeys.detail(workflowId),
      exact: true
    }),
    [queryClient]
  );
  return {
    // ── React Query data ────────────────────────────────────────────────────
    workflows: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    /** Combined error: query error takes priority, then the latest mutation error. */
    error: query.error ? getErrorMessage(query.error, "Failed to load workflows") : mutationError ? getErrorMessage(mutationError, "Operation failed") : null,
    // ── Mutation actions ────────────────────────────────────────────────────
    createWorkflow: (input) => createMutation.mutateAsync({ projectId, input }),
    updateWorkflow: (workflowId, input) => updateMutation.mutateAsync({ workflowId, input }),
    updateWorkflowEnabled: (workflowId, enabled) => updateEnabledMutation.mutateAsync({ workflowId, enabled }),
    deleteWorkflow: (workflowId) => deleteMutation.mutateAsync({ workflowId }),
    // ── Mutation flags (derived from TanStack Query, not Zustand) ───────────
    isCreating: createMutation.isPending,
    /** True while either the full-update or the enabled-toggle mutation is in flight. */
    isUpdating: updateMutation.isPending || updateEnabledMutation.isPending,
    isDeleting: deleteMutation.isPending,
    // ── Cache helpers ───────────────────────────────────────────────────────
    invalidateAll,
    invalidateList,
    invalidateDetail,
    // ── Raw query pass-through ──────────────────────────────────────────────
    refetch: query.refetch
  };
}
function transformWorkflowToEventHandlers(workflowData) {
  if (!workflowData.nodes?.length) return [];
  const nodeMap = buildNodeMap(workflowData.nodes);
  const connectionMap = buildConnectionMap(workflowData.connections ?? []);
  const triggerNodes = workflowData.nodes.filter((n) => n.type === "trigger");
  const handlers = [];
  for (const trigger of triggerNodes) {
    const eventType = resolveEventType(
      trigger.data?.config?.eventType
    );
    const nextIds = connectionMap.get(trigger.id) ?? [];
    for (const nextId of nextIds) {
      const next = nodeMap[nextId];
      if (!next) continue;
      const chain = buildHandlerChain(
        next,
        nodeMap,
        connectionMap,
        eventType,
        /* @__PURE__ */ new Set()
      );
      if (chain) handlers.push(chain);
    }
  }
  return handlers;
}
function buildNodeMap(nodes) {
  return Object.fromEntries(nodes.map((n) => [n.id, n]));
}
function buildConnectionMap(connections) {
  const map = /* @__PURE__ */ new Map();
  for (const { source, target } of connections) {
    const existing = map.get(source) ?? [];
    map.set(source, [...existing, target]);
  }
  return map;
}
function buildHandlerChain(node, nodeMap, connectionMap, eventType, visited) {
  if (visited.has(node.id) || node.type === "trigger") return null;
  visited.add(node.id);
  if (node.type === "action")
    return buildActionHandler(node, nodeMap, connectionMap, eventType, visited);
  if (node.type === "condition")
    return buildConditionHandler(
      node,
      nodeMap,
      connectionMap,
      eventType,
      visited
    );
  return null;
}
function buildNextHandlers(nodeId, nodeMap, connectionMap, eventType, visited) {
  const nextIds = connectionMap.get(nodeId) ?? [];
  return nextIds.flatMap((id) => {
    const node = nodeMap[id];
    if (!node || visited.has(id)) return [];
    const handler = buildHandlerChain(
      node,
      nodeMap,
      connectionMap,
      eventType,
      new Set(visited)
    );
    return handler ? [handler] : [];
  });
}
function buildActionHandler(node, nodeMap, connectionMap, eventType, visited) {
  const config = node.data?.config ?? {};
  const actionType = resolveActionType(config.actionType);
  const nextHandlers = buildNextHandlers(
    node.id,
    nodeMap,
    connectionMap,
    eventType,
    visited
  );
  return {
    id: node.id,
    eventType,
    actionType,
    config: buildActionConfig(actionType, config),
    enabled: true,
    nextHandlers: nextHandlers.length > 0 ? nextHandlers : void 0
  };
}
function buildConditionHandler(node, nodeMap, connectionMap, eventType, visited) {
  const config = node.data?.config ?? {};
  const trueHandlers = buildNextHandlers(
    node.id,
    nodeMap,
    connectionMap,
    eventType,
    visited
  );
  const conditionConfig = {
    type: "customCode",
    code: generateConditionCode(config)
  };
  return {
    id: node.id,
    eventType,
    actionType: ACTION_TYPES.CUSTOM_CODE,
    config: conditionConfig,
    enabled: true,
    trueHandlers: trueHandlers.length > 0 ? trueHandlers : void 0
  };
}
function buildActionConfig(actionType, config) {
  switch (actionType) {
    case ACTION_TYPES.NAVIGATE:
      return {
        type: "navigate",
        value: String(config.value ?? ""),
        target: config.target ?? "url",
        openInNewTab: Boolean(config.openInNewTab),
        replaceHistory: Boolean(config.replaceHistory)
      };
    case ACTION_TYPES.API_CALL:
      return {
        type: "apiCall",
        url: String(config.url ?? ""),
        method: config.method ?? "GET",
        headers: config.headers ?? {},
        body: config.body,
        bodyType: config.bodyType ?? "json",
        storeResponseAs: config.storeResponseAs,
        timeout: Number(config.timeout) || 5e3
      };
    case ACTION_TYPES.SHOW_NOTIFICATION:
      return {
        type: "showNotification",
        message: String(config.message ?? ""),
        notificationType: config.notificationType ?? "info"
      };
    case ACTION_TYPES.CUSTOM_CODE:
      return { type: "customCode", code: String(config.code ?? "") };
    case ACTION_TYPES.SET_DATA:
      return {
        type: "setData",
        dataPath: String(config.dataPath ?? ""),
        value: config.value
      };
    case ACTION_TYPES.SHOW_ELEMENT:
    case ACTION_TYPES.HIDE_ELEMENT:
    case ACTION_TYPES.TOGGLE_ELEMENT:
      return {
        type: actionType,
        elementId: String(config.elementId ?? ""),
        animationDuration: Number(config.animationDuration) || 300
      };
    case ACTION_TYPES.SCROLL_TO:
      return {
        type: "scrollTo",
        target: config.target ?? "elementId",
        value: String(config.value ?? ""),
        behavior: config.behavior ?? "smooth"
      };
    case ACTION_TYPES.MODAL:
      return {
        type: "modal",
        action: config.action ?? "open",
        modalId: config.modalId
      };
    case ACTION_TYPES.PLAY_ANIMATION:
      return {
        type: "playAnimation",
        elementId: String(config.elementId ?? ""),
        animationType: config.animationType ?? "fadeIn",
        duration: Number(config.duration) || 1e3
      };
    case ACTION_TYPES.TOGGLE_CLASS:
    case ACTION_TYPES.ADD_CLASS:
    case ACTION_TYPES.REMOVE_CLASS:
      return {
        type: actionType,
        elementId: String(config.elementId ?? ""),
        className: String(config.className ?? "")
      };
    case ACTION_TYPES.SUBMIT_FORM:
      return {
        type: "submitForm",
        formElementId: config.formElementId
      };
    case ACTION_TYPES.RESET_FORM:
      return {
        type: "resetForm",
        formElementId: config.formElementId
      };
    case ACTION_TYPES.COPY_TO_CLIPBOARD:
      return { type: "copyToClipboard", text: String(config.text ?? "") };
    case ACTION_TYPES.DOWNLOAD_FILE:
      return {
        type: "downloadFile",
        url: String(config.url ?? ""),
        filename: config.filename
      };
    default:
      return {
        type: "customCode",
        code: `// Unknown action type: ${actionType}`
      };
  }
}
function generateConditionCode(config) {
  switch (config.conditionType) {
    case "always":
      return "return true;";
    case "stateEquals": {
      const { left, right, operator } = config;
      return `return state.${left} ${operator} ${JSON.stringify(right)};`;
    }
    case "customCode":
      return String(config.customCode ?? "return false;");
    default:
      return "return false;";
  }
}
function resolveValid(value, validValues, fallback) {
  return value && validValues.includes(value) ? value : fallback;
}
function resolveEventType(value) {
  return resolveValid(value, Object.values(EVENT_TYPES), EVENT_TYPES.CLICK);
}
function resolveActionType(value) {
  return resolveValid(
    typeof value === "string" ? value : void 0,
    Object.values(ACTION_TYPES),
    ACTION_TYPES.NAVIGATE
  );
}
function usePageElementConnections(pageId) {
  const queryClient = useQueryClient();
  const { setPageConnections, setPageLoading } = useElementEventWorkflowStore();
  return useQuery({
    queryKey: elementEventWorkflowKeys.byPage(pageId ?? ""),
    queryFn: async () => {
      setPageLoading(pageId, true);
      const response = await elementEventWorkflowService.getElementEventWorkflowsByPage(
        pageId
      );
      const connections = Array.isArray(response) ? response : [];
      const grouped = /* @__PURE__ */ new Map();
      for (const conn of connections) {
        const bucket = grouped.get(conn.elementId) ?? [];
        bucket.push(conn);
        grouped.set(conn.elementId, bucket);
      }
      grouped.forEach((elementConnections, elementId) => {
        queryClient.setQueryData(
          elementEventWorkflowKeys.byElement(elementId),
          elementConnections
        );
      });
      setPageConnections(pageId, connections);
      return connections;
    },
    enabled: !!pageId,
    staleTime: 3e4,
    gcTime: 5 * 6e4
  });
}
function useElementConnections(elementId, pageId) {
  const queryClient = useQueryClient();
  usePageElementConnections(pageId);
  return useQuery({
    queryKey: elementEventWorkflowKeys.byElement(elementId ?? ""),
    queryFn: async () => {
      if (!elementId) return [];
      const result = await elementEventWorkflowService.getElementEventWorkflowsByElement(
        elementId
      );
      return Array.isArray(result) ? result : [];
    },
    enabled: !!elementId && !pageId,
    staleTime: 3e4,
    gcTime: 5 * 6e4,
    initialData: pageId ? () => {
      const pageData = queryClient.getQueryData(elementEventWorkflowKeys.byPage(pageId));
      if (!pageData) return void 0;
      return pageData.filter((conn) => conn.elementId === elementId);
    } : void 0,
    initialDataUpdatedAt: pageId ? () => queryClient.getQueryState(elementEventWorkflowKeys.byPage(pageId))?.dataUpdatedAt : void 0
  });
}
const elementCommentKeys = {
  all: ["element-comments"],
  lists: () => [...elementCommentKeys.all, "list"],
  list: (elementId) => [...elementCommentKeys.lists(), elementId],
  projectList: (projectId) => [...elementCommentKeys.all, "project", projectId],
  details: () => [...elementCommentKeys.all, "detail"],
  detail: (id) => [...elementCommentKeys.details(), id],
  byAuthor: (authorId) => [...elementCommentKeys.all, "byAuthor", authorId]
};
function useElementComments(options = {}) {
  const { elementId, autoLoad = true } = options;
  const { user } = useUser();
  const { project } = useProjectStore();
  const queryClient = useQueryClient();
  const {
    data: commentsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: elementCommentKeys.list(elementId || ""),
    queryFn: () => elementCommentService.getElementComments(elementId || ""),
    enabled: autoLoad && !!elementId,
    ...QUERY_CONFIG.SHORT
  });
  const comments = commentsData?.data || [];
  const unresolvedCount = comments.filter((c) => !c.resolved).length;
  const createCommentMutation = useMutation({
    mutationFn: async (content) => {
      if (!elementId || !project?.id || !content.trim()) {
        throw new Error("Missing required data");
      }
      const request = {
        elementId,
        content: content.trim(),
        projectId: project.id
      };
      return elementCommentService.createElementComment(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: elementCommentKeys.list(elementId)
      });
      showSuccessToast("Comment posted successfully!");
    },
    onError: onMutationError("Failed to post comment")
  });
  const updateCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      content
    }) => elementCommentService.updateElementComment(commentId, {
      content: content.trim()
    }),
    onSuccess: (updatedComment) => {
      queryClient.setQueryData(
        elementCommentKeys.detail(updatedComment.id),
        updatedComment
      );
      queryClient.invalidateQueries({
        queryKey: elementCommentKeys.list(elementId)
      });
      showSuccessToast("Comment updated successfully!");
    },
    onError: onMutationError("Failed to update comment")
  });
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => elementCommentService.deleteElementComment(commentId),
    onSuccess: (_, commentId) => {
      queryClient.removeQueries({
        queryKey: elementCommentKeys.detail(commentId)
      });
      queryClient.invalidateQueries({
        queryKey: elementCommentKeys.list(elementId)
      });
      showSuccessToast("Comment deleted successfully!");
    },
    onError: onMutationError("Failed to delete comment")
  });
  const toggleResolvedMutation = useMutation({
    mutationFn: (commentId) => elementCommentService.toggleResolvedStatus(commentId),
    onSuccess: (updatedComment) => {
      queryClient.setQueryData(
        elementCommentKeys.detail(updatedComment.id),
        updatedComment
      );
      queryClient.invalidateQueries({
        queryKey: elementCommentKeys.list(elementId)
      });
    },
    onError: onMutationError("Failed to update comment status")
  });
  const createComment = async (content) => {
    try {
      const result = await createCommentMutation.mutateAsync(content);
      return result;
    } catch {
      return null;
    }
  };
  const updateComment = async (commentId, content) => {
    try {
      const result = await updateCommentMutation.mutateAsync({
        commentId,
        content
      });
      return result;
    } catch {
      return null;
    }
  };
  const deleteComment = async (commentId) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
      return true;
    } catch {
      return false;
    }
  };
  const toggleResolved = async (commentId) => {
    try {
      const result = await toggleResolvedMutation.mutateAsync(commentId);
      return result;
    } catch {
      return null;
    }
  };
  const refreshComments = async () => {
    await refetch();
  };
  const canEditComment = (comment) => {
    return user?.id === comment.authorId;
  };
  const canDeleteComment = (comment) => {
    return user?.id === comment.authorId;
  };
  return {
    comments,
    unresolvedCount,
    isLoading: isLoading || createCommentMutation.isPending || updateCommentMutation.isPending || deleteCommentMutation.isPending || toggleResolvedMutation.isPending,
    error: error || null,
    createComment,
    updateComment,
    deleteComment,
    toggleResolved,
    refreshComments,
    canEditComment,
    canDeleteComment
  };
}
function useProjectComments(projectId) {
  const {
    data: commentsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: elementCommentKeys.projectList(projectId || ""),
    queryFn: () => elementCommentService.getProjectComments(projectId || ""),
    enabled: !!projectId,
    ...QUERY_CONFIG.SHORT
  });
  const comments = commentsData?.data || [];
  const commentsByElement = comments.reduce(
    (acc, comment) => {
      if (!acc[comment.elementId]) {
        acc[comment.elementId] = [];
      }
      acc[comment.elementId].push(comment);
      return acc;
    },
    {}
  );
  const totalComments = comments.length;
  const unresolvedCount = comments.filter((c) => !c.resolved).length;
  const elementIds = Object.keys(commentsByElement);
  return {
    comments,
    commentsByElement,
    elementIds,
    totalComments,
    unresolvedCount,
    isLoading,
    error: error || null,
    refetch
  };
}
const elementCommentService = {
  // Create a new element comment
  createElementComment: async (data) => {
    return apiClient.post(
      new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_COMMENTS.CREATE).build(),
      data
    );
  },
  // Get element comment by ID
  getElementCommentById: async (commentId) => {
    return apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_COMMENTS.GET_BY_ID(commentId)).build()
    );
  },
  // Get all comments for a specific element
  getElementComments: async (elementId) => {
    return apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_COMMENTS.GET_BY_ELEMENT(elementId)).build()
    );
  },
  // Get all comments for a project
  getProjectComments: async (projectId) => {
    return apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_COMMENTS.GET_BY_PROJECT(projectId)).build()
    );
  },
  // Get all comments by a specific author
  getCommentsByAuthorId: async (authorId) => {
    return apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_COMMENTS.GET_BY_AUTHOR(authorId)).build()
    );
  },
  // Update an element comment
  updateElementComment: async (commentId, data) => {
    return apiClient.patch(
      new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_COMMENTS.UPDATE(commentId)).build(),
      data
    );
  },
  // Delete an element comment
  deleteElementComment: async (commentId) => {
    return apiClient.delete(
      new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_COMMENTS.DELETE(commentId)).build()
    );
  },
  // Toggle resolved status of an element comment
  toggleResolvedStatus: async (commentId) => {
    return apiClient.patch(
      new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENT_COMMENTS.TOGGLE_RESOLVED(commentId)).build(),
      {}
    );
  }
};
const collaboratorService = {
  getProjectCollaborators: async (projectId) => {
    try {
      const url = new URLBuilder("api").setPath(API_ENDPOINTS.COLLABORATORS.GET_BY_PROJECT(projectId)).build();
      const response = await apiClient.get(url);
      return Array.isArray(response?.collaborators) ? response.collaborators : [];
    } catch (error) {
      console.warn(
        `Failed to fetch collaborators for project ${projectId}:`,
        error
      );
      return [];
    }
  },
  updateCollaboratorRole: async (collaboratorId, data) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.COLLABORATORS.UPDATE_ROLE(collaboratorId)).build();
    return apiClient.patch(url, data);
  },
  removeCollaborator: async (collaboratorId) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.COLLABORATORS.REMOVE(collaboratorId)).build();
    return apiClient.delete(url);
  },
  leaveProject: async (projectId) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.COLLABORATORS.REMOVE_SELF(projectId)).build();
    return apiClient.delete(url);
  }
};
const collaboratorKeys = {
  all: ["collaborators"],
  lists: () => [...collaboratorKeys.all, "list"],
  list: (filters) => [...collaboratorKeys.lists(), filters],
  byProject: (projectId) => [...collaboratorKeys.all, "project", projectId]
};
function useProjectCollaborators(projectId, enabled = true) {
  return useQuery({
    queryKey: collaboratorKeys.byProject(projectId || ""),
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required");
      return await collaboratorService.getProjectCollaborators(projectId) || [];
    },
    enabled: !!projectId && enabled,
    ...QUERY_CONFIG.SHORT
  });
}
function useUpdateCollaboratorRole(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      collaboratorId,
      role
    }) => collaboratorService.updateCollaboratorRole(collaboratorId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectId ? collaboratorKeys.byProject(projectId) : collaboratorKeys.all
      });
      onMutationSuccess("Collaborator role updated successfully!")();
    },
    onError: onMutationError("Failed to update collaborator role")
  });
}
function useRemoveCollaborator(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (collaboratorId) => collaboratorService.removeCollaborator(collaboratorId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectId ? collaboratorKeys.byProject(projectId) : collaboratorKeys.all
      });
      onMutationSuccess("Collaborator removed successfully!")();
    },
    onError: onMutationError("Failed to remove collaborator")
  });
}
function useLeaveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId) => collaboratorService.leaveProject(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({
        queryKey: collaboratorKeys.byProject(projectId)
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onMutationSuccess("You have left the project successfully!")();
    },
    onError: onMutationError("Failed to leave project")
  });
}
function useCollaboratorManager(projectId) {
  const collaborators = useProjectCollaborators(projectId);
  const updateRole = useUpdateCollaboratorRole(projectId || void 0);
  const removeCollaborator = useRemoveCollaborator(projectId || void 0);
  const leaveProject = useLeaveProject();
  return {
    collaborators: collaborators.data || [],
    isLoading: collaborators.isLoading,
    isError: collaborators.isError,
    error: collaborators.error,
    updateCollaboratorRole: (collaboratorId, role) => updateRole.mutate({ collaboratorId, role }),
    updateCollaboratorRoleAsync: (collaboratorId, role) => updateRole.mutateAsync({ collaboratorId, role }),
    isUpdatingRole: updateRole.isPending,
    removeCollaborator: removeCollaborator.mutate,
    removeCollaboratorAsync: removeCollaborator.mutateAsync,
    isRemoving: removeCollaborator.isPending,
    leaveProject: leaveProject.mutate,
    leaveProjectAsync: leaveProject.mutateAsync,
    isLeaving: leaveProject.isPending,
    refetch: collaborators.refetch
  };
}
class EventExecutor {
  /**
   * Execute a single event handler
   */
  async execute(handler, context) {
    try {
      if (handler.enabled === false) {
        return;
      }
      if (handler.preventDefault && context.event) {
        context.event.preventDefault?.();
      }
      if (handler.stopPropagation && context.event) {
        context.event.stopPropagation?.();
      }
      if (handler.conditions && handler.conditions.length > 0) {
        const conditionsMet = await this.checkConditions(
          handler.conditions,
          context
        );
        if (!conditionsMet) {
          return;
        }
      }
      if (handler.delay && handler.delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, handler.delay));
      }
      const result = await this.executeAction(handler.config, context);
      if (handler.trueHandlers || handler.falseHandlers) {
        const conditionMet = this.evaluateConditionResult(result);
        if (conditionMet && handler.trueHandlers) {
          for (const trueHandler of handler.trueHandlers) {
            await this.execute(trueHandler, context);
          }
        } else if (!conditionMet && handler.falseHandlers) {
          for (const falseHandler of handler.falseHandlers) {
            await this.execute(falseHandler, context);
          }
        }
      } else if (handler.nextHandlers && handler.nextHandlers.length > 0) {
        for (const nextHandler of handler.nextHandlers) {
          await this.execute(nextHandler, context);
        }
      }
      return result;
    } catch (error) {
      console.error("Error executing event handler:", error);
      throw error;
    }
  }
  /**
   * Evaluate condition result as boolean
   */
  evaluateConditionResult(result) {
    if (typeof result === "boolean") {
      return result;
    }
    if (typeof result === "number") {
      return result !== 0;
    }
    if (typeof result === "string") {
      return result.toLowerCase() === "true" || result === "1";
    }
    return !!result;
  }
  /**
   * Check if all conditions are met
   */
  async checkConditions(conditions, context) {
    for (const condition of conditions) {
      const conditionMet = await this.checkCondition(condition, context);
      if (!conditionMet) {
        return false;
      }
    }
    return true;
  }
  /**
   * Check a single condition
   */
  async checkCondition(condition, context) {
    switch (condition.type) {
      case "always":
        return true;
      case "stateEquals":
        const stateValue = this.getNestedValue(
          context.elementState,
          condition.left || ""
        );
        return stateValue === condition.right;
      case "stateCheck":
        return this.compareValues(
          this.getNestedValue(context.elementState, condition.left || ""),
          condition.operator || "==",
          condition.right
        );
      case "customCode":
        try {
          const fn = new Function(
            "state",
            "element",
            condition.customCode || "true"
          );
          return fn(context.elementState, context.element);
        } catch (error) {
          console.error("Error evaluating condition code:", error);
          return false;
        }
      default:
        return true;
    }
  }
  /**
   * Execute action based on config
   */
  async executeAction(config, context) {
    switch (config.type) {
      case "navigate":
        return this.handleNavigate(config, context);
      case "showElement":
      case "hideElement":
      case "toggleElement":
        return this.handleToggleElement(config, context);
      case "apiCall":
        return this.handleApiCall(config, context);
      case "setData":
        return this.handleSetData(config, context);
      case "customCode":
        return this.handleCustomCode(config, context);
      case "scrollTo":
        return this.handleScroll(config, context);
      case "modal":
        return this.handleModal(config, context);
      case "showNotification":
        return this.handleNotification(config, context);
      case "copyToClipboard":
        return this.handleCopyToClipboard(config, context);
      case "downloadFile":
        return this.handleDownloadFile(config, context);
      case "playAnimation":
        return this.handleAnimation(config, context);
      case "submitForm":
      case "resetForm":
        return this.handleFormAction(config, context);
      case "addClass":
      case "removeClass":
      case "toggleClass":
        return this.handleToggleClass(config, context);
      default:
        console.warn("Unknown action type:", config.type);
    }
  }
  /**
   * Handle navigate action
   */
  handleNavigate(config, context) {
    const url = config.value;
    if (config.openInNewTab) {
      window.open(url, "_blank");
    } else {
      if (config.replaceHistory) {
        window.history.replaceState(null, "", url);
      } else {
        window.location.href = url;
      }
    }
  }
  /**
   * Handle show/hide/toggle element
   */
  handleToggleElement(config, context) {
    const element = document.getElementById(config.elementId);
    if (!element) return;
    const isHidden = element.style.display === "none";
    if (config.type === "showElement") {
      element.style.display = "";
    } else if (config.type === "hideElement") {
      element.style.display = "none";
    } else if (config.type === "toggleElement") {
      element.style.display = isHidden ? "" : "none";
    }
  }
  /**
   * Handle API call action
   */
  async handleApiCall(config, context) {
    try {
      const options = {
        method: config.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...config.headers
        }
      };
      if (config.body) {
        options.body = JSON.stringify(config.body);
      }
      const response = await fetch(config.url, options);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      if (config.storeResponseAs) {
        context.elementState[config.storeResponseAs] = data;
      }
      return data;
    } catch (error) {
      console.error("API call error:", error);
      throw error;
    }
  }
  /**
   * Handle set data action
   */
  handleSetData(config, context) {
    let value = config.value;
    if (config.valueType === "event" && context.event) {
      const target = context.event.target;
      if (config.fromEvent === "target.value") {
        value = target.value;
      } else if (config.fromEvent === "target.checked") {
        value = target.checked;
      } else if (config.fromEvent === "target.files") {
        value = target.files;
      }
    } else if (config.fromElement) {
      const element = document.getElementById(
        config.fromElement
      );
      if (element) {
        value = element.value;
      }
    }
    this.setNestedValue(context.elementState, config.dataPath, value);
  }
  /**
   * Handle custom code action
   */
  handleCustomCode(config, context) {
    try {
      const fn = new Function(
        "element",
        "event",
        "state",
        "context",
        config.code
      );
      const result = fn(
        context.element,
        context.event,
        context.elementState,
        context
      );
      return result;
    } catch (error) {
      console.error("Error executing custom code:", error);
      return false;
    }
  }
  /**
   * Handle scroll action
   */
  handleScroll(config, context) {
    if (config.target === "elementId") {
      const element = document.getElementById(config.value);
      if (element) {
        element.scrollIntoView({
          behavior: config.behavior || "smooth",
          block: "start"
        });
        if (config.offsetY) {
          window.scrollBy(0, config.offsetY);
        }
      }
    } else if (config.target === "position") {
      window.scrollTo({
        top: config.value,
        behavior: config.behavior || "smooth"
      });
    }
  }
  /**
   * Handle modal action
   */
  handleModal(config, context) {
    const modalId = config.modalId;
    if (!modalId) return;
    const modal = document.getElementById(modalId);
    if (!modal) return;
    if (config.action === "open") {
      modal.style.display = "block";
      modal.setAttribute("aria-hidden", "false");
    } else if (config.action === "close") {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    }
  }
  /**
   * Handle notification action
   */
  handleNotification(config, _context) {
    try {
      const sonner = require("sonner");
      if (sonner.toast) {
        sonner.toast[config.notificationType || "info"](config.message, {
          duration: config.duration
        });
      }
    } catch (error) {
      console.warn("Sonner not available, using fallback notification");
      alert(config.message);
    }
  }
  /**
   * Handle copy to clipboard action
   */
  async handleCopyToClipboard(config, _context) {
    try {
      await navigator.clipboard.writeText(config.text);
      if (config.successMessage) {
        try {
          const sonner = require("sonner");
          if (sonner.toast) {
            sonner.toast.success(config.successMessage);
          }
        } catch {
          console.log("Copied to clipboard");
        }
      }
    } catch (error) {
      console.error("Copy to clipboard failed:", error);
    }
  }
  /**
   * Handle download file action
   */
  handleDownloadFile(config, _context) {
    const link = document.createElement("a");
    link.href = config.url;
    link.download = config.filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  /**
   * Handle play animation action
   */
  handleAnimation(config, _context) {
    const element = document.getElementById(config.elementId);
    if (!element) return;
    const animationClass = `animate-${config.animationType}`;
    element.classList.add(animationClass);
    const duration = config.duration || 1e3;
    setTimeout(() => {
      element.classList.remove(animationClass);
    }, duration);
  }
  /**
   * Handle form actions
   */
  handleFormAction(config, context) {
    let formElement = document.getElementById(
      config.formElementId || ""
    );
    if (!formElement && context.elementInstance) {
      formElement = context.elementInstance.closest(
        "form"
      );
    }
    if (!formElement) return;
    if (config.type === "submitForm") {
      formElement.submit();
    } else if (config.type === "resetForm") {
      formElement.reset();
    }
  }
  /**
   * Handle toggle class action
   */
  handleToggleClass(config, _context) {
    const element = document.getElementById(config.elementId);
    if (!element) return;
    if (config.type === "addClass") {
      element.classList.add(config.className);
    } else if (config.type === "removeClass") {
      element.classList.remove(config.className);
    } else if (config.type === "toggleClass") {
      element.classList.toggle(config.className);
    }
  }
  /**
   * Utility: Get nested value from object
   */
  getNestedValue(obj, path) {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  }
  /**
   * Utility: Set nested value in object
   */
  setNestedValue(obj, path, value) {
    const keys = path.split(".");
    const lastKey = keys.pop();
    if (!lastKey) return;
    const target = keys.reduce((acc, part) => {
      if (!acc[part]) {
        acc[part] = {};
      }
      return acc[part];
    }, obj);
    target[lastKey] = value;
  }
  /**
   * Utility: Compare values based on operator
   */
  compareValues(left, operator, right) {
    switch (operator) {
      case "==":
        return left == right;
      case "!=":
        return left != right;
      case ">":
        return left > right;
      case "<":
        return left < right;
      case ">=":
        return left >= right;
      case "<=":
        return left <= right;
      case "includes":
        return String(left).includes(String(right));
      case "notIncludes":
        return !String(left).includes(String(right));
      default:
        return true;
    }
  }
}
const eventExecutor = new EventExecutor();
function useElementEvents(options) {
  const {
    elementId,
    onStateChange,
    globalState,
    enableEventsOverride,
    projectId
  } = options;
  const pageId = usePageStore((state) => state.currentPage?.Id);
  const [elementState, setElementState] = useState({});
  const elementStateRef = useRef({});
  const elementRef = useRef(null);
  const eventsMapRef = useRef(/* @__PURE__ */ new Map());
  const previousWorkflowHandlersRef = useRef(null);
  const [eventsRevision, setEventsRevision] = useState(0);
  useEffect(() => {
    elementStateRef.current = elementState;
  }, [elementState]);
  const { isEventModeEnabled, isElementEventsDisabled } = useEventModeStore();
  const { data: connections = [] } = useElementConnections(elementId, pageId);
  const { data: workflows = [] } = useEventWorkflows(projectId || "");
  const shouldEventsBeActive = enableEventsOverride ? true : isEventModeEnabled;
  const areEventsDisabledForElement = isElementEventsDisabled(elementId);
  const eventsActive = shouldEventsBeActive && !areEventsDisabledForElement;
  const registerEvents = useCallback(
    (elementEvents) => {
      eventsMapRef.current.clear();
      if (!eventsActive) {
        setEventsRevision((r) => r + 1);
        return;
      }
      Object.entries(elementEvents).forEach(([eventType, handlers]) => {
        if (Array.isArray(handlers)) {
          eventsMapRef.current.set(eventType, handlers);
        }
      });
      setEventsRevision((r) => r + 1);
    },
    [eventsActive]
  );
  const handleEvent = useCallback(
    async (eventType, nativeEvent) => {
      if (!eventsActive) return;
      const handlers = eventsMapRef.current.get(eventType);
      if (!handlers || handlers.length === 0) return;
      for (const handler of handlers) {
        const context = {
          element: elementRef.current,
          event: nativeEvent,
          elementState: elementStateRef.current,
          globalState,
          elementInstance: elementRef.current
        };
        try {
          await eventExecutor.execute(handler, context);
          onStateChange?.(elementStateRef.current);
        } catch (error) {
          console.error(`Error handling ${eventType}:`, error);
        }
      }
    },
    [eventsActive, globalState, onStateChange]
  );
  const createEventHandlers = useCallback(() => {
    const handlers = {};
    if (!eventsActive) return handlers;
    eventsMapRef.current.forEach((_, eventType) => {
      handlers[eventType] = (e) => handleEvent(eventType, e);
    });
    return handlers;
  }, [eventsActive, handleEvent, eventsRevision]);
  const updateState = useCallback(
    (key, value) => {
      setElementState((prev) => {
        const newState = { ...prev, [key]: value };
        onStateChange?.(newState);
        return newState;
      });
    },
    [onStateChange]
  );
  const getState = useCallback((key) => {
    if (key) return elementStateRef.current[key];
    return elementStateRef.current;
  }, []);
  const enableEvents = useCallback(() => {
    useEventModeStore.getState().enableElementEvents(elementId);
  }, [elementId]);
  const disableEvents = useCallback(() => {
    useEventModeStore.getState().disableElementEvents(elementId);
  }, [elementId]);
  const areEventsEnabled = useCallback(() => eventsActive, [eventsActive]);
  useEffect(() => {
    if (!projectId || !eventsActive) return;
    const workflowHandlers = {};
    for (const conn of connections) {
      const workflow = workflows.find((w) => w.id === conn.workflowId);
      if (workflow?.canvasData) {
        const handlers = transformWorkflowToEventHandlers(workflow.canvasData);
        if (!workflowHandlers[conn.eventName]) {
          workflowHandlers[conn.eventName] = [];
        }
        workflowHandlers[conn.eventName].push(...handlers);
      }
    }
    const handlersChanged = JSON.stringify(workflowHandlers) !== JSON.stringify(previousWorkflowHandlersRef.current);
    if (handlersChanged) {
      previousWorkflowHandlersRef.current = workflowHandlers;
      registerEvents(workflowHandlers);
    }
  }, [
    projectId,
    elementId,
    eventsActive,
    connections,
    workflows,
    registerEvents
  ]);
  return {
    elementRef,
    registerEvents,
    handleEvent,
    createEventHandlers,
    updateState,
    getState,
    state: elementState,
    enableEvents,
    disableEvents,
    areEventsEnabled,
    eventsActive
  };
}
function useEditorElement({ elementId, events }) {
  const { id: projectId } = useParams({ strict: false });
  const { elementRef, registerEvents, createEventHandlers, eventsActive } = useElementEvents({
    elementId,
    projectId: projectId ?? ""
  });
  useEffect(() => {
    if (events) registerEvents(events);
  }, [events, registerEvents]);
  const eventHandlers = createEventHandlers();
  return { elementRef, eventHandlers, eventsActive };
}
function eventsStyle(active) {
  return {
    cursor: active ? "pointer" : "inherit",
    userSelect: active ? "none" : "auto"
  };
}
function resolveContent(element, data, isEditing) {
  let content = (typeof data === "string" ? data : "") || (typeof data === "object" && data && typeof data.content === "string" ? data.content : "") || (typeof element.content === "string" ? element.content : "") || "";
  if (typeof element.content === "string" && data && typeof data === "object") {
    content = elementHelper.replacePlaceholders(element.content, data);
  }
  return isEditing ? element.content ?? "" : content;
}
const SRC_KEY = {
  image: "imageLink",
  video: "videoLink",
  audio: "audioLink"
};
const NAME_KEY = {
  image: "imageName",
  video: "videoName",
  audio: "audioName"
};
function useMediaDrop({ element, mediaType }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const updateElement = useUpdateElement();
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      try {
        const raw = e.dataTransfer.getData("application/json");
        if (!raw) {
          toast.error("Invalid drag data");
          return;
        }
        const payload = JSON.parse(raw);
        const src = payload[SRC_KEY[mediaType]];
        if (payload.type !== mediaType || typeof src !== "string") return;
        const nameKey = NAME_KEY[mediaType];
        const name = typeof payload[nameKey] === "string" ? payload[nameKey] : mediaType.charAt(0).toUpperCase() + mediaType.slice(1);
        updateElement(element.id, { ...element, src, name });
        toast.success(`${name} updated successfully!`);
      } catch (error) {
        console.error("Drop error:", error);
        toast.error(`Failed to update ${mediaType}`);
      }
    },
    [element, mediaType, updateElement]
  );
  return { isDragOver, handleDragOver, handleDragLeave, handleDrop };
}
function DropOverlay({ label }) {
  return /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxs("div", { className: "bg-background/90 p-4 rounded-lg shadow-lg", children: [
    /* @__PURE__ */ jsx(Upload, { className: "h-8 w-8 text-primary mx-auto mb-2" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: label })
  ] }) });
}
function CMSEmptyState({
  title,
  description,
  className,
  ...divProps
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      ...divProps,
      className: cn(
        "flex items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50",
        className
      ),
      children: /* @__PURE__ */ jsxs("div", { className: "text-center text-gray-500", children: [
        /* @__PURE__ */ jsx(Database, { className: "w-8 h-8 mx-auto mb-2" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: title }),
        /* @__PURE__ */ jsx("p", { className: "text-xs", children: description })
      ] })
    }
  );
}
const BaseComponent = ({ element, data }) => {
  const baseElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(baseElement);
  const commonProps = getCommonProps(baseElement);
  const displayContent = resolveContent(
    element,
    data,
    !!commonProps.contentEditable
  );
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      ...commonProps,
      ...eventHandlers,
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive)
      },
      suppressContentEditableWarning: true,
      dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(displayContent) }
    }
  );
};
const ButtonComponent = ({ element }) => {
  const buttonElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(buttonElement);
  const commonProps = getCommonProps(buttonElement);
  return /* @__PURE__ */ jsx(
    "button",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      ...commonProps,
      ...eventHandlers,
      type: "button",
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive)
      },
      dangerouslySetInnerHTML: {
        __html: DOMPurify.sanitize(element.content || "")
      }
    }
  );
};
const ElementRenderer = ({ element, data }) => {
  const commonProps = {
    element,
    data
  };
  const componentFactory = getComponentFactory(element.type);
  const [Component, setComponent] = React__default.useState(null);
  React__default.useEffect(() => {
    if (componentFactory) {
      componentFactory().then((comp) => setComponent(() => comp)).catch((err) => {
        console.error(
          `Failed to load component for type "${element.type}":`,
          err
        );
      });
    }
  }, [element.type, componentFactory]);
  if (!Component) {
    return null;
  }
  return /* @__PURE__ */ jsx(Component, { ...commonProps });
};
const ElementRenderer$1 = React__default.memo(
  ElementRenderer,
  (prev, next) => prev.element === next.element && prev.data === next.data
);
function ElementCommentButton({ element }) {
  const {
    setActiveCommentElement,
    activeCommentElementId,
    isCommentsVisible,
    setCommentsVisible
  } = useElementCommentStore();
  const { unresolvedCount } = useElementComments({
    elementId: element.id,
    autoLoad: false
  });
  const isActive = activeCommentElementId === element.id;
  const hasComments = unresolvedCount > 0;
  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isActive) {
      setActiveCommentElement(void 0);
    } else {
      setActiveCommentElement(element.id);
      if (!isCommentsVisible) {
        setCommentsVisible(true);
      }
    }
  };
  return /* @__PURE__ */ jsx(TooltipProvider, { delayDuration: 300, children: /* @__PURE__ */ jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.8, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.8, y: 10 },
        transition: { duration: 0.2, ease: "easeOut" },
        className: "absolute -right-3 -top-3 z-30 pointer-events-none",
        style: {
          transform: "translate(50%, -50%)"
        },
        children: /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            variant: isActive ? "default" : "outline",
            className: cn(
              "h-8 px-2.5 gap-1.5 shadow-lg border-border transition-all duration-200 pointer-events-auto",
              "hover:scale-105 hover:shadow-xl active:scale-95",
              isActive ? "bg-primary hover:bg-primary border-primary text-primary-foreground" : "bg-card hover:bg-muted border-border",
              hasComments && !isActive && "border-accent hover:border-accent"
            ),
            onClick: handleClick,
            children: [
              /* @__PURE__ */ jsx(
                motion.div,
                {
                  animate: hasComments ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, -10, 10, -10, 0]
                  } : {},
                  transition: {
                    duration: 0.5,
                    repeat: hasComments ? Infinity : 0,
                    repeatDelay: 3
                  },
                  children: hasComments ? /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: unresolvedCount > 0 && /* @__PURE__ */ jsx(
                motion.div,
                {
                  initial: { opacity: 0, scale: 0 },
                  animate: { opacity: 1, scale: 1 },
                  exit: { opacity: 0, scale: 0 },
                  transition: { duration: 0.2 },
                  children: /* @__PURE__ */ jsx(
                    Badge,
                    {
                      variant: "destructive",
                      className: cn(
                        "h-5 min-w-5 px-1.5 text-[10px] font-bold rounded-full",
                        "flex items-center justify-center",
                        "shadow-md"
                      ),
                      children: unresolvedCount > 9 ? "9+" : unresolvedCount
                    }
                  )
                },
                "badge"
              ) })
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxs(TooltipContent, { side: "bottom", className: "text-xs", children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium", children: isActive ? "Close comments" : "View comments" }),
      unresolvedCount > 0 && /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-0.5", children: [
        unresolvedCount,
        " unresolved",
        " ",
        unresolvedCount === 1 ? "comment" : "comments"
      ] })
    ] })
  ] }) });
}
function useAltKey(iframeRef) {
  const [altPressed, setAltPressed] = useState(false);
  useEffect(() => {
    const onDown = (e) => {
      if (e.key === "Alt") setAltPressed(true);
    };
    const onUp = (e) => {
      if (e.key === "Alt") setAltPressed(false);
    };
    const onBlur = () => setAltPressed(false);
    document.addEventListener("keydown", onDown, true);
    document.addEventListener("keyup", onUp, true);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("keydown", onDown, true);
      document.removeEventListener("keyup", onUp, true);
      window.removeEventListener("blur", onBlur);
    };
  }, []);
  useEffect(() => {
    const iframe = iframeRef?.current;
    if (!iframe) return;
    let iframeDoc = null;
    const onDown = (e) => {
      if (e.key === "Alt") setAltPressed(true);
    };
    const onUp = (e) => {
      if (e.key === "Alt") setAltPressed(false);
    };
    const onBlur = () => setAltPressed(false);
    const attach = () => {
      try {
        iframeDoc = iframe.contentDocument;
        if (!iframeDoc) return;
        iframeDoc.addEventListener("keydown", onDown, true);
        iframeDoc.addEventListener("keyup", onUp, true);
        iframeDoc.defaultView?.addEventListener("blur", onBlur);
      } catch {
      }
    };
    iframe.addEventListener("load", attach);
    if (iframe.contentDocument?.readyState === "complete") attach();
    return () => {
      iframe.removeEventListener("load", attach);
      try {
        iframeDoc?.removeEventListener("keydown", onDown, true);
        iframeDoc?.removeEventListener("keyup", onUp, true);
        iframeDoc?.defaultView?.removeEventListener("blur", onBlur);
      } catch {
      }
    };
  }, [iframeRef]);
  return altPressed;
}
const ResizeContext = createContext(null);
function useResizeContext() {
  return useContext(ResizeContext);
}
function getHandleTooltip(direction, styles) {
  const getSpacingTooltip = (type, dir) => {
    const propMap = {
      n: `${type}Top`,
      s: `${type}Bottom`,
      e: `${type}Right`,
      w: `${type}Left`
    };
    const prop = propMap[dir];
    const value = prop && styles?.[prop] !== void 0 ? styles?.[prop] : "0";
    return `${type.charAt(0).toUpperCase() + type.slice(1)} (${dir.toUpperCase()}): ${value}`;
  };
  if (direction.startsWith("margin-")) {
    const dir = direction.split("-")[1];
    return getSpacingTooltip("margin", dir);
  }
  if (direction.startsWith("padding-")) {
    const dir = direction.split("-")[1];
    return getSpacingTooltip("padding", dir);
  }
  if (direction === "gap") {
    const value = styles?.gap !== void 0 ? styles.gap : "0";
    return `Gap: ${value}`;
  }
  switch (direction) {
    case "n":
      return `Resize top (Height: ${styles?.height || "auto"})`;
    case "s":
      return `Resize bottom (Height: ${styles?.height || "auto"})`;
    case "e":
      return `Resize right (Width: ${styles?.width || "auto"})`;
    case "w":
      return `Resize left (Width: ${styles?.width || "auto"})`;
    case "ne":
      return `Resize top-right (Width: ${styles?.width || "auto"}, Height: ${styles?.height || "auto"})`;
    case "nw":
      return `Resize top-left (Width: ${styles?.width || "auto"}, Height: ${styles?.height || "auto"})`;
    case "se":
      return `Resize bottom-right (Width: ${styles?.width || "auto"}, Height: ${styles?.height || "auto"})`;
    case "sw":
      return `Resize bottom-left (Width: ${styles?.width || "auto"}, Height: ${styles?.height || "auto"})`;
    default:
      return "Resize";
  }
}
function ResizeTooltip({
  direction,
  element,
  children,
  isResizing = false,
  currentResizeDirection = null
}) {
  const resizeCtx = useResizeContext();
  const pendingStylesRef = resizeCtx?.pendingStylesRef;
  const isActive = isResizing && direction === currentResizeDirection;
  const [liveStyles, setLiveStyles] = useState(
    void 0
  );
  useEffect(() => {
    if (!isActive || !pendingStylesRef) return;
    let raf;
    let prevTooltipText = "";
    const poll = () => {
      if (pendingStylesRef.current?.default) {
        const nextStyles = pendingStylesRef.current.default;
        const nextText = getHandleTooltip(direction, nextStyles);
        if (nextText !== prevTooltipText) {
          prevTooltipText = nextText;
          setLiveStyles(nextStyles);
        }
      }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(raf);
  }, [isActive, pendingStylesRef, direction]);
  const shouldShowTooltip = !isResizing || direction === currentResizeDirection;
  if (!shouldShowTooltip) {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  const displayStyles = isActive && liveStyles ? liveStyles : element.styles?.default;
  return /* @__PURE__ */ jsxs(Tooltip, { open: isResizing ? true : void 0, children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children }),
    /* @__PURE__ */ jsx(TooltipContent, { side: "top", children: getHandleTooltip(direction, displayStyles) })
  ] });
}
const STANDARD_DIRECTIONS = /* @__PURE__ */ new Set([
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw"
]);
const HANDLE_COLORS = {
  gap: "bg-pink-500 border-pink-200 hover:bg-pink-600 text-white",
  margin: "bg-orange-500 border-orange-200 hover:bg-orange-600",
  padding: "bg-emerald-500 border-emerald-200 hover:bg-emerald-600",
  standard: "bg-blue-500 border-blue-200 hover:bg-blue-600"
};
function getHandleType(direction) {
  if (direction === "gap") return "gap";
  if (direction.startsWith("margin-")) return "margin";
  if (direction.startsWith("padding-")) return "padding";
  return "standard";
}
const ResizeHandle = memo(function ResizeHandle2({
  direction,
  onResizeStart,
  element,
  isResizing,
  currentResizeDirection
}) {
  const handleType = getHandleType(direction);
  const isGapHandle = handleType === "gap";
  const isSpacingHandle = handleType === "margin" || handleType === "padding";
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    onResizeStart(direction, e);
  };
  const baseClasses = cn(
    "absolute z-50 transition-all duration-200 ease-in-out shadow-sm flex items-center justify-center",
    isGapHandle ? "w-5 h-5 rounded-sm cursor-ns-resize" : "w-3.5 h-3.5",
    !isGapHandle && (isSpacingHandle ? "rounded-[2px]" : "rounded-full"),
    !isGapHandle && "border-2",
    HANDLE_COLORS[handleType],
    directionalClasses[direction],
    "hover:scale-125 active:scale-110",
    isResizing && currentResizeDirection !== direction && "opacity-0 pointer-events-none",
    isResizing && currentResizeDirection === direction && "scale-125 ring-2 ring-offset-1 ring-current z-[60]"
  );
  const flexDirection = element.styles?.default?.flexDirection ?? "row";
  const isColumn = String(flexDirection).includes("column");
  return /* @__PURE__ */ jsx(
    ResizeTooltip,
    {
      direction,
      element,
      isResizing,
      currentResizeDirection,
      children: /* @__PURE__ */ jsx(
        "div",
        {
          className: baseClasses,
          onMouseDown: handleMouseDown,
          onPointerDown: (e) => e.stopPropagation(),
          role: "button",
          "aria-label": `Resize ${direction}`,
          tabIndex: -1,
          children: isGapHandle && /* @__PURE__ */ jsx("div", { className: cn("pointer-events-none", isColumn && "rotate-90"), children: /* @__PURE__ */ jsx(Pause, { size: 10 }) })
        }
      )
    }
  );
});
const MARGIN_STRIPE = `linear-gradient(45deg, rgba(249, 115, 22, 0.1) 25%, transparent 25%, transparent 50%, rgba(249, 115, 22, 0.1) 50%, rgba(249, 115, 22, 0.1) 75%, transparent 75%, transparent)`;
const MARGIN_BG = "rgba(249, 115, 22, 0.15)";
const MARGIN_BORDER = "1px dashed rgba(249, 115, 22, 0.3)";
const BASE_LABEL_STYLE = {
  position: "absolute",
  fontSize: "9px",
  fontWeight: 600,
  padding: "1px 3px",
  borderRadius: "2px",
  pointerEvents: "none",
  zIndex: 40,
  whiteSpace: "nowrap"
};
function getSideLabelPosition(side, value, isMargin) {
  const half = `${parseFloat(value) / 2}px`;
  const outer = isMargin ? `-${half}` : "0";
  const inner = isMargin ? 0 : "4px";
  switch (side) {
    case "top":
      return { top: outer, left: "50%", transform: "translate(-50%, -50%)", marginTop: inner };
    case "bottom":
      return { bottom: outer, left: "50%", transform: "translate(-50%, 50%)", marginBottom: inner };
    case "left":
      return { left: outer, top: "50%", transform: "translate(-50%, -50%)", marginLeft: inner };
    case "right":
      return { right: outer, top: "50%", transform: "translate(50%, -50%)", marginRight: inner };
  }
}
function buildMarginSlabStyle(side, value) {
  const base = {
    position: "absolute",
    backgroundColor: MARGIN_BG,
    backgroundImage: MARGIN_STRIPE,
    backgroundSize: "8px 8px"
  };
  switch (side) {
    case "top":
      return { ...base, bottom: "100%", left: 0, right: 0, height: value, borderLeft: MARGIN_BORDER, borderRight: MARGIN_BORDER, borderTop: MARGIN_BORDER };
    case "bottom":
      return { ...base, top: "100%", left: 0, right: 0, height: value, borderLeft: MARGIN_BORDER, borderRight: MARGIN_BORDER, borderBottom: MARGIN_BORDER };
    case "left":
      return { ...base, right: "100%", top: 0, bottom: 0, width: value, borderTop: MARGIN_BORDER, borderBottom: MARGIN_BORDER, borderLeft: MARGIN_BORDER };
    case "right":
      return { ...base, left: "100%", top: 0, bottom: 0, width: value, borderTop: MARGIN_BORDER, borderBottom: MARGIN_BORDER, borderRight: MARGIN_BORDER };
  }
}
const SIDES = ["top", "bottom", "left", "right"];
function SpacingValueLabel({
  value,
  type,
  side
}) {
  if (!value || value === "0px" || value === "0") return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue === 0) return null;
  const isMargin = type === "margin";
  const colorClass = isMargin ? "text-orange-600 bg-orange-100/80" : "text-emerald-600 bg-emerald-100/80";
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: { ...BASE_LABEL_STYLE, ...getSideLabelPosition(side, value, isMargin) },
      className: cn("shadow-sm backdrop-blur-[1px]", colorClass),
      children: numValue
    }
  );
}
const SpacingOverlay = memo(function SpacingOverlay2({
  element,
  show
}) {
  if (!show) return null;
  const s = element.styles?.default ?? {};
  const margin = {
    top: String(s.marginTop ?? "0px"),
    bottom: String(s.marginBottom ?? "0px"),
    left: String(s.marginLeft ?? "0px"),
    right: String(s.marginRight ?? "0px")
  };
  const padding = {
    top: String(s.paddingTop ?? "0px"),
    bottom: String(s.paddingBottom ?? "0px"),
    left: String(s.paddingLeft ?? "0px"),
    right: String(s.paddingRight ?? "0px")
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 pointer-events-none z-30", children: SIDES.map((side) => /* @__PURE__ */ jsx("div", { style: buildMarginSlabStyle(side, margin[side]), children: /* @__PURE__ */ jsx(SpacingValueLabel, { value: margin[side], type: "margin", side }) }, side)) }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 pointer-events-none z-30",
        style: {
          borderTopWidth: padding.top,
          borderRightWidth: padding.right,
          borderBottomWidth: padding.bottom,
          borderLeftWidth: padding.left,
          borderColor: "rgba(16, 185, 129, 0.15)",
          borderStyle: "solid",
          boxSizing: "border-box"
        },
        children: /* @__PURE__ */ jsx("div", { className: "w-full h-full border border-dashed border-emerald-500/30 relative", children: SIDES.map((side) => /* @__PURE__ */ jsx(SpacingValueLabel, { value: padding[side], type: "padding", side }, side)) })
      }
    )
  ] });
});
const ElementLabel = memo(function ElementLabel2({
  element,
  showSpacingInfo,
  onToggleSpacing
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "absolute top-0 left-0 z-40 text-xs px-2 py-1 pointer-events-none select-none rounded-sm flex items-center gap-2 transition-all duration-200 shadow-sm",
        showSpacingInfo ? "bg-orange-50 text-orange-700 border border-orange-200" : "bg-blue-500 text-white border border-blue-600"
      ),
      style: {
        transform: "translateY(-100%) translateY(-4px)",
        maxWidth: "200px"
      },
      children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold truncate max-w-25", children: element.type }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "h-3 w-px shrink-0",
              showSpacingInfo ? "bg-orange-200" : "bg-blue-400"
            )
          }
        ),
        showSpacingInfo ? /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider", children: "Spacing" }) : /* @__PURE__ */ jsxs("span", { className: "text-[10px] opacity-90 font-mono", children: [
          element.styles?.default?.width ?? "auto",
          " ×",
          " ",
          element.styles?.default?.height ?? "auto"
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              onToggleSpacing();
            },
            className: cn(
              "ml-1 p-0.5 rounded hover:bg-black/10 transition-colors pointer-events-auto cursor-pointer",
              showSpacingInfo ? "text-orange-700" : "text-white"
            ),
            title: showSpacingInfo ? "Exit Spacing Mode" : "Enter Spacing Mode (Alt)",
            children: showSpacingInfo ? /* @__PURE__ */ jsx(X, { size: 10, strokeWidth: 3 }) : /* @__PURE__ */ jsx(Plus, { size: 10, strokeWidth: 3 })
          }
        )
      ]
    }
  );
});
const FLEX_DISPLAYS = /* @__PURE__ */ new Set(["flex", "grid", "inline-flex", "inline-grid"]);
const SPACING_HANDLES = [
  "margin-n",
  "margin-s",
  "margin-e",
  "margin-w",
  "padding-n",
  "padding-s",
  "padding-e",
  "padding-w"
];
function getVisibleHandles(element, isSelected, canResize, isResizing, currentResizeDirection, showSpacingHandles) {
  if (!isSelected || !canResize) return [];
  if (isResizing && currentResizeDirection) return [currentResizeDirection];
  if (showSpacingHandles) {
    const handles = [...SPACING_HANDLES];
    if (FLEX_DISPLAYS.has(element.styles?.default?.display ?? "")) {
      handles.push("gap");
    }
    return handles;
  }
  return getResizeHandles(element.styles?.default).filter(
    (h) => STANDARD_DIRECTIONS.has(h)
  );
}
function ResizeHandler({
  element,
  children,
  isReadOnly = false,
  isLocked = false,
  iframeRef
}) {
  const targetRef = useRef(null);
  const updateElement = useUpdateElement();
  const { draggedOverElement, selectedElement, hoveredElement } = useDragAndSelectionState();
  const { handleDoubleClick } = useElementHandler();
  const permissions = useEditorPermissions();
  const canResize = !isReadOnly && !isLocked && permissions.canEditElements;
  const {
    handleResizeStart,
    isResizing,
    currentResizeDirection,
    pendingStylesRef
  } = useResizeHandler({
    element,
    updateElement,
    targetRef,
    enabled: canResize
  });
  const [manualSpacingMode, setManualSpacingMode] = useState(false);
  const { showCommentButtons } = useElementCommentStore();
  const altKeyPressed = useAltKey(iframeRef);
  const showSpacingHandles = manualSpacingMode || altKeyPressed;
  const isSelected = selectedElement?.id === element.id;
  const isHovered = hoveredElement?.id === element.id && draggedOverElement?.id !== element.id && !isSelected;
  const isDraggedOver = draggedOverElement?.id === element.id && !isSelected;
  const visibleHandles = getVisibleHandles(
    element,
    isSelected,
    canResize,
    isResizing,
    currentResizeDirection,
    showSpacingHandles
  );
  return /* @__PURE__ */ jsx(ResizeContext, { value: { pendingStylesRef }, children: /* @__PURE__ */ jsxs(
    "div",
    {
      ref: targetRef,
      className: "relative group",
      style: {
        width: element.styles?.default?.width ?? "auto",
        height: element.styles?.default?.height ?? "auto"
      },
      id: element.id,
      onPointerDown: (e) => e.stopPropagation(),
      onDoubleClick: (e) => {
        e.stopPropagation();
        handleDoubleClick(e, element);
      },
      children: [
        isSelected && /* @__PURE__ */ jsx(
          ElementLabel,
          {
            element,
            showSpacingInfo: showSpacingHandles,
            onToggleSpacing: () => setManualSpacingMode((prev) => !prev)
          }
        ),
        isSelected && showCommentButtons && /* @__PURE__ */ jsx(ElementCommentButton, { element }),
        children,
        isSelected && /* @__PURE__ */ jsx(SpacingOverlay, { element, show: showSpacingHandles }),
        visibleHandles.map((dir) => /* @__PURE__ */ jsx(
          ResizeHandle,
          {
            direction: dir,
            onResizeStart: handleResizeStart,
            element,
            isResizing,
            currentResizeDirection
          },
          dir
        )),
        isSelected && !showSpacingHandles && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 pointer-events-none rounded-sm transition-all duration-200 border-2 border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.1)]" }),
        isHovered && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 border-2 border-blue-400/50 z-20 rounded-sm transition-colors duration-100" }),
        isDraggedOver && /* @__PURE__ */ jsx(
          "div",
          {
            className: "pointer-events-none absolute inset-0 border-2 border-dashed border-green-600 z-20 rounded-sm bg-green-500/5",
            style: { boxShadow: "0 0 0 1px rgba(22, 163, 74, 0.1)" }
          }
        )
      ]
    }
  ) });
}
function ContextMenu({
  ...props
}) {
  return /* @__PURE__ */ jsx(ContextMenu$1.Root, { "data-slot": "context-menu", ...props });
}
function ContextMenuTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(ContextMenu$1.Trigger, { "data-slot": "context-menu-trigger", ...props });
}
function ContextMenuPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(ContextMenu$1.Portal, { "data-slot": "context-menu-portal", ...props });
}
function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    ContextMenu$1.Item,
    {
      "data-slot": "context-menu-item",
      "data-inset": inset,
      "data-variant": variant,
      className: cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function ContextMenuSeparator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    ContextMenu$1.Separator,
    {
      "data-slot": "context-menu-separator",
      className: cn("bg-border -mx-1 my-1 h-px", className),
      ...props
    }
  );
}
class KeyboardEvent {
  constructor() {
    this.isReadOnly = false;
    this.isLocked = false;
    this.setReadOnly = (value) => {
      this.isReadOnly = value;
    };
    this.setLocked = (value) => {
      this.isLocked = value;
    };
    this.copyElement = () => {
      const selectedElement = SelectionStore.getState().selectedElement || SelectionStore.getState().hoveredElement;
      if (!selectedElement) return;
      sessionStorage.setItem("copiedElement", JSON.stringify(selectedElement));
    };
    this.cutElement = () => {
      if (this.isReadOnly || this.isLocked) {
        toast.error("Cannot cut elements - editor is in read-only mode", {
          duration: 2e3
        });
        return;
      }
      const selectedElement = SelectionStore.getState().selectedElement || SelectionStore.getState().hoveredElement;
      if (!selectedElement) return;
      sessionStorage.setItem("copiedElement", JSON.stringify(selectedElement));
      ElementStore.getState().deleteElement(selectedElement.id);
      SelectionStore.getState().setSelectedElement(void 0);
    };
    this.pasteElement = () => {
      if (this.isReadOnly || this.isLocked) {
        toast.error("Cannot paste elements - editor is in read-only mode", {
          duration: 2e3
        });
        return;
      }
      const copiedElement = sessionStorage.getItem("copiedElement");
      if (!copiedElement) return;
      const elementData = JSON.parse(copiedElement);
      let newElement = { ...elementData, id: v4() };
      if (elementHelper.isContainerElement(newElement)) {
        const updateIdsRecursively = (element) => {
          const updatedElements = element.elements.map((child) => {
            const newChild = { ...child, id: v4() };
            if (elementHelper.isContainerElement(newChild)) {
              return updateIdsRecursively(newChild);
            }
            return newChild;
          });
          return { ...element, elements: updatedElements };
        };
        newElement = updateIdsRecursively(newElement);
      }
      const elementState = ElementStore.getState();
      elementState.addElement(newElement);
    };
    this.bringToFront = () => {
      if (this.isReadOnly || this.isLocked) {
        toast.error("Cannot reorder elements - editor is in read-only mode", {
          duration: 2e3
        });
        return;
      }
      const selectedElement = SelectionStore.getState().selectedElement || SelectionStore.getState().hoveredElement;
      if (!selectedElement) return;
      const elementState = ElementStore.getState();
      const elements = elementState.elements;
      const idx = elements.findIndex(
        (el) => el.id === selectedElement.id
      );
      if (idx === -1) return;
      const newElements = [...elements];
      const [removed] = newElements.splice(idx, 1);
      newElements.push(removed);
      elementState.loadElements(newElements);
    };
    this.sendToBack = () => {
      if (this.isReadOnly || this.isLocked) {
        toast.error("Cannot reorder elements - editor is in read-only mode", {
          duration: 2e3
        });
        return;
      }
      const selectedElement = SelectionStore.getState().selectedElement || SelectionStore.getState().hoveredElement;
      if (!selectedElement) return;
      const elementState = ElementStore.getState();
      const elements = elementState.elements;
      const idx = elements.findIndex(
        (el) => el.id === selectedElement.id
      );
      if (idx === -1) return;
      const newElements = [...elements];
      const [removed] = newElements.splice(idx, 1);
      newElements.unshift(removed);
      elementState.loadElements(newElements);
    };
    this.deleteElement = () => {
      if (this.isReadOnly || this.isLocked) {
        toast.error("Cannot delete elements - editor is in read-only mode", {
          duration: 2e3
        });
        return;
      }
      const selectedElement = SelectionStore.getState().selectedElement || SelectionStore.getState().hoveredElement;
      if (!selectedElement) return;
      ElementStore.getState().deleteElement(selectedElement.id);
      SelectionStore.getState().setSelectedElement(void 0);
    };
    this.deselectAll = () => {
      SelectionStore.getState().setSelectedElement(void 0);
    };
    this.undo = () => {
      ElementStore.getState().undo();
    };
    this.redo = () => {
      ElementStore.getState().redo();
    };
    this.saveElement = async () => {
    };
  }
}
function SaveElementDialog({
  open,
  onOpenChange
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [savedElementName, setSavedElementName] = useState("");
  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }
    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters long.");
      return;
    }
    const selectedElement = SelectionStore.getState().selectedElement || SelectionStore.getState().hoveredElement;
    if (!selectedElement) {
      setError("No element selected to save.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await apiClient.post(
        new URLBuilder("api").setPath(API_ENDPOINTS.CUSTOM_ELEMENTS.CREATE).build(),
        {
          name: trimmedName,
          description: description.trim() || void 0,
          structure: selectedElement,
          defaultProps: {},
          isPublic,
          version: "1.0.0"
        }
      );
      setName("");
      setDescription("");
      setIsPublic(false);
      onOpenChange(false);
      setSavedElementName(trimmedName);
      setShowSuccessDialog(true);
    } catch (error2) {
      console.error("Error saving element:", error2);
      if (error2.message?.includes("409") || error2.message?.includes("already exists")) {
        setError(
          "An element with this name already exists. Please choose a different name."
        );
      } else if (error2.message?.includes("400")) {
        setError("Invalid data provided. Please check your input.");
      } else {
        setError("Failed to save element. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancel = () => {
    setName("");
    setDescription("");
    setIsPublic(false);
    setError("");
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Save Element" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Save this element as a reusable custom component." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "name", className: "text-right", children: "Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "name",
              value: name,
              onChange: (e) => {
                setName(e.target.value);
                if (error) setError("");
              },
              className: "col-span-3",
              placeholder: "Enter element name"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "description", className: "text-right", children: "Description" }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              id: "description",
              value: description,
              onChange: (e) => setDescription(e.target.value),
              className: "col-span-3",
              placeholder: "Optional description",
              rows: 3
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "public", className: "text-right", children: "Public" }),
          /* @__PURE__ */ jsxs("div", { className: "col-span-3 flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: "public",
                checked: isPublic,
                onCheckedChange: (checked) => setIsPublic(checked)
              }
            ),
            /* @__PURE__ */ jsx(
              Label,
              {
                htmlFor: "public",
                className: "text-sm text-muted-foreground",
                children: "Make this element public for others to use"
              }
            )
          ] })
        ] }),
        error && /* @__PURE__ */ jsx("div", { className: "col-span-4 text-sm text-red-600 bg-red-50 p-2 rounded", children: error })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: handleCancel, children: "Cancel" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: handleSave,
            disabled: !name.trim() || name.trim().length < 2 || isLoading,
            children: isLoading ? "Saving..." : "Save Element"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: showSuccessDialog, onOpenChange: setShowSuccessDialog, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[350px]", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100", children: /* @__PURE__ */ jsx(CheckCircle, { className: "h-6 w-6 text-green-600" }) }),
        /* @__PURE__ */ jsx(DialogTitle, { className: "text-green-900 text-center", children: "Success!" }),
        /* @__PURE__ */ jsxs(DialogDescription, { className: "text-center", children: [
          'Element "',
          savedElementName,
          '" has been saved successfully as a custom component.'
        ] })
      ] }),
      /* @__PURE__ */ jsx(DialogFooter, { className: "justify-center mx-auto", children: /* @__PURE__ */ jsx(Button, { onClick: () => setShowSuccessDialog(false), children: "Continue" }) })
    ] }) })
  ] });
}
const keyboardEventHandler = new KeyboardEvent();
const EditorContextMenu = ({
  children,
  element,
  isReadOnly = false,
  isLocked = false
}) => {
  const setSelectedElement = useSetSelectedElement();
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const canEdit = !isReadOnly && !isLocked;
  const canDelete = !isReadOnly && !isLocked;
  const canReorder = !isReadOnly && !isLocked;
  const onCopy = () => {
    keyboardEventHandler.copyElement();
  };
  const onCut = () => {
    if (!canDelete) {
      toast.error("Cannot cut elements - editor is in read-only mode", {
        duration: 2e3
      });
      return;
    }
    keyboardEventHandler.cutElement();
  };
  const onPaste = () => {
    if (!canEdit) {
      toast.error("Cannot paste elements - editor is in read-only mode", {
        duration: 2e3
      });
      return;
    }
    keyboardEventHandler.pasteElement();
  };
  const onBringToFront = () => {
    if (!canReorder) {
      toast.error("Cannot reorder elements - editor is in read-only mode", {
        duration: 2e3
      });
      return;
    }
    keyboardEventHandler.bringToFront();
  };
  const onSendToBack = () => {
    if (!canReorder) {
      toast.error("Cannot reorder elements - editor is in read-only mode", {
        duration: 2e3
      });
      return;
    }
    keyboardEventHandler.sendToBack();
  };
  const onDelete = () => {
    if (!canDelete) {
      toast.error("Cannot delete elements - editor is in read-only mode", {
        duration: 2e3
      });
      return;
    }
    keyboardEventHandler.deleteElement();
  };
  const onSave = () => {
    if (!canEdit) {
      toast.error("Cannot save elements - editor is in read-only mode", {
        duration: 2e3
      });
      return;
    }
    setShowSaveDialog(true);
  };
  const triggerRef = React.useRef(null);
  const [portalContainer, setPortalContainer] = React.useState(null);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      ContextMenu,
      {
        onOpenChange: (open) => {
          if (open) {
            const ownerDoc = triggerRef.current?.ownerDocument;
            const container = ownerDoc && ownerDoc.body || (typeof document !== "undefined" ? document.body : null);
            setPortalContainer(container);
            setSelectedElement(element);
          } else {
            setPortalContainer(null);
          }
        },
        children: [
          /* @__PURE__ */ jsx(ContextMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
            "div",
            {
              ref: triggerRef,
              onContextMenu: (e) => e.stopPropagation(),
              style: { width: "100%", height: "100%" },
              children
            }
          ) }),
          portalContainer && portalContainer !== (typeof document !== "undefined" ? document.body : null) && /* @__PURE__ */ jsx(ContextMenuPortal, { container: portalContainer, children: /* @__PURE__ */ jsxs(
            ContextMenuPrimitive.Content,
            {
              "data-slot": "context-menu-content",
              className: "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-32 origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md w-48",
              children: [
                /* @__PURE__ */ jsx(ContextMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(
                  "div",
                  {
                    onClick: onCopy,
                    className: "flex justify-between cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                        /* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }),
                        "Copy"
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground w-10 text-left mr-1", children: "⌘C" })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsx(
                  ContextMenuItem,
                  {
                    asChild: true,
                    disabled: !canDelete,
                    onClick: (e) => {
                      if (!canDelete) {
                        e.preventDefault();
                      }
                    },
                    children: /* @__PURE__ */ jsxs(
                      "div",
                      {
                        onClick: onCut,
                        className: `flex justify-between cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${!canDelete ? "opacity-50 cursor-not-allowed" : ""}`,
                        children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                            /* @__PURE__ */ jsx(Layers, { className: "mr-2 h-4 w-4" }),
                            "Cut"
                          ] }),
                          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground w-10 text-left mr-1", children: "⌘X" })
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ContextMenuItem,
                  {
                    asChild: true,
                    disabled: !canEdit,
                    onClick: (e) => {
                      if (!canEdit) {
                        e.preventDefault();
                      }
                    },
                    children: /* @__PURE__ */ jsxs(
                      "div",
                      {
                        onClick: onPaste,
                        className: `flex justify-between cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`,
                        children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                            /* @__PURE__ */ jsx(Layers, { className: "mr-2 h-4 w-4" }),
                            "Paste"
                          ] }),
                          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground w-10 text-left mr-1", children: "⌘V" })
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(ContextMenuSeparator, { className: "bg-border -mx-1 my-1 h-px" }),
                /* @__PURE__ */ jsx(
                  ContextMenuItem,
                  {
                    asChild: true,
                    disabled: !canReorder,
                    onClick: (e) => {
                      if (!canReorder) {
                        e.preventDefault();
                      }
                    },
                    children: /* @__PURE__ */ jsxs(
                      "div",
                      {
                        onClick: onBringToFront,
                        className: `flex justify-between cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${!canReorder ? "opacity-50 cursor-not-allowed" : ""}`,
                        children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                            /* @__PURE__ */ jsx(ArrowUp, { className: "mr-2 h-4 w-4" }),
                            "Bring to Front"
                          ] }),
                          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground w-10 text-left mr-1", children: "⌘↑" })
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ContextMenuItem,
                  {
                    asChild: true,
                    disabled: !canReorder,
                    onClick: (e) => {
                      if (!canReorder) {
                        e.preventDefault();
                      }
                    },
                    children: /* @__PURE__ */ jsxs(
                      "div",
                      {
                        onClick: onSendToBack,
                        className: `flex justify-between cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${!canReorder ? "opacity-50 cursor-not-allowed" : ""}`,
                        children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                            /* @__PURE__ */ jsx(ArrowDown, { className: "mr-2 h-4 w-4" }),
                            "Send to Back"
                          ] }),
                          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground w-10 text-left mr-1", children: "⌘↓" })
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(ContextMenuSeparator, { className: "bg-border -mx-1 my-1 h-px" }),
                /* @__PURE__ */ jsx(
                  ContextMenuItem,
                  {
                    asChild: true,
                    disabled: !canEdit,
                    onClick: (e) => {
                      if (!canEdit) {
                        e.preventDefault();
                      }
                    },
                    children: /* @__PURE__ */ jsxs(
                      "div",
                      {
                        onClick: onSave,
                        className: `flex justify-between cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`,
                        children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                            /* @__PURE__ */ jsx(Save, { className: "mr-2 h-4 w-4" }),
                            "Save Element"
                          ] }),
                          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground w-10 text-left mr-1", children: "⌘S" })
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(ContextMenuSeparator, { className: "bg-border -mx-1 my-1 h-px" }),
                /* @__PURE__ */ jsx(
                  ContextMenuItem,
                  {
                    asChild: true,
                    disabled: !canDelete,
                    onClick: (e) => {
                      if (!canDelete) {
                        e.preventDefault();
                      }
                    },
                    children: /* @__PURE__ */ jsxs(
                      "div",
                      {
                        onClick: onDelete,
                        className: `text-destructive flex justify-between cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${!canDelete ? "opacity-50 cursor-not-allowed" : ""}`,
                        children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                            /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
                            "Delete"
                          ] }),
                          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground w-10 text-left mr-1", children: "⌘⌫" })
                        ]
                      }
                    )
                  }
                )
              ]
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      SaveElementDialog,
      {
        open: showSaveDialog,
        onOpenChange: setShowSaveDialog
      }
    )
  ] });
};
function ElementDropIndicator({
  isDropTarget,
  draggingElement,
  onDragOver,
  onDrop,
  className
}) {
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      onDragOver,
      onDrop,
      animate: {
        height: isDropTarget ? 60 : 0,
        opacity: isDropTarget ? 1 : 0
      },
      transition: { duration: 0.15 },
      className: cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg",
        "bg-primary/20 border-2 border-dashed border-primary/50",
        className
      ),
      children: isDropTarget && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-primary font-semibold text-sm", children: [
        /* @__PURE__ */ jsx(ArrowRightLeft, { className: "w-4 h-4 text-primary" }),
        /* @__PURE__ */ jsx("span", { children: draggingElement ? "Swap Here" : "Insert Here" })
      ] })
    }
  );
}
const EditorFlagsContext = createContext(null);
function useEditorFlags() {
  const ctx = useContext(EditorFlagsContext);
  if (!ctx) {
    throw new Error(
      "useEditorFlags must be used within an <EditorFlagsProvider>"
    );
  }
  return ctx;
}
function EditorFlagsProvider({
  isReadOnly,
  isLocked,
  permissionsRole,
  iframeRef,
  children
}) {
  const value = useMemo(
    () => ({ isReadOnly, isLocked, permissionsRole, iframeRef }),
    [isReadOnly, isLocked, permissionsRole, iframeRef]
  );
  return /* @__PURE__ */ jsx(EditorFlagsContext.Provider, { value, children });
}
const DragCtx = createContext(null);
function useDragContext() {
  const ctx = useContext(DragCtx);
  if (!ctx) {
    throw new Error("useDragContext must be used within a <DragProvider>");
  }
  return ctx;
}
function DragProvider({
  canDrag,
  isDraggingLocal,
  draggingElement,
  draggedOverElement,
  handleDragStart,
  handleDragEnd,
  handleHover,
  handleDrop,
  children
}) {
  const value = useMemo(
    () => ({
      canDrag,
      isDraggingLocal,
      draggingElement,
      draggedOverElement,
      handleDragStart,
      handleDragEnd,
      handleHover,
      handleDrop
    }),
    [
      canDrag,
      isDraggingLocal,
      draggingElement,
      draggedOverElement,
      handleDragStart,
      handleDragEnd,
      handleHover,
      handleDrop
    ]
  );
  return /* @__PURE__ */ jsx(DragCtx.Provider, { value, children });
}
function ElementItem({ element, data, renderElement }) {
  const { isReadOnly, isLocked, permissionsRole, iframeRef } = useEditorFlags();
  const {
    canDrag,
    isDraggingLocal,
    draggingElement,
    draggedOverElement,
    handleDragStart,
    handleDragEnd,
    handleHover,
    handleDrop
  } = useDragContext();
  const isBeingDragged = isDraggingLocal === element.id;
  const isDropTarget = draggedOverElement?.id === element.id && !isBeingDragged;
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      className: cn(
        "relative",
        isBeingDragged && "opacity-50 z-50",
        isDropTarget && "ring-2 ring-blue-500 ring-offset-2 rounded-lg"
      ),
      draggable: canDrag,
      onDragStart: (e) => handleDragStart(e, element),
      onDragEnd: handleDragEnd,
      onDragOver: (e) => handleHover(e, element),
      onDrop: (e) => handleDrop(e, element),
      style: { cursor: canDrag ? "grab" : "default" },
      children: /* @__PURE__ */ jsxs(
        ResizeHandler,
        {
          element,
          isReadOnly,
          isLocked,
          iframeRef,
          children: [
            permissionsRole === CollaboratorRole.VIEWER ? renderElement(element) : /* @__PURE__ */ jsx(
              EditorContextMenu,
              {
                element,
                isReadOnly,
                isLocked,
                children: renderElement(element)
              }
            ),
            /* @__PURE__ */ jsx(
              ElementDropIndicator,
              {
                isDropTarget,
                draggingElement,
                onDragOver: (e) => handleHover(e, element),
                onDrop: (e) => handleDrop(e, element)
              }
            )
          ]
        }
      )
    }
  );
}
const ElementItem$1 = React__default.memo(ElementItem);
function ElementReorderList({
  items,
  onReorder,
  renderElement,
  className
}) {
  const { isReadOnly, isLocked, iframeRef, permissionsRole } = useEditorFlags();
  if (!items || items.length === 0) return null;
  return /* @__PURE__ */ jsx(
    Reorder.Group,
    {
      axis: "y",
      values: items,
      onReorder,
      as: "div",
      className: cn("relative", className),
      children: items.map((element) => /* @__PURE__ */ jsx(
        Reorder.Item,
        {
          value: element,
          as: "div",
          className: "relative",
          whileDrag: {
            scale: 1.02,
            boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.3)",
            zIndex: 50
          },
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 30
          },
          children: /* @__PURE__ */ jsx(
            ResizeHandler,
            {
              element,
              isReadOnly,
              isLocked,
              iframeRef,
              children: permissionsRole === CollaboratorRole.VIEWER ? renderElement(element) : /* @__PURE__ */ jsx(
                EditorContextMenu,
                {
                  element,
                  isReadOnly,
                  isLocked,
                  children: renderElement(element)
                }
              )
            }
          )
        },
        element.id
      ))
    }
  );
}
function ElementLoader({
  elements,
  data,
  isReadOnly = false,
  isLocked = false,
  enableReorder = false,
  iframeRef,
  isExport = false
} = {}) {
  const { id } = useParams({ strict: false });
  const {
    items,
    permissions,
    canDrag,
    isDraggingLocal,
    draggingElement,
    draggedOverElement,
    handleHover,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleReorder
  } = useElementDragHandlers({
    elements,
    isReadOnly,
    isLocked,
    projectId: id || null
  });
  const renderElement = useCallback(
    (element) => /* @__PURE__ */ jsx(ElementRenderer$1, { element, data }, element.id),
    [data]
  );
  if (isExport) {
    return /* @__PURE__ */ jsx(Fragment, { children: items?.map((el) => /* @__PURE__ */ jsx(ElementRenderer$1, { element: el, data }, el.id)) });
  }
  const editorFlagsValue = {
    isReadOnly,
    isLocked,
    permissionsRole: permissions?.role ?? null,
    iframeRef
  };
  const dragContextValue = {
    canDrag,
    isDraggingLocal,
    draggingElement,
    draggedOverElement,
    handleDragStart,
    handleDragEnd,
    handleHover,
    handleDrop
  };
  if (enableReorder && canDrag && items && items.length > 1) {
    return /* @__PURE__ */ jsx(EditorFlagsProvider, { ...editorFlagsValue, children: /* @__PURE__ */ jsx(
      ElementReorderList,
      {
        items,
        onReorder: handleReorder,
        renderElement
      }
    ) });
  }
  return /* @__PURE__ */ jsx(EditorFlagsProvider, { ...editorFlagsValue, children: /* @__PURE__ */ jsx(DragProvider, { ...dragContextValue, children: items?.map((element) => /* @__PURE__ */ jsx(
    ElementItem$1,
    {
      element,
      renderElement
    },
    element.id
  )) }) });
}
const CMSContentGridComponent = ({ element, data }) => {
  const cmsElement = element;
  const { getCommonProps } = useElementHandler();
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const safeStyles = elementHelper.getSafeStyles(cmsElement);
  const settings = cmsElement.settings || {};
  const {
    contentTypeId,
    limit = 6,
    sortBy = "createdAt",
    sortOrder = "desc",
    fieldsToShow = ["title", "content"]
  } = settings;
  const { contentItems } = useCMSContent({
    contentTypeId,
    limit,
    sortBy,
    sortOrder,
    enabled: !!contentTypeId
  });
  const itemsToRender = Array.isArray(data) ? data : contentItems?.length ? contentItems : [];
  const limitedItems = itemsToRender.slice(0, limit);
  const rootProps = {
    ref: elementRef,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...getCommonProps(cmsElement),
    ...eventHandlers,
    style: {
      ...safeStyles,
      width: "100%",
      height: "100%",
      ...eventsStyle(eventsActive)
    }
  };
  if (!contentTypeId) {
    return /* @__PURE__ */ jsx(
      CMSEmptyState,
      {
        ...rootProps,
        title: "CMS Content Grid",
        description: "Configure content type in settings"
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      ...rootProps,
      className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
      children: /* @__PURE__ */ jsx(LayoutGroup, { children: limitedItems.map((item, index) => /* @__PURE__ */ jsx("div", { className: "group", children: cmsElement.elements?.length ? /* @__PURE__ */ jsx(
        ElementLoader,
        {
          elements: cmsElement.elements,
          data: item
        }
      ) : /* @__PURE__ */ jsx(
        DefaultItemCard,
        {
          item,
          index,
          fieldsToShow
        }
      ) }, item.id || index)) })
    }
  );
};
function DefaultItemCard({ item, index, fieldsToShow }) {
  const KNOWN_FIELDS = [
    "title",
    "excerpt",
    "content",
    "image",
    "author",
    "date",
    "status"
  ];
  return /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden", children: [
    fieldsToShow.includes("image") && getFieldValue(item, "image") && /* @__PURE__ */ jsx("div", { className: "aspect-video bg-gray-100 flex items-center justify-center", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: getFieldValue(item, "image"),
        alt: item.title,
        className: "w-full h-full object-cover"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
      fieldsToShow.includes("title") && /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors", children: item.title || `Item ${index + 1}` }),
      fieldsToShow.includes("excerpt") && getFieldValue(item, "excerpt") && /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mb-3 line-clamp-3", children: getFieldValue(item, "excerpt") }),
      fieldsToShow.includes("content") && getFieldValue(item, "content") && !getFieldValue(item, "excerpt") && /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-sm mb-3 line-clamp-3", children: [
        getFieldValue(item, "content")?.substring(0, 120),
        "..."
      ] }),
      fieldsToShow.includes("author") && getFieldValue(item, "author") && /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-sm mb-2", children: [
        "By ",
        getFieldValue(item, "author")
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [
        fieldsToShow.includes("date") && /* @__PURE__ */ jsx("span", { children: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "" }),
        fieldsToShow.includes("status") && item.published && /* @__PURE__ */ jsx("span", { className: "bg-green-100 text-green-800 px-2 py-1 rounded-full", children: "Published" })
      ] }),
      fieldsToShow.filter((f) => !KNOWN_FIELDS.includes(f)).map((fieldName) => {
        const fieldValue = getFieldValue(item, fieldName);
        if (!fieldValue) return null;
        return /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-gray-500 capitalize", children: [
            fieldName,
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-700 ml-1", children: typeof fieldValue === "boolean" ? fieldValue ? "Yes" : "No" : String(fieldValue) })
        ] }, fieldName);
      })
    ] })
  ] });
}
const CMSContentItemComponent = ({ element, data }) => {
  const cmsElement = element;
  const { getCommonProps } = useElementHandler();
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const safeStyles = elementHelper.getSafeStyles(cmsElement);
  const settings = cmsElement.settings || {};
  const { contentTypeId, itemSlug } = settings;
  const { contentItem, isFetching } = useCMSContentItem(
    contentTypeId || "",
    itemSlug || ""
  );
  const itemToRender = data || contentItem;
  const rootProps = {
    ref: elementRef,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...getCommonProps(cmsElement),
    ...eventHandlers,
    style: {
      ...safeStyles,
      width: "100%",
      height: "100%",
      ...eventsStyle(eventsActive)
    }
  };
  if (!contentTypeId) {
    return /* @__PURE__ */ jsx(
      CMSEmptyState,
      {
        ...rootProps,
        title: "CMS Content Item",
        description: "Configure content type and slug in settings"
      }
    );
  }
  if (!itemSlug) {
    return /* @__PURE__ */ jsx(
      CMSEmptyState,
      {
        ...rootProps,
        title: "CMS Content Item",
        description: "Select an item in settings"
      }
    );
  }
  return /* @__PURE__ */ jsx("div", { ...rootProps, children: cmsElement.elements?.length ? /* @__PURE__ */ jsx(
    ElementLoader,
    {
      elements: cmsElement.elements,
      data: itemToRender
    }
  ) : isFetching ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-8 text-muted-foreground text-sm", children: "Loading..." }) : itemToRender ? /* @__PURE__ */ jsxs("article", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-2", children: itemToRender.title }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600", children: [
        "By ",
        getFieldValue(itemToRender, "author"),
        " •",
        " ",
        itemToRender.createdAt ? new Date(itemToRender.createdAt).toLocaleDateString() : ""
      ] })
    ] }),
    getFieldValue(itemToRender, "excerpt") && /* @__PURE__ */ jsx("p", { className: "text-lg text-gray-700 mb-6 italic", children: getFieldValue(itemToRender, "excerpt") }),
    /* @__PURE__ */ jsx("div", { className: "prose prose-lg max-w-none", children: /* @__PURE__ */ jsx(
      "div",
      {
        dangerouslySetInnerHTML: {
          __html: getFieldValue(itemToRender, "content") || "Sample content would be rendered here."
        }
      }
    ) }),
    /* @__PURE__ */ jsx("footer", { className: "mt-8 pt-4 border-t border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500", children: [
      "Published: ",
      itemToRender.published ? "Yes" : "No",
      " • Slug:",
      " ",
      itemToRender.slug
    ] }) })
  ] }) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-8 text-muted-foreground text-sm", children: "Item not found" }) });
};
const CMSContentListComponent = ({ element, data }) => {
  const cmsElement = element;
  const { getCommonProps } = useElementHandler();
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const safeStyles = elementHelper.getSafeStyles(cmsElement);
  const settings = cmsElement.settings || {};
  const {
    contentTypeId,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    displayMode = "list"
  } = settings;
  const { contentItems } = useCMSContent({
    contentTypeId,
    limit,
    sortBy,
    sortOrder,
    enabled: !!contentTypeId
  });
  const itemsToRender = Array.isArray(data) ? data : contentItems?.length ? contentItems : [];
  const limitedItems = itemsToRender.slice(0, limit);
  const rootProps = {
    ref: elementRef,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...getCommonProps(cmsElement),
    ...eventHandlers,
    style: {
      ...safeStyles,
      width: "100%",
      height: "100%",
      ...eventsStyle(eventsActive)
    }
  };
  if (!contentTypeId) {
    return /* @__PURE__ */ jsx(
      CMSEmptyState,
      {
        ...rootProps,
        title: "CMS Content List",
        description: "Configure content type in settings"
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      ...rootProps,
      className: displayMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "",
      children: /* @__PURE__ */ jsx(LayoutGroup, { children: limitedItems.map((item, index) => /* @__PURE__ */ jsx(
        "div",
        {
          className: displayMode === "list" ? "mb-4" : "",
          children: cmsElement.elements?.length ? /* @__PURE__ */ jsx(
            ElementLoader,
            {
              elements: cmsElement.elements,
              data: item
            }
          ) : /* @__PURE__ */ jsxs("div", { className: "border rounded-lg p-4 bg-white shadow-sm", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg mb-2", children: getFieldValue(item, "title") || `Item ${index + 1}` }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm", children: getFieldValue(item, "content") || "Sample content" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-400 mt-2", children: getFieldValue(item, "createdAt") ? new Date(
              getFieldValue(item, "createdAt")
            ).toLocaleDateString() : "" })
          ] })
        },
        item.id || index
      )) })
    }
  );
};
const CarouselComponent = ({ element, data }) => {
  const carouselElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  if (!carouselElement.elements) {
    return /* @__PURE__ */ jsx("div", { children: "No carousel content available." });
  }
  const carouselSettings = carouselElement.settings ?? {};
  const hasNavigation = carouselSettings.withNavigation ?? true;
  const safeStyles = elementHelper.getSafeStyles(carouselElement);
  return /* @__PURE__ */ jsxs(
    Carousel,
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      ...getCommonProps(carouselElement),
      ...eventHandlers,
      opts: carouselSettings,
      className: cn("w-full h-full"),
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive)
      },
      role: "region",
      "aria-roledescription": "carousel",
      children: [
        /* @__PURE__ */ jsx(CarouselContent, { children: carouselElement.elements.map((slide) => /* @__PURE__ */ jsx(CarouselItem, { children: /* @__PURE__ */ jsx("div", { className: "p-1 h-full w-full", children: /* @__PURE__ */ jsx(ElementLoader, { elements: [slide], data }) }) }, slide.id)) }),
        hasNavigation && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(CarouselPrevious, {}),
          /* @__PURE__ */ jsx(CarouselNext, {})
        ] })
      ]
    }
  );
};
function FormComponent({ element, data }) {
  const formElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const addElement = useAddElement();
  const { currentPage } = usePageStore();
  const selectedElement = useSelectedElement();
  const isSelected = selectedElement?.id === formElement.id;
  const settings = formElement.settings ?? {
    method: "post",
    action: "",
    target: "_self",
    autoComplete: "on"
  };
  const safeStyles = elementHelper.getSafeStyles(formElement);
  const handleAddField = () => {
    const newField = ElementFactory.getInstance().createElement({
      type: "Input",
      pageId: currentPage?.Id || "",
      parentId: formElement.id
    });
    if (newField) addElement(newField);
  };
  return /* @__PURE__ */ jsxs(
    "form",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      ...getCommonProps(formElement),
      ...eventHandlers,
      className: cn(
        "flex flex-col gap-4 p-6 border rounded-xl transition-all duration-200",
        "bg-card text-card-foreground border-border shadow-sm",
        formElement.tailwindStyles
      ),
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive)
      },
      action: settings.action,
      method: settings.method,
      target: settings.target,
      autoComplete: settings.autoComplete,
      noValidate: settings.noValidate,
      children: [
        /* @__PURE__ */ jsx(ElementLoader, { elements: formElement.elements, data }),
        isSelected && /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            className: "w-full border-dashed border-2 hover:border-solid hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all",
            onClick: handleAddField,
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
              " Add Form Field"
            ]
          }
        )
      ]
    }
  );
}
const FrameComponent = ({ element, data }) => {
  const frameElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(frameElement);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      ...getCommonProps(frameElement),
      ...eventHandlers,
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive)
      },
      children: /* @__PURE__ */ jsx(ElementLoader, { elements: frameElement.elements, data })
    }
  );
};
const ImageComponent = ({ element }) => {
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useMediaDrop({
    element,
    mediaType: "image"
  });
  const imageSettings = element.type === "Image" ? element.settings : null;
  const objectFit = imageSettings?.objectFit ?? "cover";
  const loading = imageSettings?.loading ?? "lazy";
  const decoding = imageSettings?.decoding ?? "async";
  const dragHandlers = {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop
  };
  const wrapperProps = {
    ref: elementRef,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...eventHandlers,
    ...dragHandlers,
    style: eventsStyle(eventsActive)
  };
  if (element.src) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ...wrapperProps,
        className: cn(
          "relative w-full h-full",
          isDragOver && "ring-2 ring-primary ring-offset-2"
        ),
        children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: element.src,
              alt: element.name || "Image",
              style: { objectFit },
              loading,
              decoding,
              role: "img",
              className: "w-full h-full"
            }
          ),
          isDragOver && /* @__PURE__ */ jsx(DropOverlay, { label: "Drop to replace image" })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ...wrapperProps,
      className: cn(
        "w-full h-full",
        isDragOver && "ring-2 ring-primary ring-offset-2"
      ),
      children: [
        /* @__PURE__ */ jsx(Empty, { className: "w-full h-full", children: /* @__PURE__ */ jsxs(EmptyHeader, { children: [
          /* @__PURE__ */ jsx(EmptyMedia, { variant: "icon", children: /* @__PURE__ */ jsx(ImageIcon, {}) }),
          /* @__PURE__ */ jsx(EmptyTitle, { children: "No image selected" }),
          /* @__PURE__ */ jsx(EmptyDescription, { className: "text-xs", children: "Drag an image from the sidebar to add it here" })
        ] }) }),
        isDragOver && /* @__PURE__ */ jsx(DropOverlay, { label: "Drop to add image" })
      ]
    }
  );
};
const InputComponent = ({ element }) => {
  const inputElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(inputElement);
  const commonProps = getCommonProps(inputElement);
  return /* @__PURE__ */ jsx(
    "input",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      type: "text",
      placeholder: inputElement.content || "Input field",
      ...commonProps,
      ...eventHandlers,
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive)
      }
    }
  );
};
const ListComponent = ({ element, data }) => {
  const listElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(listElement);
  const itemsToRender = Array.isArray(data) ? data : listElement.elements || [];
  return /* @__PURE__ */ jsx(
    "ul",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      ...getCommonProps(listElement),
      ...eventHandlers,
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive)
      },
      children: /* @__PURE__ */ jsx(LayoutGroup, { children: itemsToRender.map((item, index) => /* @__PURE__ */ jsx("li", { className: "list-item", children: Array.isArray(data) ? /* @__PURE__ */ jsx(ElementLoader, { elements: listElement.elements, data: item }) : /* @__PURE__ */ jsx(ElementLoader, { elements: [item] }) }, index)) })
    }
  );
};
function SectionActions({ element }) {
  const insertElement = useInsertElement();
  const selectedElement = useSelectedElement();
  const { currentPage } = usePageStore();
  if (!selectedElement || selectedElement.id !== element.id) return null;
  if (!insertElement || !currentPage?.Id) return null;
  const handleCreateSection = () => {
    const newElement = ElementFactory.getInstance().createElement({
      type: "Section",
      pageId: currentPage.Id
    });
    if (newElement) {
      insertElement(element, newElement);
    }
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: -30,
        zIndex: 10
      },
      children: /* @__PURE__ */ jsx(
        Button,
        {
          className: "h-6 text-primary-foreground",
          onDoubleClick: handleCreateSection,
          children: "+ Add Section"
        }
      )
    }
  );
}
const SectionComponent = ({ element, data }) => {
  const sectionElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(sectionElement);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      ...getCommonProps(sectionElement),
      ...eventHandlers,
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        position: "relative",
        ...eventsStyle(eventsActive)
      },
      children: [
        /* @__PURE__ */ jsx(ElementLoader, { elements: sectionElement.elements, data }),
        /* @__PURE__ */ jsx(SectionActions, { element: sectionElement })
      ]
    }
  );
};
const SelectComponent = ({ element }) => {
  const selectElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const safeStyles = elementHelper.getSafeStyles(selectElement);
  const settings = selectElement.settings || {};
  const options = useMemo(
    () => settings.selectOptions ?? [
      {
        id: "default-1",
        label: selectElement.content || "Option 1",
        value: "option-1"
      },
      { id: "default-2", label: "Option 2", value: "option-2" }
    ],
    [settings.selectOptions, selectElement.content]
  );
  return /* @__PURE__ */ jsx(
    "select",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      ...eventHandlers,
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive)
      },
      className: cn(
        selectElement.tailwindStyles,
        "appearance-none bg-no-repeat"
      ),
      defaultValue: settings.defaultValue ?? "",
      required: settings.required,
      disabled: settings.disabled && !eventsActive,
      children: options.map((opt, index) => /* @__PURE__ */ jsx("option", { value: opt.value, children: opt.label }, opt.id || index))
    }
  );
};
export {
  elementEventWorkflowService as A,
  BaseComponent as B,
  CMSContentGridComponent as C,
  DropOverlay as D,
  ElementLoader as E,
  FrameComponent as F,
  useUpdateEventWorkflow as G,
  transformWorkflowToEventHandlers as H,
  InputComponent as I,
  useEventWorkflow as J,
  KeyboardEvent as K,
  ListComponent as L,
  useUpdateElement as M,
  useCMSContentTypes as N,
  useCMSContent as O,
  SelectComponent as S,
  useElements as a,
  useEditorPermissions as b,
  useAddElement as c,
  useSelectedElement as d,
  ElementFactory as e,
  CMSContentItemComponent as f,
  CMSContentListComponent as g,
  CarouselComponent as h,
  FormComponent as i,
  ImageComponent as j,
  SectionComponent as k,
  ButtonComponent as l,
  useSelectedElementWithSetter as m,
  useElementComments as n,
  useProjectComments as o,
  useEditorElement as p,
  useElementHandler as q,
  resolveContent as r,
  eventsStyle as s,
  useMediaDrop as t,
  useCollaboratorManager as u,
  useElementsWithActions as v,
  cmsService as w,
  useElementsWithLoad as x,
  useEventWorkflowActions as y,
  useCreateEventWorkflow as z
};
