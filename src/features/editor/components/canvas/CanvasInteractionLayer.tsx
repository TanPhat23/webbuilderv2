import React, { useCallback, useRef, useState } from "react";
import type { EditorElement } from "@/types/global.type";
import { CollaboratorRole } from "@/features/collaboration";
import { useElementStore } from "@/features/editor/store/element-store";
import { useSelectionStore } from "@/features/editor/store/selection-store";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { ElementFactory } from "@/features/editor/utils/element/create/ElementFactory";
import { customComps } from "@/features/editor/lib/customcomponents/customComponents";
import {
  DRAG_KEYS,
  readDropPayload,
  setMoveDrag,
} from "@/features/editor/utils/element/dragPayload";
import {
  computeDropPosition,
  isHorizontalFlow,
} from "@/features/editor/utils/element/dropPosition";
import { useEditorFlags } from "@/features/editor/components/context/EditorFlagsContext";
import EditorContextMenu from "@/features/editor/components/EditorContextMenu";
import { showErrorToast, PERMISSION_ERRORS } from "@/utils/errors/errorToast";
import { CanvasOverlay, type DropIndicatorState } from "./CanvasOverlay";
import { findElementNode } from "./useElementRect";

const CANVAS_CSS = `
[data-canvas-root] [draggable="true"] { cursor: grab; }
[data-canvas-root] [data-dragging="true"] { opacity: 0.5; }
`;

/** The innermost canvas element under an event target, if inside `root`. */
function elementNodeFrom(
  root: HTMLElement | null,
  target: EventTarget | null,
): HTMLElement | null {
  const closest = (target as Element | null)?.closest?.("[data-element-id]");
  return closest && root?.contains(closest) ? (closest as HTMLElement) : null;
}

function isTypingInCanvas(root: HTMLElement | null): boolean {
  const active = root?.ownerDocument.activeElement as HTMLElement | null;
  return !!active?.isContentEditable;
}

function findElement(id: string): EditorElement | undefined {
  return elementHelper.findById(useElementStore.getState().elements, id);
}

function setSelection(patch: {
  selectedElementId?: string | undefined;
  hoveredElementId?: string | undefined;
  draggingElementId?: string | undefined;
}) {
  useSelectionStore.setState(patch);
}

function hasElementDragData(dt: DataTransfer): boolean {
  const types = Array.from(dt.types);
  return (
    types.includes(DRAG_KEYS.elementId.toLowerCase()) ||
    types.includes(DRAG_KEYS.elementType.toLowerCase()) ||
    types.includes(DRAG_KEYS.template.toLowerCase())
  );
}

/**
 * Wraps the root canvas element list and handles editor interactions for
 * every element through event delegation: hover, double-click selection,
 * drag & drop (before / after / inside the element under the cursor) and the
 * context menu. Element renderers only mark their root with
 * `data-element-id`; all editor chrome is drawn by `CanvasOverlay`.
 */
