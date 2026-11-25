import {
  AlignLeft,
  Calendar,
  FileText,
  Hash,
  Link2,
  List,
  ListChecks,
  Mail,
  ToggleLeft,
  Type,
  type LucideIcon,
} from "lucide-react";
import { FIELD_TYPES, type FieldType } from "./types";

export interface FieldTypeMeta {
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
}

export const FIELD_TYPE_META: Readonly<Record<FieldType, FieldTypeMeta>> = {
  text: {
    label: "Short Text",
    description: "Single-line plain text value",
    icon: Type,
  },
  textarea: {
    label: "Long Text",
    description: "Multi-line plain text block",
    icon: AlignLeft,
  },
  richtext: {
    label: "Rich Text",
    description: "Formatted text with headings",
    icon: FileText,
  },
  number: {
    label: "Number",
    description: "Numeric values and counts",
    icon: Hash,
  },
  boolean: {
    label: "Toggle",
    description: "True or false switch",
    icon: ToggleLeft,
  },
  date: {
    label: "Date",
    description: "Calendar date picker",
    icon: Calendar,
  },
  email: {
    label: "Email",
    description: "Validated email address",
    icon: Mail,
  },
  url: {
    label: "URL",
    description: "Web link or image URL",
    icon: Link2,
  },
  select: {
    label: "Select",
    description: "Single option value",
    icon: List,
  },
  multiselect: {
    label: "Multi-Select",
    description: "Comma-separated tag list",
    icon: ListChecks,
  },
};

function isFieldType(value: string): value is FieldType {
  return FIELD_TYPES.some((item) => item === value);
}

export function getFieldTypeMeta(type: string): FieldTypeMeta {
  if (isFieldType(type)) {
    return FIELD_TYPE_META[type];
  }
  return FIELD_TYPE_META.text;
}
