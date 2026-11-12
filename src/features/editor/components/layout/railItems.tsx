import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Plus,
  Layers,
  FileText,
  ImageIcon,
  Database,
  Zap,
  History,
  Sparkles,
} from "lucide-react";
import {
  useEditorChromeStore,
  type RailId,
} from "@/features/editor/store/editor-chrome-store";
import { ElementSelector } from "../sidebar/ElementSelector";
import PagesPanel from "./PagesPanel";
import LayersPanel from "./LayersPanel";
import WorkflowsPanel from "./WorkflowsPanel";

const AIChat = React.lazy(() => import("@/features/ai/components/AiChatPanel"));
const CmsPanel = React.lazy(() => import("./CmsPanel"));
const SnapshotManager = React.lazy(() => import("../sidebar/SnapshotManager"));
const ImageSelector = React.lazy(() =>
  import("@/features/images/components/ImageSelector").then((m) => ({
    default: m.ImageSelector,
  })),
);

export type RailItem = {
  id: RailId;
  label: string;
  icon: LucideIcon;
  group: "main" | "tools";
  /** Panel width in px; defaults to 240. */
  width?: number;
  /** The content manages its own scrolling (e.g. a fixed search box). */
  selfScroll?: boolean;
  /** The panel draws its own header (no title bar). */
  bare?: boolean;
  render: () => React.ReactNode;
};

function CloseableAIChat() {
  const closePanel = useEditorChromeStore((s) => s.closePanel);
  return <AIChat onClose={closePanel} />;
}

export const RAIL_ITEMS: RailItem[] = [
  { id: "insert", label: "Insert", icon: Plus, group: "main", selfScroll: true, render: () => <ElementSelector /> },
  { id: "layers", label: "Layers", icon: Layers, group: "main", render: () => <LayersPanel /> },
  { id: "pages", label: "Pages", icon: FileText, group: "main", render: () => <PagesPanel /> },
  { id: "assets", label: "Assets", icon: ImageIcon, group: "main", render: () => <ImageSelector /> },
  { id: "cms", label: "CMS", icon: Database, group: "main", render: () => <CmsPanel /> },
  { id: "workflows", label: "Workflows", icon: Zap, group: "tools", render: () => <WorkflowsPanel /> },
  { id: "history", label: "History", icon: History, group: "tools", render: () => <SnapshotManager /> },
  { id: "ai", label: "AI assistant", icon: Sparkles, group: "tools", width: 360, bare: true, render: () => <CloseableAIChat /> },
];

export const railItem = (id: RailId): RailItem =>
  RAIL_ITEMS.find((i) => i.id === id) ?? RAIL_ITEMS[0];
