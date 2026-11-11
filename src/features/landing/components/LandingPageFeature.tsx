import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Workflow: a click on the canvas runs the graph ─────────────────────────
 * A scripted cursor clicks "Book a table". The event workflow beside it lights
 * up step by step (trigger → condition → branch) and the element on the canvas
 * changes to match. Seats alternate free/full each loop. The visitor can take
 * over: click the button, or flip the seat switch.
 */

type NodeId = "trigger" | "condition" | "yes" | "no";
type Seat = "free" | "full";
/** 0 idle · 1 cursor travels · 2 click · 3 trigger · 4 condition · 5 result */
type Phase = 0 | 1 | 2 | 3 | 4 | 5;

const NODES: Record<NodeId, { x: number; y: number; kind: string; label: string }> = {
  trigger: { x: 10, y: 106, kind: "Trigger", label: "Button · onClick" },
  condition: { x: 164, y: 106, kind: "Condition", label: "Seat free?" },
  yes: { x: 318, y: 40, kind: "Action", label: "Create booking" },
  no: { x: 318, y: 172, kind: "Output", label: "Show “Sold out”" },
};

const NODE_W = 122;
const NODE_H = 52;

function edge(from: NodeId, to: NodeId) {
  const a = NODES[from];
  const b = NODES[to];
  const x1 = a.x + NODE_W;
  const y1 = a.y + NODE_H / 2;
  const x2 = b.x;
  const y2 = b.y + NODE_H / 2;
  const mid = (x1 + x2) / 2;
  return { d: `M${x1} ${y1} C${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`, mid, y1, y2 };
}

const E_TRIGGER = edge("trigger", "condition");
const E_YES = edge("condition", "yes");
const E_NO = edge("condition", "no");

const MONO = '"Geist Mono Variable", ui-monospace, monospace';

