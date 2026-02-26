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
} from "@/features/editor/components/editorcomponents";
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

const componentInfo: Partial<
  Record<ElementType, { title: string; description: string }>
> = {
  Text: {
    title: "Text",
    description: "Add text content to your page. Double-click to edit.",
  },
  Span: {
    title: "Span",
    description: "Inline text span for styling portions of text",
  },
  Heading: {
    title: "Heading",
    description: "Semantic heading element with multiple levels (H1-H6)",
  },
  Label: {
    title: "Label",
    description: "Label text for form inputs and accessibility",
  },
  Blockquote: {
    title: "Blockquote",
    description: "Semantic blockquote for quoted text",
  },
  Code: {
    title: "Code",
    description: "Preformatted code display",
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
  Video: {
    title: "Video",
    description: "Embed or upload video content",
  },
  Audio: {
    title: "Audio",
    description: "Embed or upload audio content",
  },
  IFrame: {
    title: "IFrame",
    description: "Embed external content via iframe",
  },
  Input: {
    title: "Input Field",
    description: "Text input field for collecting user data",
  },
  Textarea: {
    title: "Textarea",
    description: "Multi-line text input field",
  },
  Checkbox: {
    title: "Checkbox",
    description: "Checkbox input for boolean selections",
  },
  Radio: {
    title: "Radio",
    description: "Radio button for single selection from options",
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
  Separator: {
    title: "Separator",
    description: "Horizontal or vertical divider line",
  },
  Icon: {
    title: "Icon",
    description: "Display an icon from the icon library",
  },
  Progress: {
    title: "Progress",
    description: "Progress bar for displaying completion status",
  },
  Table: {
    title: "Table",
    description: "Data table with rows and columns",
  },
  Nav: {
    title: "Navigation",
    description: "Semantic navigation container",
  },
  Header: {
    title: "Header",
    description: "Semantic header/page header container",
  },
  Footer: {
    title: "Footer",
    description: "Semantic footer container",
  },
  Article: {
    title: "Article",
    description: "Semantic article content container",
  },
  Aside: {
    title: "Aside",
    description: "Semantic sidebar or complementary content",
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

  const mocks: Partial<Record<ElementType, unknown>> = {
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
    Span: {
      ...base,
      content: "Span text",
      styles: {
        default: { fontSize: "13px", color: "#374151" },
      },
    },
    Heading: {
      ...base,
      content: "Heading",
      styles: {
        default: {
          fontSize: "24px",
          fontWeight: "700",
          color: "#1f2937",
          lineHeight: "1.2",
        },
      },
    },
    Label: {
      ...base,
      content: "Label",
      styles: {
        default: {
          fontSize: "12px",
          fontWeight: "500",
          color: "#374151",
        },
      },
    },
    Blockquote: {
      ...base,
      content: "Quoted text",
      styles: {
        default: {
          fontSize: "14px",
          fontStyle: "italic",
          color: "#6b7280",
          borderLeft: "4px solid #d1d5db",
          paddingLeft: "12px",
        },
      },
    },
    Code: {
      ...base,
      content: "const x = 1;",
      styles: {
        default: {
          fontSize: "12px",
          fontFamily: "monospace",
          backgroundColor: "#f3f4f6",
          padding: "2px 6px",
          borderRadius: "3px",
          color: "#1f2937",
        },
      },
    },
    Video: {
      ...base,
      src: "https://example.com/video.mp4",
      styles: {
        default: {
          width: "100%",
          maxWidth: "320px",
          height: "180px",
          borderRadius: "4px",
          backgroundColor: "#000",
        },
      },
    },
    Audio: {
      ...base,
      src: "https://example.com/audio.mp3",
      styles: {
        default: {
          width: "100%",
          maxWidth: "300px",
        },
      },
    },
    IFrame: {
      ...base,
      src: "https://example.com",
      styles: {
        default: {
          width: "100%",
          maxWidth: "320px",
          height: "240px",
          borderRadius: "4px",
          border: "1px solid #d1d5db",
        },
      },
    },
    Textarea: {
      ...base,
      styles: {
        default: {
          width: "100%",
          minHeight: "80px",
          padding: "8px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          fontSize: "13px",
          fontFamily: "inherit",
        },
      },
      settings: { placeholder: "Enter text...", rows: 4 },
    },
    Checkbox: {
      ...base,
      styles: {
        default: {
          width: "16px",
          height: "16px",
          cursor: "pointer",
        },
      },
      settings: { label: "Checkbox" },
    },
    Radio: {
      ...base,
      styles: {
        default: {
          width: "16px",
          height: "16px",
          cursor: "pointer",
        },
      },
      settings: { label: "Radio", name: "radio" },
    },
    Separator: {
      ...base,
      styles: {
        default: {
          width: "100%",
          height: "1px",
          backgroundColor: "#d1d5db",
          margin: "16px 0",
        },
      },
    },
    Icon: {
      ...base,
      styles: {
        default: {
          width: "24px",
          height: "24px",
          color: "#6b7280",
        },
      },
      settings: { name: "Heart" },
    },
    Progress: {
      ...base,
      styles: {
        default: {
          width: "100%",
          height: "8px",
          backgroundColor: "#e5e7eb",
          borderRadius: "4px",
          overflow: "hidden" as const,
        },
      },
      settings: { value: 65, max: 100 },
    },
    Table: {
      ...base,
      elements: [],
      styles: {
        default: {
          width: "100%",
          borderCollapse: "collapse" as const,
          border: "1px solid #d1d5db",
        },
      },
    },
    Nav: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "12px 20px",
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #d1d5db",
        },
      },
    },
    Header: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "20px",
          backgroundColor: "#f3f4f6",
          borderBottom: "1px solid #d1d5db",
        },
      },
    },
    Footer: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "20px",
          backgroundColor: "#f9fafb",
          borderTop: "1px solid #d1d5db",
          fontSize: "12px",
          color: "#6b7280",
        },
      },
    },
    Article: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "20px",
        },
      },
    },
    Aside: {
      ...base,
      elements: [],
      styles: {
        default: {
          padding: "16px",
          backgroundColor: "#f9fafb",
          borderLeft: "4px solid #d1d5db",
        },
      },
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
  Span: BaseComponent,
  Heading: BaseComponent,
  Label: BaseComponent,
  Blockquote: BaseComponent,
  Code: BaseComponent,
  Button: ButtonComponent,
  Section: SectionComponent,
  Image: ImageComponent,
  Video: BaseComponent,
  Audio: BaseComponent,
  IFrame: BaseComponent,
  Input: InputComponent,
  Textarea: BaseComponent,
  Checkbox: BaseComponent,
  Radio: BaseComponent,
  Select: SelectComponent,
  Link: BaseComponent,
  Form: FormComponent,
  Frame: FrameComponent,
  Carousel: CarouselComponent,
  List: ListComponent,
  Separator: BaseComponent,
  Icon: BaseComponent,
  Progress: BaseComponent,
  Table: BaseComponent,
  Nav: BaseComponent,
  Header: BaseComponent,
  Footer: BaseComponent,
  Article: BaseComponent,
  Aside: BaseComponent,
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
  Span: (
    <div className="w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center px-3">
      <span className="text-sm text-gray-600">Span text</span>
    </div>
  ),
  Heading: (
    <div className="w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center px-3">
      <span className="text-lg font-bold text-gray-900">Heading</span>
    </div>
  ),
  Label: (
    <div className="w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center px-3">
      <span className="text-xs font-medium text-gray-600">Label</span>
    </div>
  ),
  Blockquote: (
    <div className="w-full h-20 bg-gray-50 rounded-lg border-l-4 border-gray-400 flex items-center px-3">
      <span className="text-sm italic text-gray-600">"Quoted text"</span>
    </div>
  ),
  Code: (
    <div className="w-full h-16 bg-gray-900 rounded-lg flex items-center px-3">
      <span className="text-xs font-mono text-green-400">const x = 1;</span>
    </div>
  ),
  Video: (
    <div className="w-full h-20 bg-black rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
      <div className="flex flex-col items-center gap-1">
        <FileText className="w-6 h-6 text-gray-500" />
        <span className="text-xs text-gray-400">Video</span>
      </div>
    </div>
  ),
  Audio: (
    <div className="w-full h-16 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
        <div className="flex gap-0.5">
          <div className="w-1 h-8 bg-gray-500 rounded-full"></div>
          <div className="w-1 h-6 bg-gray-500 rounded-full"></div>
          <div className="w-1 h-10 bg-gray-500 rounded-full"></div>
        </div>
      </div>
    </div>
  ),
  IFrame: (
    <div className="w-full h-20 bg-blue-50 rounded-lg border-2 border-blue-300 flex items-center justify-center">
      <span className="text-xs text-blue-600 font-medium">IFrame</span>
    </div>
  ),
  Textarea: (
    <div className="w-full h-20 bg-white rounded-lg border border-gray-300 flex items-center px-3">
      <div className="flex-1 space-y-1">
        <div className="h-2 bg-gray-200 rounded w-full"></div>
        <div className="h-2 bg-gray-200 rounded w-4/5"></div>
      </div>
    </div>
  ),
  Checkbox: (
    <div className="w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center gap-2 px-3">
      <div className="w-4 h-4 border-2 border-gray-400 rounded flex items-center justify-center">
        <div className="w-2 h-2 bg-gray-600 rounded-sm"></div>
      </div>
      <span className="text-xs text-gray-600">Checkbox</span>
    </div>
  ),
  Radio: (
    <div className="w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center gap-2 px-3">
      <div className="w-4 h-4 border-2 border-gray-400 rounded-full flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
      </div>
      <span className="text-xs text-gray-600">Radio</span>
    </div>
  ),
  Separator: (
    <div className="w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center justify-center">
      <div className="w-3/4 h-px bg-gray-400"></div>
    </div>
  ),
  Icon: (
    <div className="w-full h-16 bg-white rounded-lg border border-gray-300 flex items-center justify-center">
      <div className="w-6 h-6 text-gray-600">
        <RefreshCw className="w-6 h-6" />
      </div>
    </div>
  ),
  Progress: (
    <div className="w-full h-16 bg-white rounded-lg border border-gray-300 flex flex-col items-center justify-center gap-2 px-3">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="w-2/3 h-full bg-blue-600"></div>
      </div>
      <span className="text-xs text-gray-500">65%</span>
    </div>
  ),
  Table: (
    <div className="w-full h-20 bg-white rounded-lg border border-gray-300 overflow-hidden">
      <table className="w-full text-xs">
        <tbody>
          <tr className="border-b border-gray-300">
            <td className="px-2 py-1 text-gray-600 font-medium">Header 1</td>
            <td className="px-2 py-1 text-gray-600 font-medium">Header 2</td>
          </tr>
          <tr>
            <td className="px-2 py-1 text-gray-500">Data 1</td>
            <td className="px-2 py-1 text-gray-500">Data 2</td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  Nav: (
    <div className="w-full h-16 bg-gray-200 rounded-lg border border-gray-400 flex items-center px-3 gap-2">
      <div className="h-2 bg-gray-400 rounded w-16"></div>
      <div className="h-2 bg-gray-400 rounded w-12"></div>
    </div>
  ),
  Header: (
    <div className="w-full h-20 bg-gradient-to-b from-gray-300 to-gray-200 rounded-lg border border-gray-400 flex items-center justify-center">
      <span className="text-xs text-gray-700 font-medium">Header</span>
    </div>
  ),
  Footer: (
    <div className="w-full h-16 bg-gray-200 rounded-lg border border-gray-400 flex items-center justify-center">
      <span className="text-xs text-gray-600">© 2024 Footer</span>
    </div>
  ),
  Article: (
    <div className="w-full h-20 bg-white rounded-lg border border-gray-300 flex flex-col px-3 py-2 gap-1">
      <div className="h-2 bg-gray-300 rounded w-2/3"></div>
      <div className="h-1.5 bg-gray-200 rounded w-full"></div>
    </div>
  ),
  Aside: (
    <div className="w-full h-20 bg-gray-100 rounded-lg border-l-4 border-gray-400 flex items-center justify-center">
      <span className="text-xs text-gray-600">Sidebar</span>
    </div>
  ),

  CMSContentList: (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-4 h-4 text-purple-600" />
        <span className="text-xs text-purple-700 font-medium">
          Content List
        </span>
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
        <span className="text-xs text-purple-700 font-medium">
          Content Item
        </span>
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
        <span className="text-xs text-purple-700 font-medium">
          Content Grid
        </span>
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

  return (
    customPreviews[type] || (
      <div className="w-full min-h-10 flex items-center justify-center">
        <div style={{ transform: "scale(0.95)", width: "100%" }}>
          <Component element={mockElement} />
        </div>
      </div>
    )
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
    <TooltipProvider >
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={sideOffset}
          className="max-w-70 p-0 overflow-hidden"
        >
          <div className="px-3 py-2 bg-linear-to-r from-gray-50 to-gray-100 border-b">
            <h4 className="font-semibold text-sm text-gray-900">
              {info.title}
            </h4>
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
