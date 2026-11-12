import { useEffect, useRef } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { Section } from "./SectionHeader";
import { PropInput, StyleField } from "./PropInput";
import { ColorRow } from "./ColorRow";
import { StyleSelect } from "./controls";
import {
  isSectionOn,
  SECTION_KEYS,
  sectionDefaults,
  toBackgroundImage,
} from "./styleModel";
import type { StyleProps } from "./useStyleProps";

const opts = (xs: string[]) => xs.map((v) => ({ value: v, label: v }));

export function FillSection({ sp }: { sp: StyleProps }) {
  const container = useRef<HTMLDivElement>(null);
  const focusImage = useRef(false);
  const imageOn = isSectionOn(sp.values, "fillImage");
  useEffect(() => {
    if (imageOn && focusImage.current) {
      container.current
        ?.querySelector<HTMLInputElement>(
          'input[aria-label="Background image"]',
        )
        ?.focus();
      focusImage.current = false;
    }
  }, [imageOn]);
  return (
    <Section
      title="Fill"
      actions={
        !imageOn && !sp.disabled ? (
          <button
            type="button"
            title="Add background image"
            aria-label="Add background image"
            onClick={() => {
              focusImage.current = true;
              sp.setMany(sectionDefaults("fillImage"));
            }}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
        ) : undefined
      }
    >
      <ColorRow sp={sp} k="backgroundColor" label="Background colour" />
      {imageOn && (
        <>
          <div ref={container} className="flex items-center gap-1">
            <PropInput
              value={sp.values.backgroundImage}
              placeholder="Image URL or gradient"
              prefix={<ImageIcon />}
              label="Background image"
              free
              onCommit={(v) => sp.set("backgroundImage", toBackgroundImage(v))}
              disabled={sp.disabled}
              className="flex-1"
            />
            {!sp.disabled && (
              <button
                type="button"
                aria-label="Remove background image"
                title="Remove background image"
                onClick={() => sp.clear(SECTION_KEYS.fillImage)}
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1">
            <StyleSelect
              sp={sp}
              k="backgroundSize"
              label="Image size"
              options={opts(["cover", "contain", "auto", "100% 100%"])}
            />
            <StyleField
              sp={sp}
              k="backgroundPosition"
              prefix="P"
              label="Image position"
              free
            />
            <StyleSelect
              sp={sp}
              k="backgroundRepeat"
              label="Image repeat"
              options={opts(["no-repeat", "repeat", "repeat-x", "repeat-y"])}
            />
          </div>
        </>
      )}
    </Section>
  );
}
