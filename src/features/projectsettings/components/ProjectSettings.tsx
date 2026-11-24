import { useMemo, useState, type ReactElement, type ReactNode } from "react";
import { useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Braces,
  Code2,
  Layers,
  Lock,
  Palette,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Type,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Permission } from "@/features/auth/constants/rbac";
import {
  getProjectById,
  updateProject as updateProjectServer,
} from "@/features/projects/api/project.api";
import { useProjectPermissions } from "@/features/projects/hooks/useProjectPermissions";
import { projectKeys } from "@/features/projects/hooks/useProjects";
import type { ProjectUpdateFields } from "@/features/projects/schema/project";
import { cn } from "@/lib/utils";
import { showErrorToast, showSuccessToast } from "@/utils/errors/errorToast";
import type { ColorScheme } from "../utils/designSystemUtils";
import {
  areProjectSettingsEqual,
  buildProjectUpdatePayload,
  extractProjectSettings,
  extractUpdateErrorMessage,
  INITIAL_PROJECT_SETTINGS_STATE,
  type ProjectSettingsState,
} from "../utils/projectSettingsState";
import { ProjectPreview } from "./ProjectPreview";
import { ColorsTab } from "./tabs/ColorsTab";
import { CustomCssTab } from "./tabs/CustomCssTab";
import { GeneralTab } from "./tabs/GeneralTab";
import { LayoutTab } from "./tabs/LayoutTab";
import { TokensMcpTab } from "./tabs/TokensMcpTab";
import { TypographyTab } from "./tabs/TypographyTab";

const SETTINGS_TABS = [
  { value: "general", label: "General", icon: SlidersHorizontal },
  { value: "colors", label: "Colors", icon: Palette },
  { value: "typography", label: "Type", icon: Type },
  { value: "layout", label: "Layout", icon: Layers },
  { value: "css", label: "CSS", icon: Code2 },
  { value: "tokens", label: "MCP", icon: Braces },
] as const;

