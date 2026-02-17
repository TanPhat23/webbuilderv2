import {
  Type,
  MousePointerClick,
  CardSim,
  Image,
  FormInput,
  TextSelection,
  Link,
  SlidersHorizontal,
  List,
  Database,
  Component,
} from "lucide-react";
import React from "react";

export type IconName =
  | "Type"
  | "MousePointerClick"
  | "CardSim"
  | "Image"
  | "FormInput"
  | "TextSelection"
  | "Link"
  | "SlidersHorizontal"
  | "List"
  | "Database";

type IconComponent = React.ComponentType<{ className?: string }>;

const iconMap: Record<IconName, IconComponent> = {
  Type,
  MousePointerClick,
  CardSim,
  Image,
  FormInput,
  TextSelection,
  Link,
  SlidersHorizontal,
  List,
  Database,
};

export function getIconComponent(
  iconName: IconName,
): IconComponent | undefined {
  return iconMap[iconName];
}

export function IconRenderer({
  name,
  className = "w-4 h-4",
}: {
  name: IconName;
  className?: string;
}): React.ReactNode {
  const IconComponent = iconMap[name];
  return IconComponent ? (
    <IconComponent className={className} />
  ) : (
    <Component className={className} />
  );
}

export default iconMap;
