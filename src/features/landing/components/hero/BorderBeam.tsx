"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  duration?: number;
  className?: string;
}

export const BorderBeam = ({
  duration = 4,
  className,
}: BorderBeamProps) => {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden",
        className,
      )}
    >
      {/* Top Line */}
      <motion.div
        className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: duration,
          ease: "linear",
          repeat: Infinity,
        }}
      />
      {/* Right Line */}
      <motion.div
        className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary to-transparent"
        animate={{
          y: ["-100%", "100%"],
        }}
        transition={{
          duration: duration,
          ease: "linear",
          repeat: Infinity,
          delay: duration / 4,
        }}
      />
      {/* Bottom Line */}
      <motion.div
        className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-transparent via-primary to-transparent"
        animate={{
          x: ["100%", "-100%"],
        }}
        transition={{
          duration: duration,
          ease: "linear",
          repeat: Infinity,
          delay: duration / 2,
        }}
      />
      {/* Left Line */}
      <motion.div
        className="absolute bottom-0 left-0 w-[1px] h-full bg-gradient-to-t from-transparent via-primary to-transparent"
        animate={{
          y: ["100%", "-100%"],
        }}
        transition={{
          duration: duration,
          ease: "linear",
          repeat: Infinity,
          delay: (duration * 3) / 4,
        }}
      />
    </div>
  );
};
