"use client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import createProject from "@/features/projects/actions/projectAction";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "@/hooks";

type CreateProjectDialogProps = {
  children?: React.ReactNode;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
};

export const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters long"),
  subdomain: z.string().optional(),
  description: z.string().optional(),
  published: z.boolean().optional(),
});
export function CreateProjectDialog({
  children,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
}: CreateProjectDialogProps) {
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectSchema>) => {
      await createProject({
        name: data.name,
        description: data.description ?? "",
        subdomain: data.subdomain ?? "",
        published: data.published ?? false,
        styles: {},
        header: { cssStyles: "" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
      setIsCreateDialogOpen(false);
    },
  });

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      subdomain: "",
      description: "",
      published: false,
    },
  });

  const handleSubmit = async (data: z.infer<typeof projectSchema>) => {
    createProjectMutation.mutate(data);
  };

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button className="mt-4 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Set up a new project to start building your next idea.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subdomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subdomain (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="my-awesome-site" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createProjectMutation.isPending}>
                {createProjectMutation.isPending
                  ? "Creating..."
                  : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
