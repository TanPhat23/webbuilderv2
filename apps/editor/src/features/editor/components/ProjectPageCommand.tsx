import { PageTypeSchema } from "@/features/pages/schema/page";
import React, { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { newEntityId } from "@webbuilder/site-runtime/lib/entity-id";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { projectKeys, useProjectRoutePages } from "@/features/projects/hooks/useProjects";
import { deleteProjectPage } from "@/features/projects/api/page.api";
import { deletePageFromCache } from "@/features/editor/store/delete-page";
import { showErrorToast } from "@/utils/errors/errorToast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreatePageSchema } from "@/features/pages/schema/page";
import { Page } from "@/features/pages";
import { createPage, updateProjectPage } from "@/features/projects/api/page.api";
import {
  pageRoutePath,
  slugifyPageName,
  validatePageSlugPattern,
} from "@webbuilder/site-runtime/routing";
import { useCMSContentTypes } from "@/features/cms/hooks/useCMSContent";
import { extractUpdateErrorMessage } from "@/features/projectsettings/utils/projectSettingsState";
import { showSuccessToast } from "@/utils/errors/errorToast";

const NONE_COLLECTION = "__none__";

const createPageSchema = z.object({
  name: z.string().min(1, "Page name is required"),
  slug: z.string().max(200).optional(),
  type: PageTypeSchema.exclude(["cp"]),
  contentTypeId: z.string().max(255).optional(),
  requireAuth: z.boolean().optional(),
});
type CreatePageFormValues = z.infer<typeof createPageSchema>;

export function CreatePageDialog({ trigger }: { trigger?: React.ReactNode } = {}) {
  const queryClient = useQueryClient();
  const { id } = useParams({ strict: false });
  const [open, setOpen] = useState(false);
  const { data: contentTypes = [] } = useCMSContentTypes(open ? id : undefined);

  const form = useForm<CreatePageFormValues>({
    resolver: zodResolver(createPageSchema),
    defaultValues: {
      name: "",
      slug: "",
      type: "sp",
      contentTypeId: NONE_COLLECTION,
      requireAuth: false,
    },
  });

  const watchedName = useWatch({ control: form.control, name: "name" });
  const watchedType = useWatch({ control: form.control, name: "type" });
  const isDynamic = watchedType === "dp";
  const suggestedSlug = slugifyPageName(watchedName || "");

  const onSubmit = async (data: CreatePageFormValues) => {
    let cleanSlug: string | undefined;
    if (data.slug && data.slug.trim().length > 0) {
      const checked = validatePageSlugPattern(data.slug, data.type === "dp");
      if (!checked.valid) {
        form.setError("slug", { message: checked.error });
        return;
      }
      cleanSlug = checked.normalized;
    }
    const boundCollection =
      data.type === "dp" &&
      data.contentTypeId &&
      data.contentTypeId !== NONE_COLLECTION
        ? data.contentTypeId
        : undefined;
    const newPage = CreatePageSchema.safeParse({
      Id: newEntityId(),
      Name: data.name,
      ...(cleanSlug !== undefined ? { Slug: cleanSlug } : {}),
      ...(boundCollection !== undefined ? { ContentTypeId: boundCollection } : {}),
      ...(data.requireAuth ? { RequireAuth: true } : {}),
      ProjectId: id as string,
      Styles: {},
      Type: data.type,
    });

    if (!newPage.success) {
      console.error("Validation failed:", newPage.error);
      return;
    }

    try {
      const response = (await createPage({ data: newPage.data })) as Page;
      if (id) {
        await queryClient.cancelQueries({ queryKey: projectKeys.pages(id), exact: true });
      }
      if (id) queryClient.setQueryData<Page[]>(projectKeys.pages(id), (pages) => [...(pages ?? []), response]);
      setOpen(false);
      form.reset();
    } catch (error) {
      showErrorToast(extractUpdateErrorMessage(error));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" className="w-full justify-start h-6">
            + Add New Page
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
          <DialogDescription>
            Enter a name and select a type for your new page.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter page name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Path (optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-muted-foreground">/</span>
                      <Input
                        placeholder={
                          isDynamic
                            ? `${suggestedSlug || "blog"}/:slug`
                            : suggestedSlug || "home"
                        }
                        className="font-mono text-sm"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  {isDynamic && (
                    <p className="text-[11px] text-muted-foreground">
                      Use <code className="font-mono">:param</code> (e.g.{" "}
                      <code className="font-mono">blog/:slug</code>) or a trailing catch-all{" "}
                      <code className="font-mono">*path</code> /{" "}
                      <code className="font-mono">*</code>.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a page type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sp">Single Page</SelectItem>
                      <SelectItem value="dp">Dynamic Page</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isDynamic && (
              <FormField
                control={form.control}
                name="contentTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CMS Collection (optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? NONE_COLLECTION}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="None (generic :param route)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE_COLLECTION}>
                          None (generic :param route)
                        </SelectItem>
                        {contentTypes.map((ct) => (
                          <SelectItem key={ct.id} value={ct.id}>
                            {ct.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="requireAuth"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs">Require Login</FormLabel>
                    <p className="text-[11px] text-muted-foreground">
                      Redirect unauthenticated visitors to your Supabase login page.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type DeletePageDialogProps = {
  page: Page;
  onDelete: (id: string) => void;
  trigger?: React.ReactNode;
  usage?: number;
  initiallyOpen?: boolean;
  onClose?: () => void;
};

// DeletePageDialog component
export function DeletePageDialog({ page, onDelete, trigger, usage, initiallyOpen = false, onClose }: DeletePageDialogProps) {
  const [open, setOpen] = useState(initiallyOpen);
  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (!next) onClose?.();
  };
  const handleDelete = () => {
    onDelete(page.Id);
    changeOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      {!initiallyOpen && <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" className="text-xs h-6 px-2">
            Delete
          </Button>
        )}
      </DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{usage === undefined ? "Delete Page" : "Delete component"}</DialogTitle>
          <DialogDescription>
            {usage === undefined ? (
              <>Delete <span className="font-semibold">{page.Name}</span>? This action cannot be undone.</>
            ) : (
              <>Delete <span className="font-semibold">{page.Name}</span>? {usage === 1 ? "1 linked instance will" : `${usage} linked instances will`} show “Missing component”.</>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => changeOpen(false)} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="destructive">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Deletes a page and, if it was open, moves the editor to another one. */
export function useDeletePage(id: string | undefined, pages: Page[]) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteAndNavigate = async (pageId: string) => {
    if (!id) return;
    const wasCurrent = new URLSearchParams(window.location.search).get("page") === pageId;
    try {
      const remaining = await deletePageFromCache(
        queryClient, projectKeys.pages(id), id, pageId,
        async (projectId, selectedPageId) => deleteProjectPage({ data: { projectId, pageId: selectedPageId } }),
        pages,
      );
      const routePage = new URLSearchParams(window.location.search).get("page");
      if (wasCurrent && (!routePage || routePage === pageId)) {
        const next = remaining.find((page) => page.Type !== "cp" && !page.DeletedAt);
        navigate({ to: "/editor/$id", params: { id }, search: { page: next?.Id } });
      }
    } catch {
      showErrorToast("Failed to delete page");
    }
  };

  return deleteAndNavigate;
}

const editPageSchema = z.object({
  name: z.string().trim().min(1, "Page name is required").max(255),
  slug: z.string().trim().max(200),
  type: PageTypeSchema.exclude(["cp"]),
  contentTypeId: z.string().max(255).optional(),
  requireAuth: z.boolean().optional(),
});
type EditPageFormValues = z.infer<typeof editPageSchema>;

export function EditPageDialog({
  page,
  trigger,
}: {
  page: Page;
  trigger?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const initialType: "sp" | "dp" = page.Type === "dp" ? "dp" : "sp";
  const initialSlug = page.Slug ?? slugifyPageName(page.Name);

  const form = useForm<EditPageFormValues>({
    resolver: zodResolver(editPageSchema),
    defaultValues: {
      name: page.Name || "Home",
      slug: initialSlug,
      type: initialType,
      contentTypeId: page.ContentTypeId || NONE_COLLECTION,
      requireAuth: Boolean(page.RequireAuth),
    },
  });

  const watchedType = useWatch({ control: form.control, name: "type" });
  const isDynamic = watchedType === "dp";
  const { data: contentTypes = [] } = useCMSContentTypes(
    open && isDynamic ? page.ProjectId : undefined,
  );

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      form.reset({
        name: page.Name || "Home",
        slug: page.Slug ?? slugifyPageName(page.Name),
        type: page.Type === "dp" ? "dp" : "sp",
        contentTypeId: page.ContentTypeId || NONE_COLLECTION,
        requireAuth: Boolean(page.RequireAuth),
      });
    }
  };

  const onSubmit = async (values: EditPageFormValues) => {
    const nextIsDynamic = values.type === "dp";
    const checked = validatePageSlugPattern(values.slug, nextIsDynamic);
    if (!checked.valid) {
      form.setError("slug", { message: checked.error });
      return;
    }
    const cleanSlug = checked.normalized;
    const nextContentTypeId = nextIsDynamic
      ? values.contentTypeId && values.contentTypeId !== NONE_COLLECTION
        ? values.contentTypeId
        : null
      : null;
    try {
      const updated = await updateProjectPage({
        data: {
          projectId: page.ProjectId,
          pageId: page.Id,
          name: values.name,
          slug: cleanSlug,
          type: values.type,
          contentTypeId: nextContentTypeId,
          requireAuth: Boolean(values.requireAuth),
        },
      });
      queryClient.setQueryData<Page[]>(
        projectKeys.pages(page.ProjectId),
        (pages) =>
          (pages ?? []).map((existing) =>
            existing.Id === updated.Id ? { ...existing, ...updated } : existing,
          ),
      );
      showSuccessToast("Page route updated");
      setOpen(false);
    } catch (error) {
      showErrorToast(extractUpdateErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            className="text-xs h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Page Settings</DialogTitle>
          <DialogDescription>
            Update the display name and URL path for this page.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Page name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Path</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-muted-foreground">/</span>
                      <Input
                        placeholder={
                          isDynamic
                            ? "blog/:slug or docs/*path or *"
                            : "leave empty for root /"
                        }
                        className="font-mono text-sm"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  {isDynamic && (
                    <p className="text-[11px] text-muted-foreground">
                      Supports <code className="font-mono">:param</code> and trailing{" "}
                      <code className="font-mono">*catchall</code> /{" "}
                      <code className="font-mono">*</code>.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a page type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sp">Single Page</SelectItem>
                      <SelectItem value="dp">Dynamic Page</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isDynamic && (
              <FormField
                control={form.control}
                name="contentTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CMS Collection (optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? NONE_COLLECTION}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="None (generic :param route)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE_COLLECTION}>
                          None (generic :param route)
                        </SelectItem>
                        {contentTypes.map((ct) => (
                          <SelectItem key={ct.id} value={ct.id}>
                            {ct.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="requireAuth"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs">Require Login</FormLabel>
                    <p className="text-[11px] text-muted-foreground">
                      Redirect unauthenticated visitors to your Supabase login page.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Main component using the dialogs
export function ProjectPageCommand() {
  const { id } = useParams({ strict: false });
  const { data: pages = [] } = useProjectRoutePages(id ?? null);
  const deleteAndNavigate = useDeletePage(id, pages);

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Type a page or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {pages.map((page) => (
          <CommandItem key={page.Id} className="group justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate">{page.Name || "Home"}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {pageRoutePath({ name: page.Name, slug: page.Slug })}
              </span>
            </div>
            <div className="flex gap-2">
              <EditPageDialog page={page} />
              <DeletePageDialog page={page} onDelete={deleteAndNavigate} />
            </div>
          </CommandItem>
        ))}
        <CommandSeparator />
        <CommandItem asChild onSelect={() => {}}>
          <CreatePageDialog />
        </CommandItem>
      </CommandList>
    </Command>
  );
}
