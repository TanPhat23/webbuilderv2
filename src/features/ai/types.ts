export type AiCommandId = "clone" | "page" | "improve" | "copy";

export type AiPromptScope = "element" | "page" | "theme";

export interface AiCommand {
  readonly id: AiCommandId;
  readonly label: string;
  readonly description: string;
  readonly prefix: `/${AiCommandId}`;
  readonly promptHint: string;
}

export interface AiStarterAction {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly tag: string;
  readonly scope: AiPromptScope;
  readonly icon: "layout" | "responsive" | "copy" | "theme" | "hero" | "audit" | "clone";
  readonly buildPrompt: (element?: AiElementContext) => string;
}

export interface AiAttachment {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly mimeType: string;
  readonly isImage: boolean;
  readonly previewUrl?: string;
}

export interface AiElementContext {
  readonly id: string;
  readonly type: string;
  readonly name?: string;
  readonly content?: string;
  readonly tailwindStyles?: string;
}

export interface AiCanvasContext {
  readonly viewport: "desktop" | "tablet" | "mobile";
  readonly mode: "editor" | "wireframe";
  readonly sectionCount: number;
  readonly totalNodeCount: number;
}

export type AiMessageRole = "user" | "assistant";
export type AiMessageStatus = "complete" | "pending" | "error";

export interface AiMessage {
  readonly id: string;
  readonly role: AiMessageRole;
  readonly content: string;
  readonly html?: string;
  readonly status: AiMessageStatus;
  readonly errorMessage?: string;
  readonly createdAt: number;
  readonly scope?: AiPromptScope;
  readonly elementContext?: AiElementContext;
  readonly attachments?: readonly AiAttachment[];
}

export interface AiGenerateRequest {
  readonly prompt: string;
  readonly context?: string;
  readonly includeImages?: boolean;
}
