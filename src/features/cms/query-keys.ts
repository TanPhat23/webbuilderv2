export const cmsKeys = {
  all: ['cms'] as const,
  contentTypes: () => [...cmsKeys.all, 'contentTypes'] as const,
  contentFields: (contentTypeId: string) => [...cmsKeys.all, 'contentFields', contentTypeId] as const,
  contentItems: (contentTypeId: string) => [...cmsKeys.all, 'contentItems', contentTypeId] as const,
  publicContent: () => [...cmsKeys.all, 'public-content'] as const,
  publicContentItem: () => [...cmsKeys.all, 'public-content-item'] as const,
  publicContentList: (contentTypeId?: string, limit?: number, sortBy?: string, sortOrder?: string) =>
    [...cmsKeys.publicContent(), contentTypeId, limit, sortBy, sortOrder] as const,
  publicContentDetail: (contentTypeId: string, slug: string) =>
    [...cmsKeys.publicContentItem(), contentTypeId, slug] as const,
};
