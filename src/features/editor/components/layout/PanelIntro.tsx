import type { LucideIcon } from "lucide-react";
import type React from "react";

/** Icon, title and one line of copy at the top of a tool panel. */
export default function PanelIntro({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/40">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium">{title}</p>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {children && <div className="flex w-full flex-col gap-2">{children}</div>}
    </div>
  );
}
