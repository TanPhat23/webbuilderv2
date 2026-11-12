import { Slider } from "@/components/ui/slider";
import { Section } from "./SectionHeader";
import { StyleField } from "./PropInput";
import { StyleSelect } from "./controls";
import { isSectionOn, SECTION_KEYS, sectionDefaults } from "./styleModel";
import type { StyleProps } from "./useStyleProps";

const opts = (xs: string[]) => xs.map((v) => ({ value: v, label: v }));

export function EffectsSection({ sp }: { sp: StyleProps }) {
  const opacity = Number(sp.values.opacity ?? sp.inherited.opacity ?? 1);
  const pct = Math.round((Number.isFinite(opacity) ? opacity : 1) * 100);
  return (
    <Section
      title="Effects"
      disabled={sp.disabled}
      optional={{
        on: isSectionOn(sp.values, "effects"),
        onAdd: () => sp.setMany(sectionDefaults("effects")),
        onRemove: () => sp.clear(SECTION_KEYS.effects),
      }}
    >
      <div className="flex h-[26px] items-center gap-2">
        <span className="w-12 shrink-0 text-[11px] text-muted-foreground">
          Opacity
        </span>
        <Slider
          aria-label="Opacity"
          min={0}
          max={100}
          step={1}
          value={[pct]}
          disabled={sp.disabled}
          onValueChange={([v]) => sp.set("opacity", v / 100)}
          className="flex-1"
        />
        <span className="w-8 text-right font-mono text-[11px] text-muted-foreground">
          {pct}%
        </span>
      </div>
      <StyleField
        sp={sp}
        k="transform"
        prefix="T"
        label="Transform (e.g. rotate(4deg) scale(1.05))"
        free
      />
      <StyleField
        sp={sp}
        k="transformOrigin"
        prefix="O"
        label="Transform origin"
        free
      />
      <StyleField
        sp={sp}
        k="filter"
        prefix="F"
        label="Filter (e.g. blur(4px))"
        free
      />
      <div className="grid grid-cols-2 gap-1.5">
        <StyleSelect
          sp={sp}
          k="overflow"
          label="Overflow"
          options={opts(["visible", "hidden", "scroll", "auto", "clip"])}
          placeholder="Overflow"
        />
        <StyleSelect
          sp={sp}
          k="cursor"
          label="Cursor"
          options={opts([
            "auto",
            "default",
            "pointer",
            "text",
            "move",
            "not-allowed",
            "grab",
          ])}
          placeholder="Cursor"
        />
        <StyleSelect
          sp={sp}
          k="overflowX"
          label="Overflow X"
          options={opts(["visible", "hidden", "scroll", "auto", "clip"])}
          placeholder="Overflow X"
        />
        <StyleSelect
          sp={sp}
          k="overflowY"
          label="Overflow Y"
          options={opts(["visible", "hidden", "scroll", "auto", "clip"])}
          placeholder="Overflow Y"
        />
        <StyleSelect
          sp={sp}
          k="visibility"
          label="Visibility"
          options={opts(["visible", "hidden", "collapse"])}
          placeholder="Visibility"
        />
        <StyleSelect
          sp={sp}
          k="boxSizing"
          label="Box sizing"
          options={opts(["border-box", "content-box"])}
          placeholder="Box sizing"
        />
      </div>
    </Section>
  );
}
