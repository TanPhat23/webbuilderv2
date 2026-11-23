type MutableWindow = Omit<Window, "innerWidth"> & { innerWidth: number };

declare module "jsdom" {
  export interface JSDOMWindow extends MutableWindow, Record<string, unknown> {
    readonly MouseEvent: typeof globalThis.MouseEvent;
    readonly KeyboardEvent: typeof globalThis.KeyboardEvent;
    readonly FocusEvent: typeof globalThis.FocusEvent;
    readonly Event: typeof globalThis.Event;
    readonly HTMLElement: typeof globalThis.HTMLElement;
    readonly HTMLInputElement: typeof globalThis.HTMLInputElement;
    readonly HTMLTextAreaElement: typeof globalThis.HTMLTextAreaElement;
    readonly Document: typeof globalThis.Document;
    readonly DOMParser: typeof globalThis.DOMParser;
  }

  export class JSDOM {
    constructor(html?: string, options?: { url?: string; pretendToBeVisual?: boolean });
    readonly window: JSDOMWindow;
  }
}
