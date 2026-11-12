import { Layers } from "lucide-react";
import { useElements } from "@/features/editor";
import ElementTreeItem from "../sidebar/ElementTreeItem";
import PanelIntro from "./PanelIntro";

export default function LayersPanel() {
  const elements = useElements();

  if (elements.length === 0) {
    return (
      <PanelIntro
        icon={Layers}
        title="No layers yet"
        description="Elements you add to the page show up here as a tree."
      />
    );
  }

  return (
    <div role="tree" aria-label="Page layers" className="py-1.5">
      {elements.map((element) => (
        <ElementTreeItem key={element.id} element={element} />
      ))}
    </div>
  );
}
