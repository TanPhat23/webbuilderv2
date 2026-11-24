import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/tanstack-react-start";
import { webhookService } from "../services/webhook.service";
import type {
  CreateWebhookInput,
  ProjectWebhook,
  UpdateWebhookInput,
  WebhookDelivery,
} from "../interfaces/webhook.interface";

const webhookKeys = {
  list: (projectId: string) => ["cms", "webhooks", projectId] as const,
  deliveries: (projectId: string, webhookId: string) =>
    ["cms", "webhooks", projectId, webhookId, "deliveries"] as const,
};

export function useProjectWebhooks(projectId?: string) {
  const { getToken } = useAuth();
  return useQuery<ProjectWebhook[], Error>({
    queryKey: webhookKeys.list(projectId ?? ""),
    enabled: Boolean(projectId),
    queryFn: async (): Promise<ProjectWebhook[]> => {
      if (!projectId) return [];
      const token = (await getToken()) ?? "";
      return webhookService.listByProject(projectId, token);
    },
  });
}

export function useCreateProjectWebhook(projectId?: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<ProjectWebhook, Error, CreateWebhookInput>({
    mutationFn: async (input): Promise<ProjectWebhook> => {
      if (!projectId) throw new Error("Project ID is required");
      const token = (await getToken()) ?? "";
      return webhookService.create(projectId, input, token);
    },
    onSuccess: () => {
      if (projectId) {
        void qc.invalidateQueries({ queryKey: webhookKeys.list(projectId) });
      }
    },
  });
}

export function useUpdateProjectWebhook(projectId?: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<
    ProjectWebhook,
    Error,
    { webhookId: string; input: UpdateWebhookInput }
  >({
    mutationFn: async ({ webhookId, input }): Promise<ProjectWebhook> => {
      if (!projectId) throw new Error("Project ID is required");
      const token = (await getToken()) ?? "";
      return webhookService.update(projectId, webhookId, input, token);
    },
    onSuccess: () => {
      if (projectId) {
        void qc.invalidateQueries({ queryKey: webhookKeys.list(projectId) });
      }
    },
  });
}

export function useDeleteProjectWebhook(projectId?: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: async (webhookId): Promise<boolean> => {
      if (!projectId) throw new Error("Project ID is required");
      const token = (await getToken()) ?? "";
      return webhookService.remove(projectId, webhookId, token);
    },
    onSuccess: () => {
      if (projectId) {
        void qc.invalidateQueries({ queryKey: webhookKeys.list(projectId) });
      }
    },
  });
}

export function useWebhookDeliveries(projectId?: string, webhookId?: string) {
  const { getToken } = useAuth();
  return useQuery<WebhookDelivery[], Error>({
    queryKey: webhookKeys.deliveries(projectId ?? "", webhookId ?? ""),
    enabled: Boolean(projectId) && Boolean(webhookId),
    queryFn: async (): Promise<WebhookDelivery[]> => {
      if (!projectId || !webhookId) return [];
      const token = (await getToken()) ?? "";
      return webhookService.listDeliveries(projectId, webhookId, token, 25);
    },
  });
}

export function useSendTestWebhook(projectId?: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<WebhookDelivery, Error, string>({
    mutationFn: async (webhookId): Promise<WebhookDelivery> => {
      if (!projectId) throw new Error("Project ID is required");
      const token = (await getToken()) ?? "";
      return webhookService.sendTest(projectId, webhookId, token);
    },
    onSuccess: (_, webhookId) => {
      if (projectId) {
        void qc.invalidateQueries({
          queryKey: webhookKeys.deliveries(projectId, webhookId),
        });
      }
    },
  });
}
