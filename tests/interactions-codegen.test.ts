import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { hasInteractionCode, toCode, type CodegenInput } from "../src/features/interactions/codegen/interactions";
import { compileTemplate } from "../src/features/interactions/codegen/expression";
import { VERBS, type Step } from "../src/features/interactions/schema";

const kitchenSink: CodegenInput = {
  namespace: "demo",
  elements: [
    {
      id: "el_form",
      name: "Signup Form",
      settings: {
        interactions: {
          ix_aaaaaaaa: {
            on: "submit",
            do: [
              { id: "signup", call: "api", method: "POST", url: "/api/signup", headers: { "X-Name": "{{ form.name }}" }, body: "{{ form }}", timeout: 5000 },
              { id: "ok", if: "{{ steps.signup.ok }}", then: [{ toast: "Welcome {{ form.name }}!", kind: "success", duration: 2000 }, { set: "user", to: "{{ steps.signup.data }}" }, { run: "celebrate" }], else: [{ toast: "Failed", kind: "error" }] },
            ],
          },
        },
      },
      elements: [
        {
          id: "el_btn",
          name: "Count Button",
          settings: {
            interactions: {
              ix_bbbbbbbb: {
                on: "click",
                stopPropagation: true,
                do: [
                  { set: "count", to: "{{ vars.count + 1 }}" },
                  { show: "el_form" }, { hide: "el_form" }, { toggle: "el_form" },
                  { navigate: "/thanks", newTab: true }, { scroll: "el_form", offset: 20 }, { scroll: 0, smooth: false },
                  { modal: "open" }, { modal: "close", target: "el_form" },
                  { copy: "{{ vars.count }}" }, { download: "/file.pdf", filename: "report.pdf" },
                  { class: "toggle", target: "el_form", name: "is-open" },
                  { submit: "el_form" }, { reset: "el_form" }, { wait: 10 },
                  { code: "console.log(scope.vars.count)" },
                  { set: "missing", to: "1" },
                  { run: "nowhere" },
                ],
              },
              ix_cccccccc: { on: "keydown", key: "Enter", do: [{ toast: "enter" }] },
              ix_dddddddd: { on: "visible", once: false, do: [{ animate: "el_btn", preset: "shake" }] },
              ix_eeeeeeee: { on: "load", do: [{ toast: "hi" }] },
              ix_ffffffff: { on: "click", enabled: false, do: [{ toast: "never" }] },
            },
          },
        },
      ],
    },
  ],
  variables: {
    count: { type: "number", default: 0 },
    user: { type: "object", default: {}, lifetime: "session" },
    tags: { type: "list", default: [], lifetime: "local" },
    name: { type: "string", default: "" },
    on: { type: "boolean", default: false },
  },
  flows: { celebrate: { do: [{ animate: "el_btn", preset: "bounce" }, { wait: 300 }, { if: "{{ vars.count > 1 }}", then: [{ run: "celebrate" }] }] } },
};

function diagnose(code: string): string[] {
  const file = path.resolve("tests/__generated__/interactions.ts");
  const options: ts.CompilerOptions = {
    strict: true, noUnusedLocals: true, noUnusedParameters: true, noEmit: true, skipLibCheck: true,
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"], types: [],
  };
  const host = ts.createCompilerHost(options);
  const { getSourceFile, fileExists, readFile } = host;
  host.getSourceFile = (name, ...rest) => (name === file ? ts.createSourceFile(name, code, options.target!) : getSourceFile(name, ...rest));
  host.fileExists = (name) => name === file || fileExists(name);
  host.readFile = (name) => (name === file ? code : readFile(name));
  const program = ts.createProgram([file], options, host);
  return ts.getPreEmitDiagnostics(program).map((d) => `${d.file?.fileName.split("/").pop()}:${d.start ?? 0} ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`);
}

test("generated module for every verb type-checks under strict settings", () => {
  const code = toCode(kitchenSink);
  const exercised = new Set<string>();
  const walk = (steps: Step[]) => steps.forEach((s) => { for (const k of Object.keys(s)) exercised.add(k); if ("then" in s) walk(s.then); if ("else" in s && s.else) walk(s.else); });
  walk([...Object.values(kitchenSink.flows).flatMap((f) => f.do)]);
  const visit = (els: typeof kitchenSink.elements) => els.forEach((e) => {
    const map = (e.settings as { interactions?: Record<string, { do: Step[] }> } | undefined)?.interactions ?? {};
    Object.values(map).forEach((ix) => walk(ix.do));
    visit((e.elements as typeof els | undefined) ?? []);
  });
  visit(kitchenSink.elements);
  assert.deepEqual(VERBS.filter((v) => !exercised.has(v)), [], "fixture should use every verb");
  // `sonner` resolves from the repo's own node_modules, so this is a real check.
  assert.deepEqual(diagnose(code), []);
});

