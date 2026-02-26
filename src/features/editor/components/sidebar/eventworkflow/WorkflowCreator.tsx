"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateEventWorkflow } from "@/features/eventworkflows/hooks/useEventWorkflowMutations";
import {
  CreateEventWorkflowSchema,
  type CreateEventWorkflowFormData,
} from "@/features/eventworkflows/schema/eventWorkflow";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Zap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface WorkflowCreatorProps {
  projectId: string;
  onSuccess: (workflowId: string) => void;
  onCancel: () => void;
}

export const WorkflowCreator = ({
  projectId,
  onSuccess,
  onCancel,
}: WorkflowCreatorProps) => {
  const createWorkflowMutation = useCreateEventWorkflow();

  const form = useForm<CreateEventWorkflowFormData>({
    resolver: zodResolver(CreateEventWorkflowSchema),
    defaultValues: {
      name: "",
      description: undefined,
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: CreateEventWorkflowFormData) => {
    try {
      const result = await createWorkflowMutation.mutateAsync({
        projectId,
        input: {
          name: data.name,
          description: data.description,
          canvasData: undefined,
        },
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

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="gap-2 mb-2"
        disabled={isLoading}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workflows
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Create New Workflow</CardTitle>
              <CardDescription>
                Give your workflow a name and description
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Workflow Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Workflow Name
                      <span className="text-destructive ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Send Welcome Email"
                        disabled={isLoading}
                        autoFocus
                        maxLength={100}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Choose a descriptive name for your workflow (3-100
                      characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Workflow Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description
                      <span className="text-muted-foreground ml-1">
                        (Optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this workflow does..."
                        disabled={isLoading}
                        rows={4}
                        maxLength={500}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Help others understand the purpose of this workflow (max
                      500 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !form.formState.isValid}
                  className="flex-1 gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Create & Design Workflow
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary bg-primary/10 dark:border-primary dark:bg-primary/20">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-sm mb-2 text-primary">
            What happens next?
          </h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Your workflow will be created</li>
            <li>The visual editor will open automatically</li>
            <li>Add nodes by clicking the "Add Node" buttons</li>
            <li>Connect nodes by clicking on their connection ports</li>
            <li>Save your workflow and connect it to element events</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowCreator;
