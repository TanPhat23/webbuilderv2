import { useEffect, useRef, useState, type ElementType } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Segment {
  text: string;
  accent?: boolean;
}

interface KineticTextProps {
  /** One array of segments per visual line. */
  lines: Segment[][];
  className?: string;
  as?: ElementType;
  /** Plays a masked letter-by-letter reveal on mount. */
  intro?: boolean;
  /** Seconds before the intro starts. */
  delay?: number;
  cursorLabel?: string;
}

interface LetterState {
  y: number;
  r: number;
  c: number;
}

/**
 * Display type whose letters lean away from the pointer, so the headline feels
 * like something you can touch. Only transforms and colour change, so the line
 * never reflows. Pointer-driven motion is skipped for touch and reduced motion.
 */
export default function KineticText({
  lines,
  className,
  as: Tag = "div",
  intro = false,
  delay = 0,
  cursorLabel,
}: KineticTextProps) {
  const reduce = useReducedMotion();
  const letters = useRef<(HTMLSpanElement | null)[]>([]);
  const states = useRef<LetterState[]>([]);
  const [revealed, setRevealed] = useState(!intro || Boolean(reduce));

  useEffect(() => {
    if (!intro || reduce) return;
    const total = lines.flat().reduce((sum, s) => sum + s.text.length, 0);
    const timer = setTimeout(() => setRevealed(true), (delay + 0.9 + total * 0.02) * 1000);
    return () => clearTimeout(timer);
  }, [intro, reduce, lines, delay]);

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let pointer: { x: number; y: number } | null = null;
    let frame = 0;

    const tick = () => {
      frame = 0;
      const radius = 170;
      let moving = false;
      const centers = letters.current.map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height };
      });
      letters.current.forEach((el, i) => {
        const c = centers[i];
        if (!el || !c) return;
        const s = (states.current[i] ??= { y: 0, r: 0, c: 0 });
        let ty = 0;
        let tr = 0;
        let tc = 0;
        if (pointer) {
          const dx = pointer.x - c.x;
          const dy = pointer.y - c.y;
          const d = Math.hypot(dx, dy);
          const t = Math.max(0, 1 - d / radius);
          const eased = t * t;
          ty = -eased * c.h * 0.16;
          tr = -(dx / radius) * eased * 9;
          tc = eased;
        }
        s.y += (ty - s.y) * 0.18;
        s.r += (tr - s.r) * 0.18;
        s.c += (tc - s.c) * 0.18;
        if (Math.abs(ty - s.y) > 0.05 || Math.abs(tr - s.r) > 0.05 || Math.abs(tc - s.c) > 0.01) moving = true;
        el.style.transform = `translate3d(0, ${s.y.toFixed(2)}px, 0) rotate(${s.r.toFixed(2)}deg)`;
        el.style.color = s.c > 0.02 ? `color-mix(in srgb, var(--primary) ${(s.c * 100).toFixed(0)}%, currentColor)` : "";
      });
      if (moving || pointer) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer = { x: event.clientX, y: event.clientY };
      wake();
    };
    const onLeave = () => {
      pointer = null;
      wake();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduce]);

  const label = lines.map((line) => line.map((s) => s.text).join("")).join(" ");
  let index = 0;

  return (
    <Tag data-cursor={cursorLabel} aria-label={label} className={className}>
      {lines.map((line, lineIndex) => (
        <span
          key={lineIndex}
          aria-hidden
          className={cn("block pb-[0.14em] -mb-[0.14em]", !revealed && "overflow-hidden")}
        >
          {line.map((segment, segmentIndex) =>
            segment.text.split(/(\s+)/).map((word, wordIndex) => {
              if (/^\s+$/.test(word)) return " ";
              if (!word) return null;
              return (
                <span key={`${segmentIndex}-${wordIndex}`} className="inline-block whitespace-nowrap">
                  {Array.from(word).map((char, charIndex) => {
                    const i = index++;
                    return (
                      <motion.span
                        key={charIndex}
                        className="inline-block"
                        initial={intro && !reduce ? { y: "115%" } : false}
                        animate={{ y: "0%" }}
                        transition={{ duration: 0.8, delay: delay + i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <span
                          ref={(el) => {
                            letters.current[i] = el;
                          }}
                          className={cn(
                            "inline-block will-change-transform",
                            segment.accent && "text-[var(--landing-signal)]",
                          )}
                        >
                          {char}
                        </span>
                      </motion.span>
                    );
                  })}
                </span>
              );
            }),
          )}
        </span>
      ))}
    </Tag>
  );
}
