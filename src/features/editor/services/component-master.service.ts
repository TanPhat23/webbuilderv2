import type { Page } from "@/features/pages";
import { createPage, deleteProjectPage } from "@/features/projects/api/page.api";
import { cloneComponentTree } from "@/features/projects/lib/components";
import { RealtimeProvider } from "@/features/collaboration/lib/realtime/RealtimeProvider";
import { requestWebSocketTicket, resolveApiBaseUrl } from "@/features/collaboration/lib/realtime/wsTicket";
import { newEntityId } from "@/lib/entity-id";
import type { EditorElement } from "@/types/global.type";
import { elementTree } from "@/features/elements/lib/element-tree-helper";
import { ComponentConversionUnconfirmed } from "./component-conversion";

type Session = { userId: string; getToken: () => Promise<string | null> };

async function writeRoot(projectId: string, root: EditorElement, session: Session) {
  const local = {
    elements: [] as EditorElement[],
    setElements(elements: EditorElement[]) { local.elements = elements; },
    remoteAdd(element: EditorElement) { local.elements = elementTree.mapAddChildById(local.elements, element.parentId, element); },
    remoteUpdate() {},
    remoteMove() {},
    remoteDelete() {},
  };
  const wsUrl = import.meta.env.VITE_COLLAB_WS_URL || "ws://localhost:8080";
  const apiBaseUrl = resolveApiBaseUrl(wsUrl);
  let provider: RealtimeProvider | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await new Promise<void>((resolve, reject) => {
      timeout = setTimeout(() => reject(new Error("Timed out connecting to the master page.")), 10_000);
      provider = new RealtimeProvider({
        url: wsUrl,
        projectId,
        pageId: root.pageId,
        userId: session.userId,
        // The editor keeps its own socket; the API replaces a second normal one.
        writer: true,
        getTicket: () => requestWebSocketTicket(projectId, apiBaseUrl, session.getToken),
        getElementState: () => local,
        onError: (error) => reject(new Error("message" in error ? error.message : error.payload?.message ?? "Could not connect to the master page.")),
      });
      provider.on("synced", (synced: boolean) => { if (synced) resolve(); });
    });
    await provider!.createElement(root, null, 0);
  } finally {
    clearTimeout(timeout);
    provider?.destroy();
  }
}

export async function createComponentMaster({
  projectId, name, source, session, apply,
}: {
  projectId: string;
  name: string;
  source?: EditorElement;
  session: Session;
  apply?: (root: EditorElement) => void | Promise<void>;
}): Promise<{ page: Page; root?: EditorElement }> {
  const id = newEntityId();
  const root = source && { ...cloneComponentTree(source, id), order: 0, orderKey: undefined };
  const page = await createPage({ data: { Id: id, Name: name, ProjectId: projectId, Type: "cp", Styles: {} } });
  try {
    if (root) {
      await writeRoot(projectId, root, session);
      await apply?.(root);
    }
  } catch (error) {
    if (error instanceof ComponentConversionUnconfirmed) throw error;
    try {
      await deleteProjectPage({ data: { projectId, pageId: id } });
    } catch {
      throw new Error("The component could not be completed. Its master could not be removed.");
    }
    throw error;
  }
  return { page, root };
}
