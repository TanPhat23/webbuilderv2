import { cn } from "@/lib/utils";
import { Palette, Sparkles, Smartphone, Code, LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    icon: Palette,
    title: "Drag & Drop Builder",
    desc: "Create websites visually with our intuitive drag-and-drop interface. No coding knowledge required.",
  },
  {
    icon: Sparkles,
    title: "Pre-built Components",
    desc: "Choose from hundreds of professionally designed components. Headers, footers, and forms.",
  },
  {
    icon: Code,
    title: "Clean Code Export",
    desc: "Export production-ready React/Next.js code. No vendor lock-in - take your code anywhere.",
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    desc: "All designs automatically adapt to mobile, tablet, and desktop. Perfect on every device.",
  },
];

export default function LandingPageFeature() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Background Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-96 blur-[120px] opacity-20 pointer-events-none bg-primary"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          {/* Text Content */}
          <div className="relative z-10 space-y-6">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Features
            </div>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Everything you need to build{" "}
              <span className="text-primary">amazing</span> websites
            </h2>
            <p className="max-w-[600px] text-lg text-muted-foreground">
              WebBuilder provides all the tools you need to create professional
              websites without writing a single line of code.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="flex flex-col gap-4 sm:-skew-x-12 sm:-ml-16 lg:-ml-32">
            {features.map((feature, i) => (
              <div
                key={i}
                className={cn(
                  "group relative border border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50 shadow-2xl p-6 rounded-xl transition-all duration-300 hover:-translate-y-1",
                )}
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}