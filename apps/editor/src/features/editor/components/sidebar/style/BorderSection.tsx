import { useState } from "react";
import { Section } from "./SectionHeader";
import { StyleField } from "./PropInput";
import { ColorRow } from "./ColorRow";
import { MoreToggle, StyleSelect } from "./controls";
import { isSectionOn, SECTION_KEYS, sectionDefaults } from "./styleModel";
import type { StyleProps } from "./useStyleProps";

const STYLES = ["solid", "dashed", "dotted", "double", "none"].map((v) => ({
  value: v,
  label: v,
}));

export function BorderSection({ sp }: { sp: StyleProps }) {
  const [corners, setCorners] = useState(false);
  return (
    <Section
      title="Border"
      disabled={sp.disabled}
      optional={{
        on: isSectionOn(sp.values, "border"),
        onAdd: () => sp.setMany(sectionDefaults("border")),
        onRemove: () => sp.clear(SECTION_KEYS.border),
      }}
      actions={
        <MoreToggle
          open={corners}
          onToggle={() => setCorners((c) => !c)}
          label="Radius per corner"
        />
      }
    >
      <div className="grid grid-cols-2 gap-1.5">
        <StyleField sp={sp} k="borderWidth" prefix="W" label="Border width" />
        <StyleSelect
          sp={sp}
          k="borderStyle"
          label="Border style"
          options={STYLES}
        />
      </div>
      <ColorRow sp={sp} k="borderColor" label="Border colour" />
      {corners ? (
        <div className="grid grid-cols-2 gap-2">
          <StyleField
            sp={sp}
            k="borderTopLeftRadius"
            prefix="↖"
            label="Top-left radius"
          />
          <StyleField
            sp={sp}
            k="borderTopRightRadius"
            prefix="↗"
            label="Top-right radius"
          />
          <StyleField
            sp={sp}
            k="borderBottomRightRadius"
            prefix="↘"
            label="Bottom-right radius"
          />
          <StyleField
            sp={sp}
            k="borderBottomLeftRadius"
            prefix="↙"
            label="Bottom-left radius"
          />
        </div>
      ) : (
        <StyleField sp={sp} k="borderRadius" prefix="R" label="Corner radius" />
      )}
    </Section>
  );
}
