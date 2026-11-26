import { useNavigate } from "@tanstack/react-router";
import { Component } from "lucide-react";
import {
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import { useSharedSectionControls } from "@/features/editor/hooks/useSharedSectionControls";

export function SharedSectionMenu({ container, editable }: { container: HTMLElement; editable: boolean }) {
  const navigate = useNavigate();
  const {
    isRootSection, canEdit, value, available, linkedId,
    projectId, isLoading, isError, setSharedSection,
  } = useSharedSectionControls();
  if (!isRootSection) return null;

  const activeSource = available.find((source) => source.id === linkedId);
  const allowChanges = editable && canEdit;

  return (
    <>
      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2">
          <Component />
          Shared section
        </ContextMenuSubTrigger>
        <ContextMenuPortal container={container}>
          <ContextMenuSubContent className="max-h-(--radix-context-menu-content-available-height) max-w-72 overflow-y-auto">
            {activeSource && projectId && (
              <ContextMenuItem onSelect={() => void navigate({
                to: "/editor/$id", params: { id: projectId }, search: { page: activeSource.pageId },
              })}>
                Open source page
              </ContextMenuItem>
            )}
            <ContextMenuGroup>
              <ContextMenuItem disabled={!allowChanges || value === "header"} onSelect={() => setSharedSection("header")}>
                Share as header
              </ContextMenuItem>
              <ContextMenuItem disabled={!allowChanges || value === "footer"} onSelect={() => setSharedSection("footer")}>
                Share as footer
              </ContextMenuItem>
              {value !== "local" && (
                <ContextMenuItem disabled={!allowChanges} onSelect={() => setSharedSection("local")}>
                  {linkedId ? "Unlink shared section" : "Stop sharing"}
                </ContextMenuItem>
              )}
            </ContextMenuGroup>
            {(available.length > 0 || isLoading || isError) && (
              <>
                <ContextMenuSeparator />
                <ContextMenuGroup>
                  <ContextMenuLabel>Link to a shared section</ContextMenuLabel>
                  {isLoading && <ContextMenuItem disabled>Loading shared sections…</ContextMenuItem>}
                  {isError && <ContextMenuItem disabled>Could not load shared sections</ContextMenuItem>}
                  {available.map((source) => (
                    <ContextMenuItem
                      key={source.id}
                      disabled={!allowChanges || value === source.value}
                      onSelect={() => setSharedSection(source.value)}
                    >
                      {source.label}
                    </ContextMenuItem>
                  ))}
                </ContextMenuGroup>
              </>
            )}
          </ContextMenuSubContent>
        </ContextMenuPortal>
      </ContextMenuSub>
      <ContextMenuSeparator />
    </>
  );
}
