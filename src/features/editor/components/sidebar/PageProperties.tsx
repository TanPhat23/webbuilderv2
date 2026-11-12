import { Link } from "@tanstack/react-router";
import { MousePointerClick, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCurrentPage,
  useCurrentProject,
} from "@/features/projects/hooks/useProjects";

const MAX_STYLE_ROWS = 8;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2 text-xs last:border-b-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="truncate font-medium" title={value}>
        {value}
      </span>
    </div>
  );
}

/** Inspector content when nothing is selected: the current page. */
export default function PageProperties() {
  const page = useCurrentPage();
  const { data: project } = useCurrentProject();

  if (!page) {
    return <p className="text-xs text-muted-foreground">No page loaded.</p>;
  }

  const styleRows = Object.entries(page.Styles ?? {})
    .filter(([, v]) => typeof v === "string" || typeof v === "number")
    .slice(0, MAX_STYLE_ROWS);

  return (
    <div className="flex flex-col gap-5">
      <section>
        <Row label="Name" value={page.Name || "Home"} />
        <Row label="Type" value={page.Type || "page"} />
        {project && <Row label="Project" value={project.name} />}
      </section>

      {styleRows.length > 0 && (
        <section>
          <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Page styles
          </h3>
          {styleRows.map(([key, value]) => (
            <Row key={key} label={key} value={String(value)} />
          ))}
        </section>
      )}

      <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
        <MousePointerClick className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Select an element on the canvas to style it.
      </div>

      {project && (
        <Button asChild variant="outline" size="sm" className="gap-2 text-xs">
          <Link to="/projectsettings/$id" params={{ id: project.id }}>
            <Settings className="h-3.5 w-3.5" />
            Project settings
          </Link>
        </Button>
      )}
    </div>
  );
}
