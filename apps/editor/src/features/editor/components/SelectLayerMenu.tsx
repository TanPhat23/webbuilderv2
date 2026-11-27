import { useEffect, useMemo, useRef } from "react";
import { Check, Layers } from "lucide-react";
import {
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import { useElementStore } from "@/features/editor/store/element-store";
import { SelectionStore, useSelectionStore } from "@/features/editor/store/selection-store";
import { getAncestorChain, layerLabel } from "@/features/editor/utils/element/ancestors";

/**
 * "Select layer" submenu: the selected element and every ancestor, innermost
 * first. Picks a layer without having to click through whatever covers it.
 * Selection only reads the page, so it stays enabled when the editor is
 * read-only. Hidden for a page root, which has nothing to pick but itself.
 */
export function SelectLayerMenu({ container }: { container: HTMLElement }) {
  const elements = useElementStore((s) => s.elements);
  const selectedId = useSelectionStore((s) => s.selectedElementId);
  const chain = useMemo(
    () => (selectedId ? getAncestorChain(elements, selectedId) : []),
    [elements, selectedId],
  );
  // The hover outline before the first preview, so leaving puts it back.
  const previous = useRef<{ hoveredId: string | undefined } | null>(null);

  const preview = (id: string): void => {
    previous.current ??= { hoveredId: SelectionStore.getState().hoveredElementId };
    SelectionStore.setState({ hoveredElementId: id });
  };
  const restore = (): void => {
    if (!previous.current) return;
    const { hoveredId } = previous.current;
    previous.current = null;
    SelectionStore.setState({ hoveredElementId: hoveredId });
  };
  // The menu closing (Esc, outside click) unmounts this without a pointer leave.
  useEffect(() => restore, []);

  if (chain.length < 2) return null;

  return (
    <>
      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2" data-action="select-layer">
          <Layers />
          Select layer
        </ContextMenuSubTrigger>
        <ContextMenuPortal container={container}>
          <ContextMenuSubContent className="max-w-72">
            {chain.map((layer) => {
              const current = layer.id === selectedId;
              return (
                <ContextMenuItem
                  key={layer.id}
                  data-action={`select-layer-${layer.id}`}
                  data-current={current ? "true" : undefined}
                  className={current ? "font-medium" : undefined}
                  onPointerEnter={() => preview(layer.id)}
                  onPointerLeave={restore}
                  onFocus={() => preview(layer.id)}
                  onBlur={restore}
                  onSelect={() => {
                    restore();
                    SelectionStore.getState().setSelectedElement(layer);
                  }}
                >
                  <span className="truncate">{layerLabel(layer)}</span>
                  {current && <Check className="ml-auto" />}
                </ContextMenuItem>
              );
            })}
          </ContextMenuSubContent>
        </ContextMenuPortal>
      </ContextMenuSub>
      <ContextMenuSeparator />
    </>
  );
}
