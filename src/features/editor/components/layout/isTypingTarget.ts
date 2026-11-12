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
