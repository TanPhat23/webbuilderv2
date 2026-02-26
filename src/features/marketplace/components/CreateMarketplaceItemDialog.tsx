"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  marketplaceItemSchema,
  MarketplaceItemFormValues,
} from "../schema/marketplace.schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCreateMarketplaceItem,
  useUpdateMarketplaceItem,
  useMarketplaceItem,
  useCategories,
  useTags,
  useUserProjects,
} from "@/hooks";
import { useUserPlan } from "@/features/subscription";
import { Loader2, Plus, Upload, Crown, AlertCircle } from "lucide-react";
import { CreateMarketplaceItemRequest } from "@/features/marketplace";
import { TagSelector, CategorySelector } from "./tags";

const formSchema = marketplaceItemSchema;

type FormValues = MarketplaceItemFormValues;

interface CreateMarketplaceItemDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultProjectId?: string;
  itemId?: string;
}

function CreateMarketplaceItemDialog({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultProjectId,
  itemId,
}: CreateMarketplaceItemDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedExistingTags, setSelectedExistingTags] = useState<string[]>(
    [],
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
        tags: (existingItem.tags || []).map((tag: any) => 
          typeof tag === 'string' ? tag : tag?.name || ''
        ).filter(Boolean),
        categoryIds: existingItem.categories?.map((c) => c.id) || [],
      };
    }
    return {
      projectId: defaultProjectId || "",
      title: "",
      description: "",
      preview: "",
      templateType: "block" as const,
      featured: false,
      pageCount: undefined,
      tags: [],
      categoryIds: [],
    };
  }, [defaultProjectId, existingItem]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const customTags = form.getValues("tags");

  const handleAddTag = (tag: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", [...currentTags, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag),
    );
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newCategories);
    form.setValue("categoryIds", newCategories);
  };

  const toggleExistingTag = (tagName: string) => {
    const newTags = selectedExistingTags.includes(tagName)
      ? selectedExistingTags.filter((tag) => tag !== tagName)
      : [...selectedExistingTags, tagName];

    setSelectedExistingTags(newTags);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (itemId) {
        // Update mode
        const payload = {
          title: data.title,
          description: data.description,
          preview: data.preview || undefined,
          templateType: data.templateType,
          featured: data.featured,
          pageCount: data.pageCount,
          tags: [...data.tags, ...selectedExistingTags],
          categoryIds: selectedCategories,
        };

        await updateItem.mutateAsync({ id: itemId, data: payload });
      } else {
        // Create mode
        const payload: CreateMarketplaceItemRequest & { projectId: string } = {
          projectId: data.projectId,
          title: data.title,
          description: data.description,
          preview: data.preview || undefined,
          templateType: data.templateType,
          featured: data.featured,
          pageCount: data.pageCount,
          tags: [...data.tags, ...selectedExistingTags],
          categoryIds: selectedCategories,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/*<DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Template
          </Button>
        )}
      </DialogTrigger>*/}
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">
            {itemId
              ? "Update Marketplace Item"
              : "Upload Template to Marketplace"}
          </DialogTitle>
          <DialogDescription>
            {itemId
              ? "Update your template details."
              : "Share your project as a template with the community."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Permission Warning */}
            {!canPublish && (
              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <Crown className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-600 mb-1">
                    Gói Hobby không thể publish lên Marketplace
                  </p>
                  <p className="text-muted-foreground">
                    Nâng cấp lên <strong>Pro</strong> hoặc <strong>Enterprise</strong> để chia sẻ template với cộng đồng.
                  </p>
                </div>
              </div>
            )}

            {/* Project Selection - only show in create mode */}
            {!itemId && (
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Select Project *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a project to template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isProjectsLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2 text-sm">
                              Loading projects...
                            </span>
                          </div>
                        ) : projects && projects.length > 0 ? (
                          projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                              {project.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            No projects available. Create a project first.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Title *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Template" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="templateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Type *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full-site">Full Website</SelectItem>
                        <SelectItem value="page">Single Page</SelectItem>
                        <SelectItem value="section">Section</SelectItem>
                        <SelectItem value="block">Block</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Description *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your template..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preview"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Preview Image URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/preview.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pageCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Pages</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value ? parseInt(value, 10) : undefined,
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Tags *</FormLabel>
                  <FormControl>
                    <TagSelector
                      selectedExistingTags={selectedExistingTags}
                      onToggleExistingTag={toggleExistingTag}
                      customTags={form.getValues("tags")}
                      onAddTag={handleAddTag}
                      onRemoveTag={handleRemoveTag}
                      existingTags={existingTags}
                      isTagsLoading={isTagsLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categories */}
            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Categories
                  </FormLabel>
                  <FormControl>
                    <CategorySelector
                      selectedCategories={selectedCategories}
                      onToggleCategory={toggleCategory}
                      categories={categories}
                      isCategoriesLoading={isCategoriesLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Featured */}
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </FormControl>
                  <div className="space-y-0 leading-none">
                    <FormLabel className="text-sm font-medium cursor-pointer">
                      Featured Template
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Mark as featured (requires admin approval)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createItem.isPending || updateItem.isPending}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canPublish || createItem.isPending || updateItem.isPending}
                className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
              >
                {createItem.isPending || updateItem.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {itemId ? "Updating..." : "Uploading..."}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {itemId ? "Update Template" : "Upload Template"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { CreateMarketplaceItemDialog };
