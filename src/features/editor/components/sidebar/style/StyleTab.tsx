import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BREAKPOINTS, isTextElement, type Breakpoint } from "./styleModel";
import { useStyleProps } from "./useStyleProps";
import { useStyleClipboard } from "./styleClipboard";
import { LayoutSection } from "./LayoutSection";
import { SpacingSection } from "./SpacingSection";
import { PositionSection } from "./PositionSection";
import { TypographySection } from "./TypographySection";
import { FillSection } from "./FillSection";
import { BorderSection } from "./BorderSection";
import { ShadowSection } from "./ShadowSection";
import { EffectsSection } from "./EffectsSection";
import { AdvancedSection } from "./AdvancedSection";

export default function StyleTab({ breakpoint }: { breakpoint: Breakpoint }) {
  const sp = useStyleProps(breakpoint);
  const copied = useStyleClipboard((s) => s.copied);
  const copy = useStyleClipboard((s) => s.copy);
  const element = sp.element;
  if (!element) return null;

  const bpLabel = BREAKPOINTS.find((b) => b.id === breakpoint)?.label ?? "Base";
  const name = element.name || element.type;

  return (
    // Keyed by element id so per-section UI state (⋯, per-side) resets on selection change.
    <fieldset
      key={`${element.id}:${breakpoint}`}
      disabled={sp.disabled}
      className="m-0 flex min-w-0 flex-col border-0 p-0"
    >
      <div className="flex h-9 items-center gap-2 border-b border-border/60 px-3">
        <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
          {element.type}
        </span>
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium">
          {name}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={sp.disabled}>
            <button
              type="button"
              aria-label="Style actions"
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => copy(sp.values)}>
                Copy styles ({bpLabel})
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!copied || sp.disabled}
                onSelect={() => copied && sp.replace(copied)}
              >
                Paste styles
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={sp.disabled}
                onSelect={() => sp.replace({})}
                className="text-destructive focus:text-destructive"
              >
                Reset styles at {bpLabel}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <LayoutSection sp={sp} />
      <SpacingSection sp={sp} />
      <PositionSection sp={sp} />
      {isTextElement(element.type) && <TypographySection sp={sp} />}
      <FillSection sp={sp} />
      <BorderSection sp={sp} />
      <ShadowSection sp={sp} />
      <EffectsSection sp={sp} />
      <AdvancedSection disabled={sp.disabled} />
    </fieldset>
  );
}
