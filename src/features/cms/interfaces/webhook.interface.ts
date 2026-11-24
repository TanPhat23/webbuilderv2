export type WebhookEvent = "item.created" | "item.updated" | "item.deleted";

export const WEBHOOK_EVENTS: readonly {
  readonly value: WebhookEvent;
  readonly label: string;
}[] = [
  { value: "item.created", label: "Item created / form submitted" },
  { value: "item.updated", label: "Item updated" },
  { value: "item.deleted", label: "Item deleted" },
];

export interface ProjectWebhook {
  readonly id: string;
  readonly projectId: string;
  readonly contentTypeId?: string | null;
  readonly name: string;
  readonly url: string;
  readonly secret?: string;
  readonly events: readonly string[];
  readonly enabled: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WebhookDelivery {
  readonly id: string;
  readonly webhookId: string;
  readonly projectId: string;
  readonly event: string;
  readonly status: "pending" | "succeeded" | "failed" | string;
  readonly httpStatus?: number | null;
  readonly responseBody?: string | null;
  readonly errorMessage?: string | null;
  readonly attempts: number;
  readonly createdAt: string;
  readonly completedAt?: string | null;
}

export interface CreateWebhookInput {
  readonly name: string;
  readonly url: string;
  readonly events: readonly WebhookEvent[];
  readonly contentTypeId?: string;
  readonly enabled?: boolean;
}

export interface UpdateWebhookInput {
  readonly name?: string;
  readonly url?: string;
  readonly events?: readonly WebhookEvent[];
  readonly contentTypeId?: string;
  readonly enabled?: boolean;
}
