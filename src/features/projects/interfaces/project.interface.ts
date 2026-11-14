interface Header {
  cssStyles?: string;
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = {
  [key: string]: JsonValue;
};

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  subdomain?: string | null;
  published: boolean;
  ownerId: string;
  styles?: JsonObject | null;
  header?: Header | null;
  /** Project-wide interaction logic (variables and flows); absent until it has some. */
  logic?: JsonObject | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  views: number;
}
