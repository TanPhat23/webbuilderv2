import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useElementStore } from "@/globalstore/element-store";
import { useSelectionStore } from "@/globalstore/selection-store";
import React, { ChangeEvent, useState, useRef } from "react";
import { imageService } from "@/services/image";
import { toast } from "sonner";
import { Upload, Link2, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ImageConfiguration = () => {
  const { updateElement } = useElementStore();
  const { selectedElement } = useSelectionStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!selectedElement || selectedElement.type !== "Image") {
    return <AccordionItem value="image-settings"></AccordionItem>;
  }

  const src = selectedElement.src ?? "";
  const alt = selectedElement.name ?? "";
  const objectFit = selectedElement.settings?.objectFit ?? "cover";
  const loading = selectedElement.settings?.loading ?? "lazy";
  const decoding = selectedElement.settings?.decoding ?? "async";

  const handleSrcChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedElement.id, {
      src: e.target.value,
    });
  };

  const handleAltChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedElement.id, {
      name: e.target.value,
    });
  };

  const handleObjectFitChange = (
    value: "cover" | "contain" | "fill" | "none" | "scale-down",
  ) => {
    updateElement(selectedElement.id, {
      settings: {
        ...selectedElement.settings,
        objectFit: value,
      },
    });
  };

  const handleLoadingChange = (value: "lazy" | "eager") => {
    updateElement(selectedElement.id, {
      settings: {
        ...selectedElement.settings,
        loading: value,
      },
    });
  };

  const handleDecodingChange = (value: "async" | "sync" | "auto") => {
    updateElement(selectedElement.id, {
      settings: {
        ...selectedElement.settings,
        decoding: value,
      },
    });
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
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
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <AccordionItem value="image-settings">
      <AccordionTrigger className="text-sm">Image Settings</AccordionTrigger>
      <AccordionContent className="space-y-3">
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="url" className="text-xs">
              <Link2 className="w-3 h-3 mr-1" />
              URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs">
              <Upload className="w-3 h-3 mr-1" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-2 mt-2">
            <div className="flex items-center gap-4 py-1">
              <Label htmlFor="image-src" className="text-xs w-28 shrink-0">
                Image URL
              </Label>
              <Input
                id="image-src"
                name="src"
                type="text"
                value={src}
                onChange={handleSrcChange}
                className="w-full h-7 px-2 py-1 text-xs"
                placeholder="https://example.com/image.jpg"
                autoComplete="off"
              />
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-2 mt-2">
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="w-full h-8 text-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3 mr-2" />
                    Choose Image
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Max size: 5MB
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-4 py-1">
          <Label htmlFor="image-alt" className="text-xs w-28 shrink-0">
            Alt Text
          </Label>
          <Input
            id="image-alt"
            name="alt"
            type="text"
            value={alt}
            onChange={handleAltChange}
            className="w-full h-7 px-2 py-1 text-xs"
            placeholder="Describe the image"
            autoComplete="off"
          />
        </div>

        <div className="flex items-center gap-4 py-1">
          <Label htmlFor="object-fit" className="text-xs w-28 shrink-0">
            Object Fit
          </Label>
          <Select value={objectFit} onValueChange={handleObjectFitChange}>
            <SelectTrigger id="object-fit" className="w-full h-7 text-xs">
              <SelectValue placeholder="Select object fit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover" className="text-xs">
                Cover
              </SelectItem>
              <SelectItem value="contain" className="text-xs">
                Contain
              </SelectItem>
              <SelectItem value="fill" className="text-xs">
                Fill
              </SelectItem>
              <SelectItem value="none" className="text-xs">
                None
              </SelectItem>
              <SelectItem value="scale-down" className="text-xs">
                Scale Down
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 py-1">
          <Label htmlFor="loading" className="text-xs w-28 shrink-0">
            Loading
          </Label>
          <Select value={loading} onValueChange={handleLoadingChange}>
            <SelectTrigger id="loading" className="w-full h-7 text-xs">
              <SelectValue placeholder="Select loading" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lazy" className="text-xs">
                Lazy
              </SelectItem>
              <SelectItem value="eager" className="text-xs">
                Eager
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 py-1">
          <Label htmlFor="decoding" className="text-xs w-28 shrink-0">
            Decoding
          </Label>
          <Select value={decoding} onValueChange={handleDecodingChange}>
            <SelectTrigger id="decoding" className="w-full h-7 text-xs">
              <SelectValue placeholder="Select decoding" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="async" className="text-xs">
                Async
              </SelectItem>
              <SelectItem value="sync" className="text-xs">
                Sync
              </SelectItem>
              <SelectItem value="auto" className="text-xs">
                Auto
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {src && (
          <div className="pt-2 border-t">
            <Label className="text-xs text-muted-foreground mb-2 block">
              Preview
            </Label>
            <div className="w-full h-32 bg-muted rounded-md overflow-hidden">
              <img
                src={src}
                alt={alt || "Preview"}
                className="w-full h-full"
                style={{
                  objectFit: objectFit as React.CSSProperties["objectFit"],
                }}
              />
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
