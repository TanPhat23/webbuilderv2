import { Accordion } from "@/components/ui/accordion";
import {
  useSelectedElement,
  useUpdateElement,
  type IconSettings,
} from "@/features/editor";
import { cn } from "@webbuilder/site-runtime/lib/utils";
import { Droplets, Palette, PenTool, Ruler, Smile } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic.mjs";
import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_FILL,
  DEFAULT_ICON_NAME,
  DEFAULT_ICON_SIZE,
  DEFAULT_ICON_STROKE_WIDTH,
  isValidIconName,
} from "../../../lib/iconConfig";
import {
  AccordionSection,
  ConfigPanel,
  SectionDivider,
  settingUpdater,
} from "./_shared";
import {
  IconColorsContent,
  IconSizingContent,
} from "./IconAppearanceSections";
import { IconPicker } from "./IconPicker";

export default function IconConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Icon") {
    return null;
  }

  const settings: IconSettings = selectedElement.settings ?? {};
  const updateSetting = settingUpdater(
    updateElement,
    selectedElement.id,
    settings,
  );

  const iconName = settings.iconName || DEFAULT_ICON_NAME;
  const size = settings.size ?? DEFAULT_ICON_SIZE;
  const strokeWidth = settings.strokeWidth ?? DEFAULT_ICON_STROKE_WIDTH;
  const color = settings.color ?? DEFAULT_ICON_COLOR;
  const fill = settings.fill ?? DEFAULT_ICON_FILL;
  const absoluteStrokeWidth = settings.absoluteStrokeWidth ?? false;
  const validName = isValidIconName(iconName) ? iconName : null;

  return (
    <ConfigPanel
      value="icon-settings"
      icon={
        validName ? (
          <DynamicIcon name={validName} size={14} strokeWidth={2} />
        ) : (
          <Smile className="h-3.5 w-3.5" />
        )
      }
      title="Icon Settings"
      trailing={
        <span
          className={cn(
            "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-mono",
            validName
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          )}
        >
          {iconName}
        </span>
      }
    >
      <Accordion
        type="multiple"
        defaultValue={["icon-select", "sizing", "colors"]}
        className="w-full"
      >
        <AccordionSection
          value="icon-select"
          title="Icon"
          icon={<Smile />}
          nested
        >
          <IconPicker
            key={selectedElement.id}
            value={iconName}
            onChange={(name) =>
              updateSetting("iconName", name || DEFAULT_ICON_NAME)
            }
          />
        </AccordionSection>

        <AccordionSection
          value="sizing"
          title="Sizing"
          icon={<Ruler />}
          nested
        >
          <IconSizingContent
            iconName={iconName}
            size={size}
            strokeWidth={strokeWidth}
            absoluteStrokeWidth={absoluteStrokeWidth}
            color={color}
            fill={fill}
            onUpdateSize={(value) => updateSetting("size", value)}
            onUpdateStrokeWidth={(value) => updateSetting("strokeWidth", value)}
            onToggleAbsoluteStroke={(checked) =>
              updateSetting("absoluteStrokeWidth", checked)
            }
          />
        </AccordionSection>

        <AccordionSection
          value="colors"
          title="Colors"
          icon={<Palette />}
          nested
        >
          <IconColorsContent
            color={color}
            fill={fill}
            onChangeColor={(value) => updateSetting("color", value)}
            onChangeFill={(value) => updateSetting("fill", value)}
          />
        </AccordionSection>
      </Accordion>

      <SectionDivider className="mt-2" />
      <div className="flex items-center gap-1.5 flex-wrap pt-2 pl-0.5 animate-in fade-in-0 duration-150">
        {validName ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
            <DynamicIcon name={validName} size={10} strokeWidth={2} />
            {validName}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono text-amber-600 dark:text-amber-400">
            <Smile className="h-2.5 w-2.5" />
            unknown
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          <Ruler className="h-2.5 w-2.5" />
          {size}px
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          <PenTool className="h-2.5 w-2.5" />
          {strokeWidth}
        </span>
        {fill !== "none" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <Droplets className="h-2.5 w-2.5" />
            filled
          </span>
        )}
      </div>
    </ConfigPanel>
  );
}
