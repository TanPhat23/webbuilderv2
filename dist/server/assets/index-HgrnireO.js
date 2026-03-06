import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { U as URLBuilder, A as API_ENDPOINTS, a as apiClient, f as Badge, O as Label, I as Input, B as Button, V as useUserProjects, a2 as marketplaceItemSchema, J as Dialog, K as DialogContent, L as DialogHeader, M as DialogTitle, N as DialogDescription, a3 as Form, a4 as FormField, a5 as FormItem, a6 as FormLabel, a7 as FormControl, a8 as FormMessage, a9 as FormDescription, Q as DialogFooter, aa as useDeleteProject, ab as usePublishProject, l as SidebarTrigger, G as CreateProjectDialog } from "./prisma-Cq49YOYM.js";
import { S as Separator } from "./separator-4Scmx0hq.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-BXjpjbuA.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPjHyyea.js";
import { X, Search, Loader2, Plus, Crown, Upload, SortAsc, SortDesc, Filter, Grid, List, BarChart3, MoreHorizontal, Edit, Settings, Trash2, EyeOff, Globe, Eye, Calendar } from "lucide-react";
import { useState, useMemo } from "react";
import "clsx";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-DXOCWecy.js";
import { useNavigate } from "@tanstack/react-router";
import { C as Card, b as CardHeader, a as CardContent } from "./card-LOcGasZb.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem, d as DropdownMenuSeparator } from "./dropdown-menu-B0s9PypA.js";
import "sonner";
import "next-themes";
import "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { T as Textarea } from "./textarea-BDhK7YnG.js";
import { C as Checkbox } from "./checkbox-BX2VzNwa.js";
import { d as useCreateMarketplaceItem, e as useUpdateMarketplaceItem, f as useMarketplaceItem, c as useCategories, g as useTags, h as useDeleteMarketplaceItem, u as useMarketplaceItems } from "./useMarketplace-8BTY40FU.js";
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
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
function canPublishToMarketplace(planId) {
  return planId === "pro" || planId === "enterprise";
}
function getPlanLimits(planId) {
  return {
    canPublishToMarketplace: canPublishToMarketplace(planId)
  };
}
const userPlanKeys = {
  all: ["user-plan"],
  detail: () => [...userPlanKeys.all]
};
function useUserPlan() {
  return useQuery({
    queryKey: userPlanKeys.detail(),
    queryFn: async () => {
      try {
        const data = await subscriptionService.getSubscriptionStatus();
        if (!data.hasActiveSubscription || !data.subscription) {
          const limits2 = getPlanLimits("hobby");
          return {
            plan: "hobby",
            hasActiveSubscription: false,
            ...limits2
          };
        }
        const planId = data.subscription.planId;
        const limits = getPlanLimits(planId);
        return {
          plan: planId,
          hasActiveSubscription: true,
          subscriptionEndDate: data.subscription.endDate,
          daysUntilExpiry: data.subscription.daysUntilExpiry,
          ...limits
        };
      } catch {
        const limits = getPlanLimits("hobby");
        return {
          plan: "hobby",
          hasActiveSubscription: false,
          ...limits
        };
      }
    }
  });
}
const subscriptionService = {
  getSubscriptionStatus: async () => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.SUBSCRIPTION.STATUS).build();
    return apiClient.get(url);
  },
  getAllSubscriptions: async () => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.SUBSCRIPTION.GET).build();
    return apiClient.get(url);
  },
  createPayment: async (data) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.VNPAY.CREATE_PAYMENT).build();
    return apiClient.post(url, data);
  },
  cancelSubscription: async (data) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.SUBSCRIPTION.CANCEL).build();
    return apiClient.post(url, data);
  }
};
function TagSelector({
  selectedExistingTags,
  onToggleExistingTag,
  customTags,
  onAddTag,
  onRemoveTag,
  existingTags,
  isTagsLoading
}) {
  const [tagInput, setTagInput] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const filteredExistingTags = useMemo(() => {
    if (!existingTags) return [];
    if (!tagSearch.trim()) return existingTags;
    return existingTags.filter(
      (tag) => tag.name.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [existingTags, tagSearch]);
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !customTags.includes(trimmedTag)) {
      if (customTags.length < 10) {
        onAddTag(trimmedTag);
        setTagInput("");
      }
    }
  };
  const handleRemoveTag = (tagToRemove) => {
    onRemoveTag(tagToRemove);
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    (selectedExistingTags.length > 0 || customTags.length > 0) && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-md", children: [
      selectedExistingTags.map((tagName) => /* @__PURE__ */ jsxs(
        Badge,
        {
          variant: "default",
          className: "cursor-pointer text-xs",
          onClick: () => onToggleExistingTag(tagName),
          children: [
            tagName,
            /* @__PURE__ */ jsx(X, { className: "h-3 w-3 ml-1" })
          ]
        },
        `existing-${tagName}`
      )),
      customTags.map((tag) => /* @__PURE__ */ jsxs(
        Badge,
        {
          variant: "secondary",
          className: "cursor-pointer text-xs",
          onClick: () => handleRemoveTag(tag),
          children: [
            tag,
            /* @__PURE__ */ jsx(X, { className: "h-3 w-3 ml-1" })
          ]
        },
        `custom-${tag}`
      ))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Existing Tags" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: "Search...",
              value: tagSearch,
              onChange: (e) => setTagSearch(e.target.value),
              className: "pl-7 h-8 text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-h-20 overflow-y-auto space-y-1", children: isTagsLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-2", children: /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) }) : filteredExistingTags.length > 0 ? filteredExistingTags.slice(0, 5).map((tag, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center space-x-2 hover:bg-muted/50 rounded px-2 py-1",
            children: [
              /* @__PURE__ */ jsx(
                Checkbox,
                {
                  id: `tag-${tag.id}`,
                  checked: selectedExistingTags.includes(tag.name),
                  onCheckedChange: () => onToggleExistingTag(tag.name),
                  className: "h-3 w-3"
                }
              ),
              /* @__PURE__ */ jsx(
                Label,
                {
                  htmlFor: `tag-${tag.id}`,
                  className: "text-xs cursor-pointer flex-1",
                  children: tag.name
                }
              )
            ]
          },
          `tag-${tag.id || index}`
        )) : /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center py-2", children: "No tags found" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Custom Tags" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: "Add tag...",
              value: tagInput,
              onChange: (e) => setTagInput(e.target.value),
              onKeyDown: handleKeyPress,
              className: "h-8 text-sm"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              onClick: handleAddTag,
              disabled: !tagInput.trim() || customTags.length >= 10,
              className: "h-8 px-2",
              children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          selectedExistingTags.length + customTags.length,
          "/10 tags"
        ] })
      ] })
    ] })
  ] });
}
function CategorySelector({
  selectedCategories,
  onToggleCategory,
  categories,
  isCategoriesLoading
}) {
  const [categorySearch, setCategorySearch] = useState("");
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!categorySearch.trim()) return categories;
    return categories.filter(
      (category) => category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    selectedCategories.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-md", children: selectedCategories.map((categoryId) => {
      const category = categories?.find((c) => c.id === categoryId);
      return category ? /* @__PURE__ */ jsxs(
        Badge,
        {
          variant: "default",
          className: "cursor-pointer text-xs",
          onClick: () => onToggleCategory(categoryId),
          children: [
            category.name,
            /* @__PURE__ */ jsx(X, { className: "h-3 w-3 ml-1" })
          ]
        },
        categoryId
      ) : null;
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          placeholder: "Search categories...",
          value: categorySearch,
          onChange: (e) => setCategorySearch(e.target.value),
          className: "pl-7 h-8 text-sm"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "max-h-20 overflow-y-auto space-y-1", children: isCategoriesLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-2", children: /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) }) : filteredCategories.length > 0 ? filteredCategories.slice(0, 6).map((category, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-center space-x-2 hover:bg-muted/50 rounded px-2 py-1",
        children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              id: `category-${category.id}`,
              checked: selectedCategories.includes(category.id),
              onCheckedChange: () => onToggleCategory(category.id),
              className: "h-3 w-3"
            }
          ),
          /* @__PURE__ */ jsx(
            Label,
            {
              htmlFor: `category-${category.id}`,
              className: "text-xs cursor-pointer flex-1",
              children: category.name
            }
          )
        ]
      },
      `category-${category.id || index}`
    )) : /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center py-2", children: "No categories found" }) })
  ] });
}
const formSchema = marketplaceItemSchema;
function CreateMarketplaceItemDialog({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultProjectId,
  itemId
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== void 0 ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedExistingTags, setSelectedExistingTags] = useState(
    []
  );
  const createItem = useCreateMarketplaceItem();
  const updateItem = useUpdateMarketplaceItem();
  const { data: existingItem } = useMarketplaceItem(itemId || "", !!itemId);
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: existingTags, isLoading: isTagsLoading } = useTags();
  const { data: projects, isLoading: isProjectsLoading } = useUserProjects();
  const { data: userPlan } = useUserPlan();
  const canPublish = userPlan?.canPublishToMarketplace ?? false;
  const defaultValues = useMemo(() => {
    if (existingItem) {
      return {
        projectId: existingItem.projectId || "",
        title: existingItem.title,
        description: existingItem.description,
        preview: existingItem.preview || "",
        templateType: existingItem.templateType,
        featured: existingItem.featured || false,
        pageCount: existingItem.pageCount,
        tags: (existingItem.tags || []).map((tag) => typeof tag === "string" ? tag : tag?.name || "").filter(Boolean),
        categoryIds: existingItem.categories?.map((c) => c.id) || []
      };
    }
    return {
      projectId: defaultProjectId || "",
      title: "",
      description: "",
      preview: "",
      templateType: "block",
      featured: false,
      pageCount: void 0,
      tags: [],
      categoryIds: []
    };
  }, [defaultProjectId, existingItem]);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  form.getValues("tags");
  const handleAddTag = (tag) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", [...currentTags, tag]);
  };
  const handleRemoveTag = (tag) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag)
    );
  };
  const toggleCategory = (categoryId) => {
    const newCategories = selectedCategories.includes(categoryId) ? selectedCategories.filter((id) => id !== categoryId) : [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
    form.setValue("categoryIds", newCategories);
  };
  const toggleExistingTag = (tagName) => {
    const newTags = selectedExistingTags.includes(tagName) ? selectedExistingTags.filter((tag) => tag !== tagName) : [...selectedExistingTags, tagName];
    setSelectedExistingTags(newTags);
  };
  const onSubmit = async (data) => {
    try {
      if (itemId) {
        const payload = {
          title: data.title,
          description: data.description,
          preview: data.preview || void 0,
          templateType: data.templateType,
          featured: data.featured,
          pageCount: data.pageCount,
          tags: [...data.tags, ...selectedExistingTags],
          categoryIds: selectedCategories
        };
        await updateItem.mutateAsync({ id: itemId, data: payload });
      } else {
        const payload = {
          projectId: data.projectId,
          title: data.title,
          description: data.description,
          preview: data.preview || void 0,
          templateType: data.templateType,
          featured: data.featured,
          pageCount: data.pageCount,
          tags: [...data.tags, ...selectedExistingTags],
          categoryIds: selectedCategories
        };
        await createItem.mutateAsync(payload);
      }
      setOpen(false);
      form.reset();
      setSelectedCategories([]);
      setSelectedExistingTags([]);
    } catch (error) {
      console.error("Failed to save marketplace item:", error);
    }
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto p-6", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { className: "pb-4", children: [
      /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl", children: itemId ? "Update Marketplace Item" : "Upload Template to Marketplace" }),
      /* @__PURE__ */ jsx(DialogDescription, { children: itemId ? "Update your template details." : "Share your project as a template with the community." })
    ] }),
    /* @__PURE__ */ jsx(Form, { ...form, children: /* @__PURE__ */ jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-5", children: [
      !canPublish && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg", children: [
        /* @__PURE__ */ jsx(Crown, { className: "h-5 w-5 text-yellow-600 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-yellow-600 mb-1", children: "Gói Hobby không thể publish lên Marketplace" }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
            "Nâng cấp lên ",
            /* @__PURE__ */ jsx("strong", { children: "Pro" }),
            " hoặc",
            " ",
            /* @__PURE__ */ jsx("strong", { children: "Enterprise" }),
            " để chia sẻ template với cộng đồng."
          ] })
        ] })
      ] }),
      !itemId && /* @__PURE__ */ jsx(
        FormField,
        {
          control: form.control,
          name: "projectId",
          render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
            /* @__PURE__ */ jsx(FormLabel, { className: "text-sm font-medium", children: "Select Project *" }),
            /* @__PURE__ */ jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Choose a project to template" }) }) }),
              /* @__PURE__ */ jsx(SelectContent, { children: isProjectsLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-6", children: [
                /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
                /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm", children: "Loading projects..." })
              ] }) : projects && projects.length > 0 ? projects.map((project) => /* @__PURE__ */ jsxs(SelectItem, { value: project.id, children: [
                /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-primary rounded-full mr-2" }),
                project.name
              ] }, project.id)) : /* @__PURE__ */ jsx("div", { className: "py-6 text-center text-sm text-muted-foreground", children: "No projects available. Create a project first." }) })
            ] }),
            /* @__PURE__ */ jsx(FormMessage, {})
          ] })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "title",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsx(FormLabel, { className: "text-sm font-medium", children: "Title *" }),
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "My Awesome Template", ...field }) }),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "templateType",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsx(FormLabel, { className: "text-sm font-medium", children: "Type *" }),
              /* @__PURE__ */ jsxs(
                Select,
                {
                  onValueChange: field.onChange,
                  defaultValue: field.value,
                  children: [
                    /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select type" }) }) }),
                    /* @__PURE__ */ jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsx(SelectItem, { value: "full-site", children: "Full Website" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "page", children: "Single Page" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "section", children: "Section" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "block", children: "Block" })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        FormField,
        {
          control: form.control,
          name: "description",
          render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
            /* @__PURE__ */ jsx(FormLabel, { className: "text-sm font-medium", children: "Description *" }),
            /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
              Textarea,
              {
                placeholder: "Describe your template...",
                rows: 3,
                ...field
              }
            ) }),
            /* @__PURE__ */ jsx(FormMessage, {})
          ] })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "preview",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsx(FormLabel, { className: "text-sm font-medium", children: "Preview Image URL" }),
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                Input,
                {
                  placeholder: "https://example.com/preview.jpg",
                  ...field
                }
              ) }),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "pageCount",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsx(FormLabel, { className: "text-sm font-medium", children: "Pages" }),
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  placeholder: "1",
                  ...field,
                  value: field.value || "",
                  onChange: (e) => {
                    const value = e.target.value;
                    field.onChange(
                      value ? parseInt(value, 10) : void 0
                    );
                  }
                }
              ) }),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        FormField,
        {
          control: form.control,
          name: "tags",
          render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
            /* @__PURE__ */ jsx(FormLabel, { className: "text-sm font-medium", children: "Tags *" }),
            /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
              TagSelector,
              {
                selectedExistingTags,
                onToggleExistingTag: toggleExistingTag,
                customTags: form.getValues("tags"),
                onAddTag: handleAddTag,
                onRemoveTag: handleRemoveTag,
                existingTags,
                isTagsLoading
              }
            ) }),
            /* @__PURE__ */ jsx(FormMessage, {})
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        FormField,
        {
          control: form.control,
          name: "categoryIds",
          render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
            /* @__PURE__ */ jsx(FormLabel, { className: "text-sm font-medium", children: "Categories" }),
            /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
              CategorySelector,
              {
                selectedCategories,
                onToggleCategory: toggleCategory,
                categories,
                isCategoriesLoading
              }
            ) }),
            /* @__PURE__ */ jsx(FormMessage, {})
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        FormField,
        {
          control: form.control,
          name: "featured",
          render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { className: "flex flex-row items-center space-x-3 space-y-0", children: [
            /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
              Checkbox,
              {
                checked: field.value,
                onCheckedChange: field.onChange,
                className: "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-0 leading-none", children: [
              /* @__PURE__ */ jsx(FormLabel, { className: "text-sm font-medium cursor-pointer", children: "Featured Template" }),
              /* @__PURE__ */ jsx(FormDescription, { className: "text-xs", children: "Mark as featured (requires admin approval)" })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "pt-4 border-t", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => setOpen(false),
            disabled: createItem.isPending || updateItem.isPending,
            className: "flex-1 sm:flex-none",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            disabled: !canPublish || createItem.isPending || updateItem.isPending,
            className: "flex-1 sm:flex-none bg-primary hover:bg-primary/90",
            children: createItem.isPending || updateItem.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
              itemId ? "Updating..." : "Uploading..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 mr-2" }),
              itemId ? "Update Template" : "Upload Template"
            ] })
          }
        )
      ] })
    ] }) })
  ] }) });
}
function DashboardFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  showPublishedOnly,
  onPublishedFilterToggle,
  viewMode,
  onViewModeChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          placeholder: "Search projects...",
          value: searchQuery,
          onChange: (e) => onSearchChange(e.target.value),
          className: "pl-10"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxs(Select, { value: sortBy, onValueChange: onSortByChange, children: [
        /* @__PURE__ */ jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "views", children: "Views" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "name", children: "Name" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "created", children: "Created" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "modified", children: "Modified" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          size: "icon",
          onClick: onSortOrderChange,
          title: `Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`,
          children: sortOrder === "asc" ? /* @__PURE__ */ jsx(SortAsc, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(SortDesc, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: showPublishedOnly ? "default" : "outline",
          size: "icon",
          onClick: onPublishedFilterToggle,
          title: showPublishedOnly ? "Show all projects" : "Show published only",
          children: /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex border rounded-md", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: viewMode === "grid" ? "default" : "ghost",
            size: "icon",
            onClick: () => onViewModeChange("grid"),
            className: "rounded-r-none",
            title: "Grid view",
            children: /* @__PURE__ */ jsx(Grid, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: viewMode === "list" ? "default" : "ghost",
            size: "icon",
            onClick: () => onViewModeChange("list"),
            className: "rounded-l-none",
            title: "List view",
            children: /* @__PURE__ */ jsx(List, { className: "h-4 w-4" })
          }
        )
      ] })
    ] })
  ] });
}
function DeleteProjectDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  projectName
}) {
  return /* @__PURE__ */ jsx(AlertDialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
    /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
      /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Delete Project" }),
      /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
        "Are you sure you want to delete",
        " ",
        projectName ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: projectName }),
          "?"
        ] }) : "this project?",
        " ",
        "This action cannot be undone and will permanently remove all associated data, pages, and elements."
      ] })
    ] }),
    /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
      /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: isDeleting, children: "Cancel" }),
      /* @__PURE__ */ jsx(
        AlertDialogAction,
        {
          onClick: onConfirm,
          className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          disabled: isDeleting,
          children: isDeleting ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
            "Deleting..."
          ] }) : "Delete Project"
        }
      )
    ] })
  ] }) });
}
function EmptyState({
  hasSearchQuery,
  onCreateProject
}) {
  return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(BarChart3, { className: "h-12 w-12 text-muted-foreground" }) }),
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "No projects found" }),
    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: hasSearchQuery ? "Try adjusting your search terms or filters" : "Create your first project to get started" }),
    !hasSearchQuery && /* @__PURE__ */ jsxs(Button, { onClick: onCreateProject, children: [
      /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
      "Create Project"
    ] })
  ] });
}
function ProjectCard({
  project,
  onDelete,
  onPublish
}) {
  const navigate = useNavigate();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteItem = useDeleteMarketplaceItem();
  const { data: userPlan } = useUserPlan();
  const { data: marketplaceItems } = useMarketplaceItems();
  const marketplaceItem = marketplaceItems?.find(
    (item) => item.projectId === project.id
  );
  const canPublish = userPlan?.canPublishToMarketplace ?? false;
  const handleNavigate = (path) => (e) => {
    e.stopPropagation();
    navigate({ to: path });
  };
  const handlePublishToggle = (e) => {
    e.stopPropagation();
    onPublish(project.id ?? "", !!project.published);
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(project.id ?? "");
  };
  const handleMarketplaceDelete = async () => {
    if (!marketplaceItem?.id) return;
    try {
      await deleteItem.mutateAsync(marketplaceItem.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete marketplace item:", error);
    }
  };
  const formattedDate = project.updatedAt ? new Date(String(project.updatedAt)).toLocaleDateString() : "—";
  const viewsCount = (project.views ?? 0).toLocaleString();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Card, { className: "group hover:shadow-lg transition-all duration-200 cursor-pointer p-0", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "p-0", children: /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-t-lg", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "/placeholder.svg",
            alt: project.name ?? "Project thumbnail",
            className: "w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200",
            onClick: () => navigate({ to: `/editor/${project.id}` })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2", children: /* @__PURE__ */ jsx(Badge, { variant: project.published ? "default" : "secondary", children: project.published ? "Published" : "Draft" }) })
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-2", children: [
          /* @__PURE__ */ jsx(
            "h3",
            {
              className: "font-semibold text-lg truncate pr-2 cursor-pointer hover:text-primary",
              onClick: () => navigate({ to: `/editor/${project.id}` }),
              children: project.name
            }
          ),
          /* @__PURE__ */ jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
              /* @__PURE__ */ jsxs(
                DropdownMenuItem,
                {
                  onClick: handleNavigate(`/editor/${project.id}`),
                  children: [
                    /* @__PURE__ */ jsx(Edit, { className: "mr-2 h-4 w-4" }),
                    "Edit Project"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                DropdownMenuItem,
                {
                  onClick: handleNavigate(`/editor/${project.id}`),
                  children: [
                    /* @__PURE__ */ jsx(BarChart3, { className: "mr-2 h-4 w-4" }),
                    "View Analytics"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                DropdownMenuItem,
                {
                  onClick: handleNavigate(`/projectsettings/${project.id}`),
                  children: [
                    /* @__PURE__ */ jsx(Settings, { className: "mr-2 h-4 w-4" }),
                    "Project Settings"
                  ]
                }
              ),
              marketplaceItem ? /* @__PURE__ */ jsxs(
                DropdownMenuItem,
                {
                  className: "text-destructive",
                  disabled: deleteItem.isPending,
                  onClick: (e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  },
                  children: [
                    /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
                    "Delete from Marketplace"
                  ]
                }
              ) : project.published ? /* @__PURE__ */ jsxs(
                DropdownMenuItem,
                {
                  disabled: !canPublish,
                  onClick: (e) => {
                    e.stopPropagation();
                    if (canPublish) {
                      setShowUploadDialog(true);
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsx(Upload, { className: "mr-2 h-4 w-4" }),
                    "Upload to Marketplace",
                    !canPublish && /* @__PURE__ */ jsx(Crown, { className: "ml-auto h-4 w-4 text-yellow-500" })
                  ]
                }
              ) : null,
              /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
              /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: handlePublishToggle, children: project.published ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(EyeOff, { className: "mr-2 h-4 w-4" }),
                "Unpublish"
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Globe, { className: "mr-2 h-4 w-4" }),
                "Publish"
              ] }) }),
              /* @__PURE__ */ jsxs(
                DropdownMenuItem,
                {
                  className: "text-destructive",
                  onClick: handleDelete,
                  children: [
                    /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
                    "Delete"
                  ]
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-3 line-clamp-2", children: project.description || "No description provided" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(Eye, { className: "mr-1 h-4 w-4" }),
            viewsCount,
            " views"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "mr-1 h-4 w-4" }),
            formattedDate
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      CreateMarketplaceItemDialog,
      {
        open: showUploadDialog,
        onOpenChange: setShowUploadDialog,
        defaultProjectId: project.id,
        itemId: marketplaceItem?.id
      }
    ),
    /* @__PURE__ */ jsx(AlertDialog, { open: showDeleteDialog, onOpenChange: setShowDeleteDialog, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Delete from Marketplace" }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: "Are you sure you want to delete this item from the marketplace? This action cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsx(
          AlertDialogAction,
          {
            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            disabled: deleteItem.isPending,
            onClick: handleMarketplaceDelete,
            children: deleteItem.isPending ? "Deleting..." : "Delete"
          }
        )
      ] })
    ] }) })
  ] });
}
function ProjectListItem({
  project,
  onDelete,
  onPublish
}) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate({ to: `/editor/${project.id}` });
  };
  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate({ to: `/editor/${project.id}` });
  };
  return /* @__PURE__ */ jsx(Card, { className: "hover:shadow-md transition-shadow duration-200", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        src: "/placeholder.svg",
        alt: project.name ?? "Project thumbnail",
        className: "w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity",
        onClick: handleClick
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
        /* @__PURE__ */ jsx(
          "h3",
          {
            className: "font-semibold truncate pr-2 cursor-pointer hover:text-primary",
            onClick: handleClick,
            children: project.name
          }
        ),
        /* @__PURE__ */ jsx(Badge, { variant: project.published ? "default" : "secondary", children: project.published ? "Published" : "Draft" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground truncate mb-2", children: project.description || "No description provided" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx(Eye, { className: "mr-1 h-4 w-4" }),
          (project.views ?? 0).toLocaleString(),
          " views"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "mr-1 h-4 w-4" }),
          project.updatedAt ? new Date(String(project.updatedAt)).toLocaleDateString() : "—"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
        /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: handleEditClick, children: [
          /* @__PURE__ */ jsx(Edit, { className: "mr-2 h-4 w-4" }),
          "Edit Project"
        ] }),
        /* @__PURE__ */ jsxs(
          DropdownMenuItem,
          {
            onClick: (e) => {
              e.stopPropagation();
              navigate({ to: `/analytics/${project.id}` });
            },
            children: [
              /* @__PURE__ */ jsx(BarChart3, { className: "mr-2 h-4 w-4" }),
              "View Analytics"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          DropdownMenuItem,
          {
            onClick: (e) => {
              e.stopPropagation();
              navigate({ to: `/projectsettings/${project.id}` });
            },
            children: [
              /* @__PURE__ */ jsx(Settings, { className: "mr-2 h-4 w-4" }),
              "Project Settings"
            ]
          }
        ),
        /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
        /* @__PURE__ */ jsx(
          DropdownMenuItem,
          {
            onClick: (e) => {
              e.stopPropagation();
              onPublish(project.id ?? "", !!project.published);
            },
            children: project.published ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(EyeOff, { className: "mr-2 h-4 w-4" }),
              "Unpublish"
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Globe, { className: "mr-2 h-4 w-4" }),
              "Publish"
            ] })
          }
        ),
        /* @__PURE__ */ jsxs(
          DropdownMenuItem,
          {
            className: "text-destructive",
            onClick: (e) => {
              e.stopPropagation();
              onDelete(project.id ?? "");
            },
            children: [
              /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
              "Delete"
            ]
          }
        )
      ] })
    ] })
  ] }) }) });
}
function PublishProjectDialog({
  open,
  onOpenChange,
  onConfirm,
  isPublishing,
  projectName,
  currentlyPublished
}) {
  const ActionIcon = currentlyPublished ? EyeOff : Globe;
  return /* @__PURE__ */ jsx(AlertDialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
    /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
      /* @__PURE__ */ jsxs(AlertDialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(ActionIcon, { className: "h-5 w-5" }),
        currentlyPublished ? "Unpublish Project" : "Publish Project"
      ] }),
      /* @__PURE__ */ jsx(AlertDialogDescription, { children: currentlyPublished ? /* @__PURE__ */ jsxs(Fragment, { children: [
        "Are you sure you want to unpublish",
        " ",
        projectName ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: projectName }),
          "?"
        ] }) : "this project?",
        " ",
        "This will make the project inaccessible to public viewers. The project will remain in your dashboard and can be republished at any time."
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        "Are you sure you want to publish",
        " ",
        projectName ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: projectName }),
          "?"
        ] }) : "this project?",
        " ",
        "This will make the project publicly accessible. Make sure all content is ready and reviewed before publishing."
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
      /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: isPublishing, children: "Cancel" }),
      /* @__PURE__ */ jsx(
        AlertDialogAction,
        {
          onClick: onConfirm,
          className: currentlyPublished ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "",
          disabled: isPublishing,
          children: isPublishing ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
            currentlyPublished ? "Unpublishing..." : "Publishing..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(ActionIcon, { className: "mr-2 h-4 w-4" }),
            currentlyPublished ? "Unpublish" : "Publish"
          ] })
        }
      )
    ] })
  ] }) });
}
function useDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("views");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectToPublish, setProjectToPublish] = useState(null);
  const { data: projects, isLoading } = useUserProjects();
  const deleteProjectMutation = useDeleteProject();
  const publishProjectMutation = usePublishProject();
  const filteredAndSortedProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((project) => {
      const matchesSearch = (project.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) || (project.description ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPublished = !showPublishedOnly || !!project.published;
      return matchesSearch && matchesPublished;
    }).sort((a, b) => {
      let aValue;
      let bValue;
      switch (sortBy) {
        case "views":
          aValue = a.views ?? 0;
          bValue = b.views ?? 0;
          break;
        case "name":
          aValue = (a.name ?? "").toLowerCase();
          bValue = (b.name ?? "").toLowerCase();
          break;
        case "created":
          aValue = a.createdAt ? new Date(String(a.createdAt)).getTime() : 0;
          bValue = b.createdAt ? new Date(String(b.createdAt)).getTime() : 0;
          break;
        case "modified":
          aValue = a.updatedAt ? new Date(String(a.updatedAt)).getTime() : 0;
          bValue = b.updatedAt ? new Date(String(b.updatedAt)).getTime() : 0;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [projects, searchQuery, sortBy, sortOrder, showPublishedOnly]);
  const handleDeleteProject = (projectId) => {
    const project = projects?.find((p) => p.id === projectId);
    setProjectToDelete({
      id: projectId,
      name: project?.name
    });
  };
  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id);
      setProjectToDelete(null);
    }
  };
  const handlePublishProject = (projectId, currentlyPublished) => {
    const project = projects?.find((p) => p.id === projectId);
    setProjectToPublish({
      id: projectId,
      name: project?.name,
      published: currentlyPublished
    });
  };
  const handleConfirmPublish = () => {
    if (projectToPublish) {
      publishProjectMutation.mutate({
        projectId: projectToPublish.id,
        publish: !projectToPublish.published
      });
      setProjectToPublish(null);
    }
  };
  return {
    // States
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    viewMode,
    setViewMode,
    showPublishedOnly,
    setShowPublishedOnly,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    projectToDelete,
    setProjectToDelete,
    projectToPublish,
    setProjectToPublish,
    // Computed
    filteredAndSortedProjects,
    isLoading,
    // Mutations
    deleteProjectMutation,
    publishProjectMutation,
    // Handlers
    handleDeleteProject,
    handleConfirmDelete,
    handlePublishProject,
    handleConfirmPublish
  };
}
function Dashboard() {
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    viewMode,
    setViewMode,
    showPublishedOnly,
    setShowPublishedOnly,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    projectToDelete,
    setProjectToDelete,
    projectToPublish,
    setProjectToPublish,
    filteredAndSortedProjects,
    isLoading,
    deleteProjectMutation,
    publishProjectMutation,
    handleDeleteProject,
    handleConfirmDelete,
    handlePublishProject,
    handleConfirmPublish
  } = useDashboard();
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Loading your projects..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("header", { className: "flex h-16 shrink-0 items-center gap-2 border-b px-4", children: [
      /* @__PURE__ */ jsx(SidebarTrigger, { className: "-ml-1" }),
      /* @__PURE__ */ jsx(Separator, { orientation: "vertical", className: "mr-2 h-4" }),
      /* @__PURE__ */ jsx(Breadcrumb, { children: /* @__PURE__ */ jsxs(BreadcrumbList, { children: [
        /* @__PURE__ */ jsx(BreadcrumbItem, { className: "hidden md:block", children: /* @__PURE__ */ jsx(BreadcrumbLink, { href: "/dashboard", children: "Dashboard" }) }),
        /* @__PURE__ */ jsx(BreadcrumbSeparator, { className: "hidden md:block" }),
        /* @__PURE__ */ jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsx(BreadcrumbPage, { children: "Projects" }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col gap-4 p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-2", children: "My Projects" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Manage and track your project performance" })
        ] }),
        /* @__PURE__ */ jsx(
          CreateProjectDialog,
          {
            isCreateDialogOpen,
            setIsCreateDialogOpen
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        DashboardFilters,
        {
          searchQuery,
          onSearchChange: setSearchQuery,
          sortBy,
          onSortByChange: setSortBy,
          sortOrder,
          onSortOrderChange: () => setSortOrder(sortOrder === "asc" ? "desc" : "asc"),
          showPublishedOnly,
          onPublishedFilterToggle: () => setShowPublishedOnly(!showPublishedOnly),
          viewMode,
          onViewModeChange: setViewMode
        }
      ),
      filteredAndSortedProjects.length === 0 ? /* @__PURE__ */ jsx(
        EmptyState,
        {
          hasSearchQuery: !!searchQuery || showPublishedOnly,
          onCreateProject: () => setIsCreateDialogOpen(true)
        }
      ) : /* @__PURE__ */ jsx(
        "div",
        {
          className: viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4",
          children: filteredAndSortedProjects.map(
            (project) => viewMode === "grid" ? /* @__PURE__ */ jsx(
              ProjectCard,
              {
                project,
                onDelete: handleDeleteProject,
                onPublish: handlePublishProject
              },
              project.id
            ) : /* @__PURE__ */ jsx(
              ProjectListItem,
              {
                project,
                onDelete: handleDeleteProject,
                onPublish: handlePublishProject
              },
              project.id
            )
          )
        }
      ),
      /* @__PURE__ */ jsx(
        DeleteProjectDialog,
        {
          open: !!projectToDelete,
          onOpenChange: (open) => !open && setProjectToDelete(null),
          onConfirm: handleConfirmDelete,
          isDeleting: deleteProjectMutation.isPending,
          projectName: projectToDelete?.name
        }
      ),
      /* @__PURE__ */ jsx(
        PublishProjectDialog,
        {
          open: !!projectToPublish,
          onOpenChange: (open) => !open && setProjectToPublish(null),
          onConfirm: handleConfirmPublish,
          isPublishing: publishProjectMutation.isPending,
          projectName: projectToPublish?.name,
          currentlyPublished: !!projectToPublish?.published
        }
      )
    ] })
  ] });
}
const SplitComponent = Dashboard;
export {
  SplitComponent as component
};
