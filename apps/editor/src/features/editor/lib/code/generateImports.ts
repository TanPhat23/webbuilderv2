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

export interface ExtraGeneratedImports {
  readonly lucideIcons?: readonly string[];
  readonly projectComponents?: readonly string[];
}

/**
 * Finds the component tags the generated JSX actually renders. Only these need
 * imports: element types that compile to plain DOM tags (a `Button` element
 * becomes `<button>`) must not pull in a component they never use.
 */
function findUsedComponents(jsx: string): Set<string> {
  const used = new Set<string>();
  for (const match of jsx.matchAll(/<([A-Z][A-Za-z0-9]*)(?=[\s/>])/g)) {
    if (match[1]) used.add(match[1]);
  }
  return used;
}

/**
 * Generates import statements for the components, Lucide icons, and project
 * components used in the generated JSX. Always includes React import.
 */
export function generateImports(jsx: string, extra?: ExtraGeneratedImports): string {
  const imports: string[] = ["import React from 'react';"];
  const lucideSet = new Set(
    (extra?.lucideIcons ?? []).filter((name) => name.length > 0),
  );
  const projectSet = new Set(
    (extra?.projectComponents ?? []).filter((name) => name.length > 0),
  );

  const usedComponents = findUsedComponents(jsx);
  for (const component of usedComponents) {
    if (lucideSet.has(component) || projectSet.has(component)) continue;
    if (Object.hasOwn(COMPONENT_IMPORTS, component)) {
      const stmt = COMPONENT_IMPORTS[component];
      if (stmt) imports.push(stmt);
    }
  }

  if (lucideSet.size > 0) {
    const sortedIcons = [...lucideSet].sort();
    imports.push(`import { ${sortedIcons.join(", ")} } from 'lucide-react';`);
  }

  if (projectSet.size > 0) {
    for (const name of [...projectSet].sort()) {
      imports.push(`import { ${name} } from '@/components/${name}';`);
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
  return Object.hasOwn(COMPONENT_IMPORTS, componentType)
    ? COMPONENT_IMPORTS[componentType]
    : undefined;
}

/**
 * Gets the import statements for multiple specific components
 */
export function getComponentImports(
  componentTypes: string[],
): Record<string, string> {
  const imports: Record<string, string> = {};
  componentTypes.forEach((type) => {
    const importStmt = getComponentImport(type);
    if (importStmt) {
      imports[type] = importStmt;
    }
  });
  return imports;
}
