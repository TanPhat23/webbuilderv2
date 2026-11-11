import type { EditorElement } from "@/types/global.type";

type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
interface EditorDraft { id: string; savedAt: number; elements: EditorElement[] }
interface DraftEnvelope { version: 2; drafts: EditorDraft[] }

export function createEditorDraftStore(storage: DraftStorage, userId: string, projectId: string, pageId: string) {
  const key = `editor-draft:${JSON.stringify([userId, projectId, pageId])}`;
  const sessionId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  const readAll = (): EditorDraft[] => {
    const value = storage.getItem(key);
    if (!value) return [];
    try {
      const parsed: unknown = JSON.parse(value);
      if (!parsed || typeof parsed !== "object" || !("version" in parsed)) return [];
      if (parsed.version === 1 && "elements" in parsed && Array.isArray(parsed.elements) && "savedAt" in parsed && typeof parsed.savedAt === "number") {
        return [{ id: "legacy", savedAt: parsed.savedAt, elements: parsed.elements }];
      }
      if (parsed.version !== 2 || !("drafts" in parsed) || !Array.isArray(parsed.drafts)) return [];
      return parsed.drafts.filter((draft): draft is EditorDraft =>
        !!draft && typeof draft === "object" && typeof draft.id === "string" &&
        typeof draft.savedAt === "number" && Array.isArray(draft.elements),
      );
    } catch {
      return [];
    }
  };

  const writeAll = (drafts: EditorDraft[]) => {
    if (drafts.length === 0) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify({ version: 2, drafts } satisfies DraftEnvelope));
  };

  return {
    save(elements: EditorElement[]) {
      const drafts = readAll().filter((draft) => draft.id !== sessionId);
      drafts.push({ id: sessionId, savedAt: Date.now(), elements });
      writeAll(drafts);
    },
    read(): EditorDraft | null {
      return readAll().at(-1) ?? null;
    },
    remove(id?: string) {
      const drafts = readAll();
      const target = id ?? drafts.at(-1)?.id;
      writeAll(drafts.filter((draft) => draft.id !== target));
    },
  };
}
