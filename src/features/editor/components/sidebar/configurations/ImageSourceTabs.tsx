import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUploadImage } from "@/features/images/hooks/useImages";
import { ImageFileSchema } from "@/features/images/schema/imageupload";
import { cn } from "@/lib/utils";
import {
  FileImage,
  Link2,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { extractImageFileName } from "../../../lib/imageConfig";
import { isExternalMedia } from "./_shared/externalUrl";

interface ImageSourceTabsProps {
  elementId: string;
  src: string;
  onChangeSrc: (src: string) => void;
  onUploaded: (
    targetElementId: string,
    result: { src: string; alt: string },
  ) => void;
}

export function ImageSourceTabs({
  elementId,
  src,
  onChangeSrc,
  onUploaded,
}: ImageSourceTabsProps) {
  const uploadMutation = useUploadImage();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = uploadMutation.isPending;
  const hasImage = src.length > 0;
  const isExternalUrl = isExternalMedia(src);
  const fileName = extractImageFileName(src);

  const processFile = async (file: File) => {
    if (isUploading) return;
    const validation = ImageFileSchema.safeParse({ file });
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message ?? "Invalid image file");
      return;
    }

    const targetElementId = elementId;
    try {
      const response = await uploadMutation.mutateAsync({
        file,
        imageName: file.name,
      });
      onUploaded(targetElementId, {
        src: response.imageLink,
        alt: response.imageName || file.name,
      });
    } catch {
      return;
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  return (
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

      <TabsContent value="url" className="mt-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Input
              type="text"
              value={src}
              onChange={(e) => onChangeSrc(e.target.value)}
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
                onClick={() => onChangeSrc("")}
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

      <TabsContent value="upload" className="mt-2">
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => !isUploading && fileInputRef.current?.click()}
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
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
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
                      isDragOver ? "text-primary" : "text-muted-foreground/50",
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
  );
}
