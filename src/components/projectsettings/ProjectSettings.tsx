"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import {
  Code2,
  Save,
  Eye,
  ArrowLeft,
  Palette,
  Type,
  Move,
  Layers,
  Sparkles,
} from "lucide-react";
import { Project } from "@/interfaces/project.interface";
import { projectService } from "@/services/project";
import ProjectPreview from "./ProjectPreview";
import ColorInput from "./ColorInput";
import {
  generateShadowVars,
  generateDesignSystemCSS,
  generateColorsCSS,
} from "../../lib/utils/projectsettings/designSystemUtils";
import { useProjectStore } from "@/globalstore/project-store";

interface ColorScheme {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  destructive: string;
  destructiveForeground: string;
}

const PRESET_COLORS = [
  {
    name: "Blue Ocean",
    colors: {
      primary: "#3b82f6",
      primaryForeground: "#ffffff",
      secondary: "#e0e7ff",
      secondaryForeground: "#1e3a8a",
      accent: "#1e40af",
      accentForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#f8fafc",
      cardForeground: "#0f172a",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      border: "#e2e8f0",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
    },
  },
  {
    name: "Green Forest",
    colors: {
      primary: "#10b981",
      primaryForeground: "#ffffff",
      secondary: "#d1fae5",
      secondaryForeground: "#065f46",
      accent: "#047857",
      accentForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#f0fdf4",
      cardForeground: "#0f172a",
      muted: "#dcfce7",
      mutedForeground: "#166534",
      border: "#bbf7d0",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
    },
  },
  {
    name: "Purple Magic",
    colors: {
      primary: "#8b5cf6",
      primaryForeground: "#ffffff",
      secondary: "#ede9fe",
      secondaryForeground: "#5b21b6",
      accent: "#5b21b6",
      accentForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#faf5ff",
      cardForeground: "#0f172a",
      muted: "#f3e8ff",
      mutedForeground: "#7c3aed",
      border: "#e9d5ff",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
    },
  },
  {
    name: "Orange Sunset",
    colors: {
      primary: "#f59e0b",
      primaryForeground: "#ffffff",
      secondary: "#fef3c7",
      secondaryForeground: "#92400e",
      accent: "#d97706",
      accentForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#fffbeb",
      cardForeground: "#0f172a",
      muted: "#fef3c7",
      mutedForeground: "#b45309",
      border: "#fde68a",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
    },
  },
  {
    name: "Red Passion",
    colors: {
      primary: "#ef4444",
      primaryForeground: "#ffffff",
      secondary: "#fee2e2",
      secondaryForeground: "#991b1b",
      accent: "#dc2626",
      accentForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#fef2f2",
      cardForeground: "#0f172a",
      muted: "#fecaca",
      mutedForeground: "#b91c1c",
      border: "#fca5a5",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
    },
  },
  {
    name: "Pink Rose",
    colors: {
      primary: "#ec4899",
      primaryForeground: "#ffffff",
      secondary: "#fce7f3",
      secondaryForeground: "#9f1239",
      accent: "#be185d",
      accentForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#fdf2f8",
      cardForeground: "#0f172a",
      muted: "#fbcfe8",
      mutedForeground: "#db2777",
      border: "#f9a8d4",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
    },
  },
];

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter (Sans)" },
  { value: "Lora", label: "Lora (Serif)" },
  { value: "JetBrains Mono", label: "JetBrains Mono (Mono)" },
];

const SHADOW_OPTIONS = [
  {
    value: "sm",
    label: "Small",
    shadow: "0px 1px 2px 0px hsl(0 0% 0% / 0.05)",
  },
  {
    value: "md",
    label: "Medium",
    shadow:
      "0px 2px 4px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1)",
  },
  {
    value: "lg",
    label: "Large",
    shadow:
      "0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1)",
  },
  {
    value: "xl",
    label: "Extra Large",
    shadow:
      "0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1)",
  },
  {
    value: "2xl",
    label: "2X Large",
    shadow: "0px 25px 50px -12px hsl(0 0% 0% / 0.25)",
  },
];

