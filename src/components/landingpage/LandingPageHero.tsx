"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  MousePointer2,
  Layers,
  Code2,
  PanelTop,
  Terminal,
  Cpu,
  Hash,
  MoveUpRight,
  Zap,
  FileType,
  LayoutTemplate,
  Monitor,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { FloatingParticle } from "./hero/FloatingParticle";
import { GridPattern } from "./hero/GridPattern";
import { BorderBeam } from "./hero/BorderBeam";
import { HeroHighlight } from "./hero/HeroHighlight";
import { AnimatedBeam } from "./hero/AnimatedBeam";

export default function LandingPageHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const centerLeftRef = useRef<HTMLDivElement>(null);
  const centerRightRef = useRef<HTMLDivElement>(null);
  const centerSettingsRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Scroll Parallax
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const y3 = useTransform(scrollY, [0, 500], [0, 80]);

  // Typing effect logic
  const [typedValue, setTypedValue] = useState("");
  const codeString = "flex-col items-center justify-center p-4 gap-4";
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    let isDeleting = false;
    let timeout: NodeJS.Timeout;

    const type = () => {
      const current = codeString.substring(0, currentIndex);
      setTypedValue(current);

      let typeSpeed = 50;

      if (isDeleting) {
        typeSpeed = 30;
        currentIndex--;
      } else {
        typeSpeed = Math.random() * 50 + 50;
        currentIndex++;
      }

      if (!isDeleting && currentIndex === codeString.length + 1) {
        isDeleting = true;
        typeSpeed = 3000; // Pause at end
      } else if (isDeleting && currentIndex === 0) {
        isDeleting = false;
        typeSpeed = 500; // Pause before restarting
      }

      timeout = setTimeout(type, typeSpeed);
    };

    timeout = setTimeout(type, 1000);

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => {
      clearTimeout(timeout);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-background relative w-full overflow-hidden border-b border-border/40 pb-20 pt-24 lg:pt-40 perspective-[2000px] min-h-screen flex flex-col items-center"
    >
      <GridPattern />
      <HeroHighlight />

      {/* Floating Particles */}
      <FloatingParticle
        delay={0}
        x="10%"
        y="70%"
        Icon={Code2}
        color="text-blue-500/30"
      />
      <FloatingParticle
        delay={2}
        x="85%"
        y="60%"
        Icon={FileType}
        color="text-purple-500/30"
      />
      <FloatingParticle
        delay={4}
        x="15%"
        y="30%"
        Icon={Hash}
        color="text-green-500/30"
      />
      <FloatingParticle
        delay={1}
        x="80%"
        y="20%"
        Icon={LayoutTemplate}
        color="text-orange-500/30"
      />
      <FloatingParticle
        delay={5}
        x="50%"
        y="50%"
        Icon={Sparkles}
        color="text-yellow-500/20"
        size="w-4 h-4"
      />

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center select-none">
        <div className="mx-auto max-w-5xl text-center">
          {/* Tech Badge - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto mb-8 flex justify-center"
          >
            <div className="relative group inline-flex items-center rounded-full p-[1px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
              <div className="relative bg-background/80 border border-border/60 rounded-full px-4 py-1.5 flex items-center backdrop-blur-md shadow-sm ring-1 ring-white/10 group-hover:border-primary/30 transition-colors">
                <span className="text-foreground flex items-center gap-2 font-medium text-xs sm:text-sm">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  Visual Builder v2.0
                </span>
                <div className="mx-3 h-4 w-px bg-border/60" />
                <span className="text-muted-foreground flex items-center gap-1 text-xs sm:text-sm group-hover:text-primary transition-colors">
                  Production Ready
                  <ChevronRight className="h-3 w-3 ml-1" />
                </span>
              </div>
            </div>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl lg:text-8xl relative z-20 mb-6 leading-[1.1]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Compose visually.
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative inline-block mt-2"
            >
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground/90 to-foreground/50 pb-2">
                Export structurally.
              </span>
              <motion.span
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 1.2, ease: "circOut" }}
                className="absolute bottom-2 left-0 h-3/6 w-full bg-blue-500/10 -z-10 blur-xl rounded-full mix-blend-multiply dark:mix-blend-screen"
              />
            </motion.div>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl leading-relaxed mb-10"
          >
            See the structure behind the design. Build complex layouts by
            layering components, applying styles, and generating clean, semantic
            code instantly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-24 relative z-30"
          >
            <Button
              size="lg"
              className="group relative h-12 min-w-40 overflow-hidden rounded-full text-base font-semibold shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.5)] hover:shadow-[0_0_60px_-15px_rgba(var(--primary-rgb),0.6)] hover:scale-105 transition-all duration-300"
              asChild
            >
              <Link href="/editor">
                {/* Shimmer Effect */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                  }}
                />
                <span className="relative z-20 flex items-center">
                  Start Building
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 min-w-40 rounded-full text-base font-semibold bg-background/50 backdrop-blur-sm hover:bg-muted/50 border-border/50 hover:border-primary/20 transition-all duration-300"
            >
              <Monitor className="mr-2 h-4 w-4" />
              Live Demo
            </Button>
          </motion.div>
        </div>

        {/* 3D Visualizer Section */}
        <div className="relative w-full max-w-[1000px] h-[600px] perspective-[2000px] group/viz">
          {/* 1. Left Floating Panel: DOM Tree (Parallax Layer 1) */}
          <motion.div
            style={{ y: y1 }}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute -left-4 lg:-left-20 top-20 z-30 hidden md:block"
          >
            <div className="border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl w-72 rounded-xl overflow-hidden ring-1 ring-white/10 transform hover:scale-105 transition-transform duration-300 hover:shadow-primary/5">
              <div className="bg-muted/30 px-4 py-3 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Layers className="h-3.5 w-3.5" /> Structure
                </div>
                <div className="flex gap-1.5 opacity-50">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
              </div>

              {/* Connection Point */}
              <div
                ref={leftPanelRef}
                className="absolute top-1/2 -right-1.5 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] z-50 ring-2 ring-background"
              />

              <div className="p-4 space-y-1 font-mono text-xs relative">
                <div className="absolute left-[1.35rem] top-10 bottom-4 w-px bg-border/50" />

                <div className="flex items-center gap-2 text-muted-foreground py-1 px-2 rounded hover:bg-muted/50 transition-colors">
                  <ChevronRight className="h-3 w-3 rotate-90" />
                  <span className="opacity-75">Page</span>
                </div>

                <div className="pl-4">
                  <div className="flex items-center gap-2 text-primary font-medium py-1.5 px-2 bg-primary/10 rounded-md border border-primary/20 relative overflow-hidden group/item">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 1,
                      }}
                    />
                    <PanelTop className="h-3 w-3 relative z-10" />
                    <span className="relative z-10">Hero_Section</span>
                  </div>

                  <div className="pl-6 space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-muted-foreground py-1 pl-3 hover:text-foreground transition-colors cursor-default hover:bg-muted/30 rounded-sm">
                      <div className="w-3 border-t border-border/50 -ml-5 mr-1" />
                      <Hash className="h-3 w-3" /> Heading
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground py-1 pl-3 hover:text-foreground transition-colors cursor-default hover:bg-muted/30 rounded-sm">
                      <div className="w-3 border-t border-border/50 -ml-5 mr-1" />
                      <Hash className="h-3 w-3" /> Subtext
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground py-1 pl-3 hover:text-foreground transition-colors cursor-default hover:bg-muted/30 rounded-sm">
                      <div className="w-3 border-t border-border/50 -ml-5 mr-1" />
                      <MoveUpRight className="h-3 w-3" /> Actions_Row
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. Right Floating Panel: Code (Parallax Layer 2) */}
          <motion.div
            style={{ y: y2 }}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="absolute -right-7 lg:-right-46 bottom-32 z-30 hidden md:block"
          >
            <div className="border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl w-80 rounded-xl overflow-hidden ring-1 ring-white/10 transform hover:scale-105 transition-transform duration-300 hover:shadow-blue-500/5">
              <div className="bg-muted/30 px-4 py-3 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Terminal className="h-3.5 w-3.5" /> Code Output
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-1.5 py-0.5 rounded bg-blue-500/10 text-[10px] text-blue-500 font-mono font-medium border border-blue-500/20">
                    TSX
                  </div>
                  <Cpu className="h-3.5 w-3.5 text-muted-foreground animate-pulse" />
                </div>
              </div>

              {/* Connection Point */}
              <div
                ref={rightPanelRef}
                className="absolute top-1/2 -left-1.5 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] z-50 ring-2 ring-background"
              />

              <div className="p-4 space-y-2 font-mono text-[11px] bg-black/5 leading-relaxed">
                <div className="flex gap-2 pb-2 border-b border-dashed border-border/50 mb-2 text-xs">
                  <span className="text-purple-400">export</span>
                  <span className="text-red-400">default</span>
                  <span className="text-blue-400">function</span>
                  <span className="text-yellow-400">Hero</span>() &#123;
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-border/30 ml-1">
                  <div className="flex group">
                    <span className="text-muted-foreground mr-2">return</span>
                    <span className="text-foreground">(</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-400">&lt;div</span>
                    <span className="text-purple-400"> className</span>=
                    <span className="text-green-400">"w-full h-screen..."</span>
                    <span className="text-blue-400">&gt;</span>
                  </div>
                  <div className="pl-6 py-1 bg-blue-500/5 -mx-4 border-l-2 border-blue-500 transition-colors duration-300">
                    <span className="text-blue-400">&lt;div</span>
                    <span className="text-purple-400"> className</span>="
                    <span className="text-green-400 font-semibold break-all">
                      {typedValue}
                    </span>
                    {showCursor && (
                      <span className="text-blue-500 animate-pulse font-bold">
                        |
                      </span>
                    )}
                    "<span className="text-blue-400">&gt;</span>
                  </div>
                  <div className="pl-8 text-muted-foreground">
                    {/* Content Placeholder */}
                    ...
                  </div>
                  <div className="pl-6">
                    <span className="text-blue-400">&lt;/div&gt;</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-400">&lt;/div&gt;</span>
                  </div>
                  <div className="text-foreground">)</div>
                </div>
                <div className="text-foreground">&#125;</div>
              </div>
            </div>
          </motion.div>

          {/* 3. Right Floating Panel: Settings (Parallax Layer 3) */}
          <motion.div
            style={{ y: y3 }}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 1 }}
            className="absolute -right-24 lg:-right-32 top-64 z-30 hidden md:block"
          >
            <div className="border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl w-64 rounded-xl overflow-hidden ring-1 ring-white/10 transform hover:scale-105 transition-transform duration-300 hover:shadow-purple-500/5">
              <div className="bg-muted/30 px-4 py-3 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Zap className="h-3.5 w-3.5" /> Properties
                </div>
                <div className="flex gap-1.5 opacity-50">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
              </div>

              {/* Connection Point */}
              <div
                ref={settingsPanelRef}
                className="absolute top-1/2 -left-1.5 w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)] z-50 ring-2 ring-background"
              />

              <div className="p-4 space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Typography
                  </div>
                  <div className="flex items-center justify-between bg-muted/30 p-1.5 rounded border border-border/50">
                    <span className="text-foreground">Font</span>
                    <span className="text-muted-foreground text-[10px]">
                      Inter
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center justify-between bg-muted/30 p-1.5 rounded border border-border/50">
                      <span className="text-foreground">Size</span>
                      <span className="text-muted-foreground text-[10px]">
                        16px
                      </span>
                    </div>
                    <div className="flex-1 flex items-center justify-between bg-muted/30 p-1.5 rounded border border-border/50">
                      <span className="text-foreground">Weight</span>
                      <span className="text-muted-foreground text-[10px]">
                        500
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-border/40">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Layout
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-primary/10 border border-primary/20 p-1.5 rounded text-center text-primary font-medium">
                      Flex
                    </div>
                    <div className="bg-muted/30 border border-border/50 p-1.5 rounded text-center text-muted-foreground">
                      Grid
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 4. Central Rotatable Stack (Static Rotation) */}
          <div className="absolute inset-0 flex items-center justify-center mt-8">
            <motion.div
              style={{ transformStyle: "preserve-3d" }}
              animate={{
                rotateX: [0, 5, 0],
                rotateY: [0, 5, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-[85%] max-w-[650px] aspect-video"
            >
              {/* --- Layer C (Back): Wireframe/Blueprint --- */}
              <motion.div
                initial={{ opacity: 0, z: 0 }}
                animate={{ opacity: 1, z: -60 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="absolute inset-0 z-0 group rounded-xl"
                style={{ transform: "translateZ(-60px)" }}
              >
                <div className="w-full h-full border border-dashed border-primary/20 rounded-xl bg-background/30 backdrop-blur-sm relative overflow-hidden">
                  {/* Scanning Effect */}
                  <motion.div
                    className="absolute top-0 w-full h-px bg-primary/40 shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)]"
                    animate={{ top: ["0%", "100%"] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* Blueprint Grid */}
                  <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-2 p-4 opacity-20">
                    <div className="col-span-12 row-span-1 border border-primary/30 bg-primary/5" />
                    <div className="col-span-12 row-span-4 border border-primary/30 bg-primary/5 grid grid-cols-2 gap-4 p-2">
                      <div className="col-span-1 border border-primary/30" />
                      <div className="col-span-1 border border-primary/30" />
                    </div>
                    <div className="col-span-12 row-span-1 border border-primary/30 bg-primary/5" />
                  </div>
                </div>
                {/* Vertical Connectors */}
                <div className="absolute -bottom-12 left-12 w-px h-24 border-l border-dashed border-primary/20" />
                <div className="absolute -bottom-12 right-12 w-px h-24 border-l border-dashed border-primary/20" />
              </motion.div>

              {/* --- Layer B (Middle): Skeleton --- */}
              <motion.div
                initial={{ opacity: 0, z: 0 }}
                animate={{ opacity: 1, z: 0 }}
                transition={{ delay: 0.7, duration: 1 }}
                className="absolute inset-0 z-10"
                style={{ transform: "translateZ(0px)" }}
              >
                <div className="w-full h-full border border-white/10 rounded-xl bg-card/40 backdrop-blur-md shadow-xl flex flex-col p-8 items-center justify-center gap-6 relative ring-1 ring-black/5">
                  {/* Connection Node */}
                  <div
                    ref={centerLeftRef}
                    className="absolute top-1/2 -left-4 w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center bg-background z-20 shadow-lg"
                  >
                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
                  </div>

                  <div className="w-3/4 h-10 bg-muted/60 rounded-lg animate-pulse" />
                  <div className="space-y-3 w-full flex flex-col items-center">
                    <div className="w-11/12 h-3 bg-muted/40 rounded-full" />
                    <div className="w-9/12 h-3 bg-muted/40 rounded-full" />
                    <div className="w-10/12 h-3 bg-muted/40 rounded-full" />
                  </div>
                  <div className="flex gap-4 mt-4 w-full justify-center">
                    <div className="w-32 h-10 bg-muted/50 rounded-lg" />
                    <div className="w-32 h-10 bg-muted/20 rounded-lg" />
                  </div>
                </div>
              </motion.div>

              {/* --- Layer A (Front): Final UI --- */}
              <motion.div
                initial={{ opacity: 0, y: 40, z: 0 }}
                animate={{ opacity: 1, y: 40, z: 90 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="absolute inset-0 z-20 cursor-default"
                style={{ transform: "translateZ(90px)" }}
              >
                {/* Border Beam Effect */}
                <div className="absolute -inset-[1px] rounded-xl z-0">
                  <BorderBeam duration={8} />
                </div>

                <div className="w-full h-full border border-border/60 bg-card rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col relative ring-1 ring-white/10 group-hover/viz:shadow-[0_40px_80px_-20px_rgba(var(--primary-rgb),0.2)] transition-shadow duration-500 z-10">
                  {/* Connection Node Right */}
                  <div
                    ref={centerRightRef}
                    className="absolute top-1/4 -right-4 w-8 h-8 rounded-full border border-blue-500/30 flex items-center justify-center bg-background z-20 shadow-lg"
                  >
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  </div>

                  {/* Connection Node Settings (Top Right) */}
                  <div
                    ref={centerSettingsRef}
                    className="absolute bottom-1/4 -right-4 w-8 h-8 rounded-full border border-purple-500/30 flex items-center justify-center bg-background z-20 shadow-lg"
                  >
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                  </div>

                  {/* Window Controls */}
                  <div className="h-10 border-b border-border/50 bg-muted/30 flex items-center px-4 gap-2 justify-between backdrop-blur-sm">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400/80 border border-red-500/20" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400/80 border border-yellow-500/20" />
                      <div className="h-3 w-3 rounded-full bg-green-400/80 border border-green-500/20" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono bg-background/80 px-3 py-1 rounded-full border border-border/50 shadow-sm">
                      <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500/20" />
                      Preview Mode
                    </div>
                  </div>

                  {/* Final Content */}
                  <div className="flex-1 p-8 flex flex-col justify-center items-center text-center relative bg-gradient-to-b from-background to-muted/20">
                    <div className="space-y-4 relative group/ui max-w-md w-full">
                      {/* Hover Selection Rect - Simulating Editor Selection */}
                      <motion.div
                        className="absolute -inset-6 border-2 border-primary/50 rounded-xl opacity-0 group-hover/ui:opacity-100 transition-opacity pointer-events-none"
                        layoutId="selection-rect"
                        transition={{ duration: 0.2 }}
                      >
                        <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          Hero Container
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary border border-white" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary border border-white" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary border border-white" />
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary border border-white" />
                      </motion.div>

                      <h3 className="text-3xl font-bold text-foreground tracking-tight drop-shadow-sm">
                        Ready for production
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                        Export your visual designs as standard, semantic React
                        code. No lock-in. Just pure productivity.
                      </p>

                      {/* Animated Cursor */}
                      <motion.div
                        animate={{
                          x: [50, 20, 20, 50],
                          y: [50, 50, 20, 20],
                          opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          repeatDelay: 1,
                          ease: "easeInOut",
                          delay: 1.5,
                        }}
                        className="absolute right-0 bottom-0 z-50 text-primary pointer-events-none"
                      >
                        <MousePointer2 className="h-6 w-6 fill-primary/20 stroke-[2px] drop-shadow-lg" />
                        <div className="ml-4 mt-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                          Ghost User
                        </div>
                      </motion.div>
                    </div>

                    <div className="mt-8 flex gap-3 w-full justify-center">
                      <div className="h-10 px-6 bg-foreground text-background rounded-md text-sm font-medium flex items-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
                        Get Started
                      </div>
                      <div className="h-10 px-6 border border-border bg-background hover:bg-muted/50 rounded-md text-sm font-medium flex items-center transition-colors cursor-pointer">
                        Docs
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Animated Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={leftPanelRef}
        toRef={centerLeftRef}
        curvature={-50}
        startYOffset={0}
        endYOffset={0}
        dotted
        gradientStartColor="rgba(var(--primary-rgb), 0.5)"
        gradientStopColor="rgba(var(--primary-rgb), 1)"
        pathColor="rgba(var(--primary-rgb), 0.2)"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={rightPanelRef}
        toRef={centerRightRef}
        curvature={50}
        startYOffset={0}
        endYOffset={0}
        dotted
        reverse
        gradientStartColor="#3b82f6"
        gradientStopColor="#60a5fa"
        pathColor="rgba(59, 130, 246, 0.2)"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={settingsPanelRef}
        toRef={centerSettingsRef}
        curvature={-50}
        startYOffset={0}
        endYOffset={0}
        dotted
        reverse
        gradientStartColor="#a855f7"
        gradientStopColor="#c084fc"
        pathColor="rgba(168, 85, 247, 0.2)"
      />
    </div>
  );
}
