// Backend API endpoints (used with URLBuilder)
export const API_ENDPOINTS = {
  ELEMENTS: {
    GET: (projectId: string) => `/api/v1/elements/${projectId}`,
    GET_PUBLIC: (projectId: string) => `/api/v1/elements/public/${projectId}`,
  },
  PROJECTS: {
    GET_PUBLIC: "/api/v1/projects/public",
    GET_USER: "/api/v1/projects/user",
    GET_BY_ID: (id: string) => `/api/v1/projects/${id}`,
    GET_PAGES: (id: string) => `/api/v1/projects/${id}/pages`,
    CREATE: "/api/v1/projects",
    UPDATE: (id: string) => `/api/v1/projects/${id}`,
    DELETE: (id: string) => `/api/v1/projects/${id}`,
    DELETE_PAGE: (projectId: string, pageId: string) =>
      `/api/v1/projects/${projectId}/pages/${pageId}`,
    GET_PUBLIC_BY_ID: (id: string) => `/api/v1/projects/public/${id}`,
  },
  SNAPSHOTS: {
    SAVE: (projectId: string) => `/api/v1/snapshots/${projectId}/save`,
    GET: (projectId: string) => `/api/v1/snapshots/${projectId}`,
    LOAD: (projectId: string, snapshotId: string) =>
      `/api/v1/snapshots/${projectId}/${snapshotId}`,
  },
  AI: {
    GENERATE_CONTENT: "/api/v1/ai/generate-content",
    GENERATE_CONTENT_STREAM: "/api/v1/ai/generate-content-stream",
    GENERATE: "/api/1.0.0/ai/generate",
  },
  CMS: {
    CONTENT_TYPES: {
      GET: "/api/v1/content-types",
      CREATE: "/api/v1/content-types",
      GET_BY_ID: (id: string) => `/api/v1/content-types/${id}`,
      UPDATE: (id: string) => `/api/v1/content-types/${id}`,
      DELETE: (id: string) => `/api/v1/content-types/${id}`,
    },
    CONTENT_FIELDS: {
      GET_BY_CONTENT_TYPE: (contentTypeId: string) =>
        `/api/v1/content-types/${contentTypeId}/fields`,
      CREATE: (contentTypeId: string) =>
        `/api/v1/content-types/${contentTypeId}/fields`,
      GET_BY_ID: (contentTypeId: string, fieldId: string) =>
        `/api/v1/content-types/${contentTypeId}/fields/${fieldId}`,
      UPDATE: (contentTypeId: string, fieldId: string) =>
        `/api/v1/content-types/${contentTypeId}/fields/${fieldId}`,
      DELETE: (contentTypeId: string, fieldId: string) =>
        `/api/v1/content-types/${contentTypeId}/fields/${fieldId}`,
    },
    CONTENT_ITEMS: {
      GET_BY_CONTENT_TYPE: (contentTypeId: string) =>
        `/api/v1/content-types/${contentTypeId}/items`,
      CREATE: (contentTypeId: string) =>
        `/api/v1/content-types/${contentTypeId}/items`,
      GET_BY_ID: (contentTypeId: string, itemId: string) =>
        `/api/v1/content-types/${contentTypeId}/items/${itemId}`,
      UPDATE: (contentTypeId: string, itemId: string) =>
        `/api/v1/content-types/${contentTypeId}/items/${itemId}`,
      DELETE: (contentTypeId: string, itemId: string) =>
        `/api/v1/content-types/${contentTypeId}/items/${itemId}`,
    },
    PUBLIC_CONTENT: {
      GET: "/api/v1/public/content",
      GET_ITEM: (contentTypeId: string, slug: string) =>
        `/api/v1/public/content/${contentTypeId}/${slug}`,
    },
  },
  IMAGES: {
    UPLOAD: "/api/v1/images",
    UPLOAD_BASE64: "/api/v1/images/base64",
    GET_USER: "/api/v1/images",
    GET_BY_ID: (id: string) => `/api/v1/images/${id}`,
    UPDATE: (id: string) => `/api/v1/images/${id}`,
    DELETE: (id: string) => `/api/v1/images/${id}`,
  },
  MARKETPLACE: {
    ITEMS: {
      CREATE: "/api/v1/marketplace/items",
      GET_ALL: "/api/v1/marketplace/items",
      GET_BY_ID: (id: string) => `/api/v1/marketplace/items/${id}`,
      UPDATE: (id: string) => `/api/v1/marketplace/items/${id}`,
      DELETE: (id: string) => `/api/v1/marketplace/items/${id}`,
      DOWNLOAD: (id: string) => `/api/v1/marketplace/items/${id}/download`,
      INCREMENT_DOWNLOADS: (id: string) =>
        `/api/v1/marketplace/items/${id}/increment-download`,
      INCREMENT_LIKES: (id: string) => `/api/v1/marketplace/items/${id}/like`,
    },
    CATEGORIES: {
      CREATE: "/api/v1/marketplace/categories",
      GET_ALL: "/api/v1/marketplace/categories",
      DELETE: (id: string) => `/api/v1/marketplace/categories/${id}`,
    },
    TAGS: {
      CREATE: "/api/v1/marketplace/tags",
      GET_ALL: "/api/v1/marketplace/tags",
      DELETE: (id: string) => `/api/v1/marketplace/tags/${id}`,
    },
    COMMENTS: {
      CREATE: "/api/v1/comments",
      GET_ALL: "/api/v1/comments",
      GET_BY_ID: (commentId: string) => `/api/v1/comments/${commentId}`,
      GET_BY_ITEM: (itemId: string) =>
        `/api/v1/marketplace/items/${itemId}/comments`,
      UPDATE: (commentId: string) => `/api/v1/comments/${commentId}`,
      DELETE: (commentId: string) => `/api/v1/comments/${commentId}`,
      MODERATE: (commentId: string) => `/api/v1/comments/${commentId}/moderate`,
      GET_COUNT: (itemId: string) =>
        `/api/v1/marketplace/items/${itemId}/comments/count`,
      CREATE_REACTION: (commentId: string) =>
        `/api/v1/comments/${commentId}/reactions`,
      DELETE_REACTION: (commentId: string) =>
        `/api/v1/comments/${commentId}/reactions`,
      GET_REACTIONS: (commentId: string) =>
        `/api/v1/comments/${commentId}/reactions`,
      GET_REACTION_SUMMARY: (commentId: string) =>
        `/api/v1/comments/${commentId}/reactions/summary`,
    },
  },
  INVITATIONS: {
    CREATE: "/api/v1/invitations",
    GET_BY_PROJECT: (projectId: string) =>
      `/api/v1/invitations/project/${projectId}`,
    GET_PENDING_BY_PROJECT: (projectId: string) =>
      `/api/v1/invitations/project/${projectId}/pending`,
    ACCEPT: "/api/v1/invitations/accept",
    CANCEL: (id: string) => `/api/v1/invitations/${id}/cancel`,
    UPDATE_STATUS: (id: string) => `/api/v1/invitations/${id}/status`,
    DELETE: (id: string) => `/api/v1/invitations/${id}`,
  },
  COLLABORATORS: {
    GET_BY_PROJECT: (projectId: string) =>
      `/api/v1/collaborators/project/${projectId}`,
    UPDATE_ROLE: (id: string) => `/api/v1/collaborators/${id}/role`,
    REMOVE: (id: string) => `/api/v1/collaborators/${id}`,
    REMOVE_SELF: (projectId: string) =>
      `/api/v1/collaborators/project/${projectId}/leave`,
  },
  CUSTOM_ELEMENTS: {
    CREATE: "/api/v1/customelements",
    GET_ALL: "/api/v1/customelements",
    GET_PUBLIC: "/api/v1/customelements/public",
    GET_BY_ID: (id: string) => `/api/v1/customelements/${id}`,
    UPDATE: (id: string) => `/api/v1/customelements/${id}`,
    DELETE: (id: string) => `/api/v1/customelements/${id}`,
    DUPLICATE: (id: string) => `/api/v1/customelements/${id}/duplicate`,
  },
  USERS: {
    SEARCH: "/api/v1/users/search",
    GET_BY_EMAIL: (email: string) => `/api/v1/users/email/${email}`,
    GET_BY_USERNAME: (username: string) => `/api/v1/users/username/${username}`,
  },
  SUBSCRIPTION: {
    STATUS: "/api/subscription/status",
    CANCEL: "/api/subscription/cancel",
    CREATE: "/api/subscription",
    GET: "/api/subscription",
  },
  VNPAY: {
    CREATE_PAYMENT: "/api/vnpay/create-payment",
    RETURN: "/api/vnpay/return",
    IPN: "/api/vnpay/ipn",
  },
  ELEMENT_COMMENTS: {
    CREATE: "/api/v1/element-comments",
    GET_BY_ID: (id: string) => `/api/v1/element-comments/${id}`,
    GET_BY_ELEMENT: (elementId: string) =>
      `/api/v1/elements/${elementId}/comments`,
    UPDATE: (id: string) => `/api/v1/element-comments/${id}`,
    DELETE: (id: string) => `/api/v1/element-comments/${id}`,
    TOGGLE_RESOLVED: (id: string) =>
      `/api/v1/element-comments/${id}/toggle-resolved`,
    GET_BY_AUTHOR: (authorId: string) =>
      `/api/v1/element-comments/author/${authorId}`,
    GET_BY_PROJECT: (projectId: string) =>
      `/api/v1/projects/${projectId}/comments`,
  },
  EVENT_WORKFLOWS: {
    GET_BY_PROJECT: (projectId: string) =>
      `/api/v1/projects/${projectId}/event-workflows`,
    CREATE: "/api/v1/event-workflows",
    GET_BY_ID: (workflowId: string) => `/api/v1/event-workflows/${workflowId}`,
    UPDATE: (workflowId: string) => `/api/v1/event-workflows/${workflowId}`,
    UPDATE_ENABLED: (workflowId: string) =>
      `/api/v1/event-workflows/${workflowId}/enabled`,
    DELETE: (workflowId: string) => `/api/v1/event-workflows/${workflowId}`,
    GET_ELEMENTS: (workflowId: string) =>
      `/api/v1/event-workflows/${workflowId}/elements`,
  },
  ELEMENT_EVENT_WORKFLOWS: {
    CREATE: "/api/v1/element-event-workflows",
    GET_ALL: "/api/v1/element-event-workflows",
    GET_BY_ID: (id: string) => `/api/v1/element-event-workflows/${id}`,
    GET_BY_PAGE: (pageId: string) =>
      `/api/v1/element-event-workflows/page/${pageId}`,
    UPDATE: (id: string) => `/api/v1/element-event-workflows/${id}`,
    DELETE: (id: string) => `/api/v1/element-event-workflows/${id}`,
    DELETE_BY_ELEMENT: (elementId: string) =>
      `/api/v1/element-event-workflows?elementId=${elementId}`,
    DELETE_BY_WORKFLOW: (workflowId: string) =>
      `/api/v1/element-event-workflows?workflowId=${workflowId}`,
  },
};

export const AI_ENDPOINTS = {
  GENERATE_CONTENT: "/api/v1/ai/generate-content",
};

export const AI_EXPORT_ENDPOINTS = {
  RECONSTRUCT: "/reconstruct",
  HEALTH: "/health",
};

export const NEXT_API_ENDPOINTS = {
  ELEMENTS: {
    UPDATE: (id: string) => `/api/elements/${id}`,
    DELETE: (id: string) => `/api/elements/${id}`,
  },
  PROJECTS: {
    DELETE: (id: string) => `/api/projects/${id}`,
    UPDATE: (id: string) => `/api/projects/${id}`,
    DELETE_PAGE: (projectId: string, pageId: string) =>
      `/api/projects/${projectId}/pages/${pageId}`,
  },
  TOKEN: {
    GET: "/api/gettoken",
  },
};
