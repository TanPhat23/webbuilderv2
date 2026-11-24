import type {
  AiAttachment,
  AiCanvasContext,
  AiCommand,
  AiElementContext,
  AiGenerateRequest,
  AiPromptScope,
  AiStarterAction,
} from "../types";

export const MAX_ATTACHMENTS = 4;
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export const AI_COMMANDS: readonly AiCommand[] = [
  {
    id: "clone",
    label: "Clone UI",
    description: "Recreate a layout from a screenshot or description",
    prefix: "/clone",
    promptHint: "Describe or attach a reference layout to recreate",
  },
  {
    id: "page",
    label: "Create Page",
    description: "Draft a full section or page structure",
    prefix: "/page",
    promptHint: "Describe the page purpose, audience, and sections",
  },
  {
    id: "improve",
    label: "Improve Design",
    description: "Refine spacing, hierarchy, and visual polish",
    prefix: "/improve",
    promptHint: "Describe what feels off or select an element first",
  },
  {
    id: "copy",
    label: "Write Copy",
    description: "Generate headlines, CTAs, and microcopy",
    prefix: "/copy",
    promptHint: "Share the tone, product, and target audience",
  },
];

export const ELEMENT_STARTER_ACTIONS: readonly AiStarterAction[] = [
  {
    id: "refine-layout",
    label: "Polish layout",
    description: "Spacing, alignment & visual rhythm",
    tag: "/improve",
    scope: "element",
    icon: "layout",
    buildPrompt: (el) =>
      `/improve Refine spacing, alignment, and visual hierarchy for "${el?.name || el?.type || "selected element"}" while preserving its structure.`,
  },
  {
    id: "make-responsive",
    label: "Make responsive",
    description: "Clean mobile & tablet breakpoints",
    tag: "rwd",
    scope: "element",
    icon: "responsive",
    buildPrompt: (el) =>
      `Make "${el?.name || el?.type || "selected element"}" cleanly responsive across desktop, tablet, and mobile viewports.`,
  },
  {
    id: "rewrite-copy",
    label: "Sharpen copy",
    description: "Tighter headline & CTA microcopy",
    tag: "/copy",
    scope: "element",
    icon: "copy",
    buildPrompt: (el) =>
      `/copy Rewrite the text inside "${el?.name || el?.type || "selected element"}" to be sharper, clearer, and conversion-focused.`,
  },
  {
    id: "match-theme",
    label: "Align to theme",
    description: "Use project tokens & contrast",
    tag: "tokens",
    scope: "theme",
    icon: "theme",
    buildPrompt: (el) =>
      `Align "${el?.name || el?.type || "selected element"}" with the project's semantic color tokens, radius, and typography scale.`,
  },
];

export const PAGE_STARTER_ACTIONS: readonly AiStarterAction[] = [
  {
    id: "hero-section",
    label: "Build hero",
    description: "Headline, proof, CTA & visual split",
    tag: "/page",
    scope: "page",
    icon: "hero",
    buildPrompt: () =>
      "/page Design a high-contrast hero section with an eyebrow badge, bold headline, concise subcopy, primary/secondary CTAs, and a visual preview frame.",
  },
  {
    id: "audit-page",
    label: "Audit page UX",
    description: "Check spacing, hierarchy & contrast",
    tag: "/improve",
    scope: "page",
    icon: "audit",
    buildPrompt: () =>
      "/improve Audit this page's layout hierarchy, section spacing, and contrast, and suggest the top 3 high-impact refinements.",
  },
  {
    id: "clone-reference",
    label: "Clone screenshot",
    description: "Paste or attach a UI reference",
    tag: "/clone",
    scope: "page",
    icon: "clone",
    buildPrompt: () =>
      "/clone Recreate the attached reference layout using clean semantic sections and responsive grid/flex containers.",
  },
  {
    id: "theme-direction",
    label: "Theme direction",
    description: "Suggest palette, fonts & CSS tokens",
    tag: "tokens",
    scope: "theme",
    icon: "theme",
    buildPrompt: () =>
      "Suggest a cohesive color palette, font pairing, and border-radius scale tailored to this page.",
  },
];

