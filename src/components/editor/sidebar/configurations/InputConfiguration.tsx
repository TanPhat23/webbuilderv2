import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { useElementStore } from "@/globalstore/element-store";
import { useSelectionStore } from "@/globalstore/selection-store";

import { InputElement, InputSettings } from "@/interfaces/elements.interface";
import React, { ChangeEvent } from "react";
import ValidationConfiguration from "./ValidationConfigration";

export default function InputConfiguration() {
  const { updateElement } = useElementStore();
  const { selectedElement } = useSelectionStore();

  if (!selectedElement || selectedElement.type !== "Input") {
    return <AccordionItem value="input-settings"></AccordionItem>;
  }

  const settings: InputSettings =
    (selectedElement as InputElement).settings ?? {};

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    updateElement(selectedElement.id, {
      settings: {
        ...settings,
        [name]: type === "checkbox" ? checked : value,
      },
    });
  };

  const handleSelectChange = (name: keyof InputSettings, value: any) => {
    updateElement(selectedElement.id, {
      settings: {
        ...settings,
        [name]: value,
      },
    });
  };

  const handleCheckboxChange = (
    name: keyof InputSettings,
    checked: boolean,
  ) => {
    updateElement(selectedElement.id, {
      settings: {
        ...settings,
        [name]: checked,
      },
    });
  };

  return (
    <AccordionItem value="input-settings">
      <AccordionTrigger className="text-sm">Input Settings</AccordionTrigger>
      <AccordionContent>
        <Accordion
          type="multiple"
          defaultValue={["general", "validation", "advanced"]}
        >
          {/* General */}
          <AccordionItem value="general">
            <AccordionTrigger className="text-xs">General</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 py-1">
                <div className="flex items-center gap-4">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Label
                        htmlFor="input-name"
                        className="text-xs w-28 cursor-help"
                      >
                        Name
                      </Label>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      The name attribute for the input field, used in form
                      submission.
                    </HoverCardContent>
                  </HoverCard>
                  <Input
                    id="input-name"
                    name="name"
                    type="text"
                    value={settings.name || ""}
                    onChange={handleChange}
                    className="w-48 h-7 px-2 py-1 text-xs"
                    placeholder="inputName"
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Label
                        htmlFor="input-type"
                        className="text-xs w-28 cursor-help"
                      >
                        Type
                      </Label>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      The input type determines validation and keyboard
                      behavior.
                    </HoverCardContent>
                  </HoverCard>
                  <Select
                    value={settings.type || "text"}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger className="w-48 h-7 px-2 py-1 text-xs">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="password">Password</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="tel">Tel</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Label
                        htmlFor="input-placeholder"
                        className="text-xs w-28 cursor-help"
                      >
                        Placeholder
                      </Label>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      Text shown in the input when it's empty.
                    </HoverCardContent>
                  </HoverCard>
                  <Input
                    id="input-placeholder"
                    name="placeholder"
                    type="text"
                    value={settings.placeholder || ""}
                    onChange={handleChange}
                    className="w-48 h-7 px-2 py-1 text-xs"
                    placeholder="Enter value"
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Label
                        htmlFor="input-defaultValue"
                        className="text-xs w-28 cursor-help"
                      >
                        Default Value
                      </Label>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      Pre-filled value in the input field.
                    </HoverCardContent>
                  </HoverCard>
                  <Input
                    id="input-defaultValue"
                    name="defaultValue"
                    type="text"
                    value={settings.defaultValue ?? ""}
                    onChange={handleChange}
                    className="w-48 h-7 px-2 py-1 text-xs"
                    placeholder="Default value"
                    autoComplete="off"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          {/* Validation */}
          <AccordionItem value="validation">
            <AccordionTrigger className="text-xs">Validation</AccordionTrigger>
            <AccordionContent>
              <ValidationConfiguration />
            </AccordionContent>
          </AccordionItem>
          {/* Constraints */}
          <AccordionItem value="constraints">
            <AccordionTrigger className="text-xs">Constraints</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 py-1">
                <div className="flex items-center gap-4">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Label
                        htmlFor="input-required"
                        className="text-xs w-28 cursor-help"
                      >
                        Required
                      </Label>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      Make this field mandatory for form submission.
                    </HoverCardContent>
                  </HoverCard>
                  <Checkbox
                    id="input-required"
                    checked={!!settings.required}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("required", !!checked)
                    }
                    className="mr-2"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Label
                        htmlFor="input-pattern"
                        className="text-xs w-28 cursor-help"
                      >
                        Pattern
                      </Label>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      Regular expression pattern for input validation.
                    </HoverCardContent>
                  </HoverCard>
                  <Input
                    id="input-pattern"
                    name="pattern"
                    type="text"
                    value={settings.pattern || ""}
                    onChange={handleChange}
                    className="w-48 h-7 px-2 py-1 text-xs"
                    placeholder="[A-Za-z]+"
                    autoComplete="off"
                  />
                </div>
                {settings.type === "number" && (
                  <>
                    <div className="flex items-center gap-4">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Label
                            htmlFor="input-min"
                            className="text-xs w-28 cursor-help"
                          >
                            Min Value
                          </Label>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          Minimum allowed value for number inputs.
                        </HoverCardContent>
                      </HoverCard>
                      <Input
                        id="input-min"
                        name="min"
                        type="number"
                        value={settings.min ?? ""}
                        onChange={(e) =>
                          handleSelectChange("min", Number(e.target.value))
                        }
                        className="w-48 h-7 px-2 py-1 text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Label
                            htmlFor="input-max"
                            className="text-xs w-28 cursor-help"
                          >
                            Max Value
                          </Label>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          Maximum allowed value for number inputs.
                        </HoverCardContent>
                      </HoverCard>
                      <Input
                        id="input-max"
                        name="max"
                        type="number"
                        value={settings.max ?? ""}
                        onChange={(e) =>
                          handleSelectChange("max", Number(e.target.value))
                        }
                        className="w-48 h-7 px-2 py-1 text-xs"
                        placeholder="100"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Label
                            htmlFor="input-step"
                            className="text-xs w-28 cursor-help"
                          >
                            Step
                          </Label>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          Increment step for number inputs.
                        </HoverCardContent>
                      </HoverCard>
                      <Input
                        id="input-step"
                        name="step"
                        type="number"
                        value={settings.step ?? ""}
                        onChange={(e) =>
                          handleSelectChange("step", Number(e.target.value))
                        }
                        className="w-48 h-7 px-2 py-1 text-xs"
                        placeholder="1"
                      />
                    </div>
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Advanced */}
          <AccordionItem value="advanced">
            <AccordionTrigger className="text-xs">Advanced</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-4 py-1">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label
                      htmlFor="input-autoComplete"
                      className="text-xs w-28 cursor-help"
                    >
                      Auto Complete
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Browser autocomplete hint for better UX.
                  </HoverCardContent>
                </HoverCard>
                <Input
                  id="input-autoComplete"
                  name="autoComplete"
                  type="text"
                  value={settings.autoComplete || ""}
                  onChange={handleChange}
                  className="w-48 h-7 px-2 py-1 text-xs"
                  placeholder="on/off or browser hint"
                  autoComplete="off"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}
