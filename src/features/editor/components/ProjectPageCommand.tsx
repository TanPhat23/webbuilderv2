"use client";

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
import { usePageStore } from "@/features/editor";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageSchema } from "@/features/projects/schema/page";
import { Page } from "@/features/pages";
import createPage from "@/features/projects/actions/pageAction";

const createPageSchema = z.object({
  name: z.string().min(1, "Page name is required"),
  type: z.enum(["sp", "dp"])
})
type CreatePageFormValues = z.infer<typeof createPageSchema>;

function CreatePageDialog() {
  const { addPage } = usePageStore();
  const { id } = useParams();
  const [open, setOpen] = useState(false);

  const form = useForm<CreatePageFormValues>({
    resolver: zodResolver(createPageSchema),
    defaultValues: {
      name: "",
      type: "sp",
    },
  });

  const onSubmit = async (data: CreatePageFormValues) => {
    const newPageData = {
      Id: uuidv4(),
      Name: data.name,
      ProjectId: id as string,
      Styles: {},
      Type: data.type as "sp" | "dp",
      DeletedAt: undefined,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    const newPage = PageSchema.safeParse(newPageData);

    if (!newPage.success) {
      console.error("Validation failed:", newPage.error);
      return;
    }

    const response = await createPage(newPage.data);
    if (response) {
      addPage(response);
    }
    setOpen(false);
    form.reset();
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
        <Button variant="ghost" className="w-full justify-start h-6">
          + Add New Page
        </Button>
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
};

// DeletePageDialog component
function DeletePageDialog({ page, onDelete }: DeletePageDialogProps) {
  const [open, setOpen] = useState(false);
  const handleDelete = () => {
    onDelete(page.Id);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-xs h-6 px-2">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Page</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the page named `
            <span className="font-semibold">{page.Name}</span>`? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="secondary">
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

// Main component using the dialogs
export function ProjectPageCommand() {
  const { pages, deletePage } = usePageStore();
  const { id } = useParams();

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Type a page or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {pages.map((page) => (
          <CommandItem key={page.Id} className="group justify-between">
            <span>{page.Name}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="text-xs h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Edit
              </Button>
              <DeletePageDialog page={page} onDelete={deletePage} />
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
