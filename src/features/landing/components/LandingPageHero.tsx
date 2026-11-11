import { useRef, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import KineticText from "./KineticText";

const CHIPS = [
  { label: "<Button />", className: "right-[6%] top-[18%] hidden md:block", rotate: -6 },
  { label: "flex-col gap-4", className: "right-[24%] top-[62%] hidden lg:block", rotate: 4 },
  { label: "onClick → book()", className: "right-[4%] top-[70%] hidden md:block", rotate: 3 },
  { label: "<Card />", className: "right-[30%] top-[14%] hidden xl:block", rotate: 5 },
];

export default function LandingPageHero({ ctaTo }: { ctaTo: "/sign-up" | "/dashboard" }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const onMove = (event: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - r.left}px`);
    el.style.setProperty("--my", `${event.clientY - r.top}px`);
  };

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col justify-center overflow-hidden"
    >
      <div aria-hidden className="grid-faint absolute inset-0 -z-20" />
      <div aria-hidden className="grid-reveal absolute inset-0 -z-10" />

      {CHIPS.map((chip, index) => (
        <motion.div
          key={chip.label}
          drag={!reduce}
          dragMomentum={false}
          dragElastic={0.12}
          whileDrag={{ scale: 1.06, cursor: "grabbing" }}
          initial={reduce ? false : { opacity: 0, y: 24, rotate: chip.rotate }}
          animate={{ opacity: 1, y: 0, rotate: chip.rotate }}
          transition={{ delay: 1.1 + index * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          data-cursor="drag me"
          className={`font-label absolute z-10 cursor-grab select-none border border-foreground/80 bg-background px-3 py-2 shadow-[3px_3px_0_var(--foreground)] ${chip.className}`}
        >
          {chip.label}
        </motion.div>
      ))}

      <div className="container mx-auto px-4 py-16 lg:px-6">
        <KineticText
          as="h1"
          intro
          delay={0.15}
          cursorLabel="h1 · Heading"
          className="font-display text-[clamp(3.1rem,11.5vw,10.5rem)] leading-[0.9]"
          lines={[
            [{ text: "Build it together." }],
            [{ text: "Ship it as " }, { text: "React.", accent: true }],
          ]}
        />

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex max-w-2xl flex-col gap-8"
        >
          <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
            A visual editor where designers and developers work in one file, live, and export it as React.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              to={ctaTo}
              className="group inline-flex items-center gap-2 bg-[var(--landing-signal)] px-6 py-3.5 text-base font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-signal)]"
            >
              {ctaTo === "/dashboard" ? "Open dashboard" : "Start building free"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#build"
              className="inline-flex items-center gap-2 text-base font-medium underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Watch it get built
              <ArrowDown className="size-4" />
            </a>
          </div>
        </motion.div>
      </div>

      <div aria-hidden className="font-label absolute bottom-5 right-6 hidden text-muted-foreground md:block">
        Scroll
      </div>
    </section>
  );
}
