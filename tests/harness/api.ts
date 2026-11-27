import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';
import type { useElementStore } from '../../apps/editor/src/features/editor/store/element-store';
import type { useSelectionStore } from '../../apps/editor/src/features/editor/store/selection-store';
import type { useCanvasViewportStore } from '../../apps/editor/src/features/editor/store/canvas-viewport-store';

/** `window.__harness`: what a Playwright session reads and asserts against. */
export interface HarnessApi {
  readonly scenario: string;
  getElements(): ReadonlyArray<EditorElement>;
  getSelection(): { selectedElementId?: string; editingElementId?: string; hoveredElementId?: string };
  /** Re-seeds the scenario's stores; the page is not reloaded. */
  reset(): void;
  /** Escape hatch for checks the snapshots above do not cover. */
  readonly stores: {
    readonly elements: typeof useElementStore;
    readonly selection: typeof useSelectionStore;
    readonly viewport: typeof useCanvasViewportStore;
  };
}

declare global {
  interface Window { __harness?: HarnessApi }
}
