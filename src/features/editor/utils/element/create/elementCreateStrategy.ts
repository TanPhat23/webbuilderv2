import {
  AudioElement,
  BlockquoteElement,
  CarouselElement,
  CheckboxElement,
  CMSContentGridElement,
  CMSContentItemElement,
  CMSContentListElement,
  CodeElement,
  FormElement,
  IconElement,
  IFrameElement,
  ImageElement,
  InputElement,
  ProgressElement,
  RadioElement,
  TableElement,
  TextareaElement,
  VideoElement,
} from "@/features/editor";
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
    href: state.href,
    parentId:
      state.parentId && state.parentId !== "" ? state.parentId : undefined,
    pageId: state.pageId,
    content: "",
    styles: {},
    tailwindStyles: "",
    elements: [],
    settings: null,
    // Strategy defaults come first
    ...overrides,
    // Template values always win when explicitly provided
    ...(state.content !== undefined ? { content: state.content } : {}),
    ...(state.styles && Object.keys(state.styles).length > 0
      ? { styles: state.styles }
      : {}),
    ...(state.tailwindStyles !== undefined && state.tailwindStyles !== ""
      ? { tailwindStyles: state.tailwindStyles }
      : {}),
  } as EditorElement;
}

// ============================================
// INLINE / LEAF ELEMENTS
// ============================================

export class TextElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      content: "Text",
    });
  }
}

export class SpanElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      content: "Span text",
      styles: {
        default: {
          display: "inline",
        },
      },
    });
  }
}

export class HeadingElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      content: "Heading",
      settings: {
        level: 2,
      },
      styles: {
        default: {
          fontSize: "24px",
          fontWeight: "700",
          lineHeight: "1.3",
          color: "var(--text-heading, #0f172a)",
        },
      },
      tailwindStyles:
        "text-2xl font-bold leading-tight text-slate-900 dark:text-white",
    });
  }
}

export class LabelElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      content: "Label",
      settings: {
        htmlFor: "",
      },
      styles: {
        default: {
          fontSize: "14px",
          fontWeight: "500",
          color: "var(--text-label, #374151)",
          display: "inline-block",
          marginBottom: "4px",
        },
      },
      tailwindStyles:
        "text-sm font-medium text-gray-700 dark:text-gray-300 inline-block mb-1",
    });
  }
}

export class BlockquoteElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      content: "Blockquote text goes here...",
      settings: {
        cite: "",
      },
      styles: {
        default: {
          borderLeft: "4px solid var(--color-primary, #2563eb)",
          padding: "12px 20px",
          margin: "16px 0",
          backgroundColor: "var(--bg-muted, #f8fafc)",
          fontStyle: "italic",
          fontSize: "16px",
          lineHeight: "1.6",
          color: "var(--text-secondary, #475569)",
          borderRadius: "0 8px 8px 0",
        },
      },
      tailwindStyles:
        "border-l-4 border-primary pl-5 py-3 my-4 bg-slate-50 dark:bg-slate-800/50 italic text-base text-slate-600 dark:text-slate-300 rounded-r-lg",
    });
  }
}

export class CodeElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      content: "// Your code here\nconsole.log('Hello, world!');",
      settings: {
        language: "javascript",
        preformatted: true,
      },
      styles: {
        default: {
          fontFamily:
            "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
          fontSize: "13px",
          lineHeight: "1.6",
          backgroundColor: "var(--bg-code, #1e293b)",
          color: "var(--text-code, #e2e8f0)",
          padding: "16px 20px",
          borderRadius: "8px",
          overflow: "auto",
          whiteSpace: "pre",
          tabSize: 2,
        },
      },
      tailwindStyles:
        "font-mono text-sm leading-relaxed bg-slate-800 text-slate-200 p-4 rounded-lg overflow-auto whitespace-pre",
    });
  }
}

