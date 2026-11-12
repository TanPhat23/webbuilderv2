import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Section } from "./SectionHeader";
import { StyleField } from "./PropInput";
import {
  isSectionOn,
  SECTION_KEYS,
  sectionDefaults,
  SHADOW_PRESETS,
} from "./styleModel";
import type { StyleProps } from "./useStyleProps";

export function ShadowSection({ sp }: { sp: StyleProps }) {
  const current = sp.values.boxShadow as string | undefined;
  const preset =
    SHADOW_PRESETS.find((p) => p.value === current)?.id ?? "custom";
  return (
    <Section
      title="Shadow"
      disabled={sp.disabled}
      optional={{
        on: isSectionOn(sp.values, "shadow"),
        onAdd: () => sp.setMany(sectionDefaults("shadow")),
        onRemove: () => sp.clear(SECTION_KEYS.shadow),
      }}
    >
      <Select
        value={preset}
        disabled={sp.disabled}
        onValueChange={(id) => {
          const p = SHADOW_PRESETS.find((x) => x.id === id);
          if (p) sp.set("boxShadow", p.value);
        }}
      >
        <SelectTrigger
          aria-label="Shadow preset"
          className="h-[26px]! rounded-[5px] border-transparent bg-muted/50 px-2! text-[11px]! shadow-none"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {SHADOW_PRESETS.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-xs">
                {p.label}
              </SelectItem>
            ))}
            <SelectItem value="custom" disabled className="text-xs">
              Custom
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <StyleField
        sp={sp}
        k="boxShadow"
        prefix="✱"
        label="Shadow (CSS box-shadow)"
        free
      />
    </Section>
  );
}
