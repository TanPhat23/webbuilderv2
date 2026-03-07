const urlMap = {
  api: process.env.GO_SERVER_URL || "https://webbuilderapigo-production.up.railway.app",
  ai: process.env.AI_SERVER_URL || void 0 || "http://localhost:3001",
  export: process.env.AI_EXPORT_SERVER_URL || void 0 || "http://localhost:5001",
  next: "http://localhost:3000"
};
class URLBuilder {
  constructor(typeOrBase) {
    const isUrlType = (v) => v === "ai" || v === "api" || v === "export" || v === "next" || v === "none";
    const fallbackOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const base = isUrlType(typeOrBase) ? typeOrBase !== "none" ? urlMap[typeOrBase] : fallbackOrigin : typeOrBase && typeOrBase.length > 0 ? typeOrBase : fallbackOrigin;
    try {
      this.url = new URL(base);
    } catch (e) {
      this.url = new URL(base, fallbackOrigin);
    }
  }
  /**
   * Overwrites the current URL path.
   */
  setPath(path) {
    this.url.pathname = path;
    return this;
  }
  /**
   * Appends a path segment to the current URL path.
   */
  addPathSegment(segment) {
    if (!this.url.pathname.endsWith("/")) {
      this.url.pathname += "/";
    }
    this.url.pathname += segment.replace(/^\/+/, "");
    return this;
  }
  /**
   * Adds a query parameter to the URL.
   */
  addQueryParam(key, value) {
    this.url.searchParams.append(key, value);
    return this;
  }
  /**
   * Returns the constructed URL string.
   */
  build() {
    return this.url.toString();
  }
}
const API_ENDPOINTS = {
  ELEMENTS: {
    GET: (projectId) => `/api/v1/elements/${projectId}`,
    GET_PUBLIC: (projectId) => `/api/v1/elements/public/${projectId}`
  },
  PROJECTS: {
    GET_PUBLIC: "/api/v1/projects/public",
    GET_USER: "/api/v1/projects/user",
    GET_BY_ID: (id) => `/api/v1/projects/${id}`,
    GET_PAGES: (id) => `/api/v1/projects/${id}/pages`,
    CREATE: "/api/v1/projects",
    UPDATE: (id) => `/api/v1/projects/${id}`,
    DELETE: (id) => `/api/v1/projects/${id}`,
    DELETE_PAGE: (projectId, pageId) => `/api/v1/projects/${projectId}/pages/${pageId}`,
    GET_PUBLIC_BY_ID: (id) => `/api/v1/projects/public/${id}`
  },
  SNAPSHOTS: {
    SAVE: (projectId) => `/api/v1/snapshots/${projectId}/save`,
    GET: (projectId) => `/api/v1/snapshots/${projectId}`,
    LOAD: (projectId, snapshotId) => `/api/v1/snapshots/${projectId}/${snapshotId}`
  },
  AI: {
    GENERATE_CONTENT: "/api/v1/ai/generate-content",
    GENERATE_CONTENT_STREAM: "/api/v1/ai/generate-content-stream",
    GENERATE: "/api/1.0.0/ai/generate"
  },
  CMS: {
    CONTENT_TYPES: {
      GET: "/api/v1/content-types",
      CREATE: "/api/v1/content-types",
      GET_BY_ID: (id) => `/api/v1/content-types/${id}`,
      UPDATE: (id) => `/api/v1/content-types/${id}`,
      DELETE: (id) => `/api/v1/content-types/${id}`
    },
    CONTENT_FIELDS: {
      GET_BY_CONTENT_TYPE: (contentTypeId) => `/api/v1/content-types/${contentTypeId}/fields`,
      CREATE: (contentTypeId) => `/api/v1/content-types/${contentTypeId}/fields`,
      GET_BY_ID: (contentTypeId, fieldId) => `/api/v1/content-types/${contentTypeId}/fields/${fieldId}`,
      UPDATE: (contentTypeId, fieldId) => `/api/v1/content-types/${contentTypeId}/fields/${fieldId}`,
      DELETE: (contentTypeId, fieldId) => `/api/v1/content-types/${contentTypeId}/fields/${fieldId}`
    },
    CONTENT_ITEMS: {
      GET_BY_CONTENT_TYPE: (contentTypeId) => `/api/v1/content-types/${contentTypeId}/items`,
      CREATE: (contentTypeId) => `/api/v1/content-types/${contentTypeId}/items`,
      GET_BY_ID: (contentTypeId, itemId) => `/api/v1/content-types/${contentTypeId}/items/${itemId}`,
      UPDATE: (contentTypeId, itemId) => `/api/v1/content-types/${contentTypeId}/items/${itemId}`,
      DELETE: (contentTypeId, itemId) => `/api/v1/content-types/${contentTypeId}/items/${itemId}`
    },
    PUBLIC_CONTENT: {
      GET: "/api/v1/public/content",
      GET_ITEM: (contentTypeId, slug) => `/api/v1/public/content/${contentTypeId}/${slug}`
    }
  },
  IMAGES: {
    UPLOAD: "/api/v1/images",
    UPLOAD_BASE64: "/api/v1/images/base64",
    GET_USER: "/api/v1/images",
    GET_BY_ID: (id) => `/api/v1/images/${id}`,
    UPDATE: (id) => `/api/v1/images/${id}`,
    DELETE: (id) => `/api/v1/images/${id}`
  },
  MARKETPLACE: {
    ITEMS: {
      CREATE: "/api/v1/marketplace/items",
      GET_ALL: "/api/v1/marketplace/items",
      GET_BY_ID: (id) => `/api/v1/marketplace/items/${id}`,
      UPDATE: (id) => `/api/v1/marketplace/items/${id}`,
      DELETE: (id) => `/api/v1/marketplace/items/${id}`,
      DOWNLOAD: (id) => `/api/v1/marketplace/items/${id}/download`,
      INCREMENT_DOWNLOADS: (id) => `/api/v1/marketplace/items/${id}/increment-download`,
      INCREMENT_LIKES: (id) => `/api/v1/marketplace/items/${id}/like`
    },
    CATEGORIES: {
      CREATE: "/api/v1/marketplace/categories",
      GET_ALL: "/api/v1/marketplace/categories",
      DELETE: (id) => `/api/v1/marketplace/categories/${id}`
    },
    TAGS: {
      CREATE: "/api/v1/marketplace/tags",
      GET_ALL: "/api/v1/marketplace/tags",
      DELETE: (id) => `/api/v1/marketplace/tags/${id}`
    },
    COMMENTS: {
      CREATE: "/api/v1/comments",
      GET_ALL: "/api/v1/comments",
      GET_BY_ID: (commentId) => `/api/v1/comments/${commentId}`,
      GET_BY_ITEM: (itemId) => `/api/v1/marketplace/items/${itemId}/comments`,
      UPDATE: (commentId) => `/api/v1/comments/${commentId}`,
      DELETE: (commentId) => `/api/v1/comments/${commentId}`,
      MODERATE: (commentId) => `/api/v1/comments/${commentId}/moderate`,
      GET_COUNT: (itemId) => `/api/v1/marketplace/items/${itemId}/comments/count`,
      CREATE_REACTION: (commentId) => `/api/v1/comments/${commentId}/reactions`,
      DELETE_REACTION: (commentId) => `/api/v1/comments/${commentId}/reactions`,
      GET_REACTIONS: (commentId) => `/api/v1/comments/${commentId}/reactions`,
      GET_REACTION_SUMMARY: (commentId) => `/api/v1/comments/${commentId}/reactions/summary`
    }
  },
  INVITATIONS: {
    CREATE: "/api/v1/invitations",
    GET_BY_PROJECT: (projectId) => `/api/v1/invitations/project/${projectId}`,
    GET_PENDING_BY_PROJECT: (projectId) => `/api/v1/invitations/project/${projectId}/pending`,
    ACCEPT: "/api/v1/invitations/accept",
    CANCEL: (id) => `/api/v1/invitations/${id}/cancel`,
    UPDATE_STATUS: (id) => `/api/v1/invitations/${id}/status`,
    DELETE: (id) => `/api/v1/invitations/${id}`
  },
  COLLABORATORS: {
    GET_BY_PROJECT: (projectId) => `/api/v1/collaborators/project/${projectId}`,
    UPDATE_ROLE: (id) => `/api/v1/collaborators/${id}/role`,
    REMOVE: (id) => `/api/v1/collaborators/${id}`,
    REMOVE_SELF: (projectId) => `/api/v1/collaborators/project/${projectId}/leave`
  },
  CUSTOM_ELEMENTS: {
    CREATE: "/api/v1/customelements",
    GET_ALL: "/api/v1/customelements",
    GET_PUBLIC: "/api/v1/customelements/public",
    GET_BY_ID: (id) => `/api/v1/customelements/${id}`,
    UPDATE: (id) => `/api/v1/customelements/${id}`,
    DELETE: (id) => `/api/v1/customelements/${id}`,
    DUPLICATE: (id) => `/api/v1/customelements/${id}/duplicate`
  },
  USERS: {
    SEARCH: "/api/v1/users/search",
    GET_BY_EMAIL: (email) => `/api/v1/users/email/${email}`,
    GET_BY_USERNAME: (username) => `/api/v1/users/username/${username}`
  },
  SUBSCRIPTION: {
    STATUS: "/api/subscription/status",
    CANCEL: "/api/subscription/cancel",
    CREATE: "/api/subscription",
    GET: "/api/subscription"
  },
  VNPAY: {
    CREATE_PAYMENT: "/api/vnpay/create-payment",
    RETURN: "/api/vnpay/return",
    IPN: "/api/vnpay/ipn"
  },
  ELEMENT_COMMENTS: {
    CREATE: "/api/v1/element-comments",
    GET_BY_ID: (id) => `/api/v1/element-comments/${id}`,
    GET_BY_ELEMENT: (elementId) => `/api/v1/elements/${elementId}/comments`,
    UPDATE: (id) => `/api/v1/element-comments/${id}`,
    DELETE: (id) => `/api/v1/element-comments/${id}`,
    TOGGLE_RESOLVED: (id) => `/api/v1/element-comments/${id}/toggle-resolved`,
    GET_BY_AUTHOR: (authorId) => `/api/v1/element-comments/author/${authorId}`,
    GET_BY_PROJECT: (projectId) => `/api/v1/projects/${projectId}/comments`
  },
  EVENT_WORKFLOWS: {
    GET_BY_PROJECT: (projectId) => `/api/v1/projects/${projectId}/event-workflows`,
    CREATE: "/api/v1/event-workflows",
    GET_BY_ID: (workflowId) => `/api/v1/event-workflows/${workflowId}`,
    UPDATE: (workflowId) => `/api/v1/event-workflows/${workflowId}`,
    UPDATE_ENABLED: (workflowId) => `/api/v1/event-workflows/${workflowId}/enabled`,
    DELETE: (workflowId) => `/api/v1/event-workflows/${workflowId}`,
    GET_ELEMENTS: (workflowId) => `/api/v1/event-workflows/${workflowId}/elements`
  },
  ELEMENT_EVENT_WORKFLOWS: {
    CREATE: "/api/v1/element-event-workflows",
    GET_ALL: "/api/v1/element-event-workflows",
    GET_BY_ID: (id) => `/api/v1/element-event-workflows/${id}`,
    GET_BY_PAGE: (pageId) => `/api/v1/element-event-workflows/page/${pageId}`,
    UPDATE: (id) => `/api/v1/element-event-workflows/${id}`,
    DELETE: (id) => `/api/v1/element-event-workflows/${id}`,
    DELETE_BY_ELEMENT: (elementId) => `/api/v1/element-event-workflows?elementId=${elementId}`,
    DELETE_BY_WORKFLOW: (workflowId) => `/api/v1/element-event-workflows?workflowId=${workflowId}`
  }
};
const NEXT_API_ENDPOINTS = {
  TOKEN: {
    GET: "/api/gettoken"
  }
};
async function getToken() {
  const url = new URLBuilder("next").setPath(NEXT_API_ENDPOINTS.TOKEN.GET).build();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include"
  });
  if (!response.ok) {
    console.error(
      "[getToken] Failed to get authentication token. Status:",
      response.status
    );
    throw new Error("Failed to get authentication token");
  }
  const { tokenJWT } = await response.json();
  return tokenJWT;
}
class ApiClient {
  constructor() {
  }
  static getInstance() {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
  async execute(method, url, data, options = {}, token) {
    const resolvedToken = token ?? await getToken();
    const response = await fetch(url, {
      ...options,
      method,
      headers: {
        "Content-Type": "application/json",
        ...resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {},
        ...options.headers ?? {}
      },
      body: data !== void 0 ? JSON.stringify(data) : void 0
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] ${method} ${url} failed:`, {
        status: response.status,
        error: errorText
      });
      throw new Error(`${method} ${url} failed (${response.status})`);
    }
    if (response.status === 204) return void 0;
    const text = await response.text();
    if (!text) return void 0;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  get(url, options, token) {
    return this.execute("GET", url, void 0, options, token);
  }
  post(url, data, options, token) {
    return this.execute("POST", url, data, options, token);
  }
  put(url, data, options, token) {
    return this.execute("PUT", url, data, options, token);
  }
  patch(url, data, options, token) {
    return this.execute("PATCH", url, data, options, token);
  }
  async delete(url, options, token) {
    await this.execute("DELETE", url, void 0, options, token);
    return true;
  }
  getPublic(url, options) {
    return this.execute("GET", url, void 0, options);
  }
}
const apiClient = ApiClient.getInstance();
const projectService = {
  getUserProjects: (token) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.GET_USER).build();
    return apiClient.get(url, void 0, token);
  },
  getProjectById: (id, token) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.GET_BY_ID(id)).build();
    return apiClient.get(url, void 0, token);
  },
  getProjectPages: (id, token) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.GET_PAGES(id)).build();
    return apiClient.get(url, void 0, token);
  },
  getProjectPublic: (id) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.GET_PUBLIC_BY_ID(id)).build();
    return apiClient.getPublic(url);
  },
  getProjects: () => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.GET_PUBLIC).build();
    return apiClient.getPublic(url);
  },
  createProject: (project, token) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.CREATE).build();
    return apiClient.post(url, project, void 0, token);
  },
  updateProject: (project, token) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.UPDATE(project.id)).build();
    return apiClient.put(url, project, void 0, token);
  },
  updateProjectPartial: (projectId, updates, token) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.UPDATE(projectId)).build();
    return apiClient.patch(url, updates, void 0, token);
  },
  deleteProject: (id, token) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.DELETE(id)).build();
    return apiClient.delete(url, void 0, token);
  },
  deleteProjectPage: (projectId, pageId, token) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.DELETE_PAGE(projectId, pageId)).build();
    return apiClient.delete(url, void 0, token);
  }
};
export {
  API_ENDPOINTS as A,
  URLBuilder as U,
  apiClient as a,
  getToken as g,
  projectService as p
};
