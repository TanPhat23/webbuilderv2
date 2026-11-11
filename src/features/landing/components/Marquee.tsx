import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

const ROW_A = ["Layout", "Components", "Realtime", "Comments", "Workflows", "Marketplace", "Export"];
const ROW_B = ["Responsive", "Tailwind", "shadcn/ui", "React", "CMS", "Templates", "Preview"];

function Row({ words, filled, x }: { words: string[]; filled: boolean; x: ReturnType<typeof useTransform<number, string>> }) {
  const loop = [...words, ...words];
  return (
    <motion.div style={{ x }} className="flex w-max gap-10 whitespace-nowrap">
      {loop.map((word, i) => (
        <span
          key={i}
          className={`font-display flex items-center gap-10 text-[clamp(3rem,9vw,8rem)] leading-none ${filled ? "" : "stroke-text"}`}
        >
          {word}
          <i aria-hidden className="size-3 shrink-0 bg-[var(--landing-signal)] md:size-5" />
        </span>
      ))}
    </motion.div>
  );
}

/** Two rows of type that slide in opposite directions as the page scrolls. */
export default function Marquee() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const a = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-30%"]);
  const b = useTransform(scrollYProgress, [0, 1], reduce ? ["-20%", "-20%"] : ["-35%", "0%"]);

  return (
    <div ref={ref} aria-hidden className="relative overflow-hidden border-b border-border py-10 lg:py-14">
      <div className="space-y-4">
        <Row words={ROW_A} filled x={a} />
        <Row words={ROW_B} filled={false} x={b} />
      </div>
    </div>
  );
}
