import type React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCollaborationOptional } from "@/features/collaboration/context/CollaborationContext";
import { CollaboratorRole } from "@/types/collaboration";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import { useDynamicPagePreview } from "@/features/editor/hooks/useDynamicPagePreview";
import { useEditorShortcuts } from "@/features/editor/hooks/useEditorShortcuts";
import { useForwardChromeShortcuts } from "@/features/editor/components/layout/useForwardChromeShortcuts";
import {
  computeEffectiveZoom,
  useCanvasViewportStore,
} from "@/features/editor/store/canvas-viewport-store";
import { useElementStore } from "@/features/editor/store/element-store";
import { useCurrentProject } from "@/features/projects/hooks/useProjects";
import ElementLoader, {
  useCanvasAccess,
  useResolvedPage,
} from "@/features/editor/components/ElementLoader";
import EditorContextMenu from "@/features/editor/components/EditorContextMenu";
import AddSectionDivider from "@/features/editor/components/editor/AddSectionDivider";
import EmptyPageStarter from "@/features/editor/components/editor/EmptyPageStarter";
import ElementLoading from "@/features/editor/components/skeleton/ElementLoading";
import { CanvasHud } from "./CanvasHud";
import { SiteFrame, useFrameLayout, type FrameLayout, type SiteFrameHandle } from "./SiteFrame";
import { routeSiteContextMenu } from "./contextMenuRetarget";
import { useCanvasController } from "./useCanvasController";
import { WidthScrubHandle } from "./WidthScrubHandle";

/** True for events dispatched in the editor document (not inside the site iframe). */
function isParentRealmEvent(event: React.SyntheticEvent): boolean {
  const target = event.target;
  return (
    target !== null &&
    typeof target === "object" &&
    "ownerDocument" in target &&
    target.ownerDocument === event.currentTarget.ownerDocument
  );
}

type DragHandler = (event: React.DragEvent) => void;

/** The site iframe's own drag events reach the controller through the frame wrapper. */
function parentRealmOnly(handler: DragHandler): DragHandler {
  return (event) => {
    if (isParentRealmEvent(event)) handler(event);
  };
}

/** Positions an editor-DOM overlay over the (scaled) page frame. */
function FrameOverlay({
  layout,
  className,
  children,
}: {
  readonly layout: FrameLayout;
  readonly className: string;
  readonly children: React.ReactNode;
}): ReactElement {
  return (
    <div
      className={className}
      style={{
        left: layout.left,
        top: layout.top,
        width: layout.scaledWidth,
        height: layout.scaledHeight,
      }}
    >
      {children}
    </div>
  );
}

/**
 * The editor canvas: a spatial stage that auto-fits (or manually zooms and
 * pans) one persistent site iframe, with every piece of editor chrome drawn in
 * the parent DOM above it.
 */
