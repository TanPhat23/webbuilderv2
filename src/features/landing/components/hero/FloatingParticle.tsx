import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FloatingParticleProps {
  delay: number;
  x: string;
  y: string;
  Icon: LucideIcon;
  color?: string;
  size?: string;
  drift?: number;
  rotation?: number;
  duration?: number;
}

export const FloatingParticle = ({
  delay,
  x,
  y,
  Icon,
  color = "text-primary/20",
  size = "w-6 h-6",
  drift = 10,
  rotation = 30,
  duration = 12,
}: FloatingParticleProps) => (
  <motion.div
    initial={{ opacity: 0, y: 0, scale: 0.5 }}
    animate={{
      opacity: [0, 0.8, 0],
      y: -150,
      x: [0, drift],
      scale: [0.5, 1.2, 0.5],
      rotate: [0, rotation],
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
    style={{ left: x, top: y }}
    className={cn("absolute pointer-events-none z-0 filter blur-[1px]", color)}
  >
    <Icon className={size} />
  </motion.div>
);
