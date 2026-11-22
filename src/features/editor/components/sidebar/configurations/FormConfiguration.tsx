import type { ReactNode } from "react";
import { Accordion } from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfigSelectInput, ConfigSwitch, ConfigTextInput } from "./_shared/ConfigInputs";
import { useUpdateElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import { FormElement, FormSettings } from "@/features/editor";
import {
  AccordionSection,
  ConfigField,
  ConfigPanel,
  ConfigSection,
  looseSettingUpdater,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
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

interface MethodOption {
  value: string;
  label: string;
  description: string;
  icon: ReactNode;
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

export const FormConfigurationAccordion = () => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Form") {
    return null;
  }

  const settings: Partial<FormSettings> =
    (selectedElement as FormElement).settings || {};

  const updateSetting = looseSettingUpdater(
    updateElement,
    selectedElement.id,
    settings,
  );

  const hasAction = !!settings.action && settings.action.length > 0;
  const isExternalAction =
    hasAction &&
    (settings.action!.startsWith("http://") ||
      settings.action!.startsWith("https://"));

  return (
    <ConfigPanel
      value="form-settings"
      icon={<FileText className="h-3.5 w-3.5" />}
      title="Form Settings"
      trailing={
        hasAction && <CheckCircle2 className="h-3 w-3 text-emerald-500/60" />
      }
    >
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
          <ConfigTextInput
            label="Action URL"
            hint="The URL where the form data will be submitted. Use a relative path for same-origin or an absolute URL for external endpoints."
            id="form-action"
            name="action"
            value={settings.action || ""}
            onValueChange={(value) => updateSetting("action", value)}
            placeholder="/api/submit"
            className="h-7 w-full max-w-[160px] px-2 text-[11px] font-mono rounded-md"
          />

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
          <ConfigSelectInput
            id="form-method"
            label="Method"
            hint="HTTP method for form submission. POST is recommended for data mutations."
            value={settings.method || "post"}
            onValueChange={(value) => updateSetting("method", value)}
            options={METHOD_OPTIONS}
            className="h-7 w-[100px] px-2 text-[11px] rounded-md"
            optionLabelClassName="font-mono text-[11px]"
          />

          {/* Encoding Type */}
          <ConfigSelectInput
            id="form-encType"
            label="Encoding"
            hint="How form data is encoded when sent. Use 'Multipart' for file uploads."
            value={settings.encType || "application/x-www-form-urlencoded"}
            onValueChange={(value) => updateSetting("encType", value)}
            options={ENCODING_OPTIONS}
          />

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
          <ConfigSwitch
            label="Validate on submit"
            hint="Enable client-side validation before form submission. This will check all input rules before allowing the form to submit."
            id="validate-on-submit"
            checked={!!settings.validateOnSubmit}
            onCheckedChange={(checked) => updateSetting("validateOnSubmit", checked)}
          />

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
          <ConfigTextInput
            label="Redirect URL"
            hint="URL to redirect to after successful form submission."
            vertical
            id="form-redirectUrl"
            name="redirectUrl"
            value={settings.redirectUrl || ""}
            onValueChange={(value) => updateSetting("redirectUrl", value)}
            placeholder="/thank-you"
            className="h-7 w-full px-2 text-[11px] font-mono rounded-md"
          />

          <SectionDivider />

          {/* No Validate */}
          <ConfigSwitch
            label="No validate (HTML)"
            hint="Disable the browser's built-in form validation. Use this if you handle validation entirely in JavaScript."
            id="form-noValidate"
            checked={!!settings.noValidate}
            onCheckedChange={(checked) => updateSetting("noValidate", checked)}
          />

          {/* Custom submit */}
          <ConfigSwitch
            label="Handle submit in my code"
            hint="Use this with a form library such as React Hook Form or Formik. The exported code won't bind this form's submit interactions, so your own onSubmit runs unopposed. Adding onSubmit to the form in the Code tab turns this on."
            id="form-customSubmit"
            checked={!!settings.customSubmit}
            onCheckedChange={(checked) => updateSetting("customSubmit", checked)}
          />

          {/* Accept Charset */}
          <ConfigTextInput
            label="Charset"
            hint="Character encoding for form submission. Almost always UTF-8."
            id="form-acceptCharset"
            name="acceptCharset"
            value={settings.acceptCharset || ""}
            onValueChange={(value) => updateSetting("acceptCharset", value)}
            placeholder="UTF-8"
            className="h-7 w-[90px] px-2 text-[11px] font-mono rounded-md"
          />

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
    </ConfigPanel>
  );
};