function WorkflowGraph({ phase, seat, animateDots }: { phase: Phase; seat: Seat; animateDots: boolean }) {
  const chosen: NodeId = seat === "free" ? "yes" : "no";
  const chosenEdge = seat === "free" ? E_YES : E_NO;
  const lit: Record<NodeId, boolean> = {
    trigger: phase >= 3,
    condition: phase >= 4,
    yes: phase >= 5 && chosen === "yes",
    no: phase >= 5 && chosen === "no",
  };
  const drawn = { trigger: phase >= 3, yes: phase >= 4 && chosen === "yes", no: phase >= 4 && chosen === "no" };
  const dimmed = (id: "yes" | "no") => phase >= 4 && chosen !== id;

  const edges = [
    { key: "trigger", e: E_TRIGGER, on: drawn.trigger, dim: false, label: undefined },
    { key: "yes", e: E_YES, on: drawn.yes, dim: dimmed("yes"), label: "yes" },
    { key: "no", e: E_NO, on: drawn.no, dim: dimmed("no"), label: "no" },
  ] as const;

  return (
    <svg
      viewBox="0 0 460 250"
      className="mx-auto block w-full min-w-[24rem]"
      role="img"
      aria-label="Event workflow: a button click checks whether a seat is free, then creates a booking or shows a sold out message"
    >
      {edges.map(({ key, e, on, dim, label }) => (
        <g key={key} opacity={dim ? 0.35 : 1}>
          <path d={e.d} fill="none" stroke="var(--landing-rule)" strokeWidth={1.25} strokeDasharray={dim ? "4 4" : undefined} />
          <motion.path
            d={e.d}
            fill="none"
            stroke="var(--landing-signal)"
            strokeWidth={2.25}
            initial={false}
            animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
            transition={{ duration: animateDots ? 0.7 : 0, ease: "easeInOut" }}
          />
          {label && (
            <text
              x={e.mid}
              y={(e.y1 + e.y2) / 2 + (label === "yes" ? -8 : 15)}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ font: `10px ${MONO}`, textTransform: "uppercase" }}
            >
              {label}
            </text>
          )}
        </g>
      ))}

      {/* The token that travels along the edge currently being followed. */}
      {animateDots && phase === 3 && (
        <circle r={5} fill="var(--landing-signal)">
          <animateMotion dur="0.7s" fill="freeze" path={E_TRIGGER.d} />
        </circle>
      )}
      {animateDots && phase === 4 && (
        <circle key={chosen} r={5} fill="var(--landing-signal)">
          <animateMotion dur="0.7s" fill="freeze" path={chosenEdge.d} />
        </circle>
      )}

      {(Object.keys(NODES) as NodeId[]).map((id) => {
        const node = NODES[id];
        const on = lit[id];
        const off = (id === "yes" || id === "no") && dimmed(id);
        return (
          <g key={id} opacity={off ? 0.4 : 1} className="transition-opacity duration-300">
            <rect
              x={node.x}
              y={node.y}
              width={NODE_W}
              height={NODE_H}
              style={{
                fill: on ? "color-mix(in srgb, var(--primary) 12%, var(--background))" : "var(--background)",
                transition: "fill 250ms, stroke 250ms",
              }}
              stroke={on ? "var(--landing-signal)" : "var(--landing-ink)"}
              strokeWidth={on ? 2 : 1}
            />
            <text
              x={node.x + 10}
              y={node.y + 20}
              style={{ font: `9px ${MONO}`, letterSpacing: "0.08em", textTransform: "uppercase" }}
              fill={on ? "var(--landing-signal)" : "var(--muted-foreground)"}
            >
              {node.kind}
            </text>
            <text x={node.x + 10} y={node.y + 38} className="fill-foreground" style={{ font: "12px 'Geist Variable', sans-serif" }}>
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Pointer({ label }: { label: string }) {
  return (
    <>
      <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden className="drop-shadow-sm">
        <path
          d="M1.5 1.5 L1.5 17 L6 13 L9.2 20 L12 18.8 L8.9 12 L15 12 Z"
          fill="var(--landing-signal)"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-label -mt-0.5 ml-4 inline-block bg-[var(--landing-signal)] px-1.5 py-[3px] leading-none text-primary-foreground">
        {label}
      </span>
    </>
  );
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function WorkflowStage() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const inView = useInView(rootRef, { amount: 0.35 });

  const [phase, setPhase] = useState<Phase>(0);
  const [seat, setSeat] = useState<Seat>("free");
  const [auto, setAuto] = useState(true);
  const [showCursor, setShowCursor] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [box, setBox] = useState<Box | null>(null);
  const [runId, setRunId] = useState(0);

  const timers = useRef<number[]>([]);
  const startRef = useRef<1 | 2>(1);
  const autoRef = useRef(true);
  const inViewRef = useRef(false);
  const waitingRef = useRef(false);
  inViewRef.current = inView;

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const measure = useCallback((where: "button" | "rest") => {
    const canvas = canvasRef.current;
    const btn = btnRef.current;
    if (!canvas || !btn) return;
    const c = canvas.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const rel = { x: b.left - c.left, y: b.top - c.top, w: b.width, h: b.height };
    setBox({ x: rel.x - 6, y: rel.y - 6, w: rel.w + 12, h: rel.h + 12 });
    setPos(
      where === "button"
        ? { x: rel.x + rel.w * 0.7, y: rel.y + rel.h * 0.55 }
        : { x: c.width * 0.82, y: c.height * 0.92 },
    );
  }, []);

  const advance = useCallback(() => {
    setSeat((current) => (current === "free" ? "full" : "free"));
    startRef.current = 1;
    setRunId((id) => id + 1);
  }, []);

  /** One pass of the sequence, rescheduled whenever `runId` changes. */
  useEffect(() => {
    if (runId === 0) return;
    clear();
    if (reduce) {
      setPhase(5);
      return;
    }
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    let s = 0;
    if (startRef.current === 1) {
      setPhase(0);
      measure("rest");
      at(40, () => {
        setShowCursor(true);
        measure("button");
        setPhase(1);
      });
      s = 1050;
    } else {
      setShowCursor(false);
      measure("button");
    }
    at(s, () => setPhase(2));
    at(s + 380, () => setPhase(3));
    at(s + 1130, () => setPhase(4));
    at(s + 1930, () => setPhase(5));
    if (autoRef.current) {
      at(s + 4800, () => {
        setPhase(0);
        setShowCursor(false);
        measure("rest");
      });
      at(s + 5500, () => {
        if (!autoRef.current) return;
        if (inViewRef.current) advance();
        else waitingRef.current = true;
      });
    }
    return clear;
  }, [runId, reduce, measure, advance]);

  /** Start (or resume) the loop when the demo is on screen. */
  useEffect(() => {
    if (reduce) {
      setPhase(5);
      return;
    }
    if (!inView || !autoRef.current) return;
    if (runId === 0) {
      startRef.current = 1;
      setRunId(1);
    } else if (waitingRef.current) {
      waitingRef.current = false;
      advance();
    }
  }, [inView, reduce, runId, advance]);

  const takeOver = (nextSeat?: Seat) => {
    autoRef.current = false;
    setAuto(false);
    if (nextSeat) setSeat(nextSeat);
    startRef.current = 2;
    setRunId((id) => id + 1);
  };

  const booked = phase >= 5 && seat === "free";
  const soldOut = phase >= 5 && seat === "full";
  const caption: { title: string; body: string; at: Phase }[] = [
    { at: 3, title: "Trigger", body: "The click fires onClick." },
    { at: 4, title: "Condition", body: seat === "free" ? "A seat is free, so take the yes branch." : "No seat is free, so take the no branch." },
    {
      at: 5,
      title: seat === "free" ? "Action" : "Output",
      body: seat === "free" ? "The booking is created." : "“Sold out” is shown.",
    },
  ];

  return (
    <div ref={rootRef} className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.12fr]">
      {/* Canvas */}
      <div className="border border-foreground/80 bg-card">
        <div className="font-label flex items-center justify-between border-b border-border px-4 py-3 text-muted-foreground">
          <span>Canvas</span>
          <span>Preview</span>
        </div>
        <div ref={canvasRef} className="blueprint relative grid min-h-[19rem] place-items-center overflow-hidden p-6">
          <div className="w-full max-w-xs bg-background p-6 shadow-[0_1px_0_var(--border)] ring-1 ring-border">
            <p className="font-label text-muted-foreground">Maison · Tonight</p>
            <h3 className="font-display mt-2 text-3xl leading-[1.02]">Dinner for two, 7:30.</h3>
            <motion.button
              ref={btnRef}
              type="button"
              onClick={() => takeOver()}
              animate={{ scale: phase === 2 ? 0.94 : 1 }}
              transition={{ duration: 0.14 }}
              className={cn(
                "mt-5 inline-flex h-11 w-full items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-signal)]",
                booked && "bg-foreground text-background",
                soldOut && "bg-muted text-muted-foreground",
                !booked && !soldOut && "bg-[var(--landing-signal)] text-primary-foreground",
              )}
            >
              {booked ? (
                <>
                  <Check className="size-4" /> Booked
                </>
              ) : soldOut ? (
                "Sold out"
              ) : (
                "Book a table"
              )}
            </motion.button>
            <div className="mt-3 h-4 text-xs text-muted-foreground" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {phase >= 5 && (
                  <motion.p
                    key={seat}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {seat === "free" ? "Table 4 is yours. Confirmation sent." : "Nothing left tonight. Join the waitlist?"}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* The element the workflow belongs to, selected like in the editor. */}
          {box && phase >= 1 && phase <= 4 && !reduce && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 border-[1.5px] border-[var(--landing-signal)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, x: box.x, y: box.y, width: box.w, height: box.h }}
              transition={{ duration: 0.25 }}
            >
              {["-left-[4px] -top-[4px]", "-right-[4px] -top-[4px]", "-bottom-[4px] -left-[4px]", "-bottom-[4px] -right-[4px]"].map((p) => (
                <span key={p} className={`absolute size-[7px] border border-[var(--landing-signal)] bg-background ${p}`} />
              ))}
              <span className="font-label absolute -top-[1.4rem] left-[-1.5px] whitespace-nowrap bg-[var(--landing-signal)] px-1.5 py-[3px] leading-none text-primary-foreground">
                Button · onClick
              </span>
            </motion.div>
          )}

          {!reduce && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-10"
              initial={false}
              animate={{ x: pos.x, y: pos.y, opacity: showCursor && phase <= 3 ? 1 : 0, scale: phase === 2 ? 0.88 : 1 }}
              transition={{
                x: { duration: 0.95, ease: [0.65, 0, 0.35, 1] },
                y: { duration: 0.95, ease: [0.65, 0, 0.35, 1] },
                opacity: { duration: 0.2 },
                scale: { duration: 0.12 },
              }}
            >
              <Pointer label="Visitor" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Workflow */}
      <div className="border border-foreground/80 bg-card">
        <div className="font-label flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5 text-muted-foreground">
          <span>Workflow · onClick</span>
          <div className="flex items-center gap-2">
            <span id="seats-label">Seats</span>
            <div role="group" aria-labelledby="seats-label" className="flex border border-border">
              {(["free", "full"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={seat === value}
                  onClick={() => takeOver(value)}
                  className={cn(
                    "px-2.5 py-1.5 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--landing-signal)]",
                    seat === value ? "bg-foreground text-background" : "hover:bg-muted",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="blueprint overflow-x-auto px-3 py-5 sm:px-6">
          <WorkflowGraph phase={phase} seat={seat} animateDots={!reduce} />
        </div>
        <ol className="grid grid-cols-1 divide-y divide-border border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {caption.map((step, index) => {
            const active = phase === step.at;
            const done = phase > step.at;
            return (
              <li
                key={step.title}
                className={cn("px-4 py-3 transition-opacity duration-300", !active && !done && "opacity-45")}
              >
                <p className="font-label flex items-center gap-1.5">
                  <span className={cn(active || done ? "text-[var(--landing-signal)]" : "text-muted-foreground")}>
                    0{index + 1}
                  </span>
                  <span>{step.title}</span>
                </p>
                <p className="mt-1.5 text-sm leading-snug text-muted-foreground">{step.body}</p>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="font-label text-muted-foreground lg:col-span-2">
        {auto && !reduce ? "Click the button or flip the seats to try it yourself." : "Your turn."}
      </p>
    </div>
  );
}

export default function LandingPageFeature() {
  return (
    <section id="features" className="container mx-auto scroll-mt-16 px-4 py-20 lg:px-6 lg:py-28">
      <h2 className="font-display max-w-3xl text-4xl leading-[1.02] lg:text-6xl">
        Click it. Watch the logic <em className="text-[var(--landing-signal)]">run.</em>
      </h2>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
        Chain triggers, conditions and actions as nodes, right next to the element they control.
      </p>
      <div className="mt-12">
        <WorkflowStage />
      </div>
    </section>
  );
}