export default function CanvasStage(): ReactElement {
  const queryClient = useQueryClient();
  const collab = useCollaborationOptional();
  const { editor, editingMode, projectId, pageId, userId, renderAgentPlaybackHud } =
    useEditorContext();
  const { data: project } = useCurrentProject();
  const { previewData } = useDynamicPagePreview();
  const isMaster = useElementStore((s) => s.isComponentPage);

  const isCodeMode = editingMode === "code";
  const isReadOnly = editor.isReadOnly || isCodeMode;
  const isLocked = editor.isLocked || isCodeMode;
  const showAddSection = !isCodeMode;
  const access = useCanvasAccess({ isReadOnly, isLocked });

  const page = useResolvedPage();
  const layout = useFrameLayout();

  // Elements arrive over the collab socket after the REST queries finish, so
  // the page is only known to be empty once it has synced.
  const isSynced = collab ? collab.isSynced : true;
  const isEmpty = !editor.isLoading && isSynced && page.list.length === 0;
  const canInsert = !isReadOnly && !isLocked && editor.permissions.canCreateElements;

  const stageRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null);
  const [frame, setFrame] = useState<SiteFrameHandle | null>(null);
  const siteRoot = frame?.siteRoot ?? null;

  const setStageNode = useCallback((node: HTMLDivElement | null): void => {
    stageRef.current = node;
    setStageEl(node);
  }, []);

  useLayoutEffect(() => {
    if (!stageEl) return;
    const measure = (): void => {
      useCanvasViewportStore
        .getState()
        .setStageBounds(Math.round(stageEl.clientWidth), Math.round(stageEl.clientHeight));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stageEl);
    return () => observer.disconnect();
  }, [stageEl]);

  const controller = useCanvasController({
    siteRoot,
    stageEl,
    iframeRef,
    canEdit: access.canEdit,
    canCreate: access.canCreate,
    queryClient,
    projectId,
    pageId,
    userId,
  });

  const menuEnabled = access.permissionsRole !== CollaboratorRole.VIEWER;
  useEditorShortcuts({
    stageRef,
    mountNode: siteRoot,
    isReadOnly,
    isLocked,
    contextMenuEnabled: menuEnabled,
  });
  useForwardChromeShortcuts(iframeRef);

  // The pick crosshair is applied to the site document by the editor.
  const { picking } = controller;
  useEffect(() => {
    if (!siteRoot) return;
    siteRoot.toggleAttribute("data-picking", picking);
    return () => siteRoot.removeAttribute("data-picking");
  }, [siteRoot, picking]);

  const { siteHandlers, stageHandlers } = controller;
  const onSiteContextMenuCapture = (event: React.MouseEvent): void => {
    // The menu opens in the editor document, so the retarget supplies
    // editor-window coordinates to the trigger (see contextMenuRetarget).
    routeSiteContextMenu(event, {
      iframeEl: iframeRef.current,
      zoom: computeEffectiveZoom(useCanvasViewportStore.getState()),
      menuEnabled,
      handlers: siteHandlers,
    });
  };

  // The site tree must not re-render for editor-chrome state (drag pointer,
  // hover, zoom) that changes the controller on every pointer frame.
  const siteContent = useMemo(
    () =>
      editor.isLoading ? null : (
        <ElementLoader
          page={page}
          data={previewData}
          isReadOnly={isReadOnly}
          isLocked={isLocked}
          iframeRef={iframeRef}
        />
      ),
    [editor.isLoading, page, previewData, isReadOnly, isLocked],
  );

  const siteFrame = (
    <SiteFrame
      iframeRef={iframeRef}
      elements={page.resolved}
      projectCss={project?.header?.cssStyles}
      siteHandlers={{ ...siteHandlers, onContextMenuCapture: onSiteContextMenuCapture }}
      onReady={setFrame}
    >
      {siteContent}
    </SiteFrame>
  );

  const showStarter = isEmpty && canInsert && showAddSection;
  const showAddSectionDivider =
    !editor.selectedElement && !isEmpty && !isMaster && showAddSection;

  return (
    <div
      ref={setStageNode}
      id="canvas"
      data-canvas-stage
      tabIndex={0}
      className="relative h-full w-full overflow-hidden bg-canvas-backdrop bg-[radial-gradient(var(--canvas-dot)_1px,transparent_1px)] [background-size:16px_16px] outline-none"
      onPointerDown={stageHandlers.onPointerDown}
      onDragEnter={parentRealmOnly(siteHandlers.onDragEnter)}
      onDragOver={parentRealmOnly(siteHandlers.onDragOver)}
      onDragLeave={parentRealmOnly(siteHandlers.onDragLeave)}
      onDrop={parentRealmOnly(siteHandlers.onDrop)}
      onDragEnd={siteHandlers.onDragEnd}
    >
      {/* Same tree for every role: swapping wrappers would remount the iframe. */}
      <EditorContextMenu isReadOnly={isReadOnly} isLocked={isLocked} disabled={!menuEnabled}>
        {siteFrame}
      </EditorContextMenu>

      {editor.isLoading && (
        <FrameOverlay layout={layout} className="absolute overflow-hidden bg-card">
          <ElementLoading count={6} />
        </FrameOverlay>
      )}
      {showStarter && (
        <FrameOverlay layout={layout} className="absolute overflow-auto bg-card text-card-foreground">
          <EmptyPageStarter onAddSection={editor.addNewSection} />
        </FrameOverlay>
      )}

      <WidthScrubHandle side="left" layout={layout} />
      <WidthScrubHandle side="right" layout={layout} />

      <CanvasHud
        siteRoot={siteRoot}
        stageEl={stageEl}
        iframeEl={frame?.iframe ?? null}
        iframeRef={iframeRef}
        controller={controller}
        instances={page.instances}
        canEdit={access.canEdit}
        userId={editor.userId ?? "guest"}
      />

      {showAddSectionDivider && (
        <div
          className="pointer-events-none absolute bottom-0 z-[1001]"
          style={{ left: layout.left, width: layout.scaledWidth }}
        >
          <AddSectionDivider
            onAddSection={editor.addNewSection}
            disabled={isReadOnly || isLocked}
            className="my-0 py-0.5 [&_button]:pointer-events-auto"
          />
        </div>
      )}

      {renderAgentPlaybackHud?.()}
    </div>
  );
}
