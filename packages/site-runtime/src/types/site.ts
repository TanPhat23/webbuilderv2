export type SitePageType = "sp" | "dp" | "cp" | "page" | string;

/** Page as serialized by the Go API (camelCase). */
export interface SiteApiPage {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly slug?: string;
  readonly type: SitePageType;
  readonly contentTypeId?: string | null;
  readonly requireAuth?: boolean;
  readonly styles?: unknown;
  /** Interaction logic (variables and flows); absent until the page has some. */
  readonly logic?: unknown;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt?: string | null;
}