export function countCanvasNodes(elements: readonly unknown[]): {
  readonly sectionCount: number;
  readonly totalNodeCount: number;
} {
  let totalNodeCount = 0;
  const walk = (nodes: readonly unknown[]): void => {
    for (const node of nodes) {
      totalNodeCount += 1;
      if (typeof node === "object" && node !== null) {
        const descriptor = Object.getOwnPropertyDescriptor(node, "elements");
        if (descriptor && Array.isArray(descriptor.value) && descriptor.value.length > 0) {
          walk(descriptor.value);
        }
      }
    }
  };
  walk(elements);
  return {
    sectionCount: elements.length,
    totalNodeCount,
  };
}

export function shouldShowSlashPalette(value: string): boolean {
  return value.startsWith("/") && !value.includes(" ") && !value.includes("\n");
}

export function filterAiCommands(value: string): readonly AiCommand[] {
  if (!shouldShowSlashPalette(value)) {
    return [];
  }
  const normalized = value.toLowerCase();
  return AI_COMMANDS.filter(
    (cmd) =>
      cmd.prefix.startsWith(normalized) ||
      cmd.label.toLowerCase().includes(normalized.slice(1)),
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateAttachmentFile(
  file: Readonly<{ name: string; size: number; type: string }>,
  existingCount: number,
): { readonly ok: true } | { readonly ok: false; readonly reason: string } {
  if (existingCount >= MAX_ATTACHMENTS) {
    return {
      ok: false,
      reason: `You can attach up to ${MAX_ATTACHMENTS} files per message.`,
    };
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return {
      ok: false,
      reason: `"${file.name}" exceeds the ${formatFileSize(MAX_ATTACHMENT_BYTES)} limit.`,
    };
  }
  return { ok: true };
}

export function buildElementContextSummary(element: AiElementContext): string {
  const parts: string[] = [
    `Element ID: ${element.id}`,
    `Type: ${element.type}`,
  ];
  if (element.name && element.name.trim().length > 0) {
    parts.push(`Name: ${element.name.trim()}`);
  }
  if (element.tailwindStyles && element.tailwindStyles.trim().length > 0) {
    const trimmed = element.tailwindStyles.trim();
    const snippet = trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed;
    parts.push(`Classes: ${snippet}`);
  }
  if (element.content && element.content.trim().length > 0) {
    const trimmed = element.content.trim();
    const snippet = trimmed.length > 140 ? `${trimmed.slice(0, 137)}...` : trimmed;
    parts.push(`Text: ${snippet}`);
  }
  return parts.join(" | ");
}

export function buildGenerateContentRequest(params: {
  readonly prompt: string;
  readonly scope?: AiPromptScope;
  readonly canvasContext?: AiCanvasContext;
  readonly elementContext?: AiElementContext;
  readonly attachments?: readonly AiAttachment[];
}): AiGenerateRequest {
  const contextParts: string[] = [];

  if (params.scope) {
    contextParts.push(`Scope -> ${params.scope}`);
  }

  if (params.canvasContext) {
    contextParts.push(
      `Canvas -> mode: ${params.canvasContext.mode}, viewport: ${params.canvasContext.viewport}, sections: ${params.canvasContext.sectionCount}, nodes: ${params.canvasContext.totalNodeCount}`,
    );
  }

  if (params.elementContext) {
    contextParts.push(
      `Selected element -> ${buildElementContextSummary(params.elementContext)}`,
    );
  }

  const attachments = params.attachments ?? [];
  if (attachments.length > 0) {
    const summary = attachments
      .map(
        (item) =>
          `${item.name} (${item.mimeType || "file"}, ${formatFileSize(item.size)})`,
      )
      .join(", ");
    contextParts.push(`Attachments -> ${summary}`);
  }

  const hasImages = attachments.some((item) => item.isImage);

  return {
    prompt: params.prompt.trim(),
    ...(contextParts.length > 0 ? { context: contextParts.join("\n") } : {}),
    ...(hasImages ? { includeImages: true } : {}),
  };
}

export function extractAiErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }
  if (typeof error === "object" && error !== null) {
    const descriptor = Object.getOwnPropertyDescriptor(error, "message");
    if (
      descriptor &&
      typeof descriptor.value === "string" &&
      descriptor.value.trim().length > 0
    ) {
      return descriptor.value;
    }
  }
  return "AI service is currently unavailable. Check your connection or connect an external MCP agent.";
}

export function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
