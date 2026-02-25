import { Upload } from "lucide-react";

interface DropOverlayProps {
  label: string;
}

export function DropOverlay({ label }: DropOverlayProps) {
  return (
    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
      <div className="bg-background/90 p-4 rounded-lg shadow-lg">
        <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
        <p className="text-sm font-medium">{label}</p>
      </div>
    </div>
  );
}
