import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useMemo, createContext, useContext, useRef, useCallback } from "react";
import { B as Button, I as Input, j as cn, f as Badge, J as Dialog, K as DialogContent, L as DialogHeader, M as DialogTitle } from "./prisma-Cq49YOYM.js";
import { Trash2, Plus, Loader2, X, ChevronRight, Save, ChevronDown, Edit, Eye, EyeOff, Search, ArrowUp, ArrowDown, ArrowUpDown, Database } from "lucide-react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { w as cmsService } from "./SelectComponent-t_K3xf5i.js";
import { A as AlertDialog, h as AlertDialogTrigger, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-DXOCWecy.js";
import { S as Switch } from "./switch-BAyAbQjo.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-UTDm6oxR.js";
import { createColumnHelper, useReactTable, getFilteredRowModel, getSortedRowModel, getCoreRowModel, flexRender } from "@tanstack/react-table";
import z from "zod";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-DKb-aivU.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPjHyyea.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "sonner";
import "uuid";
import "clsx";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "@hookform/resolvers/zod";
import "react-hook-form";
import "next-themes";
import "socket.io-client";
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
import "./textarea-BDhK7YnG.js";
import "./checkbox-BX2VzNwa.js";
const useCMSManager = () => {
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const queryClient = useQueryClient();
  const { data: contentTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ["contentTypes"],
    queryFn: cmsService.getContentTypes
  });
  const { data: contentFields = [], isLoading: fieldsLoading } = useQuery({
    queryKey: ["contentFields", selectedTypeId],
    queryFn: () => cmsService.getContentFieldsByContentType(selectedTypeId),
    enabled: !!selectedTypeId
  });
  const { data: contentItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["contentItems", selectedTypeId],
    queryFn: () => cmsService.getContentItemsByContentType(selectedTypeId),
    enabled: !!selectedTypeId
  });
  const createTypeMutation = useMutation({
    mutationFn: cmsService.createContentType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentTypes"] });
      console.log("Content type created successfully");
    },
    onError: (error) => {
      console.error("Failed to create content type");
    }
  });
  const updateTypeMutation = useMutation({
    mutationFn: ({ id, data }) => cmsService.updateContentType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentTypes"] });
      console.log("Content type updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update content type");
    }
  });
  const deleteTypeMutation = useMutation({
    mutationFn: cmsService.deleteContentType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentTypes"] });
      if (selectedTypeId) setSelectedTypeId("");
      console.log("Content type deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete content type");
    }
  });
  const createFieldMutation = useMutation({
    mutationFn: ({
      contentTypeId,
      data
    }) => cmsService.createContentField(contentTypeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentFields", selectedTypeId]
      });
      console.log("Content field created successfully");
    },
    onError: (error) => {
      console.error("Failed to create content field");
    }
  });
  const updateFieldMutation = useMutation({
    mutationFn: ({
      contentTypeId,
      fieldId,
      data
    }) => cmsService.updateContentField(contentTypeId, fieldId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentFields", selectedTypeId]
      });
      console.log("Content field updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update content field");
    }
  });
  const deleteFieldMutation = useMutation({
    mutationFn: ({
      contentTypeId,
      fieldId
    }) => cmsService.deleteContentField(contentTypeId, fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentFields", selectedTypeId]
      });
      console.log("Content field deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete content field");
    }
  });
  const createItemMutation = useMutation({
    mutationFn: ({
      contentTypeId,
      data
    }) => cmsService.createContentItem(contentTypeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentItems", selectedTypeId]
      });
      queryClient.invalidateQueries({
        queryKey: ["cms-public-content"]
      });
      queryClient.invalidateQueries({
        queryKey: ["cms-public-content-item"]
      });
      console.log("Content item created successfully");
    },
    onError: (error) => {
      console.error("Failed to create content item:", error);
    }
  });
  const updateItemMutation = useMutation({
    mutationFn: ({
      contentTypeId,
      itemId,
      data
    }) => cmsService.updateContentItem(contentTypeId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentItems", selectedTypeId]
      });
      queryClient.invalidateQueries({
        queryKey: ["cms-public-content"]
      });
      queryClient.invalidateQueries({
        queryKey: ["cms-public-content-item"]
      });
      console.log("Content item updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update content item");
    }
  });
  const deleteItemMutation = useMutation({
    mutationFn: ({
      contentTypeId,
      itemId
    }) => cmsService.deleteContentItem(contentTypeId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentItems", selectedTypeId]
      });
      queryClient.invalidateQueries({
        queryKey: ["cms-public-content"]
      });
      queryClient.invalidateQueries({
        queryKey: ["cms-public-content-item"]
      });
      console.log("Content item deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete content item");
    }
  });
  const handleCreateType = (data) => {
    createTypeMutation.mutate(data);
  };
  const handleCreateField = (data) => {
    if (selectedTypeId) {
      createFieldMutation.mutate({ contentTypeId: selectedTypeId, data });
    }
  };
  const handleCreateItem = (data) => {
    if (selectedTypeId) {
      createItemMutation.mutate({ contentTypeId: selectedTypeId, data });
    }
  };
  const selectType = (typeId) => {
    setSelectedTypeId(typeId);
  };
  return {
    // State
    selectedTypeId,
    // Data
    contentTypes,
    contentFields,
    contentItems,
    typesLoading,
    fieldsLoading,
    itemsLoading,
    // Mutations
    createTypeMutation,
    updateTypeMutation,
    deleteTypeMutation,
    createFieldMutation,
    updateFieldMutation,
    deleteFieldMutation,
    createItemMutation,
    updateItemMutation,
    deleteItemMutation,
    // Handlers
    handleCreateType,
    handleCreateField,
    handleCreateItem,
    selectType
  };
};
const CMSContext = createContext(null);
function useCMSContext() {
  const ctx = useContext(CMSContext);
  if (!ctx) throw new Error("useCMSContext must be used inside <CMSProvider>");
  return ctx;
}
function CMSProvider({ children }) {
  const manager = useCMSManager();
  const value = useMemo(
    () => ({
      selectedTypeId: manager.selectedTypeId,
      selectedType: manager.contentTypes.find(
        (t) => t.id === manager.selectedTypeId
      ),
      contentTypes: manager.contentTypes,
      contentFields: manager.contentFields,
      contentItems: manager.contentItems,
      typesLoading: manager.typesLoading,
      fieldsLoading: manager.fieldsLoading,
      itemsLoading: manager.itemsLoading,
      createTypeMutation: manager.createTypeMutation,
      updateTypeMutation: manager.updateTypeMutation,
      deleteTypeMutation: manager.deleteTypeMutation,
      createFieldMutation: manager.createFieldMutation,
      updateFieldMutation: manager.updateFieldMutation,
      deleteFieldMutation: manager.deleteFieldMutation,
      createItemMutation: manager.createItemMutation,
      updateItemMutation: manager.updateItemMutation,
      deleteItemMutation: manager.deleteItemMutation,
      selectType: manager.selectType,
      handleCreateType: manager.handleCreateType,
      handleCreateField: manager.handleCreateField,
      handleCreateItem: manager.handleCreateItem,
      handleDeleteType: (id) => manager.deleteTypeMutation.mutate(id),
      handleDeleteField: (contentTypeId, fieldId) => manager.deleteFieldMutation.mutate({ contentTypeId, fieldId }),
      handleDeleteItem: (contentTypeId, itemId) => manager.deleteItemMutation.mutate({ contentTypeId, itemId })
    }),
    [manager]
  );
  return /* @__PURE__ */ jsx(CMSContext.Provider, { value, children });
}
function DeleteDialog({
  label,
  description,
  onConfirm,
  isPending
}) {
  return /* @__PURE__ */ jsxs(AlertDialog, { children: [
    /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      Button,
      {
        size: "sm",
        variant: "ghost",
        className: "h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10",
        title: `Delete ${label}`,
        children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
      }
    ) }),
    /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxs(AlertDialogTitle, { children: [
          "Delete ",
          label
        ] }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: description })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: isPending, children: "Cancel" }),
        /* @__PURE__ */ jsx(
          AlertDialogAction,
          {
            onClick: onConfirm,
            disabled: isPending,
            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            children: isPending ? "Deleting…" : "Delete"
          }
        )
      ] })
    ] })
  ] });
}
function TypesSidebar() {
  const {
    contentTypes,
    selectedTypeId,
    typesLoading,
    createTypeMutation,
    deleteTypeMutation,
    selectType,
    handleCreateType,
    handleDeleteType
  } = useCMSContext();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const handleSave = () => {
    if (!name.trim()) return;
    handleCreateType({
      name: name.trim(),
      description: description.trim() || void 0
    });
    setName("");
    setDescription("");
    setAdding(false);
  };
  const handleCancel = () => {
    setAdding(false);
    setName("");
    setDescription("");
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full border-r bg-muted/20", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-3 h-10 border-b shrink-0", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Content Types" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          size: "sm",
          variant: "ghost",
          className: "h-6 w-6 p-0",
          onClick: () => setAdding(true),
          disabled: adding,
          title: "Add content type",
          children: /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" })
        }
      )
    ] }),
    adding && /* @__PURE__ */ jsxs("div", { className: "px-2 py-2 border-b space-y-1.5 bg-muted/30 shrink-0", children: [
      /* @__PURE__ */ jsx(
        Input,
        {
          autoFocus: true,
          placeholder: "Type name",
          value: name,
          onChange: (e) => setName(e.target.value),
          className: "h-7 text-xs",
          onKeyDown: (e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }
        }
      ),
      /* @__PURE__ */ jsx(
        Input,
        {
          placeholder: "Description (optional)",
          value: description,
          onChange: (e) => setDescription(e.target.value),
          className: "h-7 text-xs",
          onKeyDown: (e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            size: "sm",
            className: "h-6 text-xs flex-1",
            onClick: handleSave,
            disabled: !name.trim() || createTypeMutation.isPending,
            children: createTypeMutation.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : "Save"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            size: "sm",
            variant: "ghost",
            className: "h-6 w-6 p-0",
            onClick: handleCancel,
            children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", children: typesLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin text-muted-foreground" }) }) : contentTypes.length === 0 ? /* @__PURE__ */ jsx("p", { className: "px-3 py-6 text-center text-xs text-muted-foreground", children: "No types yet" }) : contentTypes.map((type) => /* @__PURE__ */ jsxs(
      "div",
      {
        onClick: () => selectType(type.id),
        className: cn(
          "group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors border-b border-border/40",
          selectedTypeId === type.id && "bg-accent text-accent-foreground"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx(
              ChevronRight,
              {
                className: cn(
                  "h-3 w-3 shrink-0 text-muted-foreground transition-transform",
                  selectedTypeId === type.id && "rotate-90 text-foreground"
                )
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium truncate", children: type.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
                type.fields?.length ?? 0,
                "f ·",
                " ",
                type.items?.length ?? 0,
                "i"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(
            DeleteDialog,
            {
              label: "Content Type",
              description: `Delete "${type.name}"? All associated fields and content items will also be removed.`,
              onConfirm: () => handleDeleteType(type.id),
              isPending: deleteTypeMutation.isPending
            }
          ) })
        ]
      },
      type.id
    )) })
  ] });
}
z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});
z.object({
  id: z.string().optional(),
  contentTypeId: z.string(),
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  required: z.boolean().default(false)
});
z.object({
  id: z.string().optional(),
  contentTypeId: z.string(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  published: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});
z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional()
});
z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  required: z.boolean()
});
const ContentItemFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  published: z.boolean()
});
function DeleteConfirm({
  label,
  description,
  onConfirm,
  isPending
}) {
  return /* @__PURE__ */ jsxs(AlertDialog, { children: [
    /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      Button,
      {
        size: "sm",
        variant: "ghost",
        className: "h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10",
        title: `Delete ${label}`,
        children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
      }
    ) }),
    /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxs(AlertDialogTitle, { children: [
          "Delete ",
          label
        ] }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: description })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: isPending, children: "Cancel" }),
        /* @__PURE__ */ jsx(
          AlertDialogAction,
          {
            onClick: onConfirm,
            disabled: isPending,
            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            children: isPending ? "Deleting…" : "Delete"
          }
        )
      ] })
    ] })
  ] });
}
const FIELD_TYPES = [
  "text",
  "textarea",
  "richtext",
  "number",
  "boolean",
  "date",
  "email",
  "url",
  "select",
  "multiselect"
];
function FieldForm({
  values,
  onChange,
  onSave,
  onCancel,
  isSaving,
  saveLabel
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground", children: "Name" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          autoFocus: true,
          value: values.name,
          onChange: (e) => onChange({ ...values, name: e.target.value }),
          className: "h-7 text-xs",
          onKeyDown: (e) => {
            if (e.key === "Enter") onSave();
            if (e.key === "Escape") onCancel();
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground", children: "Type" }),
      /* @__PURE__ */ jsxs(
        Select,
        {
          value: values.type,
          onValueChange: (v) => onChange({ ...values, type: v }),
          children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "h-7 text-xs", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: FIELD_TYPES.map((t) => /* @__PURE__ */ jsx(SelectItem, { value: t, className: "text-xs", children: t }, t)) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground", children: "Required" }),
      /* @__PURE__ */ jsx(
        Switch,
        {
          checked: values.required,
          onCheckedChange: (v) => onChange({ ...values, required: v })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-1 border-t", children: [
      /* @__PURE__ */ jsxs(
        Button,
        {
          size: "sm",
          className: "h-7 text-xs flex-1 gap-1",
          onClick: onSave,
          disabled: !values.name.trim() || isSaving,
          children: [
            isSaving ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-3 w-3" }),
            saveLabel
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          size: "sm",
          variant: "ghost",
          className: "h-7 w-7 p-0",
          onClick: onCancel,
          title: "Cancel",
          children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
        }
      )
    ] })
  ] });
}
function FieldHeaderCell({
  field,
  contentTypeId,
  updateMutation,
  deleteMutation,
  onDelete
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({
    name: field.name,
    type: field.type,
    required: field.required
  });
  const handleOpen = (next) => {
    if (next) {
      setValues({ name: field.name, type: field.type, required: field.required });
    }
    setOpen(next);
  };
  const save = () => {
    if (!values.name.trim()) return;
    updateMutation.mutate({ contentTypeId, fieldId: field.id, data: values });
    setOpen(false);
  };
  return /* @__PURE__ */ jsxs(Popover, { open, onOpenChange: handleOpen, children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      "button",
      {
        className: cn(
          "group/fh flex items-center gap-1 rounded px-1.5 py-0.5 -mx-1.5 whitespace-nowrap",
          "hover:bg-accent transition-colors",
          open && "bg-accent"
        ),
        title: "Click to edit field",
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold", children: field.name }),
          field.required && /* @__PURE__ */ jsx("span", { className: "text-destructive text-[10px] leading-none", children: "*" }),
          /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3 text-muted-foreground opacity-0 group-hover/fh:opacity-100 transition-opacity" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(
      PopoverContent,
      {
        side: "bottom",
        align: "start",
        className: "w-60 p-3",
        onOpenAutoFocus: (e) => e.preventDefault(),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Edit field" }),
            /* @__PURE__ */ jsx(
              DeleteConfirm,
              {
                label: "Field",
                description: `Delete field "${field.name}"? All stored values for this field will also be removed.`,
                onConfirm: () => {
                  onDelete(contentTypeId, field.id);
                  setOpen(false);
                },
                isPending: deleteMutation.isPending
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            FieldForm,
            {
              values,
              onChange: setValues,
              onSave: save,
              onCancel: () => setOpen(false),
              isSaving: updateMutation.isPending,
              saveLabel: "Save"
            }
          )
        ]
      }
    )
  ] });
}
const DEFAULT_VALUES = {
  name: "",
  type: "text",
  required: false
};
function AddFieldHeaderCell({
  contentTypeId,
  createMutation,
  onCreate
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(DEFAULT_VALUES);
  const handleOpen = (next) => {
    if (!next) setValues(DEFAULT_VALUES);
    setOpen(next);
  };
  const save = () => {
    if (!values.name.trim()) return;
    onCreate(values);
    setValues(DEFAULT_VALUES);
    setOpen(false);
  };
  return /* @__PURE__ */ jsxs(Popover, { open, onOpenChange: handleOpen, children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      Button,
      {
        size: "sm",
        variant: "ghost",
        className: cn(
          "h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent",
          open && "bg-accent text-foreground"
        ),
        title: "Add field",
        disabled: !contentTypeId,
        children: /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" })
      }
    ) }),
    /* @__PURE__ */ jsxs(
      PopoverContent,
      {
        side: "bottom",
        align: "start",
        className: "w-60 p-3",
        onOpenAutoFocus: (e) => e.preventDefault(),
        children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3", children: "New field" }),
          /* @__PURE__ */ jsx(
            FieldForm,
            {
              values,
              onChange: setValues,
              onSave: save,
              onCancel: () => setOpen(false),
              isSaving: createMutation.isPending,
              saveLabel: "Add field"
            }
          )
        ]
      }
    )
  ] });
}
function EditableCell({
  itemId,
  editingIdRef,
  renderEdit,
  renderView
}) {
  const isEditing = editingIdRef.current === itemId;
  return /* @__PURE__ */ jsx(Fragment, { children: isEditing ? renderEdit() : renderView() });
}
function RowActions({
  item,
  editingIdRef,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  selectedTypeId,
  isSaving,
  isDeleting
}) {
  const isEdit = editingIdRef.current === item.id;
  return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: isEdit ? /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        size: "sm",
        variant: "ghost",
        className: "h-7 w-7 p-0",
        onClick: () => onSave(item.id),
        disabled: isSaving,
        title: "Save",
        children: isSaving ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-3.5 w-3.5" })
      }
    ),
    /* @__PURE__ */ jsx(
      Button,
      {
        size: "sm",
        variant: "ghost",
        className: "h-7 w-7 p-0",
        onClick: onCancel,
        title: "Cancel",
        children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
      }
    )
  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        size: "sm",
        variant: "ghost",
        className: "h-7 w-7 p-0",
        onClick: () => onEdit(item),
        title: "Edit row",
        children: /* @__PURE__ */ jsx(Edit, { className: "h-3.5 w-3.5" })
      }
    ),
    /* @__PURE__ */ jsx(
      DeleteConfirm,
      {
        label: "Content Item",
        description: `Delete "${item.title}"? This cannot be undone.`,
        onConfirm: () => onDelete(selectedTypeId, item.id),
        isPending: isDeleting
      }
    )
  ] }) });
}
function SortableHeader({
  column,
  children
}) {
  const dir = column.getIsSorted();
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: () => column.toggleSorting(dir === "asc"),
      className: "flex items-center gap-1 group/sort text-xs font-semibold",
      children: [
        children,
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/40 group-hover/sort:text-muted-foreground transition-colors", children: dir === "asc" ? /* @__PURE__ */ jsx(ArrowUp, { className: "h-3 w-3" }) : dir === "desc" ? /* @__PURE__ */ jsx(ArrowDown, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ArrowUpDown, { className: "h-3 w-3" }) })
      ]
    }
  );
}
function CMSTable() {
  const {
    selectedTypeId,
    selectedType,
    contentFields,
    contentItems,
    fieldsLoading,
    itemsLoading,
    createFieldMutation,
    updateFieldMutation,
    deleteFieldMutation,
    createItemMutation,
    updateItemMutation,
    deleteItemMutation,
    handleCreateField,
    handleCreateItem,
    handleDeleteField,
    handleDeleteItem
  } = useCMSContext();
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    title: "",
    slug: "",
    published: false,
    fieldValues: {}
  });
  const editingIdRef = useRef(null);
  const editValuesRef = useRef({
    title: "",
    slug: "",
    published: false,
    fieldValues: {}
  });
  const setEditValuesStable = useCallback(
    (updater) => {
      const next = updater(editValuesRef.current);
      editValuesRef.current = next;
      setEditValues(next);
    },
    []
  );
  const [newRow, setNewRow] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const columnHelper = createColumnHelper();
  const fieldValuesMap = useMemo(() => {
    const map = {};
    contentItems.forEach((item) => {
      map[item.id] = {};
      item.fieldValues?.forEach((fv) => {
        map[item.id][fv.fieldId] = fv.value ?? "";
      });
    });
    return map;
  }, [contentItems]);
  const startEdit = useCallback(
    (item) => {
      const vals = {
        title: item.title,
        slug: item.slug,
        published: item.published,
        fieldValues: { ...fieldValuesMap[item.id] }
      };
      editValuesRef.current = vals;
      editingIdRef.current = item.id;
      setEditValues(vals);
      setEditingId(item.id);
    },
    [fieldValuesMap]
  );
  const cancelEdit = useCallback(() => {
    editingIdRef.current = null;
    setEditingId(null);
  }, []);
  const saveEdit = useCallback(
    (itemId) => {
      const v = editValuesRef.current;
      updateItemMutation.mutate({
        contentTypeId: selectedTypeId,
        itemId,
        data: {
          title: v.title,
          slug: v.slug,
          published: v.published,
          fieldValues: Object.entries(v.fieldValues).map(
            ([fieldId, value]) => ({ fieldId, value })
          )
        }
      });
      editingIdRef.current = null;
      setEditingId(null);
    },
    [updateItemMutation, selectedTypeId]
  );
  const saveNew = () => {
    if (!newRow) return;
    const result = ContentItemFormSchema.safeParse({
      title: newRow.title,
      slug: newRow.slug,
      published: newRow.published
    });
    if (!result.success) return;
    handleCreateItem({
      ...result.data,
      fieldValues: Object.entries(newRow.fieldValues).map(
        ([fieldId, value]) => ({ fieldId, value })
      )
    });
    setNewRow(null);
  };
  const openNewRow = () => {
    const fv = {};
    contentFields.forEach((f) => {
      fv[f.id] = "";
    });
    setNewRow({ title: "", slug: "", published: false, fieldValues: fv });
  };
  const columns = useMemo(() => {
    const base = [
      columnHelper.accessor("title", {
        header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, children: "Title" }),
        cell: ({ row, getValue }) => /* @__PURE__ */ jsx(
          EditableCell,
          {
            itemId: row.original.id,
            editingIdRef,
            renderEdit: () => /* @__PURE__ */ jsx(
              Input,
              {
                autoFocus: true,
                defaultValue: editValuesRef.current.title,
                onChange: (e) => setEditValuesStable((p) => ({ ...p, title: e.target.value })),
                onKeyDown: (e) => {
                  if (e.key === "Enter") saveEdit(row.original.id);
                  if (e.key === "Escape") cancelEdit();
                },
                className: "h-7 text-xs min-w-32"
              }
            ),
            renderView: () => /* @__PURE__ */ jsx("span", { className: "font-medium text-sm", children: getValue() })
          }
        )
      }),
      columnHelper.accessor("slug", {
        header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, children: "Slug" }),
        cell: ({ row, getValue }) => /* @__PURE__ */ jsx(
          EditableCell,
          {
            itemId: row.original.id,
            editingIdRef,
            renderEdit: () => /* @__PURE__ */ jsx(
              Input,
              {
                defaultValue: editValuesRef.current.slug,
                onChange: (e) => setEditValuesStable((p) => ({ ...p, slug: e.target.value })),
                onKeyDown: (e) => {
                  if (e.key === "Enter") saveEdit(row.original.id);
                  if (e.key === "Escape") cancelEdit();
                },
                className: "h-7 text-xs font-mono min-w-32"
              }
            ),
            renderView: () => /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-muted-foreground", children: getValue() })
          }
        )
      }),
      columnHelper.accessor("published", {
        header: "Status",
        cell: ({ row, getValue }) => /* @__PURE__ */ jsx(
          EditableCell,
          {
            itemId: row.original.id,
            editingIdRef,
            renderEdit: () => /* @__PURE__ */ jsx(
              Switch,
              {
                defaultChecked: editValuesRef.current.published,
                onCheckedChange: (v) => setEditValuesStable((p) => ({ ...p, published: v }))
              }
            ),
            renderView: () => /* @__PURE__ */ jsxs(
              Badge,
              {
                variant: getValue() ? "default" : "secondary",
                className: "gap-1 text-xs",
                children: [
                  getValue() ? /* @__PURE__ */ jsx(Eye, { className: "h-2.5 w-2.5" }) : /* @__PURE__ */ jsx(EyeOff, { className: "h-2.5 w-2.5" }),
                  getValue() ? "Published" : "Draft"
                ]
              }
            )
          }
        )
      })
    ];
    const fieldCols = contentFields.map(
      (field) => ({
        id: `field-${field.id}`,
        enableSorting: false,
        header: () => /* @__PURE__ */ jsx(
          FieldHeaderCell,
          {
            field,
            contentTypeId: selectedTypeId,
            updateMutation: updateFieldMutation,
            deleteMutation: deleteFieldMutation,
            onDelete: handleDeleteField
          }
        ),
        cell: ({ row }) => {
          const item = row.original;
          const stored = fieldValuesMap[item.id]?.[field.id] ?? "";
          return /* @__PURE__ */ jsx(
            EditableCell,
            {
              itemId: item.id,
              editingIdRef,
              renderEdit: () => /* @__PURE__ */ jsx(
                Input,
                {
                  defaultValue: editValuesRef.current.fieldValues[field.id] ?? stored,
                  onChange: (e) => setEditValuesStable((p) => ({
                    ...p,
                    fieldValues: {
                      ...p.fieldValues,
                      [field.id]: e.target.value
                    }
                  })),
                  className: "h-7 text-xs min-w-32"
                }
              ),
              renderView: () => /* @__PURE__ */ jsx(
                "span",
                {
                  className: "text-xs text-muted-foreground block truncate max-w-16",
                  title: stored,
                  children: stored || "—"
                }
              )
            }
          );
        }
      })
    );
    const addFieldCol = {
      id: "__add_field__",
      enableSorting: false,
      header: () => /* @__PURE__ */ jsx(
        AddFieldHeaderCell,
        {
          contentTypeId: selectedTypeId,
          createMutation: createFieldMutation,
          onCreate: handleCreateField
        }
      ),
      cell: () => null
    };
    const actionsCol = columnHelper.display({
      id: "actions",
      header: () => /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground", children: "Actions" }),
      cell: ({ row }) => /* @__PURE__ */ jsx(
        RowActions,
        {
          item: row.original,
          editingIdRef,
          onEdit: startEdit,
          onSave: saveEdit,
          onCancel: cancelEdit,
          onDelete: handleDeleteItem,
          selectedTypeId,
          isSaving: updateItemMutation.isPending,
          isDeleting: deleteItemMutation.isPending
        }
      )
    });
    return [...base, ...fieldCols, addFieldCol, actionsCol];
  }, [
    contentFields,
    fieldValuesMap,
    selectedTypeId,
    updateItemMutation.isPending,
    deleteItemMutation.isPending,
    updateFieldMutation,
    deleteFieldMutation,
    createFieldMutation,
    handleDeleteField,
    handleCreateField,
    handleDeleteItem,
    startEdit,
    saveEdit,
    cancelEdit,
    setEditValuesStable
  ]);
  const table = useReactTable({
    data: contentItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter }
  });
  const isLoading = fieldsLoading || itemsLoading;
  const colSpan = 3 + contentFields.length + 2;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full min-h-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 px-4 h-12 border-b shrink-0 bg-background", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 min-w-0", children: selectedType ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm truncate", children: selectedType.name }),
        selectedType.description && /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground truncate hidden sm:block", children: [
          "— ",
          selectedType.description
        ] }),
        /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "text-[10px] shrink-0", children: [
          contentFields.length,
          " fields"
        ] }),
        /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-[10px] shrink-0", children: [
          table.getRowModel().rows.length,
          " / ",
          contentItems.length,
          " items"
        ] })
      ] }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Select a content type" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        selectedTypeId && /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: "Search…",
              value: globalFilter,
              onChange: (e) => setGlobalFilter(e.target.value),
              className: "h-8 pl-8 w-44 text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            className: "h-8 gap-1.5",
            onClick: openNewRow,
            disabled: !selectedTypeId || !!newRow || isLoading,
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
              "Add item"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0 flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { className: "sticky top-0 z-10", children: table.getHeaderGroups().map((hg) => /* @__PURE__ */ jsx(TableRow, { className: "bg-muted/70 hover:bg-muted/70", children: hg.headers.map((header) => /* @__PURE__ */ jsx(
          TableHead,
          {
            className: "h-9 px-3 whitespace-nowrap",
            children: header.isPlaceholder ? null : flexRender(
              header.column.columnDef.header,
              header.getContext()
            )
          },
          header.id
        )) }, hg.id)) }),
        /* @__PURE__ */ jsxs(TableBody, { children: [
          newRow && /* @__PURE__ */ jsxs(TableRow, { className: "bg-primary/5 hover:bg-primary/5", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-3 py-1.5", children: /* @__PURE__ */ jsx(
              Input,
              {
                autoFocus: true,
                value: newRow.title,
                onChange: (e) => setNewRow((p) => p && { ...p, title: e.target.value }),
                placeholder: "Title",
                className: "h-7 text-xs min-w-32",
                onKeyDown: (e) => {
                  if (e.key === "Enter") saveNew();
                  if (e.key === "Escape") setNewRow(null);
                }
              }
            ) }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-3 py-1.5", children: /* @__PURE__ */ jsx(
              Input,
              {
                value: newRow.slug,
                onChange: (e) => setNewRow((p) => p && { ...p, slug: e.target.value }),
                placeholder: "slug",
                className: "h-7 text-xs font-mono min-w-32"
              }
            ) }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-3 py-1.5", children: /* @__PURE__ */ jsx(
              Switch,
              {
                checked: newRow.published,
                onCheckedChange: (v) => setNewRow((p) => p && { ...p, published: v })
              }
            ) }),
            contentFields.map((field) => /* @__PURE__ */ jsx(TableCell, { className: "px-3 py-1.5", children: /* @__PURE__ */ jsx(
              Input,
              {
                value: newRow.fieldValues[field.id] ?? "",
                onChange: (e) => setNewRow(
                  (p) => p && {
                    ...p,
                    fieldValues: {
                      ...p.fieldValues,
                      [field.id]: e.target.value
                    }
                  }
                ),
                placeholder: field.name,
                className: "h-7 text-xs min-w-32"
              }
            ) }, field.id)),
            /* @__PURE__ */ jsx(TableCell, { className: "px-3 py-1.5" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-3 py-1.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  className: "h-7 w-7 p-0",
                  onClick: saveNew,
                  disabled: !newRow.title.trim() || createItemMutation.isPending,
                  title: "Save",
                  children: createItemMutation.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-3.5 w-3.5" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  className: "h-7 w-7 p-0",
                  onClick: () => setNewRow(null),
                  title: "Cancel",
                  children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
                }
              )
            ] }) })
          ] }),
          isLoading && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan, className: "py-20 text-center", children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin mx-auto text-muted-foreground" }) }) }),
          !isLoading && !selectedTypeId && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(
            TableCell,
            {
              colSpan,
              className: "py-20 text-center text-sm text-muted-foreground",
              children: "Select a content type from the left panel"
            }
          ) }),
          !isLoading && selectedTypeId && contentItems.length === 0 && !newRow && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsxs(
            TableCell,
            {
              colSpan,
              className: "py-20 text-center text-sm text-muted-foreground",
              children: [
                "No items yet —",
                " ",
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: openNewRow,
                    className: "underline underline-offset-2 hover:text-foreground transition-colors",
                    children: "add the first one"
                  }
                )
              ]
            }
          ) }),
          !isLoading && table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx(
            TableRow,
            {
              className: cn(
                "hover:bg-muted/40 transition-colors",
                editingId === row.original.id && "bg-muted/30"
              ),
              children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx(TableCell, { className: "px-3 py-2", children: flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              ) }, cell.id))
            },
            row.id
          ))
        ] })
      ] }) }),
      selectedTypeId && !newRow && !isLoading && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: openNewRow,
          className: "shrink-0 w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors border-t",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
            "Add item"
          ]
        }
      )
    ] })
  ] });
}
function CMSManagerDialog() {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "outline",
        size: "sm",
        className: "w-full gap-2 justify-start",
        onClick: () => setOpen(true),
        children: [
          /* @__PURE__ */ jsx(Database, { className: "h-3.5 w-3.5" }),
          "Open CMS Manager"
        ]
      }
    ),
    /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-[92vw]! w-[92vw] h-[90vh] max-h-[90vh] p-0 flex flex-col gap-0 overflow-hidden", children: [
      /* @__PURE__ */ jsx(DialogHeader, { className: "px-5 py-3 border-b shrink-0", children: /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2 text-base", children: [
        /* @__PURE__ */ jsx(Database, { className: "h-4 w-4" }),
        "CMS Manager"
      ] }) }),
      /* @__PURE__ */ jsx(CMSProvider, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-1 min-h-0 overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "w-52 shrink-0 overflow-hidden", children: /* @__PURE__ */ jsx(TypesSidebar, {}) }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0 overflow-hidden flex flex-col", children: /* @__PURE__ */ jsx(CMSTable, {}) })
      ] }) })
    ] }) })
  ] });
}
export {
  CMSManagerDialog as default
};
