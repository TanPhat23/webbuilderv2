import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Moon, Sun, Code2, FileType, Hash, LayoutTemplate, Sparkles, ChevronRight, ArrowRight, Monitor, Layers, PanelTop, MoveUpRight, Terminal, Cpu, Zap, MousePointer2, Palette, Code, Smartphone, Star, Building2, Check, PlusIcon, User, LayoutDashboard, Menu, X } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import React__default, { useState, useEffect, useId, useRef } from "react";
import { B as Button, j as cn, f as Badge, T as Tabs, g as TabsList, h as TabsTrigger } from "./prisma-Cq49YOYM.js";
import { useTheme } from "next-themes";
import { motion, useScroll, useTransform } from "framer-motion";
import "sonner";
import "clsx";
import "socket.io-client";
import { u as useInView } from "./useInView-BXOOtJcA.js";
import "@hookform/resolvers/zod";
import { C as Card, b as CardHeader, d as CardDescription, a as CardContent, c as CardTitle, e as CardFooter } from "./card-LOcGasZb.js";
import NumberFlow from "@number-flow/react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { A as Accordion, a as AccordionItem, b as AccordionContent } from "./accordion-Dg3retHz.js";
import { useUser } from "@clerk/react";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "uuid";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "react-hook-form";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isDark = resolvedTheme === "dark";
  if (!mounted) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    Button,
    {
      onClick: () => setTheme(isDark ? "light" : "dark"),
      "aria-label": `Switch to ${isDark ? "light" : "dark"} mode`,
      variant: "outline",
      size: "icon",
      children: isDark ? /* @__PURE__ */ jsx(Moon, {}) : /* @__PURE__ */ jsx(Sun, {})
    }
  );
}
const FloatingParticle = ({
  delay,
  x,
  y,
  Icon,
  color = "text-primary/20",
  size = "w-6 h-6"
}) => /* @__PURE__ */ jsx(
  motion.div,
  {
    initial: { opacity: 0, y: 0, scale: 0.5 },
    animate: {
      opacity: [0, 0.8, 0],
      y: -150,
      x: [0, Math.random() * 40 - 20],
      scale: [0.5, 1.2, 0.5],
      rotate: [0, Math.random() * 90 - 45]
    },
    transition: {
      duration: Math.random() * 5 + 10,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    },
    style: { left: x, top: y },
    className: cn("absolute pointer-events-none z-0 filter blur-[1px]", color),
    children: /* @__PURE__ */ jsx(Icon, { className: size })
  }
);
const GridPattern = () => /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-0 pointer-events-none overflow-hidden select-none", children: [
  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" }),
  /* @__PURE__ */ jsx(
    motion.div,
    {
      animate: {
        backgroundPosition: ["0% 0%", "100% 100%"]
      },
      transition: {
        duration: 60,
        repeat: Infinity,
        ease: "linear"
      },
      className: "absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:96px_96px] opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
    }
  )
] });
const BorderBeam = ({
  duration = 4,
  className
}) => {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(
          motion.div,
          {
            className: "absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent",
            animate: {
              x: ["-100%", "100%"]
            },
            transition: {
              duration,
              ease: "linear",
              repeat: Infinity
            }
          }
        ),
        /* @__PURE__ */ jsx(
          motion.div,
          {
            className: "absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary to-transparent",
            animate: {
              y: ["-100%", "100%"]
            },
            transition: {
              duration,
              ease: "linear",
              repeat: Infinity,
              delay: duration / 4
            }
          }
        ),
        /* @__PURE__ */ jsx(
          motion.div,
          {
            className: "absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-transparent via-primary to-transparent",
            animate: {
              x: ["100%", "-100%"]
            },
            transition: {
              duration,
              ease: "linear",
              repeat: Infinity,
              delay: duration / 2
            }
          }
        ),
        /* @__PURE__ */ jsx(
          motion.div,
          {
            className: "absolute bottom-0 left-0 w-[1px] h-full bg-gradient-to-t from-transparent via-primary to-transparent",
            animate: {
              y: ["100%", "-100%"]
            },
            transition: {
              duration,
              ease: "linear",
              repeat: Infinity,
              delay: duration * 3 / 4
            }
          }
        )
      ]
    }
  );
};
const HeroHighlight = () => {
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      className: "absolute inset-0 z-0 opacity-100 transition duration-300 pointer-events-none",
      style: {
        background: `radial-gradient(
          800px circle at 50% 30%,
          rgba(var(--primary-rgb), 0.06),
          transparent 80%
        )`
      }
    }
  );
};
const AnimatedBeam = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = Math.random() * 3 + 4,
  delay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  dotted = false
}) => {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const gradientCoordinates = reverse ? {
    x1: ["90%", "-10%"],
    x2: ["100%", "0%"],
    y1: ["0%", "0%"],
    y2: ["0%", "0%"]
  } : {
    x1: ["10%", "110%"],
    x2: ["0%", "100%"],
    y1: ["0%", "0%"],
    y2: ["0%", "0%"]
  };
  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();
        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({ width: svgWidth, height: svgHeight });
        const startX = rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY = rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX = rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY = rectB.top - containerRect.top + rectB.height / 2 + endYOffset;
        const controlY = startY - curvature;
        const d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`;
        setPathD(d);
      }
    };
    const resizeObserver = new ResizeObserver((entries) => {
      updatePath();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    updatePath();
    let animationFrameId;
    const loop = () => {
      updatePath();
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset
  ]);
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      fill: "none",
      width: svgDimensions.width,
      height: svgDimensions.height,
      xmlns: "http://www.w3.org/2000/svg",
      className: cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu stroke-2 z-10",
        className
      ),
      viewBox: `0 0 ${svgDimensions.width} ${svgDimensions.height}`,
      children: [
        /* @__PURE__ */ jsx(
          "path",
          {
            d: pathD,
            stroke: pathColor,
            strokeWidth: pathWidth,
            strokeOpacity: pathOpacity,
            strokeLinecap: "round",
            strokeDasharray: dotted ? "4 4" : "none"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: pathD,
            strokeWidth: pathWidth,
            stroke: `url(#${id})`,
            strokeOpacity: "1",
            strokeLinecap: "round"
          }
        ),
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs(
          motion.linearGradient,
          {
            className: "transform-gpu",
            id,
            gradientUnits: "userSpaceOnUse",
            initial: {
              x1: "0%",
              x2: "0%",
              y1: "0%",
              y2: "0%"
            },
            animate: {
              x1: gradientCoordinates.x1,
              x2: gradientCoordinates.x2,
              y1: gradientCoordinates.y1,
              y2: gradientCoordinates.y2
            },
            transition: {
              delay,
              duration,
              ease: [0.16, 1, 0.3, 1],
              repeat: Infinity,
              repeatDelay: 0
            },
            children: [
              /* @__PURE__ */ jsx("stop", { stopColor: gradientStartColor, stopOpacity: "0" }),
              /* @__PURE__ */ jsx("stop", { stopColor: gradientStartColor }),
              /* @__PURE__ */ jsx("stop", { offset: "32.5%", stopColor: gradientStopColor }),
              /* @__PURE__ */ jsx(
                "stop",
                {
                  offset: "100%",
                  stopColor: gradientStopColor,
                  stopOpacity: "0"
                }
              )
            ]
          }
        ) })
      ]
    }
  );
};
function LandingPageHero() {
  const containerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const settingsPanelRef = useRef(null);
  const centerLeftRef = useRef(null);
  const centerRightRef = useRef(null);
  const centerSettingsRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const y3 = useTransform(scrollY, [0, 500], [0, 80]);
  const [typedValue, setTypedValue] = useState("");
  const codeString = "flex-col items-center justify-center p-4 gap-4";
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    let currentIndex = 0;
    let isDeleting = false;
    let timeout;
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
        typeSpeed = 3e3;
      } else if (isDeleting && currentIndex === 0) {
        isDeleting = false;
        typeSpeed = 500;
      }
      timeout = setTimeout(type, typeSpeed);
    };
    timeout = setTimeout(type, 1e3);
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => {
      clearTimeout(timeout);
      clearInterval(cursorInterval);
    };
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: containerRef,
      className: "bg-background relative w-full overflow-hidden border-b border-border/40 pb-20 pt-24 lg:pt-40 perspective-[2000px] min-h-screen flex flex-col items-center",
      children: [
        /* @__PURE__ */ jsx(GridPattern, {}),
        /* @__PURE__ */ jsx(HeroHighlight, {}),
        /* @__PURE__ */ jsx(
          FloatingParticle,
          {
            delay: 0,
            x: "10%",
            y: "70%",
            Icon: Code2,
            color: "text-blue-500/30"
          }
        ),
        /* @__PURE__ */ jsx(
          FloatingParticle,
          {
            delay: 2,
            x: "85%",
            y: "60%",
            Icon: FileType,
            color: "text-purple-500/30"
          }
        ),
        /* @__PURE__ */ jsx(
          FloatingParticle,
          {
            delay: 4,
            x: "15%",
            y: "30%",
            Icon: Hash,
            color: "text-green-500/30"
          }
        ),
        /* @__PURE__ */ jsx(
          FloatingParticle,
          {
            delay: 1,
            x: "80%",
            y: "20%",
            Icon: LayoutTemplate,
            color: "text-orange-500/30"
          }
        ),
        /* @__PURE__ */ jsx(
          FloatingParticle,
          {
            delay: 5,
            x: "50%",
            y: "50%",
            Icon: Sparkles,
            color: "text-yellow-500/20",
            size: "w-4 h-4"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 container mx-auto px-4 flex flex-col items-center select-none", children: [
          /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl text-center", children: [
            /* @__PURE__ */ jsx(
              motion.div,
              {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6, ease: "easeOut" },
                className: "mx-auto mb-8 flex justify-center",
                children: /* @__PURE__ */ jsxs("div", { className: "relative group inline-flex items-center rounded-full p-[1px]", children: [
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" }),
                  /* @__PURE__ */ jsxs("div", { className: "relative bg-background/80 border border-border/60 rounded-full px-4 py-1.5 flex items-center backdrop-blur-md shadow-sm ring-1 ring-white/10 group-hover:border-primary/30 transition-colors", children: [
                    /* @__PURE__ */ jsxs("span", { className: "text-foreground flex items-center gap-2 font-medium text-xs sm:text-sm", children: [
                      /* @__PURE__ */ jsxs("div", { className: "relative flex h-2 w-2", children: [
                        /* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" }),
                        /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-green-500" })
                      ] }),
                      "Visual Builder v2.0"
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "mx-3 h-4 w-px bg-border/60" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground flex items-center gap-1 text-xs sm:text-sm group-hover:text-primary transition-colors", children: [
                      "Production Ready",
                      /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 ml-1" })
                    ] })
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsxs("h1", { className: "text-5xl font-bold tracking-tight text-foreground sm:text-7xl lg:text-8xl relative z-20 mb-6 leading-[1.1]", children: [
              /* @__PURE__ */ jsx(
                motion.div,
                {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.8, ease: "easeOut" },
                  children: "Compose visually."
                }
              ),
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.8, ease: "easeOut", delay: 0.2 },
                  className: "relative inline-block mt-2",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "relative z-10 bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground/90 to-foreground/50 pb-2", children: "Export structurally." }),
                    /* @__PURE__ */ jsx(
                      motion.span,
                      {
                        initial: { width: "0%" },
                        animate: { width: "100%" },
                        transition: { delay: 1, duration: 1.2, ease: "circOut" },
                        className: "absolute bottom-2 left-0 h-3/6 w-full bg-blue-500/10 -z-10 blur-xl rounded-full mix-blend-multiply dark:mix-blend-screen"
                      }
                    )
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              motion.p,
              {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.4, duration: 0.8 },
                className: "text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl leading-relaxed mb-10",
                children: "See the structure behind the design. Build complex layouts by layering components, applying styles, and generating clean, semantic code instantly."
              }
            ),
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.5, duration: 0.8 },
                className: "flex flex-col items-center justify-center gap-4 sm:flex-row mb-24 relative z-30",
                children: [
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      size: "lg",
                      className: "group relative h-12 min-w-40 overflow-hidden rounded-full text-base font-semibold shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.5)] hover:shadow-[0_0_60px_-15px_rgba(var(--primary-rgb),0.6)] hover:scale-105 transition-all duration-300",
                      asChild: true,
                      children: /* @__PURE__ */ jsxs(Link, { to: "/dashboard", children: [
                        /* @__PURE__ */ jsx(
                          motion.span,
                          {
                            className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-10",
                            initial: { x: "-100%" },
                            whileHover: { x: "100%" },
                            transition: {
                              repeat: Infinity,
                              duration: 1.5,
                              ease: "linear"
                            }
                          }
                        ),
                        /* @__PURE__ */ jsxs("span", { className: "relative z-20 flex items-center", children: [
                          "Start Building",
                          /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" })
                        ] })
                      ] })
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      size: "lg",
                      variant: "outline",
                      className: "h-12 min-w-40 rounded-full text-base font-semibold bg-background/50 backdrop-blur-sm hover:bg-muted/50 border-border/50 hover:border-primary/20 transition-all duration-300",
                      children: [
                        /* @__PURE__ */ jsx(Monitor, { className: "mr-2 h-4 w-4" }),
                        "Live Demo"
                      ]
                    }
                  )
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-[1000px] h-[600px] perspective-[2000px] group/viz", children: [
            /* @__PURE__ */ jsx(
              motion.div,
              {
                style: { y: y1 },
                initial: { x: -40, opacity: 0 },
                animate: { x: 0, opacity: 1 },
                transition: { delay: 0.8, duration: 1 },
                className: "absolute -left-4 lg:-left-20 top-20 z-30 hidden md:block",
                children: /* @__PURE__ */ jsxs("div", { className: "border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl w-72 rounded-xl overflow-hidden ring-1 ring-white/10 transform hover:scale-105 transition-transform duration-300 hover:shadow-primary/5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 px-4 py-3 border-b border-border/40 flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: [
                      /* @__PURE__ */ jsx(Layers, { className: "h-3.5 w-3.5" }),
                      " Structure"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5 opacity-50", children: [
                      /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-border" }),
                      /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-border" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      ref: leftPanelRef,
                      className: "absolute top-1/2 -right-1.5 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] z-50 ring-2 ring-background"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-1 font-mono text-xs relative", children: [
                    /* @__PURE__ */ jsx("div", { className: "absolute left-[1.35rem] top-10 bottom-4 w-px bg-border/50" }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground py-1 px-2 rounded hover:bg-muted/50 transition-colors", children: [
                      /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 rotate-90" }),
                      /* @__PURE__ */ jsx("span", { className: "opacity-75", children: "Page" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "pl-4", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-primary font-medium py-1.5 px-2 bg-primary/10 rounded-md border border-primary/20 relative overflow-hidden group/item", children: [
                        /* @__PURE__ */ jsx(
                          motion.div,
                          {
                            className: "absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent",
                            initial: { x: "-100%" },
                            animate: { x: "100%" },
                            transition: {
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                              repeatDelay: 1
                            }
                          }
                        ),
                        /* @__PURE__ */ jsx(PanelTop, { className: "h-3 w-3 relative z-10" }),
                        /* @__PURE__ */ jsx("span", { className: "relative z-10", children: "Hero_Section" })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "pl-6 space-y-1 mt-2", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground py-1 pl-3 hover:text-foreground transition-colors cursor-default hover:bg-muted/30 rounded-sm", children: [
                          /* @__PURE__ */ jsx("div", { className: "w-3 border-t border-border/50 -ml-5 mr-1" }),
                          /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3" }),
                          " Heading"
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground py-1 pl-3 hover:text-foreground transition-colors cursor-default hover:bg-muted/30 rounded-sm", children: [
                          /* @__PURE__ */ jsx("div", { className: "w-3 border-t border-border/50 -ml-5 mr-1" }),
                          /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3" }),
                          " Subtext"
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground py-1 pl-3 hover:text-foreground transition-colors cursor-default hover:bg-muted/30 rounded-sm", children: [
                          /* @__PURE__ */ jsx("div", { className: "w-3 border-t border-border/50 -ml-5 mr-1" }),
                          /* @__PURE__ */ jsx(MoveUpRight, { className: "h-3 w-3" }),
                          " Actions_Row"
                        ] })
                      ] })
                    ] })
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              motion.div,
              {
                style: { y: y2 },
                initial: { x: 40, opacity: 0 },
                animate: { x: 0, opacity: 1 },
                transition: { delay: 0.9, duration: 1 },
                className: "absolute -right-7 lg:-right-46 bottom-32 z-30 hidden md:block",
                children: /* @__PURE__ */ jsxs("div", { className: "border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl w-80 rounded-xl overflow-hidden ring-1 ring-white/10 transform hover:scale-105 transition-transform duration-300 hover:shadow-blue-500/5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 px-4 py-3 border-b border-border/40 flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: [
                      /* @__PURE__ */ jsx(Terminal, { className: "h-3.5 w-3.5" }),
                      " Code Output"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx("div", { className: "px-1.5 py-0.5 rounded bg-blue-500/10 text-[10px] text-blue-500 font-mono font-medium border border-blue-500/20", children: "TSX" }),
                      /* @__PURE__ */ jsx(Cpu, { className: "h-3.5 w-3.5 text-muted-foreground animate-pulse" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      ref: rightPanelRef,
                      className: "absolute top-1/2 -left-1.5 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] z-50 ring-2 ring-background"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-2 font-mono text-[11px] bg-black/5 leading-relaxed", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pb-2 border-b border-dashed border-border/50 mb-2 text-xs", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-purple-400", children: "export" }),
                      /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "default" }),
                      /* @__PURE__ */ jsx("span", { className: "text-blue-400", children: "function" }),
                      /* @__PURE__ */ jsx("span", { className: "text-yellow-400", children: "Hero" }),
                      "() {"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 pl-2 border-l-2 border-border/30 ml-1", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex group", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground mr-2", children: "return" }),
                        /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "(" })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "pl-4", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-blue-400", children: "<div" }),
                        /* @__PURE__ */ jsx("span", { className: "text-purple-400", children: " className" }),
                        "=",
                        /* @__PURE__ */ jsx("span", { className: "text-green-400", children: '"w-full h-screen..."' }),
                        /* @__PURE__ */ jsx("span", { className: "text-blue-400", children: ">" })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "pl-6 py-1 bg-blue-500/5 -mx-4 border-l-2 border-blue-500 transition-colors duration-300", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-blue-400", children: "<div" }),
                        /* @__PURE__ */ jsx("span", { className: "text-purple-400", children: " className" }),
                        '="',
                        /* @__PURE__ */ jsx("span", { className: "text-green-400 font-semibold break-all", children: typedValue }),
                        showCursor && /* @__PURE__ */ jsx("span", { className: "text-blue-500 animate-pulse font-bold", children: "|" }),
                        '"',
                        /* @__PURE__ */ jsx("span", { className: "text-blue-400", children: ">" })
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "pl-8 text-muted-foreground", children: "..." }),
                      /* @__PURE__ */ jsx("div", { className: "pl-6", children: /* @__PURE__ */ jsx("span", { className: "text-blue-400", children: "</div>" }) }),
                      /* @__PURE__ */ jsx("div", { className: "pl-4", children: /* @__PURE__ */ jsx("span", { className: "text-blue-400", children: "</div>" }) }),
                      /* @__PURE__ */ jsx("div", { className: "text-foreground", children: ")" })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "text-foreground", children: "}" })
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              motion.div,
              {
                style: { y: y3 },
                initial: { x: 40, opacity: 0 },
                animate: { x: 0, opacity: 1 },
                transition: { delay: 1, duration: 1 },
                className: "absolute -right-24 lg:-right-32 top-64 z-30 hidden md:block",
                children: /* @__PURE__ */ jsxs("div", { className: "border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl w-64 rounded-xl overflow-hidden ring-1 ring-white/10 transform hover:scale-105 transition-transform duration-300 hover:shadow-purple-500/5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 px-4 py-3 border-b border-border/40 flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: [
                      /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5" }),
                      " Properties"
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 opacity-50", children: /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-border" }) })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      ref: settingsPanelRef,
                      className: "absolute top-1/2 -left-1.5 w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)] z-50 ring-2 ring-background"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-3 font-mono text-xs", children: [
                    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground uppercase tracking-wider font-semibold", children: "Typography" }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between bg-muted/30 p-1.5 rounded border border-border/50", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "Font" }),
                        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-[10px]", children: "Inter" })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex-1 flex items-center justify-between bg-muted/30 p-1.5 rounded border border-border/50", children: [
                          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "Size" }),
                          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-[10px]", children: "16px" })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex-1 flex items-center justify-between bg-muted/30 p-1.5 rounded border border-border/50", children: [
                          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "Weight" }),
                          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-[10px]", children: "500" })
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-1 pt-2 border-t border-border/40", children: [
                      /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground uppercase tracking-wider font-semibold", children: "Layout" }),
                      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                        /* @__PURE__ */ jsx("div", { className: "bg-primary/10 border border-primary/20 p-1.5 rounded text-center text-primary font-medium", children: "Flex" }),
                        /* @__PURE__ */ jsx("div", { className: "bg-muted/30 border border-border/50 p-1.5 rounded text-center text-muted-foreground", children: "Grid" })
                      ] })
                    ] })
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center mt-8", children: /* @__PURE__ */ jsxs(
              motion.div,
              {
                style: { transformStyle: "preserve-3d" },
                animate: {
                  rotateX: [0, 5, 0],
                  rotateY: [0, 5, 0]
                },
                transition: {
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                className: "relative w-[85%] max-w-[650px] aspect-video",
                children: [
                  /* @__PURE__ */ jsxs(
                    motion.div,
                    {
                      initial: { opacity: 0, z: 0 },
                      animate: { opacity: 1, z: -60 },
                      transition: { delay: 0.6, duration: 1 },
                      className: "absolute inset-0 z-0 group rounded-xl",
                      style: { transform: "translateZ(-60px)" },
                      children: [
                        /* @__PURE__ */ jsxs("div", { className: "w-full h-full border border-dashed border-primary/20 rounded-xl bg-background/30 backdrop-blur-sm relative overflow-hidden", children: [
                          /* @__PURE__ */ jsx(
                            motion.div,
                            {
                              className: "absolute top-0 w-full h-px bg-primary/40 shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)]",
                              animate: { top: ["0%", "100%"] },
                              transition: {
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                              }
                            }
                          ),
                          /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 grid grid-cols-12 grid-rows-6 gap-2 p-4 opacity-20", children: [
                            /* @__PURE__ */ jsx("div", { className: "col-span-12 row-span-1 border border-primary/30 bg-primary/5" }),
                            /* @__PURE__ */ jsxs("div", { className: "col-span-12 row-span-4 border border-primary/30 bg-primary/5 grid grid-cols-2 gap-4 p-2", children: [
                              /* @__PURE__ */ jsx("div", { className: "col-span-1 border border-primary/30" }),
                              /* @__PURE__ */ jsx("div", { className: "col-span-1 border border-primary/30" })
                            ] }),
                            /* @__PURE__ */ jsx("div", { className: "col-span-12 row-span-1 border border-primary/30 bg-primary/5" })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx("div", { className: "absolute -bottom-12 left-12 w-px h-24 border-l border-dashed border-primary/20" }),
                        /* @__PURE__ */ jsx("div", { className: "absolute -bottom-12 right-12 w-px h-24 border-l border-dashed border-primary/20" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      initial: { opacity: 0, z: 0 },
                      animate: { opacity: 1, z: 0 },
                      transition: { delay: 0.7, duration: 1 },
                      className: "absolute inset-0 z-10",
                      style: { transform: "translateZ(0px)" },
                      children: /* @__PURE__ */ jsxs("div", { className: "w-full h-full border border-white/10 rounded-xl bg-card/40 backdrop-blur-md shadow-xl flex flex-col p-8 items-center justify-center gap-6 relative ring-1 ring-black/5", children: [
                        /* @__PURE__ */ jsx(
                          "div",
                          {
                            ref: centerLeftRef,
                            className: "absolute top-1/2 -left-4 w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center bg-background z-20 shadow-lg",
                            children: /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" })
                          }
                        ),
                        /* @__PURE__ */ jsx("div", { className: "w-3/4 h-10 bg-muted/60 rounded-lg animate-pulse" }),
                        /* @__PURE__ */ jsxs("div", { className: "space-y-3 w-full flex flex-col items-center", children: [
                          /* @__PURE__ */ jsx("div", { className: "w-11/12 h-3 bg-muted/40 rounded-full" }),
                          /* @__PURE__ */ jsx("div", { className: "w-9/12 h-3 bg-muted/40 rounded-full" }),
                          /* @__PURE__ */ jsx("div", { className: "w-10/12 h-3 bg-muted/40 rounded-full" })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex gap-4 mt-4 w-full justify-center", children: [
                          /* @__PURE__ */ jsx("div", { className: "w-32 h-10 bg-muted/50 rounded-lg" }),
                          /* @__PURE__ */ jsx("div", { className: "w-32 h-10 bg-muted/20 rounded-lg" })
                        ] })
                      ] })
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    motion.div,
                    {
                      initial: { opacity: 0, y: 40, z: 0 },
                      animate: { opacity: 1, y: 40, z: 90 },
                      transition: { delay: 0.8, duration: 1 },
                      className: "absolute inset-0 z-20 cursor-default",
                      style: { transform: "translateZ(90px)" },
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "absolute -inset-[1px] rounded-xl z-0", children: /* @__PURE__ */ jsx(BorderBeam, { duration: 8 }) }),
                        /* @__PURE__ */ jsxs("div", { className: "w-full h-full border border-border/60 bg-card rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col relative ring-1 ring-white/10 group-hover/viz:shadow-[0_40px_80px_-20px_rgba(var(--primary-rgb),0.2)] transition-shadow duration-500 z-10", children: [
                          /* @__PURE__ */ jsx(
                            "div",
                            {
                              ref: centerRightRef,
                              className: "absolute top-1/4 -right-4 w-8 h-8 rounded-full border border-blue-500/30 flex items-center justify-center bg-background z-20 shadow-lg",
                              children: /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" })
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "div",
                            {
                              ref: centerSettingsRef,
                              className: "absolute bottom-1/4 -right-4 w-8 h-8 rounded-full border border-purple-500/30 flex items-center justify-center bg-background z-20 shadow-lg",
                              children: /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]" })
                            }
                          ),
                          /* @__PURE__ */ jsxs("div", { className: "h-10 border-b border-border/50 bg-muted/30 flex items-center px-4 gap-2 justify-between backdrop-blur-sm", children: [
                            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                              /* @__PURE__ */ jsx("div", { className: "h-3 w-3 rounded-full bg-red-400/80 border border-red-500/20" }),
                              /* @__PURE__ */ jsx("div", { className: "h-3 w-3 rounded-full bg-yellow-400/80 border border-yellow-500/20" }),
                              /* @__PURE__ */ jsx("div", { className: "h-3 w-3 rounded-full bg-green-400/80 border border-green-500/20" })
                            ] }),
                            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px] text-muted-foreground font-mono bg-background/80 px-3 py-1 rounded-full border border-border/50 shadow-sm", children: [
                              /* @__PURE__ */ jsx(Zap, { className: "w-3 h-3 text-yellow-500 fill-yellow-500/20" }),
                              "Preview Mode"
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { className: "flex-1 p-8 flex flex-col justify-center items-center text-center relative bg-gradient-to-b from-background to-muted/20", children: [
                            /* @__PURE__ */ jsxs("div", { className: "space-y-4 relative group/ui max-w-md w-full", children: [
                              /* @__PURE__ */ jsxs(
                                motion.div,
                                {
                                  className: "absolute -inset-6 border-2 border-primary/50 rounded-xl opacity-0 group-hover/ui:opacity-100 transition-opacity pointer-events-none",
                                  layoutId: "selection-rect",
                                  transition: { duration: 0.2 },
                                  children: [
                                    /* @__PURE__ */ jsx("div", { className: "absolute -top-3 left-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm", children: "Hero Container" }),
                                    /* @__PURE__ */ jsx("div", { className: "absolute -bottom-1 -right-1 w-2 h-2 bg-primary border border-white" }),
                                    /* @__PURE__ */ jsx("div", { className: "absolute -bottom-1 -left-1 w-2 h-2 bg-primary border border-white" }),
                                    /* @__PURE__ */ jsx("div", { className: "absolute -top-1 -right-1 w-2 h-2 bg-primary border border-white" }),
                                    /* @__PURE__ */ jsx("div", { className: "absolute -top-1 -left-1 w-2 h-2 bg-primary border border-white" })
                                  ]
                                }
                              ),
                              /* @__PURE__ */ jsx("h3", { className: "text-3xl font-bold text-foreground tracking-tight drop-shadow-sm", children: "Ready for production" }),
                              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto", children: "Export your visual designs as standard, semantic React code. No lock-in. Just pure productivity." }),
                              /* @__PURE__ */ jsxs(
                                motion.div,
                                {
                                  animate: {
                                    x: [50, 20, 20, 50],
                                    y: [50, 50, 20, 20],
                                    opacity: [0, 1, 1, 0]
                                  },
                                  transition: {
                                    duration: 4,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                    ease: "easeInOut",
                                    delay: 1.5
                                  },
                                  className: "absolute right-0 bottom-0 z-50 text-primary pointer-events-none",
                                  children: [
                                    /* @__PURE__ */ jsx(MousePointer2, { className: "h-6 w-6 fill-primary/20 stroke-[2px] drop-shadow-lg" }),
                                    /* @__PURE__ */ jsx("div", { className: "ml-4 mt-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap", children: "Ghost User" })
                                  ]
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsxs("div", { className: "mt-8 flex gap-3 w-full justify-center", children: [
                              /* @__PURE__ */ jsx("div", { className: "h-10 px-6 bg-foreground text-background rounded-md text-sm font-medium flex items-center shadow-lg hover:scale-105 transition-transform cursor-pointer", children: "Get Started" }),
                              /* @__PURE__ */ jsx("div", { className: "h-10 px-6 border border-border bg-background hover:bg-muted/50 rounded-md text-sm font-medium flex items-center transition-colors cursor-pointer", children: "Docs" })
                            ] })
                          ] })
                        ] })
                      ]
                    }
                  )
                ]
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          AnimatedBeam,
          {
            containerRef,
            fromRef: leftPanelRef,
            toRef: centerLeftRef,
            curvature: -50,
            startYOffset: 0,
            endYOffset: 0,
            dotted: true,
            gradientStartColor: "rgba(var(--primary-rgb), 0.5)",
            gradientStopColor: "rgba(var(--primary-rgb), 1)",
            pathColor: "rgba(var(--primary-rgb), 0.2)"
          }
        ),
        /* @__PURE__ */ jsx(
          AnimatedBeam,
          {
            containerRef,
            fromRef: rightPanelRef,
            toRef: centerRightRef,
            curvature: 50,
            startYOffset: 0,
            endYOffset: 0,
            dotted: true,
            reverse: true,
            gradientStartColor: "#3b82f6",
            gradientStopColor: "#60a5fa",
            pathColor: "rgba(59, 130, 246, 0.2)"
          }
        ),
        /* @__PURE__ */ jsx(
          AnimatedBeam,
          {
            containerRef,
            fromRef: settingsPanelRef,
            toRef: centerSettingsRef,
            curvature: -50,
            startYOffset: 0,
            endYOffset: 0,
            dotted: true,
            reverse: true,
            gradientStartColor: "#a855f7",
            gradientStopColor: "#c084fc",
            pathColor: "rgba(168, 85, 247, 0.2)"
          }
        )
      ]
    }
  );
}
const stats = [
  { value: "50K+", label: "Websites Created" },
  { value: "99.9%", label: "Uptime" },
  { value: "<2s", label: "Load Time" },
  { value: "4.9★", label: "User Rating" }
];
function LandingPageStats() {
  const [ref, inView] = useInView();
  return /* @__PURE__ */ jsx(
    "section",
    {
      ref,
      className: "py-16 bg-gradient-to-r from-accent/5 via-background to-primary/5",
      children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 lg:px-6", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-8 text-center", children: stats.map((stat, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `space-y-2 group transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
          style: { transitionDelay: `${index * 150}ms` },
          children: [
            /* @__PURE__ */ jsx("div", { className: "text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300", children: stat.value }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: stat.label })
          ]
        },
        index
      )) }) })
    }
  );
}
const features = [
  {
    icon: Palette,
    title: "Drag & Drop Builder",
    desc: "Create websites visually with our intuitive drag-and-drop interface. No coding knowledge required."
  },
  {
    icon: Sparkles,
    title: "Pre-built Components",
    desc: "Choose from hundreds of professionally designed components. Headers, footers, and forms."
  },
  {
    icon: Code,
    title: "Clean Code Export",
    desc: "Export production-ready React/Next.js code. No vendor lock-in - take your code anywhere."
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    desc: "All designs automatically adapt to mobile, tablet, and desktop. Perfect on every device."
  }
];
function LandingPageFeature() {
  return /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden py-24 lg:py-32", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-96 blur-[120px] opacity-20 pointer-events-none bg-primary",
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 md:px-8", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 space-y-6", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary", children: "Features" }),
        /* @__PURE__ */ jsxs("h2", { className: "text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl", children: [
          "Everything you need to build",
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "amazing" }),
          " websites"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "max-w-[600px] text-lg text-muted-foreground", children: "WebBuilder provides all the tools you need to create professional websites without writing a single line of code." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4 sm:-skew-x-12 sm:-ml-16 lg:-ml-32", children: features.map((feature, i) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: cn(
            "group relative border border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50 shadow-2xl p-6 rounded-xl transition-all duration-300 hover:-translate-y-1"
          ),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-2", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground", children: /* @__PURE__ */ jsx(feature.icon, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold tracking-tight", children: feature.title })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-muted-foreground", children: feature.desc })
          ]
        },
        i
      )) })
    ] }) })
  ] });
}
const testimonials = [
  {
    name: "Sarah Chen",
    role: "Freelance Designer",
    avatar: "S",
    content: "WebBuilder revolutionized how I create websites for clients. The drag-and-drop interface is so intuitive, and being able to export clean React code means I can customize further if needed.",
    rating: 5
  },
  {
    name: "Mike Rodriguez",
    role: "Restaurant Owner",
    avatar: "M",
    content: "I built my restaurant's website in just 2 hours with WebBuilder. No coding knowledge needed, and it looks completely professional. My online orders increased by 60%!",
    rating: 5
  },
  {
    name: "Emma Thompson",
    role: "Marketing Agency Founder",
    avatar: "E",
    content: "WebBuilder saves us weeks of development time. We can prototype, design, and launch client websites incredibly fast. The component library is fantastic.",
    rating: 5
  }
];
function LandingPageTestimonials() {
  const [ref, inView] = useInView();
  return /* @__PURE__ */ jsx(
    "section",
    {
      ref,
      id: "testimonials",
      className: "py-24 bg-gradient-to-r from-primary/5 via-background to-accent/5",
      children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-6", children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `text-center mb-20 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`,
            children: [
              /* @__PURE__ */ jsxs("h2", { className: "text-3xl lg:text-5xl font-bold mb-6", children: [
                "Loved by",
                " ",
                /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "creators worldwide" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground max-w-2xl mx-auto", children: "See what our community is saying about WebBuilder" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-8", children: testimonials.map((testimonial, index) => /* @__PURE__ */ jsxs(
          Card,
          {
            className: `bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-700 hover:-translate-y-2 group ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`,
            style: { transitionDelay: `${index * 200}ms` },
            children: [
              /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-4", children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-1", children: [...Array(testimonial.rating)].map((_, i) => /* @__PURE__ */ jsx(
                  Star,
                  {
                    className: "w-4 h-4 fill-primary text-primary group-hover:scale-110 transition-transform duration-300",
                    style: {
                      transitionDelay: `${i * 100}ms`
                    }
                  },
                  i
                )) }),
                /* @__PURE__ */ jsxs(CardDescription, { className: "text-base leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors duration-300", children: [
                  '"',
                  testimonial.content,
                  '"'
                ] })
              ] }),
              /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
                /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-semibold text-lg group-hover:scale-110 transition-transform duration-300", children: testimonial.avatar }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "font-semibold text-lg", children: testimonial.name }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: testimonial.role })
                ] })
              ] }) })
            ]
          },
          index
        )) })
      ] })
    }
  );
}
const pricingPlans = [
  {
    id: "hobby",
    name: "Hobby",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for personal projects",
    features: ["5 projects", "Basic components", "Community support"],
    popular: false,
    icon: Zap,
    cta: "Get Started Free"
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 12, yearly: 99 },
    description: "For professional developers",
    features: [
      "Unlimited projects",
      "All components",
      "Priority support",
      "Custom domains"
    ],
    popular: true,
    icon: Star,
    cta: "Start Pro Trial"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: { monthly: 49, yearly: 399 },
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "SSO",
      "Dedicated support",
      "SLA"
    ],
    popular: false,
    icon: Building2,
    cta: "Contact Sales"
  }
];
function LandingPagePricing() {
  const [frequency, setFrequency] = React__default.useState(
    "monthly"
  );
  const [mounted, setMounted] = React__default.useState(false);
  const navigate = useNavigate();
  React__default.useEffect(() => {
    setMounted(true);
  }, []);
  const handlePlanSelect = (planId) => {
    if (planId === "hobby") {
      navigate({ to: "/sign-up" });
      return;
    }
    navigate({ to: "/sign-up" });
  };
  if (!mounted) return null;
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full overflow-hidden px-4 py-24 text-center sm:px-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 -z-10 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-primary/10 absolute -top-[10%] left-[50%] h-[40%] w-[60%] -translate-x-1/2 rounded-full blur-3xl" }),
      /* @__PURE__ */ jsx("div", { className: "bg-primary/5 absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full blur-3xl" }),
      /* @__PURE__ */ jsx("div", { className: "bg-primary/5 absolute -bottom-[10%] -left-[10%] h-[40%] w-[40%] rounded-full blur-3xl" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center space-y-2", children: [
        /* @__PURE__ */ jsxs(
          Badge,
          {
            variant: "outline",
            className: "border-primary/20 bg-primary/5 mb-4 rounded-full px-4 py-1 text-sm font-medium",
            children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "text-primary mr-1 h-3.5 w-3.5 animate-pulse" }),
              "Pricing Plans"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          motion.h1,
          {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5 },
            className: "from-foreground to-foreground/30 bg-gradient-to-b bg-clip-text text-4xl font-bold text-transparent sm:text-5xl",
            children: "Pick the perfect plan for your needs"
          }
        ),
        /* @__PURE__ */ jsx(
          motion.p,
          {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5, delay: 0.1 },
            className: "text-muted-foreground max-w-md pt-2 text-lg",
            children: "Simple, transparent pricing that scales with your business. No hidden fees, no surprises."
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.4, delay: 0.2 },
          children: /* @__PURE__ */ jsx(
            Tabs,
            {
              defaultValue: frequency,
              onValueChange: (val) => setFrequency(val),
              className: "bg-muted/30 inline-block rounded-full p-1 shadow-sm",
              children: /* @__PURE__ */ jsxs(TabsList, { className: "bg-transparent", children: [
                /* @__PURE__ */ jsx(
                  TabsTrigger,
                  {
                    value: "monthly",
                    className: "data-[state=active]:bg-background rounded-full transition-all duration-300 data-[state=active]:shadow-sm",
                    children: "Monthly"
                  }
                ),
                /* @__PURE__ */ jsxs(
                  TabsTrigger,
                  {
                    value: "yearly",
                    className: "data-[state=active]:bg-background rounded-full transition-all duration-300 data-[state=active]:shadow-sm",
                    children: [
                      "Yearly",
                      /* @__PURE__ */ jsx(
                        Badge,
                        {
                          variant: "secondary",
                          className: "bg-primary/10 text-primary hover:bg-primary/15 ml-2",
                          children: "20% off"
                        }
                      )
                    ]
                  }
                )
              ] })
            }
          )
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "mt-8 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3", children: pricingPlans.map((plan, index) => /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: 0.1 + index * 0.1 },
          whileHover: { y: -5 },
          className: "flex",
          children: /* @__PURE__ */ jsxs(
            Card,
            {
              className: cn(
                "bg-secondary/20 relative h-full w-full text-left transition-all duration-300 hover:shadow-lg",
                plan.popular ? "ring-primary/50 dark:shadow-primary/10 shadow-md ring-2" : "hover:border-primary/30",
                plan.popular && "from-primary/[0.03] bg-gradient-to-b to-transparent"
              ),
              children: [
                plan.popular && /* @__PURE__ */ jsx("div", { className: "absolute -top-3 right-0 left-0 mx-auto w-fit", children: /* @__PURE__ */ jsxs(Badge, { className: "bg-primary text-primary-foreground rounded-full px-4 py-1 shadow-sm", children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "mr-1 h-3.5 w-3.5" }),
                  "Popular"
                ] }) }),
                /* @__PURE__ */ jsxs(CardHeader, { className: cn("pb-4", plan.popular && "pt-8"), children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: cn(
                          "flex h-8 w-8 items-center justify-center rounded-full",
                          plan.popular ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"
                        ),
                        children: /* @__PURE__ */ jsx(plan.icon, { className: "h-4 w-4" })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      CardTitle,
                      {
                        className: cn(
                          "text-xl font-bold",
                          plan.popular && "text-primary"
                        ),
                        children: plan.name
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs(CardDescription, { className: "mt-3 space-y-2", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm", children: plan.description }),
                    /* @__PURE__ */ jsx("div", { className: "pt-2", children: typeof plan.price[frequency] === "number" ? /* @__PURE__ */ jsxs("div", { className: "flex items-baseline", children: [
                      /* @__PURE__ */ jsx(
                        NumberFlow,
                        {
                          className: cn(
                            "text-3xl font-bold",
                            plan.popular ? "text-primary" : "text-foreground"
                          ),
                          format: {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0
                          },
                          value: plan.price[frequency]
                        }
                      ),
                      /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground ml-1 text-sm", children: [
                        "/month, billed ",
                        frequency
                      ] })
                    ] }) : /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: cn(
                          "text-2xl font-bold",
                          plan.popular ? "text-primary" : "text-foreground"
                        ),
                        children: plan.price[frequency]
                      }
                    ) })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(CardContent, { className: "grid gap-3 pb-6", children: plan.features.map((feature, idx) => /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, x: -5 },
                    animate: { opacity: 1, x: 0 },
                    transition: { duration: 0.3, delay: 0.5 + idx * 0.05 },
                    className: "flex items-center gap-2 text-sm",
                    children: [
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: cn(
                            "flex h-5 w-5 items-center justify-center rounded-full",
                            plan.popular ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
                          ),
                          children: /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" })
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: plan.popular ? "text-foreground" : "text-muted-foreground",
                          children: feature
                        }
                      )
                    ]
                  },
                  idx
                )) }),
                /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsxs(
                  Button,
                  {
                    variant: plan.popular ? "default" : "outline",
                    className: cn(
                      "w-full font-medium transition-all duration-300 group",
                      plan.popular ? "bg-primary hover:bg-primary/90 hover:shadow-primary/20 hover:shadow-md" : "hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    ),
                    onClick: () => handlePlanSelect(plan.id),
                    children: [
                      plan.cta,
                      /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" })
                    ]
                  }
                ) }),
                plan.popular ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("div", { className: "from-primary/[0.05] pointer-events-none absolute right-0 bottom-0 left-0 h-1/2 rounded-b-lg bg-gradient-to-t to-transparent" }),
                  /* @__PURE__ */ jsx("div", { className: "border-primary/20 pointer-events-none absolute inset-0 rounded-lg border" })
                ] }) : /* @__PURE__ */ jsx("div", { className: "hover:border-primary/10 pointer-events-none absolute inset-0 rounded-lg border border-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" })
              ]
            }
          )
        },
        plan.id
      )) })
    ] })
  ] });
}
const items = [
  {
    id: "1",
    title: "What is WebBuilder and who is it for?",
    content: "WebBuilder is a modern visual builder for React and Next.js apps. It lets you create web pages by dragging and dropping prebuilt, customizable components—no coding required. It’s perfect for developers, startups, and teams who want to build and ship faster."
  },
  {
    id: "2",
    title: "Can I export the code for my website?",
    content: "Yes! With WebBuilder, you can export clean, production-ready React/Next.js code for any website you create. There's no vendor lock-in—download your code and host it anywhere."
  },
  {
    id: "3",
    title: "Do I need to know how to code?",
    content: "Not at all! WebBuilder is designed for everyone. Simply drag and drop components, customize colors and text, and your website is ready. Our visual editor handles all the technical stuff."
  },
  {
    id: "4",
    title: "Can I customize the design and layout?",
    content: "Absolutely! Every component is fully customizable. Change colors, fonts, spacing, and layouts with our visual editor. You can also add your own images, text, and branding."
  },
  {
    id: "5",
    title: "How do I publish my website?",
    content: "You can publish directly from WebBuilder to get an instant live URL, or export your code to host on your own domain with services like Vercel, Netlify, or any web hosting provider."
  }
];
const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  animate: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index,
      duration: 0.4
    }
  })
};
function LandingPageFAQ() {
  return /* @__PURE__ */ jsx("section", { className: "py-12 md:py-16", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto max-w-6xl px-4 md:px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-10 text-center", children: [
      /* @__PURE__ */ jsxs(
        motion.h2,
        {
          className: "mb-4 text-3xl font-bold tracking-tight md:text-4xl",
          initial: { opacity: 0, y: -10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          children: [
            "Frequently Asked",
            " ",
            /* @__PURE__ */ jsx("span", { className: "from-primary bg-gradient-to-r to-rose-400 bg-clip-text text-transparent", children: "Questions" })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        motion.p,
        {
          className: "text-muted-foreground mx-auto max-w-2xl",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5, delay: 0.2 },
          children: "Everything you need to know about WebBuilder's visual editor, component library, and publishing options to get your website online fast."
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "relative mx-auto max-w-3xl",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5, delay: 0.3 },
        children: [
          /* @__PURE__ */ jsx("div", { className: "bg-primary/10 absolute -top-4 -left-4 -z-10 h-72 w-72 rounded-full blur-3xl" }),
          /* @__PURE__ */ jsx("div", { className: "bg-primary/10 absolute -right-4 -bottom-4 -z-10 h-72 w-72 rounded-full blur-3xl" }),
          /* @__PURE__ */ jsx(
            Accordion,
            {
              type: "single",
              collapsible: true,
              className: "border-border/40 bg-card/30 w-full rounded-xl border p-2 backdrop-blur-sm",
              defaultValue: "1",
              children: items.map((item, index) => /* @__PURE__ */ jsx(
                motion.div,
                {
                  custom: index,
                  variants: fadeInAnimationVariants,
                  initial: "initial",
                  whileInView: "animate",
                  viewport: { once: true },
                  children: /* @__PURE__ */ jsxs(
                    AccordionItem,
                    {
                      value: item.id,
                      className: cn(
                        "bg-card/50 my-1 overflow-hidden rounded-lg border-none px-2 shadow-sm transition-all",
                        "data-[state=open]:bg-card/80 data-[state=open]:shadow-md"
                      ),
                      children: [
                        /* @__PURE__ */ jsx(AccordionPrimitive.Header, { className: "flex", children: /* @__PURE__ */ jsxs(
                          AccordionPrimitive.Trigger,
                          {
                            className: cn(
                              "group flex flex-1 items-center justify-between gap-4 py-4 text-left text-base font-medium",
                              "hover:text-primary transition-all duration-300 outline-none",
                              "focus-visible:ring-primary/50 focus-visible:ring-2",
                              "data-[state=open]:text-primary"
                            ),
                            children: [
                              item.title,
                              /* @__PURE__ */ jsx(
                                PlusIcon,
                                {
                                  size: 18,
                                  className: cn(
                                    "text-primary/70 shrink-0 transition-transform duration-300 ease-out",
                                    "group-data-[state=open]:rotate-45"
                                  ),
                                  "aria-hidden": "true"
                                }
                              )
                            ]
                          }
                        ) }),
                        /* @__PURE__ */ jsx(
                          AccordionContent,
                          {
                            className: cn(
                              "text-muted-foreground overflow-hidden pt-0 pb-4",
                              "data-[state=open]:animate-accordion-down",
                              "data-[state=closed]:animate-accordion-up"
                            ),
                            children: /* @__PURE__ */ jsx("div", { className: "border-border/30 border-t pt-3", children: item.content })
                          }
                        )
                      ]
                    }
                  )
                },
                item.id
              ))
            }
          )
        ]
      }
    )
  ] }) });
}
function LandingPageCTA() {
  const [ref, inView] = useInView();
  return /* @__PURE__ */ jsxs(
    "section",
    {
      ref,
      className: "py-24 bg-gradient-to-r from-primary/10 via-background to-accent/10 relative overflow-hidden",
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" }),
        /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 lg:px-6 text-center relative", children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: `max-w-4xl mx-auto space-y-8 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`,
            children: [
              /* @__PURE__ */ jsxs("h2", { className: "text-3xl lg:text-6xl font-bold leading-tight", children: [
                "Ready to build your",
                " ",
                /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "dream website?" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed", children: "Join thousands of creators who trust WebBuilder to bring their vision to life. No code required, just drag, drop, and publish—the way it should be." }),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `flex flex-col sm:flex-row gap-6 justify-center pt-8 transition-all duration-1000 delay-300 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
                  children: [
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        size: "lg",
                        className: "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold text-xl px-12 py-6 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105 group",
                        asChild: true,
                        children: /* @__PURE__ */ jsxs(Link, { to: "/sign-up", children: [
                          "Start Your Free Trial",
                          /* @__PURE__ */ jsx(ArrowRight, { className: "ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" })
                        ] })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        size: "lg",
                        variant: "outline",
                        className: "border-border text-muted-foreground hover:bg-accent/10 hover:text-foreground hover:border-accent/50 transition-all duration-300 hover:scale-105 bg-transparent backdrop-blur-sm text-xl px-12 py-6",
                        children: "Schedule a Demo"
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "p",
                {
                  className: `text-sm text-muted-foreground pt-4 transition-all duration-1000 delay-500 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`,
                  children: "14-day free trial • No credit card required • Cancel anytime"
                }
              )
            ]
          }
        ) })
      ]
    }
  );
}
const footerSections = [
  {
    title: "Product",
    links: ["Features", "Templates", "Integrations", "API", "Changelog"]
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact", "Press"]
  },
  {
    title: "Support",
    links: [
      "Help Center",
      "Community",
      "Privacy Policy",
      "Terms of Service",
      "Status"
    ]
  }
];
const socialLinks = ["Twitter", "LinkedIn", "GitHub", "Discord"];
function LandingPageFooter() {
  const [ref, inView] = useInView();
  return /* @__PURE__ */ jsx(
    "footer",
    {
      ref,
      className: "border-t border-border/50 py-16 bg-background/50 backdrop-blur-sm",
      children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-6", children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `grid md:grid-cols-4 gap-12 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3 group", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-6 h-6 text-primary-foreground" }) }),
                  /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", children: "WebBuilder" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed max-w-sm", children: "The easiest way to build professional websites with drag-and-drop components and clean code export." })
              ] }),
              footerSections.map((section, index) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
                  style: {
                    transitionDelay: `${(index + 1) * 150}ms`
                  },
                  children: [
                    /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg mb-6", children: section.title }),
                    /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: section.links.map((link, linkIndex) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "#",
                        className: "text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-1 inline-block",
                        children: link
                      }
                    ) }, linkIndex)) })
                  ]
                },
                index
              ))
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `border-t border-border/50 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 transition-all duration-1000 delay-300 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
            children: [
              /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
                "© ",
                (/* @__PURE__ */ new Date()).getFullYear(),
                " WebBuilder. All rights reserved."
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex space-x-8", children: socialLinks.map((social, index) => /* @__PURE__ */ jsx(
                "a",
                {
                  href: "#",
                  className: `text-muted-foreground hover:text-foreground transition-all duration-500 hover:scale-110 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`,
                  style: {
                    transitionDelay: `${600 + index * 100}ms`
                  },
                  children: social
                },
                social
              )) })
            ]
          }
        )
      ] })
    }
  );
}
function WebBuilderLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const {
    user,
    isLoaded
  } = useUser();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen min-w-screen bg-background text-foreground overflow-x-hidden", children: [
    /* @__PURE__ */ jsxs("header", { className: `border-b border-border/50 backdrop-blur-md sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/95 shadow-lg shadow-primary/5" : "bg-background/80"}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3 group", children: [
          /* @__PURE__ */ jsx("div", { className: "w-9 h-9 bg-linear-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-primary-foreground" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text", children: "WebBuilder" })
        ] }),
        /* @__PURE__ */ jsx("nav", { className: "hidden md:flex items-center space-x-8", children: ["Features", "Pricing", "Testimonials"].map((item) => /* @__PURE__ */ jsxs("a", { href: `#${item.toLowerCase()}`, className: "text-muted-foreground hover:text-foreground transition-all duration-300 relative group", children: [
          item,
          /* @__PURE__ */ jsx("span", { className: "absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-primary to-accent group-hover:w-full transition-all duration-300" })
        ] }, item)) }),
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center space-x-4", children: [
          /* @__PURE__ */ jsx(ThemeSwitcher, {}),
          isLoaded && user ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "text-muted-foreground hover:text-foreground transition-all duration-300", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/profile", children: [
              /* @__PURE__ */ jsx(User, { className: "mr-2 h-4 w-4" }),
              "Profile"
            ] }) }),
            /* @__PURE__ */ jsx(Button, { className: "bg-linear-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/dashboard", children: [
              /* @__PURE__ */ jsx(LayoutDashboard, { className: "mr-2 h-4 w-4" }),
              "Dashboard"
            ] }) })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "text-muted-foreground hover:text-foreground transition-all duration-300", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/sign-in", children: "Sign In" }) }),
            /* @__PURE__ */ jsx(Button, { className: "bg-linear-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/sign-up", children: "Start Free Trial" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "md:hidden transition-all duration-300 hover:bg-accent/10", onClick: () => setMobileMenuOpen(!mobileMenuOpen), children: /* @__PURE__ */ jsxs("div", { className: "relative w-5 h-5", children: [
          /* @__PURE__ */ jsx(Menu, { className: `absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"}` }),
          /* @__PURE__ */ jsx(X, { className: `absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}` })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md transition-all duration-500 ${mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"} overflow-hidden`, children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-6 space-y-4", children: [
        ["Features", "Pricing", "Testimonials"].map((item, index) => /* @__PURE__ */ jsx("a", { href: `#${item.toLowerCase()}`, className: `block text-muted-foreground hover:text-foreground transition-all duration-300 transform ${mobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`, style: {
          transitionDelay: `${index * 100}ms`
        }, onClick: () => setMobileMenuOpen(false), children: item }, item)),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col space-y-3 pt-4 border-t border-border/50", children: isLoaded && user ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "justify-start", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/profile", children: [
            /* @__PURE__ */ jsx(User, { className: "mr-2 h-4 w-4" }),
            "Profile"
          ] }) }),
          /* @__PURE__ */ jsx(Button, { className: "bg-linear-to-r from-primary to-accent text-primary-foreground font-semibold", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/dashboard", children: [
            /* @__PURE__ */ jsx(LayoutDashboard, { className: "mr-2 h-4 w-4" }),
            "Dashboard"
          ] }) })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "justify-start", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/sign-in", children: "Sign In" }) }),
          /* @__PURE__ */ jsx(Button, { className: "bg-linear-to-r from-primary to-accent text-primary-foreground font-semibold", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/sign-up", children: "Start Free Trial" }) })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(LandingPageHero, {}),
    /* @__PURE__ */ jsx(LandingPageStats, {}),
    /* @__PURE__ */ jsx(LandingPageFeature, {}),
    /* @__PURE__ */ jsx(LandingPageTestimonials, {}),
    /* @__PURE__ */ jsxs("section", { id: "pricing", children: [
      /* @__PURE__ */ jsx(LandingPagePricing, {}),
      /* @__PURE__ */ jsx(LandingPageFAQ, {})
    ] }),
    /* @__PURE__ */ jsx(LandingPageCTA, {}),
    /* @__PURE__ */ jsx(LandingPageFooter, {})
  ] });
}
export {
  WebBuilderLanding as component
};
