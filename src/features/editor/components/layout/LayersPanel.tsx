import { useElements } from "@/features/editor";
import ElementTreeItem from "../sidebar/ElementTreeItem";

export default function LayersPanel() {
  const elements = useElements();

  if (elements.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-xs text-muted-foreground">
        No elements yet. Add components to see them here.
      </p>
    );
  }

  return (
    <div className="py-2">
      {elements.map((element) => (
        <ElementTreeItem key={element.id} element={element} />
      ))}
    </div>
  );
}
