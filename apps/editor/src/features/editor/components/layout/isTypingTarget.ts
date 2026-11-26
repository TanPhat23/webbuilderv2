/** True when a key event comes from somewhere the user is typing text. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!target) return false;
  const t = target as { tagName?: string; isContentEditable?: boolean };
  return (
    t.isContentEditable === true ||
    t.tagName === "INPUT" ||
    t.tagName === "TEXTAREA" ||
    t.tagName === "SELECT"
  );
}

type KeyLike = { key: string; metaKey: boolean; ctrlKey: boolean };

/** Editor-chrome shortcuts: ⌘\ panel, ⌘. inspector, ⌘K pages, ? help. */
export function isChromeShortcut(e: KeyLike): boolean {
  const mod = e.metaKey || e.ctrlKey;
  if (mod) return e.key === "\\" || e.key === "." || e.key === "k";
  return e.key === "?";
}
