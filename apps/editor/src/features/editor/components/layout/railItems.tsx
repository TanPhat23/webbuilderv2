import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Plus,
  Layers,
  FileText,
  Component,
  ImageIcon,
  Database,
  History,
  Sparkles,
  Braces,
} from "lucide-react";
import {
  useEditorChromeStore,
  type RailId,
} from "@/features/editor/store/editor-chrome-store";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import { ElementSelector } from "../sidebar/ElementSelector";
import PagesPanel from "./PagesPanel";
import LayersPanel from "./LayersPanel";

import { ensureInteractionsEditorBridge } from "@/features/editor/lib/registerInteractionsBridge";

ensureInteractionsEditorBridge();

const SectionsLibrary = React.lazy(() => import("../wireframe/SectionsLibrary"));
const LogicPanel = React.lazy(() => import("@/features/interactions/components/LogicPanel"));
const ComponentsPanel = React.lazy(() => import("./ComponentsPanel"));
const CmsPanel = React.lazy(() => import("./CmsPanel"));
const VersionHistoryPanel = React.lazy(() => import("../sidebar/SnapshotManager"));
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
  const { renderAiPanel } = useEditorContext();
  return renderAiPanel ? <>{renderAiPanel(closePanel)}</> : null;
}

/** Insert shows the element list in Design and the Sections library in Wireframe. */
function InsertPanel() {
  const { mode } = useEditorContext();
  return mode === "wireframe" ? <SectionsLibrary /> : <ElementSelector />;
}

export const RAIL_ITEMS: RailItem[] = [
  { id: "insert", label: "Insert", icon: Plus, group: "main", selfScroll: true, render: () => <InsertPanel /> },
  { id: "layers", label: "Layers", icon: Layers, group: "main", render: () => <LayersPanel /> },
  { id: "pages", label: "Pages", icon: FileText, group: "main", render: () => <PagesPanel /> },
  { id: "components", label: "Components", icon: Component, group: "main", width: 260, render: () => <ComponentsPanel /> },
  { id: "assets", label: "Assets", icon: ImageIcon, group: "main", render: () => <ImageSelector /> },
  { id: "cms", label: "CMS", icon: Database, group: "main", render: () => <CmsPanel /> },
  { id: "logic", label: "Logic", icon: Braces, group: "tools", width: 280, render: () => <LogicPanel /> },
  { id: "history", label: "History", icon: History, group: "tools", render: () => <VersionHistoryPanel /> },
  { id: "ai", label: "AI assistant", icon: Sparkles, group: "tools", width: 380, bare: true, selfScroll: true, render: () => <CloseableAIChat /> },
];

export const railItem = (id: RailId): RailItem =>
  RAIL_ITEMS.find((i) => i.id === id) ?? RAIL_ITEMS[0];
