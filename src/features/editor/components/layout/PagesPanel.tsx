import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FileText, Database, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectPages } from "@/features/projects/hooks/useProjects";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import { cn } from "@/lib/utils";
import { useEditorContext } from "@/providers/editorprovider";
import {
  CreatePageDialog,
  DeletePageDialog,
  useDeletePage,
} from "../ProjectPageCommand";
import PanelIntro from "./PanelIntro";

export default function PagesPanel() {
  const { projectId, pageId } = useEditorContext();
  const { data: pages = [], isLoading } = useProjectPages(projectId);
  const permissions = useEditorPermissions(projectId);
  const deletePage = useDeletePage(projectId ?? undefined, pages);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = q ? pages.filter((p) => p.Name.toLowerCase().includes(q)) : pages;

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages"
            aria-label="Search pages"
            className="h-7 w-full rounded-md bg-muted/50 pl-7 pr-2 text-xs outline-none placeholder:text-muted-foreground focus:bg-muted focus:ring-1 focus:ring-ring"
          />
        </div>
        {permissions.canCreatePages && (
          <CreatePageDialog
            trigger={
              <Button variant="outline" size="icon" className="h-7 w-7" aria-label="New page">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            }
          />
        )}
      </div>

      {isLoading ? (
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-7 animate-pulse rounded-md bg-muted/50" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <PanelIntro icon={FileText} title="No pages" description="Create a page to start building." />
      ) : visible.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">No pages match “{query}”.</p>
      ) : (
        <ul className="space-y-0.5">
          {visible.map((page) => {
            const current = page.Id === pageId;
            const Icon = page.Type === "dp" ? Database : FileText;
            return (
              <li key={page.Id} className="group relative">
                <button
                  type="button"
                  aria-current={current ? "page" : undefined}
                  onClick={() => {
                    if (!current && projectId) {
                      navigate({ to: `/editor/${projectId}?page=${page.Id}` });
                    }
                  }}
                  className={cn(
                    "flex h-8 w-full items-center gap-2 rounded-md px-2 pr-8 text-left text-xs text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground",
                    current && "bg-accent text-foreground font-medium",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{page.Name}</span>
                  {page.Type === "dp" && (
                    <span className="ml-auto shrink-0 rounded bg-muted px-1 text-[9px] uppercase tracking-wide text-muted-foreground">
                      CMS
                    </span>
                  )}
                </button>
                {permissions.canDeletePages && pages.length > 1 && (
                  <DeletePageDialog
                    page={page}
                    onDelete={deletePage}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${page.Name}`}
                        className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground opacity-0 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    }
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
