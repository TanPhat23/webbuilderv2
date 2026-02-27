import { EditorElement } from "@/types/global.type";

/**
 * Map of component types to their import statements
 * Note: These imports use @/ paths which work in the app but may show errors in Monaco editor
 * This is expected - the editor doesn't have the full project context for path resolution
 */
const COMPONENT_IMPORTS: Record<string, string> = {
  Carousel: "import { Carousel } from '@/components/ui/carousel';",
  Button: "import { Button } from '@/components/ui/button';",
  Card: "import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';",
  Input: "import { Input } from '@/components/ui/input';",
  Select:
    "import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';",
  Dialog:
    "import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';",
  Checkbox: "import { Checkbox } from '@/components/ui/checkbox';",
  RadioGroup:
    "import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';",
  Tabs: "import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';",
  Badge: "import { Badge } from '@/components/ui/badge';",
  Alert:
    "import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';",
  Tooltip:
    "import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';",
  Popover:
    "import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';",
  Accordion:
    "import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';",
  Sheet:
    "import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';",
  Slider: "import { Slider } from '@/components/ui/slider';",
  Switch: "import { Switch } from '@/components/ui/switch';",
  Table:
    "import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';",
};

/**
 * Recursively finds all component types used in elements
 */
function findUsedComponents(elements: EditorElement[]): Set<string> {
  const used = new Set<string>();

  const traverse = (el: EditorElement) => {
    used.add(el.type);
    const containerEl = el as any;
    if (Array.isArray(containerEl.elements)) {
      containerEl.elements.forEach((child: EditorElement) => traverse(child));
    }
  };

  elements.forEach((el) => traverse(el));
  return used;
}

/**
 * Generates import statements for components used in the provided elements
 * Always includes React import
 */
export function generateImports(elements: EditorElement[]): string {
  const imports: string[] = ["import React from 'react';"];

  // Find all used components and add their imports
  const usedComponents = findUsedComponents(elements);
  for (const component of usedComponents) {
    if (COMPONENT_IMPORTS[component]) {
      imports.push(COMPONENT_IMPORTS[component]);
    }
  }

  return imports.join("\n");
}

/**
 * Gets all available component imports
 * Useful for documentation or UI purposes
 */
export function getAvailableComponentImports(): Record<string, string> {
  return { ...COMPONENT_IMPORTS };
}

/**
 * Registers a new component import mapping
 * Use this to add custom components dynamically
 */
export function registerComponentImport(
  componentType: string,
  importStatement: string,
): void {
  COMPONENT_IMPORTS[componentType] = importStatement;
}

/**
 * Gets the import statement for a specific component
 */
export function getComponentImport(componentType: string): string | undefined {
  return COMPONENT_IMPORTS[componentType];
}

/**
 * Gets the import statements for multiple specific components
 */
export function getComponentImports(
  componentTypes: string[],
): Record<string, string> {
  const imports: Record<string, string> = {};
  componentTypes.forEach((type) => {
    const importStmt = COMPONENT_IMPORTS[type];
    if (importStmt) {
      imports[type] = importStmt;
    }
  });
  return imports;
}
