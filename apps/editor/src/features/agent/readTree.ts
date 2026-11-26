// $WEB/src/features/agent/readTree.ts
import { componentSetting, type ComponentOverrides } from "@webbuilder/site-runtime/projects/components";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

/** One element as the CLI sees it. Same shape as the MCP server's get_page. */
export interface TreeNode {
  id: string;
  type: string;
  name?: string;
  content?: string;
  tailwindStyles?: string;
  src?: string;
  href?: string;
  settings?: Record<string, unknown>;
  children?: TreeNode[];
  component?: { id: string; name?: string; overrides?: ComponentOverrides };
}

type Raw = Record<string, unknown> & { id: string; type: string; elements?: Raw[] };

const nonEmptyString = (v: unknown): string | undefined => (typeof v === "string" && v !== "" ? v : undefined);

/** The editor's live tree, so a read after an edit shows the edit and not the last save. */
export function buildElementTree(list: EditorElement[], names: ReadonlyMap<string, string> = new Map()): TreeNode[] {
  return (list as unknown as Raw[]).map((e) => {
    const component = componentSetting(e as unknown as EditorElement);
    const rawSettings = e.settings && typeof e.settings === "object" ? e.settings as Record<string, unknown> : {};
    const { component: _link, ...otherSettings } = rawSettings;
    const settings = Object.keys(otherSettings).length > 0 ? otherSettings : undefined;
    const children = !component && e.elements?.length ? buildElementTree(e.elements as unknown as EditorElement[], names) : undefined;
    return {
      id: e.id,
      type: e.type,
      ...(nonEmptyString(e.name) && { name: nonEmptyString(e.name) }),
      ...(nonEmptyString(e.content) && { content: nonEmptyString(e.content) }),
      ...(nonEmptyString(e.tailwindStyles) && { tailwindStyles: nonEmptyString(e.tailwindStyles) }),
      ...(nonEmptyString(e.src) && { src: nonEmptyString(e.src) }),
      ...(nonEmptyString(e.href) && { href: nonEmptyString(e.href) }),
      ...(settings && { settings }),
      ...(children && { children }),
      ...(component && { component: {
        id: component.pageId,
        ...(names.has(component.pageId) && { name: names.get(component.pageId) }),
        ...(component.overrides && { overrides: component.overrides }),
      } }),
    };
  });
}
