"use client";

import React, { ChangeEvent, useState, useRef } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import { imageService } from "@/services/image";
import { toast } from "sonner";
import { ConfigField, ConfigSection, SectionDivider } from "./_shared";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  Upload,
  Link2,
  Loader2,
  Type,
  Maximize2,
  Zap,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileImage,
  X,
} from "lucide-react";

/* ─── Types ─── */

interface ObjectFitOption {
  value: string;
  label: string;
  description: string;
}

const OBJECT_FIT_OPTIONS: ObjectFitOption[] = [
  { value: "cover", label: "Cover", description: "Fill and crop to fit" },
  {
    value: "contain",
    label: "Contain",
    description: "Fit inside, may letterbox",
  },
  { value: "fill", label: "Fill", description: "Stretch to fill" },
  { value: "none", label: "None", description: "Original size" },
  {
    value: "scale-down",
    label: "Scale Down",
    description: "Smaller of none or contain",
  },
];

/* ─── Main Component ─── */

export const ImageConfiguration = () => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!selectedElement || selectedElement.type !== "Image") {
    return null;
  }

  const src = selectedElement.src ?? "";
  const alt = selectedElement.name ?? "";
  const objectFit = selectedElement.settings?.objectFit ?? "cover";
  const loading = selectedElement.settings?.loading ?? "lazy";
  const decoding = selectedElement.settings?.decoding ?? "async";

  /* ─── Handlers ─── */

  const handleSrcChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedElement.id, { src: e.target.value });
  };

  const handleAltChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedElement.id, { name: e.target.value });
  };

  const updateSetting = (key: string, value: string) => {
    updateElement(selectedElement.id, {
      settings: { ...selectedElement.settings, [key]: value },
    });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const response = await imageService.uploadImage(file, file.name);
      updateElement(selectedElement.id, {
        src: response.imageLink,
        name: response.imageName || file.name,
      });
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearSrc = () => {
    updateElement(selectedElement.id, { src: "" });
  };

  /* ─── Detect image info ─── */
  const hasImage = src.length > 0;
  const isExternalUrl = src.startsWith("http://") || src.startsWith("https://");
  const fileName = src.split("/").pop()?.split("?")[0] ?? "";

  return (
    <AccordionItem value="image-settings" className="border-border/40">
      <AccordionTrigger
        className={cn(
          "group/trigger gap-2 py-2 hover:no-underline",
          "transition-colors duration-150",
          "hover:bg-muted/30 rounded-md px-1.5 -mx-1.5",
          "text-xs font-semibold text-foreground/90",
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150">
            <ImageIcon className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Image</span>
          {hasImage && (
            <span className="ml-auto mr-1 shrink-0">
              <CheckCircle2 className="h-3 w-3 text-emerald-500/60" />
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <div className="flex flex-col gap-3">
          {/* ── Source Tabs ── */}
          <Tabs defaultValue={hasImage ? "url" : "upload"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-8 rounded-lg bg-muted/40 p-0.5">
              <TabsTrigger
                value="url"
                className="text-[11px] rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm h-7"
              >
                <Link2 className="h-3 w-3 mr-1.5" />
                URL
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="text-[11px] rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm h-7"
              >
                <Upload className="h-3 w-3 mr-1.5" />
                Upload
              </TabsTrigger>
            </TabsList>

            {/* URL Tab */}
            <TabsContent value="url" className="mt-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Input
                    type="text"
                    value={src}
                    onChange={handleSrcChange}
                    placeholder="https://example.com/image.jpg"
                    className={cn(
                      "h-7 flex-1 px-2 text-[11px] font-mono rounded-md",
                      "border-border/50 bg-muted/20",
                      "placeholder:text-muted-foreground/30",
                      "focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10",
                    )}
                    autoComplete="off"
                  />
                  {hasImage && (
                    <button
                      type="button"
                      onClick={handleClearSrc}
                      className={cn(
                        "flex items-center justify-center",
                        "h-7 w-7 rounded-md shrink-0",
                        "text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10",
                        "transition-all duration-150 outline-none",
                      )}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* URL status indicator */}
                {hasImage && (
                  <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                    {isExternalUrl ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-[10px] font-medium">
                        <Link2 className="h-2.5 w-2.5" />
                        External
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-medium">
                        <FileImage className="h-2.5 w-2.5" />
                        Uploaded
                      </span>
                    )}
                    {fileName && (
                      <span className="text-[10px] text-muted-foreground/50 font-mono truncate max-w-[120px]">
                        {fileName}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="mt-2">
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Drop zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={handleUploadClick}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 py-5 px-3",
                    "rounded-lg border-2 border-dashed cursor-pointer",
                    "transition-all duration-200 ease-out",
                    isDragOver
                      ? "border-primary/50 bg-primary/5 scale-[1.01]"
                      : "border-border/40 bg-muted/10 hover:border-border/60 hover:bg-muted/20",
                    isUploading && "pointer-events-none opacity-60",
                  )}
                >
                  {isUploading ? (
                    <>
                      <div className="relative">
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <>
                      <div
                        className={cn(
                          "flex items-center justify-center",
                          "h-9 w-9 rounded-lg bg-muted/40",
                          "transition-colors duration-150",
                          isDragOver && "bg-primary/10",
                        )}
                      >
                        <Upload
                          className={cn(
                            "h-4 w-4",
                            isDragOver
                              ? "text-primary"
                              : "text-muted-foreground/50",
                          )}
                        />
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[11px] font-medium text-foreground/70">
                          {isDragOver
                            ? "Drop image here"
                            : "Click or drag to upload"}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">
                          PNG, JPG, WebP, SVG • Max 5MB
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <SectionDivider />

          {/* ── Alt Text ── */}
          <ConfigSection
            title="Accessibility"
            icon={<Type className="h-3 w-3" />}
          >
            <ConfigField
              label="Alt text"
              htmlFor="image-alt"
              hint="Descriptive text for screen readers and SEO. Critical for accessibility."
            >
              <Input
                id="image-alt"
                type="text"
                value={alt}
                onChange={handleAltChange}
                placeholder="Describe the image..."
                className="h-7 w-full max-w-[160px] px-2 text-[11px] rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* Alt text quality indicator */}
            {hasImage && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                {alt.length > 0 ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-500/60" />
                    <span className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60">
                      Alt text provided
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-amber-500/60" />
                    <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60">
                      Missing alt text — add for better accessibility
                    </span>
                  </>
                )}
              </div>
            )}
          </ConfigSection>

          <SectionDivider />

          {/* ── Display ── */}
          <ConfigSection
            title="Display"
            icon={<Maximize2 className="h-3 w-3" />}
          >
            <ConfigField
              label="Object Fit"
              htmlFor="object-fit"
              hint="How the image should fill its container"
            >
              <Select
                value={objectFit}
                onValueChange={(v) =>
                  updateSetting(
                    "objectFit",
                    v as "cover" | "contain" | "fill" | "none" | "scale-down",
                  )
                }
              >
                <SelectTrigger
                  id="object-fit"
                  className="h-7 w-[110px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBJECT_FIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex flex-col">
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ConfigField>
          </ConfigSection>

          <SectionDivider />

          {/* ── Performance ── */}
          <ConfigSection title="Performance" icon={<Zap className="h-3 w-3" />}>
            <ConfigField
              label="Loading"
              htmlFor="image-loading"
              hint="'Lazy' defers loading until the image enters the viewport — recommended for below-the-fold images."
            >
              <Select
                value={loading}
                onValueChange={(v) =>
                  updateSetting("loading", v as "lazy" | "eager")
                }
              >
                <SelectTrigger
                  id="image-loading"
                  className="h-7 w-[90px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lazy">Lazy</SelectItem>
                  <SelectItem value="eager">Eager</SelectItem>
                </SelectContent>
              </Select>
            </ConfigField>

            <ConfigField
              label="Decoding"
              htmlFor="image-decoding"
              hint="'Async' allows the browser to decode the image off the main thread — recommended for performance."
            >
              <Select
                value={decoding}
                onValueChange={(v) =>
                  updateSetting("decoding", v as "async" | "sync" | "auto")
                }
              >
                <SelectTrigger
                  id="image-decoding"
                  className="h-7 w-[90px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="async">Async</SelectItem>
                  <SelectItem value="sync">Sync</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </ConfigField>

            {/* Performance hints */}
            <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
              {loading === "lazy" && decoding === "async" ? (
                <>
                  <Zap className="h-3 w-3 text-emerald-500/60" />
                  <span className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60">
                    Optimized for performance
                  </span>
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-[10px] text-muted-foreground/50">
                    Consider lazy loading + async decoding
                  </span>
                </>
              )}
            </div>
          </ConfigSection>

          {/* ── Preview ── */}
          {hasImage && (
            <>
              <SectionDivider />
              <ConfigSection title="Preview" icon={<Eye className="h-3 w-3" />}>
                <div
                  className={cn(
                    "w-full h-28 rounded-lg overflow-hidden",
                    "bg-muted/20 border border-border/30",
                    "ring-1 ring-border/10",
                  )}
                >
                  <img
                    src={src}
                    alt={alt || "Preview"}
                    className="w-full h-full transition-all duration-300"
                    style={{
                      objectFit: objectFit as React.CSSProperties["objectFit"],
                    }}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector("[data-error]")) {
                        const errorEl = document.createElement("div");
                        errorEl.setAttribute("data-error", "true");
                        errorEl.className =
                          "flex flex-col items-center justify-center gap-1 h-full text-muted-foreground/40";
                        errorEl.innerHTML = `
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                          <span class="text-[10px]">Failed to load image</span>
                        `;
                        parent.appendChild(errorEl);
                      }
                    }}
                  />
                </div>
              </ConfigSection>
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
