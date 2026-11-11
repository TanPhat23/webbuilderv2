import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

const TARGETS = 'a[href], button:not([disabled]), summary, [role="tab"], [data-cursor]';

function labelFor(el: Element): string {
  const custom = el.getAttribute("data-cursor");
  if (custom) return custom;
  const tag = el.tagName.toLowerCase();
  if (tag === "a") return "a · Link";
  if (tag === "button") return "button · Button";
  return tag;
}

/**
 * The page's cursor, drawn like the editor's selection box: a small handle
 * square at rest that snaps around whatever you hover and names it. The native
 * cursor stays visible, and this is skipped on touch and reduced-motion.
 */
export default function SelectionCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");
  const [onBlue, setOnBlue] = useState(false);

  const x = useMotionValue(-40);
  const y = useMotionValue(-40);
  const w = useMotionValue(14);
  const h = useMotionValue(14);
  const opacity = useMotionValue(0);
  const spring = { stiffness: 520, damping: 42, mass: 0.55 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  const sw = useSpring(w, spring);
  const sh = useSpring(h, spring);

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);

    let target: Element | null = null;
    let px = -40;
    let py = -40;
    let frame = 0;
    let lastLabel = "";
    let lastTone = false;

    const apply = () => {
      frame = 0;
      if (target && !target.isConnected) target = null;
      if (target) {
        const r = target.getBoundingClientRect();
        const pad = 6;
        x.set(r.left - pad);
        y.set(r.top - pad);
        w.set(r.width + pad * 2);
        h.set(r.height + pad * 2);
      } else {
        x.set(px - 7);
        y.set(py - 7);
        w.set(14);
        h.set(14);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      px = event.clientX;
      py = event.clientY;
      opacity.set(1);
      const hit = document.elementFromPoint(px, py);
      target = hit?.closest(TARGETS) ?? null;
      const next = target ? labelFor(target) : "";
      if (next !== lastLabel) {
        lastLabel = next;
        setLabel(next);
      }
      const blue = Boolean(hit?.closest("[data-tone='blue']"));
      if (blue !== lastTone) {
        lastTone = blue;
        setOnBlue(blue);
      }
      schedule();
    };
    const onLeave = () => opacity.set(0);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduce, x, y, w, h, opacity]);

  if (!enabled) return null;

  const tone = onBlue ? "#ffffff" : "var(--primary)";
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ x: sx, y: sy, width: sw, height: sh, opacity, border: `1.5px solid ${tone}` }}
    >
      {["-left-[4px] -top-[4px]", "-right-[4px] -top-[4px]", "-bottom-[4px] -left-[4px]", "-bottom-[4px] -right-[4px]"].map(
        (pos) => (
          <span
            key={pos}
            className={`absolute size-[7px] border bg-background ${pos}`}
            style={{ borderColor: tone }}
          />
        ),
      )}
      {label && (
        <span
          className="font-label absolute -top-[1.45rem] left-[-1.5px] whitespace-nowrap px-1.5 py-[3px] leading-none"
          style={{ background: tone, color: onBlue ? "var(--primary)" : "var(--primary-foreground)" }}
        >
          {label}
        </span>
      )}
    </motion.div>
  );
}
