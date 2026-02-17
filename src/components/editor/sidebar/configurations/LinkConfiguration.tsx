import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";

import React, { ChangeEvent } from "react";

export const LinkConfigurationAccordion = () => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Link") {
    return <AccordionItem value="link-settings"></AccordionItem>;
  }

  const href = selectedElement.href ?? "";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedElement.id, {
      href: e.target.value,
    });
  };

  return (
    <AccordionItem value="link-settings">
      <AccordionTrigger className="text-sm">Link Settings</AccordionTrigger>
      <AccordionContent>
        <div className="flex items-center gap-4 py-1">
          <Label htmlFor="link-href" className="text-xs w-28">
            Link URL
          </Label>
          <Input
            id="link-href"
            name="href"
            type="text"
            value={href}
            onChange={handleChange}
            className="w-48 h-7 px-2 py-1 text-xs"
            placeholder="https://example.com or /relative-path"
            autoComplete="off"
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
