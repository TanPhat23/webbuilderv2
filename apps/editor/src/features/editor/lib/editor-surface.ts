/**
 * The top bar shows one "Design · Wireframe · Code" switch, while the editor
 * provider keeps two independent fields. These map between the two.
 */
export type CanvasMode = "editor" | "wireframe";
export type EditingMode = "visual" | "code";
export type EditorSurface = "design" | "wireframe" | "code";

export function toSurface(
  mode: CanvasMode,
  editingMode: EditingMode,
): EditorSurface {
  if (editingMode === "code") return "code";
  return mode === "wireframe" ? "wireframe" : "design";
}

export function fromSurface(surface: EditorSurface): {
  mode: CanvasMode;
  editingMode: EditingMode;
} {
  switch (surface) {
    case "code":
      return { mode: "editor", editingMode: "code" };
    case "wireframe":
      return { mode: "wireframe", editingMode: "visual" };
    default:
      return { mode: "editor", editingMode: "visual" };
  }
}
