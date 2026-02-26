"use client";

import React, { ChangeEvent } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUpdateElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import { FormElement, FormSettings } from "@/features/editor";
import {
  AccordionSection,
  ConfigField,
  ConfigSection,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Globe,
  Send,
  ShieldCheck,
  Settings2,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

/* ─── Method Options ─── */

interface MethodOption {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const METHOD_OPTIONS: MethodOption[] = [
  {
    value: "post",
    label: "POST",
    description: "Send data in the request body",
    icon: <Send className="h-3 w-3" />,
  },
  {
    value: "get",
    label: "GET",
    description: "Send data as URL parameters",
    icon: <Globe className="h-3 w-3" />,
  },
];

const TARGET_OPTIONS = [
  { value: "_self", label: "Same tab" },
  { value: "_blank", label: "New tab" },
  { value: "_parent", label: "Parent frame" },
  { value: "_top", label: "Top frame" },
];

const ENCODING_OPTIONS = [
  { value: "application/x-www-form-urlencoded", label: "URL Encoded" },
  { value: "multipart/form-data", label: "Multipart" },
  { value: "text/plain", label: "Plain Text" },
];

/* ─── Main Component ─── */

export const FormConfigurationAccordion = () => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Form") {
    return null;
  }

  const settings: Partial<FormSettings> =
    (selectedElement as FormElement).settings || {};

  /* ─── Handlers ─── */

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value },
    });
  };

  const updateSetting = (name: keyof FormSettings, value: unknown) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value },
    });
  };

  /* ─── Derived state ─── */

  const hasAction = !!settings.action && settings.action.length > 0;
  const isExternalAction =
    hasAction &&
    (settings.action!.startsWith("http://") ||
      settings.action!.startsWith("https://"));

  return (
    <AccordionItem value="form-settings" className="border-border/40">
      <AccordionTrigger
        className={cn(
          "group/trigger gap-2 py-2 hover:no-underline",
          "transition-colors duration-150",
          "hover:bg-muted/30 rounded-md px-1.5 -mx-1.5",
          "text-xs font-semibold text-foreground/90",
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150">
            <FileText className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Form Settings</span>
          {hasAction && (
            <span className="ml-auto mr-1 shrink-0">
              <CheckCircle2 className="h-3 w-3 text-emerald-500/60" />
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <Accordion
          type="multiple"
          defaultValue={["general", "validation", "advanced"]}
          className="w-full"
        >
          {/* ── General ── */}
          <AccordionSection
            value="general"
            title="General"
            icon={<Globe />}
            nested
          >
            {/* Action URL */}
            <ConfigField
              label="Action URL"
              htmlFor="form-action"
              hint="The URL where the form data will be submitted. Use a relative path for same-origin or an absolute URL for external endpoints."
            >
              <Input
                id="form-action"
                name="action"
                type="text"
                value={settings.action || ""}
                onChange={handleChange}
                placeholder="/api/submit"
                className="h-7 w-full max-w-[160px] px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* URL type indicator */}
            {hasAction && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    isExternalAction
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  {isExternalAction ? (
                    <>
                      <ExternalLink className="h-2.5 w-2.5" />
                      External endpoint
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-2.5 w-2.5" />
                      Internal endpoint
                    </>
                  )}
                </span>
              </div>
            )}

            <SectionDivider />

            {/* Method */}
            <ConfigField
              label="Method"
              htmlFor="form-method"
              hint="HTTP method for form submission. POST is recommended for data mutations."
            >
              <Select
                value={settings.method || "post"}
                onValueChange={(value) => updateSetting("method", value)}
              >
                <SelectTrigger
                  id="form-method"
                  className="h-7 w-[100px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {opt.icon}
                        </span>
                        <span className="font-mono text-[11px]">
                          {opt.label}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ConfigField>

            {/* Encoding Type */}
            <ConfigField
              label="Encoding"
              htmlFor="form-encType"
              hint="How form data is encoded when sent. Use 'Multipart' for file uploads."
            >
              <Select
                value={settings.encType || "application/x-www-form-urlencoded"}
                onValueChange={(value) => updateSetting("encType", value)}
              >
                <SelectTrigger
                  id="form-encType"
                  className="h-7 w-[120px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENCODING_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ConfigField>

            {/* Auto Complete */}
            <ConfigField
              label="Autocomplete"
              htmlFor="form-autoComplete"
              hint="Enable or disable browser autocomplete for all form fields."
            >
              <Select
                value={settings.autoComplete || "on"}
                onValueChange={(value) => updateSetting("autoComplete", value)}
              >
                <SelectTrigger
                  id="form-autoComplete"
                  className="h-7 w-[80px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on">On</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </ConfigField>

            {/* Target */}
            <ConfigField
              label="Target"
              htmlFor="form-target"
              hint="Where to display the response after form submission."
            >
              <Select
                value={settings.target || "_self"}
                onValueChange={(value) => updateSetting("target", value)}
              >
                <SelectTrigger
                  id="form-target"
                  className="h-7 w-[110px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-1.5">
                        {opt.value === "_blank" && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ConfigField>
          </AccordionSection>

          {/* ── Validation ── */}
          <AccordionSection
            value="validation"
            title="Validation"
            icon={<ShieldCheck />}
            nested
          >
            <ConfigField
              label="Validate on submit"
              htmlFor="validate-on-submit"
              hint="Enable client-side validation before form submission. This will check all input rules before allowing the form to submit."
            >
              <Switch
                id="validate-on-submit"
                checked={!!settings.validateOnSubmit}
                onCheckedChange={(checked) =>
                  updateSetting("validateOnSubmit", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Validation status */}
            <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
              {settings.validateOnSubmit ? (
                <>
                  <ShieldCheck className="h-3 w-3 text-emerald-500/60" />
                  <span className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60">
                    Client-side validation active
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-[10px] text-muted-foreground/50">
                    No client-side validation — browser defaults apply
                  </span>
                </>
              )}
            </div>
          </AccordionSection>

          {/* ── Advanced ── */}
          <AccordionSection
            value="advanced"
            title="Advanced"
            icon={<Settings2 />}
            nested
          >
            {/* Redirect URL */}
            <ConfigField
              label="Redirect URL"
              htmlFor="form-redirectUrl"
              hint="URL to redirect to after successful form submission."
              vertical
            >
              <Input
                id="form-redirectUrl"
                name="redirectUrl"
                type="text"
                value={settings.redirectUrl || ""}
                onChange={handleChange}
                placeholder="/thank-you"
                className="h-7 w-full px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            <SectionDivider />

            {/* No Validate */}
            <ConfigField
              label="No validate (HTML)"
              htmlFor="form-noValidate"
              hint="Disable the browser's built-in form validation. Use this if you handle validation entirely in JavaScript."
            >
              <Switch
                id="form-noValidate"
                checked={!!settings.noValidate}
                onCheckedChange={(checked) =>
                  updateSetting("noValidate", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Accept Charset */}
            <ConfigField
              label="Charset"
              htmlFor="form-acceptCharset"
              hint="Character encoding for form submission. Almost always UTF-8."
            >
              <Input
                id="form-acceptCharset"
                name="acceptCharset"
                type="text"
                value={settings.acceptCharset || ""}
                onChange={handleChange}
                placeholder="UTF-8"
                className="h-7 w-[90px] px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* Security summary */}
            <div className="flex flex-col gap-1 pt-1 animate-in fade-in-0 duration-150">
              <div className="flex items-center gap-1.5 pl-0.5">
                <Lock className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50 leading-tight">
                  {settings.noValidate
                    ? "Browser validation disabled — ensure JS validation is in place"
                    : "Browser validation enabled"}
                </span>
              </div>
              {isExternalAction && (
                <div className="flex items-center gap-1.5 pl-0.5">
                  <ExternalLink className="h-3 w-3 text-amber-500/50" />
                  <span className="text-[10px] text-amber-600/50 dark:text-amber-400/50 leading-tight">
                    Submitting to an external endpoint — ensure CORS is
                    configured
                  </span>
                </div>
              )}
            </div>
          </AccordionSection>
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
};
