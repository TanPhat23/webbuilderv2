import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { ToggleGroup as ToggleGroup$1 } from "radix-ui";
import { h as cn, L as Label, af as Tooltip, ag as TooltipTrigger, ah as TooltipContent } from "./prisma-BUnO9f9X.js";
import { cva } from "class-variance-authority";
import "clsx";
import { Info } from "lucide-react";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent } from "./accordion-D43pR8IL.js";
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground"
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
  spacing: 0
});
function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    ToggleGroup$1.Root,
    {
      "data-slot": "toggle-group",
      "data-variant": variant,
      "data-size": size,
      "data-spacing": spacing,
      style: { "--gap": spacing },
      className: cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(ToggleGroupContext.Provider, { value: { variant, size, spacing }, children })
    }
  );
}
function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}) {
  const context = React.useContext(ToggleGroupContext);
  return /* @__PURE__ */ jsx(
    ToggleGroup$1.Item,
    {
      "data-slot": "toggle-group-item",
      "data-variant": context.variant || variant,
      "data-size": context.size || size,
      "data-spacing": context.spacing,
      className: cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size
        }),
        "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
        "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
        className
      ),
      ...props,
      children
    }
  );
}
function ConfigField({
  label,
  htmlFor,
  hint,
  children,
  vertical = false,
  className,
  fullWidth = false
}) {
  const labelContent = /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
    /* @__PURE__ */ jsx(
      Label,
      {
        htmlFor,
        className: cn(
          "text-[11px] font-medium text-muted-foreground select-none leading-none",
          hint && "cursor-help"
        ),
        children: label
      }
    ),
    hint && /* @__PURE__ */ jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Info, { className: "h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" }) }),
      /* @__PURE__ */ jsx(TooltipContent, { side: "top", className: "max-w-[200px] text-xs", children: hint })
    ] })
  ] });
  if (fullWidth) {
    return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-1.5", className), children: [
      labelContent,
      children
    ] });
  }
  if (vertical) {
    return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-1.5", className), children: [
      labelContent,
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children })
    ] });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex items-center justify-between gap-3 min-h-[28px]",
        className
      ),
      children: [
        labelContent,
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 flex-1 justify-end min-w-0", children })
      ]
    }
  );
}
function ConfigSection({
  title,
  icon,
  children,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col", className), children: [
    title && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [
      icon && /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/60", children: icon }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70", children: title })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children })
  ] });
}
function ConfigEmpty({ icon, message, className }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex flex-col items-center justify-center gap-2 py-6 text-center",
        "rounded-lg border border-dashed border-border/50 bg-muted/20",
        className
      ),
      children: [
        icon && /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/40", children: icon }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground/60", children: message })
      ]
    }
  );
}
function AccordionSection({
  value,
  title,
  icon,
  badge,
  children,
  className,
  contentClassName,
  nested = false,
  noBorder = false
}) {
  return /* @__PURE__ */ jsxs(
    AccordionItem,
    {
      value,
      className: cn(
        "border-border/40",
        noBorder && "border-b-0",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(
          AccordionTrigger,
          {
            className: cn(
              "group/trigger gap-2 py-2 hover:no-underline",
              "transition-colors duration-150",
              "hover:bg-muted/30 rounded-md px-1.5 -mx-1.5",
              nested ? "text-[11px] font-medium text-muted-foreground" : "text-xs font-semibold text-foreground/90"
            ),
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
              icon && /* @__PURE__ */ jsx(
                "span",
                {
                  className: cn(
                    "shrink-0 transition-colors duration-150",
                    "text-muted-foreground/60 group-hover/trigger:text-muted-foreground",
                    nested ? "[&>svg]:h-3 [&>svg]:w-3" : "[&>svg]:h-3.5 [&>svg]:w-3.5"
                  ),
                  children: icon
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: title }),
              badge && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: badge })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          AccordionContent,
          {
            className: cn(
              "pb-3 pt-1",
              nested ? "pl-1" : "px-0.5",
              contentClassName
            ),
            children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2.5", children })
          }
        )
      ]
    }
  );
}
function SectionDivider({ className }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("h-px w-full bg-border/30 my-1", className),
      role: "separator"
    }
  );
}
export {
  AccordionSection as A,
  ConfigField as C,
  SectionDivider as S,
  ToggleGroup as T,
  ToggleGroupItem as a,
  ConfigSection as b,
  ConfigEmpty as c
};
