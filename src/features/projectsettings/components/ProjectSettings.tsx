import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Save,
  Eye,
  ArrowLeft,
  Palette,
  Type,
  Move,
  Layers,
} from "lucide-react";
import {
  getProjectById,
  updateProject as updateProjectServer,
} from "@/features/projects/api/project.api";
import type { ProjectUpdateFields } from "@/features/projects/schema/project";
import { projectKeys } from "@/features/projects/hooks/useProjects";
import type { ColorScheme } from "../utils/designSystemUtils";
import {
  INITIAL_PROJECT_SETTINGS_STATE,
  buildProjectUpdatePayload,
  extractProjectSettings,
  extractUpdateErrorMessage,
  type ProjectSettingsState,
} from "../utils/projectSettingsState";
import { ProjectPreview } from "./ProjectPreview";
import { ColorsTab } from "./tabs/ColorsTab";
import { TypographyTab } from "./tabs/TypographyTab";
import { SpacingTab } from "./tabs/SpacingTab";
import { EffectsTab } from "./tabs/EffectsTab";

const NORMAL_TRACKING = { letterSpacing: "var(--tracking-normal)" } as const;

const SETTINGS_TABS = [
  { value: "colors", label: "Colors", icon: Palette },
  { value: "typography", label: "Typography", icon: Type },
  { value: "spacing", label: "Spacing", icon: Move },
  { value: "effects", label: "Effects", icon: Layers },
] as const;

export function ProjectSettings() {
  const params = useParams({ strict: false });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const projectId = params.id as string;

  const [state, setState] = useState<ProjectSettingsState>(
    INITIAL_PROJECT_SETTINGS_STATE,
  );

  const { data: project, isLoading } = useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => getProjectById({ data: { projectId } }),
    enabled: !!projectId,
  });

  const updateProjectMutation = useMutation({
    mutationFn: (updatedProject: ProjectUpdateFields & { id: string }) => {
      const { id, ...updates } = updatedProject;
      return updateProjectServer({ data: { projectId: id, updates } });
    },
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(projectKeys.detail(projectId), updatedProject);
      void queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
    },
    onError: (error: unknown) => {
      const message = extractUpdateErrorMessage(error);
      console.error("Update error:", error);
      alert(`Update failed: ${message}`);
    },
  });

  useEffect(() => {
    if (project) {
      setState(extractProjectSettings(project));
    }
  }, [project]);

  const handleColorChange = (key: keyof ColorScheme, value: string): void => {
    setState((prev) => ({
      ...prev,
      selectedColors: { ...prev.selectedColors, [key]: value },
    }));
  };

  const handleSave = (): void => {
    const payload = buildProjectUpdatePayload({
      projectId,
      existingHeader: project?.header,
      state,
    });
    updateProjectMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center mx-auto">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 p-6 bg-card rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/dashboard" })}
              className="flex items-center gap-2 rounded-[var(--radius)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary" style={NORMAL_TRACKING}>
                Project Settings
              </h1>
              <p className="text-muted-foreground text-lg" style={NORMAL_TRACKING}>
                Customize your project appearance and styles
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateProjectMutation.isPending}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-[var(--radius-lg)] shadow-[var(--shadow)]"
          >
            <Save className="w-5 h-5" />
            {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-card shadow-[var(--shadow)] rounded-[var(--radius-lg)] p-1 border border-border">
                {SETTINGS_TABS.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[var(--radius)]"
                    style={NORMAL_TRACKING}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="colors" className="mt-6">
                <ColorsTab
                  selectedColors={state.selectedColors}
                  onColorChange={handleColorChange}
                  onPresetSelect={(colors) =>
                    setState((prev) => ({ ...prev, selectedColors: colors }))
                  }
                />
              </TabsContent>

              <TabsContent value="typography" className="mt-6">
                <TypographyTab
                  fontFamily={state.fontFamily}
                  letterTracking={state.letterTracking}
                  onFontFamilyChange={(fontFamily) =>
                    setState((prev) => ({ ...prev, fontFamily }))
                  }
                  onLetterTrackingChange={(letterTracking) =>
                    setState((prev) => ({ ...prev, letterTracking }))
                  }
                />
              </TabsContent>

              <TabsContent value="spacing" className="mt-6">
                <SpacingTab
                  spacing={state.spacing}
                  onSpacingChange={(spacing) =>
                    setState((prev) => ({ ...prev, spacing }))
                  }
                />
              </TabsContent>

              <TabsContent value="effects" className="mt-6">
                <EffectsTab
                  borderRadius={state.borderRadius}
                  shadowStyle={state.shadowStyle}
                  onBorderRadiusChange={(borderRadius) =>
                    setState((prev) => ({ ...prev, borderRadius }))
                  }
                  onShadowStyleChange={(shadowStyle) =>
                    setState((prev) => ({ ...prev, shadowStyle }))
                  }
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:sticky lg:top-6">
            <Card className="h-fit border-0 shadow-[var(--shadow-2xl)] bg-card overflow-hidden">
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2 text-lg text-foreground"
                  style={NORMAL_TRACKING}
                >
                  <Eye className="w-5 h-5 text-primary" />
                  Live Preview
                </CardTitle>
                <CardDescription className="text-muted-foreground" style={NORMAL_TRACKING}>
                  See how your changes look in real-time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[800px]">
                <div className="h-full w-full">
                  <ProjectPreview
                    projectId={projectId}
                    colors={state.selectedColors}
                    designSystem={{
                      colors: state.selectedColors,
                      fontFamily: state.fontFamily,
                      letterTracking: state.letterTracking,
                      borderRadius: state.borderRadius,
                      spacing: state.spacing,
                      shadowStyle: state.shadowStyle,
                    }}
                    className="h-full w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