test("emits readable names, header comments and only the helpers it needs", () => {
  const code = toCode(kitchenSink);
  assert.match(code, /\/\*\* Element "Signup Form" \(el_form\), interaction ix_aaaaaaaa: on submit\. \*\//);
  assert.match(code, /async function onSignupFormSubmit\(/);
  assert.match(code, /async function onCountButtonClick\(/);
  assert.match(code, /export async function flowCelebrate\(/);
  assert.match(code, /bind\("el_form", "submit", onSignupFormSubmit, \{ preventDefault: true \}\)/);
  assert.match(code, /bind\("el_btn", "keydown", onCountButtonKeydown, \{ key: "Enter" \}\)/);
  assert.doesNotMatch(code, /never/, "disabled interactions are not generated");
  assert.match(code, /no variable named missing, skipped/);
  assert.match(code, /no flow named nowhere, skipped/);

  const small = toCode({
    elements: [{ id: "a", name: "A", settings: { interactions: { ix_aaaaaaaa: { on: "click", do: [{ wait: 5 }] } } } }],
    variables: {},
    flows: {},
  });
  assert.match(small, /const sleep/);
  for (const unused of ["callApi", "byId", "setVisible", "webUrl", "sonner", "getVars", "animateElement"]) {
    assert.doesNotMatch(small, new RegExp(unused), `${unused} should not be emitted`);
  }
  assert.deepEqual(diagnose(small), []);
});

test("an empty project still generates a valid module", () => {
  const code = toCode({ elements: [], variables: {}, flows: {} });
  assert.equal(hasInteractionCode({ elements: [], variables: {}, flows: {} }), false);
  assert.equal(hasInteractionCode(kitchenSink), true);
  assert.deepEqual(diagnose(code), []);
});

test("duplicate element names and events get distinct function names", () => {
  const ix = (n: string) => ({ settings: { interactions: { ix_aaaaaaaa: { on: "click", do: [{ toast: n }] } } } });
  const code = toCode({ elements: [{ id: "a", name: "Card", ...ix("1") }, { id: "b", name: "Card", ...ix("2") }], variables: {}, flows: { "a-b": { do: [] }, a_b: { do: [] } } });
  assert.match(code, /async function onCardClick\(/);
  assert.match(code, /async function onCardClick2\(/);
  assert.match(code, /export async function flowAB\(/);
  assert.match(code, /export async function flowAB2\(/);
  assert.deepEqual(diagnose(code), []);
});

test("templates keep a whole expression's type and quote everything else safely", () => {
  assert.equal(compileTemplate("plain"), '"plain"');
  assert.equal(compileTemplate("{{ vars.n }}"), 'read(read(scope, "vars"), "n")');
  assert.match(compileTemplate("a `b` ${c} {{ vars.n }} \\"), /^`a \\`b\\` \\\$\{c\} \$\{text\(/);
  assert.match(compileTemplate("{{ ( }}"), /^fail\(/);
});

// A tiny page: enough DOM for the generated module to bind, listen and act.
function runGenerated(code: string, project: { fetchBody?: unknown } = {}) {
  const js = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const toasts: string[] = [];
  const listeners: Record<string, Array<(e: unknown) => void>> = {};
  const nodes = new Map<string, { dataset: { elementId: string }; style: Record<string, string>; addEventListener(t: string, f: (e: unknown) => void): void; removeEventListener(): void; setAttribute(): void }>();
  const node = (id: string) => {
    const n = { dataset: { elementId: id }, style: {} as Record<string, string>, addEventListener: (t: string, f: (e: unknown) => void) => ((listeners[`${id}:${t}`] ??= []).push(f), undefined), removeEventListener() {}, setAttribute() {} };
    nodes.set(id, n);
    return n;
  };
  node("el_btn"); node("el_form");
  const store = new Map<string, string>();
  const sandbox = {
    exports: {} as Record<string, unknown>,
    require: (name: string) => {
      assert.equal(name, "sonner");
      return { toast: Object.fromEntries(["success", "error", "info", "warning"].map((k) => [k, (m: string) => toasts.push(`${k}:${m}`)])) };
    },
    document: { querySelectorAll: () => [...nodes.values()] },
    window: { sessionStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) }, localStorage: { getItem: () => null, setItem() {} }, location: { href: "https://x.test/" } },
    fetch: async () => ({ ok: true, status: 200, text: async () => JSON.stringify(project.fetchBody ?? { id: 1 }) }),
    HTMLFormElement: class {}, FormData: class {}, IntersectionObserver: class { observe() {} disconnect() {} },
    console, setTimeout, clearTimeout, AbortController, URL, Object, JSON, Promise, Number, String, Boolean, Set, Map, Proxy, Error,
    queueMicrotask,
  };
  runInNewContext(js, sandbox);
  const mod = sandbox.exports as { bindInteractions(): () => void; getVars(): Record<string, unknown> };
  mod.bindInteractions();
  const fire = async (id: string, type: string, event: Record<string, unknown> = {}) => {
    for (const f of listeners[`${id}:${type}`] ?? []) f({ target: { tagName: "DIV", closest: () => null }, type, preventDefault() {}, stopPropagation() {}, ...event });
    await new Promise((r) => setTimeout(r, 30));
  };
  return { mod, toasts, fire, store };
}

test("generated code behaves like the interpreter: set, call, if, run, toast", async () => {
  const input: CodegenInput = {
    elements: [{ id: "el_btn", name: "Btn", settings: { interactions: { ix_aaaaaaaa: { on: "click", do: [
      { id: "res", call: "api", method: "POST", url: "/api/x", body: "{{ vars }}" },
      { set: "count", to: "{{ vars.count + 1 }}" },
      { if: "{{ steps.res.ok && vars.count == 1 }}", then: [{ toast: "count is {{ vars.count }}", kind: "success" }, { run: "bump" }], else: [{ toast: "no" }] },
    ] }, ix_bbbbbbbb: { on: "keydown", key: "Enter", do: [{ toast: "enter" }] } } } }],
    variables: { count: { type: "number", default: 0 }, saved: { type: "string", default: "", lifetime: "session" } },
    flows: { bump: { do: [{ set: "count", to: "{{ vars.count + 10 }}" }, { set: "saved", to: "{{ steps.res.data.id }}" }] } },
    namespace: "t",
  };
  const { mod, toasts, fire, store } = runGenerated(toCode(input));
  await fire("el_btn", "click");
  assert.deepEqual(toasts, ["success:count is 1"]);
  assert.equal(mod.getVars().count, 11);
  assert.equal(mod.getVars().saved, 1);
  assert.equal(store.get("wb:t:saved"), "1", "session variables persist");

  await fire("el_btn", "keydown", { key: "a" });
  assert.equal(toasts.length, 1, "a different key does not run the interaction");
  await fire("el_btn", "keydown", { key: "enter" });
  assert.deepEqual(toasts.at(-1), "info:enter");
});

test("a failing step stops that interaction and is reported, not swallowed", async () => {
  const input: CodegenInput = {
    elements: [{ id: "el_btn", name: "Btn", settings: { interactions: { ix_aaaaaaaa: { on: "click", do: [
      { toast: "before" },
      { navigate: "javascript:alert(1)" },
      { toast: "after" },
    ] } } } }],
    variables: {},
    flows: {},
  };
  const errors: unknown[][] = [];
  const realError = console.error;
  console.error = (...a: unknown[]) => void errors.push(a);
  try {
    const { toasts, fire } = runGenerated(toCode(input));
    await fire("el_btn", "click");
    assert.deepEqual(toasts, ["info:before"]);
    assert.equal(errors.length, 1);
    assert.match(String(errors[0][1]), /HTTP or HTTPS/);
  } finally {
    console.error = realError;
  }
});

test("the component generator tags elements and hooks up the interactions module", async () => {
  const { codeGenerator } = await import("../src/features/editor/lib/code/generator");
  const button = {
    id: "el_btn", type: "Button", name: "Buy", content: "Buy", styles: {},
    settings: { interactions: { ix_aaaaaaaa: { on: "click", do: [{ toast: "hi" }] } }, label: "x" },
  };
  const elements = [button] as never;

  const jsx = await codeGenerator.generateToJSX(elements, { variables: {}, flows: {} });
  assert.match(jsx, /data-element-id="el_btn"/);
  assert.match(jsx, /import \{ bindInteractions \} from '\.\/interactions';/);
  assert.match(jsx, /React\.useEffect\(\(\) => bindInteractions\(\), \[\]\);/);
  assert.doesNotMatch(jsx, /interactions=/, "interactions are not passed to the DOM as an attribute");

  const module = codeGenerator.generateInteractions(elements, { variables: {}, flows: {} });
  assert.ok(module?.includes("export function bindInteractions"));

  // No interactions: output is what it was before, with no tags or hook.
  const plain = [{ id: "el_t", type: "Text", content: "Hello", styles: {}, settings: {} }] as never;
  const plainJsx = await codeGenerator.generateToJSX(plain);
  assert.doesNotMatch(plainJsx, /data-element-id|bindInteractions/);
  assert.equal(codeGenerator.generateInteractions(plain), null);

  // Tagging is scoped to one run.
  assert.doesNotMatch(await codeGenerator.generateToJSX(plain), /data-element-id/);
});
