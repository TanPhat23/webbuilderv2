export type ComponentOverride = {
  text?: string;
  src?: string;
  alt?: string;
  href?: string;
};

export type ComponentOverrides = Record<string, ComponentOverride>;

export type ComponentSetting = {
  pageId: string;
  rootId: string;
  overrides?: ComponentOverrides;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function componentSetting(element: { settings?: unknown }): ComponentSetting | undefined {
  const settings = element.settings;
  if (!isRecord(settings)) return;
  const value = settings.component;
  if (
    !isRecord(value) ||
    typeof value.pageId !== "string" ||
    !value.pageId ||
    typeof value.rootId !== "string" ||
    !value.rootId
  ) {
    return;
  }
  return {
    pageId: value.pageId,
    rootId: value.rootId,
    ...(isRecord(value.overrides) && { overrides: value.overrides as ComponentOverrides }),
  };
}
