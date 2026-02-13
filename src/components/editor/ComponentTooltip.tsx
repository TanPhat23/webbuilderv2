"use client";

import React, { ReactNode, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ElementType } from "@/types/global.type";
import {
  BaseComponent,
  ButtonComponent,
  SectionComponent,
  ImageComponent,
  InputComponent,
  SelectComponent,
  FormComponent,
  FrameComponent,
  CarouselComponent,
  ListComponent,
  CMSContentListComponent,
  CMSContentItemComponent,
  CMSContentGridComponent,
} from "@/components/editor/editorcomponents";
import {
  ChevronLeft,
  ChevronRight,
  List as ListIcon,
  Send,
  Upload,
  RefreshCw,
  FileText,
  Grid3X3,
  Image as ImageIcon,
  ChevronDown,
  Type,
  ExternalLink,
} from "lucide-react";

interface ComponentTooltipProps {
  children: ReactNode;
  componentType: ElementType;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

const componentInfo: Record<
  ElementType,
  { title: string; description: string }
> = {
  Text: {
    title: "Text",
    description: "Add text content to your page. Double-click to edit.",
  },
  Button: {
    title: "Button",
    description: "Interactive button for actions or navigation",
  },
  Section: {
    title: "Section",
    description: "Page section with customizable layout and background",
  },
  Image: {
    title: "Image",
    description: "Add images to your page. Supports upload or URL.",
  },
  Input: {
    title: "Input Field",
    description: "Text input field for collecting user data",
  },
  Select: {
    title: "Select Dropdown",
    description: "Dropdown menu for selecting from multiple options",
  },
  Link: {
    title: "Link",
    description: "Clickable link for navigation to other pages or URLs",
  },
  Form: {
    title: "Form",
    description: "Create data collection forms with validation",
  },
  Frame: {
    title: "Frame",
    description:
      "Flexible container for grouping elements. Drag and drop components inside.",
  },
  Carousel: {
    title: "Carousel",
    description: "Sliding showcase for images or content",
  },
  List: {
    title: "List",
    description: "Repeatable list items for displaying collections of data",
  },
  DataLoader: {
    title: "Data Loader",
    description: "Load and display dynamic data from external sources",
  },
  CMSContentList: {
    title: "CMS Content List",
    description: "Display a list of CMS content items",
  },
  CMSContentItem: {
    title: "CMS Content Item",
    description: "Display a single CMS content item with full details",
  },
  CMSContentGrid: {
    title: "CMS Content Grid",
    description: "Display CMS content in a responsive grid layout",
  },
};

const createMockElement = (type: ElementType): any => {
  const base = {
    id: `preview-${type}`,
    projectId: "preview",
    pageId: "preview",
    type,
    content: "",
    styles: { default: {} },
  };

  const mocks: Record<ElementType, any> = {
    Text: {
      ...base,
      content: "Sample text content",
      styles: {
        default: { fontSize: "13px", color: "#374151", lineHeight: "1.5" },
      },
    },
    Button: {
      ...base,
      content: "Click Me",
      styles: {
        default: {
          padding: "8px 20px",
          backgroundColor: "#2563eb",
          color: "white",
          borderRadius: "6px",
          border: "none",
          fontWeight: "500",
          fontSize: "13px",
          cursor: "pointer",
        },
      },
    },
    Section: {
      ...base,
      content: "Section",
      elements: [],
      styles: {
        default: {
          padding: "20px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "8px",
          color: "white",
          textAlign: "center" as const,
          fontWeight: "500",
          fontSize: "12px",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
    },
    Image: {
      ...base,
      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80'%3E%3Crect fill='%23e5e7eb' width='120' height='80'/%3E%3Cpath fill='%239ca3af' d='M30 30 L45 45 L60 30 L90 60 L30 60 Z'/%3E%3Ccircle fill='%23fbbf24' cx='90' cy='25' r='8'/%3E%3C/svg%3E",
      styles: {
        default: {
          width: "100%",
          maxWidth: "120px",
          height: "auto",
          borderRadius: "4px",
        },
      },
    },
    Input: {
      ...base,
      styles: {
        default: {
          width: "100%",
          padding: "6px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          fontSize: "13px",
        },
      },
      settings: { placeholder: "Enter text...", type: "text" },
    },
    Select: {
      ...base,
      content: "<option>Choose option</option>",
      styles: {
        default: {
          width: "100%",
          padding: "6px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          fontSize: "13px",
          backgroundColor: "white",
        },
      },
    },
    Link: {
      ...base,
      content: "Link Text →",
      href: "#",
      styles: {
        default: {
          color: "#2563eb",
          textDecoration: "underline",
          fontSize: "13px",
        },
      },
    },
    Form: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "12px",
          border: "2px solid #d1d5db",
          borderRadius: "6px",
          backgroundColor: "#f9fafb",
        },
      },
      settings: { submitUrl: "", method: "post" as const },
    },
    Frame: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "16px",
          border: "2px dashed #9ca3af",
          borderRadius: "6px",
          backgroundColor: "#f9fafb",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontSize: "11px",
        },
      },
    },
    Carousel: {
      ...base,
      elements: [],
      styles: {
        default: {
          width: "100%",
          height: "80px",
          backgroundColor: "#e5e7eb",
          borderRadius: "6px",
          position: "relative" as const,
        },
      },
      settings: { options: { loop: true } },
    },
    List: {
      ...base,
      elements: [],
      styles: {
        default: {
          display: "flex",
          flexDirection: "column" as const,
          gap: "6px",
        },
      },
    },
    DataLoader: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "16px",
          border: "2px solid #34d399",
          borderRadius: "6px",
          backgroundColor: "#f0fdf4",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      settings: { apiUrl: "", method: "GET" },
    },
    CMSContentList: {
      ...base,
      elements: [],
      styles: {
        default: {
          display: "flex",
          flexDirection: "column" as const,
          gap: "8px",
        },
      },
      settings: { collectionId: "" },
    },
    CMSContentItem: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "12px",
          border: "2px solid #c084fc",
          borderRadius: "6px",
          backgroundColor: "#faf5ff",
        },
      },
      settings: { collectionId: "" },
    },
    CMSContentGrid: {
      ...base,
      elements: [],
      styles: {
        default: {
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
        },
      },
      settings: { collectionId: "" },
    },
  };
  return mocks[type];
};

