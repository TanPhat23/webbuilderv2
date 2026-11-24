import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useComponentActions } from "@/features/editor/hooks/useComponentActions";
import { ElementStore } from "@/features/editor/store/element-store";
import { useSelectionStore } from "@/features/editor/store/selection-store";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import { useCollaborationOptional } from "@/features/collaboration/context/CollaborationContext";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import { useActiveLogic } from "@/features/interactions/logic-hooks";
import { loadPreamble, savePreamble } from "@/features/editor/lib/code/customCode";
import { elementService } from "@/features/elements/services/element.service";
import { getProjectById, getProjectPages, updateProject } from "@/features/projects/api/project.api";
import { createPage } from "@/features/projects/api/page.api";
import { newEntityId } from "@/lib/entity-id";
import { projectKeys } from "@/features/projects/hooks/useProjects";
import { registerAgentHost } from "./runtime";
import { useAgentActivity } from "./activity";
import { liveEditPlayer } from "./liveEditPlayer";
import type { ProjectStylePatch } from "./executor";

type Json = Record<string, unknown>;

/**
 * Registers this editor as the place CLI tool calls run. Renders nothing.
 *
 * Mounted once by the editor frame, so it lives as long as the project is open
 * and not just while a page's canvas is on screen: a CLI can switch pages and
 * change project styling without the bridge disappearing under it.
 */
