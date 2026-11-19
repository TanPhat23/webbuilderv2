import apiClient from "@/services/apiclient";
import { URLBuilder } from "@/utils/urlbuilder";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";

export interface AgentTokenInfo { id: string; name: string; prefix: string; createdAt: string; lastUsedAt?: string }
export interface CreatedAgentToken extends AgentTokenInfo { token: string; mcpUrl: string }

// apiClient needs an absolute URL; a bare path would hit the editor's own server.
const apiUrl = (path: string) => new URLBuilder("api").setPath(path).build();

export const agentTokenService = {
  list: (token?: string) => apiClient.get<AgentTokenInfo[]>(apiUrl(API_ENDPOINTS.AGENT_TOKENS.LIST), undefined, token),
  create: (name: string, token?: string) =>
    apiClient.post<CreatedAgentToken>(apiUrl(API_ENDPOINTS.AGENT_TOKENS.CREATE), { name }, undefined, token),
  revoke: (id: string, token?: string) => apiClient.delete(apiUrl(API_ENDPOINTS.AGENT_TOKENS.REVOKE(id)), undefined, token),
};
