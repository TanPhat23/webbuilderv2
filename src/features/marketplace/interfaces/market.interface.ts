export interface Category {
  id: string;
  name: string;
  count?: number;
}

export interface Tag {
  id: string;
  name: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  preview?: string;
  templateType: "full-site" | "page" | "section" | "block";
  featured?: boolean;
  pageCount?: number;
  tags: string[];
  downloads?: number;
  likes?: number;
  views?: number;
  author: {
    name: string;
    verified?: boolean;
  };
  authorId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string | null;
}

export interface CreateMarketplaceItemRequest {
  projectId: string;
  title: string;
  description: string;
  preview?: string;
  templateType: "full-site" | "page" | "section" | "block";
  featured?: boolean;
  pageCount?: number;
  tags: string[];
  categoryIds?: string[];
}

export interface UpdateMarketplaceItemRequest {
  title?: string;
  description?: string;
  preview?: string;
  templateType?: "full-site" | "page" | "section" | "block";
  featured?: boolean;
  pageCount?: number;
  tags?: string[];
  categoryIds?: string[];
}

export interface MarketplaceItemWithRelations extends MarketplaceItem {
  categories?: Category[];
  tagObjects?: Tag[];
  projectId: string;
  authorId: string;
  authorName: string;
  verified: boolean;
}

export interface MarketplaceFilters {
  templateType?: "full-site" | "page" | "section" | "block";
  featured?: boolean;
  categoryId?: string;
  tags?: string[];
  search?: string;
  authorId?: string;
}
