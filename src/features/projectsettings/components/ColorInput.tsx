import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  bgClass?: string;
  id: string;
}

export function ColorInput({
  label,
  value,
  onChange,
  placeholder,
  bgClass = "",
  id,
}: ColorInputProps) {
  return (
    <div className="text-center space-y-3">
      <Label
        className="text-sm font-bold text-foreground flex items-center justify-center gap-2"
        style={{
          letterSpacing: "var(--tracking-normal)",
        }}
      >
        <div
          className={`w-3 h-3 rounded-full ${bgClass}`}
          style={
            !bgClass
              ? {
                  backgroundColor: value,
                }
              : {}
          }
        ></div>
        {label}
      </Label>
      <div className="relative mx-auto w-fit">
        <input
          type="color"
          id={id}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          className="w-16 h-16 rounded-[var(--radius-lg)] border-2 border-border shadow-[var(--shadow-md)] cursor-pointer mx-auto"
        />
      </div>
      <Input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        className="font-mono text-xs border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-[var(--radius)] bg-card text-center"
        style={{
          letterSpacing: "var(--tracking-normal)",
        }}
        placeholder={placeholder}
      />
    </div>
  );
}
