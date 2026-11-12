import {
  AlignLeft,
  BarChart3,
  CheckSquare,
  Circle,
  ClipboardList,
  Code,
  Component,
  Database,
  FileText,
  FormInput,
  Frame,
  Globe,
  Heading,
  Image,
  LayoutGrid,
  Link,
  List,
  ListTree,
  Minus,
  MousePointerClick,
  Navigation,
  PanelBottom,
  PanelRight,
  PanelTop,
  Quote,
  RectangleHorizontal,
  SlidersHorizontal,
  Smile,
  Table,
  Tag,
  TextCursorInput,
  TextSelection,
  Type,
  Video,
  Volume2,
} from "lucide-react";
import React from "react";

type IconComponent = React.ComponentType<{ className?: string }>;

/**
 * Icons for the element picker. `ELEMENT_METADATA` in constants/elements.ts
 * is typed against `IconName`, so an unmapped icon is a compile error.
 */
const iconMap = {
  AlignLeft,
  BarChart3,
  CheckSquare,
  Circle,
  ClipboardList,
  Code,
  Database,
  FileText,
  FormInput,
  Frame,
  Globe,
  Heading,
  Image,
  LayoutGrid,
  Link,
  List,
  ListTree,
  Minus,
  MousePointerClick,
  Navigation,
  PanelBottom,
  PanelRight,
  PanelTop,
  Quote,
  RectangleHorizontal,
  SlidersHorizontal,
  Smile,
  Table,
  Tag,
  TextCursorInput,
  TextSelection,
  Type,
  Video,
  Volume2,
} satisfies Record<string, IconComponent>;

export type IconName = keyof typeof iconMap;

export function getIconComponent(iconName: IconName): IconComponent | undefined {
  return iconMap[iconName];
}

export function IconRenderer({
  name,
  className = "w-4 h-4",
}: {
  name: IconName;
  className?: string;
}): React.ReactNode {
  const IconComponent: IconComponent | undefined = iconMap[name];
  return IconComponent ? (
    <IconComponent className={className} />
  ) : (
    <Component className={className} />
  );
}

export default iconMap;