export function CanvasInteractionLayer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { canEdit, canCreate, isReadOnly, isLocked, permissionsRole } =
    useEditorFlags();
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [drop, setDrop] = useState<DropIndicatorState | null>(null);
  const dropRef = useRef<DropIndicatorState | null>(null);
  const draggingIdRef = useRef<string | null>(null);
  const draggingId = useSelectionStore((s) => s.draggingElementId);

  const updateDrop = useCallback((next: DropIndicatorState | null) => {
    const prev = dropRef.current;
    if (
      prev === next ||
      (prev &&
        next &&
        prev.targetId === next.targetId &&
        prev.position === next.position &&
        prev.horizontal === next.horizontal)
    ) {
      return;
    }
    dropRef.current = next;
    setDrop(next);
  }, []);

  const resetDrag = useCallback(() => {
    if (draggingIdRef.current) {
      findElementNode(root, draggingIdRef.current)?.removeAttribute(
        "data-dragging",
      );
    }
    draggingIdRef.current = null;
    updateDrop(null);
    setSelection({ draggingElementId: undefined });
  }, [root, updateDrop]);

  const onMouseOver = (e: React.MouseEvent) => {
    if (isTypingInCanvas(root)) return;
    const id = elementNodeFrom(root, e.target)?.dataset.elementId;
    if (useSelectionStore.getState().hoveredElementId !== id) {
      setSelection({ hoveredElementId: id });
    }
  };

  const onMouseLeave = () => {
    if (isTypingInCanvas(root)) return;
    setSelection({ hoveredElementId: undefined });
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const id = elementNodeFrom(root, e.target)?.dataset.elementId;
    if (!id) return;
    e.preventDefault();
    if (!canEdit) {
      showErrorToast(PERMISSION_ERRORS.cannotEdit);
      return;
    }
    const isSelected = useSelectionStore.getState().selectedElementId === id;
    setSelection({ selectedElementId: isSelected ? undefined : id });
  };

  const onContextMenu = (e: React.MouseEvent) => {
    const id = elementNodeFrom(root, e.target)?.dataset.elementId;
    // No element under the cursor: keep the editor menu closed.
    if (!id) {
      e.preventDefault();
      return;
    }
    setSelection({ selectedElementId: id });
  };

  const onDragStart = (e: React.DragEvent) => {
    const node = elementNodeFrom(root, e.target);
    // Not ours (e.g. dragging selected text while editing): browser default.
    if (!node || !node.draggable) return;
    e.stopPropagation();
    if (!canEdit) {
      e.preventDefault();
      return;
    }
    const id = node.dataset.elementId!;
    setMoveDrag(e.dataTransfer, id);
    draggingIdRef.current = id;
    node.setAttribute("data-dragging", "true");
    setSelection({ draggingElementId: id, hoveredElementId: undefined });
  };

  const onDragOver = (e: React.DragEvent) => {
    const node = elementNodeFrom(root, e.target);
    // Over empty canvas, or a drag we don't own (media from the library):
    // let the canvas root / media elements handle it.
    if (!node || !hasElementDragData(e.dataTransfer)) {
      updateDrop(null);
      return;
    }
    const isMove = draggingIdRef.current !== null;
    if (isMove ? !canEdit : !canCreate) return;

    e.preventDefault();
    e.stopPropagation();

    if (isMove && findElementNode(root, draggingIdRef.current!)?.contains(node)) {
      e.dataTransfer.dropEffect = "none";
      updateDrop(null);
      return;
    }

    const view = node.ownerDocument.defaultView ?? window;
    const parentStyle = node.parentElement
      ? view.getComputedStyle(node.parentElement)
      : null;
    const horizontal = parentStyle ? isHorizontalFlow(parentStyle) : false;
    const position = computeDropPosition(
      node.getBoundingClientRect(),
      { x: e.clientX, y: e.clientY },
      {
        isContainer: elementHelper.isContainerElement({
          type: node.dataset.elementType,
        } as EditorElement),
        horizontal,
      },
    );
    e.dataTransfer.dropEffect = isMove ? "move" : "copy";
    updateDrop({ targetId: node.dataset.elementId!, position, horizontal });
  };

  const onDragLeave = (e: React.DragEvent) => {
    if (!root?.contains(e.relatedTarget as Node | null)) updateDrop(null);
  };

  const onDrop = (e: React.DragEvent) => {
    const target = dropRef.current;
    if (!target) {
      resetDrag();
      return; // empty canvas: the canvas root appends to the page
    }
    e.preventDefault();
    e.stopPropagation();

    try {
      const payload = readDropPayload(e.dataTransfer);
      if (!payload) return;
      const store = useElementStore.getState();

      if (payload.kind === "move") {
        if (!canEdit) {
          showErrorToast(PERMISSION_ERRORS.cannotPerformAction);
          return;
        }
        store.moveElement(payload.elementId, target.targetId, target.position);
        return;
      }

      if (!canCreate) {
        showErrorToast(PERMISSION_ERRORS.cannotAdd);
        return;
      }
      const pageId =
        findElement(target.targetId)?.pageId ?? store.activePage?.pageId ?? "";
      const factory = ElementFactory.getInstance();
      let newElement: EditorElement | undefined | null;
      if (payload.kind === "create") {
        newElement = factory.createElement({ type: payload.elementType, pageId });
      } else {
        const template = customComps[payload.index];
        newElement = template
          ? factory.createElementFromTemplate({ element: template, pageId })
          : undefined;
      }
      if (!newElement) return;
      store.insertElementRelative(newElement, target.targetId, target.position);
      if (payload.kind === "create") {
        setSelection({ selectedElementId: newElement.id });
      }
    } catch (error) {
      console.warn("Failed to handle canvas drop", error);
    } finally {
      resetDrag();
    }
  };

  const layer = (
    <div
      ref={setRoot}
      data-canvas-root
      className="relative"
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={resetDrag}
    >
      <style>{CANVAS_CSS}</style>
      {children}
      <CanvasOverlay
        root={root}
        drop={drop}
        isDragging={!!draggingId || drop !== null}
      />
    </div>
  );

  if (permissionsRole === CollaboratorRole.VIEWER) return layer;
  return (
    <EditorContextMenu isReadOnly={isReadOnly} isLocked={isLocked}>
      {layer}
    </EditorContextMenu>
  );
}