export class SeparatorElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      content: "",
      styles: {
        default: {
          width: "100%",
          height: "1px",
          backgroundColor: "var(--border-color, #e2e8f0)",
          border: "none",
          margin: "16px 0",
        },
      },
      tailwindStyles:
        "w-full h-px bg-gray-200 dark:bg-slate-700 my-4 border-none",
    });
  }
}

export class IconElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): IconElement {
    return createBaseElement(state, {
      content: "",
      settings: {
        iconName: "star",
        size: 24,
        strokeWidth: 2,
        color: "currentColor",
        fill: "none",
        absoluteStrokeWidth: false,
      },
      styles: {
        default: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-primary, #1e293b)",
        },
      },
      tailwindStyles:
        "inline-flex items-center justify-center text-slate-800 dark:text-slate-200",
    }) as IconElement;
  }
}

// ============================================
// MEDIA ELEMENTS
// ============================================

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

export class VideoElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): VideoElement {
    return createBaseElement(state, {
      content: "Video",
      settings: {
        controls: true,
        autoplay: false,
        loop: false,
        muted: false,
        preload: "metadata",
        playsInline: true,
        objectFit: "contain",
      },
      styles: {
        default: {
          width: "100%",
          height: "auto",
          minHeight: "200px",
          borderRadius: "8px",
          backgroundColor: "var(--bg-surface, #000000)",
        },
      },
      tailwindStyles: "w-full rounded-lg bg-black",
    }) as VideoElement;
  }
}

export class AudioElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): AudioElement {
    return createBaseElement(state, {
      content: "Audio",
      settings: {
        controls: true,
        autoplay: false,
        loop: false,
        muted: false,
        preload: "metadata",
      },
      styles: {
        default: {
          width: "100%",
          height: "54px",
          borderRadius: "28px",
        },
      },
      tailwindStyles: "w-full rounded-full",
    }) as AudioElement;
  }
}

export class IFrameElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): IFrameElement {
    return createBaseElement(state, {
      content: "Embedded content",
      settings: {
        sandbox: "allow-scripts allow-same-origin",
        loading: "lazy",
        width: "100%",
        height: 400,
      },
      styles: {
        default: {
          width: "100%",
          height: "400px",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "8px",
          backgroundColor: "var(--bg-surface, #ffffff)",
        },
      },
      tailwindStyles:
        "w-full h-[400px] rounded-lg border border-gray-200 bg-white",
    }) as IFrameElement;
  }
}

// ============================================
// INTERACTIVE / LINK ELEMENTS
// ============================================

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

// ============================================
// FORM ELEMENTS
// ============================================

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

export class TextareaElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): TextareaElement {
    return createBaseElement(state, {
      content: "",
      settings: {
        placeholder: "Enter text...",
        rows: 4,
        resize: "vertical",
      },
      styles: {
        default: {
          width: "100%",
          minHeight: "100px",
          padding: "10px 14px",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: "8px",
          fontSize: "15px",
          backgroundColor: "var(--bg-input, #ffffff)",
          resize: "vertical",
          fontFamily: "inherit",
        },
      },
      tailwindStyles:
        "w-full min-h-[100px] px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition",
    }) as TextareaElement;
  }
}

export class CheckboxElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): CheckboxElement {
    return createBaseElement(state, {
      content: "Checkbox label",
      settings: {
        name: "",
        checked: false,
        defaultChecked: false,
        required: false,
        disabled: false,
        value: "",
        label: "Checkbox label",
      },
      styles: {
        default: {
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          fontSize: "14px",
          color: "var(--text-primary, #1e293b)",
        },
      },
      tailwindStyles:
        "inline-flex items-center gap-2 cursor-pointer text-sm text-slate-800 dark:text-slate-200",
    }) as CheckboxElement;
  }
}

