import {
  CarouselElement,
  CMSContentGridElement,
  CMSContentItemElement,
  CMSContentListElement,
  FormElement,
  ImageElement,
  InputElement,
} from "@/interfaces/elements.interface";
import { EditorElement } from "@/types/global.type";

export type BuilderState = Omit<
  EditorElement,
  "content" | "elements" | "settings"
> & {
  content?: string;
};

export interface ElementCreateStrategy {
  buildElement: (elementState: BuilderState) => EditorElement;
}

function createBaseElement(
  state: BuilderState,
  overrides: Partial<EditorElement> = {},
): EditorElement {
  return {
    id: state.id,
    type: state.type,
    src: state.src,
    parentId:
      state.parentId && state.parentId !== "" ? state.parentId : undefined,
    pageId: state.pageId,
    content: "",
    styles: {},
    tailwindStyles: "",
    elements: [],
    settings: null,
    ...overrides,
  } as EditorElement;
}

export class TextElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      content: "Text",
    });
  }
}

export class FrameElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    // Modern, accessible frame defaults:
    // - responsive sizing with max-width
    // - neutral background that adapts to light/dark if using CSS vars
    // - soft rounded corners, subtle shadow and clear focus outline for keyboard users
    return createBaseElement(state, {
      styles: {
        default: {
          minHeight: "160px",
          width: "100%",
          margin: "0 auto",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15, 23, 42, 0.06)",
          borderRadius: "8px",
          padding: "16px",
          boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
        },
      },
      tailwindStyles:
        "w-full mx-auto rounded-lg p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow",
    });
  }
}

export class ButtonElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      content: "Click me",
      styles: {
        default: {
          minWidth: "96px",
          height: "44px",
          backgroundColor: "var(--color-primary, #2563eb)",
          color: "var(--color-on-primary, #ffffff)",
          border: "none",
          borderRadius: "10px",
          padding: "10px 18px",
          cursor: "pointer",
          fontSize: "15px",
          fontWeight: "600",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      tailwindStyles:
        "inline-flex items-center justify-center min-w-[96px] h-11 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition",
    });
  }
}

export class InputElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): InputElement {
    return createBaseElement(state, {
      settings: {
        type: "text",
        placeholder: "Enter text...",
      },
      styles: {
        default: {
          width: "100%",
          height: "44px",
          padding: "10px 14px",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: "8px",
          fontSize: "15px",
          backgroundColor: "var(--bg-input, #ffffff)",
        },
      },
      tailwindStyles:
        "w-full h-11 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition",
    }) as InputElement;
  }
}

export class ImageElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): ImageElement {
    return createBaseElement(state, {
      content: state.content ?? "Image",
      settings: {
        objectFit: "cover",
        loading: "lazy",
        decoding: "async",
      },
      styles: {
        default: {
          width: "100%",
          height: "auto",
          borderRadius: "8px",
          backgroundColor: "transparent",
        },
      },
      tailwindStyles: "w-full rounded-lg bg-transparent",
    }) as ImageElement;
  }
}
export class ListElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      styles: {
        default: {
          width: state.styles?.default?.width ?? "100%",
          minHeight: "160px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "8px",
          padding: "12px",
        },
      },
      tailwindStyles:
        "w-full rounded-lg border border-gray-200 bg-white p-3 shadow-sm",
    });
  }
}

export class SelectElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      styles: {
        default: {
          width: "100%",
          height: "44px",
          padding: "10px 12px",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "8px",
          fontSize: "15px",
          backgroundColor: "var(--bg-input, #ffffff)",
          cursor: "pointer",
        },
      },
      tailwindStyles:
        "w-full h-11 rounded-lg border border-gray-200 bg-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 transition",
    });
  }
}

export class FormElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): FormElement {
    return createBaseElement(state, {
      settings: {
        method: "post",
        action: "",
        autoComplete: "on",
        encType: "application/x-www-form-urlencoded",
        target: "_self",
        validateOnSubmit: false,
        redirectUrl: "",
      },
      styles: {
        default: {
          width: "100%",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "12px",
          padding: "24px",
        },
      },
      tailwindStyles:
        "w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
    }) as FormElement;
  }
}

export class SectionElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      styles: {
        default: {
          width: "100%",
          minHeight: "220px",
          backgroundColor: "var(--bg-surface)",
          padding: "32px 24px",
        },
      },
      tailwindStyles:
        "w-full min-h-[220px] py-8 px-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800",
    });
  }
}

export class CarouselElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): CarouselElement {
    return createBaseElement(state, {
      settings: {
        autoplay: true,
      },
      styles: {
        default: {
          width: "100%",
          height: "360px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "12px",
          padding: "16px",
          overflow: "hidden",
        },
      },
      tailwindStyles:
        "w-full h-90 md:h-[360px] rounded-xl border border-gray-200 bg-white p-4 shadow-md overflow-hidden",
    }) as CarouselElement;
  }
}

export class CMSContentListElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): CMSContentListElement {
    return createBaseElement(state, {
      settings: {
        contentTypeId: "",
        displayMode: "list",
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
      styles: {
        default: {
          width: "100%",
          minHeight: "200px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "8px",
          padding: "16px",
        },
      },
      tailwindStyles:
        "w-full min-h-[200px] rounded-lg p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm",
    }) as CMSContentListElement;
  }
}

export class CMSContentItemElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): CMSContentItemElement {
    return createBaseElement(state, {
      settings: {
        contentTypeId: "",
        itemSlug: "",
      },
      styles: {
        default: {
          width: "100%",
          minHeight: "300px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "8px",
          padding: "24px",
        },
      },
      tailwindStyles:
        "w-full min-h-[300px] rounded-lg p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm",
    }) as CMSContentItemElement;
  }
}

export class CMSContentGridElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): CMSContentGridElement {
    return createBaseElement(state, {
      settings: {
        contentTypeId: "",
        displayMode: "grid",
        limit: 6,
        sortBy: "createdAt",
        sortOrder: "desc",
        fieldsToShow: ["title", "content"],
      },
      styles: {
        default: {
          width: "100%",
          minHeight: "400px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "8px",
          padding: "16px",
        },
      },
      tailwindStyles:
        "w-full min-h-[400px] rounded-lg p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm",
    }) as CMSContentGridElement;
  }
}
