// src/features/interactions/runtime/run.ts
/**
 * Runs an interaction's steps in order.
 *
 * - `call` never throws: it records { ok, status, data, error } so an `if`
 *   can branch on it.
 * - An executor may return skip(reason) for a dangling reference; the step is
 *   logged as skipped and the next one runs.
 * - Any other failure (including an expression error) logs the step path and
 *   stops the interaction.
 *
 * DOM work lives in executors (see executors.ts); this file is pure.
 */
import { interpolate } from "./expression";
import { verbOf, type IfStep, type Interaction, type Step, type Verb } from "../schema";

export const MAX_FLOW_DEPTH = 16;

const SKIP = Symbol("skip");
export interface Skipped {
  [SKIP]: string;
}
export const skip = (reason: string): Skipped => ({ [SKIP]: reason });
const isSkipped = (v: unknown): v is Skipped =>
  typeof v === "object" && v !== null && SKIP in v;

export interface RunLogEntry {
  at: number;
  elementId: string;
  ixId: string;
  path: string;
  verb: Verb | "interaction";
  status: "ok" | "skipped" | "error";
  detail?: string;
}

export interface CallResult {
  ok: boolean;
  status: number;
  data: unknown;
  error: string | null;
}

export interface StepApi {
  value(template: string): unknown;
  ctx: RunContext;
}
// Executors receive the step already narrowed by verb; `any` keeps the
// registry simple.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Executor = (step: any, api: StepApi) => unknown | Promise<unknown>;
export type Executors = Partial<Record<Verb, Executor>>;

export interface RunContext {
  elementId: string;
  ixId: string;
  executors: Executors;
  flows: Record<string, { do: Step[] }>;
  vars: {
    get(name: string): unknown;
    set(name: string, value: unknown): boolean;
    snapshot(): Record<string, unknown>;
  };
  event?: unknown;
  form?: Record<string, unknown>;
  el?: Record<string, unknown>;
  steps: Record<string, unknown>;
  log(entry: RunLogEntry): void;
  sleep?(ms: number): Promise<void>;
  now?(): number;
}

class Stop extends Error {}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const scopeOf = (ctx: RunContext) => ({
  vars: ctx.vars.snapshot(),
  event: ctx.event ?? null,
  form: ctx.form ?? {},
  el: ctx.el ?? {},
  steps: ctx.steps,
});

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

export async function runInteraction(
  ix: Interaction,
  ctx: RunContext,
): Promise<"done" | "stopped"> {
  try {
    await runSteps(ix.do, ctx, `${ctx.ixId}.do`, 0);
    return "done";
  } catch (e) {
    if (e instanceof Stop) return "stopped";
    throw e;
  }
}

async function runSteps(steps: Step[], ctx: RunContext, path: string, depth: number) {
  for (let i = 0; i < steps.length; i++) {
    await runStep(steps[i], ctx, `${path}[${i}]`, depth);
  }
}

async function runStep(step: Step, ctx: RunContext, path: string, depth: number) {
  const verb = verbOf(step);
  const at = ctx.now?.() ?? Date.now();
  const log = (status: RunLogEntry["status"], detail?: string) =>
    ctx.log({
      at,
      elementId: ctx.elementId,
      ixId: ctx.ixId,
      path,
      verb: verb ?? "interaction",
      status,
      ...(detail !== undefined ? { detail } : {}),
    });
  if (!verb) {
    log("error", "not a valid step");
    throw new Stop();
  }
  const value = (template: string) => interpolate(template, scopeOf(ctx));
  const s = step as Step & Record<string, unknown>;

  try {
    let result: unknown;
    switch (verb) {
      case "if": {
        const ifStep = step as IfStep;
        const yes = Boolean(value(ifStep.if));
        log("ok", yes ? "then" : "else");
        await runSteps(
          yes ? ifStep.then : (ifStep.else ?? []),
          ctx,
          `${path}.${yes ? "then" : "else"}`,
          depth,
        );
        return;
      }
      case "run": {
        const name = s.run as string;
        const flow = Object.hasOwn(ctx.flows, name) ? ctx.flows[name] : undefined;
        if (!flow) {
          log("skipped", `no flow named ${name}`);
          return;
        }
        if (depth >= MAX_FLOW_DEPTH) {
          log("error", `flows nested more than ${MAX_FLOW_DEPTH} deep`);
          throw new Stop();
        }
        log("ok");
        await runSteps(flow.do, ctx, `flow:${name}.do`, depth + 1);
        return;
      }
      case "set": {
        const name = s.set as string;
        if (!ctx.vars.set(name, value(s.to as string))) {
          log("skipped", `no variable named ${name}`);
          return;
        }
        result = ctx.vars.get(name);
        break;
      }
      case "wait":
        await (ctx.sleep ?? defaultSleep)(s.wait as number);
        break;
      default: {
        const exec = ctx.executors[verb];
        if (!exec) {
          log("skipped", `${verb} is not available here`);
          return;
        }
        result = await exec(step, { value, ctx });
        if (isSkipped(result)) {
          log("skipped", result[SKIP]);
          return;
        }
      }
    }
    if (typeof s.id === "string") Object.defineProperty(ctx.steps, s.id, { value: result, writable: true, enumerable: true, configurable: true });
    log("ok");
  } catch (e) {
    if (e instanceof Stop) throw e;
    if (verb === "call") {
      const failed: CallResult = { ok: false, status: 0, data: null, error: message(e) };
      if (typeof s.id === "string") Object.defineProperty(ctx.steps, s.id, { value: failed, writable: true, enumerable: true, configurable: true });
      log("error", message(e));
      return;
    }
    log("error", message(e));
    throw new Stop();
  }
}
