import { useCallback, useEffect, useState } from "react";
import { ExternalLink, HelpCircle, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import { PageNavigationCommand } from "../editor/PageNavigationCommand";
import ProjectBreadcrumb from "../editor/header/ProjectBreadcrumb";
import ViewportControls from "../editor/header/ViewportControls";
import EventModeToggle from "../editor/EventModeToggle";
import CollaboratorIndicator from "../editor/CollaboratorIndicator";
import CollaborationButton from "../editor/CollaborationButton";
import ModeSwitch from "./ModeSwitch";
import CommentsToggle from "./CommentsToggle";
import { useCurrentPage, useProject } from "@/features/projects/hooks/useProjects";
import { useDynamicPagePreview } from "@/features/editor/hooks/useDynamicPagePreview";
import { buildPublicSiteUrl } from "@webbuilder/site-runtime/routing";
import { createPreviewLaunchUrl } from "@/features/preview/api/preview-ticket.api";
import { errorMessage } from "@webbuilder/site-runtime/api-error";
import PublishButton from "./PublishButton";

interface EditorTopBarProps {
  projectId: string;
  onShowShortcuts: () => void;
}

export default function EditorTopBar({
  projectId,
  onShowShortcuts,
}: EditorTopBarProps) {
  const { editor } = useEditorContext();
  const currentPage = useCurrentPage();
  const { previewPath } = useDynamicPagePreview();
  const { data: project } = useProject(projectId);
  const isMaster = currentPage?.Type === "cp";
  const liveSiteUrl =
    project?.published && project.subdomain
      ? buildPublicSiteUrl(project.subdomain, previewPath)
      : null;
  const [navOpen, setNavOpen] = useState(false);
  const [openingPreview, setOpeningPreview] = useState(false);

  const handleOpenPreview = useCallback(async (): Promise<void> => {
    if (openingPreview) return;
    setOpeningPreview(true);
    const previewTab = window.open("about:blank", "_blank");
    try {
      const { url } = await createPreviewLaunchUrl({
        data: { projectId, path: previewPath },
      });
      if (previewTab && !previewTab.closed) {
        previewTab.opener = null;
        previewTab.location.replace(url);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (error: unknown) {
      if (previewTab && !previewTab.closed) {
        previewTab.close();
      }
      toast.error(errorMessage(error, "Unable to open preview."));
    } finally {
      setOpeningPreview(false);
    }
  }, [openingPreview, previewPath, projectId]);

  // Cmd/Ctrl+K opens page navigation.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setNavOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="relative z-40 flex h-11 shrink-0 items-center gap-3 border-b border-border bg-card px-3">
      <div className="flex min-w-0 flex-1 items-center">
        <ProjectBreadcrumb onNavigate={() => setNavOpen(true)} />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ModeSwitch />
        <ViewportControls
          currentView={editor.currentView}
          setCurrentView={editor.setCurrentView}
        />
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
        <EventModeToggle />
        <CommentsToggle />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Keyboard shortcuts"
              onClick={onShowShortcuts}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Shortcuts <kbd className="ml-1 font-mono text-[10px] opacity-60">?</kbd>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-4" />

        <CollaboratorIndicator projectId={projectId} />
        <CollaborationButton projectId={projectId} />
        {!isMaster && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={openingPreview}
            onClick={() => void handleOpenPreview()}
            className="h-7 gap-1.5 px-2.5 text-xs font-medium"
          >
            {openingPreview ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            Preview
          </Button>
        )}
        {!isMaster && liveSiteUrl && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <a href={liveSiteUrl} target="_blank" rel="noreferrer">
              Live
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}
        <PublishButton projectId={projectId} />
      </div>

      <PageNavigationCommand open={navOpen} setOpen={setNavOpen} />
    </header>
  );
}