export class RadioElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): RadioElement {
    return createBaseElement(state, {
      content: "Radio label",
      settings: {
        name: "",
        checked: false,
        defaultChecked: false,
        required: false,
        disabled: false,
        value: "",
        label: "Radio label",
      },
      styles: {
        default: {
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          fontSize: "14px",
          color: "var(--text-primary, #1e293b)",
        },
      },
      tailwindStyles:
        "inline-flex items-center gap-2 cursor-pointer text-sm text-slate-800 dark:text-slate-200",
    }) as RadioElement;
  }
}

export class ProgressElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): ProgressElement {
    return createBaseElement(state, {
      content: "",
      settings: {
        value: 50,
        max: 100,
        indeterminate: false,
        label: "Progress",
      },
      styles: {
        default: {
          width: "100%",
          height: "8px",
          borderRadius: "9999px",
          backgroundColor: "var(--bg-muted, #e2e8f0)",
          overflow: "hidden",
        },
      },
      tailwindStyles:
        "w-full h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden",
    }) as ProgressElement;
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

// ============================================
// TABLE ELEMENT
// ============================================

export class TableElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): TableElement {
    return createBaseElement(state, {
      content: "",
      settings: {
        caption: "",
        bordered: true,
        striped: false,
        hoverable: true,
        compact: false,
        columns: [
          { id: "col-1", header: "Column 1", align: "left" },
          { id: "col-2", header: "Column 2", align: "left" },
          { id: "col-3", header: "Column 3", align: "left" },
        ],
      },
      styles: {
        default: {
          width: "100%",
          minHeight: "120px",
          borderCollapse: "collapse",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: "8px",
          overflow: "hidden",
          fontSize: "14px",
          backgroundColor: "var(--bg-surface, #ffffff)",
        },
      },
      tailwindStyles:
        "w-full min-h-[120px] border-collapse rounded-lg border border-gray-200 bg-white text-sm overflow-hidden",
    }) as TableElement;
  }
}

// ============================================
// CONTAINER / LAYOUT ELEMENTS
// ============================================

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
          borderRadius: "8px",
          padding: "16px",
        },
      },
      tailwindStyles:
        "w-full mx-auto rounded-lg p-4 bg-white dark:bg-slate-800",
    });
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

export class NavElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      styles: {
        default: {
          width: "100%",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
        },
      },
      tailwindStyles:
        "w-full min-h-[60px] flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800",
    });
  }
}

export class HeaderElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      styles: {
        default: {
          width: "100%",
          minHeight: "80px",
          padding: "24px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
        },
      },
      tailwindStyles:
        "w-full min-h-[80px] p-6 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800",
    });
  }
}

export class FooterElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      styles: {
        default: {
          width: "100%",
          minHeight: "80px",
          padding: "24px",
          backgroundColor: "var(--bg-surface, #f8fafc)",
          borderTop: "1px solid rgba(15,23,42,0.06)",
        },
      },
      tailwindStyles:
        "w-full min-h-[80px] p-6 bg-slate-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800",
    });
  }
}

export class ArticleElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      styles: {
        default: {
          width: "100%",
          minHeight: "200px",
          padding: "24px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: "12px",
        },
      },
      tailwindStyles:
        "w-full min-h-[200px] p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl",
    });
  }
}

export class AsideElementCreateStrategy implements ElementCreateStrategy {
  buildElement(state: BuilderState): EditorElement {
    return createBaseElement(state, {
      styles: {
        default: {
          width: "100%",
          minHeight: "160px",
          padding: "20px",
          backgroundColor: "var(--bg-muted, #f8fafc)",
          borderLeft: "3px solid var(--color-primary, #2563eb)",
          borderRadius: "0 8px 8px 0",
        },
      },
      tailwindStyles:
        "w-full min-h-[160px] p-5 bg-slate-50 dark:bg-slate-800/50 border-l-[3px] border-primary rounded-r-lg",
    });
  }
}

// ============================================
// CAROUSEL ELEMENT
// ============================================

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

// ============================================
// CMS ELEMENTS
// ============================================

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
