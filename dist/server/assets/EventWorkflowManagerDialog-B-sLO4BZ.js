import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { B as Button, I as Input, f as Badge, ai as TooltipProvider, aj as Tooltip, ak as TooltipTrigger, al as TooltipContent, aK as CreateEventWorkflowSchema, a3 as Form, a4 as FormField, a5 as FormItem, a6 as FormLabel, a7 as FormControl, a9 as FormDescription, a8 as FormMessage, aL as useWorkflowCanvas, aM as ANIMATION_DURATIONS, j as cn, aN as NodeType, aO as getNodeTypeColor, aP as WORKFLOW_EVENT_TYPES, ad as showSuccessToast, aq as showErrorToast, aA as getErrorMessage, aB as elementEventWorkflowKeys, aC as useElementEventWorkflowStore, aQ as validateCreateConnection, aR as getFirstError, aS as CreateElementEventWorkflowSchema, aT as validateDisconnectConnection, ay as useSelectionStore, aU as mapWorkflowNodeToReactFlow, aV as CONNECTION_CONFIG, aW as VALIDATION_ERRORS, aX as createReactFlowNode, aY as NODE_TYPE_LABELS, J as Dialog, K as DialogContent, L as DialogHeader, M as DialogTitle, O as Label, aZ as validateWorkflowCanvas, au as ElementTreeHelper, a_ as NodePalette } from "./prisma-Cq49YOYM.js";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import React__default, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { y as useEventWorkflowActions, z as useCreateEventWorkflow, A as elementEventWorkflowService, G as useUpdateEventWorkflow, H as transformWorkflowToEventHandlers, a as useElements, J as useEventWorkflow } from "./SelectComponent-t_K3xf5i.js";
import { S as ScrollArea } from "./scroll-area-BYa8i-Jn.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./card-LOcGasZb.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-DXOCWecy.js";
import { Loader2, Plus, AlertCircle, Info, Search, Workflow, Zap, Edit2, Trash2, Settings, CheckCircle, GitBranch, ArrowRight, Layers, RotateCcw, Grid3x3, Save, ChevronRight, List } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { T as Textarea } from "./textarea-BDhK7YnG.js";
import ReactFlow, { Handle, Position, useNodesState, useEdgesState, useReactFlow, Background, Controls, MiniMap, ReactFlowProvider } from "reactflow";
import "next-themes";
import "socket.io-client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPjHyyea.js";
import clsx from "clsx";
import { S as Separator } from "./separator-4Scmx0hq.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "uuid";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
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
import "@tanstack/react-router";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "isomorphic-dompurify";
import "framer-motion";
import "./carousel-DZpoDDoq.js";
import "embla-carousel-react";
import "zustand/react/shallow";
import "@clerk/react";
import "@radix-ui/react-context-menu";
import "./checkbox-BX2VzNwa.js";
const WorkflowList = ({
  projectId,
  onEdit,
  onCreate
}) => {
  const { workflows, isLoading, error, isDeleting, deleteWorkflow } = useEventWorkflowActions(projectId);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const workflowsArray = Array.isArray(workflows) ? workflows : [];
  const filteredWorkflows = workflowsArray.filter(
    (workflow) => workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleDelete = async (workflowId) => {
    try {
      await deleteWorkflow(workflowId);
      toast.success("Workflow deleted successfully");
      setDeleteConfirmId(null);
    } catch (error2) {
      console.error("Failed to delete workflow:", error2);
      toast.error("Failed to delete workflow");
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Event Workflows" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Create visual workflows to handle element events" })
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: onCreate, className: "gap-2", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          "New Workflow"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "border-destructive bg-destructive/10 dark:border-destructive dark:bg-destructive/20", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5 text-destructive shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-destructive", children: "Error Loading Workflows" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive/80", children: error || "Failed to load workflows" })
        ] })
      ] }) }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Event Workflows" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Create visual workflows to handle element events" })
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: onCreate, className: "gap-2", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        "New Workflow"
      ] })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "border-primary bg-primary/10 dark:border-primary dark:bg-primary/20", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx(Info, { className: "h-5 w-5 text-primary shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-primary", children: "How it works" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "1. Create a workflow with drag-and-drop nodes",
          /* @__PURE__ */ jsx("br", {}),
          "2. Design your logic visually (triggers, actions, conditions)",
          /* @__PURE__ */ jsx("br", {}),
          "3. Connect the workflow to element events (onClick, onChange, etc.)"
        ] })
      ] })
    ] }) }) }),
    workflowsArray.length > 0 && /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          placeholder: "Search workflows...",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          className: "pl-9"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(ScrollArea, { className: "h-full", children: filteredWorkflows.length === 0 && searchQuery ? /* @__PURE__ */ jsx("div", { className: "text-center py-12", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
      'No workflows found matching "',
      searchQuery,
      '"'
    ] }) }) : filteredWorkflows.length === 0 ? /* @__PURE__ */ jsxs(Card, { className: "border-dashed", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "text-center pb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Workflow, { className: "h-6 w-6 text-primary" }) }),
        /* @__PURE__ */ jsx(CardTitle, { children: "No workflows yet" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Create your first workflow to get started with visual event handling" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "text-center pb-6", children: /* @__PURE__ */ jsxs(Button, { onClick: onCreate, size: "lg", className: "gap-2", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        "Create Your First Workflow"
      ] }) })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: filteredWorkflows.map((workflow) => /* @__PURE__ */ jsx(
      Card,
      {
        className: "hover:border-primary/50 transition-colors",
        children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4 text-accent shrink-0" }),
              /* @__PURE__ */ jsx("h3", { className: "font-semibold truncate", children: workflow.name }),
              !workflow.enabled && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: "Disabled" })
            ] }),
            workflow.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-3 line-clamp-2", children: workflow.description }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Workflow, { className: "h-3 w-3" }),
                workflow.canvasData?.nodes?.length || 0,
                " nodes"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Created",
                " ",
                new Date(workflow.createdAt).toLocaleDateString()
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 shrink-0", children: /* @__PURE__ */ jsxs(TooltipProvider, { children: [
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  onClick: () => onEdit(workflow.id, workflow.name),
                  className: "h-8 w-8 p-0",
                  children: /* @__PURE__ */ jsx(Edit2, { className: "h-4 w-4 text-primary" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { children: "Edit workflow" })
            ] }),
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  onClick: () => setDeleteConfirmId(workflow.id),
                  disabled: isDeleting,
                  className: "h-8 w-8 p-0 hover:text-destructive",
                  children: isDeleting && deleteConfirmId === workflow.id ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { children: "Delete workflow" })
            ] })
          ] }) })
        ] }) })
      },
      workflow.id
    )) }) }),
    /* @__PURE__ */ jsx(
      AlertDialog,
      {
        open: !!deleteConfirmId,
        onOpenChange: (open) => !open && setDeleteConfirmId(null),
        children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Delete Workflow" }),
            /* @__PURE__ */ jsx(AlertDialogDescription, { children: "Are you sure you want to delete this workflow? This action cannot be undone and will remove all connections to elements." })
          ] }),
          /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
            /* @__PURE__ */ jsx(
              AlertDialogAction,
              {
                onClick: () => deleteConfirmId && handleDelete(deleteConfirmId),
                className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                children: "Delete"
              }
            )
          ] })
        ] })
      }
    )
  ] });
};
const WorkflowCreator = ({
  projectId,
  onSuccess,
  onCancel
}) => {
  const createWorkflowMutation = useCreateEventWorkflow();
  const form = useForm({
    resolver: zodResolver(CreateEventWorkflowSchema),
    defaultValues: {
      name: "",
      description: void 0
    },
    mode: "onBlur"
  });
  const onSubmit = async (data) => {
    try {
      const result = await createWorkflowMutation.mutateAsync({
        projectId,
        input: {
          name: data.name,
          description: data.description,
          canvasData: void 0
        }
      });
      toast.success("Workflow created! Now design your workflow visually.");
      form.reset();
      onSuccess(result.id);
    } catch (error) {
      console.error("Failed to create workflow:", error);
      toast.error("Failed to create workflow. Please try again.");
    }
  };
  const isLoading = createWorkflowMutation.isPending;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Create New Workflow" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Give your workflow a name and description" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(Form, { ...form, children: /* @__PURE__ */ jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6", children: [
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "name",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxs(FormLabel, { children: [
                "Workflow Name",
                /* @__PURE__ */ jsx("span", { className: "text-destructive ml-1", children: "*" })
              ] }),
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                Input,
                {
                  placeholder: "e.g., Send Welcome Email",
                  disabled: isLoading,
                  autoFocus: true,
                  maxLength: 100,
                  ...field
                }
              ) }),
              /* @__PURE__ */ jsx(FormDescription, { children: "Choose a descriptive name for your workflow (3-100 characters)" }),
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
              /* @__PURE__ */ jsxs(FormLabel, { children: [
                "Description",
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground ml-1", children: "(Optional)" })
              ] }),
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                Textarea,
                {
                  placeholder: "Describe what this workflow does...",
                  disabled: isLoading,
                  rows: 4,
                  maxLength: 500,
                  className: "resize-none",
                  ...field
                }
              ) }),
              /* @__PURE__ */ jsx(FormDescription, { children: "Help others understand the purpose of this workflow (max 500 characters)" }),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-4", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              disabled: isLoading || !form.formState.isValid,
              className: "flex-1 gap-2",
              children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
                "Creating..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }),
                "Create & Design Workflow"
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: onCancel,
              disabled: isLoading,
              children: "Cancel"
            }
          )
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "border-primary bg-primary/10 dark:border-primary dark:bg-primary/20", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsx("h4", { className: "font-semibold text-sm mb-2 text-primary", children: "What happens next?" }),
      /* @__PURE__ */ jsxs("ol", { className: "text-sm text-muted-foreground space-y-1 list-decimal list-inside", children: [
        /* @__PURE__ */ jsx("li", { children: "Your workflow will be created" }),
        /* @__PURE__ */ jsx("li", { children: "The visual editor will open automatically" }),
        /* @__PURE__ */ jsx("li", { children: 'Add nodes by clicking the "Add Node" buttons' }),
        /* @__PURE__ */ jsx("li", { children: "Connect nodes by clicking on their connection ports" }),
        /* @__PURE__ */ jsx("li", { children: "Save your workflow and connect it to element events" })
      ] })
    ] }) })
  ] });
};
const NodeIcon = ({
  type,
  className
}) => {
  const size = "h-4 w-4";
  switch (type) {
    case NodeType.TRIGGER:
      return /* @__PURE__ */ jsx(Zap, { className: cn(size, className) });
    case NodeType.ACTION:
      return /* @__PURE__ */ jsx(ArrowRight, { className: cn(size, className) });
    case NodeType.CONDITION:
      return /* @__PURE__ */ jsx(GitBranch, { className: cn(size, className) });
    case NodeType.OUTPUT:
      return /* @__PURE__ */ jsx(CheckCircle, { className: cn(size, className) });
    default:
      return /* @__PURE__ */ jsx(Zap, { className: cn(size, className) });
  }
};
const getNodeColorClasses = (type, isSelected) => {
  const baseClasses = "transition-all duration-200 border-2 rounded-lg p-3 bg-card hover:shadow-md";
  const colors = getNodeTypeColor(type);
  if (isSelected) {
    return cn(
      baseClasses,
      colors.borderSelected,
      "shadow-lg",
      colors.shadowSelected,
      colors.bg
    );
  }
  return cn(baseClasses, colors.border, colors.bg);
};
const getIconColor = (type) => {
  return getNodeTypeColor(type).icon;
};
const WorkflowNodeWrapper = ({
  data,
  selected,
  id
}) => {
  const { deleteNode } = useWorkflowCanvas();
  const [showPorts, setShowPorts] = React__default.useState(false);
  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Delete node "${data.label}"?`)) {
      deleteNode(id);
    }
  };
  const handleConfigure = (e) => {
    e.stopPropagation();
    data.onConfigure?.(id);
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onMouseEnter: () => setShowPorts(true),
      onMouseLeave: () => setShowPorts(false),
      className: cn(
        getNodeColorClasses(data.type, selected),
        "w-48 group cursor-grab active:cursor-grabbing select-none transition-all"
      ),
      style: { transitionDuration: `${ANIMATION_DURATIONS.normal}ms` },
      children: [
        /* @__PURE__ */ jsx(
          Handle,
          {
            type: "target",
            position: Position.Left,
            isConnectable: true,
            className: cn(
              "w-3 h-3 rounded-full transition-all",
              showPorts || selected ? "opacity-100" : "opacity-0",
              data.type === NodeType.TRIGGER ? "bg-primary border-2 border-white dark:border-slate-900" : "bg-accent border-2 border-white dark:border-slate-900"
            )
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: cn("p-1.5 rounded", getNodeTypeColor(data.type).iconBg),
              children: /* @__PURE__ */ jsx(NodeIcon, { type: data.type, className: getIconColor(data.type) })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold truncate", children: data.label }),
            data.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground truncate", children: data.description })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
          data.type !== NodeType.OUTPUT && /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "h-7 flex-1 text-xs",
              onClick: handleConfigure,
              children: [
                /* @__PURE__ */ jsx(Settings, { className: "h-3 w-3 mr-1" }),
                "Config"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "h-7 px-2 text-destructive hover:text-destructive",
              onClick: handleDelete,
              children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" })
            }
          )
        ] }),
        data.type !== NodeType.OUTPUT ? /* @__PURE__ */ jsx(
          Handle,
          {
            type: "source",
            position: Position.Right,
            isConnectable: true,
            className: cn(
              "w-3 h-3 rounded-full transition-all",
              showPorts || selected ? "opacity-100" : "opacity-0",
              "bg-primary border-2 border-white dark:border-slate-900"
            )
          }
        ) : null
      ]
    }
  );
};
const EVENT_HANDLE_COLORS = {
  onClick: "bg-accent",
  onDoubleClick: "bg-purple-500",
  onMouseEnter: "bg-sky-500",
  onMouseLeave: "bg-indigo-500",
  onSubmit: "bg-primary",
  onChange: "bg-orange-500",
  onFocus: "bg-teal-500",
  onBlur: "bg-rose-500"
};
const getHandleColor = (eventValue) => EVENT_HANDLE_COLORS[eventValue] ?? "bg-muted-foreground";
const ROW_HEIGHT = 28;
const ElementNode = ({
  data,
  selected,
  id
}) => {
  const { deleteNode } = useWorkflowCanvas();
  const [hovered, setHovered] = useState(false);
  const handleDelete = (e) => {
    e.stopPropagation();
    deleteNode(id);
  };
  const connectedEvents = data.connectedEvents ?? [];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      className: cn(
        "relative bg-card w-55 border-2 rounded-lg transition-all duration-200 select-none cursor-grab active:cursor-grabbing",
        selected ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-primary/50 hover:shadow-md"
      ),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 pt-3 pb-2 border-b border-border", children: [
          /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded bg-primary/10 shrink-0", children: /* @__PURE__ */ jsx(Layers, { className: "h-4 w-4 text-primary" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wide text-muted-foreground leading-none mb-0.5", children: "Element" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold truncate leading-tight", children: data.elementName || data.label })
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              variant: "ghost",
              onClick: handleDelete,
              className: cn(
                "h-6 w-6 p-0 shrink-0 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10",
                hovered || selected ? "opacity-100" : "opacity-0"
              ),
              children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "px-3 py-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wide", children: "Drag to connect →" }),
          WORKFLOW_EVENT_TYPES.map((event, index) => {
            const isConnected = connectedEvents.includes(event.value);
            const dotColor = getHandleColor(event.value);
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: "relative flex items-center gap-2 pr-4",
                style: { height: ROW_HEIGHT },
                children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: cn(
                        "w-2 h-2 rounded-full shrink-0 transition-all",
                        dotColor,
                        isConnected ? "ring-2 ring-offset-1 ring-offset-card ring-current scale-125" : ""
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-xs flex-1 truncate", children: event.label }),
                  isConnected && /* @__PURE__ */ jsx(
                    Badge,
                    {
                      variant: "secondary",
                      className: "text-[9px] px-1 py-0 h-3.5 shrink-0 leading-none",
                      children: "linked"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Handle,
                    {
                      type: "source",
                      position: Position.Right,
                      id: event.value,
                      isConnectable: true,
                      className: cn(
                        dotColor,
                        "w-3 h-3 rounded-full border-2 border-border absolute right-0 transform translate-x-1/2 transition-opacity",
                        {
                          "opacity-100": hovered || selected,
                          "opacity-40": !(hovered || selected)
                        }
                      )
                    }
                  )
                ]
              },
              event.value
            );
          })
        ] }),
        data.elementType && /* @__PURE__ */ jsx("div", { className: "px-3 pb-2", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground/70 truncate", children: data.elementType }) })
      ]
    }
  );
};
const useConnectElementEventWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      elementId,
      eventType,
      workflowId
    }) => {
      const validation = validateCreateConnection({
        elementId,
        eventName: eventType,
        workflowId
      });
      if (!validation.success) {
        throw new Error(getFirstError(validation) ?? "Invalid connection data");
      }
      const cached = queryClient.getQueryData(
        elementEventWorkflowKeys.byElement(elementId)
      ) ?? [];
      if (cached.some(
        (c) => c.eventName === eventType && c.workflowId === workflowId
      )) {
        throw new Error("Workflow already connected to this event");
      }
      const validated = CreateElementEventWorkflowSchema.parse({
        elementId,
        eventName: eventType,
        workflowId
      });
      return elementEventWorkflowService.createElementEventWorkflow({
        elementId: validated.elementId,
        workflowId: validated.workflowId,
        eventName: validated.eventName
      });
    },
    onSuccess: (newConnection, { elementId }) => {
      const conn = newConnection;
      queryClient.setQueryData(
        elementEventWorkflowKeys.byElement(elementId),
        (old) => [...old ?? [], conn]
      );
      useElementEventWorkflowStore.getState().addConnection(conn);
      showSuccessToast("Workflow connected successfully!");
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "Workflow already connected to this event") {
        showSuccessToast(error.message);
        return;
      }
      if (error instanceof Error && error.message.startsWith("Invalid")) {
        showErrorToast(error.message);
        return;
      }
      showErrorToast(getErrorMessage(error, "Failed to connect workflow"));
    }
  });
};
const useDisconnectElementEventWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      elementId,
      eventType,
      workflowId
    }) => {
      const validation = validateDisconnectConnection({
        elementId,
        eventName: eventType,
        workflowId
      });
      if (!validation.success) {
        throw new Error(getFirstError(validation) ?? "Invalid disconnect data");
      }
      const cached = queryClient.getQueryData(
        elementEventWorkflowKeys.byElement(elementId)
      ) ?? [];
      const connection = cached.find(
        (c) => c.eventName === eventType && c.workflowId === workflowId
      );
      if (!connection) throw new Error("Connection not found");
      await elementEventWorkflowService.deleteElementEventWorkflow(
        connection.id
      );
      return { elementId, connectionId: connection.id };
    },
    onSuccess: ({ elementId, connectionId }) => {
      queryClient.setQueryData(
        elementEventWorkflowKeys.byElement(elementId),
        (old) => old?.filter((c) => c.id !== connectionId) ?? []
      );
      useElementEventWorkflowStore.getState().removeConnection(connectionId, elementId);
      showSuccessToast("Workflow disconnected");
    },
    onError: (error) => {
      showErrorToast(getErrorMessage(error, "Failed to disconnect workflow"));
    }
  });
};
const nodeTypes = {
  workflow: WorkflowNodeWrapper,
  element: ElementNode
};
const WorkflowCanvas = ({
  readOnly = false,
  workflowId,
  onWorkflowChange,
  onNodeConfigure,
  className
}) => {
  const {
    workflow,
    selection,
    addNode,
    deleteNode,
    addConnection,
    deleteConnection,
    selectNode,
    selectConnection,
    deselectAll,
    moveNode
  } = useWorkflowCanvas();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const selectedElement = useSelectionStore((state) => state.selectedElement);
  const { fitView } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const connectMutation = useConnectElementEventWorkflow();
  const disconnectMutation = useDisconnectElementEventWorkflow();
  const getConnectedEventsForNode = useCallback(
    (nodeId) => {
      return workflow.connections.filter((c) => c.source === nodeId && c.sourcePort).map((c) => c.sourcePort);
    },
    [workflow.connections]
  );
  const addedElementIds = useRef(/* @__PURE__ */ new Set());
  useEffect(() => {
    if (!selectedElement) return;
    const alreadyOnCanvas = workflow.nodes.some(
      (n) => n.type === NodeType.ELEMENT && n.data.elementId === selectedElement.id
    );
    if (!alreadyOnCanvas && !addedElementIds.current.has(selectedElement.id)) {
      addedElementIds.current.add(selectedElement.id);
      const label = selectedElement.name || selectedElement.type || "Element";
      addNode(
        NodeType.ELEMENT,
        { x: 50, y: 50 },
        {
          label,
          elementId: selectedElement.id,
          elementName: label,
          elementType: selectedElement.type,
          connectedEvents: []
        }
      );
    }
  }, [selectedElement, workflow.nodes, addNode]);
  useEffect(() => {
    const workflowNodes = workflow.nodes.map(
      (node) => mapWorkflowNodeToReactFlow({
        node,
        connectedEvents: getConnectedEventsForNode(node.id),
        onSelect: () => selectNode(node.id),
        onConfigure: onNodeConfigure
      })
    );
    const workflowEdges = workflow.connections.map((conn) => ({
      id: conn.id,
      source: conn.source,
      target: conn.target,
      sourceHandle: conn.sourcePort,
      targetHandle: conn.targetPort,
      animated: selection.selectedConnectionId === conn.id,
      label: conn.sourcePort ?? void 0,
      labelStyle: { fontSize: 10, fill: "var(--color-muted-foreground)" },
      labelBgStyle: { fill: "var(--color-card)", fillOpacity: 0.8 },
      style: {
        stroke: selection.selectedConnectionId === conn.id ? CONNECTION_CONFIG.colors.selected : CONNECTION_CONFIG.colors.default,
        strokeWidth: selection.selectedConnectionId === conn.id ? CONNECTION_CONFIG.strokeWidth.active : CONNECTION_CONFIG.strokeWidth.default
      }
    }));
    setNodes(workflowNodes);
    setEdges(workflowEdges);
  }, [
    workflow,
    selection.selectedNodeId,
    selection.selectedConnectionId,
    setNodes,
    setEdges,
    onNodeConfigure,
    getConnectedEventsForNode
  ]);
  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          moveNode(change.id, change.position);
        }
      });
    },
    [onNodesChange, moveNode]
  );
  const handleConnect = useCallback(
    async (connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) {
        toast.error(VALIDATION_ERRORS.selfConnection);
        return;
      }
      const sourceNode = workflow.nodes.find((n) => n.id === connection.source);
      const targetNode = workflow.nodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) return;
      if (sourceNode.type === NodeType.ELEMENT && targetNode.type === NodeType.TRIGGER) {
        const eventType = connection.sourceHandle;
        const elementId = sourceNode.data.elementId;
        if (!eventType || !elementId) {
          toast.error("Invalid element connection — missing event or element.");
          return;
        }
        if (!workflowId) {
          toast.error("Save the workflow first before connecting elements.");
          return;
        }
        const duplicate = workflow.connections.find(
          (c) => c.source === connection.source && c.target === connection.target && c.sourcePort === eventType
        );
        if (duplicate) {
          toast.error("This event is already connected to that trigger.");
          return;
        }
        try {
          await connectMutation.mutateAsync({
            elementId,
            eventType,
            workflowId
          });
          addConnection(connection.source, connection.target, eventType);
          toast.success(`Connected "${eventType}" → workflow trigger`);
        } catch {
        }
        return;
      }
      if (sourceNode.type === NodeType.OUTPUT) {
        toast.error(VALIDATION_ERRORS.outputAsSource);
        return;
      }
      if (targetNode.type === NodeType.TRIGGER) {
        toast.error(VALIDATION_ERRORS.triggerAsTarget);
        return;
      }
      addConnection(
        connection.source,
        connection.target,
        connection.sourceHandle ?? void 0
      );
      toast.success("Nodes connected!");
    },
    [workflow.nodes, workflow.connections, addConnection, connectMutation]
  );
  const handleNodeClick = useCallback(
    (_event, node) => {
      selectNode(node.id);
      setSelectedNodeId(node.id);
    },
    [selectNode]
  );
  const handleEdgeClick = useCallback(
    (_event, edge) => {
      selectConnection(edge.id);
      setSelectedEdgeId(edge.id);
    },
    [selectConnection]
  );
  const handlePaneClick = useCallback(() => {
    deselectAll();
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [deselectAll]);
  const handleAddNode = (type) => {
    const position = { x: Math.random() * 300, y: Math.random() * 300 };
    const node = createReactFlowNode(type, {
      id: crypto.randomUUID(),
      position,
      label: `${type.charAt(0).toUpperCase()}${type.slice(1)}`
    });
    addNode(type, position, node.data);
  };
  const handleDeleteSelected = useCallback(async () => {
    if (selectedNodeId) {
      const node = workflow.nodes.find((n) => n.id === selectedNodeId);
      if (node?.type === NodeType.ELEMENT && node.data.elementId && workflowId) {
        const elementConnections = workflow.connections.filter(
          (c) => c.source === selectedNodeId && c.sourcePort
        );
        for (const conn of elementConnections) {
          if (conn.sourcePort) {
            try {
              await disconnectMutation.mutateAsync({
                elementId: node.data.elementId,
                eventType: conn.sourcePort,
                workflowId
              });
            } catch {
            }
          }
        }
      }
      deleteNode(selectedNodeId);
      toast.success("Node deleted");
      setSelectedNodeId(null);
    } else if (selectedEdgeId) {
      const conn = workflow.connections.find((c) => c.id === selectedEdgeId);
      if (conn?.sourcePort && workflowId) {
        const sourceNode = workflow.nodes.find((n) => n.id === conn.source);
        const targetNode = workflow.nodes.find((n) => n.id === conn.target);
        if (sourceNode?.type === NodeType.ELEMENT && targetNode?.type === NodeType.TRIGGER && sourceNode.data.elementId) {
          try {
            await disconnectMutation.mutateAsync({
              elementId: sourceNode.data.elementId,
              eventType: conn.sourcePort,
              workflowId
            });
          } catch {
          }
        }
      }
      deleteConnection(selectedEdgeId);
      toast.success("Connection deleted");
      setSelectedEdgeId(null);
    }
  }, [
    selectedNodeId,
    selectedEdgeId,
    workflow.nodes,
    workflow.connections,
    deleteNode,
    deleteConnection,
    disconnectMutation
  ]);
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData("nodeType");
      const elementId = e.dataTransfer.getData("elementId");
      const elementName = e.dataTransfer.getData("elementName");
      const elementType = e.dataTransfer.getData("elementType");
      if (!nodeType) return;
      const bounds = e.currentTarget.getBoundingClientRect();
      const position = {
        x: e.clientX - bounds.left - 110,
        y: e.clientY - bounds.top - 60
      };
      const node = createReactFlowNode(nodeType, {
        id: crypto.randomUUID(),
        position,
        label: elementName || `${nodeType.charAt(0).toUpperCase()}${nodeType.slice(1)}`,
        elementId: elementId || void 0,
        elementName: elementName || void 0,
        elementType: elementType || void 0
      });
      addNode(nodeType, position, node.data);
    },
    [addNode]
  );
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        handleDeleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDeleteSelected]);
  useEffect(() => {
    onWorkflowChange?.(workflow);
  }, [workflow, onWorkflowChange]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "relative w-full h-full bg-background overflow-hidden",
        className
      ),
      onDrop: handleDrop,
      onDragOver: handleDragOver,
      children: /* @__PURE__ */ jsxs(
        ReactFlow,
        {
          nodes,
          edges,
          onNodesChange: handleNodesChange,
          onEdgesChange,
          onConnect: handleConnect,
          onNodeClick: handleNodeClick,
          onEdgeClick: handleEdgeClick,
          onPaneClick: handlePaneClick,
          nodeTypes,
          fitView: true,
          attributionPosition: "bottom-left",
          children: [
            /* @__PURE__ */ jsx(Background, { color: "var(--color-border)", gap: 50, size: 1 }),
            /* @__PURE__ */ jsx(Controls, {}),
            /* @__PURE__ */ jsx(MiniMap, {}),
            /* @__PURE__ */ jsx("div", { className: "absolute top-4 left-4 z-40 flex gap-2", children: /* @__PURE__ */ jsx("div", { className: "bg-card border border-border rounded-lg p-2 shadow-lg flex gap-1", children: /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                variant: "ghost",
                className: "h-9 w-9 p-0",
                onClick: () => fitView({ padding: 0.2, duration: 200 }),
                title: "Reset view",
                children: /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" })
              }
            ) }) }),
            !readOnly && /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 z-40", children: /* @__PURE__ */ jsx("div", { className: "bg-card border border-border rounded-lg p-2 shadow-lg flex flex-col gap-1", children: [
              NodeType.TRIGGER,
              NodeType.ACTION,
              NodeType.CONDITION,
              NodeType.OUTPUT
            ].map((type) => /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                className: "h-9 gap-2 text-xs justify-start",
                onClick: () => handleAddNode(type),
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 shrink-0" }),
                  NODE_TYPE_LABELS[type]
                ]
              },
              type
            )) }) }),
            /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 left-4 z-40", children: (selectedNodeId || selectedEdgeId) && /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                variant: "destructive",
                className: "gap-2",
                onClick: handleDeleteSelected,
                title: "Delete selected (Del)",
                children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                  "Delete"
                ]
              }
            ) }),
            nodes.length === 0 && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx(Grid3x3, { className: "h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" }),
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-muted-foreground mb-1", children: "No nodes yet" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Add workflow nodes from the right panel, or drag elements from the palette" })
            ] }) })
          ]
        }
      )
    }
  );
};
const WorkflowCanvasWrapper = ({
  readOnly = false,
  workflowId,
  onWorkflowChange,
  onNodeConfigure,
  className
}) => {
  return /* @__PURE__ */ jsx(ReactFlowProvider, { children: /* @__PURE__ */ jsx(
    WorkflowCanvas,
    {
      readOnly,
      workflowId,
      onWorkflowChange,
      onNodeConfigure,
      className
    }
  ) });
};
const EVENT_TYPES = [
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
];
const ACTION_TYPES = [
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
];
const NodeConfigPanel = ({
  node,
  isOpen,
  onOpenChange,
  onSave
}) => {
  const [config, setConfig] = useState({});
  useEffect(() => {
    if (node) {
      setConfig(node.data?.config || {});
    }
  }, [node, isOpen]);
  if (!node) return null;
  const handleSave = () => {
    if (node) {
      const configToSave = { ...config };
      if (node.type === NodeType.ACTION && !configToSave.actionType) {
        configToSave.actionType = "navigate";
      }
      if (node.type === NodeType.TRIGGER && !configToSave.eventType) {
        configToSave.eventType = "onClick";
      }
      onSave(node.id, configToSave);
      onOpenChange(false);
    }
  };
  const updateConfig = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  const renderTriggerConfig = () => /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Event Type" }),
    /* @__PURE__ */ jsxs(
      Select,
      {
        value: config.eventType || "onClick",
        onValueChange: (value) => updateConfig("eventType", value),
        children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: EVENT_TYPES.map((event) => /* @__PURE__ */ jsx(SelectItem, { value: event, children: event }, event)) })
        ]
      }
    )
  ] }) });
  const renderActionConfig = () => /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Action Type" }),
      /* @__PURE__ */ jsxs(
        Select,
        {
          value: config.actionType || "navigate",
          onValueChange: (value) => updateConfig("actionType", value),
          children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: ACTION_TYPES.map((action) => /* @__PURE__ */ jsx(SelectItem, { value: action, children: action }, action)) })
          ]
        }
      )
    ] }),
    renderActionTypeConfig(),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium", children: "Additional Options" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: config.preventDefault || false,
              onChange: (e) => updateConfig("preventDefault", e.target.checked),
              className: "rounded border"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Prevent Default" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: config.stopPropagation || false,
              onChange: (e) => updateConfig("stopPropagation", e.target.checked),
              className: "rounded border"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Stop Propagation" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Delay (ms)" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          type: "number",
          min: "0",
          value: config.delay || 0,
          onChange: (e) => updateConfig("delay", parseInt(e.target.value)),
          placeholder: "0"
        }
      )
    ] })
  ] });
  const renderActionTypeConfig = () => {
    const actionType = config.actionType || "navigate";
    switch (actionType) {
      case "navigate":
        return /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-muted p-3 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Target" }),
            /* @__PURE__ */ jsxs(
              Select,
              {
                value: config.target || "url",
                onValueChange: (value) => updateConfig("target", value),
                children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "url", children: "URL" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "page", children: "Page" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "external", children: "External" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Value" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: config.target === "url" ? "https://example.com" : "page-slug",
                value: config.value || "",
                onChange: (e) => updateConfig("value", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: config.openInNewTab || false,
                onChange: (e) => updateConfig("openInNewTab", e.target.checked),
                className: "rounded border"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Open in New Tab" })
          ] })
        ] });
      case "showElement":
      case "hideElement":
      case "toggleElement":
        return /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-muted p-3 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Element ID" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "element-id",
                value: config.elementId || "",
                onChange: (e) => updateConfig("elementId", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Animation Duration (ms)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "number",
                min: "0",
                placeholder: "300",
                value: config.animationDuration || 0,
                onChange: (e) => updateConfig("animationDuration", parseInt(e.target.value))
              }
            )
          ] })
        ] });
      case "apiCall":
        return /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-muted p-3 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "URL" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "https://api.example.com/endpoint",
                value: config.url || "",
                onChange: (e) => updateConfig("url", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Method" }),
            /* @__PURE__ */ jsxs(
              Select,
              {
                value: config.method || "GET",
                onValueChange: (value) => updateConfig("method", value),
                children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "GET", children: "GET" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "POST", children: "POST" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "PUT", children: "PUT" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "DELETE", children: "DELETE" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "PATCH", children: "PATCH" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Timeout (ms)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "number",
                min: "0",
                placeholder: "5000",
                value: config.timeout || 5e3,
                onChange: (e) => updateConfig("timeout", parseInt(e.target.value))
              }
            )
          ] })
        ] });
      case "customCode":
        return /* @__PURE__ */ jsx("div", { className: "space-y-3 bg-muted p-3 rounded-lg", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Code" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              className: "w-full h-32 p-2 rounded border bg-background font-mono text-sm",
              placeholder: "// Custom code here",
              value: config.code || "",
              onChange: (e) => updateConfig("code", e.target.value)
            }
          )
        ] }) });
      case "scrollTo":
        return /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-muted p-3 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Target" }),
            /* @__PURE__ */ jsxs(
              Select,
              {
                value: config.target || "elementId",
                onValueChange: (value) => updateConfig("target", value),
                children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "elementId", children: "Element ID" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "position", children: "Position" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Value" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: config.target === "elementId" ? "element-id" : "Position (px)",
                value: config.value || "",
                onChange: (e) => updateConfig("value", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Behavior" }),
            /* @__PURE__ */ jsxs(
              Select,
              {
                value: config.behavior || "smooth",
                onValueChange: (value) => updateConfig("behavior", value),
                children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "smooth", children: "Smooth" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "auto", children: "Auto" })
                  ] })
                ]
              }
            )
          ] })
        ] });
      case "setData":
        return /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-muted p-3 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Data Path" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "state.myValue",
                value: config.dataPath || "",
                onChange: (e) => updateConfig("dataPath", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Value" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "value",
                value: config.value || "",
                onChange: (e) => updateConfig("value", e.target.value)
              }
            )
          ] })
        ] });
      case "showNotification":
        return /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-muted p-3 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Message" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Notification message",
                value: config.message || "",
                onChange: (e) => updateConfig("message", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Type" }),
            /* @__PURE__ */ jsxs(
              Select,
              {
                value: config.notificationType || "info",
                onValueChange: (value) => updateConfig("notificationType", value),
                children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "success", children: "Success" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "error", children: "Error" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "info", children: "Info" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "warning", children: "Warning" })
                  ] })
                ]
              }
            )
          ] })
        ] });
      case "modal":
        return /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-muted p-3 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Action" }),
            /* @__PURE__ */ jsxs(
              Select,
              {
                value: config.action || "open",
                onValueChange: (value) => updateConfig("action", value),
                children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "open", children: "Open" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "close", children: "Close" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Modal ID (optional)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "modal-id",
                value: config.modalId || "",
                onChange: (e) => updateConfig("modalId", e.target.value)
              }
            )
          ] })
        ] });
      case "playAnimation":
        return /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-muted p-3 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Element ID" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "element-id",
                value: config.elementId || "",
                onChange: (e) => updateConfig("elementId", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Animation Type" }),
            /* @__PURE__ */ jsxs(
              Select,
              {
                value: config.animationType || "fadeIn",
                onValueChange: (value) => updateConfig("animationType", value),
                children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "fadeIn", children: "Fade In" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "slideIn", children: "Slide In" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "bounce", children: "Bounce" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "pulse", children: "Pulse" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "shake", children: "Shake" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "spin", children: "Spin" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Duration (ms)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "number",
                min: "0",
                placeholder: "1000",
                value: config.duration || 1e3,
                onChange: (e) => updateConfig("duration", parseInt(e.target.value))
              }
            )
          ] })
        ] });
      case "toggleClass":
      case "addClass":
      case "removeClass":
        return /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-muted p-3 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Element ID" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "element-id",
                value: config.elementId || "",
                onChange: (e) => updateConfig("elementId", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Class Name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "class-name",
                value: config.className || "",
                onChange: (e) => updateConfig("className", e.target.value)
              }
            )
          ] })
        ] });
      default:
        return null;
    }
  };
  const renderConditionConfig = () => /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Condition Type" }),
      /* @__PURE__ */ jsxs(
        Select,
        {
          value: config.conditionType || "stateEquals",
          onValueChange: (value) => updateConfig("conditionType", value),
          children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "stateEquals", children: "State Equals" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "stateCheck", children: "State Check" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "customCode", children: "Custom Code" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "always", children: "Always True" })
            ] })
          ]
        }
      )
    ] }),
    config.conditionType !== "always" && config.conditionType !== "customCode" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "State Path" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "state.property",
            value: config.left || "",
            onChange: (e) => updateConfig("left", e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Operator" }),
        /* @__PURE__ */ jsxs(
          Select,
          {
            value: config.operator || "==",
            onValueChange: (value) => updateConfig("operator", value),
            children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "==", children: "=" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "!=", children: "!=" }),
                /* @__PURE__ */ jsx(SelectItem, { value: ">", children: ">" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "<", children: "<" }),
                /* @__PURE__ */ jsx(SelectItem, { value: ">=", children: ">=" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "<=", children: "<=" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "includes", children: "Includes" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "notIncludes", children: "Not Includes" })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Value" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "value",
            value: config.right || "",
            onChange: (e) => updateConfig("right", e.target.value)
          }
        )
      ] })
    ] }),
    config.conditionType === "customCode" && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Code" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          className: "w-full h-32 p-2 rounded border bg-background font-mono text-sm",
          placeholder: "// Return boolean",
          value: config.customCode || "",
          onChange: (e) => updateConfig("customCode", e.target.value)
        }
      )
    ] })
  ] });
  return /* @__PURE__ */ jsx(Dialog, { open: isOpen, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-xl max-h-[80vh]", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { children: [
      "Configure ",
      node.type,
      " Node"
    ] }) }),
    /* @__PURE__ */ jsx(ScrollArea, { className: "pr-4", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Label" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            value: config.label || node.data.label,
            onChange: (e) => updateConfig("label", e.target.value),
            placeholder: "Node label"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-2 block", children: "Description" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            value: config.description || node.data.description || "",
            onChange: (e) => updateConfig("description", e.target.value),
            placeholder: "Node description"
          }
        )
      ] }),
      node.type === NodeType.TRIGGER && renderTriggerConfig(),
      node.type === NodeType.ACTION && renderActionConfig(),
      node.type === NodeType.CONDITION && renderConditionConfig()
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-4 border-t", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          onClick: () => onOpenChange(false),
          className: "flex-1",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(Button, { onClick: handleSave, className: "flex-1", children: "Save Configuration" })
    ] })
  ] }) });
};
const AUTOSAVE_DELAY_MS = 3e3;
const WorkflowEditor = ({
  workflowId,
  workflowName = "New Workflow",
  onNameChange,
  initialWorkflow,
  readOnly = false,
  className,
  onBack
}) => {
  const {
    workflow,
    loadWorkflow,
    clearWorkflow,
    getWorkflow,
    updateNode,
    addNode
  } = useWorkflowCanvas();
  const updateMutation = useUpdateEventWorkflow();
  const [name, setName] = useState(workflowName);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [configNodeId, setConfigNodeId] = useState(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const isSaving = updateMutation.isPending;
  const [isLoaded, setIsLoaded] = useState(false);
  const autosaveTimer = useRef(null);
  useEffect(() => {
    if (initialWorkflow) {
      loadWorkflow(initialWorkflow);
      const t = setTimeout(() => setIsLoaded(true), 200);
      return () => clearTimeout(t);
    }
  }, [initialWorkflow, loadWorkflow]);
  const handleNameChange = (newName) => {
    setName(newName);
    onNameChange?.(newName);
  };
  const triggerSave = useCallback(
    async (currentWorkflow) => {
      if (!workflowId) return;
      const validation = validateWorkflowCanvas(currentWorkflow);
      if (!validation.success) {
        const errors = validation.error?.issues.map((issue) => issue.message) ?? [];
        toast.error(`Workflow validation failed:
${errors.join("\n")}`);
        return;
      }
      try {
        await updateMutation.mutateAsync({
          workflowId,
          input: {
            handlers: transformWorkflowToEventHandlers(currentWorkflow),
            canvasData: currentWorkflow,
            enabled: true
          }
        });
      } catch {
        console.error("Failed to save workflow");
      }
    },
    [workflowId, updateMutation]
  );
  useEffect(() => {
    if (!isLoaded || readOnly) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      triggerSave(getWorkflow());
    }, AUTOSAVE_DELAY_MS);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [workflow, isLoaded, readOnly, triggerSave, getWorkflow]);
  const handleClear = () => {
    clearWorkflow();
    toast.success("Workflow cleared!");
    setShowClearConfirm(false);
  };
  const handleNodeConfigure = (nodeId) => {
    setConfigNodeId(nodeId);
    setShowConfigPanel(true);
  };
  const handleSaveNodeConfig = (nodeId, config) => {
    const existingNode = workflow.nodes.find((n) => n.id === nodeId);
    const existingLabel = existingNode?.data?.label ?? "";
    const existingDescription = existingNode?.data?.description;
    const label = typeof config["label"] === "string" && config["label"].trim().length > 0 ? config["label"] : existingLabel;
    const description = typeof config["description"] === "string" ? config["description"] : existingDescription;
    updateNode(nodeId, {
      ...existingNode ?? {},
      data: { label, description, config }
    });
    toast.success("Node configuration saved!");
  };
  const configNode = workflow.nodes.find((n) => n.id === configNodeId) ?? null;
  const allElements = useElements();
  const paletteElements = useMemo(() => {
    const flat = ElementTreeHelper.flatten(allElements);
    return flat.map((el) => ({
      id: el.id,
      name: el.name || el.content || el.type,
      type: el.type
    }));
  }, [allElements]);
  const activeElementIds = useMemo(
    () => new Set(
      workflow.nodes.filter((n) => n.type === NodeType.ELEMENT && n.data.elementId).map((n) => n.data.elementId)
    ),
    [workflow.nodes]
  );
  const handleAddElement = useCallback(
    (el) => {
      if (activeElementIds.has(el.id)) return;
      const offset = workflow.nodes.filter(
        (n) => n.type === NodeType.ELEMENT
      ).length;
      addNode(
        NodeType.ELEMENT,
        { x: 80 + offset * 20, y: 80 + offset * 20 },
        {
          label: el.name,
          elementId: el.id,
          elementName: el.name,
          elementType: el.type,
          connectedEvents: []
        }
      );
    },
    [activeElementIds, workflow.nodes, addNode]
  );
  return /* @__PURE__ */ jsxs("div", { className: clsx("flex flex-col h-full bg-background", className), children: [
    /* @__PURE__ */ jsx("div", { className: "shrink-0 border-b border-border px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
        onBack && /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: onBack,
            className: "gap-2 shrink-0",
            children: "← Back"
          }
        ),
        /* @__PURE__ */ jsx(
          Input,
          {
            value: name,
            onChange: (e) => handleNameChange(e.target.value),
            placeholder: "Workflow name",
            className: "h-9 text-base font-semibold",
            disabled: readOnly
          }
        )
      ] }),
      !readOnly && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            disabled: isSaving,
            className: "gap-2 pointer-events-none",
            children: [
              isSaving ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: isSaving ? "Saving…" : "Saved" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: () => setShowClearConfirm(true),
            className: "gap-2",
            children: [
              /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Clear" })
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0 flex overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0 overflow-hidden p-4", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-lg border border-border overflow-hidden", children: /* @__PURE__ */ jsx(
        WorkflowCanvasWrapper,
        {
          readOnly,
          workflowId,
          onNodeConfigure: handleNodeConfigure
        }
      ) }) }),
      !readOnly && /* @__PURE__ */ jsx("aside", { className: "w-72 shrink-0 border-l border-border flex flex-col overflow-y-auto bg-background", children: /* @__PURE__ */ jsx(
        NodePalette,
        {
          elements: paletteElements,
          activeElementIds,
          onAddElement: handleAddElement
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(AlertDialog, { open: showClearConfirm, onOpenChange: setShowClearConfirm, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Clear Workflow" }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This will remove all nodes and connections. This action cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsx(
          AlertDialogAction,
          {
            onClick: handleClear,
            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            children: "Clear"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(
      NodeConfigPanel,
      {
        node: configNode,
        isOpen: showConfigPanel,
        onOpenChange: setShowConfigPanel,
        onSave: handleSaveNodeConfig
      }
    )
  ] });
};
function useWorkflowManager({
  projectId,
  isOpen
}) {
  const [view, setView] = useState({ type: "list" });
  const editingWorkflowId = view.type === "edit" ? view.workflowId : "";
  const isEditView = view.type === "edit";
  const workflowQuery = useEventWorkflow(editingWorkflowId, isEditView);
  useEffect(() => {
    if (isOpen) setView({ type: "list" });
  }, [isOpen]);
  const hasInitialData = view.type === "edit" && !!view.initialData;
  useEffect(() => {
    if (view.type !== "edit" || hasInitialData) return;
    if (!workflowQuery.data?.canvasData) return;
    setView(
      (prev) => prev.type === "edit" ? { ...prev, initialData: workflowQuery.data.canvasData } : prev
    );
  }, [workflowQuery.data, view.type, hasInitialData]);
  const goToList = useCallback(() => setView({ type: "list" }), []);
  const goToCreate = useCallback(() => setView({ type: "create" }), []);
  const goToEdit = useCallback((workflowId, workflowName) => {
    setView({ type: "edit", workflowId, workflowName, initialData: void 0 });
  }, []);
  const onWorkflowCreated = useCallback((workflowId) => {
    setView({ type: "edit", workflowId, workflowName: "New Workflow" });
  }, []);
  const isLoadingWorkflow = workflowQuery.isLoading;
  const currentWorkflowId = view.type === "edit" ? view.workflowId : void 0;
  const currentWorkflowName = view.type === "edit" ? view.workflowName : void 0;
  const initialData = view.type === "edit" ? view.initialData : void 0;
  return {
    view,
    projectId,
    goToList,
    goToCreate,
    goToEdit,
    onWorkflowCreated,
    isLoadingWorkflow,
    currentWorkflowId,
    currentWorkflowName,
    initialData
  };
}
const NAV_ITEMS = [
  {
    id: "list",
    label: "Workflows",
    icon: /* @__PURE__ */ jsx(List, { className: "h-4 w-4" })
  },
  {
    id: "create",
    label: "New Workflow",
    icon: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" })
  }
];
function getDialogTitle(view) {
  if (view.type === "create") return "Create New Workflow";
  if (view.type === "edit")
    return `Edit Workflow: ${view.workflowName || "Untitled"}`;
  return "Workflow Manager";
}
function ManagerHeader({ view }) {
  const crumbs = ["Workflows"];
  if (view.type === "create") crumbs.push("New Workflow");
  if (view.type === "edit") crumbs.push(view.workflowName || "Edit");
  return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between h-12 px-4 border-b border-border bg-card shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-sm", children: [
    /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4 text-primary shrink-0" }),
    crumbs.map((crumb, i) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
      i > 0 && /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5 text-muted-foreground" }),
      /* @__PURE__ */ jsx(
        "span",
        {
          className: cn(
            i === crumbs.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground"
          ),
          children: crumb
        }
      )
    ] }, i)),
    view.type === "edit" && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "ml-1 text-xs h-5", children: "editing" })
  ] }) });
}
function ManagerSidebar({ activeViewType, onNavigate }) {
  return /* @__PURE__ */ jsxs("aside", { className: "w-52 shrink-0 flex flex-col border-r border-border bg-card", children: [
    /* @__PURE__ */ jsx("div", { className: "px-3 pt-4 pb-2", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2", children: "Navigation" }) }),
    /* @__PURE__ */ jsx("nav", { className: "flex-1 px-2 space-y-0.5", children: NAV_ITEMS.map((item) => {
      const isActive = activeViewType === item.id || activeViewType === "edit" && item.id === "list";
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onNavigate(item.id),
          className: cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left",
            isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          ),
          children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: cn(
                  "shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                ),
                children: item.icon
              }
            ),
            item.label
          ]
        },
        item.id
      );
    }) }),
    /* @__PURE__ */ jsx(Separator, {}),
    /* @__PURE__ */ jsx("div", { className: "p-3", children: /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/50 border border-border p-3 space-y-1.5", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: "Quick tips" }),
      /* @__PURE__ */ jsxs("ul", { className: "text-xs text-muted-foreground space-y-1 list-disc list-inside", children: [
        /* @__PURE__ */ jsx("li", { children: "Drag elements onto the canvas" }),
        /* @__PURE__ */ jsx("li", { children: "Click + to add elements directly" }),
        /* @__PURE__ */ jsx("li", { children: "Wire event handles to triggers" }),
        /* @__PURE__ */ jsx("li", { children: "Del key removes selection" })
      ] })
    ] }) })
  ] });
}
function WorkflowLoadingScreen() {
  return /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3 text-muted-foreground", children: [
    /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Loading workflow…" })
  ] }) });
}
function ContentArea({ manager }) {
  const {
    view,
    projectId,
    goToList,
    goToCreate,
    goToEdit,
    onWorkflowCreated,
    isLoadingWorkflow,
    currentWorkflowId,
    currentWorkflowName,
    initialData
  } = manager;
  if (view.type === "list") {
    return /* @__PURE__ */ jsx(
      WorkflowList,
      {
        projectId,
        onEdit: goToEdit,
        onCreate: goToCreate
      }
    );
  }
  if (view.type === "create") {
    return /* @__PURE__ */ jsx(
      WorkflowCreator,
      {
        projectId,
        onSuccess: onWorkflowCreated,
        onCancel: goToList
      }
    );
  }
  if (view.type === "edit") {
    if (isLoadingWorkflow) return /* @__PURE__ */ jsx(WorkflowLoadingScreen, {});
    return /* @__PURE__ */ jsx(
      WorkflowEditor,
      {
        workflowId: currentWorkflowId,
        workflowName: currentWorkflowName,
        initialWorkflow: initialData ?? { nodes: [], connections: [] },
        onBack: goToList,
        className: "h-full"
      }
    );
  }
  return null;
}
const EventWorkflowManagerDialog = ({
  projectId,
  isOpen,
  onOpenChange
}) => {
  const manager = useWorkflowManager({ projectId, isOpen });
  const { view, goToList, goToCreate } = manager;
  const handleNavigate = (viewType) => {
    if (viewType === "list") goToList();
    else if (viewType === "create") goToCreate();
  };
  const isEditView = view.type === "edit";
  return /* @__PURE__ */ jsx(Dialog, { open: isOpen, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-[95vw]! h-full p-0 flex flex-col gap-0 ", children: [
    /* @__PURE__ */ jsx(VisuallyHidden, { children: /* @__PURE__ */ jsx(DialogTitle, { children: getDialogTitle(view) }) }),
    /* @__PURE__ */ jsx(ManagerHeader, { view }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 overflow-hidden", children: [
      !isEditView && /* @__PURE__ */ jsx(
        ManagerSidebar,
        {
          activeViewType: view.type,
          onNavigate: handleNavigate
        }
      ),
      /* @__PURE__ */ jsx("main", { className: "flex-1 min-w-0 h-full", children: /* @__PURE__ */ jsx("div", { className: cn("h-full", isEditView ? "" : "p-4"), children: /* @__PURE__ */ jsx(ContentArea, { manager }) }) })
    ] })
  ] }) });
};
export {
  EventWorkflowManagerDialog
};
