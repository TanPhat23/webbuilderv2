import type { Monaco } from "@monaco-editor/react";
import { MONACO_EXTERNAL_LIBS } from "./constants";

/**
 * Fetches type definitions from a URL.
 */
async function fetchLibContent(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch types from ${url}: ${res.status}`);
    }
    return await res.text();
  } catch (err: unknown) {
    console.warn("Monaco Type Loader:", err);
    return null;
  }
}

/**
 * Stub type definitions for UI components
 */
const UI_COMPONENT_STUBS = `
declare module '@/components/ui/carousel' {
  import { ReactNode } from 'react';
  export interface CarouselProps {
    children?: ReactNode;
    className?: string;
    [key: string]: any;
  }
  export const Carousel: React.FC<CarouselProps>;
  export const CarouselContent: React.FC<any>;
  export const CarouselItem: React.FC<any>;
  export const CarouselPrevious: React.FC<any>;
  export const CarouselNext: React.FC<any>;
}

declare module '@/components/ui/button' {
  import { ReactNode } from 'react';
  export interface ButtonProps {
    children?: ReactNode;
    className?: string;
    onClick?: () => void;
    [key: string]: any;
  }
  export const Button: React.FC<ButtonProps>;
}

declare module '@/components/ui/card' {
  import { ReactNode } from 'react';
  export interface CardProps {
    children?: ReactNode;
    className?: string;
    [key: string]: any;
  }
  export const Card: React.FC<CardProps>;
  export const CardContent: React.FC<CardProps>;
  export const CardDescription: React.FC<CardProps>;
  export const CardHeader: React.FC<CardProps>;
  export const CardTitle: React.FC<CardProps>;
}

declare module '@/components/ui/input' {
  export interface InputProps {
    className?: string;
    [key: string]: any;
  }
  export const Input: React.FC<InputProps>;
}

declare module '@/components/ui/select' {
  import { ReactNode } from 'react';
  export interface SelectProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Select: React.FC<SelectProps>;
  export const SelectContent: React.FC<SelectProps>;
  export const SelectItem: React.FC<SelectProps>;
  export const SelectTrigger: React.FC<SelectProps>;
  export const SelectValue: React.FC<SelectProps>;
}

declare module '@/components/ui/dialog' {
  import { ReactNode } from 'react';
  export interface DialogProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Dialog: React.FC<DialogProps>;
  export const DialogContent: React.FC<DialogProps>;
  export const DialogDescription: React.FC<DialogProps>;
  export const DialogHeader: React.FC<DialogProps>;
  export const DialogTitle: React.FC<DialogProps>;
  export const DialogTrigger: React.FC<DialogProps>;
}

declare module '@/components/ui/checkbox' {
  export interface CheckboxProps {
    className?: string;
    [key: string]: any;
  }
  export const Checkbox: React.FC<CheckboxProps>;
}

declare module '@/components/ui/radio-group' {
  import { ReactNode } from 'react';
  export interface RadioGroupProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const RadioGroup: React.FC<RadioGroupProps>;
  export const RadioGroupItem: React.FC<RadioGroupProps>;
}

declare module '@/components/ui/tabs' {
  import { ReactNode } from 'react';
  export interface TabsProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Tabs: React.FC<TabsProps>;
  export const TabsContent: React.FC<TabsProps>;
  export const TabsList: React.FC<TabsProps>;
  export const TabsTrigger: React.FC<TabsProps>;
}

declare module '@/components/ui/badge' {
  import { ReactNode } from 'react';
  export interface BadgeProps {
    children?: ReactNode;
    className?: string;
    [key: string]: any;
  }
  export const Badge: React.FC<BadgeProps>;
}

declare module '@/components/ui/alert' {
  import { ReactNode } from 'react';
  export interface AlertProps {
    children?: ReactNode;
    className?: string;
    [key: string]: any;
  }
  export const Alert: React.FC<AlertProps>;
  export const AlertDescription: React.FC<AlertProps>;
  export const AlertTitle: React.FC<AlertProps>;
}

declare module '@/components/ui/tooltip' {
  import { ReactNode } from 'react';
  export interface TooltipProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Tooltip: React.FC<TooltipProps>;
  export const TooltipContent: React.FC<TooltipProps>;
  export const TooltipProvider: React.FC<TooltipProps>;
  export const TooltipTrigger: React.FC<TooltipProps>;
}

declare module '@/components/ui/popover' {
  import { ReactNode } from 'react';
  export interface PopoverProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Popover: React.FC<PopoverProps>;
  export const PopoverContent: React.FC<PopoverProps>;
  export const PopoverTrigger: React.FC<PopoverProps>;
}

declare module '@/components/ui/accordion' {
  import { ReactNode } from 'react';
  export interface AccordionProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Accordion: React.FC<AccordionProps>;
  export const AccordionContent: React.FC<AccordionProps>;
  export const AccordionItem: React.FC<AccordionProps>;
  export const AccordionTrigger: React.FC<AccordionProps>;
}

declare module '@/components/ui/sheet' {
  import { ReactNode } from 'react';
  export interface SheetProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Sheet: React.FC<SheetProps>;
  export const SheetContent: React.FC<SheetProps>;
  export const SheetDescription: React.FC<SheetProps>;
  export const SheetHeader: React.FC<SheetProps>;
  export const SheetTitle: React.FC<SheetProps>;
  export const SheetTrigger: React.FC<SheetProps>;
}

declare module '@/components/ui/slider' {
  export interface SliderProps {
    className?: string;
    [key: string]: any;
  }
  export const Slider: React.FC<SliderProps>;
}

declare module '@/components/ui/switch' {
  export interface SwitchProps {
    className?: string;
    [key: string]: any;
  }
  export const Switch: React.FC<SwitchProps>;
}

declare module '@/components/ui/table' {
  import { ReactNode } from 'react';
  export interface TableProps {
    children?: ReactNode;
    [key: string]: any;
  }
  export const Table: React.FC<TableProps>;
  export const TableBody: React.FC<TableProps>;
  export const TableCell: React.FC<TableProps>;
  export const TableHead: React.FC<TableProps>;
  export const TableHeader: React.FC<TableProps>;
  export const TableRow: React.FC<TableProps>;
}
`;

/**
 * Loads external type definitions into the Monaco editor for better IntelliSense.
 */
export async function loadMonacoTypes(monaco: Monaco): Promise<void> {
  try {
    // Add UI component stubs first
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      UI_COMPONENT_STUBS,
      "file:///node_modules/@ui-components/types.d.ts",
    );

    const results = await Promise.all(
      MONACO_EXTERNAL_LIBS.map(async (lib) => {
        const content = await fetchLibContent(lib.url);
        return { content, path: lib.path };
      }),
    );

    for (const { content, path } of results) {
      if (content) {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          path,
        );
      }
    }
  } catch (err) {
    console.error("Error loading Monaco types:", err);
  }
}
