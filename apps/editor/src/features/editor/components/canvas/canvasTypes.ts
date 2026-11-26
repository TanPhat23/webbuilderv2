import type { DropPosition } from "@/features/editor/utils/element/dropPosition";
import type {
  DimensionDirection,
  ResizePreview,
} from "@/features/editor/utils/element/resizeMath";
import type {
  SpacingHandleId,
  SpacingPreview,
} from "@/features/editor/utils/element/spacingMath";

export interface DropIndicatorState {
  targetId: string;
  position: DropPosition;
  /** Siblings flow left-to-right, so before/after are vertical bars. */
  horizontal: boolean;
}

export type ManipulationSession =
  | { readonly kind: "idle" }
  | {
      readonly kind: "resizing";
      readonly elementId: string;
      readonly direction: DimensionDirection;
      readonly preview: ResizePreview;
    }
  | {
      readonly kind: "spacing";
      readonly elementId: string;
      readonly handle: SpacingHandleId;
      readonly preview: SpacingPreview;
    }
  | {
      readonly kind: "moving";
      readonly elementId: string;
      readonly elementLabel: string;
      readonly pointer: { readonly x: number; readonly y: number };
      readonly target: DropIndicatorState | null;
    };