export default function ProjectSettings() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { updateProject } = useProjectStore();
  const projectId = params.id as string;

  const [customCSS, setCustomCSS] = useState("");
  const [selectedColors, setSelectedColors] = useState<ColorScheme>({
    primary: "#3b82f6",
    primaryForeground: "#ffffff",
    secondary: "#e0e7ff",
    secondaryForeground: "#1e3a8a",
    accent: "#1e40af",
    accentForeground: "#ffffff",
    background: "#ffffff",
    foreground: "#0f172a",
    card: "#f8fafc",
    cardForeground: "#0f172a",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    border: "#e2e8f0",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
  });
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [subdomain, setSubdomain] = useState("");

  // Design System State
  const [fontFamily, setFontFamily] = useState("Inter");
  const [letterTracking, setLetterTracking] = useState(0);
  const [borderRadius, setBorderRadius] = useState(8);
  const [spacing, setSpacing] = useState(4);
  const [shadowStyle, setShadowStyle] = useState("md");

  const colorFields = [
    {
      key: "primary",
      label: "Primary",
      bgClass: "bg-primary",
      placeholder: "#3b82f6",
    },
    {
      key: "primaryForeground",
      label: "Primary FG",
      bgClass: "",
      placeholder: "#ffffff",
    },
    {
      key: "secondary",
      label: "Secondary",
      bgClass: "bg-secondary",
      placeholder: "#e0e7ff",
    },
    {
      key: "secondaryForeground",
      label: "Secondary FG",
      bgClass: "",
      placeholder: "#1e3a8a",
    },
    {
      key: "accent",
      label: "Accent",
      bgClass: "bg-accent",
      placeholder: "#1e40af",
    },
    {
      key: "accentForeground",
      label: "Accent FG",
      bgClass: "",
      placeholder: "#ffffff",
    },
    {
      key: "background",
      label: "Background",
      bgClass: "",
      placeholder: "#ffffff",
    },
    {
      key: "foreground",
      label: "Foreground",
      bgClass: "",
      placeholder: "#0f172a",
    },
    { key: "card", label: "Card", bgClass: "", placeholder: "#f8fafc" },
    {
      key: "cardForeground",
      label: "Card FG",
      bgClass: "",
      placeholder: "#0f172a",
    },
    { key: "muted", label: "Muted", bgClass: "", placeholder: "#f1f5f9" },
    {
      key: "mutedForeground",
      label: "Muted FG",
      bgClass: "",
      placeholder: "#64748b",
    },
    { key: "border", label: "Border", bgClass: "", placeholder: "#e2e8f0" },
    {
      key: "destructive",
      label: "Destructive",
      bgClass: "",
      placeholder: "#ef4444",
    },
    {
      key: "destructiveForeground",
      label: "Destructive FG",
      bgClass: "",
      placeholder: "#ffffff",
    },
  ];

  const {
    data: project,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getProjectById(projectId),
    enabled: !!projectId,
  });

  const updateProjectMutation = useMutation({
    mutationFn: (updatedProject: Partial<Project> & { id: string }) => {
      const { id, createdAt, updatedAt, deletedAt, ownerId, ...body } =
        updatedProject;
      return projectService.updateProjectPartial(id, body as Partial<Project>);
    },
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(["project", projectId], updatedProject);
      updateProject(updatedProject);
      console.log("Project updated successfully!");
    },
    onError: (error: unknown) => {
      let message = "Failed to update project";
      try {
        if (error && typeof error === "object" && (error as any).message) {
          message = String((error as any).message);
          const jsonMatch = message.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            message =
              parsed.errorMessage || parsed.message || JSON.stringify(parsed);
          }
        }
      } catch {}

      console.error("Update error:", error);
      console.error("Server message:", message);

      alert(`Update failed: ${message}`);
    },
  });

  useEffect(() => {
    if (project) {
      setProjectName(project.name || "");
      setProjectDescription(project.description || "");
      setIsPublished(project.published || false);
      setSubdomain(project.subdomain || "");
      if (project.header?.cssStyles) {
        setCustomCSS(project.header.cssStyles || "");
      }
      if (project.styles && typeof project.styles === "object") {
        const styles = project.styles as Record<string, unknown>;
        setSelectedColors({
          primary: (styles.primary as string) || "#3b82f6",
          primaryForeground: (styles.primaryForeground as string) || "#ffffff",
          secondary: (styles.secondary as string) || "#e0e7ff",
          secondaryForeground:
            (styles.secondaryForeground as string) || "#1e3a8a",
          accent: (styles.accent as string) || "#1e40af",
          accentForeground: (styles.accentForeground as string) || "#ffffff",
          background: (styles.background as string) || "#ffffff",
          foreground: (styles.foreground as string) || "#0f172a",
          card: (styles.card as string) || "#f8fafc",
          cardForeground: (styles.cardForeground as string) || "#0f172a",
          muted: (styles.muted as string) || "#f1f5f9",
          mutedForeground: (styles.mutedForeground as string) || "#64748b",
          border: (styles.border as string) || "#e2e8f0",
          destructive: (styles.destructive as string) || "#ef4444",
          destructiveForeground:
            (styles.destructiveForeground as string) || "#ffffff",
        });
        // Load design system values
        setFontFamily((styles.fontFamily as string) || "Inter");
        setLetterTracking((styles.letterTracking as number) || 0);
        setBorderRadius((styles.borderRadius as number) || 8);
        setSpacing((styles.spacing as number) || 4);
        setShadowStyle((styles.shadowStyle as string) || "md");
      }
    }
  }, [project]);

  const handleColorPresetSelect = (colors: ColorScheme) => {
    setSelectedColors(colors);
  };

  const handleSave = () => {
    const colorCSS = generateColorsCSS(selectedColors);
    const designSystemCSS = generateDesignSystemCSS({
      fontFamily,
      letterTracking,
      borderRadius,
      spacing,
      shadowStyle,
    });
    const combinedCSS =
      customCSS +
      "\n\n/* Auto-generated Design System */\n" +
      designSystemCSS +
      "\n\n/* Auto-generated Color Scheme */\n" +
      colorCSS;

    const updatedProject = {
      id: projectId,
      name: projectName,
      description: projectDescription,
      published: isPublished,
      subdomain,
      header: {
        ...project?.header,
        cssStyles: combinedCSS,
      },
      styles: {
        ...selectedColors,
        fontFamily,
        borderRadius,
        spacing,
        letterTracking,
        shadowStyle,
      } as unknown as Record<string, unknown>,
    };
    updateProjectMutation.mutate(updatedProject);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center mx-auto">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
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
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-[var(--radius)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1
                className="text-3xl font-bold text-primary"
                style={{ letterSpacing: "var(--tracking-normal)" }}
              >
                Project Settings
              </h1>
              <p
                className="text-muted-foreground text-lg"
                style={{ letterSpacing: "var(--tracking-normal)" }}
              >
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
                <TabsTrigger
                  value="colors"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[var(--radius)]"
                  style={{ letterSpacing: "var(--tracking-normal)" }}
                >
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">Colors</span>
                </TabsTrigger>
                <TabsTrigger
                  value="typography"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[var(--radius)]"
                  style={{ letterSpacing: "var(--tracking-normal)" }}
                >
                  <Type className="w-4 h-4" />
                  <span className="hidden sm:inline">Typography</span>
                </TabsTrigger>
                <TabsTrigger
                  value="spacing"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[var(--radius)]"
                  style={{ letterSpacing: "var(--tracking-normal)" }}
                >
                  <Move className="w-4 h-4" />
                  <span className="hidden sm:inline">Spacing</span>
                </TabsTrigger>
                <TabsTrigger
                  value="effects"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[var(--radius)]"
                  style={{ letterSpacing: "var(--tracking-normal)" }}
                >
                  <Layers className="w-4 h-4" />
                  <span className="hidden sm:inline">Effects</span>
                </TabsTrigger>
              </TabsList>

              {/* Colors Tab */}
              <TabsContent value="colors" className="mt-6">
                <Card className="border-0 shadow-[var(--shadow-lg)] bg-card">
                  <CardHeader className="rounded-t-[var(--radius-lg)]">
                    <CardTitle
                      className="flex items-center gap-2 text-lg text-foreground"
                      style={{ letterSpacing: "var(--tracking-normal)" }}
                    >
                      <Palette className="w-5 h-5 text-primary" />
                      Color Scheme
                    </CardTitle>
                    <CardDescription
                      className="text-muted-foreground"
                      style={{ letterSpacing: "var(--tracking-normal)" }}
                    >
                      Choose colors for your project theme
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Custom Color Inputs */}
                    <div className="space-y-4">
                      <Label
                        className="text-base font-semibold text-foreground"
                        style={{ letterSpacing: "var(--tracking-normal)" }}
                      >
                        Custom Colors
                      </Label>
                      <div className="p-6 rounded-[var(--radius-lg)] border-2 border-border bg-muted/50">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {colorFields.map((field) => (
                            <ColorInput
                              key={field.key}
                              label={field.label}
                              value={
                                selectedColors[field.key as keyof ColorScheme]
                              }
                              onChange={(value) =>
                                setSelectedColors((prev) => ({
                                  ...prev,
                                  [field.key]: value,
                                }))
                              }
                              placeholder={field.placeholder}
                              bgClass={field.bgClass}
                              id={`${field.key}-color`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Preset Colors */}
                    <div>
                      <Label
                        className="text-base font-semibold text-foreground"
                        style={{ letterSpacing: "var(--tracking-normal)" }}
                      >
                        🎨 Preset Colors
                      </Label>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        {PRESET_COLORS.map((preset, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              handleColorPresetSelect(preset.colors)
                            }
                            className="p-4 rounded-[var(--radius-lg)] border-2 border-border bg-card"
                          >
                            <div className="flex justify-center gap-2 mb-3">
                              <div
                                className="w-6 h-6 rounded-full border-2 border-white shadow-[var(--shadow)]"
                                style={{
                                  backgroundColor: preset.colors.primary,
                                  boxShadow: `0 4px 16px ${preset.colors.primary}40`,
                                }}
                              />
                              <div
                                className="w-6 h-6 rounded-full border-2 border-white shadow-[var(--shadow)]"
                                style={{
                                  backgroundColor: preset.colors.secondary,
                                  boxShadow: `0 4px 16px ${preset.colors.secondary}40`,
                                }}
                              />
                              <div
                                className="w-6 h-6 rounded-full border-2 border-white shadow-[var(--shadow)]"
                                style={{
                                  backgroundColor: preset.colors.accent,
                                  boxShadow: `0 4px 16px ${preset.colors.accent}40`,
                                }}
                              />
                            </div>
                            <p
                              className="text-sm font-bold"
                              style={{
                                letterSpacing: "var(--tracking-normal)",
                              }}
                            >
                              {preset.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="mt-6">
                <Card className="border-0 shadow-[var(--shadow-lg)] bg-card">
                  <CardHeader className="rounded-t-[var(--radius-lg)]">
                    <CardTitle
                      className="flex items-center gap-2 text-lg text-foreground"
                      style={{ letterSpacing: "var(--tracking-normal)" }}
                    >
                      <Type className="w-5 h-5 text-primary" />
                      Typography
                    </CardTitle>
                    <CardDescription
                      className="text-muted-foreground"
                      style={{ letterSpacing: "var(--tracking-normal)" }}
                    >
                      Configure fonts and text spacing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Font Family */}
                    <div className="space-y-3">
                      <Label
                        className="text-base font-semibold text-foreground"
                        style={{ letterSpacing: "var(--tracking-normal)" }}
                      >
                        Font Family
                      </Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger className="w-full bg-card border-2 border-border focus:border-primary rounded-[var(--radius)]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              <span style={{ fontFamily: font.value }}>
                                {font.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border">
                        <p
                          style={{
                            fontFamily,
                            letterSpacing: "var(--tracking-normal)",
                          }}
                          className="text-2xl font-semibold text-foreground"
                        >
                          The quick brown fox jumps over the lazy dog
                        </p>
                        <p
                          style={{
                            fontFamily,
                            letterSpacing: "var(--tracking-normal)",
                          }}
                          className="text-sm text-muted-foreground mt-2"
                        >
                          Preview of {fontFamily} font family
                        </p>
                      </div>
                    </div>

                    {/* Letter Spacing */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label
                          className="text-base font-semibold text-foreground"
                          style={{ letterSpacing: "var(--tracking-normal)" }}
                        >
                          Letter Spacing
                        </Label>
                        <span
                          className="text-sm font-mono bg-muted px-3 py-1 rounded-[var(--radius)]"
                          style={{ letterSpacing: "var(--tracking-normal)" }}
                        >
                          {letterTracking.toFixed(3)}em
                        </span>
                      </div>
                      <Slider
                        value={[letterTracking]}
                        onValueChange={([val]) => setLetterTracking(val)}
                        min={-0.05}
                        max={0.1}
                        step={0.005}
                        className="w-full"
                      />
                      <div className="p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border">
                        <p
                          style={{
                            letterSpacing: `${letterTracking}em`,
                            fontFamily,
                          }}
                          className="text-lg text-foreground"
                        >
                          Adjusted letter spacing example text
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Spacing Tab */}
              <TabsContent value="spacing" className="mt-6">
                <Card className="border-0 shadow-[var(--shadow-lg)] bg-card">
                  <CardHeader className="rounded-t-[var(--radius-lg)]">
                    <CardTitle
                      className="flex items-center gap-2 text-lg text-foreground"
                      style={{ letterSpacing: "var(--tracking-normal)" }}
                    >
                      <Move className="w-5 h-5 text-primary" />
                      Spacing System
                    </CardTitle>
                    <CardDescription
                      className="text-muted-foreground"
                      style={{ letterSpacing: "var(--tracking-normal)" }}
                    >
                      Define your base spacing unit
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label
                          className="text-base font-semibold text-foreground"
                          style={{ letterSpacing: "var(--tracking-normal)" }}
                        >
                          Base Spacing Unit
                        </Label>
                        <span
                          className="text-sm font-mono bg-muted px-3 py-1 rounded-[var(--radius)]"
                          style={{ letterSpacing: "var(--tracking-normal)" }}
                        >
                          {spacing}px
                        </span>
                      </div>
                      <Slider
                        value={[spacing]}
                        onValueChange={([val]) => setSpacing(val)}
                        min={2}
                        max={16}
                        step={1}
                        className="w-full"
                      />
                      <div className="p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border">
                        <Label
                          className="text-sm font-semibold text-foreground mb-3 block"
                          style={{ letterSpacing: "var(--tracking-normal)" }}
                        >
                          Spacing Scale Preview
                        </Label>
                        <div className="flex items-end gap-2">
                          <div className="text-center">
                            <div
                              style={{
                                width: spacing * 1 + "px",
                                height: spacing * 1 + "px",
                              }}
                              className="bg-primary rounded mx-auto mb-1"
                            />
                            <span className="text-xs font-mono text-muted-foreground">
                              1x
                            </span>
                          </div>
                          <div className="text-center">
                            <div
                              style={{
                                width: spacing * 2 + "px",
                                height: spacing * 2 + "px",
                              }}
                              className="bg-primary rounded mx-auto mb-1"
                            />
                            <span className="text-xs font-mono text-muted-foreground">
                              2x
                            </span>
                          </div>
                          <div className="text-center">
                            <div
                              style={{
                                width: spacing * 4 + "px",
                                height: spacing * 4 + "px",
                              }}
                              className="bg-primary rounded mx-auto mb-1"
                            />
                            <span className="text-xs font-mono text-muted-foreground">
                              4x
                            </span>
                          </div>
                          <div className="text-center">
                            <div
                              style={{
                                width: spacing * 8 + "px",
                                height: spacing * 8 + "px",
                              }}
                              className="bg-primary rounded mx-auto mb-1"
                            />
                            <span className="text-xs font-mono text-muted-foreground">
                              8x
                            </span>
                          </div>
                          <div className="text-center">
                            <div
                              style={{
                                width: spacing * 12 + "px",
                                height: spacing * 12 + "px",
                              }}
                              className="bg-primary rounded mx-auto mb-1"
                            />
                            <span className="text-xs font-mono text-muted-foreground">
                              12x
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Effects Tab */}
              <TabsContent value="effects" className="mt-6">
                <Card className="border-0 shadow-[var(--shadow-lg)] bg-card">
                  <CardHeader className="rounded-t-[var(--radius-lg)]">
                    <CardTitle
                      className="flex items-center gap-2 text-lg text-foreground"
                      style={{ letterSpacing: "var(--tracking-normal)" }}
                    >
                      <Layers className="w-5 h-5 text-primary" />
                      Effects & Borders
                    </CardTitle>
                    <CardDescription
                      className="text-muted-foreground"
                      style={{ letterSpacing: "var(--tracking-normal)" }}
                    >
                      Configure shadows and border radius
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Border Radius */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label
                          className="text-base font-semibold text-foreground"
                          style={{ letterSpacing: "var(--tracking-normal)" }}
                        >
                          Border Radius
                        </Label>
                        <span
                          className="text-sm font-mono bg-muted px-3 py-1 rounded-[var(--radius)]"
                          style={{ letterSpacing: "var(--tracking-normal)" }}
                        >
                          {borderRadius}px
                        </span>
                      </div>
                      <Slider
                        value={[borderRadius]}
                        onValueChange={([val]) => setBorderRadius(val)}
                        min={0}
                        max={24}
                        step={1}
                        className="w-full"
                      />
                      <div className="p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border">
                        <Label
                          className="text-sm font-semibold text-foreground mb-3 block"
                          style={{ letterSpacing: "var(--tracking-normal)" }}
                        >
                          Radius Scale Preview
                        </Label>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="text-center">
                            <div
                              className="h-16 bg-primary"
                              style={{
                                borderRadius:
                                  Math.max(0, borderRadius - 4) + "px",
                              }}
                            >
                              <p
                                className="text-xs text-primary-foreground p-2 font-bold"
                                style={{
                                  letterSpacing: "var(--tracking-normal)",
                                }}
                              >
                                SM
                              </p>
                            </div>
                            <span className="text-xs font-mono mt-1 block text-muted-foreground">
                              {Math.max(0, borderRadius - 4)}px
                            </span>
                          </div>
                          <div className="text-center">
                            <div
                              className="h-16 bg-primary"
                              style={{
                                borderRadius:
                                  Math.max(0, borderRadius - 2) + "px",
                              }}
                            >
                              <p
                                className="text-xs text-primary-foreground p-2 font-bold"
                                style={{
                                  letterSpacing: "var(--tracking-normal)",
                                }}
                              >
                                MD
                              </p>
                            </div>
                            <span className="text-xs font-mono mt-1 block text-muted-foreground">
                              {Math.max(0, borderRadius - 2)}px
                            </span>
                          </div>
                          <div className="text-center">
                            <div
                              className="h-16 bg-primary"
                              style={{ borderRadius: borderRadius + "px" }}
                            >
                              <p
                                className="text-xs text-primary-foreground p-2 font-bold"
                                style={{
                                  letterSpacing: "var(--tracking-normal)",
                                }}
                              >
                                LG
                              </p>
                            </div>
                            <span className="text-xs font-mono mt-1 block text-muted-foreground">
                              {borderRadius}px
                            </span>
                          </div>
                          <div className="text-center">
                            <div
                              className="h-16 bg-primary"
                              style={{ borderRadius: borderRadius + 4 + "px" }}
                            >
                              <p
                                className="text-xs text-primary-foreground p-2 font-bold"
                                style={{
                                  letterSpacing: "var(--tracking-normal)",
                                }}
                              >
                                XL
                              </p>
                            </div>
                            <span className="text-xs font-mono mt-1 block text-muted-foreground">
                              {borderRadius + 4}px
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shadow Style */}
                    <div className="space-y-3">
                      <Label
                        className="text-base font-semibold text-foreground"
                        style={{ letterSpacing: "var(--tracking-normal)" }}
                      >
                        Shadow Style
                      </Label>
                      <Select
                        value={shadowStyle}
                        onValueChange={setShadowStyle}
                      >
                        <SelectTrigger className="w-full bg-card border-2 border-border focus:border-primary rounded-[var(--radius)]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SHADOW_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border">
                        <Label
                          className="text-sm font-semibold text-foreground mb-3 block"
                          style={{ letterSpacing: "var(--tracking-normal)" }}
                        >
                          Shadow Preview
                        </Label>
                        <div className="grid grid-cols-3 gap-4">
                          {SHADOW_OPTIONS.slice(0, 3).map((opt) => (
                            <div
                              key={opt.value}
                              className="h-20 bg-card rounded-[var(--radius-lg)] flex items-center justify-center"
                              style={{ boxShadow: opt.shadow }}
                            >
                              <span
                                className="text-sm font-medium text-foreground"
                                style={{
                                  letterSpacing: "var(--tracking-normal)",
                                }}
                              >
                                {opt.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:sticky lg:top-6">
            <Card className="h-fit border-0 shadow-[var(--shadow-2xl)] bg-card overflow-hidden">
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2 text-lg text-foreground"
                  style={{ letterSpacing: "var(--tracking-normal)" }}
                >
                  <Eye className="w-5 h-5 text-primary" />
                  Live Preview
                </CardTitle>
                <CardDescription
                  className="text-muted-foreground"
                  style={{ letterSpacing: "var(--tracking-normal)" }}
                >
                  See how your changes look in real-time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[800px]">
                <div className="h-full w-full">
                  <ProjectPreview
                    projectId={projectId}
                    colors={selectedColors}
                    designSystem={{
                      colors: selectedColors,
                      fontFamily,
                      letterTracking,
                      borderRadius,
                      spacing,
                      shadowStyle,
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
