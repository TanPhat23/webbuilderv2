import type { useUpdateElement } from "@/features/editor";

type UpdateElement = ReturnType<typeof useUpdateElement>;

/**
 * Builds a strictly typed `updateSetting(key, value)` that merges one entry
 * into an element's `settings` object.
 *
 *   const updateSetting = settingUpdater(updateElement, element.id, settings);
 *   updateSetting("poster", url); // value must match VideoSettings["poster"]
 */
export function settingUpdater<S extends object>(
  updateElement: UpdateElement,
  elementId: string,
  settings: S,
) {
  return <K extends keyof S>(key: K, value: S[K]) => {
    updateElement(elementId, {
      settings: { ...settings, [key]: value },
    } as Parameters<UpdateElement>[1]);
  };
}

/**
 * Same merge as {@link settingUpdater} but accepts any value, for panels whose
 * inputs produce loosely typed values (strings from `<input>`, etc.).
 */
export function looseSettingUpdater<S extends object>(
  updateElement: UpdateElement,
  elementId: string,
  settings: S,
) {
  return (name: keyof S, value: unknown) => {
    updateElement(elementId, {
      settings: { ...settings, [name]: value },
    } as Parameters<UpdateElement>[1]);
  };
}