function ProjectSettingsSkeleton({
  embedded = false,
}: {
  readonly embedded?: boolean;
}): ReactElement {
  return (
    <div className={cn("bg-background", embedded ? "flex h-full flex-col" : "min-h-screen")}>
      <div className="border-b border-border bg-card px-6 py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[460px] w-full rounded-xl" />
        </div>
        <div className="lg:col-span-7">
          <Skeleton className="h-[560px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export interface ProjectSettingsProps {
  readonly projectId?: string;
  readonly embedded?: boolean;
  readonly mcpConnectPanel?: ReactNode;
  readonly onClose?: () => void;
}

export function ProjectSettings({
  projectId: projectIdProp,
  embedded = false,
  mcpConnectPanel,
  onClose,
}: ProjectSettingsProps = {}): ReactElement {
  const params = useParams({ strict: false });
  const queryClient = useQueryClient();
  const routeProjectId = typeof params.id === "string" ? params.id : "";
  const projectId = projectIdProp ?? routeProjectId;

  const [draft, setDraft] = useState<{
    readonly projectId: string;
    readonly state: ProjectSettingsState;
  } | null>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => getProjectById({ data: { projectId } }),
    enabled: !!projectId,
  });

  const savedState = useMemo<ProjectSettingsState>(
    () => (project ? extractProjectSettings(project) : INITIAL_PROJECT_SETTINGS_STATE),
    [project],
  );

  const state =
    draft !== null && draft.projectId === projectId ? draft.state : savedState;

  const updateState = (
    updater: (prev: ProjectSettingsState) => ProjectSettingsState,
  ): void => {
    setDraft((currentDraft) => {
      const base =
        currentDraft !== null && currentDraft.projectId === projectId
          ? currentDraft.state
          : savedState;
      return { projectId, state: updater(base) };
    });
  };

  const permissions = useProjectPermissions(projectId || null);
  const canEdit = !permissions.isLoading && permissions.canEdit;
  const canPublish = !permissions.isLoading && permissions.canPublish;
  const canManageSubdomain =
    !permissions.isLoading &&
    permissions.hasPermission(Permission.PROJECT_SETTINGS);
  const isReadOnly = !permissions.isLoading && !permissions.canEdit;

  const updateProjectMutation = useMutation({
    mutationFn: (updatedProject: ProjectUpdateFields & { id: string }) => {
      const { id, ...updates } = updatedProject;
      return updateProjectServer({ data: { projectId: id, updates } });
    },
    onSuccess: (updatedProject) => {
      setDraft(null);
      queryClient.setQueryData(projectKeys.detail(projectId), updatedProject);
      void queryClient.invalidateQueries({
        queryKey: projectKeys.userProjects(),
      });
      showSuccessToast("Project settings saved");
    },
    onError: (error: unknown) => {
      const message = extractUpdateErrorMessage(error);
      showErrorToast(message);
    },
  });

  const isDirty = !areProjectSettingsEqual(state, savedState);

  const handleColorChange = (key: keyof ColorScheme, value: string): void => {
    updateState((prev) => ({
      ...prev,
      selectedColors: { ...prev.selectedColors, [key]: value },
    }));
  };

  const handleReset = (): void => {
    setDraft(null);
  };

  const handleSave = (): void => {
    if (!projectId || !canEdit) return;
    if (state.projectName.trim().length === 0) {
      showErrorToast("Project name is required");
      return;
    }

    const payload = buildProjectUpdatePayload({
      projectId,
      existingHeader: project?.header,
      state,
      permissions: {
        canPublish,
        canManageSettings: canManageSubdomain,
      },
    });
    updateProjectMutation.mutate(payload);
  };

  if (isLoading) {
    return <ProjectSettingsSkeleton embedded={embedded} />;
  }

  return (
    <div
      className={cn(
        "w-full bg-background",
        embedded ? "flex h-full min-h-0 flex-col overflow-hidden" : "min-h-screen",
      )}
    >
      <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {onClose && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <ArrowLeft data-icon="inline-start" />
                  Back to Project
                </Button>
                <div className="h-4 w-px bg-border" />
              </>
            )}

            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
                {state.projectName.trim() || "Project Settings"}
              </h1>
              <Badge variant={state.isPublished ? "default" : "secondary"}>
                {state.isPublished ? "Published" : "Draft"}
              </Badge>
              {permissions.role && (
                <Badge variant="outline" className="hidden capitalize sm:inline-flex">
                  {permissions.role}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDirty && (
              <Badge variant="outline" className="hidden text-muted-foreground md:inline-flex">
                Unsaved changes
              </Badge>
            )}

            {isDirty && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={updateProjectMutation.isPending}
                onClick={handleReset}
              >
                <RotateCcw data-icon="inline-start" />
                Reset
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!canEdit || !isDirty || updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Save data-icon="inline-start" />
              )}
              {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>

            {onClose && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                aria-label="Close project settings"
                onClick={onClose}
              >
                <X />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6",
          embedded && "min-h-0 flex-1 overflow-y-auto lg:overflow-hidden",
        )}
      >
        {isReadOnly && (
          <div className="flex shrink-0 items-center gap-2.5 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            <Lock className="size-4 shrink-0" />
            <span>
              You have view-only access to this project. Ask an owner or editor to make changes.
            </span>
          </div>
        )}

        <div
          className={cn(
            "grid grid-cols-1 items-start gap-6 lg:grid-cols-12",
            embedded && "min-h-0 flex-1 lg:items-stretch",
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-4 lg:col-span-5",
              embedded && "min-h-0 lg:h-full lg:overflow-y-auto lg:pr-1",
            )}
          >
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                {SETTINGS_TABS.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="gap-1.5 px-2 text-xs"
                  >
                    <Icon />
                    <span className="hidden sm:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="general" className="mt-4">
                <GeneralTab
                  projectName={state.projectName}
                  projectDescription={state.projectDescription}
                  isPublished={state.isPublished}
                  subdomain={state.subdomain}
                  canEdit={canEdit}
                  canPublish={canPublish}
                  canManageSubdomain={canManageSubdomain}
                  onProjectNameChange={(projectName) =>
                    updateState((prev) => ({ ...prev, projectName }))
                  }
                  onProjectDescriptionChange={(projectDescription) =>
                    updateState((prev) => ({ ...prev, projectDescription }))
                  }
                  onPublishedChange={(isPublished) =>
                    updateState((prev) => ({ ...prev, isPublished }))
                  }
                  onSubdomainChange={(subdomain) =>
                    updateState((prev) => ({ ...prev, subdomain }))
                  }
                />
              </TabsContent>

              <TabsContent value="colors" className="mt-4">
                <ColorsTab
                  selectedColors={state.selectedColors}
                  disabled={!canEdit}
                  onColorChange={handleColorChange}
                  onPresetSelect={(colors) =>
                    updateState((prev) => ({ ...prev, selectedColors: colors }))
                  }
                />
              </TabsContent>

              <TabsContent value="typography" className="mt-4">
                <TypographyTab
                  fontFamily={state.fontFamily}
                  letterTracking={state.letterTracking}
                  disabled={!canEdit}
                  onFontFamilyChange={(fontFamily) =>
                    updateState((prev) => ({ ...prev, fontFamily }))
                  }
                  onLetterTrackingChange={(letterTracking) =>
                    updateState((prev) => ({ ...prev, letterTracking }))
                  }
                />
              </TabsContent>

              <TabsContent value="layout" className="mt-4">
                <LayoutTab
                  spacing={state.spacing}
                  borderRadius={state.borderRadius}
                  shadowStyle={state.shadowStyle}
                  disabled={!canEdit}
                  onSpacingChange={(spacing) =>
                    updateState((prev) => ({ ...prev, spacing }))
                  }
                  onBorderRadiusChange={(borderRadius) =>
                    updateState((prev) => ({ ...prev, borderRadius }))
                  }
                  onShadowStyleChange={(shadowStyle) =>
                    updateState((prev) => ({ ...prev, shadowStyle }))
                  }
                />
              </TabsContent>

              <TabsContent value="css" className="mt-4">
                <CustomCssTab
                  customCSS={state.customCSS}
                  disabled={!canEdit}
                  onCustomCSSChange={(customCSS) =>
                    updateState((prev) => ({ ...prev, customCSS }))
                  }
                />
              </TabsContent>

              <TabsContent value="tokens" className="mt-4">
                <TokensMcpTab
                  projectId={projectId}
                  state={state}
                  disabled={!canEdit}
                  mcpConnectPanel={mcpConnectPanel}
                  onApplyThemeTokens={(tokens) =>
                    updateState((prev) => ({
                      ...prev,
                      selectedColors: tokens.colors,
                      fontFamily: tokens.fontFamily,
                      letterTracking: tokens.letterTracking,
                      borderRadius: tokens.borderRadius,
                      spacing: tokens.spacing,
                      shadowStyle: tokens.shadowStyle,
                    }))
                  }
                />
              </TabsContent>
            </Tabs>
          </div>

          <div
            className={cn(
              "lg:col-span-7",
              embedded ? "min-h-[520px] lg:h-full" : "lg:sticky lg:top-20",
            )}
          >
            <ProjectPreview
              projectId={projectId}
              colors={state.selectedColors}
              customCSS={state.customCSS}
              designSystem={{
                colors: state.selectedColors,
                fontFamily: state.fontFamily,
                letterTracking: state.letterTracking,
                borderRadius: state.borderRadius,
                spacing: state.spacing,
                shadowStyle: state.shadowStyle,
              }}
              className={embedded ? "h-full w-full" : "h-[720px] w-full"}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
