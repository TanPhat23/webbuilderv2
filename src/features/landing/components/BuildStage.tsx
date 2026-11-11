import { useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The page builds itself as you scroll: sketch → style → together → ship.
 * One sticky stage; scroll progress drives every act. With reduced motion the
 * stage is not pinned and shows the finished page.
 */

const ACTS = [
  { n: "01", title: "Sketch", body: "Block out the layout with boxes. Nothing is styled yet." },
  { n: "02", title: "Style", body: "Type, colour, spacing and images, on the canvas." },
  { n: "03", title: "Together", body: "Edit the same file live and comment on elements." },
  { n: "04", title: "Ship", body: "Export a React component for each page." },
] as const;

const CODE = [
  "const Hero = () => (",
  '  <section className="grid gap-6 p-10">',
  '    <h1 className="text-6xl font-semibold">',
  "      Dinner for two",
  "    </h1>",
  '    <Button className="bg-black">Book a table</Button>',
  "  </section>",
];

function Cursor({ name, x, y, tone }: { name: string; x: MotionValue<string>; y: MotionValue<string>; tone: string }) {
  return (
    <motion.div aria-hidden className="pointer-events-none absolute left-0 top-0 z-20" style={{ left: x, top: y }}>
      <svg width="18" height="20" viewBox="0 0 20 22">
        <path d="M1.5 1.5 L1.5 17 L6 13 L9.2 20 L12 18.8 L8.9 12 L15 12 Z" fill={tone} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <span
        className="font-label -mt-0.5 ml-3.5 inline-block px-1.5 py-[3px] leading-none text-white"
        style={{ background: tone }}
      >
        {name}
      </span>
    </motion.div>
  );
}

function Stage({ p }: { p: MotionValue<number> }) {
  // Act windows over the 0..1 scroll progress.
  const sketch = useTransform(p, [0, 0.06, 0.24], [0, 0, 1]);
  const style = useTransform(p, [0.24, 0.46], [0, 1]);
  const together = useTransform(p, [0.46, 0.7], [0, 1]);
  const ship = useTransform(p, [0.74, 0.92], [0, 1]);

  const wireOpacity = useTransform(style, [0, 0.6], [1, 0]);
  const fillOpacity = useTransform(style, [0.2, 1], [0, 1]);
  const flip = useTransform(ship, [0, 1], [0, 180]);

  const maya = { x: useTransform(together, [0, 1], ["96%", "30%"]), y: useTransform(together, [0, 1], ["80%", "34%"]) };
  const dev = { x: useTransform(together, [0, 1], ["-8%", "62%"]), y: useTransform(together, [0, 1], ["70%", "63%"]) };
  const ana = { x: useTransform(together, [0, 1], ["50%", "74%"]), y: useTransform(together, [0, 1], ["110%", "22%"]) };
  const present = useTransform(together, [0, 0.15, 1], [0, 1, 1]);
  const pin = useTransform(together, [0.6, 0.85], [0, 1]);
  const selection = useTransform(together, [0.25, 0.5], [0, 1]);

  const [typed, setTyped] = useState(0);
  useMotionValueEvent(ship, "change", (v) => {
    const n = Math.round(Math.max(0, (v - 0.45) / 0.55) * CODE.join("\n").length);
    setTyped((prev) => (prev === n ? prev : n));
  });
  const code = CODE.join("\n").slice(0, typed);

  return (
    <div className="relative mx-auto w-full max-w-4xl [perspective:1600px]">
      <motion.div className="relative aspect-[16/11] w-full [transform-style:preserve-3d]" style={{ rotateY: flip }}>
        {/* Front: the page being built */}
        <div className="absolute inset-0 overflow-hidden border border-foreground/80 bg-card [backface-visibility:hidden]">
          <div className="font-label flex items-center gap-3 border-b border-border px-4 py-2.5 text-muted-foreground">
            <span className="flex gap-1.5">
              <i className="size-2 rounded-full bg-border" />
              <i className="size-2 rounded-full bg-border" />
              <i className="size-2 rounded-full bg-border" />
            </span>
            <span>maison.site / home</span>
          </div>
          <div className="relative h-[calc(100%-2.5rem)] bg-background">
            {/* Wireframe */}
            <motion.svg
              viewBox="0 0 640 400"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full"
              style={{ opacity: wireOpacity }}
              aria-hidden
            >
              {[
                { x: 28, y: 24, w: 584, h: 30 },
                { x: 28, y: 84, w: 330, h: 120 },
                { x: 28, y: 222, w: 140, h: 40 },
                { x: 388, y: 84, w: 224, h: 178 },
                { x: 28, y: 292, w: 180, h: 84 },
                { x: 230, y: 292, w: 180, h: 84 },
                { x: 432, y: 292, w: 180, h: 84 },
              ].map((r, i) => (
                <motion.rect
                  key={i}
                  {...r}
                  fill="none"
                  stroke="var(--landing-ink)"
                  strokeWidth={1.4}
                  strokeDasharray="5 4"
                  style={{ pathLength: sketch }}
                />
              ))}
              <motion.path d="M388 84 L612 262 M612 84 L388 262" stroke="var(--landing-rule)" strokeWidth={1} style={{ pathLength: sketch }} />
            </motion.svg>

            {/* Styled page */}
            <motion.div className="absolute inset-0 px-[4.4%] py-[6%]" style={{ opacity: fillOpacity }}>
              <div className="font-label flex items-center justify-between text-[0.6rem] text-foreground">
                <span className="font-display text-sm normal-case tracking-tight">maison</span>
                <span className="hidden gap-4 text-muted-foreground sm:flex">
                  <span>Menu</span>
                  <span>Wine</span>
                  <span>Visit</span>
                </span>
              </div>
              <div className="mt-[5%] grid grid-cols-[1.35fr_1fr] gap-[4%]">
                <div>
                  <p className="font-label text-[0.6rem] text-muted-foreground">Spring · Tonight</p>
                  <p className="font-display mt-1 text-[clamp(1.4rem,4.4vw,3.2rem)] leading-[0.95]">
                    Dinner for two<span className="text-[var(--landing-signal)]">.</span>
                  </p>
                  <span className="relative mt-[6%] inline-block">
                    <span className="inline-flex h-8 items-center bg-[var(--landing-signal)] px-4 text-xs font-semibold text-primary-foreground sm:h-10 sm:text-sm">
                      Book a table
                    </span>
                    <motion.span
                      className="absolute -inset-1.5 border-[1.5px] border-[var(--landing-signal)]"
                      style={{ opacity: selection }}
                    >
                      <i className="absolute -left-1 -top-1 size-[6px] border border-[var(--landing-signal)] bg-background" />
                      <i className="absolute -right-1 -top-1 size-[6px] border border-[var(--landing-signal)] bg-background" />
                      <i className="absolute -bottom-1 -left-1 size-[6px] border border-[var(--landing-signal)] bg-background" />
                      <i className="absolute -bottom-1 -right-1 size-[6px] border border-[var(--landing-signal)] bg-background" />
                    </motion.span>
                    <motion.span
                      className="absolute -right-3 -top-3 grid size-5 place-items-center rounded-full border-2 border-background bg-[var(--landing-signal)] text-[0.6rem] font-bold text-primary-foreground"
                      style={{ opacity: pin, scale: pin }}
                    >
                      2
                    </motion.span>
                  </span>
                </div>
                <div className="bg-[var(--landing-signal)]/90 [background-image:linear-gradient(135deg,color-mix(in_srgb,var(--primary)_100%,#000)_0%,var(--primary)_60%,color-mix(in_srgb,var(--primary)_60%,#fff)_100%)]" />
              </div>
              <div className="mt-[4%] grid grid-cols-3 gap-[3%]">
                {["Burrata", "Lamb shoulder", "Rhubarb"].map((dish) => (
                  <div key={dish} className="border border-border bg-card p-[6%]">
                    <p className="text-[0.65rem] font-semibold sm:text-xs">{dish}</p>
                    <p className="mt-1 h-1.5 w-2/3 bg-muted" />
                    <p className="mt-1 h-1.5 w-1/2 bg-muted" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Teammates */}
            <motion.div style={{ opacity: present }} className="pointer-events-none absolute inset-0 overflow-hidden">
              <Cursor name="Maya" x={maya.x} y={maya.y} tone="var(--primary)" />
              <Cursor name="Dev" x={dev.x} y={dev.y} tone="#0f172a" />
              <Cursor name="Ana" x={ana.x} y={ana.y} tone="var(--chart-2, #16a34a)" />
            </motion.div>
          </div>
        </div>

        {/* Back: the exported code */}
        <div
          className="absolute inset-0 overflow-hidden border border-foreground/80 bg-neutral-950 text-white [backface-visibility:hidden] [transform:rotateY(180deg)] dark:bg-card"
        >
          <div className="font-label flex items-center justify-between border-b border-white/20 px-4 py-2.5 opacity-80">
            <span>Hero.tsx</span>
            <span className="flex items-center gap-1.5 text-[var(--landing-signal)]">
              <Check className="size-3" /> exported
            </span>
          </div>
          <pre
            aria-hidden
            className="px-5 py-5 text-[0.65rem] leading-6 sm:text-sm"
            style={{ fontFamily: '"Geist Mono Variable", ui-monospace, monospace' }}
          >
            {code}
            <span className="ml-0.5 inline-block h-4 w-[7px] translate-y-[3px] animate-pulse bg-[var(--landing-signal)]" />
          </pre>
        </div>
      </motion.div>
    </div>
  );
}

export default function BuildStage() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [act, setAct] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v < 0.24 ? 0 : v < 0.46 ? 1 : v < 0.74 ? 2 : 3;
    setAct((prev) => (prev === next ? prev : next));
  });

  if (reduce) {
    return (
      <section id="build" className="container mx-auto scroll-mt-16 px-4 py-20 lg:px-6">
        <h2 className="font-display max-w-3xl text-4xl leading-[1.02] lg:text-6xl">
          From sketch to shipped, in one file.
        </h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ACTS.map((a) => (
            <li key={a.n} className="border-t border-foreground pt-4">
              <p className="font-label text-[var(--landing-signal)]">{a.n}</p>
              <h3 className="font-display mt-2 text-2xl">{a.title}</h3>
              <p className="mt-2 text-muted-foreground">{a.body}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section ref={ref} id="build" className="relative h-[430vh] scroll-mt-16 border-y border-border">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden py-16">
        <div aria-hidden className="blueprint absolute inset-0 -z-10 opacity-60" />
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,17rem)_1fr] lg:gap-14">
            <div>
              <ol className="mt-5 space-y-1">
                {ACTS.map((a, i) => (
                  <li
                    key={a.n}
                    className={cn(
                      "border-l-2 pl-4 transition-all duration-300",
                      i === act ? "border-[var(--landing-signal)]" : "border-border",
                      i !== act && "max-lg:hidden",
                    )}
                  >
                    <p className={cn("font-label", i === act ? "text-[var(--landing-signal)]" : "text-muted-foreground")}>
                      {a.n}
                    </p>
                    <h3 className={cn("font-display text-3xl leading-tight transition-opacity", i !== act && "opacity-35")}>
                      {a.title}
                    </h3>
                    <p
                      className={cn(
                        "grid text-muted-foreground transition-all duration-300",
                        i === act ? "mt-1 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <span className="overflow-hidden">{a.body}</span>
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <Stage p={scrollYProgress} />
          </div>
        </div>
      </div>
    </section>
  );
}
