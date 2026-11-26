import { Section } from "./SectionHeader";
import { StyleField } from "./PropInput";
import { StyleSelect } from "./controls";
import type { StyleProps } from "./useStyleProps";

const POSITIONS = ["static", "relative", "absolute", "fixed", "sticky"].map(
  (v) => ({
    value: v,
    label: v[0].toUpperCase() + v.slice(1),
  }),
);

export function PositionSection({ sp }: { sp: StyleProps }) {
  const position = String(
    sp.values.position ?? sp.inherited.position ?? "static",
  );
  return (
    <Section title="Position">
      <div className="grid grid-cols-2 gap-1.5">
        <StyleSelect
          sp={sp}
          k="position"
          label="Position type"
          options={POSITIONS}
          placeholder="Static"
        />
        <StyleField
          sp={sp}
          k="zIndex"
          prefix="Z"
          label="Stack order (z-index)"
          defaultUnit=""
        />
      </div>
      {position !== "static" && (
        <div className="grid grid-cols-2 gap-2">
          <StyleField sp={sp} k="top" prefix="T" label="Top offset" />
          <StyleField sp={sp} k="right" prefix="R" label="Right offset" />
          <StyleField sp={sp} k="bottom" prefix="B" label="Bottom offset" />
          <StyleField sp={sp} k="left" prefix="L" label="Left offset" />
        </div>
      )}
    </Section>
  );
}
