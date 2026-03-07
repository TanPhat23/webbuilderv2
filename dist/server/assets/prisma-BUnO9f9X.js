import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState } from "react";
import { p as projectService } from "./project.service-Bci2lGYe.js";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, isNumber, includes, isUndefined, isNull, cloneDeep } from "lodash-es";
import z, { z as z$1 } from "zod";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
import { toast } from "sonner";
import { v4 } from "uuid";
import { clsx } from "clsx";
import { cva } from "class-variance-authority";
import { Slot, Dialog as Dialog$1, Tooltip as Tooltip$1, Label as Label$1, Tabs as Tabs$1 } from "radix-ui";
import { twMerge } from "tailwind-merge";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, Controller, useFormContext, useFormState, useForm } from "react-hook-form";
import "next-themes";
import "socket.io-client";
import { XIcon, ChevronUp, ChevronDown, Layers, Box, Check, Plus, Zap, CheckCircle, GitBranch, ArrowRight, PanelLeftIcon } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { PrismaPg } from "@prisma/adapter-pg";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as runtime from "@prisma/client/runtime/client";
const SECOND = 1e3;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const QUERY_CONFIG = {
  /** Rapidly-changing data – re-fetches after 1 minute. */
  SHORT: {
    staleTime: 1 * MINUTE,
    gcTime: 5 * MINUTE
  },
  /** Standard data – re-fetches after 5 minutes. */
  DEFAULT: {
    staleTime: 5 * MINUTE,
    gcTime: 30 * MINUTE
  },
  /** Rarely-changing data – re-fetches after 15 minutes. */
  LONG: {
    staleTime: 15 * MINUTE,
    gcTime: 1 * HOUR
  }
};
create((set) => ({
  userComponents: [],
  isLoading: false,
  error: null,
  setUserComponents: (components) => set({ userComponents: components }),
  addUserComponent: (component) => set((state) => ({ userComponents: [component, ...state.userComponents] })),
  updateUserComponent: (id, updates) => set((state) => ({
    userComponents: state.userComponents.map(
      (c) => c.id === id ? { ...c, ...updates } : c
    )
  })),
  removeUserComponent: (id) => set((state) => ({
    userComponents: state.userComponents.filter((c) => c.id !== id)
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));
const useElementCommentStore = create()(
  persist(
    (set) => ({
      isCommentsVisible: true,
      showCommentButtons: true,
      activeCommentElementId: void 0,
      viewMode: "all",
      sortOrder: "newest",
      toggleCommentsVisibility: () => {
        set((state) => ({ isCommentsVisible: !state.isCommentsVisible }));
      },
      setCommentsVisible: (visible) => {
        set({ isCommentsVisible: visible });
      },
      toggleCommentButtons: () => {
        set((state) => ({ showCommentButtons: !state.showCommentButtons }));
      },
      setCommentButtonsVisible: (visible) => {
        set({ showCommentButtons: visible });
      },
      setActiveCommentElement: (elementId) => {
        set({ activeCommentElementId: elementId });
      },
      setViewMode: (mode) => {
        set({ viewMode: mode });
      },
      setSortOrder: (order) => {
        set({ sortOrder: order });
      },
      clearActiveElement: () => {
        set({ activeCommentElementId: void 0 });
      }
    }),
    {
      name: "element-comments-ui-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isCommentsVisible: state.isCommentsVisible,
        showCommentButtons: state.showCommentButtons,
        viewMode: state.viewMode,
        sortOrder: state.sortOrder
      })
    }
  )
);
var NodeType = /* @__PURE__ */ ((NodeType2) => {
  NodeType2["TRIGGER"] = "trigger";
  NodeType2["ACTION"] = "action";
  NodeType2["CONDITION"] = "condition";
  NodeType2["OUTPUT"] = "output";
  NodeType2["ELEMENT"] = "element";
  return NodeType2;
})(NodeType || {});
const NODE_TYPE_LABELS = {
  [NodeType.TRIGGER]: "Trigger",
  [NodeType.ACTION]: "Action",
  [NodeType.CONDITION]: "Condition",
  [NodeType.OUTPUT]: "Output",
  [NodeType.ELEMENT]: "Element"
};
const NODE_TYPE_DESCRIPTIONS = {
  [NodeType.TRIGGER]: "Start point of the workflow",
  [NodeType.ACTION]: "Perform an action or task",
  [NodeType.CONDITION]: "Branch based on conditions",
  [NodeType.OUTPUT]: "End point of the workflow",
  [NodeType.ELEMENT]: "Canvas element event source"
};
const NODE_TYPE_COLORS = {
  trigger: {
    bg: "bg-accent/10 dark:bg-accent/20",
    border: "border-accent/30 dark:border-accent/60",
    borderSelected: "border-accent",
    shadowSelected: "shadow-accent/20",
    icon: "text-accent dark:text-accent-foreground",
    iconBg: "bg-accent/10 dark:bg-accent/20"
  },
  action: {
    bg: "bg-primary/10 dark:bg-primary/20",
    border: "border-primary/30 dark:border-primary/60",
    borderSelected: "border-primary",
    shadowSelected: "shadow-primary/20",
    icon: "text-primary dark:text-primary-foreground",
    iconBg: "bg-primary/10 dark:bg-primary/20"
  },
  condition: {
    bg: "bg-secondary/10 dark:bg-secondary/20",
    border: "border-secondary/30 dark:border-secondary/60",
    borderSelected: "border-secondary",
    shadowSelected: "shadow-secondary/20",
    icon: "text-secondary dark:text-secondary-foreground",
    iconBg: "bg-secondary/10 dark:bg-secondary/20"
  },
  output: {
    bg: "bg-muted/10 dark:bg-muted/20",
    border: "border-muted/30 dark:border-muted/60",
    borderSelected: "border-muted",
    shadowSelected: "shadow-muted/20",
    icon: "text-muted-foreground",
    iconBg: "bg-muted/10 dark:bg-muted/20"
  }
};
const WORKFLOW_EVENT_TYPES = [
  {
    value: "onClick",
    label: "On Click",
    description: "When element is clicked",
    category: "user-interaction"
  },
  {
    value: "onDoubleClick",
    label: "On Double Click",
    description: "When element is double-clicked",
    category: "user-interaction"
  },
  {
    value: "onMouseEnter",
    label: "On Mouse Enter",
    description: "When mouse enters element",
    category: "mouse-event"
  },
  {
    value: "onMouseLeave",
    label: "On Mouse Leave",
    description: "When mouse leaves element",
    category: "mouse-event"
  },
  {
    value: "onSubmit",
    label: "On Submit",
    description: "When form is submitted",
    category: "form-event"
  },
  {
    value: "onChange",
    label: "On Change",
    description: "When input value changes",
    category: "form-event"
  },
  {
    value: "onFocus",
    label: "On Focus",
    description: "When element receives focus",
    category: "focus-event"
  },
  {
    value: "onBlur",
    label: "On Blur",
    description: "When element loses focus",
    category: "focus-event"
  }
];
const CONNECTION_CONFIG = {
  strokeWidth: {
    default: 2,
    active: 3
  },
  // Use CSS variables / theme tokens so connection colors follow the app theme
  // and respond to light/dark modes defined in globals.css.
  colors: {
    default: "var(--color-border)",
    selected: "var(--color-accent)"
  }
};
const VALIDATION_ERRORS = {
  selfConnection: "Cannot connect a node to itself",
  triggerAsTarget: "Cannot connect to TRIGGER nodes",
  outputAsSource: "Cannot connect from OUTPUT nodes"
};
const ANIMATION_DURATIONS = {
  normal: 300
};
({
  [NodeType.TRIGGER]: {},
  [NodeType.ACTION]: {},
  [NodeType.CONDITION]: {},
  [NodeType.OUTPUT]: {},
  [NodeType.ELEMENT]: {}
});
const getNodeTypeColor = (nodeType) => {
  const colorMap = {
    [NodeType.TRIGGER]: "trigger",
    [NodeType.ACTION]: "action",
    [NodeType.CONDITION]: "condition",
    [NodeType.OUTPUT]: "output",
    [NodeType.ELEMENT]: "trigger"
  };
  return NODE_TYPE_COLORS[colorMap[nodeType]];
};
const elementEventWorkflowKeys = {
  all: ["elementEventWorkflows"],
  byElements: () => [...elementEventWorkflowKeys.all, "byElement"],
  byElement: (elementId) => [...elementEventWorkflowKeys.byElements(), elementId],
  byPages: () => [...elementEventWorkflowKeys.all, "byPage"],
  byPage: (pageId) => [...elementEventWorkflowKeys.byPages(), pageId]
};
const useElementEventWorkflowStore = create()(
  (set, get2) => ({
    connectionsByElement: {},
    loadedPages: /* @__PURE__ */ new Set(),
    loadingPages: /* @__PURE__ */ new Set(),
    setPageConnections: (pageId, connections) => {
      const grouped = {};
      for (const conn of connections) {
        if (!grouped[conn.elementId]) grouped[conn.elementId] = [];
        grouped[conn.elementId].push(conn);
      }
      set((state) => {
        const loadedPages = new Set(state.loadedPages);
        const loadingPages = new Set(state.loadingPages);
        loadedPages.add(pageId);
        loadingPages.delete(pageId);
        return {
          connectionsByElement: { ...state.connectionsByElement, ...grouped },
          loadedPages,
          loadingPages
        };
      });
    },
    addConnection: (connection) => {
      set((state) => {
        const existing = state.connectionsByElement[connection.elementId] ?? [];
        const alreadyExists = existing.some((c) => c.id === connection.id);
        if (alreadyExists) return state;
        return {
          connectionsByElement: {
            ...state.connectionsByElement,
            [connection.elementId]: [...existing, connection]
          }
        };
      });
    },
    removeConnection: (connectionId, elementId) => {
      set((state) => {
        const existing = state.connectionsByElement[elementId] ?? [];
        return {
          connectionsByElement: {
            ...state.connectionsByElement,
            [elementId]: existing.filter((c) => c.id !== connectionId)
          }
        };
      });
    },
    getElementConnections: (elementId) => {
      return get2().connectionsByElement[elementId] ?? [];
    },
    isPageLoaded: (pageId) => {
      return get2().loadedPages.has(pageId);
    },
    setPageLoading: (pageId, loading) => {
      set((state) => {
        const loadingPages = new Set(state.loadingPages);
        if (loading) {
          loadingPages.add(pageId);
        } else {
          loadingPages.delete(pageId);
        }
        return { loadingPages };
      });
    },
    reset: () => {
      set({
        connectionsByElement: {},
        loadedPages: /* @__PURE__ */ new Set(),
        loadingPages: /* @__PURE__ */ new Set()
      });
    }
  })
);
const useSelectionStore = create((set) => ({
  selectedElement: void 0,
  draggingElement: void 0,
  draggedOverElement: void 0,
  hoveredElement: void 0,
  setSelectedElement: (element) => set({ selectedElement: element }),
  setDraggingElement: (element) => set({ draggingElement: element }),
  setDraggedOverElement: (element) => set({ draggedOverElement: element }),
  setHoveredElement: (element) => set({ hoveredElement: element })
}));
const SelectionStore = useSelectionStore;
const CONTAINER_ELEMENT_TYPES = [
  "Frame",
  "Form",
  "List",
  "Section",
  "Carousel",
  "CMSContentList",
  "CMSContentItem",
  "CMSContentGrid",
  "Table",
  "Nav",
  "Header",
  "Footer",
  "Article",
  "Aside"
];
const EDITABLE_ELEMENT_TYPES = [
  "Text",
  "Span",
  "Heading",
  "Label",
  "Blockquote",
  "Code",
  "Button",
  "Input",
  "Textarea",
  "Select",
  "Link"
];
const ALL_ELEMENT_TYPES = [
  ...CONTAINER_ELEMENT_TYPES,
  ...EDITABLE_ELEMENT_TYPES,
  "Image",
  "Video",
  "Audio",
  "IFrame",
  "Separator",
  "Icon",
  "Checkbox",
  "Radio",
  "Progress"
];
const ELEMENT_ICON_MAP = {
  // Inline / Leaf
  Text: "Type",
  Span: "TextCursorInput",
  Heading: "Heading",
  Label: "Tag",
  Blockquote: "Quote",
  Code: "Code",
  Separator: "Minus",
  Icon: "Smile",
  // Media
  Image: "Image",
  Video: "Video",
  Audio: "Volume2",
  IFrame: "Globe",
  // Interactive
  Button: "MousePointerClick",
  Link: "Link",
  // Form
  Input: "FormInput",
  Textarea: "AlignLeft",
  Checkbox: "CheckSquare",
  Radio: "Circle",
  Select: "TextSelection",
  Form: "FormInput",
  Progress: "BarChart3",
  // Table
  Table: "Table",
  // Container / Layout
  Frame: "CardSim",
  Section: "CardSim",
  Nav: "Navigation",
  Header: "PanelTop",
  Footer: "PanelBottom",
  Article: "FileText",
  Aside: "PanelRight",
  // Carousel
  Carousel: "SlidersHorizontal",
  // List
  List: "List",
  // CMS
  CMSContentList: "List",
  CMSContentItem: "Database",
  CMSContentGrid: "Database"
};
const ELEMENT_LABELS = {
  // Inline / Leaf
  Text: "Text",
  Span: "Span",
  Heading: "Heading",
  Label: "Label",
  Blockquote: "Blockquote",
  Code: "Code",
  Separator: "Separator",
  Icon: "Icon",
  // Media
  Image: "Image",
  Video: "Video",
  Audio: "Audio",
  IFrame: "IFrame",
  // Interactive
  Button: "Button",
  Link: "Link",
  // Form
  Input: "Input",
  Textarea: "Textarea",
  Checkbox: "Checkbox",
  Radio: "Radio",
  Select: "Select",
  Form: "Form",
  Progress: "Progress",
  // Table
  Table: "Table",
  // Container / Layout
  Frame: "Frame",
  Section: "Section",
  Nav: "Nav",
  Header: "Header",
  Footer: "Footer",
  Article: "Article",
  Aside: "Aside",
  // Carousel
  Carousel: "Carousel",
  // List
  List: "List",
  // CMS
  CMSContentList: "CMS List",
  CMSContentItem: "CMS Item",
  CMSContentGrid: "CMS Grid"
};
const elementHolders = ALL_ELEMENT_TYPES.map(
  (type) => ({
    type,
    icon: ELEMENT_ICON_MAP[type],
    label: ELEMENT_LABELS[type]
  })
);
const componentMap = {
  // Inline / Leaf
  Text: () => import("./index-DkTisGLi.js").then(
    (m) => m.BaseComponent
  ),
  Span: () => import("./index-DkTisGLi.js").then(
    (m) => m.BaseComponent
  ),
  Heading: () => import("./index-DkTisGLi.js").then(
    (m) => m.HeadingComponent
  ),
  Label: () => import("./index-DkTisGLi.js").then(
    (m) => m.BaseComponent
  ),
  Blockquote: () => import("./index-DkTisGLi.js").then(
    (m) => m.BlockquoteComponent
  ),
  Code: () => import("./index-DkTisGLi.js").then(
    (m) => m.CodeComponent
  ),
  Separator: () => import("./index-DkTisGLi.js").then(
    (m) => m.SeparatorComponent
  ),
  Icon: () => import("./index-DkTisGLi.js").then(
    (m) => m.IconComponent
  ),
  // Media
  Image: () => import("./index-DkTisGLi.js").then(
    (m) => m.ImageComponent
  ),
  Video: () => import("./index-DkTisGLi.js").then(
    (m) => m.VideoComponent
  ),
  Audio: () => import("./index-DkTisGLi.js").then(
    (m) => m.AudioComponent
  ),
  IFrame: () => import("./index-DkTisGLi.js").then(
    (m) => m.IFrameComponent
  ),
  // Interactive
  Button: () => import("./index-DkTisGLi.js").then(
    (m) => m.ButtonComponent
  ),
  Link: () => import("./index-DkTisGLi.js").then(
    (m) => m.BaseComponent
  ),
  // Form
  Input: () => import("./index-DkTisGLi.js").then(
    (m) => m.InputComponent
  ),
  Textarea: () => import("./index-DkTisGLi.js").then(
    (m) => m.TextareaComponent
  ),
  Checkbox: () => import("./index-DkTisGLi.js").then(
    (m) => m.CheckboxComponent
  ),
  Radio: () => import("./index-DkTisGLi.js").then(
    (m) => m.RadioComponent
  ),
  Select: () => import("./index-DkTisGLi.js").then(
    (m) => m.SelectComponent
  ),
  Form: () => import("./index-DkTisGLi.js").then(
    (m) => m.FormComponent
  ),
  Progress: () => import("./index-DkTisGLi.js").then(
    (m) => m.ProgressComponent
  ),
  // Table
  Table: () => import("./index-DkTisGLi.js").then(
    (m) => m.TableComponent
  ),
  // Container / Layout
  Frame: () => import("./index-DkTisGLi.js").then(
    (m) => m.FrameComponent
  ),
  Section: () => import("./index-DkTisGLi.js").then(
    (m) => m.SectionComponent
  ),
  Nav: () => import("./index-DkTisGLi.js").then(
    (m) => m.SemanticContainerComponent
  ),
  Header: () => import("./index-DkTisGLi.js").then(
    (m) => m.SemanticContainerComponent
  ),
  Footer: () => import("./index-DkTisGLi.js").then(
    (m) => m.SemanticContainerComponent
  ),
  Article: () => import("./index-DkTisGLi.js").then(
    (m) => m.SemanticContainerComponent
  ),
  Aside: () => import("./index-DkTisGLi.js").then(
    (m) => m.SemanticContainerComponent
  ),
  // Carousel
  Carousel: () => import("./index-DkTisGLi.js").then(
    (m) => m.CarouselComponent
  ),
  // List
  List: () => import("./index-DkTisGLi.js").then(
    (m) => m.ListComponent
  ),
  // CMS
  CMSContentList: () => import("./index-DkTisGLi.js").then(
    (m) => m.CMSContentListComponent
  ),
  CMSContentItem: () => import("./index-DkTisGLi.js").then(
    (m) => m.CMSContentItemComponent
  ),
  CMSContentGrid: () => import("./index-DkTisGLi.js").then(
    (m) => m.CMSContentGridComponent
  )
};
const getComponentFactory = (elementType) => {
  return componentMap[elementType];
};
const ElementSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  content: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  styles: z.record(z.string(), z.unknown()).optional().nullable(),
  // Json type
  tailwindStyles: z.string().optional().nullable(),
  src: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  pageId: z.string().optional().nullable(),
  projectId: z.string(),
  order: z.number().optional().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable()
});
const asContainer = (el) => el;
const hasChildren = (el) => Array.isArray(asContainer(el).elements);
const children = (el) => asContainer(el).elements ?? [];
const EditorElementSchema = ElementSchema.extend({
  get elements() {
    return z$1.array(EditorElementSchema).optional();
  }
});
const EditorElementArraySchema = z$1.array(EditorElementSchema);
const isContainerElement = (element) => CONTAINER_ELEMENT_TYPES.includes(element.type);
const isEditableElement = (element) => EDITABLE_ELEMENT_TYPES.includes(element.type);
const findById = (elements, id) => {
  for (const el of elements) {
    if (el.id === id) return el;
    if (hasChildren(el)) {
      const found = findById(children(el), id);
      if (found) return found;
    }
  }
  return void 0;
};
const mapUpdateById = (elements, id, updater) => elements.map((el) => {
  if (el.id === id) return updater(el);
  if (hasChildren(el)) {
    return {
      ...el,
      elements: mapUpdateById(children(el), id, updater)
    };
  }
  return el;
});
const mapDeleteById = (elements, id) => elements.filter((el) => el.id !== id).map((el) => {
  if (hasChildren(el)) {
    return {
      ...el,
      elements: mapDeleteById(children(el), id)
    };
  }
  return el;
});
const mapInsertAfterId = (elements, targetId, toInsert) => {
  const idx = elements.findIndex((e) => e.id === targetId);
  if (idx !== -1) {
    const next = [...elements];
    next.splice(idx + 1, 0, toInsert);
    return next;
  }
  return elements.map((el) => {
    if (isContainerElement(el)) {
      return {
        ...el,
        elements: mapInsertAfterId(el.elements, targetId, toInsert)
      };
    }
    return el;
  });
};
const mapRecursively = (elements, updater) => elements.map((el) => {
  const updated = updater(el);
  if (isContainerElement(updated)) {
    return {
      ...updated,
      elements: mapRecursively(updated.elements, updater)
    };
  }
  return updated;
});
const mapAddChildById = (elements, parentId, childToAdd) => {
  if (!parentId) return [...elements, childToAdd];
  return mapUpdateById(elements, parentId, (parent) => {
    if (!isContainerElement(parent)) return parent;
    return {
      ...parent,
      elements: [...parent.elements, childToAdd]
    };
  });
};
const mapSwapChildrenById = (elements, parentId, id1, id2) => {
  const targetElements = !parentId ? elements : (() => {
    const parent = findById(elements, parentId);
    return parent && isContainerElement(parent) ? parent.elements : null;
  })();
  if (!targetElements) return elements;
  const idx1 = targetElements.findIndex((e) => e.id === id1);
  const idx2 = targetElements.findIndex((e) => e.id === id2);
  if (idx1 === -1 || idx2 === -1) return elements;
  const next = [...targetElements];
  [next[idx1], next[idx2]] = [next[idx2], next[idx1]];
  if (!parentId) return next;
  return mapUpdateById(
    elements,
    parentId,
    (parent) => ({ ...parent, elements: next })
  );
};
const insertAtPosition = (elements, element, position) => {
  const next = [...elements];
  if (position !== void 0 && position >= 0 && position <= elements.length) {
    next.splice(position, 0, element);
  } else {
    next.push(element);
  }
  return next;
};
const findParent = (elements, childId) => {
  for (const el of elements) {
    if (!hasChildren(el)) continue;
    if (children(el).some((c) => c.id === childId)) return el;
    const found = findParent(children(el), childId);
    if (found) return found;
  }
  return void 0;
};
const countElements = (elements) => elements.reduce(
  (acc, el) => acc + 1 + (hasChildren(el) ? countElements(children(el)) : 0),
  0
);
const flatten = (elements) => elements.flatMap((el) => [
  el,
  ...hasChildren(el) ? flatten(children(el)) : []
]);
const getAllIds = (elements) => flatten(elements).map((el) => el.id);
const exists = (elements, id) => findById(elements, id) !== void 0;
const getDepth = (elements, id, currentDepth = 0) => {
  for (const el of elements) {
    if (el.id === id) return currentDepth;
    if (hasChildren(el)) {
      const depth = getDepth(children(el), id, currentDepth + 1);
      if (depth !== -1) return depth;
    }
  }
  return -1;
};
const getPath = (elements, id) => {
  for (const el of elements) {
    if (el.id === id) return [id];
    if (hasChildren(el)) {
      const childPath = getPath(children(el), id);
      if (childPath.length > 0) return [el.id, ...childPath];
    }
  }
  return [];
};
const validate = (elements) => {
  const result = EditorElementArraySchema.safeParse(elements);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map(
        (issue) => `[${issue.path.join(".")}] ${issue.message}`
      )
    };
  }
  const errors = [];
  const seenIds = /* @__PURE__ */ new Set();
  const check = (els, parentId) => {
    for (const el of els) {
      if (seenIds.has(el.id)) {
        errors.push(`Duplicate element ID: ${el.id}`);
      } else {
        seenIds.add(el.id);
      }
      if (el.parentId !== parentId) {
        errors.push(
          `Element ${el.id} has incorrect parentId. Expected: ${parentId}, Got: ${el.parentId}`
        );
      }
      if (hasChildren(el)) check(children(el), el.id);
    }
  };
  check(elements, null);
  return { isValid: errors.length === 0, errors };
};
const ElementTreeHelper = {
  isContainerElement,
  isEditableElement,
  findById,
  mapUpdateById,
  mapDeleteById,
  mapInsertAfterId,
  mapRecursively,
  mapAddChildById,
  mapSwapChildrenById,
  insertAtPosition,
  findParent,
  countElements,
  flatten,
  getAllIds,
  exists,
  getDepth,
  getPath,
  validate
};
function handleSwap(draggingElement, hoveredElement, elements, setElements) {
  if (!hoveredElement || draggingElement.id === hoveredElement.id) {
    return;
  }
  if (draggingElement.parentId !== hoveredElement.parentId) {
    return;
  }
  const updatedElements = elementHelper.mapSwapChildrenById(
    elements,
    draggingElement.parentId ?? null,
    draggingElement.id,
    hoveredElement.id
  );
  if (updatedElements !== elements) {
    setElements(updatedElements);
  }
}
function computeTailwindFromStylesSingle(styles) {
  if (!styles) return "";
  const classes = [];
  const pushArbitrary = (prefix, raw) => {
    if (isEmptyValue(raw)) return;
    let normalized;
    if (isNumber(raw)) {
      normalized = `${raw}px`;
    } else {
      normalized = String(raw);
    }
    const safe = sanitizeForArbitrary(normalized);
    if (!safe) return;
    classes.push(`${prefix}-[${safe}]`);
  };
  const getMappedClass = (value, map, prefix) => {
    if (isEmptyValue(value)) return void 0;
    const strValue = String(value).trim();
    const mappedClass = get(map, strValue);
    return mappedClass || (prefix ? `${prefix}-[${sanitizeForArbitrary(strValue)}]` : void 0);
  };
  const width = get(styles, "width");
  if (!isEmptyValue(width)) {
    width === "auto" ? classes.push("w-auto") : pushArbitrary("w", width);
  }
  const height = get(styles, "height");
  if (!isEmptyValue(height)) {
    height === "auto" ? classes.push("h-auto") : pushArbitrary("h", height);
  }
  const bgColor = get(styles, "backgroundColor");
  if (bgColor) {
    pushIf(classes, `bg-[${sanitizeForArbitrary(bgColor)}]`);
  }
  const color = get(styles, "color");
  if (color) {
    pushIf(classes, `text-[${sanitizeForArbitrary(color)}]`);
  }
  const borderRadius = get(styles, "borderRadius");
  if (!isEmptyValue(borderRadius)) {
    const val = isNumber(borderRadius) ? `${borderRadius}px` : String(borderRadius);
    pushIf(classes, `rounded-[${sanitizeForArbitrary(val)}]`);
  }
  const borderWidth = get(styles, "borderWidth");
  if (!isEmptyValue(borderWidth)) {
    const val = isNumber(borderWidth) ? `${borderWidth}px` : String(borderWidth);
    pushIf(classes, `border-[${sanitizeForArbitrary(val)}]`);
  }
  const borderColor = get(styles, "borderColor");
  if (borderColor) {
    pushIf(classes, `border-[${sanitizeForArbitrary(borderColor)}]`);
  }
  const opacity = get(styles, "opacity");
  if (!isEmptyValue(opacity)) {
    let normalized;
    if (isNumber(opacity)) {
      normalized = opacity > 1 && opacity <= 100 ? String(opacity / 100) : String(opacity);
    } else {
      normalized = String(opacity);
    }
    pushIf(classes, `opacity-[${sanitizeForArbitrary(normalized)}]`);
  }
  const spacingProps = [
    "padding",
    "paddingTop",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "margin",
    "marginTop",
    "marginBottom",
    "marginLeft",
    "marginRight"
  ];
  const spacingPrefixes = {
    padding: "p",
    paddingTop: "pt",
    paddingBottom: "pb",
    paddingLeft: "pl",
    paddingRight: "pr",
    margin: "m",
    marginTop: "mt",
    marginBottom: "mb",
    marginLeft: "ml",
    marginRight: "mr"
  };
  spacingProps.forEach((prop) => {
    const value = get(styles, prop);
    if (!isEmptyValue(value)) {
      const prefix = get(spacingPrefixes, prop);
      pushArbitrary(prefix, value);
    }
  });
  const display = get(styles, "display");
  if (display) {
    const displayClass = get(DISPLAY_MAP, String(display).trim());
    displayClass ? classes.push(displayClass) : pushIf(classes, "block");
  }
  const flexDirection = get(styles, "flexDirection");
  if (flexDirection) {
    const flexClass = getMappedClass(flexDirection, FLEX_DIRECTION_MAP, "flex");
    if (flexClass) classes.push(flexClass);
  }
  const justifyContent = get(styles, "justifyContent");
  if (justifyContent) {
    const justifyClass = getMappedClass(
      justifyContent,
      JUSTIFY_CONTENT_MAP,
      "justify"
    );
    if (justifyClass) classes.push(justifyClass);
  }
  const alignItems = get(styles, "alignItems");
  if (alignItems) {
    const alignClass = getMappedClass(alignItems, ALIGN_ITEMS_MAP, "items");
    if (alignClass) classes.push(alignClass);
  }
  const gapProps = ["gap", "rowGap", "columnGap"];
  const gapPrefixes = { gap: "gap", rowGap: "row-gap", columnGap: "col-gap" };
  gapProps.forEach((prop) => {
    const value = get(styles, prop);
    if (!isEmptyValue(value)) {
      const prefix = get(gapPrefixes, prop);
      pushArbitrary(prefix, value);
    }
  });
  const fontSize = get(styles, "fontSize");
  if (!isEmptyValue(fontSize)) {
    pushArbitrary("text", fontSize);
  }
  const fontWeight = get(styles, "fontWeight");
  if (!isEmptyValue(fontWeight)) {
    if (isNumber(fontWeight)) {
      const weightClass = get(FONT_WEIGHT_MAP, fontWeight);
      weightClass ? classes.push(weightClass) : pushIf(classes, `font-[${sanitizeForArbitrary(String(fontWeight))}]`);
    } else {
      const weightStr = String(fontWeight).trim();
      if (includes(["normal", "400"], weightStr)) classes.push("font-normal");
      else if (includes(["bold", "700"], weightStr)) classes.push("font-bold");
      else pushIf(classes, `font-[${sanitizeForArbitrary(weightStr)}]`);
    }
  }
  const lineHeight = get(styles, "lineHeight");
  if (!isEmptyValue(lineHeight)) {
    pushArbitrary("leading", lineHeight);
  }
  const letterSpacing = get(styles, "letterSpacing");
  if (!isEmptyValue(letterSpacing)) {
    pushArbitrary("tracking", letterSpacing);
  }
  const textAlign = get(styles, "textAlign");
  if (textAlign) {
    const alignClass = getMappedClass(textAlign, TEXT_ALIGN_MAP, "text");
    if (alignClass) classes.push(alignClass);
  }
  const textTransform = get(styles, "textTransform");
  if (textTransform) {
    const transformClass = getMappedClass(
      textTransform,
      TEXT_TRANSFORM_MAP,
      ""
    );
    if (transformClass) classes.push(transformClass);
  }
  const textDecoration = get(styles, "textDecoration");
  if (textDecoration) {
    const decorationClass = getMappedClass(
      textDecoration,
      TEXT_DECORATION_MAP,
      ""
    );
    if (decorationClass) classes.push(decorationClass);
  }
  const fontStyle = get(styles, "fontStyle");
  if (fontStyle) {
    const styleStr = String(fontStyle).trim();
    if (includes(["italic", "oblique"], styleStr)) classes.push("italic");
  }
  const fontFamily = get(styles, "fontFamily");
  if (fontFamily) {
    const ffRaw = String(fontFamily).trim();
    if (isCssVar(ffRaw)) {
      pushIf(classes, `font-[${sanitizeForArbitrary(ffRaw)}]`);
    } else {
      if (/serif/i.test(ffRaw)) classes.push("serif");
      else if (/sans/i.test(ffRaw)) classes.push("sans");
      else if (/monospace/i.test(ffRaw)) classes.push("mono");
      else pushIf(classes, `font-[${sanitizeForArbitrary(ffRaw)}]`);
    }
  }
  const zIndex = get(styles, "zIndex");
  if (!isEmptyValue(zIndex)) {
    classes.push(`z-[${String(zIndex)}]`);
  }
  const offsetProps = ["top", "bottom", "left", "right"];
  offsetProps.forEach((prop) => {
    const value = get(styles, prop);
    if (!isEmptyValue(value)) {
      pushArbitrary(prop, value);
    }
  });
  return classes.join(" ").trim();
}
const isCssVar = (val) => /^var\(\s*--[a-zA-Z0-9\-_]+\s*\)$/.test(val.trim());
const basicClean = (val) => String(val).replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ").replace(/\[/g, "").replace(/\]/g, "").trim();
const isEmptyValue = (val) => isUndefined(val) || isNull(val) || val === "";
function sanitizeForArbitrary(raw) {
  const asStr = String(raw);
  let cleaned = basicClean(asStr);
  cleaned = cleaned.replace(/,\s+/g, ",");
  if (cleaned.length === 0) return "";
  if (isCssVar(cleaned)) return cleaned;
  const containsWhitespace = /\s/.test(cleaned);
  const containsSingleQuote = /'/.test(cleaned);
  const containsDoubleQuote = /"/.test(cleaned);
  if (containsWhitespace || containsSingleQuote || containsDoubleQuote) {
    const escaped = cleaned.replace(/'/g, "\\'");
    return `'${escaped}'`;
  }
  return cleaned;
}
const pushIf = (arr, cls) => {
  if (!cls) return;
  const n = String(cls).trim();
  if (n.length) arr.push(n);
};
const DISPLAY_MAP = {
  flex: "flex",
  grid: "grid",
  none: "hidden",
  "inline-block": "inline-block",
  block: "block"
};
const FLEX_DIRECTION_MAP = {
  column: "flex-col",
  "column-reverse": "flex-col-reverse",
  row: "flex-row",
  "row-reverse": "flex-row-reverse"
};
const JUSTIFY_CONTENT_MAP = {
  center: "justify-center",
  "flex-start": "justify-start",
  start: "justify-start",
  "flex-end": "justify-end",
  end: "justify-end",
  "space-between": "justify-between",
  "space-around": "justify-around",
  "space-evenly": "justify-evenly"
};
const ALIGN_ITEMS_MAP = {
  center: "items-center",
  "flex-start": "items-start",
  start: "items-start",
  "flex-end": "items-end",
  end: "items-end",
  stretch: "items-stretch"
};
const TEXT_ALIGN_MAP = {
  center: "text-center",
  right: "text-right",
  left: "text-left",
  justify: "text-justify",
  start: "text-left",
  end: "text-right"
};
const TEXT_TRANSFORM_MAP = {
  uppercase: "uppercase",
  lowercase: "lowercase",
  capitalize: "capitalize",
  none: "normal-case"
};
const TEXT_DECORATION_MAP = {
  underline: "underline",
  overline: "overline",
  "line-through": "line-through",
  lineThrough: "line-through",
  none: "no-underline"
};
const FONT_WEIGHT_MAP = {
  100: "font-thin",
  200: "font-extralight",
  300: "font-light",
  400: "font-normal",
  500: "font-medium",
  600: "font-semibold",
  700: "font-bold",
  800: "font-extrabold",
  900: "font-black"
};
function computeTailwindFromStyles(styles) {
  if (!styles) return "";
  const classes = [];
  const breakpoints = [
    "default",
    "sm",
    "md",
    "lg",
    "xl"
  ];
  breakpoints.forEach((bp) => {
    const bpStyles = styles[bp];
    if (bpStyles) {
      const prefix = bp === "default" ? "" : `${bp}:`;
      const bpClasses = computeTailwindFromStylesSingle(bpStyles);
      bpClasses.split(" ").forEach((cls) => {
        if (cls) classes.push(`${prefix}${cls}`);
      });
    }
  });
  return classes.join(" ");
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const BREAKPOINTS = ["default", "sm", "md", "lg", "xl"];
const getSafeStyles = (element) => {
  if (!element.styles || typeof element.styles !== "object" || Array.isArray(element.styles)) {
    return {};
  }
  const merged = {};
  const styles = element.styles;
  for (const bp of BREAKPOINTS) {
    if (styles[bp]) {
      Object.assign(merged, styles[bp]);
    }
  }
  return merged;
};
const replacePlaceholders = (text, data) => {
  if (!data || typeof data !== "object") return text;
  return text.replace(/\{\{([^}]+)\}\}/g, (match, placeholder) => {
    const [field, filter] = placeholder.split("|");
    let value = data;
    for (const part of field.split(".")) {
      if (value && typeof value === "object" && part in value) {
        value = value[part];
      } else {
        value = void 0;
        break;
      }
    }
    if (value === void 0) return match;
    if (filter === "date" && value) {
      try {
        value = new Date(String(value)).toLocaleDateString();
      } catch {
      }
    }
    return String(value);
  });
};
const getElementSettings = (element) => {
  if (!element || typeof element !== "object" || element.settings == null) {
    return null;
  }
  return JSON.stringify(element.settings);
};
const updateElementStyle = (element, styles, breakpoint, updateElement) => {
  const currentStyles = element.styles || {};
  const newStyles = { ...currentStyles, [breakpoint]: styles };
  try {
    const computedTailwind = computeTailwindFromStyles(
      newStyles
    );
    const mergedTailwind = twMerge(
      cn(element.tailwindStyles || "", computedTailwind)
    );
    updateElement(element.id, {
      styles: newStyles,
      tailwindStyles: mergedTailwind
    });
  } catch (err) {
    console.error("Failed to compute tailwind classes from styles:", err);
    updateElement(element.id, { styles: newStyles });
  }
};
function isValidElementType(value) {
  return typeof value === "string" && ALL_ELEMENT_TYPES.includes(value);
}
const elementHelper = {
  // styles
  getSafeStyles,
  updateElementStyle,
  computeTailwindFromStyles,
  // content
  replacePlaceholders,
  getElementSettings,
  // tree — delegated to ElementTreeHelper
  isContainerElement: ElementTreeHelper.isContainerElement,
  isEditableElement: ElementTreeHelper.isEditableElement,
  findById: ElementTreeHelper.findById,
  mapUpdateById: ElementTreeHelper.mapUpdateById,
  mapDeleteById: ElementTreeHelper.mapDeleteById,
  mapInsertAfterId: ElementTreeHelper.mapInsertAfterId,
  mapRecursively: ElementTreeHelper.mapRecursively,
  mapAddChildById: ElementTreeHelper.mapAddChildById,
  mapSwapChildrenById: ElementTreeHelper.mapSwapChildrenById,
  insertAtPosition: ElementTreeHelper.insertAtPosition,
  // misc
  handleSwap,
  isValidElementType
};
const createElementStoreImpl = (set, get2) => {
  const MAX_HISTORY = 50;
  const takeSnapshot = () => {
    const { elements, past } = get2();
    const next = [...past, cloneDeep(elements)];
    set({
      past: next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next,
      future: []
    });
  };
  const triggerYjsCallback = () => {
    const { elements, yjsUpdateCallback } = get2();
    if (yjsUpdateCallback && typeof yjsUpdateCallback === "function") {
      yjsUpdateCallback(elements);
    }
  };
  const triggerCollaborativeCallback = (type, id, data) => {
    const { collaborativeCallback } = get2();
    if (collaborativeCallback && typeof collaborativeCallback === "function") {
      collaborativeCallback(type, id, data);
    }
  };
  return {
    elements: [],
    past: [],
    future: [],
    yjsUpdateCallback: null,
    collaborativeCallback: null,
    loadElements: (elements, skipSave) => {
      set({ elements });
      if (!skipSave) {
        triggerYjsCallback();
      }
      return get2();
    },
    remoteUpdate: (id, patch) => {
      const { elements } = get2();
      const updated = elementHelper.mapUpdateById(
        elements,
        id,
        (el) => ({ ...el, ...patch })
      );
      set({ elements: updated });
    },
    remoteDelete: (id) => {
      const { elements } = get2();
      set({ elements: elementHelper.mapDeleteById(elements, id) });
    },
    remoteAdd: (element) => {
      const { elements } = get2();
      set({
        elements: elementHelper.mapAddChildById(
          elements,
          element.parentId,
          element
        )
      });
    },
    remoteMove: (id, newParentId, order) => {
      const { elements } = get2();
      const elementToMove = elementHelper.findById(elements, id);
      if (!elementToMove) return;
      const without = elementHelper.mapDeleteById(elements, id);
      const moved = {
        ...elementToMove,
        parentId: newParentId ?? void 0,
        order
      };
      set({
        elements: elementHelper.mapAddChildById(without, moved.parentId, moved)
      });
    },
    updateElement: (id, updatedElement) => {
      takeSnapshot();
      const { elements } = get2();
      const updatedTree = elementHelper.mapUpdateById(
        elements,
        id,
        (el) => ({
          ...el,
          ...updatedElement
        })
      );
      set({ elements: updatedTree });
      const { selectedElement } = SelectionStore.getState();
      if (selectedElement?.id === id) {
        const updatedSelected = elementHelper.findById(
          updatedTree,
          id
        );
        if (updatedSelected) {
          SelectionStore.setState({
            selectedElement: updatedSelected
          });
        }
      }
      triggerYjsCallback();
      triggerCollaborativeCallback("update", id, updatedElement);
      return get2();
    },
    deleteElement: (id) => {
      takeSnapshot();
      const { elements } = get2();
      const updatedTree = elementHelper.mapDeleteById(
        elements,
        id
      );
      set({
        elements: updatedTree
      });
      triggerYjsCallback();
      triggerCollaborativeCallback("delete", id);
      return get2();
    },
    insertElement: (parentElement, elementToBeInserted) => {
      takeSnapshot();
      const { elements } = get2();
      const updated = elementHelper.mapInsertAfterId(
        elements,
        parentElement.id,
        elementToBeInserted
      );
      set({ elements: updated });
      triggerYjsCallback();
      triggerCollaborativeCallback(
        "create",
        elementToBeInserted.id,
        elementToBeInserted
      );
      return get2();
    },
    addElement: (...newElements) => {
      takeSnapshot();
      const { elements } = get2();
      const updatedTree = newElements.reduce(
        (acc, newEl) => elementHelper.mapAddChildById(acc, newEl.parentId, newEl),
        elements
      );
      set({
        elements: updatedTree
      });
      triggerYjsCallback();
      for (const newEl of newElements) {
        triggerCollaborativeCallback("create", newEl.id, newEl);
      }
      return get2();
    },
    updateAllElements: (update) => {
      takeSnapshot();
      const { elements } = get2();
      const updated = elementHelper.mapRecursively(
        elements,
        (el) => {
          const updateEl = { ...el };
          Object.assign(updateEl, update);
          if (update.styles) {
            const safeElStyles = el.styles && typeof el.styles === "object" && !Array.isArray(el.styles) ? el.styles : {};
            updateEl.styles = { ...safeElStyles, ...update.styles };
          }
          return updateEl;
        }
      );
      set({ elements: updated });
      triggerYjsCallback();
      return get2();
    },
    undo: () => {
      const { past, elements, future } = get2();
      if (past.length === 0) return get2();
      const previous = past[past.length - 1];
      const newPast = past.slice(0, -1);
      set({
        past: newPast,
        elements: previous,
        future: [elements, ...future]
      });
      triggerYjsCallback();
      return get2();
    },
    redo: () => {
      const { future, elements, past } = get2();
      if (future.length === 0) return get2();
      const next = future[0];
      const newFuture = future.slice(1);
      set({
        past: [...past, elements],
        elements: next,
        future: newFuture
      });
      triggerYjsCallback();
      return get2();
    },
    swapElement: (id1, id2) => {
      takeSnapshot();
      const { elements } = get2();
      const el1 = elementHelper.findById(elements, id1);
      const el2 = elementHelper.findById(elements, id2);
      if (!el1 || !el2 || el1.parentId !== el2.parentId) return get2();
      const parentId = el1.parentId ?? null;
      const updatedTree = elementHelper.mapSwapChildrenById(
        elements,
        parentId,
        id1,
        id2
      );
      set({ elements: updatedTree });
      triggerYjsCallback();
      const newIdx = updatedTree.length > 0 ? parentId ? (() => {
        const parent = elementHelper.findById(updatedTree, parentId);
        return parent && elementHelper.isContainerElement(parent) ? parent.elements.findIndex((e) => e.id === id1) : -1;
      })() : updatedTree.findIndex((e) => e.id === id1) : -1;
      triggerCollaborativeCallback("move", id1, {
        elementId: id1,
        newParentId: parentId,
        newPosition: newIdx
      });
      return get2();
    },
    clearHistory: () => {
      set({ past: [], future: [] });
      return get2();
    },
    setYjsUpdateCallback: (callback) => {
      set({ yjsUpdateCallback: callback });
    },
    setCollaborativeCallback: (callback) => {
      set({ collaborativeCallback: callback });
    }
  };
};
const useElementStore = create()(createElementStoreImpl);
const ElementStore = useElementStore;
const customStorage = {
  getItem: (name) => {
    const item = localStorage.getItem(name);
    if (!item) return null;
    try {
      const parsed = JSON.parse(item);
      return {
        state: {
          isEventModeEnabled: parsed.state.isEventModeEnabled,
          disabledElementEvents: new Set(parsed.state.disabledElementEvents)
        },
        version: parsed.version
      };
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    const serialized = JSON.stringify({
      state: {
        isEventModeEnabled: value.state.isEventModeEnabled,
        disabledElementEvents: Array.from(value.state.disabledElementEvents)
      },
      version: value.version
    });
    localStorage.setItem(name, serialized);
  },
  removeItem: (name) => localStorage.removeItem(name)
};
const useEventModeStore = create()(
  persist(
    (set, get2) => ({
      isEventModeEnabled: false,
      setEventModeEnabled: (enabled) => {
        set({ isEventModeEnabled: enabled });
      },
      toggleEventMode: () => {
        set((state) => ({
          isEventModeEnabled: !state.isEventModeEnabled
        }));
      },
      // Per-element event tracking
      disabledElementEvents: /* @__PURE__ */ new Set(),
      disableElementEvents: (elementId) => {
        set((state) => {
          const newSet = new Set(state.disabledElementEvents);
          newSet.add(elementId);
          return { disabledElementEvents: newSet };
        });
      },
      enableElementEvents: (elementId) => {
        set((state) => {
          const newSet = new Set(state.disabledElementEvents);
          newSet.delete(elementId);
          return { disabledElementEvents: newSet };
        });
      },
      toggleElementEvents: (elementId) => {
        set((state) => {
          const newSet = new Set(state.disabledElementEvents);
          if (newSet.has(elementId)) {
            newSet.delete(elementId);
          } else {
            newSet.add(elementId);
          }
          return { disabledElementEvents: newSet };
        });
      },
      isElementEventsDisabled: (elementId) => {
        return get2().disabledElementEvents.has(elementId);
      },
      clearDisabledElements: () => {
        set({ disabledElementEvents: /* @__PURE__ */ new Set() });
      }
    }),
    {
      name: "event-mode-store",
      storage: customStorage
    }
  )
);
const useImageStore = create()(
  persist(
    (set, get2) => ({
      selectedImages: [],
      selectImage: (image) => {
        set((state) => {
          const exists2 = state.selectedImages.some(
            (img) => img.imageId === image.imageId
          );
          if (exists2) {
            return state;
          }
          return {
            selectedImages: [...state.selectedImages, image]
          };
        });
      },
      deselectImage: (imageId) => {
        set((state) => ({
          selectedImages: state.selectedImages.filter(
            (img) => img.imageId !== imageId
          )
        }));
      },
      clearSelectedImages: () => {
        set({ selectedImages: [] });
      },
      isImageSelected: (imageId) => {
        return get2().selectedImages.some((img) => img.imageId === imageId);
      },
      toggleImageSelection: (image) => {
        const { isImageSelected, selectImage, deselectImage } = get2();
        if (isImageSelected(image.imageId)) {
          deselectImage(image.imageId);
        } else {
          selectImage(image);
        }
      },
      removeDeletedImages: (imageIds) => {
        set((state) => ({
          selectedImages: state.selectedImages.filter(
            (img) => !imageIds.includes(img.imageId)
          )
        }));
      },
      updateImageInStore: (imageId, updates) => {
        set((state) => ({
          selectedImages: state.selectedImages.map(
            (img) => img.imageId === imageId ? { ...img, ...updates } : img
          )
        }));
      }
    }),
    {
      name: "image-selection-storage",
      // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the selectedImages array
      partialize: (state) => ({ selectedImages: state.selectedImages })
    }
  )
);
const useMouseStore = create((set, get2) => ({
  mousePositions: {},
  selectedElements: {},
  users: {},
  remoteUsers: {},
  selectedByUser: {},
  updateMousePosition: (userId, position) => {
    set((state) => ({
      mousePositions: {
        ...state.mousePositions,
        [userId]: position
      }
    }));
  },
  removeMousePosition: (userId) => {
    set((state) => {
      const { [userId]: _, ...rest } = state.mousePositions;
      return {
        mousePositions: rest
      };
    });
  },
  setSelectedElement: (userId, elementId) => {
    set((state) => ({
      selectedElements: {
        ...state.selectedElements,
        [userId]: elementId
      }
    }));
  },
  removeSelectedElement: (userId) => {
    set((state) => {
      const { [userId]: _, ...rest } = state.selectedElements;
      return {
        selectedElements: rest
      };
    });
  },
  setMousePositions: (positions) => {
    set({ mousePositions: positions });
  },
  setSelectedElements: (elements) => {
    set({ selectedElements: elements });
  },
  setUsers: (users) => {
    set({ users });
  },
  removeUser: (userId) => {
    set((state) => {
      const { [userId]: _, ...rest } = state.users;
      return {
        users: rest
      };
    });
  },
  setRemoteUsers: (remoteUsers) => {
    set({ remoteUsers });
  },
  setSelectedByUser: (selectedByUser) => {
    set({ selectedByUser });
  },
  syncFromAwareness: (awareness) => {
    if (!awareness || !awareness.getStates) return;
    const allStates = awareness.getStates();
    const remoteUsers = {};
    const selectedByUser = {};
    allStates.forEach((state, clientId) => {
      const clientIdString = String(clientId);
      if (state && state.cursor) {
        remoteUsers[clientIdString] = {
          x: state.cursor.x ?? 0,
          y: state.cursor.y ?? 0
        };
      }
      if (state && state.selectedElement) {
        selectedByUser[clientIdString] = state.selectedElement;
      }
    });
    set({ remoteUsers, selectedByUser });
  },
  clear: () => {
    set({
      mousePositions: {},
      selectedElements: {},
      users: {},
      remoteUsers: {},
      selectedByUser: {}
    });
  }
}));
const createSsrRpc = (functionId, importer) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    const serverFn = await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const ProjectIdSchema = z$1.object({
  projectId: z$1.string()
});
const CreateProjectSchema = z$1.object({
  id: z$1.string().optional(),
  name: z$1.string().min(1),
  description: z$1.string().optional()
});
const UpdateProjectSchema = z$1.object({
  projectId: z$1.string(),
  updates: z$1.object({
    name: z$1.string().min(1).optional(),
    description: z$1.string().nullable().optional(),
    published: z$1.boolean().optional(),
    subdomain: z$1.string().nullable().optional(),
    styles: z$1.record(z$1.string(), z$1.unknown()).nullable().optional()
  })
});
const getUserProjects = createServerFn({
  method: "GET"
}).handler(createSsrRpc("088e3590a036a69f21ef706f3dee067be8532815f9549ae63682971a715860c9"));
const getProjectById = createServerFn({
  method: "GET"
}).inputValidator((data) => ProjectIdSchema.parse(data)).handler(createSsrRpc("80f93c8c77588990ba7445942bf00878b1aeea698b58d866a46b06be45d44db9"));
const createProject = createServerFn({
  method: "POST"
}).inputValidator((data) => CreateProjectSchema.parse(data)).handler(createSsrRpc("470aa1ecade0f8858e74189813ff09c3015246b20c18f8a0cccded1f6efcc41d"));
const updateProject = createServerFn({
  method: "POST"
}).inputValidator((data) => UpdateProjectSchema.parse(data)).handler(createSsrRpc("72a6c6d49e7228b011ab970eb137fcbed93ac6e064228074fbe75ca13e50ec3f"));
const deleteProject = createServerFn({
  method: "POST"
}).inputValidator((data) => ProjectIdSchema.parse(data)).handler(createSsrRpc("a088bdb405b9acad39183cfb0565c78327ac0eecbeb1aa4d1ddb71559389d79f"));
const getProjectPages = createServerFn({
  method: "GET"
}).inputValidator((data) => ProjectIdSchema.parse(data)).handler(createSsrRpc("439af23a6a8749f42db8230f866c47df2417a4ab285f06482b72a52ded6d637b"));
const DEFAULT_ERROR_DURATION = 2e3;
const DEFAULT_SUCCESS_DURATION = 1500;
function showErrorToast(error, options = {}) {
  const message = typeof error === "string" ? error : error.message;
  toast.error(message, { duration: options.duration ?? DEFAULT_ERROR_DURATION });
}
function showSuccessToast(message, options = {}) {
  toast.success(message, {
    duration: options.duration ?? DEFAULT_SUCCESS_DURATION
  });
}
const PERMISSION_ERRORS = {
  cannotAdd: "Cannot add elements - editor is in read-only mode",
  cannotEdit: "Cannot edit elements - editor is in read-only mode",
  cannotDelete: "Cannot delete elements - editor is in read-only mode",
  cannotReorder: "Cannot reorder elements - editor is in read-only mode",
  cannotCut: "Cannot cut elements - editor is in read-only mode",
  cannotPaste: "Cannot paste elements - editor is in read-only mode",
  cannotSave: "Cannot save elements - editor is in read-only mode",
  cannotPerformAction: "Cannot perform this action - editor is in read-only mode"
};
function getErrorMessage(error, fallback) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
}
function onMutationError(fallbackMessage, options = {}) {
  const { log = false, duration } = options;
  return (error) => {
    const message = getErrorMessage(error, fallbackMessage);
    showErrorToast(message, { duration });
    if (log) {
      console.error(`[Mutation Error] ${fallbackMessage}:`, error);
    }
  };
}
function onMutationSuccess(message, options = {}) {
  const { duration } = options;
  return () => {
    showSuccessToast(message, { duration });
  };
}
const projectKeys = {
  all: ["projects"],
  lists: () => [...projectKeys.all, "list"],
  list: (filters) => [...projectKeys.lists(), filters],
  details: () => [...projectKeys.all, "detail"],
  detail: (id) => [...projectKeys.details(), id],
  userProjects: () => [...projectKeys.all, "user"],
  pages: (projectId) => [...projectKeys.detail(projectId), "pages"]
};
function useUserProjects() {
  return useQuery({
    queryKey: projectKeys.userProjects(),
    queryFn: () => getUserProjects(),
    ...QUERY_CONFIG.DEFAULT
  });
}
function useProject(projectId) {
  return useQuery({
    queryKey: projectKeys.detail(projectId || ""),
    queryFn: () => getProjectById({ data: { projectId } }),
    enabled: !!projectId
  });
}
function useProjectPages(projectId) {
  return useQuery({
    queryKey: projectKeys.pages(projectId || ""),
    queryFn: () => getProjectPages({ data: { projectId } }),
    enabled: !!projectId,
    ...QUERY_CONFIG.DEFAULT
  });
}
function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId) => deleteProject({ data: { projectId } }),
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.userProjects() });
      const previousProjects = queryClient.getQueryData(
        projectKeys.userProjects()
      );
      queryClient.setQueryData(
        projectKeys.userProjects(),
        (old) => old ? old.filter((p) => p.id !== projectId) : []
      );
      return { previousProjects };
    },
    onSuccess: () => {
      showSuccessToast("Project deleted successfully!");
    },
    onError: (error, _projectId, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(
          projectKeys.userProjects(),
          context.previousProjects
        );
      }
      showErrorToast(getErrorMessage(error, "Failed to delete project"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
    }
  });
}
function usePublishProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, publish }) => updateProject({ data: { projectId, updates: { published: publish } } }),
    onMutate: async ({ projectId, publish }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(projectId) });
      await queryClient.cancelQueries({ queryKey: projectKeys.userProjects() });
      const previousProject = queryClient.getQueryData(
        projectKeys.detail(projectId)
      );
      const previousProjects = queryClient.getQueryData(
        projectKeys.userProjects()
      );
      if (previousProject) {
        queryClient.setQueryData(projectKeys.detail(projectId), {
          ...previousProject,
          published: publish
        });
      }
      if (previousProjects) {
        queryClient.setQueryData(
          projectKeys.userProjects(),
          previousProjects.map(
            (p) => p.id === projectId ? { ...p, published: publish } : p
          )
        );
      }
      return { previousProject, previousProjects };
    },
    onSuccess: (data, { projectId, publish }) => {
      queryClient.setQueryData(projectKeys.detail(projectId), data);
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
      showSuccessToast(
        publish ? "Project published successfully!" : "Project unpublished successfully!"
      );
    },
    onError: (error, { projectId }, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(
          projectKeys.detail(projectId),
          context.previousProject
        );
      }
      if (context?.previousProjects) {
        queryClient.setQueryData(
          projectKeys.userProjects(),
          context.previousProjects
        );
      }
      showErrorToast(getErrorMessage(error, "Failed to update project"));
    },
    onSettled: (_, __, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
    }
  });
}
const usePageStore = create((set, get2) => {
  const triggerCollaborativeCallback = (type, id, data) => {
    const { collaborativeCallback } = get2();
    if (collaborativeCallback && typeof collaborativeCallback === "function") {
      collaborativeCallback(type, id, data);
    }
  };
  return {
    pages: [],
    // initial state
    currentPage: null,
    collaborativeCallback: null,
    updatePage: (updates, id) => {
      set((state) => ({
        pages: state.pages.map(
          (page) => page.Id === id ? { ...page, ...updates } : page
        )
      }));
      triggerCollaborativeCallback("update", id, updates);
    },
    addPage: (newPage) => {
      set((state) => ({
        pages: [...state.pages, newPage]
      }));
      triggerCollaborativeCallback("create", newPage.Id, newPage);
    },
    deletePage: async (id) => {
      const pagesCopy = get2().pages;
      const pageToDelete = pagesCopy.find((page) => page.Id === id);
      set((state) => ({
        pages: state.pages.filter((page) => page.Id !== id)
      }));
      if (pageToDelete) {
        const result = await projectService.deleteProjectPage(
          pageToDelete?.ProjectId,
          id
        );
        if (!result) {
          set({ pages: pagesCopy });
        } else {
          triggerCollaborativeCallback("delete", id);
        }
      }
    },
    resetPage: () => {
      set({ pages: [] });
    },
    loadPages: (pages) => {
      set({ pages });
    },
    setCurrentPage: (page) => {
      set({ currentPage: page });
    },
    setCollaborativeCallback: (callback) => {
      set({ collaborativeCallback: callback });
    }
  };
});
const nowIso = () => (/* @__PURE__ */ new Date()).toISOString();
const useProjectStore = create((set, get2) => {
  return {
    project: null,
    isUpdating: false,
    errorMessage: null,
    loadProject: (project) => {
      set({ project, errorMessage: null });
    },
    resetProject: () => {
      set({ project: null, errorMessage: null });
    },
    setProject: (project) => {
      set({ project });
    },
    updateProject: async (updates, id) => {
      const current = get2().project;
      const projectId = id ?? updates.id ?? current?.id;
      if (!projectId) {
        const msg = "No project id available for update";
        set({ errorMessage: msg });
        return null;
      }
      const optimistic = {
        ...current,
        ...updates,
        updatedAt: nowIso()
      };
      set({ project: optimistic, isUpdating: true, errorMessage: null });
      try {
        const serverProject = await projectService.updateProjectPartial(
          projectId,
          updates
        );
        if (serverProject) {
          const mergedProject = {
            ...serverProject,
            header: {
              ...serverProject.header,
              ...typeof serverProject.header?.cssStyles === "undefined" && typeof optimistic.header?.cssStyles !== "undefined" ? { cssStyles: optimistic.header.cssStyles } : {}
            }
          };
          set({
            project: mergedProject,
            isUpdating: false,
            errorMessage: null
          });
          return mergedProject;
        }
        set({
          isUpdating: false,
          errorMessage: "Update completed but no updated project returned"
        });
        return optimistic;
      } catch (err) {
        console.error("updateProject failed:", err);
        set({
          project: current ?? null,
          isUpdating: false,
          errorMessage: String(
            err?.message ?? err ?? "Update failed"
          )
        });
        return null;
      }
    }
  };
});
const navbarComponent = {
  component: {
    type: "Frame",
    name: "NavBar",
    content: "",
    styles: {
      default: {
        height: "auto",
        minHeight: "50px",
        width: "100%",
        backgroundColor: "white",
        display: "flex",
        gap: "15px",
        padding: "15px 10px"
      }
    },
    tailwindStyles: "min-h-[50px] w-full bg-white flex flex-col md:flex-row items-center justify-center md:justify-start p-4 md:px-8 gap-4 md:gap-6",
    elements: [
      {
        type: "Image",
        content: "Logo",
        styles: {
          default: {
            color: "black",
            transition: "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease"
          }
        },
        tailwindStyles: "w-32 text-sm md:text-base md:text-left text-center text-gray-800 hover:scale-105 transition-transform",
        href: "/",
        src: ""
      },
      {
        type: "Link",
        content: "Home",
        styles: {
          default: {
            color: "black",
            display: "flex",
            alignItems: "center",
            transition: "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease"
          }
        },
        tailwindStyles: "m-0 text-sm md:text-base text-gray-800 flex items-center hover:text-white hover:bg-blue-500 hover:shadow-md hover:scale-105 transition-transform",
        href: "/",
        src: ""
      },
      {
        type: "Link",
        content: "About",
        styles: {
          default: {
            color: "black",
            display: "flex",
            alignItems: "center",
            transition: "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease"
          }
        },
        tailwindStyles: "m-0 text-sm md:text-base text-gray-800 flex items-center hover:text-white hover:bg-blue-500 hover:shadow-md hover:scale-105 transition-transform",
        href: "/",
        src: ""
      }
    ],
    href: "",
    src: ""
  }
};
const navbarComponent2 = {
  component: {
    type: "Frame",
    name: "NavBar2",
    content: "",
    styles: {
      default: {
        height: "auto",
        minHeight: "80px",
        width: "100%",
        backgroundColor: "#222831",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px"
      }
    },
    tailwindStyles: "min-h-[80px] w-full bg-[#222831] flex flex-col items-center gap-4 py-4 px-4 text-white md:flex-row md:justify-between md:px-8",
    elements: [
      {
        type: "Image",
        content: "LOGO",
        href: "",
        src: "",
        styles: {
          default: {
            width: "80px",
            height: "80px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }
        },
        tailwindStyles: "w-20 h-20 flex justify-center items-center"
      },
      {
        type: "Frame",
        name: "Links",
        content: "",
        styles: {
          default: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "white"
          }
        },
        tailwindStyles: "flex flex-col items-center  gap-4 md:flex-row md:gap-8 md:w-auto",
        elements: [
          {
            type: "Link",
            content: "Dashboard",
            styles: {
              default: {
                color: "white",
                fontSize: "16px",
                transition: "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease"
              }
            },
            tailwindStyles: "px-4 py-2 text-white rounded-lg hover:text-gray-900 hover:bg-linear-to-r hover:from-green-400 hover:to-blue-500 hover:shadow-lg hover:scale-105 transition-transform",
            href: "/",
            src: ""
          },
          {
            type: "Link",
            content: "Users",
            styles: {
              default: {
                color: "#d1d1d1",
                fontSize: "16px",
                transition: "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease"
              }
            },
            tailwindStyles: "px-4 py-2 text-gray-300 hover:bg-gray-800 rounded flex items-center justify-start md:text-left sm:text-sm sm:px-2 sm:py-1",
            href: "/",
            src: ""
          },
          {
            type: "Link",
            content: "Settings",
            styles: {
              default: {
                color: "#d1d1d1",
                fontSize: "16px",
                transition: "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease"
              }
            },
            tailwindStyles: "px-4 py-2 text-gray-300 hover:bg-gray-800 rounded flex items-center justify-start md:text-left sm:text-sm sm:px-2 sm:py-1",
            href: "/",
            src: ""
          },
          {
            type: "Button",
            name: "Dropdown Menu",
            content: "Advanced Options",
            href: "",
            src: "",
            tailwindStyles: "px-4 py-2 text-gray-300 hover:bg-gray-800 rounded flex items-center justify-between md:text-left sm:text-sm sm:px-2 sm:py-1",
            styles: {
              default: {
                color: "#d1d1d1",
                fontSize: "16px",
                width: "100%",
                padding: "10px 15px",
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "background-color 0.2s",
                border: "none",
                backgroundColor: "transparent"
              }
            }
          }
        ],
        href: "",
        src: ""
      }
    ],
    href: ""
  }
};
const navbarComponent3 = {
  component: {
    type: "Frame",
    name: "NavBar3",
    content: "",
    styles: {
      default: {
        height: "auto",
        minHeight: "65px",
        width: "100%",
        backgroundColor: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        gap: "15px",
        padding: "10px"
      }
    },
    tailwindStyles: "min-h-[65px] py-4 w-full bg-[#f8f9fa] flex flex-col md:flex-row items-center justify-center shadow-md gap-4 md:gap-6",
    elements: [
      {
        type: "Link",
        content: "Home",
        styles: {
          default: {
            color: "#333",
            margin: "0 20px",
            fontWeight: "500",
            fontSize: "17px",
            padding: "8px 16px",
            borderRadius: "4px",
            transition: "all 0.3s ease"
          }
        },
        tailwindStyles: "text-gray-800 font-medium rounded hover:bg-blue-100 whitespace-nowrap px-4 py-2",
        href: "/",
        src: ""
      },
      {
        type: "Link",
        content: "Products",
        styles: {
          default: {
            color: "#333",
            margin: "0 20px",
            fontWeight: "500",
            fontSize: "17px",
            padding: "8px 16px",
            borderRadius: "4px",
            transition: "all 0.3s ease"
          }
        },
        tailwindStyles: "text-gray-800 font-medium px-2 py-1 rounded hover:bg-blue-100 text-sm md:text-base whitespace-nowrap",
        href: "/",
        src: ""
      },
      {
        type: "Link",
        content: "Gallery",
        styles: {
          default: {
            color: "#333",
            margin: "0 20px",
            fontWeight: "500",
            fontSize: "17px",
            padding: "8px 16px",
            borderRadius: "4px",
            transition: "all 0.3s ease"
          }
        },
        tailwindStyles: "text-gray-800 font-medium rounded hover:bg-blue-100 whitespace-nowrap px-4 py-2",
        href: "/",
        src: ""
      },
      {
        type: "Link",
        content: "Contact",
        styles: {
          default: {
            color: "white",
            margin: "0 20px",
            fontWeight: "500",
            fontSize: "17px",
            padding: "8px 16px",
            borderRadius: "4px",
            backgroundColor: "#007bff",
            transition: "all 0.3s ease"
          }
        },
        tailwindStyles: "text-white font-medium rounded bg-blue-500 hover:bg-blue-600 whitespace-nowrap px-4 py-2",
        href: "/",
        src: ""
      }
    ],
    href: "",
    src: ""
  }
};
const navbarComponent4 = {
  component: {
    type: "Frame",
    name: "NavBar4",
    content: "",
    styles: {
      default: {
        height: "auto",
        minHeight: "70px",
        width: "100%",
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 30px",
        borderBottom: "1px solid #e0e0e0"
      }
    },
    tailwindStyles: "min-h-[70px] py-4 w-full bg-transparent flex flex-col md:flex-row items-center justify-between px-6 md:px-8 border-b border-gray-300 gap-6 md:gap-8",
    elements: [
      {
        type: "Text",
        content: "BRAND",
        styles: {
          default: {
            color: "#333",
            fontWeight: "bold",
            fontSize: "22px",
            letterSpacing: "1px"
          }
        },
        tailwindStyles: "text-gray-800 font-bold text-base md:text-xl tracking-wide",
        href: "",
        src: ""
      },
      {
        type: "Frame",
        name: "NavMenu",
        styles: {
          default: {
            display: "flex",
            alignItems: "center",
            gap: "20px"
          }
        },
        tailwindStyles: "flex flex-col md:flex-row items-center gap-6 md:gap-10",
        elements: [
          {
            type: "Link",
            content: "Home",
            styles: {
              default: {
                color: "#333",
                fontSize: "16px",
                position: "relative",
                textDecoration: "none",
                transition: "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease"
              }
            },
            tailwindStyles: "text-gray-800 text-sm md:text-base relative no-underline rounded-lg hover:text-white hover:bg-linear-to-r hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:scale-105 transition-transform px-4 py-2",
            href: "/",
            src: ""
          },
          {
            type: "Link",
            content: "About",
            styles: {
              default: {
                color: "#333",
                fontSize: "16px",
                position: "relative",
                textDecoration: "none",
                transition: "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease"
              }
            },
            tailwindStyles: "text-gray-800 text-sm md:text-base relative no-underline rounded-lg hover:text-white hover:bg-linear-to-r hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:scale-105 transition-transform px-4 py-2",
            href: "/",
            src: ""
          },
          {
            type: "Link",
            content: "Services",
            styles: {
              default: {
                color: "#333",
                fontSize: "16px",
                position: "relative",
                textDecoration: "none",
                transition: "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease"
              }
            },
            tailwindStyles: "text-gray-800 text-sm md:text-base relative no-underline rounded-lg hover:text-white hover:bg-linear-to-r hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:scale-105 transition-transform px-4 py-2",
            href: "/",
            src: ""
          }
        ],
        href: "",
        src: ""
      }
    ],
    href: "",
    src: ""
  }
};
const navbarComponent5 = {
  component: {
    type: "Frame",
    name: "NavBar5",
    styles: {
      default: {
        color: "white",
        fontWeight: "bold",
        fontSize: "20px"
      }
    },
    tailwindStyles: "text-white font-bold text-lg md:text-xl shrink-0 px-4 py-2",
    href: "",
    src: "",
    elements: [
      {
        type: "Link",
        content: "Dashboard",
        styles: {
          default: {
            color: "white",
            fontSize: "16px"
          }
        },
        tailwindStyles: "text-white text-sm md:text-base shrink-0 hover:bg-purple-600 hover:text-gray-200 hover:scale-105 transition-transform px-4 py-2",
        href: "/",
        src: ""
      },
      {
        type: "Link",
        content: "Projects",
        styles: {
          default: {
            color: "white",
            fontSize: "16px"
          }
        },
        tailwindStyles: "text-white text-sm md:text-base shrink-0 hover:bg-purple-600 hover:text-gray-200 hover:scale-105 transition-transform px-4 py-2",
        href: "/",
        src: ""
      },
      {
        type: "Link",
        content: "Tasks",
        styles: {
          default: {
            color: "white",
            fontSize: "16px"
          }
        },
        tailwindStyles: "text-white text-sm md:text-base shrink-0 hover:bg-purple-600 hover:text-gray-200 hover:scale-105 transition-transform px-4 py-2",
        href: "/",
        src: ""
      },
      {
        type: "Link",
        content: "Settings",
        styles: {
          default: {
            color: "white",
            fontSize: "16px"
          }
        },
        tailwindStyles: "text-white text-sm md:text-base shrink-0 hover:bg-purple-600 hover:text-gray-200 hover:scale-105 transition-transform px-4 py-2",
        href: "/",
        src: ""
      }
    ]
  }
};
function mkId$1(prefix) {
  return `${prefix}-${v4().slice(0, 8)}`;
}
const portfolioSiteTemplate = {
  component: {
    type: "Section",
    id: mkId$1("portfolio-site"),
    name: "Portfolio Site Template",
    role: "main",
    ariaLabel: "Portfolio Website Template",
    content: "",
    tailwindStyles: "w-full min-h-screen bg-background",
    elements: [
      // ==================== NAVBAR ====================
      {
        type: "Frame",
        name: "Portfolio Navbar",
        content: "",
        tailwindStyles: "w-full flex items-center justify-between px-6 md:px-12 py-4 bg-background border-b border-border sticky top-0 z-50",
        elements: [
          {
            type: "Image",
            content: "Logo",
            src: "",
            alt: "Portfolio Logo",
            tailwindStyles: "h-10 w-auto object-contain",
            settings: {
              objectFit: "contain",
              loading: "eager"
            }
          },
          {
            type: "Frame",
            name: "Nav Links",
            content: "",
            tailwindStyles: "hidden md:flex items-center gap-8",
            elements: [
              {
                type: "Link",
                content: "Work",
                href: "#work",
                tailwindStyles: "text-sm text-muted-foreground hover:text-foreground transition-colors"
              },
              {
                type: "Link",
                content: "About",
                href: "#about",
                tailwindStyles: "text-sm text-muted-foreground hover:text-foreground transition-colors"
              },
              {
                type: "Link",
                content: "Services",
                href: "#services",
                tailwindStyles: "text-sm text-muted-foreground hover:text-foreground transition-colors"
              },
              {
                type: "Link",
                content: "Contact",
                href: "#contact",
                tailwindStyles: "text-sm text-muted-foreground hover:text-foreground transition-colors"
              }
            ]
          },
          {
            type: "Button",
            content: "Hire Me",
            tailwindStyles: "px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors",
            styles: {
              default: {
                backgroundColor: "#000",
                color: "#fff"
              }
            }
          }
        ],
        href: "",
        src: ""
      },
      // ==================== HERO SECTION ====================
      {
        type: "Section",
        name: "Portfolio Hero",
        content: "",
        role: "region",
        ariaLabel: "Hero section",
        tailwindStyles: "w-full px-6 md:px-12 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12",
        elements: [
          {
            type: "Frame",
            name: "Hero Content",
            content: "",
            tailwindStyles: "flex-1 flex flex-col items-start",
            elements: [
              {
                type: "Text",
                content: "Creative Developer & Designer",
                tailwindStyles: "text-sm uppercase tracking-widest text-muted-foreground mb-4"
              },
              {
                type: "Text",
                content: "I craft digital experiences that inspire and engage",
                tailwindStyles: "text-4xl md:text-6xl font-bold text-foreground leading-tight"
              },
              {
                type: "Text",
                content: "Specializing in web development, UI/UX design, and brand identity. Let's build something amazing together.",
                tailwindStyles: "text-lg text-muted-foreground mt-6 max-w-xl leading-relaxed"
              },
              {
                type: "Frame",
                name: "Hero CTA",
                content: "",
                tailwindStyles: "flex items-center gap-4 mt-10",
                elements: [
                  {
                    type: "Button",
                    content: "View Projects",
                    tailwindStyles: "px-6 py-3 bg-foreground text-background rounded-md font-medium hover:bg-foreground/90 transition-colors",
                    styles: {
                      default: {
                        backgroundColor: "#000",
                        color: "#fff"
                      }
                    }
                  },
                  {
                    type: "Button",
                    content: "Get in Touch",
                    tailwindStyles: "px-6 py-3 border border-border rounded-md font-medium hover:bg-accent transition-colors"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Social Links",
                content: "",
                tailwindStyles: "flex items-center gap-4 mt-8",
                elements: [
                  {
                    type: "Link",
                    content: "GitHub",
                    href: "https://github.com",
                    tailwindStyles: "text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                  },
                  {
                    type: "Link",
                    content: "LinkedIn",
                    href: "https://linkedin.com",
                    tailwindStyles: "text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                  },
                  {
                    type: "Link",
                    content: "Dribbble",
                    href: "https://dribbble.com",
                    tailwindStyles: "text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                  }
                ]
              }
            ]
          },
          {
            type: "Frame",
            name: "Hero Image",
            content: "",
            tailwindStyles: "flex-1 flex items-center justify-center",
            elements: [
              {
                type: "Image",
                content: "Profile Photo",
                src: "",
                alt: "Developer profile photo",
                tailwindStyles: "w-80 h-80 rounded-full object-cover shadow-2xl border-4 border-background",
                settings: {
                  objectFit: "cover",
                  loading: "eager"
                }
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== SERVICES CAROUSEL ====================
      {
        type: "Section",
        name: "Services Section",
        content: "",
        role: "region",
        ariaLabel: "Services section",
        tailwindStyles: "w-full px-6 md:px-12 py-20 bg-muted",
        elements: [
          {
            type: "Text",
            content: "Services",
            tailwindStyles: "text-sm uppercase tracking-widest text-muted-foreground mb-2 text-center"
          },
          {
            type: "Text",
            content: "What I Can Do For You",
            tailwindStyles: "text-3xl md:text-4xl font-bold text-foreground mb-12 text-center"
          },
          {
            type: "Carousel",
            name: "Services Carousel",
            content: "",
            tailwindStyles: "w-full max-w-6xl mx-auto",
            settings: {
              loop: true,
              autoplay: true,
              autoplaySpeed: 4e3,
              slidesToShow: 3,
              withNavigation: true,
              breakpoints: {
                "(max-width: 768px)": { slidesToShow: 1 },
                "(max-width: 1024px)": { slidesToShow: 2 }
              }
            },
            elements: [
              {
                type: "Frame",
                name: "Service Card 1",
                content: "",
                tailwindStyles: "p-8 bg-card rounded-xl border border-border mx-2",
                elements: [
                  {
                    type: "Text",
                    content: "🎨",
                    tailwindStyles: "text-4xl mb-4"
                  },
                  {
                    type: "Text",
                    content: "UI/UX Design",
                    tailwindStyles: "text-xl font-semibold text-foreground mb-2"
                  },
                  {
                    type: "Text",
                    content: "Creating intuitive and beautiful user interfaces that delight users and drive engagement.",
                    tailwindStyles: "text-sm text-muted-foreground"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Service Card 2",
                content: "",
                tailwindStyles: "p-8 bg-card rounded-xl border border-border mx-2",
                elements: [
                  {
                    type: "Text",
                    content: "💻",
                    tailwindStyles: "text-4xl mb-4"
                  },
                  {
                    type: "Text",
                    content: "Web Development",
                    tailwindStyles: "text-xl font-semibold text-foreground mb-2"
                  },
                  {
                    type: "Text",
                    content: "Building fast, responsive, and scalable websites using modern technologies.",
                    tailwindStyles: "text-sm text-muted-foreground"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Service Card 3",
                content: "",
                tailwindStyles: "p-8 bg-card rounded-xl border border-border mx-2",
                elements: [
                  {
                    type: "Text",
                    content: "📱",
                    tailwindStyles: "text-4xl mb-4"
                  },
                  {
                    type: "Text",
                    content: "Mobile Apps",
                    tailwindStyles: "text-xl font-semibold text-foreground mb-2"
                  },
                  {
                    type: "Text",
                    content: "Developing cross-platform mobile applications with React Native.",
                    tailwindStyles: "text-sm text-muted-foreground"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Service Card 4",
                content: "",
                tailwindStyles: "p-8 bg-card rounded-xl border border-border mx-2",
                elements: [
                  {
                    type: "Text",
                    content: "🚀",
                    tailwindStyles: "text-4xl mb-4"
                  },
                  {
                    type: "Text",
                    content: "Performance",
                    tailwindStyles: "text-xl font-semibold text-foreground mb-2"
                  },
                  {
                    type: "Text",
                    content: "Optimizing websites for speed, SEO, and Core Web Vitals.",
                    tailwindStyles: "text-sm text-muted-foreground"
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== PROJECTS GRID (CMSContentGrid) ====================
      {
        type: "Section",
        name: "Projects Section",
        content: "",
        role: "region",
        ariaLabel: "Projects section",
        tailwindStyles: "w-full px-6 md:px-12 py-20",
        elements: [
          {
            type: "Text",
            content: "Selected Work",
            tailwindStyles: "text-2xl font-bold text-foreground mb-10"
          },
          {
            type: "CMSContentGrid",
            name: "Projects Grid",
            content: "",
            tailwindStyles: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            settings: {
              contentTypeId: "projects",
              displayMode: "grid",
              limit: 6,
              sortBy: "createdAt",
              sortOrder: "desc",
              fieldsToShow: ["title", "image", "category"]
            },
            elements: [
              {
                type: "Frame",
                name: "Project Card Template",
                content: "",
                tailwindStyles: "group relative aspect-[4/3] rounded-xl overflow-hidden bg-muted cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Project Image",
                    src: "",
                    alt: "Project preview",
                    tailwindStyles: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                    settings: {
                      objectFit: "cover",
                      loading: "lazy"
                    }
                  },
                  {
                    type: "Frame",
                    name: "Project Overlay",
                    content: "",
                    tailwindStyles: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6",
                    elements: [
                      {
                        type: "Text",
                        content: "Project Title",
                        tailwindStyles: "text-xl font-bold text-white"
                      },
                      {
                        type: "Text",
                        content: "Category",
                        tailwindStyles: "text-sm text-white/80 mt-1"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            type: "Frame",
            name: "View All Projects",
            content: "",
            tailwindStyles: "flex justify-center mt-10",
            elements: [
              {
                type: "Button",
                content: "View All Projects →",
                tailwindStyles: "px-6 py-3 border border-border rounded-md font-medium hover:bg-accent transition-colors"
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== TESTIMONIALS LIST ====================
      {
        type: "Section",
        name: "Testimonials Section",
        content: "",
        role: "region",
        ariaLabel: "Testimonials section",
        tailwindStyles: "w-full px-6 md:px-12 py-20 bg-muted",
        elements: [
          {
            type: "Text",
            content: "What Clients Say",
            tailwindStyles: "text-3xl md:text-4xl font-bold text-foreground mb-12 text-center"
          },
          {
            type: "List",
            name: "Testimonials List",
            content: "",
            tailwindStyles: "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto",
            elements: [
              {
                type: "Frame",
                name: "Testimonial 1",
                content: "",
                tailwindStyles: "p-6 bg-card rounded-xl border border-border",
                elements: [
                  {
                    type: "Text",
                    content: '"Working with John was an absolute pleasure. He delivered beyond our expectations and the attention to detail was remarkable."',
                    tailwindStyles: "text-muted-foreground italic leading-relaxed"
                  },
                  {
                    type: "Frame",
                    name: "Author",
                    content: "",
                    tailwindStyles: "flex items-center gap-3 mt-4",
                    elements: [
                      {
                        type: "Image",
                        content: "Avatar",
                        src: "",
                        alt: "Sarah Johnson",
                        tailwindStyles: "w-10 h-10 rounded-full object-cover",
                        settings: {
                          objectFit: "cover",
                          loading: "lazy"
                        }
                      },
                      {
                        type: "Frame",
                        name: "Author Info",
                        content: "",
                        tailwindStyles: "flex flex-col",
                        elements: [
                          {
                            type: "Text",
                            content: "Sarah Johnson",
                            tailwindStyles: "text-sm font-medium text-foreground"
                          },
                          {
                            type: "Text",
                            content: "CEO, TechStart",
                            tailwindStyles: "text-xs text-muted-foreground"
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                type: "Frame",
                name: "Testimonial 2",
                content: "",
                tailwindStyles: "p-6 bg-card rounded-xl border border-border",
                elements: [
                  {
                    type: "Text",
                    content: '"The website he built for us increased our conversions by 150%. Highly recommend for any serious business."',
                    tailwindStyles: "text-muted-foreground italic leading-relaxed"
                  },
                  {
                    type: "Frame",
                    name: "Author",
                    content: "",
                    tailwindStyles: "flex items-center gap-3 mt-4",
                    elements: [
                      {
                        type: "Image",
                        content: "Avatar",
                        src: "",
                        alt: "Mike Chen",
                        tailwindStyles: "w-10 h-10 rounded-full object-cover",
                        settings: {
                          objectFit: "cover",
                          loading: "lazy"
                        }
                      },
                      {
                        type: "Frame",
                        name: "Author Info",
                        content: "",
                        tailwindStyles: "flex flex-col",
                        elements: [
                          {
                            type: "Text",
                            content: "Mike Chen",
                            tailwindStyles: "text-sm font-medium text-foreground"
                          },
                          {
                            type: "Text",
                            content: "Founder, GrowthLab",
                            tailwindStyles: "text-xs text-muted-foreground"
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                type: "Frame",
                name: "Testimonial 3",
                content: "",
                tailwindStyles: "p-6 bg-card rounded-xl border border-border",
                elements: [
                  {
                    type: "Text",
                    content: '"Professional, creative, and incredibly responsive. Our new brand identity is exactly what we envisioned."',
                    tailwindStyles: "text-muted-foreground italic leading-relaxed"
                  },
                  {
                    type: "Frame",
                    name: "Author",
                    content: "",
                    tailwindStyles: "flex items-center gap-3 mt-4",
                    elements: [
                      {
                        type: "Image",
                        content: "Avatar",
                        src: "",
                        alt: "Emily Davis",
                        tailwindStyles: "w-10 h-10 rounded-full object-cover",
                        settings: {
                          objectFit: "cover",
                          loading: "lazy"
                        }
                      },
                      {
                        type: "Frame",
                        name: "Author Info",
                        content: "",
                        tailwindStyles: "flex flex-col",
                        elements: [
                          {
                            type: "Text",
                            content: "Emily Davis",
                            tailwindStyles: "text-sm font-medium text-foreground"
                          },
                          {
                            type: "Text",
                            content: "CMO, Brandify",
                            tailwindStyles: "text-xs text-muted-foreground"
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== CONTACT FORM ====================
      {
        type: "Section",
        name: "Contact Section",
        content: "",
        role: "region",
        ariaLabel: "Contact section",
        tailwindStyles: "w-full px-6 md:px-12 py-20",
        elements: [
          {
            type: "Frame",
            name: "Contact Container",
            content: "",
            tailwindStyles: "max-w-2xl mx-auto text-center",
            elements: [
              {
                type: "Text",
                content: "Let's Work Together",
                tailwindStyles: "text-3xl md:text-4xl font-bold text-foreground mb-4"
              },
              {
                type: "Text",
                content: "Have a project in mind? Fill out the form below and I'll get back to you within 24 hours.",
                tailwindStyles: "text-muted-foreground mb-10"
              },
              {
                type: "Form",
                name: "Contact Form",
                content: "",
                tailwindStyles: "flex flex-col gap-4 text-left",
                settings: {
                  action: "/api/contact",
                  method: "post",
                  validateOnSubmit: true
                },
                elements: [
                  {
                    type: "Frame",
                    name: "Name Row",
                    content: "",
                    tailwindStyles: "grid grid-cols-1 md:grid-cols-2 gap-4",
                    elements: [
                      {
                        type: "Frame",
                        name: "First Name Field",
                        content: "",
                        tailwindStyles: "flex flex-col gap-2",
                        elements: [
                          {
                            type: "Text",
                            content: "First Name",
                            tailwindStyles: "text-sm font-medium text-foreground"
                          },
                          {
                            type: "Input",
                            name: "firstName",
                            content: "",
                            tailwindStyles: "px-4 py-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary",
                            settings: {
                              type: "text",
                              placeholder: "John",
                              required: true,
                              autoComplete: "given-name"
                            }
                          }
                        ]
                      },
                      {
                        type: "Frame",
                        name: "Last Name Field",
                        content: "",
                        tailwindStyles: "flex flex-col gap-2",
                        elements: [
                          {
                            type: "Text",
                            content: "Last Name",
                            tailwindStyles: "text-sm font-medium text-foreground"
                          },
                          {
                            type: "Input",
                            name: "lastName",
                            content: "",
                            tailwindStyles: "px-4 py-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary",
                            settings: {
                              type: "text",
                              placeholder: "Doe",
                              required: true,
                              autoComplete: "family-name"
                            }
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: "Frame",
                    name: "Email Field",
                    content: "",
                    tailwindStyles: "flex flex-col gap-2",
                    elements: [
                      {
                        type: "Text",
                        content: "Email",
                        tailwindStyles: "text-sm font-medium text-foreground"
                      },
                      {
                        type: "Input",
                        name: "email",
                        content: "",
                        tailwindStyles: "px-4 py-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary",
                        settings: {
                          type: "email",
                          placeholder: "john@example.com",
                          required: true,
                          autoComplete: "email"
                        }
                      }
                    ]
                  },
                  {
                    type: "Frame",
                    name: "Project Type Field",
                    content: "",
                    tailwindStyles: "flex flex-col gap-2",
                    elements: [
                      {
                        type: "Text",
                        content: "Project Type",
                        tailwindStyles: "text-sm font-medium text-foreground"
                      },
                      {
                        type: "Select",
                        name: "projectType",
                        content: "",
                        tailwindStyles: "px-4 py-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary",
                        elements: [
                          {
                            type: "Text",
                            content: "Select a project type"
                          },
                          {
                            type: "Text",
                            content: "Website Design"
                          },
                          {
                            type: "Text",
                            content: "Web Development"
                          },
                          {
                            type: "Text",
                            content: "Mobile App"
                          },
                          {
                            type: "Text",
                            content: "Brand Identity"
                          },
                          {
                            type: "Text",
                            content: "Other"
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: "Frame",
                    name: "Message Field",
                    content: "",
                    tailwindStyles: "flex flex-col gap-2",
                    elements: [
                      {
                        type: "Text",
                        content: "Message",
                        tailwindStyles: "text-sm font-medium text-foreground"
                      },
                      {
                        type: "Input",
                        name: "message",
                        content: "",
                        tailwindStyles: "px-4 py-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]",
                        settings: {
                          type: "textarea",
                          placeholder: "Tell me about your project...",
                          required: true
                        }
                      }
                    ]
                  },
                  {
                    type: "Button",
                    content: "Send Message",
                    tailwindStyles: "w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors mt-4",
                    styles: {
                      default: {
                        backgroundColor: "#000",
                        color: "#fff"
                      }
                    }
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== FOOTER ====================
      {
        type: "Frame",
        name: "Portfolio Footer",
        content: "",
        tailwindStyles: "w-full px-6 md:px-12 py-12 border-t border-border",
        elements: [
          {
            type: "Frame",
            name: "Footer Content",
            content: "",
            tailwindStyles: "max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6",
            elements: [
              {
                type: "Frame",
                name: "Footer Left",
                content: "",
                tailwindStyles: "flex flex-col items-center md:items-start gap-2",
                elements: [
                  {
                    type: "Text",
                    content: "John Doe",
                    tailwindStyles: "text-lg font-bold text-foreground"
                  },
                  {
                    type: "Text",
                    content: "© 2024 All rights reserved.",
                    tailwindStyles: "text-sm text-muted-foreground"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Footer Links",
                content: "",
                tailwindStyles: "flex items-center gap-6",
                elements: [
                  {
                    type: "Link",
                    content: "Twitter",
                    href: "#",
                    tailwindStyles: "text-sm text-muted-foreground hover:text-foreground transition-colors"
                  },
                  {
                    type: "Link",
                    content: "LinkedIn",
                    href: "#",
                    tailwindStyles: "text-sm text-muted-foreground hover:text-foreground transition-colors"
                  },
                  {
                    type: "Link",
                    content: "GitHub",
                    href: "#",
                    tailwindStyles: "text-sm text-muted-foreground hover:text-foreground transition-colors"
                  },
                  {
                    type: "Link",
                    content: "Dribbble",
                    href: "#",
                    tailwindStyles: "text-sm text-muted-foreground hover:text-foreground transition-colors"
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      }
    ],
    href: "",
    src: ""
  }
};
const agencySiteTemplate = {
  component: {
    type: "Section",
    id: mkId$1("agency-site"),
    name: "Agency Site Template",
    role: "main",
    ariaLabel: "Digital Agency Website Template",
    content: "",
    tailwindStyles: "w-full min-h-screen bg-zinc-950 text-white",
    styles: {
      default: {
        backgroundColor: "#09090b",
        color: "#ffffff"
      }
    },
    elements: [
      // ==================== NAVBAR ====================
      {
        type: "Frame",
        name: "Agency Navbar",
        content: "",
        tailwindStyles: "w-full flex items-center justify-between px-6 md:px-16 py-6 bg-transparent",
        elements: [
          {
            type: "Frame",
            name: "Logo",
            content: "",
            tailwindStyles: "flex items-center gap-2",
            elements: [
              {
                type: "Image",
                content: "Logo Icon",
                src: "",
                alt: "Studio Logo",
                tailwindStyles: "w-10 h-10 rounded-lg object-contain",
                settings: {
                  objectFit: "contain",
                  loading: "eager"
                }
              },
              {
                type: "Text",
                content: "STUDIO",
                tailwindStyles: "text-xl font-bold tracking-wider text-white"
              }
            ]
          },
          {
            type: "Frame",
            name: "Nav Links",
            content: "",
            tailwindStyles: "hidden md:flex items-center gap-10",
            elements: [
              {
                type: "Link",
                content: "Services",
                href: "#services",
                tailwindStyles: "text-sm text-zinc-400 hover:text-white transition-colors"
              },
              {
                type: "Link",
                content: "Work",
                href: "#work",
                tailwindStyles: "text-sm text-zinc-400 hover:text-white transition-colors"
              },
              {
                type: "Link",
                content: "About",
                href: "#about",
                tailwindStyles: "text-sm text-zinc-400 hover:text-white transition-colors"
              },
              {
                type: "Link",
                content: "Careers",
                href: "#careers",
                tailwindStyles: "text-sm text-zinc-400 hover:text-white transition-colors"
              }
            ]
          },
          {
            type: "Button",
            content: "Start a Project",
            tailwindStyles: "px-5 py-2.5 bg-violet-600 text-white rounded-full text-sm font-medium hover:bg-violet-500 transition-colors",
            styles: {
              default: {
                backgroundColor: "#7c3aed",
                color: "#fff"
              }
            }
          }
        ],
        href: "",
        src: ""
      },
      // ==================== HERO SECTION ====================
      {
        type: "Section",
        name: "Agency Hero",
        content: "",
        role: "region",
        ariaLabel: "Hero section",
        tailwindStyles: "w-full px-6 md:px-16 py-24 md:py-40 flex flex-col items-start",
        elements: [
          {
            type: "Text",
            content: "We are a creative",
            tailwindStyles: "text-5xl md:text-7xl font-bold text-white leading-tight"
          },
          {
            type: "Text",
            content: "digital agency",
            tailwindStyles: "text-5xl md:text-7xl font-bold text-violet-500 leading-tight"
          },
          {
            type: "Text",
            content: "We design and build exceptional digital products, brands, and experiences that drive growth and inspire action.",
            tailwindStyles: "text-lg text-zinc-400 mt-8 max-w-xl leading-relaxed"
          },
          {
            type: "Frame",
            name: "Hero Stats",
            content: "",
            tailwindStyles: "flex flex-wrap gap-12 mt-16 pt-8 border-t border-zinc-800",
            elements: [
              {
                type: "Frame",
                name: "Stat 1",
                content: "",
                tailwindStyles: "flex flex-col",
                elements: [
                  {
                    type: "Text",
                    content: "150+",
                    tailwindStyles: "text-4xl font-bold text-white"
                  },
                  {
                    type: "Text",
                    content: "Projects Delivered",
                    tailwindStyles: "text-sm text-zinc-500 mt-1"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Stat 2",
                content: "",
                tailwindStyles: "flex flex-col",
                elements: [
                  {
                    type: "Text",
                    content: "50+",
                    tailwindStyles: "text-4xl font-bold text-white"
                  },
                  {
                    type: "Text",
                    content: "Happy Clients",
                    tailwindStyles: "text-sm text-zinc-500 mt-1"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Stat 3",
                content: "",
                tailwindStyles: "flex flex-col",
                elements: [
                  {
                    type: "Text",
                    content: "8+",
                    tailwindStyles: "text-4xl font-bold text-white"
                  },
                  {
                    type: "Text",
                    content: "Years Experience",
                    tailwindStyles: "text-sm text-zinc-500 mt-1"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Stat 4",
                content: "",
                tailwindStyles: "flex flex-col",
                elements: [
                  {
                    type: "Text",
                    content: "25+",
                    tailwindStyles: "text-4xl font-bold text-white"
                  },
                  {
                    type: "Text",
                    content: "Team Members",
                    tailwindStyles: "text-sm text-zinc-500 mt-1"
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== CLIENTS LOGOS CAROUSEL ====================
      {
        type: "Section",
        name: "Clients Section",
        content: "",
        role: "region",
        ariaLabel: "Our clients",
        tailwindStyles: "w-full px-6 md:px-16 py-16 border-y border-zinc-800",
        elements: [
          {
            type: "Text",
            content: "Trusted by leading brands",
            tailwindStyles: "text-sm text-zinc-500 text-center mb-8"
          },
          {
            type: "Carousel",
            name: "Clients Carousel",
            content: "",
            tailwindStyles: "w-full",
            settings: {
              loop: true,
              autoplay: true,
              autoplaySpeed: 2e3,
              slidesToShow: 6,
              withNavigation: false,
              breakpoints: {
                "(max-width: 768px)": { slidesToShow: 3 },
                "(max-width: 1024px)": { slidesToShow: 4 }
              }
            },
            elements: [
              {
                type: "Image",
                content: "Client 1",
                src: "",
                alt: "Client logo 1",
                tailwindStyles: "h-8 w-auto opacity-50 hover:opacity-100 transition-opacity mx-auto",
                settings: {
                  objectFit: "contain",
                  loading: "lazy"
                }
              },
              {
                type: "Image",
                content: "Client 2",
                src: "",
                alt: "Client logo 2",
                tailwindStyles: "h-8 w-auto opacity-50 hover:opacity-100 transition-opacity mx-auto",
                settings: {
                  objectFit: "contain",
                  loading: "lazy"
                }
              },
              {
                type: "Image",
                content: "Client 3",
                src: "",
                alt: "Client logo 3",
                tailwindStyles: "h-8 w-auto opacity-50 hover:opacity-100 transition-opacity mx-auto",
                settings: {
                  objectFit: "contain",
                  loading: "lazy"
                }
              },
              {
                type: "Image",
                content: "Client 4",
                src: "",
                alt: "Client logo 4",
                tailwindStyles: "h-8 w-auto opacity-50 hover:opacity-100 transition-opacity mx-auto",
                settings: {
                  objectFit: "contain",
                  loading: "lazy"
                }
              },
              {
                type: "Image",
                content: "Client 5",
                src: "",
                alt: "Client logo 5",
                tailwindStyles: "h-8 w-auto opacity-50 hover:opacity-100 transition-opacity mx-auto",
                settings: {
                  objectFit: "contain",
                  loading: "lazy"
                }
              },
              {
                type: "Image",
                content: "Client 6",
                src: "",
                alt: "Client logo 6",
                tailwindStyles: "h-8 w-auto opacity-50 hover:opacity-100 transition-opacity mx-auto",
                settings: {
                  objectFit: "contain",
                  loading: "lazy"
                }
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== SERVICES SECTION ====================
      {
        type: "Section",
        name: "Agency Services",
        content: "",
        role: "region",
        ariaLabel: "Our services",
        tailwindStyles: "w-full px-6 md:px-16 py-20 bg-zinc-900",
        styles: {
          default: {
            backgroundColor: "#18181b"
          }
        },
        elements: [
          {
            type: "Text",
            content: "What We Do",
            tailwindStyles: "text-sm uppercase tracking-widest text-violet-500 mb-4"
          },
          {
            type: "Text",
            content: "Services designed for growth",
            tailwindStyles: "text-3xl md:text-4xl font-bold text-white mb-12"
          },
          {
            type: "List",
            name: "Services List",
            content: "",
            tailwindStyles: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
            elements: [
              {
                type: "Frame",
                name: "Service 1",
                content: "",
                tailwindStyles: "p-8 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:border-violet-500/50 transition-colors group",
                elements: [
                  {
                    type: "Text",
                    content: "🎨",
                    tailwindStyles: "text-4xl mb-6"
                  },
                  {
                    type: "Text",
                    content: "Brand Strategy",
                    tailwindStyles: "text-xl font-semibold text-white mb-3"
                  },
                  {
                    type: "Text",
                    content: "We craft compelling brand narratives that resonate with your audience and differentiate you from competitors.",
                    tailwindStyles: "text-sm text-zinc-400 leading-relaxed mb-4"
                  },
                  {
                    type: "Link",
                    content: "Learn more →",
                    href: "#",
                    tailwindStyles: "text-sm text-violet-500 group-hover:text-violet-400 transition-colors"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Service 2",
                content: "",
                tailwindStyles: "p-8 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:border-violet-500/50 transition-colors group",
                elements: [
                  {
                    type: "Text",
                    content: "💻",
                    tailwindStyles: "text-4xl mb-6"
                  },
                  {
                    type: "Text",
                    content: "Web Development",
                    tailwindStyles: "text-xl font-semibold text-white mb-3"
                  },
                  {
                    type: "Text",
                    content: "Custom websites and web applications built with modern technologies for performance and scalability.",
                    tailwindStyles: "text-sm text-zinc-400 leading-relaxed mb-4"
                  },
                  {
                    type: "Link",
                    content: "Learn more →",
                    href: "#",
                    tailwindStyles: "text-sm text-violet-500 group-hover:text-violet-400 transition-colors"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Service 3",
                content: "",
                tailwindStyles: "p-8 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:border-violet-500/50 transition-colors group",
                elements: [
                  {
                    type: "Text",
                    content: "📱",
                    tailwindStyles: "text-4xl mb-6"
                  },
                  {
                    type: "Text",
                    content: "Mobile Apps",
                    tailwindStyles: "text-xl font-semibold text-white mb-3"
                  },
                  {
                    type: "Text",
                    content: "Native and cross-platform mobile applications that deliver exceptional user experiences.",
                    tailwindStyles: "text-sm text-zinc-400 leading-relaxed mb-4"
                  },
                  {
                    type: "Link",
                    content: "Learn more →",
                    href: "#",
                    tailwindStyles: "text-sm text-violet-500 group-hover:text-violet-400 transition-colors"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Service 4",
                content: "",
                tailwindStyles: "p-8 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:border-violet-500/50 transition-colors group",
                elements: [
                  {
                    type: "Text",
                    content: "🎯",
                    tailwindStyles: "text-4xl mb-6"
                  },
                  {
                    type: "Text",
                    content: "Digital Marketing",
                    tailwindStyles: "text-xl font-semibold text-white mb-3"
                  },
                  {
                    type: "Text",
                    content: "Data-driven marketing strategies to increase visibility, engagement, and conversions.",
                    tailwindStyles: "text-sm text-zinc-400 leading-relaxed mb-4"
                  },
                  {
                    type: "Link",
                    content: "Learn more →",
                    href: "#",
                    tailwindStyles: "text-sm text-violet-500 group-hover:text-violet-400 transition-colors"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Service 5",
                content: "",
                tailwindStyles: "p-8 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:border-violet-500/50 transition-colors group",
                elements: [
                  {
                    type: "Text",
                    content: "🔍",
                    tailwindStyles: "text-4xl mb-6"
                  },
                  {
                    type: "Text",
                    content: "SEO Optimization",
                    tailwindStyles: "text-xl font-semibold text-white mb-3"
                  },
                  {
                    type: "Text",
                    content: "Improve your search rankings and organic traffic with our proven SEO strategies.",
                    tailwindStyles: "text-sm text-zinc-400 leading-relaxed mb-4"
                  },
                  {
                    type: "Link",
                    content: "Learn more →",
                    href: "#",
                    tailwindStyles: "text-sm text-violet-500 group-hover:text-violet-400 transition-colors"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Service 6",
                content: "",
                tailwindStyles: "p-8 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:border-violet-500/50 transition-colors group",
                elements: [
                  {
                    type: "Text",
                    content: "📊",
                    tailwindStyles: "text-4xl mb-6"
                  },
                  {
                    type: "Text",
                    content: "Analytics & Insights",
                    tailwindStyles: "text-xl font-semibold text-white mb-3"
                  },
                  {
                    type: "Text",
                    content: "Turn data into actionable insights with our comprehensive analytics solutions.",
                    tailwindStyles: "text-sm text-zinc-400 leading-relaxed mb-4"
                  },
                  {
                    type: "Link",
                    content: "Learn more →",
                    href: "#",
                    tailwindStyles: "text-sm text-violet-500 group-hover:text-violet-400 transition-colors"
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== CASE STUDIES (CMSContentList) ====================
      {
        type: "Section",
        name: "Case Studies Section",
        content: "",
        role: "region",
        ariaLabel: "Case studies",
        tailwindStyles: "w-full px-6 md:px-16 py-20",
        elements: [
          {
            type: "Frame",
            name: "Section Header",
            content: "",
            tailwindStyles: "flex items-center justify-between mb-12",
            elements: [
              {
                type: "Frame",
                name: "Header Left",
                content: "",
                tailwindStyles: "flex flex-col",
                elements: [
                  {
                    type: "Text",
                    content: "Our Work",
                    tailwindStyles: "text-sm uppercase tracking-widest text-violet-500 mb-2"
                  },
                  {
                    type: "Text",
                    content: "Featured Case Studies",
                    tailwindStyles: "text-3xl md:text-4xl font-bold text-white"
                  }
                ]
              },
              {
                type: "Button",
                content: "View All Work →",
                tailwindStyles: "px-5 py-2.5 border border-zinc-700 text-white rounded-full text-sm hover:bg-zinc-800 transition-colors hidden md:block"
              }
            ]
          },
          {
            type: "CMSContentList",
            name: "Case Studies List",
            content: "",
            tailwindStyles: "flex flex-col gap-8",
            settings: {
              contentTypeId: "caseStudies",
              displayMode: "list",
              limit: 3,
              sortBy: "createdAt",
              sortOrder: "desc",
              fieldsToShow: [
                "title",
                "description",
                "image",
                "category",
                "results"
              ]
            },
            elements: [
              {
                type: "Frame",
                name: "Case Study Template",
                content: "",
                tailwindStyles: "flex flex-col md:flex-row gap-8 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 transition-colors",
                elements: [
                  {
                    type: "Image",
                    content: "Case Study Image",
                    src: "",
                    alt: "Case study preview",
                    tailwindStyles: "w-full md:w-1/2 aspect-video rounded-xl object-cover",
                    settings: {
                      objectFit: "cover",
                      loading: "lazy"
                    }
                  },
                  {
                    type: "Frame",
                    name: "Case Study Content",
                    content: "",
                    tailwindStyles: "flex-1 flex flex-col justify-center",
                    elements: [
                      {
                        type: "Text",
                        content: "E-Commerce",
                        tailwindStyles: "text-sm text-violet-500 mb-2"
                      },
                      {
                        type: "Text",
                        content: "Redesigning the shopping experience for TechMart",
                        tailwindStyles: "text-2xl font-bold text-white mb-4"
                      },
                      {
                        type: "Text",
                        content: "We helped TechMart increase their online sales by 200% through a complete redesign of their e-commerce platform.",
                        tailwindStyles: "text-zinc-400 leading-relaxed mb-6"
                      },
                      {
                        type: "Frame",
                        name: "Results",
                        content: "",
                        tailwindStyles: "flex gap-8",
                        elements: [
                          {
                            type: "Frame",
                            name: "Result 1",
                            content: "",
                            tailwindStyles: "flex flex-col",
                            elements: [
                              {
                                type: "Text",
                                content: "+200%",
                                tailwindStyles: "text-2xl font-bold text-violet-500"
                              },
                              {
                                type: "Text",
                                content: "Sales Increase",
                                tailwindStyles: "text-sm text-zinc-500"
                              }
                            ]
                          },
                          {
                            type: "Frame",
                            name: "Result 2",
                            content: "",
                            tailwindStyles: "flex flex-col",
                            elements: [
                              {
                                type: "Text",
                                content: "+85%",
                                tailwindStyles: "text-2xl font-bold text-violet-500"
                              },
                              {
                                type: "Text",
                                content: "User Engagement",
                                tailwindStyles: "text-sm text-zinc-500"
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== TEAM SECTION ====================
      {
        type: "Section",
        name: "Team Section",
        content: "",
        role: "region",
        ariaLabel: "Our team",
        tailwindStyles: "w-full px-6 md:px-16 py-20 bg-zinc-900",
        styles: {
          default: {
            backgroundColor: "#18181b"
          }
        },
        elements: [
          {
            type: "Text",
            content: "Meet the Team",
            tailwindStyles: "text-3xl md:text-4xl font-bold text-white mb-12 text-center"
          },
          {
            type: "List",
            name: "Team List",
            content: "",
            tailwindStyles: "grid grid-cols-2 md:grid-cols-4 gap-6",
            elements: [
              {
                type: "Frame",
                name: "Team Member 1",
                content: "",
                tailwindStyles: "flex flex-col items-center text-center group",
                elements: [
                  {
                    type: "Image",
                    content: "Team Member 1",
                    src: "",
                    alt: "Alex Thompson",
                    tailwindStyles: "w-32 h-32 rounded-full object-cover mb-4 group-hover:ring-4 ring-violet-500 transition-all",
                    settings: {
                      objectFit: "cover",
                      loading: "lazy"
                    }
                  },
                  {
                    type: "Text",
                    content: "Alex Thompson",
                    tailwindStyles: "text-lg font-semibold text-white"
                  },
                  {
                    type: "Text",
                    content: "CEO & Founder",
                    tailwindStyles: "text-sm text-zinc-500"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Team Member 2",
                content: "",
                tailwindStyles: "flex flex-col items-center text-center group",
                elements: [
                  {
                    type: "Image",
                    content: "Team Member 2",
                    src: "",
                    alt: "Sarah Chen",
                    tailwindStyles: "w-32 h-32 rounded-full object-cover mb-4 group-hover:ring-4 ring-violet-500 transition-all",
                    settings: {
                      objectFit: "cover",
                      loading: "lazy"
                    }
                  },
                  {
                    type: "Text",
                    content: "Sarah Chen",
                    tailwindStyles: "text-lg font-semibold text-white"
                  },
                  {
                    type: "Text",
                    content: "Creative Director",
                    tailwindStyles: "text-sm text-zinc-500"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Team Member 3",
                content: "",
                tailwindStyles: "flex flex-col items-center text-center group",
                elements: [
                  {
                    type: "Image",
                    content: "Team Member 3",
                    src: "",
                    alt: "Michael Park",
                    tailwindStyles: "w-32 h-32 rounded-full object-cover mb-4 group-hover:ring-4 ring-violet-500 transition-all",
                    settings: {
                      objectFit: "cover",
                      loading: "lazy"
                    }
                  },
                  {
                    type: "Text",
                    content: "Michael Park",
                    tailwindStyles: "text-lg font-semibold text-white"
                  },
                  {
                    type: "Text",
                    content: "Lead Developer",
                    tailwindStyles: "text-sm text-zinc-500"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Team Member 4",
                content: "",
                tailwindStyles: "flex flex-col items-center text-center group",
                elements: [
                  {
                    type: "Image",
                    content: "Team Member 4",
                    src: "",
                    alt: "Emma Wilson",
                    tailwindStyles: "w-32 h-32 rounded-full object-cover mb-4 group-hover:ring-4 ring-violet-500 transition-all",
                    settings: {
                      objectFit: "cover",
                      loading: "lazy"
                    }
                  },
                  {
                    type: "Text",
                    content: "Emma Wilson",
                    tailwindStyles: "text-lg font-semibold text-white"
                  },
                  {
                    type: "Text",
                    content: "Marketing Lead",
                    tailwindStyles: "text-sm text-zinc-500"
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== CONTACT CTA ====================
      {
        type: "Section",
        name: "Agency CTA",
        content: "",
        role: "region",
        ariaLabel: "Contact section",
        tailwindStyles: "w-full px-6 md:px-16 py-24 flex flex-col items-center text-center",
        elements: [
          {
            type: "Text",
            content: "Ready to start your project?",
            tailwindStyles: "text-4xl md:text-5xl font-bold text-white mb-6"
          },
          {
            type: "Text",
            content: "Let's discuss how we can help bring your vision to life.",
            tailwindStyles: "text-lg text-zinc-400 mb-10 max-w-xl"
          },
          {
            type: "Frame",
            name: "CTA Buttons",
            content: "",
            tailwindStyles: "flex flex-col sm:flex-row items-center gap-4",
            elements: [
              {
                type: "Button",
                content: "Start a Project →",
                tailwindStyles: "px-8 py-4 bg-violet-600 text-white rounded-full text-lg font-medium hover:bg-violet-500 transition-colors",
                styles: {
                  default: {
                    backgroundColor: "#7c3aed",
                    color: "#fff"
                  }
                }
              },
              {
                type: "Button",
                content: "Schedule a Call",
                tailwindStyles: "px-8 py-4 border border-zinc-700 text-white rounded-full text-lg hover:bg-zinc-800 transition-colors"
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== FOOTER ====================
      {
        type: "Frame",
        name: "Agency Footer",
        content: "",
        tailwindStyles: "w-full px-6 md:px-16 py-12 border-t border-zinc-800",
        elements: [
          {
            type: "Frame",
            name: "Footer Content",
            content: "",
            tailwindStyles: "grid grid-cols-2 md:grid-cols-4 gap-8 mb-12",
            elements: [
              {
                type: "Frame",
                name: "Brand Column",
                content: "",
                tailwindStyles: "col-span-2 md:col-span-1",
                elements: [
                  {
                    type: "Frame",
                    name: "Logo",
                    content: "",
                    tailwindStyles: "flex items-center gap-2 mb-4",
                    elements: [
                      {
                        type: "Image",
                        content: "Logo",
                        src: "",
                        alt: "Studio Logo",
                        tailwindStyles: "w-8 h-8 rounded-lg",
                        settings: {
                          objectFit: "contain",
                          loading: "lazy"
                        }
                      },
                      {
                        type: "Text",
                        content: "STUDIO",
                        tailwindStyles: "text-lg font-bold text-white"
                      }
                    ]
                  },
                  {
                    type: "Text",
                    content: "Building exceptional digital experiences since 2016.",
                    tailwindStyles: "text-sm text-zinc-500"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Services Column",
                content: "",
                tailwindStyles: "flex flex-col gap-3",
                elements: [
                  {
                    type: "Text",
                    content: "Services",
                    tailwindStyles: "text-sm font-semibold text-white mb-2"
                  },
                  {
                    type: "Link",
                    content: "Brand Strategy",
                    href: "#",
                    tailwindStyles: "text-sm text-zinc-500 hover:text-white transition-colors"
                  },
                  {
                    type: "Link",
                    content: "Web Development",
                    href: "#",
                    tailwindStyles: "text-sm text-zinc-500 hover:text-white transition-colors"
                  },
                  {
                    type: "Link",
                    content: "Mobile Apps",
                    href: "#",
                    tailwindStyles: "text-sm text-zinc-500 hover:text-white transition-colors"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Company Column",
                content: "",
                tailwindStyles: "flex flex-col gap-3",
                elements: [
                  {
                    type: "Text",
                    content: "Company",
                    tailwindStyles: "text-sm font-semibold text-white mb-2"
                  },
                  {
                    type: "Link",
                    content: "About",
                    href: "#",
                    tailwindStyles: "text-sm text-zinc-500 hover:text-white transition-colors"
                  },
                  {
                    type: "Link",
                    content: "Careers",
                    href: "#",
                    tailwindStyles: "text-sm text-zinc-500 hover:text-white transition-colors"
                  },
                  {
                    type: "Link",
                    content: "Contact",
                    href: "#",
                    tailwindStyles: "text-sm text-zinc-500 hover:text-white transition-colors"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Social Column",
                content: "",
                tailwindStyles: "flex flex-col gap-3",
                elements: [
                  {
                    type: "Text",
                    content: "Follow Us",
                    tailwindStyles: "text-sm font-semibold text-white mb-2"
                  },
                  {
                    type: "Link",
                    content: "Twitter",
                    href: "#",
                    tailwindStyles: "text-sm text-zinc-500 hover:text-white transition-colors"
                  },
                  {
                    type: "Link",
                    content: "LinkedIn",
                    href: "#",
                    tailwindStyles: "text-sm text-zinc-500 hover:text-white transition-colors"
                  },
                  {
                    type: "Link",
                    content: "Dribbble",
                    href: "#",
                    tailwindStyles: "text-sm text-zinc-500 hover:text-white transition-colors"
                  }
                ]
              }
            ]
          },
          {
            type: "Frame",
            name: "Footer Bottom",
            content: "",
            tailwindStyles: "pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4",
            elements: [
              {
                type: "Text",
                content: "© 2024 Studio Agency. All rights reserved.",
                tailwindStyles: "text-sm text-zinc-500"
              },
              {
                type: "Frame",
                name: "Legal Links",
                content: "",
                tailwindStyles: "flex items-center gap-6",
                elements: [
                  {
                    type: "Link",
                    content: "Privacy Policy",
                    href: "#",
                    tailwindStyles: "text-sm text-zinc-500 hover:text-white transition-colors"
                  },
                  {
                    type: "Link",
                    content: "Terms of Service",
                    href: "#",
                    tailwindStyles: "text-sm text-zinc-500 hover:text-white transition-colors"
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      }
    ],
    href: "",
    src: ""
  }
};
const saasSiteTemplate = {
  component: {
    type: "Section",
    id: mkId$1("saas-site"),
    name: "SaaS Site Template",
    role: "main",
    ariaLabel: "SaaS Product Website Template",
    content: "",
    tailwindStyles: "w-full min-h-screen bg-slate-50",
    styles: {
      default: {
        backgroundColor: "#f8fafc"
      }
    },
    elements: [
      // ==================== NAVBAR ====================
      {
        type: "Frame",
        name: "SaaS Navbar",
        content: "",
        tailwindStyles: "w-full flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-slate-200 sticky top-0 z-50",
        styles: {
          default: {
            backgroundColor: "#fff"
          }
        },
        elements: [
          {
            type: "Frame",
            name: "Logo",
            content: "",
            tailwindStyles: "flex items-center gap-2",
            elements: [
              {
                type: "Image",
                content: "Logo",
                src: "",
                alt: "FlowSync Logo",
                tailwindStyles: "w-8 h-8 rounded-lg",
                settings: {
                  objectFit: "contain",
                  loading: "eager"
                }
              },
              {
                type: "Text",
                content: "FlowSync",
                tailwindStyles: "text-xl font-bold text-slate-900"
              }
            ]
          },
          {
            type: "Frame",
            name: "Nav Links",
            content: "",
            tailwindStyles: "hidden md:flex items-center gap-8",
            elements: [
              {
                type: "Link",
                content: "Features",
                href: "#features",
                tailwindStyles: "text-sm text-slate-600 hover:text-slate-900 transition-colors"
              },
              {
                type: "Link",
                content: "Pricing",
                href: "#pricing",
                tailwindStyles: "text-sm text-slate-600 hover:text-slate-900 transition-colors"
              },
              {
                type: "Link",
                content: "Docs",
                href: "#",
                tailwindStyles: "text-sm text-slate-600 hover:text-slate-900 transition-colors"
              },
              {
                type: "Link",
                content: "Blog",
                href: "#",
                tailwindStyles: "text-sm text-slate-600 hover:text-slate-900 transition-colors"
              }
            ]
          },
          {
            type: "Frame",
            name: "Auth Buttons",
            content: "",
            tailwindStyles: "flex items-center gap-3",
            elements: [
              {
                type: "Button",
                content: "Sign In",
                tailwindStyles: "px-4 py-2 text-sm text-slate-700 hover:text-slate-900 transition-colors"
              },
              {
                type: "Button",
                content: "Get Started Free",
                tailwindStyles: "px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors",
                styles: {
                  default: {
                    backgroundColor: "#2563eb",
                    color: "#fff"
                  }
                }
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== HERO ====================
      {
        type: "Section",
        name: "SaaS Hero",
        content: "",
        role: "region",
        ariaLabel: "Hero section",
        tailwindStyles: "w-full px-6 md:px-12 py-20 md:py-28 flex flex-col items-center text-center",
        elements: [
          {
            type: "Frame",
            name: "Badge",
            content: "",
            tailwindStyles: "px-4 py-1.5 bg-blue-100 rounded-full mb-6",
            elements: [
              {
                type: "Text",
                content: "🎉 New: AI-powered automation is here",
                tailwindStyles: "text-sm text-blue-700 font-medium"
              }
            ]
          },
          {
            type: "Text",
            content: "Streamline your workflow with intelligent automation",
            tailwindStyles: "text-4xl md:text-6xl font-bold text-slate-900 leading-tight max-w-4xl"
          },
          {
            type: "Text",
            content: "FlowSync helps teams automate repetitive tasks, integrate their favorite tools, and focus on what matters most.",
            tailwindStyles: "text-lg text-slate-600 mt-6 max-w-2xl leading-relaxed"
          },
          {
            type: "Frame",
            name: "Hero CTA",
            content: "",
            tailwindStyles: "flex flex-col sm:flex-row items-center gap-4 mt-10",
            elements: [
              {
                type: "Button",
                content: "Start Free Trial",
                tailwindStyles: "px-8 py-3.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25",
                styles: {
                  default: {
                    backgroundColor: "#2563eb",
                    color: "#fff"
                  }
                }
              },
              {
                type: "Button",
                content: "Watch Demo →",
                tailwindStyles: "px-8 py-3.5 text-slate-700 font-medium hover:text-slate-900 transition-colors"
              }
            ]
          },
          {
            type: "Text",
            content: "No credit card required • 14-day free trial",
            tailwindStyles: "text-sm text-slate-500 mt-4"
          },
          {
            type: "Image",
            content: "Product Screenshot",
            src: "",
            alt: "FlowSync dashboard",
            tailwindStyles: "w-full max-w-5xl mt-16 rounded-xl shadow-2xl border border-slate-200",
            settings: {
              objectFit: "cover",
              loading: "lazy"
            }
          }
        ],
        href: "",
        src: ""
      },
      // ==================== FEATURES ====================
      {
        type: "Section",
        name: "SaaS Features",
        content: "",
        role: "region",
        ariaLabel: "Features section",
        tailwindStyles: "w-full px-6 md:px-12 py-20",
        elements: [
          {
            type: "Frame",
            name: "Section Header",
            content: "",
            tailwindStyles: "text-center mb-16",
            elements: [
              {
                type: "Text",
                content: "Everything you need",
                tailwindStyles: "text-3xl md:text-4xl font-bold text-slate-900"
              },
              {
                type: "Text",
                content: "Powerful features to help you manage and automate your entire workflow.",
                tailwindStyles: "text-lg text-slate-600 mt-4 max-w-xl mx-auto"
              }
            ]
          },
          {
            type: "List",
            name: "Features List",
            content: "",
            tailwindStyles: "grid grid-cols-1 md:grid-cols-3 gap-8",
            elements: [
              {
                type: "Frame",
                name: "Feature 1",
                content: "",
                tailwindStyles: "p-6 bg-white rounded-2xl border border-slate-200",
                elements: [
                  {
                    type: "Text",
                    content: "⚡",
                    tailwindStyles: "text-4xl mb-4"
                  },
                  {
                    type: "Text",
                    content: "Lightning Fast",
                    tailwindStyles: "text-lg font-semibold text-slate-900 mb-2"
                  },
                  {
                    type: "Text",
                    content: "Execute workflows in milliseconds with our optimized infrastructure.",
                    tailwindStyles: "text-sm text-slate-600 leading-relaxed"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Feature 2",
                content: "",
                tailwindStyles: "p-6 bg-white rounded-2xl border border-slate-200",
                elements: [
                  {
                    type: "Text",
                    content: "🔗",
                    tailwindStyles: "text-4xl mb-4"
                  },
                  {
                    type: "Text",
                    content: "500+ Integrations",
                    tailwindStyles: "text-lg font-semibold text-slate-900 mb-2"
                  },
                  {
                    type: "Text",
                    content: "Connect with all your favorite tools and services seamlessly.",
                    tailwindStyles: "text-sm text-slate-600 leading-relaxed"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Feature 3",
                content: "",
                tailwindStyles: "p-6 bg-white rounded-2xl border border-slate-200",
                elements: [
                  {
                    type: "Text",
                    content: "🤖",
                    tailwindStyles: "text-4xl mb-4"
                  },
                  {
                    type: "Text",
                    content: "AI-Powered",
                    tailwindStyles: "text-lg font-semibold text-slate-900 mb-2"
                  },
                  {
                    type: "Text",
                    content: "Let AI suggest and optimize your workflows automatically.",
                    tailwindStyles: "text-sm text-slate-600 leading-relaxed"
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== PRICING ====================
      {
        type: "Section",
        name: "SaaS Pricing",
        content: "",
        role: "region",
        ariaLabel: "Pricing section",
        tailwindStyles: "w-full px-6 md:px-12 py-20 bg-white",
        styles: {
          default: {
            backgroundColor: "#fff"
          }
        },
        elements: [
          {
            type: "Frame",
            name: "Section Header",
            content: "",
            tailwindStyles: "text-center mb-12",
            elements: [
              {
                type: "Text",
                content: "Simple, transparent pricing",
                tailwindStyles: "text-3xl md:text-4xl font-bold text-slate-900"
              },
              {
                type: "Text",
                content: "Choose the plan that works best for your team.",
                tailwindStyles: "text-lg text-slate-600 mt-4"
              }
            ]
          },
          {
            type: "List",
            name: "Pricing Plans",
            content: "",
            tailwindStyles: "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto",
            elements: [
              {
                type: "Frame",
                name: "Starter Plan",
                content: "",
                tailwindStyles: "p-8 bg-slate-50 rounded-2xl border border-slate-200",
                elements: [
                  {
                    type: "Text",
                    content: "Starter",
                    tailwindStyles: "text-lg font-semibold text-slate-900"
                  },
                  {
                    type: "Text",
                    content: "$0",
                    tailwindStyles: "text-4xl font-bold text-slate-900 mt-4"
                  },
                  {
                    type: "Text",
                    content: "/month",
                    tailwindStyles: "text-slate-600"
                  },
                  {
                    type: "Button",
                    content: "Get Started",
                    tailwindStyles: "w-full px-4 py-3 mt-6 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  },
                  {
                    type: "List",
                    name: "Features",
                    content: "",
                    tailwindStyles: "mt-8 flex flex-col gap-3",
                    elements: [
                      {
                        type: "Text",
                        content: "✓ 100 tasks/month",
                        tailwindStyles: "text-sm text-slate-600"
                      },
                      {
                        type: "Text",
                        content: "✓ 3 workflows",
                        tailwindStyles: "text-sm text-slate-600"
                      },
                      {
                        type: "Text",
                        content: "✓ Basic integrations",
                        tailwindStyles: "text-sm text-slate-600"
                      }
                    ]
                  }
                ]
              },
              {
                type: "Frame",
                name: "Pro Plan",
                content: "",
                tailwindStyles: "p-8 bg-blue-600 rounded-2xl relative",
                styles: {
                  default: {
                    backgroundColor: "#2563eb"
                  }
                },
                elements: [
                  {
                    type: "Text",
                    content: "Most Popular",
                    tailwindStyles: "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 rounded-full text-xs font-semibold text-yellow-900"
                  },
                  {
                    type: "Text",
                    content: "Pro",
                    tailwindStyles: "text-lg font-semibold text-white"
                  },
                  {
                    type: "Text",
                    content: "$29",
                    tailwindStyles: "text-4xl font-bold text-white mt-4"
                  },
                  {
                    type: "Text",
                    content: "/month",
                    tailwindStyles: "text-blue-200"
                  },
                  {
                    type: "Button",
                    content: "Start Free Trial",
                    tailwindStyles: "w-full px-4 py-3 mt-6 bg-white rounded-lg font-medium text-blue-600 hover:bg-blue-50 transition-colors",
                    styles: {
                      default: {
                        backgroundColor: "#fff",
                        color: "#2563eb"
                      }
                    }
                  },
                  {
                    type: "List",
                    name: "Features",
                    content: "",
                    tailwindStyles: "mt-8 flex flex-col gap-3",
                    elements: [
                      {
                        type: "Text",
                        content: "✓ Unlimited tasks",
                        tailwindStyles: "text-sm text-white"
                      },
                      {
                        type: "Text",
                        content: "✓ Unlimited workflows",
                        tailwindStyles: "text-sm text-white"
                      },
                      {
                        type: "Text",
                        content: "✓ All integrations",
                        tailwindStyles: "text-sm text-white"
                      },
                      {
                        type: "Text",
                        content: "✓ Priority support",
                        tailwindStyles: "text-sm text-white"
                      }
                    ]
                  }
                ]
              },
              {
                type: "Frame",
                name: "Enterprise Plan",
                content: "",
                tailwindStyles: "p-8 bg-slate-50 rounded-2xl border border-slate-200",
                elements: [
                  {
                    type: "Text",
                    content: "Enterprise",
                    tailwindStyles: "text-lg font-semibold text-slate-900"
                  },
                  {
                    type: "Text",
                    content: "Custom",
                    tailwindStyles: "text-4xl font-bold text-slate-900 mt-4"
                  },
                  {
                    type: "Button",
                    content: "Contact Sales",
                    tailwindStyles: "w-full px-4 py-3 mt-6 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  },
                  {
                    type: "List",
                    name: "Features",
                    content: "",
                    tailwindStyles: "mt-8 flex flex-col gap-3",
                    elements: [
                      {
                        type: "Text",
                        content: "✓ Everything in Pro",
                        tailwindStyles: "text-sm text-slate-600"
                      },
                      {
                        type: "Text",
                        content: "✓ SSO & SAML",
                        tailwindStyles: "text-sm text-slate-600"
                      },
                      {
                        type: "Text",
                        content: "✓ Dedicated support",
                        tailwindStyles: "text-sm text-slate-600"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== NEWSLETTER FORM ====================
      {
        type: "Section",
        name: "SaaS Newsletter",
        content: "",
        role: "region",
        ariaLabel: "Newsletter section",
        tailwindStyles: "w-full px-6 md:px-12 py-20 bg-slate-100",
        elements: [
          {
            type: "Frame",
            name: "Newsletter Container",
            content: "",
            tailwindStyles: "max-w-2xl mx-auto text-center",
            elements: [
              {
                type: "Text",
                content: "Stay in the loop",
                tailwindStyles: "text-2xl font-bold text-slate-900 mb-2"
              },
              {
                type: "Text",
                content: "Get product updates, tips, and insights delivered to your inbox.",
                tailwindStyles: "text-slate-600 mb-8"
              },
              {
                type: "Form",
                name: "Newsletter Form",
                content: "",
                tailwindStyles: "flex flex-col sm:flex-row gap-3",
                settings: {
                  action: "/api/newsletter",
                  method: "post"
                },
                elements: [
                  {
                    type: "Input",
                    name: "email",
                    content: "",
                    tailwindStyles: "flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                    settings: {
                      type: "email",
                      placeholder: "Enter your email",
                      required: true
                    }
                  },
                  {
                    type: "Button",
                    content: "Subscribe",
                    tailwindStyles: "px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors",
                    styles: {
                      default: {
                        backgroundColor: "#2563eb",
                        color: "#fff"
                      }
                    }
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== FOOTER ====================
      {
        type: "Frame",
        name: "SaaS Footer",
        content: "",
        tailwindStyles: "w-full px-6 md:px-12 py-12 bg-slate-900 text-white",
        styles: {
          default: {
            backgroundColor: "#0f172a"
          }
        },
        elements: [
          {
            type: "Frame",
            name: "Footer Bottom",
            content: "",
            tailwindStyles: "flex flex-col md:flex-row items-center justify-between gap-4",
            elements: [
              {
                type: "Text",
                content: "© 2024 FlowSync. All rights reserved.",
                tailwindStyles: "text-sm text-slate-500"
              },
              {
                type: "Frame",
                name: "Footer Links",
                content: "",
                tailwindStyles: "flex items-center gap-6",
                elements: [
                  {
                    type: "Link",
                    content: "Privacy",
                    href: "#",
                    tailwindStyles: "text-sm text-slate-500 hover:text-white transition-colors"
                  },
                  {
                    type: "Link",
                    content: "Terms",
                    href: "#",
                    tailwindStyles: "text-sm text-slate-500 hover:text-white transition-colors"
                  },
                  {
                    type: "Link",
                    content: "Contact",
                    href: "#",
                    tailwindStyles: "text-sm text-slate-500 hover:text-white transition-colors"
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      }
    ],
    href: "",
    src: ""
  }
};
const blogSiteTemplate = {
  component: {
    type: "Section",
    id: mkId$1("blog-site"),
    name: "Blog Site Template",
    role: "main",
    ariaLabel: "Blog Website Template",
    content: "",
    tailwindStyles: "w-full min-h-screen bg-white",
    elements: [
      // ==================== NAVBAR ====================
      {
        type: "Frame",
        name: "Blog Navbar",
        content: "",
        tailwindStyles: "w-full flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-100",
        elements: [
          {
            type: "Text",
            content: "The Daily Read",
            tailwindStyles: "text-2xl font-serif font-bold text-gray-900 italic"
          },
          {
            type: "Frame",
            name: "Nav Links",
            content: "",
            tailwindStyles: "hidden md:flex items-center gap-8",
            elements: [
              {
                type: "Link",
                content: "Home",
                href: "#",
                tailwindStyles: "text-sm text-gray-600 hover:text-gray-900 transition-colors"
              },
              {
                type: "Link",
                content: "Technology",
                href: "#",
                tailwindStyles: "text-sm text-gray-600 hover:text-gray-900 transition-colors"
              },
              {
                type: "Link",
                content: "Lifestyle",
                href: "#",
                tailwindStyles: "text-sm text-gray-600 hover:text-gray-900 transition-colors"
              },
              {
                type: "Link",
                content: "Travel",
                href: "#",
                tailwindStyles: "text-sm text-gray-600 hover:text-gray-900 transition-colors"
              }
            ]
          },
          {
            type: "Button",
            content: "Subscribe",
            tailwindStyles: "px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors",
            styles: { default: { backgroundColor: "#111827", color: "#fff" } }
          }
        ],
        href: "",
        src: ""
      },
      // ==================== FEATURED POST ====================
      {
        type: "Section",
        name: "Featured Post",
        content: "",
        role: "region",
        ariaLabel: "Featured article",
        tailwindStyles: "w-full px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-2 gap-8",
        elements: [
          {
            type: "Image",
            content: "Featured Post Image",
            src: "",
            alt: "Featured blog post",
            tailwindStyles: "aspect-[4/3] rounded-2xl object-cover w-full",
            settings: { objectFit: "cover", loading: "eager" }
          },
          {
            type: "Frame",
            name: "Featured Content",
            content: "",
            tailwindStyles: "flex flex-col justify-center",
            elements: [
              {
                type: "Text",
                content: "Featured",
                tailwindStyles: "px-3 py-1 bg-amber-100 rounded-full text-xs font-medium text-amber-700 uppercase w-fit mb-4"
              },
              {
                type: "Text",
                content: "The Future of Remote Work: How Technology is Reshaping Our Offices",
                tailwindStyles: "text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight"
              },
              {
                type: "Text",
                content: "Explore how the global shift to remote work is changing everything from office design to team collaboration.",
                tailwindStyles: "text-gray-600 mt-4 leading-relaxed"
              },
              {
                type: "Frame",
                name: "Author",
                content: "",
                tailwindStyles: "flex items-center gap-3 mt-6",
                elements: [
                  {
                    type: "Image",
                    content: "Author Avatar",
                    src: "",
                    alt: "Author",
                    tailwindStyles: "w-10 h-10 rounded-full object-cover",
                    settings: { objectFit: "cover", loading: "lazy" }
                  },
                  {
                    type: "Frame",
                    name: "Author Info",
                    content: "",
                    tailwindStyles: "flex flex-col",
                    elements: [
                      {
                        type: "Text",
                        content: "Sarah Johnson",
                        tailwindStyles: "text-sm font-medium text-gray-900"
                      },
                      {
                        type: "Text",
                        content: "March 15, 2024 • 8 min read",
                        tailwindStyles: "text-xs text-gray-500"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== BLOG POSTS GRID ====================
      {
        type: "Section",
        name: "Blog Posts",
        content: "",
        role: "region",
        ariaLabel: "Latest articles",
        tailwindStyles: "w-full px-6 md:px-12 py-12",
        elements: [
          {
            type: "Text",
            content: "Latest Articles",
            tailwindStyles: "text-2xl font-serif font-bold text-gray-900 mb-8"
          },
          {
            type: "CMSContentGrid",
            name: "Posts Grid",
            content: "",
            tailwindStyles: "grid grid-cols-1 md:grid-cols-3 gap-8",
            settings: {
              contentTypeId: "blogPosts",
              displayMode: "grid",
              limit: 6,
              sortBy: "createdAt",
              sortOrder: "desc"
            },
            elements: [
              {
                type: "Frame",
                name: "Post Card Template",
                content: "",
                tailwindStyles: "flex flex-col cursor-pointer group",
                elements: [
                  {
                    type: "Image",
                    content: "Post Image",
                    src: "",
                    alt: "Blog post",
                    tailwindStyles: "aspect-[3/2] rounded-xl object-cover mb-4 group-hover:scale-105 transition-transform duration-300",
                    settings: { objectFit: "cover", loading: "lazy" }
                  },
                  {
                    type: "Text",
                    content: "Category",
                    tailwindStyles: "text-xs font-medium text-blue-600 uppercase tracking-wide mb-2"
                  },
                  {
                    type: "Text",
                    content: "Article Title Here",
                    tailwindStyles: "text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"
                  },
                  {
                    type: "Text",
                    content: "March 10, 2024",
                    tailwindStyles: "text-sm text-gray-500 mt-2"
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== NEWSLETTER ====================
      {
        type: "Section",
        name: "Blog Newsletter",
        content: "",
        role: "region",
        ariaLabel: "Newsletter",
        tailwindStyles: "w-full px-6 md:px-12 py-16 bg-gray-50 flex flex-col items-center text-center",
        elements: [
          {
            type: "Text",
            content: "Stay Updated",
            tailwindStyles: "text-2xl font-serif font-bold text-gray-900"
          },
          {
            type: "Text",
            content: "Get the latest articles delivered straight to your inbox.",
            tailwindStyles: "text-gray-600 mt-2 max-w-md"
          },
          {
            type: "Form",
            name: "Newsletter Form",
            content: "",
            tailwindStyles: "flex flex-col sm:flex-row items-center gap-3 mt-6 w-full max-w-md",
            settings: { action: "/api/subscribe", method: "post" },
            elements: [
              {
                type: "Input",
                name: "email",
                content: "",
                tailwindStyles: "flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900",
                settings: {
                  type: "email",
                  placeholder: "Enter your email",
                  required: true
                }
              },
              {
                type: "Button",
                content: "Subscribe",
                tailwindStyles: "px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors",
                styles: {
                  default: { backgroundColor: "#111827", color: "#fff" }
                }
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== FOOTER ====================
      {
        type: "Frame",
        name: "Blog Footer",
        content: "",
        tailwindStyles: "w-full px-6 md:px-12 py-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4",
        elements: [
          {
            type: "Text",
            content: "© 2024 The Daily Read. All rights reserved.",
            tailwindStyles: "text-sm text-gray-500"
          },
          {
            type: "Frame",
            name: "Footer Links",
            content: "",
            tailwindStyles: "flex items-center gap-6",
            elements: [
              {
                type: "Link",
                content: "Privacy",
                href: "#",
                tailwindStyles: "text-sm text-gray-500 hover:text-gray-900 transition-colors"
              },
              {
                type: "Link",
                content: "Terms",
                href: "#",
                tailwindStyles: "text-sm text-gray-500 hover:text-gray-900 transition-colors"
              },
              {
                type: "Link",
                content: "RSS",
                href: "#",
                tailwindStyles: "text-sm text-gray-500 hover:text-gray-900 transition-colors"
              }
            ]
          }
        ],
        href: "",
        src: ""
      }
    ],
    href: "",
    src: ""
  }
};
const ecommerceSiteTemplate = {
  component: {
    type: "Section",
    id: mkId$1("ecommerce-site"),
    name: "E-Commerce Site Template",
    role: "main",
    ariaLabel: "E-Commerce Website Template",
    content: "",
    tailwindStyles: "w-full min-h-screen bg-white",
    elements: [
      // ==================== NAVBAR ====================
      {
        type: "Frame",
        name: "Shop Navbar",
        content: "",
        tailwindStyles: "w-full flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-100 sticky top-0 z-50",
        elements: [
          {
            type: "Text",
            content: "SHOPIFY",
            tailwindStyles: "text-xl font-bold tracking-widest text-gray-900"
          },
          {
            type: "Frame",
            name: "Nav Links",
            content: "",
            tailwindStyles: "hidden md:flex items-center gap-8",
            elements: [
              {
                type: "Link",
                content: "New Arrivals",
                href: "#",
                tailwindStyles: "text-sm text-gray-600 hover:text-gray-900 transition-colors"
              },
              {
                type: "Link",
                content: "Women",
                href: "#",
                tailwindStyles: "text-sm text-gray-600 hover:text-gray-900 transition-colors"
              },
              {
                type: "Link",
                content: "Men",
                href: "#",
                tailwindStyles: "text-sm text-gray-600 hover:text-gray-900 transition-colors"
              },
              {
                type: "Link",
                content: "Sale",
                href: "#",
                tailwindStyles: "text-sm text-red-600 font-medium hover:text-red-700 transition-colors"
              }
            ]
          },
          {
            type: "Frame",
            name: "Nav Actions",
            content: "",
            tailwindStyles: "flex items-center gap-4",
            elements: [
              {
                type: "Button",
                content: "🔍",
                tailwindStyles: "p-2 text-gray-600 hover:text-gray-900 transition-colors"
              },
              {
                type: "Button",
                content: "♡",
                tailwindStyles: "p-2 text-gray-600 hover:text-gray-900 transition-colors"
              },
              {
                type: "Button",
                content: "🛒",
                tailwindStyles: "p-2 text-gray-600 hover:text-gray-900 transition-colors"
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== HERO ====================
      {
        type: "Section",
        name: "Shop Hero",
        content: "",
        role: "region",
        ariaLabel: "Hero section",
        tailwindStyles: "w-full px-6 md:px-12 py-16 md:py-24 bg-gradient-to-r from-amber-50 to-orange-50 flex flex-col md:flex-row items-center gap-12",
        elements: [
          {
            type: "Frame",
            name: "Hero Content",
            content: "",
            tailwindStyles: "flex-1",
            elements: [
              {
                type: "Text",
                content: "Spring Collection 2024",
                tailwindStyles: "text-sm uppercase tracking-widest text-amber-700 mb-4"
              },
              {
                type: "Text",
                content: "Discover Your Perfect Style",
                tailwindStyles: "text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
              },
              {
                type: "Text",
                content: "Explore our latest collection of handpicked items, designed to elevate your everyday look.",
                tailwindStyles: "text-lg text-gray-600 mt-4 max-w-lg"
              },
              {
                type: "Button",
                content: "Shop Now →",
                tailwindStyles: "mt-8 px-8 py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors",
                styles: {
                  default: { backgroundColor: "#111827", color: "#fff" }
                }
              }
            ]
          },
          {
            type: "Image",
            content: "Hero Image",
            src: "",
            alt: "Spring Collection",
            tailwindStyles: "flex-1 aspect-square max-w-lg rounded-2xl object-cover",
            settings: { objectFit: "cover", loading: "eager" }
          }
        ],
        href: "",
        src: ""
      },
      // ==================== PRODUCT CAROUSEL ====================
      {
        type: "Section",
        name: "Featured Products",
        content: "",
        role: "region",
        ariaLabel: "Featured products",
        tailwindStyles: "w-full px-6 md:px-12 py-16",
        elements: [
          {
            type: "Frame",
            name: "Section Header",
            content: "",
            tailwindStyles: "flex items-center justify-between mb-8",
            elements: [
              {
                type: "Text",
                content: "Trending Now",
                tailwindStyles: "text-2xl font-bold text-gray-900"
              },
              {
                type: "Link",
                content: "View All →",
                href: "#",
                tailwindStyles: "text-sm text-gray-600 hover:text-gray-900 transition-colors"
              }
            ]
          },
          {
            type: "Carousel",
            name: "Products Carousel",
            content: "",
            tailwindStyles: "w-full",
            settings: {
              loop: true,
              slidesToShow: 4,
              withNavigation: true,
              breakpoints: {
                "(max-width: 768px)": { slidesToShow: 2 },
                "(max-width: 1024px)": { slidesToShow: 3 }
              }
            },
            elements: [
              {
                type: "Frame",
                name: "Product 1",
                content: "",
                tailwindStyles: "px-2 group cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Product 1",
                    src: "",
                    alt: "Product",
                    tailwindStyles: "aspect-[3/4] rounded-lg object-cover w-full mb-4 group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" }
                  },
                  {
                    type: "Text",
                    content: "Linen Blend Shirt",
                    tailwindStyles: "text-sm font-medium text-gray-900"
                  },
                  {
                    type: "Text",
                    content: "$59.00",
                    tailwindStyles: "text-sm text-gray-600 mt-1"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Product 2",
                content: "",
                tailwindStyles: "px-2 group cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Product 2",
                    src: "",
                    alt: "Product",
                    tailwindStyles: "aspect-[3/4] rounded-lg object-cover w-full mb-4 group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" }
                  },
                  {
                    type: "Text",
                    content: "Wool Cardigan",
                    tailwindStyles: "text-sm font-medium text-gray-900"
                  },
                  {
                    type: "Text",
                    content: "$79.00",
                    tailwindStyles: "text-sm text-gray-600 mt-1"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Product 3",
                content: "",
                tailwindStyles: "px-2 group cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Product 3",
                    src: "",
                    alt: "Product",
                    tailwindStyles: "aspect-[3/4] rounded-lg object-cover w-full mb-4 group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" }
                  },
                  {
                    type: "Text",
                    content: "Relaxed Fit Jeans",
                    tailwindStyles: "text-sm font-medium text-gray-900"
                  },
                  {
                    type: "Text",
                    content: "$89.00",
                    tailwindStyles: "text-sm text-gray-600 mt-1"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Product 4",
                content: "",
                tailwindStyles: "px-2 group cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Product 4",
                    src: "",
                    alt: "Product",
                    tailwindStyles: "aspect-[3/4] rounded-lg object-cover w-full mb-4 group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" }
                  },
                  {
                    type: "Text",
                    content: "Leather Tote Bag",
                    tailwindStyles: "text-sm font-medium text-gray-900"
                  },
                  {
                    type: "Text",
                    content: "$149.00",
                    tailwindStyles: "text-sm text-gray-600 mt-1"
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== CATEGORIES GRID ====================
      {
        type: "Section",
        name: "Categories",
        content: "",
        role: "region",
        ariaLabel: "Shop by category",
        tailwindStyles: "w-full px-6 md:px-12 py-16 bg-gray-50",
        elements: [
          {
            type: "Text",
            content: "Shop by Category",
            tailwindStyles: "text-2xl font-bold text-gray-900 mb-8 text-center"
          },
          {
            type: "List",
            name: "Categories Grid",
            content: "",
            tailwindStyles: "grid grid-cols-2 md:grid-cols-4 gap-6",
            elements: [
              {
                type: "Frame",
                name: "Category 1",
                content: "",
                tailwindStyles: "group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Dresses",
                    src: "",
                    alt: "Dresses",
                    tailwindStyles: "absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" }
                  },
                  {
                    type: "Frame",
                    name: "Overlay",
                    content: "",
                    tailwindStyles: "absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-end p-4",
                    elements: [
                      {
                        type: "Text",
                        content: "Dresses",
                        tailwindStyles: "text-lg font-semibold text-white"
                      }
                    ]
                  }
                ]
              },
              {
                type: "Frame",
                name: "Category 2",
                content: "",
                tailwindStyles: "group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Tops",
                    src: "",
                    alt: "Tops",
                    tailwindStyles: "absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" }
                  },
                  {
                    type: "Frame",
                    name: "Overlay",
                    content: "",
                    tailwindStyles: "absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-end p-4",
                    elements: [
                      {
                        type: "Text",
                        content: "Tops",
                        tailwindStyles: "text-lg font-semibold text-white"
                      }
                    ]
                  }
                ]
              },
              {
                type: "Frame",
                name: "Category 3",
                content: "",
                tailwindStyles: "group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Bottoms",
                    src: "",
                    alt: "Bottoms",
                    tailwindStyles: "absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" }
                  },
                  {
                    type: "Frame",
                    name: "Overlay",
                    content: "",
                    tailwindStyles: "absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-end p-4",
                    elements: [
                      {
                        type: "Text",
                        content: "Bottoms",
                        tailwindStyles: "text-lg font-semibold text-white"
                      }
                    ]
                  }
                ]
              },
              {
                type: "Frame",
                name: "Category 4",
                content: "",
                tailwindStyles: "group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Accessories",
                    src: "",
                    alt: "Accessories",
                    tailwindStyles: "absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" }
                  },
                  {
                    type: "Frame",
                    name: "Overlay",
                    content: "",
                    tailwindStyles: "absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-end p-4",
                    elements: [
                      {
                        type: "Text",
                        content: "Accessories",
                        tailwindStyles: "text-lg font-semibold text-white"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      },
      // ==================== FOOTER ====================
      {
        type: "Frame",
        name: "Shop Footer",
        content: "",
        tailwindStyles: "w-full px-6 md:px-12 py-12 bg-gray-900 text-white",
        styles: { default: { backgroundColor: "#111827" } },
        elements: [
          {
            type: "Frame",
            name: "Footer Grid",
            content: "",
            tailwindStyles: "grid grid-cols-2 md:grid-cols-4 gap-8 mb-8",
            elements: [
              {
                type: "Frame",
                name: "Brand",
                content: "",
                tailwindStyles: "col-span-2 md:col-span-1",
                elements: [
                  {
                    type: "Text",
                    content: "SHOPIFY",
                    tailwindStyles: "text-xl font-bold tracking-widest text-white mb-4"
                  },
                  {
                    type: "Text",
                    content: "Premium quality fashion for the modern lifestyle.",
                    tailwindStyles: "text-sm text-gray-400"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Shop Column",
                content: "",
                tailwindStyles: "flex flex-col gap-3",
                elements: [
                  {
                    type: "Text",
                    content: "Shop",
                    tailwindStyles: "text-sm font-semibold text-white mb-2"
                  },
                  {
                    type: "Link",
                    content: "New Arrivals",
                    href: "#",
                    tailwindStyles: "text-sm text-gray-400 hover:text-white transition-colors"
                  },
                  {
                    type: "Link",
                    content: "Best Sellers",
                    href: "#",
                    tailwindStyles: "text-sm text-gray-400 hover:text-white transition-colors"
                  },
                  {
                    type: "Link",
                    content: "Sale",
                    href: "#",
                    tailwindStyles: "text-sm text-gray-400 hover:text-white transition-colors"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Help Column",
                content: "",
                tailwindStyles: "flex flex-col gap-3",
                elements: [
                  {
                    type: "Text",
                    content: "Help",
                    tailwindStyles: "text-sm font-semibold text-white mb-2"
                  },
                  {
                    type: "Link",
                    content: "FAQ",
                    href: "#",
                    tailwindStyles: "text-sm text-gray-400 hover:text-white transition-colors"
                  },
                  {
                    type: "Link",
                    content: "Shipping",
                    href: "#",
                    tailwindStyles: "text-sm text-gray-400 hover:text-white transition-colors"
                  },
                  {
                    type: "Link",
                    content: "Returns",
                    href: "#",
                    tailwindStyles: "text-sm text-gray-400 hover:text-white transition-colors"
                  }
                ]
              },
              {
                type: "Frame",
                name: "Contact Column",
                content: "",
                tailwindStyles: "flex flex-col gap-3",
                elements: [
                  {
                    type: "Text",
                    content: "Contact",
                    tailwindStyles: "text-sm font-semibold text-white mb-2"
                  },
                  {
                    type: "Text",
                    content: "support@shopify.com",
                    tailwindStyles: "text-sm text-gray-400"
                  },
                  {
                    type: "Text",
                    content: "1-800-SHOPIFY",
                    tailwindStyles: "text-sm text-gray-400"
                  }
                ]
              }
            ]
          },
          {
            type: "Frame",
            name: "Footer Bottom",
            content: "",
            tailwindStyles: "pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4",
            elements: [
              {
                type: "Text",
                content: "© 2024 Shopify. All rights reserved.",
                tailwindStyles: "text-sm text-gray-500"
              },
              {
                type: "Frame",
                name: "Payment Methods",
                content: "",
                tailwindStyles: "flex items-center gap-4",
                elements: [
                  {
                    type: "Text",
                    content: "💳 Visa",
                    tailwindStyles: "text-sm text-gray-500"
                  },
                  {
                    type: "Text",
                    content: "💳 Mastercard",
                    tailwindStyles: "text-sm text-gray-500"
                  },
                  {
                    type: "Text",
                    content: "💳 PayPal",
                    tailwindStyles: "text-sm text-gray-500"
                  }
                ]
              }
            ]
          }
        ],
        href: "",
        src: ""
      }
    ],
    href: "",
    src: ""
  }
};
const siteTemplates = [
  portfolioSiteTemplate,
  agencySiteTemplate,
  saasSiteTemplate,
  blogSiteTemplate,
  ecommerceSiteTemplate
];
const footerComponent = {
  component: {
    type: "Frame",
    name: "Footer",
    content: "",
    styles: {
      default: {
        position: "relative",
        width: "100%",
        marginTop: "auto",
        height: "auto",
        backgroundColor: "#f8f9fa",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        padding: "40px"
      }
    },
    tailwindStyles: "w-full mt-auto bg-[#f8f9fa] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 py-6 px-4 sm:py-8 sm:px-6 md:py-10 md:px-8",
    elements: [
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }
        },
        tailwindStyles: "flex flex-col items-start gap-4",
        elements: [
          {
            type: "Image",
            content: "Logo",
            href: "",
            src: "",
            styles: { default: { width: "80px", height: "80px" } },
            tailwindStyles: "w-20 h-20"
          },
          {
            type: "Text",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            href: "",
            src: "",
            styles: { default: { color: "#6c757d", fontSize: "14px" } },
            tailwindStyles: "text-gray-600 text-sm"
          }
        ]
      },
      {
        type: "Frame",
        content: "",
        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }
        },
        tailwindStyles: "flex flex-col items-start gap-2",
        elements: [
          {
            type: "Text",
            content: "Services",
            href: "",
            src: "",
            styles: { default: { color: "#ff6f61", fontWeight: "bold" } },
            tailwindStyles: "text-[#ff6f61] font-bold"
          },
          {
            type: "Link",
            content: "Email Marketing",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline"
          },
          {
            type: "Link",
            content: "Campaigns",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline"
          },
          {
            type: "Link",
            content: "Branding",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline"
          },
          {
            type: "Link",
            content: "Offline",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline"
          }
        ]
      },
      {
        type: "Frame",
        content: "",
        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }
        },
        tailwindStyles: "flex flex-col items-start gap-2",
        elements: [
          {
            type: "Text",
            content: "About",
            href: "",
            src: "",
            styles: { default: { color: "#ff6f61", fontWeight: "bold" } },
            tailwindStyles: "text-[#ff6f61] font-bold"
          },
          {
            type: "Link",
            content: "Our Story",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline"
          },
          {
            type: "Link",
            content: "Benefits",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline"
          },
          {
            type: "Link",
            content: "Team",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline"
          },
          {
            type: "Link",
            content: "Careers",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline"
          }
        ]
      },
      {
        type: "Frame",
        content: "",
        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }
        },
        tailwindStyles: "flex flex-col items-start gap-2",
        elements: [
          {
            type: "Text",
            content: "Follow Us",
            href: "",
            src: "",
            styles: { default: { color: "#ff6f61", fontWeight: "bold" } },
            tailwindStyles: "text-[#ff6f61] font-bold"
          },
          {
            type: "Link",
            content: "Facebook",
            href: "https://facebook.com",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline"
          },
          {
            type: "Link",
            content: "Twitter",
            href: "https://twitter.com",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline"
          },
          {
            type: "Link",
            content: "Instagram",
            href: "https://instagram.com",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline"
          }
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const footerComponent2 = {
  component: {
    type: "Frame",
    name: "Footer2",
    content: "",
    styles: {
      default: {
        position: "relative",
        width: "100%",
        marginTop: "auto",
        height: "auto",
        backgroundColor: "#f8f9fa",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        padding: "20px"
      }
    },
    tailwindStyles: "w-full mt-auto bg-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 py-5 px-4 sm:px-6",
    elements: [
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }
        },
        tailwindStyles: "flex flex-col items-start gap-2",
        elements: [
          {
            type: "Text",
            content: "COMPANY NAME",
            styles: {
              default: {
                color: "#000",
                fontWeight: "bold"
              }
            },
            tailwindStyles: "text-black font-bold"
          },
          {
            type: "Text",
            content: "Here you can use rows and columns to organize your footer content. Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
            href: "",
            src: "",
            styles: {
              default: {
                color: "#6c757d"
              }
            },
            tailwindStyles: "text-gray-600 text-sm"
          }
        ]
      },
      {
        type: "Frame",
        content: "",
        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }
        },
        tailwindStyles: "flex flex-col items-start gap-2",
        elements: [
          {
            type: "Text",
            content: "PRODUCTS",
            styles: {
              default: {
                color: "#000",
                fontWeight: "bold"
              }
            },
            tailwindStyles: "text-black font-bold"
          },
          {
            type: "Link",
            content: "MDBootstrap",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d"
              }
            },
            tailwindStyles: "text-gray-600 hover:underline"
          },
          {
            type: "Link",
            content: "MDWordPress",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d"
              }
            },
            tailwindStyles: "text-gray-600 hover:underline"
          },
          {
            type: "Link",
            content: "BrandFlow",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d"
              }
            },
            tailwindStyles: "text-gray-600 hover:underline"
          },
          {
            type: "Link",
            content: "Bootstrap Angular",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d"
              }
            },
            tailwindStyles: "text-gray-600 hover:underline"
          }
        ]
      },
      {
        type: "Frame",
        content: "",
        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }
        },
        tailwindStyles: "flex flex-col items-start gap-2",
        elements: [
          {
            type: "Text",
            content: "USEFUL LINKS",
            href: "",
            src: "",
            styles: {
              default: {
                color: "#000",
                fontWeight: "bold"
              }
            },
            tailwindStyles: "text-black font-bold"
          },
          {
            type: "Link",
            content: "Your Account",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d"
              }
            },
            tailwindStyles: "text-gray-600 hover:underline"
          },
          {
            type: "Link",
            content: "Become an Affiliate",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d"
              }
            },
            tailwindStyles: "text-gray-600 hover:underline"
          },
          {
            type: "Link",
            content: "Shipping Rates",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d"
              }
            },
            tailwindStyles: "text-gray-600 hover:underline"
          },
          {
            type: "Link",
            content: "Help",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d"
              }
            },
            tailwindStyles: "text-gray-600 hover:underline"
          }
        ]
      },
      {
        type: "Frame",
        content: "",
        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }
        },
        tailwindStyles: "flex flex-col items-start gap-2",
        elements: [
          {
            type: "Text",
            content: "USEFUL LINKS",
            styles: {
              default: {
                color: "#000",
                fontWeight: "bold"
              }
            },
            tailwindStyles: "text-black font-bold"
          },
          {
            type: "Frame",
            content: "",
            href: "",
            src: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px"
              }
            },
            tailwindStyles: "flex flex-row items-center gap-2",
            elements: [
              {
                type: "Image",
                content: "",
                href: "",
                src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                styles: {
                  default: {
                    width: "24px",
                    height: "24px",
                    objectFit: "contain"
                  }
                },
                tailwindStyles: "w-6 h-6 object-contain"
              },
              {
                type: "Text",
                content: "New York, NY 10012, US",
                href: "",
                src: "",
                styles: {
                  default: {
                    color: "#6c757d"
                  }
                },
                tailwindStyles: "text-gray-600"
              }
            ]
          },
          {
            type: "Frame",
            content: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px"
              }
            },
            tailwindStyles: "flex flex-row items-center gap-2",
            elements: [
              {
                type: "Image",
                content: "",
                href: "",
                src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                styles: {
                  default: {
                    width: "24px",
                    height: "24px",
                    objectFit: "contain"
                  }
                },
                tailwindStyles: "w-6 h-6 object-contain"
              },
              {
                type: "Text",
                content: "New York, NY 10012, US",
                href: "",
                src: "",
                styles: {
                  default: {
                    color: "#6c757d"
                  }
                },
                tailwindStyles: "text-gray-600"
              }
            ]
          },
          {
            type: "Frame",
            content: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px"
              }
            },
            tailwindStyles: "flex flex-row items-center gap-2",
            elements: [
              {
                type: "Image",
                content: "",
                href: "",
                src: "https://cdn-icons-png.flaticon.com/512/732/732200.png",
                styles: {
                  default: {
                    width: "24px",
                    height: "24px",
                    objectFit: "contain"
                  }
                },
                tailwindStyles: "w-6 h-6 object-contain"
              },
              {
                type: "Text",
                content: "info@example.com",
                href: "",
                src: "",
                styles: {
                  default: {
                    color: "#6c757d"
                  }
                },
                tailwindStyles: "text-gray-600"
              }
            ]
          },
          {
            type: "Frame",
            content: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px"
              }
            },
            tailwindStyles: "flex flex-row items-center gap-2",
            elements: [
              {
                type: "Image",
                content: "",
                href: "",
                src: "https://cdn-icons-png.flaticon.com/512/724/724664.png",
                styles: {
                  default: {
                    width: "24px",
                    height: "24px",
                    objectFit: "contain"
                  }
                },
                tailwindStyles: "w-6 h-6 object-contain"
              },
              {
                type: "Text",
                content: "+ 01 234 567 89",
                href: "",
                src: "",
                styles: {
                  default: {
                    color: "#6c757d"
                  }
                },
                tailwindStyles: "text-gray-600"
              }
            ]
          }
        ]
      }
    ]
  }
};
const footerComponent3 = {
  component: {
    type: "Frame",
    name: "Footer3",
    content: "",
    styles: {
      default: {
        position: "relative",
        width: "100%",
        marginTop: "auto",
        height: "auto",
        backgroundColor: "#1a202c",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 0"
      }
    },
    tailwindStyles: "w-full mt-auto bg-[#1a202c] flex flex-col items-center justify-center py-5 gap-5",
    elements: [
      {
        type: "Frame",
        content: "",
        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            width: "100%",
            maxWidth: "1200px"
          }
        },
        tailwindStyles: "flex flex-row justify-around w-full max-w-[1200px] gap-10",
        elements: [
          {
            type: "Frame",
            content: "",
            href: "",
            src: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start"
              }
            },
            tailwindStyles: "flex flex-col items-start gap-2",
            elements: [
              {
                type: "Text",
                content: "RESOURCES",
                href: "",
                src: "",
                styles: {
                  default: {
                    color: "#ffffff",
                    fontWeight: "bold"
                  }
                },
                tailwindStyles: "text-white font-bold"
              },
              {
                type: "Link",
                content: "Flowbite",
                href: "/",
                src: "",
                styles: {
                  default: {
                    color: "#a0aec0"
                  }
                },
                tailwindStyles: "text-gray-400 hover:text-white"
              },
              {
                type: "Link",
                content: "Tailwind CSS",
                href: "/",
                src: "",
                styles: {
                  default: {
                    color: "#a0aec0"
                  }
                },
                tailwindStyles: "text-gray-400 hover:text-white"
              }
            ]
          },
          {
            type: "Frame",
            content: "",
            href: "",
            src: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start"
              }
            },
            tailwindStyles: "flex flex-col items-start gap-2",
            elements: [
              {
                type: "Text",
                content: "FOLLOW US",
                href: "",
                src: "",
                styles: {
                  default: {
                    color: "#ffffff",
                    fontWeight: "bold"
                  }
                },
                tailwindStyles: "text-white font-bold"
              },
              {
                type: "Link",
                content: "Github",
                href: "https://github.com",
                src: "",
                styles: {
                  default: {
                    color: "#a0aec0"
                  }
                },
                tailwindStyles: "text-gray-400 hover:text-white"
              },
              {
                type: "Link",
                content: "Discord",
                href: "https://discord.com",
                src: "",
                styles: {
                  default: {
                    color: "#a0aec0"
                  }
                },
                tailwindStyles: "text-gray-400 hover:text-white"
              }
            ]
          },
          {
            type: "Frame",
            content: "",
            href: "",
            src: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start"
              }
            },
            tailwindStyles: "flex flex-col items-start gap-2",
            elements: [
              {
                type: "Text",
                content: "LEGAL",
                href: "",
                src: "",
                styles: {
                  default: {
                    color: "#ffffff",
                    fontWeight: "bold"
                  }
                },
                tailwindStyles: "text-white font-bold"
              },
              {
                type: "Link",
                content: "Privacy Policy",
                href: "/privacy-policy",
                src: "",
                styles: {
                  default: {
                    color: "#a0aec0"
                  }
                },
                tailwindStyles: "text-gray-400 hover:text-white"
              },
              {
                type: "Link",
                content: "Terms & Conditions",
                href: "/terms",
                src: "",
                styles: {
                  default: {
                    color: "#a0aec0"
                  }
                },
                tailwindStyles: "text-gray-400 hover:text-white"
              }
            ]
          }
        ]
      },
      {
        type: "Text",
        content: "© 2023 Flowbite™. All Rights Reserved.",
        href: "",
        src: "",
        styles: {
          default: {
            color: "#ffffff",
            fontSize: "14px",
            textAlign: "center"
          }
        },
        tailwindStyles: "text-white text-sm text-center mt-5"
      },
      {
        type: "Frame",
        content: "",
        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: "15px"
          }
        },
        tailwindStyles: "flex flex-row justify-center gap-4 mt-3",
        elements: [
          {
            type: "Image",
            content: "",
            href: "https://facebook.com",
            src: "https://cdn-icons-png.flaticon.com/512/733/733547.png",
            styles: {
              default: {
                width: "24px",
                height: "24px"
              }
            },
            tailwindStyles: "w-6 h-6"
          },
          {
            type: "Image",
            content: "",
            href: "https://discord.com",
            src: "https://cdn-icons-png.flaticon.com/512/2111/2111370.png",
            styles: {
              default: {
                width: "24px",
                height: "24px"
              }
            },
            tailwindStyles: "w-6 h-6"
          },
          {
            type: "Image",
            content: "",
            href: "https://twitter.com",
            src: "https://cdn-icons-png.flaticon.com/512/733/733579.png",
            styles: {
              default: {
                width: "24px",
                height: "24px"
              }
            },
            tailwindStyles: "w-6 h-6"
          },
          {
            type: "Image",
            content: "",
            href: "https://github.com",
            src: "https://cdn-icons-png.flaticon.com/512/733/733553.png",
            styles: {
              default: {
                width: "24px",
                height: "24px"
              }
            },
            tailwindStyles: "w-6 h-6"
          }
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const footerComponent4 = {
  component: {
    type: "Frame",
    name: "Footer4",
    content: "",
    styles: {
      default: {
        position: "relative",
        width: "100%",
        marginTop: "auto",
        height: "auto",
        backgroundColor: "#fbeee6",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        padding: "20px"
      }
    },
    tailwindStyles: "w-full mt-auto bg-[#fbeee6] grid grid-cols-1 md:grid-cols-4 gap-5 py-5 px-4",
    elements: [
      {
        type: "Frame",
        content: "",
        href: "/",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }
        },
        tailwindStyles: "flex flex-col items-start text-left gap-2",
        elements: [
          {
            type: "Text",
            content: "shopping online",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#8b4513",
                fontWeight: "bold",
                marginBottom: "10px"
              }
            },
            tailwindStyles: "text-[#8b4513] font-bold mb-2"
          },
          {
            type: "Link",
            content: "frequently asked questions",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333"
              }
            },
            tailwindStyles: "text-[#333] hover:underline"
          },
          {
            type: "Link",
            content: "delivery",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333"
              }
            },
            tailwindStyles: "text-[#333] hover:underline"
          },
          {
            type: "Link",
            content: "pricing",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333"
              }
            },
            tailwindStyles: "text-[#333] hover:underline"
          },
          {
            type: "Link",
            content: "where we deliver?",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333"
              }
            },
            tailwindStyles: "text-[#333] hover:underline"
          }
        ]
      },
      {
        type: "Frame",
        content: "",
        href: "/",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }
        },
        tailwindStyles: "flex flex-col items-start text-left gap-2",
        elements: [
          {
            type: "Text",
            content: "gift cards",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#8b4513",
                fontWeight: "bold",
                marginBottom: "10px"
              }
            },
            tailwindStyles: "text-[#8b4513] font-bold mb-2"
          },
          {
            type: "Link",
            content: "frequently asked questions",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333"
              }
            },
            tailwindStyles: "text-[#333] hover:underline"
          },
          {
            type: "Link",
            content: "delivery and payment",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333"
              }
            },
            tailwindStyles: "text-[#333] hover:underline"
          },
          {
            type: "Link",
            content: "activate the card",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333"
              }
            },
            tailwindStyles: "text-[#333] hover:underline"
          },
          {
            type: "Link",
            content: "rules",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333"
              }
            },
            tailwindStyles: "text-[#333] hover:underline"
          }
        ]
      },
      {
        type: "Frame",
        content: "",
        href: "/",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }
        },
        tailwindStyles: "flex flex-col items-start text-left gap-2",
        elements: [
          {
            type: "Text",
            content: "company",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#8b4513",
                fontWeight: "bold",
                marginBottom: "10px"
              }
            },
            tailwindStyles: "text-[#8b4513] font-bold mb-2"
          },
          {
            type: "Link",
            content: "buy a gift card",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
                marginBottom: "5px"
              }
            },
            tailwindStyles: "text-[#333] mb-1 hover:underline"
          },
          {
            type: "Link",
            content: "history",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
                marginBottom: "5px"
              }
            },
            tailwindStyles: "text-[#333] mb-1 hover:underline"
          },
          {
            type: "Link",
            content: "return",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
                marginBottom: "5px"
              }
            },
            tailwindStyles: "text-[#333] mb-1 hover:underline"
          },
          {
            type: "Link",
            content: "contact",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333"
              }
            },
            tailwindStyles: "text-[#333] hover:underline"
          }
        ]
      },
      {
        type: "Frame",
        content: "",
        href: "/",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }
        },
        tailwindStyles: "flex flex-col items-start text-left gap-2",
        elements: [
          {
            type: "Text",
            content: "diamond club",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#8b4513",
                fontWeight: "bold",
                marginBottom: "10px"
              }
            },
            tailwindStyles: "text-[#8b4513] font-bold mb-2"
          },
          {
            type: "Link",
            content: "registration",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
                marginBottom: "5px"
              }
            },
            tailwindStyles: "text-[#333] mb-1 hover:underline"
          },
          {
            type: "Link",
            content: "application",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
                marginBottom: "5px"
              }
            },
            tailwindStyles: "text-[#333] mb-1 hover:underline"
          },
          {
            type: "Link",
            content: "about program",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
                marginBottom: "5px"
              }
            },
            tailwindStyles: "text-[#333] mb-1 hover:underline"
          },
          {
            type: "Link",
            content: "rules",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333"
              }
            },
            tailwindStyles: "text-[#333] hover:underline"
          }
        ]
      }
    ]
  }
};
const headerComponent = {
  component: {
    type: "Frame",
    name: "Header",
    content: "",
    styles: {
      default: {
        height: "70px",
        width: "100%",
        backgroundColor: "#e3f2fd",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }
    },
    tailwindStyles: "flex flex-col md:flex-row items-center justify-between w-full h-[70px] p-4 bg-blue-100 shadow-md gap-2 md:gap-0",
    elements: [
      {
        type: "Text",
        content: "My Portfolio",
        styles: {
          default: {
            color: "#0d47a1",
            fontSize: "28px",
            fontWeight: "bold"
          }
        },
        tailwindStyles: "text-blue-900 text-3xl font-bold text-center md:text-left",
        href: "",
        src: ""
      },
      {
        type: "Text",
        content: "Home",
        styles: {
          default: {
            color: "#0d47a1",
            margin: "0 10px",
            fontSize: "18px"
          }
        },
        tailwindStyles: "m-2 text-blue-900 text-lg text-center md:text-left hover:text-blue-700 hover:underline transition-all",
        href: "/",
        src: ""
      },
      {
        type: "Text",
        content: "Projects",
        styles: {
          default: {
            color: "#0d47a1",
            margin: "0 10px",
            fontSize: "18px"
          }
        },
        tailwindStyles: "m-2 text-blue-900 text-lg text-center md:text-left hover:text-blue-700 hover:underline transition-all",
        href: "/projects",
        src: ""
      },
      {
        type: "Text",
        content: "Contact",
        styles: {
          default: {
            color: "#0d47a1",
            margin: "0 10px",
            fontSize: "18px"
          }
        },
        tailwindStyles: "m-2 text-blue-900 text-lg text-center md:text-left hover:text-blue-700 hover:underline transition-all",
        href: "/contact",
        src: ""
      }
    ],
    href: "",
    src: ""
  }
};
const headerComponent2 = {
  component: {
    type: "Frame",
    name: "Header2",
    content: "",
    styles: {
      default: {
        height: "70px",
        width: "100%",
        backgroundColor: "#343a40",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }
    },
    tailwindStyles: "flex flex-col md:flex-row items-center justify-center w-full p-4 bg-gray-900 shadow-md gap-2 md:gap-0",
    elements: [
      {
        type: "Text",
        content: "Brothers Inc",
        styles: {
          default: {
            color: "white",
            fontSize: "28px",
            fontWeight: "bold"
          }
        },
        tailwindStyles: "text-white text-3xl font-bold text-center md:text-left",
        href: "",
        src: ""
      },
      {
        type: "Text",
        content: "Home",
        styles: {
          default: {
            color: "white",
            margin: "0 10px",
            fontSize: "18px"
          }
        },
        tailwindStyles: "m-2 text-white text-lg text-center md:text-left hover:text-gray-300 transition-colors",
        href: "/",
        src: ""
      },
      {
        type: "Text",
        content: "Portfolio",
        styles: {
          default: {
            color: "white",
            margin: "0 10px",
            fontSize: "18px"
          }
        },
        tailwindStyles: "m-2 text-white text-lg text-center md:text-left hover:text-gray-300 transition-colors",
        href: "/",
        src: ""
      }
    ],
    href: "",
    src: ""
  }
};
const headerComponent3 = {
  component: {
    type: "Frame",
    name: "Header3",
    content: "",
    styles: {
      default: {
        height: "80px",
        width: "100%",
        backgroundColor: "#4caf50",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "0 20px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }
    },
    tailwindStyles: "flex flex-col md:flex-row items-center justify-start w-full p-4 bg-green-500 shadow-md gap-2 md:gap-0",
    elements: [
      {
        type: "Text",
        content: "Welcome to My Site",
        styles: {
          default: {
            color: "#1b5e20",
            fontSize: "28px",
            fontWeight: "bold"
          }
        },
        tailwindStyles: "text-green-900 text-3xl font-bold text-center md:text-left",
        href: "",
        src: ""
      },
      {
        type: "Text",
        content: "Home",
        styles: {
          default: {
            color: "#1b5e20",
            margin: "0 10px",
            fontSize: "18px"
          }
        },
        tailwindStyles: "m-2 text-green-900 text-lg text-center md:text-left hover:text-green-700 transition-colors",
        href: "/",
        src: ""
      },
      {
        type: "Text",
        content: "Pricing",
        styles: {
          default: {
            color: "#1b5e20",
            margin: "0 10px",
            fontSize: "18px"
          }
        },
        tailwindStyles: "m-2 text-green-900 text-lg text-center md:text-left hover:text-green-700 transition-colors",
        href: "/articles",
        src: ""
      }
    ],
    href: "",
    src: ""
  }
};
const sidebarLeftComponent = {
  component: {
    type: "Frame",
    name: "SidebarLeft",
    content: "",
    styles: {
      default: {
        height: "100%",
        width: "260px",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 16px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
        transition: "all 0.3s ease"
      }
    },
    tailwindStyles: "flex flex-col justify-between h-full bg-white shadow-xs border-r border-gray-100 w-full md:w-64 sm:w-20 p-4 sm:p-2 md:p-6 transition-all duration-300",
    elements: [
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "24px"
          }
        },
        tailwindStyles: "flex flex-col w-full gap-6",
        elements: [
          {
            type: "Frame",
            content: "",
            styles: {
              default: {
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
                paddingBottom: "16px",
                borderBottom: "1px solid #f1f1f1"
              }
            },
            tailwindStyles: "flex items-center mb-4 pb-4 border-b border-gray-100",
            elements: [
              {
                type: "Text",
                content: "DASHBOARD",
                styles: {
                  default: {
                    color: "#111827",
                    fontSize: "18px",
                    fontWeight: "600",
                    letterSpacing: "0.5px"
                  }
                },
                tailwindStyles: "text-gray-900 text-lg font-semibold tracking-wide sm:hidden"
              }
            ]
          },
          {
            type: "Frame",
            content: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: "4px"
              }
            },
            tailwindStyles: "flex flex-col w-full gap-1",
            elements: [
              {
                type: "Text",
                content: "MENU",
                styles: {
                  default: {
                    color: "#6B7280",
                    fontSize: "12px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase"
                  }
                },
                tailwindStyles: "text-gray-500 text-xs  mb-2 tracking-wide uppercase sm:hidden"
              },
              {
                type: "Link",
                content: "Home",
                styles: {
                  default: {
                    color: "#4F46E5",
                    margin: "2px 0",
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    backgroundColor: "#EEF2FF",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }
                },
                tailwindStyles: "w-full text-indigo-600 bg-indigo-50 my-0.5 py-2.5 px-3 rounded-md  flex items-center gap-3 hover:bg-indigo-100",
                href: "/",
                src: ""
              },
              {
                type: "Link",
                content: "Analytics",
                styles: {
                  default: {
                    color: "#4B5563",
                    margin: "2px 0",
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }
                },
                tailwindStyles: "w-full text-gray-600 my-0.5 py-2.5 px-3 rounded-md  flex items-center gap-3 hover:bg-gray-50",
                href: "/analytics",
                src: ""
              },
              {
                type: "Link",
                content: "Reports",
                styles: {
                  default: {
                    color: "#4B5563",
                    margin: "2px 0",
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }
                },
                tailwindStyles: "w-full text-gray-600 my-0.5 py-2.5 px-3 rounded-md  flex items-center gap-3 hover:bg-gray-50",
                href: "/reports",
                src: ""
              },
              {
                type: "Link",
                content: "Settings",
                styles: {
                  default: {
                    color: "#4B5563",
                    margin: "2px 0",
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }
                },
                tailwindStyles: "w-full text-gray-600 my-0.5 py-2.5 px-3 rounded-md  flex items-center gap-3 hover:bg-gray-50",
                href: "/settings",
                src: ""
              }
            ]
          },
          {
            type: "Frame",
            content: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: "4px",
                marginTop: "24px"
              }
            },
            tailwindStyles: "flex flex-col w-full gap-1 mt-6",
            elements: [
              {
                type: "Text",
                content: "WORKSPACE",
                styles: {
                  default: {
                    color: "#6B7280",
                    fontSize: "12px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase"
                  }
                },
                tailwindStyles: "text-gray-500 text-xs  mb-2 tracking-wide uppercase sm:hidden"
              },
              {
                type: "Link",
                content: "Projects",
                styles: {
                  default: {
                    color: "#4B5563",
                    margin: "2px 0",
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }
                },
                tailwindStyles: "w-full text-gray-600 my-0.5 py-2.5 px-3 rounded-md  flex items-center gap-3 hover:bg-gray-50",
                href: "/projects",
                src: ""
              },
              {
                type: "Link",
                content: "Team",
                styles: {
                  default: {
                    color: "#4B5563",
                    margin: "2px 0",
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }
                },
                tailwindStyles: "w-full text-gray-600 my-0.5 py-2.5 px-3 rounded-md  flex items-center gap-3 hover:bg-gray-50",
                href: "/team",
                src: ""
              },
              {
                type: "Button",
                name: "Dropdown Menu",
                content: "More Options",
                href: "",
                src: "",
                tailwindStyles: "w-full text-gray-600 my-0.5 py-2.5 px-3 rounded-md flex items-center justify-between gap-3 hover:bg-gray-50",
                styles: {
                  default: {
                    color: "#4B5563",
                    margin: "2px 0",
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    border: "none",
                    backgroundColor: "transparent"
                  }
                }
              }
            ]
          }
        ]
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            alignItems: "center",
            padding: "12px",
            marginTop: "auto",
            borderRadius: "8px"
          }
        },
        tailwindStyles: "flex items-center p-3 mt-auto rounded-lg gap-3",
        elements: [
          {
            type: "Text",
            content: "John Doe",
            styles: {
              default: {
                color: "white",
                fontSize: "14px",
                fontWeight: "500"
              }
            },
            tailwindStyles: "text-white text-sm  sm:hidden"
          }
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const sidebarLeftComponent2 = {
  component: {
    type: "Frame",
    name: "SidebarLeft2",
    content: "",
    styles: {
      default: {
        height: "100%",
        width: "280px",
        backgroundColor: "#222831",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "25px 15px",
        gap: "16px"
      }
    },
    tailwindStyles: "flex flex-col items-start h-full bg-gray-900 w-full md:w-64 sm:w-20 p-4 sm:p-2 md:p-6 gap-4 sm:gap-6 transition-all duration-300",
    elements: [
      {
        type: "Text",
        content: "ADMIN PANEL",
        href: "",
        src: "",
        styles: {
          default: {
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "30px",
            letterSpacing: "1px"
          }
        },
        tailwindStyles: "text-white text-lg font-bold mb-8 tracking-wide text-center md:text-left sm:mb-4 sm:text-base"
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "12px"
          }
        },
        tailwindStyles: "flex flex-col w-full gap-3",
        elements: [
          {
            type: "Link",
            content: "Dashboard",
            styles: {
              default: {
                color: "white",
                margin: "12px 0",
                fontSize: "16px",
                width: "100%",
                padding: "10px 15px",
                borderRadius: "5px",
                backgroundColor: "#393e46"
              }
            },
            tailwindStyles: "w-full text-white my-2 py-2 px-4 bg-gray-800 rounded flex items-center justify-start md:text-left sm:text-sm sm:px-2 sm:py-1",
            href: "/",
            src: ""
          },
          {
            type: "Link",
            content: "Users",
            styles: {
              default: {
                color: "#d1d1d1",
                margin: "12px 0",
                fontSize: "16px",
                width: "100%",
                padding: "10px 15px",
                borderRadius: "5px"
              }
            },
            tailwindStyles: "w-full text-gray-300 my-2 py-2 px-4 hover:bg-gray-800 rounded flex items-center justify-start md:text-left sm:text-sm sm:px-2 sm:py-1",
            href: "/",
            src: ""
          },
          {
            type: "Link",
            content: "Settings",
            styles: {
              default: {
                color: "#d1d1d1",
                margin: "12px 0",
                fontSize: "16px",
                width: "100%",
                padding: "10px 15px",
                borderRadius: "5px"
              }
            },
            tailwindStyles: "w-full text-gray-300 my-2 py-2 px-4 hover:bg-gray-800 rounded flex items-center justify-start md:text-left sm:text-sm sm:px-2 sm:py-1",
            href: "/",
            src: ""
          },
          {
            type: "Button",
            name: "Dropdown Menu",
            content: "Advanced Options",
            href: "",
            src: "",
            tailwindStyles: "w-full text-gray-300 my-2 py-2 px-4 hover:bg-gray-800 rounded flex items-center justify-between md:text-left sm:text-sm sm:px-2 sm:py-1",
            styles: {
              default: {
                color: "#d1d1d1",
                margin: "12px 0",
                fontSize: "16px",
                width: "100%",
                padding: "10px 15px",
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "background-color 0.2s",
                border: "none",
                backgroundColor: "transparent"
              }
            }
          }
        ]
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            marginTop: "auto",
            width: "100%",
            padding: "12px 0"
          }
        },
        tailwindStyles: "w-full mt-auto pt-4 text-white gap-4 sm:gap-2",
        elements: []
      }
    ],
    href: "",
    src: ""
  }
};
const sidebarLeftComponent3 = {
  component: {
    type: "Frame",
    name: "SidebarLeft3",
    content: "",
    styles: {
      default: {
        height: "100%",
        width: "280px",
        backgroundColor: "#f8f9fa",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "20px 12px",
        borderRight: "1px solid #e0e0e0"
      }
    },
    tailwindStyles: "flex flex-col items-start h-full bg-gray-100 border-r border-gray-200 w-full md:w-64 sm:w-20 p-4 sm:p-2 md:p-5 transition-all duration-300",
    elements: [
      {
        type: "Text",
        content: "Menu",
        href: "",
        src: "",
        styles: {
          default: {
            color: "#6c757d",
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "15px",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }
        },
        tailwindStyles: "text-gray-500 text-sm  mb-4 uppercase tracking-wide text-center md:text-left"
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "12px"
          }
        },
        tailwindStyles: "flex flex-col w-full gap-3",
        elements: [
          {
            type: "Link",
            content: "Home",
            styles: {
              default: {
                color: "#495057",
                margin: "8px 0",
                fontSize: "16px",
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                transition: "all 0.2s ease"
              }
            },
            tailwindStyles: "w-full text-gray-700 my-2 py-2 px-3 rounded hover:bg-blue-50 hover:text-blue-600 text-center md:text-left sm:text-sm sm:px-2",
            href: "/",
            src: ""
          },
          {
            type: "Link",
            content: "Products",
            styles: {
              default: {
                color: "#495057",
                margin: "8px 0",
                fontSize: "16px",
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                transition: "all 0.2s ease"
              }
            },
            tailwindStyles: "w-full text-gray-700 my-2 py-2 px-3 rounded hover:bg-blue-50 hover:text-blue-600 text-center md:text-left sm:text-sm sm:px-2",
            href: "/",
            src: ""
          },
          {
            type: "Link",
            content: "Orders",
            styles: {
              default: {
                color: "#495057",
                margin: "8px 0",
                fontSize: "16px",
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                transition: "all 0.2s ease"
              }
            },
            tailwindStyles: "w-full text-gray-700 my-2 py-2 px-3 rounded hover:bg-blue-50 hover:text-blue-600 text-center md:text-left sm:text-sm sm:px-2",
            href: "/",
            src: ""
          },
          {
            type: "Button",
            name: "Dropdown Menu",
            content: "More Options",
            href: "",
            src: "",
            tailwindStyles: "w-full text-gray-700 my-2 py-2 px-3 rounded hover:bg-blue-50 hover:text-blue-600 text-center md:text-left sm:text-sm sm:px-2 flex items-center justify-between",
            styles: {
              default: {
                color: "#495057",
                margin: "8px 0",
                fontSize: "16px",
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                border: "none",
                backgroundColor: "transparent"
              }
            }
          }
        ]
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            marginTop: "auto",
            width: "100%",
            padding: "12px 0"
          }
        },
        tailwindStyles: "w-full mt-auto pt-4 gap-4 sm:gap-2",
        elements: []
      }
    ],
    href: "",
    src: ""
  }
};
const sidebarLeftComponent4 = {
  component: {
    type: "Frame",
    name: "SidebarLeft4",
    content: "",
    styles: {
      default: {
        height: "100%",
        width: "300px",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "30px 20px",
        borderRight: "1px solid #eaeaea"
      }
    },
    tailwindStyles: "hidden sm:flex flex-col items-center h-full bg-white border-r border-gray-100 w-full md:w-64 sm:w-20 p-4 sm:p-3 md:p-8 transition-all duration-300",
    elements: [
      {
        type: "Text",
        content: "BRAND",
        href: "",
        src: "",
        styles: {
          default: {
            color: "#333",
            fontSize: "22px",
            fontWeight: "bold",
            marginBottom: "40px",
            letterSpacing: "2px"
          }
        },
        tailwindStyles: "text-gray-800 text-xl font-bold mb-10 tracking-wider text-center md:text-left"
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "12px"
          }
        },
        tailwindStyles: "flex flex-col w-full gap-3",
        elements: [
          {
            type: "Link",
            content: "Dashboard",
            styles: {
              default: {
                color: "#555",
                margin: "10px 0",
                fontSize: "16px",
                width: "100%",
                padding: "12px 15px",
                textAlign: "center",
                borderRadius: "8px"
              }
            },
            tailwindStyles: "w-full text-gray-600 my-2 py-3 px-4 rounded-lg hover:bg-gray-50 text-center md:text-center sm:text-sm sm:py-2 sm:px-2",
            href: "/",
            src: ""
          },
          {
            type: "Link",
            content: "Profile",
            styles: {
              default: {
                color: "#555",
                margin: "10px 0",
                fontSize: "16px",
                width: "100%",
                padding: "12px 15px",
                textAlign: "center",
                borderRadius: "8px"
              }
            },
            tailwindStyles: "w-full text-gray-600 my-2 py-3 px-4 text-center rounded-lg hover:bg-gray-50 text-sm md:text-base sm:px-2",
            href: "/",
            src: ""
          },
          {
            type: "Link",
            content: "Settings",
            styles: {
              default: {
                color: "#555",
                margin: "10px 0",
                fontSize: "16px",
                width: "100%",
                padding: "12px 15px",
                textAlign: "center",
                borderRadius: "8px"
              }
            },
            tailwindStyles: "w-full text-gray-600 my-2 py-3 px-4 text-center rounded-lg hover:bg-gray-50 text-sm md:text-base sm:px-2",
            href: "/",
            src: ""
          }
        ]
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            marginTop: "auto",
            width: "100%",
            padding: "12px 0"
          }
        },
        tailwindStyles: "w-full mt-auto pt-4 gap-4 sm:gap-2",
        elements: []
      }
    ],
    href: "",
    src: ""
  }
};
const sidebarRightComponent = {
  component: {
    type: "Frame",
    name: "SidebarRight",
    content: "",
    styles: {
      default: {
        height: "100%",
        width: "300px",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "20px 15px",
        boxShadow: "-2px 0 5px rgba(0,0,0,0.1)",
        position: "fixed",
        right: "0",
        top: "0"
      }
    },
    tailwindStyles: "flex flex-col items-start w-72 h-full p-5 bg-white shadow-md fixed right-0 top-0 md:w-56 sm:w-40 transition-all hidden sm:block",
    elements: [
      {
        type: "Text",
        content: "Notifications",
        styles: {
          default: {
            color: "#333",
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "20px"
          }
        },
        tailwindStyles: "text-gray-800 text-xl font-bold mb-5 text-center md:text-lg sm:text-sm"
      },
      {
        type: "Frame",
        name: "NotificationItem",
        content: "",
        styles: {
          default: {
            width: "100%",
            padding: "12px",
            borderBottom: "1px solid #eee",
            display: "flex",
            flexDirection: "column"
          }
        },
        tailwindStyles: "w-full p-3 border-b border-gray-100 flex flex-col text-sm md:text-xs sm:text-[10px]",
        elements: [
          {
            type: "Text",
            content: "New message received",
            styles: {
              default: {
                color: "#333",
                fontSize: "16px",
                fontWeight: "500"
              }
            },
            tailwindStyles: "text-gray-800 text-md font-medium"
          }
        ]
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            alignItems: "center",
            padding: "12px",
            marginTop: "auto",
            borderRadius: "8px",
            backgroundColor: "#F9FAFB",
            gap: "12px"
          }
        },
        tailwindStyles: "flex items-center p-3 mt-auto rounded-lg bg-gray-50 gap-3 hover:bg-gray-100 w-full",
        elements: [
          {
            type: "Text",
            content: "John Doe",
            styles: {
              default: {
                color: "#111827",
                fontSize: "14px",
                fontWeight: "500"
              }
            },
            tailwindStyles: "text-gray-900 text-sm font-medium sm:hidden"
          }
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const sidebarRightComponent2 = {
  component: {
    type: "Frame",
    name: "SidebarRight2",
    content: "",
    styles: {
      default: {
        height: "100%",
        width: "320px",
        backgroundColor: "#222831",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "25px 15px",
        position: "fixed",
        right: "0",
        top: "0"
      }
    },
    tailwindStyles: "flex flex-col items-start w-80 h-full p-6 bg-gray-900 fixed right-0 top-0 md:w-60 sm:w-40 transition-all hidden sm:block",
    elements: [
      {
        type: "Text",
        content: "ACTIVITY FEED",
        styles: {
          default: {
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "30px",
            letterSpacing: "1px"
          }
        },
        tailwindStyles: "text-white text-lg font-bold mb-8 tracking-wide text-center md:text-base sm:text-sm"
      },
      {
        type: "Frame",
        name: "ActivityItem",
        content: "",
        styles: {
          default: {
            width: "100%",
            padding: "15px",
            backgroundColor: "#393e46",
            borderRadius: "8px",
            marginBottom: "15px",
            display: "flex",
            flexDirection: "column"
          }
        },
        tailwindStyles: "w-full p-4 bg-gray-800 rounded-lg mb-4 flex flex-col text-sm md:text-xs sm:text-[10px]",
        elements: [
          {
            type: "Text",
            content: "",
            styles: {
              default: {
                color: "white",
                fontSize: "16px",
                fontWeight: "500"
              }
            },
            tailwindStyles: "text-white text-md font-medium"
          },
          {
            type: "Text",
            content: "5 minutes ago",
            styles: {
              default: {
                color: "#aaa",
                fontSize: "14px",
                marginTop: "5px"
              }
            },
            tailwindStyles: "text-gray-400 text-sm mt-1"
          }
        ],
        href: "",
        src: ""
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            alignItems: "center",
            padding: "12px",
            marginTop: "auto",
            borderRadius: "8px",
            backgroundColor: "#393e46",
            gap: "12px"
          }
        },
        tailwindStyles: "flex items-center p-3 mt-auto rounded-lg bg-gray-800 gap-3 hover:bg-gray-700 w-full",
        elements: [
          {
            type: "Text",
            content: "John Doe",
            styles: {
              default: {
                color: "white",
                fontSize: "14px",
                fontWeight: "500"
              }
            },
            tailwindStyles: "text-white text-sm font-medium sm:hidden"
          }
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const sidebarRightComponent3 = {
  component: {
    type: "Frame",
    name: "SidebarRight3",
    content: "",
    styles: {
      default: {
        height: "100%",
        width: "280px",
        backgroundColor: "#f8f9fa",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "20px 15px",
        borderLeft: "1px solid #e0e0e0",
        position: "fixed",
        right: "0",
        top: "0"
      }
    },
    tailwindStyles: "flex flex-col items-start w-72 h-full p-5 bg-gray-100 border-l border-gray-200 fixed right-0 top-0 md:w-56 sm:w-40 transition-all hidden sm:block",
    elements: [
      {
        type: "Text",
        content: "Recent Updates",
        styles: {
          default: {
            color: "#343a40",
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "20px"
          }
        },
        tailwindStyles: "text-gray-800 text-lg font-semibold mb-5 text-center md:text-base sm:text-sm"
      },
      {
        type: "Frame",
        name: "UpdateItem",
        content: "",
        styles: {
          default: {
            width: "100%",
            padding: "12px",
            backgroundColor: "white",
            borderRadius: "6px",
            marginBottom: "12px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
          }
        },
        tailwindStyles: "w-full p-3 bg-white rounded-md mb-3 flex flex-col shadow-xs text-sm md:text-xs sm:text-[10px]",
        elements: [
          {
            type: "Text",
            content: "Product Update v2.1",
            styles: {
              default: {
                color: "#333",
                fontSize: "16px",
                fontWeight: "500"
              }
            },
            tailwindStyles: "text-gray-800 text-md font-medium"
          },
          {
            type: "Text",
            content: "",
            styles: {
              default: {
                color: "#6c757d",
                fontSize: "14px",
                marginTop: "5px"
              }
            },
            tailwindStyles: "text-gray-600 text-sm mt-1"
          }
        ],
        href: "",
        src: ""
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            alignItems: "center",
            padding: "12px",
            marginTop: "auto",
            borderRadius: "8px",
            backgroundColor: "#e9ecef",
            gap: "12px"
          }
        },
        tailwindStyles: "flex items-center p-3 mt-auto rounded-lg bg-gray-200 gap-3 hover:bg-gray-300 w-full",
        elements: [
          {
            type: "Text",
            content: "Jane Doe",
            styles: {
              default: {
                color: "#495057",
                fontSize: "14px",
                fontWeight: "500"
              }
            },
            tailwindStyles: "text-gray-700 text-sm font-medium sm:hidden"
          }
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const sidebarRightComponent4 = {
  component: {
    type: "Frame",
    name: "SidebarRight4",
    content: "",
    styles: {
      default: {
        height: "100%",
        width: "330px",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "25px 20px",
        boxShadow: "-2px 0 10px rgba(0,0,0,0.05)",
        position: "fixed",
        right: "0",
        top: "0"
      }
    },
    tailwindStyles: "flex flex-col items-start w-80 h-full p-6 bg-white shadow-md fixed right-0 top-0 md:w-64 sm:w-48 transition-all hidden sm:block",
    elements: [
      {
        type: "Text",
        content: "People Online",
        styles: {
          default: {
            color: "#333",
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "20px"
          }
        },
        tailwindStyles: "text-gray-800 text-lg font-bold mb-5 text-center md:text-left sm:text-sm"
      },
      {
        type: "Frame",
        name: "UserItem",
        content: "",
        styles: {
          default: {
            width: "100%",
            padding: "10px 0",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "row",
            alignItems: "center"
          }
        },
        tailwindStyles: "w-full py-2 border-b border-gray-100 flex flex-row items-center text-sm md:text-base",
        elements: [
          {
            type: "Text",
            content: "•",
            styles: {
              default: {
                color: "#4CAF50",
                fontSize: "24px",
                marginRight: "10px"
              }
            },
            tailwindStyles: "text-green-500 text-2xl mr-2"
          },
          {
            type: "Text",
            content: "",
            styles: {
              default: {
                color: "#333",
                fontSize: "16px"
              }
            },
            tailwindStyles: "text-gray-800 text-md"
          }
        ],
        href: "",
        src: ""
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            alignItems: "center",
            padding: "12px",
            marginTop: "auto",
            borderRadius: "8px",
            backgroundColor: "#f8f9fa",
            gap: "12px"
          }
        },
        tailwindStyles: "flex items-center p-3 mt-auto rounded-lg bg-gray-50 gap-3 hover:bg-gray-100 w-full",
        elements: [
          {
            type: "Text",
            content: "Guest User",
            styles: {
              default: {
                color: "#333",
                fontSize: "14px",
                fontWeight: "500"
              }
            },
            tailwindStyles: "text-gray-800 text-sm font-medium sm:hidden"
          }
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const formComponent1 = {
  component: {
    type: "Form",
    name: "Form1",
    content: "",
    styles: {
      default: {
        width: "100%",
        margin: "0 auto",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.07)",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }
    },
    tailwindStyles: "w-full mx-auto rounded-xl shadow-lg bg-white flex flex-col overflow-hidden p-4 md:p-6",
    elements: [
      {
        type: "Frame",
        name: "FormHeader",
        content: "",
        styles: {
          default: {
            width: "100%",
            marginBottom: "16px"
          }
        },
        tailwindStyles: "w-full mb-3 md:mb-5",
        elements: [
          {
            type: "Text",
            content: "Thông tin liên hệ",
            styles: {
              default: {
                fontSize: "24px",
                fontWeight: "700",
                color: "#111827",
                padding: "12px 0",
                width: "100%",
                textAlign: "center"
              }
            },
            tailwindStyles: "text-xl md:text-2xl font-bold text-gray-900 py-2 md:py-3 text-center w-full",
            href: "",
            src: ""
          }
        ],
        href: "",
        src: ""
      },
      {
        type: "Frame",
        name: "ContentContainer",
        content: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "row",
            width: "100%",
            padding: "0px 24px 24px",
            gap: "24px"
          }
        },
        tailwindStyles: "w-full flex flex-col md:flex-row px-2 md:px-5 gap-5 md:gap-6",
        elements: [
          {
            type: "Image",
            name: "ContactImage",
            content: "",
            styles: {
              default: {
                width: "40%",
                objectFit: "cover",
                borderRadius: "8px",
                height: "100%"
              }
            },
            tailwindStyles: "w-full md:w-2/5 h-56 md:h-auto object-cover rounded-lg mb-5 md:mb-0",
            href: "",
            src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
          },
          {
            type: "Frame",
            name: "FormContainer",
            content: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "60%"
              }
            },
            tailwindStyles: "w-full md:w-3/5 flex flex-col gap-4 md:gap-5",
            elements: [
              {
                type: "Frame",
                name: "NameInputGroup",
                content: "",
                styles: {
                  default: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    width: "100%"
                  }
                },
                tailwindStyles: "flex flex-col gap-2 w-full mb-3 md:mb-0",
                elements: [
                  {
                    type: "Text",
                    content: "Họ và tên",
                    styles: {
                      default: {
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151"
                      }
                    },
                    tailwindStyles: "text-sm font-medium text-gray-700",
                    href: "",
                    src: ""
                  },
                  {
                    type: "Input",
                    content: "",
                    styles: {
                      default: {
                        padding: "10px 14px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        width: "100%",
                        fontSize: "14px"
                      }
                    },
                    tailwindStyles: "w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    href: "",
                    src: "",
                    settings: {
                      type: "text",
                      placeholder: "",
                      required: true,
                      name: "name"
                    }
                  }
                ],
                href: "",
                src: ""
              },
              {
                type: "Frame",
                name: "ContactInfoGroup",
                content: "",
                styles: {
                  default: {
                    display: "flex",
                    flexDirection: "row",
                    gap: "16px",
                    width: "100%"
                  }
                },
                tailwindStyles: "flex flex-col sm:flex-row gap-4 w-full",
                elements: [
                  {
                    type: "Frame",
                    name: "EmailInputGroup",
                    content: "",
                    styles: {
                      default: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        width: "50%"
                      }
                    },
                    tailwindStyles: "flex flex-col gap-2 w-full sm:w-1/2 mb-3 sm:mb-0 sm:mr-2",
                    elements: [
                      {
                        type: "Text",
                        content: "Email",
                        styles: {
                          default: {
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151"
                          }
                        },
                        tailwindStyles: "text-sm font-medium text-gray-700",
                        href: "",
                        src: ""
                      },
                      {
                        type: "Input",
                        content: "",
                        styles: {
                          default: {
                            padding: "10px 14px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            width: "100%",
                            fontSize: "14px"
                          }
                        },
                        tailwindStyles: "w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        href: "",
                        src: "",
                        settings: {
                          type: "email",
                          placeholder: "",
                          required: true,
                          name: "email"
                        }
                      }
                    ],
                    href: "",
                    src: ""
                  },
                  {
                    type: "Frame",
                    name: "PhoneInputGroup",
                    content: "",
                    styles: {
                      default: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        width: "50%"
                      }
                    },
                    tailwindStyles: "flex flex-col gap-2 w-full sm:w-1/2 sm:ml-2",
                    elements: [
                      {
                        type: "Text",
                        content: "Số điện thoại",
                        styles: {
                          default: {
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151"
                          }
                        },
                        tailwindStyles: "text-sm font-medium text-gray-700",
                        href: "",
                        src: ""
                      },
                      {
                        type: "Input",
                        content: "",
                        styles: {
                          default: {
                            padding: "10px 14px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            width: "100%",
                            fontSize: "14px"
                          }
                        },
                        tailwindStyles: "w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        href: "",
                        src: "",
                        settings: {
                          type: "tel",
                          placeholder: "",
                          required: false,
                          name: "phone"
                        }
                      }
                    ],
                    href: "",
                    src: ""
                  }
                ],
                href: "",
                src: ""
              },
              {
                type: "Frame",
                name: "MessageInputGroup",
                content: "",
                styles: {
                  default: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    width: "100%"
                  }
                },
                tailwindStyles: "flex flex-col gap-2 w-full mt-3 md:mt-0",
                elements: [
                  {
                    type: "Text",
                    content: "Nội dung liên hệ",
                    styles: {
                      default: {
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151"
                      }
                    },
                    tailwindStyles: "text-sm font-medium text-gray-700",
                    href: "",
                    src: ""
                  },
                  {
                    type: "Frame",
                    content: "",
                    styles: {
                      default: {
                        padding: "10px 14px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        width: "100%",
                        fontSize: "14px",
                        minHeight: "140px"
                      }
                    },
                    tailwindStyles: "w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 min-h-[140px]",
                    href: "",
                    src: "",
                    elements: [
                      {
                        type: "Input",
                        content: "",
                        styles: {
                          default: {
                            width: "100%",
                            height: "100%",
                            border: "none",
                            outline: "none",
                            resize: "none"
                          }
                        },
                        tailwindStyles: "w-full h-full border-none outline-none resize-none bg-transparent",
                        href: "",
                        src: "",
                        settings: {
                          type: "textarea",
                          placeholder: "",
                          required: true,
                          name: "message"
                        }
                      }
                    ]
                  }
                ],
                href: "",
                src: ""
              }
            ],
            href: "",
            src: ""
          }
        ],
        href: "",
        src: ""
      },
      {
        type: "Button",
        content: "Submit",
        styles: {
          default: {
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            padding: "12px 20px",
            fontWeight: "500",
            fontSize: "14px",
            cursor: "pointer",
            border: "none",
            width: "100%",
            borderRadius: "6px"
          }
        },
        tailwindStyles: "bg-blue-500 hover:bg-blue-600 text-white py-3 px-5 font-medium text-sm cursor-pointer border-none w-full rounded-md transition-colors mt-4 md:mt-6",
        href: "",
        src: ""
      }
    ],
    href: "",
    src: "",
    settings: {
      method: "post",
      autoComplete: "on",
      // Changed from autocomplete to autoComplete to match FormSettings interface
      validateOnSubmit: false
      // Changed from noValidate to validateOnSubmit
    }
  }
};
const formComponent2 = {
  component: {
    type: "Form",
    name: "Newsletter Form",
    settings: {
      method: "post",
      autoComplete: "on"
    },
    styles: {
      default: {
        width: "100%",
        margin: "0 auto",
        padding: "32px",
        borderRadius: "12px",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.07)",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }
    },
    tailwindStyles: "w-full mx-auto rounded-xl shadow-lg bg-white flex flex-col items-center p-6 md:p-8",
    elements: [
      {
        type: "Text",
        content: "Subscribe to our Newsletter",
        styles: {
          default: {
            fontSize: "24px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "8px",
            textAlign: "center"
          }
        },
        tailwindStyles: "text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center",
        href: "",
        src: ""
      },
      {
        type: "Text",
        content: "Get the latest updates and news delivered to your inbox.",
        styles: {
          default: {
            fontSize: "16px",
            color: "#6b7280",
            marginBottom: "24px",
            textAlign: "center"
          }
        },
        tailwindStyles: "text-base text-gray-500 mb-6 text-center",
        href: "",
        src: ""
      },
      {
        type: "Frame",
        name: "InputGroup",
        content: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "row",
            gap: "12px",
            width: "100%",
            maxWidth: "400px"
          }
        },
        tailwindStyles: "flex flex-col sm:flex-row gap-3 w-full max-w-md",
        elements: [
          {
            type: "Input",
            content: "",
            styles: {
              default: {
                padding: "12px 16px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "14px",
                flex: "1"
              }
            },
            tailwindStyles: "flex-1 px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            href: "",
            src: "",
            settings: {
              type: "email",
              placeholder: "Enter your email",
              required: true,
              name: "email"
            }
          },
          {
            type: "Button",
            content: "Subscribe",
            styles: {
              default: {
                backgroundColor: "#3b82f6",
                color: "#ffffff",
                padding: "12px 24px",
                fontWeight: "500",
                fontSize: "14px",
                cursor: "pointer",
                border: "none",
                borderRadius: "6px"
              }
            },
            tailwindStyles: "bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 font-medium text-sm cursor-pointer border-none rounded-md transition-colors",
            href: "",
            src: ""
          }
        ],
        href: "",
        src: ""
      }
    ],
    href: "",
    src: ""
  }
};
function mkId(prefix) {
  return `${prefix}-${v4().slice(0, 8)}`;
}
function createFeature(title, body) {
  return {
    type: "Frame",
    name: mkId(title),
    content: "",
    tailwindStyles: "p-6 rounded-lg bg-transparent",
    elements: [
      {
        type: "Text",
        content: title,
        tailwindStyles: "font-semibold text-foreground"
      },
      {
        type: "Text",
        content: body,
        tailwindStyles: "text-sm text-muted-foreground mt-2"
      }
    ],
    href: "",
    src: ""
  };
}
function createStat(value, label) {
  return {
    type: "Frame",
    name: mkId(label),
    content: "",
    tailwindStyles: "flex flex-col items-center",
    elements: [
      {
        type: "Text",
        content: value,
        tailwindStyles: "text-3xl font-extrabold text-foreground"
      },
      {
        type: "Text",
        content: label,
        tailwindStyles: "text-sm text-muted-foreground mt-1"
      }
    ],
    href: "",
    src: ""
  };
}
function createTestimonial(name, role, quote, avatar) {
  return {
    type: "Frame",
    name: mkId(name),
    content: "",
    tailwindStyles: "p-6 rounded-lg bg-card border border-border",
    elements: [
      {
        type: "Frame",
        name: mkId("meta"),
        content: "",
        tailwindStyles: "flex items-center gap-3 mb-3",
        elements: [
          {
            type: "Image",
            content: avatar ? `${name} avatar` : "avatar-placeholder",
            src: avatar ?? "",
            alt: avatar ? `${name} avatar` : `${name} avatar`,
            loading: "lazy",
            width: 48,
            height: 48,
            objectFit: "cover",
            tailwindStyles: "w-12 h-12 rounded-full object-cover"
          },
          {
            type: "Frame",
            name: mkId("meta-text"),
            content: "",
            tailwindStyles: "flex flex-col",
            elements: [
              {
                type: "Text",
                content: name,
                tailwindStyles: "text-sm font-semibold text-foreground"
              },
              {
                type: "Text",
                content: role,
                tailwindStyles: "text-xs text-muted-foreground"
              }
            ]
          }
        ]
      },
      {
        type: "Text",
        content: `"${quote}"`,
        tailwindStyles: "text-sm text-muted-foreground"
      }
    ],
    href: "",
    src: ""
  };
}
function createPricingCard(title, price, bullets, featured = false) {
  return {
    type: "Frame",
    name: mkId(title),
    content: "",
    tailwindStyles: `p-6 rounded-lg border ${featured ? "border-primary bg-card" : "border-border bg-background"}`,
    styles: featured ? { default: { borderColor: "var(--color-primary)" } } : {},
    elements: [
      {
        type: "Text",
        content: title,
        tailwindStyles: "text-lg font-semibold text-foreground"
      },
      {
        type: "Text",
        content: price,
        tailwindStyles: "text-2xl font-extrabold text-foreground mt-2"
      },
      {
        type: "Frame",
        name: mkId("bullets"),
        content: "",
        tailwindStyles: "mt-4 flex flex-col gap-2",
        elements: bullets.map((b) => ({
          type: "Text",
          content: b,
          tailwindStyles: "text-sm text-muted-foreground"
        }))
      },
      {
        type: "Button",
        content: featured ? "Get started" : "Choose",
        buttonType: "button",
        tailwindStyles: featured ? "mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground" : "mt-4 px-4 py-2 rounded-md border border-border text-foreground",
        styles: featured ? {
          default: {
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)"
          }
        } : {},
        href: "/signup"
      }
    ],
    href: "",
    src: ""
  };
}
function createFAQ(question, answer) {
  return {
    type: "Frame",
    name: mkId(question),
    content: "",
    tailwindStyles: "p-4 rounded-lg bg-transparent border border-border",
    elements: [
      {
        type: "Text",
        content: question,
        tailwindStyles: "font-semibold text-foreground"
      },
      {
        type: "Text",
        content: answer,
        tailwindStyles: "text-sm text-muted-foreground mt-2"
      }
    ],
    href: "",
    src: ""
  };
}
const NavbarSectionComponent = {
  component: {
    type: "Section",
    id: "navbar",
    name: "Navbar",
    role: "navigation",
    ariaLabel: "Main navigation",
    content: "",
    tailwindStyles: "w-full sticky top-0 z-50 bg-card py-3 px-4 md:px-8 flex items-center justify-between",
    elements: [
      {
        type: "Frame",
        name: "Brand",
        content: "",
        tailwindStyles: "flex items-center gap-3",
        elements: [
          {
            type: "Image",
            name: "Logo",
            content: "Brand logo",
            src: "",
            alt: "Brand logo",
            loading: "eager",
            width: 120,
            height: 36,
            objectFit: "contain",
            tailwindStyles: "h-9 w-auto object-contain"
          },
          {
            type: "Text",
            content: "WebBuilder",
            tailwindStyles: "text-lg font-semibold text-foreground"
          }
        ],
        href: "",
        src: ""
      },
      {
        type: "Frame",
        name: "NavLinks",
        content: "",
        tailwindStyles: "hidden md:flex items-center gap-6",
        elements: [
          {
            type: "Link",
            content: "Features",
            href: "#features",
            tailwindStyles: "text-foreground"
          },
          {
            type: "Link",
            content: "Pricing",
            href: "#pricing",
            tailwindStyles: "text-foreground"
          },
          {
            type: "Link",
            content: "Customers",
            href: "#testimonials",
            tailwindStyles: "text-foreground"
          },
          {
            type: "Link",
            content: "Docs",
            href: "/docs",
            tailwindStyles: "text-foreground"
          }
        ],
        href: "",
        src: ""
      },
      {
        type: "Frame",
        name: "NavCTAs",
        content: "",
        tailwindStyles: "flex items-center gap-3",
        elements: [
          {
            type: "Button",
            content: "Sign in",
            href: "/signin",
            buttonType: "button",
            tailwindStyles: "px-3 py-2 rounded-md text-foreground",
            styles: { default: { backgroundColor: "transparent" } }
          },
          {
            type: "Button",
            content: "Get started",
            href: "/signup",
            buttonType: "button",
            tailwindStyles: "px-4 py-2 rounded-md bg-primary text-primary-foreground",
            styles: {
              default: {
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-foreground)"
              }
            }
          }
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const HeroSectionComponent = {
  component: {
    type: "Section",
    id: "hero",
    name: "Hero",
    role: "region",
    ariaLabel: "Hero section",
    content: "",
    tailwindStyles: "w-full py-16 px-4 md:px-8 bg-muted",
    styles: { default: { backgroundColor: "var(--color-muted)" } },
    elements: [
      {
        type: "Frame",
        name: "HeroInner",
        content: "",
        tailwindStyles: "w-full max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-8",
        elements: [
          {
            type: "Frame",
            name: "HeroText",
            content: "",
            tailwindStyles: "flex-1",
            elements: [
              {
                type: "Text",
                content: "Design and ship beautiful websites — faster",
                tailwindStyles: "text-3xl md:text-5xl font-extrabold text-foreground"
              },
              {
                type: "Text",
                content: "A visual site builder with components, responsive controls, and painless publishing.",
                tailwindStyles: "text-base text-muted-foreground mt-4 max-w-2xl"
              },
              {
                type: "Frame",
                name: "HeroActions",
                content: "",
                tailwindStyles: "flex gap-3 mt-6",
                elements: [
                  {
                    type: "Button",
                    content: "Start free",
                    href: "/signup",
                    buttonType: "button",
                    tailwindStyles: "bg-primary text-primary-foreground px-5 py-3 rounded-md",
                    styles: {
                      default: {
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-primary-foreground)"
                      }
                    }
                  },
                  {
                    type: "Button",
                    content: "View demo",
                    href: "/demo",
                    buttonType: "button",
                    tailwindStyles: "px-5 py-3 rounded-md bg-card text-foreground border border-border"
                  }
                ]
              },
              {
                type: "Frame",
                name: "HeroTrust",
                content: "",
                tailwindStyles: "flex items-center gap-4 mt-6",
                elements: [
                  {
                    type: "Text",
                    content: "Trusted by teams worldwide",
                    tailwindStyles: "text-sm text-muted-foreground"
                  },
                  {
                    type: "Image",
                    content: "logos",
                    src: "",
                    alt: "Partner logos",
                    loading: "lazy",
                    width: 240,
                    height: 32,
                    objectFit: "contain",
                    tailwindStyles: "h-8 opacity-80"
                  }
                ]
              }
            ]
          },
          {
            type: "Frame",
            name: "HeroVisual",
            content: "",
            tailwindStyles: "flex-1 flex items-center justify-center",
            elements: [
              {
                type: "Image",
                name: "HeroScreenshot",
                content: "Editor screenshot",
                src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1170&q=80",
                alt: "App screenshot showing editor",
                loading: "lazy",
                width: 520,
                height: 360,
                objectFit: "cover",
                tailwindStyles: "w-full max-w-[520px] rounded-xl shadow-xl object-cover"
              }
            ]
          }
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const FeaturesSectionComponent = {
  component: {
    type: "Section",
    id: "features",
    name: "Features",
    role: "region",
    ariaLabel: "Key features",
    content: "",
    tailwindStyles: "w-full py-16 px-4 md:px-8",
    styles: { default: { backgroundColor: "var(--color-background)" } },
    elements: [
      {
        type: "Frame",
        name: "FeaturesInner",
        content: "",
        tailwindStyles: "max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8",
        elements: [
          createFeature(
            "Visual Editor",
            "Drag, drop and style with real-time previews."
          ),
          createFeature(
            "Responsive Controls",
            "Adjust layouts and breakpoints visually."
          ),
          createFeature(
            "Templates & Blocks",
            "Start from pre-built sections and customize freely."
          )
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const StatsSectionComponent = {
  component: {
    type: "Section",
    id: "stats",
    name: "Stats",
    role: "region",
    ariaLabel: "Product statistics",
    content: "",
    tailwindStyles: "w-full py-12 px-4 md:px-8 bg-card",
    styles: { default: { backgroundColor: "var(--color-card)" } },
    elements: [
      {
        type: "Frame",
        name: "StatsInner",
        content: "",
        tailwindStyles: "max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center",
        elements: [
          createStat("98%", "Customer satisfaction"),
          createStat("1.2M", "Sites published"),
          createStat("99.99%", "Uptime")
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const TestimonialsSectionComponent = {
  component: {
    type: "Section",
    id: "testimonials",
    name: "Testimonials",
    role: "region",
    ariaLabel: "Customer testimonials",
    content: "",
    tailwindStyles: "w-full py-16 px-4 md:px-8",
    elements: [
      {
        type: "Frame",
        name: "TestimonialsInner",
        content: "",
        tailwindStyles: "max-w-6xl mx-auto",
        elements: [
          {
            type: "Text",
            content: "What customers say",
            tailwindStyles: "text-lg text-accent font-semibold"
          },
          {
            type: "Frame",
            name: "TestimonialGrid",
            content: "",
            tailwindStyles: "grid grid-cols-1 md:grid-cols-3 gap-6 mt-6",
            elements: [
              createTestimonial(
                "Sofia Martin",
                "Lead Designer",
                "This tool saved us weeks of development.",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
              ),
              createTestimonial(
                "Liam Zhang",
                "CTO",
                "Great performance and an intuitive visual builder.",
                "https://images.unsplash.com/photo-1545996124-1b1b3f9a8b2f?auto=format&fit=crop&w=200&q=80"
              ),
              createTestimonial(
                "Aisha Khan",
                "Founder",
                "We launched faster than planned thanks to the templates.",
                "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=200&q=80"
              )
            ]
          }
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const PricingSectionComponent = {
  component: {
    type: "Section",
    id: "pricing",
    name: "Pricing",
    role: "region",
    ariaLabel: "Pricing plans",
    content: "",
    tailwindStyles: "w-full py-16 px-4 md:px-8 bg-muted",
    styles: { default: { backgroundColor: "var(--color-muted)" } },
    elements: [
      {
        type: "Frame",
        name: "PricingInner",
        content: "",
        tailwindStyles: "max-w-6xl mx-auto",
        elements: [
          {
            type: "Text",
            content: "Pricing that grows with you",
            tailwindStyles: "text-2xl md:text-4xl font-bold text-foreground text-center mb-6"
          },
          {
            type: "Frame",
            name: "PricingPlans",
            content: "",
            tailwindStyles: "max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6",
            elements: [
              createPricingCard(
                "Starter",
                "$0",
                ["2 projects", "Community support"],
                false
              ),
              createPricingCard(
                "Pro",
                "$29/mo",
                ["Unlimited projects", "Priority support", "Custom domains"],
                true
              ),
              createPricingCard(
                "Enterprise",
                "Contact us",
                ["SAML SSO", "Dedicated support", "Custom SLAs"],
                false
              )
            ]
          }
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const FAQSectionComponent = {
  component: {
    type: "Section",
    id: "faq",
    name: "FAQ",
    role: "region",
    ariaLabel: "Frequently asked questions",
    content: "",
    tailwindStyles: "w-full py-14 px-4 md:px-8",
    elements: [
      {
        type: "Text",
        content: "Frequently asked questions",
        tailwindStyles: "text-2xl md:text-3xl font-bold text-foreground text-center mb-6"
      },
      {
        type: "Frame",
        name: "FAQList",
        content: "",
        tailwindStyles: "max-w-4xl mx-auto flex flex-col gap-4",
        elements: [
          createFAQ(
            "How quickly can I launch a site?",
            "You can launch a simple site in minutes using templates."
          ),
          createFAQ(
            "Can I export code?",
            "Yes — export static assets or connect your preferred hosting in a few clicks."
          ),
          createFAQ(
            "Is there a free tier?",
            "Yes, our Starter plan is free for individual use and testing."
          )
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const NewsletterSectionComponent = {
  component: {
    type: "Section",
    id: "newsletter",
    name: "Newsletter",
    role: "region",
    ariaLabel: "Newsletter signup",
    content: "",
    tailwindStyles: "w-full py-10 px-4 md:px-8 bg-accent text-accent-foreground",
    elements: [
      {
        type: "Frame",
        name: "NewsletterInner",
        content: "",
        tailwindStyles: "max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4",
        elements: [
          {
            type: "Text",
            content: "Stay in the loop",
            tailwindStyles: "text-lg font-semibold"
          },
          {
            type: "Text",
            content: "Get product updates, templates and tips sent to your inbox.",
            tailwindStyles: "text-sm text-accent-foreground/90 max-w-md"
          },
          {
            type: "Frame",
            name: "NewsletterForm",
            content: "",
            tailwindStyles: "flex gap-2 w-full md:w-auto",
            elements: [
              {
                type: "Input",
                name: "email",
                content: "",
                tailwindStyles: "px-4 py-2 rounded-md border border-border bg-card",
                placeholder: "you@example.com"
              },
              {
                type: "Button",
                content: "Subscribe",
                buttonType: "button",
                tailwindStyles: "bg-primary text-primary-foreground px-4 py-2 rounded-md",
                styles: {
                  default: {
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-primary-foreground)"
                  }
                }
              }
            ]
          }
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const FooterSectionComponent = {
  component: {
    type: "Section",
    id: "footer",
    name: "Footer",
    role: "contentinfo",
    ariaLabel: "Website footer",
    content: "",
    tailwindStyles: "w-full py-12 px-4 md:px-8 bg-card",
    styles: { default: { backgroundColor: "var(--color-card)" } },
    elements: [
      {
        type: "Frame",
        name: "FooterInner",
        content: "",
        tailwindStyles: "max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6",
        elements: [
          {
            type: "Frame",
            name: "FooterBrand",
            content: "",
            tailwindStyles: "flex flex-col gap-3",
            elements: [
              {
                type: "Image",
                content: "Logo",
                src: "",
                alt: "Company logo",
                loading: "eager",
                decoding: "sync",
                width: 120,
                height: 36,
                objectFit: "contain",
                tailwindStyles: "h-9 w-auto"
              },
              {
                type: "Text",
                content: "Build and ship beautiful websites faster.",
                tailwindStyles: "text-sm text-muted-foreground"
              }
            ]
          },
          {
            type: "Frame",
            name: "FooterLinks",
            content: "",
            tailwindStyles: "flex gap-6",
            elements: [
              {
                type: "Frame",
                name: "LinksCol",
                content: "",
                tailwindStyles: "flex flex-col gap-2",
                elements: [
                  {
                    type: "Text",
                    content: "Product",
                    tailwindStyles: "font-semibold text-foreground"
                  },
                  {
                    type: "Link",
                    content: "Templates",
                    href: "/templates",
                    tailwindStyles: "text-sm text-muted-foreground"
                  },
                  {
                    type: "Link",
                    content: "Pricing",
                    href: "/pricing",
                    tailwindStyles: "text-sm text-muted-foreground"
                  },
                  {
                    type: "Link",
                    content: "Docs",
                    href: "/docs",
                    tailwindStyles: "text-sm text-muted-foreground"
                  }
                ]
              }
            ]
          },
          {
            type: "Frame",
            name: "FooterLegal",
            content: "",
            tailwindStyles: "flex flex-col gap-2",
            elements: [
              {
                type: "Text",
                content: "© 2025 WebBuilder",
                tailwindStyles: "text-sm text-muted-foreground"
              },
              {
                type: "Link",
                content: "Privacy",
                href: "/privacy",
                tailwindStyles: "text-sm text-muted-foreground"
              },
              {
                type: "Link",
                content: "Terms",
                href: "/terms",
                tailwindStyles: "text-sm text-muted-foreground"
              }
            ]
          }
        ]
      }
    ],
    href: "",
    src: ""
  }
};
const landingPageSections = [
  NavbarSectionComponent,
  HeroSectionComponent,
  FeaturesSectionComponent,
  StatsSectionComponent,
  TestimonialsSectionComponent,
  PricingSectionComponent,
  FAQSectionComponent,
  NewsletterSectionComponent,
  FooterSectionComponent
];
const customComponents = [
  navbarComponent,
  navbarComponent2,
  navbarComponent3,
  navbarComponent4,
  navbarComponent5,
  footerComponent,
  footerComponent2,
  footerComponent3,
  footerComponent4,
  headerComponent,
  headerComponent2,
  headerComponent3,
  sidebarLeftComponent,
  sidebarLeftComponent2,
  sidebarLeftComponent3,
  sidebarLeftComponent4,
  sidebarRightComponent,
  sidebarRightComponent2,
  sidebarRightComponent3,
  sidebarRightComponent4,
  formComponent1,
  formComponent2,
  ...landingPageSections,
  ...siteTemplates
];
const customComps = customComponents.flat().map((customComp) => customComp.component);
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      "data-variant": variant,
      "data-size": size,
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
function Dialog({
  ...props
}) {
  return /* @__PURE__ */ jsx(Dialog$1.Root, { "data-slot": "dialog", ...props });
}
function DialogTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(Dialog$1.Trigger, { "data-slot": "dialog-trigger", ...props });
}
function DialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(Dialog$1.Portal, { "data-slot": "dialog-portal", ...props });
}
function DialogClose({
  ...props
}) {
  return /* @__PURE__ */ jsx(Dialog$1.Close, { "data-slot": "dialog-close", ...props });
}
function DialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Overlay,
    {
      "data-slot": "dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function DialogContent({
  className,
  children: children2,
  showCloseButton = true,
  ...props
}) {
  return /* @__PURE__ */ jsxs(DialogPortal, { "data-slot": "dialog-portal", children: [
    /* @__PURE__ */ jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsxs(
      Dialog$1.Content,
      {
        "data-slot": "dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-lg",
          className
        ),
        ...props,
        children: [
          children2,
          showCloseButton && /* @__PURE__ */ jsxs(
            Dialog$1.Close,
            {
              "data-slot": "dialog-close",
              className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              children: [
                /* @__PURE__ */ jsx(XIcon, {}),
                /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function DialogFooter({
  className,
  showCloseButton = false,
  children: children2,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "data-slot": "dialog-footer",
      className: cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props,
      children: [
        children2,
        showCloseButton && /* @__PURE__ */ jsx(Dialog$1.Close, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "Close" }) })
      ]
    }
  );
}
function DialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Title,
    {
      "data-slot": "dialog-title",
      className: cn("text-lg leading-none font-semibold", className),
      ...props
    }
  );
}
function DialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Description,
    {
      "data-slot": "dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "badge",
      "data-variant": variant,
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}
function TooltipProvider({
  delayDuration = 0,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Tooltip$1.Provider,
    {
      "data-slot": "tooltip-provider",
      delayDuration,
      ...props
    }
  );
}
function Tooltip({
  ...props
}) {
  return /* @__PURE__ */ jsx(Tooltip$1.Root, { "data-slot": "tooltip", ...props });
}
function TooltipTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(Tooltip$1.Trigger, { "data-slot": "tooltip-trigger", ...props });
}
function TooltipContent({
  className,
  sideOffset = 0,
  children: children2,
  ...props
}) {
  return /* @__PURE__ */ jsx(Tooltip$1.Portal, { children: /* @__PURE__ */ jsxs(
    Tooltip$1.Content,
    {
      "data-slot": "tooltip-content",
      sideOffset,
      className: cn(
        "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
        className
      ),
      ...props,
      children: [
        children2,
        /* @__PURE__ */ jsx(Tooltip$1.Arrow, { className: "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" })
      ]
    }
  ) });
}
const CreateEventWorkflowSchema = z$1.object({
  name: z$1.string().min(1, "Workflow name is required").min(3, "Workflow name must be at least 3 characters").max(100, "Workflow name must not exceed 100 characters").trim(),
  description: z$1.string().max(500, "Description must not exceed 500 characters").transform((val) => val?.trim() === "" ? void 0 : val?.trim()).optional()
});
z$1.object({
  name: z$1.string().min(1, "Workflow name is required").min(3, "Workflow name must be at least 3 characters").max(100, "Workflow name must not exceed 100 characters").trim().optional(),
  description: z$1.string().max(500, "Description must not exceed 500 characters").transform((val) => val?.trim() === "" ? void 0 : val?.trim()).optional(),
  enabled: z$1.boolean().optional()
});
z$1.object({
  search: z$1.string().max(100, "Search query must not exceed 100 characters").optional(),
  enabled: z$1.boolean().optional()
});
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Label$1.Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
const Form = FormProvider;
const FormFieldContext = React.createContext(
  {}
);
const FormField = ({
  ...props
}) => {
  return /* @__PURE__ */ jsx(FormFieldContext.Provider, { value: { name: props.name }, children: /* @__PURE__ */ jsx(Controller, { ...props }) });
};
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  const { id } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};
const FormItemContext = React.createContext(
  {}
);
function FormItem({ className, ...props }) {
  const id = React.useId();
  return /* @__PURE__ */ jsx(FormItemContext.Provider, { value: { id }, children: /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "form-item",
      className: cn("grid gap-2", className),
      ...props
    }
  ) });
}
function FormLabel({
  className,
  ...props
}) {
  const { error, formItemId } = useFormField();
  return /* @__PURE__ */ jsx(
    Label,
    {
      "data-slot": "form-label",
      "data-error": !!error,
      className: cn("data-[error=true]:text-destructive", className),
      htmlFor: formItemId,
      ...props
    }
  );
}
function FormControl({ ...props }) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return /* @__PURE__ */ jsx(
    Slot.Root,
    {
      "data-slot": "form-control",
      id: formItemId,
      "aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
      "aria-invalid": !!error,
      ...props
    }
  );
}
function FormDescription({ className, ...props }) {
  const { formDescriptionId } = useFormField();
  return /* @__PURE__ */ jsx(
    "p",
    {
      "data-slot": "form-description",
      id: formDescriptionId,
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function FormMessage({ className, ...props }) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;
  if (!body) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "p",
    {
      "data-slot": "form-message",
      id: formMessageId,
      className: cn("text-destructive text-sm", className),
      ...props,
      children: body
    }
  );
}
const getDefaultNodeConfig = (nodeType) => {
  switch (nodeType) {
    case NodeType.ACTION:
      return {
        actionType: "navigate",
        target: "url",
        value: "https://example.com",
        openInNewTab: false
      };
    case NodeType.TRIGGER:
      return {
        eventType: "onClick"
      };
    case NodeType.CONDITION:
      return {
        conditionType: "always"
      };
    case NodeType.OUTPUT:
      return {};
    default:
      return {};
  }
};
class WorkflowTypeStrategy {
  constructor(nodeType) {
    this.nodeType = nodeType;
  }
  create(input) {
    return {
      id: input.id,
      type: "workflow",
      position: input.position,
      data: {
        label: input.label ?? this.nodeType,
        description: `New ${this.nodeType} node`,
        type: this.nodeType,
        config: getDefaultNodeConfig(this.nodeType),
        onSelect: input.onSelect,
        onConfigure: input.onConfigure
      }
    };
  }
  map({ node, onSelect, onConfigure }) {
    return {
      id: node.id,
      type: "workflow",
      position: node.position,
      data: {
        label: node.data.label,
        description: node.data.description,
        icon: node.data.icon,
        type: node.type,
        onSelect,
        onConfigure
      }
    };
  }
}
class ElementNodeStrategy {
  create(input) {
    const elementId = input.elementId ?? "";
    const elementName = input.elementName ?? input.label ?? "Element";
    return {
      id: input.id,
      type: "element",
      position: input.position,
      data: {
        label: elementName,
        elementId,
        elementName,
        elementType: input.elementType,
        connectedEvents: []
      }
    };
  }
  map({ node, connectedEvents = [] }) {
    return {
      id: node.id,
      type: "element",
      position: node.position,
      data: {
        label: node.data.label,
        elementId: node.data.elementId ?? "",
        elementName: node.data.elementName ?? node.data.label,
        elementType: node.data.elementType,
        connectedEvents
      }
    };
  }
}
const strategies = {
  [NodeType.TRIGGER]: new WorkflowTypeStrategy(NodeType.TRIGGER),
  [NodeType.ACTION]: new WorkflowTypeStrategy(NodeType.ACTION),
  [NodeType.CONDITION]: new WorkflowTypeStrategy(NodeType.CONDITION),
  [NodeType.OUTPUT]: new WorkflowTypeStrategy(NodeType.OUTPUT),
  [NodeType.ELEMENT]: new ElementNodeStrategy()
};
function createReactFlowNode(nodeType, input) {
  return strategies[nodeType].create(input);
}
function mapWorkflowNodeToReactFlow(input) {
  return strategies[input.node.type].map(input);
}
const EventTypeSchema = z$1.enum([
  "onClick",
  "onDoubleClick",
  "onMouseEnter",
  "onMouseLeave",
  "onMouseDown",
  "onMouseUp",
  "onFocus",
  "onBlur",
  "onChange",
  "onSubmit",
  "onKeyDown",
  "onKeyUp",
  "onScroll",
  "onLoad",
  "onError"
]);
const ActionTypeSchema = z$1.enum([
  "navigate",
  "showElement",
  "hideElement",
  "toggleElement",
  "apiCall",
  "setData",
  "customCode",
  "scrollTo",
  "modal",
  "submitForm",
  "resetForm",
  "playAnimation",
  "showNotification",
  "copyToClipboard",
  "downloadFile",
  "toggleClass",
  "addClass",
  "removeClass"
]);
const NavigateActionConfigSchema = z$1.object({
  type: z$1.literal("navigate"),
  target: z$1.enum(["url", "page", "external"]),
  value: z$1.string().min(1, "URL or page is required"),
  openInNewTab: z$1.boolean().optional(),
  replaceHistory: z$1.boolean().optional()
});
const ToggleElementActionConfigSchema = z$1.object({
  type: z$1.enum(["showElement", "hideElement", "toggleElement"]),
  elementId: z$1.string().min(1, "Element ID is required"),
  animationDuration: z$1.number().positive().optional()
});
const ApiCallActionConfigSchema = z$1.object({
  type: z$1.literal("apiCall"),
  url: z$1.url("Invalid URL format"),
  method: z$1.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  headers: z$1.record(z$1.string(), z$1.string()).optional(),
  body: z$1.record(z$1.string(), z$1.any()).optional(),
  bodyType: z$1.enum(["json", "formData"]).optional(),
  storeResponseAs: z$1.string().optional(),
  onSuccess: z$1.lazy(() => EventHandlerSchema.array()).optional(),
  onError: z$1.lazy(() => EventHandlerSchema.array()).optional(),
  timeout: z$1.number().positive().optional()
});
const SetDataActionConfigSchema = z$1.object({
  type: z$1.literal("setData"),
  dataPath: z$1.string().min(1, "Data path is required"),
  value: z$1.any().optional(),
  valueType: z$1.enum(["static", "dynamic", "event"]).optional(),
  fromElement: z$1.string().optional(),
  fromAPI: z$1.string().optional(),
  fromEvent: z$1.enum(["target.value", "target.checked", "target.files"]).optional()
});
const CustomCodeActionConfigSchema = z$1.object({
  type: z$1.literal("customCode"),
  code: z$1.string().min(1, "Code is required")
});
const ScrollActionConfigSchema = z$1.object({
  type: z$1.literal("scrollTo"),
  target: z$1.enum(["elementId", "position"]),
  value: z$1.union([z$1.string(), z$1.number()]),
  behavior: z$1.enum(["smooth", "auto"]).optional(),
  offsetY: z$1.number().optional()
});
const ModalActionConfigSchema = z$1.object({
  type: z$1.literal("modal"),
  action: z$1.enum(["open", "close"]),
  modalId: z$1.string().optional()
});
const NotificationActionConfigSchema = z$1.object({
  type: z$1.literal("showNotification"),
  message: z$1.string().min(1, "Notification message is required"),
  notificationType: z$1.enum(["success", "error", "info", "warning"]).optional(),
  duration: z$1.number().positive().optional()
});
const CopyToClipboardActionConfigSchema = z$1.object({
  type: z$1.literal("copyToClipboard"),
  text: z$1.string().min(1, "Text to copy is required"),
  successMessage: z$1.string().optional()
});
const DownloadActionConfigSchema = z$1.object({
  type: z$1.literal("downloadFile"),
  url: z$1.string().url("Invalid file URL"),
  filename: z$1.string().optional()
});
const AnimationActionConfigSchema = z$1.object({
  type: z$1.literal("playAnimation"),
  elementId: z$1.string().min(1, "Element ID is required"),
  animationType: z$1.enum([
    "fadeIn",
    "slideIn",
    "bounce",
    "pulse",
    "shake",
    "spin"
  ]),
  duration: z$1.number().positive().optional(),
  delay: z$1.number().nonnegative().optional()
});
const FormActionConfigSchema = z$1.object({
  type: z$1.enum(["submitForm", "resetForm"]),
  formElementId: z$1.string().optional()
});
const ToggleClassActionConfigSchema = z$1.object({
  type: z$1.enum(["toggleClass", "addClass", "removeClass"]),
  elementId: z$1.string().min(1, "Element ID is required"),
  className: z$1.string().min(1, "Class name is required"),
  animationDuration: z$1.number().positive().optional()
});
const EventActionConfigSchema = z$1.discriminatedUnion("type", [
  NavigateActionConfigSchema,
  ToggleElementActionConfigSchema,
  ApiCallActionConfigSchema,
  SetDataActionConfigSchema,
  CustomCodeActionConfigSchema,
  ScrollActionConfigSchema,
  ModalActionConfigSchema,
  NotificationActionConfigSchema,
  CopyToClipboardActionConfigSchema,
  DownloadActionConfigSchema,
  AnimationActionConfigSchema,
  FormActionConfigSchema,
  ToggleClassActionConfigSchema
]);
const ConditionOperatorSchema = z$1.enum([
  "==",
  "!=",
  ">",
  "<",
  ">=",
  "<=",
  "includes",
  "notIncludes"
]);
const EventConditionSchema = z$1.object({
  id: z$1.string().min(1, "Condition ID is required"),
  type: z$1.enum(["stateEquals", "stateCheck", "customCode", "always"]),
  left: z$1.string().optional(),
  operator: ConditionOperatorSchema.optional(),
  right: z$1.any().optional(),
  customCode: z$1.string().optional()
});
const EventHandlerSchema = z$1.lazy(
  () => z$1.object({
    id: z$1.string().min(1, "Handler ID is required"),
    eventType: EventTypeSchema,
    actionType: ActionTypeSchema,
    enabled: z$1.boolean().optional().default(true),
    config: EventActionConfigSchema,
    delay: z$1.number().nonnegative().optional(),
    preventDefault: z$1.boolean().optional(),
    stopPropagation: z$1.boolean().optional(),
    conditions: EventConditionSchema.array().optional(),
    nextHandlers: EventHandlerSchema.array().optional()
  })
);
const ElementEventsSchema = z$1.record(
  z$1.string(),
  EventHandlerSchema.array()
);
z$1.object({
  element: z$1.any(),
  event: z$1.any().optional(),
  elementState: z$1.record(z$1.string(), z$1.any()),
  globalState: z$1.record(z$1.string(), z$1.any()).optional(),
  elementInstance: z$1.any().optional()
});
z$1.object({
  elementId: z$1.string().min(1, "Element ID is required"),
  events: ElementEventsSchema,
  createdAt: z$1.date(),
  updatedAt: z$1.date()
});
const ElementIdSchema = z$1.string().trim().min(1, "Element ID is required").describe("Unique identifier for an element");
const WorkflowIdSchema = z$1.string().trim().min(1, "Workflow ID is required").describe("Unique identifier for a workflow");
const ConnectionIdSchema = z$1.string().min(1, "Connection ID is required").describe("Unique identifier for a connection");
const ElementEventWorkflowConnectionSchema = z$1.object({
  id: ConnectionIdSchema,
  elementId: ElementIdSchema,
  eventName: EventTypeSchema,
  workflowId: WorkflowIdSchema,
  createdAt: z$1.string().datetime().or(z$1.date()),
  updatedAt: z$1.string().datetime().or(z$1.date())
});
const CreateElementEventWorkflowSchema = z$1.object({
  elementId: ElementIdSchema,
  eventName: EventTypeSchema,
  workflowId: WorkflowIdSchema
});
const DisconnectElementEventWorkflowSchema = z$1.object({
  elementId: ElementIdSchema,
  eventName: EventTypeSchema,
  workflowId: WorkflowIdSchema
});
z$1.object({
  eventName: EventTypeSchema.optional(),
  workflowId: WorkflowIdSchema.optional()
});
const ElementEventWorkflowConnectionArraySchema = z$1.array(
  ElementEventWorkflowConnectionSchema
);
z$1.object({
  data: ElementEventWorkflowConnectionSchema
});
z$1.object({
  data: ElementEventWorkflowConnectionArraySchema
});
z$1.object({
  data: ElementEventWorkflowConnectionArraySchema,
  total: z$1.number().nonnegative(),
  page: z$1.number().positive(),
  pageSize: z$1.number().positive()
});
function validateCreateConnection(data) {
  return CreateElementEventWorkflowSchema.safeParse(data);
}
function validateDisconnectConnection(data) {
  return DisconnectElementEventWorkflowSchema.safeParse(data);
}
function getFirstError(result) {
  if (result.success) return null;
  return result.error?.issues[0]?.message ?? "Validation failed";
}
const NodeIcon = ({ type }) => {
  switch (type) {
    case NodeType.TRIGGER:
      return /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" });
    case NodeType.ACTION:
      return /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" });
    case NodeType.CONDITION:
      return /* @__PURE__ */ jsx(GitBranch, { className: "h-4 w-4" });
    case NodeType.OUTPUT:
      return /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" });
    default:
      return /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" });
  }
};
const getNodePaletteColor = (type) => {
  const colorMap = {
    [NodeType.TRIGGER]: "trigger",
    [NodeType.ACTION]: "action",
    [NodeType.CONDITION]: "condition",
    [NodeType.OUTPUT]: "output",
    [NodeType.ELEMENT]: "trigger"
  };
  const colors = NODE_TYPE_COLORS[colorMap[type]];
  return cn(colors.bg, colors.border);
};
const NODE_TYPES_ORDER = [
  NodeType.TRIGGER,
  NodeType.ACTION,
  NodeType.CONDITION,
  NodeType.OUTPUT
];
const NodePalette = ({
  onNodeDragStart,
  elements = [],
  activeElementIds = /* @__PURE__ */ new Set(),
  onAddElement,
  className
}) => {
  const [nodesExpanded, setNodesExpanded] = useState(true);
  const [elementsExpanded, setElementsExpanded] = useState(true);
  const handleNodeDragStart = (e, nodeType) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("nodeType", nodeType);
    onNodeDragStart?.(e, nodeType);
  };
  const handleElementDragStart = (e, el) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("nodeType", NodeType.ELEMENT);
    e.dataTransfer.setData("elementId", el.id);
    e.dataTransfer.setData("elementName", el.name);
    e.dataTransfer.setData("elementType", el.type);
  };
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col", className), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setNodesExpanded(!nodesExpanded),
        className: "w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors border-b border-border bg-muted/40",
        children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm", children: "Workflow Nodes" }),
          nodesExpanded ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })
        ]
      }
    ),
    nodesExpanded && /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Drag onto the canvas to build your workflow" }),
      NODE_TYPES_ORDER.map((nodeType) => /* @__PURE__ */ jsxs(
        "div",
        {
          draggable: true,
          onDragStart: (e) => handleNodeDragStart(e, nodeType),
          className: cn(
            "p-3 border-2 rounded-lg cursor-move transition-all hover:shadow-md active:opacity-50 select-none",
            getNodePaletteColor(nodeType)
          ),
          style: { transitionDuration: `${ANIMATION_DURATIONS.normal}ms` },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx(NodeIcon, { type: nodeType }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-sm", children: NODE_TYPE_LABELS[nodeType] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: NODE_TYPE_DESCRIPTIONS[nodeType] })
          ]
        },
        nodeType
      ))
    ] }),
    elements.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setElementsExpanded(!elementsExpanded),
          className: "w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors border-t border-b border-border bg-muted/40",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Layers, { className: "h-4 w-4 text-primary" }),
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm", children: "Page Elements" })
            ] }),
            elementsExpanded ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })
          ]
        }
      ),
      elementsExpanded && /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-1.5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Add or drag elements to wire their events to workflow triggers" }),
        elements.map((el) => {
          const isActive = activeElementIds.has(el.id);
          return /* @__PURE__ */ jsxs(
            "div",
            {
              draggable: !isActive,
              onDragStart: (e) => !isActive && handleElementDragStart(e, el),
              className: cn(
                "flex items-center gap-2 p-2 border-2 rounded-lg transition-all select-none",
                isActive ? "border-primary/60 bg-primary/10 cursor-default" : "border-primary/30 bg-primary/5 hover:border-primary/60 hover:bg-primary/10 cursor-move active:opacity-50"
              ),
              style: {
                transitionDuration: `${ANIMATION_DURATIONS.normal}ms`
              },
              children: [
                /* @__PURE__ */ jsx("div", { className: "p-1 rounded bg-primary/10 shrink-0", children: /* @__PURE__ */ jsx(Box, { className: "h-3.5 w-3.5 text-primary" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate leading-tight", children: el.name || "Unnamed" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground truncate", children: el.type })
                ] }),
                isActive ? /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-6 w-6 shrink-0 flex items-center justify-center rounded text-primary",
                    title: "Already on canvas",
                    children: /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" })
                  }
                ) : /* @__PURE__ */ jsx(
                  Button,
                  {
                    size: "icon",
                    variant: "ghost",
                    className: "h-6 w-6 shrink-0 hover:bg-primary/20 hover:text-primary",
                    title: "Add to canvas",
                    onClick: (e) => {
                      e.stopPropagation();
                      onAddElement?.(el);
                    },
                    children: /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" })
                  }
                )
              ]
            },
            el.id
          );
        })
      ] })
    ] })
  ] });
};
const PositionSchema = z$1.object({
  x: z$1.number(),
  y: z$1.number()
});
const BaseNodeDataSchema = z$1.object({
  label: z$1.string().min(1, "Node label is required"),
  description: z$1.string().optional(),
  icon: z$1.string().optional(),
  config: z$1.record(z$1.string(), z$1.unknown()).optional()
});
const ElementNodeDataSchema = BaseNodeDataSchema.extend({
  elementId: z$1.string().optional(),
  elementName: z$1.string().optional(),
  elementType: z$1.string().optional(),
  connectedEvents: z$1.array(z$1.string()).optional()
});
const TriggerNodeSchema = z$1.object({
  id: z$1.string().min(1, "Node id is required"),
  type: z$1.literal("trigger"),
  position: PositionSchema,
  data: BaseNodeDataSchema
});
const ActionNodeSchema = z$1.object({
  id: z$1.string().min(1, "Node id is required"),
  type: z$1.literal("action"),
  position: PositionSchema,
  data: BaseNodeDataSchema
});
const ConditionNodeSchema = z$1.object({
  id: z$1.string().min(1, "Node id is required"),
  type: z$1.literal("condition"),
  position: PositionSchema,
  data: BaseNodeDataSchema
});
const OutputNodeSchema = z$1.object({
  id: z$1.string().min(1, "Node id is required"),
  type: z$1.literal("output"),
  position: PositionSchema,
  data: BaseNodeDataSchema
});
const ElementNodeSchema = z$1.object({
  id: z$1.string().min(1, "Node id is required"),
  type: z$1.literal("element"),
  position: PositionSchema,
  data: ElementNodeDataSchema
});
const WorkflowNodeSchema = z$1.discriminatedUnion("type", [
  TriggerNodeSchema,
  ActionNodeSchema,
  ConditionNodeSchema,
  OutputNodeSchema,
  ElementNodeSchema
]);
const ConnectionSchema = z$1.object({
  id: z$1.string().min(1, "Connection id is required"),
  source: z$1.string().min(1, "Connection source is required"),
  target: z$1.string().min(1, "Connection target is required"),
  sourcePort: z$1.string().optional(),
  targetPort: z$1.string().optional()
});
const WorkflowCanvasSchema = z$1.object({
  nodes: z$1.array(WorkflowNodeSchema),
  connections: z$1.array(ConnectionSchema).optional().default([]),
  metadata: z$1.object({
    name: z$1.string().optional(),
    description: z$1.string().optional()
  }).optional()
}).superRefine((data, ctx) => {
  const workflowNodes = data.nodes.filter((n) => n.type !== "element");
  if (workflowNodes.length > 0) {
    if (!workflowNodes.some((n) => n.type === "trigger")) {
      ctx.addIssue({
        code: z$1.ZodIssueCode.custom,
        message: "Workflow must contain at least one trigger node"
      });
    }
    if (!workflowNodes.some((n) => n.type === "action")) {
      ctx.addIssue({
        code: z$1.ZodIssueCode.custom,
        message: "Workflow must contain at least one action node"
      });
    }
  }
  data.nodes.forEach(
    (node, idx) => {
      if (node.type === "element") return;
      const cfg = node.data?.config;
      if (node.type === "trigger") {
        if (!cfg || typeof cfg.eventType !== "string" || !cfg.eventType.trim()) {
          ctx.addIssue({
            path: ["nodes", idx, "data", "config", "eventType"],
            code: z$1.ZodIssueCode.custom,
            message: "Trigger node must include a non-empty 'eventType' in its config"
          });
        }
      }
      if (node.type === "action") {
        if (!cfg || typeof cfg.actionType !== "string" || !cfg.actionType.trim()) {
          ctx.addIssue({
            path: ["nodes", idx, "data", "config", "actionType"],
            code: z$1.ZodIssueCode.custom,
            message: "Action node must include a non-empty 'actionType' in its config"
          });
        }
      }
      if (node.type === "condition") {
        if (!cfg || typeof cfg.conditionType !== "string" || !cfg.conditionType.trim()) {
          ctx.addIssue({
            path: ["nodes", idx, "data", "config", "conditionType"],
            code: z$1.ZodIssueCode.custom,
            message: "Condition node should include a non-empty 'conditionType' in its config"
          });
        }
      }
    }
  );
});
function validateWorkflowCanvas(data) {
  return WorkflowCanvasSchema.safeParse(data);
}
const initialState = {
  workflow: {
    nodes: [],
    connections: [],
    metadata: {}
  },
  selection: {
    selectedNodeId: void 0,
    selectedConnectionId: void 0
  },
  zoom: 1,
  panX: 0,
  panY: 0
};
const useWorkflowCanvas = create((set, get2) => ({
  ...initialState,
  // Node operations
  addNode: (type, position, data) => {
    const nodeId = v4();
    const newNode = {
      id: nodeId,
      type,
      position,
      data: {
        ...data
      },
      inputs: type !== NodeType.TRIGGER ? { port: `${nodeId}-input` } : void 0,
      outputs: type !== NodeType.OUTPUT ? [{ port: `${nodeId}-output` }] : void 0
    };
    set((state) => ({
      workflow: {
        ...state.workflow,
        nodes: [...state.workflow.nodes, newNode]
      }
    }));
    return nodeId;
  },
  updateNode: (nodeId, updates) => {
    set((state) => ({
      workflow: {
        ...state.workflow,
        nodes: state.workflow.nodes.map(
          (node) => node.id === nodeId ? { ...node, ...updates } : node
        )
      }
    }));
  },
  deleteNode: (nodeId) => {
    set((state) => ({
      workflow: {
        ...state.workflow,
        nodes: state.workflow.nodes.filter((node) => node.id !== nodeId),
        connections: state.workflow.connections.filter(
          (conn) => conn.source !== nodeId && conn.target !== nodeId
        )
      },
      selection: {
        selectedNodeId: void 0,
        selectedConnectionId: void 0
      }
    }));
  },
  getNode: (nodeId) => {
    const state = get2();
    return state.workflow.nodes.find(
      (node) => node.id === nodeId
    );
  },
  // Connection operations
  addConnection: (source, target, sourcePort) => {
    const connectionId = v4();
    const sourceNode = get2().getNode(source);
    const targetNode = get2().getNode(target);
    if (source === target || !sourceNode || !targetNode) {
      return "";
    }
    const newConnection = {
      id: connectionId,
      source,
      target,
      sourcePort: sourcePort ?? `${source}-output`,
      targetPort: `${target}-input`
    };
    set((state) => ({
      workflow: {
        ...state.workflow,
        connections: [...state.workflow.connections, newConnection]
      }
    }));
    return connectionId;
  },
  deleteConnection: (connectionId) => {
    set((state) => ({
      workflow: {
        ...state.workflow,
        connections: state.workflow.connections.filter(
          (conn) => conn.id !== connectionId
        )
      },
      selection: {
        ...state.selection,
        selectedConnectionId: void 0
      }
    }));
  },
  getConnectionsForNode: (nodeId) => {
    const state = get2();
    return state.workflow.connections.filter(
      (conn) => conn.source === nodeId || conn.target === nodeId
    );
  },
  // Selection operations
  selectNode: (nodeId) => {
    set({
      selection: {
        selectedNodeId: nodeId,
        selectedConnectionId: void 0
      }
    });
  },
  selectConnection: (connectionId) => {
    set({
      selection: {
        selectedNodeId: void 0,
        selectedConnectionId: connectionId
      }
    });
  },
  deselectAll: () => {
    set({
      selection: {
        selectedNodeId: void 0,
        selectedConnectionId: void 0
      }
    });
  },
  // Canvas operations
  setZoom: (zoom) => {
    set({ zoom: Math.max(0.5, Math.min(zoom, 3)) });
  },
  setPan: (x, y) => {
    set({ panX: x, panY: y });
  },
  resetView: () => {
    set({
      zoom: 1,
      panX: 0,
      panY: 0
    });
  },
  // Workflow operations
  loadWorkflow: (workflow) => {
    set({
      workflow,
      selection: {
        selectedNodeId: void 0,
        selectedConnectionId: void 0
      }
    });
  },
  getWorkflow: () => {
    return get2().workflow;
  },
  clearWorkflow: () => {
    set({
      workflow: {
        nodes: [],
        connections: [],
        metadata: {}
      },
      selection: {
        selectedNodeId: void 0,
        selectedConnectionId: void 0
      },
      zoom: 1,
      panX: 0,
      panY: 0
    });
  },
  // Batch operations
  deleteNodeWithConnections: (nodeId) => {
    set((state) => ({
      workflow: {
        ...state.workflow,
        nodes: state.workflow.nodes.filter(
          (node) => node.id !== nodeId
        ),
        connections: state.workflow.connections.filter(
          (conn) => conn.source !== nodeId && conn.target !== nodeId
        )
      },
      selection: {
        selectedNodeId: void 0,
        selectedConnectionId: void 0
      }
    }));
  },
  moveNode: (nodeId, position) => {
    set((state) => ({
      workflow: {
        ...state.workflow,
        nodes: state.workflow.nodes.map(
          (node) => node.id === nodeId ? { ...node, position } : node
        )
      }
    }));
  }
}));
function Sheet({ ...props }) {
  return /* @__PURE__ */ jsx(Dialog$1.Root, { "data-slot": "sheet", ...props });
}
function SheetTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(Dialog$1.Trigger, { "data-slot": "sheet-trigger", ...props });
}
function SheetPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(Dialog$1.Portal, { "data-slot": "sheet-portal", ...props });
}
function SheetOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Overlay,
    {
      "data-slot": "sheet-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function SheetContent({
  className,
  children: children2,
  side = "right",
  showCloseButton = true,
  ...props
}) {
  return /* @__PURE__ */ jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxs(
      Dialog$1.Content,
      {
        "data-slot": "sheet-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        ),
        ...props,
        children: [
          children2,
          showCloseButton && /* @__PURE__ */ jsxs(Dialog$1.Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none", children: [
            /* @__PURE__ */ jsx(XIcon, { className: "size-4" }),
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
}
function SheetHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sheet-header",
      className: cn("flex flex-col gap-1.5 p-4", className),
      ...props
    }
  );
}
function SheetTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Title,
    {
      "data-slot": "sheet-title",
      className: cn("text-foreground font-semibold", className),
      ...props
    }
  );
}
function SheetDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Description,
    {
      "data-slot": "sheet-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function Tabs({
  className,
  orientation = "horizontal",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Tabs$1.Root,
    {
      "data-slot": "tabs",
      "data-orientation": orientation,
      orientation,
      className: cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      ),
      ...props
    }
  );
}
const tabsListVariants = cva(
  "rounded-lg p-[3px] group-data-[orientation=horizontal]/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function TabsList({
  className,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Tabs$1.List,
    {
      "data-slot": "tabs-list",
      "data-variant": variant,
      className: cn(tabsListVariants({ variant }), className),
      ...props
    }
  );
}
function TabsTrigger({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Tabs$1.Trigger,
    {
      "data-slot": "tabs-trigger",
      className: cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:text-foreground",
        "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className
      ),
      ...props
    }
  );
}
function TabsContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Tabs$1.Content,
    {
      "data-slot": "tabs-content",
      className: cn("flex-1 outline-none", className),
      ...props
    }
  );
}
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(void 0);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
const ImageFileSchema = z$1.object({
  file: z$1.instanceof(File).refine((file) => file.type.startsWith("image/"), {
    message: "File must be an image"
  }).refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "Image must be less than 5MB"
  }),
  imageName: z$1.string().optional()
});
z$1.object({
  base64: z$1.string().min(1, "Base64 string is required").refine(
    (str) => {
      const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
      return base64Regex.test(str);
    },
    {
      message: "Invalid base64 image format"
    }
  ).refine(
    (str) => {
      const base64Length = str.length - str.indexOf(",") - 1;
      const sizeInBytes = base64Length * 3 / 4;
      return sizeInBytes <= 5 * 1024 * 1024;
    },
    {
      message: "Base64 image must be less than 5MB"
    }
  ),
  imageName: z$1.string().optional()
});
const ImageUploadResponseSchema = z$1.object({
  imageId: z$1.string(),
  imageLink: z$1.string().url(),
  imageName: z$1.string().nullable().optional(),
  createdAt: z$1.coerce.date()
});
const ImageSchema = z$1.object({
  imageId: z$1.string(),
  imageLink: z$1.string().url(),
  imageName: z$1.string().nullable().optional(),
  userId: z$1.string(),
  createdAt: z$1.coerce.date(),
  updatedAt: z$1.coerce.date(),
  deletedAt: z$1.coerce.date().nullable().optional()
});
const ImagesArraySchema = z$1.array(ImageSchema);
const ImageDragDataSchema = z$1.object({
  imageId: z$1.string(),
  imageLink: z$1.string().url(),
  imageName: z$1.string().nullable().optional(),
  type: z$1.literal("image")
});
function Empty({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty",
      className: cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
        className
      ),
      ...props
    }
  );
}
function EmptyHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-header",
      className: cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      ),
      ...props
    }
  );
}
const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function EmptyMedia({
  className,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-icon",
      "data-variant": variant,
      className: cn(emptyMediaVariants({ variant, className })),
      ...props
    }
  );
}
function EmptyTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-title",
      className: cn("text-lg font-medium tracking-tight", className),
      ...props
    }
  );
}
function EmptyDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-description",
      className: cn(
        "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className
      ),
      ...props
    }
  );
}
function EmptyContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-content",
      className: cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
        className
      ),
      ...props
    }
  );
}
const marketplaceItemSchema = z$1.object({
  projectId: z$1.string().min(1, "Please select a project to base this template on"),
  title: z$1.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters"),
  description: z$1.string().min(10, "Description must be at least 10 characters").max(2e3, "Description must not exceed 2000 characters"),
  preview: z$1.string().optional(),
  templateType: z$1.enum(["full-site", "page", "section", "block"]),
  featured: z$1.boolean(),
  pageCount: z$1.number().int().positive().optional(),
  tags: z$1.array(z$1.string()).max(10, "Maximum 10 tags allowed"),
  categoryIds: z$1.array(z$1.string()).optional()
});
const projectSchema = z$1.object({
  name: z$1.string().min(2, "Project name must be at least 2 characters long"),
  subdomain: z$1.string().optional(),
  description: z$1.string().optional(),
  published: z$1.boolean().optional()
});
function CreateProjectDialog({
  children: children2,
  isCreateDialogOpen,
  setIsCreateDialogOpen
}) {
  const queryClient = useQueryClient();
  const createProjectMutation = useMutation({
    mutationFn: async (data) => {
      await createProject({
        data: {
          name: data.name,
          description: data.description ?? ""
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
      setIsCreateDialogOpen(false);
    }
  });
  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      subdomain: "",
      description: "",
      published: false
    }
  });
  const handleSubmit = async (data) => {
    createProjectMutation.mutate(data);
  };
  return /* @__PURE__ */ jsxs(Dialog, { open: isCreateDialogOpen, onOpenChange: setIsCreateDialogOpen, children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: children2 ? children2 : /* @__PURE__ */ jsxs(Button, { className: "mt-4 sm:mt-0", children: [
      /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
      "Create Project"
    ] }) }),
    /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Create New Project" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Set up a new project to start building your next idea." })
      ] }),
      /* @__PURE__ */ jsx(Form, { ...form, children: /* @__PURE__ */ jsxs(
        "form",
        {
          onSubmit: form.handleSubmit(handleSubmit),
          className: "space-y-4",
          children: [
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "name",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { children: "Project Name" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Enter project name", ...field }) }),
                  /* @__PURE__ */ jsx(FormMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "description",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { children: "Description (Optional)" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Brief description", ...field }) }),
                  /* @__PURE__ */ jsx(FormMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "subdomain",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { children: "Subdomain (Optional)" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "my-awesome-site", ...field }) }),
                  /* @__PURE__ */ jsx(FormMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2 pt-4", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  onClick: () => setIsCreateDialogOpen(false),
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsx(Button, { type: "submit", disabled: createProjectMutation.isPending, children: createProjectMutation.isPending ? "Creating..." : "Create Project" })
            ] })
          ]
        }
      ) })
    ] })
  ] });
}
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SidebarContext = React.createContext(null);
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children: children2,
  ...props
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open2) => !open2) : setOpen((open2) => !open2);
  }, [isMobile, setOpen, setOpenMobile]);
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);
  const state = open ? "expanded" : "collapsed";
  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );
  return /* @__PURE__ */ jsx(SidebarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(TooltipProvider, { delayDuration: 0, children: /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-wrapper",
      style: {
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        ...style
      },
      className: cn(
        "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
        className
      ),
      ...props,
      children: children2
    }
  ) }) });
}
function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children: children2,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  if (collapsible === "none") {
    return /* @__PURE__ */ jsx(
      "div",
      {
        "data-slot": "sidebar",
        className: cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        ),
        ...props,
        children: children2
      }
    );
  }
  if (isMobile) {
    return /* @__PURE__ */ jsx(Sheet, { open: openMobile, onOpenChange: setOpenMobile, ...props, children: /* @__PURE__ */ jsxs(
      SheetContent,
      {
        "data-sidebar": "sidebar",
        "data-slot": "sidebar",
        "data-mobile": "true",
        className: "bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden",
        style: {
          "--sidebar-width": SIDEBAR_WIDTH_MOBILE
        },
        side,
        children: [
          /* @__PURE__ */ jsxs(SheetHeader, { className: "sr-only", children: [
            /* @__PURE__ */ jsx(SheetTitle, { children: "Sidebar" }),
            /* @__PURE__ */ jsx(SheetDescription, { children: "Displays the mobile sidebar." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex h-full w-full flex-col", children: children2 })
        ]
      }
    ) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "group peer text-sidebar-foreground hidden md:block",
      "data-state": state,
      "data-collapsible": state === "collapsed" ? collapsible : "",
      "data-variant": variant,
      "data-side": side,
      "data-slot": "sidebar",
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            "data-slot": "sidebar-gap",
            className: cn(
              "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
              "group-data-[collapsible=offcanvas]:w-0",
              "group-data-[side=right]:rotate-180",
              variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "data-slot": "sidebar-container",
            className: cn(
              "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
              side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
              // Adjust the padding for floating and inset variants.
              variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
              className
            ),
            ...props,
            children: /* @__PURE__ */ jsx(
              "div",
              {
                "data-sidebar": "sidebar",
                "data-slot": "sidebar-inner",
                className: "bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm",
                children: children2
              }
            )
          }
        )
      ]
    }
  );
}
function SidebarTrigger({
  className,
  onClick,
  ...props
}) {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsxs(
    Button,
    {
      "data-sidebar": "trigger",
      "data-slot": "sidebar-trigger",
      variant: "ghost",
      size: "icon",
      className: cn("size-7", className),
      onClick: (event) => {
        onClick?.(event);
        toggleSidebar();
      },
      ...props,
      children: [
        /* @__PURE__ */ jsx(PanelLeftIcon, {}),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
}
function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsx(
    "button",
    {
      "data-sidebar": "rail",
      "data-slot": "sidebar-rail",
      "aria-label": "Toggle Sidebar",
      tabIndex: -1,
      onClick: toggleSidebar,
      title: "Toggle Sidebar",
      className: cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      ),
      ...props
    }
  );
}
function SidebarInset({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "main",
    {
      "data-slot": "sidebar-inset",
      className: cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      ),
      ...props
    }
  );
}
function SidebarHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-header",
      "data-sidebar": "header",
      className: cn("flex flex-col gap-2 p-2", className),
      ...props
    }
  );
}
function SidebarFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-footer",
      "data-sidebar": "footer",
      className: cn("flex flex-col gap-2 p-2", className),
      ...props
    }
  );
}
function SidebarContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-content",
      "data-sidebar": "content",
      className: cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      ),
      ...props
    }
  );
}
function SidebarGroup({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-group",
      "data-sidebar": "group",
      className: cn("relative flex w-full min-w-0 flex-col p-2", className),
      ...props
    }
  );
}
function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "div";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "sidebar-group-label",
      "data-sidebar": "group-label",
      className: cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      ),
      ...props
    }
  );
}
function SidebarGroupContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-group-content",
      "data-sidebar": "group-content",
      className: cn("w-full text-sm", className),
      ...props
    }
  );
}
function SidebarMenu({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "ul",
    {
      "data-slot": "sidebar-menu",
      "data-sidebar": "menu",
      className: cn("flex w-full min-w-0 flex-col gap-1", className),
      ...props
    }
  );
}
function SidebarMenuItem({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "li",
    {
      "data-slot": "sidebar-menu-item",
      "data-sidebar": "menu-item",
      className: cn("group/menu-item relative", className),
      ...props
    }
  );
}
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";
  const { isMobile, state } = useSidebar();
  const button = /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "sidebar-menu-button",
      "data-sidebar": "menu-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(sidebarMenuButtonVariants({ variant, size }), className),
      ...props
    }
  );
  if (!tooltip) {
    return button;
  }
  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip
    };
  }
  return /* @__PURE__ */ jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: button }),
    /* @__PURE__ */ jsx(
      TooltipContent,
      {
        side: "right",
        align: "center",
        hidden: state !== "collapsed" || isMobile,
        ...tooltip
      }
    )
  ] });
}
var CollaboratorRole = /* @__PURE__ */ ((CollaboratorRole2) => {
  CollaboratorRole2["OWNER"] = "owner";
  CollaboratorRole2["EDITOR"] = "editor";
  CollaboratorRole2["VIEWER"] = "viewer";
  return CollaboratorRole2;
})(CollaboratorRole || {});
var Permission = /* @__PURE__ */ ((Permission2) => {
  Permission2["PROJECT_VIEW"] = "project:view";
  Permission2["PROJECT_EDIT"] = "project:edit";
  Permission2["PROJECT_DELETE"] = "project:delete";
  Permission2["PROJECT_PUBLISH"] = "project:publish";
  Permission2["PROJECT_SETTINGS"] = "project:settings";
  Permission2["ELEMENT_VIEW"] = "element:view";
  Permission2["ELEMENT_CREATE"] = "element:create";
  Permission2["ELEMENT_EDIT"] = "element:edit";
  Permission2["ELEMENT_DELETE"] = "element:delete";
  Permission2["ELEMENT_REORDER"] = "element:reorder";
  Permission2["PAGE_VIEW"] = "page:view";
  Permission2["PAGE_CREATE"] = "page:create";
  Permission2["PAGE_EDIT"] = "page:edit";
  Permission2["PAGE_DELETE"] = "page:delete";
  Permission2["COLLABORATOR_VIEW"] = "collaborator:view";
  Permission2["COLLABORATOR_INVITE"] = "collaborator:invite";
  Permission2["COLLABORATOR_EDIT"] = "collaborator:edit";
  Permission2["COLLABORATOR_REMOVE"] = "collaborator:remove";
  Permission2["COMMENT_VIEW"] = "comment:view";
  Permission2["COMMENT_CREATE"] = "comment:create";
  Permission2["COMMENT_EDIT_OWN"] = "comment:edit:own";
  Permission2["COMMENT_EDIT_ALL"] = "comment:edit:all";
  Permission2["COMMENT_DELETE_OWN"] = "comment:delete:own";
  Permission2["COMMENT_DELETE_ALL"] = "comment:delete:all";
  Permission2["COMMENT_RESOLVE"] = "comment:resolve";
  Permission2["SNAPSHOT_VIEW"] = "snapshot:view";
  Permission2["SNAPSHOT_CREATE"] = "snapshot:create";
  Permission2["SNAPSHOT_RESTORE"] = "snapshot:restore";
  Permission2["SNAPSHOT_DELETE"] = "snapshot:delete";
  Permission2["EXPORT_CODE"] = "export:code";
  Permission2["EXPORT_TEMPLATE"] = "export:template";
  Permission2["CMS_VIEW"] = "cms:view";
  Permission2["CMS_EDIT"] = "cms:edit";
  Permission2["CMS_PUBLISH"] = "cms:publish";
  return Permission2;
})(Permission || {});
const ROLE_PERMISSIONS = {
  [CollaboratorRole.OWNER]: [
    // Owners have all permissions
    "project:view",
    "project:edit",
    "project:delete",
    "project:publish",
    "project:settings",
    "element:view",
    "element:create",
    "element:edit",
    "element:delete",
    "element:reorder",
    "page:view",
    "page:create",
    "page:edit",
    "page:delete",
    "collaborator:view",
    "collaborator:invite",
    "collaborator:edit",
    "collaborator:remove",
    "comment:view",
    "comment:create",
    "comment:edit:own",
    "comment:edit:all",
    "comment:delete:own",
    "comment:delete:all",
    "comment:resolve",
    "snapshot:view",
    "snapshot:create",
    "snapshot:restore",
    "snapshot:delete",
    "export:code",
    "export:template",
    "cms:view",
    "cms:edit",
    "cms:publish"
    /* CMS_PUBLISH */
  ],
  [CollaboratorRole.EDITOR]: [
    // Editors can modify content but not project settings or collaborators
    "project:view",
    "project:edit",
    "element:view",
    "element:create",
    "element:edit",
    "element:delete",
    "element:reorder",
    "page:view",
    "page:create",
    "page:edit",
    "page:delete",
    "collaborator:view",
    "comment:view",
    "comment:create",
    "comment:edit:own",
    "comment:delete:own",
    "comment:resolve",
    "snapshot:view",
    "snapshot:create",
    "export:code",
    "cms:view",
    "cms:edit"
    /* CMS_EDIT */
  ],
  [CollaboratorRole.VIEWER]: [
    // Viewers can only view content and add comments
    "project:view",
    "element:view",
    "page:view",
    "collaborator:view",
    "comment:view",
    "comment:create",
    "comment:edit:own",
    "comment:delete:own",
    "snapshot:view",
    "cms:view"
    /* CMS_VIEW */
  ]
};
({
  [CollaboratorRole.OWNER]: "Full access to all project features including deletion and team management",
  [CollaboratorRole.EDITOR]: "Can edit project content, pages, and elements but cannot manage team or delete project",
  [CollaboratorRole.VIEWER]: "Read-only access with ability to comment"
});
const config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider      = "prisma-client"\n  output        = "../src/generated"\n  compilerBuild = "fast"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Element {\n  Content        String?                @db.VarChar(2048)\n  Href           String?                @db.VarChar(2048)\n  Id             String                 @id @map("Id")\n  Name           String?                @db.VarChar(255)\n  Order          Int                    @default(0)\n  ParentId       String?\n  Src            String?                @db.VarChar(2048)\n  Styles         Json?\n  TailwindStyles String?\n  Type           String                 @db.VarChar(32)\n  PageId         String?\n  IsLocked       Boolean                @default(false)\n  Settings       Json?\n  Page           Page?                  @relation(fields: [PageId], references: [Id], onDelete: Cascade)\n  Parent         Element?               @relation("ElementChildren", fields: [ParentId], references: [Id], onDelete: Cascade)\n  Elements       Element[]              @relation("ElementChildren")\n  Comments       ElementComment[]\n  EventWorkflows ElementEventWorkflow[]\n\n  @@index([ParentId])\n  @@index([PageId])\n  @@index([Type])\n  @@index([Order])\n  @@index([IsLocked])\n  @@index([PageId, Order])\n  @@index([ParentId, Order])\n  @@index([PageId, Type])\n}\n\nmodel Image {\n  ImageId   String    @id(map: "PK_Images")\n  ImageLink String    @default("") @db.VarChar(2048)\n  ImageName String?   @db.VarChar(255)\n  UserId    String\n  CreatedAt DateTime  @db.Timestamp(6)\n  DeletedAt DateTime? @db.Timestamp(6)\n  UpdatedAt DateTime  @db.Timestamp(6)\n  User      User      @relation(fields: [UserId], references: [Id], onDelete: Cascade, onUpdate: NoAction, map: "FK_Images_Users_UserId")\n\n  @@index([UserId], map: "IX_Images_UserId")\n  @@index([DeletedAt])\n  @@index([UserId, DeletedAt])\n}\n\nmodel Project {\n  Description     String?\n  Id              String           @id(map: "PK_Projects")\n  Name            String           @db.VarChar(255)\n  OwnerId         String\n  Published       Boolean          @default(false)\n  Subdomain       String?          @db.VarChar(63)\n  CreatedAt       DateTime         @db.Timestamp(6)\n  DeletedAt       DateTime?        @db.Timestamp(6)\n  UpdatedAt       DateTime         @db.Timestamp(6)\n  Styles          Json?\n  Header          Json?\n  Collaborators   Collaborator[]\n  EventWorkflows  EventWorkflow[]\n  Invitations     Invitation[]\n  MarketplaceItem MarketplaceItem?\n  Pages           Page[]\n  Owner           User             @relation(fields: [OwnerId], references: [Id], onDelete: Cascade, onUpdate: NoAction, map: "FK_Projects_Users_OwnerId")\n  Snapshots       Snapshot[]\n\n  @@index([OwnerId], map: "IX_Projects_OwnerId")\n  @@index([Published])\n  @@index([Subdomain])\n  @@index([CreatedAt])\n  @@index([DeletedAt])\n  @@index([OwnerId, Published])\n  @@index([OwnerId, DeletedAt, Published])\n}\n\nmodel Page {\n  Id        String    @id @map("Id")\n  Name      String    @db.VarChar(255)\n  Type      String    @db.VarChar(50)\n  Styles    Json\n  ProjectId String\n  CreatedAt DateTime  @db.Timestamp(6)\n  UpdatedAt DateTime  @db.Timestamp(6)\n  DeletedAt DateTime? @db.Timestamp(6)\n  Elements  Element[]\n  Project   Project   @relation(fields: [ProjectId], references: [Id], onDelete: Cascade)\n\n  @@unique([ProjectId, Name])\n  @@index([ProjectId])\n  @@index([Type])\n  @@index([ProjectId, Type])\n}\n\nmodel EventWorkflow {\n  Id                    String                 @id @default(cuid())\n  ProjectId             String\n  Name                  String                 @db.VarChar(255)\n  Description           String?\n  Handlers              Json                   @default("[]")\n  Enabled               Boolean                @default(true)\n  CreatedAt             DateTime               @default(now()) @db.Timestamp(6)\n  UpdatedAt             DateTime               @updatedAt @db.Timestamp(6)\n  CanvasData            Json?\n  ElementEventWorkflows ElementEventWorkflow[] @relation("ElementEventWorkflows")\n  Project               Project                @relation(fields: [ProjectId], references: [Id], onDelete: Cascade)\n\n  @@unique([ProjectId, Name])\n  @@index([ProjectId])\n  @@index([Enabled])\n  @@index([ProjectId, Enabled])\n}\n\nmodel Snapshot {\n  Id        String       @id @map("Id")\n  ProjectId String\n  Elements  Json\n  Timestamp BigInt\n  CreatedAt DateTime     @default(now()) @db.Timestamp(6)\n  Name      String       @db.VarChar(255)\n  Type      SnapshotType\n  Project   Project      @relation(fields: [ProjectId], references: [Id], onDelete: Cascade)\n\n  @@index([ProjectId, Timestamp])\n  @@index([ProjectId, Type])\n  @@index([CreatedAt])\n}\n\nmodel User {\n  CreatedAt        DateTime          @db.Timestamptz(6)\n  Email            String            @unique @db.VarChar(255)\n  FirstName        String?           @db.VarChar(100)\n  Id               String            @id(map: "PK_Users")\n  ImageUrl         String?           @db.VarChar(2048)\n  LastName         String?           @db.VarChar(100)\n  UpdatedAt        DateTime          @db.Timestamptz(6)\n  Collaborators    Collaborator[]\n  Comments         Comment[]\n  CommentReactions CommentReaction[]\n  CustomElements   CustomElement[]\n  ElementComments  ElementComment[]\n  Images           Image[]\n  MarketplaceItems MarketplaceItem[]\n  Notifications    Notification[]\n  Projects         Project[]\n  Subscriptions    Subscription[]\n}\n\nmodel Subscription {\n  Id            String    @id @default(cuid())\n  UserId        String\n  PlanId        String    @db.VarChar(100)\n  BillingPeriod String    @db.VarChar(50)\n  Status        String    @default("pending") @db.VarChar(50)\n  StartDate     DateTime  @default(now())\n  EndDate       DateTime?\n  Amount        Float\n  Currency      String    @default("VND") @db.VarChar(10)\n  CreatedAt     DateTime  @default(now()) @db.Timestamp(6)\n  UpdatedAt     DateTime  @updatedAt @db.Timestamp(6)\n  BankCode      String?   @db.VarChar(50)\n  CardType      String?   @db.VarChar(50)\n  Email         String?   @db.VarChar(255)\n  PayDate       DateTime?\n  TransactionNo String?   @db.VarChar(100)\n  User          User      @relation(fields: [UserId], references: [Id], onDelete: Cascade)\n\n  @@index([UserId])\n  @@index([Status])\n}\n\nmodel ContentType {\n  CreatedAt   DateTime       @default(now())\n  Description String?\n  Id          String         @id @default(cuid())\n  Name        String         @unique @db.VarChar(255)\n  UpdatedAt   DateTime       @updatedAt\n  Fields      ContentField[]\n  Items       ContentItem[]\n}\n\nmodel ContentField {\n  ContentTypeId String\n  Id            String              @id @default(cuid())\n  Name          String              @db.VarChar(255)\n  Required      Boolean             @default(false)\n  Type          String              @db.VarChar(100)\n  ContentType   ContentType         @relation(fields: [ContentTypeId], references: [Id], onDelete: Cascade)\n  Values        ContentFieldValue[]\n\n  @@unique([ContentTypeId, Name])\n}\n\nmodel ContentFieldValue {\n  ContentItemId String\n  FieldId       String\n  Id            String       @id @default(cuid())\n  Value         String?\n  ContentItem   ContentItem  @relation(fields: [ContentItemId], references: [Id], onDelete: Cascade)\n  Field         ContentField @relation(fields: [FieldId], references: [Id], onDelete: Cascade)\n\n  @@unique([ContentItemId, FieldId])\n}\n\nmodel ContentItem {\n  ContentTypeId String\n  CreatedAt     DateTime            @default(now())\n  Id            String              @id @default(cuid())\n  Published     Boolean             @default(false)\n  Slug          String              @unique @db.VarChar(255)\n  Title         String              @db.VarChar(500)\n  UpdatedAt     DateTime            @updatedAt\n  FieldValues   ContentFieldValue[]\n  ContentType   ContentType         @relation(fields: [ContentTypeId], references: [Id], onDelete: Cascade)\n}\n\nmodel MarketplaceItem {\n  Id           String                    @id @default(cuid())\n  Title        String                    @db.VarChar(500)\n  Description  String\n  Preview      String?                   @db.VarChar(2048)\n  TemplateType String                    @default("block") @db.VarChar(50)\n  Featured     Boolean                   @default(false)\n  PageCount    Int?\n  Downloads    Int                       @default(0)\n  Likes        Int                       @default(0)\n  AuthorId     String\n  AuthorName   String                    @db.VarChar(255)\n  Verified     Boolean                   @default(false)\n  CreatedAt    DateTime                  @default(now()) @db.Timestamp(6)\n  UpdatedAt    DateTime                  @updatedAt @db.Timestamp(6)\n  DeletedAt    DateTime?                 @db.Timestamp(6)\n  ProjectId    String?                   @unique\n  Views        Int                       @default(0)\n  Comments     Comment[]\n  Author       User                      @relation(fields: [AuthorId], references: [Id], onDelete: Cascade)\n  Project      Project?                  @relation(fields: [ProjectId], references: [Id])\n  Categories   MarketplaceItemCategory[]\n  Tags         MarketplaceItemTag[]\n\n  @@index([AuthorId])\n  @@index([TemplateType])\n  @@index([Featured])\n  @@index([ProjectId])\n  @@index([CreatedAt])\n  @@index([Downloads])\n  @@index([Likes])\n  @@index([Views])\n  @@index([Featured, TemplateType])\n  @@index([TemplateType, Downloads])\n}\n\nmodel Category {\n  Id    String                    @id @default(cuid())\n  Name  String                    @unique @db.VarChar(100)\n  Items MarketplaceItemCategory[]\n}\n\nmodel Tag {\n  Id    String               @id @default(cuid())\n  Name  String               @unique @db.VarChar(100)\n  Items MarketplaceItemTag[]\n}\n\nmodel MarketplaceItemTag {\n  ItemId String\n  TagId  String\n  Item   MarketplaceItem @relation(fields: [ItemId], references: [Id], onDelete: Cascade)\n  Tag    Tag             @relation(fields: [TagId], references: [Id], onDelete: Cascade)\n\n  @@id([ItemId, TagId])\n  @@index([TagId])\n}\n\nmodel MarketplaceItemCategory {\n  ItemId     String\n  CategoryId String\n  Category   Category        @relation(fields: [CategoryId], references: [Id], onDelete: Cascade)\n  Item       MarketplaceItem @relation(fields: [ItemId], references: [Id], onDelete: Cascade)\n\n  @@id([ItemId, CategoryId])\n  @@index([CategoryId])\n}\n\nmodel CustomElementType {\n  Id             String          @id @default(cuid())\n  Name           String          @unique @db.VarChar(255)\n  Description    String?\n  Category       String?         @db.VarChar(100)\n  Icon           String?         @db.VarChar(255)\n  CreatedAt      DateTime        @default(now()) @db.Timestamp(6)\n  UpdatedAt      DateTime        @updatedAt @db.Timestamp(6)\n  CustomElements CustomElement[]\n}\n\nmodel CustomElement {\n  Id                String             @id @map("Id")\n  Name              String             @db.VarChar(255)\n  TypeId            String?\n  Description       String?\n  Category          String?            @db.VarChar(100)\n  Icon              String?            @db.VarChar(255)\n  Thumbnail         String?            @db.VarChar(255)\n  Structure         Json\n  DefaultProps      Json?\n  Tags              String?            @db.VarChar(500)\n  UserId            String\n  IsPublic          Boolean            @default(false)\n  Version           String             @default("1.0.0") @db.VarChar(20)\n  CreatedAt         DateTime           @default(now()) @db.Timestamp(6)\n  UpdatedAt         DateTime           @default(now()) @updatedAt @db.Timestamp(6)\n  CustomElementType CustomElementType? @relation(fields: [TypeId], references: [Id])\n  User              User               @relation(fields: [UserId], references: [Id], onDelete: Cascade)\n\n  @@index([UserId])\n  @@index([TypeId])\n}\n\nmodel Invitation {\n  Id         String           @id @default(cuid())\n  Email      String           @db.VarChar(255)\n  ProjectId  String\n  Role       CollaboratorRole @default(editor)\n  Token      String           @unique @db.VarChar(255)\n  ExpiresAt  DateTime\n  CreatedAt  DateTime         @default(now())\n  AcceptedAt DateTime?\n  Status     String           @default("pending") @db.VarChar(50)\n  Project    Project          @relation(fields: [ProjectId], references: [Id], onDelete: Cascade)\n\n  @@index([ProjectId])\n  @@index([Token])\n  @@index([Status])\n  @@index([Email])\n  @@index([ExpiresAt])\n  @@index([ProjectId, Status])\n}\n\nmodel Collaborator {\n  Id        String           @id @default(cuid())\n  UserId    String\n  ProjectId String\n  Role      CollaboratorRole @default(editor)\n  CreatedAt DateTime         @default(now()) @db.Timestamp(6)\n  UpdatedAt DateTime         @updatedAt @db.Timestamp(6)\n  Project   Project          @relation(fields: [ProjectId], references: [Id], onDelete: Cascade)\n  User      User             @relation(fields: [UserId], references: [Id], onDelete: Cascade)\n\n  @@unique([UserId, ProjectId])\n  @@index([UserId])\n  @@index([ProjectId])\n}\n\nmodel Comment {\n  Id        String            @id @default(cuid())\n  Content   String\n  AuthorId  String\n  ItemId    String\n  ParentId  String?\n  Status    String            @default("published") @db.VarChar(50)\n  Edited    Boolean           @default(false)\n  CreatedAt DateTime          @default(now()) @db.Timestamp(6)\n  UpdatedAt DateTime          @updatedAt @db.Timestamp(6)\n  DeletedAt DateTime?         @db.Timestamp(6)\n  Author    User              @relation(fields: [AuthorId], references: [Id], onDelete: Cascade)\n  Item      MarketplaceItem   @relation(fields: [ItemId], references: [Id], onDelete: Cascade)\n  Parent    Comment?          @relation("CommentReplies", fields: [ParentId], references: [Id], onDelete: Cascade)\n  Replies   Comment[]         @relation("CommentReplies")\n  Reactions CommentReaction[]\n\n  @@index([AuthorId])\n  @@index([ItemId])\n  @@index([ParentId])\n  @@index([Status])\n  @@index([ItemId, Status])\n  @@index([ItemId, ParentId])\n  @@index([CreatedAt])\n}\n\nmodel CommentReaction {\n  Id        String   @id @default(cuid())\n  CommentId String\n  UserId    String\n  Type      String   @db.VarChar(50)\n  CreatedAt DateTime @default(now()) @db.Timestamp(6)\n  Comment   Comment  @relation(fields: [CommentId], references: [Id], onDelete: Cascade)\n  User      User     @relation(fields: [UserId], references: [Id], onDelete: Cascade)\n\n  @@index([CommentId])\n  @@index([UserId])\n}\n\nmodel ElementComment {\n  Id        String    @id @map("Id")\n  Content   String\n  AuthorId  String\n  ElementId String\n  CreatedAt DateTime  @default(now()) @db.Timestamp(6)\n  UpdatedAt DateTime  @updatedAt @db.Timestamp(6)\n  DeletedAt DateTime? @db.Timestamp(6)\n  Resolved  Boolean   @default(false)\n  Author    User      @relation(fields: [AuthorId], references: [Id], onDelete: Cascade)\n  Element   Element   @relation(fields: [ElementId], references: [Id], onDelete: Cascade)\n\n  @@index([AuthorId])\n  @@index([ElementId])\n  @@index([Resolved])\n  @@index([ElementId, Resolved])\n}\n\nmodel ElementEventWorkflow {\n  Id         String        @id @default(cuid())\n  ElementId  String\n  WorkflowId String\n  EventName  String        @db.VarChar(100)\n  CreatedAt  DateTime      @default(now()) @db.Timestamp(6)\n  Element    Element       @relation(fields: [ElementId], references: [Id], onDelete: Cascade)\n  Workflow   EventWorkflow @relation("ElementEventWorkflows", fields: [WorkflowId], references: [Id], onDelete: Cascade)\n\n  @@unique([ElementId, WorkflowId, EventName])\n  @@index([ElementId])\n  @@index([WorkflowId])\n  @@index([EventName])\n}\n\nmodel Notification {\n  Id          String   @id @default(cuid())\n  UserId      String\n  Type        String   @db.VarChar(100)\n  Title       String   @db.VarChar(500)\n  Description String\n  Read        Boolean  @default(false)\n  CreatedAt   DateTime @default(now()) @db.Timestamp(6)\n  UpdatedAt   DateTime @updatedAt @db.Timestamp(6)\n  User        User     @relation(fields: [UserId], references: [Id], onDelete: Cascade)\n\n  @@index([UserId])\n  @@index([Read])\n  @@index([CreatedAt])\n}\n\nenum SnapshotType {\n  working\n  version\n}\n\nenum CollaboratorRole {\n  owner\n  editor\n  viewer\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Element":{"fields":[{"name":"Content","kind":"scalar","type":"String"},{"name":"Href","kind":"scalar","type":"String"},{"name":"Id","kind":"scalar","type":"String","dbName":"Id"},{"name":"Name","kind":"scalar","type":"String"},{"name":"Order","kind":"scalar","type":"Int"},{"name":"ParentId","kind":"scalar","type":"String"},{"name":"Src","kind":"scalar","type":"String"},{"name":"Styles","kind":"scalar","type":"Json"},{"name":"TailwindStyles","kind":"scalar","type":"String"},{"name":"Type","kind":"scalar","type":"String"},{"name":"PageId","kind":"scalar","type":"String"},{"name":"IsLocked","kind":"scalar","type":"Boolean"},{"name":"Settings","kind":"scalar","type":"Json"},{"name":"Page","kind":"object","type":"Page","relationName":"ElementToPage"},{"name":"Parent","kind":"object","type":"Element","relationName":"ElementChildren"},{"name":"Elements","kind":"object","type":"Element","relationName":"ElementChildren"},{"name":"Comments","kind":"object","type":"ElementComment","relationName":"ElementToElementComment"},{"name":"EventWorkflows","kind":"object","type":"ElementEventWorkflow","relationName":"ElementToElementEventWorkflow"}],"dbName":null},"Image":{"fields":[{"name":"ImageId","kind":"scalar","type":"String"},{"name":"ImageLink","kind":"scalar","type":"String"},{"name":"ImageName","kind":"scalar","type":"String"},{"name":"UserId","kind":"scalar","type":"String"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"DeletedAt","kind":"scalar","type":"DateTime"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"User","kind":"object","type":"User","relationName":"ImageToUser"}],"dbName":null},"Project":{"fields":[{"name":"Description","kind":"scalar","type":"String"},{"name":"Id","kind":"scalar","type":"String"},{"name":"Name","kind":"scalar","type":"String"},{"name":"OwnerId","kind":"scalar","type":"String"},{"name":"Published","kind":"scalar","type":"Boolean"},{"name":"Subdomain","kind":"scalar","type":"String"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"DeletedAt","kind":"scalar","type":"DateTime"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"Styles","kind":"scalar","type":"Json"},{"name":"Header","kind":"scalar","type":"Json"},{"name":"Collaborators","kind":"object","type":"Collaborator","relationName":"CollaboratorToProject"},{"name":"EventWorkflows","kind":"object","type":"EventWorkflow","relationName":"EventWorkflowToProject"},{"name":"Invitations","kind":"object","type":"Invitation","relationName":"InvitationToProject"},{"name":"MarketplaceItem","kind":"object","type":"MarketplaceItem","relationName":"MarketplaceItemToProject"},{"name":"Pages","kind":"object","type":"Page","relationName":"PageToProject"},{"name":"Owner","kind":"object","type":"User","relationName":"ProjectToUser"},{"name":"Snapshots","kind":"object","type":"Snapshot","relationName":"ProjectToSnapshot"}],"dbName":null},"Page":{"fields":[{"name":"Id","kind":"scalar","type":"String","dbName":"Id"},{"name":"Name","kind":"scalar","type":"String"},{"name":"Type","kind":"scalar","type":"String"},{"name":"Styles","kind":"scalar","type":"Json"},{"name":"ProjectId","kind":"scalar","type":"String"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"DeletedAt","kind":"scalar","type":"DateTime"},{"name":"Elements","kind":"object","type":"Element","relationName":"ElementToPage"},{"name":"Project","kind":"object","type":"Project","relationName":"PageToProject"}],"dbName":null},"EventWorkflow":{"fields":[{"name":"Id","kind":"scalar","type":"String"},{"name":"ProjectId","kind":"scalar","type":"String"},{"name":"Name","kind":"scalar","type":"String"},{"name":"Description","kind":"scalar","type":"String"},{"name":"Handlers","kind":"scalar","type":"Json"},{"name":"Enabled","kind":"scalar","type":"Boolean"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"CanvasData","kind":"scalar","type":"Json"},{"name":"ElementEventWorkflows","kind":"object","type":"ElementEventWorkflow","relationName":"ElementEventWorkflows"},{"name":"Project","kind":"object","type":"Project","relationName":"EventWorkflowToProject"}],"dbName":null},"Snapshot":{"fields":[{"name":"Id","kind":"scalar","type":"String","dbName":"Id"},{"name":"ProjectId","kind":"scalar","type":"String"},{"name":"Elements","kind":"scalar","type":"Json"},{"name":"Timestamp","kind":"scalar","type":"BigInt"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"Name","kind":"scalar","type":"String"},{"name":"Type","kind":"enum","type":"SnapshotType"},{"name":"Project","kind":"object","type":"Project","relationName":"ProjectToSnapshot"}],"dbName":null},"User":{"fields":[{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"Email","kind":"scalar","type":"String"},{"name":"FirstName","kind":"scalar","type":"String"},{"name":"Id","kind":"scalar","type":"String"},{"name":"ImageUrl","kind":"scalar","type":"String"},{"name":"LastName","kind":"scalar","type":"String"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"Collaborators","kind":"object","type":"Collaborator","relationName":"CollaboratorToUser"},{"name":"Comments","kind":"object","type":"Comment","relationName":"CommentToUser"},{"name":"CommentReactions","kind":"object","type":"CommentReaction","relationName":"CommentReactionToUser"},{"name":"CustomElements","kind":"object","type":"CustomElement","relationName":"CustomElementToUser"},{"name":"ElementComments","kind":"object","type":"ElementComment","relationName":"ElementCommentToUser"},{"name":"Images","kind":"object","type":"Image","relationName":"ImageToUser"},{"name":"MarketplaceItems","kind":"object","type":"MarketplaceItem","relationName":"MarketplaceItemToUser"},{"name":"Notifications","kind":"object","type":"Notification","relationName":"NotificationToUser"},{"name":"Projects","kind":"object","type":"Project","relationName":"ProjectToUser"},{"name":"Subscriptions","kind":"object","type":"Subscription","relationName":"SubscriptionToUser"}],"dbName":null},"Subscription":{"fields":[{"name":"Id","kind":"scalar","type":"String"},{"name":"UserId","kind":"scalar","type":"String"},{"name":"PlanId","kind":"scalar","type":"String"},{"name":"BillingPeriod","kind":"scalar","type":"String"},{"name":"Status","kind":"scalar","type":"String"},{"name":"StartDate","kind":"scalar","type":"DateTime"},{"name":"EndDate","kind":"scalar","type":"DateTime"},{"name":"Amount","kind":"scalar","type":"Float"},{"name":"Currency","kind":"scalar","type":"String"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"BankCode","kind":"scalar","type":"String"},{"name":"CardType","kind":"scalar","type":"String"},{"name":"Email","kind":"scalar","type":"String"},{"name":"PayDate","kind":"scalar","type":"DateTime"},{"name":"TransactionNo","kind":"scalar","type":"String"},{"name":"User","kind":"object","type":"User","relationName":"SubscriptionToUser"}],"dbName":null},"ContentType":{"fields":[{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"Description","kind":"scalar","type":"String"},{"name":"Id","kind":"scalar","type":"String"},{"name":"Name","kind":"scalar","type":"String"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"Fields","kind":"object","type":"ContentField","relationName":"ContentFieldToContentType"},{"name":"Items","kind":"object","type":"ContentItem","relationName":"ContentItemToContentType"}],"dbName":null},"ContentField":{"fields":[{"name":"ContentTypeId","kind":"scalar","type":"String"},{"name":"Id","kind":"scalar","type":"String"},{"name":"Name","kind":"scalar","type":"String"},{"name":"Required","kind":"scalar","type":"Boolean"},{"name":"Type","kind":"scalar","type":"String"},{"name":"ContentType","kind":"object","type":"ContentType","relationName":"ContentFieldToContentType"},{"name":"Values","kind":"object","type":"ContentFieldValue","relationName":"ContentFieldToContentFieldValue"}],"dbName":null},"ContentFieldValue":{"fields":[{"name":"ContentItemId","kind":"scalar","type":"String"},{"name":"FieldId","kind":"scalar","type":"String"},{"name":"Id","kind":"scalar","type":"String"},{"name":"Value","kind":"scalar","type":"String"},{"name":"ContentItem","kind":"object","type":"ContentItem","relationName":"ContentFieldValueToContentItem"},{"name":"Field","kind":"object","type":"ContentField","relationName":"ContentFieldToContentFieldValue"}],"dbName":null},"ContentItem":{"fields":[{"name":"ContentTypeId","kind":"scalar","type":"String"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"Id","kind":"scalar","type":"String"},{"name":"Published","kind":"scalar","type":"Boolean"},{"name":"Slug","kind":"scalar","type":"String"},{"name":"Title","kind":"scalar","type":"String"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"FieldValues","kind":"object","type":"ContentFieldValue","relationName":"ContentFieldValueToContentItem"},{"name":"ContentType","kind":"object","type":"ContentType","relationName":"ContentItemToContentType"}],"dbName":null},"MarketplaceItem":{"fields":[{"name":"Id","kind":"scalar","type":"String"},{"name":"Title","kind":"scalar","type":"String"},{"name":"Description","kind":"scalar","type":"String"},{"name":"Preview","kind":"scalar","type":"String"},{"name":"TemplateType","kind":"scalar","type":"String"},{"name":"Featured","kind":"scalar","type":"Boolean"},{"name":"PageCount","kind":"scalar","type":"Int"},{"name":"Downloads","kind":"scalar","type":"Int"},{"name":"Likes","kind":"scalar","type":"Int"},{"name":"AuthorId","kind":"scalar","type":"String"},{"name":"AuthorName","kind":"scalar","type":"String"},{"name":"Verified","kind":"scalar","type":"Boolean"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"DeletedAt","kind":"scalar","type":"DateTime"},{"name":"ProjectId","kind":"scalar","type":"String"},{"name":"Views","kind":"scalar","type":"Int"},{"name":"Comments","kind":"object","type":"Comment","relationName":"CommentToMarketplaceItem"},{"name":"Author","kind":"object","type":"User","relationName":"MarketplaceItemToUser"},{"name":"Project","kind":"object","type":"Project","relationName":"MarketplaceItemToProject"},{"name":"Categories","kind":"object","type":"MarketplaceItemCategory","relationName":"MarketplaceItemToMarketplaceItemCategory"},{"name":"Tags","kind":"object","type":"MarketplaceItemTag","relationName":"MarketplaceItemToMarketplaceItemTag"}],"dbName":null},"Category":{"fields":[{"name":"Id","kind":"scalar","type":"String"},{"name":"Name","kind":"scalar","type":"String"},{"name":"Items","kind":"object","type":"MarketplaceItemCategory","relationName":"CategoryToMarketplaceItemCategory"}],"dbName":null},"Tag":{"fields":[{"name":"Id","kind":"scalar","type":"String"},{"name":"Name","kind":"scalar","type":"String"},{"name":"Items","kind":"object","type":"MarketplaceItemTag","relationName":"MarketplaceItemTagToTag"}],"dbName":null},"MarketplaceItemTag":{"fields":[{"name":"ItemId","kind":"scalar","type":"String"},{"name":"TagId","kind":"scalar","type":"String"},{"name":"Item","kind":"object","type":"MarketplaceItem","relationName":"MarketplaceItemToMarketplaceItemTag"},{"name":"Tag","kind":"object","type":"Tag","relationName":"MarketplaceItemTagToTag"}],"dbName":null},"MarketplaceItemCategory":{"fields":[{"name":"ItemId","kind":"scalar","type":"String"},{"name":"CategoryId","kind":"scalar","type":"String"},{"name":"Category","kind":"object","type":"Category","relationName":"CategoryToMarketplaceItemCategory"},{"name":"Item","kind":"object","type":"MarketplaceItem","relationName":"MarketplaceItemToMarketplaceItemCategory"}],"dbName":null},"CustomElementType":{"fields":[{"name":"Id","kind":"scalar","type":"String"},{"name":"Name","kind":"scalar","type":"String"},{"name":"Description","kind":"scalar","type":"String"},{"name":"Category","kind":"scalar","type":"String"},{"name":"Icon","kind":"scalar","type":"String"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"CustomElements","kind":"object","type":"CustomElement","relationName":"CustomElementToCustomElementType"}],"dbName":null},"CustomElement":{"fields":[{"name":"Id","kind":"scalar","type":"String","dbName":"Id"},{"name":"Name","kind":"scalar","type":"String"},{"name":"TypeId","kind":"scalar","type":"String"},{"name":"Description","kind":"scalar","type":"String"},{"name":"Category","kind":"scalar","type":"String"},{"name":"Icon","kind":"scalar","type":"String"},{"name":"Thumbnail","kind":"scalar","type":"String"},{"name":"Structure","kind":"scalar","type":"Json"},{"name":"DefaultProps","kind":"scalar","type":"Json"},{"name":"Tags","kind":"scalar","type":"String"},{"name":"UserId","kind":"scalar","type":"String"},{"name":"IsPublic","kind":"scalar","type":"Boolean"},{"name":"Version","kind":"scalar","type":"String"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"CustomElementType","kind":"object","type":"CustomElementType","relationName":"CustomElementToCustomElementType"},{"name":"User","kind":"object","type":"User","relationName":"CustomElementToUser"}],"dbName":null},"Invitation":{"fields":[{"name":"Id","kind":"scalar","type":"String"},{"name":"Email","kind":"scalar","type":"String"},{"name":"ProjectId","kind":"scalar","type":"String"},{"name":"Role","kind":"enum","type":"CollaboratorRole"},{"name":"Token","kind":"scalar","type":"String"},{"name":"ExpiresAt","kind":"scalar","type":"DateTime"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"AcceptedAt","kind":"scalar","type":"DateTime"},{"name":"Status","kind":"scalar","type":"String"},{"name":"Project","kind":"object","type":"Project","relationName":"InvitationToProject"}],"dbName":null},"Collaborator":{"fields":[{"name":"Id","kind":"scalar","type":"String"},{"name":"UserId","kind":"scalar","type":"String"},{"name":"ProjectId","kind":"scalar","type":"String"},{"name":"Role","kind":"enum","type":"CollaboratorRole"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"Project","kind":"object","type":"Project","relationName":"CollaboratorToProject"},{"name":"User","kind":"object","type":"User","relationName":"CollaboratorToUser"}],"dbName":null},"Comment":{"fields":[{"name":"Id","kind":"scalar","type":"String"},{"name":"Content","kind":"scalar","type":"String"},{"name":"AuthorId","kind":"scalar","type":"String"},{"name":"ItemId","kind":"scalar","type":"String"},{"name":"ParentId","kind":"scalar","type":"String"},{"name":"Status","kind":"scalar","type":"String"},{"name":"Edited","kind":"scalar","type":"Boolean"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"DeletedAt","kind":"scalar","type":"DateTime"},{"name":"Author","kind":"object","type":"User","relationName":"CommentToUser"},{"name":"Item","kind":"object","type":"MarketplaceItem","relationName":"CommentToMarketplaceItem"},{"name":"Parent","kind":"object","type":"Comment","relationName":"CommentReplies"},{"name":"Replies","kind":"object","type":"Comment","relationName":"CommentReplies"},{"name":"Reactions","kind":"object","type":"CommentReaction","relationName":"CommentToCommentReaction"}],"dbName":null},"CommentReaction":{"fields":[{"name":"Id","kind":"scalar","type":"String"},{"name":"CommentId","kind":"scalar","type":"String"},{"name":"UserId","kind":"scalar","type":"String"},{"name":"Type","kind":"scalar","type":"String"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"Comment","kind":"object","type":"Comment","relationName":"CommentToCommentReaction"},{"name":"User","kind":"object","type":"User","relationName":"CommentReactionToUser"}],"dbName":null},"ElementComment":{"fields":[{"name":"Id","kind":"scalar","type":"String","dbName":"Id"},{"name":"Content","kind":"scalar","type":"String"},{"name":"AuthorId","kind":"scalar","type":"String"},{"name":"ElementId","kind":"scalar","type":"String"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"DeletedAt","kind":"scalar","type":"DateTime"},{"name":"Resolved","kind":"scalar","type":"Boolean"},{"name":"Author","kind":"object","type":"User","relationName":"ElementCommentToUser"},{"name":"Element","kind":"object","type":"Element","relationName":"ElementToElementComment"}],"dbName":null},"ElementEventWorkflow":{"fields":[{"name":"Id","kind":"scalar","type":"String"},{"name":"ElementId","kind":"scalar","type":"String"},{"name":"WorkflowId","kind":"scalar","type":"String"},{"name":"EventName","kind":"scalar","type":"String"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"Element","kind":"object","type":"Element","relationName":"ElementToElementEventWorkflow"},{"name":"Workflow","kind":"object","type":"EventWorkflow","relationName":"ElementEventWorkflows"}],"dbName":null},"Notification":{"fields":[{"name":"Id","kind":"scalar","type":"String"},{"name":"UserId","kind":"scalar","type":"String"},{"name":"Type","kind":"scalar","type":"String"},{"name":"Title","kind":"scalar","type":"String"},{"name":"Description","kind":"scalar","type":"String"},{"name":"Read","kind":"scalar","type":"Boolean"},{"name":"CreatedAt","kind":"scalar","type":"DateTime"},{"name":"UpdatedAt","kind":"scalar","type":"DateTime"},{"name":"User","kind":"object","type":"User","relationName":"NotificationToUser"}],"dbName":null}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("node:buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}
runtime.Extensions.getExtensionContext;
({
  DbNull: runtime.NullTypes.DbNull,
  JsonNull: runtime.NullTypes.JsonNull,
  AnyNull: runtime.NullTypes.AnyNull
});
runtime.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
runtime.Extensions.defineExtension;
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
const PrismaClient = getPrismaClientClass();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = globalThis.prisma || new PrismaClient({ adapter });
export {
  Form as $,
  SidebarGroupContent as A,
  Button as B,
  CollaboratorRole as C,
  CreateProjectDialog as D,
  SidebarFooter as E,
  Dialog as F,
  DialogContent as G,
  DialogHeader as H,
  Input as I,
  DialogTitle as J,
  DialogDescription as K,
  Label as L,
  DialogFooter as M,
  useUserProjects as N,
  onMutationError as O,
  PrismaClient as P,
  QUERY_CONFIG as Q,
  ROLE_PERMISSIONS as R,
  SidebarProvider as S,
  Tabs as T,
  Empty as U,
  EmptyHeader as V,
  EmptyMedia as W,
  EmptyTitle as X,
  EmptyDescription as Y,
  EmptyContent as Z,
  marketplaceItemSchema as _,
  computeTailwindFromStyles as a,
  FormField as a0,
  FormItem as a1,
  FormLabel as a2,
  FormControl as a3,
  FormMessage as a4,
  FormDescription as a5,
  useDeleteProject as a6,
  usePublishProject as a7,
  useProjectStore as a8,
  showSuccessToast as a9,
  ImagesArraySchema as aA,
  ImageFileSchema as aB,
  ImageUploadResponseSchema as aC,
  useImageStore as aD,
  ImageDragDataSchema as aE,
  CreateEventWorkflowSchema as aF,
  useWorkflowCanvas as aG,
  ANIMATION_DURATIONS as aH,
  NodeType as aI,
  getNodeTypeColor as aJ,
  WORKFLOW_EVENT_TYPES as aK,
  validateCreateConnection as aL,
  getFirstError as aM,
  CreateElementEventWorkflowSchema as aN,
  validateDisconnectConnection as aO,
  mapWorkflowNodeToReactFlow as aP,
  CONNECTION_CONFIG as aQ,
  VALIDATION_ERRORS as aR,
  createReactFlowNode as aS,
  NODE_TYPE_LABELS as aT,
  validateWorkflowCanvas as aU,
  NodePalette as aV,
  DialogClose as aW,
  useMouseStore as aa,
  DialogTrigger as ab,
  useEventModeStore as ac,
  usePageStore as ad,
  TooltipProvider as ae,
  Tooltip as af,
  TooltipTrigger as ag,
  TooltipContent as ah,
  useElementCommentStore as ai,
  onMutationSuccess as aj,
  useProjectPages as ak,
  useProject as al,
  showErrorToast as am,
  customComps as an,
  PERMISSION_ERRORS as ao,
  ElementStore as ap,
  ElementTreeHelper as aq,
  useElementStore as ar,
  elementHolders as as,
  useSidebar as at,
  useSelectionStore as au,
  SelectionStore as av,
  getErrorMessage as aw,
  elementEventWorkflowKeys as ax,
  useElementEventWorkflowStore as ay,
  getComponentFactory as az,
  Permission as b,
  createSsrRpc as c,
  Badge as d,
  TabsList as e,
  TabsTrigger as f,
  TabsContent as g,
  cn as h,
  elementHelper as i,
  SidebarTrigger as j,
  Sheet as k,
  SheetTrigger as l,
  SheetContent as m,
  SheetHeader as n,
  SheetTitle as o,
  prisma as p,
  SidebarInset as q,
  Sidebar as r,
  SidebarHeader as s,
  SidebarMenu as t,
  SidebarMenuItem as u,
  SidebarMenuButton as v,
  SidebarRail as w,
  SidebarContent as x,
  SidebarGroup as y,
  SidebarGroupLabel as z
};