const componentMap: Partial<Record<ElementType, React.ComponentType<any>>> = {
  Text: BaseComponent,
  Button: ButtonComponent,
  Section: SectionComponent,
  Image: ImageComponent,
  Input: InputComponent,
  Select: SelectComponent,
  Link: BaseComponent,
  Form: FormComponent,
  Frame: FrameComponent,
  Carousel: CarouselComponent,
  List: ListComponent,
  CMSContentList: CMSContentListComponent,
  CMSContentItem: CMSContentItemComponent,
  CMSContentGrid: CMSContentGridComponent,
};

const customPreviews: Partial<Record<ElementType, React.ReactElement>> = {
  Image: (
    <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
      <div className="flex flex-col items-center gap-2">
        <ImageIcon className="w-8 h-8 text-gray-400" />
        <span className="text-xs text-gray-500">Image</span>
      </div>
    </div>
  ),
  Input: (
    <div className="w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center gap-2 px-3">
      <Type className="w-4 h-4 text-gray-400" />
      <div className="flex-1 h-2 bg-gray-100 rounded"></div>
    </div>
  ),
  Select: (
    <div className="w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center justify-between px-3">
      <span className="text-xs text-gray-500">Choose option</span>
      <ChevronDown className="w-4 h-4 text-gray-400" />
    </div>
  ),
  Link: (
    <div className="w-full h-16 bg-white rounded-lg border border-blue-300 flex items-center gap-2 px-3">
      <span className="text-xs text-blue-600 underline">Link Text</span>
      <ExternalLink className="w-3 h-3 text-blue-600" />
    </div>
  ),
  Carousel: (
    <div className="w-full h-20 bg-linear-to-r from-blue-400 to-purple-500 rounded-lg relative flex items-center justify-center">
      <div className="flex items-center gap-2">
        <ChevronLeft className="w-4 h-4 text-white/70" />
        <div className="w-16 h-12 bg-white/20 rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">1/3</span>
        </div>
        <ChevronRight className="w-4 h-4 text-white/70" />
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        <div className="w-2 h-2 rounded-full bg-white"></div>
        <div className="w-2 h-2 rounded-full bg-white/50"></div>
        <div className="w-2 h-2 rounded-full bg-white/30"></div>
      </div>
    </div>
  ),
  List: (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <ListIcon className="w-4 h-4 text-gray-600" />
        <span className="text-xs text-gray-600 font-medium">List Items</span>
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-2 p-2 bg-gray-100 rounded"
        >
          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          <div className="h-2 bg-gray-400 rounded flex-1"></div>
        </div>
      ))}
    </div>
  ),
  Form: (
    <div className="w-full space-y-2 p-3 border-2 border-gray-300 rounded-lg bg-white">
      <div className="h-2 bg-gray-300 rounded w-1/3"></div>
      <div className="h-8 bg-gray-100 border border-gray-300 rounded"></div>
      <div className="h-7 bg-blue-600 rounded w-24 flex items-center justify-center gap-1">
        <Send className="w-3 h-3 text-white" />
        <span className="text-xs text-white font-medium">Submit</span>
      </div>
    </div>
  ),
  Frame: (
    <div className="w-full h-20 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center bg-gray-50 gap-1">
      <Upload className="w-6 h-6 text-gray-400" />
      <span className="text-xs text-gray-500">Drop Zone</span>
    </div>
  ),
  DataLoader: (
    <div className="w-full h-16 border-2 border-green-400 rounded-lg bg-green-50 flex items-center justify-center gap-2">
      <RefreshCw className="w-5 h-5 text-green-600 animate-spin" />
      <span className="text-xs text-green-700 font-medium">Loading...</span>
    </div>
  ),
  CMSContentList: (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-4 h-4 text-purple-600" />
        <span className="text-xs text-purple-700 font-medium">Content List</span>
      </div>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex gap-2 p-2 border border-purple-300 rounded bg-purple-50"
        >
          <div className="w-10 h-10 bg-purple-200 rounded shrink-0"></div>
          <div className="flex-1 space-y-1">
            <div className="h-2 bg-purple-300 rounded w-3/4"></div>
            <div className="h-1.5 bg-purple-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  ),
  CMSContentItem: (
    <div className="w-full p-3 border-2 border-purple-400 rounded-lg bg-purple-50">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-4 h-4 text-purple-600" />
        <span className="text-xs text-purple-700 font-medium">Content Item</span>
      </div>
      <div className="w-full h-16 bg-purple-200 rounded mb-2"></div>
      <div className="space-y-1">
        <div className="h-2 bg-purple-300 rounded w-full"></div>
        <div className="h-2 bg-purple-300 rounded w-4/5"></div>
      </div>
    </div>
  ),
  CMSContentGrid: (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Grid3X3 className="w-4 h-4 text-purple-600" />
        <span className="text-xs text-purple-700 font-medium">Content Grid</span>
      </div>
      <div className="w-full grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="aspect-square border-2 border-purple-300 rounded bg-purple-50 flex items-center justify-center"
          >
            <div className="w-8 h-8 bg-purple-300 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  ),
};

function ComponentPreview({ type }: { type: ElementType }) {
  const Component = componentMap[type];
  const mockElement = createMockElement(type);

  if (!Component)
    return <div className="text-xs text-gray-500 p-4">No preview</div>;

  return customPreviews[type] || (
    <div className="w-full min-h-10 flex items-center justify-center">
      <div style={{ transform: "scale(0.95)", width: "100%" }}>
        <Component element={mockElement} />
      </div>
    </div>
  );
}

export function ComponentTooltip({
  children,
  componentType,
  side = "right",
  sideOffset = 10,
}: ComponentTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const info = componentInfo[componentType];
  if (!info) return <>{children}</>;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={sideOffset}
          className="max-w-[280px] p-0 overflow-hidden"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="px-3 py-2 bg-linear-to-r from-gray-50 to-gray-100 border-b">
            <h4 className="font-semibold text-sm text-gray-900">{info.title}</h4>
            <p className="text-xs text-gray-600 mt-0.5">{info.description}</p>
          </div>
          <div className="p-3 bg-white">
            <div className="bg-gray-50 rounded p-3 border">
              <ComponentPreview type={componentType} />
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
