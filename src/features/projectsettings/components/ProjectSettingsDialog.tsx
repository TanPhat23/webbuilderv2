import type { ReactElement, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectSettings } from "./ProjectSettings";

interface ProjectSettingsDialogProps {
  readonly projectId: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly mcpConnectPanel?: ReactNode;
}

export function ProjectSettingsDialog({
  projectId,
  open,
  onOpenChange,
  mcpConnectPanel,
}: ProjectSettingsDialogProps): ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[90vh] max-h-[900px] w-[95vw] max-w-7xl flex-col gap-0 overflow-hidden p-0 sm:max-w-7xl"
      >
        <DialogTitle className="sr-only">Project Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize project identity, theme design system, publishing, custom CSS, and MCP integration.
        </DialogDescription>
        {open && projectId && (
          <ProjectSettings
            projectId={projectId}
            embedded
            mcpConnectPanel={mcpConnectPanel}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
