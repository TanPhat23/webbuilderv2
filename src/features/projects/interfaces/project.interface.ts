interface Header {
  cssStyles?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  subdomain?: string | null;
  published: boolean;
  ownerId: string;
  styles?: Record<string, unknown> | null;
  header?: Header | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
