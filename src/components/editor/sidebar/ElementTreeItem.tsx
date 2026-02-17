import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElementWithSetter } from "@/globalstore/selectors/selection-selectors";
import { cn } from "@/lib/utils";
import { EditorElement } from "@/types/global.type";
import {
  BarChart2,
  ChevronDown,
  Files,
  FormInput,
  Images,
  LayoutGrid,
  Square,
  Table2,
  Type,
  Link as LinkIcon,
  MousePointer,
  Image as ImageIcon,
  Frame,
  List as ListIcon,
} from "lucide-react";
import React from "react";

const iconColorMap: Record<string, string> = {
  Text: "text-blue-500",
  Link: "text-indigo-500",
  Button: "text-pink-500",
  Image: "text-yellow-500",
  Frame: "text-teal-500",
  List: "text-orange-500",
  ListItem: "text-orange-300",
  Carousel: "text-purple-500",
  Input: "text-green-500",
  Select: "text-cyan-500",
  Chart: "text-rose-500",
  DataTable: "text-lime-500",
  Form: "text-fuchsia-500",
  Section: "text-gray-500",
  default: "text-gray-400",
};

const getElementIcon = (type: string) => {
  const colorClass = iconColorMap[type] || iconColorMap.default;
  switch (type) {
    case "Text":
      return <Type className={`h-4 w-4 mr-2 ${colorClass}`} />;
    case "Link":
      return <LinkIcon className={`h-4 w-4 mr-2 ${colorClass}`} />;
    case "Button":
      return <MousePointer className={`h-4 w-4 mr-2 ${colorClass}`} />;
    case "Image":
      return <ImageIcon className={`h-4 w-4 mr-2 ${colorClass}`} />;
    case "Frame":
      return <Frame className={`h-4 w-4 mr-2 ${colorClass}`} />;
    case "List":
      return <ListIcon className={`h-4 w-4 mr-2 ${colorClass}`} />;
    case "ListItem":
      return <Square className={`h-4 w-4 mr-2 ${colorClass}`} />;
    case "Carousel":
      return <Images className={`h-4 w-4 mr-2 ${colorClass}`} />;
    case "Input":
      return <FormInput className={`h-4 w-4 mr-2 ${colorClass}`} />;
    case "Select":
      return <LayoutGrid className={`h-4 w-4 mr-2 ${colorClass}`} />;
    case "Chart":
      return <BarChart2 className={`h-4 w-4 mr-2 ${colorClass}`} />;
    case "DataTable":
      return <Table2 className={`h-4 w-4 mr-2 ${colorClass}`} />;
    case "Form":
      return <Files className={`h-4 w-4 mr-2 ${colorClass}`} />;
    case "Section":
      return <Square className={`h-4 w-4 mr-2 ${colorClass}`} />;
    default:
      return <Square className={`h-4 w-4 mr-2 ${colorClass}`} />;
  }
};

export default function ElementTreeItem({
  element,
  level = 0,
}: {
  element: EditorElement;
  level?: number;
}) {
  const updateElement = useUpdateElement();
  const { selectedElement, setSelectedElement } =
    useSelectedElementWithSetter();
  const [isOpen, setIsOpen] = React.useState(true);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(
      selectedElement?.id === element.id ? undefined : element,
    );
  };

  const displayName = element.name || element.content || element.type;
  const hasChildren =
    "elements" in element &&
    Array.isArray(element.elements) &&
    element.elements.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="w-full">
        <div className="flex items-center group">
          <div
            className={cn(
              "flex items-center flex-1 p-2 cursor-pointer text-xs hover:bg-accent hover:rounded-md transition-colors",
              {
                "bg-accent rounded-md": selectedElement?.id === element.id,
              },
            )}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={handleClick}
          >
            {getElementIcon(element.type)}
            <span className="truncate flex-1">{displayName}</span>
          </div>

          {hasChildren && (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          )}
        </div>

        {hasChildren && (
          <CollapsibleContent>
            <div>
              {(element as any).elements.map((child: EditorElement) => (
                <ElementTreeItem
                  key={child.id}
                  element={child}
                  level={level + 1}
                />
              ))}
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}
