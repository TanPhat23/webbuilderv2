import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import KineticText from "./KineticText";

export default function LandingPageCTA({ ctaTo }: { ctaTo: "/sign-up" | "/dashboard" }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18 });
  const y = useSpring(my, { stiffness: 220, damping: 18 });

  const pull = (event: React.PointerEvent) => {
    if (reduce || event.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((event.clientX - (r.left + r.width / 2)) * 0.35);
    my.set((event.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const release = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section data-tone="blue" className="bg-primary text-primary-foreground">
      <div className="container mx-auto grid items-center gap-12 px-4 py-24 lg:grid-cols-[1fr_auto] lg:px-6 lg:py-36">
        <KineticText
          as="h2"
          className="font-display text-[clamp(2.8rem,8.5vw,8rem)] leading-[0.92]"
          lines={[[{ text: "Start with" }], [{ text: "a blank canvas." }]]}
        />
        <div
          ref={ref}
          onPointerMove={pull}
          onPointerLeave={release}
          className="grid place-items-center p-6 lg:p-12"
        >
          <motion.div style={{ x, y }}>
            <Link
              to={ctaTo}
              className="grid size-44 place-items-center rounded-full bg-background text-center text-foreground transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:size-52"
            >
              <span className="font-display flex flex-col items-center gap-1 text-2xl leading-none">
                {ctaTo === "/dashboard" ? "Open dashboard" : "Open the editor"}
                <ArrowUpRight className="size-6 text-primary" />
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
