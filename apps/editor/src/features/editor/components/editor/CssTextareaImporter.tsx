import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useCssImporter } from "../../hooks/useCssImporter";

type Props = {
  maxInlineSize?: number;
};

export default function CssTextareaImporter({
  maxInlineSize = 200 * 1024,
}: Props) {
  const {
    css,
    byteCount,
    error,
    info,
    previewHtml,
    fileInputRef,
    setCss,
    handleInject,
    handleClear,
    handleFileChange,
  } = useCssImporter(maxInlineSize);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Import CSS
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import CSS</DialogTitle>
          <DialogDescription>
            Paste compiled Tailwind CSS (the build output of{" "}
            <code>globals.css</code>) or upload a .css file. You can go to
            TweakCN from link provided to build custom Tailwind CSS files.
          </DialogDescription>
          <a
            href="https://tweakcn.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent-foreground"
          >
            https://tweakcn.com
          </a>
        </DialogHeader>

        <div className="mt-2">
          <div className="mb-4">
            <Label htmlFor="css-import-textarea" className="text-xs">
              CSS
            </Label>
            <Textarea
              id="css-import-textarea"
              value={css}
              onChange={(e) => setCss(e.target.value)}
              placeholder="Paste your compiled CSS here (Tailwind output, component styles, etc.)"
              className="min-h-[240px] max-h-[300px] text-xs font-mono bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              id="css-file"
              type="file"
              accept=".css,text/css"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            <Button asChild variant="outline" size="sm">
              <label htmlFor="css-file" className="cursor-pointer">
                Upload .css
              </label>
            </Button>

            <Button onClick={handleInject} size="sm">
              Inject
            </Button>

            <Button onClick={handleClear} variant="ghost" size="sm">
              Clear
            </Button>

            <div className="ml-auto text-xs text-muted-foreground">
              {byteCount} bytes
            </div>
          </div>

          <div className="mt-3 text-xs">
            {error ? (
              <div className="text-sm text-destructive mt-1" role="alert">
                {error}
              </div>
            ) : info ? (
              <div
                className="text-sm text-muted-foreground mt-1"
                role="status"
              >
                {info}
              </div>
            ) : (
              <div className="text-muted-foreground mt-1 text-xs">
                Tip: paste your compiled Tailwind CSS (from globals.css build
                output) here.
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <details>
              <summary className="cursor-pointer">
                Advanced: preview generated injection HTML
              </summary>
              <pre className="mt-2 p-2 bg-black/10 rounded text-xs overflow-auto">
                {previewHtml}
              </pre>
            </details>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
