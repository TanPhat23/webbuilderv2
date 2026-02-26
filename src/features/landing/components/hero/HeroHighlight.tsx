"use client";

import { motion } from "framer-motion";

export const HeroHighlight = () => {
  return (
    <motion.div
      className="absolute inset-0 z-0 opacity-100 transition duration-300 pointer-events-none"
      style={{
        background: `radial-gradient(
          800px circle at 50% 30%,
          rgba(var(--primary-rgb), 0.06),
          transparent 80%
        )`
      }}
    />
  );
};