export function AgentHost() {
  const { editor, editingMode, projectId } = useEditorContext();
  const permissions = useEditorPermissions(projectId);
  const collab = useCollaborationOptional();
  const logic = useActiveLogic();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { createComponent } = useComponentActions();
  const componentAction = useRef(createComponent);
  componentAction.current = createComponent;

  const canEdit = !editor.isReadOnly && !editor.isLocked && editingMode !== "code" && !!permissions?.canEditElements;
  const ready = !editor.isLoading && (collab ? collab.isSynced : true);
  const live = useRef({ permissionsLoading: !!permissions?.isLoading, codeMode: editingMode === "code", locked: !!editor.isLocked, canEdit, ready, logic, projectId, canEditProject: !!permissions?.canEditProject, canCreatePages: !!permissions?.canCreatePages });
  live.current = { permissionsLoading: !!permissions?.isLoading, codeMode: editingMode === "code", locked: !!editor.isLocked, canEdit, ready, logic, projectId, canEditProject: !!permissions?.canEditProject, canCreatePages: !!permissions?.canCreatePages };

  useEffect(() => {
    const broadcaster = collab?.sendAgentPresence ?? null;
    liveEditPlayer.setPresenceBroadcaster(broadcaster);
    return () => {
      liveEditPlayer.setPresenceBroadcaster(null);
    };
  }, [collab?.sendAgentPresence]);

  useEffect(() => {
    return () => {
      liveEditPlayer.flush();
    };
  }, [logic.pageId]);

  useEffect(() => {
    const pageOf = () => live.current.logic.pageId ?? undefined;

    /** The project's saved styling is read fresh: the settings panel may have changed it. */
    async function setProjectStyle(patch: ProjectStylePatch): Promise<ProjectStylePatch> {
      const id = live.current.projectId;
      if (!id) throw new Error("No project is open.");
      const project = await getProjectById({ data: { projectId: id } });
      const styles = { ...((project.styles as Json | null) ?? {}) };
      const before: ProjectStylePatch = { css: project.header?.cssStyles ?? "" };
      if (patch.theme) {
        before.theme = {};
        for (const [key, value] of Object.entries(patch.theme)) {
          before.theme[key] = key in styles ? styles[key] : null;
          if (value === null) delete styles[key];
          else styles[key] = value;
        }
      }
      const updated = await updateProject({
        data: {
          projectId: id,
          updates: {
            ...(patch.css !== undefined && { header: { ...project.header, cssStyles: patch.css } }),
            ...(patch.theme && { styles: styles as never }),
          },
        },
      });
      queryClient.setQueryData(projectKeys.detail(id), updated);
      return before;
    }

    registerAgentHost({
      isComponentPage: () => ElementStore.getState().isComponentPage,
      createComponent: (name, fromElementId) => componentAction.current(name, { fromElementId }),
      getComponents: async () => {
        const id = live.current.projectId;
        if (!id) throw new Error("No project is open.");
        const [pages, saved] = await Promise.all([
          queryClient.fetchQuery({ queryKey: projectKeys.pages(id), queryFn: () => getProjectPages({ data: { projectId: id } }), staleTime: 0 }),
          elementService.getElements(id),
        ]);
        const state = ElementStore.getState();
        const current = pageOf();
        const elements = current && live.current.ready && state.activePage?.projectId === id && state.activePage.pageId === current
          ? [...saved.filter((element) => element.pageId !== current), ...state.elements]
          : saved;
        const components = pages.filter(({ Type, DeletedAt }) => Type === "cp" && !DeletedAt).map(({ Id, Name }) => ({ id: Id, name: Name }));
        return { pages: components, pageIds: new Set(components.map(({ id }) => id)), elements };
      },
      getElements: () => ElementStore.getState().elements,
      getPageId: pageOf,
      isReady: () => {
        const first = ElementStore.getState().elements[0] as { pageId?: string } | undefined;
        // The previous page's tree stays in the store until the new one syncs.
        return live.current.ready && (!first?.pageId || first.pageId === pageOf());
      },
      canEdit: () => live.current.canEdit,
      whyNotEditable: () => {
        const l = live.current;
        if (l.permissionsLoading) return { code: "editor_not_ready", message: "The editor is still checking the user's permissions. Try again in a moment." };
        if (l.codeMode) return { code: "editor_locked", message: "The editor is in code mode, which is read-only for edits from the CLI. Ask the user to switch back to visual mode, then try again." };
        if (l.locked) return { code: "editor_locked", message: "This page is locked in the editor. Ask the user to unlock it, then try again." };
        return { code: "forbidden", message: "The user has read-only access to this project." };
      },
      canEditProject: () => live.current.canEditProject,
      canCreatePages: () => live.current.canCreatePages,
      createPage: async (name) => {
        const id = live.current.projectId;
        if (!id) throw new Error("No project is open.");
        // Same call as the Pages panel: a static page ("sp") with no page styles.
        const page = await createPage({ data: { Id: newEntityId(), Name: name, ProjectId: id, Styles: {}, Type: "sp" } });
        await queryClient.cancelQueries({ queryKey: projectKeys.pages(id), exact: true });
        queryClient.setQueryData<(typeof page)[]>(projectKeys.pages(id), (pages) => [...(pages ?? []), page]);
        return { id: page.Id, name: page.Name };
      },
      openPage: async (pageId) => {
        const id = live.current.projectId;
        if (!id) return false;
        const pages = await queryClient.fetchQuery({ queryKey: projectKeys.pages(id), queryFn: () => getProjectPages({ data: { projectId: id } }), staleTime: 0 });
        if (!pages.some((p: { Id: string }) => p.Id === pageId)) return false;
        // Answer first: the collaboration socket is rebuilt for the new page, and
        // a reply sent after that would go nowhere.
        setTimeout(() => void navigate({ to: `/editor/${id}?page=${pageId}` }), 100);
        return true;
      },
      setProjectStyle,
      notifyProjectChanged: (summary, undo) => {
        useAgentActivity.getState().mark(false);
        toast("Your CLI changed the project", { description: summary, ...(undo && { action: { label: "Undo", onClick: undo } }) });
      },
      replaceTree: (next) => {
        useAgentActivity.getState().mark(true);
        ElementStore.getState().replaceTree(next);
      },
      playTreeChange: (before, next, summary) => {
        useAgentActivity.getState().mark(true);
        liveEditPlayer.play({
          beforeTree: before,
          afterTree: next,
          agentName: "MCP Agent",
          summary,
          onComplete: () => {
            useAgentActivity.getState().mark(false);
            toast("Your CLI changed the page", {
              description: summary,
              action: {
                label: "Undo",
                onClick: () => ElementStore.getState().undo(),
              },
            });
          },
        });
      },
      flushPlayback: () => {
        liveEditPlayer.flush();
      },
      getSelectedId: () => useSelectionStore.getState().selectedElementId,
      generateCode: async () => {
        const { variables, flows, pageId } = live.current.logic;
        const result = await elementService.generateCode(ElementStore.getState().elements, {}, { variables, flows }, loadPreamble(pageId ?? undefined));
        return result.code;
      },
      getPreamble: () => loadPreamble(pageOf()),
      setPreamble: (next) => savePreamble(pageOf(), next),
      notifyChanged: (summary) => {
        useAgentActivity.getState().mark(false);
        toast("Your CLI changed the page", {
          description: summary,
          action: { label: "Undo", onClick: () => ElementStore.getState().undo() },
        });
      },
    });
    return () => {
      liveEditPlayer.flush();
      registerAgentHost(null);
    };
  }, [navigate, queryClient]);

  return null;
}
