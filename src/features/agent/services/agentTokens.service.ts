import apiClient from "@/services/apiclient";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";

export interface AgentTokenInfo { id: string; name: string; prefix: string; createdAt: string; lastUsedAt?: string }
export interface CreatedAgentToken extends AgentTokenInfo { token: string; mcpUrl: string }

export const agentTokenService = {
  list: (token?: string) => apiClient.get<AgentTokenInfo[]>(API_ENDPOINTS.AGENT_TOKENS.LIST, undefined, token),
  create: (name: string, token?: string) =>
    apiClient.post<CreatedAgentToken>(API_ENDPOINTS.AGENT_TOKENS.CREATE, { name }, undefined, token),
  revoke: (id: string, token?: string) => apiClient.delete(API_ENDPOINTS.AGENT_TOKENS.REVOKE(id), undefined, token),
};
